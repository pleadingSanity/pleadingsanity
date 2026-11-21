#!/usr/bin/env python3
"""
P.S Studio — proper-balaclava mask + hood-back brain graphic for the
tracksuit figure (upgrade of ps_tracksuit_figure_teethmask).

Outputs (to the requested-pack folder):
  ps_tracksuit_figure_propermask.stl   black body: covered lower face, two eye slits
  ps_back_brain_insert_white.stl       white brain+drop relief for rear of hood
  ps_chest_ps_insert_white.stl        optional white P.S chest relief (IFS)

Front = +Y. Back = -Y. No OpenSCAD required. Units mm.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw
import trimesh
from trimesh import transformations as tf

SRC = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SRC)
from build_print_set import (union_all, diff_all, ellipsoid, cyl_between, box,
                             cylinder, torus, heightmap_mesh, text_plate)

PACK = "/home/user/.dola/agent_mode/workspace/.sessions/38416038144267537/agents/m_0cLa4lO4ao1/work/ps-requested-pack-20261120"
STL_OUT = os.path.join(PACK, "02-tracksuit-balaclava-figure", "stl")
RENDER_OUT = os.path.join(PACK, "02-tracksuit-balaclava-figure", "stl-check-renders")
os.makedirs(STL_OUT, exist_ok=True); os.makedirs(RENDER_OUT, exist_ok=True)


def build_body():
    parts = []
    # base
    base = cylinder(radius=28, height=5, sections=48); base.apply_translation((0, 0, 2.5)); parts.append(base)
    # legs + feet
    parts.append(cyl_between((-7, 0, 5), (-7, 0, 34), 4.6))
    parts.append(cyl_between((7, 0, 5), (7, 0, 34), 4.6))
    footL = box(extents=(10, 16, 6)); footL.apply_translation((-7, 3, 8)); parts.append(footL)
    footR = box(extents=(10, 16, 6)); footR.apply_translation((7, 3, 8)); parts.append(footR)
    # torso + shoulders
    torso = box(extents=(26, 16, 30)); torso.apply_translation((0, 0, 49)); parts.append(torso)
    shoulderL = ellipsoid(7, 7, 6, subdiv=2); shoulderL.apply_translation((-13, 0, 62)); parts.append(shoulderL)
    shoulderR = ellipsoid(7, 7, 6, subdiv=2); shoulderR.apply_translation((13, 0, 62)); parts.append(shoulderR)
    # arms: left down, right in pocket
    parts.append(cyl_between((-13, 0, 60), (-15, -1, 38), 4))
    handL = ellipsoid(4.2, 4.2, 3.5, subdiv=2); handL.apply_translation((-15, -1, 35)); parts.append(handL)
    parts.append(cyl_between((13, 0, 60), (14, 4, 49), 4))
    parts.append(cyl_between((14, 4, 49), (10, 7, 41), 3.6))
    handR = ellipsoid(4, 4, 3.5, subdiv=2); handR.apply_translation((9, 7.5, 39.5)); parts.append(handR)
    # pocket, zip, drawstrings
    pocket = box(extents=(17, 1.6, 10)); pocket.apply_translation((0, 8.8, 42)); parts.append(pocket)
    zip_ = box(extents=(1.2, 1.4, 26)); zip_.apply_translation((0, 8.4, 49)); parts.append(zip_)
    parts.append(cyl_between((-3, 7, 63.5), (-3.5, 6, 70), 0.9))
    parts.append(cyl_between((3, 7, 63.5), (3.5, 6, 70), 0.9))
    neck = cylinder(radius=5, height=5, sections=20); neck.apply_translation((0, 0, 66)); parts.append(neck)
    # hood shell (back of head)
    hood = ellipsoid(13, 11, 10, subdiv=3); hood.apply_translation((0, -3, 76)); parts.append(hood)
    # head (balaclava-covered)
    head = ellipsoid(12, 12, 12, subdiv=3); head.apply_translation((0, 0, 78)); parts.append(head)
    # PROPER MASK: hood opening rim torus around face
    rim = torus(major_radius=10.4, minor_radius=1.7, major_sections=48, minor_sections=12)
    rim.apply_transform(tf.rotation_matrix(np.pi / 2, [1, 0, 0]))  # ring in XZ plane, faces +Y
    rim.apply_translation((0, 8.6, 78.2)); parts.append(rim)
    # covered mouth panel (lower face), no teeth grille
    mouth = box(extents=(9.5, 1.7, 5.6)); mouth.apply_translation((0, 11.2, 73.8)); parts.append(mouth)
    nose = ellipsoid(1.9, 1.5, 1.6, subdiv=2); nose.apply_translation((0, 12.2, 77.6)); parts.append(nose)

    m = union_all(parts)
    # Note: eyes are separate white inlay slits (ps_eye_slits_white.stl) so the
    # black mask stays solid and IFS-friendly; no fragile boolean holes.
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return m


def build_eye_slits():
    """White two-eye slit inlays that sit proud on the black balaclava front."""
    parts = []
    for x in (-4.4, 4.4):
        slit = box(extents=(5.2, 2.4, 2.6)); slit.apply_translation((x, 12.4, 81.8))
        parts.append(slit)
        # rounded end caps to soften the corners
        for dx in (-2.4, 2.4):
            cap = cylinder(radius=1.3, height=2.4, sections=16)
            cap.apply_transform(tf.rotation_matrix(np.pi / 2, [1, 0, 0]))
            cap.apply_translation((x + dx, 12.4, 81.8))
            parts.append(cap)
    m = union_all(parts)
    return m  # keep world coordinates to align with the black body


def brain_image():
    img = Image.new("L", (256, 256), 0)
    d = ImageDraw.Draw(img)
    # two brain lobes (raised white)
    d.ellipse((40, 30, 130, 150), fill=255)
    d.ellipse((126, 30, 216, 150), fill=255)
    # lower taper to brain stem
    d.polygon([(72, 138), (184, 138), (152, 188), (104, 188)], fill=255)
    # groove folds (dark lines = lower relief inside lobes)
    for (x0, y0, x1, y1) in [(72, 62, 118, 86), (84, 112, 126, 96), (136, 96, 180, 110),
                             (140, 62, 186, 86), (102, 132, 154, 132), (60, 100, 96, 116)]:
        d.line((x0, y0, x1, y1), fill=70, width=8)
    # teardrop below brain
    d.ellipse((110, 198, 146, 228), fill=255)
    d.polygon([(128, 226), (114, 246), (142, 246)], fill=255)
    return img


def build_back_brain_insert():
    """White brain + teardrop relief mounted directly on the rear hood (-Y).
    Built in world coordinates: thin in Y, spread in X/Z. No square backing plate."""
    parts = []
    # two lobes (slightly flattened front-to-back)
    lobeL = ellipsoid(7.2, 2.1, 7.2, subdiv=3); lobeL.apply_translation((-5.0, -14.7, 78.5)); parts.append(lobeL)
    lobeR = ellipsoid(7.2, 2.1, 7.2, subdiv=3); lobeR.apply_translation((5.0, -14.7, 78.5)); parts.append(lobeR)
    # central stem joining lobes
    stem = ellipsoid(4.6, 1.9, 3.6, subdiv=3); stem.apply_translation((0, -14.6, 71.6)); parts.append(stem)
    # teardrop below: round head + tapered tip
    dropHead = ellipsoid(2.7, 1.7, 2.7, subdiv=3); dropHead.apply_translation((0, -14.7, 65.6)); parts.append(dropHead)
    tip = cylinder(radius=1.5, height=3.4, sections=20); tip.apply_translation((0, -14.7, 62.6)); parts.append(tip)
    # shallow grooves: thin recessed-looking ridges in darker print? keep raised folds:
    foldL = cyl_between((-7.0, -15.9, 81.5), (-3.0, -15.9, 76.0), 0.7, sections=12); parts.append(foldL)
    foldR = cyl_between((7.0, -15.9, 81.5), (3.0, -15.9, 76.0), 0.7, sections=12); parts.append(foldR)
    m = union_all(parts)
    return m


def build_chest_insert():
    m = text_plate("P.S", width_mm=11.0, base_mm=0.4, raise_mm=1.0, font_size_px=70, img_w=256)
    m.apply_translation(-m.centroid)
    # local +Z -> world +Y (chest front)
    m.apply_transform(tf.rotation_matrix(-np.pi / 2, [1, 0, 0]))
    m.apply_translation((0, 9.0, 52.8))
    return m


def export(mesh, name):
    mesh.merge_vertices()
    mesh.update_faces(mesh.unique_faces())
    trimesh.repair.fix_normals(mesh)
    trimesh.repair.fill_holes(mesh)
    assert mesh.is_watertight, f"{name}: not watertight"
    assert mesh.volume > 0, f"{name}: zero volume"
    path = os.path.join(STL_OUT, name + ".stl")
    mesh.export(path)
    b = mesh.bounds
    print(f"OK {name:38s} watertight={mesh.is_watertight} "
          f"size=({b[1][0]-b[0][0]:.1f}x{b[1][1]-b[0][1]:.1f}x{b[1][2]-b[0][2]:.1f})mm "
          f"vol={mesh.volume/1000:.1f}cm3 faces={len(mesh.faces)}")
    return mesh


def render(mesh, name, azim, elev=16):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    try:
        m = mesh.simplify_quadric_decimation(4500)
    except Exception:
        m = mesh
    v = m.vertices - m.centroid
    f = m.faces
    n = m.face_normals
    light = np.array([0.45, -0.65, 0.75]); light /= np.linalg.norm(light)
    shade = 0.35 + 0.65 * np.clip(n @ light, 0, 1)
    col = np.array([0.16, 0.16, 0.21])
    fc = [(col[0] * s, col[1] * s, col[2] * s) for s in shade]
    fig = plt.figure(figsize=(4.4, 3.8), dpi=130)
    ax = fig.add_subplot(111, projection="3d")
    ax.add_collection3d(Poly3DCollection(v[f], facecolors=fc, edgecolor="none"))
    s = np.abs(v).max() or 1
    ax.set_xlim(-s, s); ax.set_ylim(-s, s); ax.set_zlim(-s, s)
    ax.set_box_aspect((1, 1, 1)); ax.view_init(elev=elev, azim=azim); ax.set_axis_off()
    fig.patch.set_facecolor("white"); ax.set_facecolor("white")
    ax.set_title(name, fontsize=7, color="#222")
    out = os.path.join(RENDER_OUT, name + f"_az{azim}.png")
    fig.savefig(out, bbox_inches="tight", facecolor="white"); plt.close(fig)
    print("render", out)


def compound_render(meshes_colors, name, azim, elev=14):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    fig = plt.figure(figsize=(4.8, 4.2), dpi=130)
    ax = fig.add_subplot(111, projection="3d")
    light = np.array([0.45, -0.65, 0.75]); light /= np.linalg.norm(light)
    verts_all, faces_all, fc_all = [], [], []
    base_idx = 0
    for mesh, col in meshes_colors:
        try:
            m = mesh.simplify_quadric_decimation(4500)
        except Exception:
            m = mesh
        v = m.vertices
        n = m.face_normals
        shade = 0.62 + 0.38 * np.clip(n @ light, 0, 1)
        verts_all.append(v)
        faces_all.append(m.faces + base_idx)
        for s in shade:
            fc_all.append((col[0] * s, col[1] * s, col[2] * s))
        base_idx += len(v)
    V = np.vstack(verts_all); F = np.vstack(faces_all)
    V = V - V.mean(axis=0)  # centre the whole assembly once, keep world alignment
    ax.add_collection3d(Poly3DCollection(V[F], facecolors=fc_all, edgecolor="none"))
    s = np.abs(V).max() or 1
    ax.set_xlim(-s, s); ax.set_ylim(-s, s); ax.set_zlim(-s, s)
    ax.set_box_aspect((1, 1, 1)); ax.view_init(elev=elev, azim=azim); ax.set_axis_off()
    fig.patch.set_facecolor("white"); ax.set_facecolor("white")
    ax.set_title(name, fontsize=7, color="#222")
    out = os.path.join(RENDER_OUT, name + ".png")
    fig.savefig(out, bbox_inches="tight", facecolor="white"); plt.close(fig)
    print("render", out)


if __name__ == "__main__":
    body = export(build_body(), "ps_tracksuit_figure_propermask")
    eyes = export(build_eye_slits(), "ps_eye_slits_white")
    brain = export(build_back_brain_insert(), "ps_back_brain_insert_white")
    chest = export(build_chest_insert(), "ps_chest_ps_insert_white")

    render(body, "ps_tracksuit_figure_propermask", -58)   # front
    render(body, "ps_tracksuit_figure_propermask", 180)   # back
    render(eyes, "ps_eye_slits_white", -90)
    render(brain, "ps_back_brain_insert_white", -90)
    render(chest, "ps_chest_ps_insert_white", -90)
    light = (0.95, 0.92, 0.78)
    parts_col = [(body, (0.16, 0.17, 0.23)), (eyes, light), (brain, light), (chest, light)]
    for az, tag in [(180, "face"), (-90, "hood-back"), (0, "side-right"), (90, "side-left")]:
        compound_render(parts_col, f"ps_figure_compound_{tag}", az)
