// Candidata V5: cinco cenas, personagens novos sobre as tabelas de marcha da V2, eventos de áudio derivados da animação.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { crista, tufos, arvorePartida, ruina, arame, fumaca, rng } from "../../ampulheta/templates/base.mjs";
import { MARCHA, gerar } from "../../ampulheta/templates/locomocao.mjs";
import { documento } from "../../ampulheta/templates/modelos.mjs";
import { personagem, busto } from "../../../motor/personagem/rig.mjs";
import { rosto, andarEParar, pararERetomar, secundarios, faixasCorpo, somaCabeca, seguir, deslizeEmApoio } from "../../../motor/personagem/atuacao.mjs";
import { evento, passosDe } from "../../../motor/audio/eventos.mjs";

const raiz = new URL("../", import.meta.url), L = (p) => new URL(p, raiz), est = new URL("../", raiz);
const PR = JSON.parse(readFileSync(new URL("../../../motor/personagem/presets/ilustrado_cinematico.json", import.meta.url))).personagens, A = PR.soldado_a, B = PR.soldado_b;
const VOZ = existsSync(L("job_voz.json.out")) ? JSON.parse(readFileSync(L("job_voz.json.out"))) : null;
const C = { p: "var(--pergaminho)", oc: "var(--ocre)", t: "var(--terra)", v: "var(--vinho)", an: "var(--azul-noite)", ol: "var(--oliva)", s: "var(--sombra)", l: "var(--luz)", cr: "var(--creme)", mu: "var(--musgo)" };
const camada = (id, svg) => `<div id="${id}" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${svg}</svg></div>`;
const FPS = 30;

/* ---------- cenário comum, mesma direção de arte da V2 ---------- */
function ceu(id, solX = 1320, solY = 610) { return camada(`${id}-c0`, `<defs><linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".5" stop-color="${C.oc}"/><stop offset=".72" stop-color="${C.l}"/></linearGradient><radialGradient id="${id}-sol"><stop offset="0" stop-color="${C.cr}" stop-opacity=".95"/><stop offset=".22" stop-color="${C.l}" stop-opacity=".7"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs><rect x="-200" y="-100" width="2400" height="1280" fill="url(#${id}-ceu)"/><circle cx="${solX}" cy="${solY}" r="430" fill="url(#${id}-sol)"/>`); }
const nevoa = (id, y = 610) => camada(`${id}-nv`, `<defs><linearGradient id="${id}-nb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.p}" stop-opacity="0"/><stop offset=".5" stop-color="${C.p}" stop-opacity=".6"/><stop offset="1" stop-color="${C.p}" stop-opacity="0"/></linearGradient></defs><rect x="-400" y="${y}" width="3200" height="210" fill="url(#${id}-nb)"/>`);
const fundoLonge = (id) => camada(`${id}-c1`, `<path d="${crista(3, 670, 34, 3600, 22)}" fill="${C.ol}" opacity=".42"/>${ruina(1460, 690, 1.05, C.t, C.oc)}${ruina(2500, 690, .9, C.t, C.oc)}${ruina(320, 690, .78, C.t, C.oc)}<path d="${crista(8, 720, 22, 3600, 22)}" fill="${C.ol}" opacity=".7"/>${fumaca(`${id}-f1`, 1760, 720, .9, C.s, .36)}${fumaca(`${id}-f2`, 160, 730, .68, C.s, .28)}`);
const campo = (id, chao, extra = "") => camada(`${id}-c2`, `${[220, 1080, 1720, 2600, 3300, 4100].map((x, i) => arvorePartida(x, chao - 52, 1.05 + (i % 3) * .28, C.t)).join("")}<path d="${crista(14, chao - 66, 12, 6200, 40)}" fill="${C.mu}"/>${arame(-40, 5200, chao - 38, 250, C.s)}${[420, 1500, 2700, 3700].map((x) => `<ellipse cx="${x}" cy="${chao + 40}" rx="150" ry="15" fill="${C.t}"/>`).join("")}${extra}`);
const frente = (id, y) => camada(`${id}-c3`, `<path d="${crista(21, y, 22, 7600, 56)}" fill="${C.s}"/><g id="${id}-tf">${tufos(4, 150, -200, 7200, y - 26, 74, C.s)}</g>`);

