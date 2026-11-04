// Locomoção de personagem em recorte, calculada no build e gravada como tabelas por quadro.
// O pé é o que manda: planta num ponto do chão, trava, rola do calcanhar à ponta, e o joelho sai por IK.
// Unidades locais do boneco. Chão em y=0; y cresce para baixo; o quadril fica em y negativo.
export const COXA = 76, CANELA = 66, SOLA = 18, BRACO = 50, ANTEBRACO = 52;
const L = COXA + CANELA, RAD = Math.PI / 180, DEG = 180 / Math.PI;
const CALC = { x: -9, y: SOLA }, PONTA = { x: 27, y: SOLA };
const rot = (p, g) => { const c = Math.cos(g * RAD), s = Math.sin(g * RAD); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; };
const fr = (v) => v - Math.floor(v);
const lisa = (s) => s * s * (3 - 2 * s);
const lisa5 = (s) => s * s * s * (s * (6 * s - 15) + 10);

export const MARCHA = { T: 1.12, S: 215, duty: .6, h: 152, bob: 5.5, bobSinal: 1, altPe: 24, qCalc: .14, qRola: .52, gCalc: -15, gPonta: 34, incl: 3.5, braco: 21, cotov: 16, cotovA: 22, pico: .5 };
export const CORRIDA = { T: .66, S: 300, duty: .36, h: 150, bob: 8, bobSinal: -1, altPe: 86, qCalc: .1, qRola: .42, gCalc: -6, gPonta: 44, incl: 13, braco: 0, cotov: 0, cotovA: 0, pico: .36, xOff: 4 };

// IK de duas articulações. Devolve as rotações do recorte e o erro se o alvo estiver fora de alcance.
export function ik2(ox, oy, ax, ay, l1, l2, lado = 1) {
  const dx = ax - ox, dy = ay - oy, D0 = Math.hypot(dx, dy), D = Math.min(Math.max(D0, Math.abs(l1 - l2) + .01), (l1 + l2) * .9995);
  const a = Math.atan2(dx, dy), b = Math.acos((l1 * l1 + D * D - l2 * l2) / (2 * l1 * D));
  const sup = a + lado * b;
  const jx = ox + l1 * Math.sin(sup), jy = oy + l1 * Math.cos(sup);
  const tx = ox + dx / D0 * D, ty = oy + dy / D0 * D;
  const inf = Math.atan2(tx - jx, ty - jy);
  return { c: -sup * DEG, j: (sup - inf) * DEG, erro: Math.abs(D0 - D) };
}

// Posição do tornozelo e ângulo do pé de uma perna, em unidades do mundo do boneco.
function pePerna(t, faseP, g, v) {
  const p0 = t / g.T + faseP, n = Math.floor(p0), p = p0 - n, ts = (n - faseP) * g.T;
  const pl = (k) => v * (ts + k * g.T) + g.S * g.duty / 2 + (g.xOff ?? 6);
  const noChao = (Xa, q) => {
    if (q < g.qCalc) { const ang = g.gCalc * (1 - lisa(q / g.qCalc)); const c = { x: Xa + CALC.x, y: 0 }, r = rot(CALC, ang); return { x: c.x - r.x, y: c.y - r.y, ang }; }
    if (q <= g.qRola) return { x: Xa, y: -SOLA, ang: 0 };
    const s = (q - g.qRola) / (1 - g.qRola), ang = g.gPonta * s ** 1.5; const c = { x: Xa + PONTA.x, y: 0 }, r = rot(PONTA, ang); return { x: c.x - r.x, y: c.y - r.y, ang };
  };
  if (p < g.duty) { const q = p / g.duty, e = noChao(pl(0), q); return { ...e, apoio: q >= g.qCalc && q <= g.qRola, chao: true, Xa: pl(0) }; }
  const s = (p - g.duty) / (1 - g.duty), A = noChao(pl(0), 1), B = noChao(pl(1), 0);
  const sx = lisa5(s), arco = Math.sin(Math.PI * s ** (Math.log(.5) / Math.log(g.pico)));
  return { x: A.x + (B.x - A.x) * sx, y: A.y + (B.y - A.y) * s - g.altPe * arco, ang: A.ang + (B.ang - A.ang) * lisa(s) + (g === CORRIDA ? 18 : 6) * arco, apoio: false, chao: false };
}

