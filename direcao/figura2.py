"""Figure v2 for animation: fuller proportions, gear that moves (pack, canteen, coat skirt), a head with a real profile.
Kit and gear are data; nothing here is specific to one story. Forward is -Y, the figure's right hand is at -X."""
import math
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'lookdev'))
import numpy as np
import bpy
from common import *
import figura

OSSOS = {
    'hips': ((0, 0, .95), (0, 0, 1.08), None), 'spine': ((0, 0, 1.08), (0, 0, 1.28), 'hips'), 'chest': ((0, 0, 1.28), (0, 0, 1.45), 'spine'),
    'neck': ((0, 0, 1.45), (0, -.015, 1.54), 'chest'), 'head': ((0, -.015, 1.54), (0, -.02, 1.76), 'neck'),
    'upper_R': ((-.2, 0, 1.42), (-.24, 0, 1.12), 'chest'), 'fore_R': ((-.24, 0, 1.12), (-.26, -.01, .86), 'upper_R'), 'hand_R': ((-.26, -.01, .86), (-.265, -.015, .76), 'fore_R'),
    'upper_L': ((.2, 0, 1.42), (.24, 0, 1.12), 'chest'), 'fore_L': ((.24, 0, 1.12), (.26, -.01, .86), 'upper_L'), 'hand_L': ((.26, -.01, .86), (.265, -.015, .76), 'fore_L'),
    'thigh_R': ((-.1, 0, .93), (-.11, -.01, .5), 'hips'), 'shin_R': ((-.11, -.01, .5), (-.115, .01, .09), 'thigh_R'), 'foot_R': ((-.115, .01, .09), (-.115, -.17, .03), 'shin_R'),
    'thigh_L': ((.1, 0, .93), (.11, -.01, .5), 'hips'), 'shin_L': ((.11, -.01, .5), (.115, .01, .09), 'thigh_L'), 'foot_L': ((.115, .01, .09), (.115, -.17, .03), 'shin_L'),
    'saia_F': ((0, -.11, .99), (0, -.15, .72), 'hips'), 'saia_B': ((0, .11, .99), (0, .15, .72), 'hips'), 'saia_R': ((-.16, 0, .99), (-.2, 0, .72), 'hips'), 'saia_L': ((.16, 0, .99), (.2, 0, .72), 'hips'),
    'mochila': ((0, .12, 1.42), (0, .17, 1.14), 'chest'), 'cantil': ((.17, -.03, 1.0), (.2, -.03, .84), 'hips'),
}

_CAB = None
def cabeca_esculpida():
    """One sculpted head shared by the cast (the helmet and kit tell them apart at these distances)."""
    global _CAB
    if _CAB is None:
        import char_b
        e = {'open': .2, 'wide': .1, 'brow': -.003, 'eye': 0, 'fold': 0}
        nu, nv = 140, 90
        th = np.linspace(0, 2 * np.pi, nu, endpoint=False); ph = np.linspace(.001, np.pi - .001, nv)
        PH, TH = np.meshgrid(ph, th, indexing='ij')
        D = np.stack([np.sin(PH) * np.cos(TH), np.sin(PH) * np.sin(TH), np.cos(PH)], -1).reshape(-1, 3)
        O = np.array([0, -.03, -.018]); t = np.full(len(D), .34)
        for _ in range(80):
            t = np.maximum(t - .85 * char_b.head_body(O + D * t[:, None], e), .02)
        P = O + D * t[:, None]
        barba = smooth(-.018, -.06, P[:, 2]) * smooth(-.02, -.07, P[:, 1])
        _CAB = (P, grid_faces(nv, nu), barba)
    return _CAB

