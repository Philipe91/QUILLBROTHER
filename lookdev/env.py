"""The shared set for both style frames: no man's land, Chaumont road, 11 Nov 1918, morning fog.
Same terrain, props, lights and camera for styles A and B, so only the character treatment differs."""
import math
import numpy as np
import bpy
from mathutils import Vector
from common import *

ROAD_X = 1.05      # road axis (camera-right, as in the reference frame)
CRATERS = [(-3.4, 3.6, 1.5, .34), (5.0, 7.5, 1.9, .42), (-7.5, 11.0, 2.4, .5), (2.1, 16.0, 1.7, .3), (-3.0, 26.0, 3.0, .6), (9.0, 22.0, 3.2, .6), (-14.0, 34.0, 3.5, .7), (6.0, 44.0, 3.5, .7)]
PUDDLES = [(2.05, 2.1, .95, .5), (.15, 5.2, .7, .4), (1.65, 8.5, .9, .4), (.55, 13.0, 1.0, .5)]


def height(x, y):
    x, y = np.asarray(x, float), np.asarray(y, float)
    dist = np.clip(y + 4, 0, None)
    h = (fbm(x * .05, y * .05, 4, 3) - .5) * (.5 + dist * .05)
    h = h + (fbm(x * .9, y * .9, 4, 11) - .5) * .13
    h = h + (fbm(x * 5, y * 5, 3, 23) - .5) * .022
    road = 1 - smooth(1.45, 2.3, np.abs(x - ROAD_X))
    h = h * (1 - .72 * road)
    for sd in (-.62, .62):
        h = h - .06 * np.exp(-((x - ROAD_X - sd - .03 * np.sin(y * .7)) / .15) ** 2) * road
    h = h - .02 * road
    for cx, cy, r, dp in CRATERS:
        d = np.hypot(x - cx, y - cy) / r
        h = h - dp * np.exp(-(d * 1.45) ** 2) + dp * .36 * np.exp(-((d - 1.05) / .24) ** 2)
    return h


def build_ground():
    xs = np.sinh(np.linspace(-4.3, 4.3, 300)) * .75 + ROAD_X * .3
    ys = -6 + (np.linspace(0, 1, 260) ** 2.15) * 150
    X, Y = np.meshgrid(xs, ys)
    Z = height(X, Y)
    road = 1 - smooth(1.3, 2.2, np.abs(X - ROAD_X) + (fbm(X * .9, Y * .9, 3, 41) - .5) * .9)
    pud = np.zeros_like(X)
    for cx, cy, a, b in PUDDLES:
        d = np.hypot((X - cx) / a, (Y - cy) / b) + (fbm(X * 3, Y * 3, 3, 77) - .5) * .55
        pud = np.maximum(pud, 1 - smooth(.86, 1.02, d))
    crat = np.zeros_like(X)
    for cx, cy, r, dp in CRATERS:
        crat = np.maximum(crat, 1 - smooth(.5, 1.25, np.hypot(X - cx, Y - cy) / r))
    Z = Z * (1 - pud * .6) - pud * .012
    V = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    F = grid_faces(len(ys), len(xs), wrap=False)
    mask = np.stack([road.ravel(), pud.ravel(), crat.ravel()], 1)

    M = Mat('ground')
    co = M.coord('Object')
    big = M.noise(co, .35, 5, .55)
    mid = M.noise(co, 2.6, 6, .6)
    fine = M.noise(co, 26, 6, .62)
    grass = M.ramp(big, [(.32, srgb('#4b4634')), (.5, srgb('#6c6547')), (.68, srgb('#847a58'))])
    mud = M.ramp(mid, [(.3, srgb('#2c261e')), (.52, srgb('#463a2b')), (.72, srgb('#5e4f3a'))])
    roadm = M.attr('mask', 'Red'); pudm = M.attr('mask', 'Green'); cr = M.attr('mask', 'Blue')
    base = M.mix(M.math('MINIMUM', 1.0, M.math('ADD', roadm, M.math('MULTIPLY', cr, .75))), grass, mud)
    base = M.mix(.55, base, M.ramp(fine, [(.35, (.45, .45, .45)), (.65, (1, 1, 1))]), 'MULTIPLY')
    base = M.mix(pudm, base, srgb('#4a5560'))
    rough = M.mix(pudm, M.ramp(fine, [(.3, (.62, .62, .62)), (.7, (.95, .95, .95))]), (.06, .06, .06))
    hgt = M.math('ADD', M.math('MULTIPLY', fine, .6), M.math('MULTIPLY', M.noise(co, 90, 4, .6), .25))
    hgt = M.math('MULTIPLY', hgt, M.math('SUBTRACT', 1.0, pudm, True))
    M.pbr(base, rough=rough, normal=M.bump(hgt, .75, .05), spec=.35)
    return add_mesh('ground', V, F, M.m, attrs={'mask': mask})


