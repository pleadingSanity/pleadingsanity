// ==============================================================
// 🛂 SANITY PASSPORT — shared shape and Arron's consent gate
// Used by netlify/functions/passport.mts and arron.mts.
// ==============================================================

import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { passports } from "../../db/schema.js";
import { str } from "./social.js";

// The order here is the order on the page.
export const PASSPORT_FIELDS = ["whoIAm", "whatMatters", "inspires", "learning", "creating", "helps", "goals", "story", "interests", "journey"] as const;
export type FieldKey = (typeof PASSPORT_FIELDS)[number];
const AUDIENCES = ["private", "members", "public"] as const;
const MAX_FIELD = 1200;

export type PassportField = { text: string; visibility: (typeof AUDIENCES)[number]; ai: boolean };
export type Fields = Partial<Record<FieldKey, PassportField>>;

export function cleanFields(input: unknown): Fields {
  const src = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const out: Fields = {};
  for (const key of PASSPORT_FIELDS) {
    const f = src[key];
    if (!f || typeof f !== "object") continue;
    const v = f as Record<string, unknown>;
    const text = str(v.text, MAX_FIELD);
    if (!text) continue;
    const visibility = (AUDIENCES as readonly string[]).includes(v.visibility as string) ? (v.visibility as PassportField["visibility"]) : "private";
    out[key] = { text, visibility, ai: v.ai === true };
  }
  return out;
}

export const readFields = (raw: unknown) => cleanFields(raw);

// What Arron may read — used by arron.mts. Empty unless the member said yes twice.
export async function passportForArron(userId: string) {
  const [row] = await db.select().from(passports).where(eq(passports.userId, userId));
  if (!row?.aiMemoryAllowed) return [];
  const fields = readFields(row.fields);
  return PASSPORT_FIELDS.filter((k) => fields[k]?.ai).map((k) => ({ key: k, text: fields[k]!.text.slice(0, 600) }));
}

