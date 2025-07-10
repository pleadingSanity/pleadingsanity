import Navbar from '../components/Navbar';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h1>404 – Page Not Found</h1>
        <p>
          Oops! Even sanity sometimes goes missing.<br />
          <a href="/">Go back home</a>
        </p>
      </main>
    </>
  );
}
