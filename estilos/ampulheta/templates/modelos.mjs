// ETAPA 4: os 7 modelos. Cada função recebe dados e devolve {corpo, script}.
import { rng, crista, tufos, arvorePartida, ruina, arame, fumaca, passaro } from "./base.mjs";
import { MARCHA, CORRIDA, gerar, arrancada, tabelasJS } from "./locomocao.mjs";

export const QA_MOV = {};

const C = { p: "var(--pergaminho)", oc: "var(--ocre)", t: "var(--terra)", v: "var(--vinho)", an: "var(--azul-noite)", ol: "var(--oliva)", s: "var(--sombra)", l: "var(--luz)", cr: "var(--creme)", m: "var(--mar)", tc: "var(--terra-clara)", mu: "var(--musgo)" };

/* Personagem: boneco de papel, rosto mínimo, só translação e rotação. Origem no quadril; o chão fica no y do grupo externo. */
export function soldado(pre, { x = 0, y = 0, e = 1, frente = C.ol, tras = C.mu, porta = false }) {
  const perna = (ca, ja, pa, cor, bota) => `<g id="${pre}-${ca}"><path fill="${cor}" d="M-14,-4 L14,-4 L11,78 L-10,78 Z"/><circle cx="0" cy="76" r="10.5" fill="${cor}"/><g transform="translate(0,76)"><g id="${pre}-${ja}"><path fill="${bota}" d="M-10,-2 L10,-2 L8,67 L-8,67 Z"/><g transform="translate(0,66)"><g id="${pre}-${pa}"><path fill="${C.s}" d="M-9,-3 L9,-3 L10,5 L24,9 Q31,12 30,18 L-9,18 Z"/></g></g></g></g></g>`;
  const braco = (b, a, cor) => `<g transform="translate(2,-112)"><g id="${pre}-${b}"><path fill="${cor}" d="M-11,-5 L11,-5 L9,52 L-8,52 Z"/><circle cx="0" cy="50" r="8.5" fill="${cor}"/><g transform="translate(0,50)"><g id="${pre}-${a}"><path fill="${cor}" d="M-8,0 L9,0 L7,46 L-6,46 Z"/><circle cx="0" cy="52" r="9" fill="${C.oc}"/></g></g></g></g>`;
  const arma = `<path fill="${C.t}" d="M-92,-8 L-44,-5 L70,-5 L70,3 L-40,3 L-90,12 Z"/><rect x="68" y="-4" width="44" height="6" fill="${C.s}"/>`;
  const fuzil = porta
    ? `<g transform="translate(16,-62) rotate(-30)"><g id="${pre}-fz">${arma}</g></g>`
    : `<g transform="translate(-30,-108) rotate(-66)"><g id="${pre}-fz">${arma}</g></g>`;
  return `<g transform="translate(${x},${y}) scale(${e})"><g id="${pre}-rt">
    ${perna("cb", "jb", "pb", tras, C.s)}
    <g id="${pre}-tr">
      ${braco("bt", "at", tras)}
      ${porta ? "" : fuzil}
      <g transform="translate(-36,-118)"><g id="${pre}-mc"><rect x="-18" y="0" width="32" height="74" rx="7" fill="${C.t}"/><rect x="-16" y="-16" width="36" height="17" rx="8" fill="${C.oc}"/></g></g>
      <path fill="${frente}" d="M-25,-4 L26,-4 L26,-8 L24,-118 Q20,-136 0,-138 Q-22,-136 -27,-116 L-24,-8 Z"/>
      <rect x="-8" y="-150" width="17" height="20" fill="${C.oc}"/>
      <g transform="translate(2,-146)"><g id="${pre}-hd">
        <path fill="${C.l}" d="M-16,-2 Q-20,-36 0,-38 Q20,-39 20,-25 L27,-17 L20,-13 Q20,-1 8,0 Z"/>
        <circle cx="13" cy="-19" r="2.6" fill="${C.s}"/><path d="M11,-7 L18,-8" stroke="${C.s}" stroke-width="2"/>
        <ellipse cx="0" cy="-27" rx="35" ry="5" fill="${C.mu}"/><path fill="${C.mu}" d="M-22,-29 Q-20,-52 2,-52 Q24,-52 24,-29 Z"/><path fill="${C.ol}" d="M4,-49 Q18,-47 20,-31 L8,-31 Z"/>
      </g></g>
    </g>
    ${perna("ca", "ja", "pa", frente, C.mu)}
    <g id="${pre}-sa"><path fill="${frente}" d="M-31,30 L31,30 L26,-8 L-25,-8 Z"/><rect x="-26" y="-16" width="52" height="10" fill="${C.s}"/><rect x="6" y="-14" width="17" height="22" fill="${C.t}"/></g>
    <g id="${pre}-tr2">
      ${porta ? fuzil : ""}
      ${braco("bf", "af", frente)}
    </g>
  </g></g>`;
}

