// ==============================================================
// PLEADING SANITY — SYSTEM HEALTH ENDPOINT v1.0-FINAL
// Heartbeat • Status • Uptime • Environment • Readiness
// Works on Vercel, Netlify, & all Node.js hosts
// ==============================================================

module.exports = (req, res) => {
  // Prevent caching — always fresh status
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  
  // Detect platform automatically
  const isVercel = !!process.env.VERCEL;
  const isNetlify = !!process.env.NETLIFY;
  const platform = isVercel ? "vercel" : isNetlify ? "netlify" : "unknown";

  // System readiness checks
  const hasYtKey = !!process.env.YOUTUBE_API_KEY;
  const hasAllowedOrigins = !!process.env.ALLOWED_ORIGINS;

  return res.status(200).json({
    // Core status
    ok: true,
    status: "operational",
    service: "Pleading Sanity API",
    version: "1.0.0-FINAL",
    
    // Timing
    timestamp: new Date().toISOString(),
    serverTime: new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }),
    
    // Environment
    platform,
    nodeEnv: process.env.NODE_ENV || "development",
    
    // Config status
    config: {
      youtubeApiKey: hasYtKey ? "configured" : "missing",
      allowedOrigins: hasAllowedOrigins ? "configured" : "default (*)"
    },
    
    // Connection info
    request: {
      method: req.method,
      path: req.url,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"
    },
    
    // Uptime
    uptime: `${Math.round(process.uptime())}s`
  });
};
