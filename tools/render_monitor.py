"""One Blender render at a time, with resource monitoring and a safety stop.
Usage: python tools/render_monitor.py --tag A_final -- <args for build_frame.py>
Samples process RAM, system free RAM, GPU memory/utilisation/temperature/power (as reported by nvidia-smi, not a wattmeter)."""
import argparse, json, os, subprocess, sys, time
import psutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLENDER = os.path.expandvars(r'%LOCALAPPDATA%\Programs\Blender\blender.exe')
MIN_FREE_GB = 0.3   # physical RAM; the page file absorbs short peaks. Commit headroom is checked too
MIN_COMMIT_GB = 2.5
i = sys.argv.index('--')
ap = argparse.ArgumentParser(); ap.add_argument('--tag', required=True); ap.add_argument('--script', default='lookdev/build_frame.py')
a = ap.parse_args(sys.argv[1:i]); rest = sys.argv[i + 1:]

def gpu():
    o = subprocess.run(['nvidia-smi', '--query-gpu=memory.used,utilization.gpu,temperature.gpu,power.draw', '--format=csv,noheader,nounits'], capture_output=True, text=True).stdout.strip().split(',')
    return [float(x) for x in o]

for p in psutil.process_iter(['name']):
    if (p.info['name'] or '').lower() == 'blender.exe':
        sys.exit('Ja existe um Blender rodando: um processo por vez.')
g0 = gpu(); free0 = psutil.virtual_memory().available / 2**30
if free0 < .9:
    sys.exit(f'RAM livre insuficiente: {free0:.1f} GB')
log = os.path.join(ROOT, 'output', 'logs', a.tag + '.blender.log')
t0 = time.time()
with open(log, 'w', encoding='utf-8') as f:
    p = subprocess.Popen([BLENDER, '-b', '--factory-startup', '--python', os.path.join(ROOT, a.script), '--', *rest], stdout=f, stderr=subprocess.STDOUT, cwd=ROOT)
    ps = psutil.Process(p.pid); ram = vram = temp = pw = util = 0.0; low = free0; stopped = False
    while p.poll() is None:
        try:
            ram = max(ram, ps.memory_info().rss / 2**30)
            free = psutil.virtual_memory().available / 2**30; low = min(low, free)
            G = gpu(); vram = max(vram, G[0]); util = max(util, G[1]); temp = max(temp, G[2]); pw = max(pw, G[3])
            if free < MIN_FREE_GB or free + psutil.swap_memory().free / 2**30 < MIN_COMMIT_GB:
                p.kill(); stopped = True; break
        except psutil.Error:
            pass
        time.sleep(1)
    rc = p.wait()
txt = open(log, encoding='utf-8', errors='replace').read()
stats = {}
for line in txt.splitlines():
    if line.startswith('{"BUILD_S"'):
        stats = json.loads(line)
rep = {'tag': a.tag, 'args': rest, 'exit': rc, 'parado_por_ram': stopped, 'total_s': round(time.time() - t0, 1), **stats, 'ram_pico_gb': round(ram, 2), 'ram_livre_antes_gb': round(free0, 2), 'ram_livre_min_gb': round(low, 2), 'vram_pico_mb': vram, 'vram_antes_mb': g0[0], 'gpu_util_pico': util, 'temp_pico_c': temp, 'potencia_pico_w_nvsmi': pw}
json.dump(rep, open(os.path.join(ROOT, 'output', 'logs', a.tag + '.json'), 'w'), indent=1)
print(json.dumps(rep))
if rc or not stats:
    print('\n'.join(txt.splitlines()[-25:]))