/* ---------- arquivo de cena ---------- */
function cena(id, dur, corpo, script, faixas = [], dissolve = 0) {
  return `<template>
  <style>#root { position: absolute; inset: 0; }</style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-layout-allow-overflow data-layout-allow-overlap>
    <div id="${id}-w" class="cena" data-layout-allow-overflow data-layout-allow-overlap>${corpo}<div id="${id}-preto" class="preto" data-layout-ignore></div></div>
  </div>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true }), DUR = ${dur.toFixed(3)}, ORIG = { svgOrigin: "0 0" }, FPS = ${FPS};
    const osc = (alvo, de, ate, per, ini, fim) => { const n = Math.max(1, Math.round((fim - ini) / (per / 2))); tl.fromTo(alvo, { ...de, ...(ate.svgOrigin ? { svgOrigin: ate.svgOrigin } : {}) }, { ...ate, duration: (fim - ini) / n, ease: "sine.inOut", repeat: n - 1, yoyo: true }, ini); };
    const F = ${JSON.stringify(faixas.map(([s, p, a, o]) => [s, p, a.map((v) => +v.toFixed(2)), o ?? null]))};
    for (const [s, p, a, o] of F) { const n = a.length - 1, d = n / FPS, ease = (u) => { const f = Math.min(Math.max(u, 0), 1) * n, i = Math.floor(f); return i >= n ? a[n] : a[i] + (a[i + 1] - a[i]) * (f - i); }; const de = { [p]: 0 }, ate = { [p]: 1, ease, duration: d, immediateRender: true }; if (p === "rotation") { de.svgOrigin = ate.svgOrigin = o || "0 0"; } tl.fromTo("#" + s, de, ate, 0); }
    ${dissolve ? `tl.fromTo("#${id}-w", { opacity: 0 }, { opacity: 1, duration: ${dissolve}, ease: "sine.inOut" }, 0);` : ""}
${script}
    tl.set({}, {}, DUR);
    window.__timelines["${id}"] = tl;
  })();
  </script>
</template>
`;
}
const camFaixas = (id, cam, N = {}) => { const k = { c0: .03, c1: .12, nv: .2, c2: 1, c3: 1.32, ...N }; return Object.entries(k).map(([c, v]) => [`${id}-${c}`, "x", cam.map((x) => -x * v)]); };
const push = (id, a, b, o = "50% 55%") => `tl.fromTo("#${id}-w", { scale: ${a}, transformOrigin: "${o}" }, { scale: ${b}, transformOrigin: "${o}", duration: DUR, ease: "none" }, 0);`;
const vivos = (id) => `tl.fromTo("#${id}-f1", { scale: .9, y: 0, ...ORIG }, { scale: 1.1, y: -30, ...ORIG, duration: DUR, ease: "none" }, 0); tl.fromTo("#${id}-f2", { scale: .95, y: 0, ...ORIG }, { scale: 1.1, y: -24, ...ORIG, duration: DUR, ease: "none" }, 0); osc("#${id}-tf", { skewX: -1.2 }, { skewX: 1.2, ...ORIG }, 2.6, 0, DUR);`;

/* ---------- plano de cenas: a duração nasce da voz e da atuação ---------- */
const durVoz = (i) => { if (!VOZ) return 3.4; const u = VOZ[i].at(-1); return u.t + u.d; };
const D1 = Math.max(3.6, durVoz(0) + .6), D2 = 3.05, D3 = 3.05, D4 = 2.25, D5 = Math.max(3.4, durVoz(1) + 1.6), DIS5 = .5;
const T0 = { s1: 0, s2: D1, s3: D1 + D2, s4: D1 + D2 + D3, s5: D1 + D2 + D3 + D4 - DIS5 }; const TOT = T0.s5 + D5;
const ev = [], qa = {};

