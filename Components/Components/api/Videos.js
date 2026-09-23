const axios = require('axios');

module.exports = async function handler(req, res) {
  try {
    // Extract & sanitize query params
    const {
      q = "mental health motivation healing resilience",
      maxResults = 12,
      pageToken = "",
      safeSearch = "strict",
      relevanceLanguage = "en"
    } = req.query;

    // Validate API key exists
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
    if (!YOUTUBE_API_KEY) {
      return res.status(500).json({
        error: "YouTube API key missing",
        detail: "Set YOUTUBE_API_KEY in environment variables",
        videos: []
      });
    }

    // Build request
    const url = "https://www.googleapis.com/youtube/v3/search";
    const response = await axios.get(url, {
      params: {
        part: "snippet",
        q,
        type: "video",
        maxResults: Math.min(parseInt(maxResults, 10), 50), // Cap at 50
        pageToken,
        key: YOUTUBE_API_KEY,
        safeSearch,
        relevanceLanguage
      },
      timeout: 8000 // Fail fast if API hangs
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
        channelTitle: snippet.channelTitle || "Unknown Channel",
        thumbnail: 
          snippet.thumbnails?.medium?.url ||
          snippet.thumbnails?.default?.url ||
          "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
        url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : null,
        subtitles: videoId 
          ? `https://video.google.com/timedtext?lang=en&v=${videoId}`
          : null
      };
    }).filter(v => v.id); // Remove any invalid entries

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

    // Structured error response
    res.status(err.response?.status || 500).json({
      success: false,
      error: "Failed to fetch videos",
      detail: err.message,
      videos: []
    });
  }
};
