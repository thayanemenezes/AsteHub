# AsteHub

Monorepo for AsteHub, a multi-tenant SaaS platform for vehicle rental companies.

## Applications

- `apps/api`: NestJS API, PostgreSQL, and Prisma.
- `apps/dashboard`: Next.js dashboard, exported as a static site for GitHub Pages.
- `apps/web`: Next.js public website, rendered for the selected tenant.
- `packages/`: shared contracts, UI, and configuration.

## Local development

Requirements: Node.js 24 or newer, npm, and Docker.

```powershell
npm ci
Copy-Item apps\api\.env.example apps\api\.env
Copy-Item apps\web\.env.example apps\web\.env.local
docker compose -f infra\docker-compose.yml up -d --wait
npm run db:migrate --workspace @astehub/api
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:3002` in
`apps\dashboard\.env.local`. In `apps\web\.env.local`, configure `API_URL` and
`PUBLIC_SITE_SLUG` for a published site. The API uses `DATABASE_URL` from
`apps\api\.env`; the API listens on port `3002` and the public preview on port
`3001`. Local dashboard development serves routes from `/`; the GitHub Pages
path prefix is only configured during the deployment build.

## GitHub Actions and GitHub Pages

The workflow in `.github/workflows/ci.yml` runs lint, type checks, unit and
PostgreSQL integration tests, and builds both applications. After successful
validation on `main`, it publishes the static dashboard to GitHub Pages.
Pull requests run validation but do not deploy.

In the repository's **Settings → Secrets and variables → Actions → Variables**,
add:

- `NEXT_PUBLIC_API_URL`: HTTPS URL of the deployed production API.
- `PAGES_BASE_PATH` (optional): path prefix such as `/AsteHub` for a project
  site. The workflow derives this from the repository name by default. Set it
  to `/` for a site served from the domain root.

Enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The first Pages deployment may require repository or organization permission
to create the `github-pages` environment.

GitHub Pages only serves static files; it cannot run the NestJS API or
PostgreSQL. Deploy `apps/api` and its database to a separate Node.js hosting
provider. Configure the API's production `DATABASE_URL`, `CORS_ORIGINS` (the
exact dashboard origin), and, if password reset emails are enabled,
`DASHBOARD_URL`, `RESEND_API_KEY`, and `EMAIL_FROM` in that hosting provider.
Apply Prisma migrations there with
`npm run db:migrate --workspace @astehub/api` before serving traffic.

The API uses `SameSite=Lax` session cookies. For browser authentication to work,
the dashboard and API must use HTTPS origins on the same site, for example
`dashboard.example.com` and `api.example.com`. The default `github.io` Pages
domain and an unrelated API domain are cross-site; use a custom Pages domain
under the same registrable domain as the API.
