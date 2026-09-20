# Onboarding — Glow & Grace local development

Get the storefront + Neo-browser stack running on your own machine.

## 1. Prerequisites
- Node.js **v20.6+** (this machine: v24.20.0) so `--env-file` works.
- **Git** — on this Windows machine git is not on PATH; prefix
  `$env:Path += ";C:\Program Files\Git\cmd"`.
- **Playwright** browser after `npx playwright install chromium` (first time).

## 2. Install dependencies
```bash
npm install
npx playwright install chromium
```

## 3. Environment
```bash
cp .env.example .env.local
```
Edit `.env.local`:
- `DATABASE_URL` — required for persistence. Create a free Neon project at
  https://neon.tech, copy the connection string from
  **Connect → Node.js / @neondatabase/serverless**, e.g.
  `postgresql://USER:PASSWORD@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`.
- `NEXT_PUBLIC_APP_URL` — your local URL (defaults fine).

> `.env.local` must **never** be committed. It is gitignored. Treat its
> contents as secrets.

The app degrades gracefully: without `DATABASE_URL` it still builds and runs —
orders/applications/newsletter simply won't persist and the API returns
`persisted:false`.

## 4. Run
```bash
npm run dev          # http://localhost:3000 — hot reload
# or production-style verification:
npm run build && npm start
```

## 5. Verify the database
Start the server, then:
```powershell
Invoke-RestMethod http://localhost:3000/api/health
```
Expect `database: "connected"`. First write auto-creates the tables
(`gg_orders`, `gg_job_applications`, `gg_newsletter_subscribers`,
`gg_cart_snapshots`), the admin tables (`gg_admin_products`,
`gg_admin_jobs`, `gg_admin_events`, `gg_admin_partners`, `gg_admin_candidates`,
`gg_admin_reviews`, `gg_admin_sessions`), and the recruiter tables
(`gg_recruiters`, `gg_recruiter_hires`, `gg_recruiter_packages`). See
`.opencode/skills/postgres-testing/SKILL.md`.

Demo accounts (logged in from the `demo` link on `/login`):
| Role        | Email                    | Password     |
| ----------- | ------------------------ | ------------ |
| Shopper     | `shopper@glowngrace.in`  | `shopper123` |
| Candidate   | `candidate@glowngrace.in`| `candidate123` |
| Recruiter   | `recruiter@glowngrace.in`| `recruiter123` |
| Admin       | `admin@glowngrace.in`    | `admin123`   |

## 6. Local development database (Docker) — optional

Instead of developing/testing against the live Neon database, run the app
against a disposable Docker-Postgres that mirrors the Neon schema. Enable it
with `USE_LOCAL_DB=true` (already set in `.env.local`, documented in
`.env.example`):

```bash
npm run db:up          # start the local Postgres container (port 5433, volume gg-local-pgdata)
npm run start:local    # start the container + the dev server together
npm run db:down        # stop it (data stays in the volume for next time)
npm run db:reset       # stop + wipe the volume, start fresh
npm run db:ps          # container status
npm run db:logs        # postgres server logs
```

How it works:

- `local-dev/docker-compose.yml` defines the container (`postgres:16-alpine`,
  port `5433:5432`, user/pass/db `gg/gg/glowngrace`, named volume
  `gg-local-pgdata` for persistence, `pg_isready` healthcheck).
- `scripts/local-db.mjs` drives it and auto-locates the Docker CLI even when
  Docker Desktop isn't on PATH (it isn't on this machine).
- With `USE_LOCAL_DB=true`, `src/lib/db.ts` switches from the Neon HTTP driver
  to the `pg` driver on `localhost:5433`. **The app never contacts Neon in
  local mode** — no quotas, no network, run E2E freely.
- `DATABASE_URL` stays set to the Neon URL as the **sync source**: the admin
  dashboard's **"Sync from Neon → Local"** button snapshots the whole `gg_%`
  database down into the local one (read-only on Neon, single metadata query +
  one SELECT per table, excludes `gg_admin_sessions`). If Neon is unreachable
  (e.g. plan quota exceeded) the button disables with a note instead of
  failing.
- `/api/health` reports `mode: "local" | "cloud" | "none"`.

Database notes:

- The local DB starts **empty**; tables are auto-created idempotently on the
  first write, exactly like Neon (`db/schema.sql` mirrors them). Nothing is
  seeded — use "Sync from Neon" or the admin console to add data.
- To verify schema/rows in local mode, query port 5433 with any Postgres
  client (see `.opencode/skills/postgres-testing/SKILL.md`).
- E2E: run the whole suite against local mode like this:

  ```bash
  npm run db:up && npm run build && npm start
  $env:BASE_URL="http://localhost:3000"; npm run test:e2e
  ```

  `tests/local-db-sync.spec.ts` covers the sync button and self-skips when not
  in local mode.

## 7. Tests
```bash
npm run lint          # eslint
npm run build         # typecheck + compile
npm run test:e2e      # Playwright E2E — headed, serial (1 worker)
npm run test:e2e:ui   # Playwright UI mode — watch + debug
```
The suite is headed and serial because every spec shares one Neon DB. The base
URL comes from `BASE_URL` (defaults to the deployed
`https://glowngrace-dev.vercel.app`); to test your local build first run
`npm run start` (after `npm run build`), then run
`$env:BASE_URL="http://localhost:3000"; npm run test:e2e`.
See `.opencode/skills/e2e-testing/SKILL.md`.

## 8. Common gotchas
- **Empty cart → checkout redirects to /cart.** Always add an item first.
- **Cart/promo state lives in localStorage** (`glow-grace-cart`) — hard
  reloads preserve it; clear site data to reset.
- **Changes to `AGENTS.md`/skills** are picked up on the next opencode session
  (config is loaded once at startup).
- **Pushing:** credentials come from Git Credential Manager (already stored);
  if a push errors on a vscode `askpass` path, unset `GIT_ASKPASS`.

## 9. Publishing work
See the github-workflow skill: branch from `origin/main` (never while a PR is
open), commit stage-wise, verify, push, open a PR via `gh`.
