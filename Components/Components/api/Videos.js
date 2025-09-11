import axios from 'axios';

export default async function handler(req, res) {
  try {
    // query and pagination support
    const { q = "mental health motivation", maxResults = 12, pageToken } = req.query;

    const url = `https://www.googleapis.com/youtube/v3/search`;
    const ytRes = await axios.get(url, {
      params: {
        part: "snippet",
        q,
        type: "video",
        maxResults,
        pageToken,
        key: process.env.YOUTUBE_API_KEY,
        safeSearch: "strict",
        relevanceLanguage: "en",
      }
    });

    const videos = ytRes.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      subtitles: `https://video.google.com/timedtext?lang=en&v=${item.id.videoId}`,
    }));

    res.status(200).json({
      nextPageToken: ytRes.data.nextPageToken || null,
      videos
    });

  } catch (err) {
    console.error("YouTube API error:", err.message);
    res.status(500).json({ error: "Failed to fetch videos", detail: err.toString() });
  }
}
