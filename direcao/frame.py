"""Renders one planned shot from a sequence JSON: the shot, its kit and pose are data; this file holds no story.
blender -b --factory-startup --python direcao/frame.py -- --seq shots/gunther_longlens.json --plano F1_S4_hold --res 960x540 --samples 16 --out x.png [--blend x.blend]"""
import argparse, json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path[:0] = [HERE, os.path.join(os.path.dirname(HERE), 'lookdev')]
import bpy
t0 = time.time()
ap = argparse.ArgumentParser()
ap.add_argument('--seq', default='shots/gunther_longlens.json'); ap.add_argument('--plano', required=True); ap.add_argument('--res', default='960x540'); ap.add_argument('--samples', type=int, default=16)
ap.add_argument('--out', required=True); ap.add_argument('--blend'); ap.add_argument('--camera')
a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:])
ROOT = os.path.dirname(HERE)
C = json.load(open(os.path.join(ROOT, a.seq), encoding='utf-8')); P = C['planos'][a.plano]
if a.camera:
    P['camera'].update(json.loads(a.camera))
bpy.ops.wm.read_factory_settings(use_empty=True)
import env, set_ondas, figura
from common import Mat, srgb
env.setup_render(C['render'], tuple(int(x) for x in a.res.split('x')), a.samples)
bpy.context.scene.eevee.volumetric_start = 3.0
m = dict(C['mundo']); m['fog_density'] = 0
env.build_world(m); set_ondas.luz_de_mundo(C['mundo']); set_ondas.nevoa(C['nevoa']); env.build_lights({'lights': C['luzes']}); env.build_camera(P['camera'])
T = set_ondas.montar(C)
pele = Mat('pele_f'); pele.pbr(srgb('#a88a72'), rough=.6, spec=.3)
couro = Mat('couro_f'); couro.pbr(srgb('#2a1c12'), rough=.55)
aco = env.gun_mat
def pintado(nome, c0, c1):
    M = Mat(nome); co = M.coord('Object'); n = M.noise(co, 14, 6, .6)
    M.pbr(M.ramp(n, [(.3, srgb(c0)), (.7, srgb(c1))]), rough=.5, normal=M.bump(n, .3, .01), spec=.4)
    return M.m
mats = {'pele': pele.m, 'couro': couro.m, 'aco': pintado('aco_g', '#2c302a', '#454a40'), 'aco_oliva': pintado('aco_o', '#35341f', '#4f4d30')}
gm = bpy.data.materials['gunmetal']; mad = Mat('madeira'); mad.pbr(srgb('#3a2616'), rough=.55)
for f in P['figuras']:
    arm = figura.criar(f['id'], C['kits'][f['kit']], mats)
    figura.aplicar_pose(arm, C['poses'][f['pose']])
    figura.por_no_chao(arm, T, f['x'], f['y'], f['yaw'] + (3.14159 if f.get('yaw_frente') else 0))
    if f.get('fuzil'):
        figura.fuzil(f['id'], arm, gm, mad.m, *f['fuzil'], direcao=f.get('fuzil_dir'))
for n in P.get('esconder', []):
    bpy.data.objects[n].hide_render = True
t1 = time.time()
if a.blend:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
tmp = os.path.abspath(a.out) + '.tmp.png'
bpy.context.scene.render.filepath = tmp
bpy.ops.render.render(write_still=True)
for _ in range(10):
    try:
        os.replace(tmp, os.path.abspath(a.out)); break
    except PermissionError:
        time.sleep(1)
t2 = time.time()
print(json.dumps({'BUILD_S': round(t1 - t0, 2), 'RENDER_S': round(t2 - t1, 2), 'objects': len(bpy.data.objects), 'polys': sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')}))
