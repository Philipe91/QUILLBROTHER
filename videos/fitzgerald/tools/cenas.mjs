// Cenas do Edmund Fitzgerald. Nenhuma mostra morte, corpo ou os últimos momentos a bordo. Mapa do lago é ilustrativo, traçado à mão.
import { C, FPS, camada, push, fade, lisa, tab, ceu, estrelas, nuvens, mar, fundoAgua, silhueta, mesa, parado, PR, crista, tufos, fumaca, rng, busto, personagem, rosto, evento, aviao } from "./lib.mjs";
import { V as VS } from "./cenas2.mjs";
export const V = { citacao: VS.citacao };

/* cargueiro dos Lagos, proa à direita. Origem na linha d'água. */
export function cargueiro(id, x, y, e = 1, { cor = C.t, conves = C.oc, luzes = false, flip = false, nome = "" } = {}) {
  const tampas = [...Array(21)].map((_, i) => `<rect x="${-420 + i * 40}" y="-86" width="30" height="9" fill="${C.s}" opacity=".8"/>`).join("");
  const ja = (x0, n) => luzes ? [...Array(n)].map((_, i) => `<circle cx="${x0 + i * 14}" cy="-112" r="3" fill="${C.l}"/>`).join("") : "";
  return `<g transform="translate(${x},${y}) scale(${flip ? -e : e},${e})"><g id="${id}">
    <path fill="${cor}" d="M-560,20 L-548,-78 L-470,-78 L-470,-74 L520,-74 L520,-92 L590,-92 Q626,-60 610,20 Z"/>
    <path fill="${C.s}" opacity=".4" d="M-560,20 L-556,-14 L616,-14 L610,20 Z"/>
    <rect x="-470" y="-80" width="990" height="7" fill="${conves}"/>${tampas}
    <path fill="${C.tc}" d="M470,-92 L470,-136 L560,-136 L572,-92 Z"/><path fill="${C.s}" d="M478,-128 L556,-128 L560,-112 L478,-112 Z"/><rect x="500" y="-168" width="5" height="34" fill="${C.s}"/>
    <path fill="${C.tc}" d="M-548,-78 L-548,-130 L-462,-130 L-462,-78 Z"/><rect x="-524" y="-180" width="36" height="52" fill="${C.v}"/><rect x="-524" y="-180" width="36" height="9" fill="${C.s}"/>
    ${ja(-540, 6)}${ja(484, 5)}${nome ? `<text x="430" y="-30" font-family="Titulo Ampulheta" font-weight="600" font-size="24" letter-spacing="2" fill="${C.cr}">${nome}</text>` : ""}
  </g></g>`;
}
const ondas = (id, y, amp, cor, n = 3) => [...Array(n)].map((_, i) => `<path id="${id}-w${i}" fill="${i === n - 1 ? cor : C.s}" opacity="${i === n - 1 ? 1 : .35 + i * .12}" d="${crista(11 + i * 5, y + i * 34, amp * (1 - i * .12), 3600, 16 + i * 4, -800)}"/>`).join("");
const ondasAn = (id, per, dx, n = 3) => [...Array(n)].map((_, i) => `osc("#${id}-w${i}", { x: ${-dx * (i + 1)}, y: ${-amp2(i, dx)} }, { x: ${dx * (i + 1)}, y: ${amp2(i, dx)} }, ${(per + i * .35).toFixed(2)}, 0, DUR);`).join("");
const amp2 = (i, dx) => (dx * .35 + i * 2).toFixed(1);
const neve = (id, n, dv = 1) => { const r = rng(19); let s = "", an = ""; for (let i = 0; i < n; i++) { const x = r() * 2300 - 200, y0 = r() * 1300 - 200, dd = 160 + r() * 200, rr = 1.6 + r() * 3.2; s += `<circle id="${id}-n${i}" cx="${x.toFixed(0)}" cy="${y0.toFixed(0)}" r="${rr.toFixed(1)}" fill="${C.cr}" opacity="${(.4 + r() * .5).toFixed(2)}"/>`; an += `tl.fromTo("#${id}-n${i}", { x: 0, y: 0 }, { x: ${(-dd * dv * 1.4).toFixed(0)}, y: ${(dd * dv).toFixed(0)}, duration: DUR, ease: "none", immediateRender: true }, 0);`; } return { s, an }; };

/* --- NAVIO --- */
V.navio = (c, o) => {
  const { id, dur, v } = c, m = o.mar ?? 1, tipo = o.ceu ?? "cinza", Y = 690, e = (v ? .47 : 1) * (o.longe === 2 ? .3 : o.longe ? .42 : o.perto ? 1.12 : o.gente ? 1.05 : .9);
  let s = push(id, 1, 1.05), x0 = !v && o.longe === 2 ? 1250 : o.gente && !v ? 980 : 960, F = [];
  const ampM = [3, 9, 22, 46, 68, 90][m], corM = tipo === "dia" ? C.m : C.an, nome = o.anderson ? "ARTHUR M. ANDERSON" : "EDMUND FITZGERALD", corNavio = o.anderson ? C.mu : C.t;
  const lista = o.lista ? 6 : 0, balAmp = m >= 3 ? (m - 1) * 1.15 : .25, per = 3.2 - m * .22;
  const ang = tab(dur, (t) => lista + balAmp * Math.sin(6.283 * t / per)), mov = tab(dur, (t) => (m >= 3 ? (m * 7) : 2) * Math.sin(6.283 * t / per + 1));
  F.push([`${id}-sh`, "rotation", ang, "0 0"], [`${id}-sh`, "y", mov]);
  const gente = o.gente ? [...Array(30)].map((_, i) => silhueta(-60 + i * 72 + (i % 3) * 7, 910 - (i % 2) * 10, .62, [C.s, C.an, C.t][i % 3])).join("") : "";
  const n = o.neve || m >= 3 ? neve(id, o.neve === 2 ? 190 : 120, o.neve === 2 ? 2.4 : 1.8) : { s: "", an: "" };
  let extra = "";
  if (o.bote) { const t = dur * .62; extra = `<g transform="translate(${x0 - 400},${Y - 150})"><g id="${id}-bt"><path fill="${C.cr}" d="M-44,0 L44,0 L30,20 L-30,20 Z"/></g></g>`; s += `tl.fromTo("#${id}-bt", { x: 0, y: 0, rotation: 0, svgOrigin: "0 0" }, { x: -280, y: 280, rotation: -70, svgOrigin: "0 0", duration: 1.3, ease: "power2.in", immediateRender: true }, ${t.toFixed(2)});`; c.ev(t, "impacto_suave", { db: 4, dist: .3 }); c.ev(t + .1, "equipamento", { db: 6, dist: .3 }); c.ev(t + 1.2, "splash", { db: 2, dist: .5 }); }
  if (o.engole) { const ts = o.engole === 1 ? [dur * .55] : [dur * .12, dur * .42]; extra = `<g id="${id}-gr"><path fill="${C.m}" d="M-400,1300 L-400,420 C200,180 900,240 1300,460 C1700,660 2100,620 2400,600 L2400,1300 Z"/><path fill="${C.cr}" opacity=".85" d="M-400,450 C200,210 900,270 1300,490 C900,330 200,270 -400,500 Z"/></g>`; ts.forEach((t, k) => { s += `tl.fromTo("#${id}-gr", { x: -1900, y: 120 }, { x: 1700, y: 60, duration: 1.8, ease: "sine.inOut", immediateRender: ${k === 0} }, ${t.toFixed(2)});`; c.ev(t + .7, "explosao_longe", { dist: .3, db: 6, origem: "onda" }); c.ev(t + .8, "impacto_suave", { db: 8, dist: .15 }); }); }
  if (o.volta) { s += `tl.fromTo("#${id}-sh", { scaleX: 1, svgOrigin: "0 0" }, { scaleX: -1, svgOrigin: "0 0", duration: ${(dur * .7).toFixed(2)}, ease: "sine.inOut", immediateRender: true }, .3);`; }
  const corpo = `${ceu(id, tipo, tipo === "noite" ? 1500 : 1300, tipo === "noite" ? 200 : 460, m >= 3 ? 1 : tipo === "noite" ? 280 : 520)}${camada(`${id}-c1`, `${m >= 3 ? `<path d="${crista(3, 250, 60, 3000, 14)}" fill="${C.s}" opacity=".55"/><path d="${crista(8, 150, 50, 3000, 12)}" fill="${C.s}" opacity=".7"/>` : tipo === "noite" ? "" : nuvens(4, 170, tipo === "dia" ? C.cr : C.an, tipo === "dia" ? .45 : .7)}${o.gente ? `<path d="${crista(6, 640, 20, 2800, 14)}" fill="${C.ol}" opacity=".5"/>` : ""}`)}${camada(`${id}-g`, `<rect x="-400" y="${Y - 8}" width="2800" height="700" fill="${corM}"/>${cargueiro(`${id}-sh`, x0, Y, e, { luzes: tipo === "noite", cor: corNavio, nome: o.longe || o.volta ? "" : nome })}${extra}${ondas(id, Y + 4, ampM, corM)}${m >= 3 ? `<g id="${id}-es">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${i * 300 - 300},${Y + 40 + (i % 3) * 34} q70,-30 150,-4 q-70,-8 -150,4 Z" fill="${C.cr}" opacity=".7"/>`).join("")}</g>` : ""}${gente}`)}${n.s ? camada(`${id}-nv`, n.s) : ""}`;
  s += ondasAn(id, Math.max(1.2, per), 10 + m * 12) + n.an + (m >= 3 ? `osc("#${id}-es", { x: -90, y: -8 }, { x: 90, y: 14 }, ${Math.max(1.4, per).toFixed(2)}, 0, DUR);` : "");
  if (m >= 3) c.ev(.1, "impacto_suave", { db: -6 + m, dist: .5, bus: "efeitos", origem: "casco" });
  if (o.gente) c.ev(.1, "equipamento", { db: 0, dist: .4 });
  return { corpo, script: s, faixas: F, foco: 960, amb: "campo", ambSom: m >= 3 ? "vento" : o.gente ? "multidao" : "mar" };
};

/* --- FRASE EM TELA --- */
V.frase = (c, o) => {
  const { id, dur, v } = c, tx = o.t, n = [...tx].length, dt = Math.min(.038, (dur - .8) / n); let an = "";
  [...tx].forEach((_, i) => { an += `tl.set("#${id}-q${i}", { opacity: 1 }, ${(.2 + i * dt).toFixed(3)});`; });
  const sub = o.sub ? `<div id="${id}-sb" style="margin-top:32px;font-family:'Apoio Ampulheta',serif;font-style:italic;font-size:${v ? 30 : 42}px;color:var(--ocre);opacity:0">${o.sub}</div>` : "";
  if (o.sub) an += fade(`#${id}-sb`, 0, 1, .4, .4 + n * dt);
  const porta = o.fundo === "porta" ? camada(`${id}-pt`, `<rect x="660" y="60" width="600" height="1020" fill="${C.t}"/><rect x="700" y="100" width="520" height="980" fill="${C.s}" opacity=".5"/><circle cx="1140" cy="580" r="26" fill="${C.oc}"/><rect x="820" y="200" width="280" height="200" rx="90" fill="${C.an}"/>`, "opacity:.42") : "";
  const corpo = `<div class="camada" style="background:var(--sombra)" data-layout-ignore></div>${porta}<div class="camada" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 ${v ? 690 : 180}px" data-layout-ignore><div style="font-family:'Titulo Ampulheta',sans-serif;font-weight:600;font-size:${v ? 62 : 104}px;line-height:1.12;color:var(--creme)">${[...tx].map((ch, i) => `<span id="${id}-q${i}" style="opacity:0">${ch}</span>`).join("")}</div>${sub}</div>`;
  c.ev(.05, "radio", { db: 0 });
  return { corpo, script: push(id, 1, 1.04, "50% 50%") + an, faixas: [], foco: 960, amb: "seco", ambSom: "vento", calar: 1 };
};

