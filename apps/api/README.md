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

Vehicle image uploads use short-lived S3 presigned POSTs. Configure `AWS_REGION`, `AWS_S3_BUCKET`, and `AWS_S3_PUBLIC_BASE_URL` in the API environment. The API uses the AWS SDK credential provider chain; use the hosting provider's IAM role where available, or configure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as secrets locally and in production. The IAM principal needs `s3:PutObject` for `organizations/*/vehicles/*`. `AWS_S3_PUBLIC_BASE_URL` should be an HTTPS CloudFront URL serving the bucket's public vehicle images. Never expose AWS credentials to the dashboard.

Configure S3 bucket CORS to allow `POST` from the exact dashboard origin(s), including `http://localhost:3000` for local development. Example (replace the production origin with the deployed dashboard origin):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://<dashboard-origin>"],
    "AllowedMethods": ["POST"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

The browser uploads directly to S3; each presigned request expires after five minutes and restricts uploads to JPEG, PNG, WebP, or AVIF up to 10 MB. Do not enable public bucket listing. Configure CloudFront/bucket access for reading images and consider an S3 lifecycle rule for incomplete vehicle uploads that are never saved.

## Authentication endpoints

- `POST /auth/register` accepts `email`, `password` (12–128 characters), and `organizationName`; it creates a user, initial organization, active `OWNER` membership, and session atomically.
- `POST /auth/login` accepts `email` and `password`.
- `POST /auth/password-reset` accepts `email` and always returns the same response whether or not the account exists. For an eligible account, the API sends a single-use reset link that expires in 15 minutes; requests are limited to one per account per minute.
- `POST /auth/password-reset/confirm` accepts the emailed `token` and a new `password` (12–128 characters). A successful reset consumes the token and invalidates all active sessions for the account.
- `POST /auth/logout` invalidates the presented session and clears its cookie.
- `GET /auth/me` returns the authenticated user's public profile, memberships, organization names, roles, and statuses.

Sessions use a random `astehub_session` `HttpOnly`, `SameSite=Lax` cookie with a seven-day lifetime. Only a SHA-256 hash of its token is stored. Reset tokens are random, single-use, expire after 15 minutes, and are stored only as SHA-256 hashes. Authentication errors do not distinguish an unknown email from a wrong password.

## Organization user endpoints

`GET /users?organizationId=<id>` requires an active membership and returns the organization's members and unexpired invitations. Managing access requires an `OWNER` or `ADMIN` membership.

- `POST /users/invitations?organizationId=<id>` accepts `{ "email": "...", "role": "MEMBER" }` and emails a single-use invitation link that expires in seven days. Owners may invite `OWNER`, `ADMIN`, or `MEMBER`; admins may invite only `ADMIN` or `MEMBER`. Configure `RESEND_API_KEY`, `EMAIL_FROM`, and `DASHBOARD_URL` to deliver invitations.
- `POST /users/invitations/accept` accepts the invitation `token` and a `password` (12–128 characters). It creates the account or, for an existing account, verifies its password before adding the organization membership. The invited person signs in after accepting.
- `PATCH /users/:membershipId?organizationId=<id>` accepts `{ "role": "ADMIN" }` to change a member's role. Only owners can promote a member to owner or manage an existing owner.
- `DELETE /users/:membershipId?organizationId=<id>` removes that user's access to the organization without deleting their global account.
- `DELETE /users/invitations/:invitationId?organizationId=<id>` revokes a pending invitation.

An organization must always retain at least one active owner. Membership and invitation changes are scoped to the authorized organization.

## Vehicle endpoints

All vehicle endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /vehicles?organizationId=<id>&page=1&limit=10&search=<term>` returns a paginated vehicle list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100. Optional `search` filters by make, model, series, description, or exact year.
- `GET /vehicles/:id?organizationId=<id>` returns a vehicle in that organization.
- `POST /vehicles?organizationId=<id>` creates a vehicle from `make`, `model`, and `year`; optional fields are `categoryId` (a category in the same organization), `description`, `series`, `isElectric`, `images` (up to 20 HTTP(S) URLs), and `customFields` (up to 30 unique `{ "name", "value" }` text pairs). Deleting a category clears it from its vehicles.
- `PATCH /vehicles/:id?organizationId=<id>` updates one or more vehicle fields. `categoryId` must identify a category in the same organization; send `null` to remove it. Sending an empty `images` or `customFields` array clears that collection.
- `DELETE /vehicles/:id?organizationId=<id>` deletes one vehicle.
- `DELETE /vehicles/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and deletes all requested vehicles atomically.

Vehicle identifiers belonging to another organization are returned as not found. Requests for an organization without an active membership are forbidden.

- `POST /vehicles/images/upload?organizationId=<id>` accepts `{ "contentType": "image/png", "size": 12345 }` and returns a short-lived S3 form (`url`, `fields`) plus the public `imageUrl`. The authenticated user must have active membership in the organization. Upload the file to the returned URL as multipart form data, including all returned fields and the file under `file`, then save `imageUrl` in the vehicle's `images` array.

## Vehicle category endpoints

All vehicle category endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /vehicle-categories?organizationId=<id>&page=1&limit=10&search=<term>` returns a paginated category list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100. Optional `search` filters by name or description.
- `GET /vehicle-categories/:id?organizationId=<id>` returns one category in that organization.
- `POST /vehicle-categories?organizationId=<id>` creates a category from a required `name` (up to 80 characters) and optional `description` (up to 500 characters).
- `PATCH /vehicle-categories/:id?organizationId=<id>` updates the category name and/or description.
- `DELETE /vehicle-categories/:id?organizationId=<id>` deletes one category.
- `DELETE /vehicle-categories/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and atomically deletes all requested categories.

Category names must be unique within an organization. Duplicate names return `409 Conflict`. Category identifiers belonging to another organization are returned as not found; requests for an organization without an active membership are forbidden.

## Location endpoints

All location endpoints require an authenticated session and an `organizationId` query parameter. The API verifies that the signed-in user has an active membership in that organization; the supplied ID is never treated as authorization by itself.

- `GET /locations?organizationId=<id>&page=1&limit=10&search=<term>` returns a paginated location list (`data`, `page`, `limit`, `total`, `totalPages`). `limit` is capped at 100. Optional `search` filters by name, address, city, state, phone, or manager.
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

- `GET /leads?organizationId=<id>&page=1&limit=10&search=<term>` returns a paginated lead list with contact details, status, and optional vehicle/location summaries. Optional `search` filters by contact details, message, status, vehicle make/model, or location name.
- `GET /leads/:id?organizationId=<id>` returns one lead in that organization.
- `POST /leads?organizationId=<id>` creates a lead from `contactName`, `phone`, and `message`; `email`, `vehicleId`, and `locationId` are optional. New leads start with status `NEW`.
- `PATCH /leads/:id?organizationId=<id>` updates lead fields and/or status. Contact name, phone, message, email, and related vehicle/location can be edited; nullable email and relationship IDs can be cleared.
- `DELETE /leads/:id?organizationId=<id>` deletes one lead.
- `DELETE /leads/bulk?organizationId=<id>` accepts `{ "ids": ["..."] }` and atomically deletes all requested leads.

Phone numbers must contain 8–15 digits. Lead statuses are `NEW`, `CONTACTED`, and `CLOSED`. Identifiers from another organization are not exposed; an invalid cross-organization vehicle or location reference is rejected.

## Database and checks

Apply checked-in migrations with `npm run db:migrate --workspace @astehub/api`. The development command generates Prisma Client on startup. After changing `schema.prisma`, stop the API and run `npm run db:generate --workspace @astehub/api` before building or typechecking; for schema changes during development, use `npm run db:migrate:dev --workspace @astehub/api -- --name <migration-name>`.
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
