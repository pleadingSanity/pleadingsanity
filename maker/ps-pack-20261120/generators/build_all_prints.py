#!/usr/bin/env python3
"""
build_all_prints.py — P.S Studio / Plastic Shane · Flashforge AD5X
Renders all first-print designs to watertight (or slicer-merged) binary STL.
Toolchain: trimesh + manifold3d (booleans) + PIL/OpenCV (text -> contours).
No OpenSCAD required. Run: python3 build_all_prints.py
Output: ./new-prints/*.stl + ./new-prints/*.svg (paper template)
"""
import os, struct, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2
import shapely.geometry as sg
from shapely import affinity as saff
import trimesh
from trimesh.creation import extrude_polygon, icosphere, cylinder, box as mkbox
from trimesh.transformations import rotation_matrix, translation_matrix, scale_matrix

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "new-prints")
os.makedirs(OUT, exist_ok=True)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
PX_PER_MM = 20  # text render resolution

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def union(meshes, label=""):
    """Boolean union via manifold; fall back to concatenate (slicer-merged)."""
    meshes = [m for m in meshes if m is not None and len(m.faces) > 0]
    if len(meshes) == 1:
        return meshes[0]
    try:
        return trimesh.boolean.union(meshes, engine="manifold")
    except Exception as e:
        print(f"  [warn] union fallback ({label}): {e}")
        return trimesh.util.concatenate(meshes)

def difference(a, b, label=""):
    try:
        return trimesh.boolean.difference([a, b], engine="manifold")
    except Exception as e:
        print(f"  [warn] difference fallback ({label}): {e} — kept base only")
        return a

def rounded_rect_poly(w, h, r):
    """Shapely rounded rectangle centered at origin."""
    r = min(r, w / 2 - 0.01, h / 2 - 0.01)
    pts = []
    corners = [(w/2-r, h/2-r, 0), (-w/2+r, h/2-r, 90),
               (-w/2+r, -h/2+r, 180), (w/2-r, -h/2+r, 270)]
    for cx, cy, a0 in corners:
        for t in range(17):
            a = math.radians(a0 + t * 90 / 16)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return sg.Polygon(pts)

def text_polygons(text, height_mm, max_width_mm=None):
    """Render text -> shapely MultiPolygon (letters with holes), centered at origin.
    Returns (multipolygon, actual_height_mm, actual_width_mm)."""
    px_h = int(round(height_mm * PX_PER_MM))
    font = ImageFont.truetype(FONT, px_h)
    # measure
    tmp = Image.new("L", (10, 10), 0)
    d = ImageDraw.Draw(tmp)
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad = px_h
    img = Image.new("L", (tw + 2 * pad, th + 2 * pad), 0)
    d = ImageDraw.Draw(img)
    d.text((pad - bbox[0], pad - bbox[1]), text, font=font, fill=255)
    a = np.array(img)
    # contours with hierarchy (holes)
    contours, hierarchy = cv2.findContours(a, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_TC89_KCOS)
    polys = []
    if hierarchy is not None:
        hierarchy = hierarchy[0]
        # outer contours: hierarchy[i][3] == -1
        for i, cnt in enumerate(contours):
            if hierarchy[i][3] != -1:
                continue
            if len(cnt) < 3:
                continue
            outer = [(p[0][0] / PX_PER_MM, p[0][1] / PX_PER_MM) for p in cnt]
            holes = []
            child = hierarchy[i][2]
            while child != -1:
                hcnt = contours[child]
                if len(hcnt) >= 3:
                    holes.append([(p[0][0] / PX_PER_MM, p[0][1] / PX_PER_MM) for p in hcnt])
                child = hierarchy[child][0]
            try:
                poly = sg.Polygon(outer, holes)
                if poly.is_valid and poly.area > 0.01:
                    polys.append(poly)
            except Exception:
                pass
    mp = sg.MultiPolygon(polys)
    # center at origin
    minx, miny, maxx, maxy = mp.bounds
    cx, cy = (minx + maxx) / 2, (miny + maxy) / 2
    mp = saff.translate(mp, -cx, -cy)
    w_mm, h_mm = maxx - minx, maxy - miny
    if max_width_mm and w_mm > max_width_mm:
        s = max_width_mm / w_mm
        mp = saff.scale(mp, s, s, origin=(0, 0))
        w_mm *= s; h_mm *= s
    return mp, h_mm, w_mm

