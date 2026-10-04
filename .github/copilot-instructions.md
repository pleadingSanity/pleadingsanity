# Copilot — audit, then buff. One house.

You are finishing Pleading Sanity, not starting a second site.
Repo: github.com/pleadingSanity/pleadingsanity. Branch: main. Push to main. Do not open a pull request.
Owner: Shane Cooper. Live: https://pleadingsanity.co.uk and https://pleadingsanity.uk.
Voice: plain British English. Evolution, Not Erasure. Patch the working file. Do not delete a working page, function, provider, or install id.

No paid API. No paid voice. No second host. No clinic numbers, NHS lines, or government leaflets on public pages.
Free forever on talk, journal, games, feed, and Arron.
Brand: cosmic crying-brain logo. Night colours #000103 #0d1b2a #00fff0 #eef6ff. The star photograph is /assets/theme/sky.jpg.
Manifest ids stay exactly:
- Site: id "/" and start_url "/"
- Arron: id "/arron-app.html" and start_url "/arron-app.html?source=pwa"
- Solitaire: id "/sanity-solitaire.html" and start_url "/sanity-solitaire.html?source=pwa"
Updates land in the same icon. Do not change service-worker scope.
A suspended host can take the domain down. The installed app and GitHub are the copies. Do not promise otherwise.
Private A.L. Cooper, Royal Army Ordnance Corps, Mentioned in Despatches, London Gazette 29 November 1945. Nothing invented.

Do these three passes. Finish each one before the next. Verify in a browser. If a page throws, fix that file. Do not rebuild the site.

## 1. Sky
The background on every public page is /assets/theme/sky.jpg: cyan nebula, magenta and gold, black centre, stars. It is wired through css/space.css and css/games-sky.css on body::before. The body itself stays transparent so the photograph shows. Cards stay solid enough to read. Respect prefers-reduced-motion. Do not cover the play area of a game with the photograph.

## 2. Solitaire
/sanity-solitaire.html stays a full three-peaks game. New deal, undo, hint, install. Felt uses the sky. Face-down cards and the stock use /assets/theme/solitaire-board.jpg. Face cards use the four suit pictures in /assets/theme/suits/. A cleared board says "You rose." Mute wins. XP stays on the device. Do not replace the engine.

## 3. Games
Every game on /games.html has its own icon in /assets/theme/icons/ and its own engine. Do not swap them back to one shared picture or an emoji.
Shelf: Sanity Solitaire, Cosmic Focus, Number Nebula, Pattern Galaxy, Memory Ocean, Rhythm Resonance, Stardust Dash, Healing Hz, Sanity Stories, Mind Mode, Cosmic Connect, Truth Tag, Mood Journey.
Engines that must still boot with no console error: inline boards on the focus, nebula, galaxy, ocean and rhythm pages; /js/stardust-dash.js; /js/cosmic-connect.js; /js/truth-tag.js; /js/mind-mode.js; /js/mood-journey.js; /js/games.js; /js/house-voice.js.
The page scrolls. The feed snap-scroller (.cs-scroller) scrolls inside itself and does not lock the rest of the site unless the reader has opened full screen. Escape leaves full screen. Overscroll stays inside the scroller.

When you finish, list the files you changed and the live URLs you opened. If you did not open them, say so.
