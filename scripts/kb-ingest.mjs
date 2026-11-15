#!/usr/bin/env node
// Walk the public-safe allowlist, chunk it, and upsert the Supabase mirror.
// --dry-run prints counts only and does not call the network.
// If SUPABASE_KB_URL or SUPABASE_KB_SERVICE_ROLE_KEY is missing, exit 0
// without writing. A secret match refuses that file and exits 1.
// arron-knowledge.json is read from the working tree and never written.
// A placeholder or invalid JSON file is refused and not ingested.
// Embeddings are sent KB_EMBED_BATCH texts at a time (default 1, clamped 1..8).
// Statuses 546, 502, 503, 504 and 429 are retried four times, waiting
// 1s, 3s, 7s and 15s. A 546 on a batch of more than one text is embedded
// one text at a time. Logs are paths and counts only.

import { pathToFileURL } from "node:url";
import { buildCorpus, EMBED_DIM, shouldDeleteStale } from "./kb-lib.mjs";

export const EMBED_BACKOFF_MS = [1000, 3000, 7000, 15000];
const EMBED_RETRY_STATUSES = new Set([546, 502, 503, 504, 429]);

export function embedBatchSize(raw = process.env.KB_EMBED_BATCH) {
  const text = String(raw ?? "").trim();
  if (!text) return 1;
  const n = Number.parseInt(text, 10);
  if (!Number.isFinite(n)) return 1;
  return Math.min(8, Math.max(1, n));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function embedFailure(status) {
  const error = new Error(`POST /functions/v1/kb-embed failed (${status})`);
  error.status = status;
  return error;
}

function vectorsFrom(data, texts) {
  if (!data || data.dimension !== EMBED_DIM || !Array.isArray(data.embeddings) || data.embeddings.length !== texts.length) {
    throw new Error("embedding response did not match gte-small dimension 384");
  }
  for (const vector of data.embeddings) {
    if (!Array.isArray(vector) || vector.length !== EMBED_DIM) throw new Error("embedding dimension mismatch");
  }
  return data.embeddings;
}

async function postEmbed(texts, deps) {
  const res = await deps.fetchImpl(`${deps.url}/functions/v1/kb-embed`, {
    method: "POST",
    headers: deps.headers,
    body: JSON.stringify({ texts }),
  });
  if (!res.ok) {
    try {
      await res.body?.cancel?.();
    } catch {
      // The status is the signal. Never read or log the error body.
    }
    throw embedFailure(res.status);
  }
  if (res.status === 204) return vectorsFrom(null, texts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return vectorsFrom(data, texts);
}

async function embedRetrying(texts, deps) {
  const pause = deps.sleep || delay;
  const note = deps.log || ((line) => console.log(line));
  for (let attempt = 0; attempt < EMBED_BACKOFF_MS.length; attempt++) {
    try {
      return await postEmbed(texts, deps);
    } catch (error) {
      const status = error.status;
      if (texts.length > 1 && status === 546) throw error;
      if (!EMBED_RETRY_STATUSES.has(status)) throw error;
      const wait = EMBED_BACKOFF_MS[attempt];
      note(`kb-ingest: embed retry status=${status} attempt=${attempt + 1} batch=${texts.length} wait_ms=${wait}`);
      await pause(wait);
      if (attempt === EMBED_BACKOFF_MS.length - 1) throw error;
    }
  }
}

export async function embedTexts(texts, deps) {
  const note = deps.log || ((line) => console.log(line));
  try {
    return await embedRetrying(texts, deps);
  } catch (error) {
    if (!(texts.length > 1 && error.status === 546)) throw error;
    note(`kb-ingest: embed split status=546 batch=${texts.length}`);
    const vectors = [];
    for (const text of texts) vectors.push(...await embedRetrying([text], deps));
    return vectors;
  }
}

function invokedDirectly() {
  const entry = process.argv[1];
  return Boolean(entry) && import.meta.url === pathToFileURL(entry).href;
}

async function main() {
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
  if (refused.some((item) => item.path === "arron-knowledge.json")) console.log("arron-knowledge.json placeholder or invalid JSON was not ingested");
  else if (documents.some((doc) => doc.path === "arron-knowledge.json")) console.log("arron-knowledge.json read from the working tree");

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
    return embedTexts(texts, {
      fetchImpl: fetch,
      url,
      headers: headers(),
    });
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
  const batchSize = embedBatchSize();
  let unchanged = 0;
  let written = 0;
  let embedded = 0;
  console.log(`kb-ingest: embed_batch=${batchSize}`);

  for (const doc of documents) {
    const current = remote.get(doc.path);
    if (current && current.source_sha === doc.source_sha) {
      unchanged += 1;
      continue;
    }
    const vectors = [];
    for (let i = 0; i < doc.chunks.length; i += batchSize) {
      const slice = doc.chunks.slice(i, i + batchSize);
      vectors.push(...await embed(slice.map((chunk) => chunk.content)));
      const previous = embedded;
      embedded += slice.length;
      if (Math.floor(embedded / 50) > Math.floor(previous / 50)) {
        console.log(`kb-ingest: embedded=${embedded} path=${doc.path}`);
      }
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
}

if (invokedDirectly()) {
  await main();
}
