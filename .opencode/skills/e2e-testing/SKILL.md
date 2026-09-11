---
name: e2e-testing
description: Use when writing or running Playwright end-to-end tests for the Glow & Grace storefront, in headless or headed (UI) mode. Covers the test setup, the webServer bootstrap, per-page data-testid selectors, and the exact npm commands to run and debug.
---

# Playwright E2E Testing (Glow & Grace)

The project uses `@playwright/test` with a single Chromium project. Tests live in
`tests/` and run against `BASE_URL`.

## Setup (already in place)

- Deps: `@playwright/test` (devDependency) in `package.json`.
- Scripts: `npm run test:e2e` (headed, serial) and `npm run test:e2e:ui`
  (headed UI mode).
- `playwright.config.ts`: single Chromium project, **headed by default**,
  `workers: 1` (every spec mutates the same Neon DB, so parallel runs would
  interfere), `trace: "on-first-retry"`, screenshots on, 15s action / 30s
  expectation timeouts. There is **no `webServer`** — the base URL comes from
  the `BASE_URL` env var and defaults to `https://glowngrace-dev.vercel.app`.
- Browsers: run `npx playwright install chromium` once on a fresh machine. On
  Windows this installs to `%USERPROFILE%\AppData\Local\ms-playwright`.

## Running

```bash
npx playwright install chromium   # one-time browser install
npm run test:e2e                  # full suite (headed, serial) — set BASE_URL first
npm run test:e2e:ui               # headed UI mode — watch the browser
npx playwright test tests/home.spec.ts            # single file
npx playwright test --reporter=list               # verbose failure output
npx playwright show-report                        # open the HTML report
```

Because the base URL defaults to the **deployed** `glowngrace-dev.vercel.app`,
to test your own working tree run it against a local production build:

```bash
npm run build && npm run start     # serve on http://localhost:3000
$env:BASE_URL="http://localhost:3000"; npm run test:e2e
```

Headed mode pops up real Chromium windows while the suite runs — that run IS the
UI pass, so interactive repair is usually unnecessary.

## DB-only storefront (important!)

- The storefront catalog comes **only from the admin DB**. `/api/products`,
  `/api/partners`, `/api/events`, and `/api/jobs` return `{ items: [...] }` and
  never merge static data from `src/lib/data.ts`. Old static slugs like
  `luxe-liquid-lipstick` **404** now.
- Home hero circle + Bestsellers + partner preview are client-fetched from those
  APIs, so the DOM needs a beat to hydrate/populate. Assert with
  `toBeVisible({ timeout: 30_000 })` after navigation; never count cards
  immediately after `goto` (the grid is client-side).
- To test storefront flows you must have admin records. Use the helpers in
  `tests/helpers.ts`: `seedProduct(request, name)` returns the created slug;
  add cleanup via `deleteSeededProduct(request, slug)` in `afterAll`/`afterEach`
  (keeps the DB tidy for repeated runs). The same helpers exist for events
  (`seedEvent` / `deleteSeededEvent`) and jobs (`seedJob` / `deleteSeededJob`).
  See `tests/storefront-db-only.spec.ts`, `tests/home.spec.ts`,
  `tests/events.spec.ts` and `tests/careers.spec.ts` for the pattern.
- Admin record specs self-clean the records they create (products/partners/candidates).
- The whole suite is serial (`workers: 1`) because the specs share one live Neon
  DB — never bump the worker count, left-over rows from a cancelled parallel run
  can break storefront specs (e.g. the partners preview on home).

## Selector conventions

The app exposes `data-testid` hooks. Prefer these over text/CSS because page copy
mirrors the reference design and changes.

- Nav/layout: `topbar`, `navbar`, `logo`, `cart-link`, `cart-count`
- Home: `hero-shop`, `hero-career`, `category-<name>` (e.g. `category-makeup`),
  `jobs-section`, `testimonials-section`, `newsletter`, `newsletter-email`,
  `newsletter-submit`, `cta-banner`, `hero-circle` (rotating product carousel),
  `hero-circle-product` (a slide; the active slide carries `data-active="true"`,
  each slide links to `/products/<slug>`; autoplay advances every ~3.5s and is
  paused on hover). `partners-preview-section` renders only when the DB has
  partners; the whole block is absent when empty.
- Shop: `product-card` (grid card, `data-product-id="admin-<N>"`),
  `product-card-image`, `wishlist-button`, `add-to-cart`, `product-search`,
  `product-sort`. Unknown product slugs render the custom 404 (`heading /404/`).
