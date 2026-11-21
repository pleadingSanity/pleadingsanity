#!/usr/bin/env python3
"""
P.S Studio / Pleading Sanity — AD5X Print-Ready Set Builder
Builds watertight binary STLs from trimesh primitives + manifold booleans.
No OpenSCAD required. All units mm. Designed for Flashforge AD5X, 0.20mm layer, no supports.
Models: cooper_sleeping_figurine, cooper_head_keychain, bruceybonus_keychain,
        ps_tracksuit_figure_teethmask (+ teeth_grill_insert), ford_bumper_clip_blank,
        rear_light_cover_trim, fit_check_calibration.
Brand: black (SUNLU PLA+) / white (Flashforge Rapid PLA) two-tone via IFS or layer swap.
"""
import os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import trimesh
from trimesh.creation import cylinder, box, icosphere, torus
from trimesh import transformations as tf

OUT = os.path.join(os.path.dirname(__file__), "..", "stl")
os.makedirs(OUT, exist_ok=True)
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# ---------- helpers ----------
def union_all(meshes, engine="manifold"):
    meshes = [m for m in meshes if m is not None and len(m.faces) > 0]
    if len(meshes) == 1:
        return meshes[0]
    try:
        return trimesh.boolean.union(meshes, engine=engine)
    except Exception as e:
        print(f"  [warn] manifold union failed ({e}); fallback concatenate+repair")
        c = trimesh.util.concatenate(meshes)
        c.merge_vertices()
        c.update_faces(c.unique_faces())
        trimesh.repair.fix_normals(c)
        trimesh.repair.fill_holes(c)
        return c

def diff_all(base, tools, engine="manifold"):
    try:
        return trimesh.boolean.difference([base] + tools, engine=engine)
    except Exception as e:
        print(f"  [warn] manifold diff failed ({e}); fallback base only")
        return base

def ellipsoid(rx, ry, rz, subdiv=3):
    m = icosphere(subdivisions=subdiv)
    m.apply_scale((rx, ry, rz))
    return m

def cyl_between(p1, p2, r, sections=24):
    p1 = np.asarray(p1, float); p2 = np.asarray(p2, float)
    h = float(np.linalg.norm(p2 - p1))
    m = cylinder(radius=r, height=h, sections=sections)
    mid = (p1 + p2) / 2.0
    direction = (p2 - p1) / (h + 1e-9)
    # align cylinder +Z to direction
    z = np.array([0, 0, 1.0])
    axis = np.cross(z, direction)
    ang = np.arccos(np.clip(np.dot(z, direction), -1, 1))
    if np.linalg.norm(axis) > 1e-6:
        axis = axis / np.linalg.norm(axis)
        m.apply_transform(tf.rotation_matrix(ang, axis))
    m.apply_translation(mid)
    return m

