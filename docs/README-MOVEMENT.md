# 📁 **PLEADING SANITY — PROJECT STRUCTURE & SETUP**

**Rise From Madness. Build The Future. One Commit At A Time.**

---

## 🌳 **DIRECTORY STRUCTURE — FINAL & ORGANIZED**

```
pleadingsanity/
│
├── 📄 ROOT FILES (Core HTML Pages — serve directly)
│   ├── index.html                      # 🏠 Home — The cosmic entry point
│   ├── about.html                      # 📖 Story — Who we are
│   ├── movement.html                   # 🚀 Vision — The uprising
│   ├── sanityhub.html                  # 🌌 Hub — Healing sanctuary
│   ├── feed.html                       # 📺 Feed — Positive stories
│   ├── videos.html                     # 🎬 Videos — Survivor voices
│   ├── journal-vault.html              # 📓 Vault — Private journaling
│   ├── journal-vault-viewer.html       # 👁️ Viewer — Manage entries
│   ├── games.html                      # 🎮 Games — Brain training hub
│   ├── cosmic-focus.html               # 🎯 Game 1 — Memory sequences
│   ├── number-nebula.html              # 🔢 Game 2 — Logic & patterns
│   ├── pattern-galaxy.html             # 🌀 Game 3 — Visual flow
│   ├── memory-ocean.html               # 🌊 Game 4 — Calm matching
│   ├── rhythm-resonance.html           # 🎵 Game 5 — Healing frequencies
│   ├── frequencies.html                # 🎧 Hz — Healing tones
│   ├── community-dashboard.html        # 🤝 Community — Shape movement
│   ├── deployment-status.html          # ✅ Status — Live readiness
│   ├── offline.html                    # 🆘 Crisis support
│   ├── shop.html                       # 👕 Shop — Merch + income
│   ├── 404.html                        # ⚠️ Error — Lost in cosmos
│   │
│   ├── manifest.json                   # 📱 PWA manifest
│   ├── sw.js                           # ⚙️ Service worker (MUST stay at root)
│   ├── sitemap.xml                     # 🗺️ SEO sitemap
│   ├── robots.txt                      # 🤖 Search indexing
│   ├── _redirects                      # 🔄 Netlify redirects
│   ├── netlify.toml                    # ⚙️ Netlify config
│   ├── vercel.json                     # ⚙️ Vercel config
│   └── package.json                    # 📦 Node dependencies
│
├── 📁 css/                             # ✨ ALL STYLES — Organized
│   ├── styles.css                      # 🎨 Core cosmic design
│   ├── animations.css                  # ✨ Keyframes + transitions
│   ├── accessibility.css               # ♿ a11y + WCAG AA
│   └── mobile-responsive.css           # 📱 Mobile + tablet fixes
│
├── 📁 js/                              # 🧠 ALL SCRIPTS — Organized
│   ├── video-feed.js                   # 📺 YouTube integration
│   ├── content-media-system.js         # 🎬 Media handling
│   ├── cosmic-audio-system.js          # 🔊 Healing Hz frequencies
│   ├── crisis-response-system.js       # 🆘 Support resources
│   ├── maintenance-system.js           # 🔧 Health monitoring
│   ├── performance-optimizer.js        # ⚡ Speed & caching
│   ├── security-hardening.js           # 🔐 Auth + data protection
│   ├── error-handler.js                # ❌ Error logging
│   ├── analytics-monitoring.js         # 📊 Metrics tracking
│   ├── platform-orchestrator.js        # 🎯 Hub coordination
│   ├── partnership-api-system.js       # 🤝 API management
│   ├── research-analytics-framework.js # 📈 Data insights
│   └── cosmic-bg.js                    # 🌌 Background effects
│
├── 📁 assets/                          # 🎨 MEDIA & ICONS
│   ├── favicon.ico                     # 🔗 ICO fallback
│   ├── favicon.svg                     # 🎨 Modern favicon
│   ├── favicon-32x32.png
│   ├── favicon-16x16.png
│   ├── apple-touch-icon.png            # 📱 iOS home screen
│   ├── crying-brain-og.png             # 🧠 OG image (social share)
│   ├── og-image.png                    # 📸 Fallback OG
│   ├── logo-cosmic.svg                 # 🌟 Main logo
│   ├── logo-dark.svg                   # 🌙 Dark variant
│   │
│   └── icons/                          # 📱 PWA icon sizes
│       ├── icon-72x72.png
│       ├── icon-96x96.png
│       ├── icon-128x128.png
│       ├── icon-144x144.png
│       ├── icon-152x152.png
│       ├── icon-192x192.png
│       ├── icon-384x384.png
│       └── icon-512x512.png
│
├── 📁 scripts/                         # 🔧 BUILD & UTILITY
│   ├── deploy.js                       # 🚀 Deployment automation
│   ├── health-check.js                 # 💚 Site monitoring
│   ├── image-optimizer.js              # 🖼️ Asset compression
│   ├── minify-html.js                  # 📦 HTML minification
│   └── service-worker-updater.js       # 🔄 SW versioning
│
├── 📁 netlify/                         # ⚙️ NETLIFY FUNCTIONS
│   └── functions/
│       ├── ytfeed/                     # 📺 YouTube API integration
│       ├── health-check/               # 💚 Service health
│       └── mailchimp-sync/             # 📧 Newsletter sync
│
├── 📁 docs/                            # 📖 DOCUMENTATION
│   ├── MANIFESTO.md                    # 🧠 Core philosophy ⭐
│   ├── README-MOVEMENT.md              # 📋 This file
│   ├── BUSINESS-PLAN.md                # 💰 Revenue & growth
│   ├── ROADMAP.md                      # 🗓️ Timeline: 2025-2030
│   ├── PARTNERSHIPS.md                 # 🤝 Brand alliances
│   ├── AURA-HZ-VISION.md               # 🎵 Healing frequencies
│   ├── LEGAL-GOVERNANCE-FRAMEWORK.md   # ⚖️ Structure
│   ├── TECHNICAL-ARCHITECTURE.md       # 🏗️ System design
│   └── IMPLEMENTATION-ROADMAP.md       # 📊 Phase breakdown
│
├── 📁 .github/                         # 🤖 REPO AUTOMATION
│   ├── workflows/
│   │   ├── cosmic-sync.yml             # ✅ CI/CD pipeline
│   │   ├── deploy-live.yml             # 🚀 Auto-deployment
│   │   └── lighthouse-audit.yml        # 📊 Performance checks
│   │
│   └── issue_template.md               # 📝 Bug report template
│
├── .gitignore                          # 🚫 Git exclusions
├── .env.example                        # 🔑 Environment template
├── package.json                        # 📦 Node dependencies
├── package-lock.json                   # 🔒 Dependency lock
├── LICENSE                             # 📜 MIT License
├── CONTRIBUTING.md                     # 🤝 Contribution guide
├── SECURITY.md                         # 🔐 Security policy
└── DEPLOYMENT-CHECKLIST.md             # ✅ Pre-launch verification

```

