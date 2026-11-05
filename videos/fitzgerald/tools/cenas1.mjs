// Cenas: retratos, mar, mapas, submarino, ataque.
import { EXPRESSOES } from "../../../motor/personagem/atuacao.mjs";
import { C, FPS, camada, push, fade, lisa, tab, ceu, estrelas, nuvens, mar, fundoAgua, bolhas, sub, helice, navioCasco, aviao, silhueta, mesa, parado, andando, PR, MAPAS, crista, tufos, fumaca, rng, busto, personagem, rosto, andarEParar, gerar, MARCHA, faixasCorpo, secundarios, seguir, passosDe, evento } from "./lib.mjs";

export const V = {};
/* --- DEZ HOMENS --- */
V.dez = (c, o) => {
  const { id, dur, v } = c, f = o.f ?? 0; const pos = v ? [...[0, 1, 2].flatMap((l) => [0, 1, 2].map((k) => [760 + k * 200, 170 + l * 245])), [960, 905]] : Array.from({ length: 10 }, (_, k) => [150 + k * 180, 600]);
  const e = v ? .78 : .84, ouro = (i) => f === 3 || (f >= 1 && i < 9 && f !== 0);
  let g = "", s = "";
  pos.forEach(([x, y], i) => { g += silhueta(x, y, e, C.an, `${id}-a${i}`) + `<g id="${id}-o${i}" opacity="${f >= 2 && i < 9 ? 1 : 0}">${silhueta(x, y, e, C.l)}</g>`; });
  if (f === 0) pos.forEach((_, i) => { s += fade(`#${id}-a${i}`, 0, 1, .22, .2 + i * .28 * Math.min(1, (dur - .4) / 3.2)); });
  if (f === 1) { const tNove = c.cue("Nine") ?? .2; pos.slice(0, 9).forEach((_, i) => { const t = tNove + i * .16; s += fade(`#${id}-o${i}`, 0, 1, .25, t); c.ev(t, "tecla", { db: -6, dist: .2, bus: "efeitos", origem: "rosto acende" }); }); }
  if (f === 2) { const t1 = (c.cue("struck") ?? dur * .55) - .1; s += fade(`#${id}-a9`, 1, 0, .9, t1); s += `tl.fromTo("#${id}-tr", { opacity: 0 }, { opacity: 1, duration: .5, immediateRender: true }, ${t1 + .35});`; c.ev(t1, "carimbo", { db: -2, dist: .08 }); }
  if (f === 3) { for (let i = 0; i < 9; i++) s += `tl.set("#${id}-o${i}", { opacity: 1 }, 0);`; s += `tl.set("#${id}-a9", { opacity: 0 }, 0);`; s += `tl.fromTo("#${id}-glo", { opacity: .15 }, { opacity: .55, duration: DUR, ease: "sine.inOut" }, 0);`; }
  const [xT, yT] = pos[9];
  const corpo = `${camada(`${id}-c0`, `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${C.oc}" stop-opacity=".55"/><stop offset="1" stop-color="${C.s}" stop-opacity="0"/></radialGradient></defs><rect x="-200" y="-100" width="2320" height="1280" fill="${C.s}"/><ellipse id="${id}-glo" cx="960" cy="${v ? 520 : 640}" rx="${v ? 600 : 1200}" ry="${v ? 620 : 500}" fill="url(#${id}-g)"/><rect x="-100" y="${v ? 2000 : 742}" width="2200" height="400" fill="${C.s}" opacity=".5"/>`)}
    ${camada(`${id}-c1`, `${g}<g id="${id}-tr" opacity="0"><path transform="translate(${xT},${yT}) scale(${e})" fill="none" stroke="${C.oc}" stroke-width="4" stroke-dasharray="12 10" d="M-90,170 C-88,110 -60,86 -22,76 L-20,50 C-40,36 -46,10 -44,-16 L-54,-22 L-46,-34 C-46,-62 -24,-74 2,-74 C28,-74 48,-62 48,-34 L54,-22 L44,-16 C46,10 40,36 20,50 L22,76 C60,86 88,110 90,170"/></g>`)}`;
  return { corpo, script: push(id, 1, f === 0 ? 1.03 : 1.05, "50% 50%") + s, faixas: [], foco: 960, amb: "interior" };
};

/* --- RETRATO --- */
V.retrato = (c, o) => {
  const { id, dur } = c, P = o.velho ? PR.velho : o.preso ? PR.preso : PR.sakamaki;
  const tipoBg = o.escuro ? "crepusculo" : o.claro ? "aurora" : o.velho ? "cinza" : o.preso ? "cinza" : "noite";
  const barras = o.preso ? Array.from({ length: 13 }, (_, i) => `<rect x="${-30 + i * 170}" y="-100" width="12" height="1300" fill="${C.s}" opacity=".5"/>`).join("") + `<path d="M-100,180 L2100,180 M-100,330 L2100,330 M-100,480 L2100,480" stroke="${C.s}" stroke-width="5" opacity=".42"/>` : "";
  const olhaPara = { baixo: [{ t: 0, x: .4, y: .75 }], frente: [{ t: 0, x: .55, y: -.05 }], lado: [{ t: 0, x: .9, y: -.2 }] }[o.olha ?? "lado"] ?? [{ t: 0, x: .7, y: -.1 }];
  const rot = [{ t: 0, e: o.e ?? "neutra" }];
  const petalas = o.petalas ? (() => { const r = rng(9); let s = "", an = ""; for (let i = 0; i < 26; i++) { const x = r() * 2100 - 100, w = 6 + r() * 9; s += `<g id="${id}-pt${i}" transform="translate(${x.toFixed(0)},-40)"><ellipse rx="${w.toFixed(1)}" ry="${(w * .55).toFixed(1)}" fill="${C.cr}" opacity=".75" transform="rotate(${(r() * 90).toFixed(0)})"/></g>`; const y0 = 900 * r() - 700; an += `tl.fromTo("#${id}-pt${i}", { y: ${y0.toFixed(0)}, x: 0 }, { y: ${(y0 + 130 * dur).toFixed(0)}, x: ${(r() * 240 - 120).toFixed(0)}, duration: DUR, ease: "none", immediateRender: true }, 0);`; } return { s, an }; })() : { s: "", an: "" };
  const lentidao = o.lento ? 1.11 : 1.07;
  const giro = [{ t: 0, v: o.olha === "baixo" ? -.3 : .1 }];
  const faixas = [[`${id}-a-om`, "y", tab(dur, (t) => 2.6 * Math.sin(6.283 * t / 3.4))], [`${id}-a-hd`, "rotation", tab(dur, (t) => (o.olha === "baixo" ? 3.5 : .4) + .9 * Math.sin(6.283 * t / 3.1 + 1)), "0 90"], [`${id}-a-hd`, "y", tab(dur, (t) => (o.olha === "baixo" ? 10 : 0) + 1.8 * Math.sin(6.283 * t / 3.4))], ...rosto(`${id}-a`, "busto", dur + .2, { roteiro: rot, olhar: olhaPara, giro, seed: c.n + 4, biblioteca: { ...EXPRESSOES, tristeza: { pl: .34, pi: .22, so: .28, sa: .7, boca: "b0" } } })];
  let s = push(id, 1, lentidao, "44% 42%") + petalas.an;
  if (o.desbota) s += `tl.fromTo("#${id}-db", { opacity: 0 }, { opacity: .62, duration: DUR * .85, ease: "sine.in" }, .2);`;
  if (o.lagrima) s += `tl.fromTo("#${id}-lg", { opacity: 0, y: 0 }, { opacity: .95, y: 0, duration: .5, immediateRender: true }, ${(dur * .22).toFixed(2)});tl.to("#${id}-lg", { y: 150, duration: 1.8, ease: "power1.in" }, ${(dur * .36).toFixed(2)});tl.to("#${id}-lg", { opacity: 0, duration: .3 }, ${(dur * .36 + 1.6).toFixed(2)});`;
  if (o.lento) { c.ev(.1, "coracao", { db: -8, dist: .5, bus: "efeitos", origem: "reencontro" }); }
  const corpo = `${ceu(id, tipoBg, 1500, 520, 620)}${camada(`${id}-bg`, `${o.preso ? "" : `<path d="${crista(4 + c.n, 760, 30, 2800, 16)}" fill="${C.s}" opacity=".45"/>`}${barras}`)}${petalas.s ? camada(`${id}-pf`, petalas.s) : ""}${camada(`${id}-b`, busto(`${id}-a`, P, { x: 800, y: 500, e: 1.62 }))}${o.lagrima ? camada(`${id}-lc`, `<path id="${id}-lg" opacity="0" d="M770,478 C764,492 760,500 760,508 C760,518 780,518 780,508 C780,500 776,492 770,478 Z" fill="${C.cr}"/>`) : ""}<div id="${id}-db" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>`;
  return { corpo, script: s, faixas, foco: 860, amb: o.preso ? "interior" : "seco", semCorte: 1 };
};

/* --- AVIÕES SOBRE O PORTO --- */
V.avioes = (c) => {
  const { id, dur } = c; const pl = []; for (let i = 0; i < 9; i++) pl.push(aviao(-600 + (i % 3) * 170 + i * 60, 230 + (i % 3) * 66 + i * 11, 1.25 - i * .03));
  const corpo = `${ceu(id, "aurora", 1420, 650, 520)}${camada(`${id}-c1`, `${nuvens(3, 180, C.cr, .22)}<path d="${crista(6, 640, 60, 2800, 12)}" fill="${C.ol}" opacity=".55"/>`)}${camada(`${id}-pl`, pl.join(""))}${camada(`${id}-c2`, `${mar(id, 720, C.an, C.l)}${navioCasco(420, 720, .55)}${navioCasco(1100, 730, .68)}${navioCasco(1640, 722, .5)}<path d="${crista(9, 930, 12, 2800, 22)}" fill="${C.mu}"/>`)}${camada(`${id}-c3`, `<path d="${crista(14, 1010, 16, 2800, 24)}" fill="${C.s}"/>${tufos(5, 40, -100, 2100, 985, 60, C.s)}`)}`;
  c.ev(.2, "aviao", { dist: .35, pan: -.2, origem: "esquadrilha cruza" });
  return { corpo, script: `${push(id, 1, 1.06)}tl.fromTo("#${id}-pl", { x: -200 }, { x: 2500, duration: DUR, ease: "none" }, 0);`, faixas: [], foco: 1100, amb: "campo" };
};

/* --- MINISSUBMARINO NA ÁGUA --- */
V.subMar = (c, o) => {
  const { id, dur } = c, m = o.modo; let s = "", cena = "";
  const b = bolhas(id, 16, 300, 1600, 900, c.n + 2);
  if (m === "sob" || m === "navios") { cena = `<path d="M-300,30 L2300,30 L2300,-200 L-300,-200 Z" fill="${C.m}"/><g id="${id}-nv">${navioCasco(600, 40, .9)}${navioCasco(1500, 40, 1)}</g>${sub(`${id}-s`, 600, 640, .85)}`; s += `tl.fromTo("#${id}-s", { x: -200 }, { x: 680, duration: DUR, ease: "none" }, 0);`; if (m === "navios") s += `tl.fromTo("#${id}-nv", { x: 0 }, { x: 460, duration: DUR, ease: "sine.in" }, 0);`; }
  if (m === "desce") { cena = sub(`${id}-s`, 960, 300, .95); s += `tl.fromTo("#${id}-s", { y: -40, rotation: 0, svgOrigin: "0 0" }, { y: 480, rotation: 24, svgOrigin: "0 0", duration: DUR, ease: "sine.inOut" }, 0);`; c.ev(.3, "whoosh", { bus: "efeitos", db: -8, dist: .5 }); }
  if (m === "so") { cena = sub(`${id}-s`, 960, 560, .9); s += `tl.fromTo("#${id}-s", { x: -80 }, { x: 80, duration: DUR, ease: "none" }, 0);`; }
  if (m === "vazio") { cena = ""; }
  const corpo = `${fundoAgua(id, m === "vazio" || m === "so" ? 1 : 0)}${camada(`${id}-c1`, `<path d="${crista(8 + c.n, 960, 40, 2800, 20)}" fill="${C.s}"/>${b.s}`)}${camada(`${id}-c2`, cena)}${camada(`${id}-c3`, `<path d="${crista(19 + c.n, 1040, 26, 2800, 14)}" fill="${C.s}"/>`)}`;
  s += b.an + (cena.includes(`${id}-s-hel`) ? helice(`${id}-s`) : "") + push(id, m === "so" ? 1.14 : 1, m === "so" ? 1 : 1.05);
  return { corpo, script: s, faixas: [], foco: m === "desce" ? 960 : 1100, amb: "interior", ambSom: "agua" };
};

/* --- SUBMARINO-MÃE --- */
V.mae = (c, o) => {
  const { id, dur } = c, m = o.modo;
  const casco = (x, y, e) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${C.s}" d="M-900,20 C-860,-30 -760,-44 -600,-46 L700,-46 C820,-44 900,-12 930,20 C900,60 820,70 700,72 L-600,72 C-760,70 -860,60 -900,20 Z"/><path fill="${C.an}" d="M-860,4 C-800,-28 -720,-40 -600,-42 L700,-42 C800,-40 870,-18 910,6 Z"/><path fill="${C.s}" d="M-120,-44 L-90,-170 L180,-170 L220,-44 Z"/><rect x="-10" y="-250" width="12" height="90" fill="${C.s}"/><rect x="60" y="-226" width="10" height="70" fill="${C.s}"/></g>`;
  let corpo, s = "";
  if (m === "carrega") {
    corpo = `${ceu(id, "noite", 1500, 240, 300)}${camada(`${id}-c1`, `${estrelas(11)}${nuvens(7, 330, C.an, .6)}`)}${camada(`${id}-g`, `${casco(1040, 690, .96)}${sub(`${id}-s`, 650, 610, .62, { luz: C.m, base: C.ol })}<g stroke="${C.t}" stroke-width="5"><path d="M540,640 L540,646 M760,640 L760,646"/></g>`)}${camada(`${id}-c2`, `${mar(id, 740, C.an, C.m)}`)}`;
    s = `tl.fromTo("#${id}-g", { x: -140, y: 0 }, { x: 170, y: 0, duration: DUR, ease: "none" }, 0);tl.fromTo("#${id}-c2", { x: 40 }, { x: -240, duration: DUR, ease: "none" }, 0);${push(id, 1, 1.05)}`;
    c.ev(.1, "mar", { bus: "efeitos", db: -14, dist: .6 });
    return { corpo, script: s, faixas: [], foco: 720, amb: "campo", ambSom: "mar" };
  }
  const b = bolhas(id, 22, 600, 1300, 720, 5);
  corpo = `${fundoAgua(id, 1)}${camada(`${id}-c1`, `${casco(960, 260, 1)}${sub(`${id}-s`, 700, 150, .62, { luz: C.m, base: C.ol })}${b.s}`)}${camada(`${id}-c3`, `<path d="${crista(30, 1040, 22, 2800, 14)}" fill="${C.s}"/>`)}`;
  const t = dur * .3;
  s = `tl.fromTo("#${id}-s", { x: 0, y: 0, rotation: 0, svgOrigin: "0 0" }, { x: 480, y: 560, rotation: 7, svgOrigin: "0 0", duration: ${(dur - t).toFixed(2)}, ease: "power1.in", immediateRender: true }, ${t.toFixed(2)});${b.an}${helice(`${id}-s`)}${push(id, 1, 1.05)}`;
  c.ev(t, "impacto_suave", { bus: "transicoes", db: -5, origem: "cabos soltam" }); c.ev(t + .02, "equipamento", { db: 2, dist: .2 });
  return { corpo, script: s, faixas: [], foco: 1000, amb: "interior", ambSom: "agua" };
};

/* --- MAPA --- */
function terraPorto(id, papel) {
  const T = papel ? C.tc : C.tc, S = papel ? C.p : C.m;
  return `<rect x="-400" y="-300" width="2800" height="1700" fill="${S}"/>
    <path fill="${T}" stroke="${C.t}" stroke-width="3" d="M-400,-300 L2400,-300 L2400,760 C2100,790 1800,740 1500,780 C1300,800 1100,770 1000,790 L960,830 L860,830 L810,800 C700,770 520,810 300,770 C100,740 -200,790 -400,760 Z"/>
    <path fill="${S}" stroke="${C.t}" stroke-width="3" d="M860,830 L960,830 L990,650 C1150,620 1340,470 1300,300 C1270,190 1120,170 1060,240 C1010,180 920,120 800,150 C620,180 420,160 340,300 C300,390 420,450 520,420 C600,470 700,420 760,500 C820,580 850,720 860,830 Z"/>
    <path fill="${T}" stroke="${C.t}" stroke-width="3" d="M780,400 C820,330 940,300 1040,340 C1120,370 1150,430 1100,490 C1040,550 900,560 820,510 C770,480 760,440 780,400 Z"/>
    ${[...Array(30)].map((_, i) => { const x = -100 + i * 84; if (x > 780 && x < 1020) return ""; return `<circle cx="${x}" cy="${862 + (i % 3) * 8}" r="${6 + i % 3 * 3}" fill="${C.t}" opacity=".7"/>`; }).join("")}
    <text x="960" y="430" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="42" letter-spacing="3" fill="${C.t}">FORD ISLAND</text>
    <text x="1500" y="240" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="70" letter-spacing="10" fill="${C.t}" opacity=".75">PEARL HARBOR</text>
    <text x="500" y="920" font-family="Apoio Ampulheta" font-style="italic" font-size="36" fill="${C.s}" opacity=".7">reef</text>`;
}
const ROTAS = {
  plano: "M910,1120 L910,830 L920,640 C860,560 730,510 700,400 C720,250 900,210 1080,250 C1220,310 1230,470 1120,560 C1040,620 980,640 950,700 L930,830 L1040,1120",
  ford: "M910,1120 L910,830 L920,640 C860,560 730,510 700,400 C720,250 900,210 1080,250 C1220,310 1230,470 1120,560 C1040,620 980,640 950,700 L930,830 L1040,1120",
  zigue: "M1720,1030 C1570,890 1510,1040 1370,920 C1250,830 1240,1040 1090,950 C990,890 1040,1030 850,960",
  erra: "M1720,1020 C1400,980 1200,1000 980,950 C780,910 620,960 420,890",
};
V.mapa = (c, o) => {
  const { id, dur, v } = c; let corpo, s = "";
  if (o.z === "porto") {
    const rt = o.rota ? ROTAS[o.rota] : ""; const cor = o.papel ? C.v : C.v;
    const sufixo = rt ? `<path id="${id}-r1" d="${rt}" fill="none" stroke="${C.s}" stroke-width="13" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/><path id="${id}-r2" d="${rt}" fill="none" stroke="${cor}" stroke-width="7" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/>` : "";
    let marcas = "";
    if (o.destinos) { const M = [[1130, 925, "SUNK", .4], [1090, 215, "RAMMED", .55], [1560, 925, "?", .72], [420, 925, "?", .78]]; M.forEach(([x, y, tx, u], i) => { marcas += `<g id="${id}-m${i}" opacity="0" transform="translate(${x},${y})"><path d="M-22,-22 L22,22 M22,-22 L-22,22" stroke="${C.v}" stroke-width="11"/><text y="72" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="50" fill="${C.s}">${tx}</text></g>`; s += fade(`#${id}-m${i}`, 0, 1, .2, dur * u * (i < 2 ? .9 : 1)); c.ev(dur * u * (i < 2 ? .9 : 1), "carimbo", { db: -8, dist: .15 }); }); s = `/*d*/` + s; }
    corpo = camada(`${id}-m`, `${terraPorto(id, o.papel)}${o.papel ? [...Array(13)].map((_, i) => `<path d="M${-200 + i * 200},-300 L${-200 + i * 200},1400 M-400,${-200 + i * 150} L2400,${-200 + i * 150}" stroke="${C.t}" stroke-width="1.5" opacity=".28"/>`).join("") : ""}${sufixo}${marcas}`);
    if (rt) s += `tl.fromTo(["#${id}-r1","#${id}-r2"], { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": ${o.rota === "erra" || o.rota === "zigue" ? 0 : 0} }, duration: ${(dur * .88).toFixed(2)}, ease: "none" }, .1);`;
    s += push(id, 1, 1.07, "48% 60%"); if (v) s += "";
    return { corpo, script: s, faixas: [], foco: o.rota === "zigue" || o.rota === "erra" ? 1150 : 930, amb: "seco" };
  }
  const M = MAPAS.ilhas, L = M.locais; const P = (k) => L[k]; let extra = "";
  if (o.cinco) ["s1", "s2", "s3", "s4", "s5"].forEach((k, i) => { const [x, y] = P(k); extra += `<g id="${id}-p${i}" opacity="0" transform="translate(${x},${y})"><circle r="11" fill="${C.v}" stroke="${C.cr}" stroke-width="3"/></g>`; s += fade(`#${id}-p${i}`, 0, 1, .15, .9 + i * .28); c.ev(.9 + i * .28, "tecla", { db: -6, dist: .2 }); });
  const rotaT = o.rota === "deriva" ? `M${P("porto")[0]},${P("porto")[1] + 14} C${P("cabo_d")[0] - 60},${P("cabo_d")[1] + 60} ${P("koko")[0] - 40},${P("koko")[1] + 60} ${P("mak")[0] + 34},${P("mak")[1] + 12} L${P("bellows")[0] + 30},${P("bellows")[1]}` : o.rota === "lanai" ? `M${P("porto")[0]},${P("porto")[1] + 14} C${P("i24")[0] + 60},${P("i24")[1] + 110} ${P("lanai")[0] - 170},${P("lanai")[1] - 70} ${P("lanai")[0] - 58},${P("lanai")[1] + 6}` : "";
  if (rotaT) { extra += `<path id="${id}-r1" d="${rotaT}" fill="none" stroke="${C.s}" stroke-width="10" stroke-dasharray="100 120" stroke-dashoffset="110" pathLength="100"/><path id="${id}-r2" d="${rotaT}" fill="none" stroke="${C.v}" stroke-width="5" stroke-dasharray="100 120" stroke-dashoffset="110" pathLength="100"/>`; s += `tl.fromTo(["#${id}-r1","#${id}-r2"], { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: ${(dur * .85).toFixed(2)}, ease: "none" }, .1);`; }
  const rot = (k, tx, dx = 18, dy = 12, g = 38) => `<text x="${P(k)[0] + dx}" y="${P(k)[1] + dy}" font-family="Titulo Ampulheta" font-weight="600" font-size="${g}" letter-spacing="2" fill="${C.s}">${tx}</text>`;
  extra += `<circle cx="${P("porto")[0]}" cy="${P("porto")[1]}" r="12" fill="${C.v}" stroke="${C.s}" stroke-width="3"/>${rot("porto", "PEARL HARBOR", -320, 60)}${rot("oahu", "OAHU", -60, 0, 62)}`;
  if (o.rota === "lanai") extra += rot("lanai", "LANAI", -50, -70);
  if (o.rota === "deriva") extra += `<circle cx="${P("bellows")[0]}" cy="${P("bellows")[1]}" r="12" fill="${C.v}" stroke="${C.s}" stroke-width="3"/>${rot("bellows", "BELLOWS FIELD", 26, -8)}`;
  corpo = `<div id="${id}-m" class="camada" style="width:2400px;height:1350px" data-layout-ignore><svg viewBox="0 0 2400 1350" class="cheio"><rect x="-300" y="-300" width="3000" height="2000" fill="${C.m}"/><path d="${M.terra}" fill="${C.tc}" stroke="${C.t}" stroke-width="3"/>${extra}</svg></div>`;
  const zoom = o.rota === "lanai" ? 1 : 1.55, cx = o.rota === "lanai" ? 1200 : P("porto")[0] + 240, cy = o.rota === "lanai" ? 700 : P("porto")[1] + 40; const tx = 960 - cx * zoom, ty = 540 - cy * zoom;
  s += `tl.set("#${id}-m", { transformOrigin: "0 0" }, 0);tl.fromTo("#${id}-m", { x: ${tx.toFixed(0)}, y: ${ty.toFixed(0)}, scale: ${zoom} }, { x: ${(tx - cx * .06).toFixed(0)}, y: ${(ty - cy * .06).toFixed(0)}, scale: ${zoom * 1.06}, duration: DUR, ease: "none" }, 0);`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "seco" };
};

