// ==============================================================
// 🛂 SANITY PASSPORT — a voluntary "who I am" layer
//   GET    /api/passport             my Passport (every field, with its settings)
//   PUT    /api/passport             save { fields, aiMemoryAllowed, personalise }
//   DELETE /api/passport             delete my Passport
//   GET    /api/passport/:username   the fields that person made visible to me
// It is not a medical record. Every field starts private and hidden from
// Arron. A field reaches Arron only when the member ticks it AND turns on
// the master "Arron may use my Passport" switch. Public and members-only
// text passes the same kindness check as a post.
// ==============================================================

import type { Config, Context } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { passports, profiles } from "../../db/schema.js";
import {
  areFriends,
  currentUser,
  isBlockedEitherWay,
  json,
  logActivity,
  moderate,
  optionalUser,
  readBody,
  unauthorized,
} from "../lib/social.js";
import { allow, slowDown } from "../lib/rate-limit.js";
import { cleanFields, PASSPORT_FIELDS, readFields, type PassportField } from "../lib/passport.js";


async function mine(userId: string) {
  const [row] = await db.select().from(passports).where(eq(passports.userId, userId));
  return {
    fields: readFields(row?.fields),
    aiMemoryAllowed: row?.aiMemoryAllowed ?? false,
    personalise: row?.personalise ?? false,
    updatedAt: row?.updatedAt ?? null,
    exists: Boolean(row),
  };
}

async function save(req: Request, userId: string) {
  const body = await readBody(req);
  const fields = cleanFields(body.fields);
  const shown = PASSPORT_FIELDS.filter((k) => fields[k] && fields[k]!.visibility !== "private").map((k) => fields[k]!.text);
  if (shown.length) {
    const verdict = await moderate(shown.join("\n\n"), "post");
    if (!verdict.allowed) {
      return json({ error: "Some of what you made visible can't be shared as it is.", reason: verdict.reason, blocked: true }, 422);
    }
  }
  const values = { fields, aiMemoryAllowed: body.aiMemoryAllowed === true, personalise: body.personalise === true, updatedAt: new Date() };
  await db.insert(passports).values({ userId, ...values }).onConflictDoUpdate({ target: passports.userId, set: values });
  await logActivity(userId, "passport.save", "passport", userId);
  return json(await mine(userId));
}

async function view(viewer: { id: string } | null, username: string) {
  const [profile] = await db.select().from(profiles).where(eq(profiles.username, username.toLowerCase()));
  if (!profile) return json({ error: "Not found" }, 404);
  const self = viewer?.id === profile.userId;
  if (!self) {
    if (profile.pageVisibility === "members" && !viewer) return json({ fields: [] });
    if (viewer && (await isBlockedEitherWay(viewer.id, profile.userId))) return json({ fields: [] });
    if (profile.isPrivate && !(viewer && (await areFriends(viewer.id, profile.userId)))) return json({ fields: [] });
  }
  const [row] = await db.select().from(passports).where(eq(passports.userId, profile.userId));
  const fields = readFields(row?.fields);
  const open = (f: PassportField) => self || f.visibility === "public" || (f.visibility === "members" && Boolean(viewer));
  return json({
    fields: PASSPORT_FIELDS.filter((k) => fields[k] && open(fields[k]!)).map((k) => ({ key: k, text: fields[k]!.text, visibility: fields[k]!.visibility })),
  });
}

export default async (req: Request, context: Context) => {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean); // api, passport, [username]
    if (parts.length === 3) {
      if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
      if (!(await allow("views", context))) return slowDown();
      return await view(await optionalUser(), decodeURIComponent(parts[2]));
    }
    const user = await currentUser();
    if (!user) return unauthorized();
    if (req.method === "GET") return json(await mine(user.id));
    if (req.method === "PUT") {
      if (!(await allow("write", context, user.id))) return slowDown();
      return await save(req, user.id);
    }
    if (req.method === "DELETE") {
      await db.delete(passports).where(eq(passports.userId, user.id));
      await logActivity(user.id, "passport.delete", "passport", user.id);
      return json({ ok: true });
    }
    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error("Passport API error:", (error as Error)?.name || "error");
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
};

export const config: Config = { path: ["/api/passport", "/api/passport/:username"] };