/* Gera tabelas para t em [0, dur], 30 por segundo. fase: deslocamento do ciclo. porta: mãos presas ao fuzil. travado: o boneco fica parado na tela e o mundo anda. */
export function gerar(g, dur, { fase = 0, porta = false, travado = false, S = null, fps = 30 } = {}) {
  g = S ? { ...g, S } : g;
  const v = g.S / g.T, N = Math.ceil(dur * fps) + 1;
  const des = [], lim = [], pes = [];
  for (let k = 0; k < N; k++) {
    const t = k / fps, p = t / g.T + fase;
    const a = pePerna(t, fase, g, v), b = pePerna(t, fase + .5, g, v); pes.push([a, b]);
    const hx = v * t + 3 * Math.sin(4 * Math.PI * p);
    // subida e descida do quadril: alto no apoio simples ao andar; baixo no apoio e alto no voo ao correr
    des.push(g.h + g.bobSinal * g.bob * Math.cos(4 * Math.PI * (fr(p) - g.duty / 2)));
    let m = 1e9; for (const f of [a, b]) { const dx = Math.abs(f.x - hx); if (dx < L) m = Math.min(m, -f.y + Math.sqrt(L * L - dx * dx) - .2); }
    lim.push(m);
  }
  // altura final: respeita o alcance das pernas e é suavizada para não dar tranco
  let H = des.map((d, i) => Math.min(d, lim[i]));
  for (let it = 0; it < 4; it++) { H = H.map((_, i) => (H[Math.max(0, i - 2)] + 2 * H[Math.max(0, i - 1)] + 3 * H[i] + 2 * H[Math.min(N - 1, i + 1)] + H[Math.min(N - 1, i + 2)]) / 9); H = H.map((h, i) => Math.min(h, lim[i])); }
  const T = {}; for (const n of ["rtx", "rty", "ca", "ja", "pa", "cb", "jb", "pb", "tr", "tr2", "hd", "mc", "sa", "fz", "bf", "af", "bt", "at"]) T[n] = [];
  let erroIK = 0, erroMao = 0, erroCont = 0; const contatos = [[], []];
  for (let k = 0; k < N; k++) {
    const t = k / fps, p = t / g.T + fase, fi = 2 * Math.PI * p, [a, b] = pes[k];
    const hxM = v * t + 3 * Math.sin(4 * Math.PI * p), hy = -H[k];
    const A = ik2(hxM, hy, a.x, a.y, COXA, CANELA), B = ik2(hxM, hy, b.x, b.y, COXA, CANELA);
    for (const [e, f, o] of [[A, a, 0], [B, b, 1]]) { erroIK = Math.max(erroIK, e.erro);
      if (f.chao) { const rx = hxM - COXA * Math.sin(e.c * RAD) - CANELA * Math.sin((e.c + e.j) * RAD), ry = hy + COXA * Math.cos(e.c * RAD) + CANELA * Math.cos((e.c + e.j) * RAD); erroCont = Math.max(erroCont, Math.hypot(rx - f.x, ry - f.y)); }
      if (f.apoio) contatos[o].push({ t, Xa: f.Xa, x: hxM + (-COXA * Math.sin(e.c * RAD)) + (-CANELA * Math.sin((e.c + e.j) * RAD)), y: hy + COXA * Math.cos(e.c * RAD) + CANELA * Math.cos((e.c + e.j) * RAD) + SOLA }); }
    T.rtx.push(travado ? hxM - v * t : hxM); T.rty.push(hy);
    T.ca.push(A.c); T.ja.push(A.j); T.pa.push(a.ang - (A.c + A.j));
    T.cb.push(B.c); T.jb.push(B.j); T.pb.push(b.ang - (B.c + B.j));
    const tr = g.incl + 1.3 * Math.cos(2 * fi - .7); T.tr.push(tr); T.tr2.push(tr);
    T.hd.push(-tr * .8 + 1 * Math.cos(2 * fi - 1.4));
    T.mc.push(2.6 * Math.sin(2 * fi - 1.1) * (porta ? 1.5 : 1));
    T.sa.push(tr + (porta ? 5 : 3) * Math.cos(fi - .5));
    if (porta) {
      const d = 3.2 * Math.sin(fi - .4); T.fz.push(d);
      const gr = (lx) => { const r = rot({ x: lx, y: 0 }, -30 + d); return { x: 16 + r.x, y: -62 + r.y }; };
      const pf = gr(50), pt = gr(-24), bf = ik2(2, -112, pf.x, pf.y, BRACO, ANTEBRACO, -1), bt = ik2(2, -112, pt.x, pt.y, BRACO, ANTEBRACO, -1);
      erroMao = Math.max(erroMao, bf.erro, bt.erro);
      T.bf.push(bf.c); T.af.push(bf.j); T.bt.push(bt.c); T.at.push(bt.j);
    } else {
      const s = Math.cos(fi - .35); T.fz.push(0);
      T.bf.push(g.braco * s); T.af.push(-(g.cotov + g.cotovA * (1 - s) / 2));
      T.bt.push(-g.braco * s); T.at.push(-(g.cotov + g.cotovA * (1 + s) / 2));
    }
  }
  // deslize: quanto o ponto de contato anda no chão enquanto o pé está plano
  let deslize = 0, afund = 0;
  for (const lista of contatos) { for (const c of lista) { deslize = Math.max(deslize, Math.abs(c.x - c.Xa)); afund = Math.max(afund, Math.abs(c.y)); } }
  return { T, v, N, fps, qa: { deslize_mm_local: +deslize.toFixed(3), altura_sola: +afund.toFixed(3), erroIK: +erroIK.toFixed(3), erroMao: +erroMao.toFixed(3), erroContatoTotal: +erroCont.toFixed(3), apoio_pct: +(g.duty * 100).toFixed(0), apoio_duplo_pct: +(Math.max(0, 2 * g.duty - 1) * 100).toFixed(0) } };
}

