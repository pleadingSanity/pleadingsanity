import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle → loading → success → error
  const [message, setMessage] = useState('');

  // 📧 Replace with YOUR Mailchimp Form Action URL
  // Get this from: Mailchimp → Audience → Signup forms → Embedded forms → Copy "action" URL
  const MAILCHIMP_FORM_URL = process.env.NEXT_PUBLIC_MAILCHIMP_FORM_URL || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    if (!MAILCHIMP_FORM_URL) {
      setStatus('error');
      setMessage('⚠️ Mailchimp URL not set — add NEXT_PUBLIC_MAILCHIMP_FORM_URL to .env');
      return;
    }

    setStatus('loading');

    // Fallback: direct Mailchimp form submit (works instantly)
    const form = e.target;
    form.submit();
    
    // Show success message immediately
    setStatus('success');
    setMessage('✨ Thank you! Check your email to confirm. Welcome to the family.');
    setEmail('');
  };

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(0, 255, 240, 0.2)",
        borderRadius: "14px",
        padding: "24px 20px",
        maxWidth: "500px",
        margin: "2rem auto",
        textAlign: "center",
        boxShadow: "0 0 18px rgba(0, 255, 240, 0.25)",
        backdropFilter: "blur(8px)",
      }}
    >
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: "1.25rem",
          fontWeight: "700",
          color: "#00fff0",
          textShadow: "0 0 10px rgba(0, 255, 240, 0.3)",
        }}
      >
        🌌 Get cosmic inspiration in your inbox
      </h3>
      
      <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: "18px" }}>
        No spam. Just survivor stories, movement updates & cosmic wisdom.
      </p>

      {status === 'success' && (
        <p style={{ color: "#00fff0", marginBottom: "15px" }}>
          ✨ {message}
        </p>
      )}
      
      {status === 'error' && (
        <p style={{ color: "#ff6b6b", marginBottom: "15px" }}>
          ⚠️ {message}
        </p>
      )}

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
          style={{
            padding: "0.75rem 1rem",
            width: "100%",
            maxWidth: "320px",
            borderRadius: "8px",
            border: "1px solid rgba(0, 255, 240, 0.4)",
            marginBottom: "14px",
            background: "rgba(0, 0, 0, 0.6)",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#00fff0";
            e.target.style.boxShadow = "0 0 12px rgba(0, 255, 240, 0.3)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(0, 255, 240, 0.4)";
            e.target.style.boxShadow = "none";
          }}
        />
        
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            background: "linear-gradient(90deg, #00fff0, #ff00ff)",
            fontWeight: "700",
            color: "#000",
            cursor: status === 'loading' ? "wait" : "pointer",
            transition: "transform 0.2s, opacity 0.2s",
            fontSize: "1rem",
          }}
          onMouseEnter={(e) => {
            if (status !== 'loading') {
              e.target.style.opacity = "0.9";
              e.target.style.transform = "scale(1.03)";
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.opacity = "1";
            e.target.style.transform = "scale(1)";
          }}
        >
          {status === 'loading' ? '⏳ Sending...' : '🚀 Subscribe'}
        </button>
      </form>

      <p style={{ marginTop: "16px", fontSize: "0.8rem", color: "#555" }}>
        We respect your space. Unsubscribe anytime.
      </p>
    </div>
  );
}
