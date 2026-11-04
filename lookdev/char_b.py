"""Style B: stylised 3D character (a heavily-built puppet with a big expressive head), fully procedural and rigged.
The head is a smooth signed-distance sculpture shot onto a fixed-topology sphere, so every expression is the same mesh with
different vertex positions (shape keys for free). Body: lofted cloth + armature with distance weights."""
import math
import numpy as np
import bpy
from mathutils import Vector
from common import *

HEAD_O = np.array([0, -.012, 1.595])    # head local origin in the rest pose
HS = 1.3                               # stylised big head, scaled around the jaw hinge
HPIV = np.array([0, -.01, -.14])
def hv(v):
    v = np.array(v, float)
    v[:, 2] = np.where(v[:, 2] < 0, v[:, 2] * .84, v[:, 2])
    return (v - HPIV) * HS + HPIV + HEAD_O


# ---------- SDF sculpture ----------
def ell(P, c, r):
    p = P - np.asarray(c); r = np.asarray(r, float)
    k0 = np.linalg.norm(p / r, axis=1); k1 = np.linalg.norm(p / (r * r), axis=1) + 1e-9
    return k0 * (k0 - 1) / k1

def cap(P, a, b, r):
    a, b = np.asarray(a, float), np.asarray(b, float); ab = b - a
    t = np.clip(((P - a) @ ab) / (ab @ ab), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1) - r

def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)

def smax(a, b, k):
    return -smin(-a, -b, k)

def head_body(P, e):
    """The head without mouth/eye cuts: wide skull, heavy jaw, short face. e: expression dict."""
    jd = e['open'] * .02
    d = ell(P, (0, .004, .018), (.122, .124, .112))                              # cranium
    d = smin(d, ell(P, (0, -.03, -.052 - jd * .5), (.103, .092, .07 + jd * .3)), .03)   # jaw mass
    d = smin(d, ell(P, (0, -.102, -.102 - jd), (.036, .024, .022)), .03)         # chin
    for s in (-1, 1):
        d = smin(d, ell(P, (s * .082, -.074, -.012), (.034, .036, .026)), .022)  # cheekbone
        d = smin(d, cap(P, (s * .1, -.02, -.07 - jd * .7), (s * .052, -.086, -.1 - jd), .018), .024)   # jaw line
        d = smin(d, cap(P, (s * .014, -.118, .046 + e['brow'] * .4), (s * .082, -.094, .044 + e['brow'] * .12), .0125), .02)    # brow ridge; inner end rises with fear
        d = smin(d, ell(P, (s * .124, .004, -.012), (.012, .03, .04)), .008)     # ear
    d = smin(d, cap(P, (0, -.114, .024), (0, -.138, -.022), .0125), .018)         # nose bridge
    d = smin(d, ell(P, (0, -.144, -.03), (.02, .019, .017)), .012)                # nose tip
    for s in (-1, 1):
        d = smin(d, ell(P, (s * .02, -.128, -.036), (.012, .014, .0105)), .008)   # nose wings
    u = -.061; l = -.088 - jd * 1.1
    w = .042 + e['wide'] * .014
    d = smin(d, ell(P, (0, -.116, u), (w, .014, .0065)), .01)                     # upper lip
    d = smin(d, ell(P, (0, -.114, l), (w * .9, .014, .0075)), .01)                # lower lip
    return d

def head_sdf(P, e):
    d = head_body(P, e)
    jd = e['open'] * .02
    if e['open'] > .02:
        z0 = -.061 - .002; z1 = -.088 - jd * 1.1 + .002
        d = smax(d, -ell(P, (0, -.14, (z0 + z1) / 2), (.03 + e['wide'] * .014, .078, max(.004, (z0 - z1) / 2))), .005)   # mouth cavity
    for s in (-1, 1):
        d = smax(d, -ell(P, (s * .05, -.126, .008), (.032, .03, .023 + e['eye'] * .006)), .009)   # eye socket
        if e['fold'] > 0:
            d = smax(d, -cap(P, (s * .03, -.13, -.044), (s * .07, -.108, -.082), .0026), .0065 * e['fold'] + .0005)   # nasolabial fold
    return d

