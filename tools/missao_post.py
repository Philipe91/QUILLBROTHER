"""Finish a rendered frame folder: sepia film grade with halation, vignette, per-frame grain; then H.264 with a synthesised sound bed.
python tools/missao_post.py <frames_dir> <out.mp4> [--crf 18] [--res WxH] [--sem-audio]"""
import json, os, subprocess, sys, glob
import numpy as np
from PIL import Image, ImageFilter
from scipy.signal import butter, sosfilt

d, out = sys.argv[1:3]
arg = lambda k, v=None: sys.argv[sys.argv.index(k) + 1] if k in sys.argv else v
crf = arg('--crf', '18'); res = arg('--res')
g = os.path.join(d, 'graded'); os.makedirs(g, exist_ok=True)

def grade(path, seed):
    I = Image.open(path).convert('RGB')
    im = np.asarray(I, float) / 255; h, w, _ = im.shape
    hi = np.clip((im - .68) / .32, 0, 1)
    b = np.asarray(Image.fromarray((hi * 255).astype('uint8')).filter(ImageFilter.GaussianBlur(w / 80)), float) / 255
    im = 1 - (1 - im) * (1 - b * np.array([.28, .2, .12]))
    l = im @ np.array([.3, .59, .11]); l3 = l[..., None]
    # sepia: pull most of the colour out, keep a little local hue, tint by tone
    sep = np.stack([l * 1.08 + .012, l * .96 + .004, l * .78 - .004], -1)
    im = im * .24 + sep * .76
    # contrast: soft S, blacks kept dense, highlights kept open
    im = np.clip(im, 0, 1) ** .74    # open the mids so uniforms and ground keep their detail
    l = im.mean(2, keepdims=True); c = l * l * (3 - 2 * l)
    im = im * (.72 + .28 * c / np.maximum(l, 1e-3))
    Y, X = np.mgrid[0:h, 0:w]
    r = np.hypot((X - w / 2) / (w / 2), (Y - h / 2) / (h / 2))
    im = im * (1 - .26 * np.clip((r - .55) / .8, 0, 1) ** 2)[..., None]
    rng = np.random.default_rng(seed); n = rng.normal(0, .021, (h, w)); l = im.mean(2)
    im = im + (n * (1 - .5 * np.abs(l * 2 - 1)))[..., None]
    return Image.fromarray((np.clip(im, 0, 1) * 255).astype('uint8'))

fr = sorted(glob.glob(os.path.join(d, 'f[0-9][0-9][0-9][0-9].png')))
for f in fr:
    o = os.path.join(g, os.path.basename(f)[:-4] + '.jpg')
    if '--regrade' in sys.argv or not os.path.exists(o) or os.path.getmtime(o) < os.path.getmtime(f):
        grade(f, int(os.path.basename(f)[1:5]) + 7).save(o, quality=96, subsampling=0)
print('grade', len(fr))

# ---------- sound: wind bed, foot impacts from the real plants, a low swell, silence before the last pose ----------
wav = os.path.join(d, 'som.wav')
if '--sem-audio' not in sys.argv:
    from scipy.io import wavfile
    ev = json.load(open(os.path.join(d, 'eventos.json'))); SR = 48000; D = 15.0; N = int(D * SR); rng = np.random.default_rng(9)
    def lp(x, fc): return sosfilt(butter(2, fc / (SR / 2), 'low', output='sos'), x)
    def bp(x, a, b): return sosfilt(butter(2, [a / (SR / 2), b / (SR / 2)], 'band', output='sos'), x)
    t = np.arange(N) / SR
    wind = bp(rng.normal(0, 1, N), 180, 1300) * (.5 + .35 * np.sin(t * .9) + .15 * np.sin(t * 2.7 + 1))
    wind = wind / np.abs(wind).max() * .16
    cuts = ev['cortes'] + [15.0]
    gain = np.ones(N)
    near = {0: .25, 1: 1.0, 2: .7, 3: .15, 4: .85, 5: 1.0}
    steps = np.zeros(N)
    for p in ev['plantas']:
        tl = p['t']
        if tl < 0 or tl >= 14.9: continue
        i = next(k for k in range(len(cuts) - 1) if cuts[k] <= tl < cuts[k + 1])
        L = int(.16 * SR); tt = np.arange(L) / SR
        thud = np.sin(2 * np.pi * (70 + 40 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 34)
        grit = bp(rng.normal(0, 1, L), 900, 4200) * np.exp(-tt * 46) * .3
        s = (thud + grit) * near[i] * rng.uniform(.75, 1) * .55
        a = int(tl * SR); steps[a:a + L] += s[:max(0, N - a)]
    # breath in the close shot, on every other step
    br = np.zeros(N)
    for k, c0 in enumerate(np.arange(cuts[4], cuts[5], .42)):
        L = int(.3 * SR); tt = np.arange(L) / SR; e = np.sin(np.pi * tt / .3) ** 2
        s = bp(rng.normal(0, 1, L), 700 + 240 * (k % 2), 3000) * e * .12; a = int(c0 * SR); br[a:a + L] += s[:max(0, N - a)]
    # far shouts of the soldiers: band-limited vocal bursts, only while they are on screen
    shout = np.zeros(N)
    for tl in (6.4, 7.0, 7.7, 8.15, 8.55):
        L = int(.34 * SR); tt = np.arange(L) / SR
        s = (np.sin(2 * np.pi * (330 + 90 * np.sin(tt * 16)) * tt) + .5 * np.sin(2 * np.pi * 690 * tt)) * np.sin(np.pi * tt / .34) ** .7 * .05
        a = int(tl * SR); shout[a:a + L] += s[:max(0, N - a)]
    shout = bp(shout, 300, 2400)
    drone = np.sin(2 * np.pi * 49 * t) * .5 + np.sin(2 * np.pi * 73.5 * t + 1) * .3
    swell = np.clip((t - 2) / 11, 0, 1) ** 2 * .17 * drone
    env = 1 - np.clip((t - 13.55) / .35, 0, 1)    # everything falls away as he stops
    mix = (wind * (.35 + .65 * env) + steps + br + shout + swell * env)
    last = int(14.35 * SR); L = int(.09 * SR); tt = np.arange(L) / SR
    mix[last:last + L] += bp(rng.normal(0, 1, L), 1500, 7000) * np.exp(-tt * 70) * .3     # the rifle settles: first sound after the silence
    mix = mix / max(1e-6, np.abs(mix).max()) * .88
    wavfile.write(wav, SR, (np.stack([mix, mix], 1) * 32767).astype('int16'))

cmd = ['ffmpeg', '-y', '-v', 'error', '-framerate', '24', '-i', os.path.join(g, 'f%04d.jpg')]
if '--sem-audio' not in sys.argv:
    cmd += ['-i', wav, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000']
if res:
    cmd += ['-vf', 'scale=' + res.replace('x', ':') + ':flags=lanczos']
cmd += ['-c:v', 'libx264', '-preset', 'slow', '-crf', crf, '-tune', 'grain', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-movflags', '+faststart', '-shortest', out]
subprocess.run(cmd, check=True)
print('ok', out)
