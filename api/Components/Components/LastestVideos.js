import { useEffect, useState } from 'react';

export default function LatestVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/fetchVideos')
      .then(res => res.json())
      .then(data => {
        setVideos(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching videos:", err);
        setLoading(false);
      });
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
          marginBottom: "20px",
        }}
      >
        🎥 Latest Cosmic Drops
      </h2>

      {loading && (
        <p style={{ textAlign: "center", color: "#ccc" }}>
          Loading fresh cosmic vibes...
        </p>
      )}

      <div
        className="videos-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {videos.slice(0, 4).map((video) => (
          <div
            key={video.id}
            className="video-card"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(0,255,240,0.2)",
              borderRadius: "14px",
              boxShadow: "0 0 18px rgba(0,255,240,0.25)",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch ${video.title}`}
            >
              <img
                src={video.thumbnail}
                alt={video.title || "Video thumbnail"}
                style={{
                  width: "100%",
                  display: "block",
                  borderBottom: "1px solid rgba(0,255,240,0.15)",
                }}
              />
            </a>
            <div style={{ padding: "12px" }}>
              <h3
                style={{
                  color: "#00fff0",
                  fontSize: "1.1rem",
                  marginBottom: "8px",
                }}
              >
                {video.title}
              </h3>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "0.4rem 0.8rem",
                    borderRadius: "8px",
                    background: "#00fff0",
                    fontWeight: "700",
                    color: "#000",
                    textDecoration: "none",
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
                      padding: "0.4rem 0.8rem",
                      borderRadius: "8px",
                      background: "#ff00ff",
                      fontWeight: "700",
                      color: "#fff",
                      textDecoration: "none",
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

      {(!loading && videos.length === 0) && (
        <p style={{ textAlign: "center", marginTop: "20px", color: "#ff3b5c" }}>
          No videos available yet — check back soon for new drops.
        </p>
      )}
    </section>
  );
}
