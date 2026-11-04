"""Concept test on the ComfyUI already installed on this PC (nothing installed or downloaded, nothing sent outside).
Generates static character candidates to judge art direction. NOT cleared for publication: see docs/PESQUISA_PIPELINE.md.
Usage: python tools/teste_conceito_comfy.py <group> [--port 8199]"""
import json, os, shutil, sys, time, urllib.request, uuid
import psutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8199; URL = f'http://127.0.0.1:{PORT}'
CK = 'Juggernaut-XL_v9_RunDiffusionPhoto_v2.safetensors'
NEG = ('photo, photorealistic, realistic skin pores, 3d render, cgi, plastic, clay, doll, chibi, child, baby face, kids cartoon, '
       'extra fingers, missing fingers, deformed hands, deformed face, asymmetrical eyes, text, letters, watermark, signature, logo, '
       'swastika, nazi symbol, blurry, lowres, jpeg artifacts')
BASE = ('waist-up character portrait of a World War One German infantry soldier in 1918, M1916 Stahlhelm steel helmet, field grey wool tunic with belt '
        'and leather ammunition pouches, screaming in panic with mouth wide open, wide terrified eyes, one arm raised with open hand waving, centered, ')
STYLES = {
    'grafico': BASE + 'mature graphic novel illustration, confident bold ink lines, flat gouache colour blocks, strong shadow shapes, limited muted palette, professional animation key art, plain pale grey background',
    'cartoon': BASE + 'clean 2D cartoon for an adult animated history series, thick smooth black outline, simple round head, large expressive eyes, flat cel shading with two tones, appealing professional character design, plain pale grey background',
}
GROUPS = {
    'grafico': [('grafico', s) for s in (1101, 1102, 1103, 1104)],
    'cartoon': [('cartoon', s) for s in (2101, 2102, 2103, 2104)],
}

def post(path, data):
    r = urllib.request.Request(URL + path, json.dumps(data).encode(), {'Content-Type': 'application/json'})
    return json.load(urllib.request.urlopen(r, timeout=60))

def get(path):
    return json.load(urllib.request.urlopen(URL + path, timeout=30))

def gen_graph(pos, seed, prefix, w=1216, h=832, init=None, denoise=1.0):
    g = {
        '1': {'class_type': 'CheckpointLoaderSimple', 'inputs': {'ckpt_name': CK}},
        '2': {'class_type': 'CLIPTextEncode', 'inputs': {'clip': ['1', 1], 'text': pos}},
        '3': {'class_type': 'CLIPTextEncode', 'inputs': {'clip': ['1', 1], 'text': NEG}},
        '6': {'class_type': 'VAEDecode', 'inputs': {'samples': ['5', 0], 'vae': ['1', 2]}},
        '7': {'class_type': 'SaveImage', 'inputs': {'images': ['6', 0], 'filename_prefix': prefix}},
    }
    if init:
        g['8'] = {'class_type': 'LoadImage', 'inputs': {'image': init}}
        g['9'] = {'class_type': 'ImageScale', 'inputs': {'image': ['8', 0], 'upscale_method': 'lanczos', 'width': w, 'height': h, 'crop': 'center'}}
        g['4'] = {'class_type': 'VAEEncode', 'inputs': {'pixels': ['9', 0], 'vae': ['1', 2]}}
    else:
        g['4'] = {'class_type': 'EmptyLatentImage', 'inputs': {'width': w, 'height': h, 'batch_size': 1}}
    g['5'] = {'class_type': 'KSampler', 'inputs': {'model': ['1', 0], 'positive': ['2', 0], 'negative': ['3', 0], 'latent_image': ['4', 0], 'seed': seed, 'steps': 30, 'cfg': 5.5, 'sampler_name': 'dpmpp_2m', 'scheduler': 'karras', 'denoise': denoise}}
    return g

def run(graph, tag, rep):
    cid = uuid.uuid4().hex; t0 = time.time(); low = 99.0; vram = 0.0
    pid = post('/prompt', {'prompt': graph, 'client_id': cid})['prompt_id']
    while True:
        low = min(low, psutil.virtual_memory().available / 2**30)
        swap = psutil.swap_memory(); commit_livre = (psutil.virtual_memory().available + swap.free) / 2**30
        if low < .25 or commit_livre < 2.5:   # real out-of-memory risk: the page file still has room above this
            urllib.request.urlopen(urllib.request.Request(URL + '/interrupt', b'{}', {'Content-Type': 'application/json'}), timeout=30)
            raise SystemExit(f'Memoria critica (RAM livre {low:.2f} GB, commit {commit_livre:.2f} GB): interrompido')
        h = get('/history/' + pid)
        if pid in h:
            st = h[pid].get('status', {})
            if st.get('status_str') == 'error':
                raise SystemExit(json.dumps(st.get('messages', ''))[:1500])
            break
        try:
            s = get('/system_stats')['devices'][0]; vram = max(vram, (s['vram_total'] - s['vram_free']) / 2**30)
        except Exception:
            pass
        time.sleep(1)
    rep.append({'tag': tag, 's': round(time.time() - t0, 1), 'ram_livre_min_gb': round(low, 2), 'vram_pico_gb': round(vram, 2)})
    print(rep[-1], flush=True)

if __name__ == '__main__':
    group = sys.argv[1]; rep = []
    if group == 'hibrido':
        src = os.path.join(ROOT, 'output', 'style_frames', 'estilo_B_3D_estilizado.png')
        shutil.copy(src, os.path.join(r'D:\ComfyUI\input', 'sde_estilo_B.png'))
        for dn, seed in ((.5, 3101), (.65, 3102), (.8, 3103)):
            run(gen_graph(STYLES['grafico'].replace('plain pale grey background', 'misty battlefield with shattered trees'), seed, f'hibrido_d{int(dn*100)}', 1216, 688, 'sde_estilo_B.png', dn), f'hibrido_d{dn}', rep)
        os.remove(os.path.join(r'D:\ComfyUI\input', 'sde_estilo_B.png'))
    else:
        for st, seed in GROUPS[group]:
            run(gen_graph(STYLES[st], seed, f'{st}_{seed}'), f'{st}_{seed}', rep)
    json.dump(rep, open(os.path.join(ROOT, 'output', 'logs', f'conceito_{group}.json'), 'w'), indent=1)
