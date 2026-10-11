// ==============================================================
// 🤝 AI FAMILY STATUS — GET /api/ai-status
// The honest provider registry: which labs this deploy is configured
// to use, their roles, the model ids and the order they answer in.
// Booleans and names only — never a key, a base URL or part of one.
// "Configured" is not "connected": this endpoint makes no AI calls.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { providerRegistry } from "../lib/ai-chain.js";
import { allow, slowDown } from "../lib/rate-limit.js";

export default async (req: Request, context: Context) => {
  if (req.method !== "GET") return Response.json({ error: "Method not allowed" }, { status: 405 });
  if (!(await allow("views", context))) return slowDown();
  return Response.json(
    { checkedAt: new Date().toISOString(), arron: "Arron is the Pleading Sanity companion. He speaks through whichever configured lab answers first.", ...providerRegistry() },
    { headers: { "Cache-Control": "public, max-age=300" } },
  );
};

export const config: Config = { path: "/api/ai-status" };
