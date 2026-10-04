# Claude — full check, then enhance. One house.

You are auditing Pleading Sanity for Shane Cooper. One repo: github.com/pleadingSanity/pleadingsanity. Push to main. Do not open a pull request. Do not start a second site.
Live: https://pleadingsanity.co.uk. Evolution, Not Erasure. Patch the working file. Do not delete a working page, function, provider, or install id.

Hard limits: no paid API, no paid voice, no second host, no clinic numbers or government leaflets on public pages. Talk, journal, games, the feed, and Arron stay free. Manifest ids stay "/", "/arron-app.html", and "/sanity-solitaire.html", with the start URLs already in those files. Do not change service-worker scope. A suspended host can take the domain down. The installed app and GitHub are the copies.

Read `.github/copilot-instructions.md` and do the same three passes. Copilot owns the first patch. You own the check after it.

## 1. Sky
Open the home page. Confirm /assets/theme/sky.jpg is visible behind the words, not hidden by an opaque body colour. Confirm the same sky is behind the games hub and is the solitaire table. Stars must not cover cards, buttons, or inputs. Reduced motion must stop drift.

## 2. Solitaire
Open /sanity-solitaire.html. Deal must show 28 cards. Backs are the brain card. Suits are the four pictures in /assets/theme/suits/. New deal, undo, and hint must work. The page itself must scroll on a phone. The felt must not be a cropped portrait card.

## 3. Games, scroll, engines
Open /games.html and scroll from the first card to the last. Every card needs its own picture from /assets/theme/icons/. Then open each game and confirm the engine boots with no page error:
- cosmic-focus.html, number-nebula.html, pattern-galaxy.html, memory-ocean.html, rhythm-resonance.html
- stardust-dash.html and /js/stardust-dash.js
- cosmic-connect.html and /js/cosmic-connect.js
- truth-tag.html and /js/truth-tag.js
- mind-mode.html and /js/mind-mode.js
- mood-journey.html and /js/mood-journey.js
- frequencies.html
- the stories scroller on / and /feed.html (.cs-scroller). It snaps inside its own box. Full screen locks the page. Escape unlocks it. The rest of the page still scrolls when full screen is off.

Enhance only what is dull or broken: contrast, scroll, a missing icon, an engine that throws. Do not restyle a working control into something new. Do not add a framework.

When you finish, list files changed, pages opened, and anything you could not prove.
