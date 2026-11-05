"""Gera metadados de upload (descrição com capítulos e fontes) em entrega/meta.json e pedaços de 9,5 MB para o Studio."""
import json, subprocess, sys
from pathlib import Path
R = Path(__file__).resolve().parent.parent; C = json.load(open(R / 'cenas_longo.json', encoding='utf-8')); ent = R / 'entrega'; ent.mkdir(exist_ok=True)
NOMES = {'c01': 'Ten men, nine heroes', 'c02': "Pearl Harbor's second attack", 'c03': 'The secret weapon', 'c04': 'The letter and the altar', 'c05': 'A broken compass', 'c06': 'The reef', 'c07': 'The beach', 'c08': 'Prisoner Number One', 'c09': 'Struck from the records', 'c10': 'The submarine goes on tour', 'c11': 'Internment University', 'c12': 'Going home', 'c13': 'Toyota and the silence', 'c14': 'Fredericksburg, 1991', 'c15': 'The monument'}
ini = {}
for c in C: ini.setdefault(c['cap'], c['t'])
caps = '\n'.join(f"{int(t // 60)}:{int(t % 60):02d} {NOMES[k]}" for k, t in ini.items())
FONTES = """Sources:
National WWII Museum, HA-19: https://www.nationalww2museum.org/war/articles/ha-19-hawaiis-lost-submarine
Warfare History Network: https://warfarehistorynetwork.com/article/ensign-kazuo-sakamaki-underwater-peril-at-pearl-harbor/
Pacific Wrecks, HA-19: https://pacificwrecks.com/sub/midget-c.html
Kamikaze Images, I Attacked Pearl Harbor (summary): https://www.kamikazeimages.net/books/personal/sakamaki/index.htm
Kamikaze Images, Mitsukue monument: https://www.kamikazeimages.net/monuments/mitsukue/index.htm
USS Salt Lake City CA-25: https://www.ussslcca25.com/prisoner.htm
Yahoo News: https://www.yahoo.com/news/one-japans-secret-weapons-pearl-124500668.html
Wikipedia, Kazuo Sakamaki: https://en.wikipedia.org/wiki/Kazuo_Sakamaki

Animated illustration: characters, documents and the painting are artistic interpretations, not reproductions. Sound effects and music are CC0."""
D = {
 'longo': {'titulo': "Why Japan Erased the Only Survivor of Pearl Harbor's Secret Subs", 'data': '05/11/2026', 'hora': '10:00',
  'descricao': f"""Ten men went to Pearl Harbor in secret submarines. Why did Japan erase the only one who survived?

On December 7, 1941, ten men took midget submarines to Pearl Harbor. Nine died and were honored as heroes. The tenth, Ensign Kazuo Sakamaki, survived a broken compass, a reef and a beach in Hawaii, became America's first Japanese prisoner of the war, and was struck from Japan's records. This is what happened to him next.

Chapters:
{caps}

{FONTES}

#history #ww2 #pearlharbor #truestory""", 'tags': 'pearl harbor, kazuo sakamaki, midget submarine, HA-19, pearl harbor story, ww2 history, first japanese pow, nine war gods, animated history'},
 'short': {'titulo': "What Happened to the Only Survivor of Pearl Harbor's Secret Subs?", 'data': '05/11/2026', 'hora': '11:00',
  'descricao': f"""Ten men went to Pearl Harbor in secret submarines. Nine died. What happened to number ten?

{FONTES}

#history #ww2 #pearlharbor #truestory #shorts"""}}
json.dump(D, open(ent / 'meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(caps); print(len(D['longo']['descricao']), 'caracteres')
