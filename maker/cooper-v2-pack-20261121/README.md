# Cooper v2 — sitting pug figurine + head charm pack (P.S Studio / AD5X)

Built 2026-11-20; archived in this repo 2026-11-21. Five watertight binary STLs,
two-colour (black body / white accents), print-ready for the Flashforge AD5X.
Old v1 Cooper files remain in `maker/ps-pack-20261120/01-cooper-dog-pug/stl/`
(PR #374) and were **left untouched** (zero-deletion); this v2 pack sits
alongside them.

## Fingerprint check before slicing

The slicer header shows **filename, bounding size, volume and triangle count**.
Compare it to this table; a mismatch means the file on the plate is not one of
these five and should be verified before printing.

| File | Size (mm) | Triangles | Solid volume (mm³) |
|---|---|---|---|
| `cooper_sitting_v2_black.stl` | 62.0 × 66.3 × 81.0 | 20,622 | 100,518.2 |
| `cooper_sitting_v2_white_blaze.stl` | 20.0 × 5.3 × 31.5 | 2,208 | 1,491.1 |
| `cooper_sitting_v2_white_eyes.stl` | 25.4 × 4.4 × 9.2 | 2,560 | 353.0 |
| `cooper_head_bust_v2_black.stl` | 38.0 × 45.1 × 54.0 | 8,946 | 30,740.4 |
| `cooper_head_bust_v2_white_eyes.stl` | 25.0 × 4.4 × 8.6 | 2,560 | 314.3 |

Full SHA-256 values: `stl/PRINT-MANIFEST.csv`.

## Honest likeness note — read before slicing

This model was built **procedurally from watertight 3D primitives** in this
sandbox (no OpenSCAD, no Blender sculpt, no photogrammetry). It captures the
*character* of Cooper the black pug:

- upright sitting pose on a round display base, ~81 mm tall
- big round head, short blocky muzzle, turned-up nose, folded rose ears
- tight curled tail over the rear haunch
- white teardrop chest blaze; white eye inserts with proud black pupils

It does **not** reproduce a photograph's fine detail: fur texture, deep facial
wrinkles, and Cooper's exact facial likeness are not representable with
primitives. The reference photo level of realism requires a scanned or
sculpted mesh (upgrade paths at the bottom of this file).

## Files

| File | Role | Approx. size |
|---|---|---|
| `cooper_sitting_v2_black.stl` | Sitting figurine, black body + base + pupils + tail | 62.0 × 66.3 × 81.0 mm, 20,622 tris |
| `cooper_sitting_v2_white_blaze.stl` | White chest blaze overlay | z 16.5–48.0 mm |
| `cooper_sitting_v2_white_eyes.stl` | White eye pair overlay | z 60.9–70.1 mm |
| `cooper_head_bust_v2_black.stl` | Head charm/bust with keyring loop | 38.0 × 45.1 × 54.0 mm, 8,946 tris |
| `cooper_head_bust_v2_white_eyes.stl` | Head charm white eye pair | z 25.2–33.8 mm |

All five: watertight = yes, binary STL layout valid (`84 + 50 × triangles`).
Stats and SHA-256 hashes: `PRINT-MANIFEST.csv`; build log: `VERIFICATION-REPORT.json`.

## Slicer guide (OrcaSlicer / FlashPrint profile)

- **Materials:** black body = Slot 1 SUNLU Premium PLA+ Black; white accents =
  Slot 2 Flashforge Rapid PLA High-Flow White.
- Layer height 0.20 mm; 3 walls; top/bottom 4–5 layers; infill 15% gyroid.
- Supports: none expected (muzzle/tail overhangs are shallow). Add light
  support only if the slicer flags the tail curl; brim optional on the flat base disc.
- **Two-slot IFS:** load the black STL and both white STLs on the same plate at
  the shared origin (already world-aligned); black → slot 1, white → slot 2;
  enable purge tower if available.
- **Single-extruder manual swap (0.2 mm layers):**
  - Sitting: black to z≈16.3 → white z 16.5–48.0 (blaze) → black to z≈60.7 →
    white z 60.9–70.1 (eyes) → black to top.
  - Head charm: black to z≈25.0 → white z 25.2–33.8 → black to top.
- Estimated sliced weight (slicer reports the exact figure): sitting black
  ~48–58 g, sitting whites ~2–4 g; head black ~15–18 g, head whites <1 g.
- Untested on the AD5X at pack time — treat first print as a validation print;
  check first-layer adhesion on the base disc. No printer credentials, IP or
  serial data are included anywhere in this pack.

## Getting an exact-Cooper likeness (upgrade paths)

1. **Photogrammetry (free, best likeness):** 15–25 sharp, evenly lit photos of
   Cooper sitting, circling slowly (head to tail, slight overlap, no blur);
   process with Meshroom (desktop, free) or Polycam. Send me the resulting mesh
   and I will repair it, make it watertight, scale it to ~85 mm, and split the
   white chest patch/eyes for two-colour printing.
2. **Free scanned pug STL:** grab a CC-licensed pug scan from MakerWorld /
   Printables / Thangs; send the file and I will verify manifold integrity,
   fix defects, scale to match, and adapt the two-colour inserts.
3. **Commissioned sculpt:** a Blender/ZBrush sculpt outside this sandbox gives
   production-level detail; this pack supplies the print workflow and colour
   split ready for that mesh.

## Reproducibility

`src/build_cooper_v2.py` regenerates every STL and preview render from scratch
(`python3 src/build_cooper_v2.py`, then `python3 src/verify_final.py`).
Renders: `renders/` (front / three-quarter / rear for both models).
