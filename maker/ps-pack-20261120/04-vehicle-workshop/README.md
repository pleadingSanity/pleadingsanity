# 04 · Vehicle workshop — design validation, not for sale yet

Parametric trim and cosmetic parts for the 2018 Ford Transit Connect and the 1997
Suzuki Bandit 400. Geometry exists; none has been fitted to a vehicle.

## Rules before any part leaves the workshop

1. Fit-check first: print one PLA mock-up, measure against the real panel, then
   tune the parameter in the OpenSCAD source and re-export.
2. Real car parts must be ASA or PETG-CF (heat and UV). PLA is a mock-up only
   and will warp on a dashboard or in a hot engine bay area.
3. No manufacturer logo or trademark badge is modelled. Badge recesses are blank
   so a user can fit their own licensed badge.
4. A rear-light surround must never cover or tint the lit lens; UK MOT rules
   apply. When in doubt use a clear lens protector, not a tinted cover.
5. These files stay `draft` in every catalogue until a fitting photo and a safety
   note exist. The shop gate (`netlify/lib/prints.ts`) blocks them from sale.

## Sources (repo `maker/` root)

- `ford_badge_clip_on_bumper.scad` — bumper clip with blank badge recess.
- `ford-connect-2018-grille-overlay.scad` — five-piece grille overlay.
- `rear_light_cover_trim.scad` — parametric rear-light bezel.
- `ad5x_carpet_tray.scad` — workshop tray (not a vehicle part).

## STLs here

- `fit_check_calibration_20mm.stl` — tolerance/flow calibration first print.
- `ford_style_clip_on_bumper_trim.stl`, `ford_bumper_clip_blank_badge.stl`,
  `ford_grille_trim_bar_print2.stl` — bumper/grille family.
- `rear_light_cover_trim_parametric.stl`, `rear_light_bezel.stl`,
  `rear_light_custom_insert_blank.stl`, `rear_light_custom_insert_PS.stl` —
  rear-light family.

Dimensions, volumes and watertight results: `../VERIFICATION-REPORT.md`.
