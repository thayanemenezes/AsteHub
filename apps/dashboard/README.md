# AsteHub Dashboard

The dashboard is the authenticated Next.js application for AsteHub. Its private shell lives under `/dashboard` and includes the overview, responsive navigation, account logout, and the vehicle catalog. Categories, locations, site, leads, users, and settings remain placeholders.

Configure `apps/api/.env` and set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/dashboard/.env.local`. Then start PostgreSQL, apply the API migration, and run the monorepo:

```powershell
Copy-Item apps\api\.env.example apps\api\.env
docker compose -f infra\docker-compose.yml up -d --wait
npm run db:migrate --workspace @astehub/api
npm run dev
```

The dashboard uses the existing session provider and `/auth/me` response to show the signed-in email and first active organization. The API continues to manage the HttpOnly session cookie; the dashboard does not store session tokens in browser storage.

The vehicle catalog is served by the authenticated `/vehicles` API endpoints. It lists vehicles for the active organization with pagination and supports creating, editing, individual deletion, and selecting multiple vehicles for atomic deletion. Apply the API migration before using the module.

Dashboard routes keep route-specific state and actions in a sibling `container.ts`, imported by the page component. Reusable client hooks belong in `src/hooks`; `useAsyncResource` centralizes loading, refresh, error, cancellation, and retry behavior for API-backed state.

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
