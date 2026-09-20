# Glow & Grace 🌸

**Lucknow's premium cosmetics store for women with beauty-parlour job placement.**

A production-ready Next.js 14 (App Router, TypeScript) eCommerce + beauty-career web app. Elegant feminine luxury design with rose/gold palette, serif headings, glass navbar, and soft rose shadows.

## Tech Stack

| Layer          | Technology                                             |
| -------------- | ------------------------------------------------------ |
| Framework      | Next.js 14 (App Router) + React 18 + TypeScript        |
| Styling        | Tailwind CSS + custom design tokens (rose/gold/blush)  |
| UI Kit         | shadcn/ui primitives (Button, Input, Tabs, Select...)  |
| Icons          | lucide-react                                           |
| State          | Zustand (cart + wishlist, persisted to localStorage)   |
| Persistence    | Neon Postgres (`@neondatabase/serverless`) + typed API layer |
| Forms          | React Hook Form + Zod                                  |
| Fonts          | Playfair Display (headings) + Inter (body) via next/font |
| Animation      | Framer Motion                                          |
| Toasts         | sonner                                                 |
| E2E            | Playwright (@playwright/test) — headed/serial suite + UI runner |

## Pages

- **`/`** — Hero (+ rotating DB-backed product circle), stats, trust badges, categories, bestsellers, job vacancies, CTA banner, testimonials, newsletter, footer
- **`/admin`** — Authenticated admin console (dashboard + products/jobs/events/partners/candidates/users with create / edit / hide / hold / delete, plus review moderation). Signed-in sessions (15-min expiry) gate the sidebar; `/admin` hides storefront chrome. Admins get an **Admin menu in the storefront top nav** once signed in.
- **`/admin/pages`** — "Pages" sidebar group. `/admin/pages/home` is the **Home page manager**: edit storefront home copy (hero eyebrow/headline/highlight, stats, trust bar, section headings/descriptions, CTA buttons, testimonials heading), upload up to 5 hero circle images (rotating slideshow, 380 × 380 px — falls back to product slides when empty), and manage each section independently — show/hide, delete/restore, and reorder — saved via `PUT /api/admin/home-config` into `gg_admin_home_config`. `/admin/pages/shop` is the **Shop page manager**: upload up to 5 banner images (rotating slideshow, title/subtitle), edit the page heading, add/remove custom category chips (falls back to auto-detected product categories when empty), and show/hide/delete/reorder the banner, heading, and category chips — saved via `PUT /api/admin/shop-config` into `gg_admin_shop_config`. Career / Partner / Event / Contact pages are placeholder shells for upcoming work.
- **`/admin/partners`** — 2-column partner form (Basic+Stats fields, Salon Gallery with cover/tile upload, Services chips, Packages manager) with a sticky **Live Preview** that mirrors the storefront card (cover photo, service chips, stats, gallery thumbs, packages).
- **`/admin/users`** — User-account management across every role (`user` / `candidate` / `recruiter` / `admin`): search + role/status filters, create accounts, activate/suspend, reset passwords, and delete. The seeded `admin@glowngrace.in` account is **protected** — it cannot be suspended, deleted, or have its password reset from the UI or API.
- **`/recruiter`** — Role-gated recruiter portal with a single top-nav (Home, Shop, Candidates, Careers, Events). Browse & hire candidates (`/recruiter/candidates`), manage job openings (`/recruiter/jobs`), update profile (`/recruiter/profile`), and publish workshops to the storefront event calendar (`/recruiter/events`). Recruiters sign in with the `recruiter` account type; logout always returns to the home page. Recruiters get a **Recruiter menu in the storefront top nav** once signed in.
- **`/recruiter/profile`** — Recruiter profile mirrors the admin partner form: a 2-column layout (`1.7fr/1fr`) with all sections stacked on the left (Basic Information, About, Salon Gallery, Services Provided, Packages) and a sticky **Live Preview** sidebar with Save/Cancel. Gallery photos, service tags, and bio are persisted as JSONB on `gg_recruiters`; service packages live in `gg_recruiter_packages` and support single add or JSON/CSV bulk import.
- **Partner gallery & packages** (`/admin/partners` + storefront) — The admin partner form persists a **cover/tile image** plus additional gallery photos (`gallery` JSONB), selected/custom service tags, and priced package rows (`menu` JSONB, with duration/description/services and JSON/CSV import). Storefront `/partners` cards use the first uploaded image as the tile, and `/partners/[slug]` shows the hero photo, a `.gallery-grid` lightbox, and package listings with ₹ pricing — falling back to gradient + emoji tiles for partners without uploads.
- **Recruiter job review flow** (`/recruiter/jobs`) — Recruiters create, **edit**, and request a **hold** on vacancies. New and edited jobs are submitted as `Pending`; a hold request is submitted as `Pending Hold`. Each decision authorizes in the admin console (`/admin/jobs`): approving publishes (`Open`) or holds (`On Hold`), rejecting marks `Rejected` or keeps the job live — and only then does the change reflect on the website (`/careers`, `/api/jobs`).
- **`/products`** — Filter by category, sort by price/rating, live search. Catalog is **admin-DB driven** (`/api/products`), no static seed.
- **`/products/[slug]`** — Gallery + thumbnails, price + % saved, qty stepper, Add to Cart, features, delivery info, tabs (Description / Info / Reviews). **Tap a star** under the rating to open the rate-and-review popup (1–5 stars + comment); submissions start as **Pending** in `/admin/reviews` and only appear on the product once approved. Rating + review counts on the card and detail header are derived from approved reviews. Unknown slugs → custom 404.
- **`/cart`** — Editable quantity, remove, promo code (`GLOW10` for 10% off), summary (subtotal + free-shipping logic + 5% GST + total), empty state, DB-backed wishlist section.
- **`/checkout`** — 3-step wizard (Cart → Shipping & Payment → Confirmation) with live order summary; payment: Card / UPI / NetBanking / COD. Place Order clears the cart and shows order ID.
- **`/checkout/success`** — Order confirmation with `#GG-2026-XXXXX`
- **`/partners`** — Partner directory driven by admin DB (`/api/partners`), hidden on home when empty. Cards + detail pages render uploaded cover/gallery photos and priced packages.
- **`/partners/[slug]`** — Partner detail with hero cover photo, gallery grid + lightbox, service chips (with optional duration/description), ratings/stats, and a packages list with ₹ prices.
- **`/events`** — Admin-DB event tiles (created in `/admin/events`, exposed via `/api/events`), search + date/location filters, detail with gallery + lightbox, carousel banner
- **`/careers`** — Job cards (type, title, salon, location, salary, experience) driven by `/api/jobs` (admin DB)
- **`/careers/[slug]`** — Job header + tags, responsibilities, requirements, perks, sticky Apply box
- **`/careers/[slug]/apply`** — Validated application form with drag-drop PDF/DOC resume upload, T&C, success screen
- **`/shopper`** & **`/candidate`** — Role-based profiles with Edit Profile / orders / password / address / contact tabs
- **`/contact`** — Contact page with a **comment-only** review form (no star rating); submissions land in `/admin/reviews` as **Pending** for moderation
- **`/login`**, **`/signup`** — Zod-validated auth with `shopper` / `candidate` / `admin` / `recruiter` account-type selector and demo credentials. Sign-in also checks server-side accounts (`gg_users`): suspended accounts are blocked, wrong passwords are rejected, and `admin`-role server accounts skip client-only auth.

