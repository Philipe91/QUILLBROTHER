"""Relatório do som a partir do MP4 e dos canais: níveis por canal, ducking, sincronia evento x ataque no canal, e áudio do MP4 x mixagem."""
import json, re, subprocess, sys
from collections import Counter
from pathlib import Path
import numpy as np, soundfile as sf
from scipy.signal import fftconvolve
proj, mp4, saida = Path(sys.argv[1]), sys.argv[2], Path(sys.argv[3]); SR = 48000
log = json.load(open(proj / 'assets/audio/mix_log.json', encoding='utf-8')); pl = json.load(open(proj / 'plano_audio.json', encoding='utf-8')); bib = json.load(open(Path(__file__).parent / 'biblioteca.json', encoding='utf-8'))['sons']
def nivel(p):
    e = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(p), '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    g = lambda k: (re.findall(k + r':\s+(-?[\d.]+|-inf)', e) or ['?'])[-1]
    return {'lufs': g('I'), 'lra': g('LRA'), 'pico_db': g('Peak')}
st = proj / 'assets/audio/stems'; canais = {c: sf.read(st / f'{c}.wav')[0] for c in ('voz', 'musica', 'ambiente', 'efeitos', 'transicoes')}
res = {'mp4': nivel(mp4), 'canais': {c: nivel(st / f'{c}.wav') for c in canais}}
# ducking: nível da trilha com e sem voz
v = np.abs(canais['voz']).mean(1); j = int(.05 * SR); e = np.sqrt(np.convolve(v ** 2, np.ones(j) / j, 'same')); fala = e > e.max() * .08
def db(x): return round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)), 1)
a = int(.5 * SR)
res['ducking'] = {c: {'com_voz_db': db(canais[c][fala]), 'sem_voz_db': db(canais[c][~fala])} for c in ('musica', 'ambiente', 'efeitos')}
res['voz_acima_da_trilha_db'] = round(db(canais['voz'][fala]) - db(canais['musica'][fala]), 1)
res['voz_acima_dos_efeitos_db'] = round(db(canais['voz'][fala]) - db(canais['efeitos'][fala]), 1)
# sincronia: para cada evento curto em canal próprio, ataque medido perto do tempo do evento
ef = np.abs(canais['efeitos']).mean(1); j2 = int(.004 * SR); env = np.convolve(ef, np.ones(j2) / j2, 'same'); sinc = []
for ev in log['eventos']:
    if not (ev['som'].startswith('passo') or ev['som'] in ('tecla', 'carimbo')): continue
    i0, i1 = int((ev['t'] - .02) * SR), int((ev['t'] + .05) * SR)
    if i0 < 0 or i1 >= len(env): continue
    base = env[max(0, i0 - int(.02 * SR)):i0].mean(); seg = env[i0:i1]; lim = base + (seg.max() - base) * .35
    k = int(np.argmax(seg > lim)); sinc.append(abs((i0 + k) / SR - ev['t']) * 1000)
res['sincronia_eventos'] = {'medidos': len(sinc), 'erro_medio_ms': round(float(np.mean(sinc)), 1), 'erro_max_ms': round(float(np.max(sinc)), 1), 'um_quadro_ms': 33.3}
# MP4 contém a mixagem, no tempo certo
b = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp4, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout; m = np.frombuffer(b, 'float32').astype(float)
x, _ = sf.read(proj / 'assets/audio/mix.wav'); x = x.mean(1); n = min(len(x), len(m), 8 * SR); c = fftconvolve(m[:n], x[:n][::-1]); off = (int(np.argmax(np.abs(c))) - (n - 1)) / SR
res['mp4_x_mixagem_defasagem_ms'] = round(off * 1000, 2); res['mp4_tem_som'] = bool(np.abs(m).max() > .01)
# efeitos usados e licenças
usados = Counter(ev['som'] for ev in log['eventos'])
res['efeitos_usados'] = [{'som': k, 'vezes': n, 'categoria': bib[k]['categoria'], 'licenca': bib[k]['licenca'], 'autor': bib[k].get('autor'), 'fonte': bib[k].get('fonte')} for k, n in usados.most_common()]
for b_ in [a_['som'] for a_ in pl['ambientes']] + [pl['musica']['som']]:
    res['efeitos_usados'].append({'som': b_, 'vezes': 1, 'categoria': bib[b_]['categoria'], 'licenca': bib[b_]['licenca'], 'autor': bib[b_].get('autor'), 'fonte': bib[b_].get('fonte')})
json.dump(res, open(saida, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: res[k] for k in ('mp4', 'canais', 'ducking', 'voz_acima_da_trilha_db', 'voz_acima_dos_efeitos_db', 'sincronia_eventos', 'mp4_x_mixagem_defasagem_ms', 'mp4_tem_som')}, ensure_ascii=False))