/* --- DOCA DE KURE --- */
V.doca = (c) => {
  const { id, dur } = c, Y = 900, e = 1.45, x0 = 280;
  const G = gerar(MARCHA, dur + 2, { S: MARCHA.S / e }), R = andarEParar(G, MARCHA, { tMin: Math.max(1, dur * .45), dur: dur + .2, idle: [{ t: dur * .6, d: .5, tr: -1 }] });
  const T = R.T, hip = T.rtx.map((x) => x0 + x * e), cam = seguir(hip, { telaX: 620, inicio: hip[0] - 620, lag: 3 }).map((x) => Math.max(0, x));
  const corpo = `${ceu(id, "crepusculo", 1400, 500)}${camada(`${id}-c1`, `<path d="${crista(4, 560, 60, 3600, 12)}" fill="${C.an}" opacity=".6"/>${navioCasco(1500, 560, .7, C.an)}<path d="M500,560 L500,180 L760,180 M500,240 L640,180 M760,180 L760,340" stroke="${C.an}" stroke-width="16" fill="none"/>`)}${camada(`${id}-g`, `${mar(id, 600, C.an, C.oc)}<g transform="translate(1300,640)">${sub(`${id}-s`, 0, 0, 1.1)}<rect x="-300" y="50" width="600" height="40" fill="${C.t}"/></g><rect x="-400" y="${Y - 60}" width="4200" height="340" fill="${C.t}"/><rect x="-400" y="${Y - 62}" width="4200" height="18" fill="${C.s}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${-200 + i * 520}" y="${Y - 100}" width="30" height="44" fill="${C.s}"/>`).join("")}${personagem(`${id}-a`, PR.sakamaki, { x: x0, y: Y, e })}`)}`;
  const faixas = [[`${id}-g`, "x", cam.map((x) => -x)], [`${id}-c1`, "x", cam.map((x) => -x * .2)], ...faixasCorpo(`${id}-a`, T), ...secundarios(`${id}-a`, T), ...rosto(`${id}-a`, "perfil", dur + .2, { roteiro: [{ t: 0, e: "atenta" }], olhar: [{ t: 0, x: .8, y: 0 }], seed: 4 })];
  c.evs(passosDe("Sakamaki", T, { dist: .2, telaX: () => 700, superficie: "madeira", ate: dur }));
  return { corpo, script: push(id, 1, 1.05), faixas, foco: 780, amb: "rua" };
};

/* --- PLANTA --- */
V.planta = (c, o) => {
  const { id, dur } = c; const g = []; for (let i = 0; i < 26; i++) g.push(`<path d="M${-200 + i * 100},-100 L${-200 + i * 100},1200" stroke="${C.cr}" stroke-width="1" opacity=".1"/>`); for (let i = 0; i < 15; i++) g.push(`<path d="M-200,${-100 + i * 100} L2200,${-100 + i * 100}" stroke="${C.cr}" stroke-width="1" opacity=".1"/>`);
  const LN = C.cr; let s = "";
  const hull = `<g transform="translate(960,520) scale(2.5)" fill="none" stroke="${LN}" stroke-width="1.6">
    <path d="M-262,0 C-262,-28 -214,-44 -150,-46 L170,-46 C232,-46 266,-22 266,0 C266,22 232,46 170,46 L-150,46 C-214,44 -262,28 -262,0 Z" id="${id}-hul" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/>
    <path d="M-30,-46 L-22,-92 L46,-92 L58,-46 M6,-92 L6,-136 L24,-136 M-262,-6 L-300,-34 L-300,34 L-262,6"/>
    <g id="${id}-bat" opacity="${o.bat ? 0 : .55}">${[...Array(9)].map((_, i) => `<rect x="${-90 + i * 24}" y="10" width="20" height="30" ${o.bat ? `fill="${C.oc}"` : ""}/>`).join("")}</g>
    <g id="${id}-tor" stroke="${o.tor ? C.l : LN}" stroke-width="${o.tor ? 2.2 : 1}"><path d="M130,-26 L250,-26 C256,-26 258,-20 258,-18 C258,-14 254,-12 250,-12 L130,-12 Z"/><path d="M130,10 L250,10 C256,10 258,16 258,18 C258,22 254,24 250,24 L130,24 Z"/></g>
  </g>`;
  s += `tl.fromTo("#${id}-hul", { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: ${Math.min(1.1, dur * .4)}, ease: "power1.inOut" }, .05);`;
  if (o.bat) s += fade(`#${id}-bat`, 0, 1, .5, .6);
  let extra = "";
  if (o.cota === "78 FEET") { extra = `<g id="${id}-ct" opacity="0"><path d="M210,700 L1712,700 M210,680 L210,720 M1712,680 L1712,720" stroke="${C.l}" stroke-width="4"/></g>`; s += fade(`#${id}-ct`, 0, 1, .4, Math.min(1, dur * .3)); }
  if (o.cota === "6 FEET WIDE") { extra = `<g id="${id}-ct" opacity="0"><path d="M1690,405 L1690,635 M1670,405 L1710,405 M1670,635 L1710,635" stroke="${C.l}" stroke-width="4"/></g>`; s += fade(`#${id}-ct`, 0, 1, .4, Math.min(1.4, dur * .5)); }
  if (o.tor === 2) { extra = `<g id="${id}-x" opacity="0" transform="translate(1430,520)"><path d="M-120,-90 L120,90 M120,-90 L-120,90" stroke="${C.v}" stroke-width="24" stroke-linecap="round"/></g>`; s += `tl.fromTo("#${id}-x", { opacity: 0, scale: 1.5, svgOrigin: "0 0" }, { opacity: 1, scale: 1, svgOrigin: "0 0", duration: .14, ease: "power3.in", immediateRender: true }, ${(dur * .35).toFixed(2)});`; c.ev(dur * .35 + .1, "soco", { db: -6, dist: .15 }); }
  const rot = o.cota ? `<text id="${id}-tc" x="${o.cota === "6 FEET WIDE" ? 1450 : 960}" y="${o.cota === "6 FEET WIDE" ? 780 : o.cota === "HA-19" ? 860 : 790}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="84" letter-spacing="6" fill="${C.l}" opacity="0">${o.cota}</text>` : "";
  if (o.cota) s += fade(`#${id}-tc`, 0, 1, .35, Math.min(1.2, dur * .35));
  if (o.zoom) s += push(id, 1.45, 1.55, "86% 50%"); else s += push(id, 1, 1.04, "50% 50%");
  c.ev(.05, "papel", { db: -8, dist: .1 });
  return { corpo: camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}"/>${g.join("")}${hull}${extra}${rot}`), script: s, faixas: [], foco: o.zoom ? 1500 : o.tor ? 1400 : 960, amb: "seco" };
};

