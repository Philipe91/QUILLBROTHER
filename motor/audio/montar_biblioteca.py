"""Monta motor/audio/biblioteca.json e motor/audio/sons/.
Fontes: sons CC0 já usados no canal (com crédito registrado) e busca CC0 no Openverse para o que falta. Tudo com licença e origem.
Não executa nada dos arquivos baixados; o áudio só é lido pelo ffmpeg."""
import json, shutil, urllib.parse, urllib.request
from pathlib import Path
AQUI = Path(__file__).resolve().parent; S = AQUI / 'sons'; S.mkdir(exist_ok=True)
CAN = Path(r'D:\projetos\BROTHER QUILL\anim\assets'); CR = json.load(open(CAN / 'creditos_sons.json', encoding='utf-8'))
# chave -> (arquivo no canal, categoria, nível, extras)
DO_CANAL = {
 'passo_terra': ('sfx/passos.mp3', 'movimentacao', -13, {'modo': 'fatias'}), 'passo_terra_2': ('sfx/passos_2.mp3', 'movimentacao', -13, {'modo': 'fatias'}),
 'explosao_longe': ('sfx/explosao_longe.mp3', 'guerra', 2, {}), 'explosao_longe_2': ('sfx/explosao_longe_2.mp3', 'guerra', 2, {}), 'explosao_perto': ('sfx/explosao.mp3', 'guerra', 0, {}),
 'artilharia': ('sfx/canhao.mp3', 'guerra', -2, {}), 'metralhadora': ('sfx/metralhadora.mp3', 'guerra', -6, {}), 'bomba_assobio': ('sfx/bomba_assobio.mp3', 'guerra', -8, {}),
 'whoosh': ('sfx/whoosh.mp3', 'transicao', -15, {}), 'whoosh_2': ('sfx/whoosh_2.mp3', 'transicao', -15, {}),
 'papel': ('sfx/papel.mp3', 'documento', -12, {'ini': 0, 'dur': 1.1}), 'papel_2': ('sfx/papel_2.mp3', 'documento', -12, {'ini': 0, 'dur': 1.1}),
 'tecla': ('sfx/maquina_escrever.mp3', 'documento', -15, {'modo': 'fatias'}), 'relogio': ('sfx/relogio.mp3', 'documento', -18, {}),
 'vento': ('sfx/vento.mp3', 'ambiente', -22, {}), 'multidao_longe': ('sfx/multidao.mp3', 'ambiente', -26, {}), 'fogo': ('sfx/fogo.mp3', 'ambiente', -24, {}),
 'trilha_tensao': ('musica/tensao_2.mp3', 'musica', -22, {}), 'trilha_tensao_b': ('musica/tensao_3.mp3', 'musica', -22, {}),
}
LOCAIS = {'pano': ('movimentacao', -22, 'ruído filtrado com envelope'), 'equipamento': ('movimentacao', -24, 'parciais metálicas curtas'), 'impacto_suave': ('transicao', -12, 'grave descendente'), 'carimbo': ('documento', -10, 'golpe curto')}
# lacunas pedidas: busca CC0, duração curta
BUSCA = {'passo_madeira': ('footsteps wood floor', 'movimentacao'), 'passo_pedra': ('footsteps stone', 'movimentacao'), 'passo_lama': ('footsteps mud', 'movimentacao'), 'chuva': ('rain ambience', 'ambiente'), 'floresta': ('forest ambience birds', 'ambiente'), 'interior_sala': ('room tone', 'ambiente'), 'cidade_antiga': ('town square ambience', 'ambiente')}
bib = {}
for k, (f, cat, nv, ex) in DO_CANAL.items():
    c = CR[f]; dst = S / (k + Path(f).suffix); shutil.copy2(CAN / f, dst)
    bib[k] = {'arquivo': f'sons/{dst.name}', 'categoria': cat, 'nivel': nv, 'origem': 'cc0', 'licenca': c['licenca'], 'titulo': c.get('titulo'), 'autor': c.get('autor'), 'fonte': c.get('fonte'), **ex}
for k, (cat, nv, d) in LOCAIS.items(): bib[k] = {'categoria': cat, 'nivel': nv, 'origem': 'local', 'licenca': 'produzido localmente', 'titulo': d, 'autor': 'Dark Engine', 'fonte': 'motor/audio/mixer.py'}
for k, (q, cat) in BUSCA.items():
    try:
        u = 'https://api.openverse.org/v1/audio/?' + urllib.parse.urlencode({'q': q, 'license': 'cc0', 'page_size': 8})
        r = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': 'dark-engine'}), timeout=25))['results']
        r = [x for x in r if x.get('license') == 'cc0' and 2000 < (x.get('duration') or 0) < 90000 and str(x.get('url', '')).startswith('https://cdn.freesound.org/')]
        if not r: print('sem resultado', k); continue
        x = r[0]; dst = S / f'{k}.mp3'
        urllib.request.urlretrieve(x['url'], dst)
        bib[k] = {'arquivo': f'sons/{dst.name}', 'categoria': cat, 'nivel': -14 if cat == 'movimentacao' else -24, 'modo': 'fatias' if cat == 'movimentacao' else None, 'origem': 'cc0', 'licenca': 'cc0', 'titulo': x.get('title'), 'autor': x.get('creator'), 'fonte': x.get('foreign_landing_url') or x['url']}
        print('ok', k, x.get('title'), x.get('creator'))
    except Exception as e: print('falhou', k, str(e)[:90])
json.dump({'nota': 'Sons só CC0 ou produzidos localmente. Sons CC0 não foram ouvidos por uma pessoa; conferir antes de publicar.', 'sons': bib}, open(AQUI / 'biblioteca.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(bib), 'sons')  # níveis finos são ajustados em biblioteca.json depois da medição
