// netlify/functions/aiBridge-message.js
// Handles POST /api/aiBridge/message requests.

const { getDb } = require('./_shared/firebase')
const { routeMessage } = require('./_shared/aiRouter')

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const payload = JSON.parse(event.body || '{}')
    const { conversationId, sender = 'human', message, metadata = {} } = payload

    if (!conversationId || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'conversationId and message are required' }) }
    }

    const db = getDb()
    const convoRef = db.collection('interAI_conversations').doc(conversationId)

    const createdAtIso = new Date().toISOString()
    const userEntry = {
      sender,
      type: 'user',
      message,
      metadata,
      createdAtIso,
      createdAt: createdAtIso
    }

    await convoRef.collection('messages').add(userEntry)

    const historySnapshot = await convoRef.collection('messages').orderBy('createdAtIso', 'asc').get()
    const history = historySnapshot.docs.map(doc => ({
      role: doc.data().type === 'user' ? 'user' : 'assistant',
      name: doc.data().sender,
      content: doc.data().message
    }))

    const responses = await routeMessage({
      entry: { conversationId, sender, message, metadata, history },
      openAiKey: process.env.OPENAI_API_KEY
    })

    const batch = db.batch()
    responses.forEach(res => {
      const aiDoc = convoRef.collection('messages').doc()
      const aiCreated = res.createdAt || new Date().toISOString()
      batch.set(aiDoc, {
        sender: res.name || res.aiId,
        type: 'ai',
        aiId: res.aiId,
        message: res.content,
        metadata: { role: res.role },
        createdAtIso: aiCreated,
        createdAt: aiCreated
      })
    })

    batch.set(
      convoRef,
      {
        lastUpdated: new Date().toISOString(),
        lastMessage: message,
        lastSender: sender
      },
      { merge: true }
    )

    await batch.commit()

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'ok', conversationId, responses })
    }
  } catch (err) {
    console.error('[aiBridge-message]', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