/* --- FILA --- */
V.fila = (c, o) => {
  const { id, dur } = c, Y = 900; let figs = "", F = [];
  for (let i = 0; i < 6; i++) { const pre = `${id}-m${i}`, x = 200 + i * 300; figs += personagem(pre, i === 3 ? PR.sakamaki : PR.inagaki, { x, y: Y, e: 1.5 }); F.push(...parado(pre, dur, { seed: 3 + i * 5, rot: [{ t: 0, e: "atenta" }], olhar: [{ t: 0, x: .8, y: 0 }] })); }
  const fam = o.mod === "familia" ? camada(`${id}-fm`, `<rect x="-200" y="-100" width="2300" height="1280" fill="${C.s}"/>${[...Array(9)].map((_, i) => silhueta(350 + i * 150, 540 - (i < 2 ? 40 : 0), i < 2 ? .95 : .7 - (i % 3) * .05, C.tc, `${id}-f${i}`)).join("")}`, "opacity:0") : "";
  let s = `tl.fromTo("#${id}-g", { x: 60 }, { x: -60, duration: DUR, ease: "none" }, 0);${push(id, 1, 1.04)}`;
  if (fam) { s += fade(`#${id}-fm`, 0, 1, .5, .15); s += `tl.to("#${id}-f5", { opacity: .15, duration: 1.3, ease: "sine.inOut" }, ${(c.cue("survive") ?? dur * .7).toFixed(2)});`; }
  const corpo = `${ceu(id, "cinza", 960, 400, 700)}${camada(`${id}-c1`, `<path d="${crista(8, 620, 40, 2800, 12)}" fill="${C.an}" opacity=".5"/>`)}${camada(`${id}-g`, `<rect x="-400" y="${Y - 8}" width="2800" height="300" fill="${C.t}"/>${figs}`)}${fam}`;
  return { corpo, script: s, faixas: F, foco: 1100, amb: "rua" };
};

