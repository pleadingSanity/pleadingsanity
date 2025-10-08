// Health Check Endpoint - Cosmic Network Status
// Monitor the health of Pleading Sanity services

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const timestamp = new Date().toISOString();
  const checks = {
    system: '🌌 Cosmic Network',
    timestamp,
    status: 'operational',
    services: {}
  };

  // Check environment variables
  checks.services.environment = {
    openai_configured: !!process.env.OPENAI_API_KEY,
    youtube_configured: !!process.env.YOUTUBE_API_KEY,
    shopify_configured: !!process.env.SHOPIFY_API_KEY,
    arron_api_configured: !!process.env.ARRON_API_KEY,
    status: 'operational'
  };

  // Check Arron AI Core
  try {
    checks.services.arron_ai = {
      status: 'operational',
      endpoint: '/.netlify/functions/arron-ai-core',
      configured: !!process.env.OPENAI_API_KEY || 'fallback_mode'
    };
  } catch (error) {
    checks.services.arron_ai = {
      status: 'degraded',
      error: error.message
    };
  }

  // Check YouTube Feed
  checks.services.youtube_feed = {
    status: process.env.YOUTUBE_API_KEY ? 'operational' : 'fallback',
    endpoint: '/.netlify/functions/ytFeed',
    configured: !!process.env.YOUTUBE_API_KEY
  };

  // Overall health status
  const allOperational = Object.values(checks.services).every(
    service => service.status === 'operational' || service.status === 'fallback'
  );
  
  checks.status = allOperational ? 'operational' : 'degraded';
  checks.message = allOperational 
    ? '✅ All systems operational - Rise From Madness'
    : '⚠️ Some services degraded - Cosmic resilience active';

  // Cosmic branding
  checks.branding = {
    colors: {
      primary: '#00fff0',
      secondary: '#ff00ff',
      background: '#0b0b1a'
    },
    tagline: 'Rise From Madness',
    movement: 'Pleading Sanity'
  };

  // Response time
  checks.response_time_ms = Date.now() - new Date(timestamp).getTime();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(checks, null, 2)
  };
};