/* 1. CenaIlustrada: SVG em 3 a 5 camadas, push-in e parallax. */
export function cenaCampo(id, dur, cue, lt) {
  const sold = [{ k: "a", x: 300, e: .96, f: 0, b: 836 }, { k: "b", x: 590, e: 1.02, f: .28, b: 844 }, { k: "g", x: 930, e: 1.12, f: .55, b: 866 }, { k: "d", x: 1290, e: .98, f: .8, b: 830 }].map((s) => ({ ...s, y: s.b, x: s.x - 120 }));
  const VTELA = MARCHA.S / MARCHA.T, ACOMP = VTELA * dur * .84;
  const corpo = `
    <div id="${id}-c0" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <defs><linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".5" stop-color="${C.oc}"/><stop offset=".72" stop-color="${C.l}"/></linearGradient>
      <radialGradient id="${id}-sol"><stop offset="0" stop-color="${C.cr}" stop-opacity=".95"/><stop offset=".22" stop-color="${C.l}" stop-opacity=".7"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs>
      <rect x="-100" y="-100" width="2120" height="1280" fill="url(#${id}-ceu)"/><circle cx="1320" cy="600" r="430" fill="url(#${id}-sol)"/>
    </svg></div>
    <div id="${id}-c1" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <path d="${crista(3, 670, 34)}" fill="${C.ol}" opacity=".42"/>
      ${ruina(1450, 690, 1.05, C.t, C.oc)}${ruina(300, 690, .78, C.t, C.oc)}
      <path d="${crista(8, 720, 22)}" fill="${C.ol}" opacity=".7"/>
      ${fumaca(`${id}-f1`, 1710, 720, .9, C.s, .4)}${fumaca(`${id}-f2`, 140, 730, .68, C.s, .32)}
    </svg></div>
    <div id="${id}-nv" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080"><defs><linearGradient id="${id}-nb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.p}" stop-opacity="0"/><stop offset=".5" stop-color="${C.p}" stop-opacity=".62"/><stop offset="1" stop-color="${C.p}" stop-opacity="0"/></linearGradient></defs><rect x="-200" y="600" width="2500" height="210" fill="url(#${id}-nb)"/></svg></div>
    <div id="${id}-c2" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      ${arvorePartida(240, 800, 1.35, C.t)}${arvorePartida(1630, 800, 1.65, C.t)}${arvorePartida(1060, 780, .86, C.t)}${arvorePartida(2300, 790, 1.2, C.t)}${arvorePartida(2840, 800, 1.5, C.t)}
      <path d="${crista(14, 770, 16, 3800, 26)}" fill="${C.mu}"/>
      ${arame(-20, 3400, 800, 240, C.s)}
      <ellipse cx="2400" cy="890" rx="150" ry="17" fill="${C.t}"/>
      <ellipse cx="1500" cy="880" rx="170" ry="20" fill="${C.t}"/><ellipse cx="460" cy="900" rx="140" ry="16" fill="${C.t}"/>
      <g id="${id}-ps" transform="translate(-40,320)">${passaro(`${id}-pa`, C.s)}</g>
      ${sold.map((s) => soldado(`${id}-${s.k}`, { x: s.x, y: s.y, e: s.e })).join("")}
    </svg></div>
    <div id="${id}-c3" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <path d="${crista(21, 1000, 30, 4200, 30)}" fill="${C.s}"/>
      <g id="${id}-tf">${tufos(4, 84, -100, 3900, 970, 74, C.s)}</g>
    </svg></div>
    ${lt ? lowerThird(id, lt) : ""}`;
  let s = `
    tl.fromTo("#${id}-c0", { scale: 1.02 }, { scale: 1.05, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-c1", { scale: 1.03, x: 10 }, { scale: 1.07, x: ${(10 - ACOMP * .12).toFixed(1)}, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-nv", { x: -160 }, { x: 80, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-c2", { scale: 1.03, x: 30 }, { scale: 1.09, x: ${(30 - ACOMP).toFixed(1)}, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-c3", { scale: 1.06, x: 60 }, { scale: 1.14, x: ${(60 - ACOMP * 1.3).toFixed(1)}, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-f1", { scale: .9, y: 0, ...ORIG }, { scale: 1.1, y: -34, ...ORIG, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-f2", { scale: .95, y: 0, ...ORIG }, { scale: 1.12, y: -26, ...ORIG, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-ps", { attr: { transform: "translate(-40,330)" } }, { attr: { transform: "translate(1980,240)" }, duration: DUR * 1.05, ease: "none" }, 0);
    osc("#${id}-pa-a", { scaleY: 1 }, { scaleY: -.4, ...ORIG }, .34, 0, DUR);
    osc("#${id}-tf", { skewX: -1.2 }, { skewX: 1.2, ...ORIG }, 2.6, 0, DUR);
`;
  for (const so of sold) { const g = gerar(MARCHA, dur + .05, { fase: so.f, S: MARCHA.S / so.e }); QA_MOV[`marcha_${so.k}`] = g.qa; s += `    ${tabelasJS(`${id}-${so.k}`, g)}\n`; }
  if (lt) s += lowerThirdAnim(id, cue(lt.palavra) ?? .25);
  return { corpo, script: s };
}

