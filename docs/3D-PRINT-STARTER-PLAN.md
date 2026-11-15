# 3D print starter plan (15 Nov 2026)

Goal: first income from black and white prints this week, without touching toys until the compliance in [3D-PRINT-COMPLIANCE-UK.md](3D-PRINT-COMPLIANCE-UK.md) is done. Shop: https://pleadingsanity.co.uk/prints.html. Add prints: https://pleadingsanity.co.uk/creator-prints.html (creator sign-in).

## Cost basis (replace the estimates with real numbers after the first prints)
- **Filament:** a 1 kg PLA spool is typically £15–£20 in the UK, so about **1.5p–2p per gram**. EN 71-3 certified spools (needed for toys later) can cost more. Use your real spool price: cost per gram = spool price / 1000.
- **Electricity:** a desktop FDM printer typically draws about 100–150 W while printing. At roughly 25p per kWh that is about **3p–4p per hour**. Check your tariff.
- **Failures and wear:** add about 10% for failed prints, nozzles and build plates.
- **Packaging and post:** small padded mailer about 20p–40p. Post: the site charges a flat £3.50 UK delivery (set in `data/prints.json`, `delivery_gbp`). **Check current Royal Mail prices for your real parcel size and weight** before going live and change it if needed.
- **Payment fees:** PayPal takes a fee per sale (check your PayPal account's UK fee page). Etsy: 6.5% transaction fee, 4% + 20p payment processing, about USD 0.20 listing fee and 0.48% regulatory fee for UK sellers. [Etsy fees](https://www.etsy.com/legal/fees/)
- **Your time:** not counted below. Print time runs unattended, but finishing and packing is your time.

## First products (all non-toys, labelled 14+ · not a toy)
| Product | Colour | Est. filament | Est. print time | Material + power | Suggested price | Site status |
|---|---|---|---|---|---|---|
| Crying Brain keyring (steel ring ~20p) | Black | ~8 g | ~0.5 h | ~£0.40 incl. ring | **£6** | Draft (mockup photo) |
| Angled phone stand | White | ~45 g | ~2.5 h | ~£0.95 | **£10** | Draft (mockup photo) |
| Hex desk organiser | Black | ~90 g | ~5 h | ~£1.90 | **£12** | Draft (mockup photo) |
| Cable tidy set (x5 clips) | Black or white | ~15 g | ~1 h | ~£0.35 | £5 | Idea |
| Crying Brain desk sculpture | Black on white base | ~70 g | ~4 h | ~£1.50 | £15 | Idea |
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
