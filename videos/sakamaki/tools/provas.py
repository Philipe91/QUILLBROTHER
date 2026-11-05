"""Prova: um quadro no meio de cada cena de um capítulo, em folha com id. Uso: python provas.py <longo|short> <cap,cap> [frac=.6]"""
import json, subprocess, sys, shutil
from pathlib import Path
from PIL import Image, ImageDraw
R = Path(__file__).resolve().parent.parent; f = sys.argv[1]; caps = sys.argv[2].split(','); fr = float(sys.argv[3]) if len(sys.argv) > 3 else .6
C = json.load(open(R / f'cenas_{f}.json', encoding='utf-8')); npx = 'npx.cmd'
for cap in caps:
    L = [c for c in C if c['cap'] == cap]; t0 = L[0]['t']; ts = [round(c['t'] - t0 + c['dur'] * fr, 2) for c in L]; d = R / f'build/{f}/{cap}'; o = R / f'qa/{f}/{cap}'
    shutil.rmtree(o, ignore_errors=True); o.mkdir(parents=True)
    r = subprocess.run(f'{npx} --yes hyperframes@0.9.11 snapshot "{d}" --at {",".join(map(str, ts))} --no-end --keep -o "{o}" --timeout 120000', shell=True, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if r.returncode: print(r.stdout[-800:], r.stderr[-800:])
    th = []
    for c, t in zip(L, ts):
        s = ('%g' % t); p = o / f'at-{s}s.png'
        if not p.exists(): print('sem', p.name); continue
        im = Image.open(p).convert('RGB'); w = 480 if f == 'longo' else 270; im = im.resize((w, int(im.height * w / im.width))); ImageDraw.Draw(im).rectangle((0, 0, 60, 16), fill='black'); ImageDraw.Draw(im).text((3, 2), c['id'], fill='white'); th.append(im)
    cols = 4 if f == 'longo' else 6; W, H = th[0].size; rows = (len(th) + cols - 1) // cols; F = Image.new('RGB', (cols * W, rows * H))
    for i, im in enumerate(th): F.paste(im, ((i % cols) * W, (i // cols) * H))
    F.save(R / f'qa/{f}/folha_{cap}.jpg', quality=82); print(cap, len(th), 'quadros')
