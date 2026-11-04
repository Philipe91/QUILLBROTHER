// Cenas do take Brother Quill: clímax de Henry Gunther, com as falas publicadas. Dramatização visual.
import { rng, crista, tufos, arvorePartida, ruina, arame, fumaca } from "./base.mjs";
import { soldado, lowerThird, lowerThirdAnim, mapaSVG, camMapa } from "./modelos.mjs";
import { atuar, gerar, CORRIDA, tabelasJS } from "./locomocao.mjs";

const C = { p: "var(--pergaminho)", oc: "var(--ocre)", t: "var(--terra)", v: "var(--vinho)", an: "var(--azul-noite)", ol: "var(--oliva)", s: "var(--sombra)", l: "var(--luz)", cr: "var(--creme)", m: "var(--mar)", tc: "var(--terra-clara)", mu: "var(--musgo)" };
const camada = (id, svg) => `<div id="${id}" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${svg}</svg></div>`;
const BOCA = (pre, t, aberta) => `tl.set("#${pre}-bo", { opacity: ${aberta ? 1 : 0} }, ${t.toFixed(3)}); tl.set("#${pre}-lb", { opacity: ${aberta ? 0 : 1} }, ${t.toFixed(3)});`;
const ALEMAO = { frente: C.m, tras: C.an, canela: C.an, cap: "stahl", flip: true };

function ceu(id, solX = 1300, solY = 610) {
  return camada(`${id}-c0`, `<defs><linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".5" stop-color="${C.oc}"/><stop offset=".72" stop-color="${C.l}"/></linearGradient>
    <radialGradient id="${id}-sol"><stop offset="0" stop-color="${C.cr}" stop-opacity=".95"/><stop offset=".22" stop-color="${C.l}" stop-opacity=".7"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs>
    <rect x="-200" y="-100" width="2400" height="1280" fill="url(#${id}-ceu)"/><circle cx="${solX}" cy="${solY}" r="430" fill="url(#${id}-sol)"/>`);
}
const nevoa = (id, y = 600) => camada(`${id}-nv`, `<defs><linearGradient id="${id}-nb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.p}" stop-opacity="0"/><stop offset=".5" stop-color="${C.p}" stop-opacity=".62"/><stop offset="1" stop-color="${C.p}" stop-opacity="0"/></linearGradient></defs><rect x="-300" y="${y}" width="2700" height="220" fill="url(#${id}-nb)"/>`);
const pushIn = (id, de = 1, ate = 1.07, orig = "50% 50%") => `tl.fromTo("#${id}-w", { scale: ${de}, transformOrigin: "${orig}" }, { scale: ${ate}, transformOrigin: "${orig}", duration: DUR, ease: "none" }, 0);`;
const nevoaAnim = (id) => `tl.fromTo("#${id}-nv", { x: -140 }, { x: 80, duration: DUR, ease: "none" }, 0);`;

function barricada(id, x, y, e) {
  return `<g id="${id}" transform="translate(${x},${y}) scale(${e})">
    <path fill="${C.s}" d="M-128,10 L-112,-30 L-58,-34 L-44,-66 L46,-68 L60,-30 L132,-36 L150,10 Z"/>
    <path d="M-108,-16 L128,-44 M-118,0 L142,-14 M-46,-46 L44,-52" stroke="${C.t}" stroke-width="9"/>
    <path d="M-70,10 L-30,-72 M74,10 L30,-74" stroke="${C.s}" stroke-width="11"/>
    <circle cx="-88" cy="-22" r="24" fill="none" stroke="${C.s}" stroke-width="6"/><path d="M-88,-46 L-88,2 M-112,-22 L-64,-22" stroke="${C.s}" stroke-width="4"/>
  </g>`;
}
// Metralhadora vista de lado, cano para a esquerda; o clarão fica na boca do cano.
function mg(id, x, y, e) {
  return `<g transform="translate(${x},${y}) scale(${e})">
    <path d="M-20,20 L-64,84 M14,20 L14,88 M40,18 L84,84" stroke="${C.s}" stroke-width="8"/>
    <rect x="-150" y="-16" width="154" height="26" rx="4" fill="${C.s}"/><rect x="-140" y="-16" width="12" height="26" fill="${C.t}"/><rect x="-34" y="-16" width="12" height="26" fill="${C.t}"/>
    <rect x="-178" y="-7" width="30" height="8" fill="${C.s}"/><rect x="2" y="-22" width="56" height="42" rx="3" fill="${C.an}"/><path d="M58,-12 L78,-22 M58,8 L78,18" stroke="${C.s}" stroke-width="6"/>
    <path d="M18,20 Q10,48 30,62 L44,58 Q30,46 34,20 Z" fill="${C.oc}"/>
    <g id="${id}-fl" opacity="0"><path fill="${C.l}" d="M-176,-3 L-208,-36 L-206,-14 L-262,-6 L-206,4 L-214,30 L-186,8 Z"/><path fill="${C.cr}" d="M-178,-3 L-204,-12 L-232,-4 L-204,4 Z"/></g>
  </g>`;
}

