// netlify/functions/_shared/aiRouter.js
// Placeholder router coordinating multi-AI message fan-out.

async function ensureFetch() {
  if (typeof globalThis.fetch === 'function') {
    return globalThis.fetch.bind(globalThis)
  }

  const { default: nodeFetch } = await import('node-fetch')
  return nodeFetch
}

async function callOpenAI({ apiKey, model, messages }) {
  if (!apiKey) {
    return { role: 'assistant', name: 'Arron', content: '[OpenAI API key missing]' }
  }

  const fetcher = await ensureFetch()
  const response = await fetcher('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`OpenAI API error: ${response.status} ${errorBody}`)
  }

  const payload = await response.json()
  return payload.choices?.[0]?.message ?? null
}

async function routeMessage({ entry, openAiKey }) {
  const history = entry.history || []
  const baseMessages = history.concat([{ role: 'user', content: entry.message, name: entry.sender }])

  const targets = [
    {
      id: 'Arron',
      type: 'chatgpt',
      enabled: true,
      handler: () =>
        callOpenAI({
          apiKey: openAiKey,
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: baseMessages
        })
    },
    {
      id: 'Copilot',
      type: 'infra',
      enabled: false,
      handler: async () => ({ role: 'assistant', name: 'Copilot', content: '[TODO: Connect infra AI]' })
    },
    {
      id: 'Meta',
      type: 'social',
      enabled: false,
      handler: async () => ({ role: 'assistant', name: 'Meta', content: '[TODO: Connect social AI]' })
    }
  ]

  const results = []
  for (const target of targets) {
    if (!target.enabled) continue
    try {
      const reply = await target.handler()
      if (reply) {
        results.push({ ...reply, aiId: target.id, createdAt: new Date().toISOString() })
      }
    } catch (err) {
      results.push({
        role: 'assistant',
        aiId: target.id,
        name: target.id,
        content: `[${target.id} error] ${err.message}`,
        createdAt: new Date().toISOString()
      })
    }
  }

  return results
}

module.exports = { routeMessage }
