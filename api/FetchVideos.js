const axios = require("axios");

// ==============================================================
// PLEADING SANITY — YOUTUBE FEED API v1.2-FINAL
// Dual fallback: Search → Playlist → Hardcoded safety net
// CORS secured • Auto-retry • Graceful degradation
// ==============================================================

function setCors(req, res) {
  const cfg = process.env.ALLOWED_ORIGINS || "*";
  const list = cfg.split(/[\s,]+/).filter(Boolean);
  const origin = req.headers?.origin;
  let allow = "*";

  function matchesWildcard(pattern, host) {
    try {
      const pHost = pattern.includes("://") 
        ? new URL(pattern).hostname 
        : pattern.replace(/^\*\.?/, "");
      return host === pHost || host.endsWith("." + pHost);
    } catch { return false; }
  }

  if (list.length && list[0] !== "*") {
    if (origin) {
      try {
        const oHost = new URL(origin).hostname;
        allow = (list.includes(origin) || list.some(p => matchesWildcard(p, oHost)))
          ? origin 
          : list[0];
      } catch { allow = list[0]; }
    } else { allow = list[0]; }
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
      return await axios.get(url, { timeout: 10000 });
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      const canRetry = !status || status >= 500 || status === 429;
      if (!canRetry || i === attempts - 1) break;
      const delay = 300 * (2 ** i) + Math.floor(Math.random() * 150);
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
      console.warn("⚠️ YOUTUBE_API_KEY missing — using fallback content");
      return serveFallback(res, "missing_api_key");
    }

    const { 
      q = "mental health hope resilience survivor stories inspiration", 
      pageToken = "" 
    } = req.query;

    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("order", "relevance");
    searchUrl.searchParams.set("safeSearch", "strict");
    searchUrl.searchParams.set("maxResults", "12");
    searchUrl.searchParams.set("q", q);
    searchUrl.searchParams.set("key", YT_KEY);
    if (pageToken) searchUrl.searchParams.set("pageToken", pageToken);

    const playlistUrl = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    playlistUrl.searchParams.set("part", "snippet");
    playlistUrl.searchParams.set("playlistId", "PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA");
    playlistUrl.searchParams.set("maxResults", "12");
    playlistUrl.searchParams.set("key", YT_KEY);

    let videos = [];
    let nextPageToken = null;
    let source = "search";
    let retries = 0;

    try {
      const searchRes = await getWithRetry(searchUrl.toString());
      videos = searchRes.data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails?.medium?.url || "",
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embed: `https://www.youtube.com/embed/${item.id.videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${item.id.videoId}`
      }));
      nextPageToken = searchRes.data.nextPageToken || null;
    } catch (searchErr) {
      console.log("🔁 Search failed → switching to playlist:", searchErr.message);
      source = "playlist";
      try {
        const playlistRes = await getWithRetry(playlistUrl.toString());
        videos = playlistRes.data.items.map(item => ({
          id: item.snippet.resourceId?.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          channel: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          thumbnail: item.snippet.thumbnails?.medium?.url || "",
          url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
          embed: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
          subtitles: `https://video.google.com/timedtext?lang=en&v=${item.snippet.resourceId.videoId}`
        }));
      } catch (playlistErr) {
        console.log("🔁 Playlist also failed → fallback content");
        return serveFallback(res, "all_apis_failed");
      }
    }

    if (!videos.length) return serveFallback(res, "no_results");

    return res.status(200).json({
      videos,
      nextPageToken,
      total: videos.length,
      source,
      retries
    });

  } catch (err) {
    console.error("❌ API Handler Error:", err.message);
    return serveFallback(res, "server_error");
  }
};

function serveFallback(res, reason) {
  const fallbackVideos = [
    {
      id: "8nTFjVm9sTQ",
      title: "Shane's Story — Rise From Madness",
      description: "From darkness to purpose. One voice starting a movement.",
      channel: "Pleading Sanity",
      publishedAt: "2026-01-01T00:00:00Z",
      thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
      embed: "https://www.youtube.com/embed/8nTFjVm9sTQ",
      subtitles: "https://video.google.com/timedtext?lang=en&v=8nTFjVm9sTQ"
    },
    {
      id: "mRf3-JkwqfU",
      title: "You Are Not Alone — Survivor Voices",
      description: "Real people. Real stories. Breaking the silence.",
      channel: "Pleading Sanity",
      publishedAt: "2026-02-15T00:00:00Z",
      thumbnail: "https://i.ytimg.com/vi/mRf3-JkwqfU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=mRf3-JkwqfU",
      embed: "https://www.youtube.com/embed/mRf3-JkwqfU",
      subtitles: "https://video.google.com/timedtext?lang=en&v=mRf3-JkwqfU"
    },
    {
      id: "VbfpW0pbvaU",
      title: "Built Not Broken — Resilience",
      description: "What doesn't break you rewrites you. Evolution, Not Erasure.",
      channel: "Pleading Sanity",
      publishedAt: "2026-03-10T00:00:00Z",
      thumbnail: "https://i.ytimg.com/vi/VbfpW0pbvaU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=VbfpW0pbvaU",
      embed: "https://www.youtube.com/embed/VbfpW0pbvaU",
      subtitles: "https://video.google.com/timedtext?lang=en&v=VbfpW0pbvaU"
    },
    {
      id: "8F7b8FFsKis",
      title: "Keep Going — Cosmic Motivation",
      description: "Every fall is preparation to rise higher. The stars are with you.",
      channel: "Pleading Sanity",
      publishedAt: "2026-04-05T00:00:00Z",
      thumbnail: "https://i.ytimg.com/vi/8F7b8FFsKis/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8F7b8FFsKis",
      embed: "https://www.youtube.com/embed/8F7b8FFsKis",
      subtitles: "https://video.google.com/timedtext?lang=en&v=8F7b8FFsKis"
    }
  ];

  return res.status(200).json({
    videos: fallbackVideos,
    nextPageToken: null,
    total: fallbackVideos.length,
    source: "fallback",
    reason
  });
}
