// /netlify/functions/ytFeed.js
import axios from "axios";

export default async function handler(req, res) {
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  if (!YT_KEY) {
    return res.status(500).json({ error: "YOUTUBE_API_KEY missing from environment!" });
  }

  const { playlist, channel, limit = 8 } = req.query;
  let url = "";
  try {
    if (playlist) {
      // Playlist fetch
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist}&maxResults=${limit}&key=${YT_KEY}`;
    } else if (channel) {
      // Channel fetch (latest uploads)
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel}&type=video&order=date&maxResults=${limit}&key=${YT_KEY}`;
    } else {
      // Fallback: Search for mental health & motivation
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental%20health%20motivation&type=video&order=relevance&maxResults=${limit}&key=${YT_KEY}`;
    }

    const ytRes = await axios.get(url);

    // Handles both playlistItems and search results
    const items = ytRes.data.items.map((item) => {
      // Handle YouTube API structure difference
      let videoId =
        item.snippet.resourceId?.videoId || item.id?.videoId || item.id?.videoId || item.id || null;

      // Some search results use 'id' as an object, some as string
      if (typeof videoId === "object" && videoId.videoId) videoId = videoId.videoId;

      return {
        videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${videoId}`,
      };
    }).filter(v => v.videoId);

    // Always return something
    if (!items.length) throw new Error("No items found from YouTube API!");

    res.status(200).json({ items });

  } catch (err) {
    console.error("YouTube API error:", err.message, url);

    // Enhanced error response with helpful information
    const errorResponse = {
      error: true,
      message: "YouTube API temporarily unavailable",
      fallbackReason: err.response?.status === 403 ? "API quota exceeded" : 
                     err.response?.status === 400 ? "Invalid request parameters" :
                     err.code === 'ENOTFOUND' ? "Network connection issue" :
                     "Service temporarily unavailable",
      retryAfter: err.response?.headers?.['retry-after'] || 60,
      timestamp: new Date().toISOString()
    };

    // 🔒 Brand-safe fallback content
    const fallback = [
      {
        videoId: "8nTFjVm9sTQ",
        title: "Shane's Story: Building Pleading Sanity",
        description: "Turning pain into a movement. Rise from Madness.",
        thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
        subtitles: "https://video.google.com/timedtext?lang=en&v=8nTFjVm9sTQ",
      },
      {
        videoId: "mRf3-JkwqfU",
        title: "Mental Health: Real Survivors, Real Talk",
        description: "The real faces and stories behind mental health.",
        thumbnail: "https://i.ytimg.com/vi/mRf3-JkwqfU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=mRf3-JkwqfU",
        subtitles: "https://video.google.com/timedtext?lang=en&v=mRf3-JkwqfU",
      },
      {
        videoId: "8F7b8FFsKis",
        title: "Cosmic Motivation: Rise Again",
        description: "Get up. Every time. You’re not alone.",
        thumbnail: "https://i.ytimg.com/vi/8F7b8FFsKis/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=8F7b8FFsKis",
        subtitles: "https://video.google.com/timedtext?lang=en&v=8F7b8FFsKis",
      },
      {
        videoId: "VbfpW0pbvaU",
        title: "Resilience – Never Give Up",
        description: "How to stay strong through anything.",
        thumbnail: "https://i.ytimg.com/vi/VbfpW0pbvaU/mqdefault.jpg",
        url: "https://www.youtube.com/watch?v=VbfpW0pbvaU",
        subtitles: "https://video.google.com/timedtext?lang=en&v=VbfpW0pbvaU",
      }
    ];
    
    res.status(200).json({ 
      items: fallback,
      fallback: true,
      errorInfo: errorResponse,
      message: "Showing curated content while YouTube API recovers"
    });
  }
}