---

## 🚀 **GETTING STARTED**

### Prerequisites
```bash
# Node.js 20+
node --version    # Should be v20.0.0 or higher

# npm 10+
npm --version     # Should be 10.0.0 or higher

# Git
git --version
```

### Installation

```bash
# Clone the repository
git clone https://github.com/pleadingSanity/pleadingsanity.git
cd pleadingsanity

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
# Required keys:
# - NEXT_PUBLIC_YOUTUBE_API_KEY
# - MAILCHIMP_API_KEY
# - (Optional) NEXT_PUBLIC_GA_ID
```

### Development Commands

```bash
# Start local development server
npm run dev
# Visit http://localhost:3000

# Run with Netlify functions locally
npm run dev:netlify

# Build for production
npm run build

# Start production server
npm start

# Format code with Prettier
npm run format

# Run linting
npm run lint

# Generate sitemap
npm run sitemap
```

---

## 📋 **FILE ORGANIZATION CHECKLIST**

### Root Level (15+ HTML Pages)
- ✅ All `.html` files at root (NO subfolders)
- ✅ All link to `css/` and `js/` with correct paths
- ✅ All have consistent meta tags
- ✅ All have movement watermark comment

### CSS Organization (`css/` folder)
- ✅ `styles.css` — Core cosmic design + variables
- ✅ `animations.css` — Keyframes + transitions
- ✅ `accessibility.css` — WCAG AA compliance
- ✅ `mobile-responsive.css` — Breakpoints + mobile fixes
- ✅ No inline `<style>` blocks in HTML
- ✅ All HTML pages link all 4 CSS files