## Getting Started

> Full local setup, prerequisites, and gotchas: **[ONBOARDING.md](./ONBOARDING.md)**.

```bash
# 1. Install dependencies (+ Playwright browser)
npm install
npx playwright install chromium

# 2. Create env (persistence requires a Neon DATABASE_URL — see ONBOARDING.md)
cp .env.example .env.local

# 3. Run development server
npm run dev
# → http://localhost:3000

# 4. Production build + verify
npm run build && npm start
npm run lint
npm run test:e2e        # Playwright E2E (headed, serial) against BASE_URL
npm run test:e2e:ui     # Playwright UI mode (watch + debug)
```

### Local development database (Docker) — optional

Instead of dev/testing against the live Neon database, run the app against a
disposable Docker-Postgres that mirrors the Neon schema:

```bash
npm run db:up          # start the local Postgres container (port 5433)
npm run start:local    # start the container + the dev server together
npm run db:down        # stop it (data persists in the gg-local-pgdata volume)
npm run db:reset       # stop + wipe the volume, start fresh
```

Enable it with `USE_LOCAL_DB=true` in `.env.local` (see `.env.example`). While
on, **every app read/write goes to the local Docker database** (`localhost:5433`,
`pg` driver) — Neon is never queried by the app on its own. `DATABASE_URL`
stays set to the Neon URL as the sync source. From the admin dashboard, the
  **"Sync from Neon → Local"** button snapshots the whole `gg_%` database down
  into the local one (read-only on Neon: one metadata query + one SELECT per
  table; explicit admin action only). If Neon is unreachable (e.g. plan quota
  exceeded) the button disables with a note instead of failing.
  `/api/health` reports `mode: "local"`.
  Compose file: `local-dev/docker-compose.yml`; helper: `scripts/local-db.mjs`.

