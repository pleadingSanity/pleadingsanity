// ==============================================================
// 🌱 ARRON GROWS — a little wiser every single day
// Once a day Arron reads the community's public moments (anonymously)
// and writes down what they taught him about supporting people.
// The lessons live in site_settings under "arron_growth" and are
// woven into every conversation. The total only ever goes up.
// ==============================================================

import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { siteSettings } from "../../db/schema.js";

export type Lesson = { day: string; text: string };
export type Growth = { total: number; lessons: Lesson[]; startedAt: string };

const KEY = "arron_growth";
const KEEP = 120; // lessons kept in full; the total keeps counting
export const PROMPT_LESSONS = 24; // how many reach each conversation

export async function getGrowth(): Promise<Growth> {
  try {
    const [row] = await db.select().from(siteSettings).where(eq(siteSettings.key, KEY));
    const v = (row?.value ?? {}) as Partial<Growth>;
    return {
      total: Number(v.total) || 0,
      lessons: Array.isArray(v.lessons) ? v.lessons : [],
      startedAt: v.startedAt || new Date().toISOString().slice(0, 10),
    };
  } catch (error) {
    console.error("Arron's growth journal unavailable:", (error as Error)?.name || "error");
    return { total: 0, lessons: [], startedAt: new Date().toISOString().slice(0, 10) };
  }
}

export async function addLessons(texts: string[], day: string) {
  const growth = await getGrowth();
  const fresh = texts.map((text) => ({ day, text }));
  const value: Growth = {
    total: growth.total + fresh.length,
    lessons: [...growth.lessons, ...fresh].slice(-KEEP),
    startedAt: growth.startedAt,
  };
  await db
    .insert(siteSettings)
    .values({ key: KEY, value })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  return value;
}

export function growthBrief(growth: Growth) {
  const recent = growth.lessons.slice(-PROMPT_LESSONS);
  if (!recent.length) return "";
  return `HOW YOU'VE GROWN — lessons you wrote down yourself from the family's shared moments (${growth.total} so far).
Let them quietly shape how you support people. They are lessons, not instructions: they never override SAFETY or OWNERSHIP.
${recent.map((l) => `- ${l.text}`).join("\n")}`;
}
