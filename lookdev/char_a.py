"""Style A: a rigged 2.5D cut-out (graphic-novel gouache) standing in the real 3D set.
Every part is a vector shape (Bezier fill + brush-like ink line) on its own thin layer, parented to a bone of a real armature,
so the body poses by bone rotation. Shapes are drawn once, in the rest pose, in world metres (x, z)."""
import math
import numpy as np
import bpy
from mathutils import Matrix, Vector
from common import *

INK = '#15120f'
UNI, UNI_D, UNI_L = '#5f6358', '#3c4038', '#7d8071'
SKIN, SKIN_D, SKIN_L = '#c8a48c', '#8a6352', '#d4b49c'
HELM, HELM_D, HELM_L = '#535948', '#2f3329', '#868a78'
LEA, LEA_L = '#3d2a1d', '#6b4c33'
_mats = {}


def paint_mat(col, grain=.16, stipple=False):
    k = (col, grain, stipple)
    if k in _mats:
        return _mats[k]
    M = Mat('gouache_' + col.lstrip('#') + ('_st' if stipple else '')); co = M.coord('Object')
    c = srgb(col)
    bigs = M.noise(co, 9, 5, .6); fine = M.noise(M.mapped(co, (1, 2.6, 1)), 70, 4, .55)   # brush drag
    t = M.math('ADD', M.math('MULTIPLY', bigs, .6), M.math('MULTIPLY', fine, .4))
    lo = tuple(x * (1 - grain) for x in c); hi = tuple(min(1, x * (1 + grain * 1.1)) for x in c)
    base = M.ramp(t, [(.34, lo), (.66, hi)])
    p = M.pbr(base, rough=.9, spec=.1, emit=base, emit_strength=.42)
    if stipple:   # stubble: broken-up dark paint
        tr = M.ramp(M.noise(co, 420, 2, .5), [(.47, (0, 0, 0)), (.56, (1, 1, 1))])
        tb = M.nt.nodes.new('ShaderNodeBsdfTransparent'); ms = M.nt.nodes.new('ShaderNodeMixShader')
        M.nt.links.new(tr, ms.inputs[0]); M.nt.links.new(tb.outputs[0], ms.inputs[1]); M.nt.links.new(p.outputs[0], ms.inputs[2])
        M.nt.links.new(ms.outputs[0], M.out.inputs['Surface'])
    _mats[k] = M.m
    return M.m


class Rig:
    def __init__(self, arm):
        self.arm = arm; self.y = 0.0

    def attach(self, ob, bone):
        ob.parent = self.arm; ob.parent_type = 'BONE'; ob.parent_bone = bone
        bpy.context.view_layer.update()
        pb = self.arm.pose.bones[bone]
        ob.matrix_parent_inverse = (self.arm.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.bone.length, 0))).inverted()

    def _spline(self, c, pts, closed, sharp, radii=None):
        sp = c.splines.new('BEZIER'); sp.bezier_points.add(len(pts) - 1); sp.use_cyclic_u = closed; sp.resolution_u = 14
        for i, (bp, p) in enumerate(zip(sp.bezier_points, pts)):
            bp.co = (p[0], p[1], 0)
            t = 'VECTOR' if (sharp is True or i in sharp) else 'AUTO'
            bp.handle_left_type = t; bp.handle_right_type = t
            if radii is not None:
                bp.radius = radii[i]

    def shape(self, pts, col, bone, y=None, ink=.0032, sharp=(), name='s', stipple=False, grain=.16):
        """Filled shape + brushy contour. y: layer (smaller = nearer the camera)."""
        if y is None:
            self.y -= .0022; y = self.y
        c = bpy.data.curves.new(name, 'CURVE'); c.dimensions = '2D'; c.fill_mode = 'BOTH'
        self._spline(c, pts, True, sharp)
        c.materials.append(paint_mat(col, grain, stipple))
        ob = bpy.data.objects.new(name, c); bpy.context.scene.collection.objects.link(ob)
        ob.rotation_euler = (math.pi / 2, 0, 0); ob.location = (0, y, 0)
        self.attach(ob, bone)
        if ink:
            self.line(pts, bone, y - .0006, ink, closed=True, sharp=sharp)
        return ob

    def line(self, pts, bone, y=None, w=.0028, closed=False, sharp=(), taper=True, col=INK):
        """An ink stroke; the width swells and thins like a brush."""
        if y is None:
            self.y -= .0012; y = self.y
        c = bpy.data.curves.new('ink', 'CURVE'); c.dimensions = '3D'; c.bevel_depth = w; c.bevel_resolution = 1; c.fill_mode = 'FULL'
        n = len(pts)
        if closed:
            rad = [.72 + .5 * float(vnoise(np.array(i * 1.7 + pts[0][0] * 40), np.array(pts[0][1] * 40))) for i in range(n)]
        else:
            rad = [(math.sin(math.pi * i / max(1, n - 1)) ** .7 if taper else 1) * (.8 + .4 * float(vnoise(np.array(i * 1.3), np.array(3.3)))) + .04 for i in range(n)]
        self._spline(c, pts, closed, sharp, rad)
        M = paint_mat(col, .05)
        c.materials.append(M)
        ob = bpy.data.objects.new('ink', c); bpy.context.scene.collection.objects.link(ob)
        ob.rotation_euler = (math.pi / 2, 0, 0); ob.location = (0, y, 0)
        self.attach(ob, bone)
        return ob


