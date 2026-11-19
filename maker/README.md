# P.S Studio — Maker / 3D Print Source

OpenSCAD source for every P.S Studio physical product. Printed on Flashforge AD5X (IFS two-colour) in Leicester, UK. Net proceeds fund the Pleading Sanity sanctuary (free forever).

## Files

- `ps_logo_stamp.scad` — two-colour P.S deboss/emboss module. `use <ps_logo_stamp.scad>` then `ps_stamp(height=0.6);` to brand any part.
- `ad5x_carpet_tray.scad` — 4-piece interlocking base tray (363×363 footprint, dovetail corners, 12mm rim).
- `cooper_dog_keychain.scad` — Cooper pug keyring (black pug, white chest patch).
- `stylized_cooper_pug.scad` — Cooper figurine / lithophane base.
- `bruceybonusbargins_keychain.scad` — BruceyBonus round keychain.
- `ford-connect-2018-grille-overlay.scad` — 2018 Transit Connect Raptor-style grille overlay (5-piece).
- `ford_badge_clip_on_bumper.scad` — Ford badge bumper clip.
- `rear_light_cover_trim.scad` — rear-light bezel trim.
- `printer_config.json` — AD5X slicer profile (temperatures, IFS flush volume 500mm³, layer heights). `printer_config.example.json` is the safe template.
- `FIRST-PRINTS-README.md` — print order: calibration cube → Cooper keychain → flexi test.
- `PACK2-PRINT-CHECKLIST.md` — Pack 2 verification checklist.

## Rules

- Every printable part calls `ps_stamp()` — no unbranded parts leave the studio.
- Two-colour parts: Slot 1 = SUNLU PLA+ Black, Slot 2 = Flashforge Rapid PLA White (high-flow, 500mm³ flush).
- All STLs exported from these SCADs are watertight. Regenerate STLs from source, never edit STL by hand.
- Crisis lines (999 / Samaritans 116 123 / Shout 85258 / NHS 111) stay on every web page. Maker files are source-only, not user-facing.
