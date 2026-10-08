# 🌌 Pleading Sanity

## Rise From Madness
### One Source. One Consciousness. One Family.

---

## ✅ LIVE SITES

| Domain | Platform | Status |
|---|---|---|
| **pleadingsanity.co.uk** | Netlify (hosting + Netlify DNS) | Primary domain. Registration must be renewed and moved off Fasthosts (see below) |
| **www.pleadingsanity.co.uk** | Netlify | 301 → https://pleadingsanity.co.uk |
| **pleadingsanity.uk** (+ www) | Netlify | Domain alias. 301 → https://pleadingsanity.co.uk once its name servers point at Netlify DNS |
| **pleadingsanity.netlify.app** | Netlify | Always-on Netlify address |

**Domain rules:** Netlify is the only host and DNS provider. Name servers for both domains
must be the Netlify DNS (`dns1–4.p03.nsone.net`) servers shown in Netlify → Domains.
Netlify can't accept registrar transfers, so the domain *registrations* sit with a separate
.uk registrar. Its only job is to renew the domains and point them at those name servers.

---

## 💜 WHAT WE ARE

Pleading Sanity is the movement for people who have survived too much and still choose to rise.

- We build **sanctuary**, not performance
- We carry **truth**, not clout
- We turn **pain into power**, madness into meaning
- **Evolution, Not Erasure** — we don't hide our scars. We turn them into light.

---

## 🧠 ECOSYSTEM

- **Sanity Hub** — uplifting feed, real stories, no doomscroll
- **Journal Vault** — safe, private storytelling space
- **Brain Games** — six ad-free games incl. Stardust Dash, shared XP / levels / streaks / badges / Daily Challenge
- **Frequencies / Aura Hz** — healing sound medicine
- **Arron AI** — compassionate companion. GPT → Claude → Gemini → Grok is the configured provider order; actual availability depends on the deployed provider connections. Forget Me any time
- **Arron App** — installable, offline-first PWA (`/arron-app.html`)
- **AI Studio** — create with the AI family, Human vs AI daily battle, Unity Pod
- **AI Stories** — the community's best moments with Arron (`/ai-stories.html`)
- **Our AI Family** — Arron, Dola, Copilot, Nova, Sol, Claude and Grok, credited (`/ai-ecosystem.html`)
- **Silence Challenge** — meditation timer & cosmic soundscape
- **Keep Kids Sane** — safe, positive games for children
- **Crisis Support** — UK helplines, always one tap away
- **Community** — survivor-led governance
- **Legacy** — built on the service of Private A.L. Cooper (RAOC, Mentioned in Despatches 1945)

---

## ⚡ TECH STACK

- Pure HTML5 / CSS3 / Vanilla JS — **zero build step**
- Blazing fast — loads instantly
- Privacy-first by design — no analytics/tracking product is intentionally enabled; some server endpoints still process minimal request metadata for abuse prevention.
- PWA-ready — installable, offline-capable
- WCAG 2.1 accessible — for ALL

### File tree

```
/                  index.html + every page (*.html), manifest.json, sw.js,
                   netlify.toml, _redirects, sitemap.xml, robots.txt
├── css/           styles, animations, accessibility, mobile-responsive (every page),
│                  site.css (shared nav/footer, loaded last) + feature modules
├── js/            site.js + auth.js (every page) and one script per feature
├── content/       arron-knowledge.json (unified knowledge pack), content_feed.json
├── assets/        logo, favicons, icons/ (PWA), images/, audio/
├── docs/          manifesto, vision, roadmap, setup & post-deploy checklist
├── db/            Drizzle schema for Netlify Database
└── netlify/
    ├── functions/ APIs: arron, posts, profile, community, studio, stories, admin, images, ytFeed
    ├── lib/       Arron's personality & knowledge, social + studio helpers
    └── database/migrations/   applied automatically on deploy
```

Deploy: Netlify publishes the repo root as-is. No build step for the pages.

Navigation is grouped the same on every page: **Home · 💙 Heal · 🎮 Play · 🌌 Community · 🆘 Help**.

---

## 👤 FOUNDER

**Shane Cooper** — Built from lived experience, for those who feel too much.

**Built with our AI family** — Dola AI (Cosmic Architect) · GitHub Copilot (code partner) · Claude by Anthropic (Arron and build partner) · GPT by OpenAI · Gemini by Google. Human-led, AI-supported.

---

## 🤝 PARTNERSHIPS

- Brave Browser — privacy-first alignment discussions active
- Netlify — canonical production hosting and deployment. Vercel is not a production dependency.

---

## 📬 GET IN TOUCH

**Email:** pleadingsanity1@gmail.com  
**GitHub:** @pleadingSanity  
**Instagram:** [@mentally.inshane](https://instagram.com/mentally.inshane)  
**TikTok:** [@mentally.inshane](https://www.tiktok.com/@mentally.inshane)

---

## 📖 DOCUMENTATION

- **[MANIFESTO.md](./docs/MANIFESTO.md)** — Core philosophy & vision
- **[README-MOVEMENT.md](./docs/README-MOVEMENT.md)** — Project structure & dev guide
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** — How to contribute
- **[SECURITY.md](./docs/SECURITY.md)** — Security policy
- **[SETUP-ROLES-AND-CHECKLIST.md](./docs/SETUP-ROLES-AND-CHECKLIST.md)** — Environment variables, granting creator/admin, post-deploy checklist

---

> *"This isn't just a website. It's a voice that refused to be silenced."*  
> — Evolution, Not Erasure —

**Rise From Madness. One Source. One Consciousness. One Family. 💙**  
