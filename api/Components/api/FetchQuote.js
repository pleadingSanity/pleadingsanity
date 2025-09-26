import axios from 'axios';

const fallbackQuotes = [
  { q: "Rise from madness — you are stronger than the storm.", a: "Pleading Sanity" },
  { q: "Every hoodie we sell helps keep this movement alive.", a: "Arron" },
  { q: "Your story matters. Breathe. Journal. Heal.", a: "Sanity Team" },
  { q: "Pain can become purpose — keep building.", a: "Arron" },
  { q: "The cosmos is vast, but your light still counts.", a: "Pleading Sanity" }
];

const moodTips = {
  low: [
    "You survived 100% of your worst days so far.",
    "Even galaxies grow from chaos.",
    "There’s beauty in every breakdown — keep breathing.",
    "Every storm passes. Your story’s not done yet.",
    "Text a friend. Your words matter more than you think."
  ],
  anxious: [
    "Slow breath. In through the nose, out through the pain.",
    "Your mind isn’t broken, it’s busy building resilience.",
    "Ground yourself. Notice five things you see.",
    "Drink some water. Hydration = more cosmic energy.",
    "Pause. Remember: you are not your thoughts."
  ]
};

const shopLinks = {
  shopify: "https://dqfzb1-ki.myshopify.com/",
  payhip: "https://payhip.com/Pleadingsanity",
  tiktok: "https://vt.tiktok.com/ZNd4wRFfn/?page=TikTokShop",
  insta: "https://instagram.com/mentally.inshane",
  email: "pleadingsanity1@gmail.com"
};

const brandActions = ["shop", "journal", "join", "listen"];

export default async function handler(req, res) {
  try {
    const mood = req.query.mood && moodTips[req.query.mood]
      ? req.query.mood
      : null;

    let quote = null, author = null;

    // Try pulling from ZenQuotes
    try {
      const { data } = await axios.get('https://zenquotes.io/api/random');
      quote = data && data[0]?.q;
      author = data && data[0]?.a;
    } catch (err) {
      // Fallback
      if (mood) {
        quote = moodTips[mood][Math.floor(Math.random() * moodTips[mood].length)];
        author = "Arron, Pleading Sanity";
      } else {
        const pick = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
        quote = pick.q;
        author = pick.a;
      }
    }

    // Add “Survivor tip” (for side banners or popups)
    const survivorTips = [
      "🌠 Stay weird. It's where your power is.",
      "💧 Drink water, move your body, text a mate.",
      "✨ Write a journal entry — future you will thank you.",
      "🔥 Rock your Crying Brain hoodie today.",
      "🎧 2 mins of music > 2 hours of worry.",
    ];

    // Pick a random action for UI suggestions
    const action = brandActions[Math.floor(Math.random() * brandActions.length)];

    res.status(200).json({
      quote,
      author,
      arronMessage: "💡 Arron says: Keep it raw, keep it real. Sanity isn’t lost — it’s built.",
      cta: {
        shop: shopLinks,
        brand_action: action
      },
      survivorTip: survivorTips[Math.floor(Math.random() * survivorTips.length)],
      timestamp: new Date().toISOString()
    });

  } catch (e) {
    console.error("Motivator API error:", e);
    res.status(500).json({ error: e.toString() });
  }
}