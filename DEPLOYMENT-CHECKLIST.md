# 🚀 Production Deployment Checklist

## Pre-Deployment Checks

### ✅ File Structure
- [x] All HTML files use lowercase naming (shop.html, videos.html, about.html)
- [x] package.json and next.config.js are lowercase
- [x] All navigation links point to correct files
- [x] Missing files created (sanity-hub.html, journal-vault.html)

### 🔐 API Authentication Configuration

#### Required for Full AI Functionality
- [ ] **OPENAI_API_KEY** - Set in environment variables
  - Get from: https://platform.openai.com/api-keys
  - Used for: ChatGPT widget, Arron AI companion
  - Status: REQUIRED for AI features
  
- [ ] **NEXT_PUBLIC_OPENAI_API_KEY** - Public API key for client-side
  - Same source as above
  - Status: REQUIRED for ChatGPT widget

- [ ] **ARRON_API_KEY** - Custom FileFixer API key
  - Set in .env.production or hosting platform
  - Used for: Website updates, deployment automation
  - Default: PLEADINGSANITY_API_KEY_1234 (change in production)

#### Required for Video Feed
- [ ] **YOUTUBE_API_KEY** - YouTube Data API v3
  - Get from: https://console.cloud.google.com/apis/credentials
  - Used for: Video feed, latest videos component
  - Status: REQUIRED for video features

#### Recommended for Full Functionality
- [ ] **NEXT_PUBLIC_GA_ID** - Google Analytics tracking
- [ ] **MAILCHIMP_API_KEY** - Newsletter signups
- [ ] **SHOPIFY_ACCESS_TOKEN** - E-commerce integration
- [ ] **NETLIFY_ACCESS_TOKEN** or **VERCEL_TOKEN** - Deployment automation

### 🔒 Security Configuration
- [x] CSRF protection enabled
- [x] Security headers configured in next.config.js
- [x] Environment variables not hardcoded
- [x] .env files in .gitignore
- [ ] Production JWT_SECRET generated
- [ ] Production SESSION_SECRET generated

### 📦 Build Configuration
- [x] package.json scripts configured
- [x] next.config.js properly set up
- [x] netlify.toml configured
- [x] vercel.json configured
- [ ] Dependencies installed (run: npm ci)
- [ ] Build succeeds (run: npm run build)

### 🌐 Deployment Platform Setup

#### Option 1: Netlify (Recommended)
1. [ ] Create account at https://netlify.com
2. [ ] Connect GitHub repository
3. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next` or `/`
4. [ ] Add environment variables in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add all required API keys from .env.production.example
5. [ ] Enable automatic deploys from main branch
6. [ ] Set up custom domain (optional)

#### Option 2: Vercel
1. [ ] Create account at https://vercel.com
2. [ ] Import GitHub repository
3. [ ] Vercel auto-detects Next.js settings
4. [ ] Add environment variables in Vercel dashboard
5. [ ] Deploy

#### Option 3: GitHub Pages
1. [ ] Enable GitHub Pages in repository settings
2. [ ] Select branch: main
3. [ ] Note: Static hosting only, limited API functionality

### 🧪 Testing Before Go-Live
- [ ] Run health check: `npm run health-check`
- [ ] Run deployment check: `node check-deployment.js`
- [ ] Test all navigation links
- [ ] Test video feed loads
- [ ] Test ChatGPT widget (if API key configured)
- [ ] Test newsletter signup (if configured)
- [ ] Test shop integration links
- [ ] Mobile responsive check
- [ ] Cross-browser testing (Chrome, Firefox, Safari)

### 📊 Post-Deployment Verification
- [ ] Site loads at production URL
- [ ] SSL certificate active (https)
- [ ] All pages accessible
- [ ] AI features working (if keys configured)
- [ ] Video feed loading
- [ ] Forms submitting
- [ ] Analytics tracking (if configured)
- [ ] Performance check (Lighthouse score)
- [ ] SEO verification (meta tags, sitemap)

### 🔄 Ongoing Maintenance
- [ ] Set up monitoring (uptime, errors)
- [ ] Configure backup strategy
- [ ] Plan for content updates
- [ ] Monitor API usage/quotas
- [ ] Review security logs
- [ ] Update dependencies regularly

## Quick Setup Commands

```bash
# 1. Setup production environment
./scripts/setup-production.sh

# 2. Install dependencies
npm ci

# 3. Run health check
npm run health-check

# 4. Test build locally
npm run build
npm run start

# 5. Deploy to Netlify
npm run deploy:netlify

# 6. Deploy to Vercel
npm run deploy:vercel
```

## Environment Variables Reference

### Required for AI Features
```bash
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
ARRON_API_KEY=your-key-here
```

### Required for Videos
```bash
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC0iP4yT2PpQqhFQ0oEc7ZVw
```

### Recommended
```bash
NEXT_PUBLIC_GA_ID=G-...
MAILCHIMP_API_KEY=...
SHOPIFY_ACCESS_TOKEN=...
```

## Common Issues & Solutions

### Issue: "API key missing" errors
**Solution:** Set API keys in hosting platform environment variables

### Issue: Build fails
**Solution:** 
1. Check Node.js version (requires 18.17+)
2. Clear cache: `rm -rf .next node_modules && npm ci`
3. Check for syntax errors

### Issue: Videos not loading
**Solution:** Verify YOUTUBE_API_KEY is set and valid

### Issue: ChatGPT widget not working
**Solution:** Verify NEXT_PUBLIC_OPENAI_API_KEY is set

### Issue: 404 errors on deployment
**Solution:** Ensure trailing slash config in next.config.js

## Support & Documentation

- **Full Deployment Guide:** See DEPLOYMENT-GUIDE.md
- **Environment Variables:** See .env.production.example
- **Security:** See SECURITY.md
- **Contributing:** See CONTRIBUTING.md

---

🧠 **Pleading Sanity - Rise From Madness** 🌌

Last updated: October 2025
