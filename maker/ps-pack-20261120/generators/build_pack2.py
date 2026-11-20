#!/usr/bin/env python3
"""
build_pack2.py — P.S Studio · Pack 2 (Nov 18 2026)
Renders: bruceybonus round keychain (2-colour), pug head + sitting keychains,
simplified articulated pug-dragon fidget (2-colour), P.S hoodie figurine (2-colour).
All watertight binary STL. No OpenSCAD needed. NOTE: built from text specs only —
no concept-render images were attached; send renders for refinement.
"""
import os, math
import numpy as np
import shapely.geometry as sg
from shapely import affinity as saff
import trimesh
from trimesh.creation import extrude_polygon, icosphere, cylinder, box as mkbox

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "new-prints")
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
PX_PER_MM = 20

def union(meshes, label=""):
    meshes = [m for m in meshes if m is not None and len(m.faces) > 0]
    if len(meshes) == 1: return meshes[0]
    try: return trimesh.boolean.union(meshes, engine="manifold")
    except Exception as e:
        print(f"  [warn] union fallback ({label}): {e}")
        return trimesh.util.concatenate(meshes)

def difference(a, b, label=""):
    try: return trimesh.boolean.difference([a, b], engine="manifold")
    except Exception as e:
        print(f"  [warn] difference fallback ({label}): {e}"); return a

def rounded_rect_poly(w, h, r):
    r = min(r, w/2-0.01, h/2-0.01)
    pts = []
    for cx, cy, a0 in [(w/2-r, h/2-r, 0), (-w/2+r, h/2-r, 90), (-w/2+r, -h/2+r, 180), (w/2-r, -h/2+r, 270)]:
        for t in range(17):
            a = math.radians(a0 + t*90/16)
            pts.append((cx + r*math.cos(a), cy + r*math.sin(a)))
    return sg.Polygon(pts)

def hull_of_circles(circles):
    """Replicate OpenSCAD hull() of circles -> convex hull of union."""
    polys = [sg.Point(x, y).buffer(r, resolution=32) for x, y, r in circles]
    u = polys[0]
    for p in polys[1:]: u = u.union(p)
    return u.convex_hull