export function cenaCorrida(id, dur, cue) {
  const levanta = cue("levanta"), parte = levanta + .46, porque = cue("Por");
  const E = 1.5, GX = 640, CHAO = 868; // y do chão sob ele
  const PAR2 = .56, VRUN = CORRIDA.S / CORRIDA.T * E, dFim = VRUN * (dur - parte), BX = Math.round(1180 + dFim * PAR2);
  const corpo = `
    <div id="${id}-c0" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <defs><linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".48" stop-color="${C.oc}"/><stop offset=".7" stop-color="${C.l}"/></linearGradient>
      <radialGradient id="${id}-sol"><stop offset="0" stop-color="${C.cr}" stop-opacity=".95"/><stop offset=".22" stop-color="${C.l}" stop-opacity=".7"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs>
      <rect x="-200" y="-100" width="2400" height="1280" fill="url(#${id}-ceu)"/><circle cx="1240" cy="620" r="430" fill="url(#${id}-sol)"/>
    </svg></div>
    <div id="${id}-c1" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080"><path d="${crista(5, 650, 30, 3800, 24)}" fill="${C.ol}" opacity=".5"/>${fumaca(`${id}-f1`, 1560, 690, .84, C.s, .36)}</svg></div>
    <div id="${id}-c2" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      ${arvorePartida(420, 740, 1.2, C.t)}${arvorePartida(1120, 740, .9, C.t)}
      <path d="${crista(9, 720, 14, 6400, 36)}" fill="${C.mu}"/>
      ${ruina(BX + 250, 730, 1.3, C.t, C.oc)}
      <g id="${id}-barr" transform="translate(${BX},732) scale(1.7)">
        <path fill="${C.s}" d="M-128,10 L-112,-30 L-58,-34 L-44,-66 L46,-68 L60,-30 L132,-36 L150,10 Z"/>
        <path d="M-108,-16 L128,-44 M-118,0 L142,-14" stroke="${C.t}" stroke-width="9"/>
        <path d="M-70,10 L-30,-72 M74,10 L30,-74" stroke="${C.s}" stroke-width="11"/>
        <circle cx="-88" cy="-22" r="24" fill="none" stroke="${C.s}" stroke-width="6"/><path d="M-88,-46 L-88,2 M-112,-22 L-64,-22" stroke="${C.s}" stroke-width="4"/>
        <g transform="translate(-8,-68)"><path fill="${C.s}" d="M-22,0 L-22,-16 Q-22,-34 0,-34 Q22,-34 24,-14 L30,-8 L30,0 Z"/></g>
        <g transform="translate(46,-66)"><path fill="${C.s}" d="M-18,0 L-18,-12 Q-18,-28 0,-28 Q18,-28 20,-12 L25,-6 L25,0 Z"/></g>
        <path d="M18,-72 L-60,-80" stroke="${C.s}" stroke-width="6"/>
      </g>
      <path d="${crista(31, 768, 8, 6400, 36)}" fill="${C.t}"/>
    </svg></div>
    <div id="${id}-c3" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <rect x="-300" y="868" width="7200" height="400" fill="${C.t}"/>
      <path d="${crista(41, 884, 10, 7200, 52, -300)}" fill="${C.mu}"/>
      ${arame(560, 6400, 856, 420, C.s)}
      ${agachado(`${id}-k1`, 96, 866)}${agachado(`${id}-k2`, 330, 876)}
    </svg></div>
    <div id="${id}-cg" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${soldado(`${id}-g`, { x: GX, y: CHAO, e: E, porta: true, frente: C.ol, tras: C.mu })}</svg></div>
    <div id="${id}-c4" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">
      <path id="${id}-mond" fill="${C.s}" d="M-280,1250 L-280,840 Q120,790 420,818 Q660,834 820,884 Q980,960 1300,1006 Q2600,1012 9000,1020 L9000,1250 Z"/>
      <g id="${id}-tf">${tufos(13, 130, -200, 8800, 996, 80, C.s)}</g>
    </svg></div>`;
  const mov = arrancada(dur + .05, levanta, parte); QA_MOV.corrida = mov.qa;
  const mundo = [["c3", 1], ["c4", 1.5], ["c2", PAR2], ["c1", .1]];
  const script = `
    ${tabelasJS(`${id}-g`, mov)}
    ${mundo.map(([c, k]) => `tl.fromTo("#${id}-${c}", { x: 0 }, { x: ${(-dFim * k).toFixed(1)}, duration: ${(dur - parte).toFixed(3)}, ease: "none" }, ${parte.toFixed(3)});`).join("\n    ")}
    // push-in contínuo sobre todas as camadas
    tl.fromTo("#${id}-w", { scale: 1, transformOrigin: "42% 66%" }, { scale: 1.08, transformOrigin: "42% 66%", duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-c0", { x: 0 }, { x: -20, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-f1", { scale: .9, y: 0, ...ORIG }, { scale: 1.1, y: -26, ...ORIG, duration: DUR, ease: "none" }, 0);
    osc("#${id}-tf", { skewX: -1.2 }, { skewX: 1.2, ...ORIG }, 2.4, 0, DUR);
    osc("#${id}-k1-tr", { rotation: 16 }, { rotation: 19, ...ORIG }, 2.2, 0, DUR);
    osc("#${id}-k2-tr", { rotation: 13 }, { rotation: 17, ...ORIG }, 2.6, 0, DUR);
    tl.to("#${id}-preto", { opacity: 1, duration: 1, ease: "sine.inOut" }, DUR - 1.02);
`;
  return { corpo, script, porque };
}