/* CENA 1: plano aberto, dois soldados andando. Tabelas da V2 sem alteração. */
{
  const id = "s1", dur = D1, Y = 842, eA = .98, eB = .92, xA = 1000, xB = 590;
  const GA = gerar(MARCHA, dur + .1, { fase: .08, porta: true, S: MARCHA.S / eA }), GB = gerar(MARCHA, dur + .1, { fase: .63, S: MARCHA.S / eB });
  const cam = seguir(GA.T.rtx.map((x) => xA + x * eA), { telaX: 880, inicio: xA - 880, lag: 6 }).map((x) => x + 0);
  const corpo = `${ceu(id)}${fundoLonge(id)}${nevoa(id)}${campo(id, Y, personagem(`${id}-b`, B, { x: xB, y: Y - 10, e: eB, arma: "costas" }) + personagem(`${id}-a`, A, { x: xA, y: Y + 6, e: eA }))}${frente(id, 1016)}`;
  const faixas = [...camFaixas(id, cam), ...faixasCorpo(`${id}-a`, GA.T), ...faixasCorpo(`${id}-b`, GB.T), ...secundarios(`${id}-a`, GA.T), ...secundarios(`${id}-b`, GB.T),
    ...rosto(`${id}-a`, "perfil", dur + .1, { roteiro: [{ t: 0, e: "cansaco" }], olhar: [{ t: 0, x: .4, y: 0 }], seed: 3 }), ...rosto(`${id}-b`, "perfil", dur + .1, { roteiro: [{ t: 0, e: "neutra" }], olhar: [{ t: 0, x: .5, y: .2 }, { t: 1.8, x: 1, y: 0, d: .15 }], seed: 8 })];
  writeFileSync(L(`compositions/${id}.html`), cena(id, dur, corpo, `${push(id, 1, 1.05)} tl.fromTo("#${id}-nv", { y: 0 }, { y: 4, duration: DUR, ease: "none" }, 0); ${vivos(id)}`, faixas));
  const tx = (Gx, x0, e) => (t) => x0 + Gx.T.rtx[Math.min(Math.round(t * FPS), Gx.N - 1)] * e - cam[Math.min(Math.round(t * FPS), cam.length - 1)];
  ev.push(...passosDe("Soldado A", GA.T, { inicio: T0.s1, dist: .42, telaX: tx(GA, xA, eA), ate: dur }), ...passosDe("Soldado B", GB.T, { inicio: T0.s1, dist: .55, telaX: tx(GB, xB, eB), db: -2, ate: dur }));
  qa.s1 = { deslizeA: deslizeEmApoio(GA.T), deslizeB: deslizeEmApoio(GB.T) };
}

