"""Acting for the 15 s sequence: a runner with a rifle (locked feet, weight, secondary motion) and two background soldiers.
All pure functions of time, baked to keyframes once. The shot plan lives in shots/gunther_missao15.json."""
import math
import numpy as np
from mathutils import Vector as V, Quaternion as Q, Matrix
from locomocao import two_bone, smoo, mola, ankle_de

UP = V((0, 0, 1))
def qz(a): return Q(UP, a)
def noise(t, seed):
    return math.sin(t * 1.3 + seed) * .5 + math.sin(t * 2.9 + seed * 2.1) * .3 + math.sin(t * 6.1 + seed * .7) * .2

def base_yaw(d):
    return math.atan2(d[1], d[0]) + math.pi / 2


class Corredor:
    def __init__(s, E, C, fps=24, tmin=-.3, tmax=15.3):
        s.E, s.C = E, C; s.d = V((C.d[0], C.d[1], 0)); s.lat = V((C.lat[0], C.lat[1], 0)); s.yaw0 = base_yaw(C.d); s.fps = fps
        s.axis_lean = UP.cross(s.d).normalized()
        n = int((tmax - tmin) * fps) + 1; s.T0 = tmin; s.n = n
        ts = np.array([tmin + i / fps for i in range(n)])
        s.ts = ts
        vel = np.array([C.vel(t) for t in ts]); acc = np.gradient(vel, 1 / fps)
        s.aim = np.array([smoo(13.72, 14.32, t) for t in ts])
        # lean with speed, plus a pitch response to acceleration: braking throws the torso back, then it settles
        alvo = .24 * vel / C.vmax - .022 * acc + .07 * s.aim
        s.lean = mola(alvo, 1 / fps, f=2.2, z=.62)
        # hip height: bent-leg run, low just after landing, high in flight; capped so a planted leg can always reach
        h = []
        for t, v, a in zip(ts, vel, s.aim):
            v01 = v / C.vmax; ph = C.fase(t); ch = C.chao_suave(t)
            z = ch + .925 - .05 * v01 - .025 * (1 - v01) * (1 - a) - .05 * a - .032 * v01 * math.cos(2 * math.pi * (ph - .08))
            for sd in 'LR':
                c, lift, p, st = C.pe(sd, t)
                if st:
                    A = ankle_de(c, lift, p, s.d); xy = V((C.xy(t)[0], C.xy(t)[1], 0)); dxy = (V((A.x, A.y, 0)) - xy).length
                    z = min(z, A.z + math.sqrt(max(.04, .822 ** 2 - (dxy + .03) ** 2)))
            h.append(z)
        h = np.array(h); hs = np.convolve(np.pad(h, 2, mode='edge'), [.1, .2, .4, .2, .1], 'valid')
        s.hip = np.minimum(hs, h)
        # secondary motion: springs following the body
        s.vert = mola(s.hip - np.array([C.chao_suave(t) for t in ts]), 1 / fps, f=3.4, z=.32)
        s.mochila = np.gradient(s.vert, 1 / fps) * .22 - .012 * acc
        s.mochila = mola(s.mochila, 1 / fps, f=4.2, z=.28)
        fases = np.array([C.fase(t) for t in ts])
        s.cantil = mola(np.sin(np.pi * fases) * .34 * vel / C.vmax + .02 * acc, 1 / fps, f=2.4, z=.2)
        s.saia = mola(np.cos(np.pi * fases) * vel / C.vmax, 1 / fps, f=3.6, z=.35)
        s.rifle_z = (s.vert - (s.hip - np.array([C.chao_suave(t) for t in ts]))) * .9
        s.rifle_x = mola(np.sin(np.pi * fases) * .03 * vel / C.vmax, 1 / fps, f=3.0, z=.4)
        s.ofego = np.clip(.3 + .3 * vel / C.vmax + .22 * np.sin(2 * np.pi * ts * 1.15) + .25 * np.cos(np.pi * fases) ** 2, 0, 1)

    def idx(s, t):
        return max(0, min(s.n - 1, int(round((t - s.T0) * s.fps))))

    def pose(s, t):
        E, C = s.E, s.C; i = s.idx(t); v01 = C.vel(t) / C.vmax; ph = C.fase(t); a = float(s.aim[i])
        S = math.cos(math.pi * ph)                     # +1: left foot forward, -1: right foot forward
        lean = float(s.lean[i]); xy = C.xy(t)
        breath = math.sin(t * 7.2) * .006 * a
        hip = V((xy[0], xy[1], float(s.hip[i]) + breath)) + s.lat * (-.022 * math.sin(math.pi * ph) * v01)
        yp = -.14 * S * v01 - .3 * a; yc = .2 * S * v01 - .52 * a
        rl = .05 * math.sin(math.pi * ph) * v01
        ql = lambda k: Q(s.axis_lean, lean * k)
        qr = lambda k: Q(s.d, rl * k)
        E.begin()
        E.root('hips', hip, ql(.55) @ qr(1) @ qz(s.yaw0 + yp))
        E.set('spine', ql(.85) @ qr(-.3) @ qz(s.yaw0 + .35 * yc))
        Dc = ql(1.05) @ qr(-.8) @ qz(s.yaw0 + yc)
        E.set('chest', Dc)
        hy = s.yaw0 + .4 * a + .03 * noise(t, 2)                      # the head holds the target while the body turns
        hp = lean * .25 - .035 * math.cos(2 * math.pi * ph) * v01 + .04 * noise(t, 5)
        E.set('neck', Q(s.axis_lean, lean * .45) @ qz(s.yaw0 + .5 * yc))
        E.set('head', Q(s.axis_lean, hp) @ Q(s.d, .05 * math.sin(math.pi * ph) * v01 - .06 * a) @ qz(hy))
        # legs: IK to the planned foot; stance feet are the plant itself
        for sd in 'LR':
            J = E.joint('thigh_' + sd); c, lift, pf, st = C.pe(sd, t)
            A = ankle_de(c, lift, pf, s.d)
            pole = s.d * 1.0 + s.lat * (.12 if sd == 'L' else -.12) + UP * .1
            K, end, _ = two_bone(J, A, E.len['thigh_' + sd], E.len['shin_' + sd], pole)
            E.aim('thigh_' + sd, K - J); E.aim('shin_' + sd, end - K)
            fd = s.d * math.cos(pf) + UP * math.sin(pf)
            E.aim('foot_' + sd, fd - UP * .34)
        # rifle: carried across the chest while running, comes up to the shoulder at the end, hands follow it
        f = Dc @ V((0, -1, 0)); r = Dc @ V((-1, 0, 0)); u = Dc @ UP
        C0 = E.head['chest']; SR = E.joint('upper_R'); SL = E.joint('upper_L')
        g0 = C0 + r * .15 + f * .24 - u * .03 + u * float(s.rifle_z[i]) + r * float(s.rifle_x[i])
        d0 = (-r * .62 + f * .34 + u * .7).normalized()
        g1 = SR + f * .3 + r * .0 - u * .03
        d1 = (s.d + UP * (.035 + .004 * math.sin(t * 7.2))).normalized()
        grip = g0.lerp(g1, a); dirr = (d0 * (1 - a) + d1 * a).normalized()
        reach = .33 + .1 * a
        fore = grip + dirr * reach
        for sd, W, Sh, pole in (('R', grip, SR, r * .75 - u * .8 - f * .25), ('L', fore, SL, -r * .55 - u * .85 + f * .1)):
            El, end, _ = two_bone(Sh, W, E.len['upper_' + sd], E.len['fore_' + sd], pole)
            E.aim('upper_' + sd, El - Sh); E.aim('fore_' + sd, end - El)
            E.aim('hand_' + sd, (dirr * .55 + (end - El).normalized() * .45 - u * .25))
        # gear
        dn = Dc @ V((0, 0, -1))
        E.aim('mochila', dn + f * (-.17 + float(s.mochila[i]) * .9))
        H = E.P['hips'].to_3x3()
        hf = H @ V((0, 0, 1))
        E.aim('cantil', -UP + s.d * float(s.cantil[i]) + s.lat * .1 * float(s.cantil[i]))
        sa = float(s.saia[i])
        E.aim('saia_F', -UP + s.d * (.14 + .1 * abs(sa) + .08 * v01))
        E.aim('saia_B', -UP - s.d * (.16 + .34 * v01 + .08 * sa))
        lat_R = s.d.cross(UP).normalized()   # figure's right when facing d
        E.aim('saia_R', -UP + lat_R * .18 + s.d * (-.2 * sa * v01 - .08 * v01))
        E.aim('saia_L', -UP - lat_R * .18 + s.d * (.2 * sa * v01 - .08 * v01))
        return grip, dirr


