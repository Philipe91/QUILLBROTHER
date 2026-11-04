// Camada de atuação: expressões, olhar, piscadas, respiração, mudança de peso, parar e retomar a marcha.
// Não recalcula a caminhada: usa gerar() da V2 sem alteração. Só acrescenta cabeça, rosto e acessórios por cima,
// e costura trechos de parada e retomada com pés travados, pelo mesmo IK.
import { ik2, COXA, CANELA, SOLA, BRACO, ANTEBRACO } from "../../estilos/ampulheta/templates/locomocao.mjs";

const RAD = Math.PI / 180, DEG = 180 / Math.PI;
const lisa = (s) => { s = Math.min(1, Math.max(0, s)); return s * s * (3 - 2 * s); };
const mix = (a, b, s) => a + (b - a) * s;
const herm = (p0, v0, p1, v1, d, u) => { const s = u, s2 = s * s, s3 = s2 * s; return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * d * v0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * d * v1; };
const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// Biblioteca de expressões. Preset pode acrescentar ou substituir.
export const EXPRESSOES = {
  neutra: { pl: .1, pi: 0, so: 0, sa: 0, boca: "b0" },
  atenta: { pl: .02, pi: .05, so: .25, sa: .05, boca: "b0" },
  tensao: { pl: .14, pi: .35, so: -.25, sa: .35, boca: "b1" },
  medo: { pl: 0, pi: .1, so: .75, sa: .8, boca: "b2" },
  surpresa: { pl: 0, pi: 0, so: 1, sa: .2, boca: "b3" },
  cansaco: { pl: .42, pi: .1, so: -.1, sa: .4, boca: "b2" },
  determinacao: { pl: .2, pi: .3, so: -.55, sa: -.7, boca: "b1" },
  grito: { pl: .05, pi: .2, so: .2, sa: -.2, boca: "b4" },
};
const BOCAS = ["b0", "b1", "b2", "b3", "b4"];
// Quanto cada controle anda em unidades do desenho, por vista.
const VISTA = {
  perfil: { olhos: 1, oh: 1.3, ov: .7, lidAberto: -7, pi: 0, so: 3, sa: 11, soOrig: ["13 -33"] },
  busto: { olhos: 2, oh: 9, ov: 5, lidAberto: -40, pi: -9, so: 11, sa: 13, soOrig: ["-8 -52", "74 -54"], fc: 16, cp: -5, or: -13 },
};

