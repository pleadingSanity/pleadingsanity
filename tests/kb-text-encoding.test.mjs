import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildCorpus, chunkText, decodeRepoText } from "../scripts/kb-lib.mjs";
import { kbChunkRows } from "../scripts/kb-ingest.mjs";

const repo = fileURLToPath(new URL("..", import.meta.url));
const PHRASE = "# Platform note\n\nThe sanctuary stays free.";

function utf16le(text) {
  return Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(text, "utf16le")]);
}

function utf16be(text) {
  const le = Buffer.from(text, "utf16le");
  const be = Buffer.alloc(le.length);
  for (let i = 0; i < le.length; i += 2) {
    be[i] = le[i + 1];
    be[i + 1] = le[i];
  }
  return Buffer.concat([Buffer.from([0xfe, 0xff]), be]);
}

function utf8Bom(text) {
  return Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(text, "utf8")]);
}

function assertClean(text) {
  assert.equal(text, PHRASE);
  assert.equal(text.includes("\u0000"), false);
  assert.equal(text.includes("\uFEFF"), false);
}

test("decodeRepoText reads UTF-16 LE, UTF-16 BE, UTF-8 BOM, and strips embedded NUL", () => {
  assertClean(decodeRepoText(utf16le(PHRASE)));
  assertClean(decodeRepoText(utf16be(PHRASE)));
  assertClean(decodeRepoText(utf8Bom(PHRASE)));
  const withNul = Buffer.from(PHRASE.replace("stays", "sta\u0000ys"), "utf8");
  assert.equal(decodeRepoText(withNul), PHRASE);
  assert.equal(decodeRepoText(Buffer.from(PHRASE, "utf8")), PHRASE);
});

test("corpus read strips those encodings before chunking", () => {
  const dir = mkdtempSync(join(tmpdir(), "kb-encoding-"));
  mkdirSync(join(dir, "docs"));
  writeFileSync(join(dir, "docs", "utf16-le.md"), utf16le(PHRASE));
  writeFileSync(join(dir, "docs", "utf16-be.md"), utf16be(PHRASE));
  writeFileSync(join(dir, "docs", "utf8-bom.md"), utf8Bom(PHRASE));
  writeFileSync(join(dir, "docs", "embedded-nul.md"), Buffer.from(PHRASE.replace("free", "fr\u0000ee"), "utf8"));

  const corpus = buildCorpus(dir);
  for (const name of ["docs/utf16-le.md", "docs/utf16-be.md", "docs/utf8-bom.md", "docs/embedded-nul.md"]) {
    const doc = corpus.documents.find((item) => item.path === name);
    assert.ok(doc, name);
    assertClean(doc.text);
    assert.ok(doc.chunks.length >= 1);
    for (const chunk of doc.chunks) assert.equal(chunk.content.includes("\u0000"), false);
  }
});

test("chunk text and kb_chunks rows drop a leftover NUL", () => {
  const chunks = chunkText("Alpha\u0000 note.\n\nBeta stays.");
  assert.equal(chunks.some((chunk) => chunk.content.includes("\u0000")), false);
  assert.match(chunks[0].content, /Alpha note/);
  const rows = kbChunkRows("doc", [{ chunk_index: 0, content: "keep\u0000 this", tokens: 3 }], [[9]]);
  assert.equal(rows[0].content, "keep this");
  assert.equal(rows[0].content.includes("\u0000"), false);
  assert.equal(rows[0].document_id, "doc");
  assert.equal(rows[0].chunk_index, 0);
  assert.equal(rows[0].tokens, 3);
  assert.equal(rows[0].embedding, "[9]");
});

test("docs/DEPLOYMENT-STATUS.md is UTF-8 and its corpus text has no NUL", () => {
  const path = join(repo, "docs/DEPLOYMENT-STATUS.md");
  const bytes = readFileSync(path);
  assert.equal(bytes[0], 0x23);
  assert.equal(bytes[1], 0x20);
  assert.equal(bytes.includes(0), false);
  const expected = "#  Platform Live - 10/09/2025 04:49:01\r\n";
  assert.equal(bytes.toString("utf8"), expected);
  assert.equal(decodeRepoText(bytes), expected);
  const corpus = buildCorpus(repo);
  const doc = corpus.documents.find((item) => item.path === "docs/DEPLOYMENT-STATUS.md");
  assert.ok(doc);
  assert.equal(doc.text.includes("\u0000"), false);
  assert.equal(doc.text.includes("\uFEFF"), false);
  assert.equal(doc.text, "#  Platform Live - 10/09/2025 04:49:01");
  assert.equal(doc.chunks.some((chunk) => chunk.content.includes("\u0000")), false);
  assert.equal(doc.chunks[0].content, "#  Platform Live - 10/09/2025 04:49:01");
});