def text_mesh(text, height_mm, depth_mm, max_width_mm=None):
    mp, h, w = text_polygons(text, height_mm, max_width_mm)
    parts = []
    for poly in mp.geoms:
        try:
            parts.append(extrude_polygon(poly, height=depth_mm))
        except Exception as e:
            print(f"  [warn] letter extrude skip: {e}")
    m = union(parts, label=f"text:{text}")
    return m, h, w

def save(mesh, name):
    p = os.path.join(OUT, name)
    mesh.export(p)
    wt = mesh.is_watertight
    print(f"  -> {name:42s} {len(mesh.faces):7d} tris  {mesh.volume:9.1f} mm³  watertight={wt}")
    return p

# ---------------------------------------------------------------------------
# 1. bruceybonusbargins keychain — BAR variant (primary) + TAG variant
# ---------------------------------------------------------------------------
def build_brucey():
    print("[1] bruceybonusbargins keychain")
    tag_t, hole_d = 3.0, 6.0
    # BAR: 90 x 22 capsule
    bar_w, bar_h, bar_r = 90, 22, 11
    outer = rounded_rect_poly(bar_w, bar_h, bar_r)
    hole = sg.Point(-bar_w / 2 + 14, 0).buffer(hole_d / 2)
    base_poly = outer.difference(hole)
    base = extrude_polygon(base_poly, height=tag_t)
    txt, h, w = text_mesh("bruceybonusbargins", height_mm=11, depth_mm=0.6, max_width_mm=78)
    txt.apply_translation((6, 0, tag_t))  # shift right a touch so hole doesn't overlap text
    m = union([base, txt], label="brucey-bar")
    save(m, "bruceybonusbargins_keychain_bar.stl")

    # TAG: dog-tag 45 x 60, text on two lines via two text meshes
    tag_w, tag_h, tag_r = 45, 60, 8
    outer2 = rounded_rect_poly(tag_w, tag_h, tag_r)
    hole2 = sg.Point(0, tag_h / 2 - 14).buffer(hole_d / 2)
    base2 = extrude_polygon(outer2.difference(hole2), height=tag_t)
    t1, _, _ = text_mesh("bruceybonus", height_mm=8, depth_mm=0.6, max_width_mm=40)
    t1.apply_translation((0, 6, tag_t))
    t2, _, _ = text_mesh("bargains", height_mm=8, depth_mm=0.6, max_width_mm=40)
    t2.apply_translation((0, -6, tag_t))
    m2 = union([base2, t1, t2], label="brucey-tag")
    save(m2, "bruceybonusbargins_keychain_tag.stl")

# ---------------------------------------------------------------------------
# 2. COOPER dog tag — name + paw print
# ---------------------------------------------------------------------------
def build_cooper_tag():
    print("[2] COOPER dog tag")
    tag_w, tag_h, tag_r, tag_t, hole_d = 45, 60, 8, 3.0, 6.0
    outer = rounded_rect_poly(tag_w, tag_h, tag_r)
    hole = sg.Point(0, tag_h / 2 - 14).buffer(hole_d / 2)
    base = extrude_polygon(outer.difference(hole), height=tag_t)
    txt, _, _ = text_mesh("COOPER", height_mm=13, depth_mm=0.6, max_width_mm=38)
    txt.apply_translation((0, -8, tag_t))
    # paw: main pad + 4 toes — extrude each circle, union
    paw_parts = [sg.Point(0, 0).buffer(4.0)]
    for dx, dy in [(-5, 5), (-1.7, 6.5), (1.7, 6.5), (5, 5)]:
        paw_parts.append(sg.Point(dx, dy).buffer(2.0))
    paw_meshes = [extrude_polygon(p, height=0.6) for p in paw_parts]
    paw = union(paw_meshes, label="paw")
    paw.apply_translation((0, 14, tag_t))
    # small heart-ish dot under name
    dot = extrude_polygon(sg.Point(0, -20).buffer(2.5), height=0.6)
    dot.apply_translation((0, 0, tag_t))
    m = union([base, txt, paw, dot], label="cooper-tag")
    save(m, "cooper_dog_tag.stl")

