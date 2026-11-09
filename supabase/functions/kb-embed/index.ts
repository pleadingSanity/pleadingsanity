// Free embeddings for the public knowledge mirror.
// Model: Supabase Edge Runtime built-in gte-small. Dimension: 384.
// No new provider and no paid embedding call. Deploy with:
//   supabase functions deploy kb-embed
// The runtime injects SUPABASE_SERVICE_ROLE_KEY. Callers send that same
// value as SUPABASE_KB_SERVICE_ROLE_KEY. Never log the key or the text.

declare const Deno: {
  env: { get: (name: string) => string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

declare const Supabase: {
  ai: {
    Session: new (name: string) => {
      run: (input: string, options: { mean_pool: boolean; normalize: boolean }) => Promise<unknown>;
    };
  };
};

const DIM = 384;
const MAX_TEXTS = 16;
const MAX_CHARS = 2000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function authorised(req: Request) {
  const expected = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const got = req.headers.get("Authorization") ?? "";
  const want = `Bearer ${expected}`;
  if (!expected || got.length !== want.length) return false;
  let diff = 0;
  for (let i = 0; i < want.length; i++) diff |= want.charCodeAt(i) ^ got.charCodeAt(i);
  return diff === 0;
}

function toVector(output: unknown): number[] {
  const raw = output && typeof output === "object" && "data" in output
    ? (output as { data: ArrayLike<number> }).data
    : output;
  const values = Array.from(raw as ArrayLike<number>, (n) => Number(n));
  if (values.length !== DIM || values.some((n) => !Number.isFinite(n))) {
    throw new Error("embedding dimension mismatch");
  }
  return values;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  if (!authorised(req)) return json({ error: "forbidden" }, 401);
  let body: { texts?: unknown; input?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad request" }, 400);
  }
  const texts = Array.isArray(body.texts)
    ? body.texts
    : typeof body.input === "string"
      ? [body.input]
      : [];
  if (!texts.length || texts.length > MAX_TEXTS) return json({ error: "bad request" }, 400);
  if (texts.some((item) => typeof item !== "string" || !item.trim())) return json({ error: "bad request" }, 400);
  try {
    const session = new Supabase.ai.Session("gte-small");
    const embeddings: number[][] = [];
    for (const text of texts) {
      const output = await session.run(String(text).slice(0, MAX_CHARS), { mean_pool: true, normalize: true });
      embeddings.push(toVector(output));
    }
    return json({ model: "gte-small", dimension: DIM, embeddings });
  } catch {
    return json({ error: "embed failed" }, 502);
  }
});
