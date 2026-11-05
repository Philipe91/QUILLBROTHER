// Miniatura: nove rostos, um recorte vazio, ERASED. Sem sangue nem imagem de morte. Uso: node tools/miniatura.mjs; depois hyperframes snapshot.
import { readFileSync, writeFileSync, mkdirSync, cpSync } from "node:fs";
import { V } from "./cenas2.mjs";
const R = new URL("../", import.meta.url), dir = new URL("build/miniatura/", R); mkdirSync(new URL("compositions/", dir), { recursive: true });
const c = { id: "mi", dur: 2, v: false, n: 1, cue: () => .1, ev() {}, evs() {} }, r = V.pintura(c, { f: 1 });
const script = r.script.replace(/tl\.fromTo\("#mi-w".*?\n?;/, "");
cpSync(new URL("assets/fonts/", R), new URL("assets/fonts/", dir), { recursive: true });
writeFileSync(new URL("design-system.css", dir), readFileSync(new URL("design-system.css", R)));
writeFileSync(new URL("hyperframes.json", dir), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } }));
writeFileSync(new URL("meta.json", dir), JSON.stringify({ id: "mini", name: "mini" })); writeFileSync(new URL("package.json", dir), `{"name":"mi","private":true,"type":"module"}`);
const FONT = readFileSync(new URL("../../estilos/ampulheta/index.html", R), "utf8").match(/<style>(@font-face.*?)<\/style>/s)[1];
const estampa = `<div style="position:absolute;left:230px;top:806px;width:940px;height:220px;transform:rotate(-4deg);border:16px solid var(--vinho);background:var(--creme);display:flex;align-items:center;justify-content:center;font-family:var(--font-titulo);font-weight:700;font-size:176px;letter-spacing:.06em;color:var(--vinho);line-height:1">ERASED</div>`;
writeFileSync(new URL("index.html", dir), `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=1920, height=1080"/><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><link rel="stylesheet" href="design-system.css"/><style>${FONT}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="2" data-width="1920" data-height="1080"><div id="mi-w" class="cena">${r.corpo}${estampa}</div><div id="vinheta"></div></div>
<script>const tl = gsap.timeline({ paused: true }), DUR = 2, ORIG = { svgOrigin: "0 0" }; const osc = () => {}; const F = ${JSON.stringify(r.faixas.map(([s2, p2, a, o2]) => [s2, p2, a.map((v) => +(+v).toFixed(2)), o2 ?? null]))}; const FPS = 30; for (const [s, p, a, o] of F) { const n = a.length - 1, d = n / FPS, ease = (u) => { const f = Math.min(Math.max(u, 0), 1) * n, i = Math.floor(f); return i >= n ? a[n] : a[i] + (a[i + 1] - a[i]) * (f - i); }; const de = { [p]: 0 }, ate = { [p]: 1, ease, duration: d, immediateRender: true }; if (p === "rotation") { de.svgOrigin = ate.svgOrigin = o || "0 0"; } tl.fromTo("#" + s, de, ate, 0); } ${r.script} tl.set({}, {}, 2); window.__timelines["main"] = tl;</script></body></html>`);
console.log("ok");