/* CENA 2: plano médio. Ele desacelera, assenta o peso e olha para longe. */
{
  const id = "s2", dur = D2, Y = 985, e = 1.9, x0 = 900;
  const G = gerar(MARCHA, dur + 1.5, { fase: .35, porta: true, S: MARCHA.S / e });
  const R = andarEParar(G, MARCHA, { tMin: .55, dur: dur + .1, fase: .35, porta: true, idle: [{ t: 1.75, d: .5, dx: -5, tr: -1.4, hd: 0, dh: 1.2 }, { t: 2.45, d: .4, dx: -3, tr: -.4, hd: 0 }], seed: 5 });
  const tOlha = R.tParada + .55, T = somaCabeca(R.T, (t) => { const u = Math.min(1, Math.max(0, (t - tOlha) / .32)), s = u * u * (3 - 2 * u); return -7 * s; });
  const hip = T.rtx.map((x) => x0 + x * e), cam = seguir(hip, { telaX: 860, inicio: hip[0] - 860, lag: 5.2 });
  const corpo = `${ceu(id)}${fundoLonge(id)}${nevoa(id)}${campo(id, Y - 138, "") }${camada(`${id}-g`, `<rect x="-2000" y="${Y - 110}" width="11000" height="700" fill="${C.mu}"/><path d="${crista(19, Y - 120, 9, 11000, 80, -2000)}" fill="${C.mu}"/><rect x="-2000" y="${Y - 34}" width="11000" height="66" fill="${C.t}" opacity=".85"/>${personagem(`${id}-a`, A, { x: x0, y: Y, e })}`)}${frente(id, 1128)}`;
  const faixas = [...camFaixas(id, cam, { g: 1 }), ...faixasCorpo(`${id}-a`, T), ...secundarios(`${id}-a`, T),
    ...rosto(`${id}-a`, "perfil", dur + .1, { roteiro: [{ t: 0, e: "cansaco" }, { t: R.tParada + .2, e: "atenta", d: .3 }, { t: tOlha + .35, e: "tensao", d: .4 }], olhar: [{ t: 0, x: .3, y: .1 }, { t: tOlha - .16, x: 1, y: -.8, d: .1 }], piscarEm: [tOlha + .5], seed: 6 })];
  writeFileSync(L(`compositions/${id}.html`), cena(id, dur, corpo, `${push(id, 1, 1.09, "46% 44%")} ${vivos(id)}`, faixas));
  ev.push(...passosDe("Soldado A", T, { inicio: T0.s2, dist: .16, telaX: () => 860, ate: dur }));
  ev.push(evento(T0.s2 + R.tAssentou - .22, "equipamento", { dist: .12, pan: -.1, db: -2, origem: "cena 2: mochila assenta ao parar" }), evento(T0.s2 + R.tAssentou - .16, "pano", { dist: .12, pan: -.1, db: -2, origem: "cena 2: roupa assenta" }));
  ev.push(evento(T0.s2 + R.tParada - .3, "artilharia", { bus: "efeitos", dist: .93, pan: .55, db: 5, origem: "cena 2: artilharia distante, ele para e procura" }));
  qa.s2 = { deslize: deslizeEmApoio(T), ikErro: +R.stats.ik.toFixed(3), tabelaIgualV2AteParar: T.ca.slice(0, Math.round(R.tParada * FPS)).every((v, k) => v === G.T.ca[k]) };
  qa._s2fim = { };
}