def bark_mat():
    M = Mat('bark'); co = M.coord('Object')
    st = M.mapped(co, (9, 9, 1.1))
    n = M.noise(st, 3.4, 6, .62, dist=.5)
    base = M.ramp(n, [(.28, srgb('#1a1410')), (.5, srgb('#3a2c20')), (.72, srgb('#5a4733'))])
    M.pbr(base, rough=.88, normal=M.bump(n, 1.0, .03), spec=.3)
    return M.m

def wood_end_mat():
    M = Mat('woodend'); co = M.coord('Object')
    w = M.nt.nodes.new('ShaderNodeTexWave'); w.wave_type = 'RINGS'; w.rings_direction = 'X'
    M.nt.links.new(co, w.inputs['Vector']); w.inputs['Scale'].default_value = 6; w.inputs['Distortion'].default_value = 1.6; w.inputs['Detail'].default_value = 3
    base = M.ramp(w.outputs['Factor'], [(.15, srgb('#7a5c3a')), (.55, srgb('#b08c5e')), (.9, srgb('#8a6a44'))])
    M.pbr(base, rough=.8, normal=M.bump(w.outputs['Factor'], .3, .01))
    return M.m

def burlap_mat():
    M = Mat('burlap'); co = M.coord('Object')
    weave = M.voronoi(co, 340)
    big = M.noise(co, 7, 5, .55)
    base = M.ramp(big, [(.3, srgb('#5a4d36')), (.55, srgb('#85745a')), (.75, srgb('#a2906f'))])
    dirt = M.noise(co, 3, 4, .6)
    base = M.mix(M.ramp(dirt, [(.48, (0, 0, 0)), (.68, (.8, .8, .8))]), base, srgb('#3e3325'))
    M.pbr(base, rough=.95, normal=M.bump(M.math('ADD', M.math('MULTIPLY', weave, .35), big), .7, .025), spec=.2)
    return M.m

def gun_mat():
    M = Mat('gunmetal'); co = M.coord('Object')
    n = M.noise(co, 30, 6, .6); ch = M.noise(co, 9, 6, .7)
    base = M.ramp(n, [(.3, srgb('#23262a')), (.7, srgb('#3a3e43'))])
    base = M.mix(M.ramp(ch, [(.63, (0, 0, 0)), (.72, (1, 1, 1))]), base, srgb('#6f6a60'))
    rough = M.ramp(n, [(.3, (.32, .32, .32)), (.7, (.58, .58, .58))])
    M.pbr(base, rough=rough, metal=.85, normal=M.bump(n, .18, .004))
    return M.m

def brass_mat():
    M = Mat('brass'); n = M.noise(M.coord('Object'), 60, 4, .6)
    M.pbr(M.ramp(n, [(.3, srgb('#6e5526')), (.7, srgb('#a88a42'))]), rough=.42, metal=1.0)
    return M.m


