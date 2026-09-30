# 🌌 Pleading Sanity — Setup, Roles & Post-Deploy Checklist

One page for everything that happens *outside* the code: environment variables,
granting creator mode, and what to click after each deploy.

---

## 1. Environment variables

The site runs with **zero required secrets**. AI works through **Netlify AI Gateway**,
which injects credentials into functions at runtime. Nothing is stored in the repo.

| Variable | Needed? | What it does |
|---|---|---|
| *(none)* | — | Arron (Claude → GPT-4o → Gemini), AI Studio, moderation and AI Stories all run through Netlify AI Gateway automatically. |
| `YOUTUBE_API_KEY` | Optional | Live survivor videos in the For You feed and `/videos.html` (`netlify/functions/ytFeed.mjs`). Without it, the curated fallback list is used. |
| `OPENAI_API_KEY` | **Leave unset** | Only set this if you want OpenAI billed to *your own* OpenAI account. Setting it switches OpenAI off the AI Gateway. |
| `ANTHROPIC_API_KEY` | **Leave unset** | Same as above for Claude. |
| `GEMINI_API_KEY` | **Leave unset** | Same as above for Gemini. |

Where to set them: **Netlify → Project configuration → Environment variables → Add a variable**.
Mark keys as **secret** and scope them to **Functions** only.

> ⚠️ Never put an API key in a `NEXT_PUBLIC_*` variable or in any HTML/JS file. Anything in the
> browser is public. `.env.example` lists legacy names from older repos; most are unused.

Database: **Netlify Database** is provisioned automatically. Migrations in
`netlify/database/migrations/` are applied by Netlify on every deploy. Never edit an applied migration.
Add a new one instead.

---

## 2. Roles: guest → member → creator → admin

| Role | How someone gets it | What they can do |
|---|---|---|
| **Guest** | Just visits | Every public page, talk to Arron, play all games, heart AI Stories, use AI Studio (small daily limit) |
| **Member** | Signs up and confirms their email | Post, comment, befriend, share AI Stories, profile with XP/badges/saved items, higher AI Studio limit |
| **Creator** | Granted by hand (below) | **Creator mode**: Arron uses each lab's most capable model (Claude Opus 5.5 → GPT-5.5 → Gemini 3.1 Pro) with longer, deeper answers and a builder's-partner brief. No daily AI Studio limits. Can record Unity Pod episodes. |
| **Admin** | Granted by hand (below) | Everything creators get, plus the **Moderation queue** (`/admin.html`) and hiding/removing any AI Story |

### How to grant creator mode (unlock full power)

1. Sign up on the live site with the account you want to upgrade and confirm the email.
2. Open **Netlify → your project → Identity** (under *Project configuration → Identity* on newer dashboards).
3. Click the user's email.
4. Under **Roles**, type `creator` (or `admin`) and press Enter. Click **Save**.
5. On the site, **sign out and sign back in**. Roles are read from the sign-in token, so a fresh sign-in is required.
6. Check it worked:
   - The account menu (top right) shows **💫 Creator · full power** or **🛡️ Admin**.
   - On `/arron.html` Arron's status reads **"Creator mode · full power 💫"**.
   - `/api/arron/health` returns `"creator": true` while signed in.

To remove it, delete the role in the same screen and have the person sign in again.

> **About "builds & pushes code directly":** Arron in creator mode gives working code, plans and
> next steps, but it does **not** get write access to GitHub. Giving a chat model a token that can
> push to `main` would let any leaked session change the live site. Code still goes through a
> human review (GitHub or Netlify Agent Runners), which is how we keep things human-led.

---

## 3. Post-deploy checklist

Work top to bottom on a **phone** first, then a desktop. Tick as you go.

### Domains & security
- [ ] `https://pleadingsanity.co.uk` loads with a padlock.
- [ ] `https://www.pleadingsanity.co.uk` → redirects to `https://pleadingsanity.co.uk`.
- [ ] `https://pleadingsanity.uk` → redirects to `https://pleadingsanity.co.uk` (once its name servers point to Netlify DNS).
- [ ] `/ai-family` → `/ai-ecosystem.html`, `/stories` → `/ai-stories.html`, `/help` → `/crisis.html`.
- [ ] A made-up URL such as `/nope` shows the cosmic 404 page.