/* --- BAÍA --- */
V.baia = (c) => {
  const { id } = c;
  const corpo = `${ceu(id, "aurora", 960, 480, 480)}${camada(`${id}-c1`, `<path d="${crista(3, 480, 90, 2800, 10)}" fill="${C.an}" opacity=".7"/><path d="${crista(7, 560, 60, 2800, 12)}" fill="${C.ol}" opacity=".8"/>`)}${camada(`${id}-c2`, `${mar(id, 640, C.an, C.l)}<g id="${id}-pe"><rect x="880" y="540" width="9" height="124" fill="${C.s}"/><path d="M880,540 L912,540 L912,552 L880,552 Z" fill="${C.s}"/><path d="M500,672 Q700,690 882,664 L882,676 Q700,700 500,684 Z" fill="${C.cr}" opacity=".5"/></g>`)}${camada(`${id}-c3`, `<path d="${crista(14, 960, 26, 2800, 18)}" fill="${C.mu}"/>${tufos(3, 60, -100, 2100, 950, 72, C.s)}<path d="${crista(29, 1040, 16, 2800, 18)}" fill="${C.s}"/>`)}`;
  return { corpo, script: `${push(id, 1, 1.06)}tl.fromTo("#${id}-pe", { x: -380 }, { x: 620, duration: DUR, ease: "none" }, 0);`, faixas: [], foco: 960, amb: "campo", ambSom: "mar" };
};

