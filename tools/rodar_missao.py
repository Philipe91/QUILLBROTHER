"""Keeps a resumable frame render going until every frame exists. Waits for memory instead of failing; one Blender at a time.
python tools/rodar_missao.py --tag NAME --dir output/... --res WxH --samples N [--tentativas 40] [--blend x.blend]"""
import argparse, glob, os, subprocess, sys, time
import psutil
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--tag', required=True); ap.add_argument('--dir', required=True); ap.add_argument('--res', required=True); ap.add_argument('--samples', default='8'); ap.add_argument('--tentativas', type=int, default=40); ap.add_argument('--blend')
ap.add_argument('--frames', default='0:360')
a = ap.parse_args()
sp = [int(x) for x in a.frames.split(':')]; total = len(range(sp[0], sp[1], sp[2] if len(sp) > 2 else 1))
os.makedirs(os.path.join(ROOT, a.dir), exist_ok=True)
log = open(os.path.join(ROOT, a.dir, 'execucoes.txt'), 'a', encoding='utf-8')
def diz(*m):
    s = time.strftime('%Y-%m-%d %H:%M:%S ') + ' '.join(str(x) for x in m); print(s, flush=True); log.write(s + '\n'); log.flush()
for k in range(a.tentativas):
    feitos = len(glob.glob(os.path.join(ROOT, a.dir, 'f[0-9][0-9][0-9][0-9].png')))
    if feitos >= total:
        diz('completo', feitos); sys.exit(0)
    esperou = 0
    while psutil.virtual_memory().available / 2**30 < 1.1 and esperou < 900:
        time.sleep(30); esperou += 30
    diz('tentativa', k + 1, 'feitos', feitos, 'RAM livre', round(psutil.virtual_memory().available / 2**30, 2), 'esperou', esperou)
    cmd = [sys.executable, os.path.join(ROOT, 'tools', 'render_monitor.py'), '--tag', f'{a.tag}_{k}', '--script', 'direcao/sequencia.py', '--', '--res', a.res, '--samples', a.samples, '--dir', a.dir, '--frames', a.frames]
    if a.blend and k == 0:
        cmd += ['--blend', a.blend]
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, errors='replace')
    diz('saida', r.returncode, (r.stdout or '')[:600].replace('\n', ' '), (r.stderr or '')[-300:].replace('\n', ' '))
    time.sleep(5)
feitos = len(glob.glob(os.path.join(ROOT, a.dir, 'f[0-9][0-9][0-9][0-9].png')))
diz('fim sem completar', feitos, 'de', total); sys.exit(0 if feitos >= total else 1)