/* CENA 3: close. Clarão no horizonte, depois o som; os olhos reagem antes da cabeça. */
const tFlash = .62, tSom = tFlash + .5;
{
  const id = "s3", dur = D3, N = Math.ceil(dur * FPS) + 2, fx = (fn) => Array.from({ length: N }, (_, k) => fn(k / FPS));
  const lis = (a, b, t) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
  const cena3 = `${ceu(id, 1500, 640)}
    ${camada(`${id}-c1`, `<path d="${crista(3, 690, 30, 3000, 20)}" fill="${C.ol}" opacity=".44"/>
      <g transform="translate(1520,720)"><g id="${id}-ex" opacity="0"><circle cx="0" cy="-30" r="56" fill="${C.s}"/><circle cx="-48" cy="-70" r="42" fill="${C.s}"/><circle cx="46" cy="-82" r="50" fill="${C.s}"/><circle cx="0" cy="-140" r="62" fill="${C.s}"/><circle cx="-42" cy="-190" r="46" fill="${C.t}"/><circle cx="38" cy="-206" r="42" fill="${C.t}"/></g></g>
      <path d="${crista(8, 750, 18, 3000, 20)}" fill="${C.ol}" opacity=".78"/>`)}
    <div id="${id}-fl" class="camada" style="background:radial-gradient(ellipse 40% 38% at 79% 66%, var(--creme), rgba(245,215,154,0) 70%);opacity:0" data-layout-ignore></div>
    ${nevoa(id, 640)}
    ${camada(`${id}-b`, busto(`${id}-a`, A, { x: 790, y: 470, e: 1.62 }))}`;
  const om = fx((t) => 2.6 * Math.sin(6.283 * t / 3.1) - 13 * lis(tSom + .06, tSom + .3, t) + 6 * lis(tSom + 1, tSom + 2, t));
  const omRot = fx((t) => .25 * Math.sin(6.283 * t / 3.6) - 1 * lis(tSom + .08, tSom + .36, t));
  const hdRot = fx((t) => 1 * Math.sin(6.283 * t / 2.7 + 1) + 1.2 - 3.2 * lis(tSom - .03, tSom + .1, t) * (1 - lis(tSom + .1, tSom + .32, t)) + 4.4 * lis(tSom + .1, tSom + .5, t) - 3 * lis(tSom + 1.15, tSom + 1.6, t));
  const hdX = fx((t) => 16 * lis(tSom + .1, tSom + .5, t) - 7 * lis(tSom + 1.15, tSom + 1.6, t)), hdY = fx((t) => 1.8 * Math.sin(6.283 * t / 3.1) - 9 * lis(tSom + .06, tSom + .3, t));
  const treme = fx((t) => { const u = t - tSom; return u > 0 && u < .55 ? 5 * Math.exp(-u * 8) * Math.sin(u * 62) : 0; });
  const faixas = [[`${id}-a-om`, "y", om], [`${id}-a-om`, "rotation", omRot, "0 260"], [`${id}-a-hd`, "rotation", hdRot, "0 90"], [`${id}-a-hd`, "x", hdX], [`${id}-a-hd`, "y", hdY], [`${id}-c1`, "x", fx((t) => -8 * t)], [`${id}-b`, "x", treme], [`${id}-b`, "y", fx((t) => treme[Math.round(t * FPS)] * .6)],
    ...rosto(`${id}-a`, "busto", dur + .1, { roteiro: [{ t: 0, e: "atenta" }, { t: tSom + .17, e: "surpresa", d: .1 }, { t: tSom + .75, e: "medo", d: .3 }, { t: tSom + 1.25, e: "tensao", d: .35 }], olhar: [{ t: 0, x: .55, y: -.3 }, { t: tFlash + .1, x: .9, y: -.1, d: .08 }, { t: tSom + .02, x: 1, y: -.2, d: .06 }, { t: tSom + .9, x: .65, y: .25, d: .08 }, { t: tSom + 1.3, x: .9, y: -.1, d: .08 }], giro: [{ t: 0, v: -.35 }, { t: tSom + .12, v: .75, d: .36 }, { t: tSom + 1.2, v: .35, d: .4 }], piscarEm: [tSom + .01], seed: 12 })];
  const script = `${push(id, 1, 1.06, "42% 40%")}
    tl.set("#${id}-fl", { opacity: .95 }, ${tFlash}); tl.to("#${id}-fl", { opacity: 0, duration: .55, ease: "power2.out" }, ${tFlash + .05});
    tl.fromTo("#${id}-ex", { opacity: 0, scale: .25, ...ORIG }, { opacity: .82, scale: 1, ...ORIG, duration: 1.3, ease: "power2.out", immediateRender: true }, ${tFlash + .02});
    tl.to("#${id}-ex", { scale: 1.22, opacity: .55, ...ORIG, duration: 1.2, ease: "none" }, ${tFlash + 1.35});`;
  writeFileSync(L(`compositions/${id}.html`), cena(id, dur, cena3, script, faixas));
  ev.push(evento(T0.s3 + tSom, "explosao_longe", { dist: .74, pan: .5, db: 5, origem: "cena 3: explosão vista antes, som chega 0,5 s depois" }), evento(T0.s3 + tSom + .1, "impacto_suave", { bus: "transicoes", dist: .4, pan: .3, db: -5, origem: "cena 3: pressão no peito" }), evento(T0.s3 + tSom + .05, "equipamento", { dist: .05, pan: -.2, db: -3, origem: "cena 3: ele se encolhe" }), evento(T0.s3 + tSom + .1, "pano", { dist: .05, pan: -.2, db: -1, origem: "cena 3: ombros sobem" }));
}

