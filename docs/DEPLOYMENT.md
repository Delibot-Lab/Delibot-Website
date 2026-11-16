# CBGPU Deployment

The production stack runs as one CBGPU Compose project:

- `web`: one application container running the Next.js standalone server on port 3000 and Rust/Axum on port 8080
- `db`: PostgreSQL 17 on the private Compose network

CBGPU routes public traffic to `web`. Next.js forwards `/api/v1/*` and `/uploads/*` to the colocated Axum process, so browsers use one origin and port 8080 is not exposed publicly.

## Required project settings

Use these server settings:

```text
Deployment type: Docker Compose
Compose file: docker-compose.yml
Gateway service: web
Container port: 3000
Access scope: public
```

Configure secret values in the CBGPU project settings. Never commit them.

```dotenv
POSTGRES_PASSWORD=<random high-entropy password>
APP_URL=https://<project>.server.cbgpu.com
COOKIE_SECURE=true

GMAIL_USER=<transactional sender address>
GMAIL_APP_PASSWORD=<application password>
RECRUIT_EMAIL_TO=<application recipient>
BOOTSTRAP_ADMIN_EMAIL=<your school email>

GITHUB_TOKEN=<repository-scoped token>
GITHUB_OWNER=Delibot-Lab
GITHUB_REPO=Delibot-Website
GITHUB_BRANCH=main
```

`POSTGRES_PASSWORD` is mandatory. Mail and GitHub values are required for email delivery and browser-based blog editing respectively.

## First account

Set `BOOTSTRAP_ADMIN_EMAIL` to the existing account's school address before the first signup, then create the account through the normal school-email flow. A matching verified account becomes the initial administrator automatically.

If an account was already created before that setting was added, promote it once from the database console:

```sql
UPDATE users
SET is_admin = true
WHERE email = 'your-school-address@cbs-h.cbe.go.kr';
```

Do not expose PostgreSQL publicly. Run the statement only through CBGPU's authenticated database or terminal interface.

## Data migration

The repository already contains the existing Markdown blog post under `content/blog/`, so it requires no database import. The legacy Supabase project contains only the existing account; create that account again through the new authentication flow because password hashes are not portable from Supabase Auth.

## Verification

After each deployment:

1. Wait until both Compose services are healthy. The application health check verifies both Next.js and Axum.
2. Open `/api/v1/health` through the public site and confirm an HTTP 200 response.
3. Test signup, verification, login, profile editing, avatar upload, application submission, and logout.
4. Run `npm audit` and `cargo check` locally before promoting a revision.
5. Confirm that both `postgres_data` and `uploads_data` remain attached after a redeploy.

## Rollback

Redeploy the previous Git commit. Do not delete or recreate the persistent volumes during a code rollback. SQL migrations are forward-only; add a corrective migration instead of editing an already-applied migration.
