import axios from "axios";

export default async function handler(req, res) {
  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY;

    // Primary search: keyword-based
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental%20health&type=video&maxResults=8&key=${YT_KEY}`;

    // Secondary: playlist (replace with your playlist/channel ID)
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA&maxResults=8&key=${YT_KEY}`;

    let videos = [];

    try {
      // Try primary search
      const ytRes = await axios.get(searchUrl);
      videos = ytRes.data.items.map((vid) => ({
        id: vid.id.videoId,
        title: vid.snippet.title,
        thumbnail: vid.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${vid.id.videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${vid.id.videoId}`,
      }));
    } catch (err) {
      console.error("Primary fetch failed, switching to playlist:", err.message);

      // Failover to playlist
      const ytRes = await axios.get(playlistUrl);
      videos = ytRes.data.items.map((item) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${item.snippet.resourceId.videoId}`,
      }));
    }

    // Fallback safety: at least 1 static demo video
    if (!videos.length) {
      videos = [
        {
          id: "dQw4w9WgXcQ",
          title: "Keep Going – You’re Not Alone",
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          subtitles: "https://video.google.com/timedtext?lang=en&v=dQw4w9WgXcQ",
        },
      ];
    }

    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
