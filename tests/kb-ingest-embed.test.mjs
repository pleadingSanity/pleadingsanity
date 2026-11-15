import test from "node:test";
import assert from "node:assert/strict";
import { EMBED_BACKOFF_MS, embedBatchSize, embedTexts } from "../scripts/kb-ingest.mjs";

const DIM = 384;
const PHRASE = "public-corpus-chunk-marker";

function vector(seed) {
  return Array.from({ length: DIM }, (_, index) => (index === 0 ? seed : 0));
}

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return body == null ? "" : JSON.stringify(body);
    },
  };
}

function okBody(seeds) {
  return {
    model: "gte-small",
    dimension: DIM,
    embeddings: seeds.map((seed) => vector(seed)),
  };
}

function harness(handler) {
  const calls = [];
  const sleeps = [];
  const logs = [];
  const fetchImpl = async (resource, init) => {
    const texts = JSON.parse(init.body).texts;
    calls.push({ resource, texts, headers: init.headers });
    return handler(texts, calls.length);
  };
  const deps = {
    fetchImpl,
    url: "https://kb.example.test",
    headers: { authorization: "Bearer test-token-value", apikey: "test-token-value" },
    sleep: async (ms) => {
      sleeps.push(ms);
    },
    log: (line) => logs.push(line),
  };
  return { calls, sleeps, logs, deps };
}

function assertQuiet(logs, calls) {
  const blob = JSON.stringify({ logs, bodies: calls.map((call) => call.texts) });
  assert.equal(logs.join("\n").includes(PHRASE), false);
  assert.equal(logs.join("\n").includes("test-token-value"), false);
  assert.equal(blob.includes(PHRASE), true);
}

test("embed batch size defaults to 1 and clamps to 1..8", () => {
  const previous = process.env.KB_EMBED_BATCH;
  delete process.env.KB_EMBED_BATCH;
  try {
    assert.equal(embedBatchSize(), 1);
  } finally {
    if (previous === undefined) delete process.env.KB_EMBED_BATCH;
    else process.env.KB_EMBED_BATCH = previous;
  }
  assert.equal(embedBatchSize(""), 1);
  assert.equal(embedBatchSize("   "), 1);
  assert.equal(embedBatchSize("0"), 1);
  assert.equal(embedBatchSize("-4"), 1);
  assert.equal(embedBatchSize("nope"), 1);
  assert.equal(embedBatchSize("1"), 1);
  assert.equal(embedBatchSize("2.9"), 2);
  assert.equal(embedBatchSize(" 4 "), 4);
  assert.equal(embedBatchSize("8"), 8);
  assert.equal(embedBatchSize("9"), 8);
  assert.deepEqual(EMBED_BACKOFF_MS, [1000, 3000, 7000, 15000]);
});

test("a transient embed is retried four times with the full backoff", async () => {
  const { calls, sleeps, logs, deps } = harness((texts, n) => {
    if (n < 4) return response(546, { error: "worker" });
    return response(200, okBody([1]));
  });
  const vectors = await embedTexts([PHRASE], deps);
  assert.equal(calls.length, 4);
  assert.deepEqual(sleeps, [1000, 3000, 7000]);
  assert.equal(vectors.length, 1);
  assert.equal(vectors[0].length, DIM);
  assert.equal(vectors[0][0], 1);
  assert.match(logs.join("\n"), /status=546 attempt=1 batch=1 wait_ms=1000/);
  assert.match(logs.join("\n"), /status=546 attempt=3 batch=1 wait_ms=7000/);
  assertQuiet(logs, calls);
});

test("four transient failures wait 1s, 3s, 7s and 15s, then throw", async () => {
  for (const status of [546, 502, 503, 504, 429]) {
    const { calls, sleeps, deps } = harness(() => response(status, { error: "busy" }));
    await assert.rejects(embedTexts(["one"], deps), { message: `POST /functions/v1/kb-embed failed (${status})` });
    assert.equal(calls.length, 4);
    assert.deepEqual(sleeps, [1000, 3000, 7000, 15000]);
  }
});

test("non-transient statuses and bad shapes are not retried", async () => {
  const denied = harness(() => response(401, { error: "forbidden" }));
  await assert.rejects(embedTexts(["one"], denied.deps), { message: "POST /functions/v1/kb-embed failed (401)" });
  assert.equal(denied.calls.length, 1);
  assert.deepEqual(denied.sleeps, []);

  const mismatch = harness(() => response(200, { dimension: 12, embeddings: [[1]] }));
  await assert.rejects(embedTexts(["one"], mismatch.deps), { message: "embedding response did not match gte-small dimension 384" });
  assert.equal(mismatch.calls.length, 1);

  const short = harness(() => response(200, { dimension: DIM, embeddings: [vector(1).slice(0, 3)] }));
  await assert.rejects(embedTexts(["one"], short.deps), { message: "embedding dimension mismatch" });
  assert.equal(short.calls.length, 1);

  const count = harness(() => response(200, okBody([1])));
  await assert.rejects(embedTexts(["one", "two"], count.deps), { message: "embedding response did not match gte-small dimension 384" });
  assert.equal(count.calls.length, 1);
});

test("a 546 on a batch larger than one falls back to one text at a time", async () => {
  const { calls, sleeps, logs, deps } = harness((texts) => {
    if (texts.length > 1) return response(546, { error: "worker" });
    return response(200, okBody([texts[0] === "alpha" ? 2 : 3]));
  });
  const vectors = await embedTexts(["alpha", "beta"], deps);
  assert.deepEqual(calls.map((call) => call.texts), [["alpha", "beta"], ["alpha"], ["beta"]]);
  assert.deepEqual(sleeps, []);
  assert.deepEqual(vectors.map((item) => item[0]), [2, 3]);
  assert.match(logs.join("\n"), /embed split status=546 batch=2/);
  assert.equal(calls[0].resource, "https://kb.example.test/functions/v1/kb-embed");
});

test("other transient statuses retry the same batch and do not split it", async () => {
  const { calls, sleeps, deps } = harness((texts, n) => {
    if (n === 1) return response(502, { error: "bad gateway" });
    return response(200, okBody([4, 5]));
  });
  const vectors = await embedTexts(["alpha", "beta"], deps);
  assert.equal(calls.length, 2);
  assert.deepEqual(calls.map((call) => call.texts.length), [2, 2]);
  assert.deepEqual(sleeps, [1000]);
  assert.equal(vectors.length, 2);
  assert.equal(vectors[0].length, DIM);
});