def grad(f, P, e, h=.0015):
    g = np.zeros_like(P)
    for i in range(3):
        o = np.zeros(3); o[i] = h
        g[:, i] = f(P + o, e) - f(P - o, e)
    return g / (np.linalg.norm(g, axis=1, keepdims=True) + 1e-9)

def shoot(e, nu=320, nv=200):
    """Project a lat-long sphere inward on the sculpture from outside: fixed topology for every expression."""
    th = np.linspace(0, 2 * np.pi, nu, endpoint=False)
    ph = np.linspace(.001, np.pi - .001, nv)
    PH, TH = np.meshgrid(ph, th, indexing='ij')
    D = np.stack([np.sin(PH) * np.cos(TH), np.sin(PH) * np.sin(TH), np.cos(PH)], -1).reshape(-1, 3)
    O = np.array([0, -.03, -.018])
    t = np.full(len(D), .34)
    for _ in range(90):
        t = np.maximum(t - .85 * head_sdf(O + D * t[:, None], e), 0.02)
    return O + D * t[:, None], grid_faces(nv, nu), nv, nu

def build_head(e_final, e_rest):
    P, F, nv, nu = shoot(e_final)
    Pr, _, _, _ = shoot(e_rest)
    N = grad(head_sdf, P, e_final)
    ao = np.clip(head_sdf(P + N * .022, e_final) / .022, 0, 1) * .5 + np.clip(head_sdf(P + N * .007, e_final) / .007, 0, 1) * .5
    inner = -head_body(P, e_final)                         # how deep below the un-carved skin
    jd_ = e_final['open'] * .02; z0_ = -.061; z1_ = -.088 - jd_ * 1.1; mz_ = (z0_ + z1_) / 2; a_ = .03 + e_final['wide'] * .014; b_ = (z0_ - z1_) / 2
    mo = 1 - smooth(.86, 1.0, np.hypot(P[:, 0] / a_, (P[:, 2] - mz_) / b_))
    cav = np.maximum(smooth(.0035, .012, inner), mo * (P[:, 1] < -.03))
    lipz = np.abs(P[:, 0]) < .05
    lips = (1 - smooth(.0, .013, np.minimum(np.abs(ell(P, (0, -.116, -.061), (.05, .016, .0085))), np.abs(ell(P, (0, -.114, -.088 - e_final['open'] * .022), (.046, .016, .0095)))))) * lipz
    stub = smooth(-.022, -.055, P[:, 2]) * (1 - cav)
    stub = stub * (1 - lips)
    blush = (np.exp(-(((np.abs(P[:, 0]) - .08) / .03) ** 2 + ((P[:, 2] + .025) / .03) ** 2)) + .9 * np.exp(-((P[:, 0] / .03) ** 2 + ((P[:, 2] + .03) / .022) ** 2) )) * (P[:, 1] < -.04)
    hair = smooth(.098, .112, np.abs(P[:, 0])) * smooth(-.05, -.01, P[:, 2]) * smooth(-.08, -.04, P[:, 1])
    socket = (P[:, 1] < -.05) * np.minimum(1, sum(np.exp(-(((P[:, 0] - s * .05) / .05) ** 2 + ((P[:, 2] - .008) / .034) ** 2)) for s in (-1, 1)))
    attrs = {'ao': ao, 'zona': np.stack([np.clip(cav, 0, 1), np.clip(stub, 0, 1), np.clip(blush, 0, 1)], 1), 'zona2': np.stack([np.clip(lips, 0, 1), np.clip(hair, 0, 1), np.clip(socket, 0, 1)], 1)}
    return P, Pr, F, attrs