/* --- RADAR --- */
V.radar = (c, o) => {
  const { id, dur, v } = c, m = o.m, R = 440; const anel = [1, 2, 3, 4].map((k) => `<circle r="${k * R / 4}" fill="none" stroke="${C.ol}" stroke-width="2" opacity=".55"/>`).join(""), raios = [...Array(12)].map((_, i) => `<path d="M0,0 L0,${-R}" stroke="${C.ol}" stroke-width="1" opacity=".3" transform="rotate(${i * 30})"/>`).join("");
  let s = `tl.fromTo("#${id}-var", { rotation: 0, svgOrigin: "0 0" }, { rotation: ${(dur * 90).toFixed(0)}, svgOrigin: "0 0", duration: DUR, ease: "none" }, 0);`;
  const voltas = Math.floor(dur * 90 / 360) + 1;
  // Anderson no centro, Fitzgerald acima
  let extra = `<g transform="translate(0,0)"><path d="M0,-16 L10,12 L-10,12 Z" fill="${C.l}"/></g><text x="24" y="28" font-family="Titulo Ampulheta" font-weight="600" font-size="30" fill="${C.l}">ANDERSON</text>`;
  const fitz = `<g id="${id}-fz" transform="translate(30,-250)"><circle r="17" fill="${C.cr}"/><circle id="${id}-fg" r="17" fill="none" stroke="${C.cr}" stroke-width="4"/></g><text id="${id}-fl" x="60" y="-240" font-family="Titulo Ampulheta" font-weight="600" font-size="30" fill="${C.cr}">FITZGERALD</text>`;
  if (m === "some") { extra += fitz; const t = dur * .35; s += `tl.to("#${id}-fz", { opacity: 0, duration: .15 }, ${t.toFixed(2)});tl.to("#${id}-fl", { opacity: 0, duration: .15 }, ${t.toFixed(2)});`;  }
  if (m === "dois") { extra += fitz; s += `osc("#${id}-fg", { scale: 1, opacity: .9, svgOrigin: "0 0" }, { scale: 2.1, opacity: 0, svgOrigin: "0 0" }, 1.4, 0, DUR);`; }
  if (m === "apaga") { extra = `<g id="${id}-tela">${extra}${fitz}</g>`; const t = dur * .22; s += `tl.to("#${id}-tela", { opacity: 0, duration: .08 }, ${t.toFixed(2)});tl.to("#${id}-var", { opacity: 0, duration: .08 }, ${t.toFixed(2)});tl.fromTo("#${id}-of", { opacity: 0 }, { opacity: 1, duration: .1, immediateRender: true }, ${(t + .1).toFixed(2)});`; c.ev(t, "impacto_suave", { db: 0, dist: .2 }); }
  if (m === "shoal") { extra += `<ellipse cx="-90" cy="-110" rx="90" ry="44" fill="${C.oc}" opacity=".5"/><text x="-90" y="-100" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="24" fill="${C.cr}">SHOAL</text><g id="${id}-fz"><circle r="15" fill="${C.cr}"/></g>`; s += `tl.fromTo("#${id}-fz", { x: -300, y: -240 }, { x: 120, y: -40, duration: DUR, ease: "none", immediateRender: true }, 0);`; }
  c.ev(.05, "relogio_b", { db: -6, dist: .3 });
  const corpo = camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.t}"/><rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}" opacity=".55"/><g transform="translate(960,540) scale(${v ? .62 : 1})"><circle r="${R + 34}" fill="${C.s}"/><circle r="${R + 34}" fill="none" stroke="${C.oc}" stroke-width="8"/><circle r="${R}" fill="${C.mu}" opacity=".4"/>${anel}${raios}<g id="${id}-var"><path d="M0,0 L0,${-R} A${R},${R} 0 0 1 ${R * .5},${-R * .866} Z" fill="${C.ol}" opacity=".35"/><path d="M0,0 L0,${-R}" stroke="${C.tc}" stroke-width="4"/></g>${extra}${m === "apaga" ? `<text id="${id}-of" x="0" y="20" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="72" fill="${C.v}" opacity="0">NO SIGNAL</text>` : ""}</g>`);
  return { corpo, script: push(id, 1, 1.05, "50% 50%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "motor" };
};

/* --- SILHUETAS, 29 --- */
V.silhuetas = (c) => {
  const { id, dur, v } = c; let g = "", s = ""; const E = v ? .3 : .34, col = v ? 6 : 10, dx = v ? 90 : 150, dy = v ? 118 : 170, x0 = 960 - (col - 1) * dx / 2, y0 = v ? 260 : 300;
  for (let i = 0; i < 29; i++) { const x = x0 + (i % col) * dx, y = y0 + Math.floor(i / col) * dy; g += `<g id="${id}-p${i}" opacity="0">${silhueta(x, y, E, C.tc)}</g>`; s += fade(`#${id}-p${i}`, 0, 1, .15, .1 + i * Math.min(.1, (dur - .8) / 29)); }
  return { corpo: camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/>${g}`), script: push(id, 1, 1.03, "50% 50%") + s, faixas: [], foco: 960, amb: "seco", ambSom: "vento" };
};

/* --- PASTAS DAS TEORIAS --- */
const TEORIAS = ["HATCHES", "SHOAL", "HULL", "WAVE"];
V.pastas = (c, o) => {
  const { id, dur, v } = c, f = o.f ?? 0; const pos = v ? [[810, 300], [1110, 300], [810, 690], [1110, 690]] : [[330, 520], [750, 520], [1170, 520], [1590, 520]], E = v ? .72 : 1;
  let g = "", s = ""; pos.forEach(([x, y], i) => { const on = o.foco === undefined || o.foco === i; g += `<g transform="translate(${x},${y}) scale(${E}) rotate(${(i - 1.5) * 1.6})" opacity="${on ? 1 : .32}"><g id="${id}-p${i}"><path fill="${C.oc}" d="M-180,-240 L-60,-240 L-30,-208 L180,-208 L180,240 L-180,240 Z"/><rect x="-180" y="-196" width="360" height="436" fill="${C.p}"/><text y="-90" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="58" letter-spacing="2" fill="${C.s}">${TEORIAS[i]}</text>${[0, 1, 2, 3, 4].map((l) => `<rect x="-140" y="${-50 + l * 34}" width="${280 - (l % 3) * 50}" height="8" fill="${C.t}" opacity=".55"/>`).join("")}${f === 3 ? `<circle cx="${60 - i * 24}" cy="${60 + i * 30}" r="46" fill="${C.t}"/><circle cx="${60 - i * 24}" cy="${60 + i * 30}" r="46" fill="none" stroke="${C.s}" stroke-width="5" stroke-dasharray="7 6"/>` : ""}<g id="${id}-st${i}" opacity="0" transform="rotate(-11) translate(0,160)"><rect x="-150" y="-44" width="300" height="84" fill="none" stroke="${C.v}" stroke-width="7"/><text y="16" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="46" fill="${C.v}">UNPROVEN</text></g></g></g>`; if (f === 0 && o.foco === undefined) s += `tl.fromTo("#${id}-p${i}", { y: -900 }, { y: 0, duration: .36, ease: "power3.in", immediateRender: true }, ${(.1 + i * .25).toFixed(2)});`; if (f === 0 && o.foco === undefined) c.ev(.36 + i * .25, "papel", { dist: .1, db: -2 }); if (f === 1) { const t = .2 + i * (dur - .6) / 4; s += `tl.fromTo("#${id}-st${i}", { opacity: 0, scale: 1.5, svgOrigin: "0 0" }, { opacity: 1, scale: 1, svgOrigin: "0 0", duration: .09, ease: "power3.in", immediateRender: true }, ${t.toFixed(2)});`; c.ev(t + .09, "carimbo", { dist: .05, db: 0 }); } });
  if (o.lista) ["hatches", "shoal", "hull", "wave"].forEach((k, i) => { });
  return { corpo: `${mesa(id, C.an)}${camada(`${id}-g`, g)}`, script: push(id, 1, 1.05, "50% 50%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- LIVRO --- */
V.livro = (c) => {
  const { id } = c;
  const corpo = `${mesa(id, C.t)}${camada(`${id}-l`, `<rect x="370" y="150" width="1190" height="800" fill="${C.s}" opacity=".5"/><rect x="350" y="130" width="600" height="800" fill="${C.p}"/><rect x="960" y="130" width="600" height="800" fill="${C.p}"/><rect x="946" y="130" width="18" height="800" fill="${C.t}" opacity=".4"/><text x="650" y="300" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="74" fill="${C.s}">LAKE SUPERIOR</text><text x="650" y="380" text-anchor="middle" font-family="Apoio Ampulheta" font-style="italic" font-size="52" fill="${C.t}">November 10, 1975</text>${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="440" y="${450 + i * 60}" width="${420 - (i % 3) * 70}" height="8" fill="${C.t}" opacity=".5"/>`).join("")}<g transform="translate(1260,530)">${cargueiro(`${id}-sh`, 0, 0, .42, {})}<path d="M-280,18 Q-140,4 0,18 T280,18" fill="none" stroke="${C.an}" stroke-width="6"/></g>`)}`;
  c.ev(.1, "papel", { dist: .1, db: -2 });
  return { corpo, script: push(id, 1, 1.05, "50% 50%"), faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- MAPA DO LAGO SUPERIOR: traçado ilustrativo --- */
const CTR = [[-92.1, 46.75], [-91.4, 47.2], [-90.4, 47.72], [-89.6, 48.02], [-89.2, 48.42], [-88.6, 48.6], [-88.2, 48.9], [-87.4, 48.75], [-86.6, 48.75], [-86.0, 48.45], [-85.9, 48.05], [-85.0, 47.95], [-84.85, 47.6], [-84.65, 47.25], [-84.7, 46.9], [-84.6, 46.5], [-84.95, 46.48], [-85.0, 46.77], [-85.95, 46.68], [-86.6, 46.45], [-87.4, 46.52], [-87.7, 46.85], [-88.2, 46.95], [-88.45, 46.78], [-88.15, 47.2], [-87.72, 47.47], [-88.6, 47.25], [-89.6, 46.85], [-90.4, 46.62], [-90.75, 46.95], [-91.2, 46.85]];
const P = ([lo, la]) => [+((lo + 92.7) * 215 + 90).toFixed(1), +((49.15 - la) * 316 + 110).toFixed(1)];
const CAM = (z0, z1, lo, la) => { const [x, y] = P([lo, la]); return [z0, z1, x, y]; };
const liso = (pts, fecha = true) => { const n = pts.length; let d = `M${pts[0][0].toFixed(0)},${pts[0][1].toFixed(0)}`; for (let i = 0; i < (fecha ? n : n - 1); i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(0)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(0)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(0)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(0)} ${p2[0].toFixed(0)},${p2[1].toFixed(0)}`; } return d; };
const LUG = { superior: [-92.05, 46.72], two: [-91.67, 47.02], otter: [-85.75, 47.9], caribou: [-85.82, 47.35], shoal: [-85.72, 47.5], white: [-84.97, 46.77], bay: [-84.85, 46.6], wreck: [-85.1, 47.0], marais: [-85.98, 46.68], isle: [-88.9, 48.0], woodrush: [-92.0, 46.74] };
const rotas = { fitz: [[-92, 46.8], [-90.6, 47.15], [-89, 47.85], [-87.5, 48.05], [-86.2, 47.95], [-85.72, 47.5], [-85.1, 47.0]], ande: [[-91.6, 47.05], [-90.5, 47.3], [-89, 47.75], [-87.5, 47.95], [-86.3, 47.85], [-85.75, 47.3], [-85.1, 46.75], [-84.85, 46.6]] };
const linha = (L) => { const pts = L.map(P); let d = `M${pts[0]}`; for (let i = 1; i < pts.length; i++) d += ` L${pts[i]}`; return d; };
const trecho = (L, a, b) => L.slice(a, b + 1);
V.mapa = (c, o) => {
  const { id, dur, v } = c, m = o.m; let e = "", s = ""; const lago = liso(CTR.map(P));
  const rot = (k, tx, dx = 16, dy = 10, g = 34) => { const [x, y] = P(LUG[k]); return `<circle cx="${x}" cy="${y}" r="9" fill="${C.v}" stroke="${C.cr}" stroke-width="3"/><text x="${x + dx}" y="${y + dy}" ${dx < 0 ? 'text-anchor="end"' : ""} font-family="Titulo Ampulheta" font-weight="600" font-size="${g}" fill="${C.s}">${tx}</text>`; };
  const rt = (d, cor, sid, t0 = .15, dd = dur * .8) => { s += `tl.fromTo(["#${id}-${sid}a","#${id}-${sid}b"], { attr: { "stroke-dashoffset": 110 } }, { attr: { "stroke-dashoffset": 0 }, duration: ${dd.toFixed(2)}, ease: "none" }, ${t0.toFixed(2)});`; return `<path id="${id}-${sid}a" d="${d}" fill="none" stroke="${C.s}" stroke-width="11" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" stroke-linecap="round"/><path id="${id}-${sid}b" d="${d}" fill="none" stroke="${cor}" stroke-width="6" pathLength="100" stroke-dasharray="100 120" stroke-dashoffset="110" stroke-linecap="round"/>`; };
  let cam = [1, 1.05, 960, 540];
  if (m === "viagens") { e += rot("superior", "SUPERIOR") + rot("white", "WHITEFISH POINT", 16, 40); e += rt(linha([[-92, 46.8], [-89, 47.5], [-86, 47.4], [-85.1, 46.9], [-84.85, 46.6]]), C.v, "r"); }
  if (m === "dois") { e += rot("superior", "SUPERIOR") + rot("two", "TWO HARBORS", 16, -14); e += rt(linha(trecho(rotas.fitz, 0, 2)), C.v, "f", .1, dur * .8) + rt(linha(trecho(rotas.ande, 0, 1)), C.an, "a", .3, dur * .7); cam = CAM(1.3, 1.42, -90.6, 47.4); }
  if (m === "norte") { e += rot("isle", "ISLE ROYALE", 18, 42) + `<text x="${P([-87.3, 49.1])[0]}" y="${P([-87.3, 49.1])[1]}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="46" letter-spacing="8" fill="${C.t}" opacity=".7">CANADA</text>`; e += rt(linha(trecho(rotas.fitz, 0, 4)), C.v, "f") + rt(linha(trecho(rotas.ande, 0, 4)), C.an, "a", .35, dur * .75); }
  if (m === "sudeste") { e += rot("white", "WHITEFISH POINT", 16, 40) + rot("caribou", "CARIBOU ISLAND", -20, 10); e += `<path d="${linha(trecho(rotas.fitz, 0, 4))}" fill="none" stroke="${C.s}" stroke-width="6" opacity=".4"/>` + rt(linha(trecho(rotas.fitz, 4, 6)), C.v, "f"); cam = CAM(1.7, 1.86, -85.7, 47.3); }
  if (m === "duvida") { const [x, y] = P(LUG.shoal); e += rot("white", "WHITEFISH POINT", 16, 40) + `<text id="${id}-q" x="${x - 30}" y="${y}" font-family="Titulo Ampulheta" font-weight="700" font-size="120" fill="${C.v}">?</text>` + `<path d="${linha(trecho(rotas.fitz, 3, 5))}" fill="none" stroke="${C.v}" stroke-width="6" stroke-dasharray="14 12"/>`; s += `osc("#${id}-q", { opacity: .3 }, { opacity: 1 }, 1, 0, DUR);`; cam = CAM(1.7, 1.86, -86.2, 47.6); }
  if (m === "cutter") { e += rot("woodrush", "WOODRUSH: 300 MILES", 16, 44) + rot("bay", "NAUGATUCK: LIMITED TO 60 KNOTS", -20, 54) + rot("wreck", "", 0, 0); s += ""; cam = [1, 1.05, 960, 540]; }
  if (m === "baia") { e += rot("bay", "WHITEFISH BAY", -20, 54) + rot("wreck", "SEARCH AREA", -20, -10); e += rt(linha([[-84.85, 46.6], [-84.98, 46.82], [-85.1, 47.0]]), C.an, "a"); cam = CAM(2.1, 2.3, -85.2, 46.85); }
  if (m === "shoal") { const [x, y] = P(LUG.shoal); e += rot("caribou", "CARIBOU ISLAND", -20, 50) + `<ellipse cx="${x}" cy="${y}" rx="60" ry="30" fill="${C.oc}" opacity=".75"/><text x="${x + 76}" y="${y + 12}" font-family="Titulo Ampulheta" font-weight="700" font-size="42" fill="${C.s}">SIX FATHOM SHOAL</text>`; cam = CAM(2.3, 2.5, -85.6, 47.45); }
  const corpo = `<div id="${id}-m" class="camada" style="width:1920px;height:1080px;transform-origin:0 0" data-layout-ignore><svg viewBox="0 0 1920 1080" class="cheio"><rect x="-1500" y="-1500" width="5000" height="4200" fill="${C.tc}"/><path d="${lago}" fill="${C.m}" stroke="${C.t}" stroke-width="4"/>${e}</svg></div>`;
  const [z0, z1, cx, cy] = cam, T = (z) => `x: ${(960 - cx * z).toFixed(0)}, y: ${(540 - cy * z).toFixed(0)}, scale: ${z}`;
  s += `tl.set("#${id}-m", { transformOrigin: "0 0" }, 0);tl.fromTo("#${id}-m", { ${T(z0)} }, { ${T(z1)}, duration: DUR, ease: "none", immediateRender: true }, 0);`;
  c.ev(.05, "papel", { db: -8, dist: .2 });
  return { corpo, script: s, faixas: [], foco: 960, amb: "seco", fitV: v ? 1240 : null, fundoV: "var(--terra-clara)" };
};

/* --- DOCA --- */
V.doca = (c) => {
  const { id, dur } = c; const r = rng(5); let pel = "", an = ""; for (let i = 0; i < 36; i++) { const x = 500 + (i % 6) * 190 + r() * 40; pel += `<circle id="${id}-b${i}" cx="${x.toFixed(0)}" cy="480" r="${(4 + r() * 4).toFixed(1)}" fill="${C.t}"/>`; an += `tl.fromTo("#${id}-b${i}", { y: 0, opacity: 1 }, { y: 150, opacity: 1, duration: .5, ease: "power1.in", repeat: ${Math.ceil(dur / .5)}, immediateRender: true }, ${(r() * .5).toFixed(2)});`; }
  const calha = [...Array(6)].map((_, i) => `<path d="M${470 + i * 190},300 L${540 + i * 190},300 L${540 + i * 190},500 L${500 + i * 190},500 Z" fill="${C.an}"/>`).join("");
  const corpo = `${ceu(id, "cinza", 1500, 300, 520)}${camada(`${id}-c1`, `<rect x="300" y="170" width="1320" height="150" fill="${C.t}"/><rect x="300" y="170" width="1320" height="22" fill="${C.s}"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${310 + i * 180}" y="320" width="40" height="500" fill="${C.t}"/>`).join("")}${calha}`)}${camada(`${id}-g`, `<rect x="-300" y="690" width="2520" height="600" fill="${C.an}"/>${cargueiro(`${id}-sh`, 960, 730, 1.3, { nome: "" })}${pel}<rect x="-300" y="810" width="2520" height="300" fill="${C.an}"/>`)}`;
  c.ev(.1, "equipamento", { db: 2, dist: .3 });
  return { corpo, script: push(id, 1, 1.04) + an, faixas: [], foco: 1000, amb: "rua", ambSom: "mar" };
};

/* --- PLANTA DO CARGUEIRO --- */
V.planta = (c, o) => {
  const { id, dur, v } = c, m = o.m; const gd = [...Array(26)].map((_, i) => `<path d="M${-200 + i * 100},-100 L${-200 + i * 100},1200" stroke="${C.cr}" stroke-width="1" opacity=".1"/>`).join("") + [...Array(15)].map((_, i) => `<path d="M-200,${-100 + i * 100} L2200,${-100 + i * 100}" stroke="${C.cr}" stroke-width="1" opacity=".1"/>`).join("");
  const E = 1.42, x = 960, y = 540; let s = "", ex = "";
  const casco = (extra = "") => `<g id="${id}-cs" transform="translate(${x},${y}) scale(${E})" fill="none" stroke="${C.cr}" stroke-width="2"><path d="M-560,60 L-548,-78 L-470,-78 L-470,-74 L520,-74 L520,-92 L590,-92 Q626,-60 610,60 Z"/><path d="M470,-92 L470,-136 L560,-136 L572,-92 M-548,-78 L-548,-130 L-462,-130 L-462,-78 M-524,-130 L-524,-180 L-488,-180 L-488,-130"/>${[...Array(21)].map((_, i) => `<rect id="${id}-h${i}" x="${-420 + i * 40}" y="-86" width="30" height="10"/>`).join("")}${extra}</g>`;
  if (m === "solda") { const r = rng(3); let rb = ""; for (let i = 0; i < 80; i++) { const xx = -520 + r() * 1080, yy = -60 + r() * 110; rb += `<circle id="${id}-rb${i}" cx="${xx.toFixed(0)}" cy="${yy.toFixed(0)}" r="4" fill="${C.l}" stroke="none"/>`; if (true) s += `tl.to("#${id}-rb${i}", { opacity: 0, duration: .1 }, ${(.3 + r() * dur * .4).toFixed(2)});`; } ex = casco(rb) + `<text x="960" y="880" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 54 : 84}" fill="${C.l}">1.2 MILLION POUNDS LIGHTER</text>`; c.ev(.4, "equipamento", { db: 2, dist: .2 }); }
  if (m === "linha" || m === "bordo") { const ys = [122, 102, 86, 70], rot = ["1958", "1969", "1971", "1973"]; ex = casco(`<rect id="${id}-agua" x="-720" y="${m === "bordo" ? 40 : 66}" width="1440" height="160" fill="${C.m}" stroke="none" opacity=".55"/>`); if (m === "linha") { [1, 2, 3].forEach((k) => { const t = (c.cue(rot[k]) ?? dur * k / 4) - .05; s += `tl.to("#${id}-agua", { y: ${-(k * 9)}, duration: .35, ease: "power2.out" }, ${t.toFixed(2)});`; c.ev(t + .1, "impacto_suave", { db: 0, dist: .2 }); ex += `<text id="${id}-a${k}" x="${v ? 960 : 300 + k * 330}" y="${v ? 800 + k * 54 : 860}" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 44 : 74}" fill="${C.l}" opacity="0">${rot[k]}</text>`; s += fade(`#${id}-a${k}`, 0, 1, .2, t); }); } else { ex += `<g fill="${C.l}" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 40 : 66}"><text id="${id}-b1" x="${v ? 960 : 620}" y="860" text-anchor="middle" opacity="0">14 FT 9 IN</text><text id="${id}-b2" x="${v ? 960 : 1300}" y="${v ? 930 : 860}" text-anchor="middle" opacity="0">11 FT 6 IN</text></g>`; s += fade(`#${id}-b1`, 0, 1, .3, Math.min(1.6, dur * .4)) + fade(`#${id}-b2`, 0, 1, .3, dur * .7) + `tl.fromTo("#${id}-agua", { y: 40 }, { y: 0, duration: ${(dur * .6).toFixed(2)}, ease: "sine.inOut", immediateRender: true }, ${(dur * .25).toFixed(2)});`; } }
  if (m === "tampas") { ex = casco(); [...Array(21)].forEach((_, i) => { const t = o.f ? .1 : .2 + i * .1; s += `tl.fromTo("#${id}-h${i}", { y: 0, stroke: "var(--creme)" }, { y: 18, stroke: "var(--luz)", duration: .25, ease: "power2.in", immediateRender: true }, ${t.toFixed(2)});`; }); ex += `<text x="960" y="880" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 50 : 74}" fill="${C.l}">NTSB, 1978</text>`; }
  if (m === "flexao") { ex = `<g id="${id}-fx">${casco()}</g>`; const r = (a, b) => `<path d="M${a},620 Q${(a + b) / 2},420 ${b},620 L${b},1100 L${a},1100 Z" fill="${C.m}" opacity=".55"/>`; ex = `<g id="${id}-on">${r(-800, 560)}${r(1360, 2720)}</g>` + ex; s += `tl.fromTo("#${id}-on", { x: -200 }, { x: 200, duration: DUR, ease: "sine.inOut", immediateRender: true }, 0);osc("#${id}-fx", { rotation: -.7, svgOrigin: "960 540" }, { rotation: .7, svgOrigin: "960 540" }, 2.6, 0, DUR);`; c.ev(.2, "equipamento", { db: 4, dist: .25 }); }
  return { corpo: camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.an}"/>${gd}${ex}`), script: push(id, 1, 1.04, "50% 50%") + s, faixas: [], foco: 960, amb: "seco", fitV: v ? 1760 : null };
};

/* --- TAMPA E GRAMPOS --- f0 geral; f1 mão no grampo, sem manual; f2 fileira no fundo: 2 tortos, 14 abertos */
const grampo = (id, x, y, modo) => { const ang = modo === "aberto" ? -70 : modo === "torto" ? 28 : 0; return `<g transform="translate(${x},${y})"><rect x="-13" y="-6" width="26" height="30" fill="${C.s}"/><g id="${id}" transform="rotate(${ang})"><rect x="-7" y="-78" width="14" height="80" fill="${modo === "torto" ? C.v : C.tc}"/><circle cy="-80" r="13" fill="${modo === "torto" ? C.v : C.oc}"/></g></g>`; };
V.tampa = (c, o) => {
  const { id, dur, v } = c, f = o.f; let gr = "", s = "", ex = "";
  if (f === 2) {
    const dx = v ? 37 : 100, x0 = 960 - 7.5 * dx; for (let i = 0; i < 16; i++) { const md = i === 0 || i === 7 ? "torto" : "aberto"; gr += `<g transform="translate(${x0 + i * dx},640) scale(${v ? .5 : 1})">${grampo(`${id}-g${i}`, 0, 0, md)}</g>`; const t = .3 + i * Math.min(.28, (dur - 1) / 16); s += `tl.fromTo("#${id}-v${i}", { opacity: 1 }, { opacity: 0, duration: .15, immediateRender: true }, ${t.toFixed(2)});`; ex += `<rect id="${id}-v${i}" x="${x0 + i * dx - dx / 2}" y="480" width="${dx}" height="220" fill="${C.s}"/>`; c.ev(t, "tecla", { db: -4, dist: .2 }); }
    const corpo = camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/><rect x="-300" y="660" width="2520" height="200" fill="${C.mu}"/><rect x="-300" y="640" width="2520" height="26" fill="${C.t}"/>${gr}${ex}<radialGradient id="${id}-l"><stop offset="0" stop-color="${C.tc}" stop-opacity=".24"/><stop offset="1" stop-color="${C.tc}" stop-opacity="0"/></radialGradient><circle cx="960" cy="600" r="900" fill="url(#${id}-l)"/><text x="960" y="340" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 46 : 76}" fill="${C.cr}">2 BROKEN · 14 OPEN</text>`);
    return { corpo, script: push(id, 1, 1.04, "50% 60%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "agua" };
  }
  for (let i = 0; i < 12; i++) gr += grampo(`${id}-g${i}`, 240 + i * 130, 620, "fechado");
  if (f === 1) { s += `osc("#${id}-g5", { rotation: 0, svgOrigin: "0 0" }, { rotation: 30, svgOrigin: "0 0" }, 1.1, .2, DUR);`; }
  const man = f === 1 ? `<g transform="translate(1040,270) rotate(-4)"><rect x="-10" y="-10" width="340" height="230" fill="${C.s}" opacity=".35"/><rect x="-20" y="-20" width="340" height="230" fill="${C.p}"/><text x="150" y="30" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="30" fill="${C.s}">CLAMP PROCEDURES</text><text x="150" y="120" text-anchor="middle" font-family="Apoio Ampulheta" font-style="italic" font-size="42" fill="${C.t}">(none written)</text></g>` : "";
  const corpo = `${ceu(id, "cinza", 1300, 240, 500)}${camada(`${id}-c1`, `<rect x="-300" y="620" width="2520" height="700" fill="${C.t}"/><rect x="150" y="440" width="1620" height="190" fill="${C.oc}"/><rect x="150" y="440" width="1620" height="26" fill="${C.tc}"/><text x="960" y="505" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 36 : 50}" fill="${C.s}" opacity=".75">HATCH COVER · 14,000 LB · 68 CLAMPS</text>${gr}${man}`)}`;
  return { corpo, script: push(id, 1, 1.05, f === 1 ? "60% 45%" : "50% 55%") + s, faixas: [], foco: f === 1 ? 960 : 960, amb: "rua", ambSom: "mar", fitV: v ? 1000 : null };
};

/* --- PORÃO --- f0 sem aparelho; f1 água e inclinação; f2 água entra */
V.porao = (c, o) => {
  const { id, dur } = c, f = o.f; const cost = [...Array(11)].map((_, i) => `<rect x="${60 + i * 180}" y="60" width="26" height="960" fill="${C.s}" opacity=".55"/>`).join("");
  const painel = f === 0 ? `<g transform="translate(1300,470)"><rect x="-230" y="-120" width="460" height="240" fill="${C.t}"/><rect x="-200" y="-90" width="180" height="180" fill="${C.s}"/><rect x="20" y="-90" width="180" height="180" fill="${C.s}"/><text x="-110" y="10" text-anchor="middle" font-family="Titulo Ampulheta" font-size="26" fill="${C.cr}">DEPTH: NONE</text><text x="110" y="10" text-anchor="middle" font-family="Titulo Ampulheta" font-size="26" fill="${C.cr}">HOLD: NONE</text></g>` : "";
  let s = push(id, 1, 1.05, "50% 60%");
  if (f >= 1) s += `tl.fromTo("#${id}-ag", { y: 110 }, { y: ${f === 2 ? -260 : -130}, duration: DUR, ease: "sine.in", immediateRender: true }, 0);tl.fromTo("#${id}-tot", { rotation: 0, svgOrigin: "960 540" }, { rotation: 3.8, svgOrigin: "960 540", duration: DUR, ease: "sine.inOut", immediateRender: true }, 0);`;
  const corpo = `<div class="camada" style="background:var(--sombra)" data-layout-ignore></div>${camada(`${id}-tot`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.mu}" opacity=".35"/>${cost}<rect x="-300" y="840" width="2520" height="400" fill="${C.t}"/><path d="${crista(6, 760, 40, 2800, 18)}" fill="${C.t}"/>${f >= 1 ? `<g id="${id}-ag"><rect x="-400" y="800" width="2800" height="500" fill="${C.an}" opacity=".78"/><path d="M-400,800 Q0,780 400,800 T1200,800 T2400,800" stroke="${C.m}" stroke-width="5" fill="none"/></g>` : ""}${painel}`)}`;
  c.ev(.1, f ? "splash" : "impacto_suave", { db: -8, dist: .6 });
  return { corpo, script: s, faixas: [], foco: f === 0 ? 1200 : 960, amb: "interior", ambSom: "motor" };
};

/* --- RETRATO --- */
V.retrato = (c, o) => {
  const { id, dur } = c, P0 = PR[o.p] ?? PR.marujo, tipo = o.escuro ? "noite" : o.claro ? "cinza" : "aurora";
  const olhar = { frente: [{ t: 0, x: .55, y: -.05 }], baixo: [{ t: 0, x: .4, y: .75 }] }[o.olha] ?? [{ t: 0, x: .9, y: -.2 }];
  const F = [[`${id}-a-om`, "y", tab(dur, (t) => 2.6 * Math.sin(6.283 * t / 3.4))], [`${id}-a-hd`, "rotation", tab(dur, (t) => .4 + .9 * Math.sin(6.283 * t / 3.1 + 1)), "0 90"], ...rosto(`${id}-a`, "busto", dur + .2, { roteiro: [{ t: 0, e: o.e ?? "neutra" }], olhar, giro: [{ t: 0, v: .1 }], seed: c.n + 4 })];
  const ct = o.cit ? `<div id="${id}-ct" style="position:absolute;left:${c.v ? 660 : 1020}px;top:${c.v ? 800 : 330}px;width:${c.v ? 600 : 820}px;padding:36px 44px;background:var(--creme);color:var(--sombra);font-family:'Apoio Ampulheta',serif;font-style:italic;font-size:${c.v ? 40 : 66}px;line-height:1.14;opacity:0;transform:rotate(-1.2deg)" data-layout-allow-overlap>${o.cit}</div>` : "";
  const s = push(id, 1, 1.07, "44% 42%") + (o.cit ? fade(`#${id}-ct`, 0, 1, .25, (c.cue("I'll") ?? dur * .35) - .05) : "");
  const corpo = `${ceu(id, tipo, 1500, 520, 620)}${camada(`${id}-bg`, `<path d="${crista(4 + c.n, 760, 22, 2800, 14)}" fill="${C.s}" opacity=".45"/>`)}${camada(`${id}-b`, busto(`${id}-a`, P0, { x: 800, y: 500, e: 1.62 }))}${ct}`;
  return { corpo, script: s, faixas: F, foco: 860, amb: "seco", ambSom: "vento" };
};