/* A vala: os americanos mergulham e os capacetes ficam na borda. */
export function cenaVala(id, dur, cue, lt) {
  const G = 1050, t0 = cue("dived") - .12;
  const tropa = [{ k: "a", x: 250, e: 1.8 }, { k: "h", x: 640, e: 2 }, { k: "p", x: 1040, e: 1.95, divisas: true }, { k: "d", x: 1420, e: 1.8 }];
  const corpo = `${ceu(id)}
    ${camada(`${id}-c1`, `<path d="${crista(3, 670, 34)}" fill="${C.ol}" opacity=".42"/>${ruina(1440, 690, 1, C.t, C.oc)}<path d="${crista(8, 720, 22)}" fill="${C.ol}" opacity=".7"/>${fumaca(`${id}-f1`, 1730, 720, .9, C.s, .38)}`)}
    ${nevoa(id)}
    ${camada(`${id}-c2`, `${arvorePartida(170, 790, 1.4, C.t)}${arvorePartida(1650, 790, 1.5, C.t)}<path d="${crista(14, 770, 14)}" fill="${C.mu}"/>${arame(-20, 1960, 800, 240, C.s)}`)}
    ${camada(`${id}-c3`, tropa.map((s) => soldado(`${id}-${s.k}`, { x: s.x, y: G, e: s.e, porta: true, divisas: s.divisas })).join(""))}
    ${camada(`${id}-c4`, `<path d="${crista(21, 800, 16, 2600, 22)}" fill="${C.s}"/><g id="${id}-tf">${tufos(4, 34, -100, 2020, 800, 66, C.s)}</g>`)}
    ${lowerThird(id, lt)}`;
  let s = `${pushIn(id, 1, 1.07, "50% 62%")} ${nevoaAnim(id)}\n`;
  tropa.forEach((so, i) => {
    const q = t0 + i * .05;
    const g = atuar(dur + .05, [{ t: 0, h: 148, x: 0, a: [44, 0], b: [-50, 0], tr: 14, hd: -9 }, { t: q, h: 148 }, { t: q + .3, d: .3, h: 66, tr: 30, hd: -24 }, { t: q + .52, d: .22, h: 74, tr: 22, hd: -17 }], { porta: true, fase: i * .23 });
    s += `    ${tabelasJS(`${id}-${so.k}`, g)}\n`;
  });
  s += lowerThirdAnim(id, Math.max(.25, cue("It") - .5));
  return { corpo, script: s };
}