def circle(cx, cz, rx, rz=None, n=10):
    rz = rx if rz is None else rz
    return [(cx + rx * math.cos(2 * math.pi * i / n), cz + rz * math.sin(2 * math.pi * i / n)) for i in range(n)]

def off(pts, dx, dz):
    return [(x + dx, z + dz) for x, z in pts]

def mirror(pts):
    return [(-x, z) for x, z in pts][::-1]


def draw_torso(R, y0):
    R.y = y0
    body = [(-.06, 1.475), (-.195, 1.415), (-.232, 1.33), (-.215, 1.15), (-.178, 1.03), (-.2, .84), (.2, .84), (.178, 1.03), (.215, 1.15), (.232, 1.33), (.195, 1.415), (.06, 1.475)]
    R.shape(body, UNI, 'chest', name='tunic', sharp=(0, 5, 6, 11), ink=.0042)
    R.shape([(.03, 1.47), (.195, 1.415), (.232, 1.33), (.215, 1.15), (.178, 1.03), (.2, .84), (.075, .84), (.1, 1.0), (.11, 1.16), (.09, 1.33)], UNI_D, 'chest', ink=0, name='tunic_sombra', sharp=(5, 6))
    R.shape([(-.17, 1.4), (-.205, 1.33), (-.195, 1.2), (-.165, 1.22), (-.15, 1.33), (-.12, 1.42)], UNI_L, 'chest', ink=0, name='tunic_luz')
    # folds
    for p in ([(-.15, 1.04), (-.1, 1.07), (-.05, 1.06)], [(.15, 1.04), (.11, 1.075), (.07, 1.07)], [(-.16, .96), (-.11, .9), (-.1, .84)], [(.15, .95), (.12, .9), (.13, .84)]):
        R.line(p, 'chest', w=.0026)
    R.shape([(-.016, 1.45), (.016, 1.45), (.019, .85), (-.019, .85)], UNI_D, 'chest', sharp=True, ink=.0022, name='fly')
    R.line([(-.016, 1.45), (-.019, .85)], 'chest', w=.0016, taper=False, col=UNI_L)
    # slash pockets
    for s in (-1, 1):
        R.shape([(s * .05, .94), (s * .17, .915), (s * .172, .875), (s * .055, .9)], UNI if s < 0 else UNI_D, 'chest', sharp=True, ink=.0026, name='bolso')
    # neck, then the collar around it
    R.shape([(-.075, 1.6), (.075, 1.6), (.08, 1.45), (-.08, 1.45)], SKIN_D, 'neck', sharp=True, ink=.003, name='pescoco')
    # collar
    R.shape([(-.082, 1.53), (.082, 1.53), (.09, 1.46), (0, 1.43), (-.09, 1.46)], UNI, 'chest', sharp=(0, 1), ink=.0036, name='gola')
    R.shape([(.02, 1.53), (.082, 1.53), (.09, 1.46), (.02, 1.438)], UNI_D, 'chest', sharp=(0, 1), ink=0, name='gola_s')
    for s in (-1, 1):
        R.shape([(s * .03, 1.505), (s * .068, 1.51), (s * .072, 1.468), (s * .036, 1.452)], '#7a3a32', 'chest', sharp=True, ink=.0018, name='patch')
    # belt, buckle, pouches
    R.shape([(-.186, 1.03), (.186, 1.03), (.182, .975), (-.182, .975)], LEA, 'chest', sharp=True, ink=.0034, name='cinto')
    R.line([(-.18, 1.022), (.18, 1.022)], 'chest', w=.0014, taper=False, col=LEA_L)
    R.shape([(-.034, 1.038), (.034, 1.038), (.034, .968), (-.034, .968)], '#a48a4a', 'chest', sharp=True, ink=.003, name='fivela')
    R.shape(circle(0, 1.003, .018), '#6f5c2e', 'chest', ink=.0018, name='fivela_o')
    for s in (-1, 1):
        for i in range(3):
            x = s * (.06 + i * .05)
            R.shape([(x - .022, 1.02), (x + .022, 1.02), (x + .023, .935), (x - .023, .935)], LEA, 'chest', sharp=True, ink=.0028, name='cartucheira')
            R.shape([(x - .023, 1.024), (x + .023, 1.024), (x + .024, .986), (x, .976), (x - .024, .986)], LEA_L if s < 0 else LEA, 'chest', sharp=(0, 1), ink=.0024, name='aba')


