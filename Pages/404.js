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
        }}
      >
        <h1 style={{ fontSize: '2.5rem', color: '#00fff0', marginBottom: '1rem' }}>
          404 – Lost in the Cosmos
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', marginBottom: '2rem' }}>
          Oops… even sanity sometimes drifts into the void.<br />
          But don’t worry — the stars will guide you back.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="/"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: '#00fff0',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            🏠 Home
          </a>
          <a
            href="/sanity-hub"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: '#ff00ff',
              color: '#fff',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            🧠 Sanity Hub
          </a>
          <a
            href="/shop"
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '10px',
              background: '#00ff90',
              color: '#000',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            🛒 Shop
          </a>
        </div>
        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          “Even in the dark, you’re still part of the constellation.” ✨
        </p>
      </main>
    </>
  );
}