/* CENA 4: volta à ação. A sai, B olha para ele, reage e vai atrás. */
{
  const id = "s4", dur = D4, Y = 962, eA = 1.55, eB = 1.48, xA = 1120, xB = 560;
  const GA = gerar(MARCHA, dur + 4, { porta: true, S: MARCHA.S / eA }), GB = gerar(MARCHA, dur + 4, { S: MARCHA.S / eB });
  const tRA = .62, tRB = 1.42;
  const RA = pararERetomar(GA, MARCHA, { tR: tRA, dur: dur + .1, porta: true, idle: [{ t: .05, d: .3, dx: -2, tr: 2.5, hd: -2 }], seed: 9 });
  const RB = pararERetomar(GB, MARCHA, { tR: tRB, dur: dur + .1, idle: [{ t: .2, d: .3, tr: 1, hd: -1 }, { t: .95, d: .25, tr: 4, hd: -4 }], seed: 14 });
  const TB = somaCabeca(RB.T, (t) => -6 * Math.min(1, t / .25) * (1 - Math.min(1, Math.max(0, (t - 1) / .3))));
  const cam = seguir(RA.T.rtx.map((x) => xA + x * eA * .55), { telaX: xA, inicio: 0, lag: 3 });
  const corpo = `${ceu(id)}${fundoLonge(id)}${nevoa(id)}${campo(id, Y - 138)}${camada(`${id}-g`, `<rect x="-2000" y="${Y - 110}" width="11000" height="700" fill="${C.mu}"/><path d="${crista(23, Y - 120, 9, 11000, 80, -2000)}" fill="${C.mu}"/><rect x="-2000" y="${Y - 30}" width="11000" height="60" fill="${C.t}" opacity=".85"/>${personagem(`${id}-b`, B, { x: xB, y: Y - 14, e: eB, arma: "costas" })}${personagem(`${id}-a`, A, { x: xA, y: Y + 8, e: eA })}`)}${frente(id, 1130)}`;
  const faixas = [...camFaixas(id, cam, { g: 1 }), ...faixasCorpo(`${id}-a`, RA.T), ...faixasCorpo(`${id}-b`, TB), ...secundarios(`${id}-a`, RA.T), ...secundarios(`${id}-b`, TB),
    ...rosto(`${id}-a`, "perfil", dur + .1, { roteiro: [{ t: 0, e: "tensao" }, { t: tRA - .2, e: "determinacao", d: .22 }], olhar: [{ t: 0, x: -1, y: 0 }, { t: tRA - .3, x: 1, y: 0, d: .08 }], piscarEm: [tRA - .34], seed: 21 }),
    ...rosto(`${id}-b`, "perfil", dur + .1, { roteiro: [{ t: 0, e: "medo" }, { t: 1, e: "determinacao", d: .3 }], olhar: [{ t: 0, x: 1, y: -.25 }, { t: 1.05, x: .9, y: .1, d: .1 }], piscarEm: [.9], seed: 33 })];
  writeFileSync(L(`compositions/${id}.html`), cena(id, dur, corpo, `${push(id, 1, 1.04)} ${vivos(id)}`, faixas));
  ev.push(...passosDe("Soldado A", RA.T, { inicio: T0.s4, dist: .24, telaX: () => xA + 120, ate: dur }), ...passosDe("Soldado B", TB, { inicio: T0.s4, dist: .28, telaX: () => xB + 60, ate: dur, db: -1 }));
  ev.push(evento(T0.s4 + tRA - .1, "equipamento", { dist: .2, pan: .2, origem: "cena 4: A ajeita o fuzil e sai" }));
  qa.s4 = { deslizeA: deslizeEmApoio(RA.T), deslizeB: deslizeEmApoio(TB), ikA: +RA.stats.ik.toFixed(3), ikB: +RB.stats.ik.toFixed(3) };
}

