# 3D print starter plan (15 Nov 2026)

Goal: first income from black and white prints this week, without touching toys until the compliance in [3D-PRINT-COMPLIANCE-UK.md](3D-PRINT-COMPLIANCE-UK.md) is done. Shop: https://pleadingsanity.co.uk/prints.html. Add prints: https://pleadingsanity.co.uk/creator-prints.html (creator sign-in).

## Kit
- Printer: Flashforge AD5X (multi-colour, so black and white in one print is possible).
- Filament: SUNLU PLA+ 1.75 mm black, FLASHFORGE Rapid PLA 1.75 mm white. Every listing names the exact filament and carries the plain-English PLA note: plant-based plastic, brittle, softens above about 50-60 C, not food-safe.

## Print files: commercial licence only
Use only print files you designed yourself, or files whose licence allows selling the printed object (for example a Printables or MakerWorld model marked for commercial use, or a paid commercial licence from the designer). Many free models are "non-commercial": selling prints of those is not allowed. Record each file's licence in `licence` in `data/prints.json` (or the creator page): who made it, the licence name, the link and the date you checked. The site will not let an item go live with no licence or with the seed text "concept only". Never print film, comic or game characters (Marvel, DC, Disney, Scream, Jack Skellington) to sell.

## Cost basis (replace the estimates with real numbers after the first prints)
- **Filament:** a 1 kg PLA spool is typically £15–£20 in the UK, so about **1.5p–2p per gram**. EN 71-3 certified spools (needed for toys later) can cost more. Use your real spool price: cost per gram = spool price / 1000.
- **Electricity:** a desktop FDM printer typically draws about 100–150 W while printing. At roughly 25p per kWh that is about **3p–4p per hour**. Check your tariff.
- **Failures and wear:** add about 10% for failed prints, nozzles and build plates.
- **Packaging and post:** small padded mailer about 20p–40p. Post: the site charges a flat £2.00 UK post per order (set in `data/prints.json` `delivery.post_gbp`, or on the creator page), and free local collection in Leicester. **Check current Royal Mail prices for your real parcel size and weight** before going live and change it if needed.
- **Payment fees:** PayPal takes a fee per sale (check your PayPal account's UK fee page). Etsy: 6.5% transaction fee, 4% + 20p payment processing, about USD 0.20 listing fee and 0.48% regulatory fee for UK sellers. [Etsy fees](https://www.etsy.com/legal/fees/)
- **Your time:** not counted below. Print time runs unattended, but finishing and packing is your time.

## £2 first-batch keyrings: the numbers
- Material about 6-8 g at 1.5-2p/g = about 12-16p, plus a steel ring or clasp about 10-20p, plus power about 3p. Cost about **30-40p** each.
- PayPal's UK fee on a £2 sale is a fixed fee plus a percentage, which takes a big share of £2. Check your account's fee page. That is why post is charged per order and why bundles (3 for £5) or local collection make more sense than single posted keyrings.
- £2 is honestly labelled "first batch: early handmade prints, expect small marks". Raise to £3-£5 once photos and reviews are in.

## First products (all non-toys, labelled 14+ · not a toy)
| Product | Colour | Est. filament | Est. print time | Material + power | Suggested price | Site status |
|---|---|---|---|---|---|---|
| Flat Halloween pumpkin, snowman, Crying Brain hero keyrings | Black + white | ~6-8 g | ~0.6-0.8 h | ~£0.35 incl. ring | **£2 first batch** | Draft (mockup) |
| Clothing-matched flat charms (P.S. monogram, hoodie, half-brain, wordmark, racerback, teardrop, zip charm) | Black + white | ~3-8 g | ~0.4-0.9 h | ~£0.25-0.40 | **£2 first batch** | Draft (mockup), see [3D-PRINT-CLOTHING-MODELS.md](3D-PRINT-CLOTHING-MODELS.md) |
| Flexi skeleton, ghost, Crying Brain; articulated snowman, pumpkin | Black + white | ~8-15 g | ~1-2 h | ~£0.40 | £2 | Draft, **blocked**: treated as toys until a toy technical file is done |
| Angled phone stand | White | ~45 g | ~2.5 h | ~£0.95 | **£10** | Draft (mockup photo) |
| Hex desk organiser | Black | ~90 g | ~5 h | ~£1.90 | **£12** | Draft (mockup photo) |
| Cable tidy set (x5 clips) | Black or white | ~15 g | ~1 h | ~£0.35 | £5 | Idea |
| Crying Brain desk sculpture | Black on white base | ~38 g | ~4.5 h | ~£0.90 | £8 | Draft (mockup) |
| Chunky rocket **toy** | White + black fin | ~60 g | ~3 h | ~£1.30 | £9 | Draft, **blocked** until toy compliance is complete |

Weights and times are estimates. Your slicer gives the real grams and hours for each model: put them in `weight_g` and `print_hours` and re-check the price. Material is cheap; the price mostly pays for time, failures, packaging and fees. Keep a simple sheet of every sale and cost for HMRC.

## Day-one checklist (printer arrives 16 Nov)
1. Print the keyring, phone stand and organiser once each. Check for sharp edges, wobble and weak points. Measure them.
2. Photograph each real print on a dark plain background (square).
3. On creator-prints.html: pick the item, upload the real photo, **untick "mockup"**, fix the description with real size, set **Live**, Save. The shop shows it straight away.
4. Do one real test order on prints.html and refund yourself in PayPal (proves payment, address and the order list).
5. Put your name and a contact address on a small insert card in each parcel (traceability for general product safety).

## Where else to list
- **Etsy UK** (handmade buyers; fees above): https://www.etsy.com/uk/sell — read Etsy's UK product-safety pages before listing: https://www.etsy.com/uk/seller-handbook/article/1092191535409
- **eBay UK**: https://www.ebay.co.uk/sl/sell
- **Facebook Marketplace** (local collection in Leicester, no fees on local pickup): https://www.facebook.com/marketplace/leicester
- **Leicester craft markets:**
  - Leicester Craft & Flea, The Venue at DMU, next on Sat 21 Nov 2026, 11am–4pm, stalls reported at £65: https://pedddle.com/market/leicester-craft-flea/
  - Get Crafted Christmas Market, Firebug Bar, Sun 29 Nov 2026 (apply via their form): https://firebugbar.net/events/get-crafted-christmas-market/
  - Leicester Market (casual traders; check what is open): https://www.leicestermarket.co.uk/new-traders/ and https://www.leicester.gov.uk/business-and-licences/business-start-and-growth-leicester/trading-leicester-market
  - Many fairs ask for public and product liability insurance: get a quote first.
- Existing Payhip store and P.S Studio page stay as they are; the new on-site PayPal checkout is at /prints.html.

## Tax reminder
Up to £1,000 gross trading income a year is covered by the trading allowance; above that, register for Self Assessment by 5 October after the tax year ends. Details and sources in [3D-PRINT-COMPLIANCE-UK.md](3D-PRINT-COMPLIANCE-UK.md#11-tax-hmrc-side-hustle-thresholds).
