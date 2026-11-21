#!/usr/bin/env python3
"""
Cooper v2 — sitting black-pug figurine + head keyring bust for P.S Studio / AD5X.

Two-colour (IFS) pack:
  BLACK slot 1 (SUNLU Premium PLA+ Black): body, head, ears, legs, tail, pupils, base
  WHITE slot 2 (Flashforge Rapid PLA White): chest blaze, eye whites

Geometry in millimetres, ground z=0, muzzle faces +Y. Primitive + manifold build
(no OpenSCAD / Blender in sandbox).
"""

import os
import json
import numpy as np
import trimesh
import trimesh.transformations as T
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_STL = os.path.normpath(os.path.join(HERE, "..", "stl"))
OUT_PNG = os.path.normpath(os.path.join(HERE, "..", "renders"))
os.makedirs(OUT_STL, exist_ok=True)
os.makedirs(OUT_PNG, exist_ok=True)

BLACK_RGB = (0.14, 0.14, 0.16)
WHITE_RGB = (0.94, 0.93, 0.87)


# ---------- helpers ----------

def ellipsoid(center, radii, euler=(0, 0, 0), subdiv=3):
    m = trimesh.creation.icosphere(subdivisions=subdiv, radius=1.0)
    m.apply_scale(radii)
    if any(euler):
        m.apply_transform(T.euler_matrix(*euler))
    m.apply_translation(center)
    return m


def cyl(center, radius_bottom, radius_top, height, sections=48, euler=(0, 0, 0)):
    m = trimesh.creation.cylinder(
        radius=radius_bottom, height=height, sections=sections, radius_top=radius_top)
    if any(euler):
        m.apply_transform(T.euler_matrix(*euler))
    m.apply_translation(center)
    return m


def cyl_between(p1, p2, radius, sections=32):
    p1, p2 = np.array(p1, float), np.array(p2, float)
    direction = p2 - p1
    length = np.linalg.norm(direction)
    m = trimesh.creation.cylinder(radius=radius, height=length, sections=sections)
    axis = np.cross([0, 0, 1], direction)
    if np.linalg.norm(axis) > 1e-9:
        m.apply_transform(trimesh.transformations.rotation_matrix(
            np.arccos(np.clip(direction[2] / length, -1, 1)), axis))
    m.apply_translation((p1 + p2) / 2)
    return m


def torus(center, major, minor, euler=(0, 0, 0), major_sections=48, minor_sections=10):
    m = trimesh.creation.torus(
        major_radius=major, minor_radius=minor,
        major_sections=major_sections, minor_sections=minor_sections)
    if any(euler):
        m.apply_transform(T.euler_matrix(*euler))
    m.apply_translation(center)
    return m


def union_all(meshes):
    meshes = [m for m in meshes if m is not None and len(m.faces) > 0 and m.volume > 0]
    try:
        return trimesh.boolean.union(meshes, engine="manifold")
    except Exception as e:
        print(f"  [fallback union] {e}")
        u = trimesh.util.concatenate(meshes)
        u.merge_vertices()
        u.update_faces(u.unique_faces())
        u.remove_unreferenced_vertices()
        u.fix_normals()
        u.fill_holes()
        return u


def finalize(mesh, path, label):
    assert mesh.is_watertight, f"{label}: not watertight"
    assert mesh.volume > 0, f"{label}: zero volume"
    ext = [round(float(x), 2) for x in mesh.extents]
    mesh.export(path)
    raw = open(path, "rb").read()
    n_tri = int.from_bytes(raw[80:84], "little")
    assert len(raw) == 84 + 50 * n_tri, f"{label}: binary STL size mismatch"
    print(f"  OK {os.path.basename(path):38s} tris={n_tri:6d} ext={ext} "
          f"vol={mesh.volume:9.0f} mm3")
    return {"file": os.path.basename(path), "tris": n_tri, "extents_mm": ext,
            "volume_mm3": round(float(mesh.volume), 1), "watertight": True}


# ---------- sitting figurine ----------

