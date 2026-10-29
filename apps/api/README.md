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

## Location endpoints

All location endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /locations?organizationId=<id>&page=1&limit=10` returns a paginated location list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100.
- `GET /locations/:id?organizationId=<id>` returns one location in that organization.
- `POST /locations?organizationId=<id>` creates a location with required `name`, `address`, `city`, and `state`; `phone`, `description`, and `managerName` are optional.
- `PATCH /locations/:id?organizationId=<id>` updates one or more location fields.
- `DELETE /locations/:id?organizationId=<id>` deletes one location.
- `DELETE /locations/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and atomically deletes all requested locations.

Location identifiers belonging to another organization are returned as not found. Requests for an organization without an active membership are forbidden. The manager is stored as a name and is not linked to an AsteHub user.

## Site configuration endpoints

Site configuration is limited to one record per organization. All endpoints require an authenticated session and an `organizationId` query parameter; the API verifies active organization membership before accessing configuration.

- `GET /sites?organizationId=<id>` returns the organization's site configuration. It returns `404 Not Found` when no configuration has been created.
- `GET /sites/:id?organizationId=<id>` returns one site configuration belonging to that organization.
- `POST /sites?organizationId=<id>` creates the configuration with required `publicName` and a lowercase hyphen-separated `slug`. Optional fields are `domain`, `phone`, `description`, `primaryColor`, `secondaryColor`, and an HTTPS `logoUrl`.
- `PATCH /sites/:id?organizationId=<id>` updates one or more configuration fields. Optional fields can be set to `null` or an empty string to clear them.
- `DELETE /sites/:id?organizationId=<id>` removes the organization's site configuration.

Slugs and configured domains must be unique across organizations; duplicate organization configurations, slugs, or domains return `409 Conflict`. Colors must use six-digit hex notation. Site configuration does not create public pages or publish a site.

## Lead endpoints

All lead endpoints require an authenticated session and an `organizationId` query parameter. The API checks for an active membership before accessing lead records and verifies that linked vehicles and locations belong to the same organization.

- `GET /leads?organizationId=<id>&page=1&limit=10` returns a paginated lead list with contact details, status, and optional vehicle/location summaries.
- `GET /leads/:id?organizationId=<id>` returns one lead in that organization.
- `POST /leads?organizationId=<id>` creates a lead from `contactName`, `phone`, and `message`; `email`, `vehicleId`, and `locationId` are optional. New leads start with status `NEW`.
- `PATCH /leads/:id?organizationId=<id>` updates lead fields and/or status. Contact name, phone, message, email, and related vehicle/location can be edited; nullable email and relationship IDs can be cleared.
- `DELETE /leads/:id?organizationId=<id>` deletes one lead.
- `DELETE /leads/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and atomically deletes all requested leads.

Phone numbers must contain 8–15 digits. Lead statuses are `NEW`, `CONTACTED`, and `CLOSED`. Identifiers from another organization are not exposed; an invalid cross-organization vehicle or location reference is rejected.

## Database and checks

Apply checked-in migrations with `npm run db:migrate --workspace @astehub/api`. After changing `schema.prisma`, regenerate Prisma Client before compiling or starting the API with `npm run db:generate --workspace @astehub/api`. For schema changes during development, use `npm run db:migrate:dev --workspace @astehub/api -- --name <migration-name>`.
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
