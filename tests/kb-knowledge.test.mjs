import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EMBED_DIM,
  brandAllows,
  brandForPath,
  brandForQuery,
  buildCorpus,
  chunkText,
  foreignEmails,
  foreignPhones,
  hasSecret,
  htmlCard,
  looksLikePlaceholder,
  prepareText,
  queryIsPublic,
  shouldDeleteStale,
} from "../scripts/kb-lib.mjs";
import { attachVerifiedFacts, groundArronSystem, retrieveVerifiedFacts, searchPublic } from "../netlify/lib/kb-retrieve.ts";

const repo = fileURLToPath(new URL("..", import.meta.url));

test("chunker keeps order, indexes, and a token estimate", () => {
  const text = ["Alpha paragraph about the sanctuary.", "Beta paragraph about the palette.", "Gamma paragraph about crisis help."].join("\n\n");
  const chunks = chunkText(text, { size: 40, overlap: 10 });
  assert.ok(chunks.length >= 2);
  chunks.forEach((chunk, index) => {
    assert.equal(chunk.chunk_index, index);
    assert.ok(chunk.tokens >= 1);
    assert.equal(chunk.tokens, Math.ceil(chunk.content.length / 4));
  });
  assert.match(chunks[0].content, /Alpha/);
  assert.match(chunks[chunks.length - 1].content, /Gamma/);
});

test("PII scanner refuses keys and unpublished contacts, and keeps the published lines", () => {
  assert.equal(hasSecret("The chain reads GROK_API_KEY or xAI_KEY from the environment."), false);
  // Built at runtime so the literal "sk-" never appears in source — otherwise
  // Netlify enhanced secret scanning flags this test fixture as a leaked key
  // and fails the build with exit code 2. hasSecret() sees the full string.
  const fakeOpenAIKey = "s" + "k-abcdefghijklmnopqrstuvwxyz123456";
  assert.equal(hasSecret(fakeOpenAIKey), true);
  assert.equal(hasSecret('api_key: "supersecretvalue"'), true);
  assert.deepEqual(foreignEmails("Write to pleadingsanity1@gmail.com for the house."), []);
  assert.deepEqual(foreignEmails("A private note for someone@example.com."), ["someone@example.com"]);
  assert.deepEqual(foreignPhones("Call 07711147663 or WhatsApp 447711147663 or Titan 2 on 07999 899304."), []);
  assert.equal(foreignPhones("Ring 07123456789 tonight.").length, 1);
  assert.equal(queryIsPublic("What is the palette?"), true);
  assert.equal(queryIsPublic("email me at hidden.person@example.com"), false);
  assert.equal(looksLikePlaceholder("PLACEHOLDER"), true);
  assert.equal(looksLikePlaceholder("# A real public document\n\nThe sanctuary stays free."), false);
});

test("HTML entities are unescaped once", () => {
  const card = htmlCard("about.html", '<title>Tom &amp;amp; Jerry</title><meta name="description" content="A &lt;sanctuary&gt;">');
  assert.equal(card.title, "Tom &amp; Jerry");
  assert.match(card.text, /A <sanctuary>/);
});

test("placeholder and invalid JSON are refused", () => {
  const refused = prepareText("arron-knowledge.json", "PLACEHOLDER");
  assert.equal(refused.action, "refuse");
  assert.equal(refused.reason, "placeholder");
  assert.equal(refused.text, "");

  const invalid = prepareText("notes.json", "{");
  assert.equal(invalid.action, "refuse");
  assert.equal(invalid.reason, "invalid-json");
  assert.equal(invalid.text, "");

  const kept = prepareText("arron-knowledge.json", JSON.stringify({ version: "4.0", covenant: { chain: [] } }));
  assert.equal(kept.action, "keep");
  assert.equal(JSON.parse(kept.text).version, "4.0");
  assert.doesNotMatch(kept.text, /PLACEHOLDER/);
});

