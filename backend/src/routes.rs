use crate::{
    AppState,
    auth::{self, Admin, User},
    error::ApiError,
};
use axum::{
    Json, Router,
    extract::{Multipart, Path, Query, State},
    http::StatusCode,
    response::{IntoResponse, Redirect},
    routing::{delete, get, patch, post},
};
use axum_extra::extract::cookie::CookieJar;
use lettre::{
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
    transport::smtp::authentication::Credentials,
};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use sqlx::{
    from_row::FromRow, query::query, query_as::query_as, query_scalar::query_scalar, row::Row,
};
use sqlx_postgres::{PgRow, Postgres};
use std::{env, sync::Arc};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

macro_rules! impl_pg_row {
    ($name:ty, $($field:ident),+ $(,)?) => {
        impl<'r> FromRow<'r, PgRow> for $name {
            fn from_row(row: &'r PgRow) -> Result<Self, sqlx::Error> {
                Ok(Self { $($field: row.try_get(stringify!($field))?,)+ })
            }
        }
    };
}

pub fn router() -> Router<Arc<AppState>> {
    Router::new()
        .route("/health", get(health))
        .route("/auth/signup", post(signup))
        .route("/auth/login", post(login))
        .route("/auth/logout", post(logout))
        .route("/auth/me", get(me))
        .route("/auth/confirm", get(confirm_email))
        .route("/auth/forgot-password", post(forgot_password))
        .route("/auth/reset-password", post(reset_password))
        .route(
            "/profile",
            get(get_profile).put(update_profile).delete(delete_account),
        )
        .route("/profile/avatar", post(upload_avatar))
        .route("/team", get(list_team))
        .route("/team/{slug}", get(team_member))
        .route("/applications", post(submit_application))
        .route("/admin/members", get(admin_members))
        .route("/admin/members/{id}/admin", patch(set_admin))
        .route("/admin/members/{id}", delete(admin_delete_member))
        .route("/chat/channels", get(channels))
        .route("/chat/members", get(chat_members))
        .route(
            "/chat/channels/{slug}/messages",
            get(messages).post(create_message),
        )
        .route(
            "/chat/messages/{id}",
            patch(edit_message).delete(delete_message),
        )
}

async fn health() -> impl IntoResponse {
    Json(json!({ "ok": true, "service": "delibot-api" }))
}

#[derive(Deserialize)]
struct SignupInput {
    email: String,
    password: String,
    name: String,
    birthday: String,
}