/* Gera as faixas do rosto. roteiro: [{t, e:"nome", d:duração}]; olhar: [{t, x, y, d}]; piscadas automáticas e nas mudanças de expressão. */
export function rosto(pre, vista, dur, { roteiro = [{ t: 0, e: "neutra" }], olhar = [{ t: 0, x: 0, y: 0 }], giro = [], seed = 1, fps = 30, piscarEm = [], biblioteca = EXPRESSOES } = {}) {
  const V = VISTA[vista], N = Math.ceil(dur * fps) + 1, r = rng(seed + 11), F = [];
  const pisc = [...piscarEm]; let tp = .7 + r() * 1.6; while (tp < dur) { pisc.push(tp); tp += 2.1 + r() * 2.8; } pisc.sort((a, b) => a - b);
  const curva = (lista, nome, t, defs = 0) => { let v = lista[0]?.[nome] ?? defs; for (let i = 1; i < lista.length; i++) { const k = lista[i]; if (t < k.t) break; const d = k.d ?? .18; v = mix(lista[i - 1][nome] ?? defs, k[nome] ?? defs, lisa((t - k.t) / d)); if (t < k.t + d) break; v = k[nome] ?? defs; } return v; };
  const rot = roteiro.map((k) => ({ d: .22, ...k, ...biblioteca[k.e] }));
  const cols = { o_x: [], o_y: [], pl: [], pi: [], so: [], sa: [], fc: [] }; for (const b of BOCAS) cols[b] = [];
  for (let i = 0; i < N; i++) {
    const t = i / fps;
    let pisca = 0; for (const p of pisc) { const u = (t - p) / .15; if (u >= 0 && u <= 1) pisca = Math.max(pisca, Math.sin(Math.PI * u)); }
    // micro-movimento do olho: pequenos saltos, não deriva
    const sac = Math.floor(t * 1.7), rr = rng(seed * 97 + sac * 31 + 7); const mx = (rr() - .5) * .16, my = (rr() - .5) * .12;
    cols.o_x.push((curva(olhar, "x", t) + mx) * V.oh); cols.o_y.push((curva(olhar, "y", t) + my) * V.ov);
    const pl = curva(rot, "pl", t); cols.pl.push(Math.min(1, pl + (1 - pl) * pisca)); cols.pi.push(curva(rot, "pi", t));
    cols.so.push(curva(rot, "so", t)); cols.sa.push(curva(rot, "sa", t)); cols.fc.push(giro.length ? curva(giro, "v", t) : 0);
    for (const b of BOCAS) { let s = rot[0].boca === b ? 1 : 0; for (let k = 1; k < rot.length; k++) { const u = lisa((t - rot[k].t) / .08); if (t >= rot[k].t) s = mix(s, rot[k].boca === b ? 1 : 0, u); } cols[b].push(s); }
  }
  const saida = [];
  for (let j = 0; j < V.olhos; j++) {
    const ky = j === 1 ? .7 : 1;
    saida.push([`${pre}-o${j}`, "x", cols.o_x.map((v) => v * ky)], [`${pre}-o${j}`, "y", cols.o_y.map((v) => v * ky)]);
    saida.push([`${pre}-l${j}`, "y", cols.pl.map((v) => V.lidAberto * ky * (1 - v))]);
    if (V.pi) saida.push([`${pre}-p${j}`, "y", cols.pi.map((v) => V.pi * ky * v)]);
    const sinal = j === 0 ? -1 : 1;
    saida.push([`${pre}-s${j}`, "y", cols.so.map((v) => -V.so * v)], [`${pre}-s${j}`, "rotation", cols.sa.map((v) => sinal * V.sa * v), V.soOrig[j]]);
  }
  for (const b of BOCAS) saida.push([`${pre}-${b}`, "opacity", cols[b]]);
  if (V.fc) { saida.push([`${pre}-fc`, "x", cols.fc.map((v) => V.fc * v)], [`${pre}-cp`, "x", cols.fc.map((v) => V.cp * v)], [`${pre}-or`, "x", cols.fc.map((v) => V.or * v)]); }
  return saida;
}

// Pega a posição do tornozelo e do pé a partir das tabelas gravadas (cinemática direta).
export function fk(T, k, a = "ca", b = "ja", p = "pa") {
  const c = T[a][k], j = T[b][k], x = T.rtx[k] - COXA * Math.sin(c * RAD) - CANELA * Math.sin((c + j) * RAD), y = T.rty[k] + COXA * Math.cos(c * RAD) + CANELA * Math.cos((c + j) * RAD);
  return { x, y, ang: T[p][k] + c + j };
}
const grips = (dz) => { const g = (lx) => { const c = Math.cos((-30 + dz) * RAD), s = Math.sin((-30 + dz) * RAD); return { x: 16 + lx * c, y: -62 + lx * s }; }; const f = g(50), t = g(-24); const bf = ik2(2, -112, f.x, f.y, BRACO, ANTEBRACO, -1), bt = ik2(2, -112, t.x, t.y, BRACO, ANTEBRACO, -1); return { bf: bf.c, af: bf.j, bt: bt.c, at: bt.j, erro: Math.max(bf.erro, bt.erro) }; };
const copiaLinha = (D, T, k, ox = 0) => { for (const n of Object.keys(D)) D[n].push(n === "rtx" ? T[n][k] + ox : T[n][k]); };
const COLS = ["rtx", "rty", "ca", "ja", "pa", "cb", "jb", "pb", "tr", "tr2", "hd", "mc", "sa", "fz", "bf", "af", "bt", "at"];
const novo = () => Object.fromEntries(COLS.map((n) => [n, []]));
function linhaIK(D, q, porta, stats) {
  const A = ik2(q.x, q.y, q.a.x, q.a.y, COXA, CANELA), B = ik2(q.x, q.y, q.b.x, q.b.y, COXA, CANELA);
  stats.ik = Math.max(stats.ik, A.erro, B.erro);
  D.rtx.push(q.x); D.rty.push(q.y); D.ca.push(A.c); D.ja.push(A.j); D.pa.push(q.a.ang - (A.c + A.j)); D.cb.push(B.c); D.jb.push(B.j); D.pb.push(q.b.ang - (B.c + B.j));
  D.tr.push(q.tr); D.tr2.push(q.tr); D.hd.push(q.hd); D.mc.push(q.mc ?? 0); D.sa.push(q.sa ?? q.tr); D.fz.push(q.fz ?? 0);
  if (porta) { const g = grips(q.fz ?? 0); D.bf.push(g.bf); D.af.push(g.af); D.bt.push(g.bt); D.at.push(g.at); } else { D.bf.push(q.bf); D.af.push(q.af); D.bt.push(q.bt); D.at.push(q.at); }
}
const pose = (T, k, a, b) => ({ bf: T.bf[k], af: T.af[k], bt: T.bt[k], at: T.at[k], tr: T.tr[k], hd: T.hd[k], mc: T.mc[k], sa: T.sa[k], fz: T.fz[k], a, b });

