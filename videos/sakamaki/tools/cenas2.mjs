// Cenas: praia, prisão, apagamento, turnê, campos, volta, reencontro, monumento.
import { C, FPS, camada, push, fade, lisa, tab, ceu, estrelas, nuvens, mar, sub, silhueta, mesa, parado, andando, PR, MAPAS, crista, tufos, fumaca, rng, arame, busto, personagem, rosto, andarEParar, gerar, MARCHA, faixasCorpo, secundarios, seguir, passosDe, evento, caminhao, rodasGiro, helice, navioCasco } from "./lib.mjs";
import { V } from "./cenas1.mjs";

const praiaBase = (id, tipo, n) => { const noite = tipo === "noite"; return `${ceu(id, tipo, noite ? 1520 : 1300, noite ? 230 : 500, noite ? 300 : 500)}${camada(`${id}-c1`, `${noite ? estrelas(3 + n) : nuvens(3, 180, C.cr, .3)}<path d="${crista(5, 545, 40, 2800, 12)}" fill="${noite ? C.s : C.an}" opacity=".62"/>`)}`; };
const espuma = (id, y, n = 3) => [...Array(n)].map((_, i) => `<path id="${id}-es${i}" d="M-300,${y + i * 42} C200,${y + i * 42 - 16} 600,${y + i * 42 + 18} 1000,${y + i * 42} S1800,${y + i * 42 - 14} 2300,${y + i * 42}" fill="none" stroke="${C.cr}" stroke-width="${4 + i * 2}" opacity="${.55 - i * .1}"/>`).join("");
const espumaAn = (id, n = 3) => [...Array(n)].map((_, i) => `osc("#${id}-es${i}", { x: ${-30 - i * 12}, y: -4 }, { x: ${30 + i * 12}, y: 10 }, ${3 + i * .7}, 0, DUR);`).join("");

/* f0 encalha; f1 os dois descem; f2 nada explode; f3 içado na areia; f4 oficiais em volta */
V.praia = (c, o) => {
  const { id, dur } = c, f = o.f; const dia = f >= 3, tipo = dia ? "dia" : "noite"; let s = "", F = [];
  if (dia) {
    const Y = 880, e = 1.28; let figs = ""; const LS = [[260, "guarda"], [1560, "guarda"], [1760, "guarda"]];
    LS.forEach(([x, k], i) => { const pre = `${id}-g${i}`; figs += personagem(pre, PR[k], { x, y: Y + i * 6, e, flip: x > 900, arma: f === 3 ? false : "porta" }); F.push(...parado(pre, dur, { seed: 4 + i * 3, porta: f !== 3 && !!PR[k].acessorios.arma, rot: [{ t: 0, e: "atenta" }], olhar: [{ t: 0, x: 1, y: .2 }], idle: f === 3 ? [{ t: .1, d: .5, tr: 9, hd: 2 }, { t: 1.4, d: .6, tr: 4 }, { t: 2.4, d: .5, tr: 10 }] : [] })); });
    const corda = f === 3 ? `<path d="M480,760 Q700,740 900,700" stroke="${C.t}" stroke-width="5" fill="none"/><path d="M1540,780 Q1420,760 1320,700" stroke="${C.t}" stroke-width="5" fill="none"/>` : "";
    const corpo = `${praiaBase(id, tipo, f)}${camada(`${id}-g`, `${mar(id, 600, C.m, C.cr)}${espuma(id, 690)}<path d="M-300,800 C200,760 900,790 2300,740 L2300,1200 L-300,1200 Z" fill="${C.tc}"/><path d="M-300,980 C400,950 1400,1010 2300,960 L2300,1200 L-300,1200 Z" fill="${C.oc}" opacity=".55"/>${sub(`${id}-s`, 960, 720, 1.25, { luz: C.m, base: C.ol })}${corda}${figs}`)}`;
    s = push(id, 1, 1.05) + espumaAn(id) + (f === 3 ? `tl.fromTo("#${id}-s", { x: -50 }, { x: 40, duration: DUR, ease: "sine.inOut" }, 0);` : "");
    c.ev(.3, "equipamento", { dist: .4, db: 4 });
    return { corpo, script: s, faixas: F, foco: f === 3 ? 960 : 900, amb: "campo", ambSom: "mar" };
  }
  const R = `<g id="${id}-r"><path d="M1500,720 C1600,690 1760,690 1880,716 L1880,760 L1500,760 Z" fill="${C.s}"/></g>`;
  let cena = sub(`${id}-s`, 860, 640, .92, { luz: C.an, base: C.s });
  if (f === 0) s += `tl.fromTo("#${id}-s", { x: -620, y: 18, rotation: 0, svgOrigin: "0 0" }, { x: 0, y: 0, rotation: -4, svgOrigin: "0 0", duration: ${(dur * .72).toFixed(2)}, ease: "power1.out" }, 0);`;
  else s += `tl.set("#${id}-s", { rotation: -4, svgOrigin: "0 0" }, 0);osc("#${id}-s", { y: -2 }, { y: 3 }, 2.6, 0, DUR);`;
  if (f === 0) c.ev(dur * .7, "impacto_suave", { db: 3, dist: .4, origem: "encalhe" });
  if (f === 1) {
    cena += `<g id="${id}-h1" fill="${C.s}"><circle cx="870" cy="492" r="17"/><path d="M852,512 L888,512 L892,590 L848,590 Z"/></g><g id="${id}-h2" fill="${C.s}"><circle cx="920" cy="500" r="16"/><path d="M904,520 L938,520 L942,596 L900,596 Z"/></g>`;
    const t1 = dur * .35, t2 = dur * .55;
    s += `tl.fromTo("#${id}-h1", { x: 0, y: 0, opacity: 1 }, { x: 150, y: 170, duration: .7, ease: "power2.in", immediateRender: true }, ${t1.toFixed(2)});tl.to("#${id}-h1", { opacity: 0, duration: .08 }, ${(t1 + .68).toFixed(2)});tl.fromTo("#${id}-h2", { x: 0, y: 0, opacity: 1 }, { x: 190, y: 160, duration: .7, ease: "power2.in", immediateRender: true }, ${t2.toFixed(2)});tl.to("#${id}-h2", { opacity: 0, duration: .08 }, ${(t2 + .68).toFixed(2)});`;
    c.ev(t1 + .68, "splash", { dist: .4, pan: .2, db: 3 }); c.ev(t2 + .68, "splash", { dist: .42, pan: .25, db: 2 });
  }
  if (f === 2) { c.ev(dur * .1, "relogio_b", { db: -8, dist: .5 }); }
  const corpo = `${praiaBase(id, tipo, f)}${camada(`${id}-g`, `${mar(id, 600, C.an, C.oc)}${cena}${espuma(id, 730)}`)}${camada(`${id}-c3`, `<path d="${crista(15, 980, 20, 2800, 14)}" fill="${C.s}"/>${tufos(5, 34, -100, 2100, 960, 80, C.s)}`)}`;
  s += espumaAn(id) + push(id, f === 2 ? 1.1 : 1, f === 2 ? 1.04 : 1.05, "44% 58%");
  return { corpo, script: s, faixas: [], foco: 870, amb: "campo", ambSom: "mar" };
};

V.pavio = (c) => {
  const { id, dur } = c, t0 = c.cue("lit") ?? .2, tf = dur - .2, d = "M180,760 C420,640 620,830 860,720 C1060,630 1260,690 1500,590";
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/><path d="M-300,860 L2300,860 L2300,1300 L-300,1300 Z" fill="${C.mu}"/>${[...Array(5)].map((_, i) => `<path d="M-200,${90 + i * 60} L2200,${90 + i * 60}" stroke="${C.t}" stroke-width="10" opacity=".32"/>`).join("")}<rect x="1400" y="430" width="360" height="430" fill="${C.t}"/><path d="M1400,540 L1760,540 M1400,740 L1760,740" stroke="${C.s}" stroke-width="10"/><path d="${d}" fill="none" stroke="${C.tc}" stroke-width="10"/><path id="${id}-qm" d="${d}" fill="none" stroke="${C.s}" stroke-width="12" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110"/><path id="${id}-gl" d="${d}" fill="none" stroke="${C.l}" stroke-width="16" pathLength="100" stroke-dasharray="3 200" stroke-dashoffset="3" stroke-linecap="round"/>`)}`;
  const script = `${push(id, 1, 1.08, "60% 60%")}tl.fromTo("#${id}-qm", { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 16 }, duration: ${(tf - t0).toFixed(2)}, ease: "none" }, ${t0.toFixed(2)});tl.fromTo("#${id}-gl", { attr: { "stroke-dashoffset": 3 } }, { attr: { "stroke-dashoffset": -84 }, duration: ${(tf - t0).toFixed(2)}, ease: "none" }, ${t0.toFixed(2)});`;
  c.ev(t0, "fogo", { db: -8, dist: .15, origem: "pavio" });
  return { corpo, script, faixas: [], foco: 1000, amb: "interior", ambSom: "mar" };
};

