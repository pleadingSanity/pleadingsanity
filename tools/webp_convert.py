#!/usr/bin/env python3
"""Zero-deletion WebP converter for the Pleading Sanity static site.

Usage:
    python3 tools/webp_convert.py tools/webp-manifest.json

Manifest: JSON array of entries
  {
    "src": "images/radio/cover-bass.jpg",
    "out": "images/radio/cover-bass.webp",
    "maxWidth": 1280,
    "quality": 80
  }

Rules enforced here:
  * Originals are never overwritten or deleted (zero-deletion); outputs are
    new sibling/derivative files and the legacy file stays as the fallback.
  * Images are only ever scaled DOWN (no upscale); aspect ratio preserved.
  * WebP only (no cwebp/avifenc on the build host); quality 80-82, method=6.
  * Prints a machine-readable summary to stdout for the node driver.
"""
import json
import os
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent


def convert(entry: dict) -> dict:
    src = ROOT / entry["src"]
    out = ROOT / entry["out"]
    max_w = int(entry.get("maxWidth", 1600))
    quality = int(entry.get("quality", 82))

    if not src.exists():
        return {"src": entry["src"], "skipped": "missing"}

    before = src.stat().st_size
    with Image.open(src) as im:
        im.load()
        # Preserve transparency for PNG sources; flatten opaque JPEG to RGB.
        if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
            im = im.convert("RGBA")
        elif im.mode != "RGB":
            im = im.convert("RGB")
        w, h = im.size
        if w > max_w:
            scale = max_w / w
            im = im.resize((max_w, round(h * scale)), Image.LANCZOS)
        out.parent.mkdir(parents=True, exist_ok=True)
        im.save(out, "WEBP", quality=quality, method=6)

    after = out.stat().st_size
    return {
        "src": entry["src"],
        "out": entry["out"],
        "before": before,
        "after": after,
        "savedPct": round(100 * (before - after) / before, 1) if before else 0,
    }


def main(manifest_path: str) -> int:
    manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    results = [convert(e) for e in manifest]
    total_before = sum(r.get("before", 0) for r in results)
    total_after = sum(r.get("after", 0) for r in results)
    print(
        json.dumps(
            {
                "results": results,
                "totalBefore": total_before,
                "totalAfter": total_after,
                "savedPct": round(100 * (total_before - total_after) / total_before, 1)
                if total_before
                else 0,
            },
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else "tools/webp-manifest.json"
    raise SystemExit(main(path))