def heightmap_mesh(img_pil, width_mm, base_mm, raise_mm, max_res=0.35):
    """Watertight mesh: flat base at z=0, top raised by image intensity."""
    g = np.asarray(img_pil.convert("L"), dtype=float) / 255.0  # 0..1, white=raised
    ny, nx = g.shape
    px = width_mm / nx
    # downsample to target resolution
    step = max(1, int(round(max_res / px)))
    g = g[::step, ::step]
    ny, nx = g.shape
    height_mm = width_mm * ny / nx
    xs = np.linspace(0, width_mm, nx)
    ys = np.linspace(0, height_mm, ny)
    X, Y = np.meshgrid(xs, ys)
    Z = base_mm + raise_mm * g
    verts = []
    # top grid
    top_idx = np.zeros((ny, nx), dtype=int)
    for j in range(ny):
        for i in range(nx):
            top_idx[j, i] = len(verts)
            verts.append([X[j, i], Y[j, i], Z[j, i]])
    # bottom grid (flat)
    bot_idx = np.zeros((ny, nx), dtype=int)
    for j in range(ny):
        for i in range(nx):
            bot_idx[j, i] = len(verts)
            verts.append([X[j, i], Y[j, i], 0.0])
    faces = []
    for j in range(ny - 1):
        for i in range(nx - 1):
            a, b, c, d = top_idx[j, i], top_idx[j, i+1], top_idx[j+1, i+1], top_idx[j+1, i]
            faces.append([a, b, c]); faces.append([a, c, d])
            a2, b2, c2, d2 = bot_idx[j, i], bot_idx[j, i+1], bot_idx[j+1, i+1], bot_idx[j+1, i]
            faces.append([a2, c2, b2]); faces.append([a2, d2, c2])
    # sides
    for i in range(nx - 1):
        t1, t2 = top_idx[0, i], top_idx[0, i+1]; b1, b2 = bot_idx[0, i], bot_idx[0, i+1]
        faces.append([t1, b1, t2]); faces.append([t2, b1, b2])
        t1, t2 = top_idx[ny-1, i], top_idx[ny-1, i+1]; b1, b2 = bot_idx[ny-1, i], bot_idx[ny-1, i+1]
        faces.append([t1, t2, b1]); faces.append([t2, b2, b1])
    for j in range(ny - 1):
        t1, t2 = top_idx[j, 0], top_idx[j+1, 0]; b1, b2 = bot_idx[j, 0], bot_idx[j+1, 0]
        faces.append([t1, t2, b1]); faces.append([t2, b2, b1])
        t1, t2 = top_idx[j, nx-1], top_idx[j+1, nx-1]; b1, b2 = bot_idx[j, nx-1], bot_idx[j+1, nx-1]
        faces.append([t1, b1, t2]); faces.append([t2, b1, b2])
    m = trimesh.Trimesh(vertices=np.array(verts), faces=np.array(faces), process=True)
    trimesh.repair.fix_normals(m)
    return m

def text_plate(text, width_mm, base_mm, raise_mm, font_size_px=90, img_w=512):
    img = Image.new("L", (img_w, int(img_w * 0.4)), 0)
    d = ImageDraw.Draw(img)
    try:
        f = ImageFont.truetype(FONT_BOLD, font_size_px)
    except Exception:
        f = ImageFont.load_default()
    bbox = d.textbbox((0, 0), text, font=f)
    tw, th = bbox[2]-bbox[0], bbox[3]-bbox[1]
    d.text(((img_w - tw)/2 - bbox[0], (img.height - th)/2 - bbox[1]), text, fill=255, font=f)
    return heightmap_mesh(img, width_mm, base_mm, raise_mm)

def finalize(m, name):
    m.merge_vertices()
    m.update_faces(m.unique_faces())
    trimesh.repair.fix_normals(m)
    trimesh.repair.fill_holes(m)
    if not m.is_watertight:
        print(f"  [warn] {name}: NOT watertight, attempting repair")
        m.update_faces(m.unique_faces())
        m.remove_unreferenced_vertices()
        trimesh.repair.fill_holes(m)
    path = os.path.join(OUT, name + ".stl")
    m.export(path)
    b = m.bounds
    print(f"  OK {name:38s} tris={len(m.faces):6d} watertight={m.is_watertight} "
          f"size=({b[1][0]-b[0][0]:.1f}x{b[1][1]-b[0][1]:.1f}x{b[1][2]-b[0][2]:.1f})mm "
          f"vol={m.volume/1000:.1f}cm3 -> {os.path.basename(path)}")
    return m

