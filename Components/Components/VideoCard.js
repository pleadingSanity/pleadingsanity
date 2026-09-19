export default function VideoCard({ video }) {
  // Safe defaults
  const {
    title = "Untitled Video",
    description = "",
    url,
    id,
    thumbnail = "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
    channelTitle,
    subtitles
  } = video || {};

  const watchUrl = url || (id ? `https://www.youtube.com/watch?v=${id}` : "#");
  const displayDesc = description.length > 120
    ? `${description.slice(0, 120)}…`
    : description;

  return (
    <div
      className="video-card"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(0, 255, 240, 0.2)",
        borderRadius: "14px",
        boxShadow: "0 0 18px rgba(0, 255, 240, 0.25)",
        padding: "16px",
        margin: "20px 0",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 0 28px rgba(0, 255, 240, 0.45)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 0 18px rgba(0, 255, 240, 0.25)";
      }}
    >
      {/* Thumbnail Link */}
      <a
        href={watchUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Watch: ${title}`}
        style={{ textDecoration: "none" }}
      >
        <img
          src={thumbnail}
          alt={`${title} thumbnail`}
          loading="lazy"
          style={{
            width: "100%",
            height: "180px",
            borderRadius: "12px",
            marginBottom: "12px",
            boxShadow: "0 0 12px rgba(0, 255, 240, 0.25)",
            objectFit: "cover",
            background: "rgba(0, 0, 0, 0.3)",
          }}
        />
      </a>

      {/* Title */}
      <h3
        style={{
          color: "#00fff0",
          marginBottom: "8px",
          fontSize: "1.15rem",
          fontWeight: "700",
          lineHeight: "1.4",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {displayDesc && (
        <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "12px", lineHeight: "1.5" }}>
          {displayDesc}
        </p>
      )}

      {/* Buttons Row */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: "0.55rem 1.1rem",
            borderRadius: "8px",
            background: "#00fff0",
            fontWeight: "700",
            textDecoration: "none",
            color: "#000",
            boxShadow: "0 0 10px rgba(0, 255, 240, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#00e0ff";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#00fff0";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          ▶ Watch
        </a>

        {subtitles && (
          <a
            href={subtitles}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.55rem 1.1rem",
              borderRadius: "8px",
              background: "#ff00ff",
              fontWeight: "700",
              textDecoration: "none",
              color: "#fff",
              boxShadow: "0 0 10px rgba(255, 0, 255, 0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#d600d6";
              e.currentTarget.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ff00ff";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            📝 Subtitles
          </a>
        )}
      </div>

      {/* Channel Source */}
      {channelTitle && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "0.8rem",
            color: "#9ef",
            fontStyle: "italic",
            opacity: 0.8,
          }}
        >
          — {channelTitle}
        </p>
      )}
    </div>
  );
}
