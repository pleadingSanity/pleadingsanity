# P.S Studio · Requested Print Pack — Cooper dog · Tracksuit figure · BruceyBonus
Prepared 2026-11-20 from the local P.S build workspace. Source of truth: `pleadingSanity/pleadingsanity`.

## Honesty note (read first)
- Every STL below was rebuilt in a sandbox from Python/OpenSCAD-style generators; **none has been printed on the AD5X yet**. All files passed a watertight manifold check (volume > 0), but hinge gaps, inlay fit and surface finish must be confirmed on a first test print.
- White-colour STLs are accent/inlay parts that pair with black bodies (IFS or glued inlay). They are not stand-alone products.
- Concept images are AI/design renders used as the modelling target; they are not photographs of finished prints.
- Privacy: printer LAN IP, serial and hotspot code were deliberately excluded; personal photos and internal notes were not included.

## Folder map
```
01-cooper-dog-pug/        images/  stl/  source/
02-tracksuit-balaclava-figure/  images/  stl/  stl-check-renders/
03-bruceybonus-keychain/  images(none yet)  stl/  source/
generators/               Python builders that regenerate the STLs
_metadata/                ps-products.json shop spec (materials, prices, slicer notes)
```

## 1 · Cooper (black pug with white chest patch) — maps to shop ps-008 (keychain), ps-009 (pug-dragon fidget), plus concept figurines

| STL file | Role | Colour | Dims (mm) | Vol (cm³) | Watertight | Faces | Slicer / note |
|---|---|---|---|---|---|---|---|
| `cooper_head_keychain.stl` | Pug head keyring (3D relief) | black PLA+ | 38.0 × 33.6 × 49.0 | 20.72 | yes | 2714 | ps-008 · PLA+ 0.16mm fine 3-wall · ~30 min |
| `cooper_sleeping_figurine.stl` | Sleeping pug figurine, lying, white chest patch | black + white chest | 92.0 × 39.0 × 32.5 | 44.48 | yes | 7380 | Concept figurine; slice upright; 0.20mm |
| `cooper_lithophane.stl` | Cooper photo lithophane (backlit panel) | single colour | 69.8 × 151.5 × 4.0 | 51.64 | yes | 679836 | Large file 34 MB; lithophane profile, ~1.0 mm min |
| `cooper_dog_tag.stl` | Cooper dog hanging tag | black PLA+ | 45.0 × 60.0 × 3.6 | 7.99 | yes | 3938 | 0.20mm 3-wall |
| `cooper_figurine_black.stl` | Figurine main body (black) | black body | 52.0 × 80.8 × 57.0 | 83.8 | yes | 7088 | ps-008 concept; pair with white accents |
| `cooper_figurine_white.stl` | Figurine accent parts (white) | white accent | 34.4 × 34.4 × 41.5 | 1.94 | yes | 2816 | IFS slot 2; fits black body |
| `cooper_figurine_combined_singlecolour.stl` | Figurine merged single-colour body | single colour | 52.0 × 80.8 × 57.0 | 83.85 | yes | 7588 | Simplest first print; one slot |
| `pug_head_keychain.stl` | Pug head silhouette keyring | black PLA+ | 55.0 × 45.5 × 4.0 | 5.62 | yes | 2776 | ps-008 head option; 3.4 mm thick, 5.5 mm keyring hole |
| `pug_sitting_keychain_black.stl` | Sitting pug keyring body (black) | black body | 42.2 × 73.5 × 3.4 | 6.17 | yes | 2940 | ps-008 sitting option |
| `pug_sitting_keychain_white_chest_insert.stl` | Sitting pug white chest patch insert | white insert | 9.0 × 15.8 × 0.6 | 0.06 | yes | 520 | Thin inlay; press into black recess |
| `pug_dragon_black.stl` | Pug-dragon fidget body (black) | black body | 67.0 × 30.8 × 21.0 | 16.28 | yes | 1906 | ps-009 · hinge clearance 0.45 mm · 0.20mm 4-wall · ~120 min |
| `pug_dragon_white_accents.stl` | Pug-dragon horns/spikes/tail (white) | white accent | 76.0 × 13.8 × 20.7 | 1.74 | yes | 3496 | ps-009 accent set; test hinges free after print |

## 2 · Black/white tracksuit & balaclava P.S figures — maps to shop ps-010

