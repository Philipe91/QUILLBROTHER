"""Junta palavras de jobs parciais e reescreve job_<f>.json(.out) na ordem do roteiro. Uso: python juntar_voz.py <longo|short> <job_parcial.json> ..."""
import json, sys
from pathlib import Path
R = Path(__file__).resolve().parent.parent; f = sys.argv[1]; pp = R / f'assets/voz/{f}/palavras.json'; P = json.load(open(pp, encoding='utf-8'))
for jb in sys.argv[2:]:
    J = json.load(open(R / jb, encoding='utf-8')); O = json.load(open(R / (jb + '.out'), encoding='utf-8'))
    for j, o in zip(J, O): P[j['id']] = o
json.dump(P, open(pp, 'w', encoding='utf-8'), ensure_ascii=False)
D = json.load(open(R / 'roteiro.json', encoding='utf-8'))[f]; faltam = [x[1] for x in D if x[1] not in P]
if faltam: sys.exit(f'faltam {faltam}')
json.dump([{'id': x[1], 'texto': x[2], 'perfil': 'quill', 'lang': 'en', 'mp3': str(R / f'assets/voz/{f}/{x[1]}.mp3').replace('\\', '/')} for x in D], open(R / f'job_{f}.json', 'w', encoding='utf-8'), ensure_ascii=False)
json.dump([P[x[1]] for x in D], open(R / f'job_{f}.json.out', 'w', encoding='utf-8'), ensure_ascii=False)
d = sum(P[x[1]][-1]['t'] + P[x[1]][-1]['d'] for x in D); print(f, len(D), 'falas', round(d, 1), 's de voz')