# ---------------------------------------------------------------------------
# 3. COOPER stylized pug/boxer figurine — two-colour (black + white) + combined
#    Replicates stylized_cooper_pug.scad, FIXED: legs reach base, integrated stand.
# ---------------------------------------------------------------------------
def sphere(r, x=0, y=0, z=0, sx=1, sy=1, sz=1, subdiv=3):
    m = icosphere(subdivisions=subdiv, radius=r)
    m.apply_transform(np.diag([sx, sy, sz, 1.0]))
    m.apply_translation((x, y, z))
    return m

def build_cooper_figurine():
    print("[3] COOPER figurine (black / white / combined)")
    S = 1.0
    black = []
    # body
    black.append(sphere(22 * S, sx=1, sy=1.35, sz=1))
    # head
    black.append(sphere(16 * S, y=26 * S, z=14 * S))
    # snout
    black.append(sphere(9 * S, y=38 * S, z=10 * S, sx=1, sy=1.2, sz=0.8))
    # ears (flopped)
    for sx_sign in (-1, 1):
        e = sphere(8 * S, sx=0.35, sy=1, sz=1.2)
        e.apply_transform(rotation_matrix(math.radians(sx_sign * 20), [0, 0, 1]))
        e.apply_transform(rotation_matrix(math.radians(40), [1, 0, 0]))
        e.apply_translation((sx_sign * 13 * S, 24 * S, 20 * S))
        black.append(e)
    # legs — FIXED: reach down to base level z=-24
    for sx_sign in (-1, 1):
        for sy_sign in (-1, 1):
            leg = cylinder(radius=5 * S, height=26 * S)
            leg.apply_translation((sx_sign * 12 * S, sy_sign * 16 * S, -24 * S + 13 * S))
            black.append(leg)
    # tail (curled torus)
    tail = trimesh.creation.torus(major_radius=5 * S, minor_radius=2.5 * S, minor_sections=16, major_sections=48)
    tail.apply_transform(rotation_matrix(math.radians(90), [1, 0, 0]))
    tail.apply_transform(rotation_matrix(math.radians(45), [0, 0, 1]))
    tail.apply_translation((0, -26 * S, 10 * S))
    black.append(tail)
    # eyes + nose
    for sx_sign in (-1, 1):
        black.append(sphere(2 * S, x=sx_sign * 6 * S, y=39 * S, z=18 * S, subdiv=2))
    black.append(sphere(2.5 * S, y=46 * S, z=11 * S, subdiv=2))
    # integrated stand base (so first print succeeds and dog stands)
    base_disc = cylinder(radius=26 * S, height=3.0)
    base_disc.apply_translation((0, 0, -25.5))
    black.append(base_disc)

    white = []
    # chest blaze
    white.append(sphere(14 * S, y=22 * S, z=-2 * S, sx=0.55, sy=0.25, sz=0.7))
    # muzzle blaze
    white.append(sphere(7 * S, y=41 * S, z=14 * S, sx=0.4, sy=0.6, sz=0.5))
    # paw tips (front paws)
    for sx_sign in (-1, 1):
        tip = cylinder(radius=5.2 * S, height=4 * S)
        tip.apply_translation((sx_sign * 12 * S, 16 * S, -24 + 2))
        white.append(tip)

    bm = union(black, label="cooper-black")
    wm = union(white, label="cooper-white")
    # lift so lowest point is z=0 (base disc bottom is at -27)
    lift = -bm.bounds[0][2]
    bm.apply_translation((0, 0, lift))
    wm.apply_translation((0, 0, lift))
    save(bm, "cooper_figurine_black.stl")
    save(wm, "cooper_figurine_white.stl")
    combined = union([bm, wm], label="cooper-combined")
    save(combined, "cooper_figurine_combined_singlecolour.stl")

