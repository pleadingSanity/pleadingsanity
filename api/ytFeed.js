const axios = require("axios");

function setCors(req, res) {
  const cfg = process.env.ALLOWED_ORIGINS || "*"; // supports wildcards like https://*.netlify.app
  const list = cfg.split(/[\s,]+/).filter(Boolean);
  const origin = req.headers?.origin;
  let allow = "*";
  function matchesWildcard(item, originHost) {
    try {
      const url = item.includes("://") ? new URL(item) : null;
      const hostPattern = (url ? url.hostname : item).replace(/^\*\.?/, "");
      return originHost === hostPattern || originHost.endsWith("." + hostPattern);
    } catch { return false; }
  }
  if (list.length && list[0] !== "*") {
    if (origin) {
      try {
        const oh = new URL(origin).hostname;
        if (list.includes(origin) || list.some(i => matchesWildcard(i, oh))) {
          allow = origin;
        } else {
          allow = list[0];
        }
      } catch {
        allow = list[0];
      }
    } else {
      allow = list[0];
    }
  }
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
}

module.exports = async function handler(req, res) {
  setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  try {
    const YT_KEY = process.env.YOUTUBE_API_KEY;
    const { channel = "", playlist = "", q = "", limit = 8, pageToken = "" } = req.query;

    // Prefer explicit playlist; else keyword search; else channel uploads
    let url;
    if (playlist) {
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(
        playlist
      )}&maxResults=${limit}&pageToken=${pageToken}&key=${YT_KEY}`;
    } else if (q) {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&order=relevance&safeSearch=strict&maxResults=${limit}&q=${encodeURIComponent(
        q
      )}&pageToken=${pageToken}&key=${YT_KEY}`;
    } else if (channel) {
      // Fetch uploads playlist for channel
      const ch = await axios.get(
        `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${encodeURIComponent(
          channel
        )}&key=${YT_KEY}`
      );
      const uploads = ch.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploads}&maxResults=${limit}&pageToken=${pageToken}&key=${YT_KEY}`;
    } else {
      // Default curated playlist
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=PL7C1VriGLDPrAq1Im9t7WQxZcuXlA77DA&maxResults=${limit}&pageToken=${pageToken}&key=${YT_KEY}`;
    }

    const ytRes = await axios.get(url);
    const items = (ytRes.data.items || []).map((it) => {
      const id = it.id?.videoId || it.snippet?.resourceId?.videoId;
      const sn = it.snippet || {};
      return {
        videoId: id,
        title: sn.title,
        description: sn.description,
        thumbnail: sn.thumbnails?.medium?.url || sn.thumbnails?.high?.url,
        url: `https://www.youtube.com/watch?v=${id}`,
      };
    });

    if (!items.length) {
      return res.status(200).json({
        items: [
          {
            videoId: "8nTFjVm9sTQ",
            title: "Shane's Story: Building Pleading Sanity",
            description: "From pain to power: why Pleading Sanity was created.",
            thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
            url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
          },
        ],
        nextPageToken: null,
      });
    }

    return res.status(200).json({ items, nextPageToken: ytRes.data.nextPageToken || null });
  } catch (e) {
    console.error("ytFeed error:", e?.response?.data || e.message);
    return res.status(500).json({ error: "ytFeed failed" });
  }
};
