# Handoff — Glow & Grace

Quick-look state for the next session. Read `.agents/decision-log.md` for the
why behind every choice.

## What this is
A Next.js 14 (App Router, TS) eCommerce + beauty-career site for **Glow &
Grace** (Lucknow cosmetics + parlour job placement), faithfully rebuilt to
match `design/glow-grace-full.html`, persisted to Neon Postgres, deployable to
Vercel, with Playwright E2E and full skill/docs tooling.

## Where things stand
- **`main`** is clean and pushed. Build ✓ lint ✓. 16 static pages.
- **Uncommitted work in this session (goes on a feature branch, not main):**
  - `src/lib/api.ts` (typed API layer) + edits to checkout / apply / newsletter
    / cart-sync using it
  - `.opencode/skills/` (github-workflow, postgres-testing, e2e-testing)
  - `.agents/` (decision-log, todos, handoff)
  - `AGENTS.md`, `ONBOARDING.md`, `design/README.md` (to be written)
  - `README.md` (modified phase-1 doc)
  - `design/glow-grace-full.html` (source of truth, untracked)
  - `playwright.config.ts` + `tests/` (to be written)
- gh CLI installed + authenticated (`deepakambastha28`, scopes gist/read:org/repo).
- Git/gh NOT on PATH → prefix paths (see workflow skill); or use the stored
  credential.helper.

## Critical do-nots
1. **Never create a branch while any PR is open.** Check `gh pr list --state
   open` first (none open now).
2. **Never commit `.env*.local`** — it holds LIVE Neon creds.
3. **Never print the DATABASE_URL value or tokens.**

## Env / auth
- Local `.env.local` = LIVE Neon (host `ep-aged-paper-b3xyuxjz...`). Gitignored.
- `credential.helper manager` global; GCM holds github.com creds.
- VSCode `GIT_ASKPASS` was poisoning pushes — do not set it.

## To finish (see todos.md)
1. Write `AGENTS.md`, `ONBOARDING.md`, `design/README.md`.
2. Write `playwright.config.ts` + specs; `npx playwright install chromium`.
3. Verify: build, lint, headless e2e, headed e2e with user.
4. Verify Neon rows (postgres-testing skill).
5. Branch → stage-wise commits → push → PR via `gh`.

## Key commands
- `npm run build` / `npm run lint`
- `npm run dev`
- `npm run test:e2e` (headless) / `npm run test:e2e:ui` (headed)
- `Invoke-RestMethod http://localhost:3000/api/health`
- git: prefix `$env:Path += ";C:\Program Files\Git\cmd"`
- gh: prefix `$env:Path += ...;C:\Users\deepak\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin"`
