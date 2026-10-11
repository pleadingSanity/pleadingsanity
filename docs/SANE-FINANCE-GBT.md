# The Sane Finance GBT — what's live, what isn't, and what needs a human

Page: `/finance.html` · Engine: `js/finance-engine.js` · Page script: `js/finance.js`
Functions: `/api/finance-adviser`, `/api/finance-providers` · App manifest: `manifest-finance.json` · TWA: `twa-finance-manifest.json`

## What it is today

An **education, calculator, comparison and preparation tool**. It is **not** a lender, credit broker,
introducer or regulated financial adviser. It earns no commission and sends nobody's details anywhere.

| Part | Status |
|---|---|
| Finance profile (on device) | Live |
| Affordability engine + stress tests | Live — labelled "Planning estimate" |
| Financial difficulty safety route | Live — links to MoneyHelper, StepChange, National Debtline, Citizens Advice |
| Credit / circumstance profile + specialist mode | Live |
| Route advice per product type | Live |
| User-entered quote comparison (commission shown, never ranks) | Live |
| "Why did I fail?" report | Live |
| Document pack (copy / download / print to PDF) | Live — never makes evidence |
| Handoff screen | Live — shares nothing; consent tick before the link |
| Application tracker (on device) | Live |
| AI adviser (draft by one mind, checked by another) | Live — rate limited, pasted quotes treated as untrusted |
| Delete / export my data | Live |
| **Verified provider feed** | **Not connected.** Page says "Live provider data not connected." |
| **Review feed** | **Not connected.** |
| **FCA Register lookup** | **Not connected** until a free key is added (see below). Page links to the register. |

## Connecting real provider data (human action)

1. Get a licensed feed or formal partnership (a provider's official API, a licensed comparison
   feed, or a written agreement). Do **not** scrape sites against their terms.
2. Expose it as HTTPS JSON: `{ "source": "...", "providers": [ ...records... ], "reviews_connected": false }`.
   Each record uses the fields in `PROVIDER_FIELDS` in `js/finance-engine.js`.
3. Set `FINANCE_PROVIDER_FEED_URL` in Netlify environment variables.
4. Records missing required fields, with an FCA status of "authorised" but no valid reference,
   with a non-https link, or verified more than 45 days ago are dropped automatically.

## FCA Register lookup (free)

Register for an API key at register.fca.org.uk (Developer / API section). Set
`FCA_REGISTER_EMAIL` and `FCA_REGISTER_KEY` in Netlify environment variables. Never put them in front-end code.

## Regulatory gate — STOP before switching any of this on

Do **not** add affiliate links, lead forms that pass details to lenders, "apply through us" buttons,
or anything that earns commission until the following is in place. Credit broking (including
introducing customers to lenders or brokers for a fee) is a regulated activity in the UK
(Regulated Activities Order, article 36A).

Needed first, and confirmed by a compliance professional:

- A legal entity (company) to hold the permission.
- Either **FCA authorisation** with a credit broking permission, or becoming an **appointed
  representative** of an FCA-authorised principal firm that takes responsibility.
- Financial promotions controls (CONC 3) — all finance adverts and comparisons must be fair, clear and not misleading.
- Commission disclosure (CONC 4.5) — nature of commission, and amount where it could affect impartiality.
- Consumer Duty (PRIN 2A) — good outcomes, fair value, support for customers in vulnerable circumstances.
- Complaints procedure and Financial Ombudsman Service information.
- Record keeping, data protection (UK GDPR, ICO registration) and written provider agreements.

Do not put a placeholder FCA number anywhere on the live site.

## Testing done

`js/finance-engine.js` was tested in Node against: zero values, blank and junk input, negative and
huge values, weekly-to-monthly conversion, comfortable / tight / over-budget cases, difficulty
triggers, bad-credit, self-employed and benefits factors, decline reports that never claim a cause,
quote ranking that ignores commission, provider validation (malformed, incomplete, stale, fake FCA
reference, `javascript:` links), every document type, tracker status cleaning and HTML escaping.
