# P.S Studio · FIRST PRINTS PACK — Flashforge AD5X
Generated 17 Nov 2026 · All STLs verified watertight · All fit 220×220×220 bed.
Brand lock: teal #00fff0 / amber #f59e0b on dark #0b0f19. No purple/pink. No emoji.

## BEFORE ANY OF THESE — run the factory test print
Your screen shows `FlashForge-TestModel-01.3mf` queued (14 min, 3.73 g). Print it
FIRST. It validates bed level, flow, IFS and the machine before you trust my files.
IFS is currently OFF — leave it off for test; enable only for two-colour prints.

## What's in this pack (new-prints/)
| File | Size (mm) | Material | Slicer notes |
|---|---|---|---|
| bruceybonusbargins_keychain_bar.stl | 90×22×3.6 | PLA slot1 black | 0.20mm, 3 walls, 15% gyroid, no supports. Embossed text up. |
| bruceybonusbargins_keychain_tag.stl | 45×60×3.6 | PLA | same. Two-line text. |
| cooper_dog_tag.stl | 45×60×3.6 | PLA | same. "COOPER" + paw. Keyring hole 6mm. |
| cooper_figurine_black.stl | 52×81×57 | PLA+ black slot1 | 0.20mm, 3 walls, 15% gyroid. Supports under chin/snout/ears/tail. Integrated base = prints flat, stands. |
| cooper_figurine_white.stl | (align to black origin) | PLA white slot2 | Load BOTH STLs in OrcaSlicer, same origin. Assign black→slot1, white→slot2. Enable IFS. Flush 500mm³ Black→White. |
| cooper_figurine_combined_singlecolour.stl | 52×81×57 | PLA any | Single-colour fallback. Paint chest/muzzle after. |
| ford_style_clip_on_bumper_trim.stl | 110×55×13 | **PETG or ASA only — NOT PLA** (car heat/UV) | 0.20mm, 4 walls. Print badge-face DOWN on bed, clips UP, supports under clip hooks. Blank oval recess 90×35×2.5 — glue your own badge with 3M VHB. NO Ford logo (trademark). |
| rear_light_bezel.stl | 180×70×4 | black PETG/ASA (or CLEAR PETG for lens protector) | 0.20mm, 3 walls, no supports. SURROUND only — inner opening exposes full lens. |
| rear_light_custom_insert_blank.stl | 36×60×1.5 | contrasting PETG | Glues into the side recess of bezel. Engrave or add your design. |
| rear_light_custom_insert_PS.stl | 36×60×2.1 | contrasting PETG | Same insert with "P.S" embossed. |
| rear_light_paper_template.svg | 1:1 | — | Print at 100% (no scale), cut out, hold to your rear light, confirm fit BEFORE printing plastic. |

## Fit-check items that NEED YOUR MEASUREMENT (defaults are guesses)
1. **Ford clip** — `SLOT_GAP = 5.5mm` in build_all_prints.py = bumper slat thickness + 0.5.
   Measure your slat with calipers, edit SLOT_GAP, re-run `python3 build_all_prints.py`.
   Print ONE clip first, test push-fit, then print the full trim.
2. **Rear light** — no photo of the actual rear light reached me (the file labelled
   rearlight-ref is the printer box). The bezel is a generic 180×70 template.
   Measure the rear section of your rear light (outer W/H, lens W/H, corner radii)
   and edit `outer_w/outer_h/inner_w/inner_h` in build_all_prints.py, re-run.
   Use the SVG paper template first. UK MOT: a cover must NOT cover the lit lens,
   change its colour, or reduce visibility — this bezel surrounds only. If in doubt,
   fit a clear lens protector, not a tinted cover.

## Two-colour figurine (Cooper the dog) — OrcaSlicer steps
1. File → Import → add cooper_figurine_black.stl, then add cooper_figurine_white.stl.
2. Select both → right-click → "Merge" (same origin, they were built aligned).
3. Assign black part → extruder 1 (slot1 SUNLU PLA+ Black).
4. Assign white part → extruder 2 (slot2 Flashforge Rapid White).
5. Enable IFS on printer screen. Set flushing volume 500 mm³ (Black→White).
6. Supports: touching build plate only, under chin, snout tip, ears, curled tail.

## LAN / prompt-to-print status (from your screen photos, 17 Nov)
- Printer ID / serial: `[serial — local only, never commit]` ✓ (received)
- IP: `[LAN IP — local only, never commit]` — this is the **hotspot-mode** IP (printer as Wi-Fi access
  point, hotspot name "AD5X"). If you instead join the printer to your home Wi-Fi or
  Ethernet, it gets a different IP from your router — use THAT in printer_config.json.
- 6-digit LAN check code: **NOT YET SEEN** — it's usually in Settings → About / Info,
  or in the cloud-bind screen. Fill it in printer_config.json. Until then the bridge
  can read status but not start prints.
- **Security**: hotspot default password must be changed on the printer screen (never commit it).
  CHANGE IT. Anyone within Wi-Fi range can connect with that default.
- LAN Only toggle is currently OFF. Turning it ON disables cloud (good for privacy)
  and the local bridge (ad5x_bridge.py, direct HTTP 8898 / TCP 8899) still works.
- **Honest limit**: I am in a sandbox and cannot reach [LAN IP — local only, never commit] — that's your
  home network. The bridge runs on YOUR PC (Windows/Linux) on the same LAN. I cannot
  start a live print from here. When you give the final OK + check code, run the
  bridge on your PC and I can hand you exact job files.

## Re-rendering / editing
All geometry is parametric in `build_all_prints.py`. Edit the constants at the top of
each build_* function, then `python3 build_all_prints.py`. Requires:
`pip install trimesh manifold3d numpy pillow opencv-python shapely`.
Source `.scad` drafts (OpenSCAD format, same parameters) are included for reference.

## Crisis strip (sanctuary-facing pages only — not on physical goods)
999 · Samaritans 116 123 · Shout text 85258 · NHS 111 option 2.
