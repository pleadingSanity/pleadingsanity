export default function VideoCard({ video }) {
  // Safe defaults — never breaks even if data missing
  const {
    title = "Untitled Video",
    description = "",
    url,
    id,
    thumbnail = "https://pleadingsanity.co.uk/assets/crying-brain-og.png",
    channelTitle,
    subtitles
  } = video || {};

  // Build watch URL safely
  const watchUrl = url || (id ? `https://www.youtube.com/watch?v=${id}` : "#");

  // Truncate description cleanly
  const displayDesc = description.length > 120
    ? `${description.slice(0, 120)}…`
    : description;

  return (
    <div
      className="video-card"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(0, 255, 240, 0.2)",
        borderRadius: "16px",
        boxShadow: "0 0 18px rgba(0, 255, 240, 0.25)",
        padding: "18px",
        margin: "20px 0",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-5px)";
        e.currentTarget.style.boxShadow = "0 8px 30px rgba(0, 255, 240, 0.35), 0 0 28px rgba(0, 255, 240, 0.2)";
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
        aria-label={`Watch video: ${title}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <img
          src={thumbnail}
          alt={`${title} video thumbnail`}
          loading="lazy"
          style={{
            width: "100%",
            height: "180px",
            borderRadius: "14px",
            marginBottom: "14px",
            boxShadow: "0 0 15px rgba(0, 255, 240, 0.2)",
            objectFit: "cover",
            background: "rgba(0, 0, 0, 0.4)",
            transition: "transform 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
          onError={(e) => {
            // Fallback if image fails to load
            e.currentTarget.src = "https://pleadingsanity.co.uk/assets/crying-brain-og.png";
          }}
        />
      </a>

      {/* Title */}
      <h3
        style={{
          color: "#00fff0",
          marginBottom: "10px",
          fontSize: "1.15rem",
          fontWeight: "700",
          lineHeight: "1.4",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      {displayDesc && (
        <p style={{ fontSize: "0.9rem", color: "#ccc", marginBottom: "14px", lineHeight: "1.6" }}>
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
            padding: "0.6rem 1.2rem",
            borderRadius: "10px",
            background: "linear-gradient(90deg, #00fff0, #00c8c0)",
            fontWeight: "700",
            textDecoration: "none",
            color: "#000",
            boxShadow: "0 0 12px rgba(0, 255, 240, 0.35)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.05)";
            e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 255, 240, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 255, 240, 0.35)";
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
              padding: "0.6rem 1.2rem",
              borderRadius: "10px",
              background: "linear-gradient(90deg, #ff00ff, #c800c8)",
              fontWeight: "700",
              textDecoration: "none",
              color: "#fff",
              boxShadow: "0 0 12px rgba(255, 0, 255, 0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 20px rgba(255, 0, 255, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(255, 0, 255, 0.35)";
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
            marginTop: "14px",
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