V.agua = (c) => {
  const { id, dur } = c;
  const corpo = `${ceu(id, "noite", 960, 200, 340)}${camada(`${id}-c1`, `${estrelas(5, 60, 300)}`)}${camada(`${id}-g`, `${mar(id, 360, C.an, C.m)}${espuma(id, 620, 4)}<ellipse cx="960" cy="480" rx="130" ry="300" fill="${C.cr}" opacity=".08"/>`)}`;
  return { corpo, script: push(id, 1, 1.05, "50% 40%") + espumaAn(id, 4), faixas: [], foco: 960, amb: "campo", ambSom: "mar", semMusica: 1 };
};

V.guardas = (c) => {
  const { id, dur } = c, Y = 880, e = 1.32;
  const mk = (pre, x, tp, fase) => { const G = gerar(MARCHA, dur + 3, { fase, porta: true, S: MARCHA.S / e }); const R = andarEParar(G, MARCHA, { tMin: tp, dur: dur + .2, fase, porta: true, idle: [{ t: tp + 1, d: .5, tr: 6, hd: 8 }], seed: 3 + fase * 10 }); return { R, svg: personagem(pre, PR.guarda, { x, y: Y, e, flip: true }), F: [...faixasCorpo(pre, R.T), ...secundarios(pre, R.T), ...rosto(pre, "perfil", dur + .2, { roteiro: [{ t: 0, e: "atenta" }], olhar: [{ t: 0, x: 1, y: .4 }], seed: 8 + fase * 7 })] }; };
  const A = mk(`${id}-a`, 1600, dur * .42, .1), B = mk(`${id}-b`, 1920, dur * .46, .55);
  const homem = `<g transform="translate(560,862)"><path fill="${C.an}" d="M-110,0 C-70,-34 40,-34 90,-22 L128,0 Z"/><circle cx="112" cy="-26" r="27" fill="${C.tc}"/><path d="M92,-44 Q116,-58 134,-36 L124,-26 Q106,-36 96,-28 Z" fill="${C.s}"/></g>`;
  const corpo = `${praiaBase(id, "aurora", 2)}${camada(`${id}-g`, `${mar(id, 620, C.an, C.l)}${espuma(id, 730)}<path d="M-300,840 C200,800 900,830 2300,780 L2300,1200 L-300,1200 Z" fill="${C.tc}"/>${espuma(id + "x", 870, 1)}${homem}${B.svg}${A.svg}`)}${camada(`${id}-c3`, `<path d="${crista(15, 1020, 14, 2800, 14)}" fill="${C.t}"/>`)}`;
  c.evs(passosDe("Guarda A", A.R.T, { dist: .3, telaX: () => 1200, superficie: "areia", ate: dur })); c.evs(passosDe("Guarda B", B.R.T, { dist: .36, telaX: () => 1400, superficie: "areia", db: -2, ate: dur }));
  return { corpo, script: push(id, 1, 1.06, "50% 70%") + espumaAn(id) + espumaAn(id + "x", 1), faixas: [...A.F, ...B.F], foco: 1000, amb: "campo", ambSom: "mar" };
};

