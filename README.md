# Delibot Website

The official website of **Delibot**, an autonomous campus delivery robot developed by CBSH DeliBot Lab.

The site presents Delibot's elevator-enabled delivery journey as a cinematic, scroll-driven story. It also includes real PCB captures, engineering notes, public team profiles, club applications, member chat, and administrative tools.

**Production:** [delibot-lab.server.cbgpu.com](https://delibot-lab.server.cbgpu.com)

## Features

- Cinematic, scroll-controlled project introduction
- Separate Korean and English experiences
- Real 3D captures of the Delibot controller and elevator controller PCBs
- Public member profiles grouped by mechanical, circuit, autonomy, software, and server teams
- Personal profile pages with GitHub, LinkedIn, ORCID, portfolio, and email links
- Markdown engineering blog with syntax highlighting and mathematical notation
- School-email registration and secure member authentication
- Club applications with email notifications
- Team chat and administrator tools for members and posts
- Interactive STEP model viewer

AI-generated concept imagery is explicitly labeled and visually distinguished from photographs and captures of the real project.

## Technology

- Next.js 16 App Router for the web application
- Rust 1.97 and Axum 0.8 for the API
- SQLx and PostgreSQL 17 for application data
- React 19, TypeScript, and Tailwind CSS 4
- Motion for scroll choreography
- React Three Fiber, Three.js, and OCCT for STEP visualization
- BlockNote, React Markdown, and KaTeX for publishing
- Lettre for transactional email from the Rust service
- CBGPU for application and database hosting

## Local Development

Requirements:

- Node.js 22 or later
- Rust 1.97 or later
- npm
- PostgreSQL 17 or later

```bash
git clone https://github.com/Delibot-Lab/Delibot-Website.git
cd Delibot-Website
npm ci
npm run dev
```

The development server is available at [http://localhost:3000](http://localhost:3000) by default.

## Environment Variables

Create `.env.local` for local development. Never commit real credentials or tokens.

```dotenv
DATABASE_URL=postgresql://delibot:local-password@localhost:5432/delibot
API_INTERNAL_URL=http://localhost:8080
APP_URL=http://localhost:3000
COOKIE_SECURE=false

GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=
GITHUB_BRANCH=

GMAIL_USER=
GMAIL_APP_PASSWORD=
RECRUIT_EMAIL_TO=
BOOTSTRAP_ADMIN_EMAIL=
```

Configure the same secret values in the CBGPU project settings for production.

## Commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npm run build     # Create a production build
npm run start     # Start the production server
cd backend && cargo run     # Start the Axum API
cd backend && cargo test    # Run backend tests
```

Next.js worker concurrency is limited in production builds so the application stays within CBGPU process limits.

## Repository Layout

```text
src/app/                 Pages, API routes, and route handlers
src/components/          Layout, storytelling, profiles, chat, and shared UI
src/lib/                 Authentication, database, GitHub, posts, and shared logic
backend/                 Rust and Axum API service
content/blog/            Markdown engineering notes
db/migrations/           PostgreSQL schema migrations
public/                  Images, 3D models, and WebAssembly assets
```

## Media Policy

- Every AI-generated concept scene is labeled in the interface.
- Real PCB scenes use the original engineering captures with background removal only.
- Member photographs are uploaded and published by each member through their own profile.

## Security

- Passwords are stored only as adaptive hashes.
- Session tokens are random, HTTP-only, same-site cookies; only token hashes are stored in PostgreSQL.
- Uploaded files are validated by type and size before they reach persistent storage.
- Dependencies are audited before deployment.
- Production secrets are configured through CBGPU and are never committed to the repository.

Please report suspected vulnerabilities privately to the maintainers instead of opening a public issue.

## Deployment

Production uses Docker Compose with an application container running both the Next.js web process and the Axum API, PostgreSQL, and a one-shot secret initializer. The initializer creates a strong database password directly inside a private persistent volume, so no database credential is committed or manually configured. Persistent volumes hold PostgreSQL data, the generated database secret, and user uploads. See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for the CBGPU procedure and optional environment variables.

## License

Source code is covered by [LICENSE](./LICENSE). Rights for member photographs, Delibot brand assets, and separately attributed media may differ from the source-code license.
