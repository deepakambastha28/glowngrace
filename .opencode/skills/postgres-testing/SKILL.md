---
name: postgres-testing
description: Use when verifying the Glow & Grace Neon Postgres-backed flows — health/orders/newsletter/applications/cart API routes, schema, or seeded rows. Covers the /api/health check, graceful no-op behavior when DATABASE_URL is unset, table/column inventory, and SQL snippets to confirm rows landed. Use AFTER creating data through the UI or API, never to test plain component logic.
---

# Postgres Testing (Glow & Grace)

The app persists through `src/lib/db.ts` with two backends:

- **Cloud (default, `USE_LOCAL_DB != "true"`)** — Neon Postgres via
  `@neondatabase/serverless` over `DATABASE_URL`.
- **Local (`USE_LOCAL_DB=true` in `.env.local`)** — Docker-Postgres from
  `local-dev/docker-compose.yml` via the `pg` driver. Managed with
  `npm run db:up` / `db:down` / `db:reset` (`scripts/local-db.mjs`); inspected
  with `npm run db:ps` / `db:logs`. The app NEVER queries Neon on its own in
  this mode — Neon is read only by the explicit admin "Sync from Neon" action.

Everything degrades gracefully: when no DB is configured, the DB layer returns
null and API routes still answer `200` (no-op), so UI and E2E never depend on a
live database.

Local `.env.local` has REAL live Neon credentials — it is gitignored, never
commit it, never print the DATABASE_URL value in command output.

## When a database is expected

- Build is green and `npm run start` (or `dev`) is running → DATABASE_URL is
  set from `.env.local`.
- API routes: `/api/orders`, `/api/newsletter`, `/api/applications`,
  `/api/cart`, `/api/health`, plus the storefront catalog routes
  (`/api/products`, `/api/partners`, `/api/events`, `/api/jobs`) and the admin
  CRUD routes (`/api/admin/*`).

## Health check first

Start the app (`npm run build && npm run start` in one shell, or `npm run dev`),
then hit the health route with Invoke-RestMethod and confirm `database` is
`connected`:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Expected (cloud): `{"status":"ok","database":"connected","mode":"cloud","message":"Neon Postgres connected."}`
Expected (local): `{"status":"ok","database":"connected","mode":"local","message":"Local Docker Postgres connected."}`

`database: "disabled"` means no backend is configured (env not loaded /
`.env.local` missing) — not a code bug. `database: "error"` means the URL is
set but a `SELECT 1` failed (network, engine down, revoked/dropped). In local
mode that usually means the container is down — start it with `npm run db:up`
(the compose file adds a `pg_isready` healthcheck; `npm run db:ps` shows state).

## Local DB mode extra checks

- `GET /api/admin/sync` preflights the dashboard button:
  `{"local": true, "sourceConfigured": true, "sourceAvailable": true}` when
  local mode is on, `DATABASE_URL` (Neon source) is present, and Neon answers
  a `SELECT 1`. `sourceAvailable: false` (Neon down, e.g. quota exceeded)
  disables the button with a `sync-source-unavailable` note.
- `POST /api/admin/sync` (admin session required) snapshots every `gg_%` table
  from Neon into the local DB: `{"synced": true, "tables", "rows", "summary"}`.
  Read-only on Neon (one metadata query + one SELECT per table), replaces local
  rows in one transaction, excludes `gg_admin_sessions` (admin stays logged
  in). The E2E for this is `tests/local-db-sync.spec.ts` (skips in cloud mode).

## Schema (auto-created idempotently on first write)

Tables created with `CREATE TABLE IF NOT EXISTS` in `src/lib/db.ts`
(`SCHEMA_STATEMENTS`) and mirrored in `db/schema.sql`:

| Table | Key fields |
|---|---|
| `gg_orders` | order_id (unique), customer_name, email, phone, address(jsonb), items(jsonb), subtotal, gst, shipping, total, delivery_option, payment_method |
| `gg_job_applications` | job_slug, job_title, full_name, phone, email, city, experience, specialization, qualification, cover_note, resume_name |
| `gg_newsletter_subscribers` | email (unique) |
| `gg_cart_snapshots` | device_id (unique), items(jsonb), wishlist(jsonb) |
| `gg_admin_products` | slug (unique), brand, name, price, stock, feature/jsonb, tags/jsonb, is_new, hidden |
| `gg_admin_jobs` | slug (unique), title, salon, location, type, salary_text, requirements(jsonb), status, hidden |
| `gg_admin_events` | slug (unique), title, category, date, time, loc, venue, price, capacity, spots_left, agenda(jsonb), tags(jsonb), hidden |
| `gg_admin_partners` | slug (unique), name, type, loc, rating, reviews, tags(jsonb), status |
| `gg_admin_candidates` | user_email, full_name, phone, email, skills(jsonb), gallery(jsonb), status |
| `gg_admin_reviews` | author, product, rating, comment, status |
| `gg_admin_home_config` | id (single row, 1), config(jsonb), updated_at |
| `gg_admin_sessions` | token (unique), email |

## Verifying rows after creating data

Create data through the UI/API first (checkout, apply form, newsletter, cart
sync). Then confirm rows with exact-read, parameterised queries. The project's
own `query()` helper in `src/lib/db.ts` uses `db.query(text, params)` — for a
raw one-off check, run the exact same driver directly (Node 20.6+ has
`--env-file`, no extra tools needed):

```powershell
node --env-file=.env.local -e "import('@neondatabase/serverless').then(async({neon})=>{const db=neon(process.env.DATABASE_URL);const r=await db.query('SELECT COUNT(*)::int AS n FROM gg_orders');console.log(JSON.stringify(r));}).catch(e=>{console.error(e.message);process.exit(1);})"
```

In **local mode** use the `pg` driver against the compose container instead
(never query Neon directly for a write-path check — reads are OK, it just won't
show local-mode writes):

```powershell
node --env-file=.env.local -e "import('pg').then(async({Pool})=>{const p=new Pool({connectionString:process.env.USE_LOCAL_DB==='true'?(process.env.LOCAL_DB_URL||'postgres://gg:gg@localhost:5433/glowngrace'):process.env.DATABASE_URL});const r=await p.query('SELECT COUNT(*)::int AS n FROM gg_orders');console.log(JSON.stringify(r.rows));await p.end();}).catch(e=>{console.error(e.message);process.exit(1);})"
```

Label-specific checks (replace table/key with the flow under test):

- Order placed → `SELECT order_id, total, created_at FROM gg_orders ORDER BY created_at DESC LIMIT 1;`
- Job applied → `SELECT job_slug, job_title, full_name FROM gg_job_applications ORDER BY created_at DESC LIMIT 1;`
- Newsletter same email twice → should NOT add a duplicate (`email` is UNIQUE).
- Cart → `SELECT device_id, items FROM gg_cart_snapshots;`

The `SQL` string must be a single statement list of params; the driver is the
parameterised neon `.query(text, params)` form (NEVER `db(text,...)` — its
first argument is a `TemplateStringsArray`, not a string).

## Common failure modes

- "Crypto is not defined" / connection error → the URL is invalid or network
  is blocked; verify against `/api/health`.
- Rows missing → schema just auto-created on first write; the POST happened
  before the store existed, or the POST returned `persisted: false` (no DB).
- `DATABASE_URL` present but stale creds (e.g. Neon branch reset) → health
  returns `error`; rotate/replace the URL in `.env.local` and Vercel env vars.
- Endpoint answers `200` even when nothing was saved — that is by design
  (graceful no-op); the JSON body carries `persisted/applied/subscribed: false`.

## Do not

- Do not re-create tables or run DDL by hand on the live Neon DB.
- Do not SELECT or dump full URLs, passwords, or tokens.
- Keep verification commands read-only (SELECT / COUNT).