# ============================================================
# 1. COOPER — sleeping black pug figurine (lying down), white chest patch
# ============================================================
def build_cooper_figurine():
    parts = []
    # body (lying, length along +X, head front)
    body = ellipsoid(30, 17, 13, subdiv=3); body.apply_translation((0, 0, 13)); parts.append(body)
    # haunch at rear
    haunch = ellipsoid(12, 15, 11, subdiv=3); haunch.apply_translation((-22, 0, 12)); parts.append(haunch)
    # head
    head = ellipsoid(14, 13, 12.5, subdiv=3); head.apply_translation((34, 0, 20)); parts.append(head)
    # muzzle (flat pug face)
    muzzle = ellipsoid(7, 7, 5.5, subdiv=3); muzzle.apply_translation((45.5, 0, 17.5)); parts.append(muzzle)
    # nose
    nose = ellipsoid(2.6, 3, 2.2, subdiv=2); nose.apply_translation((51.5, 0, 19)); parts.append(nose)
    # floppy ears
    earL = ellipsoid(5.5, 3, 9, subdiv=2); earL.apply_translation((30, 12.5, 19)); earL.apply_transform(tf.rotation_matrix(0.3, [1,0,0])); parts.append(earL)
    earR = ellipsoid(5.5, 3, 9, subdiv=2); earR.apply_translation((30, -12.5, 19)); earR.apply_transform(tf.rotation_matrix(-0.3, [1,0,0])); parts.append(earR)
    # front legs stretched forward
    parts.append(cyl_between((18, 8, 9), (46, 8, 5), 4.2))
    parts.append(cyl_between((18, -8, 9), (46, -8, 5), 4.2))
    pawL = ellipsoid(5.5, 4.5, 3, subdiv=2); pawL.apply_translation((49, 8, 4.5)); parts.append(pawL)
    pawR = ellipsoid(5.5, 4.5, 3, subdiv=2); pawR.apply_translation((49, -8, 4.5)); parts.append(pawR)
    # back legs tucked
    blL = ellipsoid(8, 6.5, 7, subdiv=2); blL.apply_translation((-20, 13, 9)); parts.append(blL)
    blR = ellipsoid(8, 6.5, 7, subdiv=2); blR.apply_translation((-20, -13, 9)); parts.append(blR)
    # curled tail (torus)
    tail = torus(major_radius=4.5, minor_radius=2, major_sections=16, minor_sections=10)
    tail.apply_transform(tf.rotation_matrix(np.pi/2, [1,0,0])); tail.apply_translation((-31, 0, 14)); parts.append(tail)
    # white chest patch — RAISED 0.6mm plate (filament swap at layer or paint)
    patch = ellipsoid(7, 5, 0.7, subdiv=2); patch.apply_translation((38, 0, 7.2)); parts.append(patch)
    # closed-eye indentations (difference) — sleeping Cooper
    eyeL = ellipsoid(2.2, 1.2, 0.8, subdiv=2); eyeL.apply_translation((41, 5.5, 23.5))
    eyeR = ellipsoid(2.2, 1.2, 0.8, subdiv=2); eyeR.apply_translation((41, -5.5, 23.5))
    m = union_all(parts)
    m = diff_all(m, [eyeL, eyeR])
    # sit flat on bed: min z to 0
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "cooper_sleeping_figurine")

# ============================================================
# 2. COOPER — head keychain (relief bust, flat back, keyring loop)
# ============================================================
def build_cooper_keychain():
    parts = []
    # head sphere, then cut flat back (y >= 0 kept)
    head = ellipsoid(19, 19, 18, subdiv=3); head.apply_translation((0, 0, 20))
    # flat back: difference everything y > 8? We want relief thickness ~12, back flat at y=-6
    cut = box(extents=(60, 60, 60)); cut.apply_translation((0, -14, 20))  # remove y<-? box centered at y=-14 removes y < 16? Let's think: box extents 60 => from -44 to +16 in y. Removes y<16. No.
    # We want to keep front part, flat back at y = -6. Remove region y < -6. Box centered at y = (-6 - 30) = -36, extents y=60 => spans -66..-6. Removes y<=-6.
    cut = box(extents=(60, 60, 60)); cut.apply_translation((0, -36, 20))
    head = diff_all(head, [cut])
    parts.append(head)
    # muzzle
    muzzle = ellipsoid(7, 6, 5, subdiv=2); muzzle.apply_translation((0, 17, 16)); parts.append(muzzle)
    nose = ellipsoid(2.4, 2.6, 2, subdiv=2); nose.apply_translation((0, 22.5, 17.5)); parts.append(nose)
    # ears floppy
    earL = ellipsoid(5, 3, 9, subdiv=2); earL.apply_translation((-13, 2, 22)); earL.apply_transform(tf.rotation_matrix(0.25, [0,1,0])); parts.append(earL)
    earR = ellipsoid(5, 3, 9, subdiv=2); earR.apply_translation((13, 2, 22)); earR.apply_transform(tf.rotation_matrix(-0.25, [0,1,0])); parts.append(earR)
    # eyes (recessed dots)
    eyeL = ellipsoid(1.6, 1.2, 1.2, subdiv=2); eyeL.apply_translation((-6, 17.5, 23))
    eyeR = ellipsoid(1.6, 1.2, 1.2, subdiv=2); eyeR.apply_translation((6, 17.5, 23))
    # neck stub to loop
    neck = cylinder(radius=4, height=6, sections=16); neck.apply_translation((0, 0, 39)); parts.append(neck)
    # keyring loop
    loop = torus(major_radius=6.5, minor_radius=2.0, major_sections=20, minor_sections=12)
    loop.apply_translation((0, 0, 49)); parts.append(loop)
    m = union_all(parts)
    m = diff_all(m, [eyeL, eyeR])
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "cooper_head_keychain")

