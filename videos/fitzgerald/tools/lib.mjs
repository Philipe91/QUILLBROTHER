// Peças comuns das cenas do vídeo. Só variáveis do design system. Nenhuma cena mostra morte, corpo, sangue ou método.
import { readFileSync } from "node:fs";
import { crista, tufos, fumaca, rng, arame } from "../../../estilos/ampulheta/templates/base.mjs";
import { MARCHA, gerar } from "../../../estilos/ampulheta/templates/locomocao.mjs";
import { personagem, busto } from "../../../motor/personagem/rig.mjs";
import { rosto, andarEParar, pararERetomar, secundarios, faixasCorpo, somaCabeca, seguir } from "../../../motor/personagem/atuacao.mjs";
import { evento, passosDe } from "../../../motor/audio/eventos.mjs";
export { crista, tufos, fumaca, rng, arame, MARCHA, gerar, personagem, busto, rosto, andarEParar, pararERetomar, secundarios, faixasCorpo, somaCabeca, seguir, evento, passosDe };
export const PR = JSON.parse(readFileSync(new URL("../personagens.json", import.meta.url))).personagens;
export const MAPAS = JSON.parse(readFileSync(new URL("../assets/mapas.json", import.meta.url)));
export const C = { p: "var(--pergaminho)", oc: "var(--ocre)", t: "var(--terra)", v: "var(--vinho)", an: "var(--azul-noite)", ol: "var(--oliva)", s: "var(--sombra)", l: "var(--luz)", cr: "var(--creme)", mu: "var(--musgo)", m: "var(--mar)", tc: "var(--terra-clara)" };
export const FPS = 30;
export const camada = (id, svg, st = "") => `<div id="${id}" class="camada" style="${st}" data-layout-ignore><svg viewBox="0 0 1920 1080">${svg}</svg></div>`;
export const push = (id, a, b, o = "50% 55%") => `tl.fromTo("#${id}-w", { scale: ${a}, transformOrigin: "${o}" }, { scale: ${b}, transformOrigin: "${o}", duration: DUR, ease: "none" }, 0);`;
export const fade = (sel, de, ate, d, t, e = "sine.inOut") => `tl.fromTo("${sel}", { opacity: ${de} }, { opacity: ${ate}, duration: ${d}, ease: "${e}", immediateRender: true }, ${(+t).toFixed(3)});`;
export const lisa = (a, b, t) => { const u = Math.min(1, Math.max(0, (t - a) / (b - a))); return u * u * (3 - 2 * u); };
export const tab = (dur, fn) => Array.from({ length: Math.ceil(dur * FPS) + 2 }, (_, k) => fn(k / FPS));

/* céus */
const GRAD = { aurora: [C.an, C.oc, C.l], dia: [C.m, C.tc, C.cr], noite: [C.s, C.an, C.an], crepusculo: [C.an, C.v, C.oc], cinza: [C.an, C.m, C.tc], interior: [C.s, C.s, C.t] };
export function ceu(id, tipo = "aurora", solX = 1320, solY = 610, solR = 430) {
  const g = GRAD[tipo];
  return camada(`${id}-c0`, `<defs><linearGradient id="${id}-ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${g[0]}"/><stop offset=".55" stop-color="${g[1]}"/><stop offset=".78" stop-color="${g[2]}"/></linearGradient><radialGradient id="${id}-sol"><stop offset="0" stop-color="${C.cr}" stop-opacity="${tipo === "noite" ? .75 : .95}"/><stop offset=".22" stop-color="${C.l}" stop-opacity="${tipo === "noite" ? .18 : .6}"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="url(#${id}-ceu)"/><circle cx="${solX}" cy="${solY}" r="${solR}" fill="url(#${id}-sol)"/>`);
}
export const estrelas = (seed, n = 90, h = 520) => { const r = rng(seed); let s = ""; for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 2100 - 90).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(1 + r() * 1.8).toFixed(1)}" fill="${C.cr}" opacity="${(.25 + r() * .6).toFixed(2)}"/>`; return s; };
export const nuvens = (seed, y, cor, op = .4, n = 6) => { const r = rng(seed); let s = ""; for (let i = 0; i < n; i++) { const x = r() * 2200 - 100, yy = y + r() * 120, w = 160 + r() * 260; s += `<ellipse cx="${x.toFixed(0)}" cy="${yy.toFixed(0)}" rx="${w.toFixed(0)}" ry="${(10 + r() * 16).toFixed(0)}" fill="${cor}" opacity="${op}"/>`; } return s; };
// mar com linhas de luz
export function mar(id, y, cor = C.an, cor2 = C.m, seed = 2, W = 3200) { const r = rng(seed); let s = `<rect x="-400" y="${y}" width="${W}" height="${1300 - y}" fill="${cor}"/>`; for (let i = 0; i < 46; i++) { const yy = y + 8 + r() * r() * (1080 - y), x = r() * 2600 - 300, w = 50 + r() * 260; s += `<rect x="${x.toFixed(0)}" y="${yy.toFixed(0)}" width="${w.toFixed(0)}" height="${(2 + (yy - y) * .012).toFixed(1)}" fill="${cor2}" opacity="${(.1 + r() * .25).toFixed(2)}"/>`; } return s; }
// cena subaquática
export function fundoAgua(id, escuro = 0) {
  const a = escuro ? C.an : C.m, b = escuro ? C.s : C.an, c = C.s, r = rng(7); let raios = ""; for (let i = 0; i < 6; i++) { const x = 100 + r() * 1800, w = 60 + r() * 120; raios += `<path d="M${x},-40 L${x + w},-40 L${x + w * 2.4 - 240},920 L${x - 240},920 Z" fill="${C.cr}" opacity="${escuro ? .025 : .055}"/>`; }
  return camada(`${id}-c0`, `<defs><linearGradient id="${id}-ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".45" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="url(#${id}-ag)"/><g id="${id}-rai">${raios}</g>`);
}
export const bolhas = (pre, n, x0, x1, y, seed = 3) => { const r = rng(seed); let s = "", an = ""; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), rr = 3 + r() * 9, d = 2 + r() * 3, t0 = r() * 3; s += `<circle id="${pre}-b${i}" cx="${x.toFixed(0)}" cy="${y}" r="${rr.toFixed(1)}" fill="none" stroke="${C.cr}" stroke-width="1.6" opacity=".0"/>`; an += `tl.fromTo("#${pre}-b${i}", { y: 0, opacity: .55 }, { y: ${-(160 + r() * 340).toFixed(0)}, opacity: 0, duration: ${d.toFixed(2)}, ease: "none", repeat: 4, immediateRender: false }, ${t0.toFixed(2)});`; } return { s, an }; };