// Soldado que fica abaixado, atrás do monte, na cena da corrida.
function agachado(pre, x, y) {
  return `<g transform="translate(${x},${y}) scale(1.5)"><g id="${pre}-tr">
    <rect x="-54" y="-118" width="32" height="74" rx="7" fill="${C.t}"/>
    <path fill="${C.mu}" d="M-30,28 L30,28 L26,-8 L24,-118 Q20,-136 0,-138 Q-22,-136 -27,-116 L-24,-8 Z"/>
    <rect x="-8" y="-150" width="17" height="20" fill="${C.oc}"/>
    <g transform="translate(2,-146)"><path fill="${C.l}" d="M-16,-2 Q-20,-36 0,-38 Q20,-39 20,-25 L27,-17 L20,-13 Q20,-1 8,0 Z"/><circle cx="13" cy="-19" r="2.6" fill="${C.s}"/><ellipse cx="0" cy="-27" rx="35" ry="5" fill="${C.mu}"/><path fill="${C.mu}" d="M-22,-29 Q-20,-52 2,-52 Q24,-52 24,-29 Z"/></g>
  </g></g>`;
}

/* 2. Mapa: pergaminho, relevo em ícones, pin com pulso, rota por dashoffset, contador de ano. */
export function mapaSVG(id, M, { rota = false, pins = [], rotulos = [] }) {
  const monte = ([x, y]) => `<g transform="translate(${x},${y})"><path d="M-22,12 L0,-22 L22,12 Z" fill="${C.oc}"/><path d="M0,-22 L22,12 L4,12 L-2,-4 Z" fill="${C.t}" opacity=".55"/></g>`;
  const local = (k) => M.locais[k];
  return `<svg viewBox="0 0 ${M.W} ${M.H}" class="cheio" data-layout-ignore>
    <defs><linearGradient id="${id}-pg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C.m}"/><stop offset="1" stop-color="${C.m}"/></linearGradient></defs>
    <rect x="-100" y="-100" width="${M.W + 200}" height="${M.H + 200}" fill="url(#${id}-pg)"/>
    <path d="${M.terra}" fill="${C.tc}" stroke="${C.t}" stroke-width="2.5" stroke-opacity=".5"/>
    ${M.rios.map((d) => `<path d="${d}" fill="none" stroke="${C.m}" stroke-width="3.5"/>`).join("")}
    ${M.relevo.map(monte).join("")}
    ${M.regioes.map((r) => `<text x="${r.p[0]}" y="${r.p[1]}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="500" font-size="${r.g * 1.2}" letter-spacing="14" fill="${C.t}" opacity=".6">${r.rotulo}</text>`).join("")}
    ${rota ? `<path id="${id}-rt1" d="${M.rota}" fill="none" stroke="${C.s}" stroke-width="15" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/><path id="${id}-rt2" d="${M.rota}" fill="none" stroke="${C.v}" stroke-width="8" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/>` : ""}
    ${pins.map((k) => { const [x, y] = local(k).p; return `<g transform="translate(${x},${y})"><circle id="${id}-${k}-pulso" r="18" fill="none" stroke="${C.v}" stroke-width="5" opacity="0"/><g id="${id}-${k}-pin" opacity="0"><circle r="15" fill="${C.v}" stroke="${C.s}" stroke-width="4"/><circle r="5" fill="${C.cr}"/></g></g>`; }).join("")}
    ${rotulos.map(({ k, dx = 26, dy = 12, anchor = "start", g = 40 }) => { const [x, y] = local(k).p; return `<text id="${id}-${k}-rot" x="${x + dx}" y="${y + dy}" text-anchor="${anchor}" font-family="Titulo Ampulheta" font-weight="600" font-size="${g}" letter-spacing="3" fill="${C.s}" opacity="0">${local(k).rotulo}</text>`; }).join("")}
  </svg>`;
}

const camMapa = (M, k, esc) => { const [x, y] = M.locais[k].p; return { x: 960 - x * esc, y: 540 - y * esc, scale: esc }; };
const pulso = (id, k, t) => `
    tl.fromTo("#${id}-${k}-pin", { opacity: 0, scale: .4, ...ORIG }, { opacity: 1, scale: 1, ...ORIG, duration: .3, ease: "back.out(2)" }, ${t.toFixed(3)});
    tl.fromTo("#${id}-${k}-rot", { opacity: 0 }, { opacity: 1, duration: .35 }, ${(t + .08).toFixed(3)});
    for (let i = 0; i < 3; i++) tl.fromTo("#${id}-${k}-pulso", { scale: 1, opacity: .9, ...ORIG }, { scale: 4, opacity: 0, ...ORIG, duration: 1.1, ease: "sine.out", immediateRender: false }, ${t.toFixed(3)} + i * .85);`;

export function mapaAbertura(id, dur, cue, M) {
  const anos = [1914, 1915, 1916, 1917, 1918];
  const corpo = `
    <div id="${id}-m" style="position:absolute;left:0;top:0;width:${M.W}px;height:${M.H}px" data-layout-ignore>${mapaSVG(id, M, { pins: ["compiegne"], rotulos: [{ k: "compiegne", g: 46 }, { k: "paris", g: 34, dx: 10, dy: 2 }] })}</div>
    <div class="ano-caixa" data-layout-ignore>${anos.map((a) => `<span id="${id}-a${a}">${a}</span>`).join("")}</div>
    <div id="${id}-mes" class="ano-mes">NOVEMBRO</div>`;
  const ini = camMapa(M, "compiegne", 1.1), med = camMapa(M, "compiegne", 1.32), fim = camMapa(M, "compiegne", 2.6), t = cue("Compiègne");
  const script = `
    tl.set("#${id}-m", { transformOrigin: "0 0" }, 0);
    tl.fromTo("#${id}-m", { x: ${ini.x}, y: ${ini.y}, scale: ${ini.scale} }, { x: ${med.x}, y: ${med.y}, scale: ${med.scale}, duration: ${(t + .7).toFixed(3)}, ease: "none" }, 0);
    tl.to("#${id}-m", { x: ${fim.x}, y: ${fim.y}, scale: ${fim.scale}, duration: ${(dur - t - .7).toFixed(3)}, ease: "sine.inOut" }, ${(t + .7).toFixed(3)});
    ${anos.map((a, i) => `tl.set("#${id}-a${a}", { opacity: 1 }, ${(i * .17).toFixed(2)}); ${i < 4 ? `tl.set("#${id}-a${a}", { opacity: 0 }, ${((i + 1) * .17).toFixed(2)});` : ""}`).join("\n    ")}
    tl.fromTo("#${id}-mes", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: .3 }, .75);
    tl.fromTo("#${id}-paris-rot", { opacity: 0 }, { opacity: .75, duration: .4 }, .3);
    ${pulso(id, "compiegne", t)}