/* --- BATERIA --- */
V.bateria = (c) => {
  const { id, dur } = c, W = 1000, X = 460, t0 = c.cue("batteries") ?? dur * .3;
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}"/><g transform="translate(${X},360)"><rect x="-14" y="-14" width="${W + 28}" height="208" rx="16" fill="none" stroke="${C.cr}" stroke-width="10"/><rect x="${W + 20}" y="50" width="44" height="80" fill="${C.cr}"/><rect id="${id}-nv" x="0" y="0" width="${W}" height="180" fill="${C.l}" style="transform-box:fill-box"/></g>
    <g transform="translate(260,740)"><path d="M0,0 L1400,0" stroke="${C.cr}" stroke-width="5" stroke-dasharray="20 18" opacity=".55"/><path id="${id}-rt" d="M0,0 L800,0" stroke="${C.v}" stroke-width="13" stroke-linecap="round" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/><circle cx="0" cy="0" r="14" fill="${C.cr}"/><circle cx="1400" cy="0" r="14" fill="${C.cr}"/><text x="0" y="74" font-family="Titulo Ampulheta" font-weight="600" font-size="44" fill="${C.cr}">HARBOR</text><text x="1400" y="74" text-anchor="end" font-family="Titulo Ampulheta" font-weight="600" font-size="44" fill="${C.cr}">RENDEZVOUS</text></g>`)}`;
  const script = `${push(id, 1, 1.04, "50% 50%")}tl.fromTo("#${id}-nv", { scaleX: 1, transformOrigin: "0% 50%" }, { scaleX: .03, transformOrigin: "0% 50%", duration: ${(dur - t0 - .2).toFixed(2)}, ease: "none", immediateRender: true }, ${t0.toFixed(2)});tl.fromTo("#${id}-nv", { fill: "var(--luz)" }, { fill: "var(--vinho)", duration: ${(dur - t0 - .6).toFixed(2)}, ease: "none", immediateRender: false }, ${t0.toFixed(2)});tl.fromTo("#${id}-rt", { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: ${(dur - t0 - .2).toFixed(2)}, ease: "none" }, ${t0.toFixed(2)});`;
  return { corpo, script, faixas: [], foco: 960, amb: "seco" };
};

