// Public knowledge mirror helpers. Pure functions plus a repo walk.
// The repository files are the source of truth. This module never writes
// arron-knowledge.json and never prints secret values.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export const EMBED_DIM = 384;
export const EMBED_MODEL = "gte-small";

export const BRANDS = ["pleading-sanity", "insane-solar", "sanity-law", "shared"];

export const PUBLISHED_EMAILS = new Set(["pleadingsanity1@gmail.com"]);

// Published house lines only. Crisis short codes are too short to match the phone scan.
export const PUBLISHED_PHONES = new Set([
  "07711147663",
  "447711147663",
  "07999899304",
  "08082000247",
  "08001111",
]);

export const DENY_FILES = new Set(["docs/SHANE_CREATOR_IDENTITY.md"]);

const ROOT_FILES = [
  "AGENTS.md",
  "AI_HANDOFF.md",
  "docs/MASTER_PROMPT.md",
  "system_blueprint.json",
  "arron-knowledge.json",
  "content/arron-knowledge.json",
  "netlify/lib/solar-knowledge.ts",
  "netlify/lib/arron-knowledge.ts",
];

const ARRON_RESTORE_REFS = [
  "b652635:arron-knowledge.json",
  "origin/grok/audit-radio-2026-11-09:arron-knowledge.json",
];

const HARD_SECRET_RE = /(?:\bsk-(?:ant-)?(?!your-key\b)[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xai-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@)/i;
const KEY_ASSIGN_RE = /(?:api[_-]?key|secret|token|password|service[_-]?role(?:[_-]?key)?)\s*[:=]\s*['"][^'"]{8,}['"]/gi;
const EXAMPLE_SECRET_RE = /your-key|example|changeme|placeholder|xxxx|1234|\$\{/i;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_RE = /(?:\+44|0044|0)(?:[\s()-]*\d){9,12}|\b44(?:[\s()-]*\d){10}\b/g;

export function sha256(text) {
  return createHash("sha256").update(text).digest("hex");
}

export function looksLikePlaceholder(text) {
  const t = String(text ?? "").trim();
  if (!t) return true;
  if (/^(PLACEHOLDER|PLACEHOLDER_FIX_LATER|REPLACE_WITH_|TODO_RESTORE|FIX_ME_LATER)\b/i.test(t) && t.length < 200) return true;
  if (/PLACEHOLDER_FIX_LATER|REPLACE_WITH_|TODO_RESTORE|FIX_ME_LATER/i.test(t)) return true;
  return false;
}

export function jsonProblem(path, text) {
  if (!String(path).endsWith(".json")) return null;
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) return "invalid-json";
    return null;
  } catch {
    return "invalid-json";
  }
}

function realKeyAssignment(text) {
  KEY_ASSIGN_RE.lastIndex = 0;
  const found = String(text ?? "").match(KEY_ASSIGN_RE) || [];
  return found.some((match) => !EXAMPLE_SECRET_RE.test(match));
}

export function hasSecret(text) {
  const value = String(text ?? "");
  HARD_SECRET_RE.lastIndex = 0;
  if (HARD_SECRET_RE.test(value)) return true;
  return realKeyAssignment(value);
}

export function foreignEmails(text) {
  const found = String(text ?? "").match(EMAIL_RE) || [];
  return found.filter((email) => !PUBLISHED_EMAILS.has(email.toLowerCase()));
}

function phoneForms(raw) {
  const digits = String(raw).replace(/\D/g, "").replace(/^0044/, "44");
  const forms = new Set([digits]);
  if (digits.startsWith("44") && digits.length > 2) forms.add(`0${digits.slice(2)}`);
  if (digits.startsWith("0") && digits.length > 1) forms.add(`44${digits.slice(1)}`);
  return forms;
}

export function isPublishedPhone(raw) {
  for (const form of phoneForms(raw)) if (PUBLISHED_PHONES.has(form)) return true;
  return false;
}

export function foreignPhones(text) {
  const found = String(text ?? "").match(PHONE_RE) || [];
  return found.filter((phone) => !isPublishedPhone(phone));
}

export function queryIsPublic(text) {
  const value = String(text ?? "");
  if (!value.trim()) return true;
  if (hasSecret(value)) return false;
  if (foreignEmails(value).length) return false;
  if (foreignPhones(value).length) return false;
  return true;
}

export function dropPrivateParts(text) {
  const parts = String(text ?? "").split(/\n{2,}/);
  const kept = [];
  let dropped = 0;
  for (const part of parts) {
    KEY_ASSIGN_RE.lastIndex = 0;
    if (foreignEmails(part).length || foreignPhones(part).length || KEY_ASSIGN_RE.test(part)) {
      dropped += 1;
      continue;
    }
    kept.push(part);
  }
  return { text: kept.join("\n\n").trim(), dropped };
}

