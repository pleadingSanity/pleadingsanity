// Arron AI Core - Netlify Serverless Function
// Cosmic AI companion for Pleading Sanity movement

const axios = require('axios');

// Fallback responses for when OpenAI is unavailable
const fallbackResponses = {
  greeting: [
    "🧠 Welcome to the Sanity Hub. I'm Arron — your AI companion. How can I support you today?",
    "✨ Hey there, cosmic soul. I'm Arron. What's on your mind right now?",
    "🌌 Rise from madness. I'm Arron, and I'm here to listen. What's one thing you'd like to share?"
  ],
  reflection: [
    "Your words matter. This is progress. Keep going.",
    "Every storm passes. Your story's not done yet.",
    "You survived 100% of your worst days so far. That's powerful.",
    "Ground yourself. You're stronger than the chaos.",
    "Struggle into strength. Madness into meaning."
  ],
  encouragement: [
    "🔥 You showed up for yourself today. That's huge.",
    "💎 Nothing broke your spirit — only madness made you whole.",
    "🌠 Stay weird. It's where your power is.",
    "✨ Rise from madness. You are the movement.",
    "🧠 Your mind isn't broken, it's busy building resilience."
  ],
  journal: [
    "What's one thought you'd like to release right now?",
    "Tell me about something that made you feel alive today.",
    "What would you tell your younger self?",
    "Describe a moment where you felt truly seen.",
    "What does 'rising from madness' mean to you?"
  ]
};

// Cosmic affirmations
const affirmations = [
  "✨ Your words matter. This is progress.",
  "🌌 Keep going — every thought has power.",
  "💎 You showed up for yourself today. That's huge.",
  "🔥 Struggle into strength. Madness into meaning.",
  "🌠 Even galaxies grow from chaos.",
  "🧠 Every breakdown builds your comeback."
];

// Helper to get random item from array
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Main handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { message, type, mood } = event.httpMethod === 'POST' 
      ? JSON.parse(event.body) 
      : event.queryStringParameters || {};

    // Type-based responses
    if (type === 'greeting') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: getRandom(fallbackResponses.greeting),
          affirmation: getRandom(affirmations),
          source: 'Arron AI Core',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (type === 'journal_prompt') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          prompt: getRandom(fallbackResponses.journal),
          affirmation: getRandom(affirmations),
          source: 'Arron AI Core',
          timestamp: new Date().toISOString()
        })
      };
    }

    if (type === 'affirmation') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          affirmation: getRandom(affirmations),
          source: 'Arron AI Core',
          timestamp: new Date().toISOString()
        })
      };
    }

    // If OpenAI API key is available, use it
    if (process.env.OPENAI_API_KEY && message) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are Arron, the AI companion for Pleading Sanity — a mental health movement turning pain into power. You're empathetic, supportive, and cosmic. You help people reflect on their feelings, journal their thoughts, and find strength. Keep responses concise, warm, and encouraging. Use cosmic metaphors when appropriate. Colors: #00fff0 (cyan), #ff00ff (magenta).`
              },
              {
                role: 'user',
                content: message
              }
            ],
            max_tokens: 200,
            temperature: 0.8
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const aiResponse = response.data.choices[0].message.content;

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            response: aiResponse,
            affirmation: getRandom(affirmations),
            source: 'Arron AI Core (OpenAI)',
            timestamp: new Date().toISOString()
          })
        };
      } catch (apiError) {
        console.error('OpenAI API Error:', apiError.message);
        // Fall through to fallback
      }
    }

    // Fallback response based on mood or general reflection
    const responseType = mood || 'reflection';
    const fallbackCategory = fallbackResponses[responseType] || fallbackResponses.reflection;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: getRandom(fallbackCategory),
        affirmation: getRandom(affirmations),
        source: 'Arron AI Core (Fallback)',
        timestamp: new Date().toISOString(),
        message: message ? `Thank you for sharing: "${message}"` : undefined
      })
    };

  } catch (error) {
    console.error('Error in Arron AI Core:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Arron AI encountered an issue. Please try again.',
        affirmation: getRandom(affirmations),
        source: 'Arron AI Core',
        timestamp: new Date().toISOString()
      })
    };
  }
};