/* --- CARTA --- */
V.carta = (c, o) => {
  const { id, dur } = c, cit = o.cit; let lin = "", s = "";
  const r = rng(5 + c.n); for (let i = 0; i < 10; i++) { const y = 240 + i * 62, w = 480 - r() * 90; if (!cit || i > 6) lin += `<rect id="${id}-l${i}" x="620" y="${y}" width="${w.toFixed(0)}" height="5" fill="${C.t}" opacity="${cit ? .35 : .75}"/>`; if (!cit) { s += `tl.fromTo("#${id}-l${i}", { scaleX: 0, transformOrigin: "0% 50%", svgOrigin: "620 ${y}" }, { scaleX: 1, svgOrigin: "620 ${y}", duration: ${(dur * .08).toFixed(2)}, ease: "none", immediateRender: true }, ${(.3 + i * dur * .08).toFixed(2)});`; } }
  const corpo = `${mesa(id, C.an)}${camada(`${id}-pap`, `<g transform="rotate(-2 960 540)"><rect x="566" y="136" width="830" height="890" fill="${C.s}" opacity=".5"/><path fill="${C.p}" d="M550,120 L1370,114 L1376,1010 L556,1016 Z"/><path d="M552,560 L1372,556" stroke="${C.t}" stroke-width="2" opacity=".24"/>${lin}${cit ? `<foreignObject x="610" y="280" width="710" height="500"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Apoio Ampulheta',serif;font-style:italic;font-size:62px;line-height:1.18;color:var(--sombra)">${[...cit].map((ch, i) => `<span id="${id}-q${i}" style="opacity:0">${ch}</span>`).join("")}</div></foreignObject>` : ""}</g>`)}`;
  if (cit) { const n = [...cit].length, dt = Math.min(.05, (dur - 1) / n); [...cit].forEach((_, i) => { s += `tl.set("#${id}-q${i}", { opacity: 1 }, ${(.2 + i * dt).toFixed(3)});`; }); }
  c.ev(.2, "papel", { dist: .1, db: -4 });
  return { corpo, script: push(id, 1, 1.05, "50% 45%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- ALTAR --- */
V.altar = (c) => {
  const { id, dur } = c;
  const chama = (x, y, sf) => `<g transform="translate(${x},${y})"><rect x="-11" y="0" width="22" height="130" fill="${C.cr}"/><g id="${id}-${sf}"><path d="M0,-58 C20,-30 16,-4 0,0 C-16,-4 -20,-30 0,-58 Z" fill="${C.l}"/><path d="M0,-32 C8,-18 7,-6 0,-2 C-7,-6 -8,-18 0,-32 Z" fill="${C.cr}"/></g></g>`;
  const corpo = `${camada(`${id}-c0`, `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${C.oc}" stop-opacity=".7"/><stop offset="1" stop-color="${C.s}" stop-opacity="0"/></radialGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/><circle id="${id}-lz" cx="960" cy="440" r="760" fill="url(#${id}-g)"/><rect x="460" y="130" width="1000" height="660" fill="${C.t}"/><rect x="510" y="180" width="900" height="610" fill="${C.s}"/><path d="M430,130 L1490,130 L1450,76 L470,76 Z" fill="${C.t}"/><rect x="340" y="790" width="1240" height="46" fill="${C.t}"/><rect x="300" y="836" width="1320" height="320" fill="${C.s}"/><rect x="300" y="836" width="1320" height="16" fill="${C.t}" opacity=".6"/>`)}
    ${camada(`${id}-c1`, `${chama(690, 660, "fa")}${chama(1230, 660, "fb")}<g id="${id}-env" transform="translate(960,700)"><rect x="-150" y="-20" width="300" height="96" fill="${C.p}"/><path d="M-150,-20 L0,36 L150,-20" fill="none" stroke="${C.t}" stroke-width="3"/><g transform="translate(-20,-32)"><path d="M-52,6 C-20,-22 20,-18 56,4 C20,-6 -20,-6 -52,6 Z" fill="${C.s}" stroke="${C.t}" stroke-width="2"/><rect x="-6" y="-12" width="10" height="26" fill="${C.v}"/></g></g>`)}`;
  const script = `${push(id, 1, 1.08, "50% 66%")}${["fa", "fb"].map((k, i) => `osc("#${id}-${k}", { scaleY: 1, scaleX: 1 }, { scaleY: 1.12, scaleX: .93, svgOrigin: "0 0" }, ${.42 + i * .1}, 0, DUR);`).join("")}osc("#${id}-lz", { opacity: .86 }, { opacity: 1 }, .7, 0, DUR);tl.fromTo("#${id}-env", { y: 700, opacity: 0 }, { y: 700, opacity: 1, duration: .7, immediateRender: true }, ${(dur * .3).toFixed(2)});`.replace(`{ y: 700, opacity: 0 }, { y: 700, opacity: 1,`, `{ opacity: 0 }, { opacity: 1,`);
  c.ev(dur * .3, "papel", { dist: .15, db: -8 });
  return { corpo, script, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- PÉTALAS E OBJETOS --- */
V.petalas = (c, o = {}) => {
  const { id } = c, r = rng(2); let p = "", an = "";
  if (o.armas) { const corpo = camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}"/><rect x="-300" y="680" width="2520" height="600" fill="${C.t}"/><rect x="-300" y="680" width="2520" height="12" fill="${C.s}" opacity=".6"/><g transform="translate(960,560) rotate(-9)"><rect x="-560" y="-16" width="860" height="32" rx="6" fill="${C.cr}"/><path d="M300,-16 Q420,-12 500,14 Q420,14 300,16 Z" fill="${C.cr}"/><rect x="-720" y="-22" width="170" height="44" rx="8" fill="${C.s}"/><rect x="-556" y="-52" width="20" height="104" rx="6" fill="${C.oc}"/></g><g transform="translate(1130,800)"><path fill="${C.s}" d="M-190,-40 L120,-40 L120,0 L-60,0 C-54,50 -46,90 -30,130 L-110,130 C-136,90 -148,50 -150,0 L-190,0 Z"/><path d="M-60,0 Q-30,26 0,0" fill="none" stroke="${C.s}" stroke-width="8"/></g>`); c.ev(.2, "equipamento", { db: 3, dist: .15 }); return { corpo, script: push(id, 1, 1.07), faixas: [], foco: 1000, amb: "interior", ambSom: "sala" }; }
  for (let i = 0; i < 38; i++) { const x = r() * 2150 - 120, w = 7 + r() * 10; p += `<g id="${id}-pt${i}" transform="translate(${x.toFixed(0)},-40)"><ellipse rx="${w.toFixed(1)}" ry="${(w * .55).toFixed(1)}" fill="${C.cr}" opacity=".8" transform="rotate(${(r() * 90).toFixed(0)})"/></g>`; const y0 = 1000 * r() - 600; an += `tl.fromTo("#${id}-pt${i}", { y: ${y0.toFixed(0)}, x: 0 }, { y: ${(y0 + 120 * c.dur).toFixed(0)}, x: ${(r() * 280 - 140).toFixed(0)}, duration: DUR, ease: "none", immediateRender: true }, 0);`; }
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}"/><rect x="-300" y="800" width="2520" height="500" fill="${C.t}"/><rect x="-300" y="800" width="2520" height="12" fill="${C.s}" opacity=".6"/>
    <g transform="translate(700,160)"><path d="M-6,0 L6,0 L6,40 L-6,40 Z" fill="${C.s}"/><path fill="${C.t}" d="M0,36 L-170,92 C-200,250 -196,420 -180,560 L-96,560 L-90,250 L-70,570 L80,570 L88,250 L100,560 L182,560 C198,420 200,250 170,92 Z"/><path d="M-30,60 L0,160 L30,60 Z" fill="${C.s}"/><path d="M0,150 L0,560" stroke="${C.s}" stroke-width="5"/></g>
    <g transform="translate(1260,740)"><path d="M-220,62 C-90,44 110,46 240,60 L240,82 C110,70 -90,70 -220,84 Z" fill="${C.cr}"/><circle cx="20" cy="66" r="24" fill="${C.v}"/></g>
    <g transform="translate(1620,640)"><rect x="-44" y="30" width="88" height="130" rx="10" fill="${C.oc}" opacity=".85"/><rect x="-44" y="30" width="30" height="130" fill="${C.cr}" opacity=".3"/><rect x="-16" y="-8" width="32" height="40" fill="${C.t}"/></g>`)}${camada(`${id}-c1`, p)}`;
  return { corpo, script: `${push(id, 1, 1.06)}${an}`, faixas: [], foco: 1220, amb: "interior", ambSom: "sala" };
};

/* --- INTERIOR DO SUBMARINO --- f0 checagem, f1 conserto, f2 apagão, f3 gás, f4 calor */
V.interior = (c, o) => {
  const { id, dur } = c, f = o.f, Y = 985, e = 2.05;
  const r = rng(13); let tubos = ""; for (let i = 0; i < 8; i++) { const y = 150 + i * 46; tubos += `<path d="M-200,${y} L2200,${y + (i % 2) * 6}" stroke="${i % 3 ? C.t : C.s}" stroke-width="${6 + i % 4 * 3}" opacity=".85"/>`; }
  const mostrador = (x, y, rr, id2) => `<g transform="translate(${x},${y})"><circle r="${rr}" fill="${C.s}"/><circle r="${rr * .86}" fill="${C.p}"/>${[...Array(8)].map((_, i) => `<rect x="-1.5" y="${-rr * .8}" width="3" height="${rr * .18}" fill="${C.s}" transform="rotate(${i * 45})"/>`).join("")}<g id="${id2}"><rect x="-2.5" y="${-rr * .7}" width="5" height="${rr * .78}" fill="${C.v}"/></g><circle r="4" fill="${C.s}"/></g>`;
  const fundo = `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.mu}"/>${tubos}<ellipse cx="960" cy="-120" rx="1500" ry="240" fill="${C.s}"/><ellipse cx="960" cy="1200" rx="1500" ry="240" fill="${C.s}"/>${mostrador(1320, 420, 74, `${id}-d0`)}${mostrador(1520, 470, 56, `${id}-d1`)}${mostrador(1660, 390, 44, `${id}-d2`)}<rect x="1760" y="300" width="130" height="430" fill="${C.t}"/><rect x="1860" y="-100" width="26" height="500" fill="${C.s}"/><rect id="${id}-gy" x="1090" y="630" width="170" height="160" rx="10" fill="${C.t}"/><circle cx="1175" cy="700" r="56" fill="${C.oc}"/><circle cx="1175" cy="700" r="42" fill="${C.s}"/><g transform="translate(1175,700)"><g id="${id}-gn"><path d="M0,-38 L8,0 L-8,0 Z" fill="${C.v}"/><path d="M0,38 L8,0 L-8,0 Z" fill="${C.cr}"/></g></g>`;
  const figs = personagem(`${id}-b`, PR.inagaki, { x: 860, y: Y - 8, e: e * .96 }) + personagem(`${id}-a`, PR.sakamaki, { x: 360, y: Y, e });
  const ro = { 0: "atenta", 1: "tensao", 2: "cansaco", 3: "medo", 4: "cansaco" }[f];
  const F = [...parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: ro }], olhar: [{ t: 0, x: 1, y: f === 1 ? .6 : 0 }], cabeca: (t) => f === 2 ? 30 * lisa(.2, 1.4, t) : f === 1 ? 6 : 0 }), ...parado(`${id}-b`, dur, { seed: 9, rot: [{ t: 0, e: f === 1 ? "tensao" : ro }], olhar: [{ t: 0, x: .7, y: f === 1 ? .9 : .1 }], idle: f === 1 ? [{ t: .15, d: .4, tr: 16, hd: 14 }, { t: dur * .7, d: .5, tr: 6, hd: 4 }] : [], cabeca: f === 2 ? (t) => 26 * lisa(.4, 1.6, t) : null })];
  let s = push(id, 1, 1.05, "46% 50%");
  ["d0", "d1", "d2"].forEach((k, i) => { s += `osc("#${id}-${k}", { rotation: ${-30 + i * 15} }, { rotation: ${10 + i * 12}, svgOrigin: "0 0" }, ${1.3 + i * .5}, 0, DUR);`; });
  s += `tl.fromTo("#${id}-gn", { rotation: 0, svgOrigin: "0 0" }, { rotation: ${f === 0 || f === 1 ? 1060 : 200}, svgOrigin: "0 0", duration: DUR, ease: "sine.inOut" }, 0);`;
  const luzes = f >= 2 ? `<div id="${id}-rd" class="camada" style="background:var(--vinho);mix-blend-mode:multiply;opacity:0" data-layout-ignore></div>` : "";
  let extra = "";
  if (f === 1) { const q = rng(3); let fg = ""; for (let i = 0; i < 6; i++) { const t = .8 + i * (dur - 1.2) / 6; fg += `tl.fromTo("#${id}-sk", { opacity: 1, scale: .5, svgOrigin: "0 0" }, { opacity: 0, scale: 1.3, svgOrigin: "0 0", duration: .2, immediateRender: false }, ${t.toFixed(2)});`; c.ev(t, "equipamento", { db: 2, dist: .14, pan: .1 }); } s += fg; extra = camada(`${id}-spk`, `<g transform="translate(1100,640)"><g id="${id}-sk" opacity="0"><path d="M0,-40 L6,-8 L36,-16 L10,4 L24,34 L0,12 L-24,34 L-10,4 L-36,-16 L-6,-8 Z" fill="${C.l}"/></g></g>`); }
  if (f === 2) { s += `tl.fromTo("#${id}-bk", { opacity: 0 }, { opacity: 1, duration: ${(dur * .6).toFixed(2)}, ease: "power1.in", immediateRender: true }, ${(dur * .25).toFixed(2)});`; extra = `<div id="${id}-bk" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>`; c.ev(.2, "soco", { db: -10, dist: .3 }); }
  if (f === 3 || f === 4) { const n = f === 3 ? 7 : 4; let gs = ""; const q = rng(21); for (let i = 0; i < n; i++) gs += fumaca(`${id}-gs${i}`, 150 + i * 280, 900, 1.5 + q() * .7, f === 3 ? C.ol : C.oc, f === 3 ? .13 : .06); extra = camada(`${id}-gz`, gs); for (let i = 0; i < n; i++) s += `tl.fromTo("#${id}-gs${i}", { y: 80, scale: .8, svgOrigin: "0 0" }, { y: -280, scale: 1.3, svgOrigin: "0 0", duration: DUR, ease: "none" }, 0);`; s += fade(`#${id}-rd`, 0, f === 3 ? .55 : .38, 1, .1); }
  if (f === 3) { const hits = [.5, dur * .32, dur * .58]; hits.forEach((t) => { c.ev(t, "explosao_longe", { dist: .45, db: 3, origem: "carga de profundidade" }); }); F.push([`${id}-g`, "x", tab(dur, (t) => hits.reduce((a, h) => a + (t > h && t < h + .5 ? 11 * Math.exp(-(t - h) * 7) * Math.sin((t - h) * 64) : 0), 0))]); }
  if (f === 4) { s += `tl.fromTo("#${id}-tm", { scaleY: .25, transformOrigin: "50% 100%" }, { scaleY: 1, transformOrigin: "50% 100%", duration: DUR, ease: "sine.inOut", immediateRender: true }, 0);`; extra += camada(`${id}-tmc`, `<g transform="translate(1780,120)"><rect x="-26" y="0" width="52" height="380" rx="26" fill="${C.p}" stroke="${C.s}" stroke-width="6"/><rect id="${id}-tm" x="-12" y="30" width="24" height="330" fill="${C.v}" style="transform-box:fill-box"/></g>`); }
  c.ev(0, "radio", { db: -8, dist: .5 });
  const corpo = `<div id="${id}-g" class="camada" data-layout-ignore><div class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${fundo}${figs}</svg></div>${extra}${luzes}</div>`;
  return { corpo, script: s, faixas: F, foco: f === 1 ? 1000 : 620, amb: "interior", ambSom: "motor" };
};

