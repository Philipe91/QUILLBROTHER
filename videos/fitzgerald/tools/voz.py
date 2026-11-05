"""Gera os jobs de voz do roteiro. Uso: python voz.py <longo|short> [ids...] -> job_<formato>.json. Roda depois com vs_narrar.py."""
import json, sys
from pathlib import Path
R = Path(__file__).resolve().parent.parent; D = json.load(open(R / 'roteiro.json', encoding='utf-8')); f = sys.argv[1]; so = set(sys.argv[2:])
pasta = R / 'assets/voz' / f; pasta.mkdir(parents=True, exist_ok=True)
job = [{'id': i, 'texto': t, 'perfil': 'quill', 'lang': 'en', 'mp3': str(pasta / f'{i}.mp3').replace('\\', '/')} for _, i, t, *_x in D[f] if not so or i in so]
json.dump(job, open(R / f'job_{f}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f, len(job), 'falas;', sum(len(j['texto'].split()) for j in job), 'palavras')