/* Os alemães atrás da barricada. modo calados: não atiram. modo acenam: levantam e acenam. */
export function cenaAlemaes(id, dur, cue, modo) {
  const acena = modo === "acenam", G = acena ? 1075 : 1200, E = acena ? 1.62 : 2.05;
  const tropa = acena ? [{ k: "a", x: 1020 }, { k: "b", x: 1330 }, { k: "c", x: 1640 }] : [{ k: "a", x: 1130 }, { k: "b", x: 1530 }];
  const bx = acena ? 1320 : 880, by = acena ? 930 : 946, be = acena ? 2.5 : 3.2;
  const corpo = `${ceu(id, acena ? 420 : 300, 620)}
    ${camada(`${id}-c1`, `<path d="${crista(6, 680, 30)}" fill="${C.ol}" opacity=".44"/><path d="${crista(11, 730, 20)}" fill="${C.ol}" opacity=".72"/>${ruina(150, 730, 1.1, C.t, C.oc)}${fumaca(`${id}-f1`, 330, 730, .8, C.s, .34)}`)}
    ${nevoa(id, 620)}
    ${camada(`${id}-c2`, `<path d="${crista(16, 780, 10)}" fill="${C.mu}"/>${arame(-20, acena ? 700 : 420, 800, 230, C.s)}${arvorePartida(acena ? 560 : 90, 790, 1.2, C.t)}`)}
    ${camada(`${id}-c3`, tropa.map((s) => soldado(`${id}-${s.k}`, { x: s.x, y: G, e: E, ...ALEMAO })).join(""))}
    ${camada(`${id}-c4`, `${mg(`${id}-mg`, acena ? 980 : 720, acena ? 738 : 716, acena ? 1.15 : 1.75)}${barricada(`${id}-bar`, bx, by, be)}<path d="${crista(26, acena ? 880 : 960, 12)}" fill="${C.s}"/><g>${tufos(9, 24, -100, 2020, acena ? 900 : 985, 60, C.s)}</g>`)}`;
  let s = `${pushIn(id, 1, 1.06, acena ? "62% 50%" : "60% 45%")} ${nevoaAnim(id)}\n`;
  const pe = { a: [38, 0], b: [-40, 0] };
  tropa.forEach((so, i) => {
    let keys;
    if (acena) {
      const q = cue("stood") + i * .07, w = cue("waved") - .1 + i * .05;
      keys = [{ t: 0, h: 64, x: 0, ...pe, tr: 22, hd: -14, bf: -30, af: -60, bt: -18, at: -50 }, { t: q, h: 64 }, { t: q + .42, d: .42, h: 148, tr: 4, hd: -2 }, { t: w, bf: -30 }, { t: w + .26, d: .26, bf: -160, af: -22, bt: -150, at: -28, onda: 20 }];
    } else {
      const n = cue(i === 0 ? "shoot" : "knew");
      keys = [{ t: 0, h: 132, x: 0, ...pe, tr: 10, hd: -4, bf: -52, af: -46, bt: -28, at: -38 }, { t: n, hd: -4 }, { t: n + .3, d: .3, hd: 13 }, { t: n + 1.1, hd: 13 }, { t: n + 1.45, d: .35, hd: i === 0 ? -9 : 0 }];
    }
    s += `    ${tabelasJS(`${id}-${so.k}`, atuar(dur + .05, keys, { fase: i * .31 }))}\n`;
    if (acena) { const b = cue("Go") - .9 + i * .1; for (let v = 0; v < 8; v++) s += `    ${BOCA(`${id}-${so.k}`, b + v * .26, v % 2 === 0)}\n`; }
  });
  return { corpo, script: s };
}

/* Close de Henry subindo atrás da borda da vala: a cena que mostra o rosto. */
export function cenaRetrato(id, dur, cue, lt) {
  const G = 1500, E = 3.3, q = cue("stood") - .1;
  const corpo = `${ceu(id, 1240, 660)}
    ${camada(`${id}-c1`, `<path d="${crista(3, 720, 30)}" fill="${C.ol}" opacity=".42"/><path d="${crista(8, 780, 20)}" fill="${C.ol}" opacity=".7"/>`)}
    ${nevoa(id, 640)}
    ${camada(`${id}-c3`, soldado(`${id}-h`, { x: 800, y: G, e: E, porta: true }))}
    ${camada(`${id}-c4`, `<path d="${crista(29, 930, 18, 2600, 18)}" fill="${C.s}"/><g>${tufos(12, 26, -100, 2020, 930, 80, C.s)}</g>`)}
    ${lowerThird(id, lt)}`;
  const g = atuar(dur + .05, [{ t: 0, h: 66, x: -14, a: [40, 0], b: [-44, 0], tr: 20, hd: -14 }, { t: q, h: 66 }, { t: q + .5, d: .5, h: 150, x: 0, tr: 5, hd: -3 }], { porta: true });
  return { corpo, script: `${pushIn(id, 1, 1.05, "45% 40%")} ${nevoaAnim(id)}\n    ${tabelasJS(`${id}-h`, g)}\n    tl.fromTo("#${id}-lt", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .3, ease: "power2.out" }, .05);` };
}

