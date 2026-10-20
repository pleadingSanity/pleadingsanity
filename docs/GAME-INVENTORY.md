# Pleading Sanity — Game Inventory
Updated: 2026-10-20. Source-inspection status, **not** production/browser certification.

## Existing games
| Experience | Source | Status | Next validation |
|---|---|---|---|
| Sanity Solitaire | `sanity-solitaire.html` | ⚠️ NEEDS REVIEW | TriPeaks, FreeCell and Pyramid interaction, wins, undo, mobile and keyboard |
| Night Table (play-chip poker) | `poker.html` | ⚠️ NEEDS REVIEW | Hand ranking, chip accounting, opponent turns, progress and keyboard |
| Brain Games hub | `games.html` | ⚠️ NEEDS REVIEW | All card destinations, thumbnails, mobile layout and statuses |
| Other game experiences | Linked from `games.html` | ⚠️ NEEDS REVIEW | Enumerate all pages and run full browser tests |

## Concepts
| Experience | Status | Scope |
|---|---|---|
| The Medieval Ways | 💡 IDEA / DESIGN REVIEW | Existing context mentions concept; no playable route verified. Preserve Village → Sanctuary → Journey proposal until lore and design reviewed |

## Changes committed
- `sanity-solitaire.html` — accessible, visible 48px Brain Games return link; commit `1841944`.
- `poker.html` — matching return link; commit `2baa4ba`.
- `poker.html` — restrict level progression to log messages identifying You as a pot winner; commit `4bc9729`. Source fix, runtime testing pending.
- This file records verification boundaries; it does not claim games are complete.

## Owner-editable controls
Navigation label, border colour and spacing are in the new labelled HTML navigation blocks near the opening `body` tag. Existing mechanics and scoring were not changed.

## Outstanding tests
- Desktop and small-screen interactive play, keyboard-only, screen-reader announcements, reduced motion and contrast.
- All card/hand outcomes, restart and save/load behaviour.
- Loading/error states and cross-page navigation.
- Compare deployed versions against main and confirm Netlify publication.

**No real-money gambling, ads, tracking or paid services added. PR #92 untouched.**

## 2026-10-20 — usability rebuild, phase 1
- Competitive reference review: TriPeaks titles emphasize one-tap rank matching, visible streaks and map progress; mobile poker titles emphasize a clearly explained Fold / Check / Call / Raise flow and readable seat layout. Use original PS art and code; do not copy proprietary assets or source.
- `sanity-solitaire.html`: first-visit, four-step interactive onboarding; persistent How to Play replay button; accessible dialog and Escape; commit `6b6e26f`.
- `poker.html`: first-visit, four-step Hold'em onboarding; persistent How to Play replay button; accessible dialog and Escape; commit `de1207f`.
- Status: ⚠️ NEEDS REVIEW. No browser-device validation completed yet. Further work: full-screen app-shell design, card/table art direction, richer non-flashing rewards, gameplay engine regression tests, mobile tap-target tests, install and offline verification.
