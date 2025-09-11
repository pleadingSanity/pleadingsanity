import axios from "axios";

export default async function handler(req, res) {
  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY;

    // Accept query + pageToken dynamically (defaults to "mental health motivation")
    const { q = "mental health motivation resilience truth", pageToken = "" } =
      req.query;

    // Primary: keyword search
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&safeSearch=strict&maxResults=12&q=${encodeURIComponent(
      q
    )}&pageToken=${pageToken}&key=${YT_KEY}`;

    // Secondary: curated playlist (backup content)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA&maxResults=12&key=${YT_KEY}`;

    let videos = [];
    let nextPageToken = null;

    try {
      // Try primary keyword search
      const ytRes = await axios.get(searchUrl);
      videos = ytRes.data.items.map((vid) => ({
        id: vid.id.videoId,
        title: vid.snippet.title,
        description: vid.snippet.description,
        channel: vid.snippet.channelTitle,
        publishedAt: vid.snippet.publishedAt,
        thumbnail: vid.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${vid.id.videoId}`,
        embed: `https://www.youtube.com/embed/${vid.id.videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${vid.id.videoId}`,
      }));
      nextPageToken = ytRes.data.nextPageToken || null;
    } catch (err) {
      console.error("⚠️ Primary search failed, switching to playlist:", err.message);

      // Failover to curated playlist
      const ytRes = await axios.get(playlistUrl);
      videos = ytRes.data.items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        channel: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        embed: `https://www.youtube.com/embed/${item.snippet.resourceId.videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${item.snippet.resourceId.videoId}`,
      }));
    }

    // Absolute fallback safety net
    if (!videos.length) {
      videos = [
        {
          id: "8nTFjVm9sTQ",
          title: "Shane’s Story – Building Pleading Sanity",
          description: "From pain to power: why Pleading Sanity was created.",
          channel: "Pleading Sanity",
          publishedAt: "2025-01-01T00:00:00Z",
          thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
          embed: "https://www.youtube.com/embed/8nTFjVm9sTQ",
          subtitles: "https://video.google.com/timedtext?lang=en&v=8nTFjVm9sTQ",
        },
      ];
    }

    res.status(200).json({
      videos,
      nextPageToken,
      total: videos.length,
      source: nextPageToken ? "search" : "playlist/fallback",
    });
  } catch (err) {
    console.error("❌ Video API failure:", err);
    res.status(500).json({ error: "Video service unavailable." });
  }
}
