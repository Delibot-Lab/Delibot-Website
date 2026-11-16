mod auth;
mod error;
mod routes;

use axum::{Router, http::HeaderName};
use sqlx_postgres::{PgPool, PgPoolOptions};
use std::{env, path::PathBuf, sync::Arc, time::Duration};
use tower_http::{
    catch_panic::CatchPanicLayer,
    compression::CompressionLayer,
    request_id::{MakeRequestUuid, PropagateRequestIdLayer, SetRequestIdLayer},
    services::ServeDir,
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub upload_dir: PathBuf,
    pub app_url: String,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "delibot_api=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = env::var("DATABASE_URL")?;
    let db = PgPoolOptions::new()
        .max_connections(
            env::var("DATABASE_POOL_SIZE")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(10),
        )
        .acquire_timeout(Duration::from_secs(10))
        .connect(&database_url)
        .await?;
    sqlx::migrate::Migrator::new(std::path::Path::new("../db/migrations"))
        .await?
        .run(&db)
        .await?;

    let upload_dir =
        PathBuf::from(env::var("UPLOAD_DIR").unwrap_or_else(|_| "/data/uploads".into()));
    tokio::fs::create_dir_all(&upload_dir).await?;
    let state = Arc::new(AppState {
        db,
        upload_dir: upload_dir.clone(),
        app_url: env::var("APP_URL").unwrap_or_else(|_| "http://localhost:3000".into()),
    });
    let request_id = HeaderName::from_static("x-request-id");
    let app = Router::new()
        .nest("/api/v1", routes::router())
        .nest_service("/uploads", ServeDir::new(upload_dir))
        .with_state(state)
        .layer(PropagateRequestIdLayer::new(request_id.clone()))
        .layer(SetRequestIdLayer::new(request_id, MakeRequestUuid))
        .layer(CompressionLayer::new())
        .layer(CatchPanicLayer::new())
        .layer(TraceLayer::new_for_http());

    let address = env::var("API_BIND").unwrap_or_else(|_| "0.0.0.0:8080".into());
    let listener = tokio::net::TcpListener::bind(&address).await?;
    tracing::info!(%address, "Delibot API listening");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async { tokio::signal::ctrl_c().await.expect("Ctrl+C handler") };
    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("SIGTERM handler")
            .recv()
            .await;
    };
    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();
    tokio::select! { _ = ctrl_c => {}, _ = terminate => {} }
}