def stump(name, x, y, h, r, seed, mat):
    """A shell-shattered trunk: barely tapered, a torn crown of splinters, a couple of broken limbs."""
    n, rows = 48, 26
    V = []
    g = float(height(x, y))
    rng = np.random.default_rng(seed)
    crown = np.zeros(n)
    for _ in range(int(rng.integers(4, 7))):      # splinters
        c = rng.uniform(0, n); w = rng.uniform(1.6, 4.5); amp = rng.uniform(.25, .75)
        dd = np.minimum(np.abs(np.arange(n) - c), n - np.abs(np.arange(n) - c))
        crown = np.maximum(crown, amp * np.clip(1 - dd / w, 0, 1))
    lx, ly = rng.normal(0, .05), rng.normal(0, .05)
    for i in range(rows):
        k = i / (rows - 1)
        for j in range(n):
            th = 2 * math.pi * j / n
            zz = k * h * (.5 + .5 * crown[j]) if k > .55 else k * h * (.5 + .5 * crown[j] * (k / .55) ** 3)
            flare = 1 + .7 * math.exp(-k * 16)
            ridges = 1 + .1 * math.sin(th * 7 + seed) + .1 * float(fbm(np.array(math.cos(th) * 2.2 + seed), np.array(math.sin(th) * 2.2 + k * 6), 3, seed))
            rr = r * (1 - .3 * k) * flare * ridges * (1 - .32 * k ** 8)
            V.append((x + rr * math.cos(th) + lx * k * h, y + rr * math.sin(th) + ly * k * h, g - .08 + zz))
    parts = [(np.array(V), grid_faces(rows, n))]
    for _ in range(int(rng.integers(1, 4))):      # torn limbs
        a0 = rng.uniform(0, 6.28); z0 = rng.uniform(.35, .8) * h * .6; L = rng.uniform(.4, .8) * r * 4
        p0 = np.array([x + math.cos(a0) * r * .7, y + math.sin(a0) * r * .7, g + z0])
        p1 = p0 + np.array([math.cos(a0) * L, math.sin(a0) * L, L * rng.uniform(.3, .9)])
        parts.append(loft(np.linspace(p0, p1, 6), np.linspace(r * .38, r * .08, 6), n=10))
    v, f = merge(parts)
    return add_mesh(name, v, f, mat)


def log_row(x0, x1, y, z, r, seed, bark, endm):
    """A horizontal log along X."""
    n, rows = 16, 20
    V = []
    for i in range(rows):
        k = i / (rows - 1); px = x0 + (x1 - x0) * k
        for j in range(n):
            th = 2 * math.pi * j / n
            rr = r * (1 + .07 * float(fbm(np.array(k * 4 + seed), np.array(j * .4), 3, seed)))
            V.append((px, y + rr * math.cos(th) + .012 * math.sin(k * 7 + seed), z + rr * math.sin(th)))
    ob = add_mesh(f'log{seed}', np.array(V), grid_faces(rows, n), bark)
    for s, X in ((0, x0), (rows - 1, x1)):
        cap = [(X, y + r * math.cos(2 * math.pi * j / n), z + r * math.sin(2 * math.pi * j / n)) for j in range(n)]
        add_mesh(f'logend{seed}{s}', np.array(cap), [tuple(range(n))], endm, shade=False)
    return ob


def sandbag_wall(rows, seed=0):
    """rows: list of (z, x0, x1, y). One mesh for all bags, each slightly different."""
    parts = []; rng = np.random.default_rng(seed)
    for z, x0, x1, y in rows:
        x = x0
        while x < x1:
            L = rng.uniform(.5, .58)
            c = (x + L / 2, y + rng.uniform(-.03, .03), z)
            V, F = rbox((0, 0, 0), (L, .3, .155), r=.86, n=9, noise=.26, seed=int(rng.integers(1000)))
            parts.append((xf(V, rot_trs(c, (rng.uniform(-.05, .05), rng.uniform(-.05, .05), rng.uniform(-.09, .09)))), F))
            x += L * .95
    return merge(parts)


def mg08(x, y, z, yaw, gm, brass, name='mg'):
    """MG 08 on its sled: water jacket, receiver, feed block, belt, spade grips, sight, sled legs."""
    parts = []
    parts.append(loft([(0, -.2, 0), (0, -.86, 0)], .052, n=24))
    for yy in (-.24, -.52, -.82):
        parts.append(loft([(0, yy - .012, 0), (0, yy + .012, 0)], .058, n=24))
    parts.append(loft([(0, -.86, 0), (0, -1.0, 0)], .021, n=14))              # muzzle
    parts.append(loft([(0, -.96, 0), (0, -1.03, 0)], .034, n=16))
    parts.append(rbox((0, .04, .0), (.125, .5, .15), r=.1, n=5))             # receiver
    parts.append(rbox((0, .31, -.005), (.1, .05, .12), r=.5, n=5))
    parts.append(rbox((0, -.06, .09), (.055, .13, .05), r=.08, n=5))            # feed top
    parts.append(rbox((0, .16, .11), (.018, .08, .075), r=.08, n=5))             # rear sight
    for sx in (-.055, .055):
        parts.append(loft([(sx, .33, -.01), (sx * 1.3, .42, .01), (sx * 1.3, .47, .07)], .013, n=10))  # spade grips
    parts.append(loft([(0, .04, -.075), (0, .04, -.23)], .03, n=12))          # pintle
    parts.append(rbox((0, .1, -.26), (.18, .62, .05), r=.4, n=5))             # crosshead
    for sx in (-1, 1):
        parts.append(loft([(sx * .07, -.15, -.27), (sx * .22, -.35, -.5)], .02, n=10))
        parts.append(loft([(sx * .07, .3, -.27), (sx * .25, .55, -.5)], .02, n=10))
    V, F = merge(parts)
    M4 = rot_trs((x, y, z), (0, 0, yaw))
    ob = add_mesh(name, xf(V, M4), F, gm)
    # the cloth ammunition belt with brass rounds, hanging from the feed block to its box
    bp = []
    for i in range(26):
        k = i / 25
        p = np.array([.08 + k * .24, -.06 + k * .1, .03 - .36 * (k ** .7) + .03 * math.sin(k * 9)])
        bp.append(loft([p + (0, -.05, 0), p + (0, .05, 0)], .0085, n=8))
    v, f = merge(bp); add_mesh(name + '_rounds', xf(v, M4), f, brass)
    v, f = rbox((.34, .1, -.42), (.15, .28, .19), r=.2, n=5)
    add_mesh(name + '_box', xf(v, M4), f, gm)
    return ob


