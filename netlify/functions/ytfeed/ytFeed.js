// /netlify/functions/ytFeed.js
// Pleading Sanity — Video Feed Function
// Powers: videos.html, cosmic hub, movement stories
// Type: ES Module (matches package.json "type": "module")

import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();

export default async function handler(event, context) {
  const YT_KEY = process.env.YOUTUBE_API_KEY;
  const { playlist, channel, limit = "8" } = event.queryStringParameters;

  // 🚫 No API key = serve fallback immediately (no crash)
  if (!YT_KEY) {
    console.log("⚠️ YOUTUBE_API_KEY missing — serving curated fallback");
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300"
      },
      body: JSON.stringify({
        items: getFallbackVideos(),
        fallback: true,
        message: "Curated movement content"
      })
    };
  }

  const limitNum = parseInt(limit, 10) || 8;
  let url = "";

  try {
    if (playlist) {
      url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlist)}&maxResults=${limitNum}&key=${YT_KEY}`;
    } else if (channel) {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(channel)}&type=video&order=date&maxResults=${limitNum}&key=${YT_KEY}`;
    } else {
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=mental+health+survivor+inspiration+hope&type=video&order=relevance&maxResults=${limitNum}&key=${YT_KEY}`;
    }

    const ytRes = await axios.get(url, {
      timeout: 8000,
      headers: { "Accept": "application/json" }
    });

    const items = ytRes.data.items
      .map(extractVideoData)
      .filter(v => v && v.videoId);

    if (items.length > 0) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=300"
        },
        body: JSON.stringify({ items })
      };
    }

    throw new Error("No videos returned from API");

  } catch (err) {
    console.error("📺 YouTube Feed Error:", err.message);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60"
      },
      body: JSON.stringify({
        items: getFallbackVideos(),
        fallback: true,
        error: err.message,
        message: "Showing curated movement content"
      })
    };
  }
}

// 🔧 Extract video data — handles ALL API formats
function extractVideoData(item) {
  if (!item?.snippet) return null;

  let videoId =
    item.snippet.resourceId?.videoId ||
    item.id?.videoId ||
    (typeof item.id === "string" ? item.id : null);

  if (!videoId) return null;

  return {
    videoId,
    title: item.snippet.title?.trim() || "Untitled",
    description: item.snippet.description?.trim() || "",
    thumbnail:
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url ||
      "",
    url: `https://www.youtube.com/watch?v=${videoId}`,
    publishedAt: item.snippet.publishedAt || null
  };
}

// 🌟 Curated Fallback — ALWAYS loads, NO API needed
function getFallbackVideos() {
  return [
    {
      videoId: "8nTFjVm9sTQ",
      title: "Shane's Story: Pleading Sanity — Rise From Madness",
      description: "From darkness to purpose. One voice starting a movement. This is why we're here.",
      thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ"
    },
    {
      videoId: "mRf3-JkwqfU",
      title: "Survivor Voices — You Are Not Alone",
      description: "Real people. Real stories. Breaking the silence. We rise together.",
      thumbnail: "https://i.ytimg.com/vi/mRf3-JkwqfU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=mRf3-JkwqfU"
    },
    {
      videoId: "8F7b8FFsKis",
      title: "Cosmic Motivation — Keep Going",
      description: "Every fall is just preparation to rise higher. The stars are with you.",
      thumbnail: "https://i.ytimg.com/vi/8F7b8FFsKis/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8F7b8FFsKis"
    },
    {
      videoId: "VbfpW0pbvaU",
      title: "Resilience — Built Not Broken",
      description: "What doesn't break you rewrites you. Evolution, not erasure.",
      thumbnail: "https://i.ytimg.com/vi/VbfpW0pbvaU/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=VbfpW0pbvaU"
    }
  ];
}