/* minissubmarino, proa para a direita */
export function sub(id, x, y, e = 1, { flip = false, luz = C.ol, base = C.mu, parado = false } = {}) {
  return `<g transform="translate(${x},${y}) scale(${flip ? -e : e},${e})"><g id="${id}">
    <path fill="${C.s}" d="M-262,-6 L-300,-34 L-300,34 L-262,6 Z"/><g id="${id}-hel" transform="translate(-306,0)"><ellipse cx="0" cy="0" rx="7" ry="30" fill="${C.t}"/></g>
    <path fill="${base}" d="M-262,0 C-262,-28 -214,-44 -150,-46 L170,-46 C232,-46 266,-22 266,0 C266,22 232,46 170,46 L-150,46 C-214,44 -262,28 -262,0 Z"/>
    <path fill="${luz}" d="M-250,-14 C-232,-34 -196,-44 -150,-46 L170,-46 C216,-46 248,-32 260,-14 C160,-28 -120,-28 -250,-14 Z"/>
    <path fill="${C.s}" opacity=".32" d="M-258,14 C-160,34 170,34 262,12 C252,30 220,46 170,46 L-150,46 C-208,44 -246,32 -258,14 Z"/>
    ${[-180, -110, -40, 30, 100, 170].map((xx) => `<path d="M${xx},-44 Q${xx + 6},0 ${xx},44" stroke="${C.s}" stroke-width="2" fill="none" opacity=".3"/>`).join("")}
    <path fill="${base}" d="M-30,-44 L-22,-92 L46,-92 L58,-44 Z"/><path fill="${luz}" d="M-22,-92 L46,-92 L50,-74 L-24,-74 Z"/><rect x="6" y="-136" width="7" height="46" fill="${C.s}"/><path d="M6,-136 L24,-136 L24,-128 L6,-128 Z" fill="${C.s}"/>
    <circle cx="254" cy="-12" r="8" fill="${C.s}"/><circle cx="254" cy="12" r="8" fill="${C.s}"/><path d="M220,-46 L266,-82" stroke="${C.s}" stroke-width="4"/><path d="M60,-48 L220,-46" stroke="${C.s}" stroke-width="2"/>
  </g></g>`;
}
export const helice = (id, t = "DUR") => `tl.fromTo("#${id}-hel", { scaleY: 1 }, { scaleY: .25, ...ORIG, duration: .09, ease: "none", repeat: Math.ceil(DUR / .09), yoyo: true }, 0);`;
export const navioCasco = (x, y, e = 1, cor = C.s) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M-330,0 L-300,70 L310,70 L370,0 Z"/><path fill="${cor}" d="M-210,0 L-210,-40 L-80,-40 L-80,-80 L-20,-80 L-20,-120 L30,-120 L30,-80 L90,-80 L90,-40 L220,-40 L220,0 Z"/><rect x="-6" y="-190" width="9" height="74" fill="${cor}"/><rect x="-150" y="-70" width="42" height="32" fill="${cor}"/><rect x="130" y="-70" width="42" height="32" fill="${cor}"/><path d="M-110,-56 L-40,-66 M170,-56 L240,-66" stroke="${cor}" stroke-width="7"/></g>`;
export const aviao = (x, y, e = 1, cor = C.s) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M-50,0 Q-20,-9 30,-5 L52,0 L30,5 Q-20,8 -50,0 Z"/><path fill="${cor}" d="M-8,-2 L-24,-3 L-36,22 L-20,22 Z"/><path fill="${cor}" d="M-42,-2 L-56,-18 L-48,-18 L-34,-3 Z"/></g>`;
// silhueta genérica de busto para retratos de grupo
export const silhueta = (x, y, e, cor, id = "") => `<g ${id ? `id="${id}"` : ""} transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M-90,170 C-88,110 -60,86 -22,76 L-20,50 C-40,36 -46,10 -44,-16 L-54,-22 L-46,-34 C-46,-62 -24,-74 2,-74 C28,-74 48,-62 48,-34 L54,-22 L44,-16 C46,10 40,36 20,50 L22,76 C60,86 88,110 90,170 Z"/></g>`;
// mesa de madeira
export function mesa(id, cor = C.t) { const q = rng(5); let s = ""; for (let i = 0; i < 6; i++) s += `<rect x="-300" y="${-100 + i * 240}" width="2500" height="232" fill="${cor}"/><rect x="-300" y="${132 + i * 240 - 100}" width="2500" height="8" fill="${C.s}" opacity=".6"/>`; for (let i = 0; i < 40; i++) { const x = q() * 2200 - 150, y = q() * 1200 - 60, w = 120 + q() * 380; s += `<path d="M${x.toFixed(0)},${y.toFixed(0)} q${(w / 2).toFixed(0)},${(6 - q() * 12).toFixed(0)} ${w.toFixed(0)},0" stroke="${C.s}" stroke-width="2" fill="none" opacity=".2"/>`; } return camada(`${id}-mesa`, s); }
// figuras prontas
export function parado(pre, dur, { seed = 3, idle = [], rot = [{ t: 0, e: "neutra" }], olhar = [{ t: 0, x: .4, y: 0 }], porta = false, cabeca = null, piscar = [] } = {}) {
  const R = pararERetomar(gerar(MARCHA, 5, { porta, S: MARCHA.S }), MARCHA, { tR: dur + 9, dur: dur + .2, porta, idle, seed });
  const T = cabeca ? somaCabeca(R.T, cabeca) : R.T;
  return [...faixasCorpo(pre, T), ...secundarios(pre, T), ...rosto(pre, "perfil", dur + .2, { roteiro: rot, olhar, seed: seed + 3, piscarEm: piscar })];
}
export function andando(pre, dur, e, { fase = 0, porta = false, rot = [{ t: 0, e: "neutra" }], olhar = [{ t: 0, x: .5, y: 0 }], seed = 5, lento = 1 } = {}) {
  const g = { ...MARCHA, T: MARCHA.T * lento, S: MARCHA.S };
  const G = gerar(g, dur + .2, { fase, porta, S: g.S / e });
  return { T: G.T, faixas: [...faixasCorpo(pre, G.T), ...secundarios(pre, G.T), ...rosto(pre, "perfil", dur + .2, { roteiro: rot, olhar, seed })] };
}
export function caminhao(pre, x, y, e = 1, carga = "") { const roda = (cx, i) => `<g transform="translate(${cx},60)"><g id="${pre}-r${i}"><circle r="34" fill="${C.s}"/><circle r="14" fill="${C.t}"/><rect x="-3" y="-30" width="6" height="26" fill="${C.t}"/></g></g>`;
  return `<g transform="translate(${x},${y}) scale(${e})"><g id="${pre}"><rect x="-420" y="10" width="640" height="26" fill="${C.t}"/><rect x="-420" y="30" width="640" height="10" fill="${C.s}"/>${carga}<path fill="${C.mu}" d="M224,-70 L300,-70 L340,-10 L410,4 L416,50 L224,50 Z"/><path fill="${C.m}" d="M240,-58 L292,-58 L322,-12 L240,-12 Z"/><rect x="396" y="24" width="24" height="14" fill="${C.l}"/>${roda(-330, 0)}${roda(-250, 1)}${roda(60, 2)}${roda(330, 3)}</g></g>`; }
export const rodasGiro = (pre, voltas) => [0, 1, 2, 3].map((i) => `tl.fromTo("#${pre}-r${i}", { rotation: 0, ...ORIG }, { rotation: ${(voltas * 360).toFixed(0)}, ...ORIG, duration: DUR, ease: "none" }, 0);`).join("");
