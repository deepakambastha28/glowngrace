# Glow & Grace — Work Todos

Living task tracker for the rebuild project. Update in real time; mark done
only when verified (not on intent).

## Status legend
- [ ] pending
- [x] done (verified)

## Phase 1 — Foundations (done on `main`)
- [x] Next.js 14 App Router + TypeScript + Tailwind scaffold
- [x] Design tokens (rose/gold/blush), pill component classes, fonts
- [x] Reference data (_products_, _jobs_, _testimonials_, _reviews_) mirroring
      `design/glow-grace-full.html`
- [x] Neon Postgres layer (`src/lib/db.ts`, `db/schema.sql`) with graceful
      no-op when `DATABASE_URL` is unset
- [x] API routes: `/api/health`, `/api/orders`, `/api/newsletter`,
      `/api/applications`, `/api/cart`
- [x] Typed API client layer (`src/lib/api.ts`) used by newsletter, checkout,
      apply, CartSync
- [x] Layout (topbar, navbar, footer, logo, toaster)
- [x] Homepage sections + CTA + testimonials
- [x] Shop list + product detail + product-card
- [x] Cart (qty steppers, promo GLOW10) + Zustand persisted store
- [x] 3-step single-page checkout + success page
- [x] Careers list + detail + apply form (wired to API)
- [x] Login / Signup stubs (Zod + toasts)
- [x] 404 page
- [x] Global build + lint green on `main`

## Phase 2 — Tooling, docs, E2E (this branch)
- [x] gh CLI installed (`--scope user`) + authenticated (`gh auth status` ✓)
- [x] `.opencode/skills/github-workflow/SKILL.md`
- [x] `.opencode/skills/postgres-testing/SKILL.md`
- [x] `.opencode/skills/e2e-testing/SKILL.md` (existed)
- [x] `.agents/decision-log.md`
- [x] `.agents/todos.md` (this file)
- [x] `.agents/handoff.md`
- [ ] `AGENTS.md` (project agent instructions)
- [x] `README.md` phase-1 rewrite (already staged modified)
- [ ] `ONBOARDING.md` — local dev getting-started guide
- [ ] `design/README.md` — design source docs
- [ ] `playwright.config.ts` + `tests/*.spec.ts` (home, shop, product, cart,
      checkout, careers/apply, newsletter, auth)
- [ ] `npx playwright install chromium`
- [ ] Headless `npm run test:e2e` green
- [ ] Headed `npm run test:e2e:ui` reviewed with user

## Phase 3 — Ship
- [ ] Branch from `main` (no open PRs — verified `gh pr list` empty)
- [ ] Stage-wise commits + push branch
- [ ] PR created via `gh` with full description + verification proof
- [ ] Merge approved by user; then continue only after PR merged

## Blocked / Watch
- None. Build + lint pass. Neon live via `.env.local` (gitignored).
