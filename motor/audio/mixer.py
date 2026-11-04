"""Mixagem por canais a partir de uma lista de eventos. Reutilizável: não conhece tema, canal nem cena.
Uso: python mixer.py <plano.json> <pasta_saida>
Canais: voz, musica, ambiente, efeitos, transicoes. Cada um é exportado separado em stems/.
Espaço: distância vira volume, abafamento e reverberação; panorama de potência constante.
Ducking automático: tudo abaixa quando há voz. Master: compressor leve, loudnorm e limite de pico."""
import json, subprocess, sys
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
AQUI = Path(__file__).resolve().parent
BIB = json.load(open(AQUI / 'biblioteca.json', encoding='utf-8'))['sons']
rng = np.random.default_rng(1918)
_cache = {}

def carrega(p):
    p = str(p)
    if p not in _cache:
        b = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
        _cache[p] = np.frombuffer(b, 'float32').astype(float)
    return _cache[p]
def lp(x, fc): return sosfilt(butter(2, min(fc, SR / 2.2) / (SR / 2), 'low', output='sos'), x)
def hp(x, fc): return sosfilt(butter(2, fc / (SR / 2), 'high', output='sos'), x)
def bp(x, a, b): return sosfilt(butter(2, [a / (SR / 2), b / (SR / 2)], 'band', output='sos'), x)
def rms(x): v = x[np.abs(x) > 1e-4]; return float(np.sqrt(np.mean(v ** 2))) if len(v) else 1e-6
def db2(x): return 10 ** (x / 20)
def fade(x, i=.003, o=.02):
    n = len(x); e = np.ones(n); a = min(int(i * SR), n // 2); b = min(int(o * SR), n // 2)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] = np.linspace(1, 0, b)
    return x * e

# ---------- sons feitos aqui (registrados na biblioteca como origem local) ----------
def sint(nome):
    d = {'pano': .13, 'equipamento': .1, 'impacto_suave': .9, 'carimbo': .22, 'ar_baixo': 1}.get(nome, .2); n = int(d * SR); t = np.arange(n) / SR
    if nome == 'pano': return bp(rng.normal(0, 1, n), 700, 5200) * np.sin(np.pi * t / d) ** 1.4 * rng.uniform(.8, 1)
    if nome == 'equipamento':
        s = np.zeros(n)
        for f in rng.uniform(1900, 5200, 3): s += np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * rng.uniform(38, 70))
        return s + .3 * bp(rng.normal(0, 1, n), 500, 2600) * np.exp(-t * 40)
    if nome == 'impacto_suave': return np.sin(2 * np.pi * (46 + 34 * np.exp(-t * 16)) * t) * np.exp(-t * 5.5) + .2 * lp(rng.normal(0, 1, n), 700) * np.exp(-t * 16)
    if nome == 'carimbo': return np.sin(2 * np.pi * (120 + 90 * np.exp(-t * 60)) * t) * np.exp(-t * 26) + .6 * bp(rng.normal(0, 1, n), 800, 4200) * np.exp(-t * 60)
    raise KeyError(nome)

def fatias(x, min_s=.05, max_s=.42):
    """Separa golpes de um arquivo por energia. Usado para ter passos e teclas diferentes entre si."""
    j = int(.01 * SR); e = np.sqrt(np.convolve(x ** 2, np.ones(j) / j, 'same')); lim = max(np.percentile(e, 80) * .55, 1e-4); out = []; i = 0
    while i < len(x) - j:
        if e[i] > lim and (i < j or e[max(0, i - j)] <= lim):
            f = i + int(min_s * SR)
            while f < len(x) - 1 and f - i < int(max_s * SR) and e[f] > lim * .5: f += 1
            if f - i > int(min_s * SR):
                g = x[i:f]; k = int(np.argmax(np.abs(g) > np.abs(g).max() * .3))  # começa no ataque real, para o som cair no quadro do evento
                out.append(x[max(0, i + k - 24):f])
            i = f + int(.04 * SR)
        else: i += 1
    return out