/* Anda, desacelera num passo curto e fica vivo parado. G = gerar(MARCHA, ...). Devolve tabelas + momento da parada. */
export function andarEParar(G, g, { tMin, dur, fase = 0, porta = false, recuo = 34, Dp = .95, idle = [], fps = 30, h0 = 153, seed = 3 }) {
  const n = Math.ceil(tMin / g.T + fase), kS = Math.round(((n - fase) * g.T) * fps), T = G.T, v = G.v, stats = { ik: 0 };
  const D = novo(); for (let k = 0; k < kS; k++) copiaLinha(D, T, k);
  const A0 = fk(T, kS, "ca", "ja", "pa"), B0 = fk(T, kS, "cb", "jb", "pb"), Af = fk(T, kS + Math.round(g.duty * g.T * .35 * fps), "ca", "ja", "pa"), P0 = pose(T, kS, A0, B0);
  const xFim = Af.x - recuo * .5 + 2, Bx = Af.x - recuo, hx0 = T.rtx[kS], hy0 = T.rty[kS], Dsw = .6;
  const N = Math.ceil(dur * fps) + 1, r = rng(seed); const ph = r() * 6.28;
  let px = xFim;
  for (let k = kS; k < N; k++) {
    const t = (k - kS) / fps, u = Math.min(1, t / Dp), w = lisa(u);
    const us = Math.min(1, t / Dsw), sw = lisa(us);
    const a = { x: mix(A0.x, Af.x, lisa(t / .12)), y: mix(A0.y, Af.y, lisa(t / .12)), ang: mix(A0.ang, 0, lisa(t / .12)) };
    const b = { x: mix(B0.x, Bx, sw), y: mix(B0.y, -SOLA, sw) - 22 * Math.sin(Math.PI * us), ang: mix(B0.ang, 0, sw) + 9 * Math.sin(Math.PI * us) };
    // peso: chega por cima, assenta com pequena descida e sobra de impulso no tronco
    const hx = t < Dp ? herm(hx0, v, xFim, 0, Dp, u) : xFim, h = mix(-hy0, h0, w) - 5 * Math.sin(Math.PI * Math.min(1, t / (Dp * .95))) * (t < Dp ? 1 : 0);
    const tInerc = 7 * Math.exp(-((t - .28) ** 2) / .05), base = { tr: mix(P0.tr, 1.5, w) + tInerc, hd: mix(P0.hd, -1, w), mc: mix(P0.mc, 0, w) + 3.4 * Math.exp(-t * 3) * Math.sin(t * 11), sa: mix(P0.sa, 1, w) + 2.5 * Math.exp(-t * 3.4) * Math.sin(t * 10), fz: mix(P0.fz, 0, w) };
    // depois de parado: poses de atuação por cima, com respiração
    const tt = k / fps; let id = { dx: 0, dh: 0, tr: 0, hd: 0, bf: null };
    if (idle.length) { let cur = { dx: 0, dh: 0, tr: 0, hd: 0 }; for (let i = 0; i < idle.length; i++) { const q = idle[i]; if (tt >= q.t) { const pv = i ? idle[i - 1] : cur, s = lisa((tt - q.t) / (q.d ?? .4)); cur = { dx: mix(pv.dx ?? 0, q.dx ?? 0, s), dh: mix(pv.dh ?? 0, q.dh ?? 0, s), tr: mix(pv.tr ?? 0, q.tr ?? 0, s), hd: mix(pv.hd ?? 0, q.hd ?? 0, s) }; } } id = cur; }
    const resp = Math.sin(6.283 * tt / 3.3 + ph), resp2 = Math.sin(6.283 * tt / 2.4 + ph * 1.6), viva = lisa((t - Dp * .7) / .5);
    linhaIK(D, { x: hx + id.dx * viva + .9 * resp * viva, y: -(h + id.dh * viva + 1.1 * resp * viva), a, b, tr: base.tr + id.tr * viva + .55 * resp * viva, hd: base.hd + id.hd * viva + .8 * resp2 * viva, mc: base.mc + .7 * resp2 * viva, sa: base.sa + id.tr * viva + .5 * resp2 * viva, fz: base.fz + .8 * resp * viva, bf: mix(P0.bf, 6 + resp2, w), af: mix(P0.af, -20, w), bt: mix(P0.bt, -7 - resp2, w), at: mix(P0.at, -18, w) }, porta, stats);
    px = hx;
  }
  return { T: D, N, tParada: kS / fps, tAssentou: kS / fps + Dp, stats, Af, Bx };
}

