// /netlify/functions/ytFeed.js
import axios from "axios";

export default async function handler(req, res) {
  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY;

    // Grab query params (?playlist=... or ?channel=...)
    const { playlist, channel, limit = 8 } = req.query;

    let url;
    if (playlist) {
      // Playlist fetch
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlist}&maxResults=${limit}&key=${YT_KEY}`;
    } else if (channel) {
      // Channel fetch
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channel}&type=video&order=date&maxResults=${limit}&key=${YT_KEY}`;
    } else {
      // Keyword fallback (mental health + motivation)
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental%20health%20motivation&type=video&order=relevance&maxResults=${limit}&key=${YT_KEY}`;
    }

    const ytRes = await axios.get(url);

    const items = ytRes.data.items.map((item) => {
      const videoId =
        item.snippet.resourceId?.videoId || item.id?.videoId || null;

      return {
        videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium.url,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        subtitles: `https://video.google.com/timedtext?lang=en&v=${videoId}`,
      };
    });

    res.status(200).json({ items });
  } catch (err) {
    console.error("YouTube API error:", err.message);

    // 🔒 Fallback: at least one guaranteed video
    res.status(200).json({
      items: [
        {
          videoId: "dQw4w9WgXcQ",
          title: "Keep Going – You’re Not Alone",
          description: "A message of resilience, never giving up, and rising again.",
          thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          subtitles: "https://video.google.com/timedtext?lang=en&v=dQw4w9WgXcQ",
        },
      ],
    });
  }
}