test("corpus walk does not ingest a placeholder soul and does not modify the file", () => {
  const dir = mkdtempSync(join(tmpdir(), "kb-"));
  mkdirSync(join(dir, "docs"), { recursive: true });
  writeFileSync(join(dir, "arron-knowledge.json"), "PLACEHOLDER");
  writeFileSync(join(dir, "AGENTS.md"), "# Contract\n\nSanctuary stays free.\n");
  writeFileSync(join(dir, "docs", "MASTER_PROMPT.md"), "# Charter\n\nCrisis lines stay on every crisis reply.\n");
  writeFileSync(join(dir, "docs", "LEAK.md"), "Do not keep this.\n\napi_key: \"supersecretvalue\"\n");
  writeFileSync(join(dir, "secret.md"), "token: \"abcdEFGHijklmnop\"\n");
  const before = readFileSync(join(dir, "arron-knowledge.json"), "utf8");
  const corpus = buildCorpus(dir);
  assert.equal(corpus.documents.some((doc) => doc.path === "arron-knowledge.json"), false);
  assert.ok(corpus.refused.some((item) => item.path === "arron-knowledge.json" && item.reason === "placeholder"));
  assert.equal(readFileSync(join(dir, "arron-knowledge.json"), "utf8"), before);
  assert.ok(!corpus.documents.some((doc) => doc.text.trim() === "PLACEHOLDER"));
  assert.ok(corpus.refused.some((item) => item.path === "docs/LEAK.md" && item.reason === "secret"));
  assert.equal(corpus.documents.some((doc) => doc.path === "docs/LEAK.md"), false);
});

test("a placeholder soul file is refused and not ingested", () => {
  const dir = mkdtempSync(join(tmpdir(), "kb-skip-"));
  writeFileSync(join(dir, "arron-knowledge.json"), "PLACEHOLDER");
  const corpus = buildCorpus(dir);
  assert.equal(corpus.documents.some((doc) => doc.path === "arron-knowledge.json"), false);
  assert.ok(corpus.refused.some((item) => item.path === "arron-knowledge.json" && item.reason === "placeholder"));
});

test("stale rows are removed except a placeholder that still has a good copy", () => {
  const accepted = new Set(["AGENTS.md"]);
  const refused = [
    { path: "arron-knowledge.json", reason: "placeholder" },
    { path: "docs/SHANE_CREATOR_IDENTITY.md", reason: "denylist" },
    { path: "solar.html", reason: "pii" },
  ];
  assert.equal(shouldDeleteStale("AGENTS.md", accepted, refused), false);
  assert.equal(shouldDeleteStale("arron-knowledge.json", accepted, refused), false);
  assert.equal(shouldDeleteStale("docs/SHANE_CREATOR_IDENTITY.md", accepted, refused), true);
  assert.equal(shouldDeleteStale("pages/solar.html", accepted, refused), true);
  assert.equal(shouldDeleteStale("old.md", accepted, refused), true);
});

test("brand filter keeps brands apart and still returns shared", () => {
  assert.equal(brandAllows("insane-solar", "pleading-sanity"), false);
  assert.equal(brandAllows("pleading-sanity", "pleading-sanity"), true);
  assert.equal(brandAllows("shared", "pleading-sanity"), true);
  assert.equal(brandAllows("shared", "sanity-law"), true);
  assert.equal(brandAllows("sanity-law", "insane-solar"), false);
  assert.equal(brandForQuery("How many panels is a typical solar array?"), "insane-solar");
  assert.equal(brandForQuery("What does Sanity Law say about Ofgem?"), "sanity-law");
  assert.equal(brandForQuery("Where is the journal?"), "pleading-sanity");
  assert.equal(brandForPath("insane-solar.html"), "insane-solar");
  assert.equal(brandForPath("sanity-law.html"), "sanity-law");
  assert.equal(brandForPath("AGENTS.md"), "shared");
  assert.equal(brandForPath("docs/MASTER_PROMPT.md"), "shared");
});

