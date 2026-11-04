"""Reads (never writes) the Brother Quill timeline and takes, and writes the exact event map of the 26 s clip.
The clip is gunther_final.mp4 from 143.0 s to 169.0 s, as recorded in the command that produced it."""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BQ = 'D:/projetos/BROTHER QUILL'
T0, T1 = 143.0, 169.0
t = json.load(open('D:/ViralReplicator_motion/remotion/public/gunther/timeline.json', encoding='utf-8'))
K = json.load(open(f'{BQ}/anim/out/c43/gunther_cortes.json'))
cenas = []
for i, c in enumerate(t['cenas']):
    fim = t['cenas'][i + 1]['inicio'] if i + 1 < len(t['cenas']) else t['total']
    if fim <= T0 or c['inicio'] >= T1:
        continue
    pal = [{'w': w['w'], 't': round(c['inicio'] + w['t'] - T0, 2)} for w in c['palavras']]
    takes = [{'t': round(k['t'] - T0, 2), 'tipo_v44': k['tipo'], 'whip': k['whip']} for k in K if k['cena'] == i and T0 - 1 < k['t'] < T1]
    cenas.append({'cena_v44': i, 'inicio': round(c['inicio'] - T0, 2), 'fim': round(fim - T0, 2), 'cenario': c.get('set') or c['m'], 'situacao': c.get('quem', ''), 'texto': c['texto'],
                  'fx': c.get('fx', []), 'snap': c.get('snap'), 'gag': c.get('gag'), 'pov': c.get('pov'), 'beats': c.get('beats'), 'drama': bool(c.get('drama')), 'palavras': pal, 'takes': takes})
out = {'fonte': {'video': f'{BQ}/saida/trecho_gunther_climax.mp4', 'recorte_de': f'{BQ}/saida/gunther_final.mp4', 'inicio_no_longo_s': T0, 'duracao_s': T1 - T0, 'resolucao': '1280x720', 'fps': 24, 'quadros': 624,
                 'audio_mixado_fonte': f'{BQ}/anim/out/gunther.wav', 'roteiro': f'{BQ}/roteiros/gen_gunther.py', 'cenarios_e_atuacao': f'{BQ}/anim/src/bq_gunther.js'}, 'cenas': cenas}
json.dump(out, open(os.path.join(R, 'shots', 'trecho_climax_eventos.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(cenas), 'cenas,', sum(len(c['takes']) for c in cenas), 'takes')