/* Parado até tR e retoma a marcha: primeiro antecipa, dá o passo e entra na tabela da V2, com o mundo alinhado ao pé de apoio. */
export function pararERetomar(G, g, { tR, dur, Ax = 40, Bx = 6, h0 = 153, porta = false, Dr = .62, idle = [], fps = 30, seed = 5, tr0 = 1.5 }) {
  const T = G.T, N = Math.ceil(dur * fps) + 1, stats = { ik: 0 }, D = novo();
  // na tabela, procura um quadro em que B acaba de pisar (A está rolando atrás, q≈.83)
  const kR = Math.round((2 * g.T + .5 * g.T) * fps), kRol = kR - Math.round(.5 * g.T * fps) + Math.round(g.duty * g.T * .35 * fps);
  const Atab = fk(T, kRol, "ca", "ja", "pa"), ox = Ax - Atab.x, Afim = fk(T, kR, "ca", "ja", "pa"), Bfim = fk(T, kR, "cb", "jb", "pb"), Pf = pose(T, kR, Afim, Bfim);
  const hxF = T.rtx[kR] + ox, hyF = T.rty[kR], kI = Math.round(tR * fps), r = rng(seed), ph = r() * 6.28, xRep = (Ax + Bx) / 2 + 2;
  for (let k = 0; k < N; k++) {
    const t = k / fps;
    if (k < kI + Math.round(Dr * fps)) {
      const u = Math.max(0, (t - tR) / Dr), s = lisa(u), resp = Math.sin(6.283 * t / 3.3 + ph), resp2 = Math.sin(6.283 * t / 2.4 + ph * 1.6);
      let cur = { dx: 0, dh: 0, tr: 0, hd: 0 }; for (let i = 0; i < idle.length; i++) { const q = idle[i]; if (t >= q.t) { const pv = i ? idle[i - 1] : { dx: 0, dh: 0, tr: 0, hd: 0 }, w = lisa((t - q.t) / (q.d ?? .4)); cur = { dx: mix(pv.dx ?? 0, q.dx ?? 0, w), dh: mix(pv.dh ?? 0, q.dh ?? 0, w), tr: mix(pv.tr ?? 0, q.tr ?? 0, w), hd: mix(pv.hd ?? 0, q.hd ?? 0, w) }; } }
      // antecipação: recua um pouco o peso e baixa o quadril antes de sair
      const ante = Math.exp(-(((t - (tR - .12)) / .17) ** 2));
      const a = { x: mix(Ax, Afim.x + ox, lisa((u - .1) / .9)), y: mix(-SOLA, Afim.y, lisa((u - .1) / .9)), ang: mix(0, Afim.ang, lisa((u - .1) / .9)) };
      const us = lisa((u - .05) / .95), b = { x: mix(Bx, Bfim.x + ox, us), y: mix(-SOLA, Bfim.y, us) - 26 * Math.sin(Math.PI * Math.min(1, u)), ang: mix(0, Bfim.ang, us) + 8 * Math.sin(Math.PI * Math.min(1, u)) };
      const hx = u > 0 ? herm(xRep - 5, 0, hxF, G.v, Dr, Math.min(1, u)) : xRep + cur.dx - 5 * ante + .9 * resp, h = mix(h0 + cur.dh - 4 * ante + 1.1 * resp, -hyF, s);
      linhaIK(D, { x: hx, y: -h, a, b, tr: mix(tr0 + cur.tr + 4 * ante * -1 + .55 * resp, Pf.tr, s) + 4 * Math.sin(Math.PI * Math.min(1, u)), hd: mix(cur.hd + .8 * resp2, Pf.hd, s), mc: mix(.7 * resp2, Pf.mc, s), sa: mix(tr0 + cur.tr, Pf.sa, s), fz: mix(.8 * resp, Pf.fz, s), bf: mix(6 + resp2, Pf.bf, s), af: mix(-20, Pf.af, s), bt: mix(-7 - resp2, Pf.bt, s), at: mix(-18, Pf.at, s) }, porta, stats);
    } else copiaLinha(D, T, kR + (k - (kI + Math.round(Dr * fps))), ox);
  }
  return { T: D, N, stats, ox };
}

