"""A film figure for long-lens shots: real proportions (about 7.3 heads), read by silhouette and pose, not by a face.
Kit (hat, colours, gear) and pose are data, so the same body serves any period or channel.
Directions are in the figure's own space: forward is -Y, its right hand is at -X."""
import math
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lookdev'))
import numpy as np
import bpy
from mathutils import Vector, Matrix
from common import *

OSSOS = {
    'hips': ((0, 0, .95), (0, 0, 1.08), None), 'spine': ((0, 0, 1.08), (0, 0, 1.28), 'hips'), 'chest': ((0, 0, 1.28), (0, 0, 1.45), 'spine'),
    'neck': ((0, 0, 1.45), (0, -.015, 1.54), 'chest'), 'head': ((0, -.015, 1.54), (0, -.02, 1.76), 'neck'),
    'upper_R': ((-.2, 0, 1.42), (-.24, 0, 1.13), 'chest'), 'fore_R': ((-.24, 0, 1.13), (-.26, -.01, .88), 'upper_R'), 'hand_R': ((-.26, -.01, .88), (-.265, -.015, .78), 'fore_R'),
    'upper_L': ((.2, 0, 1.42), (.24, 0, 1.13), 'chest'), 'fore_L': ((.24, 0, 1.13), (.26, -.01, .88), 'upper_L'), 'hand_L': ((.26, -.01, .88), (.265, -.015, .78), 'fore_L'),
    'thigh_R': ((-.1, 0, .93), (-.11, -.01, .5), 'hips'), 'shin_R': ((-.11, -.01, .5), (-.115, .01, .09), 'thigh_R'), 'foot_R': ((-.115, .01, .09), (-.115, -.17, .03), 'shin_R'),
    'thigh_L': ((.1, 0, .93), (.11, -.01, .5), 'hips'), 'shin_L': ((.11, -.01, .5), (.115, .01, .09), 'thigh_L'), 'foot_L': ((.115, .01, .09), (.115, -.17, .03), 'shin_L'),
}

def tecido(nome, cores):
    M = Mat(nome); co = M.coord('Object')
    big = M.noise(co, 5.5, 6, .6); fine = M.noise(co, 170, 3, .5)
    base = M.ramp(big, [(.32, srgb(cores[0])), (.5, srgb(cores[1])), (.72, srgb(cores[2]))])
    lama = M.ramp(M.noise(co, 3, 5, .65), [(.5, (0, 0, 0)), (.72, (.75, .75, .75))])
    base = M.mix(lama, base, srgb('#2e261c'))
    M.pbr(base, rough=.93, normal=M.bump(M.math('ADD', M.math('MULTIPLY', fine, .22), big), .32, .01), spec=.15)
    return M.m

def capacete(tipo):
    """brodie: a shallow dish with a wide flat brim. stahl: tall dome, low visor, deep skirt. bone: a soft peaked cap (non-military use)."""
    nt, nr = 72, 26; V = []
    for i in range(nr):
        k = i / (nr - 1)
        for j in range(nt):
            th = 2 * math.pi * j / nt; cx, cy = math.cos(th), math.sin(th); front = max(0, -cy)
            if tipo == 'brodie':
                if k < .62:
                    u = k / .62; r = .1 * math.sin(u * math.pi / 2) ** .8; z = .07 * math.cos(u * math.pi / 2)
                else:
                    u = (k - .62) / .38; r = .1 + .072 * u; z = -.004 * u - .002 * math.sin(u * 3.14)
                V.append((cx * r * 1.02, cy * r * 1.12, z + .055))
            else:
                w = float(smooth(.55, .78, front))
                edge = -.075 * (1 - w) + .015 * w + .01 * max(0, cy)
                z = .13 + (edge - .13) * k
                step = edge + .045 * (1 - w) + .012 * w
                if z > step:
                    u = min(1, (.13 - z) / (.13 - step)); rr = (1 - (1 - u) ** 2.4) ** .5; fl = 0
                else:
                    u = (step - z) / max(1e-4, step - edge); rr = 1; fl = (.008 + .012 * abs(cx)) * u + w * .018 * u
                V.append((cx * (.105 * rr + fl), cy * (.118 * rr + fl), z))
    return np.array(V), [tuple(reversed(q)) for q in grid_faces(nr, nt)]

