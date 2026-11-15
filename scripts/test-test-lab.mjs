import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { accessDecision, cleanResult, SEED_ITEMS } from "../netlify/lib/test-lab-core.js";
import { uploadDecision, nextIndex, previousIndex, EMPTY_NOTE } from "../netlify/lib/music-core.js";

test("test lab rejects guests and non-owners", () => {
  assert.equal(accessDecision(null).status, 401);
  assert.equal(accessDecision({ isOwner: false, roles: ["admin"] }).status, 403);
  assert.equal(accessDecision({ isOwner: false, roles: ["member"] }).status, 403);
  assert.equal(accessDecision({ isOwner: true }).status, 200);
});

test("song upload is owner only", () => {
  assert.equal(uploadDecision(null).status, 401);
  assert.equal(uploadDecision({ isOwner: false }).status, 403);
  assert.equal(uploadDecision({ isOwner: true }).status, 200);
  assert.match(EMPTY_NOTE, /does not invent tracks/);
});

test("test lab includes Sanity's Songs and does not accept a bad status", () => {
  assert.ok(SEED_ITEMS.some((item) => item.id === "sanitys-songs"));
  const bad = cleanResult({ action: "result", item: "sanitys-songs", status: "maybe" });
  assert.equal(bad.ok, false);
  const good = cleanResult({ action: "result", item: "sanitys-songs", status: "works", notes: "Played in the page." });
  assert.equal(good.ok, true);
});

test("queue math stays on the list", () => {
  assert.equal(nextIndex(0, 3, { repeat: "off", shuffle: false }, () => 0), 1);
  assert.equal(nextIndex(2, 3, { repeat: "all", shuffle: false }, () => 0), 0);
  assert.equal(nextIndex(2, 3, { repeat: "off", shuffle: false }, () => 0), -1);
  assert.equal(previousIndex(0, 3, "all"), 2);
});

test("the test lab function checks the owner before it writes", () => {
  const src = readFileSync(new URL("../netlify/functions/test-lab.mts", import.meta.url), "utf8");
  const gate = src.indexOf("accessDecision(user)");
  const write = src.indexOf("db.insert");
  assert.ok(gate > 0 && write > gate);
  assert.match(src, /status === 401/);
  assert.match(src, /gate\.status/);
});