Run settings (in `playwright.config.ts`): headed Chromium, serial (`workers: 1`),
`retries: 2`, action/navigation/expectation timeouts 30s, trace on first retry.

## Deploy to Vercel (zero config)

1. Push this repo to GitHub:
   ```bash
   git init
   git add .
   git commit -m "init: glow & grace store"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Vercel auto-detects Next.js — framework preset, build `next build`, output default. No `vercel.json` needed.
4. Click **Deploy**. Done. ✨

Alternatively use the CLI: `npm i -g vercel && vercel` (then `vercel --prod`).

## Design System

| Token     | Hex       | Usage                      |
| --------- | --------- | -------------------------- |
| rose      | `#d6336c` | Primary brand, buttons     |
| rose-soft | `#f4a6c0` | Accents, gradients         |
| blush     | `#fff5f7` | Section backgrounds        |
| gold      | `#c9a35b` | Ratings, premium accents   |
| charcoal  | `#2b2330` | Body text, footer          |
| cream     | `#fffafc` | App background             |
| emerald   | `#2e9e6b` | Success states             |

### Ecommerce Notes

- **Catalog source:** products, partners, events, and jobs on the storefront come
  **only from the admin database** (`gg_admin_products`, `gg_admin_partners`,
  `gg_admin_events`, `gg_admin_jobs`) via `/api/products`, `/api/partners`,
  `/api/events`, and `/api/jobs` — there is no static fallback. `hidden`/`hold`
  records are excluded from the storefront.
- **Home page content:** the storefront home page is server-rendered from the
  admin home configuration (`/api/home-config` → `gg_admin_home_config`, single
  row `id = 1`): hero copy/stats/trust bar, each section's
  eyebrow/heading/description, CTA text/links, testimonials heading, up to 5
  uploaded hero circle images (rotating slideshow, 380 × 380 px — product
  slides render when empty), and per-section visibility + ordering, merged over
  `DEFAULT_HOME_CONFIG` in `src/lib/home-config.ts`. The route is
  `force-dynamic`, so `/admin/pages/home` edits publish immediately.
- **Loading indicator:** `src/components/preloader.tsx` renders the animated
  spinner from `src/images/loader-animated.gif` with a label, used inline in
  async loading states at the component level across the app (admin shell,
  home/shop page editors, candidate page, shopper orders, recruiter
  profile/jobs). There is no page-level route loader.