/* Powell grita, com Henry correndo pequeno ao fundo. */
export function cenaPowell(id, dur, cue, lt) {
  const g0 = cue("shouted") - .12, fimG = cue("stop") + .5, EH = .62;
  const corre = gerar(CORRIDA, dur + .05, { porta: true }); for (let i = 0; i < corre.T.rtx.length; i++) corre.T.rtx[i] = corre.T.rtx[i];
  const corpo = `${ceu(id)}
    ${camada(`${id}-c1`, `<path d="${crista(3, 670, 34)}" fill="${C.ol}" opacity=".42"/><path d="${crista(8, 720, 22)}" fill="${C.ol}" opacity=".7"/>${fumaca(`${id}-f1`, 1750, 720, .8, C.s, .36)}`)}
    ${nevoa(id)}
    ${camada(`${id}-c2`, `<path d="${crista(14, 762, 10)}" fill="${C.mu}"/><rect x="-200" y="792" width="2400" height="60" fill="${C.t}"/>${arame(-20, 1960, 826, 260, C.s)}${soldado(`${id}-h`, { x: 960, y: 812, e: EH, porta: true })}${barricada(`${id}-bar`, 1760, 790, 1.2)}<path d="${crista(19, 846, 8)}" fill="${C.mu}"/>`)}
    ${camada(`${id}-c3`, soldado(`${id}-p`, { x: 520, y: 1450, e: 2.75, divisas: true }))}
    ${camada(`${id}-c4`, `<path d="${crista(33, 950, 14, 2600, 18)}" fill="${C.s}"/><g>${tufos(17, 28, -100, 2020, 950, 70, C.s)}</g>`)}
    ${lowerThird(id, lt)}`;
  const p = atuar(dur + .05, [{ t: 0, h: 128, x: 0, a: [36, 0], b: [-40, 0], tr: 6, hd: -3, bf: 6, af: -24, bt: -10, at: -22 }, { t: g0 - .22, tr: 2 }, { t: g0 + .05, d: .27, tr: 15, hd: -14, bf: -104, af: -28, bt: -34, at: -56 }, { t: fimG, tr: 15, hd: -14 }, { t: fimG + .4, d: .4, tr: 8, hd: -5, bf: -52, af: -42 }]);
  let bocas = ""; for (let v = 0; v < 10; v++) { const b = g0 + v * .17; if (b < fimG) bocas += BOCA(`${id}-p`, b, v % 2 === 0); } bocas += BOCA(`${id}-p`, fimG, false);
  const script = `${pushIn(id, 1, 1.06, "32% 48%")} ${nevoaAnim(id)}
    ${tabelasJS(`${id}-p`, p)}
    ${tabelasJS(`${id}-h`, corre)}
    ${bocas}
    tl.to("#${id}-p-so", { rotation: 14, svgOrigin: "13 -24", duration: .14 }, ${g0.toFixed(3)});
    ${lowerThirdAnim(id, .12)}`;
  return { corpo, script };
}

