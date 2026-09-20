# AGENTS.md — Glow & Grace

Instructions for agentic coding tools working in this repo. Read this before
editing, testing, or shipping.

## Project
Next.js 14 (App Router, TypeScript) storefront + beauty-career site for
**Glow & Grace** (Lucknow). The visual/commerce spec is the single source of
truth at `design/glow-grace-full.html` — match it (copy, layout, palette,
pill buttons) when touching UI.

## Environment (this Windows machine)
- **Git is not on PATH.** Prefix every git command in the same PowerShell call:
  `$env:Path += ";C:\Program Files\Git\cmd"`
- **gh CLI is not on PATH.** Prefix every gh call:
  `$env:Path += ";C:\Program Files\Git\cmd;C:\Users\deepak\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin"`
- Node v24.20.0 (supports `node --env-file=.env.local`).
- No `rg`; use the grep tool. `$HOME` is read-only.
- **Docker Desktop CLI is NOT on PATH** (per-user install under
  `AppData\Local\Programs\DockerDesktop\resources\bin`). Use the npm scripts
  (`npm run db:up` / `db:down` / `db:reset` → `scripts/local-db.mjs`), which
  locate the CLI automatically; don't call raw `docker` from shell.

## Secrets / env
- `.env.local` holds LIVE Neon Postgres credentials — **never commit it,
  never echo the DATABASE_URL value**, never put the URL in output.
- `.env` and `.env*.local` are gitignored. `exNEXT_PUBLIC_APP_URL` etc. in
  `.env.example` are safe to reference.
- `.env.local` also carries `USE_LOCAL_DB=true` — the signal that dev/testing
  runs against the local Docker Postgres. `DATABASE_URL` keeps the Neon URL as
  the sync source.

## Architecture
- Styling: Tailwind 3 + custom tokens/classes in `src/app/globals.css`
  (```.btn```, ```.field-*```, ```.card```, ```.topbar```, ```.breadcrumb```).
- State: Zustand (`src/lib/store.ts`), persisted to localStorage
  `glow-grace-cart` / `glow-grace-device-id`.
- Persistence: Neon via `src/lib/db.ts` (```db.query(text, params)``` — NEVER
  `db(text,...)`, first arg is a `TemplateStringsArray`). Graceful no-op when
  `DATABASE_URL` unset; responses carry `persisted/applied/subscribed` booleans.
- **Local DB mode:** when `USE_LOCAL_DB=true` (set in `.env.local`),
  `src/lib/db.ts` points at the Docker-Postgres from
  `local-dev/docker-compose.yml` (port 5433, named volume `gg-local-pgdata`)
  using the `pg` driver — the Neon HTTP driver can't talk to a plain Postgres.
  `npm run db:up` / `db:down` / `db:reset` manage the container via
  `scripts/local-db.mjs`; `npm run start:local` starts it with the dev server.
  In local mode the app NEVER queries Neon on its own; `DATABASE_URL` is kept
  as the Neon source for the admin dashboard **"Sync from Neon → Local"**
  button, which snapshots every `gg_%` table down into the local DB
  (`src/lib/sync.ts` + `POST /api/admin/sync`, admin-auth guarded, read-only
  on Neon: one metadata query + one SELECT per table, replaces local rows in a
  single transaction, excludes `gg_admin_sessions` so the admin stays logged
  in). `/api/health` reports `mode: "local" | "cloud" | "none"` (force-dynamic)
  and `GET /api/admin/sync` preflights the dashboard button
  (`fetchSyncStatus` in `src/lib/api.ts`, reports
  `{ local, sourceConfigured, sourceAvailable }` — the button disables with a
  note when Neon is unreachable, e.g. quota exceeded).
- API client: `src/lib/api.ts` (typed wrappers over a shared `request<T>()`).
  Business components call THIS, not bare `fetch`.
- Loading indicator: `src/components/preloader.tsx` renders the animated
  spinner from `src/images/loader-animated.gif` + a label. Component-level
  only — used inline in the app's async "Loading" states (admin shell, admin
  page config editors, candidate page, shopper orders, recruiter
  profile/jobs). There is no page-level route loader (`src/app/loading.tsx`).
- Schemas: `src/lib/schemas.ts` (Zod) — checkout, order payload, application,
  newsletter, auth forms (login, signup with `accountType`), candidate profile.