_fat = {}
def toma(chave):
    """Um som da biblioteca. Golpes variam de tomada, altura e volume para não soar colado."""
    b = BIB[chave]
    if b['origem'] == 'local':
        return fade(sint(chave)) * b.get('ganho', 1)
    x = carrega(AQUI / b['arquivo'])
    if b.get('modo') == 'fatias':
        if chave not in _fat: _fat[chave] = fatias(x) or [x[:int(.2 * SR)]]
        s = _fat[chave][int(rng.integers(len(_fat[chave])))]
        r = rng.uniform(.93, 1.07); s = np.interp(np.arange(0, len(s), r), np.arange(len(s)), s)
        return fade(s, .001, .03) * rng.uniform(.85, 1.1) * b.get('ganho', 1)
    a = int(b.get('ini', 0) * SR); n = int(b['dur'] * SR) if 'dur' in b else len(x) - a
    return fade(x[a:a + n], .002, min(.25, b.get('fo', .08))) * b.get('ganho', 1)

# ---------- espaço ----------
AMB = {'campo': (1.7, 3200, .08), 'interior': (.5, 5200, .02), 'rua': (.95, 4200, .04), 'seco': (.15, 6000, 0)}
_ir = {}
def resposta(nome):
    if nome not in _ir:
        t60, fc, pre = AMB[nome]; n = int((t60 + pre) * SR); r = np.random.default_rng(sum(map(ord, nome)))
        env = np.exp(-6.9 * np.arange(n) / (t60 * SR)); a = lp(r.normal(0, 1, n), fc) * env; b = lp(r.normal(0, 1, n), fc) * env
        p = int(pre * SR); a[:p] = 0; b[:p] = 0; e = np.sqrt((a ** 2).sum()) + 1e-9; _ir[nome] = (a / e, b / e)
    return _ir[nome]
def espaco(x, dist, pan, amb):
    """Longe: mais baixo, mais abafado e mais reverberação do que som direto."""
    g = db2(-30 * dist ** 1.2); fc = 16000 * (1 - dist) ** 2.2 + 900 * dist + 300
    seco = lp(x, fc) * g; ang = (np.clip(pan, -1, 1) + 1) * np.pi / 4; L, R = seco * np.cos(ang), seco * np.sin(ang)
    env = .1 + .75 * dist
    ia, ib = resposta(amb); ru = lp(x, fc) * db2(-12 * dist)
    wl, wr = env * fftconvolve(ru, ia), env * fftconvolve(ru, ib); n = len(wl); return np.pad(L, (0, n - len(L))) + wl, np.pad(R, (0, n - len(R))) + wr

def coloca(buf, L, R, t):
    a = int(round(t * SR))
    if a >= buf.shape[0]: return
    if a < 0: L, R = L[-a:], R[-a:]; a = 0
    n = min(len(L), buf.shape[0] - a); buf[a:a + n, 0] += L[:n]; buf[a:a + n, 1] += R[:n]

def envelope(pontos, N):
    t = np.arange(N) / SR; ts = [p[0] for p in pontos]; vs = [p[1] for p in pontos]
    return db2(np.interp(t, ts, vs))

def eq_voz(x):
    x = hp(x, 85); pres = bp(x, 2200, 5200) * .32
    return x + pres

def bichos(p):  # lista os blocos do plano
    return p.get('ambientes', []), p.get('voz', []), p.get('musica'), p.get('eventos', [])

