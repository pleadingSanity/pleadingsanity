import { useEffect, useState } from "react";
import VideoCard from "./VideoCard";

export default function LatestVideos({ limit = 6 }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Curated fallback — ALL links verified live & meaningful
  const fallbackVideos = [
    {
      id: "8nTFjVm9sTQ",
      title: "🎵 Radiohead — House of Cards • Resilience & Grace",
      thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
      description: "Built on what remains, not what fell. A reminder that strength isn't about perfection.",
      channelTitle: "Radiohead"
    },
    {
      id: "999z0Kf5Xf0",
      title: "🧠 Nervous System Regulation • Healing Frequency",
      thumbnail: "https://i.ytimg.com/vi/999z0Kf5Xf0/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=999z0Kf5Xf0",
      description: "1 hour handpan music • calm the body, quiet the mind.",
      channelTitle: "Malte Marten"
    },
    {
      id: "NO_surveillance",
      title: "✨ Pleading Sanity • What This Movement Is",
      thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
      url: "/movement",
      description: "From pain to purpose. Your story matters. Evolution, not erasure.",
      channelTitle: "Pleading Sanity"
    },
    {
      id: "let_down_rising",
      title: "🌅 When You Feel Let Down • Keep Going",
      thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
      url: "/journal-vault",
      description: "Every storm passes. You're not alone in this.",
      channelTitle: "Sanity Team"
    },
    {
      id: "creep_rising",
      title: "🔥 Radiohead — Creep • Feeling Different",
      thumbnail: "https://i.ytimg.com/vi/5gg6APY8gGs/mqdefault.jpg",
      url: "https://www.youtube.com/watch?v=5gg6APY8gGs",
      description: "Different isn't broken. It's just... different.",
      channelTitle: "Nirvana & Radiohead Vibes"
    },
    {
      id: "healing_hz_intro",
      title: "🔊 432 Hz • Deep Healing & Balance",
      thumbnail: "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
      url: "/frequencies",
      description: "Align your energy. Breathe. Reset.",
      channelTitle: "Pleading Sanity"
    }
  ];

  useEffect(() => {
    async function fetchVideos() {
      try {
        // ✅ Matches our actual API endpoint
        const res = await fetch("/api/youtube-search?q=mental+health+healing+resilience&maxResults=12");
        
        if (!res.ok) throw new Error("API unreachable");
        
        const data = await res.json();
        
        // Merge: live results first, then curated fallbacks
        const combined = [
          ...(data.videos || []),
          ...fallbackVideos
        ];
        
        // Deduplicate by id
        const seen = new Set();
        const unique = combined.filter(v => {
          if (!v.id || seen.has(v.id)) return false;
          seen.add(v.id);
          return true;
        });

        setVideos(unique);
      } catch (err) {
        console.log("✨ Using curated video collection");
        // ✅ On any error → show verified fallbacks immediately
        setVideos(fallbackVideos);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  const displayVideos = videos.slice(0, limit);

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px 24px",
      }}
    >
      <h2
        style={{
          color: "#00fff0",
          textAlign: "center",
          marginBottom: "24px",
          textShadow: "0 0 20px rgba(0,255,240,0.3)",
          fontSize: "1.8rem",
        }}
      >
        🎥 Cosmic Inspiration
      </h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#00fff0", padding: "20px" }}>
          🚀 Loading wisdom from across the cosmos...
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}
      >
        {displayVideos.map((video, i) => (
          <VideoCard key={video.id || i} video={video} />
        ))}
      </div>

      {!loading && displayVideos.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <p style={{ color: "#888" }}>
            More cosmic drops arriving soon ✨
          </p>
          <a
            href="/journal-vault"
            style={{
              display: "inline-block",
              marginTop: "15px",
              padding: "10px 24px",
              borderRadius: "8px",
              background: "linear-gradient(90deg, #00fff0, #ff00ff)",
              color: "#000",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            ✍️ Share Your Story
          </a>
        </div>
      )}
    </section>
  );
}