# ---------- materials ----------
def skin_mat():
    M = Mat('skin_b'); co = M.coord('Object')
    cav = M.attr('zona', 'Red'); stub = M.attr('zona', 'Green'); bl = M.attr('zona', 'Blue')
    lips = M.attr('zona2', 'Red'); hair = M.attr('zona2', 'Green'); sock = M.attr('zona2', 'Blue'); ao = M.attr('ao', 'Red')
    mott = M.noise(co, 42, 5, .6)
    base = M.ramp(mott, [(.35, srgb('#a58e7e')), (.65, srgb('#bba796'))])
    base = M.mix(M.math('MULTIPLY', bl, .26), base, srgb('#a8574a'))
    base = M.mix(M.math('MULTIPLY', sock, .55), base, srgb('#5e433d'))
    base = M.mix(M.math('MULTIPLY', lips, .34), base, srgb('#7f4a44'))
    # stubble: a dark tint broken up by a very fine noise
    st = M.ramp(M.noise(co, 900, 2, .5), [(.3, (.25, .25, .25)), (.7, (1, 1, 1))])
    base = M.mix(M.math('MULTIPLY', M.math('MULTIPLY', stub, st), .5), base, srgb('#2c2622'))
    base = M.mix(M.math('MULTIPLY', stub, .42), base, srgb('#4a4744'))
    dirt = M.ramp(M.noise(co, 12, 6, .62), [(.54, (0, 0, 0)), (.76, (.32, .32, .32))])
    base = M.mix(dirt, base, srgb('#4a3d30'))
    base = M.mix(hair, base, srgb('#26201c'))
    base = M.mix(M.math('POWER', ao, 1.3), srgb('#3a1f1a'), base)
    base = M.mix(cav, base, srgb('#25090b'))
    rough = M.ramp(mott, [(.3, (.42, .42, .42)), (.7, (.6, .6, .6))])
    M.pbr(base, rough=rough, normal=M.bump(M.noise(co, 150, 4, .6), .1, .002), sss=.45, sss_radius=(1.0, .35, .2), spec=.42)
    return M.m

def wool_mat(name='wool', c0='#4c4f47', c1='#61645a', c2='#74766b'):
    M = Mat(name); co = M.coord('Object')
    big = M.noise(co, 6.5, 6, .58); fine = M.noise(co, 280, 3, .5)
    base = M.ramp(big, [(.3, srgb(c0)), (.5, srgb(c1)), (.74, srgb(c2))])
    dirt = M.ramp(M.noise(co, 4, 6, .65), [(.5, (0, 0, 0)), (.74, (.6, .6, .6))])
    base = M.mix(dirt, base, srgb('#3e3528'))
    M.pbr(base, rough=.92, normal=M.bump(M.math('ADD', M.math('MULTIPLY', fine, .7), big), .55, .012), spec=.2)
    return M.m

def leather_mat():
    M = Mat('leather'); co = M.coord('Object'); n = M.noise(co, 55, 5, .6); b = M.noise(co, 8, 4, .6)
    base = M.ramp(b, [(.32, srgb('#23170f')), (.68, srgb('#4a3020'))])
    M.pbr(base, rough=M.ramp(n, [(.3, (.3, .3, .3)), (.7, (.6, .6, .6))]), normal=M.bump(n, .3, .006), spec=.5)
    return M.m

def helmet_mat():
    M = Mat('helmet'); co = M.coord('Object')
    n = M.noise(co, 22, 6, .6); big = M.noise(co, 5, 6, .6); ch = M.noise(co, 34, 6, .72)
    base = M.ramp(big, [(.3, srgb('#3f4438')), (.7, srgb('#5d6250'))])
    chips = M.ramp(ch, [(.66, (0, 0, 0)), (.71, (1, 1, 1))])
    base = M.mix(chips, base, srgb('#26231f'))
    bf = M.nt.nodes.new('ShaderNodeNewGeometry').outputs['Backfacing']
    base = M.mix(bf, base, (.006, .006, .006))
    M.pbr(base, rough=M.mix(chips, M.ramp(n, [(.3, (.42, .42, .42)), (.7, (.66, .66, .66))]), (.38, .38, .38)), metal=M.math('MULTIPLY', chips, .8), normal=M.bump(M.math('ADD', n, M.math('MULTIPLY', chips, -.8)), .35, .006), spec=.5)
    return M.m

