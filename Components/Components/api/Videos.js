import axios from 'axios';

export default async function handler(req, res) {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental%20health&type=video&maxResults=8&key=${process.env.YOUTUBE_API_KEY}`;
    const ytRes = await axios.get(url);

    const videos = ytRes.data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      subtitles: `https://video.google.com/timedtext?lang=en&v=${item.id.videoId}`
    }));

    res.status(200).json(videos);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