`;
  return { corpo, script };
}

/* 3. CartelaCapitulo */
// Letter-spacing fechando sem reflow: cada letra é um elemento e anda em x até o lugar.
const letras = (pre, txt) => [...txt].map((ch, i) => `<span id="${pre}${i}" style="display:inline-block">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
const fechar = (pre, txt, k, d, t) => { const n = [...txt].length, m = (n - 1) / 2; return [...txt].map((_, i) => `tl.fromTo("#${pre}${i}", { x: ${((i - m) * k).toFixed(1)} }, { x: 0, duration: ${d}, ease: "power2.out" }, ${t});`).join(" "); };
export function cartela(id, dur, cue, M, cap, titulo) {
  const c0 = camMapa(M, "chaumont", 1.3), cam = { ...c0, y: c0.y - 250 };
  const corpo = `
    <div id="${id}-m" style="position:absolute;left:0;top:0;width:${M.W}px;height:${M.H}px" data-layout-ignore>${mapaSVG(id, M, { rota: true, pins: ["compiegne", "chaumont"], rotulos: [] })}</div>
    <div class="preto" style="opacity:.6" data-layout-ignore></div>
    <div class="cart" data-layout-allow-overlap><div id="${id}-cap" class="cart-cap t-versalete">${letras(id + "-cc", "Capítulo " + cap)}</div>
      <div class="cart-linha" data-layout-ignore><i id="${id}-ln"></i><b id="${id}-lo"></b></div>
      <div id="${id}-tt" class="cart-tit t-titulo">${letras(id + "-ct", titulo)}</div></div>`;
  const script = `
    tl.set("#${id}-m", { transformOrigin: "0 0" }, 0);
    tl.fromTo("#${id}-m", { x: ${cam.x + 120}, y: ${cam.y + 26}, scale: ${cam.scale} }, { x: ${cam.x}, y: ${cam.y}, scale: ${cam.scale * 1.04}, duration: DUR, ease: "none" }, 0);
    tl.fromTo(["#${id}-rt1","#${id}-rt2"], { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: DUR * .85, ease: "sine.inOut" }, .12);
    tl.set(["#${id}-compiegne-pin","#${id}-chaumont-pin"], { opacity: 1 }, 0);
    ${fechar(`${id}-cc`, `Capítulo ${cap}`, 18, .8, .3)}
    tl.fromTo("#${id}-cap", { opacity: 0 }, { opacity: 1, duration: .5 }, .3);
    tl.fromTo("#${id}-ln", { scaleX: 0 }, { scaleX: 1, duration: .7, ease: "power2.out" }, .45);
    tl.fromTo("#${id}-lo", { rotation: 45, scale: 0 }, { rotation: 45, scale: 1, duration: .35, ease: "back.out(2)" }, .45);
    ${fechar(`${id}-ct`, titulo, 11, .9, .55)}
    tl.fromTo("#${id}-tt", { opacity: 0 }, { opacity: 1, duration: .55 }, .55);
`;
  return { corpo, script };
}