V.prisioneiro = (c) => {
  const { id, dur } = c, tC = dur * .62;
  const corpo = `${mesa(id, C.an)}${camada(`${id}-pap`, `<g transform="rotate(-1.4 960 540)"><rect x="412" y="118" width="1120" height="860" fill="${C.s}" opacity=".5"/><rect x="390" y="96" width="1120" height="860" fill="${C.p}"/><text x="950" y="196" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="64" letter-spacing="6" fill="${C.s}">PRISONER OF WAR</text><path d="M450,228 L1450,228" stroke="${C.s}" stroke-width="4"/><text x="950" y="500" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="248" fill="${C.v}" id="${id}-n1">No. 1</text>${[0, 1, 2, 3].map((i) => `<rect x="${500}" y="${600 + i * 66}" width="${820 - i * 90}" height="10" fill="${C.t}" opacity=".5"/>`).join("")}<text x="500" y="590" font-family="Titulo Ampulheta" font-weight="600" font-size="44" letter-spacing="3" fill="${C.s}">SAKAMAKI, KAZUO</text></g>`)}<div id="${id}-cb" style="position:absolute;left:1090px;top:690px;width:440px;height:150px;opacity:0" data-layout-ignore><svg viewBox="0 0 440 150" class="cheio"><rect x="6" y="6" width="428" height="138" rx="6" fill="none" stroke="var(--vinho)" stroke-width="8"/><text x="220" y="100" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="74" letter-spacing="5" fill="var(--vinho)">CAPTURED</text></svg></div>`;
  c.ev(tC, "carimbo", { dist: .05, db: 2 }); c.ev(.2, "papel", { dist: .1, db: -3 });
  return { fitV: 1180, corpo, script: `${push(id, 1, 1.06, "50% 45%")}tl.fromTo("#${id}-cb", { opacity: 0, scale: 1.5, rotation: -14 }, { opacity: 1, scale: 1, rotation: -8, duration: .09, ease: "power3.in", immediateRender: true }, ${(tC - .09).toFixed(3)});`, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

V.citacao = (c, o) => {
  const { id, dur, v } = c, tx = o.cit, n = [...tx].length, dt = Math.min(.055, (dur - 1) / n); let an = "";
  const r = rng(c.n + 6), W = 1240, H = 620; const bd = (x0, y0, x1, y1, k) => { let d = ""; for (let i = 1; i <= k; i++) { const u = i / k; d += ` L${(x0 + (x1 - x0) * u + (x0 === x1 ? (r() - .5) * 14 : 0)).toFixed(0)},${(y0 + (y1 - y0) * u + (y0 === y1 ? (r() - .5) * 14 : 0)).toFixed(0)}`; } return d; };
  const rasg = `M0,0${bd(0, 0, W, 0, 34)}${bd(W, 0, W, H, 18)}${bd(W, H, 0, H, 34)}${bd(0, H, 0, 0, 18)} Z`;
  [...tx].forEach((ch, i) => { const t = .25 + i * dt; an += `tl.set("#${id}-q${i}", { opacity: 1 }, ${t.toFixed(3)});`; if (ch !== " ") c.ev(t, "tecla", { db: -5, dist: .1, pan: .1, origem: "letra" }); });
  const S = v ? .44 : 1;
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/><rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}" opacity=".5"/>`)}${camada(`${id}-pp`, `<g transform="translate(960,510) scale(${S}) rotate(-1.2) translate(${-W / 2},${-H / 2})"><path d="${rasg}" transform="translate(12,16)" fill="${C.s}" opacity=".7"/><path d="${rasg}" fill="${C.cr}"/><foreignObject x="70" y="40" width="${W - 140}" height="${H - 80}"><div xmlns="http://www.w3.org/1999/xhtml" style="height:100%;display:flex;flex-direction:column;justify-content:center"><div style="font-family:'Titulo Ampulheta',sans-serif;font-weight:600;font-size:${o.peq ? 68 : 92}px;line-height:1.1;color:var(--sombra);text-transform:uppercase">${[...tx].map((ch, i) => `<span id="${id}-q${i}" style="opacity:0">${ch}</span>`).join("")}</div><div style="margin-top:20px;font-family:'Apoio Ampulheta',serif;font-size:42px;color:var(--terra)">${o.sub ?? ""}</div></div></foreignObject></g>`)}`;
  return { corpo, script: push(id, 1, 1.04, "50% 50%") + an, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

V.jornal = (c) => {
  const { id, dur } = c, tC = c.cue("destroyed") ?? dur * .7;
  const corpo = `${mesa(id, C.t)}${camada(`${id}-pap`, `<g transform="rotate(1.5 960 540)"><rect x="426" y="86" width="1100" height="930" fill="${C.s}" opacity=".5"/><rect x="410" y="66" width="1100" height="930" fill="${C.p}"/><text x="960" y="196" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="104" letter-spacing="4" fill="${C.s}">U.S.S. ARIZONA</text><text x="960" y="282" text-anchor="middle" font-family="Apoio Ampulheta" font-style="italic" font-size="60" fill="${C.t}">credited to a midget submarine</text><path d="M470,322 L1450,322" stroke="${C.s}" stroke-width="5"/><g transform="translate(960,620)"><rect x="-470" y="-250" width="940" height="360" fill="${C.m}"/><rect x="-470" y="70" width="940" height="40" fill="${C.an}"/>${navioCasco(0, 40, 1.08)}</g>${[0, 1, 2].map((i) => `<rect x="490" y="${770 + i * 50}" width="${900 - i * 120}" height="10" fill="${C.t}" opacity=".5"/>`).join("")}</g>`)}<div id="${id}-cb" style="position:absolute;left:640px;top:390px;width:640px;height:150px;opacity:0" data-layout-ignore><svg viewBox="0 0 640 150" class="cheio"><rect x="6" y="6" width="628" height="138" rx="6" fill="var(--creme)" stroke="var(--vinho)" stroke-width="8"/><text x="320" y="100" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="52" letter-spacing="1" fill="var(--vinho)">DESTROYED FROM THE AIR</text></svg></div>`;
  c.ev(tC, "carimbo", { dist: .05, db: 1 }); c.ev(.15, "papel", { dist: .1, db: -3 });
  return { corpo, script: `${push(id, 1, 1.05, "50% 40%")}tl.fromTo("#${id}-cb", { opacity: 0, scale: 1.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: -4, duration: .09, ease: "power3.in", immediateRender: true }, ${(tC - .09).toFixed(3)});`, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* lista: 10 linhas; nomes dos nove são tarjas (ilustração, não documento real) */
V.lista = (c, o) => {
  const { id, dur } = c, f = o.f; let L = "", s = ""; const r = rng(31);
  for (let i = 0; i < 10; i++) { const y = 242 + i * 72; if (i < 9) L += `<rect x="540" y="${y}" width="${380 + r() * 180 | 0}" height="16" fill="${C.t}" opacity=".75"/><text id="${id}-g${i}" x="1320" y="${y + 18}" text-anchor="end" font-family="Titulo Ampulheta" font-weight="700" font-size="42" fill="${C.v}" opacity="${f === 0 ? 0 : 1}">+2 RANKS</text>`; else L += `<g id="${id}-nm"><text x="540" y="${y + 20}" font-family="Titulo Ampulheta" font-weight="700" font-size="52" letter-spacing="2" fill="${C.s}">SAKAMAKI, KAZUO</text></g><rect id="${id}-tj" x="524" y="${y - 14}" width="660" height="24" fill="${C.v}" style="transform-box:fill-box;opacity:${f === 1 ? 1 : 0}"/>`; if (f === 0 && i < 9) { const t = .5 + i * .22; s += fade(`#${id}-g${i}`, 0, 1, .12, t); c.ev(t, "tecla", { db: 0, dist: .1, pan: .25 }); } }
  const tC = (c.cue("struck") ?? dur * .55);
  if (f === 1 && o.ja) { s += `tl.set("#${id}-cb", { opacity: 1, rotation: -7 }, 0);`; } else if (f === 1) { s += `tl.fromTo("#${id}-tj", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, transformOrigin: "0% 50%", duration: .32, ease: "power2.in", immediateRender: true }, ${(tC - .42).toFixed(2)});tl.fromTo("#${id}-cb", { opacity: 0, scale: 1.45, rotation: -13 }, { opacity: 1, scale: 1, rotation: -7, duration: .09, ease: "power3.in", immediateRender: true }, ${(tC - .09).toFixed(3)});`; c.ev(tC, "carimbo", { dist: .05, db: 3 }); }
  if (f === 2) { s += `tl.set("#${id}-tj", { opacity: 0 }, 0);tl.set("#${id}-cb", { opacity: .35, rotation: -7 }, 0);tl.fromTo("#${id}-nm", { opacity: 1 }, { opacity: 0, duration: ${(dur * .75).toFixed(2)}, ease: "sine.inOut", immediateRender: true }, ${(dur * .1).toFixed(2)});`; }
  const corpo = `${mesa(id, C.t)}${camada(`${id}-pap`, `<g transform="rotate(-1 960 540)"><rect x="456" y="66" width="1040" height="990" fill="${C.s}" opacity=".5"/><rect x="440" y="44" width="1040" height="990" fill="${C.p}"/><text x="960" y="148" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="72" letter-spacing="8" fill="${C.s}">SPECIAL ATTACK UNIT</text><path d="M500,186 L1420,186" stroke="${C.s}" stroke-width="4"/>${L}</g>`)}<div id="${id}-cb" style="position:absolute;left:720px;top:920px;width:760px;height:130px;opacity:0" data-layout-ignore><svg viewBox="0 0 760 170" class="cheio"><rect x="6" y="6" width="748" height="158" rx="6" fill="none" stroke="var(--vinho)" stroke-width="9"/><text x="380" y="112" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="62" letter-spacing="1" fill="var(--vinho)">STRUCK FROM THE RECORDS</text></svg></div>`;
  return { corpo, script: push(id, 1, 1.05, "50% 80%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* pintura com nove rostos e, em f1, o lugar que falta */
V.pintura = (c, o) => {
  const { id, dur, v } = c, f = o.f ?? 0, E = v ? .34 : .42;
  const lugares = v ? [...[0, 1, 2].flatMap((l) => [0, 1, 2].map((k) => [785 + k * 175, 300 + l * 215]))] : [[520, 310], [745, 270], [970, 260], [1195, 270], [1420, 310], [630, 650], [855, 630], [1080, 630], [1305, 650]];
  const faltaXY = v ? [960, 880] : [1530, 640]; let rs = "", s = "", F = [];
  // nove retratos com o mesmo rig; atrás primeiro
  lugares.forEach(([x, y], i) => { const pre = `${id}-r${i}a`; if (!v && i === 5) rs += `<rect x="300" y="478" width="1420" height="330" fill="${C.an}"/><rect x="300" y="478" width="1420" height="9" fill="${C.oc}" opacity=".7"/>`; rs += `<g id="${id}-r${i}">${busto(pre, PR.sakamaki, { x, y, e: E })}</g>`; if (f === 0) s += fade(`#${id}-r${i}`, 0, 1, .2, .15 + i * .12); F.push(...rosto(pre, "busto", dur + .2, { roteiro: [{ t: 0, e: i % 3 === 0 ? "determinacao" : "neutra" }], olhar: [{ t: 0, x: .5, y: -.05 }], seed: i * 7 + 2 })); });
  const fr = v ? { x: 672, y: 90, w: 576, h: 950, b: 16 } : { x: 300, y: 70, w: 1420, h: 920, b: 30 };
  const moldura = `<rect x="${fr.x}" y="${fr.y}" width="${fr.w}" height="${fr.h}" fill="${C.t}"/><rect x="${fr.x + fr.b}" y="${fr.y + fr.b}" width="${fr.w - fr.b * 2}" height="${fr.h - fr.b * 2}" fill="${C.oc}"/>`;
  const interior = `<defs><clipPath id="${id}-cl"><rect x="${fr.x + fr.b}" y="${fr.y + fr.b}" width="${fr.w - fr.b * 2}" height="${fr.h - fr.b * 2}"/></clipPath><linearGradient id="${id}-pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.an}"/><stop offset=".6" stop-color="${C.v}"/><stop offset="1" stop-color="${C.oc}"/></linearGradient></defs><rect x="${fr.x + fr.b}" y="${fr.y + fr.b}" width="${fr.w - fr.b * 2}" height="${fr.h - fr.b * 2}" fill="url(#${id}-pg)"/>`;
  const falta = f === 1 ? `<g id="${id}-ft" transform="translate(${faltaXY[0]},${faltaXY[1]}) scale(${v ? 1.02 : 1.3})" opacity="0"><path d="M-90,170 C-88,110 -60,86 -22,76 L-20,50 C-40,36 -46,10 -44,-16 L-54,-22 L-46,-34 C-46,-62 -24,-74 2,-74 C28,-74 48,-62 48,-34 L54,-22 L44,-16 C46,10 40,36 20,50 L22,76 C60,86 88,110 90,170 Z" fill="${C.s}" stroke="${C.cr}" stroke-width="5" stroke-dasharray="14 10"/></g>` : "";
  if (f === 1) { const t = (c.cue("ten") ?? dur * .5) - .05; s += fade(`#${id}-ft`, 0, 1, .22, t); c.ev(t, "impacto_suave", { db: -2, dist: .2, bus: "transicoes" }); }
  const corpo = camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/>${moldura}${interior}<g clip-path="url(#${id}-cl)">${rs}${falta}${v ? "" : `<rect x="300" y="806" width="1420" height="220" fill="${C.t}"/><rect x="300" y="806" width="1420" height="10" fill="${C.oc}"/>`}</g>`);
  c.ev(.05, "impacto_suave", { db: -8, dist: .3, bus: "transicoes" });
  return { corpo, script: push(id, f === 1 && !v ? 1.05 : 1, f === 1 && !v ? 1.1 : 1.04, f === 1 && !v ? "72% 58%" : "50% 50%") + s, faixas: F, foco: 960, amb: "interior", ambSom: "sala" };
};

const subCarga = (id) => `<g transform="translate(-100,-52) scale(.82)">${sub(id, 0, 0, 1, { luz: C.m, base: C.ol })}</g>`;
V.caminhao = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0, Y = 780;
  const corpo = f === 0 ? `${ceu(id, "dia", 1300, 360, 640)}${camada(`${id}-c1`, `${nuvens(5, 150, C.cr, .5)}<path d="${crista(8, 640, 22, 3600, 18)}" fill="${C.ol}" opacity=".5"/>`)}${camada(`${id}-c2`, `<path d="${crista(4, 720, 12, 5000, 22)}" fill="${C.ol}"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 480}" y="${610}" width="12" height="120" fill="${C.t}"/><path d="M${i * 480},620 L${i * 480 + 480},620" stroke="${C.s}" stroke-width="2"/>`).join("")}`)}${camada(`${id}-r`, `<rect x="-300" y="${Y + 92}" width="2520" height="330" fill="${C.t}"/><rect x="-300" y="${Y + 92}" width="2520" height="8" fill="${C.s}" opacity=".5"/>${caminhao(`${id}-tk`, 880, Y, 1.42, subCarga(`${id}-s`))}`)}${camada(`${id}-c3`, `<g id="${id}-fx">${[...Array(10)].map((_, i) => `<rect x="${i * 420}" y="${Y + 196}" width="170" height="10" fill="${C.cr}" opacity=".6"/>`).join("")}</g>`)}`
    : `${ceu(id, "dia", 1500, 340, 560)}${camada(`${id}-c1`, `<path d="M300,560 L300,160 L620,160 M300,220 L500,160 M620,160 L620,330" stroke="${C.an}" stroke-width="18" fill="none"/>${navioCasco(1520, 600, .75, C.an)}`)}${camada(`${id}-c2`, `${mar(id, 600, C.m, C.cr)}<rect x="-300" y="700" width="2520" height="420" fill="${C.tc}"/>${[...Array(24)].map((_, i) => silhueta(40 + i * 86 + (i % 3) * 8, 720 - (i % 2) * 8, .52, i % 2 ? C.an : C.t)).join("")}`)}${camada(`${id}-r`, `<rect x="-300" y="${Y + 118}" width="2520" height="300" fill="${C.t}"/>${caminhao(`${id}-tk`, 880, Y + 26, 1.42, subCarga(`${id}-s`))}`)}`;
  let s = push(id, 1, 1.04);
  if (f === 0) s += rodasGiro(`${id}-tk`, dur * 1.5) + `tl.fromTo("#${id}-fx", { x: 0 }, { x: -1800, duration: DUR, ease: "none" }, 0);tl.fromTo("#${id}-c2", { x: 0 }, { x: -560, duration: DUR, ease: "none" }, 0);tl.fromTo("#${id}-c1", { x: 0 }, { x: -110, duration: DUR, ease: "none" }, 0);osc("#${id}-tk", { y: -1.5 }, { y: 1.5 }, .32, 0, DUR);`;
  c.ev(.1, "equipamento", { db: 2, dist: .2 });
  return { corpo, script: s, faixas: [], foco: 900, amb: "rua", ambSom: f ? "multidao" : "vento" };
};

const rua = (id, comGente, n = 11) => { const lj = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const x = i * 300 - 200, h = 300 + (i * 67 % 120), cor = [C.t, C.an, C.v, C.mu][i % 4]; return `<rect x="${x}" y="${660 - h}" width="280" height="${h}" fill="${cor}"/><rect x="${x + 28}" y="${660 - h + 34}" width="70" height="90" fill="${C.l}" opacity=".6"/><rect x="${x + 170}" y="${660 - h + 34}" width="70" height="90" fill="${C.l}" opacity=".6"/><rect x="${x + 10}" y="500" width="260" height="46" fill="${C.cr}" opacity=".85"/><rect x="${x + 30}" y="552" width="220" height="108" fill="${C.s}" opacity=".5"/>`; }).join(""); return lj; };
V.rua = (c, o) => {
  const { id, dur } = c, Y = 800, cartaz = o.cartaz, com = !o.hoje; let s = push(id, 1, 1.05);
  const gente = (y, e, k, sd) => { const r = rng(sd); let g = ""; for (let i = 0; i < k; i++) g += silhueta(-100 + i * (2200 / k) + r() * 30, y - r() * 12, e + r() * .08, [C.s, C.an, C.t][i % 3]); return g; };
  const banner = com ? `<g><rect x="360" y="400" width="1200" height="84" fill="${C.v}"/><text x="960" y="460" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="58" letter-spacing="6" fill="${C.cr}">BUY WAR BONDS</text><path d="M360,400 L300,300 M1560,400 L1620,300" stroke="${C.s}" stroke-width="5"/></g>` : "";
  const corpo = `${ceu(id, "dia", 900, 260, 520)}${camada(`${id}-c1`, `${nuvens(6, 100, C.cr, .45)}${rua(id)}<rect x="-300" y="660" width="2520" height="110" fill="${C.tc}"/>${banner}${com ? gente(700, .85, 18, 3) : ""}`)}${camada(`${id}-r`, `<rect x="-300" y="770" width="2520" height="320" fill="${C.t}"/><path d="M-300,920 L2300,920" stroke="${C.cr}" stroke-width="7" stroke-dasharray="70 60" opacity=".55"/>${com ? caminhao(`${id}-tk`, 960, 730, 1.2, subCarga(`${id}-s`)) : ""}`)}${com ? camada(`${id}-c3`, gente(1020, 1.2, 12, 8)) : ""}`;
  if (com) { s += `tl.fromTo("#${id}-tk", { x: -1500 }, { x: 900, duration: DUR, ease: "none" }, 0);` + rodasGiro(`${id}-tk`, dur * 1.6); c.ev(.05, "multidao", { db: 2, dist: .4 }); }
  return { corpo, script: s, faixas: [], foco: com ? 960 : 960, amb: "rua", ambSom: com ? "multidao" : "vento" };
};

V.eua = (c, o) => {
  const { id, dur } = c, M = MAPAS.eua, L = M.locais; let e = "", s = "";
  if (o.tour) { const q = Object.keys(L); const dt = (dur - .6) / q.length; q.forEach((k, i) => { const [x, y] = L[k], t = .25 + i * dt; e += `<g id="${id}-p${i}" transform="translate(${x},${y})" opacity="0"><circle r="16" fill="${C.v}" stroke="${C.cr}" stroke-width="4"/></g>`; s += fade(`#${id}-p${i}`, 0, 1, .06, t); s += `tl.set("#${id}-cn", { innerText: ${i + 1}, snap: "innerText" }, ${t.toFixed(3)});`; if (i % 2 === 0) c.ev(t, "tecla", { db: -5, dist: .15 }); }); }
  if (o.campos) [["WI", "WISCONSIN", 0], ["TN", "TENNESSEE", 1], ["LA", "LOUISIANA", 2], ["TX", "TEXAS", 3]].forEach(([k, n, i]) => { const [x, y] = L[k], t = (c.cue(n[0] + n.slice(1).toLowerCase() + ",") ?? c.cue(n[0] + n.slice(1).toLowerCase()) ?? .5 + i * .6) - .05; e += `<g id="${id}-p${i}" transform="translate(${x},${y})" opacity="0"><circle r="18" fill="${C.v}" stroke="${C.cr}" stroke-width="4"/><text x="${k === "TX" ? -30 : 30}" y="14" text-anchor="${k === "TX" ? "end" : "start"}" font-family="Titulo Ampulheta" font-weight="700" font-size="48" fill="${C.s}">${n}</text></g>`; s += fade(`#${id}-p${i}`, 0, 1, .16, t); c.ev(t, "tecla", { db: -2, dist: .1 }); });
  const cont = o.tour ? `<div style="position:absolute;left:${c.v ? 660 : 90}px;top:${c.v ? 40 : 800}px;font-family:var(--font-titulo);font-weight:700;color:var(--creme);text-shadow:0 4px 0 rgba(30,26,22,.7);line-height:1" data-layout-allow-overlap><span id="${id}-cn" style="font-size:190px">0</span><span style="font-size:70px;margin-left:18px">STATES</span></div>` : "";
  const corpo = `<div id="${id}-m" class="camada" style="width:2400px;height:1350px;transform-origin:0 0;transform:scale(.8)" data-layout-ignore><svg viewBox="0 0 2400 1350" class="cheio"><rect x="-300" y="-300" width="3000" height="2000" fill="${C.m}"/><path d="${M.terra}" fill="${C.tc}" stroke="${C.t}" stroke-width="4"/>${e}</svg></div>${cont}`;
  return { corpo, script: push(id, 1, 1.04, "50% 50%") + s, faixas: [], foco: 960, amb: "seco" };
};

const campoFundo = (id, tipo = "cinza") => `${ceu(id, tipo, 1400, 470, 560)}${camada(`${id}-c1`, `<path d="${crista(4, 610, 24, 3000, 16)}" fill="${C.ol}" opacity=".6"/>${[0, 1, 2, 3, 4].map((i) => `<g transform="translate(${100 + i * 420},600)"><path d="M0,70 L0,-20 L150,-70 L300,-20 L300,70 Z" fill="${i % 2 ? C.t : C.mu}"/><rect x="118" y="6" width="56" height="64" fill="${C.s}"/></g>`).join("")}<g transform="translate(1720,430)"><path d="M-40,250 L-20,0 L20,0 L40,250 M-30,140 L30,190 M30,140 L-30,190" stroke="${C.s}" stroke-width="7" fill="none"/><path d="M-50,0 L50,0 L36,-52 L-36,-52 Z" fill="${C.s}"/><path d="M-60,-52 L60,-52 L0,-90 Z" fill="${C.s}"/></g>`)}`;
/* f0 parado atrás da cerca; f1 anda; f2 lidera; f3 novos chegam de cabeça baixa; f4 conversa com um; f5 largo */
V.campo = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0, Y = 900, e = f === 5 ? .9 : 1.45; let figs = "", F = [], s = push(id, 1, 1.05), cam = null;
  if (f === 0) { figs = personagem(`${id}-a`, PR.preso, { x: 840, y: Y, e }); F = parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: "cansaco" }], olhar: [{ t: 0, x: .8, y: .1 }], cabeca: () => 6 }); }
  if (f === 1) { const A = andando(`${id}-a`, dur, e, { rot: [{ t: 0, e: "neutra" }] }); figs = personagem(`${id}-a`, PR.preso, { x: 200, y: Y, e }) + personagem(`${id}-g`, PR.guarda, { x: 1500, y: Y - 18, e: e * .92, flip: true }); F = [...A.faixas, ...parado(`${id}-g`, dur, { seed: 9, porta: true, rot: [{ t: 0, e: "neutra" }], olhar: [{ t: 0, x: .7, y: 0 }] })]; c.evs(passosDe("Sakamaki", A.T, { dist: .2, telaX: () => 700, ate: dur })); }
  if (f === 2) { figs = personagem(`${id}-a`, PR.preso, { x: 400, y: Y, e: e * 1.05 }); [0, 1, 2, 3].forEach((i) => { const pre = `${id}-m${i}`; figs += personagem(pre, i % 2 ? PR.preso_b : PR.inagaki, { x: 840 + i * 240, y: Y + 8 - i * 3, e, flip: true }); F.push(...parado(pre, dur, { seed: 7 + i * 3, rot: [{ t: 0, e: i % 2 ? "atenta" : "neutra" }], olhar: [{ t: 0, x: 1, y: 0 }] })); }); F.push(...parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: "determinacao" }], olhar: [{ t: 0, x: 1, y: 0 }], idle: [{ t: .3, d: .4, tr: 3, hd: -3 }, { t: 1.6, d: .4, tr: -1, hd: 2 }, { t: 3, d: .5, tr: 3, hd: -2 }] })); }
  if (f === 3) { [0, 1, 2, 3, 4].forEach((i) => { const pre = `${id}-m${i}`, A = andando(pre, dur, e * .98, { fase: i * .23, rot: [{ t: 0, e: "cansaco" }], olhar: [{ t: 0, x: .6, y: .9 }], lento: 1.18 }); figs += personagem(pre, i % 2 ? PR.preso_b : PR.inagaki, { x: 1980 + i * 250, y: Y + (i % 2) * 8, e: e * .98, flip: true }); F.push(...A.faixas, [`${pre}-hd`, "rotation", A.T.hd.map((v) => v + 12)]); }); figs += personagem(`${id}-a`, PR.preso, { x: 300, y: Y, e }); F.push(...parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: "tensao" }], olhar: [{ t: 0, x: 1, y: 0 }] })); F = F.filter(([a, b], i, arr) => arr.findLastIndex((q) => q[0] === a && q[1] === b) === i); }
  if (f === 4) { figs = personagem(`${id}-a`, PR.preso, { x: 660, y: Y, e: e * 1.1 }) + personagem(`${id}-b`, PR.preso_b, { x: 1100, y: Y + 4, e: e * 1.05, flip: true }); F = [...parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: "atenta" }], olhar: [{ t: 0, x: 1, y: .1 }], idle: [{ t: .3, d: .5, tr: 4, hd: -2 }, { t: dur * .6, d: .5, tr: 6, hd: 2 }] }), ...parado(`${id}-b`, dur, { seed: 11, rot: [{ t: 0, e: "cansaco" }, { t: dur * .7, e: "neutra", d: .6 }], olhar: [{ t: 0, x: .4, y: 1 }, { t: dur * .7, x: 1, y: .1, d: .3 }], cabeca: (t) => 14 * (1 - lisa(dur * .6, dur * .85, t)) }), ]; s = push(id, 1, 1.09, "46% 60%"); }
  if (f === 5) { [0, 1, 2, 3, 4, 5].forEach((i) => { const pre = `${id}-m${i}`, A = andando(pre, dur, e, { fase: i * .3, rot: [{ t: 0, e: "neutra" }], seed: i + 3 }); figs += personagem(pre, i === 0 ? PR.preso : i % 2 ? PR.preso_b : PR.inagaki, { x: 100 + i * 170 + (i % 2) * 30, y: Y - i * 2, e }); F.push(...A.faixas); }); }
  const cerca = `<g>${arame(-60, 2500, Y + 104, 330, C.s)}</g>`, frente = f === 2 || f === 4 ? "" : camada(`${id}-c3`, cerca);
  const corpo = `${campoFundo(id, f === 5 ? "crepusculo" : f === 2 || f === 4 ? "aurora" : "cinza")}${camada(`${id}-g`, `<rect x="-400" y="${Y - 56}" width="3200" height="420" fill="${C.tc}"/><path d="${crista(6, Y - 52, 6, 3200, 40, -400)}" fill="${C.tc}"/><rect x="-400" y="${Y + 80}" width="3200" height="200" fill="${C.oc}" opacity=".45"/>${figs}`)}${frente}`;
  if (f === 3) s += ""; // ver faixas
  if (f === 3) c.ev(.1, "passo_terra", { dist: .5, db: -8 });
  if (f === 3) { /* desloca os recém-chegados pela tela, da direita para a esquerda, em espelho */ }
  return { corpo, script: s, faixas: F, foco: { 0: 880, 1: 760, 2: 780, 3: 960, 4: 880, 5: 700 }[f], amb: "campo", ambSom: "vento" };
};

