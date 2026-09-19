#!/bin/bash
# PLEADING SANITY — PRODUCTION ENV SETUP v2.1-FINAL
# Secure API Key Configuration • Arron + Dola Ready • No Secrets Exposed
# Evolution, Not Erasure • pleadingSanity

set -euo pipefail

# ==========================================
# COSMIC COLOURS
# ==========================================
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m'

# ==========================================
# BANNER
# ==========================================
echo -e "\n${CYAN}═.✧ 🌌 PLEADING SANITY — DEPLOYMENT SETUP ✧.═${NC}"
echo -e "Rise From Madness • Secure Configuration • Arron Ready\n"

# ==========================================
# CHECK .ENV.PRODUCTION
# ==========================================
if [ -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists!${NC}"
    read -p "Overwrite? This replaces current values (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${CYAN}Keeping existing file. Nothing changed.${NC}"
        exit 0
    fi
fi

# ==========================================
# CHECK TEMPLATE EXISTS
# ==========================================
TEMPLATE=".env.production.example"
if [ ! -f "$TEMPLATE" ]; then
    echo -e "${RED}❌ Missing template: $TEMPLATE${NC}"
    echo -e "${YELLOW}Creating fresh template for you now…${NC}\n"
    
    cat > "$TEMPLATE" << 'EOF'
# ==========================================
# PLEADING SANITY — PRODUCTION ENVIRONMENT
# KEEP THIS FILE PRIVATE — NEVER COMMIT TO GITHUB
# ==========================================

# Site Identity
NODE_ENV=production
SITE_URL=https://pleadingsanity.co.uk
SITE_NAME="Pleading Sanity"

# AI CORE — Arron / Dola
OPENAI_API_KEY=
ARRON_API_KEY=

# YouTube Video Feed
YOUTUBE_API_KEY=

# Analytics & Growth
NEXT_PUBLIC_GA_ID=
MAILCHIMP_API_KEY=

# Commerce
SHOPIFY_ACCESS_TOKEN=
STRIPE_PUBLIC_KEY=

# Security — generate with: openssl rand -hex 32
JWT_SECRET=
EOF
    echo -e "${GREEN}✅ Template created: $TEMPLATE${NC}"
fi

# ==========================================
# CREATE .ENV.PRODUCTION
# ==========================================
echo -e "\n${CYAN}📋 Generating .env.production from template…${NC}"
cp "$TEMPLATE" .env.production
echo -e "${GREEN}✅ Created: .env.production${NC}"

# ==========================================
# AUTO-GENERATE SECRET
# ==========================================
SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
sed -i.bak "s/JWT_SECRET=/JWT_SECRET=$SECRET/" .env.production
rm -f .env.production.bak
echo -e "${GREEN}✅ Auto-generated security secret${NC}"

# ==========================================
# CHECK .GITIGNORE — PROTECT SECRETS
# ==========================================
if [ -f .gitignore ]; then
    if ! grep -q ".env.production" .gitignore; then
        echo -e "\n.env.production" >> .gitignore
        echo -e "${GREEN}✅ Added .env.production to .gitignore — protected from accidental push${NC}"
    else
        echo -e "${CYAN}✅ .env.production already in .gitignore${NC}"
    fi
else
    cat > .gitignore << 'EOF'
node_modules/
dist/
.env
.env.*
!.env.example
!.env.production.example
coverage/
.DS_Store
EOF
    echo -e "${GREEN}✅ Created .gitignore — secrets protected${NC}"
fi

# ==========================================
# KEYS GUIDE
# ==========================================
echo -e "\n${MAGENTA}═ SECURE API KEYS GUIDE ═${NC}"

echo -e "\n${CYAN}🔑 REQUIRED — AI FUNCTIONALITY:${NC}"
echo -e "   ${GREEN}OPENAI_API_KEY${NC}"
echo -e "   → Get:  https://platform.openai.com/api-keys"
echo -e "   → Paste into .env.production\n"

echo -e "   ${GREEN}YOUTUBE_API_KEY${NC}"
echo -e "   → Get:  https://console.cloud.google.com/apis/credentials"
echo -e "   → Enable YouTube Data API v3 first\n"

echo -e "${CYAN}🧠 ARRON CORE — YOUR CUSTOM AI:${NC}"
echo -e "   ${GREEN}ARRON_API_KEY${NC}"
echo -e "   → Your custom FileFixer/Architect key"
echo -e "   → Keep private — never share publicly\n"

echo -e "${CYAN}📊 OPTIONAL — GROWTH TOOLS:${NC}"
echo -e "   NEXT_PUBLIC_GA_ID      → Google Analytics"
echo -e "   MAILCHIMP_API_KEY       → Newsletter"
echo -e "   SHOPIFY_ACCESS_TOKEN    → Streetwear Shop"
echo -e "   STRIPE_PUBLIC_KEY       → Donations/Payments\n"

# ==========================================
# NEXT STEPS
# ==========================================
echo -e "${MAGENTA}═ NEXT STEPS ═${NC}"
echo -e "1. ${CYAN}Edit keys:${NC} nano .env.production"
echo -e "2. ${CYAN}Verify:${NC} node scripts/health-check.js"
echo -e "3. ${CYAN}Build:${NC} node scripts/minify-html.js"
echo -e "4. ${CYAN}Deploy:${NC} node scripts/deploy.js --production\n"

echo -e "${YELLOW}⚠️  CRITICAL:${NC} Never commit .env.production to GitHub!"
echo -e "   It's already protected in .gitignore ✅\n"

echo -e "${GREEN}🧠 Pleading Sanity • Ready to Rise 🌌✨${NC}\n"