- Auth: Zustand (`src/lib/auth.ts`), persisted to localStorage
  `glow-grace-user`. Roles: `user` | `candidate` | `admin` | `recruiter`.
  Demo credentials in `src/app/login/page.tsx` (`shopper@...`, `candidate@...`,
  `admin@...`, `recruiter@...`).
  Registered users stored in localStorage `glow-grace-registered-users`.
- Premium membership: `glow-grace-user` also carries `tier`
  (`free` | `pro` | `pro_max`), `tierExpiresAt` (365-day expiry, resolved via
  `activeTier` — expired tiers fall back to `free`), and `jobsSecuredCount`
  (Pro Max placement tracker, capped at `PRO_MAX_PLACEMENT_CAP` = 3 by
  `incrementJobsSecured`). Tiers are upgraded client-side on the candidate
  preview profile's "Membership Plans" section (`plan-<tier>` cards,
  `upgrade-<tier>` / `current-plan` CTAs, `tier-badge`, `fulfillment-tracker`).
- Data: `src/lib/data.ts` — static catalog was removed from the storefront:
  `/api/products`, `/api/partners`, `/api/events`, and `/api/jobs` are
  **admin-DB only** (products have `reviewsCount` (not `reviews`) and inStock
  (not `available`) — grep it before coding against a shape). `data.ts` now
  backs only home static content (testimonials); jobs and events come from
  `gg_admin_jobs` / `gg_admin_events`. Jobs carry a `verified` flag
  (admin-toggleable in `/admin/jobs` via `toggle-verified-listing`, surfaced as
  a gold "Genuine Job Hunt Listing" pill on the careers list and `/api/jobs`).
  Free-tier users (logged out or `tier === "free"`) only see unverified
  (`verified = false`) jobs on `/careers`; Pro / Pro Max members see all open
  jobs plus the verified badge (`verified-badge`). `/careers` renders
  `job-grid-empty` when the free tier has no visible jobs.
  Reviews flow: the product star popup and
  the `/contact` page POST to `/api/reviews` → `gg_admin_reviews` (status
  `Pending`), the admin console approves/hides them (`PATCH
  /api/admin/reviews`), and only `Approved` rows surface on product pages, the
  `/api/products` aggregates, and home testimonials.
  Job workflow: `gg_admin_jobs` drives `/recruiter/jobs` (create/edit/hold)
  and `/admin/jobs`. Statuses are `Pending` (new or edited — awaiting
  approval), `Open` (live on `/careers`), `On Hold`, `Rejected`, and
  `Pending Hold` (recruiter hold request). Recruiter edits submit as `Pending`;
  recruiter "Hold" submits `Pending Hold`. Admin Accept publishes (`Open`),
  rejects (`Rejected`), or for a `Pending Hold` row approves the hold
  (`On Hold`) or rejects it (back to `Open`). Only `Open` + not `hidden` rows
  hit `/api/jobs` (rows also carry `verified` → "Genuine Job Hunt Listing").
  Storefront E2E specs seed
  admin records via `tests/helpers.ts` (`seedProduct` / `deleteSeededProduct`,
  `seedEvent` / `deleteSeededEvent`, `seedJob` / `deleteSeededJob`,
  `seedReview` / `deleteSeededReview`, `waitForAdminReview`).
  `tests/premium-pricing.spec.ts` covers the tiers + verified-job gating
  end-to-end (sets `verified` via `PATCH /api/admin/jobs?id=… { verified }`).
  Note the `/partner` storefront route is removed — partner/recruiter info now
  lives on `/partners`, and the "Hire Talent" footer + partners CTA link to
  `/signup?accountType=recruiter` (the signup page preselects the Recruiter
  account type via the `accountType` query param).
- Home config: the storefront home page is server-rendered from a single
  `gg_admin_home_config` row (`id = 1`) — hero copy/stats/trust, section
  eyebrow/heading/description, CTA, testimonials heading, per-section
  visibility + ordering + deletion (`src/lib/home-config.ts` defaults +
  `normalizeHomeConfig`, loaded by `src/lib/home-config-server.ts`). The hero
  also takes up to `HOME_HERO_MAX_IMAGES` = 5 uploaded images shown as a
  rotating slideshow inside the hero circle (380 × 380 px); when empty the
  circle falls back to the product slides
  (`src/components/home/hero-circle-carousel.tsx`).
  `/api/home-config` serves it; `/admin/pages/home` edits it (`GET`/`PUT
  /api/admin/home-config`, zod `homeConfigSchema` in `src/lib/schemas.ts`).
  The home route is `force-dynamic` so edits publish immediately.
