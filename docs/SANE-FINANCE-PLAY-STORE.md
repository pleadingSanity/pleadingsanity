# The Sane Finance GBT — Play Store kit

**Not published.** Nothing here means the app is on Google Play.

Package ID: `uk.co.pleadingsanity.sanefinance` (in `twa-finance-manifest.json`)
Version: `appVersion` 1 / `appVersionName` 1.0.0 — raise both for every upload.
Start URL: `/finance.html` · Manifest: `https://pleadingsanity.co.uk/manifest-finance.json`

## Steps only Shane can do

1. `bubblewrap init --manifest https://pleadingsanity.co.uk/manifest-finance.json` (or use `twa-finance-manifest.json`).
2. Create the signing key: `keytool -genkeypair -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000`.
   **Never commit the keystore or its passwords.** Back it up somewhere safe — lose it and you can't update the app.
3. Get the SHA-256 fingerprint: `keytool -list -v -keystore android.keystore -alias android`.
   If you use Play App Signing, also copy the **app signing key** SHA-256 from Play Console → Setup → App integrity.
4. Put both fingerprints in `twa-finance-manifest.json` → `fingerprints`, and add a statement to
   `/.well-known/assetlinks.json` for `uk.co.pleadingsanity.sanefinance` (relation
   `delegate_permission/common.handle_all_urls`). Without this the app shows a browser bar.
5. `bubblewrap build`, then upload the `.aab` to Play Console.

## Listing text

**Title:** The Sane Finance GBT
**Short description (80):** Finance without the sales pressure. Know what you can afford before you apply.
**Full description:**
Tell it your situation once. The Sane Finance GBT works out what you can realistically afford, stress-tests the payment, explains what might stop an application, compares the real total cost of the quotes you've been given, and prepares a truthful application pack. If you're declined, it separates what you know from what only the lender knows and tells you exactly what to ask. Your figures stay on your phone.
It is a free education and preparation tool. It is not a lender, credit broker or financial adviser, does not arrange credit, does not earn commission and cannot guarantee approval.

**Category:** Finance · **Privacy policy:** https://pleadingsanity.co.uk/privacy.html#finance

## Data safety form (answer from the code as it is today)

- Data collected: **none stored by the developer.** Finance figures stay on the device.
- Data shared: only when the user presses "Ask the family" — the question (and profile figures if they tick the box) is sent to AI providers to generate a reply, not stored. Declare "Financial info → user-provided, optional, not stored, processed ephemerally".
- Encrypted in transit: yes (HTTPS). Users can delete data: yes, on the page.

## Content declarations

- Financial features: declare it is **not** a personal loan app and does not offer loans. (Google's personal loan policy applies to apps that offer or facilitate loans — re-check this if that ever changes.)
- Ads: none. Target audience: 18+.

## Still needed

Screenshots (phone 1080×1920+, at least 2), feature graphic 1024×500, 512×512 icon (`/assets/icons/icon-512x512.png` exists).