def build_sitting():
    b = []
    # display base
    b.append(cyl((0, 0, 1.5), 31, 31, 3, sections=64))
    # wide haunches / rear mass
    b.append(ellipsoid((0, -7, 20), (24, 19, 17)))
    b.append(ellipsoid((-16, -4, 15), (11, 14, 13)))
    b.append(ellipsoid((16, -4, 15), (11, 14, 13)))
    b.append(ellipsoid((-14, 10, 6), (9, 11, 5.5)))
    b.append(ellipsoid((14, 10, 6), (9, 11, 5.5)))
    # chest + belly
    b.append(ellipsoid((0, 4, 34), (20, 16, 24)))
    b.append(ellipsoid((0, -1, 25), (17, 14, 13)))
    # straight front legs + forward paws
    b.append(cyl((-11.5, 12, 20), 5.4, 6.0, 34))
    b.append(cyl((11.5, 12, 20), 5.4, 6.0, 34))
    b.append(ellipsoid((-11.5, 18.5, 6.5), (7.5, 10, 4.5)))
    b.append(ellipsoid((11.5, 18.5, 6.5), (7.5, 10, 4.5)))
    # head: skull, cheeks, blocky short muzzle, chin, nose
    b.append(ellipsoid((0, 6, 63), (20, 17.5, 18)))
    b.append(ellipsoid((-10, 15, 57.5), (8.5, 8, 7)))
    b.append(ellipsoid((10, 15, 57.5), (8.5, 8, 7)))
    b.append(ellipsoid((0, 22, 56), (12.5, 10.5, 8.5)))
    b.append(ellipsoid((0, 22, 51), (9, 7, 5)))
    b.append(ellipsoid((0, 31.5, 60), (4.8, 3.8, 3.5)))
    # brow pads + subtle forehead ridges
    b.append(ellipsoid((-8, 17, 71), (6, 4, 3)))
    b.append(ellipsoid((8, 17, 71), (6, 4, 3)))
    b.append(ellipsoid((-4.5, 21.3, 69.5), (1.6, 1.2, 6)))
    b.append(ellipsoid((4.5, 21.3, 69.5), (1.6, 1.2, 6)))
    b.append(ellipsoid((0, 21.8, 72.5), (1.4, 1.1, 5)))
    # folded rose ears, low and forward on the skull sides
    b.append(ellipsoid((-13, 5, 74.5), (6.5, 6.5, 2.6), euler=(-0.5, 0, 0.5)))
    b.append(ellipsoid((13, 5, 74.5), (6.5, 6.5, 2.6), euler=(-0.5, 0, -0.5)))
    # pupils (black, proud over white eye inserts)
    b.append(ellipsoid((-8.5, 23.6, 65.6), (1.8, 1.0, 1.8)))
    b.append(ellipsoid((8.5, 23.6, 65.6), (1.8, 1.0, 1.8)))
    # tight curled tail on the rear haunch
    b.append(torus((0, -22, 27), 5.5, 2.4, euler=(np.pi / 2, 0, 0.5)))

    black = union_all(b)

    blaze = union_all([
        ellipsoid((0, 20.8, 35), (10, 2.4, 13)),
        ellipsoid((0, 20.0, 24.5), (5.5, 2.1, 8)),
    ])
    eyes = union_all([
        ellipsoid((-8.5, 21.6, 65.5), (4.2, 2.2, 4.6)),
        ellipsoid((8.5, 21.6, 65.5), (4.2, 2.2, 4.6)),
    ])

    recs = [
        finalize(black, os.path.join(OUT_STL, "cooper_sitting_v2_black.stl"), "black"),
        finalize(blaze, os.path.join(OUT_STL, "cooper_sitting_v2_white_blaze.stl"), "blaze"),
        finalize(eyes, os.path.join(OUT_STL, "cooper_sitting_v2_white_eyes.stl"), "eyes"),
    ]
    return recs, black, blaze, eyes


# ---------- head bust / keyring ----------