def mao(w, aberta=False, sgn=1):
    w = np.asarray(w, float); parts = [rbox(w + (0, 0, -.045), (.075, .03, .085), r=.7, n=7)]
    if aberta:
        for i, L in enumerate((.055, .07, .068, .055)):
            a = (-.28 + i * .19) * sgn
            p0 = w + np.array([(-.027 + i * .018) * sgn, 0, -.085]); p1 = p0 + np.array([math.sin(a), 0, -math.cos(a)]) * L
            parts.append(loft(np.linspace(p0, p1, 4), np.linspace(.0095, .0065, 4), n=8))
        p0 = w + np.array([-.035 * sgn, -.008, -.03]); p1 = p0 + np.array([-.045 * sgn, -.01, -.028])
        parts.append(loft(np.linspace(p0, p1, 4), np.linspace(.012, .008, 4), n=8))
    else:
        parts.append(rbox(w + (0, -.012, -.09), (.072, .045, .04), r=.75, n=6))
    return merge(parts)

def criar(nome, kit, mats):
    B = OSSOS
    arm = build_armature(nome, B)
    b = {k: v[:2] for k, v in B.items()}
    tronco = {k: b[k] for k in ('hips', 'spine', 'chest', 'neck')}
    uni = tecido(nome + '_uni', kit['uniforme']); cal = tecido(nome + '_cal', kit['calca'])
    pele, couro, aco = mats['pele'], mats['couro'], mats[kit.get('capacete_mat', 'aco')]
    # coat / tunic: long skirt reads well in silhouette
    zs = np.array([kit.get('barra', .72), .8, .92, .99, 1.03, 1.1, 1.22, 1.32, 1.4, 1.45, 1.49, 1.53])
    rx = np.array([.21, .2, .178, .158, .153, .165, .19, .205, .19, .13, .07, .058])
    ry = np.array([.15, .145, .125, .108, .104, .112, .13, .13, .108, .08, .066, .058])
    zz = np.interp(np.linspace(0, 1, 44), np.linspace(0, 1, len(zs)), zs)
    def rug(k, th, p):
        z = p[2]
        return float(.012 * math.sin(th * 9 + z * 7) * smooth(1.0, .75, z) + .005 * math.sin(th * 13 + z * 21) + .018 * (float(fbm(np.array(p[2] * 7 + math.cos(th)), np.array(math.sin(th) * 2), 2, 3)) - .5))
    o = add_mesh(nome + '_tunica', *loft(np.stack([0 * zz, 0 * zz, zz], 1), np.interp(zz, zs, rx), np.interp(zz, zs, ry), n=48, power=2.4, disp=rug), uni); skin(o, arm, tronco)
    # belt, and gear that breaks the outline: pack and blanket roll on the back, pouches, canteen
    parts = [loft([(0, 0, 1.02), (0, 0, 1.06)], .16, .112, n=36, power=2.4)]
    for s in (-1, 1):
        for i in range(2):
            parts.append(rbox((s * (.09 + i * .05), -.112 + i * .012, 1.0), (.045, .03, .07), r=.35, n=4))
    v, f = merge(parts); o = add_mesh(nome + '_cinto', v, f, couro); skin(o, arm, tronco)
    if kit.get('mochila'):
        parts = [rbox((0, .155, 1.26), (.27, .13, .32), r=.75, n=6, noise=.2, seed=3), loft([(-.2, .13, 1.45), (.2, .13, 1.45)], .055, n=12)]
        v, f = merge(parts); o = add_mesh(nome + '_mochila', v, f, uni); skin(o, arm, tronco)
    # sleeves through the elbow; hands
    for ld, sg in (('R', -1), ('L', 1)):
        S, E, W = np.array(B['upper_' + ld][0]), np.array(B['upper_' + ld][1]), np.array(B['fore_' + ld][1])
        pts = np.concatenate([S + (E - S) * np.linspace(-.12, 1, 16)[:, None], E + (W - E) * np.linspace(.06, 1, 14)[:, None]])
        rr = np.concatenate([np.linspace(.058, .05, 16), np.linspace(.049, .039, 14)])
        o = add_mesh(f'{nome}_manga{ld}', *loft(pts, rr, n=20, disp=lambda k, th, p: .005 * math.sin(th * 3 + k * 26)), uni)
        skin(o, arm, {k: b[k] for k in ('chest', 'upper_' + ld, 'fore_' + ld)}, power=9)
        ab = kit.get('mao_aberta', {}).get(ld, False)
        o = add_mesh(f'{nome}_mao{ld}', *mao(W, ab, sg), pele, attrs={'ao': np.ones(1)} if False else None)
        skin(o, arm, {'hand_' + ld: b['hand_' + ld]})
        # legs: trousers, puttees or boots, foot
        H, K, A = np.array(B['thigh_' + ld][0]), np.array(B['thigh_' + ld][1]), np.array(B['shin_' + ld][1])
        pts = np.concatenate([H + (K - H) * np.linspace(0, 1, 12)[:, None], K + (A - K) * np.linspace(.05, 1, 12)[:, None]])
        rr = np.concatenate([np.linspace(.086, .057, 12), np.linspace(.055, .04, 12)])
        o = add_mesh(f'{nome}_perna{ld}', *loft(pts, rr, n=18), cal)
        skin(o, arm, {k: b[k] for k in ('hips', 'thigh_' + ld, 'shin_' + ld)}, power=8)
        v, f = rbox(A + (0, -.055, -.05), (.09, .25, .085), r=.72, n=6)
        o = add_mesh(f'{nome}_pe{ld}', v, f, couro); skin(o, arm, {'foot_' + ld: b['foot_' + ld]})
    # neck, head (a simple shape: at these lenses the brim's shadow is the face), ears, helmet
    o = add_mesh(nome + '_pescoco', *loft([(0, -.004, 1.47), (0, -.012, 1.53), (0, -.02, 1.59)], .046, n=14), pele); skin(o, arm, {'neck': b['neck'], 'head': b['head']})
    C = np.array([0, -.026, 1.66])
    parts = [uv_sphere(C, .098, 32, 22, (.84, .98, 1.14))]
    parts.append(uv_sphere(C + (0, -.05, -.082), .06, 20, 12, (.9, .9, .72)))
    parts.append(uv_sphere(C + (0, -.098, -.025), .019, 12, 8))
    v, f = merge(parts); o = add_mesh(nome + '_cabeca', v, f, pele); skin(o, arm, {'head': b['head']})
    v, f = capacete(kit['capacete'])
    o = add_mesh(nome + '_capacete', v + C + (0, 0, kit.get('capacete_z', .012)), f, aco); skin(o, arm, {'head': b['head']})
    return arm

