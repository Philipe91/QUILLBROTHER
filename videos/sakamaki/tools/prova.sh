#!/bin/bash
# Prova visual: quadros do meio de cada cena pedida, sem renderizar tudo. Uso: tools/prova.sh <longo|short> id1,id2,... [quadro_rel=.55]
cd "$(dirname "$0")/.."
F=$1; IDS=$2; node tools/build.mjs "$F" --so="$IDS" || exit 1
cd "build/$F/prova"; python - "$IDS" "${3:-.55}" "$F" <<'E' > ../prova_t.txt
import json, sys
c = {x['id']: x for x in json.load(open('../../../cenas_%s.json' % sys.argv[3], encoding='utf-8'))}
ids = sys.argv[1].split(','); t = 0; o = []
for i in ids: o.append(f"{t + c[i]['dur'] * float(sys.argv[2]):.2f}"); t += c[i]['dur']
print(','.join(o))
E
T=$(cat ../prova_t.txt); npx --yes hyperframes@0.9.11 snapshot . --at "$T" 2>&1 | tail -3