// Ajoelhado e arrancada: da pose baixa, com antecipação, até entrar no ciclo de corrida.
export function arrancada(dur, tLevanta, tParte, { hK0 = 92, pe1x = 66, pe2x = -82, pe2lift = 18, pe2ang = 52, tr0 = 24, hd0 = -17 } = {}) {
  const run = gerar(CORRIDA, dur - tParte + .5, { porta: true, travado: true });
  const fps = 30, N = Math.ceil(dur * fps) + 1, T = Object.fromEntries(Object.keys(run.T).map((n) => [n, []]));
  const pe1 = { x: pe1x, y: -SOLA, ang: 0 }, pe2 = { x: pe2x, y: -SOLA - pe2lift, ang: pe2ang };
  for (let k = 0; k < N; k++) {
    const t = k / fps, kr = Math.max(0, Math.round((t - tParte) * fps));
    const antec = lisa(Math.min(1, Math.max(0, (t - (tLevanta - .34)) / .3)));
    const hK = hK0 - 9 * antec;
    const A = ik2(0, -hK, pe1.x, pe1.y, COXA, CANELA), B = ik2(0, -hK, pe2.x, pe2.y, COXA, CANELA);
    const pK = { rtx: -6 * antec, rty: -hK, ca: A.c, ja: A.j, pa: pe1.ang - (A.c + A.j), cb: B.c, jb: B.j, pb: pe2.ang - (B.c + B.j), tr: tr0 + 9 * antec, tr2: tr0 + 9 * antec, hd: hd0 - 9 * antec, mc: 0, sa: tr0 + 9 * antec, fz: 0 };
    const gr = (lx) => { const r = rot({ x: lx, y: 0 }, -30); return { x: 16 + r.x, y: -62 + r.y }; };
    const bf = ik2(2, -112, gr(50).x, gr(50).y, BRACO, ANTEBRACO, -1), bt = ik2(2, -112, gr(-24).x, gr(-24).y, BRACO, ANTEBRACO, -1);
    Object.assign(pK, { bf: bf.c, af: bf.j, bt: bt.c, at: bt.j });
    const w = lisa(Math.min(1, Math.max(0, (t - tLevanta) / (tParte - tLevanta + .1))));
    for (const n of Object.keys(T)) { const r = run.T[n][Math.min(kr, run.N - 1)]; T[n].push(pK[n] + (r - pK[n]) * w); }
  }
  return { T, v: run.v, N, fps, qa: run.qa };
}

// Serializa as tabelas com 2 casas para entrar na cena.
export function tabelasJS(pre, g, offset = 0) {
  const ctd = {}; for (const [n, a] of Object.entries(g.T)) ctd[n] = a.map((v) => +v.toFixed(2));
  return `aplicar(${JSON.stringify(pre)}, ${JSON.stringify(ctd)}, ${offset});`;
}

