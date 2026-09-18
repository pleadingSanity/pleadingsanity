import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main
        style={{
          textAlign: 'center',
          marginTop: '6rem',
          padding: '2rem',
          color: '#fff',
          background: 'radial-gradient(ellipse at 50% 120%, #0d1b2a 0%, #000 70%)',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)',
            color: '#00fff0',
            marginBottom: '1rem',
            fontWeight: '800',
            letterSpacing: '1px',
          }}
        >
          404 — Lost in the Cosmos
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.3rem)',
            color: '#ccc',
            marginBottom: '2.5rem',
            maxWidth: '500px',
            lineHeight: '1.7',
          }}
        >
          Even sanity sometimes drifts into the void.<br />
          But don't worry — the stars will guide you back home.
        </p>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '3rem',
          }}
        >
          <a
            href="/"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00fff0, #00ccb8)',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              boxShadow: '0 0 20px rgba(0, 255, 240, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🏠 Home
          </a>

          <a
            href="/sanity-hub"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff00ff, #cc00cc)',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              boxShadow: '0 0 20px rgba(255, 0, 255, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🧠 Sanity Hub
          </a>

          <a
            href="/journal"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ffd700, #e6b800)',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            📖 Journal
          </a>

          <a
            href="/shop"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ff90, #00cc70)',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
              transition: 'transform 0.2s ease',
              boxShadow: '0 0 20px rgba(0, 255, 144, 0.3)',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            🛒 Shop
          </a>
        </div>

        <p
          style={{
            marginTop: '2rem',
            fontSize: '0.95rem',
            color: '#666',
            fontStyle: 'italic',
          }}
        >
          "Even in the dark, you're still part of the constellation." ✨
        </p>
      </main>
    </>
  );
}