def wire(path_posts, heights, wire_mat, post_mat, seed=0):
    rng = np.random.default_rng(seed)
    parts = []; barbs = []
    for (x, y) in path_posts:
        g = float(height(x, y))
        parts.append(loft([(x, y, g - .05), (x + rng.uniform(-.05, .05), y, g + 1.15)], .035, n=8))
    add_mesh(f'wire_posts{seed}', *merge(parts), post_mat)
    for hz in heights:
        pts = []
        for a, b in zip(path_posts[:-1], path_posts[1:]):
            for k in np.linspace(0, 1, 26)[:-1]:
                x = a[0] + (b[0] - a[0]) * k; y = a[1] + (b[1] - a[1]) * k
                sag = -.11 * math.sin(k * math.pi) + .03 * math.sin(k * 41 + hz * 9)
                pts.append((x, y + .02 * math.sin(k * 31), float(height(x, y)) + hz + sag))
        pts = np.array(pts)
        barbs.append(loft(pts, .0035, n=5, cap=False))
        for p in pts[::3]:
            d = rng.normal(0, 1, 3); d /= np.linalg.norm(d)
            barbs.append(loft([p - d * .026, p + d * .026], .0024, n=4, cap=False))
    add_mesh(f'wire{seed}', *merge(barbs), wire_mat)


def tufts(mat, n=420, seed=5):
    """Dead grass tufts near the camera, thin blades."""
    rng = np.random.default_rng(seed); V = []; F = []
    for t in range(n):
        x = rng.uniform(-9, 11); y = rng.uniform(-1, 26)
        if abs(x - ROAD_X) < 2.1 or (abs(x) < 3 and y < .4):
            continue
        g = float(height(x, y))
        for b in range(int(rng.integers(5, 11))):
            a = rng.uniform(0, 6.28); L = rng.uniform(.1, .33); w = .007
            lean = rng.uniform(.04, .16)
            dx, dy = math.cos(a), math.sin(a)
            k = len(V)
            ox, oy = x + rng.uniform(-.05, .05), y + rng.uniform(-.05, .05)
            V += [(ox - w * dy, oy + w * dx, g - .01), (ox + w * dy, oy - w * dx, g - .01), (ox + dx * lean * .4, oy + dy * lean * .4, g + L * .6), (ox + dx * lean, oy + dy * lean, g + L)]
            F += [(k, k + 1, k + 2), (k, k + 2, k + 3)]
    add_mesh('tufts', np.array(V), F, mat, shade=False)


