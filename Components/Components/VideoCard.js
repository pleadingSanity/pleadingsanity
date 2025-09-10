export default function VideoCard({ video }) {
  return (
    <div
      className="video-card"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(0,255,240,0.2)",
        borderRadius: "14px",
        boxShadow: "0 0 18px rgba(0,255,240,0.25)",
        padding: "16px",
        margin: "20px 0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <a
        href={`https://www.youtube.com/watch?v=${video.videoId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${video.title}`}
      >
        <img
          src={video.thumbnail}
          alt={video.title || "Video thumbnail"}
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "12px",
            boxShadow: "0 0 12px rgba(0,255,240,0.15)",
          }}
        />
      </a>
      <h3 style={{ color: "#00fff0", marginBottom: "8px" }}>{video.title}</h3>
      <p style={{ fontSize: "0.9rem", color: "#ccc" }}>
        {video.description?.slice(0, 100)}...
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          className="btn"
          href={`https://www.youtube.com/watch?v=${video.videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "#00fff0",
            fontWeight: "700",
            textDecoration: "none",
            color: "#000",
          }}
        >
          ▶ Watch
        </a>
        {video.subtitles && (
          <a
            className="btn"
            href={video.subtitles}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              background: "#ff00ff",
              fontWeight: "700",
              textDecoration: "none",
              color: "#fff",
            }}
          >
            📝 Subtitles
          </a>
        )}
      </div>
    </div>
  );
}
