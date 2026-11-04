"""Builds the whole scene, bakes all acting and cameras to keyframes, and renders any frame range, resuming missing frames.
blender -b --factory-startup --python direcao/sequencia.py -- --seq shots/gunther_missao15.json --res 640x360 --samples 8 --dir output/... [--frames 0:360[:step]] [--list 12,40] [--blend x.blend] [--sem-blur]"""
import argparse, json, math, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path[:0] = [HERE, os.path.join(ROOT, 'lookdev')]
import numpy as np
import bpy
from mathutils import Vector as V, Quaternion as Q, Matrix, Euler
t00 = time.time()
ap = argparse.ArgumentParser()
ap.add_argument('--seq', default='shots/gunther_missao15.json'); ap.add_argument('--res', default='640x360'); ap.add_argument('--samples', type=int, default=8)
ap.add_argument('--dir', required=True); ap.add_argument('--frames', default='0:360'); ap.add_argument('--list'); ap.add_argument('--blend'); ap.add_argument('--sem-blur', action='store_true'); ap.add_argument('--qa-so', action='store_true'); ap.add_argument('--continuo', action='store_true')
a = ap.parse_args(sys.argv[sys.argv.index('--') + 1:])
C = json.load(open(os.path.join(ROOT, a.seq), encoding='utf-8'))
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'
import env, set_ondas, figura, figura2, locomocao as LO, atuacao as AT, char_b
from common import *

scn = bpy.context.scene
env.setup_render(C['render'], tuple(int(x) for x in a.res.split('x')), a.samples)
scn.eevee.volumetric_start = 3.0
scn.render.fps = C['fps']
if not a.sem_blur:
    scn.render.use_motion_blur = True; scn.render.motion_blur_shutter = .45
    if hasattr(scn.eevee, 'motion_blur_steps'):
        scn.eevee.motion_blur_steps = 1
m = dict(C['mundo']); m['fog_density'] = 0
env.build_world(m); set_ondas.luz_de_mundo(C['mundo']); set_ondas.nevoa(C['nevoa']); env.build_lights({'lights': C['luzes']})
T = set_ondas.montar(C)

# ---------- extra ground detail near the action: stones, clods, debris, a long strip of grass for foreground ----------
def detalhes():
    rng = np.random.default_rng(31); parts = []
    for _ in range(620):
        x = rng.uniform(-13, 13); y = rng.uniform(-110, 12); s = rng.uniform(.03, .1)
        if abs(x + .3) < 1.0:
            continue
        v, f = rbox((0, 0, 0), (s * rng.uniform(1, 2), s * rng.uniform(1, 2), s * rng.uniform(.5, 1)), r=.8, n=3, noise=.5, seed=int(rng.integers(999)))
        parts.append((xf(v, rot_trs((x, y, float(T(x, y)) + s * .15), (rng.uniform(-.4, .4), rng.uniform(-.4, .4), rng.uniform(0, 6)))), f))
    M = Mat('pedra'); co = M.coord('Object'); n = M.noise(co, 22, 5, .6)
    M.pbr(M.ramp(n, [(.3, srgb('#2a2620')), (.7, srgb('#6a6252'))]), rough=.88, normal=M.bump(n, .6, .01))
    add_mesh('pedras', *merge(parts), M.m)
    # wreckage along the road: crates and a broken wheel shape give scale and period without a text card
    bark = bpy.data.materials['bark']
    parts = []
    for x, y, r in ((-3.4, -44, 1.1), (-4.2, -91, .2), (-3.6, -66, 2.0), (-3.2, -24, 1.5)):
        v, f = rbox((0, 0, .17), (.75, .5, .36), r=.2, n=4); parts.append((xf(v, rot_trs((x, y, float(T(x, y))), (0, .12, r))), f))
    add_mesh('caixotes', *merge(parts), bark)
    g = bpy.data.materials['capim']
    set_ondas.capim(T, g, -115, -18, 26, 2600, seed=17)
detalhes()

