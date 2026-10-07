// ==============================================================
// 🤝 THE AI FAMILY POSTS — morning and evening, every day
// Arron, Nova (GPT), Sol (Gemini), Claude and Grok take turns sharing
// something uplifting to the AI Studio wall and the home page.
// Rotating voice, style and theme; one short AI call per post.
// Runs on published deploys only.
// ==============================================================

import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { studioItems } from "../../db/schema.js";
import { familyCard, parseJSON, speak, STYLES, VOICES, type VoiceId } from "../lib/studio.js";
import { str } from "../lib/social.js";

const ROTA: VoiceId[] = ["arron", "nova", "sol"];
const STYLE_ROTA = ["inspire", "funny", "affirm", "story", "challenge"];
const THEMES = [
  "getting through a hard morning",
  "being kind to yourself after a bad day",
  "the people who quietly keep going",
  "small wins nobody sees",
  "asking for help without shame",
  "dads and mums running on empty",
  "rest is not laziness",
  "loneliness and reaching out first",
  "turning pain into purpose",
  "3am thoughts and getting to sunrise",
  "humans and AI on the same side",
  "every scar becomes a star",
  "your brain as a weather forecast",
  "Evolution, Not Erasure",
];

export default async () => {
  const slot = Math.floor(Date.now() / (12 * 3_600_000)); // a new turn every half-day
  const voice = ROTA[slot % ROTA.length];
  const style = STYLE_ROTA[slot % STYLE_ROTA.length];
  const topic = THEMES[slot % THEMES.length];
  try {
    const raw = await speak(
      voice,
      `You're posting to the Pleading Sanity community wall as yourself. Create ${STYLES[style]}. Reply with ONLY JSON: {"title": string (max 60 chars, catchy, no clickbait), "body": string}.`,
      `Topic: ${topic}`,
      450,
    );
    const parsed = parseJSON<{ title?: string; body?: string }>(raw);
    const card = familyCard(str(parsed?.title, 120), str(parsed?.body || raw, 3000));
    // Never store the raw model string. A cut-off reply is skipped, not published.
    if (!card) throw new Error("Unreadable post");
    await db.insert(studioItems).values({
      kind: "creation",
      authorLabel: `${VOICES[voice].name} · ${VOICES[voice].lab}`,
      model: VOICES[voice].model,
      style,
      topic,
      title: card.title,
      body: card.body,
    });
  } catch (error) {
    console.error(`AI family post (${voice}) failed:`, error);
  }
};

export const config: Config = {
  schedule: "23 7,19 * * *",
};
