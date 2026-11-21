# AD5X Print Checklist — Cooper observed session (2026-11-21)

Reference for the Flashforge AD5X slicer session photographed on 2026-11-21.
This is a working checklist; it does not claim a printer connection or a
started print — a slicer screenshot only proves a file is on screen.

## 1. Facts read from the slicer photo

- Object shown: `cooper_dog_v2_black.stl`
- Size: 58 × 77 × 70 mm · Volume: 93,098.7 mm³ · Triangles: 11,106
- Printer: Flashforge AD5X
- Filament selected: Generic PLA (slot 1)
- Process: 0.20 mm Standard @FF AD5X (Global)
- Nozzle variant shown: 0.4 Hardened
- Layer height 0.20 mm; first layer 0.25 mm; Seam: Aligned
- Multimaterial toggle: off; only one object on the plate

## 2. Identity verdict

No archived STL matches that fingerprint. Verified pack `cooper_sitting_v2_black.stl`
(PR #380) is 62.0 × 66.3 × 81.0 mm, 100,518.2 mm³, **20,622 triangles** — a
different mesh. Before printing, Shane should say where `cooper_dog_v2_black.stl`
was saved; once shared, compute its SHA-256, confirm watertightness, and archive
it with a manifest row. Do not assume it equals the verified v2 sitting model.

Visual silhouette in the preview (sitting body on a round base, head turned)
matches the intended pug-character family, but likeness cannot be judged from a
phone photo of a screen. The procedural v2 model is character-level by design;
photo-level realism needs a scan or sculpt (paths in the PR #380 README).

## 3. Corrections before the next slice

1. **Filament profile.** Generic PLA → SUNLU Premium PLA+ Black (Slot 1). Generic
   PLA defaults around 195–210 °C nozzle can underperform PLA+; use roughly
   215–225 °C nozzle and 55–65 °C bed. If no PLA+ preset exists, edit the
   temperature fields rather than printing on Generic PLA.
2. **Nozzle variant.** 0.4 Hardened → 0.4 Brass unless a hardened steel nozzle is
   physically fitted (stock AD5X brass). The hardened preset changes retraction
   and thermal assumptions for the wrong hardware.
3. **Colour workflow.** Multimaterial off and only the black body loaded produces
   an all-black print. For the two-tone design, load
   `cooper_sitting_v2_white_blaze.stl` and `cooper_sitting_v2_white_eyes.stl` at
   the shared origin, assign white to Slot 2, and use the purge tower if
   available. Manual swap z-thresholds are in the PR #380 README.
4. **Supports.** None expected; add light support only if the slicer flags the
   tail-curl overhang. A brim is optional on the flat base disc.
5. **Seam.** Aligned is acceptable; rotate the object so the seam faces the rear.
6. **First print = validation print.** Record the slicer's sliced weight (not the
   mesh volume) before starting; check first-layer adhesion on the round base,
   bonding around the tail curl, and elephant-foot on the base edge.

## 4. Post-print acceptance

- Base lies flat with no lifted corners; ears and tail intact; no support marks
  on the face side.
- Key dimensions within ±1 mm of the manifest.
- Three photos (front, three-quarter, rear) kept in `images/3d-prints/` only
  after Shane approves the sellable version.
- Catalogue/JSON changes follow a successful print and explicit Shane sign-off;
  no product row is added from a preview alone.

## 5. Standing security rules

- Never commit the printer LAN IP, printer serial, LAN check code, or hotspot
  password in any form (not even in a "do not commit" example). Only
  `maker/printer_config.example.json` with placeholder values belongs in git.
- No live printer status, print start, or completed print is claimed without the
  three AD5X identifiers (IP / serial / LAN check code).
