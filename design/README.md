# Design Source — Glow & Grace

The visual and commerce spec for this storefront is a single self-contained
reference build:

- **`glow-grace-full.html`** — the full static design (home + shop + product
  + cart + checkout + careers + auth), with the palette, type, pill button
  language, layout grid, and copy for every page.

This file is the **single source of truth** for UI work.

## How it's used
- Match the reference when building or editing any page — copy, layout,
  pill buttons, rose/gold/blush palette, glass/sticky navbar, breadcrumbs,
  payoff copy (e.g. "Stay Glowing", "Your Beauty Basket", careers salary
  cards).
- Product/job/testimonial/review data in `src/lib/data.ts` mirrors the
  reference so screenshots line up with the spec.

## Palette (tailwind tokens)
| Token     | Hex       | Usage                      |
| --------- | --------- | -------------------------- |
| rose      | `#d6336c` | Primary brand, buttons     |
| rose-soft | `#f4a6c0` | Accents, gradients         |
| blush     | `#fff5f7` | Section backgrounds        |
| gold      | `#c9a35b` | Ratings, premium accents   |
| charcoal  | `#2b2330` | Body text, footer          |
| cream     | `#fffafc` | App background             |
| emerald   | `#2e9e6b` | Success states             |

## Typography
- Headings: **Playfair Display** (`--font-playfair`)
- Body: **Inter** (`--font-inter`)

## Commerce rules (mirrored from the reference)
- `total = subtotal + 5% GST + shipping − promo`
- Free standard shipping above **₹999**; Express ₹49; Same-Day ₹99.
- Promo code: **GLOW10** → 10% off.
- Order IDs: `GG-2026-XXXXX`.

## Editing guidance
- Keep this file tracked so future agents can diff against the live app.
- Any UI change should still match the reference; if the design intentionally
  changes, update this file too.
- `data-testid` hooks (see `.opencode/skills/e2e-testing/SKILL.md`) let E2E
  selectors survive copy edits, so feel free to keep text faithful.