/* --- TELETIPO --- */
V.teletipo = (c, o) => {
  const { id, dur, v } = c, tx = o.t; let sp = "", s = ""; [...tx].forEach((ch, i) => { const t = .4 + i * .08; sp += `<span id="${id}-q${i}" style="opacity:0">${ch === " " ? "&nbsp;" : ch}</span>`; s += `tl.set("#${id}-q${i}", { opacity: 1 }, ${t.toFixed(3)});`; if (ch !== " ") c.ev(t, "tecla", { db: 0, dist: .1 }); });
  const hora = o.f ? "2:00 AM" : "7:00 PM";
  const corpo = `${mesa(id, C.an)}${camada(`${id}-pap`, `<rect x="450" y="-40" width="1040" height="1180" fill="${C.p}"/>${[...Array(26)].map((_, i) => `<circle cx="478" cy="${i * 44}" r="9" fill="${C.t}"/><circle cx="1462" cy="${i * 44}" r="9" fill="${C.t}"/>`).join("")}<text x="960" y="170" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="46" letter-spacing="4" fill="${C.t}">NATIONAL WEATHER SERVICE</text><text x="960" y="250" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="40" fill="${C.t}">LAKE SUPERIOR · ${hora}</text>`)}<div class="camada" style="display:flex;align-items:center;justify-content:center;color:var(--vinho);font-family:'Titulo Ampulheta',sans-serif;font-weight:700;font-size:${v ? 64 : 132}px;letter-spacing:.02em" data-layout-ignore><div>${sp}</div></div>`;
  return { corpo, script: push(id, 1, 1.04, "50% 50%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- PASSADIÇO --- f0 rádio; f1 ordens; f2 outro navio; f3 pergunta; f4 chamando */
V.passadico = (c, o) => {
  const { id, dur } = c, f = o.f, Y = 985, e = 2; const pc = o.noite ? "noite" : "noite";
  const jan = [...Array(5)].map((_, i) => `<rect x="${260 + i * 290}" y="120" width="260" height="310" fill="url(#${id}-lj)"/>`).join("");
  const n = neve(id, 70, 1.2);
  const corpo = `<div id="${id}-tod" class="camada" data-layout-ignore><div class="camada" data-layout-ignore><svg viewBox="0 0 1920 1080"><defs><linearGradient id="${id}-lj" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.s}"/><stop offset="1" stop-color="${C.an}"/></linearGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="${f === 2 ? C.an : C.t}"/><rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}" opacity=".55"/>${jan}<g id="${id}-nvv">${n.s}</g><rect x="-300" y="430" width="2520" height="26" fill="${C.s}"/><rect x="-300" y="690" width="2520" height="520" fill="${C.s}" opacity=".6"/><g transform="translate(1500,640)"><rect x="-150" y="-110" width="300" height="260" fill="${C.mu}"/><circle cx="-40" cy="-20" r="70" fill="${C.s}"/><circle cx="-40" cy="-20" r="56" fill="none" stroke="${C.ol}" stroke-width="3"/><circle id="${id}-rd" cx="-40" cy="-30" r="7" fill="${C.cr}"/><rect x="50" y="-60" width="70" height="26" fill="${C.oc}"/><rect x="50" y="-20" width="70" height="26" fill="${C.oc}"/></g><path d="M1280,560 q-40,100 -80,70" fill="none" stroke="${C.s}" stroke-width="8"/><rect x="1240" y="520" width="60" height="70" rx="12" fill="${C.s}"/>${personagem(`${id}-b`, PR.imediato, { x: 980, y: Y - 8, e: e * .96 })}${personagem(`${id}-a`, PR.cooper, { x: 500, y: Y, e })}</svg></div></div>`;
  const F = [...parado(`${id}-a`, dur, { seed: 4 + f, rot: [{ t: 0, e: f === 4 ? "tensao" : "atenta" }], olhar: [{ t: 0, x: 1, y: 0 }] }), ...parado(`${id}-b`, dur, { seed: 9 + f, rot: [{ t: 0, e: f === 4 ? "tensao" : "neutra" }], olhar: [{ t: 0, x: 1, y: .1 }], idle: [{ t: .3, d: .4, tr: 3, hd: 1 }] }), [`${id}-tod`, "x", tab(dur, (t) => 5 * Math.sin(6.283 * t / 2.6))], [`${id}-tod`, "y", tab(dur, (t) => 4 * Math.sin(6.283 * t / 3.3))]];
  c.ev(.05, "radio", { db: 0 }); c.ev(.2, "tecla", { db: -8, dist: .3, origem: "rádio" });
  return { corpo, script: push(id, 1, 1.05, "50% 55%") + n.an, faixas: F, foco: 800, amb: "interior", ambSom: "motor" };
};

/* --- FAROL --- */
V.farol = (c) => {
  const { id, dur, v } = c, n = neve(id, 110, 1.3), t = c.cue("working.") ?? dur * .8;
  const corpo = `${ceu(id, "noite", 1500, 240, 240)}${camada(`${id}-g`, `${mar(id, 760, C.an, C.m)}<path d="${crista(4, 800, 16, 2800, 14)}" fill="${C.s}"/><g transform="translate(960,800)"><path fill="${C.tc}" d="M-60,0 L-34,-480 L34,-480 L60,0 Z"/><rect x="-42" y="-540" width="84" height="60" fill="${C.oc}"/><path fill="${C.v}" d="M-50,-540 L50,-540 L0,-596 Z"/><rect x="180" y="-420" width="10" height="420" fill="${C.s}"/><path d="M185,-420 L140,0 M185,-420 L230,0 M152,-120 L218,-120 M164,-240 L206,-240" stroke="${C.s}" stroke-width="6" fill="none"/><g id="${id}-on"><circle cx="185" cy="-430" r="16" fill="${C.l}"/><circle cx="185" cy="-430" r="60" fill="none" stroke="${C.l}" stroke-width="4" opacity=".6"/><circle cx="185" cy="-430" r="110" fill="none" stroke="${C.l}" stroke-width="3" opacity=".35"/></g><text id="${id}-x" x="340" y="-400" font-family="Titulo Ampulheta" font-weight="700" font-size="58" fill="${C.cr}" opacity="0">RADIO BEACON: OFF</text></g>`)}${camada(`${id}-nv`, n.s)}`;
  const s = `tl.fromTo("#${id}-on", { opacity: 1 }, { opacity: 0, duration: .12, immediateRender: true }, ${(t - .3).toFixed(2)});${fade(`#${id}-x`, 0, 1, .15, t - .2)}${n.an}${push(id, 1, 1.05)}`;
  c.ev(t - .3, "radio", { db: 0 });
  return { corpo, script: s, faixas: [], foco: 1200, amb: "campo", ambSom: "vento" };
};

/* --- GRÁFICO DAS ONDAS --- */
V.grafico = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0; const onda = (x, h, i) => `<path id="${id}-o${i}" d="M${x - 200},820 C${x - 90},820 ${x - 60},${820 - h} ${x},${820 - h} C${x + 60},${820 - h} ${x + 90},820 ${x + 200},820" fill="${C.an}" opacity=".85"/><path d="M${x - 40},${820 - h + 14} Q${x},${820 - h - 16} ${x + 50},${820 - h + 10}" stroke="${C.an}" stroke-width="5" fill="none"/>`; let s = "", g = "";
  [600, 960, 1320].forEach((x, i) => { g += onda(x, 300 + i * 40 + (f === 2 ? 120 : 0), i); s += `tl.fromTo("#${id}-o${i}", { opacity: 0 }, { opacity: .85, duration: .3, immediateRender: true }, ${(.2 + i * .5).toFixed(2)});`; c.ev(.2 + i * .5, "pano", { dist: .1, db: 2, origem: "lápis" }); });
  const tx = f === 2 ? "THEORY FOUR" : f === 1 ? "NO REPORT FILED" : "SOME DESCRIBE \"THREE SISTERS\"";
  const corpo = `${mesa(id, C.t)}${camada(`${id}-p`, `<g transform="rotate(-1 960 540)"><rect x="240" y="120" width="1440" height="860" fill="${C.s}" opacity=".45" transform="translate(12,14)"/><rect x="240" y="120" width="1440" height="860" fill="${C.p}"/>${[...Array(14)].map((_, i) => `<path d="M240,${150 + i * 60} L1680,${150 + i * 60}" stroke="${C.m}" stroke-width="2"/>`).join("")}<text x="960" y="240" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="66" fill="${C.s}">${tx}</text>${g}<path d="M280,822 L1640,822" stroke="${C.s}" stroke-width="4"/></g>`)}`;
  return { corpo, script: push(id, 1, 1.05, "50% 55%") + s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- HORIZONTE LIMPO --- f0 luzes; f1 espaço vazio com contorno */
V.horizonte = (c, o) => {
  const { id, dur } = c, f = o.f; const r = rng(4); let l = ""; for (let i = 0; i < 26; i++) l += `<circle cx="${(r() * 2000 - 40).toFixed(0)}" cy="${(508 + r() * 12).toFixed(0)}" r="${(1.8 + r() * 2.2).toFixed(1)}" fill="${C.l}"/>`;
  const fant = f === 1 ? `<g id="${id}-ft" opacity="0">${cargueiro(`${id}-sh`, 960, 590, .5, { cor: "none", conves: "none", luzes: true })}<path d="M660,600 L1270,600" stroke="${C.cr}" stroke-width="2.5" stroke-dasharray="14 12"/></g>` : "";
  const s = (f === 1 ? `tl.fromTo("#${id}-ft", { opacity: 0 }, { opacity: .8, duration: 1, immediateRender: true }, .3);tl.to("#${id}-ft", { opacity: 0, duration: 1 }, ${(dur - 1.1).toFixed(2)});` : "") + push(id, 1, 1.05, "50% 55%");
  const corpo = `${ceu(id, "noite", 1650, 160, 240)}${camada(`${id}-c1`, `${estrelas(9, 120, 440)}<path d="${crista(6, 524, 12, 2800, 14)}" fill="${C.s}"/>${l}`)}${camada(`${id}-g`, `${mar(id, 540, C.an, C.oc)}${fant}`)}`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "campo", ambSom: "vento" };
};

/* --- LOG --- */
V.log = (c, o) => {
  const { id, dur } = c, f = o.f; const lin = [...Array(9)].map((_, i) => `<rect x="520" y="${250 + i * 56}" width="${820 - (i % 3) * 110}" height="7" fill="${C.t}" opacity=".5"/>`).join("");
  const ctd = f === 0 ? `<text x="960" y="880" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="56" fill="${C.v}">"CHANGE TO CHANNEL 12"</text>` : f === 1 ? `<g id="${id}-bc" opacity="0" transform="translate(960,740) rotate(-3)"><path fill="none" stroke="${C.v}" stroke-width="7" d="M-160,0 L160,0 L120,60 L-120,60 Z M-10,0 L-10,-110 L80,-30 L-10,-30"/><text y="130" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="54" fill="${C.v}">LOST: 16-FOOT BOAT</text></g>` : `<rect x="510" y="400" width="900" height="70" fill="${C.l}" opacity=".7"/><text x="960" y="880" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="52" fill="${C.t}">NO MENTION OF THE BOAT</text>`;
  const s = (f === 1 ? fade(`#${id}-bc`, 0, 1, .25, (c.cue("lost") ?? dur * .5) - .2) : "") + push(id, 1, 1.05, "50% 55%");
  const corpo = `${mesa(id, C.an)}${camada(`${id}-p`, `<g transform="rotate(1 960 540)"><rect x="470" y="60" width="980" height="970" fill="${C.s}" opacity=".45" transform="translate(12,14)"/><rect x="470" y="60" width="980" height="970" fill="${C.p}"/><text x="960" y="160" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="52" letter-spacing="2" fill="${C.s}">U.S. COAST GUARD, SAULT STE. MARIE</text><path d="M520,190 L1400,190" stroke="${C.s}" stroke-width="3"/>${lin}${ctd}</g>`)}`;
  c.ev(.1, "papel", { dist: .1, db: -3 });
  return { corpo, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- DESTROÇOS, sem pessoas --- */
V.destrocos = (c, o) => {
  const { id, dur } = c, f = o.f; const obj = [`<g transform="translate(420,800) rotate(-6)"><path fill="${C.cr}" d="M-170,0 L170,0 L120,60 L-120,60 Z"/><rect x="-170" y="-8" width="340" height="12" fill="${C.v}"/></g>`, `<g transform="translate(860,850) rotate(10)"><path fill="${C.cr}" d="M-120,0 L60,0 L90,50 L-60,50 Z"/><path d="M60,0 L40,28 L80,50" stroke="${C.s}" stroke-width="5" fill="none"/></g>`, `<g transform="translate(1250,810)"><ellipse rx="110" ry="36" fill="${C.oc}"/><ellipse rx="66" ry="18" fill="${C.t}"/></g>`, `<g transform="translate(1610,860) rotate(-8)"><ellipse rx="100" ry="32" fill="${C.oc}"/><ellipse rx="60" ry="16" fill="${C.t}"/></g>`]; let g = "", s = push(id, 1, 1.05);
  const r = rng(6); let j = ""; for (let i = 0; i < 21; i++) { j += `<g transform="translate(${(120 + r() * 1700).toFixed(0)},${(940 + r() * 90).toFixed(0)}) rotate(${(r() * 50 - 25).toFixed(0)})"><rect x="-20" y="-14" width="40" height="28" rx="6" fill="${C.v}"/><rect x="-6" y="-14" width="12" height="28" fill="${C.cr}" opacity=".5"/></g>`; }
  if (f === 1) { obj.forEach((o2, i) => { g += `<g id="${id}-o${i}" opacity="0">${o2}</g>`; s += fade(`#${id}-o${i}`, 0, 1, .25, .2 + i * .7); }); g += `<g id="${id}-j" opacity="0">${j}</g>`; s += fade(`#${id}-j`, 0, 1, .5, .2 + 4 * .7); }
  const buscas = f === 0 ? `<g transform="translate(1200,520)">${aviao(0, -280, 1.5)}</g>${cargueiro(`${id}-sh`, 700, 620, .4, { cor: C.an, conves: C.oc })}` : "";
  const corpo = `${ceu(id, "cinza", 1300, 380, 520)}${camada(`${id}-g`, `${mar(id, 620, C.an, C.m)}${buscas}<path d="M-300,730 C400,690 1300,720 2300,690 L2300,1200 L-300,1200 Z" fill="${C.tc}"/><path d="M-300,740 C400,700 1300,730 2300,700" fill="none" stroke="${C.cr}" stroke-width="6" opacity=".5"/>${g}`)}`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "campo", ambSom: "mar", semMusica: f === 1 };
};

/* --- AVIÃO P-3 --- */
V.p3 = (c) => {
  const { id, dur } = c;
  const ping = [0, 1, 2].map((i) => `<circle id="${id}-pg${i}" cx="1020" cy="890" r="30" fill="none" stroke="${C.l}" stroke-width="5" opacity="0"/>`).join(""); let s = push(id, 1, 1.05) + `tl.fromTo("#${id}-av", { x: -700 }, { x: 900, duration: DUR, ease: "none", immediateRender: true }, 0);`; [0, 1, 2].forEach((i) => { s += `tl.fromTo("#${id}-pg${i}", { scale: 1, opacity: .9, svgOrigin: "1020 890" }, { scale: 4.4, opacity: 0, svgOrigin: "1020 890", duration: 1.6, immediateRender: false }, ${(dur * .35 + i * .55).toFixed(2)});`; c.ev(dur * .35 + i * .55, "relogio_b", { db: 0, dist: .2 }); });
  const corpo = `${ceu(id, "cinza", 1400, 220, 500)}${camada(`${id}-c1`, `${nuvens(5, 80, C.cr, .3)}<g id="${id}-av">${aviao(760, 210, 4)}</g>`)}${camada(`${id}-g`, `${mar(id, 400, C.an, C.m)}<rect x="-300" y="620" width="2520" height="620" fill="${C.s}" opacity=".5"/>${ping}<path d="M780,960 L1000,890 L1180,950 L1240,990 L780,990 Z" fill="${C.t}"/><path d="M-300,990 L2300,990 L2300,1300 L-300,1300 Z" fill="${C.s}"/>`)}`;
  c.ev(.1, "aviao", { dist: .55, db: 0 });
  return { corpo, script: s, faixas: [], foco: 1020, amb: "campo", ambSom: "agua" };
};

/* --- CURV: robô lê o casco --- f0 nome; f1 expedição; f2 hélice intacta */
V.curv = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0; const rob = `<g id="${id}-rb"><rect x="-90" y="-46" width="180" height="92" fill="${C.oc}"/><rect x="-90" y="-46" width="180" height="16" fill="${C.l}"/><circle cx="96" cy="0" r="18" fill="${C.l}"/><path d="M0,-46 L0,-1200" stroke="${C.tc}" stroke-width="4"/></g>`;
  const ob = f === 2 ? `<g transform="translate(1200,620)"><rect x="-40" y="-260" width="30" height="520" fill="${C.t}"/><g id="${id}-hel"><ellipse cx="-110" cy="-100" rx="42" ry="130" fill="${C.t}"/><ellipse cx="-110" cy="100" rx="42" ry="130" fill="${C.t}"/></g><circle cx="-110" r="30" fill="${C.s}"/></g>` : `<rect x="-400" y="360" width="2800" height="640" fill="${C.t}"/><rect x="-400" y="360" width="2800" height="18" fill="${C.s}"/><text x="${f === 1 ? 960 : 1100}" y="720" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="150" letter-spacing="6" fill="${C.cr}" opacity=".8">EDMUND FITZGERALD</text>`;
  const corpo = `<div class="camada" style="background:var(--sombra)" data-layout-ignore></div>${camada(`${id}-g`, `${ob}<defs><radialGradient id="${id}-fx" cx="${f === 2 ? "42%" : "50%"}" cy="55%" r="44%"><stop offset="0" stop-color="${C.l}" stop-opacity="0"/><stop offset="1" stop-color="${C.s}" stop-opacity=".94"/></radialGradient></defs><rect x="-300" y="-200" width="2520" height="1480" fill="url(#${id}-fx)"/><g transform="translate(${f === 2 ? 560 : 420},${f === 2 ? 620 : 300})">${rob}</g>${f === 2 ? `<text x="960" y="170" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${c.v ? 34 : 60}" fill="${C.cr}">NO SHOAL DAMAGE TO PROPELLER OR RUDDER</text>` : ""}`)}`;
  c.ev(.1, "relogio_b", { db: -6, dist: .5 });
  return { corpo, script: `tl.fromTo("#${id}-g", { x: ${f === 2 ? 20 : 300} }, { x: ${f === 2 ? -20 : -300}, duration: DUR, ease: "none", immediateRender: true }, 0);${push(id, 1, 1.03)}`, faixas: [], foco: 960, amb: "interior", ambSom: "agua", fitV: v2(c) };
};
const v2 = (c) => (c.v ? 1400 : null);

/* --- NAUFRÁGIO EM CORTE --- */
const proa = (id) => `<g id="${id}"><path fill="${C.t}" d="M-276,50 L-276,-74 L220,-74 L220,-92 L270,-92 Q296,-60 284,50 Z"/><path fill="${C.tc}" d="M170,-92 L170,-136 L240,-136 L250,-92 Z"/><path fill="${C.s}" d="M-276,-74 L-260,-30 L-276,10 L-262,50 L-276,50 Z" opacity=".65"/></g>`;
const popa = (id) => `<g id="${id}"><path fill="${C.t}" d="M-180,60 L-180,-60 L180,-60 L190,60 Z"/><path fill="${C.tc}" d="M-180,60 L-180,108 L-90,108 L-90,60 Z"/><path fill="${C.s}" d="M180,-60 L164,-20 L180,20 L166,60 L190,60 Z" opacity=".65"/></g>`;
V.wreck = (c, o) => {
  const { id, dur } = c, f = o.f; const r = rng(7); let db = ""; for (let i = 0; i < 26; i++) { const x = 700 + r() * 560, y = 870 + r() * 50, w = 16 + r() * 60; db += `<rect x="${x.toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(8 + r() * 18).toFixed(0)}" fill="${C.t}" transform="rotate(${(r() * 50 - 25).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`; }
  const naut = f === 0 ? `<path d="M1700,120 L1700,860" stroke="${C.cr}" stroke-width="4" stroke-dasharray="14 10"/><text x="1680" y="500" text-anchor="end" font-family="Titulo Ampulheta" font-weight="700" font-size="66" fill="${C.cr}">530 FEET</text>` : `<text x="430" y="660" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="46" fill="${C.cr}">BOW: UPRIGHT</text><text x="1500" y="640" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="46" fill="${C.cr}">STERN: UPSIDE DOWN</text>`;
  const corpo = `${fundoAgua(id, 1)}${camada(`${id}-g`, `<path d="${crista(5, 930, 16, 2800, 20)}" fill="${C.s}"/><path d="M-300,920 Q960,890 2300,925 L2300,1300 L-300,1300 Z" fill="${C.mu}"/><g transform="translate(430,850) rotate(-3) scale(1)">${proa(`${id}-pr`)}</g><g transform="translate(1500,840) scale(1)">${popa(`${id}-pp`)}</g>${db}${naut}`)}`;
  return { corpo, script: push(id, f ? 1.04 : 1, f ? 1 : 1.05, "50% 75%"), faixas: [], foco: f ? 960 : 1460, amb: "interior", ambSom: "agua", fitV: c.v ? 1960 : null };
};

/* --- DÚVIDA: duas hipóteses lado a lado --- */
V.duvida = (c) => {
  const { id, dur, v } = c;
  const lado = (x, tit, t0, mid) => `<g transform="translate(${x},0)"><rect x="0" y="0" width="952" height="1080" fill="${C.an}"/><rect x="0" y="0" width="952" height="240" fill="${C.m}" opacity=".7"/><rect x="0" y="940" width="952" height="140" fill="${C.mu}"/><text x="476" y="150" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 34 : 54}" fill="${C.s}">${tit}</text><g transform="translate(320,600)"><g id="${id}-a${t0}"><path fill="${C.t}" d="M-200,30 L-200,-40 L200,-40 L200,30 Z"/><rect x="-200" y="-74" width="50" height="34" fill="${C.tc}"/></g></g><g transform="translate(640,600)"><g id="${id}-b${t0}"><path fill="${C.t}" d="M-120,30 L-120,-40 L110,-40 Q140,-10 130,30 Z"/><rect x="60" y="-74" width="50" height="34" fill="${C.tc}"/></g></g></g>`;
  const s = push(id, 1, 1.03, "50% 50%") + `tl.fromTo("#${id}-a0", { x: 0, y: -340, rotation: 0, svgOrigin: "0 0" }, { x: -40, y: 300, rotation: 12, svgOrigin: "0 0", duration: DUR, ease: "sine.in", immediateRender: true }, 0);tl.fromTo("#${id}-b0", { x: 0, y: -340, rotation: 0, svgOrigin: "0 0" }, { x: 60, y: 300, rotation: -18, svgOrigin: "0 0", duration: DUR, ease: "sine.in", immediateRender: true }, 0);tl.fromTo("#${id}-a1", { x: 80, y: -340 }, { x: 80, y: 280, duration: DUR, ease: "sine.in", immediateRender: true }, 0);tl.fromTo("#${id}-b1", { x: -80, y: -340 }, { x: -80, y: 280, duration: DUR, ease: "sine.in", immediateRender: true }, 0);`;
  const corpo = camada(`${id}-c0`, `<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}"/>${lado(0, "BROKE, THEN SANK", 0)}${lado(968, "SANK, THEN BROKE", 1)}`);
  return { corpo, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "agua" };
};

/* --- ASSINATURAS --- */
V.assinaturas = (c, o) => {
  const { id, dur } = c, f = o.f ?? 0; const nm = ["James B. King", "Francis H. McAdams", "Elwood T. Driver", "Philip A. Hogue"]; const lin = nm.map((n, i) => `<g transform="translate(520,${360 + i * 130})"><path d="M0,0 L640,0" stroke="${C.s}" stroke-width="3"/><path d="M40,-6 C100,-70 150,-50 170,-14 C210,-60 270,-30 320,-22 C380,-14 420,-30 ${460 + i * 8},-16" fill="none" stroke="${C.an}" stroke-width="5"/><text x="0" y="46" font-family="Apoio Ampulheta" font-size="38" fill="${C.t}">${n}</text></g>`).join("");
  const st = f === 0 ? `<g id="${id}-d" opacity="0" transform="translate(1270,760) rotate(-6)"><rect x="-140" y="-46" width="290" height="92" fill="none" stroke="${C.v}" stroke-width="7"/><text x="5" y="18" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="54" fill="${C.v}">DISSENT</text></g>` : `<g transform="translate(1270,360) rotate(-6)"><rect x="-140" y="-46" width="290" height="92" fill="none" stroke="${C.an}" stroke-width="7"/><text x="5" y="18" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="50" fill="${C.an}">REJECTED</text></g>`;
  const s = push(id, 1, 1.05, f ? "60% 35%" : "60% 70%") + (f === 0 ? fade(`#${id}-d`, 0, 1, .12, (c.cue("dissent,") ?? dur * .4) - .1) : "");
  if (f === 0) c.ev((c.cue("dissent,") ?? dur * .4), "carimbo", { dist: .05, db: 1 });
  const corpo = `${mesa(id, C.t)}${camada(`${id}-p`, `<rect x="440" y="90" width="1060" height="960" fill="${C.s}" opacity=".45" transform="translate(12,14)"/><rect x="440" y="90" width="1060" height="960" fill="${C.p}"/><text x="970" y="210" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="700" font-size="66" fill="${C.s}">NTSB-MAR-78-3</text>${lin}${st}`)}`;
  return { corpo, script: s, faixas: [], foco: 970, amb: "interior", ambSom: "sala", fitV: c.v ? 1200 : null };
};

/* --- REGRAS --- */
const REGRAS = [["1977", "DEPTH FINDERS REQUIRED"], ["1980", "SURVIVAL SUITS REQUIRED"], ["—", "CHARTS IMPROVED"], ["—", "1973 LOAD LINE RESCINDED"], ["EVERY YEAR", "INSPECTION BEFORE NOVEMBER"]];
V.regras = (c, o) => {
  const { id, dur, v } = c, f = o.f; const L = f === 0 ? REGRAS.slice(0, 2) : REGRAS.slice(2); let g = "", s = push(id, 1, 1.04, "50% 50%");
  L.forEach(([a, b], i) => { const t = .3 + i * Math.min(1.8, (dur - .8) / L.length), y = 330 + i * 190; g += `<g id="${id}-l${i}" opacity="0"><text x="${v ? 660 : 300}" y="${y}" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 42 : 70}" fill="${C.v}">${a}</text><text x="${v ? 660 : 300}" y="${y + (v ? 54 : 86)}" font-family="Titulo Ampulheta" font-weight="700" font-size="${v ? 42 : 84}" fill="${C.s}">${b}</text></g>`; s += fade(`#${id}-l${i}`, 0, 1, .15, t); c.ev(t, "carimbo", { dist: .1, db: -6 }); });
  return { corpo: `${mesa(id, C.an)}${camada(`${id}-p`, `<rect x="210" y="110" width="1500" height="860" fill="${C.p}"/>${g}`)}`, script: s, faixas: [], foco: 960, amb: "interior", ambSom: "sala" };
};

/* --- SINO --- */
const sinoD = (id, x, y, e, cor = C.oc) => `<g transform="translate(${x},${y}) scale(${e})"><g id="${id}"><path fill="${cor}" d="M-20,-150 L20,-150 L26,-118 C60,-104 74,-60 78,0 C82,44 100,74 120,92 L-120,92 C-100,74 -82,44 -78,0 C-74,-60 -60,-104 -26,-118 Z"/><path fill="${C.l}" opacity=".5" d="M-54,-70 C-60,-30 -62,20 -80,74 L-48,74 C-40,20 -38,-40 -30,-90 Z"/><text y="46" text-anchor="middle" font-family="Titulo Ampulheta" font-weight="600" font-size="20" fill="${C.s}">EDMUND FITZGERALD</text><circle cy="110" r="16" fill="${C.t}"/></g></g>`;
V.sino = (c, o) => {
  const { id, dur } = c, f = o.f; let s = push(id, 1, 1.05, "50% 45%");
  if (f === 1) { s += `tl.fromTo("#${id}-bl", { y: 360 }, { y: 0, duration: ${(dur * .6).toFixed(2)}, ease: "power1.out", immediateRender: true }, 0);`; const t = (c.cue("rang.") ?? dur * .75); c.ev(t, "impacto_suave", { db: 2, dist: .3, origem: "sino" }); c.ev(t, "relogio_b", { db: 6, dist: .5, origem: "sino" }); s += `osc("#${id}-bs", { rotation: -6, svgOrigin: "0 -150" }, { rotation: 6, svgOrigin: "0 -150" }, .7, ${(t - .05).toFixed(2)}, DUR);`; }
  const corpo = f === 0 ? `<div class="camada" style="background:var(--sombra)" data-layout-ignore></div>${camada(`${id}-g`, `<defs><radialGradient id="${id}-l"><stop offset="0" stop-color="${C.oc}" stop-opacity=".5"/><stop offset="1" stop-color="${C.s}" stop-opacity="0"/></radialGradient></defs><circle cx="960" cy="520" r="620" fill="url(#${id}-l)"/><rect x="620" y="760" width="680" height="340" fill="${C.t}"/>${sinoD(`${id}-bs`, 960, 550, 1.7)}`)}`
    : `${ceu(id, "cinza", 1300, 300, 500)}${camada(`${id}-c`, `<g id="${id}-bl">${sinoD(`${id}-bs`, 960, 410, 1.3)}<path d="M960,-200 L960,200" stroke="${C.s}" stroke-width="6"/></g>${mar(id, 640, C.an, C.m)}`)}`;
  return { corpo, script: s, faixas: [], foco: 960, amb: "campo", ambSom: "mar", semMusica: f === 1 };
};

/* --- OS 29 NOMES --- */
const NOMES = ["Michael E. Armagost", "Fred J. Beetcher", "Thomas D. Bentsen", "Edward F. Bindon", "Thomas D. Borgeson", "Oliver J. Champeau", "Nolan S. Church", "Ransom E. Cundy", "Thomas E. Edwards", "Russell G. Haskell", "George J. Holl", "Bruce L. Hudson", "Allen G. Kalmon", "Gordon F. MacLellan", "Joseph W. Mazes", "John H. McCarthy", "Ernest M. McSorley", "Eugene W. O'Brien", "Karl A. Peckol", "John J. Poviach", "James A. Pratt", "Robert C. Rafferty", "Paul M. Riippa", "John D. Simmons", "William J. Spengler", "Mark A. Thomas", "Ralph G. Walton", "David E. Weiss", "Blaine H. Wilhelm"];
V.nomes = (c) => {
  const { id, dur, v } = c; let g = "", s = push(id, 1, 1.03, "50% 50%"); const col = v ? 2 : 4, dx = v ? 300 : 440, dy = v ? 56 : 104; NOMES.forEach((n, i) => { const x = 960 - (col - 1) * dx / 2 + (i % col) * dx, y = 150 + Math.floor(i / col) * dy; g += `<text id="${id}-n${i}" x="${x}" y="${y}" text-anchor="middle" font-family="Apoio Ampulheta" font-size="${v ? 25 : 42}" fill="${C.cr}" opacity="0">${n}</text>`; s += fade(`#${id}-n${i}`, 0, 1, .35, .1 + i * ((dur - 1.2) / 29)); });
  return { corpo: `${ceu(id, "noite", 960, 200, 300)}${camada(`${id}-g`, `${mar(id, 40, C.an, C.m)}<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}" opacity=".62"/>${g}`)}`, script: s, faixas: [], foco: 960, amb: "campo", ambSom: "vento", semMusica: 1 };
};

/* --- LAGO CALMO, FINAL --- */
V.lago = (c, o) => {
  const { id, dur, v } = c, f = o.f; const ct = o.cit ? `<div id="${id}-ct" style="position:absolute;left:${v ? 680 : 340}px;right:${v ? 680 : 340}px;top:${v ? 300 : 260}px;text-align:center;font-family:'Titulo Ampulheta',sans-serif;font-weight:600;font-size:${v ? 46 : 84}px;line-height:1.14;color:var(--creme);opacity:0" data-layout-allow-overlap>${o.cit}<div style="margin-top:26px;font-family:'Apoio Ampulheta',serif;font-style:italic;font-weight:400;font-size:${v ? 30 : 44}px;color:var(--ocre)">${o.sub ?? ""}</div></div>` : "";
  let s = push(id, f ? 1.06 : 1, f ? 1.1 : 1.05, "50% 60%") + (o.cit ? fade(`#${id}-ct`, 0, 1, .5, .1) : "");
  if (f === 1) s += `tl.fromTo("#${id}-f", { opacity: 0 }, { opacity: 1, duration: 1.6, ease: "sine.in", immediateRender: true }, ${(dur - 1.7).toFixed(2)});`;
  const corpo = `${ceu(id, "crepusculo", 1350, 540, 420)}${camada(`${id}-g`, `${mar(id, 600, C.an, C.oc)}<rect x="-300" y="-200" width="2520" height="1480" fill="${C.s}" opacity="${o.cit ? .5 : 0}"/>`)}${ct}<div id="${id}-f" class="camada" style="background:var(--sombra);opacity:0" data-layout-ignore></div>`;
  return { corpo, script: s, faixas: [], foco: 1100, amb: "campo", ambSom: "vento", semMusica: 1 };
};