def text_mesh(text, height_mm, depth_mm, max_width_mm=None):
    from PIL import Image, ImageDraw, ImageFont
    import cv2
    px_h = int(round(height_mm * PX_PER_MM))
    font = ImageFont.truetype(FONT, px_h)
    tmp = Image.new("L", (10, 10), 0); d = ImageDraw.Draw(tmp)
    bb = d.textbbox((0, 0), text, font=font)
    tw, th = bb[2]-bb[0], bb[3]-bb[1]; pad = px_h
    img = Image.new("L", (tw+2*pad, th+2*pad), 0)
    d = ImageDraw.Draw(img)
    d.text((pad-bb[0], pad-bb[1]), text, font=font, fill=255)
    a = np.array(img)
    contours, hierarchy = cv2.findContours(a, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
    polys = []
    if hierarchy is not None:
        hierarchy = hierarchy[0]
        for i, cnt in enumerate(contours):
            if hierarchy[i][3] != -1 or len(cnt) < 3: continue
            outer = [(p[0][0]/PX_PER_MM, p[0][1]/PX_PER_MM) for p in cnt]
            holes = []; child = hierarchy[i][2]
            while child != -1:
                hc = contours[child]
                if len(hc) >= 3: holes.append([(p[0][0]/PX_PER_MM, p[0][1]/PX_PER_MM) for p in hc])
                child = hierarchy[child][0]
            try:
                poly = sg.Polygon(outer, holes)
                if poly.is_valid and poly.area > 0.01: polys.append(poly)
            except Exception: pass
    mp = sg.MultiPolygon(polys)
    minx, miny, maxx, maxy = mp.bounds
    mp = saff.translate(mp, -(minx+maxx)/2, -(miny+maxy)/2)
    w_mm, h_mm = maxx-minx, maxy-miny
    if max_width_mm and w_mm > max_width_mm:
        s = max_width_mm/w_mm; mp = saff.scale(mp, s, s, origin=(0,0)); w_mm*=s; h_mm*=s
    parts = [extrude_polygon(p, height=depth_mm) for p in mp.geoms]
    return union(parts, label=f"text:{text}"), h_mm, w_mm

def sphere(r, x=0, y=0, z=0, sx=1, sy=1, sz=1, subdiv=3):
    m = icosphere(subdivisions=subdiv, radius=r)
    m.apply_transform(np.diag([sx, sy, sz, 1.0]))
    m.apply_translation((x, y, z)); return m

def cone(r, h, x=0, y=0, z=0, sections=24):
    # stylized blunt horn: tapered cylinder approximated by shaft + sphere tip
    shaft = cylinder(radius=r*0.75, height=h*0.7, sections=sections)
    tip = sphere(r, x=0, y=0, z=h*0.45, sx=0.55, sy=0.55, sz=0.75, subdiv=2)
    m = union([shaft, tip], label="cone")
    m.apply_translation((x, y, z - h*0.1))
    return m

def save(mesh, name):
    p = os.path.join(OUT, name)
    mesh.export(p)
    b = mesh.bounds
    print(f"  -> {name:44s} {len(mesh.faces):7d} tris  {b[1][0]-b[0][0]:5.1f}x{b[1][1]-b[0][1]:5.1f}x{b[1][2]-b[0][2]:5.1f}mm  wt={mesh.is_watertight}")
    return p

# =====================================================================
# 1. BRUCEYBONUS BARGAIN TOYS — round keychain (2-colour + single)
# =====================================================================
def build_brucey_round():
    print("[1] bruceybonus round keychain")
    disc_r, disc_t, hole_d, hole_y = 27.5, 3.4, 6.0, 21.5
    disc = cylinder(radius=disc_r, height=disc_t, sections=96)
    hole = cylinder(radius=hole_d/2, height=disc_t+2, sections=48)
    hole.apply_translation((0, hole_y, 0))
    black = difference(disc, hole, label="brucey-hole")
    # white text raised 0.8mm on top (z = disc_t/2 + 0.4)
    t1, _, _ = text_mesh("BRUCEYBONUS", 8, 0.8, max_width_mm=46)
    t1.apply_translation((0, 3.5, disc_t/2 + 0.4))
    t2, _, _ = text_mesh("BARGAIN TOYS", 5, 0.8, max_width_mm=46)
    t2.apply_translation((0, -5.5, disc_t/2 + 0.4))
    white = union([t1, t2], label="brucey-text")
    # recess pockets in black for flush inlay
    for t in (t1, t2):
        pocket = t.copy(); pocket.apply_translation((0, 0, -0.05))
        black = difference(black, pocket, label="brucey-recess")
    single = union([black, white], label="brucey-single")
    save(black, "bruceybonus_round_black.stl")
    save(white, "bruceybonus_round_white.stl")
    save(single, "bruceybonus_round_single.stl")

# =====================================================================
# 2. PUG HEAD + SITTING PUG silhouette keychains (from OpenSCAD circles)
# =====================================================================
def build_pug_keychains():
    print("[2] pug head + sitting keychains")
    base_t, hole_d = 3.4, 5.5
    # pug head 2D outline (hull groups)
    skull = hull_of_circles([(-12,6,9),(12,6,9),(-14,-7,8),(14,-7,8),(0,-13,9)])
    earL = hull_of_circles([(-18,12,5),(-23,-1,4.5),(-14,2,5)])
    earR = hull_of_circles([(18,12,5),(23,-1,4.5),(14,2,5)])
    head2d = skull.union(earL).union(earR)
    # keyring tab + hole
    tab = sg.Point(0, 18).buffer(5.5)
    hole = sg.Point(0, 18).buffer(hole_d/2)
    head_with_tab = head2d.union(tab).difference(hole)
    head_base = extrude_polygon(head_with_tab, height=base_t)
    # raised relief (eyes, muzzle) same colour
    relief = []
    for dx in (-9, 9): relief.append(extrude_polygon(sg.Point(dx, 2).buffer(2.6), height=0.6))
    muzzle = extrude_polygon(sg.Point(0, -6).buffer(7.5).difference(sg.Point(0, -6.5).buffer(6.0)), height=0.6)
    relief.append(muzzle)
    nose = extrude_polygon(sg.Point(0, -3.5).buffer(2.2), height=0.6)
    relief.append(nose)
    for r in relief: r.apply_translation((0, 0, base_t))
    head_full = union([head_base] + relief, label="pug-head")
    save(head_full, "pug_head_keychain.stl")

    # sitting pug 2D
    head_scaled = saff.scale(head2d, 0.68, 0.68, origin=(0,0))
    head_scaled = saff.translate(head_scaled, -2, 24)
    torso = hull_of_circles([(-2,14,10),(2,-6,12),(6,-20,10)])
    legL = hull_of_circles([(-7,4,3.5),(-8,-24,3.5)])
    legR = hull_of_circles([(1,2,3.5),(0,-25,3.5)])
    haunch = hull_of_circles([(9,-12,8),(11,-24,4.5)])
    tail = sg.Point(16, -12).buffer(5.5).difference(sg.Point(16, -12).buffer(2.2))
    sit2d = head_scaled.union(torso).union(legL).union(legR).union(haunch).union(tail)
    tab2 = sg.Point(-2, 38).buffer(5.5)
    hole2 = sg.Point(-2, 38).buffer(hole_d/2)
    sit_with_tab = sit2d.union(tab2).difference(hole2)
    sit_base = extrude_polygon(sit_with_tab, height=base_t)
    # white chest patch (hull of 3 circles)
    chest = hull_of_circles([(-4, 12, 3.8), (-6, 7, 3.2), (-3, 2, 2.0)])
    chest_mesh = extrude_polygon(chest, height=0.6)
    chest_mesh.apply_translation((0, 0, base_t - 0.2))
    # recess in black
    sit_black = difference(sit_base, chest_mesh, label="sit-chest-recess")
    save(sit_black, "pug_sitting_keychain_black.stl")
    save(chest_mesh, "pug_sitting_keychain_white.stl")

# =====================================================================
# 3. SIMPLIFIED articulated pug-dragon fidget (print-in-place, 2 hinges)
#    Black: body segments, head, wings, legs. White: horns, spine spikes,
#    tail segments, chest patch. Clearance 0.45mm at hinges.
# =====================================================================
def build_pug_dragon():
    print("[3] pug-dragon fidget (simplified, 3 segments + 2 hinges)")
    H = 14.0  # body height (Z up, prints flat? no — build upright? Print flat on bed: body in XY, height in Z)
    CL = 0.45  # clearance
    seg_w = 22.0  # along X (body length direction)
    seg_d = 18.0  # along Y (width)
    # Segment shapes: rounded boxes in XY, extruded H in Z. Joint at X boundaries.
    def seg(x_center, w, d):
        poly = rounded_rect_poly(w, d, 6)
        m = extrude_polygon(poly, height=H)
        m.apply_translation((x_center - w/2, -d/2, 0))  # poly centered -> shift
        return m
    # Actually extrude_polygon of centered poly -> centered at origin. Translate to x_center.
    def seg2(x_center, w, d):
        poly = rounded_rect_poly(w, d, 6)
        m = extrude_polygon(poly, height=H)
        m.apply_translation((x_center, 0, 0))
        return m
    # Joints at x = -10 (between head+body1 and body2) and x = +14.
    # Segment A (left) carries PIN at joint: cylinder r=2.3, height H.
    # Segment B (right) carries HOLE: cylinder r=2.3+CL = 2.75? OpenSCAD: pin d=4.6 (r=2.3), cutout d=9+2*CL? That's huge. Let me use pin r=3.0, hole r=3.0+CL=3.45. Knuckle: segment B has annular ring around hole.
    pin_r = 3.0
    hole_r = pin_r + CL
    black_parts = []
    white_parts = []
    # Head segment (leftmost) with pin at x=-8
    head = seg2(-22, 20, 20)
    # snout
    snout = mkbox(extents=(10, 12, H*0.7)); snout.apply_translation((-34, 0, H*0.35))
    black_parts += [head, snout]
    # pin at joint x=-8
    pin1 = cylinder(radius=pin_r, height=H, sections=32); pin1.apply_translation((-8, 0, 0))
    black_parts.append(pin1)
    # Body segment 1 (middle) — has HOLE at x=-8 (for pin1) and PIN at x=+10
    body1 = seg2(1, 22, 18)
    hole1 = cylinder(radius=hole_r, height=H+1, sections=32); hole1.apply_translation((-8, 0, -0.5))
    body1 = difference(body1, hole1, label="body1-hole")
    pin2 = cylinder(radius=pin_r, height=H, sections=32); pin2.apply_translation((10, 0, 0))
    black_parts += [body1, pin2]
    # Body segment 2 (tail base) — HOLE at x=10
    body2 = seg2(20, 16, 15)
    hole2 = cylinder(radius=hole_r, height=H+1, sections=32); hole2.apply_translation((10, 0, -0.5))
    body2 = difference(body2, hole2, label="body2-hole")
    black_parts.append(body2)
    # legs (4 small boxes under body)
    for lx, ly in [(-18, -11), (-18, 11), (6, -10), (6, 10)]:
        leg = mkbox(extents=(5, 4, 6)); leg.apply_translation((lx, ly, -3))
        black_parts.append(leg)
    # wings (flat teardrop — approximated as flattened spheres) on body1
    for sgn in (-1, 1):
        wing = sphere(8, x=1, y=sgn*13, z=H*0.6, sx=1.2, sy=0.3, sz=0.6, subdiv=2)
        black_parts.append(wing)
    # horns (white) on head
    for sgn in (-1, 1):
        horn = cone(2.5, 8, x=-26, y=sgn*5, z=H+2)
        white_parts.append(horn)
    # spine spikes (white) along body1+body2
    for sx in [-4, 2, 8, 15, 20]:
        sp = cone(1.8, 6, x=sx, y=0, z=H+1)
        white_parts.append(sp)
    # tail segments (white) — 2 small rounded boxes extending right
    tail1 = seg2(32, 10, 10); white_parts.append(tail1)
    tail2 = sphere(4, x=39, y=0, z=H/2, subdiv=2); white_parts.append(tail2)
    # chest patch (white) — flat on front of head
    chest = mkbox(extents=(2, 8, 6)); chest.apply_translation((-32, 0, H*0.4))
    white_parts.append(chest)
    black = trimesh.util.concatenate(black_parts)
    white = trimesh.util.concatenate(white_parts)
    # lift so min z = 0
    lift = -black.bounds[0][2]
    black.apply_translation((0, 0, lift)); white.apply_translation((0, 0, lift))
    save(black, "pug_dragon_black.stl")
    save(white, "pug_dragon_white.stl")

# =====================================================================
# 4. P.S HOODIE / BALACLAVA character figurine + base (2-colour)
# =====================================================================
def build_ps_character():
    print("[4] P.S hoodie character + base")
    black_parts = []
    white_parts = []
    # base disc
    base = cylinder(radius=30, height=4, sections=64)
    black_parts.append(base)
    # legs
    for sgn in (-1, 1):
        leg = cylinder(radius=5, height=16); leg.apply_translation((sgn*6, 0, 4+8))
        black_parts.append(leg)
    # torso (hoodie) — cylinder (taper approximated by single radius)
    torso = cylinder(radius=12, height=30, sections=32)
    torso.apply_translation((0, 0, 20+4))
    black_parts.append(torso)
    # arms
    for sgn in (-1, 1):
        arm = cylinder(radius=4, height=22)
        arm.apply_transform(np.diag([1,1,1,1.0]))
        arm.apply_translation((sgn*15, 0, 26))
        black_parts.append(arm)
    # head/hood — sphere
    head = sphere(12, x=0, y=0, z=42, subdiv=3)
    black_parts.append(head)
    # white: P.S on chest
    ps_chest, _, _ = text_mesh("P.S", 10, 0.8, max_width_mm=20)
    ps_chest.apply_translation((0, 10.5, 32))  # front (+Y) of torso
    white_parts.append(ps_chest)
    # white: P.S on base top
    ps_base, _, _ = text_mesh("P.S", 12, 0.8, max_width_mm=40)
    ps_base.apply_translation((0, 0, 4.4))
    white_parts.append(ps_base)
    # white: brain graphic on back of hood — cluster of small raised blobs
    for bx, by, bz in [(-4, -9, 44), (0, -10.5, 45), (4, -9, 44), (-2, -11, 47), (2, -11, 47)]:
        blob = sphere(2.2, x=bx, y=by, z=bz, subdiv=2)
        white_parts.append(blob)
    black = union(black_parts, label="char-black")
    white = union(white_parts, label="char-white")
    save(black, "ps_character_black.stl")
    save(white, "ps_character_white.stl")

if __name__ == "__main__":
    print(f"Output: {OUT}")
    build_brucey_round()
    build_pug_keychains()
    build_pug_dragon()
    build_ps_character()
    print("DONE.")
