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
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
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
    ];
  },

  env: {
    BRAND_NAME: 'Pleading Sanity',
    BRAND_TAGLINE: 'Rise From Madness',
    BRAND_DESCRIPTION: 'Turning pain into power, struggle into strength, madness into meaning.',
    MAIN_SITE: 'https://pleadingsanity.co.uk',
    SHOPIFY_STORE: 'https://dqfzb1-ki.myshopify.com',
    PAYHIP_STORE: 'https://payhip.com/Pleadingsanity',
    TIKTOK_SHOP: 'https://vt.tiktok.com/ZNd4wRFfn/?page=TikTokShop',
    ARRON_API_UPDATE: 'https://filefixerapi.com/api/v1/filefixer/update-website',
    ARRON_API_DEPLOY: 'https://filefixerapi.com/api/v1/filefixer/deploy-website',
    ARRON_API_STATUS: 'https://filefixerapi.com/api/v1/filefixer/get-website-status',
    ARRON_API_KEY: process.env.ARRON_API_KEY || 'PLEADINGSANITY_API_KEY_1234',
  },
};

module.exports = withPWA(nextConfig);