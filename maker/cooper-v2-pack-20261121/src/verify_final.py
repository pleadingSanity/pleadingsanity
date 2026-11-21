#!/usr/bin/env python3
"""Final verification + print manifest (CSV) for Cooper v2 pack.
Reloads every exported STL, asserts watertight / positive volume / binary layout,
and writes PRINT-MANIFEST.csv with sizes, hashes, extents, z ranges."""
import os, json, hashlib, csv
import trimesh

HERE = os.path.dirname(os.path.abspath(__file__))
STL = os.path.normpath(os.path.join(HERE, "..", "stl"))

FILES = [
    ("cooper_sitting_v2_black.stl",        "Sitting figurine — black body (slot 1)"),
    ("cooper_sitting_v2_white_blaze.stl",  "Sitting figurine — white chest blaze (slot 2)"),
    ("cooper_sitting_v2_white_eyes.stl",  "Sitting figurine — white eye inserts (slot 2)"),
    ("cooper_head_bust_v2_black.stl",      "Head charm — black body + keyring loop (slot 1)"),
    ("cooper_head_bust_v2_white_eyes.stl", "Head charm — white eye inserts (slot 2)"),
]

rows = []
for name, role in FILES:
    p = os.path.join(STL, name)
    raw = open(p, "rb").read()
    n_tri = int.from_bytes(raw[80:84], "little")
    assert len(raw) == 84 + 50 * n_tri, f"{name}: binary STL layout bad"
    m = trimesh.load(p, force="mesh")
    assert m.is_watertight, f"{name}: not watertight"
    assert m.volume > 0, f"{name}: empty volume"
    ext = [round(float(x), 2) for x in m.extents]
    rows.append({
        "file": name,
        "role": role,
        "bytes": len(raw),
        "triangles": n_tri,
        "extent_x_mm": ext[0],
        "extent_y_mm": ext[1],
        "extent_z_mm": ext[2],
        "z_min_mm": round(float(m.bounds[0][2]), 1),
        "z_max_mm": round(float(m.bounds[1][2]), 1),
        "solid_volume_cm3": round(float(m.volume) / 1000, 2),
        "watertight": "yes",
        "sha256": hashlib.sha256(raw).hexdigest(),
    })

with open(os.path.join(STL, "PRINT-MANIFEST.csv"), "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
    w.writeheader()
    w.writerows(rows)

for r in rows:
    print(f"{r['file']:38s} tris={r['triangles']:6d} "
          f"ext=({r['extent_x_mm']},{r['extent_y_mm']},{r['extent_z_mm']}) "
          f"z={r['z_min_mm']}..{r['z_max_mm']} solid={r['solid_volume_cm3']}cm3")
print("PRINT-MANIFEST.csv written; all 5 STLs watertight and binary-valid.")