# ============================================================
# 3. BRUCEYBONUS BARGAIN TOYS — keychain badge (black/white two-tone face)
# ============================================================
def build_brucey_keychain():
    # base disc
    base = cylinder(radius=25, height=3, sections=48)
    base.apply_translation((0, 0, 1.5))
    # raised outer ring
    ring = cylinder(radius=25, height=1.6, sections=48)
    ringhole = cylinder(radius=21.5, height=3, sections=48)
    ring = diff_all(ring, [ringhole]); ring.apply_translation((0, 0, 3.8))
    # face artwork heightmap: white = raised (cat face + bao + text)
    S = 480
    img = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(img)
    try:
        f_big = ImageFont.truetype(FONT_BOLD, 56)
        f_med = ImageFont.truetype(FONT_BOLD, 38)
        f_sm = ImageFont.truetype(FONT_BOLD, 26)
    except Exception:
        f_big = f_med = f_sm = ImageFont.load_default()
    # cat face center
    cx, cy = S//2, int(S*0.52)
    d.ellipse([cx-70, cy-65, cx+70, cy+65], fill=255)          # head
    d.polygon([(cx-65, cy-45), (cx-95, cy-110), (cx-25, cy-80)], fill=255)  # L ear
    d.polygon([(cx+65, cy-45), (cx+95, cy-110), (cx+25, cy-80)], fill=255)  # R ear
    d.ellipse([cx-38, cy-20, cx-14, cy+4], fill=0)             # eyes (recessed = black)
    d.ellipse([cx+14, cy-20, cx+38, cy+4], fill=0)
    d.ellipse([cx-8, cy+18, cx+8, cy+30], fill=0)              # nose
    # bao bun lower-left
    bx, by = int(S*0.26), int(S*0.72)
    d.ellipse([bx-45, by-30, bx+45, by+35], fill=255)
    d.arc([bx-40, by-40, bx+40, by+10], 0, 180, fill=0, width=4)
    # text
    for txt, y, f in [("BRUCEYBONUS", int(S*0.13), f_big), ("BARGAIN TOYS", int(S*0.24), f_med), ("SAVE %", int(S*0.88), f_sm)]:
        bb = d.textbbox((0,0), txt, font=f); tw = bb[2]-bb[0]
        d.text(((S-tw)/2 - bb[0], y - bb[1]), txt, fill=255, font=f)
    face = heightmap_mesh(img, 34.0, base_mm=0.4, raise_mm=1.0, max_res=0.3)
    face.apply_translation((-17.0, -17.0, 3.0))  # square face fully inside 50mm disc
    # loop
    loop = torus(major_radius=6.5, minor_radius=2.0, major_sections=20, minor_sections=12)
    loop.apply_translation((0, 31, 3))
    m = union_all([base, ring, face, loop])
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "bruceybonus_keychain")

