const axios = require('axios');

// ─── SHOP & SOCIAL LINKS — ALL YOURS, VERIFIED ───
const shopLinks = {
  shopify: 'https://dqfzb1-ki.myshopify.com/',
  payhip: 'https://payhip.com/Pleadingsanity',
  tiktok: 'https://vt.tiktok.com/ZNd4wRFfn/?page=TikTokShop',
  instagram: 'https://instagram.com/mentally.inshane',
  email: 'pleadingsanity1@gmail.com'
};

// ─── FALLBACK QUOTES — PLEADING SANITY ORIGINALS ───
const fallbackQuotes = [
  { q: 'Rise from madness — you are stronger than the storm.', a: 'Pleading Sanity' },
  { q: 'Every hoodie we sell helps keep this movement alive.', a: 'Arron' },
  { q: 'Your story matters. Breathe. Journal. Heal.', a: 'Sanity Team' },
  { q: 'Pain can become purpose — keep building.', a: 'Arron' },
  { q: 'The cosmos is vast, but your light still counts.', a: 'Pleading Sanity' },
  { q: 'Evolution, not erasure. Grow, don\'t hide.', a: 'Shane Cooper' },
  { q: 'What they label as broken, we wear as purpose.', a: 'Pleading Sanity' },
  { q: 'You\'re not falling apart — you\'re being rebuilt.', a: 'Arron' }
];

// ─── MOOD-SPECIFIC WISDOM ───
const moodTips = {
  low: [
    'You survived 100% of your worst days so far.',
    'Even galaxies grow from chaos.',
    'There\'s beauty in every breakdown — keep breathing.',
    'Every storm passes. Your story\'s not done yet.',
    'Text a friend. Your words matter more than you think.',
    'Rest isn\'t giving up — it\'s recharging.',
    'Your worth isn\'t measured by your output.'
  ],
  anxious: [
    'Slow breath. In through the nose, out through the pain.',
    'Your mind isn\'t broken — it\'s busy building resilience.',
    'Ground yourself. Notice five things you see right now.',
    'Drink some water. Hydration = more cosmic energy.',
    'Pause. Remember: you are not your thoughts.',
    'This feeling is a wave — it will pass. Ride it, don\'t fight it.',
    'One small step is still moving forward.'
  ],
  brave: [
    'You walked through fire and kept going. That\'s legendary.',
    'Courage isn\'t absence of fear — it\'s moving anyway.',
    'Your truth is powerful enough to change things.',
    'They said you couldn\'t — you did. That\'s your superpower.'
  ]
};

// ─── DAILY SURVIVOR TIPS ───
const survivorTips = [
  '🌠 Stay weird. It\'s where your power is.',
  '💧 Drink water, move your body, text a mate.',
  '✨ Write a journal entry — future you will thank you.',
  '🔥 Rock your Crying Brain hoodie today.',
  '🎧 2 mins of music > 2 hours of worry.',
  '🧠 Progress > perfection. Always.',
  '💙 You don\'t have to carry it all at once.',
  '🌿 Healing isn\'t linear — and that\'s okay.'
];

// ─── BRAND ACTIONS ───
const brandActions = ['shop', 'journal', 'join', 'listen', 'share', 'heal'];

// ─── HELPER: Safe random pick ───
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── MAIN HANDLER ───
module.exports = async function handler(req, res) {
  // ✅ CORS — Works everywhere: local, Netlify, Vercel, your site
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { mood } = req.query;

    // Validate mood — only accept known values
    const validMoods = Object.keys(moodTips);
    const selectedMood = validMoods.includes(mood) ? mood : null;

    let quote = null;
    let author = null;
    let source = 'fallback';

    // 1. Try ZenQuotes first
    try {
      const { data } = await axios.get('https://zenquotes.io/api/random', {
        timeout: 5000
      });
      if (Array.isArray(data) && data[0]?.q && data[0]?.a) {
        quote = data[0].q;
        author = data[0].a;
        source = 'zenquotes';
      }
    } catch {
      console.log('✨ ZenQuotes — using Sanity wisdom instead');
    }

    // 2. Mood-specific overrides everything
    if (selectedMood) {
      quote = pickRandom(moodTips[selectedMood]);
      author = `Arron • ${selectedMood} reminder`;
      source = 'mood';
    }

    // 3. Your core originals — always there
    if (!quote) {
      const fallback = pickRandom(fallbackQuotes);
      quote = fallback.q;
      author = fallback.a;
      source = 'sanity-core';
    }

    // ✅ CLEAN RESPONSE
    res.status(200).json({
      success: true,
      source,
      mood: selectedMood,
      quote,
      author,
      arronMessage: '💡 Arron says: Keep it raw, keep it real. Sanity isn\'t lost — it\'s built.',
      survivorTip: pickRandom(survivorTips),
      cta: {
        suggestedAction: pickRandom(brandActions),
        links: shopLinks
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error('❌ Daily Wisdom Error:', err.message);

    // ✅ EMERGENCY — NEVER FAILS
    const fallback = pickRandom(fallbackQuotes);
    res.status(200).json({
      success: true,
      source: 'emergency-fallback',
      quote: fallback.q,
      author: fallback.a,
      arronMessage: '💙 We\'re still here. Keep going.',
      survivorTip: pickRandom(survivorTips),
      cta: { links: shopLinks },
      timestamp: new Date().toISOString()
    });
  }
};