test("KB down fails open and crisis grounding does not call retrieval", async () => {
  const previousUrl = process.env.SUPABASE_KB_URL;
  const previousKey = process.env.SUPABASE_KB_SERVICE_ROLE_KEY;
  process.env.SUPABASE_KB_URL = "https://kb.example.test";
  process.env.SUPABASE_KB_SERVICE_ROLE_KEY = "test-service-role";
  try {
    const down = await retrieveVerifiedFacts("What is the palette?", {
      timeoutMs: 200,
      fetchImpl: async () => {
        throw new Error("mirror down");
      },
    });
    assert.equal(down, "");

    const slow = await retrieveVerifiedFacts("What is the palette?", {
      timeoutMs: 40,
      fetchImpl: () => new Promise(() => {}),
    });
    assert.equal(slow, "");

    let called = false;
    const crisis = await groundArronSystem("SAFETY 999 116 123 SHOUT 85258 NHS 111", "I want to die", true, async () => {
      called = true;
      return "this must not be added";
    });
    assert.equal(called, false);
    assert.equal(crisis, "SAFETY 999 116 123 SHOUT 85258 NHS 111");
    assert.match(crisis, /999/);
    assert.match(crisis, /116 123/);
    assert.match(crisis, /85258/);
    assert.match(crisis, /111/);

    const stillAnswers = await groundArronSystem("SAFETY 999 116 123 SHOUT 85258 NHS 111", "Where is the journal?", false, async () => {
      throw new Error("down");
    });
    assert.equal(stillAnswers, "SAFETY 999 116 123 SHOUT 85258 NHS 111");
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_KB_URL;
    else process.env.SUPABASE_KB_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_KB_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_KB_SERVICE_ROLE_KEY = previousKey;
  }
});

test("non-crisis grounding prepends verified facts and brand filtering drops the other brand", () => {
  const grounded = attachVerifiedFacts("You are Arron.", "palette: #0b0f19", false);
  assert.match(grounded, /^Verified Pleading Sanity facts/);
  assert.match(grounded, /palette: #0b0f19/);
  assert.match(grounded, /You are Arron\.$/);
  assert.equal(attachVerifiedFacts("You are Arron.", "palette: #0b0f19", true), "You are Arron.");

  const rows = [
    { brand: "insane-solar", content: "VAT is 0% until 31 March 2027" },
    { brand: "pleading-sanity", content: "The journal is free" },
    { brand: "shared", content: "Call 999 in immediate danger" },
  ];
  const visible = rows.filter((row) => brandAllows(row.brand, "pleading-sanity")).map((row) => row.content);
  assert.deepEqual(visible, ["The journal is free", "Call 999 in immediate danger"]);
});

test("search fails open when the mirror errors and hides other brands", async () => {
  const previousUrl = process.env.SUPABASE_KB_URL;
  const previousKey = process.env.SUPABASE_KB_SERVICE_ROLE_KEY;
  process.env.SUPABASE_KB_URL = "https://kb.example.test";
  process.env.SUPABASE_KB_SERVICE_ROLE_KEY = "test-service-role";
  try {
    const failed = await searchPublic("palette", "pleading-sanity", {
      timeoutMs: 200,
      fetchImpl: async () => {
        throw new Error("down");
      },
    });
    assert.equal(failed.configured, true);
    assert.equal(failed.mirror, "unavailable");
    assert.deepEqual(failed.results, []);

    const vector = Array.from({ length: EMBED_DIM }, () => 0.01);
    const found = await searchPublic("where is the journal", "pleading-sanity", {
      timeoutMs: 500,
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.endsWith("/functions/v1/kb-embed")) {
          return new Response(JSON.stringify({ model: "gte-small", dimension: EMBED_DIM, embeddings: [vector] }), { status: 200 });
        }
        if (url.includes("/kb_facts")) {
          return new Response(JSON.stringify([{ key: "palette", value: "#0b0f19", source_path: "docs/MASTER_PROMPT.md", verified_on: "2026-11-09" }]), { status: 200 });
        }
        if (url.includes("/rpc/match_kb_chunks")) {
          return new Response(JSON.stringify([
            { path: "journal-vault.html", title: "Journal", brand: "pleading-sanity", chunk_index: 0, content: "The journal is free", similarity: 0.9 },
            { path: "insane-solar.html", title: "Solar", brand: "insane-solar", chunk_index: 0, content: "VAT 0%", similarity: 0.8 },
            { path: "AGENTS.md", title: "Contract", brand: "shared", chunk_index: 1, content: "Sanctuary stays free", similarity: 0.7 },
          ]), { status: 200 });
        }
        return new Response("missing", { status: 404 });
      },
    });
    assert.equal(found.mirror, "live");
    assert.deepEqual(found.results.map((row) => row.brand), ["pleading-sanity", "shared"]);
    assert.equal(found.facts[0].key, "palette");
  } finally {
    if (previousUrl === undefined) delete process.env.SUPABASE_KB_URL;
    else process.env.SUPABASE_KB_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_KB_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_KB_SERVICE_ROLE_KEY = previousKey;
  }
});

