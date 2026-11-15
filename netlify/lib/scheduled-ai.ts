import { withinDailyLimit } from "./studio.js";

// Opt-in only. This limits scheduled job starts, not provider charges in pounds.
// Disabled or unavailable accounting must never start background AI work.
export async function scheduledAiAllowed(job: string): Promise<boolean> {
  if (process.env.PS_SCHEDULED_AI_ENABLED !== "true") return false;
  const cap = Number(process.env.PS_SCHEDULED_AI_DAILY_CAP || "0");
  if (!Number.isInteger(cap) || cap < 1 || cap > 4) return false;
  try {
    return await withinDailyLimit("scheduled-ai:site", cap);
  } catch {
    console.error(`Scheduled AI admission unavailable (${job}); skipped.`);
    return false;
  }
}