/* Henry atira correndo; corte para a metralhadora que responde. */
export function cenaTiro(id, dur, cue) {
  const t1 = cue("fired") + .1, t2 = cue("two"), tm = cue("machine") - .06, E = 3, K = 800;
  const run = gerar(CORRIDA, dur + .05, { porta: true, travado: true, fase: .1 }), v = run.v * E;
  const corpo = `<div id="${id}-a" style="position:absolute;inset:0" data-layout-ignore>${ceu(id)}
      ${camada(`${id}-c1`, `<path d="${crista(3, 660, 34, 3400, 22)}" fill="${C.ol}" opacity=".42"/><path d="${crista(8, 720, 22, 3400, 22)}" fill="${C.ol}" opacity=".7"/>`)}
      ${nevoa(id)}
      ${camada(`${id}-c2`, `${arvorePartida(1100, 830, 1.8, C.t)}${arvorePartida(2200, 830, 1.5, C.t)}${arvorePartida(3100, 830, 2, C.t)}<path d="${crista(14, 810, 14, 5600, 40)}" fill="${C.mu}"/>`)}
      ${camada(`${id}-c3`, soldado(`${id}-h`, { x: K, y: 1440, e: E, porta: true }))}
    </div>
    <div id="${id}-b" style="position:absolute;inset:0;opacity:0" data-layout-ignore>
      <div id="${id}-bs" style="position:absolute;inset:0" data-layout-ignore>
      <svg viewBox="0 0 1920 1080" class="cheio"><defs><linearGradient id="${id}-c9" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".7" stop-color="${C.oc}"/></linearGradient></defs><rect x="-100" y="-100" width="2120" height="1280" fill="url(#${id}-c9)"/><path d="${crista(6, 720, 26)}" fill="${C.ol}" opacity=".6"/>
        ${soldado(`${id}-g`, { x: 1420, y: 1240, e: 2.2, ...ALEMAO })}
        ${mg(`${id}-mg`, 1000, 590, 3.2)}${barricada(`${id}-bar`, 1050, 1010, 4.2)}</svg></div>
    </div>`;
  const g = atuar(dur + .05, [{ t: 0, h: 128, x: 0, a: [36, 0], b: [-40, 0], tr: 12, hd: -3, bf: -60, af: -60, bt: -30, at: -60 }]);
  let s = `${pushIn(id, 1, 1.05, "40% 40%")} ${nevoaAnim(id)}
    ${tabelasJS(`${id}-h`, run)}
    ${tabelasJS(`${id}-g`, g)}
    tl.fromTo("#${id}-c1", { x: 0 }, { x: ${(-v * dur * .08).toFixed(1)}, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-c2", { x: 0 }, { x: ${(-v * dur * .3).toFixed(1)}, duration: DUR, ease: "none" }, 0);
    tl.set("#${id}-b", { opacity: 1 }, ${tm.toFixed(3)});\n`;
  for (const f of [t1, t2]) s += `    tl.set("#${id}-h-fl", { opacity: 1 }, ${f.toFixed(3)}); tl.set("#${id}-h-fl", { opacity: 0 }, ${(f + .1).toFixed(3)});\n`;
  for (let i = 0, f = tm + .12; f < dur - .02; i++, f += 1 / 15) { s += `    tl.set("#${id}-mg-fl", { opacity: ${i % 2 ? 0 : 1} }, ${f.toFixed(3)}); tl.set("#${id}-bs", { x: ${i % 2 ? 7 : -7}, y: ${i % 3 ? 4 : -4} }, ${f.toFixed(3)});\n`; }
  return { corpo, script: s, tiros: [t1, t2], tm };
}

