---
name: github-workflow
description: Use when committing, pushing, branching, or creating/merging PRs for the Glow & Grace repo, and when tracking GitHub state with the gh CLI. Covers the trunk-based branch rule, stage-wise commit conventions, the Windows git/gh PATH quirks for this machine, and the exact commands to create and describe a PR. Do NOT use for plain file edits or for unrelated repos.
---

# GitHub Workflow (Glow & Grace)

Trunk-based development. `main` is the only long-lived branch. Every feature
lands on a short-lived branch and merges via a Pull Request.

## Hard rule (user policy)

- **Never push code automatically. Always stop and ask the user for explicit
  confirmation before any `git push`, before opening a PR, and before merging.**
  When the work is ready, present a short summary of what will be pushed
  (branch, commits, PR impact) and WAIT for the user's go-ahead. Do not push
  as part of finishing a task, even after a green build/test run.
- **Never create a new branch while any PR is open.** If an open PR exists,
  finish/merge it first (or cancel it) before branching again.
- Work is **verified before merge**, not after: build + lint green, headless
  E2E green, and the user confirms the headed (UI) pass before a PR is opened.
- Stage-wise commits: a commit must be one cohesive change (design tokens,
  persistence layer, one page redesign, one bug fix), never a dump.
- Never commit `.env*.local` or any credential. `.env` is gitignored.

## This machine (Windows, PowerShell)

- Git is not on PATH. Prefix commands that call git with:
  `$env:Path += ";C:\Program Files\Git\cmd"`
- gh CLI is per-user under winget packages. Prefix commands that call gh with:
  `$env:Path += ";C:\Program Files\Git\cmd;C:\Users\deepak\AppData\Local\Microsoft\WinGet\Packages\GitHub.cli_Microsoft.Winget.Source_8wekyb3d8bbwe\bin"`
- Auth: git uses `credential.helper manager` (Git Credential Manager),
  already stored for github.com as `deepakambastha28`. gh is authenticated
  (`gh auth status`), token scopes gist/read:org/repo.
- Known traic pid: a stale VSCode `GIT_ASKPASS` env var breaks `git push`
  ("cannot spawn ... vscode.git/askpass"). If a push fails that way, run
  `Remove-Item Env:GIT_ASKPASS` (and if never set interactively, use
  `$env:GIT_TERMINAL_PROMPT="0"`).
- Use `git push -u origin <branch>` to set upstream on the first push.

## Standard flow

1. Check state first, in this order:
   - `git status` — clean or known files only
   - `git log --oneline -10` — commit history and style
   - `gh pr list --state open` — **if anything is open, stop; do not branch**
2. Create the branch from latest `main`:
   - `git fetch origin && git checkout -b <type>/<slug> origin/main`
   - type prefixes used in this repo: `feat/`, `fix/`, `style/`, `chore/`, `docs/`
3. Commit stage-wise with the repo's `<type>: <summary>` style:
   - `feat:` new capability, `fix:` bug, `style:` visual/layout, `chore:` tooling/deps, `docs:` docs only
   - Mirror the repo voice used so far, e.g. "feat: add typed API layer for pins/orders/applications"
4. Push the branch and surface a PR **only after the user explicitly confirms
   the push**. Do not push to conclude a task — always ask first.
5. Create the PR with a proper description:
   - `gh pr create -t "<title>" -b "<body>"`
   - Body must include: What changed (bulleted, per area), Why (design source:
     `design/glow-grace-full.html`), How it was verified (build/lint/e2e results),
     Testing steps for the reviewer.
   - Example body:
     ```
     ## What changed
     - ...
     ## Why
     - Matches reference design in design/glow-grace-full.html
     ## Verification
     - `npm run build` ✓  `npm run lint` ✓  `npm run test:e2e` ✓
     ## Manual test steps
     1. ...
     ```
6. Do not merge until the user approves in the browser.

## Useful gh commands

- `gh pr list --state open` / `gh pr view <n>` / `gh pr diff <n>`
- `gh pr status` — PRs touching your branch/head
- `gh pr view --web` — open PR page in browser
- `gh repo view <owner>/<repo>` — metadata (defaultBranchRef, visibility)
- `gh auth status` — confirm login before any repo call

## Commit-message guideline (repo style)

Messages seen on `main`: `chore:`, `feat:`, `style:`, `fix:` — lowercase
type, then a short imperative summary; multi-part summaries joined with ";".
Keep the body free-form for longer context. Never reference `.env.local`.