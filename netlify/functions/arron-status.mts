// ==============================================================
// ARRON STATUS — /api/arron-status
// Owner-only. Reports which providers have a non-empty key.
// Never returns key values or secret material.
// ==============================================================

import type { Config } from "@netlify/functions";
import { optionalUser } from "../lib/social.js";

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

function present(name: string): boolean {
  return Boolean((process.env[name] || "").trim());
}

export default async function handler() {
  const user = await optionalUser();
  if (!user?.isOwner) {
    return json({ error: "Owner only." }, 403);
  }

  return json({
    ok: true,
    providers: {
      openai: present("OPENAI_API_KEY"),
      anthropic: present("ANTHROPIC_API_KEY") || present("Anthropic_Key_Arron"),
      gemini: present("GEMINI_API_KEY") || present("GOOGLE_API_KEY"),
      grok: present("GROK_API_KEY") || present("xAI_KEY") || present("XAI_API_KEY"),
      openrouter: present("OPENROUTER_API_KEY"),
      creations: present("CREATIONS_IMAGE_API_KEY") || present("NETLIFY_AI_GATEWAY_KEY"),
      database: present("DATABASE_URL"),
    },
    gateway: {
      openaiBase: present("OPENAI_BASE_URL"),
      geminiBase: present("GOOGLE_GEMINI_BASE_URL"),
      creationsBase: present("CREATIONS_IMAGE_BASE_URL") || present("NETLIFY_AI_GATEWAY_BASE_URL"),
    },
    note: "configured = key present; values are never returned",
    timestamp: new Date().toISOString(),
  });
}

export const config: Config = {
  path: "/api/arron-status",
};
