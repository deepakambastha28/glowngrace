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

- **`/`** — Hero, stats, trust badges, categories, bestsellers, placement services, how it works, job vacancies, CTA banner, testimonials, newsletter, footer
- **`/products`** — Filter by category, sort by price/rating, live search
- **`/products/[slug]`** — Gallery + thumbnails, price + % saved, qty stepper, Add to Cart / Buy Now, features, delivery info, tabs (Description / Info / Reviews), related products
- **`/cart`** — Editable quantity, remove, promo code (`GLOW10` for 10% off), summary (subtotal + free-shipping logic + 5% GST + total), empty state
- **`/checkout`** — 3-step wizard (Contact → Shipping → Payment) with live order summary; shipping: Standard FREE / Express ₹49 / Same-Day ₹99; payment: Card / UPI / NetBanking / COD. Place Order clears the cart and shows order ID.
- **`/checkout/success`** — Spring check animation, order ID `#GG-2026-XXXXX`
- **`/careers`** — Job cards (type, title, salon, location, salary, experience)
- **`/careers/[slug]`** — Job header + tags, responsibilities, requirements, perks, sticky Apply box
- **`/careers/[slug]/apply`** — Validated application form with drag-drop PDF/DOC resume upload, T&C, success screen
- **`/login`**, **`/signup`** — Form stubs with Zod validation + toasts

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

- **Totals:** `total = subtotal + 5% GST + shipping (FREE over ₹999) − promo`
- **Cart/wishlist:** persisted to `localStorage` (Zustand `persist` middleware)
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
│   ├── products/             # List + [slug] detail
│   ├── cart/
│   ├── checkout/             # Wizard + success
│   ├── careers/              # List, [slug], [slug]/apply
│   ├── login/ signup/
│   └── not-found.tsx
├── components/
│   ├── layout/               # navbar, footer, logo
│   ├── home/                 # hero, sections, testimonials, CTAs
│   ├── shop/                 # product-card
│   └── ui/                   # shadcn/ui primitives + stepper + rating
└── lib/
    ├── data.ts               # 8 products + 4 jobs mock data
    ├── store.ts              # Zustand cart + wishlist store
    ├── schemas.ts            # Zod schemas (checkout, apply, auth)
    └── utils.ts              # cn, formatPrice, discount helpers
```