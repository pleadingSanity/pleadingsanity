# P.S Studio · OrcaSlicer print pack — 2026-11-20

Everything in `STL/` was checked watertight before zipping (see `VERIFICATION-REPORT.md`
and `PRINT-MANIFEST.csv`). Drag the files straight into OrcaSlicer; no conversion needed.

## 1 · Load the pack

1. Unzip this folder anywhere (e.g. `Documents/OrcaSlicer/PS-Studio/`).
2. Open OrcaSlicer → **Printer** → add **Flashforge Adventurer 5X (AD5X)** if not present:
   bed 220 × 220 × 220 mm, FFF PLA profile.
3. Drag an `.stl` from the group folders onto the build plate, or **File → Import**.
4. Group folders are print batches; `_legacy-superseded/` is reference only — do not print/sell those.

## 2 · Filament slots (AD5X IFS)

| Slot | Filament | Use for |
|---|---|---|
| 1 | SUNLU Premium PLA+ Black (1 kg) | All black bodies, keyrings, vehicle parts |
| 2 | Flashforge Rapid PLA High-Flow White | White inlays, chest patches, eye slits, brain relief, lettering |
| 3 | Empty | — |
| 4 | Empty | — |

White STLs are **inlays/accents**: either print as Slot-2 IFS layer-change parts, or print them
separately in white and press/glue onto the black body at the positions noted below.

## 3 · Slicer starting profiles (tune on first test print)

| Part type | Layer | Walls | Infill | Nozzle / bed | Notes |
|---|---|---|---|---|---|
| Keyrings & tags | 0.16 mm fine | 3 | gyroid 15% | 210 °C / 60 °C PLA+ | Print flat; check keyring hole clear |
| Figurines & figures | 0.20 mm | 3 | gyroid 18% | 210 °C / 60 °C | Upright on base; no supports on body |
| Pug-dragon fidget | 0.20 mm | 4 | gyroid 20% | 210 °C / 60 °C | **No supports on hinges**; wiggle immediately after cooling |
| Vehicle trim (car fit) | 0.20 mm | 4–6 | 40% gyroid | ASA/PETG-CF profile | ASA recommended for heat; dry-fit before paint |
| Lithophane | lithophane profile | — | — | backlit only | Decorative; min thickness checked in slicer |

## 4 · Group-by-group print order

### `STL/01-cooper-pug/` — Cooper the black pug (white chest blaze)
1. `cooper_sleeping_figurine.stl` — black body, lying pose, print upright on belly.
2. `cooper_sleeping_chest_patch_white.stl` — white chest blaze, proud on chest front.
3. `cooper_sleeping_eyes_white.stl` — closed-eye inlays on the face sides.
4. Keyrings: `cooper_head_keychain.stl`, `pug_head_keychain.stl`,
   `pug_sitting_keychain_black.stl` + `pug_sitting_keychain_white_chest_insert.stl`,
   `cooper_dog_tag.stl`.
5. Figurine options: `cooper_figurine_combined_singlecolour.stl` (one-slot first print),
   or `cooper_figurine_black.stl` + `cooper_figurine_white.stl` (two-tone).
6. Fidget: `pug_dragon_black.stl` + `pug_dragon_white_accents.stl` (hinge gap 0.45 mm).
7. `cooper_lithophane.stl` — decorative backlit panel only.

### `STL/02-tracksuit-figure/` — P.S hooded balaclava figure (ps-010)
1. `ps_tracksuit_figure_propermask.stl` — black body on round base, ~90 mm tall.
2. `ps_eye_slits_white.stl` — two white eye inlays, front face, z ≈ 81.8 mm, proud ~1.2 mm.
3. `ps_back_brain_insert_white.stl` — brain + teardrop relief on hood back (−Y).
4. `ps_chest_ps_insert_white.stl` — optional white P.S chest mark, z ≈ 52.8 mm.
5. Alternate character: `ps_character_black.stl` + `ps_character_white_accents.stl`.

### `STL/03-brucey-keychain/` — BruceyBonus Bargain Toys (ps-007)
1. `bruceybonus_round_black.stl` (55 mm base) + `bruceybonus_round_white_letters_insert.stl`.
2. `bruceybonus_round_single_colour.stl` — quick one-slot version.
3. `bruceybonus_keychain_detail.stl` — detailed two-tone badge (cat face + text heightmap).
4. `bruceybonusbargins_keychain_bar.stl` (90 mm bar) and `bruceybonusbargins_keychain_tag.stl`.

### `STL/04-vehicle-workshop/` — calibration + Ford/Bandit-adjacent parts
1. **Print `fit_check_calibration_20mm.stl` first** and measure X/Y/hole before any car part.
2. `ford_bumper_clip_blank_badge.stl`, `ford_style_clip_on_bumper_trim.stl`,
   `ford_grille_trim_bar_print2.stl` — dry-fit on the vehicle; use ASA for heat resistance.
3. `rear_light_bezel.stl` + `rear_light_custom_insert_blank.stl` / `..._PS.stl`,
   `rear_light_cover_trim_parametric.stl` — check lens clearance before finalising.

## 5 · First-test checklist

- [ ] Calibration piece printed; dimensions within tolerance; peg/hole fit correct.
- [ ] One keyring printed in black; hole fits a 5–6 mm split ring.
- [ ] One two-tone test (black body + white insert); check inlay overlap ~0.1 mm.
- [ ] Fidget hinges move freely after cooling; no support on joints.
- [ ] Vehicle parts dry-fit before ASA production prints.
- [ ] Record real print photos → replace placeholder mockups in the shop catalogue.

## 6 · Honesty note

These STLs are primitive-built from the concept renders, **not scans of finished prints**.
Proportions and fine detail (wrinkles, fabric texture, grille teeth) are simplified; refine on
the first print. No printer LAN IP, serial or check code is included anywhere in this pack.
`SOURCE/` holds the Python generators and OpenSCAD sources for edits and regeneration.
