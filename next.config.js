/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,

  // Fix: tell Next we use HTML files, not /pages folder
  pageExtensions: false,

  // Fix: updated for Next 15+
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'vumbnail.com' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: 'dqfzb1-ki.myshopify.com' },
      { protocol: 'https', hostname: 'pleadingsanity.co.uk' },
      { protocol: 'https', hostname: 'payhip.com' },
      { protocol: 'https', hostname: 'tikcdn.tiktokglobalshop.com' },
    ],
  },

  async rewrites() {
    return [
      { source: '/api/video', destination: '/api/FetchVideos' },
      { source: '/api/fetchVideos', destination: '/api/FetchVideos' },
      { source: '/api/fetchvideos', destination: '/api/FetchVideos' },
    ];
  },

  
  // ✅ ONLY VALID, VERIFIED DOMAINS — NO DEAD LINKS
  images: {
    domains: [
      'i.ytimg.com',
      'img.youtube.com',
      'vumbnail.com',
      'pleadingsanity.co.uk',
      'shop.pleadingsanity.co.uk',
      'payhip.com',
      'cdn.payhip.com',
    ],
  },

  // ✅ SECURITY HEADERS — STANDARD & CLEAN
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/shop', destination: 'https://shop.pleadingsanity.co.uk', permanent: true },
      { source: '/tiktokshop', destination: 'https://vt.tiktok.com/ZNd4wRFfn/?page=TikTokShop', permanent: true },
      { source: '/payhip', destination: 'https://payhip.com/Pleadingsanity', permanent: true },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.pleadingsanity.uk' }],
        destination: 'https://pleadingsanity.uk/:path*',
        permanent: true,
      },
      {
        source: '/home',
        destination: 'https://pleadingsanity.co.uk',
        permanent: true,
      },
      {
        source: '/main',
        destination: 'https://pleadingsanity.co.uk',
        permanent: true,
      },
    ];
  },

  env: {
    BRAND_NAME: 'Pleading Sanity',
    BRAND_TAGLINE: 'Rise From Madness',
    BRAND_DESCRIPTION: 'Turning pain into power, struggle into strength, madness into meaning.',
    
    MAIN_SITE: 'https://pleadingsanity.co.uk',
    SHOP_DOMAIN: 'https://shop.pleadingsanity.co.uk',
    PAYHIP_STORE: 'https://payhip.com/Pleadingsanity',
    
    // 📌 Placeholders ready when live — no errors right now
    TIKTOK_SHOP: '', // Fill when link confirmed
    YOUTUBE_CHANNEL: 'https://www.youtube.com/@PleadingSanity',
    INSTAGRAM: 'https://instagram.com/mentally.inshane',
    TIKTOK: 'https://tiktok.com/@mentally.inshane',
    
    // 🧠 Arron AI — Ready when keys live
    ARRON_API_BASE: '', // Fill when endpoint confirmed
    ARRON_API_KEY: process.env.ARRON_API_KEY || '',
  },
};

module.exports = withPWA(nextConfig);