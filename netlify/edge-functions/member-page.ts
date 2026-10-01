// ==============================================================
// 🌿 /@username — every member's own public page
// Serves member.html at the pretty address; the page reads the
// username from the URL and loads what that member chose to share.
// ==============================================================

import type { Config, Context } from "@netlify/edge-functions";

export default async (req: Request, _context: Context) => {
  const name = decodeURIComponent(new URL(req.url).pathname.slice(2)).toLowerCase();
  if (!/^[a-z0-9_]{3,24}\/?$/.test(name)) return;
  return new URL("/member.html", req.url);
};

export const config: Config = {
  path: "/@*",
};