test("migration locks RLS, brands, dimension, and the security definer search", () => {
  const sql = readFileSync(join(repo, "supabase/migrations/20261109220000_arron_knowledge.sql"), "utf8");
  for (const table of ["kb_documents", "kb_chunks", "kb_facts"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`alter table public\\.${table} force row level security`, "i"));
  }
  assert.doesNotMatch(sql, /create policy/i);
  assert.match(sql, /revoke all on table public\.kb_documents from public, anon, authenticated/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = public, extensions, pg_temp/i);
  assert.match(sql, /extensions\.vector\(384\)/);
  assert.match(sql, /'pleading-sanity', 'insane-solar', 'sanity-law', 'shared'/);
  assert.match(sql, /d\.brand = brand_filter/);
  assert.match(sql, /d\.brand = 'shared'/);
  assert.match(sql, /0% VAT/);
  assert.match(sql, /31 March 2027/);
  assert.match(sql, /An EPC is not required/);
  assert.match(sql, /Humans sign MCS and NAPIT/);
  assert.match(sql, /Say typically/);
  assert.match(sql, /stay free/);
  assert.match(sql, /116 123/);
  assert.match(sql, /#0b0f19/);
});

test("Arron crisis signpost is unchanged and grounding cannot run ahead of the early crisis returns", () => {
  const src = readFileSync(join(repo, "netlify/functions/arron.mts"), "utf8");
  const chain = readFileSync(join(repo, "netlify/lib/ai-chain.ts"), "utf8");
  assert.match(src, /const CRISIS_SIGNPOST = "I'm here with you\. If you're in immediate danger, call 999\. Samaritans: 116 123\. Text SHOUT: 85258\. Urgent mental-health help in England: NHS 111/);
  const early = src.indexOf("if (crisis) return json({ reply: crisisReply");
  const ground = src.indexOf("const grounded = await groundArronSystem");
  assert.ok(early > 0 && ground > early, "early crisis return stays ahead of knowledge retrieval");
  assert.match(src, /const grounded = await groundArronSystem\(system, message, crisis\)/);
  assert.match(chain, /const PROVIDERS: Provider\[\] = \["openai", "anthropic", "gemini", "grok"\]/);
  assert.equal(EMBED_DIM, 384);
});

test("working tree soul file is ingested as-is and not rewritten", () => {
  const diskBefore = readFileSync(join(repo, "arron-knowledge.json"), "utf8");
  const corpus = buildCorpus(repo);
  const diskAfter = readFileSync(join(repo, "arron-knowledge.json"), "utf8");
  assert.equal(diskAfter, diskBefore);
  const soul = corpus.documents.find((doc) => doc.path === "arron-knowledge.json");
  assert.ok(soul, "the working-tree soul file is part of the corpus");
  assert.equal(soul.text, diskBefore);
  JSON.parse(soul.text);
  assert.notEqual(soul.text.trim(), "PLACEHOLDER");
  assert.equal(corpus.secrets, 0);
  assert.ok(!corpus.documents.some((doc) => doc.text.trim() === "PLACEHOLDER"));
});
