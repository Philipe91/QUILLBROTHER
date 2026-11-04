"""Procedural acting, reusable by any biped: forward kinematics on rest matrices, two-bone IK, a run/brake generator with
locked foot plants, and damped springs for secondary motion. Everything is a pure function of time, precomputed once."""
import math
import numpy as np
from mathutils import Vector as V, Matrix, Quaternion as Q

def smoo(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)

def two_bone(S, W, a, b, pole):
    """Returns elbow/knee and the reachable end. The joint bends toward pole."""
    d = W - S; L = d.length
    Lc = min(L, a + b - 1e-4); u = d / max(L, 1e-6); end = S + u * Lc
    x = (a * a - b * b + Lc * Lc) / (2 * Lc); y = math.sqrt(max(0.0, a * a - x * x))
    n = pole - u * pole.dot(u)
    n = n.normalized() if n.length > 1e-6 else V((0, 0, 1))
    return S + u * x + n * y, end, L - Lc

class Esqueleto:
    def __init__(s, arm, ossos):
        s.arm = arm; s.ossos = ossos
        s.R0 = {k: arm.data.bones[k].matrix_local.copy() for k in ossos}
        s.len = {k: arm.data.bones[k].length for k in ossos}
        s.parent = {k: ossos[k][2] for k in ossos}
        s.P = {}; s.head = {}

    def begin(s):
        s.P = {}; s.head = {}

    def _store(s, k, h, D):
        M = Matrix.Translation(h) @ D.to_matrix().to_4x4() @ s.R0[k].to_3x3().to_4x4()
        s.P[k] = M; s.head[k] = h.copy()

    def root(s, k, h, D):
        s._store(k, V(h), D)

    def joint(s, k):
        p = s.parent[k]
        return (s.P[p] @ s.R0[p].inverted() @ s.R0[k].translation)

    def set(s, k, D):
        s._store(k, s.joint(k), D)

    def aim(s, k, d, roll=0.0):
        rest = (s.R0[k].to_3x3() @ V((0, 1, 0))).normalized()
        d = V(d).normalized(); D = rest.rotation_difference(d)
        if roll:
            D = Q(d, roll) @ D
        s.set(k, D)

    def tail(s, k):
        return s.P[k] @ V((0, s.len[k], 0))

    def key(s, f):
        pb = s.arm.pose.bones
        for k in s.ossos:
            p = s.parent[k]
            if p is None:
                B = s.R0[k].inverted() @ s.P[k]
            else:
                B = (s.R0[p].inverted() @ s.R0[k]).inverted() @ s.P[p].inverted() @ s.P[k]
            loc, rot, _ = B.decompose()
            b = pb[k]; b.rotation_mode = 'QUATERNION'; b.rotation_quaternion = rot
            b.keyframe_insert('rotation_quaternion', frame=f)
            if p is None:
                b.location = loc; b.keyframe_insert('location', frame=f)