### Navigation
- [ ] Phone: top bar shows the logo, **Sign in**, then four pills: **💙 Heal · 🎮 Play · 🌌 Community · 🆘 Help**.
- [ ] Tap **Heal**: a panel opens with Arron, Arron App, Journal, Healing Hz, Silence & Breath, Quotes. Tap outside and it closes.
- [ ] Only one group opens at a time. The group containing the current page has a cyan outline.
- [ ] Desktop: keyboard **Tab** to a group, **Enter** opens, **↓/↑** move through links, **Esc** closes.
- [ ] **🆘 Help** always goes straight to `/crisis.html`.

### Sign-in (Netlify Identity)
- [ ] Sign up with a fresh email → confirmation email arrives → link signs you in → onboarding → feed.
- [ ] Sign out → **Sign in** with password works.
- [ ] **Email me a sign-in link** on `/login.html` → link signs you in.
- [ ] **Forgot password** → reset email → link opens `/reset-password.html?mode=set` → new password works.
- [ ] Signed in: the **Community** group gains **🤝 My Community** and **✍️ New Post** at the top.
- [ ] The account menu shows your role (**🌱 Member** by default).

### Arron
- [ ] `/arron.html`: send "hi". A reply arrives within a few seconds.
- [ ] Under Arron's reply, **✨ Share to AI Stories** opens `/ai-stories.html` with the conversation pre-filled.
- [ ] **🛡️ Privacy · Forget Me** erases the conversation on this device and in the cloud.
- [ ] Creator account: status shows **Creator mode · full power 💫**.
- [ ] *(Optional fallback test)* In Netlify → Logs → Functions → `arron`, an `Arron: … unavailable, trying the next lab` line means a fallback happened. Replies still arrive.

### Arron app (PWA)
- [ ] Android/Chrome: `/arron-app.html` → **Install** → icon on the home screen opens full-screen.
- [ ] iPhone/Safari: Share → **Add to Home Screen**.
- [ ] Turn on flight mode → open the app → it opens, and offline replies and crisis numbers still work.

### AI Family & AI Stories
- [ ] `/ai-ecosystem.html` shows Arron, Dola, Copilot, Nova, Sol and Claude, the three-lab chain and the promises.
- [ ] `/ai-stories.html` as a guest: stories load, filters (All/Inspiring/Funny/Wisdom/Wins) and **Most loved** work, 🤍 hearts toggle.
- [ ] Signed in: share a story → it appears at the top. **🗑️ Remove** deletes your own story.
- [ ] Try an unkind story → it is politely refused.

### Feed & profile
- [ ] Home **✨ For You**: swipe up through cards. Around card 10: **"You've been scrolling a while — breathe with me 💙"** with a breathing circle.
- [ ] ☆ **Save** a few cards → open **My profile** → **⭐ Saved** lists them.
- [ ] Play any game → **My profile** → **🌟 Cosmic Player** shows level, XP, streak and badges.

### Games
- [ ] `/games.html`: level bar, streak, Daily Challenge and badge shelf render.
- [ ] Play each game once on a phone (touch) and on desktop (keyboard): Cosmic Focus, Number Nebula, Pattern Galaxy, Memory Ocean, Rhythm Resonance, Stardust Dash.
- [ ] Finishing a round gives XP, toasts and confetti. The Daily Challenge game gives double XP.
- [ ] Flight mode → reopen `/games.html` and a game → still playable. Progress is saved on the device.

### Offline, caching & SEO
- [ ] After a deploy, a normal refresh shows new styles and scripts (CSS/JS always revalidate, and the service worker cache is versioned `v12`).
- [ ] Flight mode → any visited page opens; unknown pages show `/offline.html` with crisis numbers.
- [ ] `https://pleadingsanity.co.uk/sitemap.xml` and `/robots.txt` load.
- [ ] Browser devtools console: no red errors on Home, Arron, Games, Feed and AI Stories.

### Moderation (admin)
- [ ] `/admin.html` loads for an admin and shows the report queue.
- [ ] Non-admins get "Admins only".

💙 If anything fails, note the page, the device and what you tapped. That's all anyone needs to fix it.
