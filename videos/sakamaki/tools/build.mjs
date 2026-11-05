// Monta as composições por capítulo. Uso: node tools/build.mjs <longo|short> [--so=s001,s017 para prova: um projeto com só essas cenas]
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, cpSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import { V } from "./cenas2.mjs";
import { evento, FPS, rng } from "./lib.mjs";

const fmt = process.argv[2] || "longo", isV = fmt === "short", so = (process.argv.find((a) => a.startsWith("--so=")) || "").slice(5).split(",").filter(Boolean), noTest = !so.length;
const R = new URL("../", import.meta.url), D = JSON.parse(readFileSync(new URL("roteiro.json", R)))[fmt];
const OUT = JSON.parse(readFileSync(new URL(`job_${fmt}.json.out`, R))), JOB = JSON.parse(readFileSync(new URL(`job_${fmt}.json`, R)));
const W = isV ? 1080 : 1920, H = isV ? 1920 : 1080, ESC = isV ? 1920 / 1080 : 1;
const q = (t) => Math.round(t * FPS) / FPS;
const dVoz = (i) => { const u = OUT[i].at(-1); return u.t + u.d; };
// folgas: o áudio manda; pausa dramática onde o texto pede
const FOLGA = { s003: .45, s004: .5, s016: .3, s020: .5, s025: .9, s030: .9, s031: .4, s038: .4, s039: .9, s043: .3, s050: 1.2, s051: 2.2, s053: .4, s054: .8, s055: .8, s065: .6, s068: .9, s076: .5, s077: .6, s085: 1.2, s086: .4, s092: .7, s096: .5, s100: .8, s104: 1.2, s105: 2.6, s106: .7, s107: .5, s109: .6, s110: 3.6, z10: 2.6, z04: .3, z05: .3 };
const FOLGA_PADRAO = isV ? .1 : Number(process.env.GAP ?? .3), ENTRADA = .12;
const cenasRaw = D.map(([cap, id, texto, tipo, op], i) => ({ cap, id, texto, tipo, op: op ?? {}, i, dur: q(ENTRADA + dVoz(i) + (FOLGA[id] ?? FOLGA_PADRAO)) }));
let t = 0; for (const c of cenasRaw) { c.t = t; t += c.dur; }
const TOTAL = t;
const pal = (w) => w.replace(/[^\w']/g, "");
const LAYOUT = isV ? { ltL: 50, ltB: 780, tTop: 1190 } : { ltL: 120, ltB: 112, tTop: 820 };

function overlay(id, dur, op, cx) {
  let html = "", s = "";
  if (op.lt) { html += `<div id="${id}-lt" class="lt" style="left:${LAYOUT.ltL}px;bottom:${LAYOUT.ltB}px;background:rgba(30,26,22,.72);padding:12px 26px"><div class="lt-titulo t-titulo">${op.lt[0]}</div><div class="lt-sub t-apoio">${op.lt[1]}</div></div>`; s += `tl.fromTo("#${id}-lt", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .45, ease: "power2.out", immediateRender: true }, .35);tl.to("#${id}-lt", { opacity: 0, duration: .3 }, ${(dur - .45).toFixed(2)});`; }
  if (op.txt && !isV) { html += `<div id="${id}-tx" class="t-titulo" style="position:absolute;left:0;right:0;top:${op.lt ? 100 : LAYOUT.tTop}px;text-align:center;font-size:92px;letter-spacing:.06em;opacity:0"><span style="background:rgba(30,26,22,.78);padding:12px 42px">${op.txt}</span></div>`; s += `tl.fromTo("#${id}-tx", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .32, ease: "power2.out", immediateRender: true }, ${Math.min(.8, dur * .28).toFixed(2)});`; }
  if (isV && cx) { // legendas do Short: blocos curtos, tempo vindo das palavras da narração
    const ws = cx; const blocos = []; let b = []; ws.forEach((w, k) => { b.push(w); const fim = /[.,?:]$/.test(w.w); if (b.length >= 4 || fim || k === ws.length - 1) { blocos.push(b); b = []; } });
    blocos.forEach((bl, k) => { const ini = ENTRADA + bl[0].t, fim = k + 1 < blocos.length ? ENTRADA + blocos[k + 1][0].t : dur; html += `<div id="${id}-cp${k}" class="t-titulo" style="position:absolute;left:50px;right:50px;top:1240px;text-align:center;font-size:96px;line-height:1.06;letter-spacing:.01em;opacity:0;-webkit-text-stroke:10px var(--sombra);paint-order:stroke fill;text-shadow:0 6px 0 var(--sombra)">${bl.map((w) => w.w).join(" ")}</div>`; s += `tl.set("#${id}-cp${k}", { opacity: 1 }, ${ini.toFixed(3)});tl.set("#${id}-cp${k}", { opacity: 0 }, ${fim.toFixed(3)});`; });
  }
  return { html, s };
}

function arquivoCena(c, cx) {
  const { id, dur } = c, evs = [];
  const ctx = { id, dur, v: isV, n: c.i, cue: (w) => { const p = OUT[c.i].find((u) => pal(u.w).toLowerCase() === pal(w).toLowerCase()); return p ? ENTRADA + p.t : null; }, ev: (t2, som, o = {}) => { if (["vento", "mar", "multidao", "radio"].includes(som)) return; const e = evento(c.t + t2, som, o); if (["aviao", "fogo", "coracao"].includes(som)) e.dur = +(dur - t2 + (som === "aviao" ? 1.2 : 0)).toFixed(2); evs.push(e); }, evs: (l) => evs.push(...l.map((e) => ({ ...e, t: +(e.t + c.t).toFixed(4) }))) };
  if (!V[c.tipo]) throw new Error("sem cena " + c.tipo);
  const r = V[c.tipo](ctx, c.op), ov = overlay(id, dur, c.op, isV ? OUT[c.i] : null);
  const esc = isV && r.fitV ? W / r.fitV : ESC, foco = r.foco ?? 960, tx = isV ? Math.max(-(1920 * esc - W), Math.min(0, W / 2 - foco * esc)) : 0, ty = isV && r.fitV ? (H - 1080 * esc) / 2 : 0;
  const F = (r.faixas || []).map(([s2, p, a, o]) => [s2, p, a.map((v) => +(+v).toFixed(2)), o ?? null]);
  const html = `<template>
  <style>#root { position: absolute; inset: 0; }</style>
  <div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}" data-layout-allow-overflow data-layout-allow-overlap>
    <div style="position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:0 0;transform:translate(${tx.toFixed(1)}px,${ty.toFixed(1)}px) scale(${esc})" data-layout-ignore><div id="${id}-w" class="cena" data-layout-allow-overflow data-layout-allow-overlap>${r.corpo}</div></div>
    ${ov.html}
    <div id="${id}-preto" class="preto" data-layout-ignore></div>
  </div>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true }), DUR = ${dur.toFixed(3)}, ORIG = { svgOrigin: "0 0" }, FPS = ${FPS};
    const osc = (alvo, de, ate, per, ini, fim) => { const n = Math.max(1, Math.round((fim - ini) / (per / 2))); tl.fromTo(alvo, { ...de, ...(ate.svgOrigin ? { svgOrigin: ate.svgOrigin } : {}) }, { ...ate, duration: (fim - ini) / n, ease: "sine.inOut", repeat: n - 1, yoyo: true }, ini); };
    const F = ${JSON.stringify(F)};
    for (const [s, p, a, o] of F) { const n = a.length - 1, d = n / FPS, ease = (u) => { const f = Math.min(Math.max(u, 0), 1) * n, i = Math.floor(f); return i >= n ? a[n] : a[i] + (a[i + 1] - a[i]) * (f - i); }; const de = { [p]: 0 }, ate = { [p]: 1, ease, duration: d, immediateRender: true }; if (p === "rotation") { de.svgOrigin = ate.svgOrigin = o || "0 0"; } tl.fromTo("#" + s, de, ate, 0); }
    ${r.script}
    ${ov.s}
    ${c.fimCap ? `tl.to("#${id}-preto", { opacity: 1, duration: .32, ease: "sine.in" }, ${(dur - .34).toFixed(3)});` : ""}
    ${c.iniCap ? `tl.fromTo("#${id}-preto", { opacity: 1 }, { opacity: 0, duration: .28, ease: "sine.out", immediateRender: true }, 0);` : ""}
    tl.set({}, {}, DUR);
    window.__timelines["${id}"] = tl;
  })();
  </script>
</template>
`;
  return { html, evs, r };
}

function raiz(lista, tot, dir) {
  mkdirSync(new URL("compositions/", dir), { recursive: true });
  cpSync(new URL("assets/fonts/", R), new URL("assets/fonts/", dir), { recursive: true });
  writeFileSync(new URL("design-system.css", dir), readFileSync(new URL("design-system.css", R)).toString().replace("html, body { margin: 0; width: 1920px; height: 1080px;", `html, body { margin: 0; width: ${W}px; height: ${H}px;`));
  writeFileSync(new URL("hyperframes.json", dir), JSON.stringify({ paths: { blocks: "compositions", components: "compositions/components", assets: "assets" } }));
  writeFileSync(new URL("meta.json", dir), JSON.stringify({ id: "sakamaki", name: "sakamaki" }));
  writeFileSync(new URL("package.json", dir), `{"name":"sk","private":true,"type":"module"}`);
  let sd = 4242; const rd = () => (sd = (sd * 16807) % 2147483647) / 2147483647; let grao = ""; for (let i = 0; i < tot * 12; i++) grao += `tl.set("#grao",{x:${Math.round(rd() * 512 - 256)},y:${Math.round(rd() * 512 - 256)}},${(i / 12).toFixed(3)});`;
  writeFileSync(new URL("compositions/overlay.html", dir), `<template><style>#root { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }</style><div id="root" data-composition-id="overlay" data-width="${W}" data-height="${H}" data-layout-ignore data-layout-allow-overflow><div id="grao"></div><div id="vinheta"></div></div><script>(function () { const tl = gsap.timeline({ paused: true }); ${grao} tl.set({}, {}, ${tot.toFixed(3)}); window.__timelines["overlay"] = tl; })();</script></template>\n`);
  const FONT = readFileSync(new URL("../../estilos/ampulheta/index.html", R), "utf8").match(/<style>(@font-face.*?)<\/style>/s)[1];
  let tc = 0; const blocos = lista.map((c, i) => { const s = `<div id="${c.id}" data-composition-id="${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${tc.toFixed(3)}" data-duration="${c.dur.toFixed(3)}" data-track-index="${i % 2 + 1}" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:${i + 1}"></div>`; tc += c.dur; return s; });
  writeFileSync(new URL("index.html", dir), `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=${W}, height=${H}"/><script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><link rel="stylesheet" href="design-system.css"/><style>${FONT}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${tot.toFixed(3)}" data-width="${W}" data-height="${H}">
${blocos.join("\n")}
<div id="overlay" data-composition-id="overlay" data-composition-src="compositions/overlay.html" data-start="0" data-duration="${tot.toFixed(3)}" data-track-index="5" data-track-kind="graphics" data-width="${W}" data-height="${H}" style="z-index:1000"></div>
</div><script>window.__timelines["main"] = gsap.timeline({ paused: true });</script></body></html>`);
}

const caps = [...new Set(cenasRaw.map((c) => c.cap))];
if (!isV) for (const k of caps) { const l = cenasRaw.filter((c) => c.cap === k); l[0].iniCap = true; l.at(-1).fimCap = true; } else cenasRaw.at(-1).fimCap = false;
const eventos = [], porId = {}; const BUILD = new URL(`build/${fmt}/`, R);
if (noTest) rmSync(BUILD, { recursive: true, force: true }); mkdirSync(BUILD, { recursive: true });
const alvo = noTest ? (isV ? [["z", cenasRaw]] : caps.map((k) => [k, cenasRaw.filter((c) => c.cap === k)])) : [["prova", cenasRaw.filter((c) => so.includes(c.id))]];
for (const [k, lista] of alvo) { const dir = new URL(`${k}/`, BUILD); mkdirSync(new URL("compositions/", dir), { recursive: true }); for (const c of lista) { const a = arquivoCena(c); writeFileSync(new URL(`compositions/${c.id}.html`, dir), a.html); porId[c.id] = a.r; eventos.push(...a.evs); } raiz(lista, lista.reduce((a, c) => a + c.dur, 0), dir); }

/* plano de áudio */
if (noTest) {
  const mapaAmb = { mar: ["mar", -9, 9000], agua: ["mar", -10, 700], vento: ["vento", -10, 9000], multidao: ["multidao", -10, 7000], sala: ["interior_sala", -16, 5000], motor: ["radio", -18, 700] };
  const amb = []; let atual = null; for (const c of cenasRaw) { const nome = (porId[c.id].ambSom) ?? null; if (atual && atual.nome === nome) { atual.fim = c.t + c.dur; continue; } atual = nome ? { nome, som: mapaAmb[nome][0], ini: c.t, fim: c.t + c.dur, db: mapaAmb[nome][1], corte: mapaAmb[nome][2], fade: .5, off: Math.round(c.t) % 30 } : null; if (atual) amb.push(atual); }
  const faixas = { c01: "trilha_tensao", c02: "trilha_tensao", c03: "trilha_tensao_b", c04: "trilha_tensao_b", c05: "trilha_tensao", c06: "trilha_tensao", c07: "trilha_tensao_b", c08: "trilha_tensao_b", c09: "trilha_tensao", c10: "trilha_tensao_b", c11: "trilha_tensao_b", c12: "trilha_tensao_b", c13: "trilha_tensao_b", c14: "trilha_tensao", c15: "trilha_tensao", z: "trilha_tensao" };
  const nivel = { c04: -11, c06: -7, c07: -9, c09: -7, c14: -11, c15: -11 }; const mus = {}; for (const k of caps) { const l = cenasRaw.filter((c) => c.cap === k), som = faixas[k]; (mus[som] ||= []).push([l[0].t, l.at(-1).t + l.at(-1).dur, nivel[k] ?? -9, k]); }
  // silêncio de trilha onde a história pede: Inagaki, lágrimas, "It says nine"
  const mudos = cenasRaw.filter((c) => ["s051", "s105", "s110", "z10"].includes(c.id)).map((c) => [c.t, c.t + c.dur]);
  // automação sem rampas longas: cada mudo tem subida e descida próprias
  const musica = Object.entries(mus).map(([som, seg]) => {
    const pts = [[0, -70]];
    for (const [a, b2, db] of seg) {
      const cortes = mudos.filter(([m0, m1]) => m1 > a && m0 < b2).sort((x, y) => x[0] - y[0]); let ini = a;
      for (const [m0, m1] of cortes) { pts.push([ini, -70], [ini + .8, db], [Math.max(ini + .9, m0 - 1.4), db], [m0 - .1, -70], [m1, -70]); ini = m1; }
      if (ini < b2 - 1) pts.push([ini, -70], [ini + .9, db], [b2 - .8, db], [b2, -70]);
    }
    pts.sort((x, y) => x[0] - y[0]); return { som, off: som === "trilha_tensao" ? 14 : 4, corte: 5000, automacao: pts };
  });
  const plano = { duracao: TOTAL, ambiente: "campo", lufs: -16, voz: cenasRaw.map((c, i) => ({ t: +(c.t + ENTRADA).toFixed(3), arquivo: `assets/voz/${fmt}/${c.id}.mp3` })), ambientes: amb, musica, eventos: eventos.map((e) => ({ ...e, db: e.db + ({ tecla: 0, splash: 3, explosao_longe: 2, explosao_longe_2: 2, artilharia: 3, soco: 2, impacto_suave: 4, relogio_b: 4 }[e.som] ?? 8) })).sort((a, b) => a.t - b.t) };
  writeFileSync(new URL(`plano_${fmt}.json`, R), JSON.stringify(plano));
  writeFileSync(new URL(`cenas_${fmt}.json`, R), JSON.stringify(cenasRaw.map(({ cap, id, tipo, t, dur, texto }) => ({ cap, id, tipo, t: +t.toFixed(3), dur, texto })), null, 0));
}
const durs = cenasRaw.map((c) => c.dur), mm = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
console.log(fmt, "total", mm(TOTAL), "cenas", durs.length, "min", Math.min(...durs), "max", Math.max(...durs), "eventos", eventos.length);