V.split = (c, o) => {
  const { id, dur, v } = c, Y = 880, e = 1.1;
  const camp = `<svg viewBox="0 0 960 1080" style="position:absolute;left:0;top:0;width:960px;height:1080px"><rect x="-100" y="-100" width="1200" height="1300" fill="${C.m}"/><rect x="-100" y="${Y - 40}" width="1200" height="400" fill="${C.t}"/><path d="M0,620 L0,500 L180,430 L360,500 L360,620 Z" fill="${C.mu}" transform="translate(60,220)"/>${personagem(`${id}-a`, PR.preso, { x: 600, y: Y, e })}${arame(-40, 1000, Y + 80, 240, C.s)}</svg>`;
  const tour = `<svg viewBox="960 0 960 1080" style="position:absolute;left:960px;top:0;width:960px;height:1080px"><rect x="900" y="-100" width="1100" height="1300" fill="${C.l}"/>${[0, 1, 2, 3].map((i) => `<rect x="${960 + i * 260}" y="${240 + i * 30}" width="240" height="${480 - i * 30}" fill="${[C.t, C.an, C.v, C.mu][i]}"/>`).join("")}<rect x="900" y="${Y - 112}" width="1100" height="500" fill="${C.t}"/>${[...Array(9)].map((_, i) => silhueta(980 + i * 110, 700, .55, [C.s, C.an][i % 2])).join("")}<g id="${id}-tkw">${caminhao(`${id}-tk`, 1450, 770, .9, subCarga(`${id}-s`))}</g></svg>`;
  const corpo = `<div class="camada" data-layout-ignore>${camp}${tour}<div style="position:absolute;left:952px;top:-20px;width:16px;height:1120px;background:var(--sombra)" data-layout-ignore></div></div>`;
  const F = parado(`${id}-a`, dur, { seed: 4, rot: [{ t: 0, e: "cansaco" }], olhar: [{ t: 0, x: .6, y: .7 }], cabeca: () => 8 });
  const s = `tl.fromTo("#${id}-tkw", { x: -340 }, { x: 340, duration: DUR, ease: "none" }, 0);${rodasGiro(`${id}-tk`, dur * 1.2)}`;
  c.ev(.1, "multidao", { db: 2, dist: .5, pan: .5 });
  return { corpo, script: s, faixas: F, foco: 960, amb: "rua", ambSom: "vento" };
};

