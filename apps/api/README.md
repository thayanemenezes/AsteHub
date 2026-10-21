# AsteHub API

The authentication API uses NestJS, PostgreSQL, Prisma, opaque server-side sessions, and Argon2id password hashes.

## Local setup

From the repository root:

```powershell
npm install
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
docker compose -f infra\docker-compose.yml up -d --wait
npm run db:migrate --workspace @astehub/api
npm run dev
```

The root `npm run dev` starts both the API and web app. The sample environments use the development PostgreSQL database on port `5433` and the API at `http://localhost:3001`. Docker Compose also starts an isolated integration-test database on port `5434`; never use the development database for integration tests. Set `DATABASE_URL` to the appropriate PostgreSQL database before applying migrations in another environment. `COOKIE_DOMAIN` is optional; set it only when the API and web app share a parent domain. In production, configure `CORS_ORIGINS` with the exact comma-separated trusted origins. Production cookies are always `Secure`.

## Authentication endpoints

- `POST /auth/register` accepts `email`, `password` (12–128 characters), and `organizationName`; it creates a user, initial organization, active `OWNER` membership, and session atomically.
- `POST /auth/login` accepts `email` and `password`.
- `POST /auth/logout` invalidates the presented session and clears its cookie.
- `GET /auth/me` returns the authenticated user's public profile, memberships, organization names, roles, and statuses.

Sessions use a random `astehub_session` `HttpOnly`, `SameSite=Lax` cookie with a seven-day lifetime. Only a SHA-256 hash of its token is stored. Authentication errors do not distinguish an unknown email from a wrong password.

## Database and checks

Apply checked-in migrations with `npm run db:migrate --workspace @astehub/api`. For schema changes during development, use `npm run db:migrate:dev --workspace @astehub/api -- --name <migration-name>`.
For integration tests, point `DATABASE_URL` at the dedicated test database, apply migrations there, and keep that environment variable set while running the tests:

```powershell
$env:DATABASE_URL="postgresql://astehub_test:astehub_test@localhost:5434/astehub_test?schema=public"
npm run db:migrate --workspace @astehub/api
npm run test --workspace @astehub/api
Remove-Item Env:DATABASE_URL
```

Run unit and database-backed integration tests with:

```powershell
npm run test --workspace @astehub/api
npm run lint --workspace @astehub/api
npm run check-types --workspace @astehub/api
npm run build --workspace @astehub/api
```

Integration tests use `DATABASE_URL` and clean the dedicated test database before running. Do not point them at the development, shared, or production database.