/* --- BÚSSOLA --- */
V.bussola = (c, o) => {
  const { id, dur, v } = c, rapido = o.v === 2;
  const marcas = [...Array(36)].map((_, i) => `<rect x="-3" y="-356" width="6" height="${i % 9 === 0 ? 44 : i % 3 === 0 ? 26 : 14}" fill="${C.cr}" transform="rotate(${i * 10})"/>`).join("");
  const dirs = ["N", "E", "S", "W"].map((d, i) => `<g transform="rotate(${i * 90})"><text y="-270" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="74" fill="${C.cr}" transform="rotate(0)">${d}</text></g>`).join("");
  const giro = tab(dur, (t) => rapido ? 520 * t + 90 * Math.sin(t * 5.1) : 90 * Math.sin(t * 1.7) + 150 * Math.sin(t * .83 + 1) + 34 * Math.sin(t * 7.3) + 200 * lisa(1, dur, t));
  const corpo = `${camada(`${id}-c0`, `<defs><radialGradient id="${id}-g"><stop offset="0" stop-color="${C.t}"/><stop offset="1" stop-color="${C.s}"/></radialGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="url(#${id}-g)"/><g transform="translate(960,${v ? 400 : 540}) scale(${v ? .66 : 1})"><circle r="440" fill="${C.s}"/><circle r="420" fill="${C.oc}"/><circle r="396" fill="${C.t}"/><circle r="380" fill="${C.an}"/><g id="${id}-ros">${marcas}${dirs}</g><g id="${id}-ag"><path d="M0,-240 L32,0 L-32,0 Z" fill="${C.v}"/><path d="M0,240 L32,0 L-32,0 Z" fill="${C.cr}"/></g><circle r="28" fill="${C.oc}"/><circle r="12" fill="${C.s}"/><path d="M-230,-100 L-80,-40 L-110,70 L60,120 L190,240" fill="none" stroke="${C.s}" stroke-width="3" opacity=".6"/></g>`)}`;
  const faixas = [[`${id}-ag`, "rotation", giro], [`${id}-ros`, "rotation", tab(dur, (t) => -giro[Math.round(t * FPS)] * .18)]];
  const n = Math.floor(dur / .34); for (let i = 0; i < n; i++) c.ev(.1 + i * .34, "relogio_b", { db: -8, dist: .15, bus: "efeitos", origem: "agulha" });
  return { corpo, script: push(id, 1, rapido ? 1.18 : 1.08, "50% 50%"), faixas, foco: 960, amb: "interior", ambSom: "motor" };
};

/* --- RECIFE --- */
V.recife = (c) => {
  const { id, dur } = c, hits = [dur * .3, dur * .55, dur * .8], BATE = 340, X = (t) => { if (t < hits[0]) return -360 + (BATE + 360) * lisa(0, hits[0], t) ** 1.4; for (let i = 0; i < hits.length; i++) { const a = hits[i], b = hits[i + 1] ?? dur + 9, m = a + Math.min(.42, (b - a) * .55); if (t < m) return BATE - 170 * Math.sin((t - a) / (m - a) * Math.PI / 2); if (t < b) return BATE - 170 + 170 * lisa(m, b, t); } return BATE; };
  const xs = tab(dur, X); const rf = tab(dur, (t) => hits.reduce((a, h) => a + (t > h && t < h + 1 ? -11 * Math.exp(-(t - h) * 3.6) * Math.cos((t - h) * 9) : 0), 0));
  const tr = tab(dur, (t) => hits.reduce((a, h) => a + (t > h && t < h + .5 ? 14 * Math.exp(-(t - h) * 9) * Math.sin((t - h) * 66) : 0), 0));
  let cor = ""; const r = rng(4); for (let i = 0; i < 42; i++) { const x = 900 + i * 28 + r() * 16, y = 780 + r() * 240, h = 40 + r() * 150; cor += `<path d="M${x.toFixed(0)},1100 L${(x - 18).toFixed(0)},${y.toFixed(0)} L${(x + 4).toFixed(0)},${(y - h).toFixed(0)} L${(x + 26).toFixed(0)},${y.toFixed(0)} L${(x + 34).toFixed(0)},1100 Z" fill="${i % 3 ? C.s : C.mu}"/>`; }
  const corpo = `${fundoAgua(id)}<div id="${id}-t" class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080">${sub(`${id}-s`, 700, 460, .85)}<path d="M1120,1100 C1160,720 1230,420 1370,300 C1500,250 1700,280 2200,260 L2200,1200 Z" fill="${C.s}"/><path d="M1200,1100 C1240,780 1300,500 1430,370 C1560,320 1760,340 2200,320 L2200,1200 Z" fill="${C.mu}"/>${cor}</svg></div>`;
  hits.forEach((h, i) => { c.ev(h, "impacto_suave", { db: 6, dist: .1, bus: "efeitos", pan: .2, origem: `batida ${i + 1}` }); c.ev(h, "soco", { db: 2, dist: .15, pan: .2 }); c.ev(h + .04, "equipamento", { db: 6, dist: .1 }); });
  return { corpo, script: helice(`${id}-s`) + push(id, 1, 1.03), faixas: [[`${id}-s`, "x", xs], [`${id}-s`, "rotation", rf], [`${id}-t`, "x", tr], [`${id}-t`, "y", tr.map((v) => v * .5)]], foco: 1120, amb: "interior", ambSom: "agua" };
};

