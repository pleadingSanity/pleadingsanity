// ==============================================================
// 🎬 VIDEO BLUEPRINT STUDIO — /api/blueprint
//   POST /api/blueprint {topic, platform, length, tone, notes?}
// Arron can't render video files yet, so he builds everything a
// person needs to film and edit one: timed script, storyboard,
// voiceover direction, shot list, captions (SRT), description,
// hashtags and a music/mood guide. Members only, daily limit.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { currentUser, isCreator, json, logActivity, moderate, readBody, str } from "../lib/social.js";
import { visitorKey, withinDailyLimit } from "../lib/studio.js";
import { ARRON_VOICE, parseJSON, runChain } from "../lib/ai-chain.js";

const PLATFORMS: Record<string, string> = {
  tiktok: "TikTok / Instagram Reels / YouTube Shorts (vertical 9:16)",
  youtube: "YouTube (horizontal 16:9)",
  linkedin: "LinkedIn (square 1:1 or horizontal, professional but human)",
};
const LENGTHS: Record<string, number> = { "30": 30, "60": 60, "90": 90, "180": 180 };
const TONES = ["gentle", "hopeful", "raw", "educational", "uplifting", "funny"];
const DAILY_LIMIT = 8;

const SHAPE = `Reply with ONLY one JSON object, no prose, in exactly this shape:
{
  "title": string,
  "hook": string,
  "scenes": [{"start": "0:00", "end": "0:05", "visual": string, "voiceover": string, "onScreenText": string,
              "shot": string, "lighting": string, "transition": string, "emotion": string, "pace": string}],
  "voiceoverNotes": string,
  "music": [{"section": string, "mood": string, "suggestion": string}],
  "captions": [{"start": "00:00:00,000", "end": "00:00:03,000", "text": string}],
  "description": string,
  "hashtags": [string],
  "callToAction": string,
  "accessibility": string
}
Rules: scenes must cover the whole runtime with realistic timings; captions mirror the voiceover word-for-word,
max 42 characters per caption line; 8-14 hashtags without the # symbol; if the topic is heavy, the description points to /crisis.html and /tools.html and does not list clinic numbers or NHS lines.
Music suggestions describe mood, tempo and instrumentation only — never name copyrighted songs.`;

export default async (req: Request, context: Context) => {
  try {
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
    const user = await currentUser();
    if (!user) return json({ error: "Sign in to build a video blueprint with Arron 🎬" }, 401);
    const creator = isCreator(user.roles);

    const body = await readBody(req);
    const topic = str(body.topic, 300);
    const notes = str(body.notes, 800);
    if (topic.length < 4) return json({ error: "What's the video about? A sentence is plenty." }, 400);
    const platformKey = Object.hasOwn(PLATFORMS, str(body.platform, 12)) ? str(body.platform, 12) : "tiktok";
    const seconds = LENGTHS[str(body.length, 4)] ?? 60;
    const tone = TONES.includes(str(body.tone, 16)) ? str(body.tone, 16) : "hopeful";

    if (!creator) {
      const ok = await withinDailyLimit("blueprint:" + visitorKey(req, context.ip, user.id), DAILY_LIMIT);
      if (!ok) return json({ error: "That's today's blueprints — Arron's storyboard refills tomorrow ✨" }, 429);
    }
    const verdict = await moderate(`${topic}\n${notes}`, "post");
    if (!verdict.allowed) return json({ error: "Let's pick a kinder angle.", reason: verdict.reason }, 422);

    const system = `${ARRON_VOICE}

You are now Arron the Creative Engine, a seasoned short-form video director and scriptwriter.
Build a complete, ready-to-film production blueprint. ${SHAPE}`;
    const prompt = `Topic: ${topic}
Platform: ${PLATFORMS[platformKey]}
Runtime: ${seconds} seconds
Tone: ${tone}
${notes ? `Creator notes: ${notes}` : ""}`;

    const answer = await runChain(system, [{ role: "user", content: prompt }], { creator, maxTokens: creator ? 6000 : 4000 });
    const blueprint = parseJSON<Record<string, unknown>>(answer.text);
    if (!blueprint || !Array.isArray(blueprint.scenes)) {
      return json({ error: "The storyboard got tangled — please try again." }, 502);
    }
    await logActivity(user.id, "studio.blueprint", "studio", undefined, topic.slice(0, 120));
    return json({
      blueprint: { ...blueprint, topic, platform: platformKey, seconds, tone },
      model: answer.model,
      crisis: verdict.crisis,
    });
  } catch (error) {
    console.error("Blueprint error:", (error as Error)?.name || "error");
    return json({ error: "The studio lights flickered — please try again in a moment." }, 503);
  }
};

export const config: Config = { path: "/api/blueprint" };
