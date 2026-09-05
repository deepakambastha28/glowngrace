# Decision Log — Glow & Grace

Every significant design/architecture decision, why it was made, and the
impact / lesson it left behind. New entries appended at the bottom.

## D1. Faithful mirror of the reference design
- **What:** Rebuilt the storefront (design tokens, layout, pages, copy mirror)
  to match `design/glow-grace-full.html` exactly, including pill buttons,
  rose/gold palette, Playfair Display + Inter fonts, and mirrored product/job/
  testimonial data.
- **Decisions:** Tokenized palette in `tailwind.config.js`, pill `.btn`,
  `.field-*`, `.card`, `.topbar` component classes in `globals.css`, font
  variables `--font-playfair`/`--font-inter`.
- **Impact:** 3 redesigned page families + shared layout; higher visual
  fidelity; the reference file remains the source of truth for layout.
- **Lesson:** When the reference is DRY, mirror its data — UI that mirrors the
  design's own copy photos/commerce layouts makes review against the spec easy.

## D2. Multi-page architecture with topbar + sticky navbar + footer
- **What:** Chose real multi-page routes (`/`, `/products`, `/cart`,
  `/checkout`, `/careers`, `/login`, ...) over a single-scroll page, with a
  charcoal topbar (contact bar) and sticky navbar.
- **Why:** The reference is multi-page and the client flows (cart → checkout →
  success) need discrete URLs; a topbar carries contact/preview info per design.
- **Impact:** New layout components + per-page rewrite. `data-testid` hooks
  everywhere so E2E selectors survive copy tweaks.

## D3. Neon Postgres persistence with graceful degradation
- **What:** Chose Neon (`@neondatabase/serverless`, fetch-based driver) for all
  persistence: orders, job applications, newsletter subscribers, cart
  snapshots.
- **Why:** Serverless-friendly, zero-provisioning for the demo, and a single
  Vercel env var (`DATABASE_URL`) keeps deploy simple.
- **Impact:** `src/lib/db.ts` lazily connects, auto-creates schema (idempotent
  `CREATE TABLE IF NOT EXISTS`), and returns `null` when `DATABASE_URL` is
  unset. API routes answer `200` with `persisted:false` in no-op mode so the
  build, local dev, and E2E never require a live DB.
- **Lesson:** Graceful degradation buys CI determinism at the cost of silent
  data loss in no-DB mode — always expose `persisted/applied/subscribed` booleans
  in the response so the client knows the truth.

## D4. Canonical schema in two places (db.ts + db/schema.sql)
- **What:** Schema lives idempotently in `SCHEMA_STATEMENTS` (`db.ts`) and as
  canonical DDL in `db/schema.sql`.
- **Why:** Runtime auto-create makes first use seamless on a fresh Neon
  project; `schema.sql` documents the tables for manual inspection/migrations.
- **Lesson:** Keep the two in sync — drift silently changed what rows look
  like (fields added later must appear in both).

## D5. Neon driver invocation is `.query(text, params)`, not `db(text)`
- **Bug:** `neon()` produces a callable whose first positional type is a
  `TemplateStringsArray`; passing a plain string (`db("<sql>")`) broke reads.
- **Fix:** `commit f7faef4` — call `db.query(text, params)` in both `query()`
  and `ensureSchema()`.
- **Lesson:** Read the driver's TypeScript signature before calling; the
  template-tag style (`db\`...\``) is safest for literals, `.query()` for
  parameterised SQL.

## D6. Three-step single-page checkout
- **What:** Cart → Details & Payment → Review/Confirm all on one route with a
  stepper (matches the reference), vs separate pages.
- **Why:** Fewer round-trips, one order payload build, reference fidelity.
- **Impact:** `checkout/page.tsx` rewrite; builds `OrderPayload`, generates
  `orderId` `GG-2026-<5 digits>`, POSTs `/api/orders`, then redirects to
  `/checkout/success?order=<id>`. Success page reads the query param.
- **Lesson:** A single-source order model in `src/lib/schemas.ts` keeps the
  form (Zod) and API (route) from drifting.

## D7. Device-id cart/wishlist snapshot (no auth)
- **What:** Cart persists to `/api/cart` keyed by a stable device id: header
  `x-device-id`, backed by `localStorage["glow-grace-device-id"]`
  (`src/lib/device.ts`), synced debounced by `CartSync`.
- **Why:** Cross-tab/persistent cart without forcing login — matches a guest
  checkout flow.
- **Impact:** `gg_cart_snapshots` (device_id unique, items/wishlist jsonb).
  On the server side a same-device reload can restore.