def eye_mat():
    M = Mat('eye'); ang = M.attr('olho', 'Red')
    base = M.ramp(ang, [(0, (.004, .004, .005)), (.2, (.004, .004, .005)), (.22, srgb('#3a3a30')), (.36, srgb('#6a6248')), (.43, srgb('#1e1c18')), (.46, srgb('#cfc6b6')), (1, srgb('#cbbcae'))])
    M.pbr(base, rough=.12, spec=.7)
    return M.m


# ---------- pieces ----------
def helmet_mesh():
    """M1916 Stahlhelm silhouette: tall dome, low visor, sharp notch at the temple, deep straight skirt over the ears and neck."""
    nt, nr = 160, 60
    V = []
    top = .172
    for i in range(nr):
        k = i / (nr - 1)
        for j in range(nt):
            th = 2 * math.pi * j / nt
            cx, cy = math.cos(th), math.sin(th)
            front = max(0, -cy)
            w = float(smooth(.5, .72, front))     # visor zone
            edge = -.058 * (1 - w) + .05 * w + .012 * max(0, cy)   # skirt low on the sides, visor above the brows
            edge += .006 * (1 - w) * cy
            step = edge + (.052 * (1 - w) + .018 * w)
            z = top + (edge - top) * k
            if z > step:
                u = min(1, (top - z) / (top - step))
                rr = (1 - (1 - u) ** 2.5) ** .5
                flare = 0.0
            else:
                u = (step - z) / max(1e-4, step - edge)
                rr = 1.0
                flare = (.006 + .007 * abs(cx)) * u + w * .018 * u
            rx, ry = .133, .142
            V.append((cx * (rx * rr + flare), cy * (ry * rr + flare) - .004, z))
    return np.array(V), [tuple(reversed(q)) for q in grid_faces(nr, nt)]

def eyeball(s, gaze):
    c = np.array([s * .05, -.092, .008]); r = .0335
    V, F = uv_sphere((0, 0, 0), r, 160, 90)
    g = np.array(gaze, float) - (HEAD_O + c); g /= np.linalg.norm(g)
    ang = np.arccos(np.clip((V / r) @ g, -1, 1)) / 1.1
    return V + c, F, {'olho': np.clip(ang, 0, 1)}

def lid(s, up_el, low_el, skin):
    """Eyelid shells around the eyeball: the opening is an elevation band (degrees)."""
    c = np.array([s * .05, -.092, .008]); r = .0335 * 1.075
    V = []; nAz, nEl = 48, 14
    parts = []
    for (e0, e1, sag) in ((up_el, 80, 1), (-80, low_el, -1)):
        Vp = []
        for i in range(nEl):
            for j in range(nAz):
                az = -1.25 + 2.5 * j / (nAz - 1)
                edge_shift = (abs(az) / 1.25) ** 2 * (-20 * sag)
                a = e0 + (e1 - e0) * i / (nEl - 1)
                el = math.radians(a + (edge_shift if (i == 0 and sag > 0) or (i == nEl - 1 and sag < 0) else edge_shift * (1 - i / (nEl - 1) if sag > 0 else i / (nEl - 1))))
                x = math.sin(az) * math.cos(el); y = -math.cos(az) * math.cos(el); z = math.sin(el)
                Vp.append(c + r * np.array([x, y, z]))
        parts.append((np.array(Vp), grid_faces(nEl, nAz, wrap=False)))
    return merge(parts)

def brow(s, e):
    k = np.linspace(0, 1, 16)
    x = s * (.014 + .072 * k)
    z = .046 + e['brow'] * (1 - k) * .55 + .012 * np.sin(k * math.pi) - .016 * k
    y = -.13 + .038 * k ** 2
    r = (.0048 + .0068 * np.sin(k * 2.7 + .25)) * (1 - .25 * k)
    return loft(np.stack([x, y, z], 1), r, r * .55, n=12)