# ============================================================
# 4. P.S TRACKSUIT BALACLAVA MOC FIGURE — with teeth-mask recess + insert
# ============================================================
def build_ps_figure():
    parts = []
    # base
    base = cylinder(radius=28, height=5, sections=48); base.apply_translation((0,0,2.5)); parts.append(base)
    # legs
    parts.append(cyl_between((-7, 0, 5), (-7, 0, 34), 4.6))
    parts.append(cyl_between((7, 0, 5), (7, 0, 34), 4.6))
    # feet/trainers
    footL = box(extents=(10, 16, 6)); footL.apply_translation((-7, 3, 8)); parts.append(footL)
    footR = box(extents=(10, 16, 6)); footR.apply_translation((7, 3, 8)); parts.append(footR)
    # torso hoodie
    torso = box(extents=(26, 16, 30)); torso.apply_translation((0, 0, 49)); parts.append(torso)
    shoulderL = ellipsoid(7, 7, 6, subdiv=2); shoulderL.apply_translation((-13, 0, 62)); parts.append(shoulderL)
    shoulderR = ellipsoid(7, 7, 6, subdiv=2); shoulderR.apply_translation((13, 0, 62)); parts.append(shoulderR)
    # left arm down, hand by hip
    parts.append(cyl_between((-13, 0, 60), (-15, -1, 38), 4))
    handL = ellipsoid(4.2, 4.2, 3.5, subdiv=2); handL.apply_translation((-15, -1, 35)); parts.append(handL)
    # right arm bent, hand IN pocket
    parts.append(cyl_between((13, 0, 60), (14, 4, 49), 4))
    parts.append(cyl_between((14, 4, 49), (10, 7, 41), 3.6))
    handR = ellipsoid(4, 4, 3.5, subdiv=2); handR.apply_translation((9, 7.5, 39.5)); parts.append(handR)
    # kangaroo pocket (raised front)
    pocket = box(extents=(17, 1.6, 10)); pocket.apply_translation((0, 8.8, 42)); parts.append(pocket)
    # zipper line
    zip_ = box(extents=(1.2, 1.4, 26)); zip_.apply_translation((0, 8.4, 49)); parts.append(zip_)
    # drawstrings
    parts.append(cyl_between((-3, 7, 63.5), (-3.5, 6, 70), 0.9))
    parts.append(cyl_between((3, 7, 63.5), (3.5, 6, 70), 0.9))
    # neck
    neck = cylinder(radius=5, height=5, sections=20); neck.apply_translation((0,0,66)); parts.append(neck)
    # hood (back/top of head) — half sphere
    hood = ellipsoid(13, 11, 10, subdiv=3); hood.apply_translation((0, -3, 76)); parts.append(hood)
    # head (balaclava)
    head = ellipsoid(12, 12, 12, subdiv=3); head.apply_translation((0, 0, 78)); parts.append(head)
    # P.S chest logo plate (raised)
    ps = text_plate("P.S", width_mm=11, base_mm=0.4, raise_mm=0.8, font_size_px=70, img_w=256)
    ps.apply_translation((-5.5, 8.05, 52.5)); parts.append(ps)
    m = union_all(parts)
    # EYE SLIT recess (horizontal strip on face, front = +Y)
    eye_cut = box(extents=(17, 3, 3.5)); eye_cut.apply_translation((0, 11, 80.5))
    # TEETH MASK recess (lower face, 2mm deep) — insert prints in white
    teeth_recess = box(extents=(15, 2.2, 9)); teeth_recess.apply_translation((0, 11.2, 72.5))
    m = diff_all(m, [eye_cut, teeth_recess])
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "ps_tracksuit_figure_teethmask")

def build_teeth_insert():
    """White teeth-grill press-fit insert for the figure's lower-face recess."""
    parts = []
    plate = box(extents=(14.6, 1.9, 8.6)); plate.apply_translation((0, 0, 0)); parts.append(plate)
    # row of 8 teeth on front (+Y face)
    for i in range(8):
        x = -6.3 + i * 1.8
        tooth = box(extents=(1.5, 2.4, 3.2)); tooth.apply_translation((x, 1.6, 1.6)); parts.append(tooth)
    # two fang canines slightly taller at ends
    fangL = box(extents=(1.8, 2.6, 4.5)); fangL.apply_translation((-6.8, 1.7, 2.2)); parts.append(fangL)
    fangR = box(extents=(1.8, 2.6, 4.5)); fangR.apply_translation((6.8, 1.7, 2.2)); parts.append(fangR)
    m = union_all(parts)
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "teeth_grill_insert_white")

