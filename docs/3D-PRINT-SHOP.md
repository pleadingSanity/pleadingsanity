# P.S Studio — selling 3D prints (Made in Leicester)

Live page: https://pleadingsanity.co.uk/ps-studio.html (linked from the shop, section "Made in Leicester · 3D printed").
Catalogue: `/ps-products.json`. Photos: `/images/3d-prints/`. Guard test: `tests/ps-studio-catalog.test.mjs`.
Related: [AI_HANDOFF.md](../AI_HANDOFF.md) · [MASTER_PROMPT.md](MASTER_PROMPT.md) · [system_blueprint.json](../system_blueprint.json).

## How it works
- The page reads `ps-products.json` on every visit. No build step, no database, no tracking.
- A print shows with a price and a **Buy** button only when it is complete: `active: true`, `price_gbp` above 0, a photo in `/images/3d-prints/`, `stock` above 0 (or `made_to_order: true`) and a `buy_url`.
- Anything incomplete shows as "Prototype · Not for sale". With nothing for sale the page says "First prints coming soon".
- Payment never happens on this site. The Buy button opens the store that already takes payment for Pleading Sanity: the Payhip store (https://payhip.com/Pleadingsanity) or TikTok Shop. A `mailto:pleadingsanity1@gmail.com` link is also allowed for made-to-order prints. Other hosts are refused by the page and by the test. The PayPal Founder's 100 button in `shop.html` is separate and must not be changed.

## Add a new print (Shane, about 5 minutes)
1. Photograph the print on a dark, plain background. Square is best.
2. Create the product in Payhip (price, delivery, stock) and copy its product link.
3. Send any AI (Grok Bot, Dola, Claude, GPT) the photo plus one message, for example:
   "New print: Crying Brain keyring, PLA+, 5 cm, £8, 10 in stock, Payhip link https://payhip.com/b/XXXX".
4. The AI then:
   - saves the photo as `images/3d-prints/<id>.webp` (id = lower-case words joined by dashes, for example `crying-brain-keyring`);
   - copies `template` from `ps-products.json` into `products` and fills in `id`, `title`, `category`, `material`, `price_gbp`, `description`, `photo`, `photo_alt`, `stock`, `buy_url`, `status: "for-sale"`, `active: true`, and updates `updated`;
   - runs `npm test` (the catalogue test must pass) and opens a PR. Shane merges; Netlify deploys main; the print is on sale.
5. Sold out: set `stock` to 0 (the card goes back to "not for sale") or set `made_to_order: true`. Retire a print with `status: "retired"` and `active: false`.

## Rules
- Honest copy only: real size, material and colour. No invented reviews, stock or safety claims. Motorcycle, protective or food-contact items need proper safety checks before sale.
- Brand: #0b0f19 background, teal #00fff0 / #38bdf8, amber #f59e0b, silver. No purple, pink, indigo or violet. SVG icons, no emoji.
- The sanctuary stays free. Prints are optional and help pay running costs.
- No keys or secrets in the catalogue or photos' file names.

## On-site PayPal checkout: P.S Prints (added 15 Nov 2026)
- Shop page: https://pleadingsanity.co.uk/prints.html. Creator page (owner/creator/admin only): https://pleadingsanity.co.uk/creator-prints.html.
- Catalogue: `data/prints.json` (in the repo) plus anything saved on the creator page (Netlify Blobs `prints-catalogue`; photos in `prints-photos`). Same id = the creator-page version wins.
- Checkout: the PayPal client ID comes from `/api/prints` (Netlify env). After capture, `POST /api/prints/verify` checks the order with PayPal: COMPLETED, amount = price x qty + post (`delivery.post_gbp`, 0 for Leicester collection), GBP, payee = `PAYPAL_MERCHANT_ID`, `custom_id` = `ps-print:<id>:<qty>:<post|collect>:<ref>`. The order and delivery address are recorded once in Blobs `print-orders` and listed on the creator page.
- Rules in `netlify/lib/prints.ts`, tests in `tests/prints.test.js`: a live item needs a price, a real photo (mockups cannot be sold) and stock or made to order. **A `toy` needs `compliance: true` and a `compliance_ref` (technical file reference) or it can never be live.** See [3D-PRINT-COMPLIANCE-UK.md](3D-PRINT-COMPLIANCE-UK.md) and [3D-PRINT-STARTER-PLAN.md](3D-PRINT-STARTER-PLAN.md).
- Live also needs a batch code, warnings, material and a real print-file licence. Flexi, articulated or 3D-figure keyrings (`form: 3d`) are treated as toys. Non-toys must be 14+ or adult. Trademarked names are refused.
- Delivery price and collection on/off: creator page, "Delivery" form (Blobs `settings.json`).
- Reviews: only verified buyers (order ref + checkout email, or the signed-in account that bought it). Every review waits for approval on the creator page. Stored in Blobs `print-reviews`; no tracking.
- Clothing-matched prints carry `range` and `matches` (shown as "Matches: ..." on the card). Briefs: [3D-PRINT-CLOTHING-MODELS.md](3D-PRINT-CLOTHING-MODELS.md).
- Quick add (about 2 minutes): open creator-prints.html, choose the print or "New print", upload the real photo, untick "mockup", set name, price and status Live, Save.
- `ps-products.json` and `ps-studio.html` (Payhip/TikTok buy links) are unchanged and keep working.
