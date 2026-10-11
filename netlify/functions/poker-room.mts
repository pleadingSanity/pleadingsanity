// Play-chip rooms only. No money, no rake, no payout.
import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// Seat names are shown to the other player: letters, numbers, spaces and simple marks only.
const cleanName = (v: unknown) => String(v ?? "").replace(/[^\p{L}\p{N} ._'-]/gu, "").trim().slice(0, 24);
const cleanNames = (v: unknown) => (Array.isArray(v) ? v.map(cleanName).filter(Boolean) : []);

export default async (req: Request) => {
  const store = getStore("poker-rooms");
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (req.method === "POST" && parts.length === 2) {
    const code = Math.random().toString(36).slice(2, 8);
    const room = { code, pot: 0, seats: [], players: [], actions: [], stacks: [1000, 1000, 1000, 1000], board: [], seed: Math.floor(Math.random() * 1e9), hand: 1, note: "Play chips only. One pot.", updated: Date.now() };
    await store.setJSON(code, room);
    return json(room, 201);
  }
  const code = parts[2] || "";
  if (!/^[a-z0-9]{4,8}$/.test(code)) return json({ error: "Room code is missing." }, 400);
  const room = (await store.get(code, { type: "json" })) as Record<string, unknown> | null;
  if (!room) return json({ error: "No room by that code." }, 404);
  if (req.method === "GET") return json({ ...room, players: cleanNames(room.players), seats: cleanNames(room.seats) });
  if (req.method === "POST") {
    const body = await req.json().catch(() => ({}));
    const name = cleanName(body.name);
    // Rooms saved before names were cleaned may still hold markup; clean them on the next write.
    const players = cleanNames(room.players);
    if (name && !players.includes(name) && players.length < 2) players.push(name);
    room.players = players;
    room.seats = players.slice();
    if (Array.isArray(body.stacks) && body.stacks.length === 4) {
      room.stacks = body.stacks.map((n) => Math.max(0, Math.min(1000000, Math.floor(Number(n) || 0))));
    }
    const play = body.play && typeof body.play === "object" ? body.play : null;
    if (play && Number(play.hand) === Number(room.hand || 1) && Number(play.expect) === (Array.isArray(room.actions) ? room.actions.length : 0)) {
      const seat = Number(play.seat);
      const kind = String(play.kind || "");
      if (seat >= 0 && seat < 4 && (kind === "fold" || kind === "call" || kind === "raise")) {
        const actions = Array.isArray(room.actions) ? room.actions : [];
        actions.push({ seat, kind, amount: Math.max(0, Math.min(100000, Number(play.amount) || 0)) });
        room.actions = actions.slice(-200);
      }
    }
    const next = Number(body.hand);
    const nowHand = Number(room.hand || 1);
    if (!play && Number.isInteger(next) && next === nowHand + 1 && next < 500) {
      room.hand = next;
      room.actions = [];
    }
    if (!room.seed) room.seed = Math.floor(Math.random() * 1e9);
    room.note = String(body.note || room.note || "Play chips only.").slice(0, 140);
    room.updated = Date.now();
    await store.setJSON(code, room);
    return json(room);
  }
  return json({ error: "Method not allowed" }, 405);
};

export const config: Config = { path: ["/api/poker-room", "/api/poker-room/:code"] };
