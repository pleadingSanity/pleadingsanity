// ==============================================================
// PLEADING SANITY — SYSTEM HEALTH ENDPOINT v1.1-FINAL
// Heartbeat • Status • Uptime • Env • Secrets • Readiness • Platform
// Works on Vercel, Netlify, Local & All Node.js Hosts
// Evolution, Not Erasure • One Source • One Family
// ==============================================================

module.exports = (req, res) => {
  // ✅ No caching — always fresh live status
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");

  // ✅ CORS — accessible from your frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ✅ Auto-detect deployment platform
  const isVercel = !!process.env.VERCEL;
  const isNetlify = !!process.env.NETLIFY;
  const isCI = !!process.env.CI;
  const platform = isVercel ? "vercel" : isNetlify ? "netlify" : isCI ? "ci/build" : "local/unknown";

  // ✅ Environment & secrets check — never exposes actual values
  const hasYtKey = !!process.env.YOUTUBE_API_KEY;
  const hasOpenAiKey = !!process.env.OPENAI_API_KEY || !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  const hasAllowedOrigins = !!process.env.ALLOWED_ORIGINS;
  const hasShopify = !!process.env.SHOPIFY_API;
  const hasVercelToken = !!process.env.VERCEL_TOKEN;
  const hasNetlifyToken = !!process.env.NETLIFY_BUILD_TOKEN;

  // ✅ Derive overall system health
  const criticalReady = hasYtKey && hasAllowedOrigins;
  const status = criticalReady ? "fully_operational" : "operational_with_missing_config";

  return res.status(200).json({
    // ─── CORE IDENTITY ───
    ok: true,
    status,
    service: "Pleading Sanity API",
    version: "1.1-FINAL",
    mission: "Rise From Madness — Evolution, Not Erasure",

    // ─── TIMING (UK TIMEZONE — YOUR BASE) ───
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London"
    }),
    uptime: `${Math.round(process.uptime())}s`,
    memory: process.memoryUsage?.() ? {
      rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`
    } : "unavailable",

    // ─── PLATFORM & ENVIRONMENT ───
    platform,
    nodeEnv: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    region: process.env.VERCEL_REGION || process.env.NETLIFY_REGION || "unknown",

    // ─── CONFIGURATION STATUS (safe — no secrets exposed) ───
    config: {
      youtubeApiKey: hasYtKey ? "✅ configured" : "⚠️ missing — fallback only",
      openAiKey: hasOpenAiKey ? "✅ configured" : "⚠️ missing — Arron limited",
      allowedOrigins: hasAllowedOrigins ? "✅ configured" : "ℹ️ default (*) — dev only",
      shopifyApi: hasShopify ? "✅ configured" : "⚠️ missing — shop offline",
      vercelToken: hasVercelToken ? "✅ present" : "not set",
      netlifyToken: hasNetlifyToken ? "✅ present" : "not set"
    },

    // ─── REQUEST CONTEXT ───
    request: {
      method: req.method,
      path: req.url,
      clientIp: req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
        || req.socket?.remoteAddress
        || "unknown",
      userAgent: req.headers["user-agent"] || "not provided"
    },

    // ─── ACTIONABLE GUIDANCE ───
    nextSteps: !criticalReady ? [
      "Add YOUTUBE_API_KEY → live video feed activates",
      "Set ALLOWED_ORIGINS → lock CORS to your domains",
      "Add OPENAI_API_KEY → Arron AI companion fully online",
      "Add SHOPIFY_API → storefront syncs live"
    ] : [
      "All systems operational — Pleading Sanity is live"
    ]
  });
};
