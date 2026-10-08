// ==============================================================
// 📅 UNITY POD — a fresh episode every Monday morning
// Picks the next topic in rotation and hands it to the recorder.
// Runs on published deploys only.
// ==============================================================

import type { Config } from "@netlify/functions";
import { POD_TOPICS, queuePodcast } from "../lib/studio.js";

export default async () => {
  const week = Math.floor(Date.now() / (7 * 86_400_000));
  const origin = process.env.URL || "https://pleadingsanity.co.uk";
  try {
    await queuePodcast(POD_TOPICS[week % POD_TOPICS.length], origin);
  } catch (error) {
    console.error("Weekly Unity Pod could not be queued:", (error as Error)?.name || "error");
  }
};

export const config: Config = {
  schedule: "17 8 * * 1",
};
