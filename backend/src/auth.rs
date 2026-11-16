use crate::{AppState, error::ApiError};
use argon2::{
    Argon2, PasswordHash, PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use axum::{extract::FromRequestParts, http::request::Parts};
use axum_extra::extract::cookie::{Cookie, SameSite};
use base64::{Engine, engine::general_purpose::URL_SAFE_NO_PAD};
use rand::RngCore;
use serde::Serialize;
use sha2::{Digest, Sha256};
use sqlx::{from_row::FromRow, query::query, query_as::query_as, row::Row};
use sqlx_postgres::{PgRow, Postgres};
use std::{env, sync::Arc};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

pub const SESSION_COOKIE: &str = "delibot_session";

#[derive(Clone, Debug, Serialize)]
pub struct User {
    pub id: Uuid,
    pub email: String,
    pub name: String,
    #[serde(rename = "isAdmin")]
    pub is_admin: bool,
}

impl<'r> FromRow<'r, PgRow> for User {
    fn from_row(row: &'r PgRow) -> Result<Self, sqlx::Error> {
        Ok(Self {
            id: row.try_get("id")?,
            email: row.try_get("email")?,
            name: row.try_get("name")?,
            is_admin: row.try_get("is_admin")?,
        })
    }
}

pub fn hash_password(password: String) -> anyhow::Result<String> {
    let salt = SaltString::generate(&mut OsRng);
    Ok(Argon2::default()
        .hash_password(password.as_bytes(), &salt)?
        .to_string())
}

pub fn verify_password(hash: String, password: String) -> bool {
    PasswordHash::new(&hash).ok().is_some_and(|parsed| {
        Argon2::default()
            .verify_password(password.as_bytes(), &parsed)
            .is_ok()
    })
}

pub fn token() -> String {
    let mut bytes = [0_u8; 32];
    rand::rng().fill_bytes(&mut bytes);
    URL_SAFE_NO_PAD.encode(bytes)
}

pub fn token_hash(token: &str) -> String {
    format!("{:x}", Sha256::digest(token.as_bytes()))
}

pub fn session_cookie(value: String) -> Cookie<'static> {
    let secure = env::var("COOKIE_SECURE")
        .map(|value| value != "false")
        .unwrap_or(!cfg!(debug_assertions));
    Cookie::build((SESSION_COOKIE, value))
        .path("/")
        .http_only(true)
        .secure(secure)
        .same_site(SameSite::Lax)
        .max_age(Duration::days(30))
        .build()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn password_hashes_are_salted_and_verifiable() {
        let first = hash_password("correct horse battery staple".into()).unwrap();
        let second = hash_password("correct horse battery staple".into()).unwrap();
        assert_ne!(first, second);
        assert!(verify_password(
            first,
            "correct horse battery staple".into()
        ));
        assert!(!verify_password(second, "wrong password".into()));
    }

    #[test]
    fn opaque_tokens_are_random_and_hash_stable() {
        let first = token();
        let second = token();
        assert_ne!(first, second);
        assert_eq!(token_hash(&first), token_hash(&first));
        assert_ne!(token_hash(&first), token_hash(&second));
    }
}

pub fn expired_session_cookie() -> Cookie<'static> {
    Cookie::build((SESSION_COOKIE, ""))
        .path("/")
        .http_only(true)
        .max_age(Duration::ZERO)
        .build()
}

pub async fn create_session(state: &AppState, user_id: Uuid) -> Result<String, ApiError> {
    let value = token();
    query::<Postgres>("INSERT INTO sessions(user_id, token_hash, expires_at) VALUES ($1, $2, $3)")
        .bind(user_id)
        .bind(token_hash(&value))
        .bind(OffsetDateTime::now_utc() + Duration::days(30))
        .execute(&state.db)
        .await?;
    Ok(value)
}

impl FromRequestParts<Arc<AppState>> for User {
    type Rejection = ApiError;
    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        let cookie = parts
            .headers
            .get(axum::http::header::COOKIE)
            .and_then(|v| v.to_str().ok())
            .and_then(|v| {
                v.split(';')
                    .filter_map(|part| Cookie::parse(part.trim().to_owned()).ok())
                    .find(|c| c.name() == SESSION_COOKIE)
                    .map(|c| c.value().to_owned())
            })
            .ok_or_else(ApiError::unauthorized)?;
        query_as::<Postgres, User>("SELECT u.id, u.email, u.name, u.is_admin FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()")
            .bind(token_hash(&cookie)).fetch_optional(&state.db).await?.ok_or_else(ApiError::unauthorized)
    }
}

pub struct Admin(pub User);
impl FromRequestParts<Arc<AppState>> for Admin {
    type Rejection = ApiError;
    async fn from_request_parts(
        parts: &mut Parts,
        state: &Arc<AppState>,
    ) -> Result<Self, Self::Rejection> {
        let user = User::from_request_parts(parts, state).await?;
        if !user.is_admin {
            return Err(ApiError::forbidden());
        }
        Ok(Self(user))
    }
}