/* Atuação por poses-chave. keys: [{t, h, x, a:[x,ang,lift], b:[x,ang,lift], tr, hd, bf, af, bt, at, onda}]. Campo ausente herda da pose anterior.
   Os pés ficam onde a pose manda; o joelho sai por IK. Com porta=true as mãos seguem o fuzil. Há respiração automática. */
export function atuar(dur, keys, { porta = false, fase = 0, fps = 30 } = {}) {
  const P = []; let ant = { x: 0, h: 150, a: [30, 0, 0], b: [-30, 0, 0], tr: 3, hd: -2, bf: 8, af: -18, bt: -8, at: -18, onda: 0, fz: 0 };
  for (const k of keys) { ant = { ...ant, ...k }; P.push(ant); }
  const mix = (u, v, s) => u + (v - u) * s;
  const nomes = ["rtx", "rty", "ca", "ja", "pa", "cb", "jb", "pb", "tr", "tr2", "hd", "mc", "sa", "fz", "bf", "af", "bt", "at"], T = Object.fromEntries(nomes.map((n) => [n, []]));
  const N = Math.ceil(dur * fps) + 1; let erro = 0;
  for (let i = 0; i < N; i++) {
    const t = i / fps; let j = 0; while (j < P.length - 1 && P[j + 1].t <= t) j++;
    const u = P[j], v = P[Math.min(j + 1, P.length - 1)], s = v === u ? 0 : lisa(Math.min(1, (t - u.t) / Math.max(v.d ?? v.t - u.t, .001)));
    const ph = fase * 6.283, r = Math.sin(6.283 * t / 3.1 + ph), r2 = Math.sin(6.283 * t / 2.3 + ph * 1.7);
    const h = mix(u.h, v.h, s) + 1.3 * r, x = mix(u.x, v.x, s), tr = mix(u.tr, v.tr, s) + .6 * r, hd = mix(u.hd, v.hd, s) + .9 * r2;
    const pa = [mix(u.a[0], v.a[0], s), mix(u.a[1], v.a[1], s), mix(u.a[2] ?? 0, v.a[2] ?? 0, s)], pb = [mix(u.b[0], v.b[0], s), mix(u.b[1], v.b[1], s), mix(u.b[2] ?? 0, v.b[2] ?? 0, s)];
    const A = ik2(x, -h, pa[0], -SOLA - pa[2], COXA, CANELA), B = ik2(x, -h, pb[0], -SOLA - pb[2], COXA, CANELA); erro = Math.max(erro, A.erro, B.erro);
    T.rtx.push(x); T.rty.push(-h); T.ca.push(A.c); T.ja.push(A.j); T.pa.push(pa[1] - (A.c + A.j)); T.cb.push(B.c); T.jb.push(B.j); T.pb.push(pb[1] - (B.c + B.j));
    T.tr.push(tr); T.tr2.push(tr); T.hd.push(hd); T.mc.push(.8 * r2); T.sa.push(tr + .6 * r2);
    const dz = mix(u.fz, v.fz, s); T.fz.push(dz);
    if (porta) {
      const gr = (lx) => { const q = rot({ x: lx, y: 0 }, -30 + dz); return { x: 16 + q.x, y: -62 + q.y }; };
      const bf = ik2(2, -112, gr(50).x, gr(50).y, BRACO, ANTEBRACO, -1), bt = ik2(2, -112, gr(-24).x, gr(-24).y, BRACO, ANTEBRACO, -1);
      T.bf.push(bf.c); T.af.push(bf.j); T.bt.push(bt.c); T.at.push(bt.j);
    } else {
      const on = mix(u.onda, v.onda, s), w = Math.sin(6.283 * t / .62 + ph);
      T.bf.push(mix(u.bf, v.bf, s) + on * w + 1.2 * r2); T.af.push(mix(u.af, v.af, s) + on * .7 * Math.sin(6.283 * t / .62 + ph + .9));
      T.bt.push(mix(u.bt, v.bt, s) - on * w - 1.2 * r2); T.at.push(mix(u.at, v.at, s) - on * .7 * Math.sin(6.283 * t / .62 + ph + .9));
    }
  }
  return { T, N, fps, qa: { erroIK: +erro.toFixed(3) } };
}