| STL file | Role | Colour | Dims (mm) | Vol (cm³) | Watertight | Faces | Slicer / note |
|---|---|---|---|---|---|---|---|
| `ps_tracksuit_figure_teethmask.stl` | Standing tracksuit figure, teeth-mask recess (90 mm) | black body | 56.0 × 56.0 × 90.0 | 41.15 | yes | 5936 | ps-010 · ~56 mm wide footprint; slice upright on base |
| `teeth_grill_insert_white.stl` | White teeth-grill press-fit face insert | white insert | 15.4 × 3.9 × 8.8 | 0.33 | yes | 188 | Press into lower-face recess; check 0.1 mm overlap fit |
| `ps_character_black.stl` | Balaclava character main figure (black) | black body | 60.0 × 60.0 × 56.0 | 32.53 | yes | 1852 | ps-010 · PLA+ black + white IFS · 0.20mm 3-wall gyroid · ~90 min |
| `ps_character_white_accents.stl` | Character white accents (hood, P.S chest) | white accent | 17.8 × 27.4 × 44.8 | 0.31 | yes | 3122 | IFS slot 2; align to black body |

## 3 · BruceyBonus Bargain Toys keychains — maps to shop ps-007

| STL file | Role | Colour | Dims (mm) | Vol (cm³) | Watertight | Faces | Slicer / note |
|---|---|---|---|---|---|---|---|
| `bruceybonus_keychain_detail.stl` | BruceyBonus keychain with raised lettering (detailed) | two-tone | 50.0 × 64.5 × 5.0 | 7.76 | yes | 29034 | 0.20mm 3-wall gyroid |
| `bruceybonus_round_black.stl` | 55 mm round keyring black base | black body | 55.0 × 55.0 × 3.4 | 7.98 | yes | 580 | ps-007 · 3.4 mm thick · 6 mm keyring hole · ~25 min |
| `bruceybonus_round_white_letters_insert.stl` | Raised white BRUCEYBONUS lettering insert | white insert | 46.0 × 13.0 × 0.8 | 0.14 | yes | 4088 | Inlay into black base recess |
| `bruceybonus_round_single_colour.stl` | Round keyring single-colour version | single colour | 55.0 × 55.0 × 4.6 | 8.11 | yes | 4668 | One-slot quick print |
| `bruceybonusbargins_keychain_bar.stl` | Bar-style keychain with raised text | black PLA+ | 90.0 × 22.0 × 3.6 | 5.65 | yes | 5080 | 0.20mm 3-wall; 90 mm long |
| `bruceybonusbargins_keychain_tag.stl` | Tag-style keychain | black PLA+ | 45.0 × 60.0 × 3.6 | 7.96 | yes | 4576 | 0.20mm 3-wall |

## Images supplied
| Folder | File | What it is |
|---|---|---|
| 01 | concept-pug-head-keychain.jpg | Pug head keyring on keys (concept render) |
| 01 | concept-sleeping-pug-figurine.jpg | Lying sleeping pug, white chest patch (target) |
| 01 | concept-superhero-pug-bauble.jpg | Superhero pug, mask + cape, on base (target) |
| 02 | concept-black-white-balaclava-figures.jpg | Black & white tracksuit figures on bases (target) |
| 02 | apparel-black-tracksuit-design.webp | Black hoodie/tracksuit apparel art, front+back |
| 02 | apparel-ps-tracksuit-mark.svg / hoodie-mark.svg | Brand marks |
| 02 | apparel-crying-brain-hoodie-back.webp | Hoodie-back graphic |

## Regenerating the STLs
- `generators/build_print_set.py` → sleeping figurine, head keychain, detailed Brucey keychain, tracksuit figure + teeth insert.
- `generators/build_all_prints.py` → dog tag, figurine black/white/combined, Brucey bar/tag.
- `generators/build_pack2.py` → round Brucey base/inlay, pug head & sitting keyrings, pug-dragon fidget, character black/white.
- Parametric OpenSCAD sources live in each group `source/` folder (editable in OpenSCAD; export STL from there).

## Slicing checklist (AD5X)
1. Load STL flat; for figurines/figures orient upright on the circular base if present.
2. PLA+: 0.20 mm standard, 0.16 mm fine on keyrings; 3–4 walls; gyroid 15–20% infill; bed 60 °C / nozzle 210 °C PLA+; High-Speed PLA per its profile.
3. Two-colour: black Slot 1, white Slot 2; print white accent STL in the second slot or as glued inlay; test 1 keyring first.
4. Fidget dragon: keep 0.45 mm hinge clearance; do not use supports on joints; wiggle immediately after cooling.
5. Lithophane: dedicated lithophane profile, min thickness checked in slicer; backlit, not a functional part.

## Security scan: CLEAN — no printer credentials found
