"""Etapa 7: voz + efeitos CC0 -> assets/audio/mix.wav, normalizado em -16 LUFS. Os efeitos ficam 18 dB ou mais abaixo da voz. Sem trilha no protótipo."""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt
R = Path(__file__).resolve().parent.parent; S = json.load(open(R / 'scenes.json', encoding='utf-8')); SR = 48000
tot = S['cenas'][-1]['end']; N = int(tot * SR); voz = np.zeros(N); fx = np.zeros(N)
def carrega(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, 'float32').astype(float)
def rms(x): return np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2) + 1e-12)
def pos(buf, x, t, g=1.0, fi=.05, fo=.3):
    x = x.copy(); a = int(t * SR); x = x[:max(0, len(buf) - a)]
    n = len(x); e = np.ones(n); i = min(int(fi * SR), n // 2); o = min(int(fo * SR), n // 2)
    if i: e[:i] = np.linspace(0, 1, i)
    if o: e[-o:] = np.linspace(1, 0, o)
    buf[a:a + n] += x * e * g
for c in S['cenas']:
    if c.get('voz_em') is not None: pos(voz, carrega(R / f"assets/audio/voz/{c['id']}.wav"), c['voz_em'], fi=.005, fo=.03)
vr = rms(voz); F = R / 'assets/sfx'
def nv(x, db): return x / max(rms(x), 1e-6) * vr * 10 ** (db / 20)
cen = {c['id']: c for c in S['cenas']}
def corte(n, ini, dur): x = carrega(F / n); return np.resize(x[int(ini * SR):], int(dur * SR))
def trecho(id): return cen[id]['start'], cen[id]['end'] - cen[id]['start']
# vento em toda a abertura e nas cenas de campo
for id, db in (('c0_s01', -27), ('c1_s00', -30), ('c1_s01', -24), ('c1_s02', -29), ('c1_s04', -25)):
    t, d = trecho(id); pos(fx, nv(corte('vento.mp3', 8 + t, d + .6), db), t, fi=.5, fo=.6)
t, d = trecho('c0_s02'); pos(fx, nv(corte('pena.mp3', 4, min(d, 2.0)), -22), t + .1, fi=.03, fo=.25)
t, d = trecho('c1_s01'); pos(fx, nv(corte('artilharia.mp3', 3, d), -23), t, fi=.4, fo=.5)
t, d = trecho('c1_s02'); pos(fx, nv(corte('maquina.mp3', 2, 1.3), -21), cen['c1_s02']['voz_em'] + json.load(open(R / 'timing_voz.json', encoding='utf-8'))['c1_s02']['palavras'][2]['i'], fi=.01, fo=.08)
t, d = trecho('c1_s03'); pos(fx, nv(corte('relogio.mp3', 0, d), -20), t, fi=.02, fo=.2)
t, d = trecho('c1_s04'); V = json.load(open(R / 'timing_voz.json', encoding='utf-8'))['c1_s04']['palavras']
tp = next(w['i'] for w in V if w['p'].lower().startswith('levanta')); ini = cen['c1_s04']['voz_em'] + tp + .46
pos(fx, nv(corte('passos.mp3', 1, cen['c1_s04']['end'] - ini), -20), ini, fi=.03, fo=.9)
# silêncio geral no fade final
k = np.ones(N); a = int((tot - 1.0) * SR); k[a:] = np.linspace(1, 0, N - a); fx *= k
mix = voz + fx
pk = np.abs(mix).max(); mix = mix / pk * .8
tmp = R / 'assets/audio/_mix_bruto.wav'; sf.write(tmp, np.clip(mix, -1, 1), SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(tmp), '-af', 'acompressor=threshold=-20dB:ratio=2:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '2', str(R / 'assets/audio/mix.wav')], check=True)
tmp.unlink(); print('mix', tot)