class Corrida:
    """Run, brake and stop along a straight line. Each landing makes a plant; a planted foot does not move until it lifts."""
    def __init__(s, T, inicio, direcao, v, cad, tf=5.0, dt=1 / 480., t0=-1.5, lado=.09):
        s.T = T; s.d = np.array(direcao, float); s.d /= np.linalg.norm(s.d); s.lat = np.array([s.d[1], -s.d[0]])
        s.v, s.cad = v, cad; s.vmax = v(0.0)
        ts = np.arange(t0, tf + 1, dt); pos = [np.array(inicio, float)]; ph = [0.0]; plants = {'L': [], 'R': []}; foot = 'L'; s.plants = []
        vs = np.array([v(t) for t in ts]); cads = np.array([cad(t) for t in ts])
        P = np.cumsum(vs) * dt; s.ts = ts; s.S = P - np.interp(0.0, ts, P); s.ph = np.cumsum(cads) * dt - np.interp(0.0, ts, np.cumsum(cads) * dt); s.vs = vs
        s.org = np.array(inicio, float)
        # landings at integer phase; after the last landing the feet stay down
        k0 = math.ceil(s.ph[0]); k1 = math.floor(s.ph[-1]); s.ultimo = None
        for k in range(k0, k1 + 1):
            tl = float(np.interp(k, s.ph, ts)); vv = v(tl)
            if vv < .22:
                break
            sd = 'L' if k % 2 == 0 else 'R'; sg = 1 if sd == 'L' else -1
            xy = s.xy(tl) + s.d * (.1 + .012 * vv) + s.lat * sg * lado
            dur = .17 + .34 * (1 - vv / s.vmax)
            pl = dict(t=tl, t1=tl + dur, xy=xy, z=float(T(xy[0], xy[1])), lado=sd)
            plants[sd].append(pl); s.plants.append(pl)
        # both feet stay on the ground at the end
        for sd in 'LR':
            if plants[sd]:
                plants[sd][-1]['t1'] = 1e9
        s.pl = plants

    def xy(s, t):
        return s.org + s.d * float(np.interp(t, s.ts, s.S))

    def vel(s, t):
        return float(np.interp(t, s.ts, s.vs))

    def fase(s, t):
        return float(np.interp(t, s.ts, s.ph))

    def chao_suave(s, t):
        p = s.xy(t)
        return sum(float(s.T(p[0] + s.d[0] * o, p[1] + s.d[1] * o)) for o in (-.8, -.4, 0, .4, .8)) / 5

    def pe(s, sd, t):
        """Foot state: ankle-reference ground point, lift above ground, pitch. Locked while in stance."""
        L = s.pl[sd]
        i = 0
        while i + 1 < len(L) and L[i + 1]['t'] <= t:
            i += 1
        a = L[i]
        if t < a['t']:
            return V((a['xy'][0], a['xy'][1], a['z'])), 0.0, 0.0, True
        if t <= a['t1']:
            u = (t - a['t']) / max(1e-3, a['t1'] - a['t']) if a['t1'] < 1e8 else 0.5
            pitch = .28 * (1 - smoo(0, .22, u)) if a['t1'] < 1e8 else .28 * (1 - smoo(0, .1, t - a['t']))   # heel strike, rolls flat
            rise = -.85 * smoo(.62, 1, u) if a['t1'] < 1e8 else 0.0                                         # then rolls over the toes
            return V((a['xy'][0], a['xy'][1], a['z'])), 0.0, pitch + rise, True
        b = L[i + 1]; u = (t - a['t1']) / max(1e-3, b['t'] - a['t1'])
        e = u * u * (3 - 2 * u)
        xy = a['xy'] + (b['xy'] - a['xy']) * e; z = a['z'] + (b['z'] - a['z']) * e
        v01 = s.vel(t) / s.vmax
        lift = (.05 + .3 * v01) * math.sin(math.pi * min(1, u * 1.04)) ** .8
        pitch = -.85 * (1 - smoo(0, .55, u)) + .28 * smoo(.72, 1, u)
        return V((xy[0], xy[1], z)), lift, pitch, False


def mola(alvo, dt, f=3.0, z=.45, x0=None):
    """Second-order spring following a sampled target; returns the response. Deterministic."""
    w = 2 * math.pi * f; x = alvo[0] if x0 is None else x0; v = 0.0; out = []
    for a in alvo:
        for _ in range(4):
            acc = w * w * (a - x) - 2 * z * w * v
            v += acc * dt / 4; x += v * dt / 4
        out.append(x)
    return np.array(out)

def ankle_de(chao, lift, pitch, yaw_dir):
    """Ankle position from the ground point and foot pitch: rotates about the heel when positive, the toe when negative."""
    d = V((yaw_dir[0], yaw_dir[1], 0))
    if pitch >= 0:   # heel on the ground: ankle sits above the heel
        p = chao + V((0, 0, .09 + lift)) - d * .0
    else:            # toe on the ground: the heel rises around a pivot .17 ahead
        toe = chao + d * .17
        p = toe - d * .17 * math.cos(-pitch) + V((0, 0, .17 * math.sin(-pitch) + .09 * math.cos(-pitch) + lift))
    return p
