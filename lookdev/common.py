"""Shared helpers: procedural noise (numpy, seeded), mesh creation, procedural materials, armature utilities."""
import math
import numpy as np
import bpy
from mathutils import Vector, Matrix, Quaternion, Euler


# ---------- deterministic noise ----------
_TABLES = {}
def _table(seed):
    if seed not in _TABLES:
        _TABLES[seed] = np.random.default_rng(seed).random((256, 256))
    return _TABLES[seed]

def vnoise(x, y, seed=0):
    x, y = np.asarray(x, float), np.asarray(y, float)
    T = _table(seed)
    xi, yi = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - xi, y - yi
    fx, fy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = T[xi % 256, yi % 256]; b = T[(xi + 1) % 256, yi % 256]
    c = T[xi % 256, (yi + 1) % 256]; d = T[(xi + 1) % 256, (yi + 1) % 256]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

def fbm(x, y, octaves=4, seed=0, lac=2.03, gain=.5):
    out, amp, tot = 0.0, 1.0, 0.0
    x, y = np.asarray(x, float), np.asarray(y, float)
    for i in range(octaves):
        out = out + amp * vnoise(x, y, seed + i); tot += amp
        x, y, amp = x * lac + 17.3, y * lac + 9.1, amp * gain
    return out / tot