def aplicar_pose(arm, pose):
    for osso, eixo, ang in pose.get('rot', []):
        rotate_bone(arm, osso, eixo, ang)
    for osso, d in pose.get('dir', {}).items():
        aim_bone(arm, osso, d)

def por_no_chao(arm, T, x, y, yaw):
    bpy.context.view_layer.update()
    pb = arm.pose.bones
    low = min((arm.matrix_world @ pb[f'shin_{s}'].tail).z - .09 for s in ('L', 'R'))   # lowest ankle in armature height
    arm.rotation_euler = (0, 0, yaw); arm.location = (x, y, float(T(x, y)) - low + .02)
    bpy.context.view_layer.update()

def fuzil(nome, arm, gm, madeira, atras, frente, direcao=None):
    """A rifle laid through two world points (grip hand, support hand), so the hands always touch it."""
    a = arm.matrix_world @ arm.pose.bones[atras].tail; b = arm.matrix_world @ arm.pose.bones[frente].tail
    d = (arm.matrix_world.to_3x3() @ Vector(direcao)).normalized() if direcao else (b - a).normalized(); A = np.array(a); D = np.array(d)
    up = Vector((0, 0, 1)); s = d.cross(up).normalized(); UP = np.array(s.cross(d))
    v1, f1 = loft([A - D * .34 - UP * .03, A - D * .15, A + D * .05, A + D * .42], [.022, .026, .022, .018], n=10)
    v2, f2 = loft([A + D * .05 + UP * .018, A + D * 1.0 + UP * .02], .009, n=8)
    add_mesh(nome + '_coronha', v1, f1, madeira); add_mesh(nome + '_cano', v2, f2, gm)
