"""Voz sem marca + efeitos e trilha CC0 -> assets/audio/mix.wav em -16 LUFS. Trilha 20 dB abaixo da voz; some antes de 10:59."""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf
R = Path(__file__).resolve().parent.parent; D = json.load(open(R / 'cenas.json', encoding='utf-8')); SR = 48000
tot = D['total']; N = int(tot * SR); voz = np.zeros(N); fx = np.zeros(N); mus = np.zeros(N)
cen = {c['id']: c for c in D['cenas']}
def carrega(p):
    b = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(p), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(b, 'float32').astype(float)
def rms(x): return np.sqrt(np.mean(x[np.abs(x) > 1e-4] ** 2) + 1e-12)
def pos(buf, x, t, g=1.0, fi=.05, fo=.3):
    a = int(t * SR); x = x[:max(0, len(buf) - a)].copy(); n = len(x); e = np.ones(n); i = min(int(fi * SR), n // 2); o = min(int(fo * SR), n // 2)
    if i: e[:i] = np.linspace(0, 1, i)
    if o: e[-o:] = np.linspace(1, 0, o)
    buf[a:a + n] += x * e * g
for c in D['cenas']: pos(voz, carrega(R / f"assets/audio/voz_sem_marca/{c['id']}.mp3"), c['voz_em'], fi=.005, fo=.03)
vr = rms(voz); F = R / 'assets/sfx'
def nv(x, db): return x / max(rms(x), 1e-6) * vr * 10 ** (db / 20)
def corte(n, ini, dur): x = carrega(F / n); return np.resize(x[int(ini * SR):], int(dur * SR))
tr = lambda i: (cen[i]['start'], cen[i]['end'] - cen[i]['start'])
for i, db in (('s29', -25), ('s30', -27), ('s31', -27), ('s32', -25), ('s33', -26), ('s34', -27), ('s35', -26)):
    t, d = tr(i); pos(fx, nv(corte('vento.mp3', 8 + t, d + .4), db), t, fi=.2, fo=.3)
t, d = tr('s29'); pos(fx, nv(corte('artilharia.mp3', 3, d), -22), t, fi=.3, fo=.4)
t, d = tr('s30'); pos(fx, nv(corte('artilharia.mp3', 9, d), -28), t, fi=.3, fo=.4)
t = cen['s32']['start']; pos(fx, nv(corte('passos.mp3', 1, tr('s32')[1] + tr('s33')[1]), -20), t + 1.1, fi=.03, fo=.5)
for ti in D['tempos']['tiros']: pos(fx, nv(corte('tiro.mp3', 0, .22), -7), ti - .01, fi=.001, fo=.1)
t, d = tr('s35'); pos(fx, nv(corte('metralhadora.mp3', 0, t + d - D['tempos']['mg']), -9), D['tempos']['mg'] + .11, fi=.002, fo=.05)
t, d = tr('s36'); pos(fx, nv(corte('relogio.mp3', 0, d - .3), -19), t + .3, fi=.2, fo=.3)
# trilha do canal, em leito baixo, cortando de vez no disparo da metralhadora (o silêncio é o golpe)
m = carrega(R / 'assets/musica/tensao_2.mp3'); fim = D['tempos']['mg'] + .11
pos(mus, nv(np.resize(m, int(fim * SR)), -20), 0, fi=1.2, fo=.03)
mix = voz + fx + mus; mix = mix / np.abs(mix).max() * .85
tmp = R / 'assets/audio/_bruto.wav'; sf.write(tmp, mix, SR, subtype='PCM_24')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(tmp), '-af', 'acompressor=threshold=-20dB:ratio=2:attack=8:release=120,loudnorm=I=-16:TP=-1.5:LRA=9', '-ar', '48000', '-ac', '2', '-map_metadata', '-1', str(R / 'assets/audio/mix.wav')], check=True)
tmp.unlink(); print('mix ok', round(tot, 2))
