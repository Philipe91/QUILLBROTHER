"""Compara a voz publicada (com marca) com a nova (sem marca). Só numpy/scipy. Mede tempo, tom, timbre (mel médio), brilho, volume e parecença da onda.
A referência é o quanto duas falas publicadas DIFERENTES se parecem no timbre: dá escala ao número."""
import json, subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import stft
R = Path(__file__).resolve().parent.parent
SR = 24000
def wav(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, 'float32').astype(float)
def tom(x, fr=1024, hop=240):
    v = []
    for i in range(0, len(x) - fr, hop):
        w = x[i:i + fr] * np.hanning(fr)
        if np.sqrt(np.mean(w ** 2)) < .015: continue
        a = np.fft.irfft(np.abs(np.fft.rfft(w, 2 * fr)) ** 2)[:fr]; a /= a[0] + 1e-9
        lo, hi = int(SR / 300), int(SR / 60); k = lo + int(np.argmax(a[lo:hi]))
        if a[k] > .45: v.append(SR / k)
    return float(np.median(v))
def mel(x, n=40):
    f, _, Z = stft(x, SR, nperseg=1024, noverlap=784); P = np.abs(Z) ** 2
    m = 2595 * np.log10(1 + f / 700); pts = np.linspace(0, m.max(), n + 2); out = []
    for i in range(n):
        a, b, c = pts[i:i + 3]; w = np.clip(np.minimum((m - a) / (b - a), (c - m) / (c - b)), 0, None); out.append(w @ P)
    M = np.log10(np.array(out) + 1e-10); e = P.sum(0); M = M[:, e > np.percentile(e, 35)]
    return M.mean(1), float((f @ P).sum() / P.sum())
def sim(a, b): a = a - a.mean(); b = b - b.mean(); return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
ids = sys.argv[1:]; res = {}; pubs = {}
for s in ids:
    a, b = wav(R / f'assets/audio/voz/{s}.mp3'), wav(R / f'assets/audio/voz_sem_marca/{s}.mp3'); pubs[s] = a
    n = min(len(a), len(b)); ab, bb = a[:n] - a[:n].mean(), b[:n] - b[:n].mean()
    cc = np.fft.irfft(np.fft.rfft(ab, 2 * n) * np.conj(np.fft.rfft(bb, 2 * n)))
    ma, ca = mel(a); mb, cb = mel(b)
    res[s] = dict(dur_pub=round(len(a) / SR, 2), dur_nova=round(len(b) / SR, 2), corr_onda=round(float(np.abs(cc).max() / (np.linalg.norm(ab) * np.linalg.norm(bb) + 1e-9)), 4), tom_pub_hz=round(tom(a), 1), tom_nova_hz=round(tom(b), 1), timbre=round(sim(ma, mb), 4), brilho_pub=round(ca), brilho_nova=round(cb), vol_db=round(20 * np.log10(np.sqrt(np.mean(b ** 2)) / np.sqrt(np.mean(a ** 2))), 2))
    print(s, res[s], flush=True)
vs = [sim(mel(pubs[x])[0], mel(pubs[y])[0]) for i, x in enumerate(ids) for y in ids[i + 1:]]
res['_referencia_timbre_entre_falas_publicadas_diferentes'] = dict(min=round(min(vs), 4), media=round(float(np.mean(vs)), 4))
print(res['_referencia_timbre_entre_falas_publicadas_diferentes'])
json.dump(res, open(R / 'docs/comparacao_voz.json', 'w'), indent=1)
