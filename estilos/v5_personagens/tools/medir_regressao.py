"""Mede no vídeo renderizado: marcadores coloridos do rig V2 (metade esquerda) e V5 (direita). Mesma tabela, então devem coincidir, e o pé plantado não pode andar."""
import json, subprocess, sys
import numpy as np
mp4, saida = sys.argv[1], sys.argv[2]
W, H = 1920, 1080
b = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
a = np.frombuffer(b, 'uint8').reshape(-1, H, W, 3).astype(int)
COR = {'pe': (255, 0, 255), 'mao': (0, 255, 255), 'fuzil': (255, 255, 0)}
def centro(f, cor, x0, x1):
    m = (np.abs(f[:, x0:x1] - np.array(cor)).sum(2) < 70)
    if m.sum() < 6: return None
    ys, xs = np.nonzero(m); return float(xs.mean() + x0), float(ys.mean())
L = 1000  # divisa: V2 anda da esquerda até antes de 1000; V5 começa em 1000
res = {'quadros': len(a)}; dif = {k: [] for k in COR}; serie = {k: {'v2': [], 'v5': []} for k in COR}
for f in a:
    for k, c in COR.items():
        p2, p5 = centro(f, c, 0, 960), centro(f, c, 960, 1920); serie[k]['v2'].append(p2); serie[k]['v5'].append(p5)
        if p2 and p5: dif[k].append(np.hypot(p5[0] - 1020 - p2[0], p5[1] - p2[1]))
for k in COR: res[f'dif_v2_v5_{k}_px'] = {'max': round(float(np.max(dif[k])), 2), 'media': round(float(np.mean(dif[k])), 2), 'n': len(dif[k])}
# pé plantado: trechos em que o marcador da ponta fica parado mais de 5 quadros; maior andança dentro do trecho
for rig in ('v2', 'v5'):
    s = [p for p in serie['pe'][rig]]; mx = 0; trechos = 0; i = 0
    while i < len(s) - 1:
        if s[i] and s[i + 1] and np.hypot(s[i + 1][0] - s[i][0], s[i + 1][1] - s[i][1]) < 1.6:
            j = i
            while j < len(s) - 1 and s[j + 1] and np.hypot(s[j + 1][0] - s[j][0], s[j + 1][1] - s[j][1]) < 1.6: j += 1
            if j - i >= 5: trechos += 1; mx = max(mx, np.hypot(s[j][0] - s[i][0], s[j][1] - s[i][1]))
            i = j + 1
        else: i += 1
    res[f'pe_plantado_{rig}'] = {'trechos': trechos, 'maior_andanca_px': round(float(mx), 2)}
# mão presa ao fuzil: distância mão-marca do fuzil não pode variar (marcas estão deslocadas de propósito)
for rig in ('v2', 'v5'):
    d = [np.hypot(m[0] - f[0], m[1] - f[1]) for m, f in zip(serie['mao'][rig], serie['fuzil'][rig]) if m and f]
    res[f'mao_fuzil_{rig}'] = {'distancia_media_px': round(float(np.mean(d)), 2), 'variacao_px': round(float(np.max(d) - np.min(d)), 2)}
json.dump(res, open(saida, 'w'), indent=1); print(json.dumps(res))