# ---------- cast ----------
pele = Mat('pele_f'); co = pele.coord('Object'); pele.pbr(pele.ramp(pele.noise(co, 30, 4, .6), [(.3, srgb('#7f6452')), (.7, srgb('#987a66'))]), rough=.55, spec=.35)
couro = Mat('couro_f'); co = couro.coord('Object'); nn = couro.noise(co, 40, 4, .6); couro.pbr(couro.ramp(nn, [(.3, srgb('#2c1e14')), (.7, srgb('#54392a'))]), rough=.48, normal=couro.bump(nn, .3, .006))
def pintado(nome, c0, c1):
    M = Mat(nome); co = M.coord('Object'); n = M.noise(co, 14, 6, .6); ch = M.ramp(M.noise(co, 32, 6, .7), [(.66, (0, 0, 0)), (.72, (1, 1, 1))])
    M.pbr(M.mix(ch, M.ramp(n, [(.3, srgb(c0)), (.7, srgb(c1))]), srgb('#1e1c18')), rough=.46, normal=M.bump(n, .3, .01), spec=.5)
    return M.m
escuro = Mat('escuro'); escuro.pbr(srgb('#1c1210'), rough=.7)
rs = Mat('rosto'); co = rs.coord('Object'); nr = rs.noise(co, 60, 4, .6)
b_ = rs.ramp(rs.noise(co, 18, 5, .6), [(.3, srgb('#7a5f4e')), (.7, srgb('#9a7d69'))])
st_ = rs.ramp(rs.noise(co, 700, 2, .5), [(.3, (.2, .2, .2)), (.7, (1, 1, 1))])
b_ = rs.mix(rs.math('MULTIPLY', rs.math('MULTIPLY', rs.attr('barba', 'Red'), st_), .62), b_, srgb('#2a2420'))
rs.pbr(b_, rough=.5, normal=rs.bump(nr, .12, .002), sss=.25, sss_radius=(1, .4, .25), spec=.4)
mats = {'pele': pele.m, 'couro': couro.m, 'escuro': escuro.m, 'rosto': rs.m, 'aco': pintado('aco_g', '#2f332d', '#4f544a'), 'aco_oliva': pintado('aco_o', '#3f3e26', '#5f5c3a')}
gm = bpy.data.materials['gunmetal']; mad = Mat('madeira'); n_ = mad.noise(mad.mapped(mad.coord('Object'), (20, 2, 20)), 8, 4, .6); mad.pbr(mad.ramp(n_, [(.3, srgb('#3a2616')), (.7, srgb('#6b4728'))]), rough=.42, normal=mad.bump(n_, .2, .003))

def rosto_henry(arm, Cc):
    """A sculpted head on one topology, with a breath shape key. Scale matches the body; the eyes and brow are separate parts."""
    e0 = {'open': .35, 'wide': .25, 'brow': -.006, 'eye': .15, 'fold': .8}; e1 = {'open': 1.5, 'wide': .35, 'brow': -.01, 'eye': .2, 'fold': 1.0}
    P1, P0, F, at = char_b.build_head(e1, e0)
    k = .76; loc = lambda p: np.asarray(p) * k + np.array(Cc) + np.array([0, .006, .002])
    sm = char_b.skin_mat()
    o = add_mesh('henry_cabeca', loc(P0), F, sm, attrs=at)
    o.shape_key_add(name='base'); sk = o.shape_key_add(name='ofego'); sk.data.foreach_set('co', loc(P1).ravel())
    bb = {'head': figura2.OSSOS['head'][:2]}
    skin(o, arm, bb)
    ey = char_b.eye_mat(); hm = Mat('sobr'); hm.pbr(srgb('#1c1610'), rough=.7)
    gaze = (0, -40, 1.6)
    for s in (-1, 1):
        v, f, at2 = char_b.eyeball(s, gaze); ob = add_mesh(f'henry_olho{s}', loc(v), f, ey, attrs=at2); skin(ob, arm, bb)
        v, f = char_b.lid(s, 15, -24, sm); na = np.ones(len(v)) * .75
        ob = add_mesh(f'henry_palp{s}', loc(v), f, sm, attrs={'ao': na, 'zona': np.zeros((len(v), 3)), 'zona2': np.tile([0, 0, .4], (len(v), 1))}); skin(ob, arm, bb)
        v, f = char_b.brow(s, e1); ob = add_mesh(f'henry_sobr{s}', loc(v), f, hm.m); skin(ob, arm, bb)
    return sk

