# Addendum — proper balaclava mask + hood-back brain graphic (2026-11-20)

Upgrades the tracksuit/balaclava figure (shop ps-010). Black body prints in
Slot 1 (SUNLU PLA+ Black); the three white parts print in Slot 2 (Flashforge
High-Speed White PLA) as IFS inlays, or glue on after the black print.

## New STLs (02-tracksuit-balaclava-figure/stl/)

| File | Role | Size mm (X×Y×Z) | Volume | Notes |
|---|---|---|---|---|
| `ps_tracksuit_figure_propermask.stl` | Main black body: covered lower-face mask, hood opening rim, nose ridge, mouth panel; standing on round base | 56.0 × 56.0 × 90.3 | 41.9 cm³ | Supersedes `ps_tracksuit_figure_teethmask.stl`; kept for reference |
| `ps_eye_slits_white.stl` | Two white horizontal eye inlays | 16.2 × 2.4 × 2.6 | 0.1 cm³ | Mount at z ≈ 81.8, front face +Y; proud ~1.2 mm |
| `ps_back_brain_insert_white.stl` | White two-lobe brain + teardrop relief for the rear of the hood | 24.4 × 4.2 × 24.8 | 1.0 cm³ | Mounts on hood back (−Y), no backing plate |
| `ps_chest_ps_insert_white.stl` | White "P.S" chest mark (optional) | 11.0 × 1.4 × 4.5 | ~0.04 cm³ | Chest front, z ≈ 52.8 |

## How it prints

1. Black body: AD5X PLA+ 0.20 mm, 3-wall, gyroid ~18%, no supports, ~90 min.
2. White inserts: Slot 2 IFS layer change, or print separately in white and
   press/glue into the proud positions listed above.
3. Dry-fit the brain relief against the hood back before glue; position so the
   two lobes sit symmetrically on the hood shell.
4. The old teeth-grille insert (`teeth_grill_insert_white.stl`) belongs to the
   superseded teethmask figure and is not used with this version.

## Honesty status

- All four STLs verified watertight with positive volume; none has been printed
  on the AD5X yet. This is a stylized approximation from primitives, not a
  scan of the reference figures — refine proportions on a first test print.
- Concept target images: `images/concept-black-white-balaclava-figures.jpg`
  (black + white figures on round bases) and `images/apparel-black-tracksuit-design.webp`.

## Source

`generators/build_mask_back_figure.py` (trimesh + manifold booleans; re-run to
regenerate all four STLs into the group `stl/` folder).
