import { useState } from 'react';

// ==============================================================
// PLEADING SANITY — NEWSLETTER SIGNUP COMPONENT v2.0-FINAL
// Cosmic gradient • Smooth states • Accessible • Mailchimp ready
// Evolution, Not Erasure • One Source • One Family
// ==============================================================

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle → loading → success → error
  const [message, setMessage] = useState('');

  // 📧 Get this from: Mailchimp → Audience → Signup forms → Embedded → "action" URL
  const MAILCHIMP_FORM_URL = process.env.NEXT_PUBLIC_MAILCHIMP_FORM_URL || '';

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim()) return;

    if (!MAILCHIMP_FORM_URL) {
      setStatus('error');
      setMessage('Mailchimp URL missing — add NEXT_PUBLIC_MAILCHIMP_FORM_URL to .env');
      return;
    }

    setStatus('loading');

    // ✅ Direct Mailchimp submission — reliable & instant
    const form = e.target;
    form.submit();

    // ✅ Immediate feedback — user sees confirmation right away
    setStatus('success');
    setMessage('Welcome to the family! ✨ Check your email to confirm.');
    setEmail('');
    
    // Reset success message after delay
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 6000);
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(0, 255, 240, 0.25)",
        borderRadius: "16px",
        padding: "28px 24px",
        maxWidth: "520px",
        margin: "2rem auto",
        textAlign: "center",
        boxShadow: "0 0 24px rgba(0, 255, 240, 0.15), inset 0 0 12px rgba(0, 255, 240, 0.05)",
        backdropFilter: "blur(10px)",
        transition: "transform 0.3s ease",
      }}
    >
      <h3
        style={{
          margin: "0 0 8px 0",
          fontSize: "1.35rem",
          fontWeight: "700",
          color: "#00fff0",
          textShadow: "0 0 15px rgba(0, 255, 240, 0.4)",
          letterSpacing: "0.5px",
        }}
      >
        🌌 Join the Movement
      </h3>
      
      <p style={{ color: "#9aa0b4", fontSize: "0.92rem", marginBottom: "20px", lineHeight: "1.5" }}>
        No spam. Just survivor stories, cosmic wisdom, and movement updates.
      </p>

      {/* ✅ Success State */}
      {status === 'success' && (
        <p style={{ color: "#00fff0", marginBottom: "18px", fontWeight: "500" }}>
          ✨ {message}
        </p>
      )}
      
      {/* ✅ Error State */}
      {status === 'error' && (
        <p style={{ color: "#ff6b6b", marginBottom: "18px" }}>
          ⚠️ {message}
        </p>
      )}

      {/* ✅ Form */}
      <form
        action={MAILCHIMP_FORM_URL}
        method="post"
        target="_blank"
        rel="noopener noreferrer"
        onSubmit={handleSubmit}
        style={{ margin: 0 }}
      >
        <input
          type="email"
          name="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
          aria-label="Email address"
          style={{
            padding: "0.85rem 1.25rem",
            width: "100%",
            maxWidth: "340px",
            borderRadius: "10px",
            border: "1px solid rgba(0, 255, 240, 0.35)",
            marginBottom: "16px",
            background: "rgba(0, 0, 0, 0.65)",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#00fff0";
            e.target.style.boxShadow = "0 0 14px rgba(0, 255, 240, 0.35)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0, 255, 240, 0.35)";
            e.target.style.boxShadow = "none";
          }}
        />
        
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: "0.85rem 2rem",
            borderRadius: "10px",
            border: "none",
            background: "linear-gradient(90deg, #00fff0, #ff00ff)",
            fontWeight: "700",
            color: "#000",
            cursor: status === 'loading' ? "wait" : "pointer",
            transition: "transform 0.2s ease, opacity 0.2s ease",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) => {
            if (status !== 'loading') {
              e.target.style.opacity = "0.92";
              e.target.style.transform = "scale(1.04)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = "1";
            e.target.style.transform = "scale(1)";
          }}
        >
          {status === 'loading' ? '⏳ Joining...' : '🚀 Subscribe'}
        </button>
      </form>

      <p style={{ marginTop: "18px", fontSize: "0.78rem", color: "#555a70" }}>
        Your space matters. Unsubscribe anytime. 💙
      </p>
    </div>
  );
}