# ---------------------------------------------------------------------------
# 4. Ford-style clip-on bumper trim — generic plate + blank oval recess + C-clips.
#    NO Ford logo (trademark). PETG/ASA only. Measure slat -> edit SLOT_GAP.
# ---------------------------------------------------------------------------
def build_ford_clipon():
    print("[4] Ford-style clip-on bumper trim")
    face_w, face_h, face_t = 110, 55, 5.0
    corner_r = 8
    SLOT_GAP = 5.5   # = bumper slat thickness + 0.5 clearance. MEASURE & EDIT.
    CLIP_DEPTH = 8.0  # how far clip reaches back from plate
    STRAP = 3.0       # front strap thickness (bonded to plate) — must be >=3mm
    BADGE_DEPTH = 2.5
    # plate: z 0..5. FRONT (badge face) = z=0 (down on bed). BACK (clips) = z=+5 (up).
    plate_poly = rounded_rect_poly(face_w, face_h, corner_r)
    plate = extrude_polygon(plate_poly, height=face_t)
    # blank oval badge recess — opens at FRONT face (z=0), depth BADGE_DEPTH
    oval = cylinder(radius=17.5, height=BADGE_DEPTH + 0.4, sections=64)  # h=35
    oval.apply_transform(np.diag([90 / 35, 1.0, 1.0, 1.0]))  # widen to 90
    oval.apply_translation((0, 0, BADGE_DEPTH / 2 - 0.2))    # spans -0.2 .. BADGE_DEPTH
    plate = difference(plate, oval, label="oval-recess")
    # C-clips (2): box on back (z=face_t .. face_t+CLIP_DEPTH) minus slot.
    # Slot opens at back (z high), gap in Y = SLOT_GAP, front strap = STRAP.
    clips = []
    clip_w = 18  # X width
    clip_y = 30  # Y span of each clip
    n_clips = 2
    spacing = face_w / (n_clips + 1)
    slot_z0 = face_t + STRAP - 0.1          # slot starts just after the strap
    slot_z1 = face_t + CLIP_DEPTH + 3.0     # extends past clip back (open)
    slot_h = slot_z1 - slot_z0
    slot_cz = (slot_z0 + slot_z1) / 2
    for i in range(1, n_clips + 1):
        cx = -face_w / 2 + i * spacing
        cb = mkbox(extents=(clip_w, clip_y, CLIP_DEPTH))
        cb.apply_translation((cx, 0, face_t + CLIP_DEPTH / 2))
        slot = mkbox(extents=(clip_w + 4, SLOT_GAP, slot_h))
        slot.apply_translation((cx, 0, slot_cz))
        c = difference(cb, slot, label=f"clip{i}")
        clips.append(c)
    m = union([plate] + clips, label="ford-clipon")
    save(m, "ford_style_clip_on_bumper_trim.stl")

