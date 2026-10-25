> Current status, 25 October 2026: PWA is the £0 route; no native-store publication is verified. Earlier fee/update/account assurances are historical. See the current £0 install specification below before following old instructions.

# 📲 Pleading Sanity & Arron — Google Play (Android) & App Store

Both apps are Progressive Web Apps, so they already install straight from the browser
(Chrome on Android: menu → **Install app**). Store listings wrap the same live site, which means:

- **Every deploy reaches every phone automatically.** No store resubmission for new features.
- **Accounts are never touched by updates.** Logins, Sanity Profiles, friend requests, journals and
  Arron's memories live in the Netlify Database, not on the phone. The service worker never caches
  `/api/*` or member pages, so an update can't overwrite or mix up anyone's data.

There are two apps you can publish:

| App | Start URL | Manifest | Suggested package ID |
| --- | --- | --- | --- |
| Pleading Sanity (whole site) | `https://pleadingsanity.co.uk/` | `/manifest.json` | `uk.co.pleadingsanity.app` |
| Arron (companion only) | `https://pleadingsanity.co.uk/arron-app.html` | `/manifest-arron.json` | `uk.co.pleadingsanity.arron` |

## Google Play (Trusted Web Activity) — about £20 one-off

1. Create a Google Play developer account (one-off $25 fee) at <https://play.google.com/console>.
2. Open <https://www.pwabuilder.com>, enter the start URL above and choose **Android → Google Play**.
   Use the package ID from the table. PWABuilder is free.
3. PWABuilder gives you a signed `.aab`, a signing key (keep it safe — you need it for every update)
   and an `assetlinks.json` file.
4. Put that file at `/.well-known/assetlinks.json` in this repo and deploy.
   It proves the app and the website belong together, which hides the browser bar.
   If you publish both apps, merge both entries into the one file.
   Only use the file PWABuilder or Play Console gives you: it contains your signing key fingerprint.
5. Upload the `.aab` to the Play Console. Category: **Health & Fitness**.
   Fill in the Health apps declaration and the Data safety form (no tracking, no ads, data deletable).

## Apple App Store

1. In PWABuilder choose **iOS**. It makes an Xcode project that wraps the app.
2. Open it on a Mac, sign in with an Apple Developer account (£79/year), and submit.
3. Apple asks mental-health apps to show crisis resources clearly. Both apps already do:
   the 🆘 Help button, the crisis page, and the `?help=1` shortcut in Arron.

## Before submitting

- Privacy policy URL: point stores to the "Your mind, your data" section of the Arron app, or a dedicated page.
- Say clearly in the listing that Arron is an AI companion, not a medical or emergency service.
- Screenshots: take them on a phone with the app installed (Home, Feed, Arron, Journal, Games).
- Icons: the crying cosmic brain (`/assets/icons/icon-512x512.png`) is already set as the app icon.

## Growing Arron after launch

Store apps load the live site, so every deploy reaches them instantly. Arron also grows on his own:
every night at 03:41 he writes down what the family's public posts taught him (see
`netlify/functions/arron-grow.mts`). Edit `/arron-knowledge.json` to add wisdom, greetings or principles.


## £0 install boost — current specification, 25 October 2026

This section supersedes automatic-update/never-touch-accounts assurances and fixed store-fee claims above. Store terms and fees must be checked at submission; native publishing is outside the £0 release. No verified Google Play or Apple App Store listing exists in this audit. PWA installation is the free option. New cached code is not guaranteed to reach every phone immediately, and a service worker alone cannot prove account/data safety.

Extend the existing get-the-app page and install handlers after inspecting them; preserve all manifest IDs, start URLs and scopes. One calm optional banner after deliberate interaction, no timed nag or blocking overlay. Use beforeinstallprompt only where supported; do not fake it. Hide when standalone is detected or after the person dismisses it; if persistence is unavailable, omit rather than repeatedly nag. Never place it over crisis actions.

| Platform | Instructions to verify on a real device |
|---|---|
| iPhone/iPad | Open the site in Safari → Share → Add to Home Screen → confirm name → Add. If the browser offers “Open as Web App”, explain the observed option. In-app browsers may need Open in Safari first. |
| Android | Open in a supported browser such as Chrome → Install app/Add to Home screen when offered; fallback to browser menu. Prompts vary by device/browser. |
| Desktop | Browser install control where supported, otherwise normal bookmark. No promise of background support. |

First launch: a skippable short panel explaining Arron is AI, support links, where the current page saves data, and optional install. No forced login or permission request. Offline messaging must say what is actually available: cached public pages/games may work; chat, sign-in, community and sync need a connection. Never queue or claim a journal/account save without a tested implementation. A new version prompt must let users finish/retain drafts; do not force reload during editing or gameplay.

Acceptance: fresh install, existing install update, dismissal, standalone detection, offline launch, reconnect, stale-cache recovery, private-route exclusions, keyboard/reduced motion, safe areas and 360px layout. Test iOS Safari and Android Chrome physically before certification. Do not clear site storage as an update mechanism; explain that clearing browser data can remove local journals/saves. This is a specification, not proof those devices were tested.

Implemented 25 October 2026: shared install lifecycle failure/race handling, App Hub in-flow phone instructions, offline limitations and optional first-use links. No new tracking/banner, native-store listing or real-device certification. Exact release evidence is in the current handoff/PR.