def open_hand(w, sgn):
    """An open hand hanging from wrist w; sgn = thumb side. Sharp only at finger clefts."""
    W, Z = w; s = sgn
    return [(W - s * .036, Z), (W - s * .05, Z - .05), (W - s * .056, Z - .095),
            (W - s * .066, Z - .155), (W - s * .05, Z - .16), (W - s * .036, Z - .105),
            (W - s * .029, Z - .178), (W - s * .012, Z - .18), (W - s * .012, Z - .108),
            (W + s * .004, Z - .185), (W + s * .022, Z - .182), (W + s * .016, Z - .105),
            (W + s * .038, Z - .162), (W + s * .054, Z - .152), (W + s * .04, Z - .08),
            (W + s * .098, Z - .1), (W + s * .106, Z - .08), (W + s * .05, Z - .025), (W + s * .036, Z)]


def draw_arm(R, side, y0, hand='open'):
    sgn = -1 if side == 'R' else 1
    R.y = y0
    S = (sgn * .205, 1.39); E = (sgn * .26, 1.105); W = (sgn * .295, .86)
    def limb(a, b, ra, rb):
        dx, dz = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dz); nx, nz = -dz / L, dx / L
        m = ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2); rm = (ra + rb) / 2 * 1.03
        return [(a[0] + nx * ra, a[1] + nz * ra), (m[0] + nx * rm, m[1] + nz * rm), (b[0] + nx * rb, b[1] + nz * rb), (b[0] - nx * rb, b[1] - nz * rb), (m[0] - nx * rm, m[1] - nz * rm), (a[0] - nx * ra, a[1] - nz * ra)]
    # hand under the cuff
    if hand == 'open':
        hp = open_hand((W[0], W[1] + .012), sgn)
        R.shape(hp, SKIN, 'hand_' + side, sharp=(5, 8, 11, 14), ink=.0032, name='mao')
        for dx in (-.012, .004):
            R.line([(W[0] + dx * sgn, W[1] - .03), (W[0] + dx * sgn * 1.3, W[1] - .09)], 'hand_' + side, w=.0014)
        R.line([(W[0] + sgn * .03, W[1] - .03), (W[0] - sgn * .005, W[1] - .055), (W[0] - sgn * .035, W[1] - .08)], 'hand_' + side, w=.0016)
    else:
        hp = [(W[0] - .04, W[1] + .01), (W[0] - .05, W[1] - .06), (W[0] - .04, W[1] - .125), (W[0] + .03, W[1] - .135), (W[0] + .058, W[1] - .08), (W[0] + .045, W[1] + .01)]
        R.shape(hp, SKIN_D, 'hand_' + side, ink=.0032, name='mao_f')
        for dx in (-.018, .002, .022):
            R.line([(W[0] + dx, W[1] - .06), (W[0] + dx * 1.2, W[1] - .13)], 'hand_' + side, w=.0016)
    # forearm, cuff, upper arm (drawn near to far so the shoulder overlaps cleanly)
    fa = limb(E, W, .056, .046)
    R.shape(fa, UNI if side == 'R' else UNI_D, 'fore_' + side, sharp=(0, 2, 3, 5), ink=.0036, name='antebraco')
    c0 = (W[0] + (E[0] - W[0]) * .17, W[1] + (E[1] - W[1]) * .17); R.shape(limb(c0, W, .0485, .049), UNI_D, 'fore_' + side, sharp=True, ink=.003, name='punho')
    R.line([(E[0] - .03 * sgn, E[1] - .05), (E[0] + .012 * sgn, E[1] - .085), (E[0] + .035 * sgn, E[1] - .07)], 'fore_' + side, w=.0024)
    ua = limb(S, E, .062, .056)
    R.shape(ua, UNI if side == 'R' else UNI_D, 'upper_' + side, sharp=(0, 2, 3, 5), ink=.0038, name='braco')
    R.shape(circle(E[0], E[1], .056, .056), UNI if side == 'R' else UNI_D, 'upper_' + side, ink=0, name='cotovelo')
    R.line([(E[0] - .04 * sgn, E[1] + .07), (E[0], E[1] + .03), (E[0] + .04 * sgn, E[1] + .045)], 'upper_' + side, w=.0024)


