#!/usr/bin/env python3
"""Draws the vintage-style plates for The Inside Files.
These are ORIGINAL illustrations made by the Foundation in the style of mid-century medical plates. They are not archival
photographs and are captioned as illustrations. Real archival images (Library of Congress, NLM, Wikimedia Commons) may be
added by the skill only with the license and credit recorded in serial/installments.json."""
import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Ellipse, FancyBboxPatch, Rectangle, Circle
from PIL import Image, ImageFilter
from pathlib import Path

OUT = Path(__file__).resolve().parents[2] / "serial" / "img"
INK, RED, PAPER = "#3b2a1a", "#9b3b2c", "#e8dbbd"
plt.rcParams["font.family"] = "DejaVu Serif"


def canvas(title, sub):
    fig = plt.figure(figsize=(12, 8), dpi=150, facecolor=PAPER)
    ax = fig.add_axes([0.02, 0.02, 0.96, 0.96]); ax.set_xlim(0, 120); ax.set_ylim(0, 80); ax.axis("off"); ax.set_facecolor(PAPER)
    for inset, lw in ((1.2, 2.4), (2.0, 0.8)):
        ax.add_patch(Rectangle((inset, inset), 120 - 2 * inset, 80 - 2 * inset, fill=False, ec=INK, lw=lw))
    ax.text(60, 74.6, title, ha="center", va="center", fontsize=21, color=INK, fontweight="bold")
    ax.text(60, 70.8, sub, ha="center", va="center", fontsize=11.5, color=INK, style="italic")
    ax.plot([22, 98], [68.6, 68.6], color=INK, lw=0.8)
    return fig, ax


def label(ax, xy, xyt, text, ha="left"):
    ax.annotate(text, xy=xy, xytext=xyt, fontsize=11, color=INK, style="italic", ha=ha, va="center",
                arrowprops=dict(arrowstyle="-", color=INK, lw=0.8, shrinkA=2, shrinkB=0))


