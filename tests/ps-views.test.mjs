// Privacy-first views counter: pure-logic tests for netlify/lib/views.js
// plus static privacy and palette checks for the beacon, page and function.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  emptyStats,
  normalizePath,
  recordHit,
  topPages,
  publicView,
  trimOldDays,
} from "../netlify/lib/views.js";

const root = new URL("../", import.meta.url);
const read = (p) => readFileSync(new URL(p, root), "utf8");

test("empty stats have the public shape", () => {
  const s = emptyStats();
  assert.equal(s.total, 0);
  assert.deepEqual(s.pages, {});
  assert.deepEqual(s.days, {});
  assert.equal(s.updatedAt, null);
});

test("normalizePath keeps public pages and strips query/hash", () => {
  for (const ok of ["/", "/music", "/podcast", "/shop.html", "/about.html", "/insights.html", "/games.html"]) {
    assert.ok(normalizePath(ok), ok);
  }
  assert.equal(normalizePath("/music/?x=1#frag"), "/music");
  assert.equal(normalizePath("/shop.html?ref=home"), "/shop.html");
  assert.equal(normalizePath("/podcast/"), "/podcast");
});

test("normalizePath rejects APIs, assets, data files, traversal and external hosts", () => {
  for (const bad of [
    null,
    "",
    42,
    "/api/views",
    "/api/views?x=1",
    "/css/ps-insights.css",
    "/js/ps-views.js",
    "/data/prints.json",
    "/assets/images/x.webp",
    "/images/radio/cover-bass.jpg",
    "https://evil.example/x",
    "//evil.example/x",
    "/../secret",
    "/admin/settings",
    "/sw.js",
    "/sitemap.xml",
    "/manifest.json",
    "/favicon.ico",
    "/a b",
    "/<script>",
    "x".repeat(130),
  ]) {
    assert.equal(normalizePath(bad), null, String(bad));
  }
});

test("recordHit counts views and deduplicates the same daily visitor hash", () => {
  let s = emptyStats();
  s = recordHit(s, "/", "hash-a", "2026-11-24T10:00:00Z");
  s = recordHit(s, "/", "hash-a", "2026-11-24T10:05:00Z");
  s = recordHit(s, "/music", "hash-b", "2026-11-24T10:06:00Z");
  assert.equal(s.total, 3);
  assert.equal(s.pages["/"].views, 2);
  assert.equal(s.pages["/"].unique.length, 1);
  assert.equal(s.pages["/music"].views, 1);
  assert.equal(s.days["2026-11-24"].total, 3);
  assert.equal(s.days["2026-11-24"].unique.length, 2);
});

test("old day buckets trim away while lifetime total survives", () => {
  let s = emptyStats();
  s.days["2000-01-01"] = { total: 500, unique: ["old"] };
  s.total = 500;
  s = recordHit(s, "/", "hash-a", "2026-11-24T10:00:00Z");
  assert.equal(s.total, 501);
  assert.equal(s.days["2000-01-01"], undefined);
  assert.ok(s.days["2026-11-24"]);
});

test("topPages sorts by views and publicView exposes today counts only", () => {
  let s = emptyStats();
  recordHit(s, "/music", "a", "2026-11-24T10:00:00Z");
  recordHit(s, "/music", "b", "2026-11-24T10:01:00Z");
  recordHit(s, "/", "a", "2026-11-24T10:02:00Z");
  const top = topPages(s);
  assert.equal(top[0].path, "/music");
  assert.equal(top[0].views, 2);
  const pub = publicView(s, new Date("2026-11-24T10:03:00Z"));
  assert.equal(pub.total, 3);
  assert.equal(pub.today, 3);
  assert.equal(pub.todayUnique, 2);
});

test("beacon script respects Do Not Track and makes no third-party calls", () => {
  const src = read("js/ps-views.js");
  assert.match(src, /doNotTrack/);
  assert.ok(!/https?:\/\//.test(src.replace("https://pleadingsanity", "")) || !/fetch\(["']https?:/.test(src));
  assert.ok(!/fetch\(["']https?:/.test(src));
  assert.ok(!/sendBeacon\(["']https?:/.test(src));
  assert.ok(src.includes("/api/views"));
  assert.ok(!src.includes("navigator.ip") && !/ipAddress/.test(src));
});

test("insights page uses locked palette and loads local assets only", () => {
  const html = read("insights.html");
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.match(html, /href="\/css\/ps-insights\.css"/);
  assert.match(html, /src="\/js\/ps-insights\.js"/);
  assert.doesNotMatch(html, /#(ff4d8d|a855f7|8b5cf6|7c3aed|6366f1|4f46e5|ec4899|db2777|d946ef|c026d3)\b/i);
  const css = read("css/ps-insights.css");
  assert.doesNotMatch(css, /#(ff4d8d|a855f7|8b5cf6|7c3aed|6366f1|4f46e5|ec4899|db2777|d946ef|c026d3)\b|purple|violet|indigo|magenta|fuchsia/i);
});

test("counter function never reads IP or referrer and fails soft on errors", () => {
  const src = read("netlify/functions/views.mts");
  assert.ok(!/context\.ip|x-forwarded-for|headers\.get\(["']referer/i.test(src));
  assert.ok(src.includes('"site-views"') && src.includes("getStore(STORE)"));
  assert.ok(src.includes("429") && src.includes("allow(\"views\""));
  assert.ok(src.includes("Counter unavailable."));
});

test("trimOldDays ignores malformed future dates without throwing", () => {
  const s = emptyStats();
  s.days["2099-01-01"] = { total: 9, unique: ["x"] };
  trimOldDays(s, new Date("2026-11-24T00:00:00Z"));
  assert.equal(s.days["2099-01-01"], undefined);
});