def criar(nome, kit, mats):
    B = OSSOS; arm = build_armature(nome, B)
    b = {k: v[:2] for k, v in B.items()}
    tronco = {k: b[k] for k in ('hips', 'spine', 'chest', 'neck')}
    uni = figura.tecido(nome + '_uni', kit['uniforme']); cal = figura.tecido(nome + '_cal', kit['calca']); fx = figura.tecido(nome + '_fx', kit.get('faixa', kit['calca']))
    pele, couro, aco = mats['pele'], mats['couro'], mats[kit.get('capacete_mat', 'aco')]
    # tunic: chest and shoulders with real mass, waist drawn in by the belt, a skirt that splits around the legs
    zs = np.array([kit.get('barra', .74), .8, .9, .98, 1.03, 1.1, 1.22, 1.33, 1.41, 1.46, 1.5, 1.54])
    rx = np.array([.215, .205, .185, .168, .165, .178, .205, .222, .21, .15, .076, .062])
    ry = np.array([.158, .15, .13, .116, .112, .122, .142, .142, .12, .09, .07, .062])
    zz = np.interp(np.linspace(0, 1, 56), np.linspace(0, 1, len(zs)), zs)
    def rug(k, th, p):
        z = p[2]
        return float(.012 * math.sin(th * 9 + z * 7) * smooth(1.0, .75, z) + .004 * math.sin(th * 13 + z * 21) + .02 * (float(fbm(np.array(z * 8 + math.cos(th)), np.array(math.sin(th) * 2), 2, 3)) - .5))
    allow = dict(tronco); allow.update({k: b[k] for k in ('saia_F', 'saia_B', 'saia_R', 'saia_L')})
    o = add_mesh(nome + '_tunica', *loft(np.stack([0 * zz, 0 * zz, zz], 1), np.interp(zz, zs, rx), np.interp(zz, zs, ry), n=56, power=2.4, disp=rug), uni); skin(o, arm, allow, power=6)
    # belt, pouches, buttons, slash pockets, collar, shoulder straps
    parts = [loft([(0, 0, 1.015), (0, 0, 1.06)], .172, .118, n=40, power=2.4)]
    for s in (-1, 1):
        for i in range(3):
            parts.append(rbox((s * (.06 + i * .046), -.115 + i * .014, 1.0), (.042, .032, .072), r=.3, n=4))
        parts.append(loft([(s * .11, -.112, 1.05), (s * .125, -.135, 1.26), (s * .115, -.1, 1.38), (s * .11, -.02, 1.45), (s * .1, .08, 1.42)], .016, .004, n=6, power=4))
    v, f = merge(parts); o = add_mesh(nome + '_correame', v, f, couro); skin(o, arm, tronco)
    parts = [loft([(0, -.002, 1.49), (0, -.002, 1.545)], .074, .074, n=24)]
    for z in (1.12, 1.2, 1.28, 1.36):
        parts.append(rbox((0, -.14, z), (.018, .008, .018), r=.8, n=3))
    v, f = merge(parts); o = add_mesh(nome + '_gola', v, f, uni); skin(o, arm, tronco)
    # gear on the back and hip: separate bones so it swings with momentum
    if kit.get('mochila'):
        v, f = merge([rbox((0, .175, 1.27), (.27, .13, .33), r=.72, n=6, noise=.2, seed=3), loft([(-.19, .14, 1.46), (.19, .14, 1.46)], .058, n=12)])
        o = add_mesh(nome + '_mochila', v, f, uni); skin(o, arm, {'mochila': b['mochila']})
    v, f = merge([loft([(.195, -.03, .86), (.2, -.03, .96)], .046, .03, n=14)])
    o = add_mesh(nome + '_cantil', v, f, couro); skin(o, arm, {'cantil': b['cantil']})
    for ld, sg in (('R', -1), ('L', 1)):
        S, E, W = np.array(B['upper_' + ld][0]), np.array(B['upper_' + ld][1]), np.array(B['fore_' + ld][1])
        pts = np.concatenate([S + (E - S) * np.linspace(-.02, 1, 18)[:, None], E + (W - E) * np.linspace(.06, 1, 16)[:, None]])
        rr = np.concatenate([np.linspace(.06, .054, 18), np.linspace(.053, .041, 16)])
        o = add_mesh(f'{nome}_manga{ld}', *loft(pts, rr, n=20, disp=lambda k, th, p: .006 * math.sin(th * 3 + k * 26)), uni)
        skin(o, arm, {k: b[k] for k in ('upper_' + ld, 'fore_' + ld)}, power=10)
        ab = kit.get('mao_aberta', {}).get(ld, False)
        o = add_mesh(f'{nome}_mao{ld}', *figura.mao(W, ab, sg), pele); skin(o, arm, {'hand_' + ld: b['hand_' + ld]})
        H, K, A = np.array(B['thigh_' + ld][0]), np.array(B['thigh_' + ld][1]), np.array(B['shin_' + ld][1])
        pts = np.concatenate([H + (K - H) * np.linspace(0, 1, 14)[:, None], K + (A - K) * np.linspace(.04, .36, 6)[:, None]])
        rr = np.concatenate([np.linspace(.1, .068, 14), np.linspace(.067, .062, 6)])
        o = add_mesh(f'{nome}_perna{ld}', *loft(pts, rr, n=18), cal); skin(o, arm, {k: b[k] for k in ('hips', 'thigh_' + ld, 'shin_' + ld)}, power=9)
        pts = K + (A - K) * np.linspace(.3, 1.02, 18)[:, None]
        rr = np.interp(np.linspace(0, 1, 18), [0, .4, 1], [.062, .058, .042])
        o = add_mesh(f'{nome}_faixa{ld}', *loft(pts, rr, n=16, disp=lambda k, th, p: .0035 * math.sin(k * 60 + th)), fx); skin(o, arm, {'shin_' + ld: b['shin_' + ld]})
        v, f = rbox(A + (0, -.06, -.052), (.098, .27, .09), r=.72, n=6)
        o = add_mesh(f'{nome}_pe{ld}', v, f, couro); skin(o, arm, {'foot_' + ld: b['foot_' + ld]})
    # neck, head with brow, nose, jaw and ear so the profile reads; helmet
    o = add_mesh(nome + '_pescoco', *loft([(0, -.006, 1.47), (0, -.012, 1.53), (0, -.02, 1.58)], .056, n=14), pele); skin(o, arm, {'neck': b['neck'], 'head': b['head']})
    C = np.array([0, -.03, 1.645])
    # head: a sculpted skull, jaw, brow, nose and lips, so the profile is a face and not an egg. Eyes and mouth stay in shadow.
    v, f, barba = cabeca_esculpida()
    k = .8
    o = add_mesh(nome + '_cabeca', v * k + C + (0, .012, .006), f, mats['rosto'], attrs={'barba': barba}); skin(o, arm, {'head': b['head']})
    parts = [uv_sphere(C + (s * .037, -.088, .012), .011, 10, 8, (1.25, .4, .55)) for s in (-1, 1)] + [uv_sphere(C + (0, -.098, -.056), .017, 10, 8, (1.2, .3, .42))]
    v, f = merge(parts); o = add_mesh(nome + '_rosto', v, f, mats['escuro']); skin(o, arm, {'head': b['head']})
    v, f = figura.capacete(kit['capacete'])
    o = add_mesh(nome + '_capacete', v * kit.get('capacete_esc', 1.14) + C + (0, 0, kit.get('capacete_z', .014)), f, aco); skin(o, arm, {'head': b['head']})
    return arm

def fuzil(nome, gm, madeira, couro):
    """Rifle along +Y from the grip (origin): stock behind, barrel and foresight ahead, a sling. Its pose is keyed separately."""
    a, fc = loft([(0, -.36, -.042), (0, -.2, -.03), (0, -.02, -.012), (0, .08, -.004), (0, .5, .0), (0, .66, .004)], [.021, .026, .022, .02, .017, .013], [.04, .034, .024, .022, .016, .012], n=10)
    add_mesh(nome + '_madeira', a, fc, madeira)
    parts = [loft([(0, .02, .012), (0, .98, .018)], .0085, n=8), rbox((0, .04, .03), (.022, .17, .03), r=.3, n=4), loft([(0, .94, .018), (0, .96, .05)], .006, n=6)]
    v, f = merge(parts)
    return add_mesh(nome + '_aco', v, f, gm)
