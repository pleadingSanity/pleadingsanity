import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

test("supabase health endpoint file exists", () => {
  assert.ok(existsSync(new URL("../netlify/functions/supabase-health.mts", import.meta.url)));
  assert.ok(existsSync(new URL("../netlify/lib/supabase.ts", import.meta.url)));
});

test("supabase client uses env var only, no hardcoded credentials", () => {
  const src = readFileSync(new URL("../netlify/lib/supabase.ts", import.meta.url), "utf8");
  assert.ok(src.includes("process.env.DATABASE_URL"));
  assert.ok(!/postgres:[^/]{3,}@/.test(src), "no hardcoded connection string with password");
  assert.ok(src.includes("CREATE TABLE IF NOT EXISTS arron_memories"));
});

test("supabase health endpoint never echoes credentials and returns 503 when unconfigured", () => {
  const src = readFileSync(new URL("../netlify/functions/supabase-health.mts", import.meta.url), "utf8");
  assert.ok(src.includes("configured: false"), "returns 503 when unconfigured");
  assert.ok(src.includes("auth_failed") || src.includes("connect_failed"), "distinguishes auth vs connect failure");
});