class Soldado:
    """Stays on two planted feet. A program returns hip offset, lean, turn, head and the wrist targets in chest space."""
    def __init__(s, E, x, y, ground, yaw, prog):
        s.E = E; s.yaw = yaw; s.prog = prog; s.x, s.y = x, y; s.g = ground
        Qy = qz(yaw); s.f = Qy @ V((0, -1, 0)); s.r = Qy @ V((-1, 0, 0))
        s.pes = {'R': V((x, y, 0)) + s.r * .13 - s.f * .1, 'L': V((x, y, 0)) - s.r * .13 + s.f * .18}
        for k, p in s.pes.items():
            p.z = ground(p.x, p.y)

    def pose(s, t):
        E = s.E; P = s.prog(t, s)
        hip = V((s.x, s.y, s.g(s.x, s.y) + P['hip'])) + s.f * P.get('fx', 0)
        ax = UP.cross(s.f).normalized()
        Qy = qz(s.yaw + P.get('yaw', 0))
        E.begin()
        E.root('hips', hip, Q(ax, P['lean'] * .5) @ Q(s.f, P.get('roll', 0)) @ Qy)
        E.set('spine', Q(ax, P['lean'] * .85) @ qz(s.yaw + P.get('yaw', 0) * .6))
        Dc = Q(ax, P['lean'] * 1.1) @ Q(s.f, -P.get('roll', 0) * .7) @ qz(s.yaw + P.get('yaw', 0))
        E.set('chest', Dc)
        E.set('neck', Q(ax, P['lean'] * .5) @ Qy)
        E.set('head', Q(ax, P.get('hp', 0)) @ qz(s.yaw + P.get('hy', 0)))
        for sd in 'LR':
            J = E.joint('thigh_' + sd); A = s.pes[sd] + V((0, 0, .09))
            K, end, _ = two_bone(J, A, E.len['thigh_' + sd], E.len['shin_' + sd], s.f + (s.r * (.2 if sd == 'R' else -.2)))
            E.aim('thigh_' + sd, K - J); E.aim('shin_' + sd, end - K); E.aim('foot_' + sd, s.f - UP * .34)
        f = Dc @ V((0, -1, 0)); r = Dc @ V((-1, 0, 0)); u = Dc @ UP
        C0 = E.head['chest']
        for sd in 'RL':
            w = P['punho'][sd]; W = C0 + r * w[0] + f * w[1] + u * w[2]
            Sh = E.joint('upper_' + sd); sg = 1 if sd == 'R' else -1
            El, end, _ = two_bone(Sh, W, E.len['upper_' + sd], E.len['fore_' + sd], r * sg * .9 - u * .55 - f * .1)
            E.aim('upper_' + sd, El - Sh); E.aim('fore_' + sd, end - El)
            ha = P.get('mao', {}).get(sd)
            E.aim('hand_' + sd, (r * ha[0] + f * ha[1] + u * ha[2]) if ha else (end - El))
        dn = Dc @ V((0, 0, -1))
        E.aim('mochila', dn - f * .17); E.aim('cantil', -UP + s.f * .03)
        E.aim('saia_F', -UP + s.f * .14); E.aim('saia_B', -UP - s.f * .16); E.aim('saia_R', -UP + s.r * .18); E.aim('saia_L', -UP - s.r * .18)