# ============================================================
# 5. FORD BUMPER CLIP-ON trim — generic, BLANK badge mount (no Ford logo)
# ============================================================
def build_ford_bumper_clip():
    parts = []
    bar = box(extents=(120, 22, 6)); bar.apply_translation((0, 0, 3)); parts.append(bar)
    # rounded corners via 4 cylinders
    for x in (-57, 57):
        c = cylinder(radius=11, height=6, sections=24); c.apply_translation((x, 0, 3)); parts.append(c)
    # blank oval badge recess on front face
    # clip tabs (L-shape spring) on back — two vertical plates + hook
    for x in (-35, 35):
        tab = box(extents=(10, 3, 22)); tab.apply_translation((x, -12.5, 11)); parts.append(tab)
        hook = box(extents=(10, 8, 3)); hook.apply_translation((x, -8, 21)); parts.append(hook)
    m = union_all(parts)
    oval = cylinder(radius=16, height=2, sections=32); oval.apply_scale((1.4, 1, 1)); oval.apply_translation((0, 11.2, 3))
    m = diff_all(m, [oval])
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "ford_bumper_clip_blank_badge")

# ============================================================
# 6. REAR LIGHT COVER trim — parametric frame, blank design face
# ============================================================
def build_rear_light_cover():
    parts = []
    outer = box(extents=(150, 55, 4)); outer.apply_translation((0,0,2)); parts.append(outer)
    # rounded corners
    for x in (-70,70):
        for y in (-22.5,22.5):
            c = cylinder(radius=5, height=4, sections=16); c.apply_translation((x,y,2)); parts.append(c)
    # inner cutout (light window)
    hole = box(extents=(128, 33, 6)); hole.apply_translation((0,0,2))
    # 3 horizontal ribs across window for new-design look
    for z in (1.5, 2.5, 3.5):
        rib = box(extents=(128, 4, 1.2)); rib.apply_translation((0, 0, z)); parts.append(rib)
    # clip tabs top/bottom
    tabT = box(extents=(20, 6, 12)); tabT.apply_translation((0, -30, 6)); parts.append(tabT)
    tabB = box(extents=(20, 6, 12)); tabB.apply_translation((0, 30, 6)); parts.append(tabB)
    m = union_all(parts)
    m = diff_all(m, [hole])
    m.apply_translation((0, 0, -m.bounds[0][2]))
    return finalize(m, "rear_light_cover_trim_parametric")

# ============================================================
# 7. FIT-CHECK calibration piece (print FIRST, measure before car parts)
# ============================================================
def build_calibration():
    parts = []
    cube = box(extents=(20,20,20)); cube.apply_translation((-15,0,10)); parts.append(cube)
    peg = cylinder(radius=4.5, height=10, sections=24); peg.apply_translation((15,0,5)); parts.append(peg)
    holeblock = box(extents=(20,20,10)); holeblock.apply_translation((15,0,15)); parts.append(holeblock)
    m = union_all(parts)
    hole = cylinder(radius=4.6, height=12, sections=24); hole.apply_translation((15,0,14))
    m = diff_all(m, [hole])
    m.apply_translation((0,0,-m.bounds[0][2]))
    return finalize(m, "fit_check_calibration_20mm")

# ---------- run ----------
if __name__ == "__main__":
    print("Building P.S Studio AD5X print-ready set...")
    build_cooper_figurine()
    build_cooper_keychain()
    build_brucey_keychain()
    build_ps_figure()
    build_teeth_insert()
    build_ford_bumper_clip()
    build_rear_light_cover()
    build_calibration()
    print("DONE. STLs in", OUT)