V.quadro = (c, o) => {
  const { id, dur, v } = c, f = o.f, itens = ["ENGLISH", "GEOGRAPHY", "COMMERCE", "AGRICULTURE", "MUSIC", "JAPANESE POETRY", "BUDDHIST SCRIPTURES"]; let s = push(id, 1, 1.05, "50% 40%"), it = "";
  if (f === 1) itens.forEach((n, i) => { const k = ["English,", "geography,", "commerce,", "agriculture,", "music,", "Japanese", "Buddhist"][i], t = c.cue(k) ?? .3 + i * .5; it += `<text id="${id}-i${i}" x="${v ? 960 : 540}" y="${310 + i * 76}" ${v ? 'text-anchor="middle"' : ""} font-family="Apoio Ampulheta" font-size="${v ? 44 : 62}" fill="${C.cr}" opacity="0">${n}</text>`; s += fade(`#${id}-i${i}`, 0, 1, .18, t); c.ev(t, "pano", { dist: .05, db: 2, origem: "giz" }); });
  const corpo = `${camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.t}"/><rect x="290" y="60" width="1340" height="800" fill="${C.s}"/><rect x="320" y="90" width="1280" height="740" fill="${C.mu}"/><text x="960" y="210" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="${v ? 54 : 84}" letter-spacing="4" fill="${C.cr}">INTERNMENT UNIVERSITY</text><path d="M440,244 L1480,244" stroke="${C.cr}" stroke-width="3" opacity=".6"/>${it}${[...Array(10)].map((_, i) => silhueta(140 + i * 190, 1000 - (i % 2) * 14, .72, C.s)).join("")}`)}`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

V.navio = (c) => {
  const { id } = c;
  const corpo = `${ceu(id, "cinza", 1300, 500, 520)}${camada(`${id}-c1`, `<path d="${crista(4, 590, 60, 2800, 10)}" fill="${C.an}" opacity=".62"/>${[0, 1, 2, 3].map((i) => `<rect x="${1300 + i * 130}" y="${570 - i * 18}" width="70" height="${40 + i * 18}" fill="${C.an}" opacity=".7"/>`).join("")}`)}${camada(`${id}-g`, `${mar(id, 660, C.an, C.m)}<g id="${id}-nv">${navioCasco(600, 670, .9)}</g>`)}${camada(`${id}-c3`, `<path d="${crista(16, 1020, 14, 2800, 18)}" fill="${C.s}"/>`)}`;
  return { corpo, script: `${push(id, 1, 1.05)}tl.fromTo("#${id}-nv", { x: -240, y: 0 }, { x: 240, y: 0, duration: DUR, ease: "none" }, 0);osc("#${id}-nv", { rotation: -.5 }, { rotation: .5, svgOrigin: "600 700" }, 3, 0, DUR);`, faixas: [], foco: 880, amb: "campo", ambSom: "mar" };
};

const envelope = (id, x, y, r, cor, sinal = "") => `<g id="${id}" transform="translate(${x},${y}) rotate(${r})"><rect x="-130" y="-78" width="260" height="156" fill="${C.s}" opacity=".35" transform="translate(5,7)"/><rect x="-130" y="-78" width="260" height="156" fill="${cor}"/><path d="M-130,-78 L0,14 L130,-78" fill="none" stroke="${C.t}" stroke-width="3"/>${sinal}</g>`;
V.cartas = (c, o) => {
  const { id, dur, v } = c, f = o.f; const r = rng(f + 3); let es = "", s = push(id, 1, 1.05, "50% 50%"); const N = f ? 22 : 16;
  for (let i = 0; i < N; i++) { const x = 400 + r() * 1120, y = 240 + r() * 600, rot = (r() - .5) * 42, sg = f ? `<path transform="translate(92,44) scale(1.3)" fill="${C.v}" d="M0,10 C-14,-6 -12,-16 -4,-16 C-1,-16 0,-13 0,-11 C0,-13 1,-16 4,-16 C12,-16 14,-6 0,10 Z"/>` : `<path d="M70,30 L110,58 M110,30 L70,58" stroke="${C.v}" stroke-width="8"/>`; es += envelope(`${id}-e${i}`, x, y, rot.toFixed(0), f ? C.cr : C.tc, sg); const t = .15 + i * (Math.min(dur - 1, 3.4)) / N; s += `tl.fromTo("#${id}-e${i}", { opacity: 0, y: -120 }, { opacity: 1, y: 0, duration: .16, ease: "power2.in", immediateRender: true }, ${t.toFixed(2)});`.replace(/y: -120/, `attr:{}`).replace(`, y: 0,`, `,`); if (i % 3 === 0) c.ev(t + .1, "papel", { dist: .12, db: -8 }); }
  let ct = ""; if (o.cit) { const t0 = c.cue("I") ?? dur * .55, n = [...o.cit].length; ct = `<div id="${id}-ct" style="position:absolute;left:${v ? 640 : 330}px;top:${v ? 380 : 400}px;width:${v ? 640 : 1260}px;padding:44px 50px;background:var(--creme);color:var(--sombra);font-family:'Apoio Ampulheta',serif;font-style:italic;font-size:${v ? 46 : 78}px;line-height:1.14;opacity:0;transform:rotate(-1.5deg)" data-layout-allow-overlap>“${o.cit}”</div>`; s += fade(`#${id}-ct`, 0, 1, .2, t0 - .1); }
  const corpo = `${mesa(id, f ? C.t : C.an)}${camada(`${id}-es`, es)}${ct}`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

