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
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 0 28px rgba(0,255,240,0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 0 18px rgba(0,255,240,0.25)";
      }}
    >
      <a
        href={video.url || `https://www.youtube.com/watch?v=${video.id}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch ${video.title}`}
      >
        <img
          src={video.thumbnail || "assets/crying-brain-og.png"}
          alt={video.title || "Video thumbnail"}
          style={{
            width: "100%",
            borderRadius: "12px",
            marginBottom: "12px",
            boxShadow: "0 0 12px rgba(0,255,240,0.25)",
            objectFit: "cover",
          }}
        />
      </a>

      <h3
        style={{
          color: "#00fff0",
          marginBottom: "8px",
          fontSize: "1.15rem",
          fontWeight: "700",
          lineHeight: "1.4",
        }}
      >
        {video.title || "Untitled Video"}
      </h3>

      {video.description && (
        <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "10px" }}>
          {video.description.slice(0, 120)}...
        </p>
      )}

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          className="btn"
          href={video.url || `https://www.youtube.com/watch?v=${video.id}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "8px",
            background: "#00fff0",
            fontWeight: "700",
            textDecoration: "none",
            color: "#000",
            boxShadow: "0 0 10px rgba(0,255,240,0.35)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#00e0ff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#00fff0")}
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
              padding: "0.55rem 1.1rem",
              borderRadius: "8px",
              background: "#ff00ff",
              fontWeight: "700",
              textDecoration: "none",
              color: "#fff",
              boxShadow: "0 0 10px rgba(255,0,255,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#d600d6")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#ff00ff")}
          >
            📝 Subtitles
          </a>
        )}
      </div>

      {video.channelTitle && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "0.8rem",
            color: "#9ef",
            fontStyle: "italic",
          }}
        >
          Source: {video.channelTitle}
        </p>
      )}
    </div>
  );
}