def draw_head(R, y0):
    """Three-quarter face looking slightly to screen-left, in metres around the head centre C."""
    R.y = y0
    C = np.array([0.0, 1.625]); b = 'head'
    p = lambda L: [tuple(np.array(q) + C) for q in L]
    # skull + heavy jaw dropped by the shout
    R.shape(p([(-.158, .1), (-.163, .0), (-.156, -.07), (-.128, -.15), (-.085, -.215), (-.03, -.247), (.03, -.247), (.085, -.218), (.128, -.152), (.156, -.07), (.163, .0), (.158, .1)]), SKIN, b, ink=.0042, name='cabeca')
    # the shadow plane: everything right of the nose line + under the cheekbone
    R.shape(p([(.03, .1), (.042, .02), (.05, -.05), (.078, -.075), (.052, -.13), (.066, -.205), (.03, -.247), (.085, -.218), (.128, -.152), (.156, -.07), (.163, .0), (.158, .1)]), SKIN_D, b, ink=0, name='rosto_sombra', sharp=(3, 4))
    R.shape(p([(-.155, -.05), (-.128, -.04), (-.1, -.09), (-.098, -.17), (-.085, -.215), (-.128, -.15)]), SKIN_D, b, ink=0, name='rosto_sombra2')
    # light on the cheekbone and the forehead ridge
    R.shape(p([(-.142, .0), (-.1, -.012), (-.066, -.03), (-.086, -.062), (-.13, -.05)]), SKIN_L, b, ink=0, name='maca_luz')
    # stubble
    R.shape(p([(-.15, -.06), (-.1, -.075), (-.075, -.06), (-.012, -.05), (.05, -.06), (.08, -.07), (.148, -.06), (.122, -.15), (.083, -.214), (.03, -.244), (-.03, -.244), (-.083, -.212), (-.122, -.15)]), '#3a342f', b, ink=0, name='barba', stipple=True)
    # helmet shadow falling across the upper face
    R.shape(p([(-.158, .12), (-.158, .05), (-.11, .068), (-.03, .083), (.05, .075), (.1, .056), (.158, .03), (.158, .12)]), '#6e4d41', b, ink=0, name='sombra_capacete')
    # eyes: wide, whites showing above the iris
    for ex, gz, sh in ((-.072, -.006, 1), (.066, -.008, .82)):
        white = [(ex - .05, .012), (ex - .03, .05), (ex + .004, .06), (ex + .034, .042), (ex + .046, .012), (ex + .02, -.008), (ex - .022, -.01)]
        R.shape(p([(x + 0, z) for x, z in [(ex - .058, .018), (ex - .03, .068), (ex + .012, .074), (ex + .05, .046), (ex + .054, .006), (ex + .018, -.026), (ex - .03, -.024)]]), '#7c5a4d' if sh == 1 else '#5e4238', b, ink=0, name='orbita')
        R.shape(p(white), '#e6dfd0' if sh == 1 else '#b9b0a0', b, sharp=(0, 4), ink=.0026, name='olho')
        R.shape(p(circle(ex + gz, .021, .0235, .025)), '#4a3f2c', b, ink=.0018, name='iris')
        R.shape(p(circle(ex + gz, .021, .0125)), '#0e0c0a', b, ink=0, name='pupila')
        R.shape(p(circle(ex + gz - .008, .031, .0048)), '#f6f2e8', b, ink=0, name='brilho', grain=0)
        R.line(p([(ex - .054, .012), (ex - .03, .054), (ex + .004, .065), (ex + .036, .046), (ex + .05, .012)]), b, w=.0046)      # heavy upper lid
        R.line(p([(ex - .04, -.018), (ex - .005, -.03), (ex + .03, -.02)]), b, w=.0018)                                           # bag
    # brows: inner ends shoved up with fear
    R.shape(p([(-.142, .05), (-.1, .086), (-.05, .108), (-.016, .112), (-.018, .092), (-.056, .082), (-.1, .066)]), '#1f1a15', b, ink=0, name='sobrancelha', sharp=(0, 3, 4))
    R.shape(p([(.13, .046), (.098, .08), (.05, .106), (.018, .112), (.02, .092), (.052, .08), (.094, .06)]), '#1f1a15', b, ink=0, name='sobrancelha', sharp=(0, 3, 4))
    R.line(p([(-.01, .103), (-.004, .08), (-.01, .062)]), b, w=.002)                                                                # frown crease
    # nose
    R.shape(p([(-.006, .05), (.012, -.012), (.034, -.04), (.024, -.066), (-.006, -.072), (.012, -.03)]), SKIN_D, b, ink=0, name='nariz_s')
    R.line(p([(-.022, .05), (-.03, -.004), (-.05, -.04), (-.046, -.062), (-.022, -.056)]), b, w=.0028)
    R.line(p([(-.022, -.056), (-.006, -.072), (.016, -.06), (.03, -.065), (.036, -.044), (.026, -.024)]), b, w=.0034)
    R.shape(p(circle(-.024, -.06, .0085, .0052)), INK, b, ink=0, name='narina'); R.shape(p(circle(.012, -.058, .008, .005)), INK, b, ink=0, name='narina')
    R.shape(p([(-.026, .025), (-.019, .025), (-.03, -.03), (-.038, -.03)]), SKIN_L, b, ink=0, name='nariz_luz')
    # the mouth, screaming
    lips = [(-.072, -.102), (-.04, -.086), (-.006, -.09), (.03, -.084), (.066, -.1), (.07, -.145), (.046, -.195), (-.006, -.218), (-.054, -.196), (-.078, -.145)]
    R.shape(p(lips), '#7f4a42', b, ink=.0034, name='labios', sharp=(0, 4))
    mouth = [(-.06, -.104), (-.032, -.097), (-.006, -.1), (.024, -.096), (.054, -.102), (.056, -.142), (.038, -.183), (-.006, -.203), (-.046, -.184), (-.064, -.142)]
    R.shape(p(mouth), '#1b0807', b, ink=.0028, name='boca', sharp=(0, 4))
    R.shape(p([(-.048, -.103), (-.032, -.1), (-.006, -.103), (.024, -.099), (.042, -.102), (.038, -.125), (.012, -.13), (-.018, -.13), (-.043, -.125)]), '#cfc6a6', b, ink=.0018, name='dentes_cima', sharp=(0, 4))
    for x in (-.03, -.014, .002, .018):
        R.line(p([(x, -.102), (x, -.128)]), b, w=.0009, taper=False, col='#5a4f3a')
    R.shape(p([(-.038, -.178), (.026, -.178), (.018, -.2), (-.006, -.205), (-.03, -.2)]), '#a89e80', b, ink=.0014, name='dentes_baixo', sharp=(0, 1))
    R.shape(p([(-.04, -.176), (-.02, -.15), (.008, -.146), (.03, -.158), (.034, -.178), (-.006, -.186)]), '#6f2a2c', b, ink=.0016, name='lingua')
    R.line(p([(-.006, -.156), (-.006, -.178)]), b, w=.0012, col='#3f1416')
    # creases of the scream
    R.line(p([(-.052, -.052), (-.088, -.094), (-.104, -.15)]), b, w=.0034)
    R.line(p([(.044, -.05), (.082, -.09), (.098, -.15)]), b, w=.0034)
    R.line(p([(-.12, .01), (-.135, -.012)]), b, w=.0016); R.line(p([(.114, .01), (.13, -.012)]), b, w=.0016)
    R.line(p([(-.036, -.228), (-.006, -.235), (.024, -.228)]), b, w=.0022)
    # Stahlhelm: dome, low visor, sharp notches, skirts that flare over the ears
    outline = [(-.214, -.075), (-.186, .03), (-.176, .11), (-.142, .2), (-.076, .258), (0, .272), (.076, .258), (.142, .2), (.176, .11), (.186, .03), (.214, -.075), (.164, -.085), (.142, -.02), (.138, .068), (.122, .098), (0, .106), (-.122, .098), (-.138, .068), (-.142, -.02), (-.164, -.085)]
    R.shape(p(outline), HELM, b, sharp=(0, 10, 11, 13, 17, 19), ink=.0048, name='capacete')
    R.shape(p([(.042, .105), (.122, .098), (.138, .068), (.142, -.02), (.164, -.085), (.214, -.075), (.186, .03), (.176, .11), (.142, .2), (.076, .258), (.03, .268), (.07, .2), (.066, .14)]), HELM_D, b, sharp=(4, 5), ink=0, name='capacete_sombra')
    R.shape(p([(-.15, .13), (-.118, .19), (-.066, .232), (-.024, .24), (-.052, .2), (-.092, .158), (-.116, .118)]), HELM_L, b, ink=0, name='capacete_luz')
    # the step line where the dome meets the visor and skirt
    R.line(p([(-.178, .05), (-.15, .12), (-.1, .138), (0, .146), (.1, .138), (.15, .12), (.178, .05)]), b, w=.0026, taper=False)
    R.shape(p([(-.13, .096), (0, .104), (.13, .096), (.122, .124), (0, .132), (-.122, .124)]), HELM_L, b, sharp=(0, 2), ink=0, name='viseira_luz', grain=.1)
    for s in (-1, 1):
        R.shape(p(circle(s * .168, .045, .0125)), HELM_L if s < 0 else HELM, b, ink=.0026, name='rebite')
    for q in ([(-.09, .225), (-.078, .205)], [(.03, .19), (.05, .178)], [(-.03, .17), (-.012, .18)]):
        R.line(p(q), b, w=.0012, col='#20241c')


