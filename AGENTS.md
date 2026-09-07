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

## Secrets / env
- `.env.local` holds LIVE Neon Postgres credentials — **never commit it,
  never echo the DATABASE_URL value**, never put the URL in output.
- `.env` and `.env*.local` are gitignored. `exNEXT_PUBLIC_APP_URL` etc. in
  `.env.example` are safe to reference.

## Architecture
- Styling: Tailwind 3 + custom tokens/classes in `src/app/globals.css`
  (```.btn```, ```.field-*```, ```.card```, ```.topbar```, ```.breadcrumb```).
- State: Zustand (`src/lib/store.ts`), persisted to localStorage
  `glow-grace-cart` / `glow-grace-device-id`.
- Persistence: Neon via `src/lib/db.ts` (```db.query(text, params)``` — NEVER
  `db(text,...)`, first arg is a `TemplateStringsArray`). Graceful no-op when
  `DATABASE_URL` unset; responses carry `persisted/applied/subscribed` booleans.
- API client: `src/lib/api.ts` (typed wrappers over a shared `request<T>()`).
  Business components call THIS, not bare `fetch`.
- Schemas: `src/lib/schemas.ts` (Zod) — checkout, order payload, application,
  newsletter, auth forms.
- Data: `src/lib/data.ts` — products have `reviewsCount` (not `reviews`) and
  `inStock` (not `available`). Grep it before coding against a shape.

## Conventions
- Commit style (used on main): lowercase type + summary —
  `chore:`, `feat:`, `style:`, `fix:`, `docs:`. Stage-wise: one cohesion/commit.
- No code comments unless asked; mirror existing style.
- `data-testid` hooks exist for E2E; prefer them over text/CSS selectors.
- **Always follow TDD (user-mandated):** write a failing test first (typically a
  Playwright E2E in `tests/`), run it to confirm it fails, then make it pass
  with the minimal implementation. Never implement behavior before its test.

## Verification (always before shipping)
- `npm run lint`
- `npm run build`
- `npm run test:e2e` (headless) after a server is available
- Headed `npm run test:e2e:ui` with the user for UI review.

## Git workflow policy (user-mandated)
- Trunk-based. `main` is the only long-lived branch; work lands via a short
  branch + PR.
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
