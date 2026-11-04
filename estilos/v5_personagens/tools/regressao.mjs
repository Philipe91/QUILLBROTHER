// Teste de regressão V2 x V5: mesma tabela nos dois rigs, com marcadores nas juntas, renderizado de verdade. Depois medir_regressao.py compara os pixels.
import { writeFileSync, mkdirSync, copyFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { MARCHA, CORRIDA, gerar } from "../../ampulheta/templates/locomocao.mjs";
import { soldado as v2 } from "../../ampulheta/templates/modelos.mjs";
import { personagem } from "../../../motor/personagem/rig.mjs";
import { faixasCorpo, deslizeEmApoio } from "../../../motor/personagem/atuacao.mjs";

const raiz = new URL("../", import.meta.url), dir = new URL("qa/regressao/", raiz); mkdirSync(dir, { recursive: true });
const A = JSON.parse(readFileSync(new URL("../../../motor/personagem/presets/ilustrado_cinematico.json", import.meta.url))).personagens.soldado_a;
// marcadores: magenta na ponta do pé A, ciano na mão da frente, amarelo no ponto do fuzil onde ela segura
const marca = (svg, p) => svg.replace(`<g id="${p}-pa">`, `<g id="${p}-pa">@@P@@`).replace(`<g id="${p}-af">`, `<g id="${p}-af">@@M@@`).replace(`<g id="${p}-fz">`, `<g id="${p}-fz">@@F@@`);
const fim = (svg) => svg.replace("@@P@@", "").replace("@@M@@", "").replace("@@F@@", "");
const comMarcas = (svg) => svg.replace(/(<g id="[^"]+-pa">)/, `$1`).replace(/<\/g><\/g>\s*<\/g><\/g>\s*<\/g>\s*<g id="[^"]+-sa"/, (m) => m);
const pontos = (p) => `<g id="${p}-mk"></g>`;
function comMarcador(svg, p) {
  const ins = (id, c) => { const i = svg.indexOf(`<g id="${p}-${id}"`); const j = svg.indexOf(">", i) + 1; svg = svg.slice(0, j) + c + svg.slice(j); };
  return svg;
}
// os marcadores ficam por cima de tudo: em grupos irmãos, movidos pela mesma cadeia de juntas
const cadeia = (p, e, x, y, cor1, cor2, cor3) => `<g transform="translate(${x},${y}) scale(${e})"><g id="${p}-Mrt">
  <g id="${p}-Mca"><g transform="translate(0,76)"><g id="${p}-Mja"><g transform="translate(0,66)"><g id="${p}-Mpa"><circle cx="27" cy="18" r="5" fill="${cor1}"/></g></g></g></g></g>
  <g id="${p}-Mtr2"><g transform="translate(2,-112)"><g id="${p}-Mbf"><g transform="translate(0,50)"><g id="${p}-Maf"><circle cx="0" cy="52" r="5" fill="${cor2}"/></g></g></g></g><g transform="translate(16,-62) rotate(-30)"><g id="${p}-Mfz"><circle cx="50" cy="-14" r="4" fill="${cor3}"/></g></g></g>
</g></g>`;
const G = gerar(MARCHA, 2.3, { porta: true }), R = gerar(CORRIDA, 1, { porta: true });
const pre2 = "q2", pre5 = "q5", E = 1.5, Y = 800;
const svg = `${v2(pre2, { x: 100, y: Y, e: E, porta: true })}${personagem(pre5, A, { x: 1120, y: Y, e: E })}${cadeia(pre2, E, 100, Y, "#ff00ff", "#00ffff", "#ffff00")}${cadeia(pre5, E, 1120, Y, "#ff00ff", "#00ffff", "#ffff00")}`;
const F = [...faixasCorpo(pre2, G.T), ...faixasCorpo(pre5, G.T)];
for (const p of [pre2, pre5]) for (const [n, a] of Object.entries(G.T)) { const m = { rtx: ["rt", "x"], rty: ["rt", "y"] }[n]; if (m) F.push([`${p}-M${m[0]}`, m[1], a]); else if (["ca", "ja", "pa", "tr2", "bf", "af", "fz"].includes(n)) F.push([`${p}-M${n}`, "rotation", a]); }
const FX = F.map(([s, p, a]) => [s, p, a.map((v) => +v.toFixed(3))]);
writeFileSync(new URL("design-system.css", dir), readFileSync(new URL("design-system.css", raiz)));
writeFileSync(new URL("index.html", dir), `<!doctype html><html><head><meta charset="UTF-8"/><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><link rel="stylesheet" href="design-system.css"/></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="2.2" data-width="1920" data-height="1080" style="position:absolute;inset:0;background:#2B3A4A"><svg viewBox="0 0 1920 1080" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible" data-layout-ignore><rect x="0" y="${Y}" width="1920" height="3" fill="#888"/>${svg}</svg></div>
<script>const tl=gsap.timeline({paused:true});const F=${JSON.stringify(FX)};for(const[s,p,a]of F){const n=a.length-1,d=n/30,ease=u=>{const f=Math.min(Math.max(u,0),1)*n,i=Math.floor(f);return i>=n?a[n]:a[i]+(a[i+1]-a[i])*(f-i)};const de={[p]:0},ate={[p]:1,ease,duration:d,immediateRender:true};if(p==="rotation"){de.svgOrigin=ate.svgOrigin="0 0"}tl.fromTo("#"+s,de,ate,0)}tl.set({},{},2.2);window.__timelines.main=tl;</script></body></html>`);
// verificações sem pixels
const h = (b) => createHash("sha256").update(b).digest("hex").slice(0, 16);
const atual = readFileSync(new URL("../ampulheta/templates/locomocao.mjs", raiz));
const tag = execSync('git show checkpoint-v2-ampulheta:estilos/ampulheta/templates/locomocao.mjs', { cwd: new URL("../../", raiz) });
const norm = (b) => b.toString().replace(/\r\n/g, "\n");
const res = { motor_identico_ao_checkpoint: norm(atual) === norm(tag), hash_motor: h(norm(atual)), deslize_marcha: deslizeEmApoio(G.T), deslize_corrida: deslizeEmApoio(R.T), qa_marcha_v2: G.qa, qa_corrida_v2: R.qa };
writeFileSync(new URL("resultado_tabelas.json", dir), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