def _env(t, a, b, c, d):
    return smoo(a, b, t) * (1 - smoo(c, d, t))

def prog_g1(t, S):
    """Rises late, then both arms cross and uncross over his head: the sign for STOP, not a cheer. Flinches at the end."""
    crouch = 1 - smoo(5.95, 6.5, t); ant = _env(t, 5.7, 5.92, 5.95, 6.15)
    over = _env(t, 6.35, 6.5, 6.5, 6.85)
    fl = smoo(14.15, 14.42, t)
    w = (t - 6.4) * 2 * math.pi * 1.75
    e = smoo(6.3, 6.8, t) * (1 - fl)
    c = math.cos(w)
    hip = .905 - .34 * crouch - .06 * ant + .025 * over - .03 * abs(math.sin(w)) * e - .22 * fl
    lean = .55 * crouch + .1 * ant + (.17 + .05 * math.sin(w)) * e + .4 * fl
    base = {'R': (.2, .24, -.2), 'L': (-.24, .2, -.15)}        # hands on the gun while crouched
    up = {'R': (.06 + .44 * c, .27 + .07 * math.sin(w), .36 + .15 * abs(c)), 'L': (-.06 - .44 * c, .25 - .07 * math.sin(w), .34 + .15 * abs(c))}
    gun = {'R': (.1, .42, -.12), 'L': (-.22, .4, -.1)}
    k = smoo(6.05, 6.42, t)
    pu = {}
    for sd in 'RL':
        a = [base[sd][i] * (1 - k) + up[sd][i] * k for i in range(3)]
        pu[sd] = tuple(a[i] * (1 - fl) + gun[sd][i] * fl for i in range(3))
    return dict(hip=hip, lean=lean, yaw=.07 * math.sin(w * .5) * e, roll=.05 * math.sin(w) * e, hy=.3 * math.sin(w * 1.35) * e, hp=-.1 * e + .28 * crouch + .2 * fl,
                punho=pu, mao={'R': (.0 + .4 * c, .05, 1), 'L': (.0 - .4 * c, .05, 1)})

