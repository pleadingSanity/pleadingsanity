# 🚀 Deployment Guide - Pleading Sanity Cosmic Network

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] Lint checks passed: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in dev mode
- [ ] All dependencies up to date

### Environment Setup
- [ ] `.env.example` updated with all required variables
- [ ] Netlify environment variables configured
- [ ] API keys validated and working
- [ ] Domain configuration verified

### Content Verification
- [ ] All pages loading correctly
- [ ] Navigation links working
- [ ] Images and assets loading
- [ ] Video feed displaying
- [ ] Shop integrations functional

### Arron AI Core
- [ ] ChatGPT widget loading
- [ ] Arron AI Core function deployed
- [ ] Chat interface responsive
- [ ] API endpoints tested
- [ ] Fallback responses working

## Deployment Process

### 1. Local Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Test on http://localhost:3000
# Verify all features working

# Run production build
npm run build

# Test production build locally
npm start
```

### 2. Netlify Deployment

#### Initial Setup
1. Connect GitHub repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` or `.` (depending on setup)
   - **Functions directory**: `netlify/functions`

3. Set environment variables in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add all variables from `.env.example`
   - Save and redeploy

#### Automatic Deployment
- Push to `main` branch triggers automatic deployment
- GitHub Actions runs pre-deployment checks
- Netlify builds and deploys automatically
- Deployment preview available within minutes

#### Manual Deployment
```bash
# Using Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

### 3. Post-Deployment Verification

#### Health Checks
- [ ] Site loads at production URL
- [ ] All pages accessible
- [ ] No 404 errors
- [ ] SSL certificate active
- [ ] Performance metrics acceptable

#### Functional Testing
- [ ] Arron AI chat works
- [ ] YouTube video feed loads
- [ ] Shop links redirect correctly
- [ ] Newsletter signup functional
- [ ] Contact forms working

#### API Testing
```bash
# Test Arron AI Core
curl -X GET "https://pleadingsanity.co.uk/.netlify/functions/arron-ai-core?type=greeting"

# Test YouTube Feed
curl -X GET "https://pleadingsanity.co.uk/.netlify/functions/ytFeed"
```

## Environment Variables

### Required Variables
```bash
# AI & Chat
NEXT_PUBLIC_OPENAI_API_KEY=sk-...
OPENAI_API_KEY=sk-...

# YouTube
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC0iP4yT2PpQqhFQ0oEc7ZVw

# Shopify
SHOPIFY_API_KEY=...
SHOPIFY_STORE_DOMAIN=dqfzb1-ki.myshopify.com

# Site Config
NEXT_PUBLIC_SITE_URL=https://pleadingsanity.co.uk
NODE_ENV=production
```

### Setting in Netlify
1. Navigate to: Site settings → Environment variables
2. Click "Add a variable"
3. Enter key and value
4. Select scopes (Production, Deploy previews, Branch deploys)
5. Click "Create variable"

## Domain Configuration

### Custom Domain Setup
1. Go to Netlify: Domain settings
2. Add custom domain: `pleadingsanity.co.uk`
3. Configure DNS records:
   ```
   Type  Name  Value
   A     @     75.2.60.5
   CNAME www   pleadingsanity.netlify.app
   ```
4. Enable HTTPS (automatic with Netlify)

### Domain Verification
- [ ] Domain resolves to Netlify
- [ ] HTTPS working
- [ ] WWW redirect configured
- [ ] SSL certificate active

## Rollback Procedure

If deployment fails or has critical issues:

### Using Netlify Dashboard
1. Go to Deploys
2. Find previous successful deploy
3. Click "Publish deploy"
4. Confirm rollback

### Using Git
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to previous commit
git reset --hard <commit-hash>
git push --force origin main
```

## Monitoring

### Netlify Analytics
- Track page views
- Monitor performance
- Review error logs
- Check function invocations

### Function Logs
```bash
# View recent function logs
netlify functions:log arron-ai-core

# View all function logs
netlify logs
```

### Error Tracking
- Check Netlify deploy logs
- Review browser console errors
- Monitor API response times
- Track user feedback

## Performance Optimization

### Build Optimization
- Use `swcMinify: true` in Next.config.js
- Optimize images with Sharp
- Enable PWA caching
- Minimize bundle size

### Runtime Optimization
- Lazy load components
- Implement code splitting
- Use CDN for static assets
- Cache API responses

## Deployment Phases

### Phase 1: Development
- Feature development in dev repo
- Local testing
- Preview deployments

### Phase 2: Staging
- Merge to staging branch
- Deploy to staging environment
- Full QA testing
- Performance testing

### Phase 3: Production
- Merge to main branch
- Automatic deployment
- Post-deployment verification
- Phase report generation

## Emergency Procedures

### Site Down
1. Check Netlify status
2. Review recent deployments
3. Rollback if needed
4. Notify users via social media

### API Failures
1. Check function logs
2. Verify environment variables
3. Test API endpoints
4. Fallback to cached data

### Build Failures
1. Review build logs
2. Check for dependency issues
3. Verify Node version compatibility
4. Test build locally

## Contact & Support

### Technical Issues
- Email: pleadingsanity1@gmail.com
- GitHub Issues: Report in main repo

### Deployment Support
- Netlify Support: https://answers.netlify.com
- Netlify Docs: https://docs.netlify.com

---

## Cosmic Phase Reporting Template

```markdown
# Deployment Phase Report - [Date]

## Deployment Details
- **Branch**: main
- **Commit**: [commit hash]
- **Deploy Time**: [timestamp]
- **Build Duration**: [duration]

## Changes Deployed
- [Feature 1]
- [Feature 2]
- [Bug fix 1]

## Verification Status
✅ All checks passed
✅ Build successful  
✅ Site live and responsive
✅ APIs functioning
✅ No critical errors

## Performance Metrics
- Build time: [time]
- Bundle size: [size]
- Lighthouse score: [score]

## Next Steps
- [Upcoming feature]
- [Scheduled maintenance]

---
*Cosmic-Master-Sync Protocol Active*  
*Rise From Madness* 🌌
```

---

**Last Updated**: [Current Date]  
**Status**: 🚀 Ready for Deployment  
**Maintained by**: Pleading Sanity Team
