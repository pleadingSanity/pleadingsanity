# AI Credits Fund: how a share of P.S Studio (3D print) income could pay for Arron's AI

Status: **plan only, nothing is switched on.** Written 15 Nov 2026 (Grok Bot) after Shane asked that a share of 3D creator profits cover the AIs, so he never has to keep topping up usage or paying subscriptions.

Related: [3D-PRINT-SHOP.md](3D-PRINT-SHOP.md) · [REVENUE_TERMS.md](REVENUE_TERMS.md) · [AI_HANDOFF.md](../AI_HANDOFF.md).

## The honest limits
- **No revenue exists yet.** No numbers in this file are sales. Do not quote any as income.
- **Money cannot move to an AI provider by itself.** Every provider below bills a card or bank method that a human adds in its console. The site never holds or spends money for AI, and no code here can buy credits. `PS_IN_PROFIT` never authorises spend (see `netlify/lib/ai-chain.ts`).
- Arron basic chat and the crisis lines stay free forever. The fund pays for the AI; it never gates it.

## Where the share comes from (existing terms, unchanged)
`docs/REVENUE_TERMS.md` already says:
- Creator & community platform revenue: **90% to the creator, 10% platform upkeep**. The 10% "strictly funds server compute, bandwidth, transaction handling fees, and storage". AI calls are server compute, so the AI share sits **inside that 10%**. No new cut is taken from creators.
- Streetwear & physical merchandise: 50% production and upkeep, 50% mental health causes. AI credits can only come from the production and upkeep half.

Proposal for Shane to approve or change: **earmark half of the 10% upkeep (5% of net creator print receipts), plus a fixed share of Shane's own P.S Studio print margin, for "AI credits".**

## How it would work (manual, monthly, auditable)
1. **Ledger.** One row per sale in a private sheet (or a later `ai_fund` table): date, order id, item, net received after PayPal/Payhip fees, creator share, upkeep share, AI earmark (for example 5% of net). No buyer personal data.
2. **Monthly move.** Once a month Shane moves the earmarked total into the card or account the AI consoles bill. Nothing is automatic between the shop and the consoles.
3. **Auto top-up at each console** (set once by Shane, each with a monthly cap so a bug can never drain the account):

| Provider | Prepaid credits | Auto top-up | Cap you can set | Source (read 15 Nov 2026) |
| --- | --- | --- | --- | --- |
| xAI (Grok) | Yes | Yes, "Auto top-up", minimum $5 per top-up | Maximum total top-ups per month; invoiced billing limit $0 by default, so requests stop when credits run out | https://docs.x.ai/docs/key-information/billing |
| OpenAI | Yes (new accounts are prepaid) | Yes, "auto recharge", on by default at setup, minimum $5 | Optional monthly recharge limit; a separate hard spend limit per organisation or project | https://help.openai.com/en/articles/8264644-setting-up-and-managing-prepaid-api-billing |
| Anthropic (Claude) | Yes, "Buy credits" | Yes, "auto-reload" when the balance reaches a threshold you set | Threshold and reload amount | https://support.anthropic.com/en/articles/8977456-how-do-i-pay-for-my-api-usage |
| OpenRouter | Yes, US dollar credits | Yes, "auto top up" below a threshold | Key limits and budgets (`GET /api/v1/key`) | https://openrouter.ai/docs/faq |
| Google Gemini | Free tier on most Flash models; paid tier bills a Cloud billing account | Billed in arrears, not prepaid | Cloud budget alerts | https://ai.google.dev/gemini-api/docs/pricing |

4. **Report.** Each month an AI can read the ledger and the console usage pages (Shane pastes the totals) and add one line to `AI_HANDOFF.md`: earmarked, spent, balance. Never paste a card number or a key.

## What it buys (verified prices, 15 Nov 2026)
Arron's everyday Grok model is now `grok-4.3`: $1.25 input, $0.20 cached input, $2.50 output per 1M tokens (https://docs.x.ai/docs/models/grok-4.3). With the 12,000-character history cap, one Arron reply costs roughly **$0.004 to $0.017** (about 9k tokens of system prompt, which xAI caches, plus up to 3k of history and a few hundred words out). So **$10 of xAI credit is roughly 600 to 2,500 replies.** These are estimates from token counts, not measured bills.

## Free routes, honestly
- Gemini's free tier costs nothing, but Google's pricing page says free-tier content is used to improve Google's products. For a mental health companion that is a privacy decision for Shane; personal chats should use a paid key.
- OpenRouter `:free` spares are already wired as a last resort and stay off for personal chats until `PS_SPARES_PRIVACY_APPROVED` is set after Shane's privacy review.
