// Folhas estáticas: personagem atual (V2) e candidata (V5). Usa as mesmas tabelas de pose nos dois, para comparar só o desenho.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { MARCHA, CORRIDA, gerar } from "../../ampulheta/templates/locomocao.mjs";
import { soldado as v2 } from "../../ampulheta/templates/modelos.mjs";
import { personagem, busto } from "../../../motor/personagem/rig.mjs";
import { rosto, EXPRESSOES } from "../../../motor/personagem/atuacao.mjs";

const raiz = new URL("../", import.meta.url), P = JSON.parse(readFileSync(new URL("../../../motor/personagem/presets/ilustrado_cinematico.json", import.meta.url))).personagens;
const css = readFileSync(new URL("ampulheta/design-system.css", new URL("../", raiz)), "utf8");
const FONT = readFileSync(new URL("ampulheta/index.html", new URL("../", raiz)), "utf8").match(/<style>(@font-face.*?)<\/style>/s)?.[1] ?? "";

// Aplica valores como atributos transform no SVG (pose congelada).
function congela(svg, pre, vals, orig = {}) {
  for (const [id, v] of Object.entries(vals)) {
    const alvo = `<g id="${pre}-${id}"`;
    if (!svg.includes(alvo)) continue;
    const t = typeof v === "number" ? `rotate(${v.toFixed(2)})` : v;
    svg = svg.replace(alvo, `${alvo} transform="${t}"`);
  }
  return svg;
}
const poseDe = (G, k, porta) => {
  const o = {}; for (const [n, a] of Object.entries(G.T)) if (!["rtx", "rty"].includes(n)) o[n] = a[k];
  o.rt = `translate(0,${G.T.rty[k].toFixed(2)})`; return o;
};
const andar = gerar(MARCHA, 2, { porta: true }), andar2 = gerar(MARCHA, 2, {}), correr = gerar(CORRIDA, 2, { porta: true, travado: true });
const K = [["contato", 34, andar], ["apoio", 42, andar], ["passagem", 50, andar], ["corrida no ar", 18, correr]];
const fig = (x, y, e, s, rot, legenda) => `<g transform="translate(${x},${y})">${s}<text x="${(rot ?? 0)}" y="${60 * 1}" text-anchor="middle" font-family="Apoio Ampulheta" font-size="27" fill="var(--pergaminho)">${legenda}</text></g>`;

function pagina(pasta, titulo, conteudo, cor = "var(--azul-noite)") {
  const dir = new URL(`qa/${pasta}/`, raiz); mkdirSync(dir, { recursive: true });
  writeFileSync(new URL("design-system.css", dir), css);
  mkdirSync(new URL("assets/fonts/", dir), { recursive: true });
  for (const f of ["oswald-latin-500-normal", "oswald-latin-600-normal", "oswald-latin-700-normal", "eb-garamond-latin-400-normal", "eb-garamond-latin-500-normal", "eb-garamond-latin-400-italic"]) copyFileSync(new URL(`ampulheta/assets/fonts/${f}.woff2`, new URL("../", raiz)), new URL(`assets/fonts/${f}.woff2`, dir));
  writeFileSync(new URL("index.html", dir), `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><link rel="stylesheet" href="design-system.css"/><style>${FONT}</style></head>
<body><div id="root" data-composition-id="main" data-no-timeline data-start="0" data-duration="1" data-width="1920" data-height="1080" style="position:absolute;inset:0;background:${cor}">
<svg viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%" data-layout-ignore>${titulo ? `<text x="60" y="66" font-family="Titulo Ampulheta" font-weight="600" font-size="42" letter-spacing="2" fill="var(--creme)">${titulo}</text>` : ""}${conteudo}</svg></div></body></html>`);
}
const chao = (y, x0, x1) => `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="4" fill="var(--ocre)" opacity=".5"/>`;

/* FASE 1: personagem atual, nas mesmas poses, e os três enquadramentos que ele suporta. */
let s = chao(620, 40, 1880);
K.forEach(([nome, k, G], i) => { const pre = `v2${i}`, sv = congela(v2(pre, { x: 0, y: 0, e: 1.05, porta: true }), pre, poseDe(G, k)); s += `<g transform="translate(${230 + i * 330},620)">${sv}<text y="48" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">${nome}</text></g>`; });
{ const pre = "v2f", sv = congela(v2(pre, { x: 0, y: 0, e: 1.05, flip: true, porta: true }), pre, poseDe(andar, 42)); s += `<g transform="translate(1600,620)">${sv}<text y="48" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">outro lado (só espelho)</text></g>`; }
{ const pre = "v2c", sv = congela(v2(pre, { x: 0, y: 0, e: 2.6, porta: true }), pre, poseDe(andar, 42)); s += `<g transform="translate(290,1090)"><clipPath id="corte"><rect x="-290" y="-430" width="620" height="430"/></clipPath><g clip-path="url(#corte)"><g transform="translate(0,380)">${sv}</g></g></g><text x="580" y="770" font-family="Apoio Ampulheta" font-size="31" fill="var(--creme)">O que falta:</text>`;
  const notas = ["Cabeça sem pálpebra: nunca pisca nem muda o olhar.", "Sobrancelha fixa e boca de um traço: sem emoção.", "Membros retos, sem massa de coxa, panturrilha ou cotovelo.", "Roupa chapada: sem dobra, sobreposição ou lado de sombra.", "Mochila e cintos soltos; mão é uma bola sem dedos.", "Só existe vista de perfil: não há três quartos nem frente.", "Parado, ele congela: não respira nem muda o peso."];
  notas.forEach((n, i) => { s += `<text x="580" y="${812 + i * 36}" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">• ${n}</text>`; }); }