- **Lesson:** Prefer a stable client id over fingerprinting; keep the server
  write idempotent (upsert on device_id).

## D8. Promo code GLOW10
- **What:** One hard-coded promo `GLOW10` = 10% off; applied in cart
  (`src/app/cart/page.tsx`).
- **Why:** Reference copy shows a promo field; a single code is enough for E2E
  and demo without a coupon engine.

## D9. Typed API layer (`src/lib/api.ts`)
- **What:** One `request<T>()` helper + typed wrappers (`createOrder`,
  `submitApplication`, `subscribeNewsletter`, `syncCartSnapshot`,
  `fetchCartSnapshot`) used by newsletter, checkout, apply, and CartSync.
- **Why:** Centralize fetch/error handling; make response contracts discoverable.
- **Impact:** Removed duplicated `fetch`/`res.json()` logic from 4 call sites.
- **Lesson:** Ship the API surface before wiring pages — it exposed the exact
  response shapes (e.g. `persisted`, `orderId`) the UI needed.

## D10. Data field reality vs reference (build-backed)
- **What:** Product uses `reviewsCount` (not `reviews`) / `inStock` (not
  `available`); `border-line-soft` needed a `line-soft` token rename.
- **Impact:** `fix f7faef4` resolved three hard build failures.
- **Lesson:** Field names are dictated by the mirrored data model — never
  guess; grep `src/lib/data.ts` before coding against a product/job shape.

## D11. Git push on this machine (GIT_ASKPASS poison)
- **What:** `git push` failed spawning a stale VSCode `GIT_ASKPASS` script
  (`vscode.git/askpass/**/askpass.sh`) combined with no credential helper.
- **Fix:** `git config --global credential.helper manager`;
  `Remove-Item Env:GIT_ASKPASS`; `$env:GIT_TERMINAL_PROMPT="0"`; then
  `git push -u origin main` (GCM pop-up, authorized as deepakambastha28).
- **Lesson:** Environment-inherited helpers (askpass) can break git regardless
  of remote state; credential.helper manager is the durable fix on Windows.

## D12. gh CLI setup on this machine
- **What:** `winget install GitHub.cli` failed with MSI 1603 (RegisterProduct/
  config) at default scope; `--scope user` succeeded
  (`%LOCALAPPDATA%\Microsoft\WinGet\Packages\GitHub.cli_...\bin\gh.exe`).
- **Auth:** GCM's OAuth token lacks `read:org` required by gh → use
  `gh auth login --web` device flow (user approves in browser), not
  `--with-token`. Scopes now gist/read:org/repo.
- **Lesson:** Non-elevated MSI installs on this box need `--scope user`; gh
  validates scopes at login, so reusing a git credential is not enough.

## D13. Trunk-based workflow + PR gate (user policy)
- **What:** `main` is the only long-lived branch. Work lands via a short-lived
  feature branch + PR. New branches are forbidden while any PR is open
  (`gh pr list --state open` gate first).
- **Why:** Keeps `main` deployable; PR descriptions force verification proof
  (build/lint/e2e results + manual steps).
- **Impact:** Documented in `.opencode/skills/github-workflow/SKILL.md`.
- **Lesson:** Cache the policy in a skill so enforcement is reproducible, and
  always re-check PR state before `git checkout -b`.

## D14. Playwright E2E strategy
- **What:** `@playwright/test` with a Chromium project; `test:e2e` (headless)
  and `test:e2e:ui` (`--ui` runner). `trace: on-first-retry`, 5s timeouts;
  `webServer` = `npm run build && npm run start` on :3000.
- **Why:** Full-fidelity checks (home, shop, cart, checkout, careers/apply,
  newsletter, auth) against the real built app; mirrors reference flows.
- **Impact:** Because of D3, E2E never needs a database.
- **Lesson:** Selectors via `data-testid` (see e2e-testing skill map); keep
  specs independent (clear localStorage per test context).

## D15. Vercel agentic best practices applied
- **What:** Deploy via Git import / `vercel --prod`; `DATABASE_URL` set in the
  dashboard; Next auto-detection; keep changes small and independently
  verifiable; use approvals for high-cost actions (e.g. changing env or DB).
- **Impact:** deploy story stays zero-config; secrets never in the repo.

## Environment reference
- Git: not on PATH (`C:\Program Files\Git\cmd`); prefix in every bash call.
- gh: `C:\Users\deepak\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin`.
- Node v24.20.0 (supports `--env-file`).
- Local `.env.local` holds LIVE Neon credentials (host `ep-aged-paper-b3xyuxjz`).
  Gitignored. Never commit, never echo the URL.