/* 4. NumeroGigante, com relógio */
export function numero(id, dur, cue, { menos, n, unidade, apoio }) {
  const marcas = Array.from({ length: 12 }, (_, i) => `<rect x="-3" y="-214" width="6" height="${i % 3 === 0 ? 34 : 20}" fill="${C.p}" transform="rotate(${i * 30})"/>`).join("");
  const corpo = `
    <div id="${id}-fundo" class="camada" style="background:var(--azul-noite)" data-layout-ignore></div>
    <div class="camada" id="${id}-rel" data-layout-ignore><svg viewBox="0 0 1920 1080"><g transform="translate(1400,540)">
      <circle r="250" fill="${C.s}"/><circle r="232" fill="${C.t}"/><circle r="222" fill="${C.s}"/>${marcas}
      <g id="${id}-hh" transform="rotate(330)"><rect x="-8" y="-118" width="16" height="130" fill="${C.cr}"/></g>
      <g id="${id}-hm" transform="rotate(350)"><rect x="-5" y="-186" width="10" height="200" fill="${C.cr}"/></g>
      <g id="${id}-hs"><rect x="-2" y="-200" width="4" height="240" fill="${C.v}"/></g><circle r="13" fill="${C.v}"/>
    </g></svg></div>
    <div id="${id}-me" class="num-menos t-titulo">${menos}</div>
    <div id="${id}-gr" class="num-grande" data-layout-allow-overlap><span class="num-n t-titulo">${n}</span><span class="num-u t-titulo">${unidade}</span></div>
    <div id="${id}-ap" class="num-apoio t-apoio">${apoio}</div>`;
  const tn = cue("dois"), ta = cue("para") ?? dur - 1.8;
  let s = `
    tl.fromTo("#${id}-w", { scale: 1 }, { scale: 1.06, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-me", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3 }, ${(tn - .42).toFixed(3)});
    tl.fromTo("#${id}-gr", { opacity: 0, scale: .9, transformOrigin: "0% 60%" }, { opacity: 1, scale: 1, duration: .38, ease: "power3.out" }, ${(tn - .04).toFixed(3)});
    tl.fromTo("#${id}-ap", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .3 }, ${(ta - .1).toFixed(3)});
    tl.fromTo("#${id}-rel", { opacity: 0 }, { opacity: 1, duration: .4 }, 0);
`;
  for (let i = 0; i < Math.floor(dur) + 1; i++) s += `    tl.to("#${id}-hs", { rotation: ${(i + 1) * 6}, ...ORIG, duration: .12, ease: "back.out(3)" }, ${i}.0);\n`;
  return { corpo, script: s };
}