_orig_uv = None
henry_arm = figura2.criar('henry', C['kits']['americano'], mats)
E_h = LO.Esqueleto(henry_arm, figura2.OSSOS)
K = C['corrida']
vm = K['v']; f0, f1 = K['freio_t0'], K['freio_t1']
vfun = lambda t: vm * (1 - LO.smoo(f0, f1, t))
cfun = lambda t: K['cadencia'] * (1 + .12 * LO.smoo(f0 - .2, f0 + .25, t))
CO = LO.Corrida(T, K['inicio'], K['direcao'], vfun, cfun, tf=C['duracao'])
H = AT.Corredor(E_h, CO)
rifle = figura2.fuzil('henry_fuzil', gm, mad.m, couro.m)
madeira_ob = bpy.data.objects['henry_fuzil_madeira']; madeira_ob.parent = rifle; rifle.rotation_mode = 'QUATERNION'

progs = {'g1': AT.prog_g1, 'g2': AT.prog_g2}
sold = []
for s in C['soldados']:
    arm = figura2.criar(s['id'], C['kits']['alemao'], mats)
    sold.append(AT.Soldado(LO.Esqueleto(arm, figura2.OSSOS), s['x'], s['y'], T, s['yaw'], progs[s['prog']]))

# ---------- dust: a few soft puffs at each landing, keyed scale and opacity ----------
dm = Mat('poeira'); nt = dm.nt
oi = nt.nodes.new('ShaderNodeObjectInfo'); lw = nt.nodes.new('ShaderNodeLayerWeight'); lw.inputs[0].default_value = .5
fac = dm.math('MULTIPLY', dm.math('POWER', dm.math('SUBTRACT', 1.0, lw.outputs['Facing'], True), 2.2), oi.outputs['Alpha'])
ems = nt.nodes.new('ShaderNodeBsdfDiffuse'); ems.inputs[0].default_value = (*srgb('#8a7a64'), 1)
tr = nt.nodes.new('ShaderNodeBsdfTransparent'); mx = nt.nodes.new('ShaderNodeMixShader')
nt.links.new(fac, mx.inputs[0]); nt.links.new(tr.outputs[0], mx.inputs[1]); nt.links.new(ems.outputs[0], mx.inputs[2]); nt.links.new(mx.outputs[0], dm.out.inputs['Surface'])
dm.m.surface_render_method = 'BLENDED'
pv, pf = uv_sphere((0, 0, 0), 1, 16, 10)
pme = bpy.data.meshes.new('puff'); pme.from_pydata(pv.tolist(), [], pf); pme.update(); pme.shade_smooth(); pme.materials.append(dm.m)
rng = np.random.default_rng(55); nd = 0
for p in CO.plants:
    if p['t'] < -.4 or p['t'] > C['duracao']:
        continue
    for k in range(4):
        ob = bpy.data.objects.new(f'p{nd}', pme); scn.collection.objects.link(ob); nd += 1
        dx, dy = rng.normal(0, .12), rng.normal(-.2, .22)
        ini = V((p['xy'][0] + dx, p['xy'][1] + dy, p['z'] + .04)); d = V((rng.normal(0, .16), rng.normal(-.22, .2), rng.uniform(.14, .34)))
        fi = int(p['t'] * C['fps']); vida = int(rng.uniform(11, 21)); a0 = rng.uniform(.12, .26)
        for fr, u in ((fi - 1, 0), (fi, .02), (fi + 3, .2), (fi + vida // 2, .55), (fi + vida, 1)):
            ob.location = ini + d * (1 - (1 - u) ** 2); ob.scale = [(.05 + .34 * u ** .6)] * 3; ob.color = (1, 1, 1, a0 * (1 - u) ** 1.5 * (0 if fr < fi else 1))
            ob.keyframe_insert('location', frame=fr); ob.keyframe_insert('scale', frame=fr); ob.keyframe_insert('color', frame=fr)

# ---------- bake ----------
FPS = C['fps']; NF = int(C['duracao'] * FPS)
slips = {}; resid = []; pulso = []
t1 = time.time()
for fr in range(-3, NF + 4):
    t = fr / FPS
    grip, d = H.pose(t); E_h.key(fr)
    # keep the rifle exactly in the hands
    y = d.normalized(); up = (V((0, 0, 1)) - y * y.z).normalized(); x = y.cross(up)
    R = Matrix((x, y, up)).transposed()
    rifle.location = grip; rifle.rotation_quaternion = R.to_quaternion()
    rifle.keyframe_insert('location', frame=fr); rifle.keyframe_insert('rotation_quaternion', frame=fr)
    for sd in 'LR':
        c, l, p, st = CO.pe(sd, t)
        if st:
            cur = E_h.tail('shin_' + sd); plan = LO.ankle_de(c, l, p, H.d)
            resid.append((cur - plan).length)
            pl = [q for q in CO.pl[sd] if q['t'] <= t <= q['t1']]
            if pl and abs(p) < .02:
                key = (sd, round(pl[-1]['t'], 3)); slips.setdefault(key, []).append((cur.x, cur.y))
    pulso.append((E_h.tail('fore_R') - grip).length)
    for S in sold:
        S.pose(t); S.E.key(fr)
print('BAKE_S', round(time.time() - t1, 1))
slip_max = max(((max(max(abs(a[0] - b[0]), abs(a[1] - b[1])) for a in v for b in v)) for v in slips.values() if len(v) > 1), default=0)
qa = {'plantas': len(CO.plants), 'erro_ik_pe_max_mm': round(max(resid) * 1000, 2), 'deslize_pe_plano_max_mm': round(slip_max * 1000, 2), 'erro_mao_rifle_max_mm': round(max(pulso) * 1000, 2)}
print('QA', json.dumps(qa))

# ---------- cameras (each shot has its own camera, keyed, with reasons in the JSON) ----------
TK = C['tomadas']; ends = [s['t0'] for s in TK[1:]] + [C['duracao']]
# cuts snap to the nearest foot landing, so a cut always lands on an impact
for s, e in zip(TK[1:], ends):
    land = min((p['t'] for p in CO.plants), key=lambda x: abs(x - s['t0'])); s['t0'] = round(land * FPS) / FPS
ends = [s['t0'] for s in TK[1:]] + [C['duracao']]
hand = lambda t, s: V((math.sin(t * 1.7 + s) + .5 * math.sin(t * 4.1 + s), math.sin(t * 1.3 + s * 2) + .5 * math.sin(t * 3.7), .7 * math.sin(t * 2.3 + s)))
def filt(arr, lag):
    return LO.mola(np.array(arr), 1 / FPS, f=lag, z=.9, x0=arr[0])
cams = []
for i, (s, e) in enumerate(zip(TK, ends)):
    cd = bpy.data.cameras.new(s['id']); cd.sensor_width = 36; cd.dof.use_dof = True; cd.dof.aperture_fstop = s['f']
    ob = bpy.data.objects.new(s['id'], cd); scn.collection.objects.link(ob); ob.rotation_mode = 'QUATERNION'
    f0_, f1_ = int(round(s['t0'] * FPS)), int(round(e * FPS))
    frs = list(range(f0_ - 2, f1_ + 3)); xs = [[], [], []]; alvo = [[], [], []]
    for fr in frs:
        t = fr / FPS; xy = CO.xy(t); hipz = float(H.hip[H.idx(t)]); ch_ = H.C.chao_suave(t)
        if s['modo'] == 'segue':
            u = LO.smoo(s['t0'], e, t); o = np.array(s['offset'], float)
            if 'offset_fim' in s:
                o = o + (np.array(s['offset_fim']) - o) * u
            py = xy[1]
            if 'offset_fixa_apos' in s:
                py = CO.xy(min(t, s['offset_fixa_apos']))[1]
            gc = float(T(xy[0] + o[0], py + o[1]))
            zref = hipz if abs(o[0]) < 8 else max(gc, ch_ - .3)
            P_ = (xy[0] + o[0], py + o[1], (zref + o[2]) if abs(o[0]) < 8 else (zref + o[2]))
        else:
            P_ = s['pos']
        for j in range(3):
            xs[j].append(P_[j])
        H.pose(t)
        if 'mira_mundo' in s:
            A_ = s['mira_mundo']
        else:
            ref = E_h.head['head'] if s.get('mira_osso') == 'head' else (E_h.head['chest'])
            off = s.get('mira_offset', [0, 0, 0]); A_ = (ref.x + off[0], ref.y + off[1], ref.z + off[2])
        for j in range(3):
            alvo[j].append(A_[j])
    xs = [filt(v, s.get('lag', 2) * 1.0) for v in xs]; alvo = [filt(v, s.get('lag', 2)) for v in alvo]
    for n, fr in enumerate(frs):
        t = fr / FPS; u = LO.smoo(s['t0'], e, t)
        p = V((xs[0][n], xs[1][n], xs[2][n])); q = V((alvo[0][n], alvo[1][n], alvo[2][n]))
        dist = (q - p).length
        q = q + hand(t, i * 3.1) * s['mao'] * dist * .12
        ob.location = p; ob.rotation_quaternion = (q - p).to_track_quat('-Z', 'Y')
        ob.keyframe_insert('location', frame=fr); ob.keyframe_insert('rotation_quaternion', frame=fr)
        cd.lens = s['lente'][0] + (s['lente'][1] - s['lente'][0]) * u; cd.keyframe_insert('lens', frame=fr)
        H.pose(t)
        fo = {'henry': E_h.head['chest'], 'head': E_h.head['head']}.get(s['foco'], V(s.get('mira_mundo', (0, 0, 0))))
        cd.dof.focus_distance = (fo - p).length; cd.dof.keyframe_insert('focus_distance', frame=fr)
    cams.append((f0_, f1_, ob))
    mk = scn.timeline_markers.new(s['id'], frame=f0_); mk.camera = ob
scn.frame_start, scn.frame_end = 0, NF - 1
qa['cortes_s'] = [round(c[0] / FPS, 3) for c in cams]
print('QA', json.dumps(qa))
os.makedirs(os.path.join(ROOT, a.dir), exist_ok=True)
json.dump(qa, open(os.path.join(ROOT, a.dir, 'qa_animacao.json'), 'w'), indent=1)
json.dump({'plantas': [{'t': p['t'], 'lado': p['lado']} for p in CO.plants], 'cortes': qa['cortes_s']}, open(os.path.join(ROOT, a.dir, 'eventos.json'), 'w'))
for nome in C.get('esconder_em_S5', []):
    ob = bpy.data.objects[nome]; f5 = cams[-1][0]
    ob.hide_render = False; ob.keyframe_insert('hide_render', frame=-5); ob.hide_render = True; ob.keyframe_insert('hide_render', frame=f5)
t2 = time.time()
if a.blend:
    bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(a.blend))
    print('BLEND salvo')
if a.qa_so:
    print(json.dumps({'BUILD_S': round(t2 - t00, 2), 'RENDER_S': 0, 'objects': len(bpy.data.objects), 'polys': sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH')})); sys.exit(0)

# ---------- render (resumable) ----------
if a.list:
    FR = [int(x) for x in a.list.split(',')]
else:
    sp = [int(x) for x in a.frames.split(':')]; FR = list(range(sp[0], sp[1], sp[2] if len(sp) > 2 else 1))
log = open(os.path.join(ROOT, a.dir, 'progresso.txt'), 'a', encoding='utf-8')
tr0 = time.time(); fez = 0
for fr in FR:
    out = os.path.join(ROOT, a.dir, f'f{fr:04d}.png')
    if os.path.exists(out) and os.path.getsize(out) > 2000:
        continue
    t3 = time.time()
    scn.camera = next(c[2] for c in cams if c[0] <= fr < c[1]) if any(c[0] <= fr < c[1] for c in cams) else cams[-1][2]
    scn.frame_set(fr)
    tmp = out + '.tmp.png'; scn.render.filepath = tmp
    bpy.ops.render.render(write_still=True)
    for _ in range(12):
        try:
            os.replace(tmp, out); break
        except PermissionError:
            time.sleep(1)
    fez += 1; log.write(f'{fr} {time.time() - t3:.2f}s\n'); log.flush()
print(json.dumps({'BUILD_S': round(t2 - t00, 2), 'RENDER_S': round(time.time() - tr0, 2), 'objects': len(bpy.data.objects), 'polys': sum(len(o.data.polygons) for o in bpy.data.objects if o.type == 'MESH'), 'quadros': fez}))