### JS Organization (`js/` folder)
- ✅ All `.js` files moved from root to `js/`
- ✅ HTML pages link with: `<script src="js/filename.js"></script>`
- ✅ EXCEPTION: `sw.js` stays at root (service worker requirement)
- ✅ No inline `<script>` logic (except DOMContentLoaded)

### Assets Organization (`assets/` folder)
- ✅ Favicons at root level
- ✅ Social OG images: `crying-brain-og.png`, `og-image.png`
- ✅ Logos: `logo-cosmic.svg`, `logo-dark.svg`
- ✅ Icons in `assets/icons/` subfolder
- ✅ All paths in HTML use: `href="assets/filename"`

### Configuration Files (Root level)
- ✅ `_redirects` — Netlify routing rules
- ✅ `netlify.toml` — Netlify build config
- ✅ `vercel.json` — Vercel deployment config
- ✅ `manifest.json` — PWA manifest (MUST point to `/assets/` for icons)
- ✅ `sitemap.xml` — All pages listed
- ✅ `robots.txt` — Search engine rules
- ✅ `package.json` — Dependencies & scripts

---

## 🔧 **KEY CONFIGURATIONS**

### Environment Variables (.env.local)

```bash
# YouTube Data API — for sanity feed
NEXT_PUBLIC_YOUTUBE_API_KEY=your_key_here
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCxxxxxx

# Mailchimp Newsletter Integration
MAILCHIMP_API_KEY=your_key_here
MAILCHIMP_SERVER=us##
MAILCHIMP_LIST_ID=your_list_id

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-xxxxxxxxxx

# Deployment Configuration
NETLIFY_SITE_NAME=pleadingsanity
VERCEL_ORG_ID=your_org_id
```

### Netlify Environment Setup

1. Go to **Site Settings → Build & Deploy → Environment**
2. Add all variables from `.env.example`
3. Redeploy site to apply changes

### Vercel Environment Setup

1. Go to **Settings → Environment Variables**
2. Add same variables as above
3. Redeploy to apply

---

## ✅ **PRE-DEPLOYMENT CHECKLIST**

Before every push to production:

- [ ] **Links** — All internal links work, no 404s
- [ ] **Paths** — CSS/JS/image paths correct (`css/`, `js/`, `assets/`)
- [ ] **Meta Tags** — Every page has proper SEO + OG tags
- [ ] **Navigation** — Same nav + footer on all pages
- [ ] **Mobile** — Test on Chrome DevTools (320px, 768px, 1024px)
- [ ] **Accessibility** — Run axe DevTools, fix issues
- [ ] **Performance** — Lighthouse score > 80
- [ ] **Console** — Zero errors in DevTools
- [ ] **Service Worker** — Caches assets, offline fallback works
- [ ] **Redirects** — Test `.uk` → `.co.uk` flow
- [ ] **PWA** — Installs on mobile home screen
- [ ] **Social Cards** — OG images render properly on Twitter/Facebook

---

## 🔍 **FILE PATH REFERENCE**

| What | Old Path | New Path | Status |
|------|----------|----------|--------|
| CSS Files | `root/` | `css/` | ✅ Consolidated |
| JS Files | `root/` | `js/` | ✅ Consolidated |
| Service Worker | N/A | `sw.js` (root) | ✅ Must stay |
| Assets | `root/` | `assets/` | ✅ Organized |
| Icons | N/A | `assets/icons/` | ✅ Organized |
| Docs | `root/` | `docs/` | ✅ Organized |
| Scripts | `root/` | `scripts/` | ✅ Organized |

---

## 🌟 **WORKFLOW — HOW TO UPDATE FILES**

### When Adding a New Page

