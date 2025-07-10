export default function NewsletterSignup() {
  return (
    <form
      action="https://YOUR_MAILCHIMP_URL"
      method="post"
      target="_blank"
      rel="noopener noreferrer"
      className="newsletter-form"
    >
      <label htmlFor="email">Get inspiration in your inbox:</label>
      <input type="email" name="EMAIL" id="email" placeholder="Your email" required />
      <button type="submit">Subscribe</button>
    </form>
  );
}