- Cart: `empty-cart`, `cart-item`, `cart-qty-plus`, `cart-qty-minus`, `cart-remove`,
  `promo-input`, `promo-apply`, `cart-subtotal`, `cart-total`, `cart-checkout`.
  Wishlist section on the cart page: `wishlist-item`, `wishlist-add-to-cart`
  (`In Cart`/`Add to Cart` states), `wishlist-remove`. The wishlist section is
  hidden when empty and renders on both the empty and populated cart views.
- Admin (`/admin`): **no storefront chrome** — `topbar`/`navbar` are hidden on
  `/admin` (see `storefront-gate`); footer is also hidden there. Login inputs by
  label `Email Address` / `Password` (use `{ exact: true }` — the toggle button
  also contains "Password"). Dashboard renders at `/admin` once the session
  cookie is set; sidebar gated by session (`admin-sidebar` testid present only
  when authed). Demo creds: `admin@glowngrace.in` / `admin123`. Login/logout
  force a full-page reload so layout and page stay in sync. Record CRUD lives on
  list pages (products/jobs/partners/candidates) with rows + Edit / Hide / Hold /
  Delete controls; add flows are reached from each combined list page ("Add
  Product/Job/Partner"). Form save buttons: "Save Product", "Save Job",
  "Save Partner" (candidate edit uses "Save Changes"). `tests/admin-actions.spec.ts`
  covers the full product/job/partner/candidate lifecycle. Events CRUD lives on
  `/admin/events` (list with rows + Edit / Hide / Delete, "Add Event" →
  `/admin/events/new`, form save button "Save Event"); event visibility
  (`hidden`) drives the storefront `/api/events`, so a hidden event drops off
  `/events`. `tests/events.spec.ts` seeds events through the API.
- Checkout: `checkout-next`, `place-order`, `order-summary`, `order-confirmation`,
  `order-id`. **Gotcha:** on the cart-review step `checkout-next` advances
  without validating (fields mount on step 2); getByLabel on step-2 fields only
  after advancing.
- Careers: `job-grid`, `apply-now` (detail page), links `Apply Now` on the list,
  `apply-form`, `resume-input`, `submit-application`
- Events: `event-search`, `event-date-filter` (option label = month, e.g. "Sep 2026"),
  `event-loc-filter`, `event-clear`, `event-count`, `event-tile` (card → links to
  `/events/<slug>`), `event-date`, `event-loc` (on tile; contains "📍 <loc> · <time>"),
  detail page `event-gallery`, `event-photo` (gallery tiles — click opens the
  lightbox), `event-lightbox` (open when any `event-photo` clicked). Date labels
  use a deterministic `DD Mon YYYY` format ("Sun, 20 Sep 2026"), **not**
  `localeDateString` (locale `en-IN` yields "Sept", breaking label matches).
  Carousel banner on `/events` (below the breadcrumb, above the toolbar):
  `event-carousel` (container; hover pauses autoplay — hover in tests to keep
  the active slide stable), `event-slide` (4 slides, `data-active="true/false"`),
  `event-carousel-prev`, `event-carousel-next`, `event-carousel-dot`.
- Auth: `login-*` / `signup-*` fields (email/password inputs by label text)

**strict-mode gotcha:** `add-to-cart` / `wishlist-button` testids appear on
product CARDS too, so on a detail page they resolve to the main button PLUS the
related-product cards. On detail pages use
`getByRole("button", { name: "Add to Cart" })` (unique) or scope to
`.first()`. Native HTML5 validation blocks forms (`type="email"`) before Zod,
so drive validation tests with structurally-valid values that fail schema
rules (short password) rather than malformed emails.

## Order of operations when writing a new spec

1. Create `tests/<flow>.spec.ts` (e.g. `tests/checkout.spec.ts`).
2. Use `page.goto('/products')` plus relative paths — baseURL is set.
3. For cart/checkout flows, add products first:
   `await page.getByTestId('add-to-cart').first().click();`
4. Assert on `data-testid` + visible text (e.g. `expect(card).toHaveCount(8)`).
5. Keep specs independent — localStorage state (cart/wishlist) persists per
   page context, so clear it in `test.beforeEach` if needed.

## Gotchas seen in this project

- Cart badge (`cart-count`) only renders when itemCount > 0.
- Cart and checkout are client components backed by localStorage; reloading
  restores the cart from the persisted store.
- Newsletter + checkout + apply POST to Neon API routes which return `200`
  even when `DATABASE_URL` is unset (graceful no-op), so E2E never depends on a
  live database.
- The dev/prod server must compile before Playwright's ping succeeds — the
  `webServer` command already handles this via `npm run build && npm run start`.