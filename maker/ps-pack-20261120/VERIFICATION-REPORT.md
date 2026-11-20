# Verification report — P.S Studio STL pack (2026-11-20)

Every STL passed a strict programmatic check before zipping:

1. Binary STL header triangle count matches file length exactly (`84 + 50 × triangles` bytes).
2. Loaded with trimesh, welded/merged, normals fixed, holes filled.
3. Every connected component is watertight with positive volume (no negative/inverted shells).
4. Bounding-box dimensions recorded in mm for slicer bed-fit check (AD5X bed 220 × 220 mm).

**Total files: 36 · all watertight: yes.**

| File | Group | Dims X×Y×Z mm | Vol cm³ | Triangles | Role / colour |
|---|---|---|---|---|---|
| `cooper_sleeping_figurine.stl` | 01-cooper-pug | 92.0 × 39.0 × 32.5 | 44.403 | 6304 | Sleeping pug figurine body (black) (Slot1 black PLA+) |
| `cooper_sleeping_chest_patch_white.stl` | 01-cooper-pug | 14.0 × 10.0 × 1.8 | 0.127 | 320 | White chest patch inlay (Slot2) (Slot2 white PLA) |
| `cooper_sleeping_eyes_white.stl` | 01-cooper-pug | 5.6 × 16.2 × 1.6 | 0.02 | 640 | Closed-eye inlays (Slot2) (Slot2 white PLA) |
| `cooper_head_keychain.stl` | 01-cooper-pug | 38.0 × 33.6 × 49.0 | 20.719 | 2714 | Pug-head relief keyring (ps-008) (Slot1 black PLA+) |
| `pug_head_keychain.stl` | 01-cooper-pug | 55.0 × 45.5 × 4.0 | 5.622 | 2776 | Pug-head silhouette keyring, 3.4mm (Slot1 black PLA+) |
| `pug_sitting_keychain_black.stl` | 01-cooper-pug | 42.2 × 73.5 × 3.4 | 6.169 | 2940 | Sitting pug keyring body (Slot1 black PLA+) |
| `pug_sitting_keychain_white_chest_insert.stl` | 01-cooper-pug | 9.0 × 15.8 × 0.6 | 0.064 | 520 | Sitting pug white chest insert (Slot2 white PLA) |
| `cooper_dog_tag.stl` | 01-cooper-pug | 45.0 × 60.0 × 3.6 | 7.993 | 3938 | Cooper hanging dog tag (Slot1 black PLA+) |
| `cooper_figurine_combined_singlecolour.stl` | 01-cooper-pug | 52.0 × 80.84 × 57.0 | 83.853 | 7588 | Standing pug figurine, single-colour (first print) (Single slot) |
| `cooper_figurine_black.stl` | 01-cooper-pug | 52.0 × 80.84 × 57.0 | 83.798 | 7088 | Standing pug figurine black body (Slot1 black PLA+) |
| `cooper_figurine_white.stl` | 01-cooper-pug | 34.4 × 34.4 × 41.5 | 1.943 | 2816 | Standing pug figurine white accents (Slot2 white PLA) |
| `pug_dragon_black.stl` | 01-cooper-pug | 67.0 × 30.8 × 21.0 | 16.277 | 1906 | Pug-dragon fidget body (ps-009) (Slot1 black PLA+) |
| `pug_dragon_white_accents.stl` | 01-cooper-pug | 76.0 × 13.75 × 20.67 | 1.74 | 3496 | Pug-dragon horns/spikes/tail accents (Slot2 white PLA) |
| `cooper_lithophane.stl` | 01-cooper-pug | 69.75 × 151.5 × 4.0 | 32.897 | 679836 | Cooper photo lithophane (backlit panel) (Single slot) |
| `ps_tracksuit_figure_propermask.stl` | 02-tracksuit-figure | 56.0 × 56.0 × 90.3 | 41.867 | 6282 | Standing figure black body, proper mask + hood, round base (ps-010) (Slot1 black PLA+) |
| `ps_eye_slits_white.stl` | 02-tracksuit-figure | 16.2 × 2.4 × 2.6 | 0.085 | 168 | Two white eye-slot inlays (Slot2 white PLA) |
| `ps_back_brain_insert_white.stl` | 02-tracksuit-figure | 24.4 × 4.2 × 24.8 | 1.011 | 4766 | White brain+teardrop hood-back relief (Slot2 white PLA) |
| `ps_chest_ps_insert_white.stl` | 02-tracksuit-figure | 11.0 × 1.4 × 4.47 | 0.026 | 1660 | White P.S chest mark (optional) (Slot2 white PLA) |
| `ps_character_black.stl` | 02-tracksuit-figure | 60.0 × 60.0 × 56.0 | 32.533 | 1852 | Balaclava character main body (Slot1 black PLA+) |
| `ps_character_white_accents.stl` | 02-tracksuit-figure | 17.8 × 27.45 × 44.8 | 0.311 | 3122 | Character white hood/chest accents (Slot2 white PLA) |
| `bruceybonus_round_black.stl` | 03-brucey-keychain | 55.0 × 55.0 × 3.4 | 7.976 | 580 | 55mm round keyring black base (ps-007) (Slot1 black PLA+) |
| `bruceybonus_round_white_letters_insert.stl` | 03-brucey-keychain | 46.0 × 12.95 × 0.8 | 0.138 | 4088 | Raised BRUCEYBONUS white lettering insert (Slot2 white PLA) |
| `bruceybonus_round_single_colour.stl` | 03-brucey-keychain | 55.0 × 55.0 × 4.6 | 8.114 | 4668 | Round keyring single-colour version (Single slot) |
| `bruceybonus_keychain_detail.stl` | 03-brucey-keychain | 50.0 × 64.5 × 5.0 | 7.764 | 29034 | Detailed two-tone keychain badge (cat face + text) (Two-tone) |
| `bruceybonusbargins_keychain_bar.stl` | 03-brucey-keychain | 90.0 × 22.0 × 3.6 | 5.648 | 5080 | Bar-style keychain 90mm with raised text (Slot1 black PLA+) |
| `bruceybonusbargins_keychain_tag.stl` | 03-brucey-keychain | 45.0 × 60.0 × 3.6 | 7.957 | 4576 | Tag-style keychain 45x60mm (Slot1 black PLA+) |
| `fit_check_calibration_20mm.stl` | 04-vehicle-workshop | 50.0 × 20.0 × 20.0 | 11.846 | 220 | FIRST PRINT: 20mm fit-check + peg/hole calibration (Single slot) |
| `ford_bumper_clip_blank_badge.stl` | 04-vehicle-workshop | 136.0 × 25.0 × 22.5 | 17.966 | 252 | Ford-style bumper clip, blank oval badge recess (Slot1 (ASA/PETG-CF for car)) |
| `ford_style_clip_on_bumper_trim.stl` | 04-vehicle-workshop | 110.0 × 55.0 × 13.0 | 31.429 | 590 | Bumper trim bar with clip tabs (Slot1 (ASA)) |
| `ford_grille_trim_bar_print2.stl` | 04-vehicle-workshop | 20.0 × 14.0 × 115.0 | 25.185 | 44 | Transit Connect grille overlay trim bar (Slot1 (ASA)) |
| `rear_light_cover_trim_parametric.stl` | 04-vehicle-workshop | 150.0 × 66.0 × 12.0 | 18.904 | 84 | Rear-light cover frame with ribs + clips (Slot1 (ASA)) |
| `rear_light_bezel.stl` | 04-vehicle-workshop | 180.0 × 70.0 × 4.0 | 20.516 | 568 | Rear-light bezel frame (Slot1 (ASA)) |
| `rear_light_custom_insert_blank.stl` | 04-vehicle-workshop | 35.6 × 59.6 × 1.5 | 3.162 | 268 | Rear-light blank design insert (Slot1) |
| `rear_light_custom_insert_PS.stl` | 04-vehicle-workshop | 35.6 × 59.6 × 2.1 | 3.228 | 1032 | Rear-light insert with P.S mark (Slot1 / two-tone) |
| `ps_tracksuit_figure_teethmask.stl` | _legacy-superseded | 56.0 × 56.0 × 90.0 | 41.145 | 5936 | SUPERSEDED teeth-mask body — kept for reference; use propermask set (—) |
| `teeth_grill_insert_white.stl` | _legacy-superseded | 15.4 × 3.95 × 8.75 | 0.331 | 188 | SUPERSEDED teeth insert for teethmask only (—) |

