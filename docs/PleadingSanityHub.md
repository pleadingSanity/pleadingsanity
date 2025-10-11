# Pleading Sanity Sanity Hub

```text
// System Diagram (data + control flow)
// [InterAI Frontend (Netlify/Vercel, /public/interAI.html)]
//    -> calls -> [/api/aiBridge/message Netlify Function]
//          -> persists user entry in Firestore (interAI_conversations/{id}/messages)
//          -> hands conversation history to ArronLink-aware router
//                -> Arron (ChatGPT via OpenAI API)
//                -> Copilot (infra AI placeholder)
//                -> Meta (social AI placeholder)
//          -> stores AI replies back into Firestore
//    <- polls <- [/api/aiBridge/history Netlify Function]
// Backend services share context via arronlink-context.json (local) + Firebase.
```

## Folder layout

```
cosmic-showcase/
|-- netlify/
|   |-- functions/
|   |   |-- aiBridge-message.js        # POST handler
|   |   |-- aiBridge-history.js        # GET handler
|   |   `-- _shared/
|   |       |-- firebase.js            # Firebase Admin bootstrap
|   |       `-- aiRouter.js            # Multi-AI dispatch helper
|-- public/
|   `-- interAI.html                   # Browser UI
|-- docs/
|   `-- PleadingSanityHub.md           # Architecture notes
|-- arronlink-context.json             # Context bridge payload
|-- netlify.toml                       # Hosting + redirects
`-- package.json                       # Scripts & deps
```

## API surface

- POST `/api/aiBridge/message` – fan-out helper AI replies and persist Firestore records.
- GET `/api/aiBridge/history?conversationId=...` – read conversation trail (latest N messages).
- ArronLink JSON persists repo metadata for assistant handoffs.

## ChatGPT/OpenAI linkage

1. Add `OPENAI_API_KEY` + optional `OPENAI_MODEL` to Netlify environment.
2. Add Firebase service account JSON string to `FIREBASE_SERVICE_ACCOUNT`; project id to `FIREBASE_PROJECT_ID`.
3. Functions call OpenAI Chat Completions via `routeMessage`; replies stored as `type: 'ai'` in Firestore along with metadata.
4. Additional AIs (Copilot/Meta) become active by toggling `enabled` and replacing placeholder handlers in `aiRouter.js`.

## Deployment

- GitHub Actions uses `cosmic-deploy.yml` (Node 20, Netlify CLI) to deploy `public` + functions.
- Local preview: `npm install`, `netlify dev` (requires Netlify CLI in PATH).
- Vercel alternative: move functions under `/api` and replicate redirects (documented inline in README and router comments).
