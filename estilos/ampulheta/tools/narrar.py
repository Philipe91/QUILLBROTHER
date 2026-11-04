"""Etapa 2: gera a voz por cena (Kokoro local), monta a faixa e tira os tempos por palavra com Whisper. Escreve assets/audio/narracao.wav e timing.json."""
import json, subprocess, sys, unicodedata, re
from pathlib import Path
import numpy as np, soundfile as sf
R = Path(__file__).resolve().parent.parent; S = json.load(open(R / 'scenes.json', encoding='utf-8')); V = S['voz']; D = R / 'assets/audio/voz'; D.mkdir(parents=True, exist_ok=True)
FORCA = '--forca' in sys.argv
for c in S['cenas']:
    w = D / (c['id'] + '.wav'); tx = D / (c['id'] + '.txt')
    if not c['narracao_tts']: continue
    if FORCA or not w.exists() or not tx.exists() or tx.read_text(encoding='utf-8') != c['narracao_tts']:
        subprocess.run(f'npx --yes hyperframes@0.9.11 tts "{c["narracao_tts"]}" -v {V["id"]} -l {V["lang"]} -s {V["velocidade"]} -o "{w}"', shell=True, check=True, cwd=R, stdout=subprocess.DEVNULL)
        tx.write_text(c['narracao_tts'], encoding='utf-8')
    print(c['id'], round(sf.info(w).duration, 2), flush=True)
import whisper
m = whisper.load_model('small')
SR = 24000; res = {}
for c in S['cenas']:
    if not c['narracao_tts']: continue
    a, sr = sf.read(D / (c['id'] + '.wav')); a = a if a.ndim == 1 else a.mean(1); 
    env = np.abs(a) > .012; i = np.flatnonzero(env); ini, fim = i[0] / sr, i[-1] / sr
    r = m.transcribe(str(D / (c['id'] + '.wav')), language='pt', word_timestamps=True, fp16=False, initial_prompt=c['narracao'])
    res[c['id']] = {'dur': len(a) / sr, 'voz_ini': ini, 'voz_fim': fim, 'palavras': [{'p': w['word'].strip(), 'i': round(w['start'], 2), 'f': round(w['end'], 2)} for s in r['segments'] for w in s['words']], 'ouvido': r['text'].strip()}
    print(c['id'], res[c['id']]['ouvido'], flush=True)
json.dump(res, open(R / 'timing_voz.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