## Honesty status

- None of these STLs has been printed on the AD5X yet. Geometry is primitive-based (ellipsoids, cylinders, unions) and stylized from the concept renders; fit, hinge gaps and surface detail must be confirmed on a first test print.
- White-named files are Slot-2 inlays/accents for two-colour IFS or glue-in placement; they are not standalone products.
- `_legacy-superseded/` files are retained for reference only and should not be sold or printed as current products.

## Known gaps (no verified STL in this pack yet)

| Shop id | Item | Status |
|---|---|---|
| ps-tray-001 | 4-piece carpet base tray | OpenSCAD source `SOURCE/openscad/ad5x_carpet_tray.scad`; Python rebuild pending |
| ps-tips-002 | Reusable filter tips ×3 | Not modelled yet; food-safe PETG profile needed |
| ps-bandit-clamp-003 | Bandit 400 fork clamps L/R | Not modelled; needs 41 mm fork measurement check |
| ps-tpu-knee-004 | TPU knee pads pair | Not modelled; flexible 95A TPU profile needed |
| ps-fidget-005 | Articulated fidget dragon | Stylized analog `pug_dragon_black/white_accents` included; true print-in-place hinges untested |
| ps-spool-caddy-006 | Spool holder + tool caddy | Not modelled yet |
| 19 draft keyring/charms | Catalogue drafts | Mockup images only; no approved geometry or real photos yet |