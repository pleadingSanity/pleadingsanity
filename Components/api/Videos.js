const axios = require('axios');

module.exports = async function handler(req, res) {
  try {
    // Set CORS headers FIRST — prevents browser blocks
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Extract & sanitize query params with movement-aligned defaults
    const {
      q = "mental health motivation healing resilience survival hope",
      maxResults = 12,
      pageToken = "",
      safeSearch = "strict",
      relevanceLanguage = "en"
    } = req.query;

    // Validate API key exists
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      console.log("⚠️ YOUTUBE_API_KEY missing — returning curated fallback");
      return res.status(200).json({
        success: true,
        query: q,
        count: 5,
        note: "Using curated demo content — add YOUTUBE_API_KEY for live feed",
        videos: [
          {
            id: "8nTFjVm9sTQ",
            title: "Shane's Story: Building Pleading Sanity",
            description: "From struggle to purpose — how this movement began.",
            publishedAt: "2025-01-01T00:00:00Z",
            channelTitle: "Pleading Sanity",
            thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
            url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
            subtitles: null
          },
          {
            id: "9dKjF8xRz2Q",
            title: "You Are Not Alone — The Power of Survival",
            description: "Your story matters. Keep going. 💙",
            publishedAt: "2025-02-10T00:00:00Z",
            channelTitle: "Pleading Sanity",
            thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
            url: "https://www.youtube.com/watch?v=9dKjF8xRz2Q",
            subtitles: null
          },
          {
            id: "cX2pZ7bL9s0",
            title: "Evolution Not Erasure — We Rise Together",
            description: "Pain into power. Madness into meaning. ✨",
            publishedAt: "2025-03-05T00:00:00Z",
            channelTitle: "Pleading Sanity",
            thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
            url: "https://www.youtube.com/watch?v=cX2pZ7bL9s0",
            subtitles: null
          },
          {
            id: "dE5fG3hJ7k1",
            title: "Healing Is Not Linear — And That's Okay",
            description: "Every step forward counts. Rest is progress too.",
            publishedAt: "2025-04-12T00:00:00Z",
            channelTitle: "Pleading Sanity",
            thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
            url: "https://www.youtube.com/watch?v=dE5fG3hJ7k1",
            subtitles: null
          },
          {
            id: "fR8tY2uM5v3",
            title: "The Light After The Dark — Your Resilience Shines",
            description: "You survived 100% of your worst days. Keep rising. 🌌",
            publishedAt: "2025-05-20T00:00:00Z",
            channelTitle: "Pleading Sanity",
            thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
            url: "https://www.youtube.com/watch?v=fR8tY2uM5v3",
            subtitles: null
          }
        ]
      });
    }

    // Build YouTube API request
    const url = "https://www.googleapis.com/youtube/v3/search";
    const response = await axios.get(url, {
      params: {
        part: "snippet",
        q,
        type: "video",
        maxResults: Math.min(parseInt(maxResults, 10), 50), // Hard cap at 50
        pageToken,
        key: YOUTUBE_API_KEY,
        safeSearch,
        relevanceLanguage
      },
      timeout: 8000 // Fail fast — no hanging builds
    });

    // Transform & sanitize results
    const videos = response.data.items.map(item => {
      const videoId = item.id?.videoId;
      const snippet = item.snippet || {};

      return {
        id: videoId,
        title: snippet.title || "Untitled Video",
        description: snippet.description || "",
        publishedAt: snippet.publishedAt || null,
        channelTitle: snippet.channelTitle || "Pleading Sanity",
        thumbnail:
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.high?.url ||
          snippet.thumbnails?.default?.url ||
          "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
        subtitles: videoId
          ? `https://video.google.com/timedtext?lang=en&v=${videoId}`
          : null
      };
    }).filter(v => v.id); // Remove any invalid/malformed entries

    // Success response
    res.status(200).json({
      success: true,
      query: q,
      count: videos.length,
      nextPageToken: response.data.nextPageToken || null,
      prevPageToken: response.data.prevPageToken || null,
      videos
    });

  } catch (err) {
    console.error("🎬 YouTube API Error:", err.response?.status || err.code, err.message);

    // Graceful fallback — never breaks the feed
    res.status(200).json({
      success: false,
      note: "Live feed temporarily unavailable — showing curated content",
      error: err.message,
      count: 3,
      videos: [
        {
          id: "8nTFjVm9sTQ",
          title: "Shane's Story — Pleading Sanity Origins",
          description: "Built from struggle. Rising together. 💙",
          publishedAt: "2025-01-01T00:00:00Z",
          channelTitle: "Pleading Sanity",
          thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
          url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
          subtitles: null
        },
        {
          id: "cX2pZ7bL9s0",
          title: "Evolution Not Erasure",
          description: "We don't disappear — we transform. ✨",
          publishedAt: "2025-03-05T00:00:00Z",
          channelTitle: "Pleading Sanity",
          thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
          url: "https://www.youtube.com/watch?v=cX2pZ7bL9s0",
          subtitles: null
        },
        {
          id: "fR8tY2uM5v3",
          title: "Your Light Matters",
          description: "The world needs what only you can share. 🌌",
          publishedAt: "2025-05-20T00:00:00Z",
          channelTitle: "Pleading Sanity",
          thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
          url: "https://www.youtube.com/watch?v=fR8tY2uM5v3",
          subtitles: null
        }
      ]
    });
  }
};
