"""A reusable long-lens landscape: a straight road over rolling ground that stacks into waves on a telephoto.
Nothing here is war-specific: palette, wave size, props and fog come from the shot JSON, so another channel can
dress the same set as a desert, a moor or a mining town. The Gunther dressing only names which props to place."""
import math
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lookdev'))
import numpy as np
import bpy
from common import *
import env   # shared props only (env.py itself is not changed; its terrain function is replaced in this process)


class Terreno:
    def __init__(s, c):
        s.A, s.L, s.slope, s.road_w = c['amplitude'], c['comprimento_onda'], c['inclinacao'], c['largura_estrada']
        s.craters = c.get('crateras', [])

    def __call__(s, x, y):
        x, y = np.asarray(x, float), np.asarray(y, float)
        wav = s.A * np.cos(2 * np.pi * y / s.L) * (1 + .12 * np.sin(y * .031 + 1.3))
        h = wav + s.slope * y
        off = 1 - smooth(s.road_w * .55, s.road_w * 1.4, np.abs(x))
        h = h + (fbm(x * .07, y * .07, 4, 3) - .5) * 3.0 * (1 - off)
        h = h + (fbm(x * .9, y * .9, 4, 11) - .5) * (.1 + .2 * (1 - off))
        h = h + (fbm(x * 5, y * 5, 3, 23) - .5) * .035
        for sd in (-.28, .28):
            h = h - .07 * np.exp(-((x - sd * s.road_w - .04 * np.sin(y * .5)) / .17) ** 2) * off
        for cx, cy, r, dp in s.craters:
            d = np.hypot(x - cx, y - cy) / r
            h = h - dp * np.exp(-(d * 1.45) ** 2) + dp * .36 * np.exp(-((d - 1.05) / .24) ** 2)
        return h


def solo(T, pal):
    xs = np.sinh(np.linspace(-4.1, 4.1, 240)) * 2.4
    ys = np.linspace(-340, 130, 1150)
    X, Y = np.meshgrid(xs, ys)
    Z = T(X, Y)
    road = 1 - smooth(T.road_w * .42, T.road_w * .78, np.abs(X) + (fbm(X * .7, Y * .7, 3, 41) - .5) * 1.1)
    pud = np.zeros_like(X)
    for y0 in np.arange(-315, 100, T.L * 2):
        if -80 < y0 < 60:
            continue
        d = np.hypot((X - .5 * math.sin(y0)) / 1.3, (Y - (y0 + T.L / 2)) / 2.8) + (fbm(X * 2, Y * 2, 3, 77) - .5) * .6
        pud = np.maximum(pud, 1 - smooth(.8, 1.0, d))
    pud = pud * road
    Z = Z - pud * .03
    V = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    M = Mat('solo'); co = M.coord('Object')
    big = M.noise(co, .28, 5, .58); mid = M.noise(co, 2.0, 6, .62); fine = M.noise(co, 19, 6, .62)
    campo = M.ramp(big, [(.34, srgb(pal['campo'][0])), (.5, srgb(pal['campo'][1])), (.68, srgb(pal['campo'][2]))])
    leito = M.ramp(mid, [(.3, srgb(pal['estrada'][0])), (.52, srgb(pal['estrada'][1])), (.72, srgb(pal['estrada'][2]))])
    rm = M.attr('mask', 'Red'); pm = M.attr('mask', 'Green')
    base = M.mix(rm, campo, leito)
    base = M.mix(.7, base, M.ramp(fine, [(.32, (.42, .42, .42)), (.68, (1, 1, 1))]), 'MULTIPLY')
    base = M.mix(pm, base, srgb(pal['agua']))
    rough = M.mix(pm, M.ramp(fine, [(.3, (.6, .6, .6)), (.7, (.95, .95, .95))]), (.05, .05, .05))
    h = M.math('MULTIPLY', M.math('ADD', M.math('MULTIPLY', fine, .7), M.math('MULTIPLY', M.noise(co, 80, 4, .6), .3)), M.math('SUBTRACT', 1.0, pm, True))
    M.pbr(base, rough=rough, normal=M.bump(h, .8, .06), spec=.3)
    return add_mesh('solo', V, grid_faces(len(ys), len(xs), wrap=False), M.m, attrs={'mask': np.stack([road.ravel(), pud.ravel(), np.zeros(pud.size)], 1)})


zona_livre = None
def capim(T, mat, y0, y1, xlim, n, seed=5):
    rng = np.random.default_rng(seed); V = []; F = []
    for _ in range(n):
        x = rng.uniform(-xlim, xlim); y = rng.uniform(y0, y1)
        if abs(x) < T.road_w * .62 or (zona_livre and zona_livre[0] < x < zona_livre[1] and zona_livre[2] < y < zona_livre[3]):
            continue
        g = float(T(x, y))
        for b in range(int(rng.integers(6, 13))):
            a = rng.uniform(0, 6.28); L = rng.uniform(.18, .55); w = .012; lean = rng.uniform(.05, .22)
            dx, dy = math.cos(a), math.sin(a); k = len(V)
            ox, oy = x + rng.uniform(-.08, .08), y + rng.uniform(-.08, .08)
            V += [(ox - w * dy, oy + w * dx, g - .02), (ox + w * dy, oy - w * dx, g - .02), (ox + dx * lean * .4, oy + dy * lean * .4, g + L * .6), (ox + dx * lean, oy + dy * lean, g + L)]
            F += [(k, k + 1, k + 2), (k, k + 2, k + 3)]
    add_mesh(f'capim{seed}', np.array(V), F, mat, shade=False)