const mulher = (x, y, e, cor, id) => `<g transform="translate(${x},${y}) scale(${e})"><g id="${id}"><path fill="${cor}" d="M-44,0 C-48,-60 -30,-96 -8,-112 C-2,-140 18,-160 40,-162 C58,-164 66,-146 60,-128 C52,-116 40,-112 30,-110 C50,-96 62,-58 66,0 Z"/><path fill="${C.cr}" d="M18,-150 C30,-168 62,-166 66,-142 C56,-152 34,-154 18,-150 Z"/><path d="M40,-92 C70,-72 94,-40 96,-12" stroke="${cor}" stroke-width="12" fill="none" stroke-linecap="round"/></g></g>`;
V.lavoura = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0, Y = 880, e = 1.3; const lin = [...Array(13)].map((_, i) => `<path d="M${960 + (i - 6) * 40},620 L${960 + (i - 6) * 320},1150" stroke="${C.mu}" stroke-width="${6 + Math.abs(i - 6) * 2}" opacity=".6"/>`).join("");
  const G = gerar(MARCHA, dur + 3, { S: MARCHA.S / e }); const R = andarEParar(G, MARCHA, { tMin: f ? .01 : Math.min(2, dur * .32), dur: dur + .2, idle: [] });
  const F = f ? parado(`${id}-a`, dur, { seed: 5, rot: [{ t: 0, e: "neutra" }], olhar: [{ t: 0, x: 1, y: .1 }] }) : [...faixasCorpo(`${id}-a`, R.T), ...secundarios(`${id}-a`, R.T), ...rosto(`${id}-a`, "perfil", dur + .2, { roteiro: [{ t: 0, e: "neutra" }, { t: dur * .55, e: "surpresa", d: .25 }, { t: dur * .75, e: "atenta", d: .4 }], olhar: [{ t: 0, x: 1, y: 0 }], piscarEm: [dur * .55], seed: 4 })];
  if (!f) c.evs(passosDe("Sakamaki", R.T, { dist: .25, telaX: () => 500, superficie: "lama", ate: dur }));
  const filha = f === 2 ? `<g transform="translate(1320,${Y})"><path fill="${C.v}" d="M-22,0 C-24,-40 -14,-64 0,-70 C14,-64 24,-40 22,0 Z"/><circle cy="-88" r="20" fill="${C.tc}"/><path d="M-20,-92 C-20,-114 20,-114 20,-92 C10,-100 -10,-100 -20,-92 Z" fill="${C.s}"/></g>` : "";
  const corpo = `${ceu(id, f === 1 ? "crepusculo" : "aurora", 1200, 520, 500)}${camada(`${id}-c1`, `<path d="${crista(5, 540, 70, 2800, 10)}" fill="${C.an}" opacity=".52"/><path d="${crista(9, 600, 36, 2800, 12)}" fill="${C.ol}" opacity=".85"/>`)}${camada(`${id}-g`, `<rect x="-300" y="620" width="2520" height="660" fill="${C.ol}"/>${lin}${mulher(1180, Y - 20, 1.45, C.v, `${id}-mu`)}${filha}${personagem(`${id}-a`, PR.civil, { x: f ? 720 : 90, y: Y + 8, e })}`)}${camada(`${id}-c3`, tufos(5, 40, -100, 2100, 1020, 86, C.mu))}`;
  return { corpo, script: `${push(id, 1, 1.05)}osc("#${id}-mu", { rotation: ${f === 0 ? 4 : 0} }, { rotation: ${f === 0 ? 14 : 2}, svgOrigin: "0 0" }, 2.4, 0, DUR);`, faixas: F, foco: f ? 960 : 860, amb: "campo", ambSom: "vento" };
};

