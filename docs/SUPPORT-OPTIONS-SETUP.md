# Support and playlist slots: setup notes (internal)

Moved from the public `support-us.html` page on 2026-11-10 (Grok copy pass). The setup hints that `js/support-links.js`, `js/radio-playlists.js` and `js/music-app-player.js` render for empty slots are hidden on the public pages with CSS, so visitors no longer see repo paths. The data files are unchanged.

## Support options: `data/support-config.json` (public, committed, no secrets)
Nothing is invented. Each slot stays empty until Shane drops in the real value.
- **Buy Me a Coffee:** a buymeacoffee.com page URL.
- **Ko-fi:** a ko-fi.com page URL.
- **Bank transfer (UK):** account name, sort code, account number (plus an optional payment reference).
- **Crypto:** a wallet address and a network label (for example BTC or ETH).
- **PayPal:** intentionally unwired (Shane's call, Nov 2026). It will be wired through Netlify env vars later and never hardcoded here.

## Playlist slots: `data/music-playlists.json`
- `youtube_url`, `sonos_url`, `amazon_music_url`: when one is filled, its button appears on `/insane-radio.html`, `/music/index.html` and in the floating widget.
- `shane_playlists[]`: each entry needs `name`, `youtube_playlist_id`, `url` and `description`.

## Follow-up for Dola (owner of the music and radio JS)
The visible sentence "Empty slots are waiting for a link in data/music-playlists.json." is still built in `js/radio-playlists.js` (renderCurated) and `js/music-app-player.js` (intro). CSS hides it while every slot is empty. Once a slot is filled the sentence shows again, so the string itself should be reworded in those files.