/* 5. LowerThird */
export function lowerThird(id, { titulo, sub, ano }) {
  return `<div id="${id}-lt" class="lt"><div class="lt-titulo t-titulo">${titulo}</div><div class="lt-sub t-apoio">${sub}</div></div>
    <div id="${id}-lta" class="lt-ano">${ano}</div>`;
}
export const lowerThirdAnim = (id, t) => `
    tl.fromTo("#${id}-lt", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .45, ease: "power2.out" }, ${t.toFixed(3)});
    tl.fromTo("#${id}-lta", { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: .45, ease: "power2.out" }, ${(t + .1).toFixed(3)});
    tl.to("#${id}-lt", { opacity: 0, duration: .35 }, DUR - .55);
    tl.to("#${id}-lta", { opacity: 0, duration: .35 }, DUR - .55);
`;

/* 6. Documento */
export function documento(id, dur, cue, { cabecalho, sub, rotuloG, rotuloP }) {
  const r = rng(29); let linhas = "", anim = "";
  const L = 9, y0 = 330;
  for (let i = 0; i < L; i++) {
    const w = 520 - (i === L - 1 ? 230 : r() * 70), y = y0 + i * 46;
    let d = `M0,0`; for (let x = 16; x < w; x += 14 + r() * 26) d += ` M${x.toFixed(0)},0 L${(x + 8 + r() * 18).toFixed(0)},0`;
    linhas += `<g transform="translate(120,${y})"><rect id="${id}-l${i}" x="0" y="-3" width="${w.toFixed(0)}" height="6" fill="${C.t}" opacity=".78" style="transform-box:fill-box"/></g>`;
    anim += `    tl.fromTo("#${id}-l${i}", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: .16, ease: "none" }, ${(.1 + i * .17).toFixed(3)});\n`;
  }
  const mesa = Array.from({ length: 6 }, (_, i) => `<rect x="-200" y="${-100 + i * 240}" width="2400" height="232" fill="${C.t}"/><rect x="-200" y="${132 + i * 240 - 100}" width="2400" height="8" fill="${C.s}" opacity=".6"/>`).join("");
  const veio = (() => { const q = rng(5); let s = ""; for (let i = 0; i < 44; i++) { const x = q() * 2200 - 150, y = q() * 1200 - 60, w = 120 + q() * 380; s += `<path d="M${x.toFixed(0)},${y.toFixed(0)} q${(w / 2).toFixed(0)},${(6 - q() * 12).toFixed(0)} ${w.toFixed(0)},0" stroke="${C.s}" stroke-width="2" fill="none" opacity=".2"/>`; } return s; })();
  const corpo = `
    <div id="${id}-mesa" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${mesa}${veio}</svg></div>
    <div id="${id}-pap" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080"><g transform="translate(310,70) rotate(-2.2)">
      <rect x="16" y="22" width="760" height="950" fill="${C.s}" opacity=".5"/>
      <path fill="${C.p}" d="M0,0 L752,-4 L758,944 L4,950 Z"/>
      <path d="M0,0 L752,-4 L758,944 L620,948 Q690,500 700,0 Z" fill="${C.tc}" opacity=".6"/>
      <text x="376" y="118" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="58" letter-spacing="4" fill="${C.s}">${cabecalho}</text>
      <text x="376" y="184" text-anchor="middle" font-family="Apoio Ampulheta" font-style="italic" font-size="42" fill="${C.t}">${sub}</text>
      <rect x="240" y="222" width="272" height="3" fill="${C.t}"/>
      ${linhas}
      <path id="${id}-ass" d="M150,812 C186,744 214,744 214,800 C214,852 182,850 208,796 C238,744 262,800 288,786 C320,770 318,814 352,796 C392,776 412,804 470,778" fill="none" stroke="${C.s}" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/>
      <g transform="translate(610,830)"><g id="${id}-lac"><path fill="${C.v}" d="M-40,20 L-54,160 L-20,136 L-4,166 L10,26 Z"/><path fill="${C.v}" d="M14,18 L34,158 L58,130 L84,154 L52,10 Z"/><path fill="${C.v}" d="M0,-66 L24,-58 L50,-62 L60,-36 L72,-10 L58,14 L52,44 L24,48 L0,62 L-24,48 L-52,44 L-58,14 L-72,-10 L-60,-36 L-50,-62 L-24,-58 Z"/><circle r="34" fill="none" stroke="${C.s}" stroke-width="3" opacity=".5"/></g></g>
    </g></svg></div>
    <div id="${id}-rt" class="doc-rot" data-layout-allow-overlap><div class="doc-rot-g t-titulo">${rotuloG}</div><div class="doc-rot-p t-apoio">${rotuloP}</div></div>`;
  const tr = cue("onze") ?? dur * .6;
  const script = `
    tl.fromTo("#${id}-mesa", { scale: 1.03 }, { scale: 1.07, duration: DUR, ease: "none" }, 0);
    tl.fromTo("#${id}-pap", { scale: 1, x: 0 }, { scale: 1.08, x: -24, duration: DUR, ease: "none" }, 0);
${anim}
    tl.fromTo("#${id}-ass", { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: .7, ease: "sine.inOut" }, ${(.1 + L * .17).toFixed(3)});
    tl.fromTo("#${id}-lac", { y: -20, opacity: 0, rotation: -8, ...ORIG }, { y: 0, opacity: 1, rotation: 0, ...ORIG, duration: .26, ease: "power3.in" }, ${(.1 + L * .17 + .62).toFixed(3)});
    tl.fromTo("#${id}-rt", { opacity: 0, x: 22 }, { opacity: 1, x: 0, duration: .4, ease: "power2.out" }, ${(tr - .04).toFixed(3)});
    tl.to("#${id}-preto", { opacity: 1, duration: 1, ease: "sine.inOut" }, DUR - 1.02);
`;
  return { corpo, script };
}