/* CENA 5: documento. O texto datilografado gera uma tecla por caractere. */
{
  const id = "s5", dur = D5;
  const m = documento(id, dur, () => null, { cabecalho: "ARMISTICE", sub: "Compiègne, 11 November 1918", rotuloG: "", rotuloP: "" });
  const linhas = ["HOSTILITIES", "CEASE AT 11:00"], t0Txt = .55, dtk = .046; let spans = "", an = "", k = 0; const r = rng(4);
  linhas.forEach((l, i) => { [...l].forEach((ch, j) => { const tk = t0Txt + k * dtk + (r() - .5) * .012; spans += `<span id="${id}-q${i}_${j}" style="opacity:0">${ch === " " ? "&nbsp;" : ch}</span>`; an += `tl.set("#${id}-q${i}_${j}", { opacity: 1 }, ${tk.toFixed(3)});`; if (ch !== " ") ev.push(evento(T0.s5 + tk, "tecla", { bus: "efeitos", dist: .08, pan: .28, db: i * .5 - 1, amb: "interior", origem: `cena 5: letra "${ch}" apareceu` })); k++; }); spans += "<br>"; k += 2; });
  const tCar = t0Txt + k * dtk + .16;
  const corpo = `${m.corpo}
    <div id="${id}-tx" class="t-titulo" style="position:absolute;left:1196px;top:330px;width:640px;font-size:78px;line-height:1.14;letter-spacing:.02em;text-shadow:0 4px 0 rgba(30,26,22,.65)" data-layout-allow-overlap>${spans}</div>
    <div id="${id}-cb" style="position:absolute;left:760px;top:600px;width:300px;height:120px;transform-origin:50% 50%;opacity:0" data-layout-ignore><svg viewBox="0 0 300 120" class="cheio"><rect x="6" y="6" width="288" height="108" rx="6" fill="none" stroke="var(--vinho)" stroke-width="7" opacity=".85"/><text x="150" y="82" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="66" letter-spacing="5" fill="var(--vinho)" opacity=".85">SIGNED</text></svg></div>`;
  const script = `${m.script.replace(/tl\.to\("#s5-preto"[^\n]*\n/, "")}
    tl.to("#${id}-preto", { opacity: 1, duration: .62, ease: "sine.inOut" }, DUR - .64);
    tl.fromTo("#${id}-pap", { y: 640, rotation: 5 }, { y: 0, rotation: 0, duration: .55, ease: "power3.out" }, .18);
    ${an}
    tl.fromTo("#${id}-cb", { opacity: 0, scale: 1.5, rotation: -13 }, { opacity: 1, scale: 1, rotation: -9, duration: .09, ease: "power3.in" }, ${(tCar - .09).toFixed(3)});`;
  writeFileSync(L(`compositions/${id}.html`), cena(id, dur, corpo, script, [], DIS5));
  ev.push(evento(T0.s5 - .24, "whoosh", { bus: "transicoes", dist: .15, pan: -.1, db: -2, origem: "transição: antecede o corte" }), evento(T0.s5 + .28, "impacto_suave", { bus: "transicoes", dist: .1, db: -3, amb: "interior", origem: "transição: documento pousa" }), evento(T0.s5 + .2, "papel", { dist: .06, pan: -.15, amb: "interior", origem: "cena 5: papel entra" }), evento(T0.s5 + tCar, "carimbo", { dist: .05, pan: -.12, amb: "interior", origem: "cena 5: carimbo toca o papel" }));
  qa.s5 = { caracteres: k };
}

