// ==============================================================
// 🎙️ UNITY POD RECORDER — background job (up to 15 minutes)
// Three AIs from three labs talk through a real problem together:
// Arron (Claude) hosts, Nova (GPT) and Sol (Gemini) bring fixes.
// Seven short turns, then Arron wraps up with steps people can take.
// ==============================================================

import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { studioItems } from "../../db/schema.js";
import { parseJSON, speak, VOICES, type VoiceId } from "../lib/studio.js";

type Turn = { voice: VoiceId; name: string; lab: string; text: string };

const RUNNING_ORDER: { voice: VoiceId; brief: string }[] = [
  { voice: "arron", brief: "Open the episode: welcome listeners to the Unity Pod, introduce Nova (GPT by OpenAI) and Sol (Gemini by Google), and frame today's problem with one real, relatable example. Under 110 words." },
  { voice: "nova", brief: "Give your take: why this problem happens, and two practical, evidence-informed fixes. Under 110 words." },
  { voice: "sol", brief: "Build on Nova: add a creative or community-based fix and one light, kind moment of humour. Under 110 words." },
  { voice: "arron", brief: "Share a lived-experience angle and ask the panel one brave follow-up question. Under 90 words." },
  { voice: "nova", brief: "Answer Arron's question with something people can try in the next 24 hours. Under 90 words." },
  { voice: "sol", brief: "Answer too, and say how humans and AI can tackle this together. Under 90 words." },
  { voice: "arron", brief: "Close the episode: sum up in exactly three action steps (one line each), remind people the house will sit with them, point to the truth page and the tools page if the topic is heavy, and do not recite clinic numbers. Sign off with 'One Source. One Family.' Under 130 words." },
];

export default async (req: Request) => {
  const { id, token } = (await req.json().catch(() => ({}))) as { id?: number; token?: string };
  const [item] = Number.isInteger(id) ? await db.select().from(studioItems).where(eq(studioItems.id, id as number)) : [];
  if (!item || item.kind !== "podcast" || item.style !== "pending:" + token) return;

  const turns: Turn[] = [];
  try {
    for (const step of RUNNING_ORDER) {
      const transcript = turns.map((t) => `${t.name}: ${t.text}`).join("\n\n");
      const text = await speak(
        step.voice,
        "You are speaking on a friendly, uplifting podcast with two other AIs. Speak naturally, as spoken words only: no stage directions, no markdown, no speaker label.",
        `Episode topic: ${item.topic}\n\nTranscript so far:\n${transcript || "(the episode is just starting)"}\n\nYour turn: ${step.brief}`,
        320,
      ).catch((error) => {
        console.error(`Unity Pod: ${step.voice} missed a turn`, (error as Error)?.name || "error");
        return "";
      });
      if (text) turns.push({ voice: step.voice, name: VOICES[step.voice].name, lab: VOICES[step.voice].lab, text: text.replace(/^\w+:\s*/, "") });
    }
    if (turns.length < 3) throw new Error("Not enough of the panel showed up");

    const meta = parseJSON<{ title?: string; summary?: string }>(
      await speak(
        "arron",
        'Reply with ONLY JSON: {"title": string (catchy episode title, max 60 chars), "summary": string (2 sentences)}.',
        `Topic: ${item.topic}\n\n${turns.map((t) => `${t.name}: ${t.text}`).join("\n\n").slice(0, 6000)}`,
        200,
      ),
    );
    await db
      .update(studioItems)
      .set({
        title: (meta?.title || item.topic).slice(0, 120),
        body: (meta?.summary || "").slice(0, 600),
        script: turns,
        style: "episode",
        model: "claude-sonnet-5 + gpt-5.4-mini + gemini-3.5-flash",
      })
      .where(eq(studioItems.id, item.id));
  } catch (error) {
    console.error("Unity Pod recording failed:", (error as Error)?.name || "error");
    await db.update(studioItems).set({ hidden: true, title: "Recording failed", style: "failed" }).where(eq(studioItems.id, item.id));
  }
};

export const config: Config = {
  background: true,
};