def build_bust():
    b = []
    b.append(cyl((0, 0, 6.5), 11, 12, 13, sections=48))          # short neck stump
    b.append(ellipsoid((0, 0, 28), (19, 16.5, 17.5)))           # skull
    b.append(ellipsoid((-10, 8, 23), (8, 7.5, 6.5)))
    b.append(ellipsoid((10, 8, 23), (8, 7.5, 6.5)))
    b.append(ellipsoid((0, 16, 21.5), (11.5, 9.5, 8)))          # muzzle
    b.append(ellipsoid((0, 16, 17.5), (8.5, 6.5, 4.5)))         # chin
    b.append(ellipsoid((0, 25, 25), (4.5, 3.6, 3.3)))           # nose
    b.append(ellipsoid((-12.5, 1, 35.5), (6, 5.5, 2.6), euler=(-0.45, 0, 0.45)))
    b.append(ellipsoid((12.5, 1, 35.5), (6, 5.5, 2.6), euler=(-0.45, 0, -0.45)))
    b.append(ellipsoid((-8.5, 20.6, 29.6), (1.8, 1.0, 1.8)))
    b.append(ellipsoid((8.5, 20.6, 29.6), (1.8, 1.0, 1.8)))
    # keyring loop standing on top of the skull, tied in with a bridge
    b.append(torus((0, -1, 47), 5, 2.0, euler=(np.pi / 2, 0, 0)))
    b.append(cyl_between((0, -1, 41.5), (0, -1, 45), 2.6))

    black = union_all(b)
    eyes = union_all([
        ellipsoid((-8.5, 18.6, 29.5), (4.0, 2.2, 4.3)),
        ellipsoid((8.5, 18.6, 29.5), (4.0, 2.2, 4.3)),
    ])
    recs = [
        finalize(black, os.path.join(OUT_STL, "cooper_head_bust_v2_black.stl"), "bust"),
        finalize(eyes, os.path.join(OUT_STL, "cooper_head_bust_v2_white_eyes.stl"), "bust eyes"),
    ]
    return recs, black, eyes


# ---------- shaded previews ----------

def render(meshes_colors, path, title, elev=14, azim=-60):
    fig = plt.figure(figsize=(8, 8), dpi=130)
    ax = fig.add_subplot(111, projection="3d")
    light = np.array([0.45, -0.55, 0.70]); light /= np.linalg.norm(light)
    verts = []
    for mesh, rgb in meshes_colors:
        verts.append(mesh.vertices)
        floor = 0.55 if sum(rgb) > 2.0 else 0.32
        shade = floor + (1.0 - floor) * np.clip(mesh.face_normals @ light, 0, 1)
        cols = np.array(rgb)[None, :] * shade[:, None]
        ax.add_collection3d(Poly3DCollection(
            mesh.triangles, facecolors=cols, edgecolors="none"))
    v = np.vstack(verts)
    lo, hi = v.min(0), v.max(0)
    ctr = (lo + hi) / 2
    r = (hi - lo).max() / 2 * 1.06
    ax.set_xlim(ctr[0] - r, ctr[0] + r)
    ax.set_ylim(ctr[1] - r, ctr[1] + r)
    ax.set_zlim(lo[2] - 1, hi[2] + r * 0.25)
    ax.view_init(elev=elev, azim=azim)
    ax.set_axis_off()
    ax.set_title(title, fontsize=11)
    fig.tight_layout()
    fig.savefig(path, facecolor="white", bbox_inches="tight")
    plt.close(fig)
    print(f"  render {os.path.basename(path)}")


if __name__ == "__main__":
    print("== sitting figurine ==")
    s_rec, s_b, s_zb, s_ze = build_sitting()
    print("== head bust ==")
    b_rec, b_b, b_ze = build_bust()

    print("== previews ==")
    # muzzle faces +Y; azim=90 is the front view, azim=30 front-right, -30 front-left
    for az, name in [(90, "front"), (30, "threeq"), (-30, "iso"), (-90, "rear")]:
        render([(s_b, BLACK_RGB), (s_zb, WHITE_RGB), (s_ze, WHITE_RGB)],
               os.path.join(OUT_PNG, f"sitting_{name}.png"), f"sitting {name}",
               elev=14, azim=az)
    for az, name in [(90, "front"), (30, "threeq"), (-90, "rear")]:
        render([(b_b, BLACK_RGB), (b_ze, WHITE_RGB)],
               os.path.join(OUT_PNG, f"bust_{name}.png"), f"bust {name}",
               elev=12, azim=az)

    with open(os.path.join(OUT_STL, "VERIFICATION-REPORT.json"), "w") as f:
        json.dump({"sitting": s_rec, "bust": b_rec}, f, indent=2)
    print("done.")
