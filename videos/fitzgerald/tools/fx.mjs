// Camada de efeitos: cortes com movimento e som, palavras e números saltando na fala, tremor em cada impacto, relâmpago, zoom por frase, títulos de capítulo e gags.
// Trechos sobre as mortes (SOBRIO) não recebem nada: a ficha pede sobriedade e o humor nunca mira as vítimas.
import { rng, evento, FPS } from "./lib.mjs";
export const SOBRIO = new Set(["f004", "f047", "f048", "f056", "f063", "f073", "f090", "f091", "f092", "f093", "y08"]);
const POP = {
  f001: [["five", "5 CALM WORDS"]], f003: [["feet", "729 FEET"]], f008: [["biggest", "BIGGEST ON THE LAKES"]], f009: [["round", "748 ROUND TRIPS"]], f010: [["records,", "CARGO RECORDS"]],
  f013: [["fifteen", "15 FT"], ["eleven", "11½ FT"]], f015: [["fourteen", "14,000 LB"], ["sixty-eight", "68 CLAMPS"]], f017: [["depth", "NO DEPTH FINDER"], ["monitoring", "NO WATER ALARM"]], f019: [["Twenty-six", "26,000 TONS"]], f023: [["hours", "5 HOURS TOO LATE"]],
  f027: [["north,", "RUN NORTH"]], f029: [["three", "3:30 PM"]], f031: [["both", "\"YES, BOTH OF THEM\""]], f032: [["list", "A LIST?"]], f033: [["How", "HOW?"], ["where", "WHERE?"]],
  f034: [["radars", "BOTH RADARS: OUT"]], f038: [["bad", "BAD LIST"], ["Both", "NO RADAR"], ["Heavy", "SEAS OVER THE DECK"]], f040: [["fifty-eight", "58 KNOTS"], ["twenty-five", "25-FOOT WAVES"], ["lifeboats.", "LIFEBOAT GONE"]],
  f041: [["three.", "GROUPS OF THREE"], ["twenty", "~20 FT AVERAGE"]], f043: [["huge", "BURIED"]], f044: [["bigger.", "\"OR BIGGER\""], ["Ten", "10 MILES AHEAD"]], f045: [["seven", "7:00 PM"], ["Ten", "7:10 PM"]],
  f049: [["twenty", "VISIBLE: 20 MILES"]], f050: [["ten", "SHOULD BE: 10 MILES"]], f051: [["nothing", "NOTHING"]], f052: [["again", "NO ANSWER"]], f057: [["three", "300 MILES AWAY"], ["sixty", "60-KNOT LIMIT"]], f059: [["two", "2-3 MPH"]], f061: [["back", "BACK INTO IT"]],
  f062: [["days.", "DAYS OF SEARCHING"]], f064: [["Four", "4 DAYS LATER"]], f066: [["five", "530 FEET DOWN"], ["seventeen", "17 MILES OUT"]], f067: [["two", "2 PIECES"], ["two hundred", "200 FEET MISSING"]], f068: [["first", "BREAK FIRST?"], ["Or", "SINK FIRST?"]],
  f069: [["one", "THEORY 1: HATCHES"]], f071: [["few", "\"FEW\" FASTENED"]], f072: [["Two", "2 BROKEN"], ["Fourteen", "14 UNDAMAGED"]], f075: [["two", "THEORY 2: THE SHOAL"]], f078: [["strongly", "\"STRONGLY CONVINCED\""]], f080: [["three", "THEORY 3: THE HULL"]], f081: [["forty", "40+ HOURS OF VIDEO"]], f083: [["four", "THEORY 4: THE WAVE"]], f085: [["hatches", "THE FIRST CALL?"], ["shoal", "THE PROPELLER?"], ["hull", "THE BREAK?"], ["wave.", "THE WAVE?"]],
  y02: [["seven", "729 FEET"]], y03: [["twenty-nine", "29 MEN"]], y04: [["three", "3:30 PM"], ["both", "RADARS OUT"]], y05: [["eyes,", "HER ONLY EYES"]], y06: [["ten", "7:10 PM"]], y07: [["twenty", "VISIBLE: 20 MILES"], ["ten", "SHOULD BE: 10 MILES"]], y09: [["hatches.", "THE HATCHES?"]],
};
const GAG = { f014: ["Nobody", "NOT CONSULTED: THE LAKE", "record_scratch"], f042: ["Nobody", "FILED: NOTHING", "record_scratch"], f053: ["change", "PLEASE HOLD", "ding"], f054: ["sixteen-foot", "PRIORITY: ONE SMALL BOAT", "record_scratch"], f083: ["paperwork.", "NO PAPERWORK", "erro"] };
const CAP = { c02: "THE MIGHTY FITZ", c03: "NOVEMBER 9, 1975", c04: "FIRST DAMAGE", c05: "BLIND", c06: "THE LAST MESSAGE", c07: "GONE", c08: "THE SEARCH", c09: "THE WRECK", c10: "FOUR THEORIES", c11: "WHAT CHANGED", c12: "THE BELL" };
// som por tipo de cena: o que se ouviria ali
const AMB = {
  radar: (d, ev) => { for (let t = .3; t < d - .2; t += 1.6) ev(t, "ding", { db: -18, dist: .55, origem: "varredura do radar" }); },
  mapa: (d, ev) => { ev(.25, "pano", { db: 2, dist: .1, origem: "traço no mapa" }); ev(d * .55, "pano", { db: 0, dist: .1 }); },
  planta: (d, ev) => { ev(.1, "whoosh_3", { db: -8, bus: "transicoes", dist: .2 }); ev(.35, "papel", { db: -2, dist: .1 }); },
  doca: (d, ev) => { for (let t = .2; t < d; t += .42) ev(t, "equipamento", { db: 2, dist: .35, origem: "pelotas na calha" }); ev(.1, "impacto_suave", { db: -6, dist: .5 }); },
  tampa: (d, ev) => { for (let t = .4; t < d - .3; t += 1.25) ev(t, "equipamento", { db: 6, dist: .15, origem: "grampo" }); },
  porao: (d, ev) => { ev(.3, "impacto_suave", { db: -4, dist: .5 }); ev(d * .6, "equipamento", { db: 2, dist: .55, origem: "eco no porão" }); },
  passadico: (d, ev) => { ev(.05, "radio", { db: -2, dur: .9 }); ev(d - .9, "radio", { db: -6, dur: .6 }); },
  farol: (d, ev) => { ev(.2, "radio", { db: 0, dur: 1.5 }); },
  destrocos: (d, ev) => { ev(.2, "splash", { db: -6, dist: .6 }); },
  curv: (d, ev) => { for (let t = .4; t < d; t += 1.9) ev(t, "ding", { db: -18, dist: .7, origem: "sonar" }); ev(.1, "splash", { db: -10, dist: .6 }); },
  wreck: (d, ev) => { ev(.2, "impacto_suave", { db: 0, dist: .5 }); for (let t = .8; t < d; t += 2.1) ev(t, "ding", { db: -20, dist: .75, origem: "sonar" }); },
  duvida: (d, ev) => { ev(.15, "whoosh", { db: -6, bus: "transicoes" }); ev(d - .9, "impacto_suave", { db: 2, dist: .3 }); },
  grafico: (d, ev) => { ev(.1, "papel", { db: -4, dist: .1 }); },
  sino: (d, ev) => { ev(.2, "ding", { db: 6, dist: .4, origem: "sino" }); },
  frase: (d, ev) => { ev(.05, "radio", { db: -4, dur: Math.min(d, 1.6) }); },
};
const CUTS = ["whoosh", "whoosh_2", "whoosh_3"];
const texto = (tx) => tx.replace(/"/g, "&quot;");
export function aplicaFX(c, ctx, isV, palavras, ENTRADA, evs, cap) {
  const { id, dur } = c, r = rng(c.i * 7 + 13), sob = SOBRIO.has(id); let html = "", s = "", F = [];
  const op = c.op, W = isV ? 1080 : 1920;
  const cue = (w, ini = 0) => { const lim = (x) => x.replace(/[^\w'½-]/g, "").toLowerCase(), alvo = lim(w); const p = palavras.find((u) => lim(u.w) === alvo && u.t >= ini); return p ? ENTRADA + p.t : null; };
  const sons = (t, som, o = {}) => ctx.ev(t, som, { ...o });
  if (!sob) {
    // corte com movimento: cinco entradas, sempre com escala para não mostrar borda
    const M = [`{ scale: 1.14 }`, `{ scale: 1.1, x: 90 }`, `{ scale: 1.1, x: -90 }`, `{ scale: 1.12, y: 50, rotation: .9 }`, `{ scale: .98 }`][c.i % 5];
    s += `tl.fromTo("#${id}-pz", ${M}, { scale: 1, x: 0, y: 0, rotation: 0, duration: .26, ease: "power3.out", immediateRender: true }, 0);`;
    if (!c.iniCap) ctx.ev(-.05, CUTS[c.i % 3], { bus: "transicoes", dist: .15, pan: c.i % 2 ? .25 : -.25, db: -5 + (c.i % 3), origem: "corte" });
    // zoom de frase: dá sensação de novo plano dentro de cenas longas
    let esc = 1; palavras.forEach((u, k) => { if (k < palavras.length - 2 && /[.?!:]$/.test(u.w)) { const t = ENTRADA + u.t + u.d; if (t > 1.2 && t < dur - 1 && esc < 1.2) { const novo = +(esc + .055).toFixed(3); s += `tl.to("#${id}-sk", { scale: ${novo}, duration: .16, ease: "power2.out" }, ${t.toFixed(3)});`; ctx.ev(t, "whoosh_2", { bus: "transicoes", db: -14, dist: .25, origem: "zoom de frase" }); esc = novo; } } });
    AMB[c.tipo]?.(dur, sons);
  }
  // palavras que saltam
  const pops = (POP[id] ?? []).map(([w, t]) => [cue(w.split(" ")[0]) ?? null, t]).filter(([t]) => t !== null);
  pops.forEach(([t, tx], k) => { const fim = Math.min(pops[k + 1]?.[0] ?? dur, t + 1.9, dur - .08), ang = (r() * 5 - 2.5).toFixed(1), py = isV ? 300 : 96; html += `<div id="${id}-pp${k}" class="t-titulo" style="position:absolute;left:0;right:0;top:${py}px;text-align:center;opacity:0;font-size:${isV ? 88 : 128}px;letter-spacing:.015em;color:var(--creme);-webkit-text-stroke:12px var(--sombra);paint-order:stroke fill;transform-origin:50% 50%">${texto(tx)}</div>`; s += `tl.fromTo("#${id}-pp${k}", { opacity: 0, scale: 1.7, rotation: ${ang} }, { opacity: 1, scale: 1, rotation: ${ang}, duration: .17, ease: "back.out(2.6)", immediateRender: true }, ${(t - .03).toFixed(3)});tl.to("#${id}-pp${k}", { opacity: 0, scale: .92, duration: .1 }, ${fim.toFixed(3)});`; ctx.ev(t, k % 2 ? "soco" : "impacto_suave", { db: k % 2 ? -10 : -2, dist: .2, bus: "transicoes", origem: "palavra na tela" }); ctx.ev(t - .1, "whoosh_3", { db: -12, dist: .2, bus: "transicoes" }); });
  // gag: tudo escurece, carimbo torto, som seco
  const g = GAG[id]; if (g) { const t = cue(g[0]) ?? dur * .6; html += `<div id="${id}-gz" style="position:absolute;inset:0;background:var(--sombra);opacity:0"></div><div id="${id}-gg" class="t-titulo" style="position:absolute;left:${isV ? 40 : 240}px;right:${isV ? 40 : 240}px;top:${isV ? 800 : 400}px;padding:26px 20px;text-align:center;font-size:${isV ? 62 : 104}px;color:var(--vinho);background:var(--creme);border:12px solid var(--vinho);opacity:0;transform:rotate(-4deg)">${texto(g[1])}</div>`; s += `tl.fromTo("#${id}-gz", { opacity: 0 }, { opacity: .55, duration: .06, immediateRender: true }, ${t.toFixed(3)});tl.fromTo("#${id}-gg", { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: .1, ease: "power3.in", immediateRender: true }, ${t.toFixed(3)});`; ctx.ev(t, g[2], { db: g[2] === "record_scratch" ? 0 : -2, bus: "efeitos", origem: "gag" }); ctx.ev(t + .1, "carimbo", { db: 2, dist: .05 }); }
  // título de capítulo
  if (cap && CAP[cap] && c.iniCap && !isV) { html += `<div id="${id}-cap" class="t-titulo" style="position:absolute;left:0;right:0;top:400px;text-align:center;opacity:0;font-size:176px;color:var(--creme);-webkit-text-stroke:14px var(--sombra);paint-order:stroke fill;letter-spacing:.03em">${CAP[cap]}</div>`; s += `tl.fromTo("#${id}-cap", { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: .24, ease: "power3.out", immediateRender: true }, .22);tl.to("#${id}-cap", { opacity: 0, scale: 1.04, duration: .2 }, ${Math.min(dur - .2, 1.7).toFixed(2)});`; ctx.ev(.2, "impacto_suave", { db: 6, dist: .15, bus: "transicoes", origem: "capítulo" }); ctx.ev(.1, "whoosh", { db: -4, dist: .1, bus: "transicoes" }); }
  // citação em faixa, para cenas que não têm papel próprio
  if (op.cit && c.tipo === "navio") { html += `<div id="${id}-ct" style="position:absolute;left:${isV ? 40 : 200}px;right:${isV ? 40 : 200}px;top:${isV ? 1000 : 800}px;padding:26px 40px;background:var(--creme);color:var(--sombra);font-family:'Apoio Ampulheta',serif;font-style:italic;font-size:${isV ? 44 : 62}px;line-height:1.14;text-align:center;opacity:0">${op.cit}</div>`; s += `tl.fromTo("#${id}-ct", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .2, immediateRender: true }, .15);`; }
  // relâmpago nas tempestades
  if (c.tipo === "navio" && (op.mar ?? 0) >= 3 && !sob) { const n = dur > 6 ? 2 : 1; html += `<div id="${id}-rl" style="position:absolute;inset:0;background:var(--creme);opacity:0;mix-blend-mode:screen"></div>`; for (let k = 0; k < n; k++) { const t = 1 + r() * (dur - 1.8); s += `tl.fromTo("#${id}-rl", { opacity: .75 }, { opacity: 0, duration: .32, ease: "power2.out", immediateRender: false }, ${t.toFixed(2)});tl.fromTo("#${id}-rl", { opacity: .55 }, { opacity: 0, duration: .22, immediateRender: false }, ${(t + .14).toFixed(2)});`; ctx.ev(t + .35, "explosao_longe", { db: -4, dist: .72, pan: r() - .5, origem: "trovão" }); } ctx.ev(.1, "splash", { db: -4 + (op.mar ?? 0), dist: .4, pan: r() - .5, origem: "onda no casco" }); }
  if (["f045", "f046", "f049", "f050", "f051"].includes(id)) ctx.ev(.05, "coracao", { db: -2, dist: .4, origem: "tensão" });
  // tremor nascido dos próprios impactos da cena
  const FORCA = { explosao_longe: 12, soco: 3.5, carimbo: 3, impacto_suave: 7, splash: 3, record_scratch: 4 }; const hits = sob ? [] : evs.filter((e) => FORCA[e.som] && e.origem !== "palavra na tela" && e.origem !== "capítulo").map((e) => [e.t - c.t, FORCA[e.som]]);
  if (hits.length || (op.mar ?? 0) >= 4) { const N = Math.ceil(dur * FPS) + 2, base = (op.mar ?? 0) >= 4 ? 3.4 : 0; const tb = (fx, fy) => Array.from({ length: N }, (_, k) => { const t = k / FPS; let v = base * Math.sin(t * fx); for (const [h, a] of hits) if (t > h && t < h + .6) v += a * Math.exp(-(t - h) * 7) * Math.sin((t - h) * fy); return +v.toFixed(2); }); F.push([`${id}-sk`, "x", tb(2.3, 62), null], [`${id}-sk`, "y", tb(3.1, 74), null]); }
  return { html, script: s, faixas: F };
}
