// netlify/functions/aiBridge-history.js
// Handles GET /api/aiBridge/history requests.

const { getDb } = require('./_shared/firebase')

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { conversationId, limit = '20' } = event.queryStringParameters || {}
    if (!conversationId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'conversationId query param required' }) }
    }

    const db = getDb()
    const snapshot = await db
      .collection('interAI_conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAtIso', 'desc')
      .limit(Number(limit))
      .get()

    const messages = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .reverse()

    return {
      statusCode: 200,
      body: JSON.stringify({ conversationId, messages })
    }
  } catch (err) {
    console.error('[aiBridge-history]', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
