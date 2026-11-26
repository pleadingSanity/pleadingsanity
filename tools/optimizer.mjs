#!/usr/bin/env node
/**
 * Pleading Sanity — repeatable WebP optimizer driver.
 *
 * Usage:
 *   node tools/optimizer.mjs                 # uses tools/webp-manifest.json
 *   node tools/optimizer.mjs path/to.json   # custom manifest
 *
 * What it does:
 *   Spawns `python3 tools/webp_convert.py` (PIL) to turn legacy JPG/PNG
 *   rasters into WebP derivatives. Originals are NEVER deleted or overwritten;
 *   every legacy file remains as a fallback, so a revert is a one-line
 *   source swap. Outputs print a before/after byte table.
 *
 * Notes:
 *   No cwebp/avifenc on the build host, so this is WebP-first (AVIF skipped
 *   unless Pillow later encodes it). Heroes target <=1600w, cards <=1280w,
 *   quality 80-82, method=6. Run from the repo root; do not run
 *   scripts/materialize-binary-assets.cjs alongside this workflow.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const manifest = process.argv[2]
  ? resolve(process.argv[2])
  : resolve("tools/webp-manifest.json");

if (!existsSync(manifest)) {
  console.error(`Manifest not found: ${manifest}`);
  process.exit(1);
}

const py = spawnSync("python3", ["tools/webp_convert.py", manifest], {
  encoding: "utf8",
});

if (py.status !== 0) {
  process.stderr.write(py.stderr || "converter failed\n");
  process.exit(py.status ?? 1);
}

const report = JSON.parse(py.stdout);
console.log("Pleading Sanity WebP optimizer — zero-deletion summary");
console.log("─".repeat(72));
for (const r of report.results) {
  if (r.skipped) {
    console.log(`  SKIP  ${r.src} (${r.skipped})`);
    continue;
  }
  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
  console.log(
    `  ${kb(r.before).padStart(7)} -> ${kb(r.after).padStart(7)}  ` +
      `-${r.savedPct}%  ${r.out}`
  );
}
console.log("─".repeat(72));
console.log(
  `Total: ${(report.totalBefore / 1048576).toFixed(2)}MB -> ` +
    `${(report.totalAfter / 1048576).toFixed(2)}MB  (-${report.savedPct}%)`
);