/* --- HORIZONTE PELO PERISCÓPIO --- */
V.horizonte = (c) => {
  const { id, dur } = c; const pl = []; for (let i = 0; i < 7; i++) pl.push(aviao(i * 210, 190 + (i % 3) * 58, .9));
  const corpo = `${ceu(id, "aurora", 1100, 560, 460)}${camada(`${id}-c1`, `<path d="${crista(4, 560, 40, 2800, 12)}" fill="${C.an}" opacity=".85"/>${fumaca(`${id}-f1`, 830, 590, 1, C.s, .72)}${fumaca(`${id}-f2`, 1130, 590, 1.3, C.s, .8)}${fumaca(`${id}-f3`, 620, 590, .7, C.s, .55)}`)}${camada(`${id}-pl`, pl.join(""))}${camada(`${id}-c2`, mar(id, 600, C.an, C.oc))}${camada(`${id}-mk`, `<path fill-rule="evenodd" fill="${C.s}" d="M-300,-200 L2300,-200 L2300,1300 L-300,1300 Z M960,60 a480,480 0 1,0 .1,0 Z"/><circle cx="960" cy="540" r="480" fill="none" stroke="${C.t}" stroke-width="10"/><path d="M480,540 L1440,540 M960,60 L960,1020" stroke="${C.s}" stroke-width="2.4" opacity=".75"/>${[-3, -2, -1, 1, 2, 3].map((i) => `<path d="M${960 + i * 100},525 L${960 + i * 100},555" stroke="${C.s}" stroke-width="3"/>`).join("")}`)}`;
  const script = `tl.fromTo("#${id}-pl", { x: -500, y: 0 }, { x: 800, y: -30, duration: DUR, ease: "none" }, 0);${["f1", "f2", "f3"].map((k) => `tl.fromTo("#${id}-${k}", { y: 20, scale: .86, svgOrigin: "0 0" }, { y: -70, scale: 1.1, svgOrigin: "0 0", duration: DUR, ease: "none" }, 0);`).join("")}tl.fromTo("#${id}-c2", { x: -30 }, { x: 30, duration: DUR, ease: "none" }, 0);osc("#${id}-c2", { y: -3 }, { y: 5 }, 1.8, 0, DUR);`;
  c.ev(.2, "aviao", { dist: .75, pan: -.2, db: 4 }); c.ev(dur * .25, "explosao_longe", { dist: .8, pan: .1, db: 8 }); c.ev(dur * .7, "explosao_longe_2", { dist: .85, pan: .3, db: 8 });
  return { corpo, script, faixas: [], foco: 960, amb: "campo", ambSom: "mar" };
};

/* --- USS HELM ABRE FOGO: só tiros e colunas de água. Nada mostra acerto. --- */
V.helm = (c) => {
  const { id, dur } = c, ts = [dur * .28, dur * .52, dur * .78];
  const clarao = (i) => `<g id="${id}-fl${i}" opacity="0" transform="translate(${1120 + i * 60},${410 - i * 6})"><path fill="${C.l}" d="M0,0 L-90,-30 L-50,-6 L-150,0 L-50,8 L-90,32 Z"/><circle r="22" fill="${C.cr}"/></g>`;
  const coluna = (i) => { const x = [560, 760, 430][i]; return `<g transform="translate(${x},700)"><g id="${id}-co${i}" opacity="0"><circle cy="-160" r="30" fill="${C.cr}"/><circle cx="-24" cy="-110" r="34" fill="${C.cr}"/><circle cx="24" cy="-100" r="36" fill="${C.cr}"/><circle cx="-40" cy="-40" r="42" fill="${C.m}"/><circle cx="36" cy="-36" r="44" fill="${C.m}"/><circle cy="-60" r="44" fill="${C.cr}"/><rect x="-80" y="-16" width="160" height="36" fill="${C.m}"/></g></g>`; };
  let s = push(id, 1, 1.05, "60% 55%");
  ts.forEach((t, i) => { s += `tl.fromTo("#${id}-fl${i}", { opacity: 1 }, { opacity: 0, duration: .12, immediateRender: false }, ${t.toFixed(2)});`; s += `tl.fromTo("#${id}-co${i}", { opacity: 1, scaleY: .1, svgOrigin: "0 20" }, { scaleY: 1.05, opacity: .85, svgOrigin: "0 20", duration: .42, ease: "power3.out", immediateRender: false }, ${(t + .5).toFixed(2)});`; s += `tl.to("#${id}-co${i}", { opacity: 0, scaleY: .7, svgOrigin: "0 20", duration: .5 }, ${(t + .95).toFixed(2)});`; c.ev(t, "artilharia", { dist: .35, pan: .4, db: 4, origem: "Helm atira" }); c.ev(t + .5, "splash", { dist: .5, pan: -.45, db: 2, origem: "coluna d'água" }); });
  const corpo = `${ceu(id, "aurora", 1500, 600, 420)}${camada(`${id}-c1`, `<path d="${crista(4, 600, 30, 2800, 12)}" fill="${C.ol}" opacity=".5"/>${fumaca(`${id}-f1`, 300, 620, 1.2, C.s, .5)}${nuvens(4, 200, C.cr, .22)}`)}${camada(`${id}-c2`, `${mar(id, 700, C.an, C.oc)}${navioCasco(1400, 690, 1.1)}${[0, 1, 2].map(clarao).join("")}${[0, 1, 2].map(coluna).join("")}`)}${camada(`${id}-c3`, `<path d="${crista(19, 1010, 12, 2800, 20)}" fill="${C.s}"/>`)}`;
  return { corpo, script: s, faixas: [], foco: 1200, amb: "campo", ambSom: "mar" };
};

/* --- PAINEL APAGANDO --- */
V.painel = (c) => {
  const { id, dur } = c, t0 = c.cue("steering") ?? dur * .55; let m = "", s = push(id, 1, 1.07, "50% 50%");
  const q = rng(8); for (let i = 0; i < 6; i++) { const x = 360 + (i % 3) * 600, y = 310 + Math.floor(i / 3) * 400; m += `<g transform="translate(${x},${y})"><circle r="150" fill="${C.s}"/><circle r="130" fill="${C.p}"/>${[...Array(9)].map((_, k) => `<rect x="-2" y="-122" width="4" height="22" fill="${C.s}" transform="rotate(${-120 + k * 30})"/>`).join("")}<g id="${id}-n${i}"><rect x="-4" y="-104" width="8" height="118" fill="${C.v}"/></g><circle r="12" fill="${C.s}"/></g><circle id="${id}-lu${i}" cx="${x + 170}" cy="${y - 130}" r="20" fill="${C.l}"/>`; const a = 30 + q() * 50; s += `tl.fromTo("#${id}-n${i}", { rotation: ${a.toFixed(0)}, svgOrigin: "0 0" }, { rotation: -118, svgOrigin: "0 0", duration: .7, ease: "power2.in", immediateRender: true }, ${(t0 + i * .22).toFixed(2)});tl.fromTo("#${id}-lu${i}", { opacity: 1 }, { opacity: .08, duration: .1, immediateRender: true }, ${(t0 + i * .22 + .55).toFixed(2)});`; c.ev(t0 + i * .22 + .55, "equipamento", { db: 4, dist: .2 }); }
  s += `tl.fromTo("#${id}-esc", { opacity: 0 }, { opacity: .72, duration: 1.2, immediateRender: true }, ${(t0 + .9).toFixed(2)});`;
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.t}"/>${[...Array(14)].map((_, i) => `<circle cx="${60 + i * 140}" cy="52" r="9" fill="${C.s}"/><circle cx="${60 + i * 140}" cy="1030" r="9" fill="${C.s}"/>`).join("")}${m}`)}<div id="${id}-esc" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "motor" };
};
