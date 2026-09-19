const axios = require("axios");

// ==============================================================
// PLEADING SANITY — YOUTUBE FEED ENDPOINT v2.0-FINAL
// Priority: Playlist → Search → Channel Uploads → Curated Fallback
// Retry logic • CORS secured • Graceful degradation • Full logging
// ==============================================================

function setCors(req, res) {
  const cfg = process.env.ALLOWED_ORIGINS || "*";
  const list = cfg.split(/[\s,]+/).filter(Boolean);
  const origin = req.headers?.origin;
  let allow = "*";

  function matchesWildcard(pattern, originHost) {
    try {
      const hostPattern = pattern.includes("://") 
        ? new URL(pattern).hostname 
        : pattern.replace(/^\*\.?/, "");
      return originHost === hostPattern || originHost.endsWith("." + hostPattern);
    } catch { return false; }
  }

  if (list.length && list[0] !== "*" && origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (list.includes(origin) || list.some(p => matchesWildcard(p, originHost))) {
        allow = origin;
      } else {
        allow = list[0];
      }
    } catch { allow = list[0]; }
  }

  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", 
    "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
}

async function getWithRetry(url, attempts = 3) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await axios.get(url, { timeout: 12000 });
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      const canRetry = !status || status >= 500 || status === 429;
      if (!canRetry || i === attempts - 1) break;
      const delay = 350 * (2 ** i) + Math.floor(Math.random() * 200);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY;
    
    if (!YT_KEY) {
      console.warn("⚠️ YOUTUBE_API_KEY not set — serving curated fallback");
      return serveFullFallback(res, "api_key_missing");
    }

    const { 
      channel = "", 
      playlist = "", 
      q = "", 
      limit = "8", 
      pageToken = "" 
    } = req.query;

    let apiUrl;
    let sourceMode = "";

    // Priority 1: Explicit playlist
    if (playlist) {
      sourceMode = "playlist";
      apiUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      apiUrl.searchParams.set("part", "snippet");
      apiUrl.searchParams.set("playlistId", playlist);
      apiUrl.searchParams.set("maxResults", limit);
      apiUrl.searchParams.set("key", YT_KEY);
      if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);
    }
    // Priority 2: Search query
    else if (q) {
      sourceMode = "search";
      apiUrl = new URL("https://www.googleapis.com/youtube/v3/search");
      apiUrl.searchParams.set("part", "snippet");
      apiUrl.searchParams.set("type", "video");
      apiUrl.searchParams.set("order", "relevance");
      apiUrl.searchParams.set("safeSearch", "strict");
      apiUrl.searchParams.set("maxResults", limit);
      apiUrl.searchParams.set("q", q);
      apiUrl.searchParams.set("key", YT_KEY);
      if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);
    }
    // Priority 3: Channel uploads
    else if (channel) {
      sourceMode = "channel";
      const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelUrl.searchParams.set("part", "contentDetails");
      channelUrl.searchParams.set("id", channel);
      channelUrl.searchParams.set("key", YT_KEY);
      
      const chRes = await getWithRetry(channelUrl.toString());
      const uploadsPlaylist = chRes.data?.items?.[0]
        ?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylist) {
        console.warn("⚠️ Channel uploads playlist not found — switching to default");
        return serveFullFallback(res, "channel_not_found");
      }
      
      apiUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      apiUrl.searchParams.set("part", "snippet");
      apiUrl.searchParams.set("playlistId", uploadsPlaylist);
      apiUrl.searchParams.set("maxResults", limit);
      apiUrl.searchParams.set("key", YT_KEY);
      if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);
    }
    // Priority 4: Default Pleading Sanity playlist
    else {
      sourceMode = "default_playlist";
      apiUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
      apiUrl.searchParams.set("part", "snippet");
      apiUrl.searchParams.set("playlistId", "PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA");
      apiUrl.searchParams.set("maxResults", limit);
      apiUrl.searchParams.set("key", YT_KEY);
      if (pageToken) apiUrl.searchParams.set("pageToken", pageToken);
    }

    const ytResponse = await getWithRetry(apiUrl.toString());
    const items = (ytResponse.data.items || []).map(item => {
      const snippet = item.snippet || {};
      const videoId = item.id?.videoId || snippet.resourceId?.videoId;
      
      return {
        videoId,
        title: snippet.title || "Untitled",
        description: snippet.description || "",
        thumbnail: 
          snippet.thumbnails?.medium?.url || 
          snippet.thumbnails?.high?.url || 
          snippet.thumbnails?.default?.url || 
          "",
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : "",
        embed: videoId ? `https://www.youtube.com/embed/${videoId}` : "",
        publishedAt: snippet.publishedAt || null,
        channelTitle: snippet.channelTitle || null
      };
    });

    if (!items.length) {
      return serveFullFallback(res, `${sourceMode}_no_results`);
    }

    return res.status(200).json({
      items,
      nextPageToken: ytResponse.data.nextPageToken || null,
      source: sourceMode,
      returned: items.length
    });

  } catch (error) {
    console.error("❌ ytFeed Error:", error?.response?.data?.error?.message || error.message);
    return serveFullFallback(res, "api_failure");
  }
};

function serveFullFallback(res, reason = "unknown") {
  const fallbackVideos = [
    {
      videoId: "8nTFjVm9sTQ",
      title: "Shane's Story — Rise From Madness",
      description: "From darkness to purpose. One voice starting a movement. This is Pleading Sanity.",
      thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
      embed: "https://www.youtube.com/embed/8nTFjVm9sTQ",
      channelTitle: "Pleading Sanity",
      publishedAt: "2026-01-01T00:00:00Z"
    },
    {
      videoId: "mRf3-JkwqfU",
      title: "You Are Not Alone — Survivor Voices",
      description: "Real people. Real stories. Breaking the silence. We rise together.",
      thumbnail: "https://i.ytimg.com/vi/mRf3-JkwqfU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=mRf3-JkwqfU",
      embed: "https://www.youtube.com/embed/mRf3-JkwqfU",
      channelTitle: "Pleading Sanity",
      publishedAt: "2026-02-15T00:00:00Z"
    },
    {
      videoId: "VbfpW0pbvaU",
      title: "Built Not Broken — Resilience",
      description: "What doesn't break you rewrites you. Evolution, Not Erasure.",
      thumbnail: "https://i.ytimg.com/vi/VbfpW0pbvaU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=VbfpW0pbvaU",
      embed: "https://www.youtube.com/embed/VbfpW0pbvaU",
      channelTitle: "Pleading Sanity",
      publishedAt: "2026-03-10T00:00:00Z"
    },
    {
      videoId: "8F7b8FFsKis",
      title: "Keep Going — Cosmic Motivation",
      description: "Every fall is just preparation to rise higher. The stars are with you.",
      thumbnail: "https://i.ytimg.com/vi/8F7b8FFsKis/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8F7b8FFsKis",
      embed: "https://www.youtube.com/embed/8F7b8FFsKis",
      channelTitle: "Pleading Sanity",
      publishedAt: "2026-04-05T00:00:00Z"
    },
    {
      videoId: "dQw4w9WgXcQ",
      title: "Hope Rises — The Movement Grows",
      description: "Every heart that joins makes us stronger. You matter. We matter.",
      thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      embed: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      channelTitle: "Pleading Sanity",
      publishedAt: "2026-05-01T00:00:00Z"
    }
  ];

  return res.status(200).json({
    items: fallbackVideos,
    nextPageToken: null,
    source: "curated_fallback",
    reason,
    returned: fallbackVideos.length
  });
}
