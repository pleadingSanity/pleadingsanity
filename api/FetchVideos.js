import axios from 'axios';

export default async function handler(req, res) {
  try {
    const ytUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental%20health&type=video&maxResults=8&key=${process.env.YOUTUBE_API_KEY}`;
    const ytRes = await axios.get(ytUrl);
    const videos = ytRes.data.items;

    const response = videos.map(vid => ({
      id: vid.id.videoId,
      title: vid.snippet.title,
      thumbnail: vid.snippet.thumbnails.medium.url,
      url: `https://www.youtube.com/watch?v=${vid.id.videoId}`,
      subtitles: `https://video.google.com/timedtext?lang=en&v=${vid.id.videoId}`
    }));

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