def finish(fig, name, seed):
    p = OUT / (name + ".png"); fig.savefig(p, facecolor=PAPER); plt.close(fig)
    im = Image.open(p).convert("RGB"); w, h = im.size; rng = np.random.default_rng(seed)
    a = np.asarray(im).astype(float)
    grain = rng.normal(0, 7, (h, w, 1)); fib = np.asarray(Image.fromarray(rng.normal(128, 40, (h // 4, w // 4)).clip(0, 255).astype("uint8")).resize((w, h), Image.BICUBIC)).astype(float)[..., None]
    yy, xx = np.mgrid[0:h, 0:w]; v = 1 - 0.34 * (((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) ** 1.3
    stain = 1 - 0.07 * (np.sin(xx / 210.0 + seed) * np.cos(yy / 170.0 - seed) + 1)
    a = (a * v[..., None] * stain[..., None] + grain + (fib - 128) * 0.07) * np.array([1.0, 0.97, 0.9])
    im = Image.fromarray(a.clip(0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6))
    im.convert("RGB").resize((1600, 1067), Image.LANCZOS).save(OUT / (name + ".jpg"), quality=88, optimize=True); p.unlink()


def hatch(ax, poly_pts, angle, gap, color=INK, lw=0.5, clip=None):
    xs = [p[0] for p in poly_pts]; ys = [p[1] for p in poly_pts]
    d = max(max(xs) - min(xs), max(ys) - min(ys)) * 1.6; cx, cy = np.mean(xs), np.mean(ys)
    for t in np.arange(-d, d, gap):
        ux, uy = np.cos(np.radians(angle)), np.sin(np.radians(angle))
        x0, y0 = cx - ux * d - uy * t, cy - uy * d + ux * t; x1, y1 = cx + ux * d - uy * t, cy + uy * d + ux * t
        (ln,) = ax.plot([x0, x1], [y0, y1], color=color, lw=lw, solid_capstyle="butt")
        if clip is not None: ln.set_clip_path(clip)


def plate1():
    fig, ax = canvas("PLATE I", "The Kidney in Section: cortex, medulla and the passage to the bladder")
    th = np.linspace(0, 2 * np.pi, 400)
    x = 36 * np.cos(th) * 0.62 + 0; y = 36 * np.sin(th)
    notch = 9 * np.exp(-((th - 0) ** 2) / 0.28) + 9 * np.exp(-((th - 2 * np.pi) ** 2) / 0.28)
    xo = 60 + (np.cos(th) * 20 - notch * 1.5); yo = 38 + np.sin(th) * 27
    outer = Polygon(np.c_[xo, yo], closed=True, fc="#d9c59a", ec=INK, lw=2.2); ax.add_patch(outer)
    hatch(ax, np.c_[xo, yo], 38, 0.55, lw=0.45, clip=outer)
    xi = 60 + (np.cos(th) * 14.2 - notch * 1.0); yi = 38 + np.sin(th) * 20.5
    inner = Polygon(np.c_[xi, yi], closed=True, fc="#c9b080", ec=INK, lw=1.2); ax.add_patch(inner)
    hatch(ax, np.c_[xi, yi], -52, 0.45, lw=0.45, clip=inner)
    pel = Ellipse((57.5, 38), 8.5, 12, fc=PAPER, ec=INK, lw=1.6); ax.add_patch(pel)
    for a0 in np.linspace(20, 340, 9):
        r = np.radians(a0); ex, ey = 60 + 14.2 * np.cos(r), 38 + 20.5 * np.sin(r)
        for da in (-5.5, 5.5):
            r2 = np.radians(a0 + da); bx, by = 60 + 14.2 * np.cos(r2), 38 + 20.5 * np.sin(r2)
            (ln,) = ax.plot([57.5 + 2.2 * np.cos(r), bx], [38 + 3.2 * np.sin(r), by], color=INK, lw=0.9); ln.set_clip_path(inner)
    ur = Polygon([(56, 33), (54, 14), (57.5, 12), (60, 14), (59, 33)], closed=True, fc="#d9c59a", ec=INK, lw=1.4); ax.add_patch(ur)
    hatch(ax, [(54, 14), (60, 14), (59, 33), (56, 33)], 80, 0.6, lw=0.4, clip=ur)
    ax.add_patch(Polygon([(57.5, 12), (55.6, 8.4), (59.4, 8.4)], closed=True, fc=INK, ec=INK))
    ax.plot([80, 66, 63.4, 62], [48, 48, 43, 41.4], color=RED, lw=3.2, solid_capstyle="round")
    ax.plot([80, 68, 64.4, 62.4], [37.5, 37.5, 39, 40], color="#35516b", lw=3.2, solid_capstyle="round")
    ax.text(81.5, 48, "renal artery", fontsize=11, style="italic", color=RED, va="center")
    ax.text(81.5, 37.5, "renal vein", fontsize=11, style="italic", color="#35516b", va="center")
    label(ax, (46, 52), (18, 59), "cortex (the filter)")
    label(ax, (50, 40), (14, 40), "medulla and its pyramids")
    label(ax, (57.5, 40), (20, 25), "renal pelvis")
    label(ax, (57.5, 11), (28, 10), "ureter, to the bladder")
    ax.text(60, 4.6, "Fig. 1. Section through the long axis. Original illustration, in the manner of mid-century medical plates.", ha="center", fontsize=9.6, color=INK, style="italic")
    finish(fig, "plate-1-kidney", 11)


def plate2():
    fig, ax = canvas("PLATE II", "The Rotating-Drum Artificial Kidney (schematic, 1940s)")
    bath = Polygon([(18, 33), (102, 33), (96, 12), (24, 12)], closed=True, fc="#cfd6c4", ec=INK, lw=2.2); ax.add_patch(bath)
    hatch(ax, [(18, 33), (102, 33), (96, 12), (24, 12)], 0, 0.7, lw=0.4, color="#35516b", clip=bath)
    ax.plot([18, 102], [33, 33], color=INK, lw=2.4)
    ax.add_patch(Rectangle((30, 33), 60, 23, fc="#dccaa0", ec=INK, lw=2)); ax.add_patch(Ellipse((30, 44.5), 6, 23, fc="#c9b484", ec=INK, lw=2)); ax.add_patch(Ellipse((90, 44.5), 6, 23, fc="#e6d7b0", ec=INK, lw=2))
    for xs in np.linspace(32, 88, 22): ax.plot([xs, xs + 2.2], [33, 56], color=RED, lw=1.5, alpha=0.85)
    ax.plot([90, 100, 100], [44.5, 44.5, 52], color=INK, lw=2.6); ax.plot([30, 20, 20], [44.5, 44.5, 52], color=INK, lw=2.6)
    ax.plot([60, 60], [33, 16], color=INK, lw=0, alpha=0)
    for sx in (12, 108):
        ax.add_patch(Polygon([(sx - 4, 33), (sx + 4, 33), (sx + 2, 56), (sx - 2, 56)], closed=True, fc="#b59e6b", ec=INK, lw=1.6))
    label(ax, (100, 51), (104, 62), "blood out, to the patient", ha="center")
    label(ax, (20, 51), (14, 62), "blood in, from the artery", ha="center")
    label(ax, (60, 56), (60, 64), "drum wrapped in cellophane tubing", ha="center")
    label(ax, (60, 22), (60, 6.5), "bath: salt-balanced fluid that draws waste across the membrane", ha="center")
    ax.text(60, 3.2, "Fig. 2. Waste leaves the blood by diffusion through the tubing wall as the drum turns. Original schematic.", ha="center", fontsize=9.6, color=INK, style="italic")
    finish(fig, "plate-2-drum", 23)


def plate3():
    fig, ax = canvas("PLATE III", "The Cold Box: a kidney packed for the journey, and the clock that starts the moment blood flow stops")
    ax.add_patch(Polygon([(24, 14), (84, 14), (98, 22), (98, 44), (84, 36), (24, 36)], closed=True, fc="#c3a974", ec=INK, lw=2.2))
    ax.add_patch(Polygon([(84, 14), (98, 22), (98, 44), (84, 36)], closed=True, fc="#a98f5c", ec=INK, lw=2))
    ax.add_patch(Polygon([(24, 36), (84, 36), (98, 44), (38, 44)], closed=True, fc="#e1d0a4", ec=INK, lw=2))
    ax.add_patch(Polygon([(36, 36), (82, 36), (92, 42), (46, 42)], closed=True, fc="#f0e6c9", ec=INK, lw=1.3))
    for i in range(14):
        cx, cy = 40 + (i % 7) * 7.2 + (i // 7) * 2.5, 38.4 + (i // 7) * 1.4
        ax.add_patch(Polygon([(cx, cy), (cx + 3.6, cy + 0.8), (cx + 3.2, cy + 3.4), (cx - 0.4, cy + 2.8)], closed=True, fc="#dfeaf0", ec=INK, lw=0.8))
    th = np.linspace(0, 2 * np.pi, 200)
    ax.add_patch(Polygon(np.c_[60 + 8.2 * np.cos(th) - 2.2 * np.exp(-((th - np.pi) ** 2) / 0.3), 42.4 + 4.4 * np.sin(th)], closed=True, fc="#b35446", ec=INK, lw=1.6))
    ax.add_patch(Rectangle((8, 8), 6, 36, fc="#f5ecd2", ec=INK, lw=1.6)); ax.add_patch(Circle((11, 8), 4, fc=RED, ec=INK, lw=1.6)); ax.add_patch(Rectangle((10, 8), 2, 24, fc=RED, ec=RED))
    for k in range(0, 8): ax.plot([14, 16.4 if k % 2 == 0 else 15.2], [12 + k * 4, 12 + k * 4], color=INK, lw=1)
    ax.text(18, 33, "4 °C", fontsize=11, style="italic", color=INK)
    label(ax, (62, 44), (60, 58), "the organ, in a sterile bag", ha="center")
    label(ax, (46, 40.5), (24, 60), "crushed ice around the bag", ha="center")
    label(ax, (11, 28), (30, 8.5), "thermometer: kept near freezing, never below", ha="left")
    label(ax, (92, 28), (104, 12), "outer container", ha="center")
    ax.text(60, 3.2, "Fig. 3. Static cold storage slows the organ's metabolism but does not stop the clock. Original illustration.", ha="center", fontsize=9.6, color=INK, style="italic")
    finish(fig, "plate-3-coldbox", 37)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    plate1(); plate2(); plate3(); print("plates written to", OUT)