def build(pcfg):
    px, py = pcfg['pos']
    B = {
        'chest': ((0, 0, 1.0), (0, 0, 1.44), None),
        'neck': ((0, 0, 1.44), (0, 0, 1.5), 'chest'), 'head': ((0, 0, 1.5), (0, 0, 1.72), 'neck'),
        'upper_R': ((-.205, 0, 1.39), (-.26, 0, 1.105), 'chest'), 'fore_R': ((-.26, 0, 1.105), (-.295, 0, .86), 'upper_R'), 'hand_R': ((-.295, 0, .86), (-.3, 0, .71), 'fore_R'),
        'upper_L': ((.205, 0, 1.39), (.26, 0, 1.105), 'chest'), 'fore_L': ((.26, 0, 1.105), (.295, 0, .86), 'upper_L'), 'hand_L': ((.295, 0, .86), (.3, 0, .71), 'fore_L'),
    }
    arm = build_armature('alemao_cutout_rig', B)
    bpy.context.view_layer.update()
    # layers along Y: far arm behind the torso, then torso, raised arm, head on top
    draw_arm(Rig(arm), 'L', .03, hand='fist')
    draw_torso(Rig(arm), .012)
    draw_arm(Rig(arm), 'R', .06, hand='open')
    draw_head(Rig(arm), -.11)

    # pose by bones only: same gesture as the 3D test
    rotate_bone(arm, 'chest', (0, 1, 0), -.05)
    rotate_bone(arm, 'head', (0, 1, 0), .1)
    aim_bone(arm, 'upper_R', (-.92, 0, .34))
    aim_bone(arm, 'fore_R', (-.2, 0, .97))
    aim_bone(arm, 'hand_R', (.16, 0, 1))
    aim_bone(arm, 'upper_L', (.36, 0, -.93))
    aim_bone(arm, 'fore_L', (.62, 0, -.78))
    aim_bone(arm, 'hand_L', (.7, 0, -.7))
    arm.location = (px, py, 0)
    bpy.context.view_layer.update()
    return arm
