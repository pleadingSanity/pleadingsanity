# 🌐 Netlify Webhook Configuration Guide

## Overview
This guide explains how to configure webhooks to enable automatic deployments and the Cosmic-Master-Sync protocol for the Pleading Sanity project.

## Netlify Build Hooks

### Creating a Build Hook

1. **Access Netlify Dashboard**
   - Log in to [Netlify](https://netlify.com)
   - Select your site: `pleadingsanity`

2. **Navigate to Build Hooks**
   - Go to: Site settings → Build & deploy → Build hooks
   - Click "Add build hook"

3. **Configure Build Hook**
   - **Name**: `Cosmic-Master-Sync`
   - **Branch to build**: `main`
   - Click "Save"

4. **Copy Webhook URL**
   - Copy the generated webhook URL
   - Format: `https://api.netlify.com/build_hooks/{YOUR_HOOK_ID}`
   - Store this securely

### Testing the Build Hook

```bash
# Trigger a build via webhook
curl -X POST -d '{}' https://api.netlify.com/build_hooks/{YOUR_HOOK_ID}

# Expected response:
# HTTP 200 OK
```

## GitHub Webhook Integration

### Adding Webhook to GitHub Repository

1. **Access Repository Settings**
   - Go to: https://github.com/pleadingSanity/pleadingsanity/settings/hooks
   - Click "Add webhook"

2. **Configure Webhook**
   - **Payload URL**: `https://api.netlify.com/build_hooks/{YOUR_HOOK_ID}`
   - **Content type**: `application/json`
   - **Secret**: (Optional, leave blank for basic setup)
   - **SSL verification**: Enable SSL verification
   - **Events**: Select "Just the push event"
   - **Active**: ✅ Check this box
   - Click "Add webhook"

3. **Test Webhook**
   - GitHub will send a ping event
   - Check "Recent Deliveries" tab
   - Verify response is 200 OK

### Events to Trigger On

#### Recommended Events:
- ✅ **Push events** - Trigger on every push to main branch
- ✅ **Pull request** - Optional, for preview deploys
- ✅ **Workflow runs** - When GitHub Actions complete

#### Optional Events:
- **Releases** - When new releases are published
- **Branch creation** - When new branches are created

## Environment Variables Setup

### Required Variables in Netlify

1. **Navigate to Environment Variables**
   - Site settings → Environment variables
   - Click "Add a variable"

2. **Add Each Variable**

```bash
# AI & Chat
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# YouTube
YOUTUBE_API_KEY=AIza...
YOUTUBE_CHANNEL_ID=UC0iP4yT2PpQqhFQ0oEc7ZVw

# Shopify
SHOPIFY_API_KEY=...
SHOPIFY_API_SECRET=...
SHOPIFY_STORE_DOMAIN=dqfzb1-ki.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=...

# Payhip
PAYHIP_API_KEY=...

# Arron API
ARRON_API_KEY=PLEADINGSANITY_API_KEY_1234

# Site Config
NEXT_PUBLIC_SITE_URL=https://pleadingsanity.co.uk
NODE_ENV=production
```

3. **Set Scopes**
   - ✅ Production
   - ✅ Deploy previews
   - ✅ Branch deploys

### Verifying Environment Variables

After deployment, check:
```bash
# Via status page
https://pleadingsanity.co.uk/status.html

# Via health check endpoint
curl https://pleadingsanity.co.uk/.netlify/functions/health-check
```

## Deploy Notifications

### Slack Integration (Optional)

1. **Create Slack Webhook**
   - Go to Slack API: https://api.slack.com/apps
   - Create new app
   - Enable Incoming Webhooks
   - Copy webhook URL

2. **Configure in Netlify**
   - Site settings → Build & deploy → Deploy notifications
   - Click "Add notification"
   - Select "Outgoing webhook"
   - Add Slack webhook URL

### Discord Integration (Optional)

Similar to Slack:
1. Create Discord webhook in server settings
2. Add to Netlify deploy notifications
3. Customize message format

## Custom Deploy Messages

### GitHub Commit Messages

Use special keywords to control deployments:

```bash
# Skip deployment
git commit -m "docs: update README [skip ci]"

# Force rebuild
git commit -m "fix: force rebuild [rebuild]"

# Cosmic protocol activation
git commit -m "sync: Cosmic-Master-Sync protocol active"
```

## Webhook Security

### Best Practices

1. **Use HTTPS Only**
   - Always use secure webhook URLs
   - Verify SSL certificates

2. **Implement Webhook Secrets** (Advanced)
   ```javascript
   // In your function
   const crypto = require('crypto');
   
   function verifyWebhook(payload, signature, secret) {
     const hash = crypto
       .createHmac('sha256', secret)
       .update(payload)
       .digest('hex');
     return hash === signature;
   }
   ```

3. **Rate Limiting**
   - Monitor webhook calls
   - Set rate limits in Netlify
   - Review logs regularly

4. **IP Whitelist** (Optional)
   - Netlify IPs: Check [Netlify docs](https://docs.netlify.com/configure-builds/build-hooks/)
   - GitHub IPs: Check [GitHub docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-githubs-ip-addresses)

## Monitoring Webhooks

### Netlify Deploy Logs

1. **Access Logs**
   - Netlify Dashboard → Deploys
   - Click on any deploy
   - View "Deploy log"

2. **Common Issues**
   - Build failures → Check function logs
   - Environment variables missing → Verify settings
   - Timeout errors → Increase build timeout

### GitHub Webhook Logs

1. **Access Webhook Settings**
   - Repository → Settings → Webhooks
   - Click on your webhook
   - Check "Recent Deliveries"

2. **Debugging**
   - Response code 200 = Success
   - Response code 4xx = Client error
   - Response code 5xx = Server error

## Cosmic-Master-Sync Workflow

### Automatic Sync Process

When code is pushed to main:

1. **GitHub Actions Triggers**
   - Runs `.github/workflows/sync-main.yml`
   - Verifies code integrity
   - Checks environment config

2. **Webhook Fires**
   - Triggers Netlify build hook
   - Initiates deployment

3. **Netlify Builds**
   - Pulls latest code
   - Installs dependencies
   - Runs build process
   - Deploys to production

4. **Phase Report Generated**
   - GitHub Actions summary
   - Netlify deploy log
   - Status page updated

### Manual Sync Trigger

```bash
# Via GitHub CLI
gh workflow run sync-main.yml

# Via Netlify CLI
netlify deploy --prod

# Via API
curl -X POST https://api.netlify.com/build_hooks/{YOUR_HOOK_ID}
```

## Troubleshooting

### Webhook Not Triggering

1. **Check GitHub Webhook**
   - Verify webhook is active
   - Check recent deliveries
   - Look for error messages

2. **Check Netlify Hook**
   - Test with manual trigger
   - Verify hook is enabled
   - Check branch name matches

3. **Review Logs**
   - GitHub Actions logs
   - Netlify deploy logs
   - Function logs

### Build Failures

1. **Environment Variables**
   - Verify all required vars are set
   - Check for typos in variable names
   - Ensure scopes are correct

2. **Dependencies**
   - Check package.json is valid
   - Verify Node version compatibility
   - Clear build cache if needed

3. **Functions**
   - Verify functions directory is correct
   - Check function syntax
   - Review function logs

## Success Criteria

✅ Webhook URL configured  
✅ GitHub integration active  
✅ Environment variables set  
✅ Test deployment successful  
✅ Status page shows "operational"  
✅ Health check returns 200 OK  

---

## Cosmic Protocol Activation

When ready to activate full sync:

```markdown
> Begin full sync and deploy under Cosmic-Master-Sync protocol.
```

This triggers:
- ✅ Automated GitHub Actions verification
- ✅ Netlify build and deployment
- ✅ Health checks and status updates
- ✅ Phase reporting
- 🌌 Cosmic network fully operational

---

**Last Updated**: 2025-01-08  
**Status**: 🚀 Ready for Activation  
**Maintained by**: Pleading Sanity Team  
**Rise From Madness** 🧠