def teeth(e):
    parts = []
    jd = e['open'] * .02
    zu = -.07; zl = -.081 - jd * 1.1
    for i in range(-4, 5):
        a = i * .25
        parts.append(rbox((math.sin(a) * .04, -.1 - math.cos(a) * .022, zu), (.0118, .0075, .0125), r=.55, n=4))
    for i in range(-3, 4):
        a = i * .26
        parts.append(rbox((math.sin(a) * .036, -.1 - math.cos(a) * .022, zl), (.0105, .0072, .0095), r=.55, n=4))
    return merge(parts)

def hand_mesh(w, sgn, spread=1.0, curl=.1):
    """Hand hanging down from the wrist w, palm towards -Y. sgn: side of the thumb on X in the rest pose."""
    w = np.asarray(w, float); parts = []
    parts.append(rbox(w + (0, 0, -.052), (.094, .036, .1), r=.72, n=9))
    for i, L in enumerate((.074, .086, .08, .064)):
        x0 = (-.033 + i * .022) * -sgn
        a = (-.17 + i * .11) * spread * -sgn
        pts = []; pos = w + np.array([x0, 0, -.098]); d = np.array([math.sin(a), 0, -math.cos(a)])
        for s in range(7):
            pts.append(pos.copy())
            pos = pos + d * L / 6
            d = d + np.array([0, -curl * .25, curl * .05]); d /= np.linalg.norm(d)
        parts.append(loft(pts, np.linspace(.0115, .0082, 7), np.linspace(.0105, .0072, 7), n=10))
    # thumb
    p0 = w + np.array([sgn * .04, -.012, -.035]); p1 = p0 + np.array([sgn * .038, -.01, -.03]); p2 = p1 + np.array([sgn * .018, -.008, -.036])
    parts.append(loft([p0, (p0 + p1) / 2, p1, (p1 + p2) / 2, p2], np.linspace(.0155, .009, 5), n=10))
    return merge(parts)

def wrinkles(seed, amp, fold=None):
    def f(k, th, p):
        n = float(fbm(np.array(p[2] * 9 + math.cos(th) * 1.6 + seed), np.array(math.sin(th) * 2.4 + p[2] * 3), 3, seed)) - .5
        out = amp * n * 1.6
        if fold:
            out += fold(k, th, p)
        return out
    return f


