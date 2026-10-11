// ==============================================================
// 🧬 PROVENANCE — who made this, and how
// One small record that travels with every creation on the feed:
//   origin          human | ai | collaborative ("Together")
//   aiProvider      openai | anthropic | gemini | grok | spare:* | "" (server-set only)
//   aiModel         the model id that answered, or "" (server-set only)
//   humanReviewed   a person read it before it went out
//   aiMemoryAllowed the creator lets Arron remember / reuse it
// Members declare their own origin. Provider and model can only be set
// by our own functions — a browser can't claim "Claude wrote this".
// Old rows have no record and read as human, which is what they were.
// ==============================================================

export const ORIGINS = ["human", "ai", "collaborative"] as const;
export type Origin = (typeof ORIGINS)[number];

export type Provenance = {
  origin: Origin;
  aiProvider: string;
  aiModel: string;
  humanReviewed: boolean;
  aiMemoryAllowed: boolean;
};

const clip = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[^\w.:+\-/]/g, "").slice(0, max) : "");

export const cleanOrigin = (value: unknown, fallback: Origin = "human"): Origin =>
  typeof value === "string" && (ORIGINS as readonly string[]).includes(value)
    ? (value as Origin)
    : value === "together"
      ? "collaborative"
      : fallback;

// What a member can say about their own post. The person posting it has, by definition, reviewed it.
export function fromMember(input: Record<string, unknown>): Provenance {
  return {
    origin: cleanOrigin(input.origin),
    aiProvider: "",
    aiModel: "",
    humanReviewed: true,
    aiMemoryAllowed: input.aiMemoryAllowed === true,
  };
}

// What our own functions record when an AI wrote some or all of it.
export function fromServer(p: { origin: Origin; provider?: string; model?: string; humanReviewed: boolean; aiMemoryAllowed?: boolean }): Provenance {
  return {
    origin: p.origin,
    aiProvider: clip(p.provider, 60),
    aiModel: clip(p.model, 80),
    humanReviewed: p.humanReviewed,
    aiMemoryAllowed: p.aiMemoryAllowed === true,
  };
}

// "Known" means a person stands behind the evidence. An AI saying so is not enough:
// unreviewed AI text that claims to be known is filed as a thought instead.
export function guardTruthTag(tag: string, prov: Provenance) {
  if ((tag === "known" || tag === "evidence") && prov.origin !== "human" && !prov.humanReviewed) return "thought";
  return tag;
}

export const provenanceOut = (row: { origin?: string | null; aiProvider?: string | null; aiModel?: string | null; humanReviewed?: boolean | null; aiMemoryAllowed?: boolean | null }) => ({
  origin: cleanOrigin(row.origin),
  aiProvider: row.aiProvider ?? "",
  aiModel: row.aiModel ?? "",
  humanReviewed: row.humanReviewed ?? true,
  aiMemoryAllowed: row.aiMemoryAllowed ?? false,
});