pagina("folha_v2", "PERSONAGEM ATUAL (V2): ESTUDO", s);

/* FASE 2: mesma pose, desenho novo, close, expressões. */
const FX = { a: P.soldado_a, b: P.soldado_b, c: P.civil_exemplo };
s = chao(600, 40, 1880);
K.forEach(([nome, k, G], i) => { const pre = `a${i}`, sv = congela(personagem(pre, FX.a, { x: 0, y: 0, e: 1.05 }), pre, poseDe(G, k)); s += `<g transform="translate(${170 + i * 300},600)">${sv}<text y="48" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">${nome}</text></g>`; });
{ const pre = "bcost", sv = congela(personagem(pre, FX.b, { x: 0, y: 0, e: 1.05, arma: "costas" }), pre, poseDe(andar2, 42)); s += `<g transform="translate(1390,600)">${sv}<text y="48" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">soldado B</text></g>`; }
{ const pre = "cciv", sv = congela(personagem(pre, FX.c, { x: 0, y: 0, e: 1.05, arma: null }), pre, poseDe(andar2, 42)); s += `<g transform="translate(1710,600)">${sv}<text y="48" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">outro tema (mesmo rig)</text></g>`; }
// escalas
[.3, .55, .8].forEach((e, i) => { const pre = `es${i}`; const sv = congela(personagem(pre, FX.a, { x: 0, y: 0, e }), pre, poseDe(andar, 42)); s += `<g transform="translate(${100 + i * 150},1000)">${sv}<text y="42" text-anchor="middle" font-family="Apoio Ampulheta" font-size="26" fill="var(--pergaminho)">×${e}</text></g>`; });
// close com variação
const nomesE = ["neutra", "tensao", "surpresa", "medo", "determinacao", "cansaco"];
const props = (lista, pre) => { const o = {}; for (const [id, p, a] of lista) { const k = id.replace(pre + "-", ""), v = a[0]; (o[k] ??= {})[p] = v; } return o; };
function buE(pre, nome, x, y, e, c = FX.a) {
  let sv = busto(pre, c, { x, y, e });
  const l = rosto(pre, "busto", .05, { roteiro: [{ t: 0, e: nome }], seed: 9 });
  const map = props(l, pre), ORI = { s0: "-8 -52", s1: "74 -54" };
  for (const [k, o] of Object.entries(map)) { if (o.opacity !== undefined) { sv = sv.replace(new RegExp(`<g id="${pre}-${k}"( opacity="0")?`), `<g id="${pre}-${k}" opacity="${o.opacity}"`); continue; } let t = `translate(${o.x ?? 0},${o.y ?? 0})`; if (o.rotation !== undefined) t += ` rotate(${o.rotation} ${ORI[k].replace(" ", " ")})`; sv = sv.replace(`<g id="${pre}-${k}"`, `<g id="${pre}-${k}" transform="${t}"`); }
  return sv;
}
nomesE.forEach((n, i) => { const x = 680 + (i % 3) * 410, y = 800; if (i < 3) s += `<g><clipPath id="r${i}"><rect x="${x - 195}" y="680" width="390" height="340"/></clipPath><g clip-path="url(#r${i})"><rect x="${x - 195}" y="680" width="390" height="340" fill="var(--ocre)"/>${buE(`e${i}`, n, x - 10, y + 65, .72)}</g><text x="${x}" y="1058" text-anchor="middle" font-family="Apoio Ampulheta" font-size="28" fill="var(--pergaminho)">${n}</text></g>`; });
pagina("folha_v5", "CANDIDATA V5: PERSONAGENS", s);

/* Segunda folha: seis expressões no tamanho do close. */
s = "";
nomesE.forEach((n, i) => { const x = 330 + (i % 3) * 630, y = 90 + Math.floor(i / 3) * 490; s += `<clipPath id="q${i}"><rect x="${x - 300}" y="${y}" width="600" height="440"/></clipPath><g clip-path="url(#q${i})"><rect x="${x - 300}" y="${y}" width="600" height="440" fill="var(--ocre)"/>${buE(`f${i}`, n, x - 20, y + 245, 1)}</g><text x="${x}" y="${y + 472}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="500" font-size="28" letter-spacing="2" fill="var(--creme)">${n.toUpperCase()}</text>`; });
pagina("folha_expr", "", s);
console.log("folhas ok");