def build(pcfg):
    px, py = pcfg['pos']
    # ---- skeleton (rest pose) ----
    B = {
        'hips': ((0, 0, .95), (0, 0, 1.12), None), 'spine': ((0, 0, 1.12), (0, 0, 1.31), 'hips'), 'chest': ((0, 0, 1.31), (0, 0, 1.44), 'spine'),
        'neck': ((0, 0, 1.44), (0, -.008, 1.5), 'chest'), 'head': ((0, -.008, 1.5), (0, -.012, 1.72), 'neck'),
        'upper_R': ((-.205, 0, 1.385), (-.26, 0, 1.105), 'chest'), 'fore_R': ((-.26, 0, 1.105), (-.295, -.008, .86), 'upper_R'), 'hand_R': ((-.295, -.008, .86), (-.3, -.012, .71), 'fore_R'),
        'upper_L': ((.205, 0, 1.385), (.26, 0, 1.105), 'chest'), 'fore_L': ((.26, 0, 1.105), (.295, -.008, .86), 'upper_L'), 'hand_L': ((.295, -.008, .86), (.3, -.012, .71), 'fore_L'),
        'thigh_R': ((-.105, 0, .94), (-.12, -.01, .52), 'hips'), 'shin_R': ((-.12, -.01, .52), (-.125, .01, .09), 'thigh_R'),
        'thigh_L': ((.105, 0, .94), (.12, -.01, .52), 'hips'), 'shin_L': ((.12, -.01, .52), (.125, .01, .09), 'thigh_L'),
    }
    arm = build_armature('alemao_rig', B)
    wool, trousers, leather, skinm, helm, eye = wool_mat(), wool_mat('trouser', '#40433c', '#50534a', '#5f6158'), leather_mat(), skin_mat(), helmet_mat(), eye_mat()
    teethm = Mat('teeth'); teethm.pbr(teethm.ramp(teethm.noise(teethm.coord('Object'), 200, 3), [(.3, srgb('#a89a7c')), (.7, srgb('#cfc5a6'))]), rough=.28, spec=.6)
    tongue = Mat('tongue'); tongue.pbr(srgb('#5e2a2c'), rough=.45)
    hairm = Mat('brow'); hairm.pbr(hairm.ramp(hairm.noise(hairm.coord('Object'), 180, 3), [(.35, srgb('#15110e')), (.65, srgb('#3a2e24'))]), rough=.7, normal=hairm.bump(hairm.noise(hairm.coord('Object'), 300, 2), .5, .003))
    brass = bpy.data.materials.get('brass')
    torso_b = {k: B[k][:2] for k in ('hips', 'spine', 'chest', 'neck')}

    # ---- tunic ----
    zs = np.array([.80, .84, .90, .95, .985, 1.0, 1.015, 1.06, 1.12, 1.2, 1.28, 1.33, 1.37, 1.405, 1.43, 1.452, 1.475])
    rx = np.array([.205, .202, .19, .172, .158, .153, .157, .172, .186, .196, .205, .208, .196, .155, .095, .068, .064])
    ry = np.array([.135, .133, .127, .116, .106, .103, .106, .118, .126, .131, .131, .124, .108, .084, .07, .065, .062])
    rx, ry = rx * .93, ry * .95
    zz = np.interp(np.linspace(0, 1, 86), np.linspace(0, 1, len(zs)), zs)
    xx = np.interp(zz, zs, rx); yy = np.interp(zz, zs, ry)
    def fold(k, th, p):
        z = p[2]
        waist = np.exp(-((z - 1.03) / .08) ** 2)
        return float(.009 * waist * math.sin(th * 15 + z * 18) + .005 * math.sin(th * 7 + z * 11) * (1 - waist) + .006 * math.exp(-((z - .93) / .05) ** 2) * math.sin(th * 11 + 1.3))
    V, F = loft(np.stack([np.zeros_like(zz), np.zeros_like(zz), zz], 1), xx, yy, n=96, power=2.5, disp=wrinkles(3, .018, fold))
    tun = add_mesh('tunic', V, F, wool); skin(tun, arm, torso_b)

    # slash-pocket flaps, front fly, shoulder boards, collar
    parts = []
    for s in (-1, 1):
        v, f = rbox((0, 0, 0), (.135, .018, .052), r=.45, n=6); parts.append((xf(v, rot_trs((s * .105, -.125, .925), (.05, s * .12, s * -.22))), f))
        v, f = rbox((0, 0, 0), (.055, .03, .13), r=.5, n=6); parts.append((xf(v, rot_trs((s * .155, -.012, 1.386), (0, s * 1.0, 0))), f))
    v, f = rbox((0, -.112, 1.26), (.03, .012, .36), r=.5, n=6)   # fly front
    parts.append((v, f))
    for s_ in (-1, 1):
        v, f = rbox((s_ * .052, -.062, 1.477), (.042, .012, .036), r=.4, n=5); parts.append((v, f))   # collar tabs
    v, f = merge(parts); o = add_mesh('tunic_extras', v, f, wool); skin(o, arm, torso_b)
    k = np.linspace(0, 1, 6)
    v, f = loft(np.stack([np.zeros(6), np.full(6, -.008) + 0 * k, 1.452 + k * .052], 1), .0735 - .002 * k, .0745 - .002 * k, n=48, cap=False)
    o = add_mesh('collar', v, f, wool); o.modifiers.new('sol', 'SOLIDIFY').thickness = .005; skin(o, arm, torso_b)

    # ---- belt, buckle, Y-straps, pouches ----
    n = 96; a = np.linspace(0, 2 * np.pi, n, endpoint=False)
    bz = 1.002
    ring = np.stack([.165 * np.cos(a), .115 * np.sin(a), np.full(n, bz)], 1)
    Vb = []
    for zo, ro in ((-.024, 0), (-.024, .006), (.024, .006), (.024, 0)):
        Vb.append(ring * np.array([1 + ro / .165, 1 + ro / .115, 0]) + np.array([0, 0, bz + zo]))
    v = np.concatenate(Vb); f = grid_faces(4, n)
    o = add_mesh('belt', v, f, leather, shade=False); skin(o, arm, torso_b)
    v, f = rbox((0, -.123, bz), (.058, .012, .052), r=.2, n=4); o = add_mesh('buckle', v, f, brass); skin(o, arm, torso_b)
    parts = []
    for s in (-1, 1):
        for i in range(3):
            xc = s * (.065 + i * .055); yc = -.112 + i * .012
            v, f = rbox((xc, yc, bz - .012), (.052, .036, .074), r=.3, n=5)
            parts.append((v, f))
            v, f = rbox((xc, yc - .017, bz + .022), (.054, .012, .032), r=.45, n=5)
            parts.append((v, f))
    v, f = merge(parts); o = add_mesh('harness', v, f, leather); skin(o, arm, torso_b)

    # ---- arms (one continuous sleeve through the elbow) ----
    for side, sgn in (('R', -1), ('L', 1)):
        S = np.array(B['upper_' + side][0]); E = np.array(B['upper_' + side][1]); W = np.array(B['fore_' + side][1])
        pts = np.concatenate([S + (E - S) * np.linspace(-.1, 1, 22)[:, None], E + (W - E) * np.linspace(.05, 1, 22)[:, None]])
        rr = np.concatenate([np.linspace(.056, .05, 22), np.linspace(.049, .04, 22)])
        def sf(k, th, p, s=sgn):
            ek = np.exp(-((k - .5) / .09) ** 2)
            return float(.009 * ek * math.sin(th * 5 + k * 46) + .004 * math.sin(th * 3 + k * 24))
        v, f = loft(pts, rr, rr * .98, n=36, disp=wrinkles(9 + sgn, .02, sf))
        o = add_mesh('sleeve_' + side, v, f, wool)
        skin(o, arm, {k: B[k][:2] for k in ('chest', 'upper_' + side, 'fore_' + side)}, power=9)
        v, f = loft(W + (E - W) * np.linspace(0, .14, 5)[:, None] / 1, np.full(5, .0445), n=28)   # cuff
        o = add_mesh('cuff_' + side, v, f, wool); skin(o, arm, {'fore_' + side: B['fore_' + side][:2]})
        v, f = loft(W + (E - W) * np.linspace(-.03, .1, 5)[:, None], np.full(5, .036), n=16)      # wrist
        v2, f2 = hand_mesh(W + np.array([0, 0, -.01]), sgn, 1.0 if side == 'R' else .4, .08 if side == 'R' else .55)
        v2 = (v2 - W) * .84 + W
        v, f = merge([(v, f), (v2, f2)])
        o = add_mesh('hand_' + side, v, f, skinm, attrs={'ao': np.ones(len(v)), 'zona': np.zeros((len(v), 3)), 'zona2': np.zeros((len(v), 3))})
        skin(o, arm, {k: B[k][:2] for k in ('hand_' + side, 'fore_' + side)}, power=12)
        # legs
        leg = 'R' if side == 'R' else 'L'
        H = np.array(B['thigh_' + leg][0]); K = np.array(B['thigh_' + leg][1]); A = np.array(B['shin_' + leg][1])
        pts = np.concatenate([H + (K - H) * np.linspace(0, 1, 14)[:, None], K + (A - K) * np.linspace(.05, .5, 8)[:, None]])
        v, f = loft(pts, np.linspace(.098, .062, 22), n=26, disp=wrinkles(5, .012))
        o = add_mesh('trouser_' + leg, v, f, trousers); skin(o, arm, {k: B[k][:2] for k in ('hips', 'thigh_' + leg, 'shin_' + leg)})
        pts = K + (A - K) * np.linspace(.42, 1.0, 12)[:, None]
        v, f = loft(pts, np.linspace(.066, .05, 12), n=22)
        v2, f2 = rbox(A + np.array([0, -.05, -.045]), (.1, .25, .09), r=.7, n=7)
        v, f = merge([(v, f), (v2, f2)])
        o = add_mesh('boot_' + leg, v, f, leather); skin(o, arm, {'shin_' + leg: B['shin_' + leg][:2]})

    # ---- neck ----
    v, f = loft([(0, -.002, 1.42), (0, -.006, 1.47), (0, -.012, 1.52), (0, -.02, 1.56)], .056, n=28)
    o = add_mesh('neck', v, f, skinm, attrs={'ao': np.ones(len(v)) * .55, 'zona': np.zeros((len(v), 3)), 'zona2': np.zeros((len(v), 3))})
    skin(o, arm, {k: B[k][:2] for k in ('chest', 'neck', 'head')})

    # ---- head: expression as a shape key on one topology ----
    shout = {'open': 2.1, 'wide': .55, 'brow': .024, 'eye': 1.0, 'fold': 1.0}
    rest = {'open': 0.0, 'wide': 0.0, 'brow': 0.0, 'eye': 0.0, 'fold': 0.0}
    P, Pr, F, attrs = build_head(shout, rest)
    hb = {'head': B['head'][:2]}
    o = add_mesh('head', hv(Pr), F, skinm, attrs=attrs)
    o.shape_key_add(name='neutro')
    sk = o.shape_key_add(name='grito')
    sk.data.foreach_set('co', hv(P).ravel())
    sk.value = 1.0
    skin(o, arm, hb)

    gaze = pcfg['olhar_para']
    for s in (-1, 1):
        v, f, at = eyeball(s, gaze)
        o = add_mesh(f'eye{s}', hv(v), f, eye, attrs=at); skin(o, arm, hb)
        v, f = lid(s, 27, -27, skinm)
        o = add_mesh(f'lid{s}', hv(v), f, skinm, attrs={'ao': np.ones(len(v)) * .8, 'zona': np.zeros((len(v), 3)), 'zona2': np.tile([0, 0, .35], (len(v), 1))}); skin(o, arm, hb)
        v, f = brow(s, shout)
        o = add_mesh(f'brow{s}', hv(v), f, hairm.m); skin(o, arm, hb)
    v, f = teeth(shout); o = add_mesh('teeth', hv(v), f, teethm.m); skin(o, arm, hb)
    v, f = uv_sphere((0, -.094, -.128), .034, 24, 16, (.8, 1.0, .3)); o = add_mesh('tongue', hv(v), f, tongue.m); skin(o, arm, hb)

    # ---- helmet + chin strap ----
    v, f = helmet_mesh()
    o = add_mesh('helmet', hv(v), f, helm)
    skin(o, arm, hb)
    parts = []
    for s in (-1, 1):
        parts.append(loft([(s * .13, -.012, .03), (s * .146, -.012, .03)], .0115, n=14))   # side lug
    v, f = merge(parts)
    o = add_mesh('lugs', hv(v), f, helm); skin(o, arm, hb)

    # ---- the pose ----
    rotate_bone(arm, 'hips', (0, 0, 1), -.12)
    rotate_bone(arm, 'spine', (1, 0, 0), .08)
    rotate_bone(arm, 'spine', (0, 1, 0), -.055)
    rotate_bone(arm, 'chest', (0, 0, 1), .16)
    rotate_bone(arm, 'chest', (1, 0, 0), .05)
    rotate_bone(arm, 'neck', (1, 0, 0), -.09)
    rotate_bone(arm, 'head', (0, 0, 1), -.1)
    rotate_bone(arm, 'head', (0, 1, 0), .1)
    rotate_bone(arm, 'head', (1, 0, 0), -.1)
    aim_bone(arm, 'upper_R', (-.88, -.24, .3))
    aim_bone(arm, 'fore_R', (-.2, -.3, .93))
    aim_bone(arm, 'hand_R', (.16, -.12, 1))
    aim_bone(arm, 'upper_L', (.3, -.34, -.89))
    aim_bone(arm, 'fore_L', (.3, -.82, -.2))
    aim_bone(arm, 'hand_L', (.5, -.7, -.5))
    arm.location = (px, py, 0)
    bpy.context.view_layer.update()
    return arm
