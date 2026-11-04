"""Builds and renders one style frame.
blender -b --factory-startup --python lookdev/build_frame.py -- --style B --res 960x540 --samples 16 --out x.png [--blend x.blend] [--sem-personagem]"""
import argparse, json, os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bpy

t0 = time.time()
ap = argparse.ArgumentParser()
ap.add_argument('--style', default='B'); ap.add_argument('--res', default='960x540'); ap.add_argument('--samples', type=int, default=16)
ap.add_argument('--out', required=True); ap.add_argument('--blend'); ap.add_argument('--shot', default='shots/ref_t18_80.json')
ap.add_argument('--sem-personagem', action='store_true'); ap.add_argument('--camera')
a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:])
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(os.path.join(ROOT, a.shot), encoding='utf-8'))
if a.camera:   # debug override: JSON patch for the camera, e.g. a close-up on the face
    cfg['camera'].update(json.loads(a.camera))
bpy.ops.wm.read_factory_settings(use_empty=True)
import env
res = tuple(int(x) for x in a.res.split('x'))
env.setup_render(cfg['render'], res, a.samples)
env.build_world(cfg['mundo']); env.build_lights({'lights': cfg['luzes']}); env.build_camera(cfg['camera']); env.build_set(cfg)
if not a.sem_personagem:
    if a.style == 'A':
        import char_a; char_a.build(cfg['personagem'])
    else:
        import char_b; char_b.build(cfg['personagem'])
t1 = time.time()
if a.blend:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
tmp = os.path.abspath(a.out) + '.tmp.png'
bpy.context.scene.render.filepath = tmp
bpy.ops.render.render(write_still=True)
for _try in range(10):
    try:
        os.replace(tmp, os.path.abspath(a.out)); break
    except PermissionError:
        time.sleep(1)
t2 = time.time()
polys = sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')
print(json.dumps({'BUILD_S': round(t1 - t0, 2), 'RENDER_S': round(t2 - t1, 2), 'objects': len(bpy.data.objects), 'polys': polys}))