/* overlay e raiz */
let s = 4242; const rd = () => (s = (s * 16807) % 2147483647) / 2147483647; let grao = ""; for (let i = 0; i < TOT * 12; i++) grao += `tl.set("#grao",{x:${Math.round(rd() * 512 - 256)},y:${Math.round(rd() * 512 - 256)}},${(i / 12).toFixed(3)});`;
writeFileSync(L("compositions/overlay.html"), `<template><style>#root { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }</style><div id="root" data-composition-id="overlay" data-width="1920" data-height="1080" data-layout-ignore data-layout-allow-overflow><div id="grao"></div><div id="vinheta"></div></div><script>(function () { const tl = gsap.timeline({ paused: true }); ${grao} tl.set({}, {}, ${TOT.toFixed(3)}); window.__timelines["overlay"] = tl; })();</script></template>\n`);
const FONT = readFileSync(new URL("ampulheta/index.html", est), "utf8").match(/<style>(@font-face.*?)<\/style>/s)[1];
const cenas = [["s1", T0.s1, D1], ["s2", T0.s2, D2], ["s3", T0.s3, D3], ["s4", T0.s4, D4], ["s5", T0.s5, D5]];
writeFileSync(L("index.html"), `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><link rel="stylesheet" href="design-system.css"/><style>${FONT}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOT.toFixed(3)}" data-width="1920" data-height="1080">
${cenas.map(([c, t, d], i) => `<div id="${c}" data-composition-id="${c}" data-composition-src="compositions/${c}.html" data-start="${t.toFixed(3)}" data-duration="${d.toFixed(3)}" data-track-index="${i % 2 + 1}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join("\n")}
<div id="overlay" data-composition-id="overlay" data-composition-src="compositions/overlay.html" data-start="0" data-duration="${TOT.toFixed(3)}" data-track-index="5" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:100"></div>
<audio id="mix" class="clip" src="assets/audio/mix.wav" data-start="0" data-duration="${TOT.toFixed(3)}" data-track-index="6" data-volume="1"></audio>
</div><script>window.__timelines["main"] = gsap.timeline({ paused: true });</script></body></html>`);

/* plano de mixagem: canais, ambiência contínua entre cortes, música que acompanha o acontecimento */
const tExp = T0.s3 + tSom;
const plano = { duracao: TOT, ambiente: "campo", lufs: -16,
  voz: VOZ ? [{ t: .35, arquivo: "assets/audio/voz/l1.mp3" }, { t: T0.s5 + .62, arquivo: "assets/audio/voz/l2.mp3" }] : [],
  ambientes: [{ som: "vento", ini: 0, fim: T0.s5 + .1, db: -12, fade: .5, off: 12, corte: 9000 }, { som: "fogo", ini: T0.s2, fim: T0.s5, db: -26, fade: .8, off: 4, corte: 3000 }, { som: "interior_sala", ini: T0.s5, fim: TOT, db: -24, fade: .35, off: 2, corte: 5000 }].filter(Boolean),
  musica: { som: "trilha_tensao", off: 14, corte: 5000, automacao: [[0, -60], [.9, -15], [T0.s2, -14], [T0.s3, -11], [tExp - .06, -9], [tExp + .02, -22], [tExp + .9, -9], [T0.s4 + 1, -9], [T0.s5, -12], [TOT - 1.2, -15], [TOT - .1, -70]] },
  eventos: ev.sort((a, b) => a.t - b.t) };
writeFileSync(L("plano_audio.json"), JSON.stringify(plano, null, 1));
writeFileSync(L("qa_build.json"), JSON.stringify({ TOT, T0, D: [D1, D2, D3, D4, D5], qa, eventos: ev.length }, null, 1));
console.log("total", TOT.toFixed(2), JSON.stringify(T0), JSON.stringify(qa), "eventos", ev.length);
