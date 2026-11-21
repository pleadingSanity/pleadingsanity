#!/usr/bin/env python3
import os, glob
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import trimesh
import numpy as np

STL = os.path.join(os.path.dirname(__file__), "..", "stl")
PRE = os.path.join(os.path.dirname(__file__), "..", "preview")
os.makedirs(PRE, exist_ok=True)

for path in sorted(glob.glob(os.path.join(STL, "*.stl"))):
    name = os.path.splitext(os.path.basename(path))[0]
    m = trimesh.load(path, force="mesh")
    try:
        m = m.simplify_quadric_decimation(3500)
    except Exception:
        pass
    v = m.vertices - m.centroid
    f = m.faces
    fig = plt.figure(figsize=(4, 4), dpi=110)
    ax = fig.add_subplot(111, projection="3d")
    poly = Poly3DCollection(v[f], alpha=1.0, facecolor="#2a3348", edgecolor="none", linewidths=0)
    ax.add_collection3d(poly)
    s = np.abs(v).max()
    ax.set_xlim(-s, s); ax.set_ylim(-s, s); ax.set_zlim(-s, s)
    ax.set_box_aspect((1, 1, 1))
    ax.view_init(elev=18, azim=-55)
    ax.set_axis_off()
    ax.set_facecolor("#0b0f19"); fig.patch.set_facecolor("#0b0f19")
    ax.set_title(name, color="#00fff0", fontsize=8, pad=2)
    out = os.path.join(PRE, name + ".png")
    plt.savefig(out, bbox_inches="tight", facecolor="#0b0f19")
    plt.close(fig)
    print("preview", name)
print("done")
