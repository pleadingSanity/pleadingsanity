# 📲 Arron — Google Play & App Store

Arron is a Progressive Web App, so it installs straight from the browser today.
No store is needed. When you want store listings too, the app is already shaped
for them: one manifest (`/manifest-arron.json`), its own service worker
(`/sw-arron.js`), offline support, and icons from 72px to 512px.

## Google Play (Trusted Web Activity)

1. Open <https://www.pwabuilder.com> and enter `https://pleadingsanity.co.uk/arron-app.html`.
2. Choose **Android → Google Play**. Package ID suggestion: `uk.co.pleadingsanity.arron`.
3. PWABuilder gives you a signed `.aab` and an `assetlinks.json` file.
4. Put that file at `/.well-known/assetlinks.json` in this repo and deploy.
   It proves the app and the website belong together, which hides the browser bar.
   Only use the file PWABuilder or Play Console gives you: it contains your signing key fingerprint.
5. Upload the `.aab` to the Play Console. Category: **Health & Fitness**.

## Apple App Store

1. In PWABuilder choose **iOS**. It makes an Xcode project that wraps the app.
2. Open it on a Mac, sign in with an Apple Developer account, and submit.
3. Apple asks mental-health apps to show crisis resources clearly. Arron already does:
   the 🆘 Help button, the Guardian tab, and the `?help=1` shortcut.

## Before submitting

- Privacy policy URL: point stores to the "Your mind, your data" section of the app, or a dedicated page.
- Say clearly in the listing that Arron is an AI companion, not a medical or emergency service.
- Screenshots: take them on a phone with the app installed (Talk, Remember, Journal, Guardian).

## Growing Arron after launch

Store apps load the live site, so every deploy reaches them instantly.
Edit `/arron-knowledge.json` to add wisdom, greetings, principles, or a new AI model in the chain.
No store resubmission is needed.