def build_set(cfg):
    bark, endm, burlap, gm, brass = bark_mat(), wood_end_mat(), burlap_mat(), gun_mat(), brass_mat()
    build_ground()
    # shattered trees: positions echo the reference frame (left mid-ground, right mid-ground), then deep rows
    for i, (x, y, h, r) in enumerate([(-1.05, 2.1, 2.5, .15), (2.75, 4.2, 2.1, .13), (-2.75, 6.2, 1.8, .13), (4.7, 9.5, 3.0, .2), (-5.5, 12.5, 3.4, .22), (.1, 17, 2.8, .18), (7, 19, 4.2, .24), (-10, 21, 4.4, .26), (-2.8, 28, 3.4, .22), (12, 33, 5.2, .3), (-16, 38, 5.6, .3), (4.8, 42, 4.5, .3), (-7, 55, 5.5, .35), (20, 58, 6.0, .35), (-24, 62, 6.5, .4), (8, 75, 6, .4)]):
        stump(f'stump{i}', x, y, h, r, i * 3 + 2, bark)
    # the barricade in front of the crew: sandbags + logs (camera side)
    Yb = -.72; g = float(height(0, Yb))
    bx0, bx1 = -2.6, 3.1
    V, F = sandbag_wall([(g + .08, bx0, bx1, Yb), (g + .225, bx0 + .2, bx1 - .1, Yb + .01), (g + .37, bx0 + .05, bx1, Yb - .01), (g + .515, bx0 + .3, bx1 - .2, Yb)], seed=4)
    add_mesh('sandbags', V, F, burlap)
    log_row(-1.0, 1.75, Yb - .13, g + .66, .075, 1, bark, endm)
    log_row(-.8, 1.95, Yb - .12, g + .79, .07, 2, bark, endm)
    # MG: same placement as the reference (bottom centre-right); second gun at the right edge of frame
    mg08(.52, -.34, g + 1.13, .72, gm, brass, 'mg1')
    mg08(2.3, -.3, g + 1.0, .4, gm, brass, 'mg2')
    wmat = Mat('wire'); wmat.pbr(srgb('#2c2622'), rough=.6, metal=.6)
    wire([(3.2, 2.2), (4.6, 2.9), (6.0, 2.5), (7.8, 3.3), (9.8, 2.8)], (.34, .68, 1.0), wmat.m, bark, 3)
    wire([(-2.4, 4.3), (-3.8, 4.9), (-5.2, 4.4), (-6.8, 5.1), (-8.6, 4.7)], (.34, .68, 1.0), wmat.m, bark, 7)
    g2 = Mat('grass'); co = g2.coord('Object'); g2.pbr(g2.ramp(g2.noise(co, 3, 3), [(.3, srgb('#54503a')), (.7, srgb('#8e8460'))]), rough=.9)
    tufts(g2.m)


def build_world(cfg):
    W = bpy.data.worlds.new('fog'); bpy.context.scene.world = W
    nt = W.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ'); nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    r = nt.nodes.new('ShaderNodeValToRGB'); cr = r.color_ramp
    cr.elements[0].position = .0; cr.elements[0].color = (*srgb(cfg['sky_horizon']), 1)
    cr.elements[1].position = .45; cr.elements[1].color = (*srgb(cfg['sky_top']), 1)
    nt.links.new(sep.outputs['Z'], r.inputs[0])
    no = nt.nodes.new('ShaderNodeTexNoise'); nt.links.new(tc.outputs['Generated'], no.inputs['Vector']); no.inputs['Scale'].default_value = 3.2; no.inputs['Detail'].default_value = 7; no.inputs['Roughness'].default_value = .55
    cl = nt.nodes.new('ShaderNodeValToRGB'); cl.color_ramp.elements[0].position = .4; cl.color_ramp.elements[0].color = (.72, .74, .78, 1); cl.color_ramp.elements[1].position = .66; cl.color_ramp.elements[1].color = (1.1, 1.08, 1.04, 1)
    nt.links.new(no.outputs[0], cl.inputs[0])
    mu = nt.nodes.new('ShaderNodeMixRGB'); mu.blend_type = 'MULTIPLY'; mu.inputs[0].default_value = 1; nt.links.new(r.outputs[0], mu.inputs[1]); nt.links.new(cl.outputs[0], mu.inputs[2])
    sd = Vector(cfg['sun_dir']).normalized()
    dp = nt.nodes.new('ShaderNodeVectorMath'); dp.operation = 'DOT_PRODUCT'; nt.links.new(tc.outputs['Generated'], dp.inputs[0]); dp.inputs[1].default_value = tuple(sd)
    gl = nt.nodes.new('ShaderNodeValToRGB'); gl.color_ramp.elements[0].position = .62; gl.color_ramp.elements[0].color = (0, 0, 0, 1); gl.color_ramp.elements[1].position = 1; gl.color_ramp.elements[1].color = (1, 1, 1, 1)
    nt.links.new(dp.outputs['Value'], gl.inputs[0])
    ad = nt.nodes.new('ShaderNodeMixRGB'); ad.blend_type = 'ADD'; nt.links.new(gl.outputs[0], ad.inputs[0]); nt.links.new(mu.outputs[0], ad.inputs[1]); ad.inputs[2].default_value = (*srgb(cfg['sun_glow']), 1)
    bg = nt.nodes.new('ShaderNodeBackground'); nt.links.new(ad.outputs[0], bg.inputs[0]); bg.inputs[1].default_value = cfg['sky_strength']
    nt.links.new(bg.outputs[0], out.inputs['Surface'])
    if cfg.get('fog_density', 0) > 0:
        # A finite volume: a world volume would swallow the sky and all world light in EEVEE. Denser near the ground, with slow wisps.
        M = Mat('fog_volume'); co = M.coord('Object'); nt2 = M.nt
        sep2 = nt2.nodes.new('ShaderNodeSeparateXYZ'); nt2.links.new(co, sep2.inputs[0])
        h = M.ramp(M.math('DIVIDE', sep2.outputs['Z'], 26.0), [(0, (1, 1, 1)), (.22, (.42, .42, .42)), (1, (.12, .12, .12))])
        wisp = M.ramp(M.noise(co, .22, 4, .55), [(.34, (.45, .45, .45)), (.66, (1.25, 1.25, 1.25))])
        dens = M.math('MULTIPLY', M.math('MULTIPLY', h, wisp), cfg['fog_density'])
        vs = nt2.nodes.new('ShaderNodeVolumeScatter')
        vs.inputs['Color'].default_value = (*srgb(cfg['fog_color']), 1)
        nt2.links.new(dens, vs.inputs['Density'])
        nt2.links.new(vs.outputs[0], M.out.inputs['Volume'])
        V = np.array([(x, y, z) for x in (-150, 150) for y in (-40, 200) for z in (0, 26)], float)   # corners; Object coords: z in metres
        F = [(0, 1, 3, 2), (4, 6, 7, 5), (0, 4, 5, 1), (2, 3, 7, 6), (0, 2, 6, 4), (1, 5, 7, 3)]
        ob = add_mesh('fog_domain', V, F, M.m, shade=False)
        ob.location.z = -2


