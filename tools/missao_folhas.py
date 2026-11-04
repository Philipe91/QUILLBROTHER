"""Storyboard, contact sheet and motion check, read back from the finished MP4 itself, not from the source frames."""
import json, os, subprocess, sys, tempfile
import numpy as np
from PIL import Image, ImageDraw, ImageFont
d = sys.argv[1]; mp4 = os.path.join(d, 'dark_engine_15s_final.mp4')
tmp = tempfile.mkdtemp(); subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', mp4, '-vf', 'scale=640:360', os.path.join(tmp, 'f%04d.jpg')], check=True)
F = lambda n: Image.open(os.path.join(tmp, f'f{n + 1:04d}.jpg')).convert('RGB')
font = ImageFont.truetype('arial.ttf', 22); peq = ImageFont.truetype('arial.ttf', 17)
shots = [('S1  0,00-2,96 s', 'Aberto na lente longa: ele surge nas ondas do terreno', 40), ('S2  2,96-5,92 s', 'Lateral com camera acompanhando: peso da corrida', 105), ('S3  5,92-7,54 s', 'Sobre o ombro: os soldados aparecem', 165),
         ('S3b  7,54-8,83 s', 'Tele nos soldados: gesto de parar', 196), ('S4  8,83-12,13 s', 'Perfil proximo: esforco e determinacao', 250), ('S5  12,13-15,00 s', 'Final: ele freia na crista e aponta', 359)]
W, H = 640, 360; pad = 58
s = Image.new('RGB', (W * 3 + 40, (H + pad) * 2 + 30), '#141210'); dr = ImageDraw.Draw(s)
for i, (a, b, fr) in enumerate(shots):
    x = 10 + (i % 3) * (W + 10); y = 10 + (i // 3) * (H + pad + 5)
    s.paste(F(fr), (x, y)); dr.text((x + 2, y + H + 5), a, fill='#f2e6cf', font=font); dr.text((x + 2, y + H + 32), b, fill='#cbbfa8', font=peq)
s.save(os.path.join(d, 'storyboard.png'))
idx = [int(round(i * 359 / 15)) for i in range(16)]
s = Image.new('RGB', (W // 2 * 4 + 50, (H // 2 + 8) * 4 + 10), '#141210'); dr = ImageDraw.Draw(s)
for i, n in enumerate(idx):
    im = F(n).resize((W // 2, H // 2)); x = 10 + (i % 4) * (W // 2 + 10); y = 8 + (i // 4) * (H // 2 + 8)
    s.paste(im, (x, y)); dr.text((x + 5, y + 4), f'{n / 24:.2f}s', fill='#ffe9a8', font=peq)
s.save(os.path.join(d, 'contact_sheet.png'))
# motion check: mean change between consecutive frames, per second
a = np.stack([np.asarray(F(i).convert('L').resize((160, 90)), float) for i in range(360)])
dif = np.abs(np.diff(a, axis=0)).mean((1, 2))
res = {'quadros_lidos_do_mp4': 360, 'diferenca_media_por_segundo': [round(float(dif[i * 24:(i + 1) * 24].mean()), 2) for i in range(15)], 'quadros_identicos': int((dif < .01).sum())}
json.dump(res, open(os.path.join(d, 'movimento_mp4.json'), 'w'), indent=1); print(res)
# full-size strips for review
for nome, frs in (('_v_run', list(range(100, 112))), ('_v_sold', list(range(186, 210, 2))), ('_v_fim', list(range(330, 360, 3))[:10] + [359])):
    c = 4; rows = (len(frs) + c - 1) // c; t = Image.new('RGB', (c * 480, rows * 270))
    for i, n in enumerate(frs):
        t.paste(F(n).resize((480, 270)), ((i % c) * 480, (i // c) * 270))
    t.save(os.path.join(d, nome + '.jpg'), quality=88)
