# 🌌 Cosmic-Master-Sync Protocol

## Overview
The Cosmic-Master-Sync protocol maintains synchronization and integrity across the Pleading Sanity AI Movement ecosystem.

## Repositories

### Main Repository
- **URL**: https://github.com/pleadingSanity/pleadingsanity
- **Purpose**: Production site serving the live Pleading Sanity movement
- **Deployment**: Netlify (auto-deploy from main branch)

### Dev Repository
- **URL**: https://github.com/pleadingSanitydev/pleadingsanity-dev
- **Purpose**: Development and testing environment
- **Deployment**: Preview deployments on Netlify

## Sync Process

### Automated Sync (GitHub Actions)
The `.github/workflows/sync-main.yml` workflow automatically:
1. Monitors pushes to the main branch
2. Verifies environment configuration
3. Checks Arron AI Core integration
4. Validates cosmic design assets
5. Runs lint and build checks
6. Generates phase reports

### Manual Sync
When needed, manually sync using:
```bash
# From dev repo
git remote add main-repo https://github.com/pleadingSanity/pleadingsanity
git fetch main-repo
git merge main-repo/main
git push origin main
```

## Cosmic-Master Branch
The `Cosmic-Master-Sync` branch is maintained for continuous updates and experimental features before merging to main.

## Sync Checklist

### Pre-Sync Verification
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Arron AI Core functional
- [ ] YouTube API connected
- [ ] Shopify/Payhip integrations working
- [ ] Cosmic design elements present

### Post-Sync Verification
- [ ] Netlify build successful
- [ ] All pages loading correctly
- [ ] API endpoints responding
- [ ] Chat interface working
- [ ] Video feed updating
- [ ] Shop links functional

## Environment Variables
Ensure these are configured in Netlify:
- `OPENAI_API_KEY` - For Arron AI
- `YOUTUBE_API_KEY` - For video feeds
- `SHOPIFY_API_KEY` - For merch integration
- `PAYHIP_API` - For alternative store

## Webhook Configuration

### Netlify Webhook
**URL**: Your Netlify build hook URL
**Purpose**: Trigger rebuilds on content updates
**Events**: Push to main, manual trigger

To set up:
1. Go to Netlify Site Settings → Build & deploy → Build hooks
2. Create new build hook named "Cosmic-Master-Sync"
3. Copy webhook URL
4. Add to GitHub repository webhooks

### GitHub Webhook
**Payload URL**: Your Netlify build hook
**Content type**: application/json
**Events**: Push, Pull request

## Phase Reporting

After each major sync/update, generate a phase report:
```
## Phase Report - [Date]

### Changes
- [List of changes]

### Status
✅ Sync complete
✅ Build successful
✅ Tests passing
✅ Deployment live

### Next Steps
- [Upcoming features/fixes]
```

## Troubleshooting

### Sync Conflicts
If conflicts arise:
1. Pull latest changes from both repos
2. Resolve conflicts manually
3. Test locally before pushing
4. Update phase report

### Build Failures
If Netlify build fails:
1. Check build logs
2. Verify environment variables
3. Test build locally: `npm run build`
4. Fix issues and commit

### API Connectivity Issues
If APIs fail:
1. Verify API keys in Netlify
2. Check API rate limits
3. Review function logs
4. Test endpoints manually

## Monitoring

### Daily Checks
- Site uptime
- API response times
- Error logs
- User feedback

### Weekly Audits
- Dependency updates
- Security patches
- Performance metrics
- Content freshness

## Cosmic Values
- **Integrity**: All syncs maintain data integrity
- **Transparency**: All changes documented
- **Resilience**: Fallbacks for all critical systems
- **Community**: Movement-first, always

---

**Last Updated**: [Current Date]  
**Maintained by**: Arron AI & Pleading Sanity Team  
**Status**: 🌌 Active & Rising