export function brandForPath(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/").toLowerCase();
  if (p.includes("insane-solar") || p.includes("insane_solar") || p.includes("solar-knowledge") || p.includes("solar-trade") || /(^|\/)solar[-.]/.test(p)) {
    return "insane-solar";
  }
  if (p.includes("sanity-law") || p.includes("sanity_law")) return "sanity-law";
  if (
    p === "agents.md" ||
    p === "ai_handoff.md" ||
    p === "docs/master_prompt.md" ||
    p === "system_blueprint.json" ||
    p === "docs/ai-family-knowledge.md" ||
    /council|charter|handoff|operating|continuity|roadmap/.test(p) ||
    p.endsWith("/security.md")
  ) {
    return "shared";
  }
  return "pleading-sanity";
}

export function brandForQuery(query) {
  const q = String(query || "").toLowerCase();
  if (/\b(insane solar|solar|mcs|napit|smart export|seg|epc|inverter|givenergy)\b/.test(q)) return "insane-solar";
  if (/\bvat\b/.test(q) && /\b(solar|battery|panel|install)/.test(q)) return "insane-solar";
  if (/\b(sanity law|ofgem|energy ombudsman|prepayment|mckenzie)\b/.test(q)) return "sanity-law";
  return "pleading-sanity";
}

// Mirrors match_kb_chunks: a brand filter also returns shared facts.
const KEEP_PREVIOUS = new Set(["placeholder", "invalid-json", "missing"]);

// A placeholder or unreadable file keeps the last good copy. Anything refused
// for a secret, a private contact, or the denylist is removed from the mirror.
export function shouldDeleteStale(path, acceptedPaths, refused) {
  if (acceptedPaths.has(path)) return false;
  const reason = refused.find((item) => item.path === path)?.reason;
  if (reason && KEEP_PREVIOUS.has(reason)) return false;
  return true;
}

export function brandAllows(chunkBrand, filter) {
  if (!filter) return true;
  return chunkBrand === filter || chunkBrand === "shared";
}

export function chunkText(text, { size = 1800, overlap = 200 } = {}) {
  const paras = String(text ?? "").split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const packed = [];
  let buf = "";
  for (const para of paras) {
    const next = buf ? `${buf}\n\n${para}` : para;
    if (buf && next.length > size) {
      packed.push(buf);
      const tail = buf.slice(-overlap).trim();
      buf = tail ? `${tail}\n\n${para}` : para;
    } else {
      buf = next;
    }
  }
  if (buf) packed.push(buf);
  const pieces = [];
  for (const piece of packed) {
    if (piece.length <= size * 2) {
      pieces.push(piece);
      continue;
    }
    const step = Math.max(200, size - overlap);
    for (let i = 0; i < piece.length; i += step) pieces.push(piece.slice(i, i + size));
  }
  return pieces.filter((content) => content.trim()).map((content, chunk_index) => ({
    chunk_index,
    content: content.trim(),
    tokens: Math.max(1, Math.ceil(content.trim().length / 4)),
  }));
}

export function prepareText(path, text, restore) {
  const placeholder = looksLikePlaceholder(text);
  const invalid = jsonProblem(path, text);
  if (path === "arron-knowledge.json" && (placeholder || invalid) && typeof restore === "function") {
    const restored = restore();
    if (restored && typeof restored.text === "string" && !looksLikePlaceholder(restored.text) && !jsonProblem(path, restored.text)) {
      return finishText(path, restored.text, { action: "restore", ref: restored.ref || "" });
    }
  }
  if (placeholder) return { action: "refuse", text: "", reason: "placeholder", ref: "", dropped: 0 };
  if (invalid) return { action: "refuse", text: "", reason: invalid, ref: "", dropped: 0 };
  return finishText(path, text, { action: "keep", ref: "" });
}

function finishText(path, text, meta) {
  if (hasSecret(text)) return { action: "refuse", text: "", reason: "secret", ref: meta.ref || "", dropped: 0 };
  if (String(path).endsWith(".json")) {
    if (foreignEmails(text).length || foreignPhones(text).length) {
      return { action: "refuse", text: "", reason: "pii", ref: meta.ref || "", dropped: 0 };
    }
    return { action: meta.action, text, reason: "", ref: meta.ref || "", dropped: 0 };
  }
  const cleaned = dropPrivateParts(text);
  if (!cleaned.text.trim()) return { action: "refuse", text: "", reason: "pii", ref: meta.ref || "", dropped: cleaned.dropped };
  return { action: meta.action, text: cleaned.text, reason: "", ref: meta.ref || "", dropped: cleaned.dropped };
}