def postes(T, bark, wire_mat, x, y0, y1, passo):
    """A line of leaning poles with sagging wires: the thing that makes a long lens read as distance."""
    rng = np.random.default_rng(12); parts = []; tops = []
    for y in np.arange(y0, y1, passo):
        g = float(T(x, y)); h = rng.uniform(4.6, 5.8); tx, ty = rng.normal(0, .18), rng.normal(0, .16)
        top = np.array([x + tx * h * .2, y + ty * h * .2, g + h])
        parts.append(loft(np.linspace((x, y, g - .1), top, 8), np.linspace(.12, .07, 8), n=10))
        parts.append(loft([top + (-.6, 0, -.3), top + (.6, 0, -.3 + rng.normal(0, .03))], .035, n=6))
        tops.append(top + (0, 0, -.28))
    add_mesh('postes', *merge(parts), bark)
    fios = []
    for sd in (-.5, .5):
        for a, b in zip(tops[:-1], tops[1:]):
            p = [a + (b - a) * k + np.array([sd, 0, -.75 * math.sin(k * math.pi)]) for k in np.linspace(0, 1, 16)]
            fios.append(loft(p, .012, n=4, cap=False))
    add_mesh('fios', *merge(fios), wire_mat)


def barricada(T, y, bark, endm, burlap, gm, brass, g=None):
    g = float(T(0, y)) if g is None else g
    V, F = env.sandbag_wall([(g + .08, -2.9, 2.6, y), (g + .225, -2.5, 2.3, y + .01), (g + .37, -2.0, .4, y - .01), (g + .37, .9, 2.1, y), (g + .515, -1.5, -.3, y)], seed=4)
    add_mesh('sacos', V, F, burlap)
    env.log_row(-1.1, 2.2, y - .16, g + .5, .08, 1, bark, endm)


def nevoa(cfg):
    M = Mat('nevoa'); co = M.coord('Object'); nt = M.nt
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(co, sep.inputs[0])
    h = M.ramp(M.math('DIVIDE', sep.outputs['Z'], cfg['altura']), [(0, (1, 1, 1)), (.35, (.55, .55, .55)), (1, (.1, .1, .1))])
    wisp = M.ramp(M.noise(co, .045, 4, .55), [(.34, (.5, .5, .5)), (.66, (1.3, 1.3, 1.3))])
    dens = M.math('MULTIPLY', M.math('MULTIPLY', h, wisp), cfg['densidade'])
    vs = nt.nodes.new('ShaderNodeVolumeScatter')
    vs.inputs['Color'].default_value = (*srgb(cfg['cor']), 1); vs.inputs['Anisotropy'].default_value = cfg.get('anisotropia', .45)
    nt.links.new(dens, vs.inputs['Density']); nt.links.new(vs.outputs[0], M.out.inputs['Volume'])
    V = np.array([(x, y, z) for x in (-260, 260) for y in (-420, 340) for z in (0, cfg['altura'])], float)
    F = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
    ob = add_mesh('nevoa', V, F, M.m, shade=False); ob.location.z = -14


def montar(c):
    global zona_livre
    zona_livre = c['dressing'].get('zona_livre')
    T = Terreno(c['terreno']); env.height = T
    pal = c['paleta']
    bark, endm, burlap, gm, brass = env.bark_mat(), env.wood_end_mat(), env.burlap_mat(), env.gun_mat(), env.brass_mat()
    solo(T, pal)
    wm = Mat('fio'); wm.pbr(srgb('#1e1a18'), rough=.7)
    d = c['dressing']
    postes(T, bark, wm.m, d['postes_x'], -320, 90, d['postes_passo'])
    rng = np.random.default_rng(21)
    for i in range(d['arvores']):
        sd = 1 if rng.random() > .5 else -1
        x = sd * rng.uniform(T.road_w * .9, 34); y = rng.uniform(-300, 110)
        env.stump(f'tronco{i}', x, y, rng.uniform(3.0, 7.5), rng.uniform(.16, .34), i * 3 + 2, bark)
    g2 = Mat('capim'); co = g2.coord('Object'); g2.pbr(g2.ramp(g2.noise(co, 3, 3), [(.3, srgb(pal['capim'][0])), (.7, srgb(pal['capim'][1]))]), rough=.9)
    capim(T, g2.m, d['capim_y'][0], d['capim_y'][1], 24, d['capim_n'])
    if d.get('capim_y2'):
        capim(T, g2.m, d['capim_y2'][0], d['capim_y2'][1], 9, d['capim_n2'], seed=8)
    for x0, y0 in d.get('arame', []):
        env.wire([(x0 + k * 1.7 * (1 if x0 > 0 else -1), y0 + (k % 2) * .6) for k in range(6)], (.34, .68, 1.0), wm.m, bark, int(abs(x0 * 7 + y0)))
    yb = d['barricada_y']
    barricada(T, yb, bark, endm, burlap, gm, brass)
    gb = float(T(0, yb))
    env.mg08(1.05, yb - .05, gb + .92, 0.12, gm, brass, 'mg1')
    env.mg08(-1.25, yb - .05, gb + .92, -0.1, gm, brass, 'mg2')
    return T


def luz_de_mundo(cfg):
    """The sky can stay bright to the lens while lighting the set weakly: that is what makes figures read as silhouettes."""
    nt = bpy.context.scene.world.node_tree
    bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    lp = nt.nodes.new('ShaderNodeLightPath')
    mp = nt.nodes.new('ShaderNodeMath'); mp.operation = 'MULTIPLY_ADD'
    mp.inputs[1].default_value = cfg['ceu_camera'] - cfg['luz_ambiente']; mp.inputs[2].default_value = cfg['luz_ambiente']
    nt.links.new(lp.outputs['Is Camera Ray'], mp.inputs[0]); nt.links.new(mp.outputs[0], bg.inputs[1])
