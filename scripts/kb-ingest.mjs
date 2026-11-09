#!/usr/bin/env node
// Walk the public-safe allowlist, chunk it, and upsert the Supabase mirror.
// --dry-run prints counts only and does not call the network.
// If SUPABASE_KB_URL or SUPABASE_KB_SERVICE_ROLE_KEY is missing, exit 0
// without writing. A secret match refuses that file and exits 1.
// arron-knowledge.json is never written. A placeholder working copy is
// read from the restored commit when git can see it, or skipped.

import { buildCorpus, EMBED_DIM, shouldDeleteStale } from "./kb-lib.mjs";

const dryRun = process.argv.includes("--dry-run");
const root = process.cwd();

function env(name) {
  const value = process.env[name] || "";
  return value.trim();
}

const corpus = buildCorpus(root);
const { counts, refused, documents } = corpus;

console.log(`kb-ingest: documents=${counts.documents} chunks=${counts.chunks} refused=${counts.refused} secrets=${counts.secrets} dropped_parts=${counts.droppedParts}`);
for (const item of refused) console.log(`refused ${item.path} reason=${item.reason}`);
const restored = documents.find((doc) => doc.path === "arron-knowledge.json" && doc.restoredFrom);
if (restored) console.log(`arron-knowledge.json read from ${restored.restoredFrom}; working tree not modified`);
else if (refused.some((item) => item.path === "arron-knowledge.json")) console.log("arron-knowledge.json placeholder or invalid JSON was not ingested");

if (counts.secrets > 0) {
  console.error("kb-ingest: refused a file that looks like a key or token. Nothing was written.");
  process.exit(1);
}

if (dryRun) {
  console.log("kb-ingest: dry-run, no network calls");
  process.exit(0);
}

const url = env("SUPABASE_KB_URL").replace(/\/$/, "");
const key = env("SUPABASE_KB_SERVICE_ROLE_KEY");
if (!url || !key) {
  console.log("kb-ingest: SUPABASE_KB_URL or SUPABASE_KB_SERVICE_ROLE_KEY is unset. Skipping.");
  process.exit(0);
}

function headers(extra = {}) {
  return {
    apikey: key,
    authorization: `Bearer ${key}`,
    "content-type": "application/json",
    ...extra,
  };
}

async function request(path, init = {}) {
  const res = await fetch(`${url}${path}`, { ...init, headers: headers(init.headers) });
  if (!res.ok) {
    const status = res.status;
    throw new Error(`${init.method || "GET"} ${path} failed (${status})`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text);
}

async function embed(texts) {
  const data = await request("/functions/v1/kb-embed", {
    method: "POST",
    body: JSON.stringify({ texts }),
  });
  if (!data || data.dimension !== EMBED_DIM || !Array.isArray(data.embeddings) || data.embeddings.length !== texts.length) {
    throw new Error("embedding response did not match gte-small dimension 384");
  }
  for (const vector of data.embeddings) {
    if (!Array.isArray(vector) || vector.length !== EMBED_DIM) throw new Error("embedding dimension mismatch");
  }
  return data.embeddings;
}

async function existingByPath() {
  const rows = await request("/rest/v1/kb_documents?select=id,path,source_sha");
  const map = new Map();
  for (const row of rows || []) map.set(row.path, row);
  return map;
}

async function upsertDocument(doc) {
  const rows = await request("/rest/v1/kb_documents?on_conflict=path", {
    method: "POST",
    headers: { prefer: "resolution=merge-duplicates,return=representation" },
    body: JSON.stringify({
      path: doc.path,
      title: doc.title,
      source_sha: doc.source_sha,
      brand: doc.brand,
      updated_at: new Date().toISOString(),
    }),
  });
  const row = Array.isArray(rows) ? rows[0] : rows;
  if (!row?.id) throw new Error(`document upsert failed for ${doc.path}`);
  return row.id;
}

async function replaceChunks(documentId, doc, vectors) {
  const filter = encodeURIComponent(documentId);
  await request(`/rest/v1/kb_chunks?document_id=eq.${filter}`, { method: "DELETE", headers: { prefer: "return=minimal" } });
  const rows = doc.chunks.map((chunk, index) => ({
    document_id: documentId,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    tokens: chunk.tokens,
    embedding: `[${vectors[index].join(",")}]`,
  }));
  const batch = 20;
  for (let i = 0; i < rows.length; i += batch) {
    await request("/rest/v1/kb_chunks", {
      method: "POST",
      headers: { prefer: "return=minimal" },
      body: JSON.stringify(rows.slice(i, i + batch)),
    });
  }
}

async function deleteDocument(id) {
  const filter = encodeURIComponent(id);
  await request(`/rest/v1/kb_documents?id=eq.${filter}`, { method: "DELETE", headers: { prefer: "return=minimal" } });
}

const remote = await existingByPath();
const accepted = new Set(documents.map((doc) => doc.path));
let unchanged = 0;
let written = 0;

for (const doc of documents) {
  const current = remote.get(doc.path);
  if (current && current.source_sha === doc.source_sha) {
    unchanged += 1;
    continue;
  }
  const vectors = [];
  for (let i = 0; i < doc.chunks.length; i += 8) {
    const slice = doc.chunks.slice(i, i + 8);
    vectors.push(...await embed(slice.map((chunk) => chunk.content)));
  }
  const id = await upsertDocument(doc);
  await replaceChunks(id, doc, vectors);
  written += 1;
  console.log(`upserted ${doc.path} chunks=${doc.chunks.length} brand=${doc.brand}`);
}

let stale = 0;
for (const [path, row] of remote) {
  if (!shouldDeleteStale(path, accepted, refused)) continue;
  await deleteDocument(row.id);
  stale += 1;
  console.log(`deleted stale ${path}`);
}

console.log(`kb-ingest: wrote=${written} unchanged=${unchanged} stale_deleted=${stale}`);