/* 7. CitacaoCard, sobre cena escurecida */
export function citacao(id, dur, cue, fundo, { linhas, sub }) {
  const r = rng(77); const W = 780, H = 480;
  const borda = (x0, y0, x1, y1, n, a) => { let d = ""; for (let i = 1; i <= n; i++) { const t = i / n; d += ` L${(x0 + (x1 - x0) * t + (r() - .5) * a * (y0 === y1 ? 0 : 1)).toFixed(0)},${(y0 + (y1 - y0) * t + (r() - .5) * a * (x0 === x1 ? 0 : 1)).toFixed(0)}`; } return d; };
  const rasgo = `M0,0${borda(0, 0, W, 0, 34, 14)}${borda(W, 0, W, H, 22, 14)}${borda(W, H, 0, H, 34, 14)}${borda(0, H, 0, 0, 22, 14)} Z`;
  const texto = linhas.map((l, i) => [...l].map((ch, j) => `<span id="${id}-c${i}_${j}">${ch === " " ? "&nbsp;" : ch}</span>`).join("")).join("<br>");
  const total = linhas.join("").length, t0 = cue("sargento") ?? .4;
  let anim = "", k = 0;
  linhas.forEach((l, i) => [...l].forEach((_, j) => { anim += `    tl.set("#${id}-c${i}_${j}", { opacity: 1 }, ${(t0 + k * .058).toFixed(3)});\n`; k++; }));
  const corpo = `
    ${fundo.corpo}
    <div class="preto" style="opacity:.56" data-layout-ignore></div>
    <div id="${id}-cd" class="cit" data-layout-allow-overlap>
      <svg viewBox="0 0 ${W} ${H}" class="cheio" data-layout-ignore><path d="${rasgo}" transform="translate(12,16)" fill="${C.s}" opacity=".55"/><path d="${rasgo}" fill="${C.cr}"/></svg>
      <div class="cit-txt t-titulo" data-layout-allow-overlap>${texto}</div>
      <div id="${id}-sb" class="cit-sub t-apoio">${sub}</div>
    </div>`;
  const ts = cue("aconselhar") ?? dur * .5;
  const script = `${fundo.script}
    tl.fromTo("#${id}-cd", { x: 900, rotation: 4 }, { x: 0, rotation: -1.4, duration: .55, ease: "power3.out" }, ${(t0 - .5).toFixed(3)});
${anim}
    tl.fromTo("#${id}-sb", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .35 }, ${(ts - .05).toFixed(3)});
`;
  return { corpo, script };
}