/* Cartão por cima dos alemães acenando. */
export function cartao(id, dur, cue, fundo, linhas) {
  const r = rng(77), W = 720, H = 470;
  const borda = (x0, y0, x1, y1, n, a) => { let d = ""; for (let i = 1; i <= n; i++) { const t = i / n; d += ` L${(x0 + (x1 - x0) * t + (r() - .5) * a * (y0 === y1 ? 0 : 1)).toFixed(0)},${(y0 + (y1 - y0) * t + (r() - .5) * a * (x0 === x1 ? 0 : 1)).toFixed(0)}`; } return d; };
  const rasgo = `M0,0${borda(0, 0, W, 0, 34, 14)}${borda(W, 0, W, H, 22, 14)}${borda(W, H, 0, H, 34, 14)}${borda(0, H, 0, 0, 22, 14)} Z`;
  const t0 = cue("Go"), t1 = cue("The", 1) ?? t0 + .6;
  let spans = "", anim = "";
  linhas.forEach((l, i) => { const base = i === 0 ? t0 : t1 + (i - 1) * .34; [...l].forEach((ch, j) => { spans += `<span id="${id}-q${i}_${j}" style="opacity:0">${ch === " " ? "&nbsp;" : ch}</span>`; anim += `    tl.set("#${id}-q${i}_${j}", { opacity: 1 }, ${(base + j * .035).toFixed(3)});\n`; }); spans += "<br>"; });
  const corpo = `${fundo.corpo}
    <div id="${id}-cd" class="cit" style="left:80px;top:230px;width:${W}px;height:${H}px" data-layout-allow-overlap>
      <svg viewBox="0 0 ${W} ${H}" class="cheio" data-layout-ignore><path d="${rasgo}" transform="translate(12,16)" fill="${C.s}" opacity=".55"/><path d="${rasgo}" fill="${C.cr}"/></svg>
      <div class="cit-txt t-titulo" style="left:64px;top:60px;width:600px" data-layout-allow-overlap>${spans}</div>
    </div>`;
  return { corpo, script: `${fundo.script}\n    tl.fromTo("#${id}-cd", { x: -900, rotation: -4 }, { x: 0, rotation: -1.2, duration: .42, ease: "power3.out" }, ${(t0 - .4).toFixed(3)});\n${anim}` };
}

/* O mapa do front: faíscas ao longo da linha até o silêncio. */
export function cenaFront(id, dur, cue, M) {
  const si = cue("silent"), cam0 = camMapa(M, "centro", 1.5), cam1 = camMapa(M, "centro", 1.14);
  const faisca = M.faiscas.map(([x, y], i) => `<circle id="${id}-z${i}" cx="${x}" cy="${y}" r="13" fill="${C.l}" stroke="${C.v}" stroke-width="4" opacity="0"/>`).join("");
  const svg = mapaSVG(id, M, { rotulos: [{ k: "front", g: 46, dx: 34, dy: 0 }] }).replace("</svg>", `<path id="${id}-fr" d="${M.frente}" fill="none" stroke="${C.v}" stroke-width="11" stroke-linecap="round"/>${faisca}</svg>`);
  const corpo = `<div id="${id}-m" style="position:absolute;left:0;top:0;width:${M.W}px;height:${M.H}px" data-layout-ignore>${svg}</div>
    <div class="ano-caixa" data-layout-ignore><span id="${id}-h1">10:59</span><span id="${id}-h2">11:00</span></div>
    <div id="${id}-mes" class="ano-mes" style="opacity:1">NOV. 11, 1918</div>`;
  let an = ""; const r = rng(23);
  M.faiscas.forEach((_, i) => { let t = r() * .5; while (t < si - .05) { an += `tl.set("#${id}-z${i}", { opacity: 1 }, ${t.toFixed(3)}); tl.set("#${id}-z${i}", { opacity: 0 }, ${(t + .1).toFixed(3)});`; t += .34 + r() * .62; } });
  const script = `
    tl.set("#${id}-m", { transformOrigin: "0 0" }, 0);
    tl.fromTo("#${id}-m", { x: ${cam0.x}, y: ${cam0.y}, scale: ${cam0.scale} }, { x: ${cam1.x}, y: ${cam1.y}, scale: ${cam1.scale}, duration: DUR, ease: "sine.inOut" }, 0);
    tl.set("#${id}-h1", { opacity: 1 }, 0); tl.set("#${id}-h1", { opacity: 0 }, ${si.toFixed(3)}); tl.set("#${id}-h2", { opacity: 1 }, ${si.toFixed(3)});
    tl.fromTo("#${id}-front-rot", { opacity: 0 }, { opacity: 1, duration: .4 }, ${(cue("Western") - .1).toFixed(3)});
    tl.fromTo("#${id}-fr", { opacity: 1 }, { opacity: .32, duration: 1.1, ease: "sine.inOut" }, ${si.toFixed(3)});
    ${an}
    tl.to("#${id}-preto", { opacity: 1, duration: 1, ease: "sine.inOut" }, DUR - 1.02);
`;
  return { corpo, script };
}