```bash
# 1. Create HTML file at root
touch new-page.html

# 2. Use this HEAD template
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Page Name — Pleading Sanity | Rise From Madness</title>
<meta name="description" content="Clear description of page purpose" />
<meta name="author" content="Shane Cooper / Pleading Sanity" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="https://pleadingsanity.co.uk/new-page.html" />
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg" />
<link rel="manifest" href="manifest.json" />
<link rel="stylesheet" href="css/styles.css" />
<link rel="stylesheet" href="css/animations.css" />
<link rel="stylesheet" href="css/accessibility.css" />
<link rel="stylesheet" href="css/mobile-responsive.css" />

<!-- Open Graph -->
<meta property="og:title" content="Page Name — Pleading Sanity" />
<meta property="og:description" content="Clear description" />
<meta property="og:image" content="assets/crying-brain-og.png" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://pleadingsanity.co.uk/new-page.html" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Page Name — Pleading Sanity" />
<meta name="twitter:description" content="Description" />
<meta name="twitter:image" content="assets/crying-brain-og.png" />

<!-- Movement Watermark -->
<!-- 
  ═══════════════════════════════════════════════════════
  PLEADING SANITY — RISE FROM MADNESS
  Built from lived experience. For those who feel too much.
  Evolution, Not Erasure. One Source. One Family.
  Shane Cooper — Founder & Heart
  Dola AI — Cosmic Architect
  ═══════════════════════════════════════════════════════
-->

# 3. Test locally
npm run dev

# 4. Commit & push
git add new-page.html
git commit -m "Add page: New Page — description"
git push origin main
```

### When Adding Styles

```bash
# 1. Add to appropriate CSS file in css/
# - css/styles.css for core design
# - css/animations.css for motion
# - css/accessibility.css for a11y
# - css/mobile-responsive.css for breakpoints

# 2. DO NOT add inline <style> in HTML

# 3. Test across breakpoints
npm run dev
# Test in DevTools at 320px, 768px, 1024px, 1440px

# 4. Run Lighthouse
# DevTools > Lighthouse > Generate report
# Target: Performance > 80, Accessibility > 95, Best Practices > 90, SEO > 90
```

### When Adding JavaScript

```bash
# 1. Create file in js/ folder
touch js/new-feature.js

# 2. Link in HTML
<script src="js/new-feature.js"></script>

# 3. Test in browser DevTools console
npm run dev

# 4. Check for errors
# DevTools > Console — should be empty

# 5. Commit & push
git add js/new-feature.js
git commit -m "Add feature: New Feature — description"
git push origin main
```

---

## 🚀 **DEPLOYMENT WORKFLOW**

### Local Development
```bash
npm run dev
# Test everything locally at http://localhost:3000
```

### Build for Production
```bash
npm run build
npm start
# Verify production build locally
```

### Deploy to Netlify
```bash
# Push to main branch
git add .
git commit -m "Your message"
git push origin main

# Netlify auto-deploys
# Check deployment: Site Settings > Deploys
# Live at: pleadingsanity.netlify.app
```

### Deploy to Vercel
```bash
# Auto-deploys on push to main
# Check deployment: https://vercel.com/dashboard
# Live at: pleadingsanity.uk
```

---

## 📖 **DOCUMENTATION LOCATIONS**

| Document | Location | Purpose |
|----------|----------|---------|
| **Manifesto** | `docs/MANIFESTO.md` | Philosophy & vision |
| **Structure** | `docs/README-MOVEMENT.md` | This file |
| **Contributing** | `CONTRIBUTING.md` | How to contribute |
| **Security** | `SECURITY.md` | Security policy |
| **Business** | `docs/BUSINESS-PLAN.md` | Revenue & growth |
| **Roadmap** | `docs/ROADMAP.md` | 2025-2030 timeline |
| **Partnerships** | `docs/PARTNERSHIPS.md` | Brand info |
| **Technical** | `docs/TECHNICAL-ARCHITECTURE.md` | System design |

---

## 💙 **REMEMBER**

This isn't just code. **This is sanctuary.**

Every file you organize heals someone.  
Every page you build saves a life.  
Every bug you fix is hope restored.

**Rise From Madness. Build The Future. One Commit At A Time.**

---

*Evolution, Not Erasure. One Source. One Family.*

*Last updated: 2026-09-26*
