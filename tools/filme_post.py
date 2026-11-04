"""Film finish on a NEW render (never on old frames): soft S-curve, split tone, halation around highlights, vignette, fine grain about 2 %.
python tools/filme_post.py in.png out.png [--seed 1]"""
import sys
import numpy as np
from PIL import Image, ImageFilter
src, dst = sys.argv[1:3]
I = Image.open(src).convert('RGB')
im = np.asarray(I, float) / 255
h, w, _ = im.shape
# halation: bright areas bleed warm
hi = np.clip((im - .62) / .38, 0, 1)
blur = np.asarray(Image.fromarray((hi * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(w / 70)), float) / 255
im = 1 - (1 - im) * (1 - blur * np.array([.34, .24, .14]))
# S-curve: deepen the blacks, keep the highlights soft
l = im.mean(2, keepdims=True)
c = l * l * (3 - 2 * l)
im = im * (.45 + .55 * (c / np.maximum(l, 1e-3)))
# split tone: cool shadows, warm highlights
l = im.mean(2, keepdims=True)
im = im + (1 - l) ** 2 * np.array([-.012, .0, .018]) + l ** 2 * np.array([.018, .006, -.016])
Y, X = np.mgrid[0:h, 0:w]
r = np.hypot((X - w / 2) / (w / 2), (Y - h / 2) / (h / 2))
im = im * (1 - .28 * np.clip((r - .5) / .85, 0, 1) ** 2)[..., None]
rng = np.random.default_rng(int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 1)
g = rng.normal(0, .02, (h, w))
luma = im.mean(2)
im = im + (g * (1 - .5 * np.abs(luma * 2 - 1)))[..., None]
Image.fromarray((np.clip(im, 0, 1) * 255).astype('uint8')).save(dst)
