#!/bin/bash
# Pleading Sanity - Production Deployment Setup Script
# This script helps configure environment variables for deployment

set -e

echo "🚀 Pleading Sanity - Production Deployment Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ -f .env.production ]; then
    echo -e "${YELLOW}⚠️  .env.production already exists!${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborting setup."
        exit 0
    fi
fi

# Copy example file
echo -e "${BLUE}📋 Creating .env.production from template...${NC}"
cp .env.production.example .env.production

echo ""
echo -e "${GREEN}✅ .env.production created!${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Configure your API keys${NC}"
echo ""
echo "Edit .env.production and add your production API keys:"
echo ""
echo "📌 Required for Full AI Functionality:"
echo "   - OPENAI_API_KEY (Get from: https://platform.openai.com/api-keys)"
echo "   - ARRON_API_KEY (Your custom FileFixer API key)"
echo ""
echo "📌 Required for Video Feed:"
echo "   - YOUTUBE_API_KEY (Get from: https://console.cloud.google.com/apis/credentials)"
echo ""
echo "📌 Optional but Recommended:"
echo "   - NEXT_PUBLIC_GA_ID (Google Analytics)"
echo "   - MAILCHIMP_API_KEY (Newsletter)"
echo "   - SHOPIFY_ACCESS_TOKEN (E-commerce)"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "1. Edit .env.production with your actual API keys"
echo "2. Run 'npm run health-check' to verify configuration"
echo "3. Run 'npm run build' to build for production"
echo "4. Deploy to your hosting platform (Netlify/Vercel)"
echo ""
echo -e "${GREEN}🧠 Pleading Sanity - Rise From Madness 🌌${NC}"