def prog_g2(t, S):
    """A beat later than G1: shoves his palm at the runner and shouts through a cupped hand, then points him back."""
    crouch = 1 - smoo(6.4, 6.92, t); ant = _env(t, 6.2, 6.4, 6.42, 6.6)
    w = (t - 6.8) * 2 * math.pi * 2.3
    e = smoo(6.7, 7.1, t); fl = smoo(14.3, 14.6, t); e = e * (1 - fl)
    troca = smoo(10.2, 10.7, t)
    th = math.sin(w)
    hip = .9 - .33 * crouch - .06 * ant - .024 * (th * .5 + .5) * e - .18 * fl
    lean = .5 * crouch + .08 * ant + (.2 + .07 * th) * e + .35 * fl
    pu = {}
    r_ = (.2, .34 + .26 * th, .26 + .05 * th); r2 = (.34 + .2 * th, .08, .52)
    l_ = (-.02, .2, .36); l2 = (-.3 - .22 * th, .26, .3)
    down = {'R': (.2, .22, -.18), 'L': (-.2, .22, -.18)}
    k = smoo(6.55, 6.98, t)
    for sd, a0, a1 in (('R', r_, r2), ('L', l_, l2)):
        v = [a0[i] * (1 - troca) + a1[i] * troca for i in range(3)]
        v = [down[sd][i] * (1 - k) + v[i] * k for i in range(3)]
        pu[sd] = tuple(v[i] * (1 - fl) + down[sd][i] * fl for i in range(3))
    return dict(hip=hip, lean=lean, yaw=.14 * th * e - .1, roll=.03 * th * e, hy=.12 * math.sin(w * .7) * e + .12, hp=-.14 * e + .28 * crouch, punho=pu,
                mao={'R': (.05, .22 + .5 * th, 1), 'L': (.02, .6, .8)})