# ---------------------------------------------------------------------------
# 5. Rear-light bezel + custom insert + 1:1 paper template (SVG)
#    UK MOT: bezel SURROUNDS lens, never covers lit area. Measure -> edit.
# ---------------------------------------------------------------------------
def build_rear_light():
    print("[5] Rear-light bezel + custom insert + paper template")
    outer_w, outer_h, outer_r = 180, 70, 10
    inner_w, inner_h, inner_r = 150, 45, 6
    trim_t = 4.0
    panel_w = 40
    # lens opening shifted left to leave a solid panel strip on the right
    inner_cx = (outer_w - inner_w) / 2 - panel_w / 2 - 2
    outer = rounded_rect_poly(outer_w, outer_h, outer_r)
    inner = rounded_rect_poly(inner_w, inner_h, inner_r)
    inner = saff.translate(inner, inner_cx, 0)
    bezel_poly = outer.difference(inner)
    bezel = extrude_polygon(bezel_poly, height=trim_t)
    # shallow recess for custom insert on the right solid strip
    recess = mkbox(extents=(panel_w - 4, outer_h - 10, 2.0))
    recess.apply_translation((outer_w / 2 - panel_w / 2 - 2, 0, trim_t - 1.0 + 0.05))
    bezel = difference(bezel, recess, label="bezel-recess")
    save(bezel, "rear_light_bezel.stl")
    # custom insert (print in contrasting colour, glue into recess)
    insert_poly = rounded_rect_poly(panel_w - 4.4, outer_h - 10.4, 4)
    insert = extrude_polygon(insert_poly, height=1.5)
    save(insert, "rear_light_custom_insert_blank.stl")
    # insert with "P.S" embossed
    ps, _, _ = text_mesh("P.S", height_mm=14, depth_mm=0.6, max_width_mm=panel_w - 10)
    ps.apply_translation((0, 0, 1.5))
    insert_ps = union([insert, ps], label="insert-ps")
    save(insert_ps, "rear_light_custom_insert_PS.stl")
    # 1:1 paper template SVG (mm units) — print at 100%, hold to light, check fit
    svg_path = os.path.join(OUT, "rear_light_paper_template.svg")
    PX = 3.7795  # 1mm = 3.7795 px (96dpi)
    W, H = outer_w + 20, outer_h + 20
    ox, oy = 10, 10
    def rr(x, y, w, h, r, fill, stroke, sw=0.5):
        return (f'<rect x="{x*PX:.1f}" y="{y*PX:.1f}" width="{w*PX:.1f}" '
                f'height="{h*PX:.1f}" rx="{r*PX:.1f}" fill="{fill}" stroke="{stroke}" '
                f'stroke-width="{sw*PX:.1f}"/>')
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{W*PX:.0f}" height="{H*PX:.0f}" '
           f'viewBox="0 0 {W*PX:.0f} {H*PX:.0f}">',
           '<rect width="100%" height="100%" fill="white"/>',
           f'<text x="{ox*PX:.0f}" y="{(oy-4)*PX:.0f}" font-family="Arial" font-size="{3.5*PX:.0f}" fill="black">'
           f'Rear-light bezel template — PRINT AT 100% (no scale). Scale bar = 50mm.</text>',
           rr(ox, oy, outer_w, outer_h, outer_r, "none", "black", 0.6),
           rr(ox + inner_cx + outer_w/2 - inner_w/2, oy + (outer_h-inner_h)/2, inner_w, inner_h, inner_r, "none", "red", 0.5),
           # 50mm scale bar
           f'<line x1="{ox*PX:.0f}" y1="{(oy+outer_h+8)*PX:.0f}" x2="{(ox+50)*PX:.0f}" y2="{(oy+outer_h+8)*PX:.0f}" stroke="black" stroke-width="2"/>',
           f'<text x="{ox*PX:.0f}" y="{(oy+outer_h+12)*PX:.0f}" font-family="Arial" font-size="{3*PX:.0f}" fill="black">0 — 50 mm</text>',
           '</svg>']
    with open(svg_path, "w") as f:
        f.write("\n".join(svg))
    print(f"  -> rear_light_paper_template.svg")

# ---------------------------------------------------------------------------
if __name__ == "__main__":
    print(f"Output dir: {OUT}")
    build_brucey()
    build_cooper_tag()
    build_cooper_figurine()
    build_ford_clipon()
    build_rear_light()
    print("DONE.")