def mixa(plano, saida):
    p = json.load(open(plano, encoding='utf-8')); base = Path(plano).parent; tot = p['duracao']; N = int(tot * SR)
    B = {k: np.zeros((N, 2)) for k in ('voz', 'musica', 'ambiente', 'efeitos', 'transicoes')}
    amb, voz, mus, ev = bichos(p); ref = .1
    v = np.zeros(N)
    for l in voz:
        x = eq_voz(carrega(base / l['arquivo'])); a = int(l['t'] * SR); n = min(len(x), N - a); v[a:a + n] += fade(x[:n], .004, .03)
    if v.any(): v = v / rms(v) * ref
    B['voz'][:, 0] = B['voz'][:, 1] = v
    def por_ref(x, db): return x / max(rms(x), 1e-6) * ref * db2(db)
    # ambientes contínuos entre cortes: cruzam com fades longos
    for a in amb:
        x = carrega(AQUI / BIB[a['som']]['arquivo']); d = a['fim'] - a['ini'] + 2 * a.get('fade', .4); n = int(d * SR)
        offs = int(a.get('off', 0) * SR); x = np.resize(np.roll(x, -offs), n); x2 = np.roll(x, n // 3); g = fade(np.ones(n), a.get('fade', .4), a.get('fade', .4))
        co = a.get('corte', 12000); x, x2 = lp(x, co), lp(x2, co)
        coloca(B['ambiente'], por_ref(x, a['db']) * g, por_ref(x2, a['db']) * g, a['ini'] - a.get('fade', .4))
    # música com automação
    if mus:
        x = carrega(AQUI / BIB[mus['som']]['arquivo']); x = np.resize(np.roll(x, -int(mus.get('off', 0) * SR)), N); x = hp(lp(x, mus.get('corte', 5200)), 70)
        y = np.roll(x, 1103); e = envelope(mus['automacao'], N); B['musica'][:, 0] = por_ref(x, 0) * e; B['musica'][:, 1] = por_ref(y, 0) * e
    # eventos
    log = []
    for e in ev:
        x = toma(e['som']); nome = e['som']; bus = e['bus']; d = e.get('dist', 0); bib = BIB[nome]
        alvo = bib.get('nivel', -14) + e.get('db', 0)
        L, R = espaco(por_ref(x, alvo), d, e.get('pan', 0), e.get('amb', p.get('ambiente', 'campo')))
        coloca(B[bus], L, R, e['t']); log.append({**e, 'pico_db': round(20 * np.log10(max(np.abs(x).max(), 1e-6)), 1)})
    # ducking: envelope da voz com ataque rápido e soltura lenta
    env = np.abs(v); a_, r_ = np.exp(-1 / (.035 * SR)), np.exp(-1 / (.33 * SR)); seg = np.zeros(N); s = 0
    for i in range(N):
        s = (1 - a_) * env[i] + a_ * s if env[i] > s else (1 - r_) * env[i] + r_ * s
        seg[i] = s
    fala = np.clip(seg / (ref * .42), 0, 1)
    duck = p.get('ducking', {'musica': -9, 'ambiente': -5, 'efeitos': -5, 'transicoes': -6})
    for k, dbd in duck.items(): B[k] *= (db2(dbd * fala))[:, None]
    saida = Path(saida); (saida / 'stems').mkdir(parents=True, exist_ok=True)
    for k, b in B.items(): sf.write(saida / 'stems' / f'{k}.wav', b, SR, subtype='PCM_24')
    mix = sum(B.values()); pk = float(np.abs(mix).max()); mix = mix / max(pk, 1e-9) * .85
    bruto = saida / '_bruto.wav'; sf.write(bruto, mix, SR, subtype='PCM_24')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(bruto), '-af', f"acompressor=threshold=-22dB:ratio=2.2:attack=10:release=140,loudnorm=I={p.get('lufs', -16)}:TP=-1.5:LRA=9", '-ar', str(SR), '-ac', '2', '-map_metadata', '-1', str(saida / 'mix.wav')], check=True)
    bruto.unlink()
    json.dump({'duracao': tot, 'eventos': log, 'pico_antes_master': round(pk, 3)}, open(saida / 'mix_log.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('mix ok', tot, 'eventos', len(log), 'pico', round(pk, 3))

if __name__ == '__main__': mixa(sys.argv[1], sys.argv[2])