- Shop config: the storefront shop page (`/products`) is config-driven from a
  single `gg_admin_shop_config` row (`id = 1`), mirroring home config — banner
  (up to `SHOP_BANNER_MAX_IMAGES` = 5 uploaded images shown as a rotating
  slideshow + title/subtitle), heading (eyebrow/title/description,
  `{{count}}` placeholder renders the product count), and category chips (a
  custom admin-managed list, falling back to auto-detected product categories
  when empty), each with per-section visibility + ordering + deletion
  (`src/lib/shop-config.ts` defaults + `normalizeShopConfig`, loaded by
  `src/lib/shop-config-server.ts`). Breadcrumb, search/sort toolbar, and the
  product grid always render (not configurable).
  `/api/shop-config` serves it; `/admin/pages/shop` edits it (`GET`/`PUT
  /api/admin/shop-config`, zod `shopConfigSchema`). The site top menu is NOT
  configurable. The admin "Pages" sidebar group also has placeholder shells for
  career/partner/event/contact.

## Test-data & deletion policy (user-mandated)
- **Never delete production/real records.** Test helpers and specs may only
  delete **E2E test records** (names/slugs/emails containing `E2E`/`e2e`).
  Apply the test-record guard (`isTestRecord` in `tests/helpers.ts`, or an
  inline `/e2e/i` match in local spec helpers) before any delete; helpers that
  hit a non-test record throw instead of deleting.
- **Always sync with the database** before deleting: GET the admin list first,
  resolve the row by slug/name/email/id, verify it is a test record, then
  DELETE by `?id=` (never sweep, never filter-drop, never `DELETE` by slug).
  Deletes are verified: `deleteSeeded*` retry with a 60s timeout and **throw**
  unless the DELETE returns 2xx, so a Neon slow-write can never silently strand
  an E2E row in the live DB.
- **Config specs restore prod data exactly:** `tests/admin-home-config.spec.ts`
  and `tests/shop-config.spec.ts` snapshot the live page config
  (`GET /api/home-config` / `/api/shop-config`) and restore it in `finally`
  via `restoreAdminConfig` in `tests/helpers.ts` — PUTs with a generous timeout,
  retries on Neon slow-write timeouts, and verifies the stored row equals the
  original by reading it back, so a timed-out run cannot strand test changes in
  the prod config row.
- **Keep docs in sync:** whenever seeding/cleanup or the DB contract changes,
  update `AGENTS.md`, `README.md`, and `.opencode/skills/e2e-testing/SKILL.md`
  in the same change.

## Conventions
- Commit style (used on main): lowercase type + summary —
  `chore:`, `feat:`, `style:`, `fix:`, `docs:`. Stage-wise: one cohesion/commit.
- No code comments unless asked; mirror existing style.
- `data-testid` hooks exist for E2E; prefer them over text/CSS selectors.
- **Always follow TDD (user-mandated):** write a failing test first (typically a
  Playwright E2E in `tests/`), run it to confirm it fails, then make it pass
  with the minimal implementation. Never implement behavior before its test.
- **Never edit the `design/` folder** — it is read-only design reference only
  (source of truth `design/glow-grace-full.html`). It is gitignored.

## Verification (always before shipping)
- `npm run lint`
- `npm run build`
- `npm run test:e2e` (headed, serial) against a local build
  (`npm run start` + `$env:BASE_URL="http://localhost:3000"`) — this run IS the
  UI pass since the browser is on screen.

## Git workflow policy (user-mandated)
- Trunk-based. `main` is the only long-lived branch; work lands via a short
  branch + PR.
- **Never push automatically. Always ask the user for explicit confirmation
  before any `git push`, before opening a PR, and before merging.** When work
  is ready, summarize what would be pushed and wait for the go-ahead — do not
  push as part of concluding a task.
- **Never commit or push directly to `main`** — all work is committed on a
  feature branch and shipped through a PR reviewed by the user.
- **Never create a branch while a PR is open.**
- Before branching: `git status`, `git log --oneline -10`, `gh pr list --state open`.
- Create branch from `origin/main`.
- Do not push/PR until build + lint + headless e2e are green AND the user has
  reviewed the headed pass. PR body must state what/why/verification/manual
  steps.
- Never commit credentials; never force-push; do not amend a failed commit —
  make a new one.

See `.opencode/skills/github-workflow/SKILL.md`,
`.opencode/skills/postgres-testing/SKILL.md`,
`.opencode/skills/e2e-testing/SKILL.md` for the runbook each area.