V.dossie = (c) => {
  const { id, dur } = c, its = [["HEALTH CERTIFICATE", "health"], ["SCHOOL RECORDS", "school"], ["FAMILY BACKGROUND", "family"]]; let d = "", s = push(id, 1, 1.05, "50% 50%");
  its.forEach(([n, k], i) => { const x = 520 + i * 440, y = 540 + (i - 1) * 30, t = (c.cue(k) ?? .4 + i * 1) - .12; d += `<g id="${id}-d${i}" transform="translate(${x},${y}) rotate(${(i - 1) * 4})" opacity="0"><rect x="-192" y="-302" width="400" height="620" fill="${C.s}" opacity=".45"/><rect x="-200" y="-310" width="400" height="620" fill="${C.p}"/><foreignObject x="-180" y="-280" width="360" height="130"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:'Titulo Ampulheta',sans-serif;font-weight:700;font-size:52px;line-height:1.05;text-align:center;color:var(--sombra)">${n}</div></foreignObject><path d="M-160,-136 L160,-136" stroke="${C.s}" stroke-width="3"/>${[...Array(8)].map((_, l) => `<rect x="-160" y="${-108 + l * 44}" width="${320 - (l % 3) * 44}" height="9" fill="${C.t}" opacity=".6"/>`).join("")}<path d="M60,240 L110,290 L190,190" stroke="${C.v}" stroke-width="16" fill="none" stroke-linecap="round" id="${id}-ck${i}" opacity="0"/></g>`; s += `tl.fromTo("#${id}-d${i}", { opacity: 0 }, { opacity: 1, duration: .1, immediateRender: true }, ${t.toFixed(2)});${fade(`#${id}-ck${i}`, 0, 1, .08, t + .42)}`; c.ev(t, "papel", { dist: .1, db: -3 }); c.ev(t + .42, "carimbo", { dist: .1, db: -6 }); });
  return { corpo: `${mesa(id, C.t)}${camada(`${id}-ds`, d)}`, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

V.livro = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0;
  const corpo = `${mesa(id, f ? C.an : C.t)}${camada(`${id}-lv`, `<g transform="translate(960,540) rotate(-3)"><rect x="-305" y="-420" width="640" height="860" fill="${C.s}" opacity=".5"/><rect x="-320" y="-430" width="640" height="860" fill="${C.v}"/><rect x="-320" y="-430" width="46" height="860" fill="${C.s}" opacity=".32"/><rect x="-250" y="-360" width="500" height="4" fill="${C.oc}"/><rect x="-250" y="340" width="500" height="4" fill="${C.oc}"/>${(o.tit ? ["FOUR YEARS AS", "PRISONER OF WAR", "NUMBER ONE"] : ["I ATTACKED", "PEARL", "HARBOR"]).map((l, i) => `<text y="${-210 + i * 120}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${o.tit ? 82 : 112}" fill="${C.cr}">${l}</text>`).join("")}<text y="150" text-anchor="middle" font-family="Apoio Ampulheta" font-size="50" fill="${C.oc}">Kazuo Sakamaki</text>${o.tit ? "" : `<text y="280" text-anchor="middle" font-family="Apoio Ampulheta" font-size="46" fill="${C.oc}">1949</text>`}</g>`)}<div id="${id}-esc" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>`;
  c.ev(.15, "papel", { dist: .1, db: -5 });
  return { corpo, script: `${push(id, 1, 1.06, "50% 50%")}${f ? fade(`#${id}-esc`, 0, .72, dur * .8, .1) : ""}`, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

const carro = (x, y, e, cor) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M-120,10 L-104,-24 L-60,-34 L-26,-64 L50,-64 L82,-32 L118,-24 L128,10 Z"/><path fill="${C.m}" d="M-46,-34 L-20,-56 L10,-56 L10,-34 Z M20,-56 L46,-56 L68,-34 L20,-34 Z"/><circle cx="-64" cy="14" r="22" fill="${C.s}"/><circle cx="72" cy="14" r="22" fill="${C.s}"/><circle cx="-64" cy="14" r="9" fill="${C.tc}"/><circle cx="72" cy="14" r="9" fill="${C.tc}"/></g>`;
V.fabrica = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0;
  const corpo = `${ceu(id, f ? "dia" : "aurora", 1400, 420, 520)}${camada(`${id}-c1`, `<path d="M-200,620 L-200,380 L60,300 L60,380 L320,300 L320,380 L580,300 L580,380 L840,300 L840,380 L1100,300 L1100,380 L1360,300 L1360,380 L1620,300 L1620,380 L1880,300 L1880,380 L2200,300 L2200,620 Z" fill="${C.an}"/><rect x="1500" y="110" width="74" height="260" fill="${C.s}"/><rect x="1660" y="150" width="74" height="220" fill="${C.s}"/>${fumaca(`${id}-f1`, 1537, 100, .6, C.m, .5)}${fumaca(`${id}-f2`, 1697, 140, .55, C.m, .45)}`)}${camada(`${id}-l`, `<rect x="-300" y="620" width="2520" height="480" fill="${C.t}"/><rect x="-300" y="800" width="2520" height="36" fill="${C.s}"/>${[...Array(30)].map((_, i) => `<circle cx="${-300 + i * 90}" cy="818" r="11" fill="${C.t}"/>`).join("")}<g id="${id}-cr">${[...Array(9)].map((_, i) => carro(-500 + i * 400, 762, 1.3, [C.v, C.mu, C.oc, C.an][i % 4])).join("")}</g>`)}`;
  c.ev(.1, "relogio_b", { db: -10, dist: .5 });
  return { corpo, script: `${push(id, 1, 1.04)}tl.fromTo("#${id}-cr", { x: -200 }, { x: 240, duration: DUR, ease: "none" }, 0);tl.fromTo("#${id}-f1", { y: 0, scale: .9, svgOrigin: "0 0" }, { y: -40, scale: 1.1, svgOrigin: "0 0", duration: DUR, ease: "none" }, 0);tl.fromTo("#${id}-f2", { y: 0, scale: .9, svgOrigin: "0 0" }, { y: -30, scale: 1.1, svgOrigin: "0 0", duration: DUR, ease: "none" }, 0);`, faixas: [], foco: 900, amb: "rua", ambSom: "vento" };
};

V.brasil = (c) => {
  const { id, dur } = c, M = MAPAS.brasil, [x, y] = M.locais.brasil, e = .8;
  const corpo = `<div class="camada" style="width:2400px;height:1350px;transform-origin:0 0;transform:scale(.8)" data-layout-ignore><svg viewBox="0 0 2400 1350" class="cheio"><rect x="-300" y="-300" width="3000" height="2000" fill="${C.m}"/><path d="${M.terra}" fill="${C.tc}" stroke="${C.t}" stroke-width="4"/><g transform="translate(${x},${y})"><circle id="${id}-pl" r="26" fill="none" stroke="${C.v}" stroke-width="7"/><circle r="22" fill="${C.v}" stroke="${C.cr}" stroke-width="5"/><text x="46" y="16" font-family="Titulo Ampulheta" font-weight="700" font-size="74" fill="${C.s}">BRAZIL, 1969</text></g></svg></div>`;
  return { corpo, script: `${push(id, 1, 1.25, `${(x * e / 19.2).toFixed(0)}% ${(y * e / 10.8).toFixed(0)}%`)}tl.fromTo("#${id}-pl", { scale: 1, opacity: 1, svgOrigin: "0 0" }, { scale: 4, opacity: 0, svgOrigin: "0 0", duration: 1.2, repeat: Math.floor(DUR / 1.2), ease: "sine.out" }, 0);`, faixas: [], foco: x * e, amb: "seco" };
};

const salao = (id) => `${camada(`${id}-c0`, `<defs><linearGradient id="${id}-ch" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.s}"/><stop offset="1" stop-color="${C.t}"/></linearGradient><radialGradient id="${id}-lz"><stop offset="0" stop-color="${C.l}" stop-opacity=".6"/><stop offset="1" stop-color="${C.l}" stop-opacity="0"/></radialGradient></defs><rect x="-300" y="-200" width="2520" height="1000" fill="${C.an}"/><rect x="-300" y="760" width="2520" height="500" fill="url(#${id}-ch)"/><ellipse cx="1120" cy="480" rx="880" ry="420" fill="url(#${id}-lz)"/>${[0, 1, 2].map((i) => `<path d="M${620 + i * 500},-20 L${500 + i * 500},700 L${900 + i * 500},700 Z" fill="${C.l}" opacity=".07"/>`).join("")}`)}`;
/* f0 chega de fora; f1 salão vazio; f2 frente ao submarino */
V.museu = (c, o) => {
  const { id, dur } = c, f = o.f ?? 1, Y = 940; let s = "", F = [], figs = "";
  if (f === 0) {
    const e = 1.25, A = andando(`${id}-a`, dur, e, { lento: 1.3, rot: [{ t: 0, e: "neutra" }] });
    figs = personagem(`${id}-a`, PR.velho, { x: 120, y: 900, e }); F = A.faixas; c.evs(passosDe("Velho", A.T, { dist: .3, telaX: () => 600, superficie: "pedra", ate: dur }));
    return { corpo: `${ceu(id, "dia", 1500, 330, 560)}${camada(`${id}-c1`, `${nuvens(5, 110, C.cr, .45)}<rect x="700" y="290" width="1500" height="560" fill="${C.tc}"/><rect x="700" y="290" width="1500" height="44" fill="${C.t}"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${760 + i * 200}" y="340" width="46" height="510" fill="${C.p}"/>`).join("")}<rect x="1090" y="620" width="240" height="230" fill="${C.s}"/><text x="1210" y="432" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="50" letter-spacing="2" fill="${C.s}">MUSEUM OF THE PACIFIC WAR</text><path d="M-300,850 L2300,850" stroke="${C.t}" stroke-width="10"/>`)}${camada(`${id}-g`, `<rect x="-300" y="855" width="2520" height="380" fill="${C.t}"/><rect x="-300" y="855" width="2520" height="44" fill="${C.oc}" opacity=".6"/>${figs}`)}`, script: push(id, 1, 1.04), faixas: F, foco: 620, amb: "rua", ambSom: "vento" };
  }
  if (f === 2) { figs = personagem(`${id}-a`, PR.velho, { x: c.v ? 540 : 310, y: Y, e: 1.55 }); F = parado(`${id}-a`, dur, { seed: 7, rot: [{ t: 0, e: "cansaco" }], olhar: [{ t: 0, x: 1, y: -.1 }], piscar: [dur * .55], idle: [{ t: dur * .45, d: 1.2, tr: 3, hd: -3 }] }); }
  const corda = [...Array(5)].map((_, i) => `<rect x="${200 + i * 400}" y="${Y - 90}" width="14" height="100" fill="${C.oc}"/><circle cx="${207 + i * 400}" cy="${Y - 96}" r="13" fill="${C.oc}"/>`).join("") + [...Array(4)].map((_, i) => `<path d="M${207 + i * 400},${Y - 90} Q${407 + i * 400},${Y - 40} ${607 + i * 400},${Y - 90}" stroke="${C.v}" stroke-width="11" fill="none"/>`).join("");
  const corpo = `${salao(id)}${camada(`${id}-g`, `<rect x="760" y="600" width="60" height="140" fill="${C.s}"/><rect x="1400" y="600" width="60" height="140" fill="${C.s}"/>${sub(`${id}-s`, c.v && f === 2 ? 990 : 1120, c.v && f === 2 ? 560 : 500, c.v && f === 2 ? .8 : 1.65, { luz: C.m, base: C.ol })}<path d="M1490,420 L1540,450 L1500,500 L1556,540 L1510,600" stroke="${C.s}" stroke-width="5" fill="none" opacity=".7"/>${corda}${figs}`)}`;
  s = f === 1 ? `tl.fromTo("#${id}-g", { x: 160 }, { x: -60, duration: DUR, ease: "none" }, 0);${push(id, 1, 1.06)}` : push(id, 1, 1.1, "40% 55%");
  if (f === 2) c.ev(.1, "passo_pedra", { dist: .3, db: -6 });
  return { corpo, script: s, faixas: F, foco: f === 2 ? (c.v ? 790 : 660) : 1100, amb: "interior", ambSom: "sala" };
};

V.monumento = (c, o) => {
  const { id, dur, v } = c, f = o.f, Yb = 860; let postes = "", s = "";
  for (let i = 0; i < 9; i++) { const x = 960 + (i - 4) * (v ? 66 : 100), h = 300 - Math.abs(i - 4) * 12; postes += `<g id="${id}-pp${i}"><rect x="${x - 20}" y="${Yb - h}" width="40" height="${h}" fill="${C.t}"/><rect x="${x - 20}" y="${Yb - h}" width="13" height="${h}" fill="${C.s}" opacity=".34"/></g>`; }
  if (f === 1 && !o.sem) for (let i = 0; i < 9; i++) { const t = .8 + i * (dur - 1.4) / 9; s += `tl.fromTo("#${id}-gw${i}", { opacity: 0 }, { opacity: .85, duration: .2, immediateRender: true }, ${t.toFixed(2)});`; c.ev(t, "impacto_suave", { db: -14, dist: .4, bus: "efeitos", origem: "poste" }); }
  const brilho = f === 1 && !o.sem ? [...Array(9)].map((_, i) => { const x = 960 + (i - 4) * (v ? 66 : 100), h = 300 - Math.abs(i - 4) * 12; return `<rect id="${id}-gw${i}" x="${x - 20}" y="${Yb - h}" width="40" height="${h}" fill="${C.l}" opacity="0"/>`; }).join("") : "";
  const placa = `<g transform="translate(960,${Yb}) scale(${v ? .76 : 1})"><rect x="-300" y="-170" width="600" height="180" fill="${C.s}"/><rect x="-286" y="-156" width="572" height="152" fill="${C.oc}"/>${[...Array(5)].map((_, i) => `<rect x="-246" y="${-136 + i * 24}" width="${492 - (i % 2) * 90}" height="7" fill="${C.t}"/>`).join("")}</g>`;
  const corpo = `${ceu(id, "crepusculo", 1320, 520, 560)}${camada(`${id}-c1`, `<path d="${crista(4, 520, 50, 2800, 10)}" fill="${C.an}" opacity=".62"/>${mar(id, 600, C.an, C.oc)}`)}${camada(`${id}-g`, `<path d="M-300,830 C400,790 1500,800 2300,840 L2300,1300 L-300,1300 Z" fill="${C.mu}"/>${postes}${brilho}${placa}<path d="${crista(14, 960, 16, 2800, 20)}" fill="${C.s}"/>${tufos(3, 60, -100, 2100, 950, 70, C.s)}`)}`;
  const esc = f === 2 ? `<div id="${id}-f" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>` : "";
  if (f === 2) s += `tl.fromTo("#${id}-f", { opacity: 0 }, { opacity: 1, duration: 1.1, ease: "sine.in", immediateRender: true }, ${(dur - 1.15).toFixed(2)});`;
  c.ev(.1, "vento", { db: -22, dist: .4 });
  return { corpo: corpo + esc, script: push(id, v ? 1 : f === 0 ? 1 : f === 1 ? 1.1 : 1.25, v ? 1.04 : f === 0 ? 1.08 : f === 1 ? 1.22 : 1.38, "50% 60%") + s, faixas: [], foco: 960, amb: "campo", ambSom: "vento", semMusica: f === 2 };
};
export { V };