- **Shop page content:** the storefront shop page (`/products`) is
  config-driven from the admin shop configuration (`/api/shop-config` →
  `gg_admin_shop_config`, single row `id = 1`): an optional banner (up to 5
  uploaded images, shown as a rotating slideshow + title/subtitle), the page
  heading (eyebrow/title/description — `{{count}}` renders the live product
  count), and category chips (admin-managed list, or auto-detected from
  products when empty), each with per-section visibility + ordering, merged
  over `DEFAULT_SHOP_CONFIG` in `src/lib/shop-config.ts`. The breadcrumb,
  search/sort toolbar, product grid, and top menu are not configurable. The
  route is `force-dynamic`, so `/admin/pages/shop` edits publish immediately.
- **Totals:** `total = subtotal + 5% GST + shipping (FREE over ₹999) − promo`
- **Cart/wishlist:** persisted to `localStorage` (Zustand `persist` middleware);
  the cart-page wishlist resolves product details from `/api/products`
- **Buy Now:** adds item → redirects to `/checkout`
- **Place Order:** validates form → generates `#GG-2026-XXXXX` → clears cart → success
- **Promo code:** `GLOW10`

## Project Structure

```
src/
├── app/                      # App Router routes + metadata
│   ├── layout.tsx            # Fonts, metadata/SEO, Navbar/Footer/Toaster
│   ├── globals.css           # Design tokens + component classes
│   ├── page.tsx              # Home
│   ├── admin/                # Admin console (dashboard + products/jobs/events/partners/candidates/users)
│   ├── recruiter/            # Recruiter portal (dashboard, candidates, jobs, profile, events)
│   ├── products/             # List + [slug] detail (DB-driven storefront)
│   ├── cart/ checkout/       # Cart + 3-step checkout wizard + success
│   ├── careers/              # List, [slug], [slug]/apply
│   ├── partners/ events/     # Partner directory + event gallery
│   ├── shopper/ candidate/   # Role-based account profiles
│   ├── login/ signup/
│   ├── api/                  # Route handlers (storefront + admin CRUD + recruiter APIs)
│   └── not-found.tsx
├── components/
│   ├── layout/               # navbar, footer, logo
│   ├── home/                 # hero, hero circle, bestsellers, partner preview, CTAs
│   ├── shop/                 # product-card
│   ├── admin/                # product/job/event/partner forms + admin-guard
│   ├── partners/ ui/         # partner-card + shadcn/ui primitives
└── lib/
    ├── data.ts               # home static content (testimonials); NOT storefront products/partners/events/jobs
    ├── store.ts              # Zustand cart + wishlist store
    ├── schemas.ts            # Zod schemas (checkout, apply, auth, admin records)
    └── utils.ts              # cn, formatPrice, discount helpers
```

## Persistence

- Neon Postgres via `src/lib/db.ts` (graceful no-op when `DATABASE_URL` is
  unset). When `USE_LOCAL_DB=true` the same layer targets the Docker-Postgres
  from `local-dev/docker-compose.yml` using the `pg` driver instead — see the
  local dev section above.
- Admin tables: `gg_admin_products`, `gg_admin_jobs`, `gg_admin_events`,
  `gg_admin_partners`, `gg_admin_candidates`, `gg_admin_reviews`,
  `gg_admin_sessions`, `gg_admin_home_config`, `gg_admin_shop_config`, `gg_users`.
  `/api/products`, `/api/partners`, `/api/events`, and `/api/jobs` expose
  non-hidden rows to the storefront with `admin-`-prefixed ids.
- Home configuration: `gg_admin_home_config` (single row, `id = 1`) stores the
  storefront home page JSONB config, written by `PUT /api/admin/home-config`
  from `/admin/pages/home` and served to the storefront by `/api/home-config`.
  When the row is absent the app falls back to the defaults in
  `src/lib/home-config.ts`.
- Shop configuration: `gg_admin_shop_config` (single row, `id = 1`) stores the
  storefront shop page JSONB config (banner image data-URL + title/subtitle,
  heading copy, per-section visibility/ordering), written by
  `PUT /api/admin/shop-config` from `/admin/pages/shop` and served to the
  storefront by `/api/shop-config`. When the row is absent the app falls back
  to the defaults in `src/lib/shop-config.ts`.
