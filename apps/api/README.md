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

Password reset email delivery is handled by the API through Resend. Configure `RESEND_API_KEY`, `EMAIL_FROM` (a verified sender), and `DASHBOARD_URL` (the dashboard origin) in the API environment. `DASHBOARD_URL` must use HTTPS in production. Never expose the Resend key to the dashboard.

## Authentication endpoints

- `POST /auth/register` accepts `email`, `password` (12–128 characters), and `organizationName`; it creates a user, initial organization, active `OWNER` membership, and session atomically.
- `POST /auth/login` accepts `email` and `password`.
- `POST /auth/password-reset` accepts `email` and always returns the same response whether or not the account exists. For an eligible account, the API sends a single-use reset link that expires in 15 minutes; requests are limited to one per account per minute.
- `POST /auth/password-reset/confirm` accepts the emailed `token` and a new `password` (12–128 characters). A successful reset consumes the token and invalidates all active sessions for the account.
- `POST /auth/logout` invalidates the presented session and clears its cookie.
- `GET /auth/me` returns the authenticated user's public profile, memberships, organization names, roles, and statuses.

Sessions use a random `astehub_session` `HttpOnly`, `SameSite=Lax` cookie with a seven-day lifetime. Only a SHA-256 hash of its token is stored. Reset tokens are random, single-use, expire after 15 minutes, and are stored only as SHA-256 hashes. Authentication errors do not distinguish an unknown email from a wrong password.

## Vehicle endpoints

All vehicle endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /vehicles?organizationId=<id>&page=1&limit=10` returns a paginated vehicle list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100.
- `GET /vehicles/:id?organizationId=<id>` returns a vehicle in that organization.
- `POST /vehicles?organizationId=<id>` creates a vehicle from `make`, `model`, `year`, and optional `description`.
- `PATCH /vehicles/:id?organizationId=<id>` updates one or more of those fields.
- `DELETE /vehicles/:id?organizationId=<id>` deletes one vehicle.
- `DELETE /vehicles/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and deletes all requested vehicles atomically.

Vehicle identifiers belonging to another organization are returned as not found. Requests for an organization without an active membership are forbidden.

## Vehicle category endpoints

All vehicle category endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /vehicle-categories?organizationId=<id>&page=1&limit=10` returns a paginated category list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100.
- `GET /vehicle-categories/:id?organizationId=<id>` returns one category in that organization.
- `POST /vehicle-categories?organizationId=<id>` creates a category from a required `name` (up to 80 characters) and optional `description` (up to 500 characters).
- `PATCH /vehicle-categories/:id?organizationId=<id>` updates the category name and/or description.
- `DELETE /vehicle-categories/:id?organizationId=<id>` deletes one category.
- `DELETE /vehicle-categories/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and atomically deletes all requested categories.

Category names must be unique within an organization. Duplicate names return `409 Conflict`. Category identifiers belonging to another organization are returned as not found; requests for an organization without an active membership are forbidden.

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