async fn signup(
    State(state): State<Arc<AppState>>,
    Json(input): Json<SignupInput>,
) -> Result<impl IntoResponse, ApiError> {
    let email = input.email.trim().to_lowercase();
    if !email.ends_with("@cbs-h.cbe.go.kr")
        || input.password.len() < 8
        || input.name.trim().is_empty()
    {
        return Err(ApiError::bad_request(
            "Please check the submitted information.",
        ));
    }
    if query_scalar::<Postgres, i32>("SELECT 1 FROM users WHERE email=$1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?
        .is_some()
    {
        return Err(ApiError::conflict("This email is already registered."));
    }
    let birthday = time::Date::parse(
        &input.birthday,
        &time::format_description::well_known::Iso8601::DATE,
    )
    .map_err(|_| ApiError::bad_request("Invalid birthday."))?;
    let password_hash = tokio::task::spawn_blocking(move || auth::hash_password(input.password))
        .await
        .map_err(anyhow::Error::from)??;
    let bootstrap_admin = env::var("BOOTSTRAP_ADMIN_EMAIL")
        .is_ok_and(|configured| configured.trim().eq_ignore_ascii_case(&email));
    let user_id = query_scalar::<Postgres, Uuid>(
        "INSERT INTO users(email,password_hash,name,birthday,is_admin) VALUES($1,$2,$3,$4,$5) RETURNING id",
    )
    .bind(&email)
    .bind(password_hash)
    .bind(input.name.trim())
    .bind(birthday)
    .bind(bootstrap_admin)
    .fetch_one(&state.db)
    .await?;
    let raw = auth::token();
    query::<Postgres>("INSERT INTO auth_tokens(user_id,purpose,token_hash,expires_at) VALUES($1,'verify_email',$2,$3)")
        .bind(user_id).bind(auth::token_hash(&raw)).bind(OffsetDateTime::now_utc()+Duration::hours(24)).execute(&state.db).await?;
    let href = format!("{}/api/v1/auth/confirm?token={}", state.app_url, raw);
    send_link(
        &email,
        "Verify your Delibot account",
        "Verify your email",
        &href,
    )
    .await;
    Ok((StatusCode::CREATED, Json(json!({ "ok": true }))))
}

#[derive(Deserialize)]
struct LoginInput {
    email: String,
    password: String,
}

async fn login(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
    Json(input): Json<LoginInput>,
) -> Result<impl IntoResponse, ApiError> {
    struct LoginRow {
        id: Uuid,
        password_hash: String,
        email_verified_at: Option<OffsetDateTime>,
    }
    impl_pg_row!(LoginRow, id, password_hash, email_verified_at);
    let row = query_as::<Postgres, LoginRow>(
        "SELECT id,password_hash,email_verified_at FROM users WHERE email=$1",
    )
    .bind(input.email.trim().to_lowercase())
    .fetch_optional(&state.db)
    .await?;
    let Some(row) = row else {
        return Err(ApiError::unauthorized());
    };
    let valid = tokio::task::spawn_blocking(move || {
        auth::verify_password(row.password_hash, input.password)
    })
    .await
    .unwrap_or(false);
    if !valid {
        return Err(ApiError::unauthorized());
    }
    if row.email_verified_at.is_none() {
        return Err(ApiError::forbidden());
    }
    let session = auth::create_session(&state, row.id).await?;
    Ok((
        jar.add(auth::session_cookie(session)),
        Json(json!({ "ok": true })),
    ))
}

async fn logout(
    State(state): State<Arc<AppState>>,
    jar: CookieJar,
) -> Result<impl IntoResponse, ApiError> {
    if let Some(cookie) = jar.get(auth::SESSION_COOKIE) {
        query::<Postgres>("DELETE FROM sessions WHERE token_hash=$1")
            .bind(auth::token_hash(cookie.value()))
            .execute(&state.db)
            .await?;
    }
    Ok((
        jar.add(auth::expired_session_cookie()),
        Json(json!({ "ok": true })),
    ))
}

async fn me(user: User) -> impl IntoResponse {
    Json(json!({ "user": user }))
}

#[derive(Deserialize)]
struct TokenQuery {
    token: String,
}

async fn confirm_email(
    State(state): State<Arc<AppState>>,
    Query(params): Query<TokenQuery>,
    jar: CookieJar,
) -> Result<impl IntoResponse, ApiError> {
    struct TokenRow {
        id: Uuid,
        user_id: Uuid,
    }
    impl_pg_row!(TokenRow, id, user_id);
    let row = query_as::<Postgres, TokenRow>("SELECT id,user_id FROM auth_tokens WHERE token_hash=$1 AND purpose='verify_email' AND used_at IS NULL AND expires_at>now()")
        .bind(auth::token_hash(&params.token)).fetch_optional(&state.db).await?.ok_or_else(ApiError::not_found)?;
    let mut tx = state.db.begin().await?;
    query::<Postgres>(
        "UPDATE users SET email_verified_at=COALESCE(email_verified_at,now()) WHERE id=$1",
    )
    .bind(row.user_id)
    .execute(&mut *tx)
    .await?;
    query::<Postgres>("UPDATE auth_tokens SET used_at=now() WHERE id=$1")
        .bind(row.id)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    let session = auth::create_session(&state, row.user_id).await?;
    Ok((
        jar.add(auth::session_cookie(session)),
        Redirect::to("/join"),
    ))
}

#[derive(Deserialize)]
struct EmailInput {
    email: String,
}

async fn forgot_password(
    State(state): State<Arc<AppState>>,
    Json(input): Json<EmailInput>,
) -> Result<impl IntoResponse, ApiError> {
    let email = input.email.trim().to_lowercase();
    if let Some(id) = query_scalar::<Postgres, Uuid>("SELECT id FROM users WHERE email=$1")
        .bind(&email)
        .fetch_optional(&state.db)
        .await?
    {
        let raw = auth::token();
        query::<Postgres>("INSERT INTO auth_tokens(user_id,purpose,token_hash,expires_at) VALUES($1,'reset_password',$2,$3)")
            .bind(id).bind(auth::token_hash(&raw)).bind(OffsetDateTime::now_utc()+Duration::hours(1)).execute(&state.db).await?;
        let href = format!("{}/reset-password?token={}", state.app_url, raw);
        send_link(
            &email,
            "Reset your Delibot password",
            "Reset your password",
            &href,
        )
        .await;
    }
    Ok(Json(json!({ "ok": true })))
}

#[derive(Deserialize)]
struct ResetInput {
    token: String,
    password: String,
}

async fn reset_password(
    State(state): State<Arc<AppState>>,
    Json(input): Json<ResetInput>,
) -> Result<impl IntoResponse, ApiError> {
    if input.password.len() < 8 {
        return Err(ApiError::bad_request(
            "Password must contain at least eight characters.",
        ));
    }
    struct TokenRow {
        id: Uuid,
        user_id: Uuid,
    }
    impl_pg_row!(TokenRow, id, user_id);
    let row = query_as::<Postgres, TokenRow>("SELECT id,user_id FROM auth_tokens WHERE token_hash=$1 AND purpose='reset_password' AND used_at IS NULL AND expires_at>now()")
        .bind(auth::token_hash(&input.token)).fetch_optional(&state.db).await?.ok_or_else(ApiError::not_found)?;
    let hash = tokio::task::spawn_blocking(move || auth::hash_password(input.password))
        .await
        .map_err(anyhow::Error::from)??;
    let mut tx = state.db.begin().await?;
    query::<Postgres>("UPDATE users SET password_hash=$1,updated_at=now() WHERE id=$2")
        .bind(hash)
        .bind(row.user_id)
        .execute(&mut *tx)
        .await?;
    query::<Postgres>("UPDATE auth_tokens SET used_at=now() WHERE id=$1")
        .bind(row.id)
        .execute(&mut *tx)
        .await?;
    query::<Postgres>("DELETE FROM sessions WHERE user_id=$1")
        .bind(row.user_id)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(Json(json!({ "ok": true })))
}

#[derive(Serialize)]
struct Profile {
    id: Uuid,
    email: String,
    name: String,
    birthday: time::Date,
    avatar_url: Option<String>,
    slug: Option<String>,
    display_name: Option<String>,
    role_ko: Option<String>,
    role_en: Option<String>,
    teams: Option<Vec<String>>,
    bio_ko: Option<String>,
    bio_en: Option<String>,
    skills: Option<Vec<String>>,
    contact_email: Option<String>,
    orcid: Option<String>,
    linkedin_url: Option<String>,
    github_url: Option<String>,
    website_url: Option<String>,
    is_public: Option<bool>,
}
impl_pg_row!(
    Profile,
    id,
    email,
    name,
    birthday,
    avatar_url,
    slug,
    display_name,
    role_ko,
    role_en,
    teams,
    bio_ko,
    bio_en,
    skills,
    contact_email,
    orcid,
    linkedin_url,
    github_url,
    website_url,
    is_public
);

async fn get_profile(
    State(state): State<Arc<AppState>>,
    user: User,
) -> Result<Json<Profile>, ApiError> {
    let profile = query_as::<Postgres, Profile>(r#"SELECT u.id,u.email,u.name,u.birthday,u.avatar_url,
        t.slug,t.display_name,t.role_ko,t.role_en,t.teams,t.bio_ko,t.bio_en,t.skills,t.contact_email,t.orcid,
        t.linkedin_url,t.github_url,t.website_url,t.is_public FROM users u LEFT JOIN team_profiles t ON t.user_id=u.id WHERE u.id=$1"#)
        .bind(user.id).fetch_one(&state.db).await?;
    Ok(Json(profile))
}

#[derive(Deserialize)]
struct ProfileInput {
    slug: String,
    display_name: String,
    #[serde(default)]
    role_ko: String,
    #[serde(default)]
    role_en: String,
    #[serde(default)]
    teams: Vec<String>,
    #[serde(default)]
    bio_ko: String,
    #[serde(default)]
    bio_en: String,
    #[serde(default)]
    skills: Vec<String>,
    contact_email: Option<String>,
    orcid: Option<String>,
    linkedin_url: Option<String>,
    github_url: Option<String>,
    website_url: Option<String>,
    #[serde(default)]
    is_public: bool,
}

async fn update_profile(
    State(state): State<Arc<AppState>>,
    user: User,
    Json(input): Json<ProfileInput>,
) -> Result<impl IntoResponse, ApiError> {
    if input.slug.len() < 3
        || !input
            .slug
            .chars()
            .all(|c| c.is_ascii_lowercase() || c.is_ascii_digit() || c == '-')
    {
        return Err(ApiError::bad_request("Invalid profile slug."));
    }
    let result = query::<Postgres>(r#"INSERT INTO team_profiles(user_id,slug,display_name,role_ko,role_en,teams,bio_ko,bio_en,skills,avatar_url,contact_email,orcid,linkedin_url,github_url,website_url,is_public)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,(SELECT avatar_url FROM users WHERE id=$1),$10,$11,$12,$13,$14,$15)
      ON CONFLICT(user_id) DO UPDATE SET slug=EXCLUDED.slug,display_name=EXCLUDED.display_name,role_ko=EXCLUDED.role_ko,role_en=EXCLUDED.role_en,teams=EXCLUDED.teams,bio_ko=EXCLUDED.bio_ko,bio_en=EXCLUDED.bio_en,skills=EXCLUDED.skills,contact_email=EXCLUDED.contact_email,orcid=EXCLUDED.orcid,linkedin_url=EXCLUDED.linkedin_url,github_url=EXCLUDED.github_url,website_url=EXCLUDED.website_url,is_public=EXCLUDED.is_public,updated_at=now()"#)
        .bind(user.id).bind(input.slug).bind(input.display_name).bind(input.role_ko).bind(input.role_en)
        .bind(input.teams).bind(input.bio_ko).bind(input.bio_en).bind(input.skills).bind(input.contact_email)
        .bind(input.orcid).bind(input.linkedin_url).bind(input.github_url).bind(input.website_url).bind(input.is_public)
        .execute(&state.db).await;
    match result {
        Ok(_) => Ok(Json(json!({ "ok": true }))),
        Err(sqlx::Error::Database(e)) if e.is_unique_violation() => Err(ApiError::conflict(
            "This profile address is already in use.",
        )),
        Err(e) => Err(e.into()),
    }
}

async fn delete_account(
    State(state): State<Arc<AppState>>,
    user: User,
    jar: CookieJar,
) -> Result<impl IntoResponse, ApiError> {
    query::<Postgres>("DELETE FROM users WHERE id=$1")
        .bind(user.id)
        .execute(&state.db)
        .await?;
    Ok((
        jar.add(auth::expired_session_cookie()),
        Json(json!({ "ok": true })),
    ))
}

async fn upload_avatar(
    State(state): State<Arc<AppState>>,
    user: User,
    mut multipart: Multipart,
) -> Result<Json<Value>, ApiError> {
    let field = multipart
        .next_field()
        .await
        .map_err(|_| ApiError::bad_request("Invalid upload."))?
        .ok_or_else(|| ApiError::bad_request("Missing file."))?;
    let content_type = field.content_type().unwrap_or("").to_owned();
    if !matches!(
        content_type.as_str(),
        "image/jpeg" | "image/png" | "image/webp"
    ) {
        return Err(ApiError::bad_request(
            "Only JPEG, PNG, and WebP images are accepted.",
        ));
    }
    let extension = match content_type.as_str() {
        "image/png" => "png",
        "image/webp" => "webp",
        _ => "jpg",
    };
    let data = field
        .bytes()
        .await
        .map_err(|_| ApiError::bad_request("Invalid upload."))?;
    if data.len() > 5 * 1024 * 1024 {
        return Err(ApiError::bad_request(
            "The image must be smaller than 5 MB.",
        ));
    }
    let relative = format!("avatars/{}.{}", user.id, extension);
    let path = state.upload_dir.join(&relative);
    tokio::fs::create_dir_all(path.parent().unwrap())
        .await
        .map_err(anyhow::Error::from)?;
    tokio::fs::write(&path, &data)
        .await
        .map_err(anyhow::Error::from)?;
    let url = format!("/uploads/{relative}");
    query::<Postgres>("UPDATE users SET avatar_url=$1,updated_at=now() WHERE id=$2")
        .bind(&url)
        .bind(user.id)
        .execute(&state.db)
        .await?;
    query::<Postgres>("UPDATE team_profiles SET avatar_url=$1,updated_at=now() WHERE user_id=$2")
        .bind(&url)
        .bind(user.id)
        .execute(&state.db)
        .await?;
    Ok(Json(json!({ "url": url })))
}

#[derive(Serialize)]
struct TeamProfile {
    user_id: Uuid,
    slug: String,
    display_name: String,
    role_ko: String,
    role_en: String,
    teams: Vec<String>,
    bio_ko: String,
    bio_en: String,
    skills: Vec<String>,
    avatar_url: Option<String>,
    contact_email: Option<String>,
    orcid: Option<String>,
    linkedin_url: Option<String>,
    github_url: Option<String>,
    website_url: Option<String>,
    is_public: bool,
    sort_order: i32,
}
impl_pg_row!(
    TeamProfile,
    user_id,
    slug,
    display_name,
    role_ko,
    role_en,
    teams,
    bio_ko,
    bio_en,
    skills,
    avatar_url,
    contact_email,
    orcid,
    linkedin_url,
    github_url,
    website_url,
    is_public,
    sort_order
);

async fn list_team(State(state): State<Arc<AppState>>) -> Result<Json<Vec<TeamProfile>>, ApiError> {
    Ok(Json(query_as::<Postgres, TeamProfile>(
        "SELECT user_id,slug,display_name,role_ko,role_en,teams,bio_ko,bio_en,skills,avatar_url,contact_email,orcid,linkedin_url,github_url,website_url,is_public,sort_order
         FROM team_profiles WHERE is_public=true ORDER BY sort_order,display_name",
    )
        .fetch_all(&state.db)
        .await?))
}
async fn team_member(
    State(state): State<Arc<AppState>>,
    Path(slug): Path<String>,
) -> Result<Json<TeamProfile>, ApiError> {
    Ok(Json(query_as::<Postgres, TeamProfile>(
        "SELECT user_id,slug,display_name,role_ko,role_en,teams,bio_ko,bio_en,skills,avatar_url,contact_email,orcid,linkedin_url,github_url,website_url,is_public,sort_order
         FROM team_profiles WHERE slug=$1 AND is_public=true",
    )
        .bind(slug)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(ApiError::not_found)?))
}

#[derive(Deserialize)]
struct ApplicationInput {
    name: String,
    phone: String,
    #[serde(rename = "githubId")]
    github_id: String,
    teams: Vec<String>,
    motivation: String,
    #[serde(rename = "slackJoined")]
    slack_joined: bool,
}
async fn submit_application(
    State(state): State<Arc<AppState>>,
    user: User,
    Json(input): Json<ApplicationInput>,
) -> Result<impl IntoResponse, ApiError> {
    if input.name.trim().is_empty()
        || input.phone.trim().is_empty()
        || input.github_id.trim().is_empty()
        || input.teams.is_empty()
        || input.motivation.trim().is_empty()
        || !input.slack_joined
    {
        return Err(ApiError::bad_request("Please complete every field."));
    }
    let result=query::<Postgres>("INSERT INTO applications(user_id,name,phone,github_id,teams,motivation,slack_joined) VALUES($1,$2,$3,$4,$5,$6,$7)")
        .bind(user.id).bind(&input.name).bind(&input.phone).bind(&input.github_id).bind(&input.teams).bind(&input.motivation).bind(input.slack_joined).execute(&state.db).await;
    match result {
        Ok(_) => {
            if let Ok(recipient) = env::var("RECRUIT_EMAIL_TO")
                && !recipient.trim().is_empty()
            {
                let subject = format!(
                    "[Delibot application] {} ({})",
                    input.name,
                    input.teams.join(", ")
                );
                let body = format!(
                    "Name: {}\nEmail: {}\nPhone: {}\nGitHub: {}\nTeams: {}\nSlack joined: {}\n\nMotivation:\n{}",
                    input.name,
                    user.email,
                    input.phone,
                    input.github_id,
                    input.teams.join(", "),
                    input.slack_joined,
                    input.motivation
                );
                send_mail(&recipient, &subject, body).await;
            }
            Ok((StatusCode::CREATED, Json(json!({"ok":true}))))
        }
        Err(sqlx::Error::Database(e)) if e.is_unique_violation() => Err(ApiError::conflict(
            "An application has already been submitted.",
        )),
        Err(e) => Err(e.into()),
    }
}

#[derive(Serialize)]
struct AdminMember {
    id: Uuid,
    email: String,
    name: String,
    birthday: time::Date,
    avatar_url: Option<String>,
    is_admin: bool,
    created_at: OffsetDateTime,
    applied: bool,
    applied_at: Option<OffsetDateTime>,
    teams: Option<Vec<String>>,
    phone: Option<String>,
    github_id: Option<String>,
    motivation: Option<String>,
}
impl_pg_row!(
    AdminMember,
    id,
    email,
    name,
    birthday,
    avatar_url,
    is_admin,
    created_at,
    applied,
    applied_at,
    teams,
    phone,
    github_id,
    motivation
);
async fn admin_members(
    State(state): State<Arc<AppState>>,
    Admin(_): Admin,
) -> Result<Json<Vec<AdminMember>>, ApiError> {
    Ok(Json(query_as::<Postgres,AdminMember>("SELECT u.id,u.email,u.name,u.birthday,u.avatar_url,u.is_admin,u.created_at,(a.id IS NOT NULL) applied,a.created_at applied_at,a.teams,a.phone,a.github_id,a.motivation FROM users u LEFT JOIN applications a ON a.user_id=u.id ORDER BY u.created_at DESC").fetch_all(&state.db).await?))
}
#[derive(Deserialize)]
struct AdminInput {
    is_admin: bool,
}
async fn set_admin(
    State(state): State<Arc<AppState>>,
    Admin(admin): Admin,
    Path(id): Path<Uuid>,
    Json(input): Json<AdminInput>,
) -> Result<Json<Value>, ApiError> {
    if admin.id == id && !input.is_admin {
        return Err(ApiError::bad_request(
            "You cannot remove your own administrator access.",
        ));
    }
    query::<Postgres>("UPDATE users SET is_admin=$1 WHERE id=$2")
        .bind(input.is_admin)
        .bind(id)
        .execute(&state.db)
        .await?;
    Ok(Json(json!({"ok":true})))
}
async fn admin_delete_member(
    State(state): State<Arc<AppState>>,
    Admin(admin): Admin,
    Path(id): Path<Uuid>,
) -> Result<Json<Value>, ApiError> {
    if admin.id == id {
        return Err(ApiError::bad_request(
            "You cannot delete your own account here.",
        ));
    }
    query::<Postgres>("DELETE FROM users WHERE id=$1")
        .bind(id)
        .execute(&state.db)
        .await?;
    Ok(Json(json!({"ok":true})))
}

#[derive(Serialize)]
struct Channel {
    id: Uuid,
    slug: String,
    name: String,
    description: Option<String>,
    kind: String,
    team: Option<String>,
}
impl_pg_row!(Channel, id, slug, name, description, kind, team);
async fn channels(
    State(state): State<Arc<AppState>>,
    user: User,
) -> Result<Json<Vec<Channel>>, ApiError> {
    Ok(Json(
        query_as::<Postgres, Channel>(
            "SELECT c.id,c.slug,c.name,c.description,c.kind,c.team FROM channels c
             LEFT JOIN applications a ON a.user_id=$1
             WHERE $2 OR (a.id IS NOT NULL AND (c.kind='topic' OR c.team=ANY(a.teams)))
             ORDER BY c.name",
        )
        .bind(user.id)
        .bind(user.is_admin)
        .fetch_all(&state.db)
        .await?,
    ))
}
#[derive(Serialize)]
struct ChannelMember {
    id: Uuid,
    name: String,
    avatar_url: Option<String>,
}
impl_pg_row!(ChannelMember, id, name, avatar_url);
async fn chat_members(
    State(state): State<Arc<AppState>>,
    user: User,
) -> Result<Json<Vec<ChannelMember>>, ApiError> {
    let allowed = user.is_admin
        || query_scalar::<Postgres, bool>(
            "SELECT EXISTS(SELECT 1 FROM applications WHERE user_id=$1)",
        )
        .bind(user.id)
        .fetch_one(&state.db)
        .await?;
    if !allowed {
        return Err(ApiError::forbidden());
    }
    Ok(Json(
        query_as::<Postgres, ChannelMember>("SELECT id,name,avatar_url FROM users ORDER BY name")
            .fetch_all(&state.db)
            .await?,
    ))
}
#[derive(Serialize)]
struct ChatMessage {
    id: Uuid,
    channel_id: Uuid,
    user_id: Uuid,
    parent_id: Option<Uuid>,
    content: String,
    created_at: OffsetDateTime,
    edited_at: Option<OffsetDateTime>,
}
impl_pg_row!(
    ChatMessage,
    id,
    channel_id,
    user_id,
    parent_id,
    content,
    created_at,
    edited_at
);
#[derive(Deserialize)]
struct MessageQuery {
    before: Option<OffsetDateTime>,
    limit: Option<i64>,
}
async fn messages(
    State(state): State<Arc<AppState>>,
    user: User,
    Path(slug): Path<String>,
    Query(q): Query<MessageQuery>,
) -> Result<Json<Vec<ChatMessage>>, ApiError> {
    let limit = q.limit.unwrap_or(50).clamp(1, 100);
    Ok(Json(
        query_as::<Postgres, ChatMessage>(
            "SELECT m.id,m.channel_id,m.user_id,m.parent_id,m.content,m.created_at,m.edited_at
      FROM messages m JOIN channels c ON c.id=m.channel_id LEFT JOIN applications a ON a.user_id=$4
      WHERE c.slug=$1 AND ($2::timestamptz IS NULL OR m.created_at<$2)
        AND ($5 OR (a.id IS NOT NULL AND (c.kind='topic' OR c.team=ANY(a.teams))))
      ORDER BY m.created_at DESC LIMIT $3",
        )
        .bind(slug)
        .bind(q.before)
        .bind(limit)
        .bind(user.id)
        .bind(user.is_admin)
        .fetch_all(&state.db)
        .await?,
    ))
}
#[derive(Deserialize)]
struct MessageInput {
    content: String,
    parent_id: Option<Uuid>,
}
async fn create_message(
    State(state): State<Arc<AppState>>,
    user: User,
    Path(slug): Path<String>,
    Json(input): Json<MessageInput>,
) -> Result<(StatusCode, Json<ChatMessage>), ApiError> {
    let content = input.content.trim();
    if content.is_empty() || content.len() > 5000 {
        return Err(ApiError::bad_request("Message length is invalid."));
    }
    let channel = query_scalar::<Postgres, Uuid>("SELECT c.id FROM channels c LEFT JOIN applications a ON a.user_id=$2 WHERE c.slug=$1 AND ($3 OR (a.id IS NOT NULL AND (c.kind='topic' OR c.team=ANY(a.teams))))")
        .bind(slug)
        .bind(user.id)
        .bind(user.is_admin)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(ApiError::not_found)?;
    let row=query_as::<Postgres,ChatMessage>("INSERT INTO messages(channel_id,user_id,parent_id,content) VALUES($1,$2,$3,$4) RETURNING id,channel_id,user_id,parent_id,content,created_at,edited_at").bind(channel).bind(user.id).bind(input.parent_id).bind(content).fetch_one(&state.db).await?;
    Ok((StatusCode::CREATED, Json(row)))
}
async fn edit_message(
    State(state): State<Arc<AppState>>,
    user: User,
    Path(id): Path<Uuid>,
    Json(input): Json<MessageInput>,
) -> Result<Json<ChatMessage>, ApiError> {
    let content = input.content.trim();
    if content.is_empty() || content.len() > 5000 {
        return Err(ApiError::bad_request("Message length is invalid."));
    }
    let row=query_as::<Postgres,ChatMessage>("UPDATE messages SET content=$1,edited_at=now() WHERE id=$2 AND (user_id=$3 OR $4) RETURNING id,channel_id,user_id,parent_id,content,created_at,edited_at")
        .bind(content).bind(id).bind(user.id).bind(user.is_admin).fetch_optional(&state.db).await?.ok_or_else(ApiError::not_found)?;
    Ok(Json(row))
}
async fn delete_message(
    State(state): State<Arc<AppState>>,
    user: User,
    Path(id): Path<Uuid>,
) -> Result<Json<Value>, ApiError> {
    let result = query::<Postgres>("DELETE FROM messages WHERE id=$1 AND (user_id=$2 OR $3)")
        .bind(id)
        .bind(user.id)
        .bind(user.is_admin)
        .execute(&state.db)
        .await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::not_found());
    }
    Ok(Json(json!({"ok":true})))
}

async fn send_link(to: &str, subject: &str, heading: &str, href: &str) {
    send_mail(to, subject, format!("{heading}\n\n{href}")).await;
}

async fn send_mail(to: &str, subject: &str, body: String) {
    let (Ok(user), Ok(password)) = (env::var("GMAIL_USER"), env::var("GMAIL_APP_PASSWORD")) else {
        tracing::warn!("Mail credentials are not configured; account email was not sent");
        return;
    };
    if user.trim().is_empty() || password.is_empty() {
        tracing::warn!("Mail credentials are not configured; account email was not sent");
        return;
    }
    let (Ok(from), Ok(recipient)) = (format!("Delibot <{user}>").parse(), to.parse()) else {
        tracing::error!("Mail sender or recipient address is invalid");
        return;
    };
    let Ok(message) = Message::builder()
        .from(from)
        .to(recipient)
        .subject(subject)
        .body(body)
    else {
        return;
    };
    let Ok(builder) = AsyncSmtpTransport::<Tokio1Executor>::relay("smtp.gmail.com") else {
        return;
    };
    if let Err(error) = builder
        .credentials(Credentials::new(user, password))
        .build()
        .send(message)
        .await
    {
        tracing::error!(?error, "email delivery failed");
    }
}