function decode(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function htmlCard(filePath, html) {
  const title = decode((String(html).match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]);
  const desc = decode(
    (String(html).match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) || [])[1]
    || (String(html).match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i) || [])[1],
  );
  if (!title && !desc) return null;
  return {
    title: (title || filePath).slice(0, 180),
    text: `Title: ${title}\nDescription: ${desc}\nPath: /${filePath}`,
  };
}

function titleFor(filePath, text) {
  const heading = String(text).match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim().slice(0, 180);
  if (filePath.endsWith(".json")) {
    try {
      const data = JSON.parse(text);
      if (typeof data.title === "string" && data.title.trim()) return data.title.trim().slice(0, 180);
    } catch {
      // Invalid JSON is refused before a title is required.
    }
  }
  return filePath;
}

function walk(dir, acc, root) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of names) {
    if (name === "node_modules" || name === ".preview" || name === "archive" || name === ".git" || name.startsWith(".")) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walk(full, acc, root);
    else if (name.endsWith(".html")) acc.push(relative(root, full).replace(/\\/g, "/"));
  }
}

export function gitShowFile(root, ref) {
  try {
    return execFileSync("git", ["show", ref], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 8 * 1024 * 1024,
    });
  } catch {
    return null;
  }
}

export function restoreArronKnowledge(root) {
  for (const ref of ARRON_RESTORE_REFS) {
    const text = gitShowFile(root, ref);
    if (!text) continue;
    if (looksLikePlaceholder(text) || jsonProblem("arron-knowledge.json", text)) continue;
    return { text, ref };
  }
  return null;
}

function readSafe(root, filePath) {
  try {
    return readFileSync(join(root, filePath), "utf8");
  } catch {
    return null;
  }
}

function pushDoc(documents, filePath, text, extra = {}) {
  const chunks = chunkText(text);
  if (!chunks.length) return;
  documents.push({
    path: filePath,
    title: extra.title || titleFor(filePath, text),
    brand: extra.brand || brandForPath(filePath),
    source_sha: sha256(text),
    text,
    chunks,
    restoredFrom: extra.ref || "",
  });
}

export function buildCorpus(root, options = {}) {
  const documents = [];
  const refused = [];
  let droppedParts = 0;
  const restore = options.restore || (() => restoreArronKnowledge(root));
  const seen = new Set();

  const consider = (filePath, raw) => {
    if (!raw && raw !== "") return;
    if (DENY_FILES.has(filePath)) {
      refused.push({ path: filePath, reason: "denylist" });
      return;
    }
    const prepared = prepareText(filePath, raw, filePath === "arron-knowledge.json" ? restore : null);
    droppedParts += prepared.dropped || 0;
    if (prepared.action === "refuse") {
      refused.push({ path: filePath, reason: prepared.reason });
      return;
    }
    pushDoc(documents, filePath, prepared.text, { ref: prepared.ref });
    seen.add(filePath);
  };

  for (const filePath of ROOT_FILES) {
    const raw = readSafe(root, filePath);
    if (raw === null) {
      refused.push({ path: filePath, reason: "missing" });
      continue;
    }
    consider(filePath, raw, "root");
  }

  const docsDir = join(root, "docs");
  let docNames = [];
  try {
    docNames = walkDocs(docsDir, root);
  } catch {
    docNames = [];
  }
  for (const filePath of docNames) {
    if (seen.has(filePath) || DENY_FILES.has(filePath)) {
      if (DENY_FILES.has(filePath)) refused.push({ path: filePath, reason: "denylist" });
      continue;
    }
    const raw = readSafe(root, filePath);
    if (raw === null) continue;
    consider(filePath, raw, "doc");
  }

  const html = [];
  walk(root, html, root);
  for (const filePath of html) {
    const raw = readSafe(root, filePath);
    if (raw === null) continue;
    const card = htmlCard(filePath, raw);
    if (!card) continue;
    const prepared = prepareText(filePath, card.text, null);
    droppedParts += prepared.dropped || 0;
    if (prepared.action === "refuse") {
      refused.push({ path: filePath, reason: prepared.reason });
      continue;
    }
    pushDoc(documents, `pages/${filePath}`, prepared.text, { title: card.title, brand: brandForPath(filePath) });
  }

  const secrets = refused.filter((item) => item.reason === "secret").length;
  return {
    documents,
    refused,
    droppedParts,
    secrets,
    counts: {
      documents: documents.length,
      chunks: documents.reduce((sum, doc) => sum + doc.chunks.length, 0),
      refused: refused.length,
      secrets,
      droppedParts,
    },
  };
}

function walkDocs(dir, root, acc = []) {
  let names = [];
  try {
    names = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkDocs(full, root, acc);
    else if (name.endsWith(".md")) acc.push(relative(root, full).replace(/\\/g, "/"));
  }
  return acc;
}
