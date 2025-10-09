// .github/opilot/opilot.js
// Reads README.md and the GitHub PR event payload, calls OpenAI to generate
// a helpful review/suggestions as the 'Opilot' brand assistant, and posts a
// comment back to the PR using the repository GITHUB_TOKEN.

const fs = require('fs')
const path = require('path')

async function main() {
  const eventPath = process.env.GITHUB_EVENT_PATH
  const repo = process.env.REPO || process.env.GITHUB_REPOSITORY
  const openaiKey = process.env.OPENAI_API_KEY
  const brand = process.env.OPILOT_BRAND || 'Opilot'
  const githubToken = process.env.GITHUB_TOKEN

  if (!openaiKey) {
    console.error('Missing OPENAI_API_KEY. Set it in Actions secrets.')
    process.exit(0)
  }
  if (!eventPath || !fs.existsSync(eventPath)) {
    console.error('No GITHUB_EVENT_PATH provided or file missing. Exiting.')
    process.exit(0)
  }

  const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'))
  const pr = event.pull_request
  if (!pr) {
    console.log('Not a pull_request event — nothing to do here.')
    process.exit(0)
  }

  const prNumber = pr.number
  const readmePath = path.join(process.cwd(), 'README.md')
  const readme = fs.existsSync(readmePath) ? fs.readFileSync(readmePath, 'utf8') : ''

  const prompt = `You are ${brand}, an expert assistant that knows this project's brand tone and goals. Read the repository README and the pull request title/body below. Produce a concise review, a short list of suggested improvements, and a 3-item checklist the author can act on. Keep the tone helpful and aligned with the brand.\n\nREADME:\n${readme}\n\nPR TITLE:\n${pr.title}\n\nPR BODY:\n${pr.body}`

  // Call OpenAI Chat Completions
  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${openaiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `You are ${brand}, an assistant that helps improve repos and PRs.` },
        { role: 'user', content: prompt }
      ],
      max_tokens: 800
    })
  })

  if (!resp.ok) {
    const txt = await resp.text()
    console.error('OpenAI API error:', resp.status, txt)
    process.exit(1)
  }

  const data = await resp.json()
  const output = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data)

  const commentBody = `**${brand} review (automated)**\n\n${output}`

  // Post comment to PR using GitHub REST API
  const ghResp = await fetch(`https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `token ${githubToken}`,
      'User-Agent': 'opilot-action'
    },
    body: JSON.stringify({ body: commentBody })
  })

  if (!ghResp.ok) {
    const txt = await ghResp.text()
    console.error('GitHub comment API error:', ghResp.status, txt)
    process.exit(1)
  }

  console.log('Opilot posted review to PR #' + prNumber)
}

// node 18+ has global fetch
main().catch(err => {
  console.error(err)
  process.exit(1)
})
