#!/usr/bin/env python3
"""
cooper_lithophane.py — photo -> print-ready binary STL lithophane.
Pleading Sanity / P.S Studio · 17 Nov 2026 · zero dependencies beyond Pillow + numpy.
White/translucent filament works best (Flashforge Rapid PLA White, slot 3).
Print: 0.12-0.2mm layers, 100% infill, no supports, stand vertical or in a slot.

Usage:
  python3 cooper_lithophane.py <photo.jpg> [--width 60] [--res 0.25] [--out cooper.stl]
  --width  : panel width in mm (height auto-scales)
  --res    : mm per pixel (detail vs print time; 0.25 default, 0.18 high detail)
"""
import sys, os, struct, argparse
import numpy as np
from PIL import Image

def build_heightfield(img_path, width_mm, res_mm, base_mm=1.0, thick_mm=3.0, border_mm=2.5):
    img = Image.open(img_path).convert('L')
    W = max(20, int(round(width_mm / res_mm)))
    H = max(20, int(round(W * img.height / img.width)))
    img = img.resize((W, H), Image.LANCZOS)
    a = np.asarray(img, dtype=np.float32) / 255.0
    # dark pixels -> thicker (taller) so light shines through thin areas
    t = 1.0 - a
    z = base_mm + t * thick_mm
    # rigid full-height border frame
    bp = max(2, int(round(border_mm / res_mm)))
    z[:bp, :] = base_mm + thick_mm
    z[-bp:, :] = base_mm + thick_mm
    z[:, :bp] = base_mm + thick_mm
    z[:, -bp:] = base_mm + thick_mm
    return z, res_mm

def write_binary_stl(path, z, res):
    H, W = z.shape
    tris = []
    def tri(p1, p2, p3):
        # normal via cross product
        u = (p2[0]-p1[0], p2[1]-p1[1], p2[2]-p1[2])
        v = (p3[0]-p1[0], p3[1]-p1[1], p3[2]-p1[2])
        n = (u[1]*v[2]-u[2]*v[1], u[2]*v[0]-u[0]*v[2], u[0]*v[1]-u[1]*v[0])
        nl = (n[0]**2+n[1]**2+n[2]**2)**0.5 or 1.0
        tris.append(((n[0]/nl, n[1]/nl, n[2]/nl), p1, p2, p3))
    # top surface (i = x column, j = y row)
    for j in range(H-1):
        for i in range(W-1):
            x0, x1 = i*res, (i+1)*res
            y0, y1 = j*res, (j+1)*res
            p00 = (x0, y0, z[j, i]);     p10 = (x1, y0, z[j, i+1])
            p01 = (x0, y1, z[j+1, i]);   p11 = (x1, y1, z[j+1, i+1])
            tri(p00, p01, p11); tri(p00, p11, p10)
    # bottom surface (z=0), reversed winding
    for j in range(H-1):
        for i in range(W-1):
            x0, x1 = i*res, (i+1)*res
            y0, y1 = j*res, (j+1)*res
            p00 = (x0, y0, 0.0); p10 = (x1, y0, 0.0); p01 = (x0, y1, 0.0); p11 = (x1, y1, 0.0)
            tri(p00, p11, p01); tri(p00, p10, p11)
    # side walls: four edges, top z=height, bottom z=0
    def wall(p0, p1, z0, z1):
        tri((p0[0],p0[1],0.0), (p1[0],p1[1],0.0), (p1[0],p1[1],z1))
        tri((p0[0],p0[1],0.0), (p1[0],p1[1],z1), (p0[0],p0[1],z0))
    for i in range(W-1):  # front edge (j=0)
        wall((i*res,0,z[0,i]), ((i+1)*res,0,z[0,i+1]), z[0,i], z[0,i+1])
    for i in range(W-1):  # back edge (j=H-1)
        wall(((i+1)*res,(H-1)*res,z[H-1,i+1]), (i*res,(H-1)*res,z[H-1,i]), z[H-1,i+1], z[H-1,i])
    for j in range(H-1):  # left edge (i=0)
        wall((0,(j+1)*res,z[j+1,0]), (0,j*res,z[j,0]), z[j+1,0], z[j,0])
    for j in range(H-1):  # right edge (i=W-1)
        wall(((W-1)*res,j*res,z[j,W-1]), ((W-1)*res,(j+1)*res,z[j+1,W-1]), z[j,W-1], z[j+1,W-1])
    with open(path, 'wb') as f:
        f.write(b'\x00'*80)
        f.write(struct.pack('<I', len(tris)))
        for normal, a, b, c in tris:
            f.write(struct.pack('<3f9fH', normal[0], normal[1], normal[2],
                                a[0],a[1],a[2], b[0],b[1],b[2], c[0],c[1],c[2], 0))
    return len(tris)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('image')
    ap.add_argument('--width', type=float, default=60.0)
    ap.add_argument('--res', type=float, default=0.25)
    ap.add_argument('--out', default=None)
    args = ap.parse_args()
    out = args.out or os.path.splitext(os.path.basename(args.image))[0] + '_lithophane.stl'
    z, res = build_heightfield(args.image, args.width, args.res)
    n = write_binary_stl(out, z, res)
    H, W = z.shape
    print(f"OK: {out}  panel={W*res:.1f}x{H*res:.1f}mm  pixels={W}x{H}  triangles={n}")
    print("Print in WHITE filament (slot 3), 100% infill, 0.12-0.2mm, no supports.")

if __name__ == '__main__':
    main()