/* Acessórios por cima: cantil com atraso, sombra de contato. Não mexe em nenhuma coluna da marcha. */
export function secundarios(pre, Tb, fps = 30) {
  const n = Tb.rtx.length, ct = [], cs = [], csOp = []; let a = 0, v = 0;
  for (let k = 0; k < n; k++) {
    const ax = k > 1 ? (Tb.rtx[k] - 2 * Tb.rtx[k - 1] + Tb.rtx[k - 2]) * fps * fps * .01 : 0, ay = k > 1 ? (Tb.rty[k] - 2 * Tb.rty[k - 1] + Tb.rty[k - 2]) * fps * fps * .012 : 0;
    const dt = 1 / fps; v += (-70 * a - 9 * v - ax - ay) * dt; a += v * dt; ct.push(Math.max(-22, Math.min(22, a)));
    cs.push(Tb.rtx[k]); csOp.push(.3);
  }
  return [[`${pre}-ct`, "rotation", ct], [`${pre}-cs`, "x", cs]];
}

// Tabelas do corpo para o formato de faixas.
export const faixasCorpo = (pre, T) => { const out = []; for (const [n, a] of Object.entries(T)) { if (n === "rtx") out.push([`${pre}-rt`, "x", a]); else if (n === "rty") out.push([`${pre}-rt`, "y", a]); else out.push([`${pre}-${n}`, "rotation", a]); } return out; };
// Soma correção de cabeça sem mexer no resto (a cabeça olha para onde a cena pede).
export const somaCabeca = (T, fn, fps = 30) => ({ ...T, hd: T.hd.map((v, k) => v + fn(k / fps)) });

/* Câmera que segue um x com atraso, gravada em tabela. */
export function seguir(alvo, { telaX, lag = 4.5, fps = 30, inicio = null }) {
  let c = inicio ?? alvo[0] - telaX, v = 0; const out = [];
  for (const a of alvo) { const want = a - telaX, d = want - c; v += (lag * lag * d - 2 * lag * v) / fps; c += v / fps; out.push(c); }
  return out;
}

// Medições: o pé plano não pode andar. Usado nos testes de regressão.
export function deslizeEmApoio(T, fps = 30) {
  let mx = 0; const stat = { a: { x: null }, b: { x: null } };
  for (const [nm, a, b, p] of [["a", "ca", "ja", "pa"], ["b", "cb", "jb", "pb"]]) { let ref = null; for (let k = 0; k < T.rtx.length; k++) { const f = fk(T, k, a, b, p); const plano = Math.abs(f.ang) < .3 && Math.abs(f.y + SOLA) < .35; if (plano) { if (ref === null) ref = f.x; mx = Math.max(mx, Math.abs(f.x - ref)); } else ref = null; } }
  return +mx.toFixed(3);
}