- User accounts: `gg_users` rows are created/updated/deleted via
  `/api/admin/users` (admin console) and `/api/users/register` (storefront
  signup, best-effort); passwords are stored as salted scrypt hashes
  (`scrypt$<salt>$<hash>` via `src/lib/users.ts`). `/api/users/login` validates
  a storefront sign-in against the DB after the client-side check — blocking
  suspended accounts and rejecting wrong passwords. The `admin@glowngrace.in`
  seed account is protected from suspend/delete/password-reset.
- Reviews: submitted from the product page (star popup) and the `/contact`
  page land in `gg_admin_reviews` with status `Pending`; the admin console
  approves/hides them (`PATCH /api/admin/reviews`), and only `Approved` rows
  surface on product pages, `/api/products` aggregates, and home testimonials.
- Recruiter tables: `gg_recruiters` (with JSONB `gallery`/`services`),
  `gg_recruiter_hires`, and `gg_recruiter_packages` (service packages created
  from `/recruiter/profile`). `/api/recruiters`,
  `/api/recruiters/candidates`, `/api/recruiters/hire`, `/api/recruiters/hired`,
  and `/api/recruiters/packages` back the portal. Recruiters publish events into `gg_admin_events`, so they
  appear on the storefront.
- Partner media & packages: `gg_admin_partners.gallery` (JSONB array of
  data-URL images; index 0 doubles as the cover/tile) and `gg_admin_partners.menu`
  (JSONB array of `{ name, price, duration, description, services }`) are
  written by `/api/admin/partners` and mapped to `images`/packages by
  `/api/partners` for the storefront. A separate `banner_image` (TEXT, data
  URL) stores the wide detail-page banner (~1920×460 recommended) and is
  surfaced as `bannerImage` on the storefront — the banner slider uses only
  this image, never gallery photos.
- Recruiter job lifecycle: vacancies live in `gg_admin_jobs` with a review
  status — `Pending` (new/edited, awaiting approval), `Open` (live),
  `On Hold`, `Rejected`, and `Pending Hold` (hold request awaiting a decision).
  Editing from `/recruiter/jobs` reverts a job to `Pending`; the recruiter
  "Hold" action submits a `Pending Hold` request. In `/admin/jobs` the admin
  accepts, holds, or rejects, and row details offer **Approve Hold** / **Reject
  Hold** for hold requests. Only `Open` rows that are not `hidden` surface on
  the storefront (`/api/jobs`); everything else (including `Pending` and
  `Pending Hold`) is hidden until reviewed.
- API reads that must reflect DB changes immediately (e.g. `/api/products`,
  `/api/events`, `/api/recruiters/candidates`) call `noStore()` from
  `next/cache` so their response is never baked into the build.
- E2E specs seed admin records through `tests/helpers.ts`
  (`seedProduct` / `deleteSeededProduct`, `seedEvent` / `deleteSeededEvent`,
  `seedJob` / `deleteSeededJob`, `seedReview` / `deleteSeededReview`, plus the
  `waitForAdminReview` polling helper that tolerates Neon read-after-write lag)
  so the storefront is exercised against real data. `tests/partner-admin-form.spec.ts`
  covers the admin partner add/edit form end-to-end (cover + gallery upload,
  service chips, packages, storefront rendering); `tests/recruiter.spec.ts`
  covers the recruiter profile gallery/services/packages managers.
  The suite runs serially (`workers: 1`) because every spec shares one Neon DB.
- Test cleanup is **test-record-only**: helpers and specs only delete rows whose
  name/slug/email matches the `E2E`/`e2e` convention (seeded helpers throw on
  any other record). Every delete first re-reads the admin list from the DB to
  resolve the row by id, so cleanup always stays in sync and never touches
  production/real records.