def smooth(a, b, x):
    t = np.clip((np.asarray(x, float) - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------- meshes ----------
def add_mesh(name, V, F, mat=None, shade=True, attrs=None, parent=None):
    me = bpy.data.meshes.new(name)
    me.from_pydata(np.asarray(V, float).tolist(), [], F)
    me.update()
    if shade:
        me.shade_smooth()
    if attrs:
        for k, a in attrs.items():
            a = np.asarray(a, float)
            if a.ndim == 1:
                a = np.stack([a, a, a], 1)
            if a.shape[1] == 3:
                a = np.concatenate([a, np.ones((len(a), 1))], 1)
            ca = me.color_attributes.new(k, 'FLOAT_COLOR', 'POINT')
            ca.data.foreach_set('color', a.ravel())
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    if parent:
        ob.parent = parent
    return ob

def grid_faces(nr, nc, wrap=True):
    """Quads for nr rings of nc points each (optionally wrapped around)."""
    F = []
    for r in range(nr - 1):
        for c in range(nc if wrap else nc - 1):
            d = (c + 1) % nc
            F.append((r * nc + c, r * nc + d, (r + 1) * nc + d, (r + 1) * nc + c))
    return F

def loft(path, rx, ry=None, n=24, power=2.0, cap=True, disp=None):
    """Rings along a polyline. rx, ry per point. Rings are perpendicular to the path, with a stable frame.
    disp(ring_k, angle, P) -> radial offset. Returns V, F."""
    P = np.asarray(path, float); nr = len(P)
    rx = np.full(nr, float(rx)) if np.isscalar(rx) else np.asarray(rx, float)
    ry = rx if ry is None else (np.full(nr, float(ry)) if np.isscalar(ry) else np.asarray(ry, float))
    T = np.gradient(P, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True) + 1e-9
    ref = np.array([0, 1, 0.0]) if abs(T[0][1]) < .9 else np.array([1, 0, 0.0])
    V = []
    e = 2.0 / power
    for i in range(nr):
        a = np.cross(ref, T[i]); a /= np.linalg.norm(a) + 1e-9
        b = np.cross(T[i], a)
        for j in range(n):
            th = 2 * math.pi * j / n
            c, s = math.cos(th), math.sin(th)
            ca, sa = math.copysign(abs(c) ** e, c), math.copysign(abs(s) ** e, s)
            o = rx[i] * ca * a + ry[i] * sa * b
            p = P[i] + o
            if disp is not None:
                L = np.linalg.norm(o) + 1e-9
                p = p + o / L * disp(i / max(1, nr - 1), th, p)
            V.append(p)
    F = grid_faces(nr, n)
    if cap:
        i0 = len(V); V.append(P[0]); i1 = len(V); V.append(P[-1])
        for j in range(n):
            d = (j + 1) % n
            F.append((i0, d, j))
            F.append((i1, (nr - 1) * n + j, (nr - 1) * n + d))
    return np.array(V), F

def uv_sphere(center, r, nu=32, nv=20, axis_scale=(1, 1, 1)):
    V = []
    for i in range(nv + 1):
        ph = math.pi * i / nv
        for j in range(nu):
            th = 2 * math.pi * j / nu
            V.append((math.sin(ph) * math.cos(th) * r * axis_scale[0] + center[0], math.sin(ph) * math.sin(th) * r * axis_scale[1] + center[1], math.cos(ph) * r * axis_scale[2] + center[2]))
    return np.array(V), grid_faces(nv + 1, nu)

def rbox(center, size, r=.25, n=7, noise=0.0, seed=0):
    """A rounded (pillow-like) box from a subdivided cube projected on a superellipsoid. r near 1 = pillow."""
    t = np.linspace(-1, 1, n); V = []; idx = {}; F = []
    def vid(p):
        k = tuple(np.round(p, 5))
        if k not in idx:
            idx[k] = len(V); V.append(p)
        return idx[k]
    for ax in range(3):
        for sgn in (-1, 1):
            for i in range(n - 1):
                for j in range(n - 1):
                    q = []
                    for a, b in ((i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)):
                        p = [0, 0, 0]; p[ax] = sgn; p[(ax + 1) % 3] = t[a]; p[(ax + 2) % 3] = t[b]
                        q.append(vid(np.array(p, float)))
                    F.append(tuple(q) if sgn > 0 else tuple(q[::-1]))
    V = np.array(V)
    e = 2.0 + 6.0 * (1 - r)
    L = (np.abs(V) ** e).sum(1) ** (1 / e)
    S = V / L[:, None]
    if noise:
        S = S * (1 + noise * (fbm(S[:, 0] * 2.1 + S[:, 2] * 1.3 + seed, S[:, 1] * 2.1 - S[:, 2] * 1.7, 3, seed) - .5))[:, None]
    return S * np.asarray(size) / 2 + np.asarray(center), F

def merge(parts):
    """Merge [(V, F), ...] into one (V, F)."""
    Vs, Fs, k = [], [], 0
    for V, F in parts:
        Vs.append(np.asarray(V)); Fs += [tuple(i + k for i in f) for f in F]; k += len(V)
    return np.concatenate(Vs), Fs

def xf(V, M):
    V = np.asarray(V, float); M = np.asarray(M, float)
    return V @ M[:3, :3].T + M[:3, 3]

def rot_trs(loc=(0, 0, 0), rot=(0, 0, 0), scale=1.0):
    s = (scale, scale, scale) if np.isscalar(scale) else scale
    return np.array(Matrix.LocRotScale(Vector(loc), Euler(rot), Vector(s)))


# ---------- procedural material builder ----------
class Mat:
    def __init__(self, name):
        self.m = bpy.data.materials.new(name)
        self.nt = self.m.node_tree
        self.nt.nodes.clear()
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')

    def _set(self, inp, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.nt.links.new(v, inp)
        elif isinstance(v, (tuple, list)):
            inp.default_value = tuple(v) + ((1.0,) if len(v) == 3 and len(inp.default_value) == 4 else ())
        else:
            inp.default_value = v

    def coord(self, kind='Object'):
        return self.nt.nodes.new('ShaderNodeTexCoord').outputs[kind]

    def attr(self, name, channel=None):
        n = self.nt.nodes.new('ShaderNodeAttribute'); n.attribute_name = name
        if channel is None:
            return n.outputs['Color']
        s = self.nt.nodes.new('ShaderNodeSeparateColor'); self.nt.links.new(n.outputs['Color'], s.inputs[0])
        return s.outputs[channel]

    def mapped(self, vec, scale=(1, 1, 1), loc=(0, 0, 0)):
        n = self.nt.nodes.new('ShaderNodeMapping'); self.nt.links.new(vec, n.inputs['Vector'])
        n.inputs['Scale'].default_value = scale; n.inputs['Location'].default_value = loc
        return n.outputs[0]

    def noise(self, vec, scale=5, detail=4, rough=.5, dist=0):
        n = self.nt.nodes.new('ShaderNodeTexNoise'); self.nt.links.new(vec, n.inputs['Vector'])
        n.inputs['Scale'].default_value = scale; n.inputs['Detail'].default_value = detail
        n.inputs['Roughness'].default_value = rough; n.inputs['Distortion'].default_value = dist
        return n.outputs[0]

    def voronoi(self, vec, scale=5):
        n = self.nt.nodes.new('ShaderNodeTexVoronoi'); self.nt.links.new(vec, n.inputs['Vector'])
        n.inputs['Scale'].default_value = scale
        return n.outputs[0]

    def ramp(self, f, stops, interp='LINEAR'):
        n = self.nt.nodes.new('ShaderNodeValToRGB'); cr = n.color_ramp; cr.interpolation = interp
        while len(cr.elements) < len(stops):
            cr.elements.new(.5)
        for e, (p, c) in zip(cr.elements, stops):
            e.position = p
            e.color = tuple(c) + (1,) if len(c) == 3 else c
        self.nt.links.new(f, n.inputs[0])
        return n.outputs[0]

    def mix(self, f, a, b, blend='MIX'):
        n = self.nt.nodes.new('ShaderNodeMixRGB'); n.blend_type = blend
        self._set(n.inputs[0], f); self._set(n.inputs[1], a); self._set(n.inputs[2], b)
        return n.outputs[0]

    def math(self, op, a, b=0.0, clamp=False):
        n = self.nt.nodes.new('ShaderNodeMath'); n.operation = op; n.use_clamp = clamp
        self._set(n.inputs[0], a); self._set(n.inputs[1], b)
        return n.outputs[0]

    def bump(self, h, strength=.5, dist=.02, normal=None):
        n = self.nt.nodes.new('ShaderNodeBump')
        n.inputs['Strength'].default_value = strength; n.inputs['Distance'].default_value = dist
        self.nt.links.new(h, n.inputs['Height'])
        if normal is not None:
            self.nt.links.new(normal, n.inputs['Normal'])
        return n.outputs[0]

    def pbr(self, base, rough=.8, metal=0.0, normal=None, spec=None, sss=None, sss_radius=None, emit=None, emit_strength=1.0):
        p = self.nt.nodes.new('ShaderNodeBsdfPrincipled')
        self._set(p.inputs['Base Color'], base); self._set(p.inputs['Roughness'], rough); self._set(p.inputs['Metallic'], metal)
        if normal is not None:
            self.nt.links.new(normal, p.inputs['Normal'])
        if spec is not None:
            self._set(p.inputs['Specular IOR Level'], spec)
        if sss is not None:
            self._set(p.inputs['Subsurface Weight'], sss)
            if sss_radius:
                p.inputs['Subsurface Radius'].default_value = sss_radius
            p.inputs['Subsurface Scale'].default_value = .02
        if emit is not None:
            self._set(p.inputs['Emission Color'], emit); p.inputs['Emission Strength'].default_value = emit_strength
        self.nt.links.new(p.outputs[0], self.out.inputs['Surface'])
        return p


def srgb(h):
    """'#RRGGBB' -> linear RGB tuple."""
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4 for x in c)


# ---------- armature ----------
def build_armature(name, bones):
    """bones: {name: (head, tail, parent or None)}"""
    arm = bpy.data.armatures.new(name)
    ob = bpy.data.objects.new(name, arm)
    bpy.context.scene.collection.objects.link(ob)
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.mode_set(mode='EDIT')
    for k, (h, t, p) in bones.items():
        b = arm.edit_bones.new(k); b.head = h; b.tail = t
    for k, (h, t, p) in bones.items():
        if p:
            arm.edit_bones[k].parent = arm.edit_bones[p]
            arm.edit_bones[k].use_connect = False
    bpy.ops.object.mode_set(mode='OBJECT')
    return ob

def _segdist(P, a, b):
    a, b = np.asarray(a, float), np.asarray(b, float)
    ab = b - a; t = np.clip(((P - a) @ ab) / (ab @ ab + 1e-9), 0, 1)
    return np.linalg.norm(P - (a + t[:, None] * ab), axis=1)

def skin(ob, arm_ob, bones, allowed=None, power=5.0):
    """Distance-based weights (deterministic and fast) + Armature modifier."""
    me = ob.data
    P = np.array([v.co for v in me.vertices])
    names = [k for k in bones if allowed is None or k in allowed]
    D = np.stack([_segdist(P, bones[k][0], bones[k][1]) for k in names], 1) + 1e-4
    W = D ** (-power)
    W /= W.sum(1, keepdims=True)
    for j, k in enumerate(names):
        vg = ob.vertex_groups.new(name=k)
        for i in np.nonzero(W[:, j] > .01)[0]:
            vg.add([int(i)], float(W[i, j]), 'REPLACE')
    mod = ob.modifiers.new('rig', 'ARMATURE'); mod.object = arm_ob
    ob.parent = arm_ob

def _apply_rotation(arm_ob, name, q):
    pb = arm_ob.pose.bones[name]
    pb.rotation_mode = 'QUATERNION'
    M = Matrix.Translation(pb.matrix.translation) @ q.to_matrix().to_4x4() @ pb.matrix.to_3x3().to_4x4()
    pb.matrix = M
    bpy.context.view_layer.update()

def aim_bone(arm_ob, name, direction, roll=0.0):
    """Rotate a pose bone so it points along a world direction (keeps its head); optional roll about itself."""
    bpy.context.view_layer.update()
    pb = arm_ob.pose.bones[name]
    cur = (pb.matrix.to_3x3() @ Vector((0, 1, 0))).normalized()
    d = Vector(direction).normalized()
    q = cur.rotation_difference(d)
    if roll:
        q = Quaternion(d, roll) @ q
    _apply_rotation(arm_ob, name, q)

def rotate_bone(arm_ob, name, axis, angle):
    bpy.context.view_layer.update()
    _apply_rotation(arm_ob, name, Quaternion(Vector(axis).normalized(), angle))
