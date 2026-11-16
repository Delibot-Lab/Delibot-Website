# Architecture

## Request flow

```text
Browser
  -> CBGPU public gateway
  -> Next.js web service
      -> pages and static assets
      -> /api/v1/* proxy -> Axum API
      -> /uploads/* proxy -> Axum file service
  -> PostgreSQL on the private Compose network
```

The API uses HTTP-only, same-site session cookies. PostgreSQL stores only SHA-256 hashes of random session tokens. Passwords use Argon2id with a unique random salt.

## Persistence

- `postgres_data` stores accounts, sessions, profiles, applications, channels, and messages.
- `uploads_data` stores member avatars and future message attachments.
- Blog posts remain version-controlled Markdown files in `content/blog/`.

## Service boundaries

Next.js owns presentation, scroll storytelling, server-rendered pages, and repository-backed blog publishing. Axum owns authentication, authorization, user data, application data, chat, and uploads. PostgreSQL and the Axum service are reachable only inside the Compose network.
