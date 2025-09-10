export default function NewsletterSignup() {
  return (
    <form
      action="https://YOUR_MAILCHIMP_URL" 
      method="post"
      target="_blank"
      rel="noopener noreferrer"
      className="newsletter-form"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(0,255,240,0.2)",
        borderRadius: "14px",
        padding: "20px",
        maxWidth: "500px",
        margin: "2rem auto",
        textAlign: "center",
        boxShadow: "0 0 18px rgba(0,255,240,0.25)",
      }}
    >
      <label
        htmlFor="email"
        style={{
          display: "block",
          marginBottom: "10px",
          fontSize: "1.2rem",
          fontWeight: "700",
          color: "#00fff0",
        }}
      >
        🌌 Get cosmic inspiration in your inbox
      </label>
      <input
        type="email"
        name="EMAIL"
        id="email"
        placeholder="pleadingsanity1@gmail.com"
        required
        style={{
          padding: "0.6rem",
          width: "100%",
          maxWidth: "320px",
          borderRadius: "8px",
          border: "1px solid rgba(0,255,240,0.4)",
          marginBottom: "12px",
          background: "#000",
          color: "#fff",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "0.6rem 1.2rem",
          borderRadius: "8px",
          border: "none",
          background: "linear-gradient(90deg,#00fff0,#ff00ff)",
          fontWeight: "700",
          color: "#000",
          cursor: "pointer",
          transition: "0.2s ease",
        }}
        onMouseOver={(e) => (e.target.style.opacity = "0.85")}
        onMouseOut={(e) => (e.target.style.opacity = "1")}
      >
        🚀 Subscribe
      </button>
      <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#aaa" }}>
        No spam. Just stories, updates & cosmic wisdom.
      </p>
    </form>
  );
}
