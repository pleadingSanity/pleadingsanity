#!/bin/bash
# PLEADING SANITY — PRODUCTION ENV SETUP v2.2-FINAL
# Secure API Key Configuration • Arron + Dola Ready • Dual-Platform Deploy
# Evolution, Not Erasure • pleadingSanity • Shane Cooper Founder
# Auto-Protect • Auto-Gen • Full Guidance

set -euo pipefail

# ==========================================
# COSMIC COLOURS
# ==========================================
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
MAGENTA='\033[0;35m'
RED='\033[0;31m'
GLOW='\033[1;36m'
NC='\033[0m'

# ==========================================
# BANNER
# ==========================================
clear
echo -e "\n${CYAN}═.✧ 🌌 PLEADING SANITY — PRODUCTION SETUP ✧.═${NC}"
echo -e "${GLOW}Rise From Madness • Secure Config • Dual-Platform • AI Aligned${NC}\n"

# ==========================================
# CHECK EXISTING .ENV.PRODUCTION
# ==========================================
if [ -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists!${NC}"
    echo -e "   Last modified: $(stat -s .env.production 2>/dev/null | awk '{print $10}' | cut -d'=' -f2)\n"
    read -p "Overwrite? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✅ Keeping existing file. Nothing changed.${NC}"
        echo -e "${CYAN}📋 Current values:${NC}"
        grep -v '^#' .env.production | grep '=' | grep -v '=$' | sed 's/=.*$/=••••••/'
        exit 0
    fi
fi

# ==========================================
# ENSURE TEMPLATE EXISTS — COMPLETE
# ==========================================
TEMPLATE=".env.production.example"
if [ ! -f "$TEMPLATE" ]; then
    echo -e "${YELLOW}📋 Creating fresh template: $TEMPLATE${NC}"
    
    cat > "$TEMPLATE" << 'EOF'
# ==============================================================
# PLEADING SANITY — PRODUCTION ENVIRONMENT TEMPLATE
# COPY THIS FILE → EDIT → SAVE AS .env.production
# KEEP .env.production PRIVATE — NEVER COMMIT TO GITHUB!
# ==============================================================
# Project: pleadingsanity.co.uk
# Founder: Shane Cooper
# Mission: Evolution, Not Erasure • Rise From Madness
# ==============================================================

# ── CORE SITE ─────────────────────────────────────────────────
NODE_ENV=production
SITE_URL=https://pleadingsanity.co.uk
SITE_NAME="Pleading Sanity"
PORT=3000

# ── AI CORE — Dola + Arron ─────────────────────────────────────
OPENAI_API_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=
AI_API_KEY=
AI_API_SECRET=
AI_API_ADMIN=
API_V3_PS_KEY=

# ── VIDEO FEED ────────────────────────────────────────────────
YOUTUBE_API_KEY=
YOUTUBE_CHANNEL_ID=UC0iP4yT2PpQqhFQ0oEc7ZVw

# ── DEPLOYMENT PLATFORMS ─────────────────────────────────────
NETLIFY_BUILD_TOKEN=
NETLIFY_SITE_ID=
VERCEL_TOKEN=
ALLOWED_ORIGINS=https://pleadingsanity.co.uk https://www.pleadingsanity.co.uk https://*.netlify.app https://*.vercel.app

# ── COMMERCE ──────────────────────────────────────────────────
SHOPIFY_API=
OXYGEN_DEPLOYMENT_TOKEN_1000047008=
STRIPE_PUBLIC_KEY=
STRIPE_SECRET_KEY=
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=

# ── ANALYTICS & GROWTH ────────────────────────────────────────
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_CLARITY_ID=

# ── SECURITY — AUTO-GENERATED ────────────────────────────────
JWT_SECRET=
ENCRYPTION_KEY=
EOF
    echo -e "${GREEN}✅ Template created with ALL fields${NC}"
else
    echo -e "${CYAN}✅ Template found: $TEMPLATE${NC}"
fi

# ==========================================
# CREATE .ENV.PRODUCTION FROM TEMPLATE
# ==========================================
echo -e "\n${CYAN}📋 Building .env.production…${NC}"
cp "$TEMPLATE" .env.production
echo -e "${GREEN}✅ Base file created${NC}"

# ==========================================
# AUTO-GENERATE SECRETS — NO INPUT NEEDED
# ==========================================
echo -e "${CYAN}🔐 Generating security keys…${NC}"

# JWT Secret
SECRET1=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
sed -i.bak "s/JWT_SECRET=/JWT_SECRET=$SECRET1/" .env.production

# Encryption Key
SECRET2=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
sed -i.bak "s/ENCRYPTION_KEY=/ENCRYPTION_KEY=$SECRET2/" .env.production

rm -f .env.production.bak
echo -e "${GREEN}✅ Cryptographic secrets auto-generated ✨${NC}"

# ==========================================
# PROTECT IN .GITIGNORE
# ==========================================
echo -e "\n${CYAN}🛡️  Securing from accidental commit…${NC}"

if [ -f .gitignore ]; then
    UPDATED=0
    grep -qxF ".env.production" .gitignore || { echo ".env.production" >> .gitignore; UPDATED=1; }
    grep -qxF ".env" .gitignore || { echo ".env" >> .gitignore; UPDATED=1; }
    grep -qxF ".env.*" .gitignore || { echo ".env.*" >> .gitignore; UPDATED=1; }
    grep -qxF "deployment-report.json" .gitignore || { echo "deployment-report.json" >> .gitignore; UPDATED=1; }
    grep -qxF "health-report.json" .gitignore || { echo "health-report.json" >> .gitignore; UPDATED=1; }
    
    if [ $UPDATED -eq 1 ]; then
        echo -e "${GREEN}✅ .gitignore updated — all secrets protected${NC}"
    else
        echo -e "${GREEN}✅ Already protected — no changes needed${NC}"
    fi
else
    cat > .gitignore << 'EOF'
node_modules/
dist/
.next/
out/
.env
.env.*
!.env.example
!.env.production.example
deployment-report.json
health-report.json
coverage/
.cache/
.netlify/
.vercel/
.DS_Store
*.log
tmp/
EOF
    echo -e "${GREEN}✅ Created .gitignore — full protection active${NC}"
fi

# ==========================================
# KEYS SETUP GUIDE — STEP BY STEP
# ==========================================
echo -e "\n${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GLOW}🔑 YOUR API KEYS — WHERE TO GET & WHAT TO FILL${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}⭐  PRIORITY — FILL THESE FIRST${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${GREEN}1. OPENAI_API_KEY / NEXT_PUBLIC_OPENAI_API_KEY${NC}"
echo -e "   → ${YELLOW}Where:${NC} https://platform.openai.com/api-keys"
echo -e "   → Sign in → Create new secret key → Copy → Paste BOTH fields"
echo -e "   → NEXT_PUBLIC_* = safe for browser; keep non-public versions hidden\n"

echo -e "${GREEN}2. YOUTUBE_API_KEY${NC}"
echo -e "   → ${YELLOW}Where:${NC} https://console.cloud.google.com/apis/credentials"
echo -e "   → Create project → Enable 'YouTube Data API v3' → Create API Key → Paste\n"

echo -e "${GREEN}3. NETLIFY_BUILD_TOKEN + NETLIFY_SITE_ID${NC}"
echo -e "   → ${YELLOW}Where:${NC} Netlify → User Settings → Personal Access Tokens"
echo -e "   → Site ID: Site Settings → 'Site ID' field\n"

echo -e "${GREEN}4. VERCEL_TOKEN${NC}"
echo -e "   → ${YELLOW}Where:${NC} Vercel → Account → Tokens → Create\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}🧠 AI CORE — ARRON & DOLA INTELLIGENCE${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${GREEN}AI_API_KEY / AI_API_SECRET / AI_API_ADMIN${NC}"
echo -e "   → Your custom Arron/FileFixer/Architect credentials"
echo -e "   → Keep private — these control your AI brain\n"

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🛍️  OPTIONAL — LATER WHEN YOU'RE READY${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n   SHOPIFY_API              → Streetwear storefront"
echo -e "   OXYGEN_DEPLOYMENT_TOKEN  → Shopify hosting deploy"
echo -e "   STRIPE_PUBLIC_KEY        → Donations / Hoodie purchases"
echo -e "   MAILCHIMP_API_KEY        → Newsletter / Sanity Feed"
echo -e "   NEXT_PUBLIC_GA_ID        → Visitor analytics\n"

# ==========================================
# FILES TO EDIT & WHERE TO PASTE
# ==========================================
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GLOW}📝 WHAT TO DO NOW${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"

echo -e "\n${CYAN}1️⃣  Edit your keys:${NC}"
echo -e "   nano .env.production"
echo -e "   → Paste your keys next to each = sign → Ctrl+O → Enter → Ctrl+X\n"

echo -e "${CYAN}2️⃣  Verify everything:${NC}"
echo -e "   node scripts/health-check.js --check-urls\n"

echo -e "${CYAN}3️⃣  Deploy live:${NC}"
echo -e "   node scripts/deploy.js --production\n"

echo -e "${CYAN}4️⃣  Push to GitHub (auto-deploys):${NC}"
echo -e "   git add . && git commit -m 'Setup complete' && git push\n"

echo -e "\n${RED}⚠️  CRITICAL REMINDER:${NC}"
echo -e "   .env.production is ${GREEN}SAFE${NC} — already in .gitignore"
echo -e "   Never paste keys directly into GitHub workflow files or code!\n"

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GLOW}🧠 Pleading Sanity • Fully Configured • Ready to Rise 🌌✨${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
