import { useEffect, useState } from "react";

export default function LatestVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/fetchVideos");
        if (!res.ok) throw new Error("Failed to fetch videos");
        const data = await res.json();
        setVideos(data || []);
      } catch (err) {
        console.error("Error fetching videos:", err);
        // Cosmic fallback: never empty
        setVideos([
          {
            id: "8nTFjVm9sTQ",
            title: "Shane's Story: Building Pleading Sanity",
            thumbnail: "https://i.ytimg.com/vi/8nTFjVm9sTQ/mqdefault.jpg",
            url: "https://www.youtube.com/watch?v=8nTFjVm9sTQ",
            description: "How it all began — turn pain into power.",
          },
          {
            id: "mRf3-JkwqfU",
            title: "Mental Health: Real Survivors, Real Talk",
            thumbnail: "https://i.ytimg.com/vi/mRf3-JkwqfU/mqdefault.jpg",
            url: "https://www.youtube.com/watch?v=mRf3-JkwqfU",
            description: "Honest stories that inspire strength.",
          },
          {
            id: "8F7b8FFsKis",
            title: "Cosmic Motivation: Rise Again",
            thumbnail: "https://i.ytimg.com/vi/8F7b8FFsKis/mqdefault.jpg",
            url: "https://www.youtube.com/watch?v=8F7b8FFsKis",
            description: "Fuel for the ones who never quit.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  return (
    <section
      className="latest-videos"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "24px",
      }}
    >
      <h2
        style={{
          color: "#00fff0",
          textAlign: "center",
          marginBottom: "18px",
          textShadow: "0 2px 22px #00fff066",
        }}
      >
        🎥 Latest Cosmic Drops
      </h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#00fff0" }}>
          🚀 Loading fresh cosmic vibes...
        </p>
      )}

      <div
        className="videos-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "28px",
        }}
      >
        {videos.slice(0, 8).map((video, i) => (
          <div
            key={video.id || i}
            className="video-card"
            style={{
              background: "rgba(0,255,240,0.06)",
              border: "2px solid #00fff022",
              borderRadius: "18px",
              boxShadow: "0 0 22px #00fff025, 0 4px 24px #191A2B99",
              overflow: "hidden",
              transform: "translateY(0)",
              transition:
                "transform 0.23s cubic-bezier(.32,1.5,.75,1), box-shadow 0.2s",
              animation: "fadein 0.7s cubic-bezier(.32,1.5,.75,1)",
            }}
            onMouseOver={e =>
              (e.currentTarget.style.transform = "translateY(-7px) scale(1.03)")
            }
            onMouseOut={e =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${video.title}`}
              style={{ display: "block", position: "relative" }}
            >
              <img
                src={video.thumbnail}
                alt={video.title || "Video thumbnail"}
                style={{
                  width: "100%",
                  display: "block",
                  borderBottom: "1px solid #00fff055",
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  background: "#000",
                }}
              />
            </a>
            <div style={{ padding: "13px" }}>
              <h3
                style={{
                  color: "#00fff0",
                  fontSize: "1.11rem",
                  marginBottom: "7px",
                  fontWeight: 800,
                  letterSpacing: ".01em",
                  minHeight: 34,
                }}
              >
                {video.title}
              </h3>
              {video.description && (
                <p
                  style={{
                    color: "#b9faff",
                    fontSize: ".99em",
                    minHeight: "42px",
                    marginBottom: 5,
                  }}
                >
                  {video.description.slice(0, 80)}
                  {video.description.length > 80 ? "…" : ""}
                </p>
              )}
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.48rem 1.1rem",
                    borderRadius: "8px",
                    background:
                      "linear-gradient(90deg,#00fff0 60%,#ff00ff 120%)",
                    fontWeight: "800",
                    color: "#000",
                    textDecoration: "none",
                    boxShadow: "0 2px 12px #00fff044",
                    letterSpacing: ".01em",
                  }}
                >
                  ▶ Watch
                </a>
                {video.subtitles && (
                  <a
                    href={video.subtitles}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "0.47rem 1.05rem",
                      borderRadius: "8px",
                      background: "#ff00ff",
                      fontWeight: "700",
                      color: "#fff",
                      textDecoration: "none",
                      boxShadow: "0 1px 10px #ff00ff44",
                    }}
                  >
                    📝 Subtitles
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "25px", color: "#ff3b5c" }}>
          ❌ No videos available yet — check back soon for new drops.<br />
          <a
            href="/journal-vault.html"
            style={{
              background: "#00fff0",
              color: "#000",
              fontWeight: "700",
              borderRadius: "8px",
              padding: ".5rem 1.2rem",
              marginTop: "15px",
              display: "inline-block",
              boxShadow: "0 2px 20px #00fff044",
              textDecoration: "none",
            }}
          >
            ✍️ Submit Your Story/Video
          </a>
        </div>
      )}

      <style>
        {`
        @keyframes fadein {
          0% { opacity:0; transform:translateY(12px);}
          100%{ opacity:1; transform:translateY(0);}
        }
        `}
      </style>
    </section>
  );
}