def build_lights(cfg):
    for L in cfg['lights']:
        d = bpy.data.lights.new(L['name'], L['type'])
        d.energy = L['energy']; d.color = srgb(L['color'])
        if L['type'] == 'SUN':
            d.angle = math.radians(L.get('angle', 4))
        else:
            d.shape = 'DISK'; d.size = L.get('size', 3)
        ob = bpy.data.objects.new(L['name'], d); bpy.context.scene.collection.objects.link(ob)
        ob.location = L['pos']
        ob.rotation_euler = (Vector(L['target']) - Vector(L['pos'])).to_track_quat('-Z', 'Y').to_euler()


def build_camera(cfg):
    c = bpy.data.cameras.new('cam'); c.lens = cfg['lens']; c.sensor_width = 36
    c.dof.use_dof = True; c.dof.aperture_fstop = cfg['fstop']
    ob = bpy.data.objects.new('cam', c); bpy.context.scene.collection.objects.link(ob)
    ob.location = cfg['pos']
    ob.rotation_euler = (Vector(cfg['target']) - Vector(cfg['pos'])).to_track_quat('-Z', 'Y').to_euler()
    if cfg.get('roll'):
        ob.rotation_euler.rotate_axis('Z', math.radians(cfg['roll']))
    c.dof.focus_distance = (Vector(cfg['focus']) - Vector(cfg['pos'])).length
    bpy.context.scene.camera = ob
    return ob


def setup_render(cfg, res, samples):
    s = bpy.context.scene
    s.render.engine = 'BLENDER_EEVEE'
    s.render.resolution_x, s.render.resolution_y = res
    s.render.resolution_percentage = 100
    s.render.image_settings.file_format = 'PNG'
    s.eevee.taa_render_samples = samples
    s.eevee.use_raytracing = cfg.get('raytracing', False)
    s.eevee.use_shadows = True
    s.eevee.shadow_resolution_scale = 1.0
    s.eevee.volumetric_tile_size = str(cfg.get('vol_tile', 8))
    s.eevee.volumetric_samples = cfg.get('vol_samples', 48)
    s.eevee.volumetric_start = 1.0; s.eevee.volumetric_end = cfg.get('vol_end', 160)
    s.eevee.use_volumetric_shadows = cfg.get('vol_shadows', True)
    s.view_settings.view_transform = cfg.get('view', 'AgX')
    try:
        s.view_settings.look = cfg.get('look', 'AgX - Medium High Contrast')
    except TypeError as e:
        print('LOOK', e)
    s.view_settings.exposure = cfg.get('exposure', 0)
