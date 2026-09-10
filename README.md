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
| E2E            | Playwright (@playwright/test) — headless + UI runner   |

## Pages

- **`/`** — Hero (+ rotating DB-backed product circle), stats, trust badges, categories, bestsellers, job vacancies, CTA banner, testimonials, newsletter, footer
- **`/admin`** — Authenticated admin console (dashboard + products/jobs/partners/candidates with create / edit / hide / hold / delete). Signed-in sessions gate the sidebar; `/admin` hides storefront chrome.
- **`/products`** — Filter by category, sort by price/rating, live search. Catalog is **admin-DB driven** (`/api/products`), no static seed.
- **`/products/[slug]`** — Gallery + thumbnails, price + % saved, qty stepper, Add to Cart, features, delivery info, tabs (Description / Info / Reviews). Unknown slugs → custom 404.
- **`/cart`** — Editable quantity, remove, promo code (`GLOW10` for 10% off), summary (subtotal + free-shipping logic + 5% GST + total), empty state, DB-backed wishlist section.
- **`/checkout`** — 3-step wizard (Cart → Shipping & Payment → Confirmation) with live order summary; payment: Card / UPI / NetBanking / COD. Place Order clears the cart and shows order ID.
- **`/checkout/success`** — Order confirmation with `#GG-2026-XXXXX`
- **`/partners`** — Partner directory driven by admin DB (`/api/partners`), hidden on home when empty
- **`/events`** — Static event tiles, filters, detail with gallery + lightbox, carousel banner
- **`/careers`** — Job cards (type, title, salon, location, salary, experience)
- **`/careers/[slug]`** — Job header + tags, responsibilities, requirements, perks, sticky Apply box
- **`/careers/[slug]/apply`** — Validated application form with drag-drop PDF/DOC resume upload, T&C, success screen
- **`/shopper`** & **`/candidate`** — Role-based profiles with Edit Profile / orders / password / address / contact tabs
- **`/login`**, **`/signup`** — Zod-validated auth with `shopper` / `candidate` / `admin` account-type selector

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
npm run test:e2e        # headless Playwright
npm run test:e2e:ui     # headed UI runner
```

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

- **Catalog source:** products and partners on the storefront come **only from the
  admin database** (`gg_admin_products`, `gg_admin_partners`) via `/api/products`
  and `/api/partners` — there is no static fallback. `hidden`/`hold` products are
  excluded from the storefront.
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
│   ├── admin/                # Admin console (dashboard + products/jobs/partners/candidates)
│   ├── products/             # List + [slug] detail (DB-driven storefront)
│   ├── cart/ checkout/       # Cart + 3-step checkout wizard + success
│   ├── careers/              # List, [slug], [slug]/apply
│   ├── partners/ events/     # Partner directory + event gallery
│   ├── shopper/ candidate/   # Role-based account profiles
│   ├── login/ signup/
│   ├── api/                  # Route handlers (products/partners storefront + admin CRUD)
│   └── not-found.tsx
├── components/
│   ├── layout/               # navbar, footer, logo
│   ├── home/                 # hero, hero circle, bestsellers, partner preview, CTAs
│   ├── shop/                 # product-card
│   ├── admin/                # product/job/partner forms + admin-guard
│   ├── partners/ ui/         # partner-card + shadcn/ui primitives
└── lib/
    ├── data.ts               # static content (jobs, testimonials, events); NOT storefront products/partners
    ├── store.ts              # Zustand cart + wishlist store
    ├── schemas.ts            # Zod schemas (checkout, apply, auth, admin records)
    └── utils.ts              # cn, formatPrice, discount helpers
```

## Persistence

- Neon Postgres via `src/lib/db.ts` (graceful no-op when `DATABASE_URL` is unset).
- Admin tables: `gg_admin_products`, `gg_admin_jobs`, `gg_admin_partners`,
  `gg_admin_candidates`, `gg_admin_reviews`. `/api/products` and `/api/partners`
  expose non-hidden rows to the storefront with `admin-`-prefixed ids.
- E2E specs seed admin records through `tests/helpers.ts`
  (`seedProduct` / `deleteSeededProduct`) so the catalog is exercised against real data.