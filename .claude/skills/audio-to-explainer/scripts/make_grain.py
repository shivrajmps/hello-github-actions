#!/usr/bin/env python3
"""Static paper-grain overlay (seeded, so renders are identical). Usage: make_grain.py out.png"""
import sys, numpy as np
from PIL import Image, ImageFilter
rng = np.random.default_rng(7); W, H = 1920, 1080
fine = rng.normal(0, 1, (H, W)); img = Image.fromarray(((fine - fine.min()) / (fine.max() - fine.min()) * 255).astype("uint8"), "L").filter(ImageFilter.GaussianBlur(1.2))
a = np.array(img).astype(float); a = (a - a.mean()) / a.std()
coarse = rng.normal(0, 1, (H // 16, W // 16)); c = Image.fromarray(((coarse - coarse.min()) / (coarse.max() - coarse.min()) * 255).astype("uint8"), "L").resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(6))
cc = np.array(c).astype(float); cc = (cc - cc.mean()) / cc.std(); n = 0.65 * a + 0.35 * cc
alpha = np.clip(128 + n * 40, 0, 255); rgba = np.zeros((H, W, 4), dtype="uint8"); rgba[..., 0] = 60; rgba[..., 1] = 55; rgba[..., 2] = 45
rgba[..., 3] = np.clip((255 - alpha) * 0.17, 0, 255).astype("uint8"); Image.fromarray(rgba, "RGBA").save(sys.argv[1], optimize=True)
