# AsteHub Dashboard

The dashboard is the authenticated Next.js application for AsteHub. Its initial private shell lives under `/dashboard` and includes the overview, responsive navigation, account logout, and placeholder pages for vehicles, categories, locations, site, leads, users, and settings.

Configure `apps/api/.env` and set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/dashboard/.env.local`. Then start PostgreSQL, apply the API migration, and run the monorepo:

```powershell
Copy-Item apps\api\.env.example apps\api\.env
docker compose -f infra\docker-compose.yml up -d --wait
npm run db:migrate --workspace @astehub/api
npm run dev
```

The dashboard uses the existing session provider and `/auth/me` response to show the signed-in email and first active organization. The API continues to manage the HttpOnly session cookie; the dashboard does not store session tokens in browser storage.

Run dashboard unit tests, lint, typecheck, and build:

```powershell
npm run test:unit --workspace @astehub/dashboard
npm run lint --workspace @astehub/dashboard
npm run check-types --workspace @astehub/dashboard
npm run build --workspace @astehub/dashboard
```

The real-API integration test uses the isolated test database on port `5434`:

```powershell
$env:DATABASE_URL="postgresql://astehub_test:astehub_test@localhost:5434/astehub_test?schema=public"
npm run db:migrate --workspace @astehub/api
npm run test:integration --workspace @astehub/dashboard
Remove-Item Env:DATABASE_URL
```
