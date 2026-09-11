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
`gg_cart_snapshots`) and the admin tables (`gg_admin_products`,
`gg_admin_jobs`, `gg_admin_events`, `gg_admin_partners`, `gg_admin_candidates`,
`gg_admin_reviews`, `gg_admin_sessions`). See
`.opencode/skills/postgres-testing/SKILL.md`.

## 6. Tests
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

## 7. Common gotchas
- **Empty cart → checkout redirects to /cart.** Always add an item first.
- **Cart/promo state lives in localStorage** (`glow-grace-cart`) — hard
  reloads preserve it; clear site data to reset.
- **Changes to `AGENTS.md`/skills** are picked up on the next opencode session
  (config is loaded once at startup).
- **Pushing:** credentials come from Git Credential Manager (already stored);
  if a push errors on a vscode `askpass` path, unset `GIT_ASKPASS`.

## 8. Publishing work
See the github-workflow skill: branch from `origin/main` (never while a PR is
open), commit stage-wise, verify, push, open a PR via `gh`.
