import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Get a random motivational quote
    let quote = null;
    try {
      const { data } = await axios.get('https://zenquotes.io/api/random');
      quote = data && data[0] ? data[0].q + ' — ' + data[0].a : null;
    } catch {
      // Silent fail, fallback handled below
    }

    // Default PS core messages
    const fallbackQuotes = [
      "Rise from madness — you are stronger than the storm.",
      "Every hoodie we sell helps keep this movement alive.",
      "Your story matters. Breathe. Journal. Heal.",
      "Pain can become purpose — keep building.",
      "The cosmos is vast, but your light still counts."
    ];

    // Shop + email CTAs
    const shopLinks = {
      shopify: "https://dqfzb1-ki.myshopify.com/",
      payhip: "https://payhip.com/Pleadingsanity",
      tiktok: "https://vt.tiktok.com/ZNd4wRFfn/?page=TikTokShop"
    };

    const email = "pleadingsanity1@gmail.com";

    // Build response payload
    res.status(200).json({
      quote: quote || fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)],
      arronMessage: "💡 Arron says: Keep it raw, keep it real. Sanity isn’t lost — it’s built.",
      cta: {
        shop: shopLinks,
        email: `Contact us: ${email}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
}
