// Personagem ilustrado cinematográfico: desenho separado do movimento.
// As juntas ficam nos mesmos pontos do rig da V2 (COXA, CANELA, SOLA, BRACO, ANTEBRACO), então as tabelas de marcha e corrida valem sem mudança.
// Tudo vem do preset: cores, proporção da cabeça, rosto e acessórios. Nada aqui conhece canal ou tema.
import { COXA, CANELA } from "../../estilos/ampulheta/templates/locomocao.mjs";

const S = "var(--sombra)", LUZ = "var(--luz)";
const sombra = (d, op = .22) => `<path d="${d}" fill="${S}" opacity="${op}"/>`;
const brilho = (d, op = .16) => `<path d="${d}" fill="${LUZ}" opacity="${op}"/>`;
const vinco = (d, op = .24, w = 1.8) => `<path d="${d}" fill="none" stroke="${S}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`;

function perna(pre, ca, ja, pa, c, base) {
  const perneira = c.perneira
    ? `${[12, 24, 36, 48, 58].map((y) => vinco(`M-11,${y + 4} L10,${y - 3}`, .3, 1.6)).join("")}<path d="M-9,60 L8,60 L8,${CANELA + 1} L-8,${CANELA + 1} Z" fill="${S}" opacity=".16"/>` : "";
  return `<g id="${pre}-${ca}">
    <path fill="${base}" d="M-16,-8 C-20,16 -17,50 -11,74 Q0,84 11,75 C15,52 18,18 16,-8 Z"/>
    ${sombra("M-16,-8 C-20,16 -17,50 -11,74 L-3,78 C-8,50 -8,20 -5,-8 Z", .2)}${brilho("M9,-6 C14,18 12,50 9,72 L12,70 C15,50 17,18 15,-6 Z", .14)}
    ${vinco("M-7,44 Q2,50 12,42")}${vinco("M-9,66 Q1,72 10,66", .3)}
    <g transform="translate(0,${COXA})"><g id="${pre}-${ja}">
      <path fill="${c.perneira || base}" d="M-12,-3 C-15,16 -13,42 -9,${CANELA} L8,${CANELA} C11,44 12,18 11,-3 Q0,5 -12,-3 Z"/>
      ${sombra("M-12,-3 C-15,16 -13,42 -9,66 L-3,66 C-7,42 -7,18 -5,0 Z", .2)}${perneira}
      <path fill="${base}" d="M-12,-6 Q0,4 11,-6 Q12,4 9,9 Q0,14 -10,9 Q-13,4 -12,-6 Z"/>${vinco("M-9,8 Q0,13 9,8", .35)}
      <g transform="translate(0,${CANELA})"><g id="${pre}-${pa}">
        <path fill="${c.bota}" d="M-10,-5 L9,-5 L10,3 C14,7 21,8 26,10 Q32,12 31,16 L-11,16 Q-12,6 -10,-5 Z"/>
        ${brilho("M14,7 C19,8 24,9 27,11 L24,13 C20,12 16,11 13,10 Z", .28)}${vinco("M0,-1 L8,1 M1,3 L10,5", .42, 1.4)}
        <path fill="${S}" d="M-12,15 L32,15 L31,18 L-11,18 Z"/>
      </g></g>
    </g></g>
  </g>`;
}

function braco(pre, b, a, c, cor, marca = "") {
  return `<g transform="translate(2,-112)"><g id="${pre}-${b}">
    <path fill="${cor}" d="M-13,-8 Q0,-15 13,-7 C13,16 11,36 9,52 L-8,52 C-11,36 -14,16 -13,-8 Z"/>
    ${sombra("M-13,-8 C-14,16 -11,36 -8,52 L-2,52 C-5,34 -7,14 -6,-11 Z", .2)}${vinco("M-8,42 Q1,48 9,41")}${marca}
    <circle cx="0" cy="50" r="9" fill="${cor}"/>
    <g transform="translate(0,50)"><g id="${pre}-${a}">
      <path fill="${cor}" d="M-9,-2 L10,-2 C10,16 9,30 7,41 L-6,41 C-8,30 -10,14 -9,-2 Z"/>${sombra("M-9,-2 C-10,14 -8,30 -6,41 L-1,41 C-3,28 -4,14 -3,-2 Z", .18)}
      <rect x="-7.5" y="36" width="15.5" height="7" rx="1.5" fill="${S}" opacity=".24"/>
      <path fill="${c.pele}" d="M-7,42 L8,42 C11,47 11,56 6,60 C2,63 -4,63 -7,59 C-10,54 -9,47 -7,42 Z"/>
      <path d="M8,45 C12,49 12,54 8,57 Z" fill="${c.pele}"/>${vinco("M-5,52 L6,52 M-5,56 L5,56", .3, 1.2)}
    </g></g>
  </g></g>`;
}

function fuzil(pre, c) {
  return `<g id="${pre}-fz">
    <path fill="${c.couro}" d="M-92,-9 L-46,-5 L72,-5 L72,3 L-34,3 L-52,6 L-90,13 Q-96,2 -92,-9 Z"/>${sombra("M-90,13 L-52,6 L-34,3 L72,3 L72,0 L-40,0 L-92,5 Z", .28)}
    <rect x="-14" y="-8" width="36" height="6" rx="1" fill="${S}"/><path d="M4,-8 L4,-13 L10,-13" fill="none" stroke="${S}" stroke-width="2.5"/>
    <path d="M-12,3 Q-8,12 0,3" fill="none" stroke="${S}" stroke-width="2"/>
    <rect x="70" y="-4" width="44" height="5" fill="${S}"/><rect x="52" y="-6" width="5" height="10" fill="${S}"/>
    <path d="M-76,6 Q-20,26 48,4" fill="none" stroke="${c.lona}" stroke-width="2.6" opacity=".9"/>
    <g id="${pre}-fl" transform="translate(116,-1)" opacity="0"><path fill="${LUZ}" d="M0,0 L18,-16 L16,-5 L52,-3 L18,3 L24,18 L6,6 Z"/><path fill="var(--creme)" d="M2,0 L14,-6 L30,-1 L14,4 Z"/></g>
  </g>`;
}

function mochila(pre, c) {
  return `<g transform="translate(-36,-118)"><g id="${pre}-mc">
    <path fill="${c.mochila}" d="M-20,6 Q-22,-4 -10,-5 L8,-5 Q16,-4 15,8 L14,70 Q13,80 2,80 L-12,80 Q-22,80 -21,68 Z"/>
    ${sombra("M-20,6 Q-22,-4 -10,-5 L-6,-5 Q-12,30 -9,80 Q-22,80 -21,68 Z", .24)}${vinco("M-18,28 L14,27", .3)}${vinco("M-18,54 Q-2,58 14,53", .26)}
    <rect x="-22" y="-20" width="40" height="18" rx="9" fill="${c.rolo}"/>${sombra("M-22,-10 L18,-10 L18,-6 Q16,-2 8,-2 L-13,-2 Q-21,-3 -22,-10 Z", .22)}<path d="M-12,-20 L-12,-2 M6,-20 L6,-2" stroke="${c.couro}" stroke-width="2.4"/>
  </g></g>`;
}

function pontosBarba(c) { let s = 4001, d = ""; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 300; i++) { const x = -56 + r() * 130, y = 40 + r() * 72; if (y < 46 + Math.abs(x - 36) * .06 || (x + 56) * .9 + 6 < (y - 40) * .7 || y > 112 - Math.abs(x - 14) * .36) continue; d += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.05"/>`; } return `<g fill="${c.cabelo}" opacity="${Math.min(.3, c.barba * .8)}">${d}</g>`; }
const clipOlho = (id, d) => `<clipPath id="${id}"><path d="${d}"/></clipPath>`;

/* Cabeça de perfil. Origem na base do pescoço. Pequena, mas com olho, pálpebra, sobrancelha e boca reais. */
function cabecaPerfil(pre, c) {
  const k = c.cabeca, cp = c.capacete, olho = "M6.5,-25 Q13,-31 19.5,-25.5 Q13,-20.8 6.5,-25 Z";
  const capacete = cp === "brodie"
    ? `<ellipse cx="2" cy="-40" rx="35" ry="5.4" fill="${c.capaceteEsc}" transform="rotate(-3 2 -40)"/><path fill="${c.capaceteEsc}" d="M-22,-42 Q-20,-64 2,-64 Q24,-64 25,-42 Z"/><path fill="${c.capaceteLuz}" d="M6,-61 Q20,-58 22,-43 L9,-43 Z"/>${vinco("M-20,-44 L25,-44", .35, 1.6)}`
    : cp === "quepe"
      ? `<path fill="${c.capaceteEsc}" d="M-22,-41 C-27,-58 -8,-66 12,-62 C24,-60 28,-52 25,-43 Z"/><rect x="-21" y="-46" width="44" height="7" fill="${c.capaceteLuz}"/><path fill="${S}" d="M10,-41 L33,-37 Q26,-33 8,-37 Z"/><circle cx="16" cy="-50" r="2.6" fill="${c.lona}"/>`
    : cp === "stahl"
      ? `${vinco("M-9,-34 C-6,-20 0,-6 9,3", .8, 2)}<path fill="${c.capaceteEsc}" d="M-26,-14 L-26,-38 Q-24,-64 2,-64 Q23,-64 25,-42 L27,-35 L35,-31 L22,-31 L-8,-31 L-10,-14 Z"/><path fill="${c.capaceteLuz}" opacity=".7" d="M6,-60 Q19,-57 21,-42 L9,-42 Z"/>`
      : `<path fill="${c.cabelo}" d="M-20,-20 C-26,-40 -14,-54 4,-52 C14,-52 19,-46 19,-40 C10,-44 2,-42 -3,-36 C-6,-30 -8,-24 -10,-16 Q-16,-12 -20,-20 Z"/>`;
  return `<g transform="scale(${k})">
    <path fill="${c.cabelo}" d="M-21,-36 Q-27,-22 -20,-9 L-5,-11 Q-7,-24 -4,-36 Z"/>
    <path fill="${c.pele}" d="M-13,-2 C-17,-14 -16,-32 -12,-42 C-6,-50 8,-52 15,-43 L18,-31 C19,-28 21,-25 26.5,-18 C27.5,-16 25.5,-15 22,-14.5 L21.5,-11 L23.5,-8.5 L21.5,-5.5 C21.5,-2 17,1 10,1 C3,1 -5,0 -13,-2 Z"/>
    <path fill="${c.peleSombra}" opacity=".55" d="M-13,-2 C-15,-8 -16,-18 -14,-26 Q-8,-14 3,-6 C7,-3 10,-1 10,1 C3,1 -5,0 -13,-2 Z"/>
    <path fill="${c.peleSombra}" opacity=".5" d="M18,-31 C19,-28 21,-25 26.5,-18 C27,-17 26,-16 25,-16 L19,-17 Z"/>
    <ellipse cx="-7" cy="-21" rx="4.6" ry="6.6" fill="${c.pele}"/><path d="M-7,-25 Q-4,-22 -6,-17" fill="none" stroke="${c.peleSombra}" stroke-width="1.5"/>
    ${c.barba ? `<path fill="${c.cabelo}" opacity="${c.barba}" d="M-4,-7 Q6,-12 21,-7 L21.5,-5.5 C21.5,-1 17,3 10,3 C4,3 -2,0 -4,-7 Z"/>` : ""}
    ${c.bigode ? `<path fill="${c.cabelo}" d="M12,-11.5 Q18,-13.5 23,-10.5 L22,-8.5 Q17,-10 12,-8.5 Z"/>` : ""}
    <defs>${clipOlho(`${pre}-co0`, olho)}</defs>
    <path d="${olho}" fill="var(--creme)"/>
    <g clip-path="url(#${pre}-co0)"><g id="${pre}-o0"><circle cx="14" cy="-25.6" r="3.2" fill="${S}"/></g><g id="${pre}-l0"><rect x="5" y="-38" width="17" height="16" fill="${c.pele}"/><rect x="5" y="-23.4" width="17" height="1.6" fill="${S}"/></g></g>
    <path d="M7.5,-25 Q13,-30 18.5,-25.5" fill="none" stroke="${S}" stroke-width="1" opacity=".4"/>
    <g id="${pre}-s0"><path d="M6,-31 Q13,-35.5 20,-31.5" fill="none" stroke="${c.cabelo}" stroke-width="2.8" stroke-linecap="round"/></g>
    <g id="${pre}-b0"><path d="M11,-7 Q16,-5.8 21.5,-7.4" fill="none" stroke="${S}" stroke-width="1.8" stroke-linecap="round"/></g>
    <g id="${pre}-b1" opacity="0"><path d="M11,-7.4 Q16,-9 21.5,-7.8" fill="none" stroke="${S}" stroke-width="2" stroke-linecap="round"/></g>
    <g id="${pre}-b2" opacity="0"><ellipse cx="16.5" cy="-7" rx="4.6" ry="2" fill="${S}"/></g>
    <g id="${pre}-b3" opacity="0"><ellipse cx="16" cy="-6" rx="5" ry="4.2" fill="${S}"/></g>
    <g id="${pre}-b4" opacity="0"><ellipse cx="15.5" cy="-5.5" rx="6" ry="6" fill="${S}"/></g>
    ${capacete}
  </g>`;
}

/* Corpo inteiro de perfil. e = escala, sem redesenho para plano aberto ou médio. */
export function personagem(pre, p, { x = 0, y = 0, e = 1, flip = false, arma = "porta", marcadores = "" } = {}) {
  const c = cores(p), tem = p.acessorios ?? {};
  const armaOn = tem.arma && arma;
  const sling = armaOn && arma === "costas" ? `<g transform="translate(-22,-70) rotate(110)">${fuzil(pre, c)}</g>` : "";
  const proxima = armaOn && arma === "porta" ? `<g transform="translate(16,-62) rotate(-30)">${fuzil(pre, c)}</g>` : "";
  const fzFalso = armaOn ? "" : `<g id="${pre}-fz"></g><g id="${pre}-fl"></g>`;
  const divisas = p.rosto?.divisas ? `<g fill="none" stroke="var(--ocre)" stroke-width="3.2"><path d="M-8,12 L0,20 L8,12"/><path d="M-8,19 L0,27 L8,19"/><path d="M-8,26 L0,34 L8,26"/></g>` : "";
  return `<g transform="translate(${x},${y}) scale(${flip ? -e : e},${e})">
  <g id="${pre}-cs" opacity=".3"><ellipse cx="0" cy="1" rx="58" ry="6" fill="${S}"/></g>
  <g id="${pre}-rt">${marcadores}
    ${perna(pre, "cb", "jb", "pb", c, c.calcaEsc)}
    <g id="${pre}-tr">
      ${braco(pre, "bt", "at", c, c.tunicaEsc)}
      ${sling}
      ${tem.mochila ? mochila(pre, c) : `<g id="${pre}-mc"></g>`}
      <path fill="${c.tunica}" d="M-25,0 C-27,-32 -31,-72 -30,-102 C-29,-124 -16,-137 2,-139 C19,-139 28,-125 28,-104 C28,-72 26,-32 25,0 Z"/>
      ${sombra("M-25,0 C-27,-32 -31,-72 -30,-102 C-29,-124 -18,-136 -8,-138 C-14,-110 -14,-50 -9,0 Z", .22)}${brilho("M20,-120 C27,-104 26,-60 24,-14 L20,-14 C22,-60 23,-100 16,-126 Z", .18)}
      ${vinco("M-16,-46 Q2,-38 22,-48")}${vinco("M-14,-30 Q4,-24 22,-32")}
      <rect x="6" y="-98" width="17" height="19" rx="1.5" fill="${S}" opacity=".12"/><path d="M5,-99 L24,-99 L23,-92 L14,-89 L6,-92 Z" fill="${c.tunicaEsc}"/><circle cx="14" cy="-92" r="1.3" fill="${c.couro}"/>
      ${tem.mochila ? `<path d="M15,-134 C24,-104 18,-58 8,-16" fill="none" stroke="${c.lona}" stroke-width="6"/>${vinco("M12,-134 C21,-104 15,-58 5,-16", .2, 1.2)}` : ""}
      <path fill="${c.pele}" d="M-8,-152 L10,-152 L12,-132 L-10,-132 Z"/><path fill="${c.peleSombra}" opacity=".6" d="M-8,-152 L0,-152 L6,-138 L12,-132 L-10,-132 Z"/>
      <path fill="${c.tunicaEsc}" d="M-12,-141 L13,-141 L16,-130 Q2,-126 -13,-129 Z"/>
      <g transform="translate(2,-146)"><g id="${pre}-hd">${cabecaPerfil(pre, c)}</g></g>
    </g>
    ${perna(pre, "ca", "ja", "pa", c, c.calca)}
    <g id="${pre}-sa">
      <path fill="${c.tunica}" d="M-31,33 Q0,40 31,31 L26,-8 L-25,-8 Z"/>${sombra("M-31,33 Q-18,38 -8,38 L-9,-8 L-25,-8 Z", .2)}${vinco("M-20,12 Q0,20 24,10")}
      <path d="M6,8 L24,7 L24,14 L15,17 L6,14 Z" fill="${c.tunicaEsc}"/>
      <rect x="-27" y="-17" width="55" height="11" rx="1.5" fill="${c.cinto}"/>${[-18, -6, 6, 17].map((xx) => `<rect x="${xx}" y="-15" width="9" height="13" rx="1.5" fill="${c.cinto}"/>${vinco(`M${xx},-10 L${xx + 9},-10`, .4, 1)}`).join("")}
      ${tem.cantil ? `<g transform="translate(-24,-6)"><g id="${pre}-ct"><path fill="${c.lona}" d="M-9,0 L9,0 L10,20 Q0,28 -10,20 Z"/>${sombra("M-9,0 L-2,0 L-2,25 Q-6,24 -10,20 Z", .24)}</g></g>` : `<g id="${pre}-ct"></g>`}
    </g>
    <g id="${pre}-tr2">
      ${proxima}${fzFalso}
      ${braco(pre, "bf", "af", c, c.tunica, divisas)}
    </g>
  </g></g>`;
}

export function cores(p) {
  const e = p.estilo, r = p.rosto ?? {}, a = p.acessorios ?? {};
  return { ...e, rugas: !!r.rugas, temMochila: !!a.mochila, cabeca: p.proporcao?.cabeca ?? 1.12, capacete: a.capacete ?? null, barba: r.barba ?? 0, bigode: !!r.bigode };
}

/* Busto em três quartos para o close: dois olhos, nariz e boca com volume. Os traços deslizam (fc) para dar a volta da cabeça. */
export function busto(pre, p, { x = 0, y = 0, e = 1 } = {}) {
  const c = cores(p);
  const o0 = "M-36,-19 Q-8,-47 22,-22 Q-6,-6 -36,-19 Z", o1 = "M56,-22 Q74,-43 94,-25 Q76,-9 56,-22 Z";
  const olho = (i, d, cx, cy, r) => `<defs>${clipOlho(`${pre}-co${i}`, d)}</defs><path d="${d}" fill="var(--creme)"/>
    <g clip-path="url(#${pre}-co${i})"><g id="${pre}-o${i}"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${c.couro}"/><circle cx="${cx}" cy="${cy}" r="${r * .56}" fill="${S}"/><circle cx="${cx + r * .32}" cy="${cy - r * .34}" r="${r * .22}" fill="var(--creme)"/></g>
      <g id="${pre}-p${i}"><rect x="${cx - 44}" y="${cy + 14}" width="88" height="30" fill="${c.pele}"/></g>
      <g id="${pre}-l${i}"><rect x="${cx - 44}" y="${cy - 56}" width="88" height="72" fill="${c.pele}"/><rect x="${cx - 44}" y="${cy + 11.5}" width="88" height="4.5" fill="${S}"/></g></g>
    <path d="${d.split(" Q").slice(0, 2).join(" Q")}" fill="none" stroke="${S}" stroke-width="2.4" opacity=".55"/>`;
  const q = (s) => s; // legibilidade
  return `<g transform="translate(${x},${y}) scale(${e})">
  <g id="${pre}-om">
    ${c.temMochila ? `<path fill="${c.mochila}" d="M-238,196 Q-244,136 -176,132 L-110,146 L-110,420 L-250,420 Z"/>${sombra("M-238,196 Q-244,136 -204,134 Q-214,270 -208,420 L-250,420 Z", .26)}` : ""}
    <path fill="${c.tunica}" d="M-230,420 C-236,300 -220,180 -150,142 C-90,118 -60,114 -48,108 L66,104 C90,118 130,126 180,152 C232,184 246,300 252,420 Z"/>
    ${sombra("M-230,420 C-236,300 -220,180 -150,142 C-120,130 -100,124 -84,120 C-110,220 -118,330 -112,420 Z", .22)}${brilho("M180,152 C232,184 246,300 252,420 L226,420 C222,320 206,216 160,150 Z", .17)}
    ${vinco("M-128,250 Q-70,282 -44,350", .22, 3)}${vinco("M120,230 Q150,290 148,380", .2, 3)}${vinco("M-30,330 Q40,352 110,330", .2, 3)}
    ${c.temMochila ? `<path d="M86,130 C110,220 90,330 64,420" fill="none" stroke="${c.lona}" stroke-width="17"/>${vinco("M78,131 C102,220 82,330 56,420", .22, 2.4)}` : ""}
    <rect x="-20" y="330" width="86" height="90" rx="3" fill="${S}" opacity=".12"/><path d="M-24,328 L70,328 L66,358 L22,372 L-20,358 Z" fill="${c.tunicaEsc}"/><circle cx="22" cy="356" r="5" fill="${c.couro}"/>
    <path fill="${c.pele}" d="M-52,62 L62,62 L70,128 L-60,128 Z"/><path fill="${c.peleSombra}" opacity=".65" d="M-52,62 L18,92 L30,128 L-60,128 Z"/>
    <path fill="${c.tunicaEsc}" d="M-70,108 Q0,140 78,104 L92,136 Q10,178 -82,140 Z"/>${vinco("M-60,118 Q4,146 82,114", .35, 2)}
  </g>
  <g id="${pre}-hd">
    <path fill="${c.cabelo}" d="M-92,-70 Q-112,-30 -94,26 L-74,30 Q-84,-20 -68,-70 Z"/>
    <g id="${pre}-or"><ellipse cx="-92" cy="-8" rx="17" ry="27" fill="${c.pele}"/><path d="M-96,-22 Q-82,-8 -94,8" fill="none" stroke="${c.peleSombra}" stroke-width="4"/></g>
    <path fill="${c.pele}" d="M-88,-30 C-92,-110 -40,-150 20,-146 C80,-142 112,-96 108,-40 C106,-6 100,22 86,50 C72,84 48,112 18,116 C-14,118 -50,92 -68,60 C-82,40 -86,6 -88,-30 Z"/>
    <path fill="${c.peleSombra}" opacity=".5" d="M-88,-30 C-86,6 -82,40 -68,60 C-50,92 -14,118 18,116 C-8,96 -42,64 -48,26 C-52,0 -52,-40 -40,-70 C-66,-74 -86,-60 -88,-30 Z"/>
    ${c.barba ? pontosBarba(c) : ""}
    <g id="${pre}-fc">
      ${c.rugas ? `<g fill="none" stroke="${c.peleSombra}" stroke-width="3" stroke-linecap="round" opacity=".85"><path d="M-30,-92 Q20,-104 84,-92"/><path d="M-22,-76 Q20,-86 76,-76"/><path d="M-46,-14 L-58,-22 M-46,-6 L-60,-6 M-44,4 L-56,12"/><path d="M-30,6 Q-6,20 18,8"/><path d="M60,6 Q76,14 92,4"/><path d="M4,40 Q-8,62 -6,84"/><path d="M78,40 Q86,60 82,80"/></g>` : ""}
      ${olho(0, o0, -6, -24, 12)}${olho(1, o1, 76, -25, 9)}
      <path fill="${c.peleSombra}" opacity=".6" d="M30,-30 C28,-6 22,12 24,28 C28,38 44,42 58,34 C66,30 62,22 54,14 C44,2 40,-14 42,-30 Z"/>
      <path fill="${c.pele}" d="M42,-30 C40,-14 44,2 54,14 C64,24 66,30 58,34 C52,37 46,36 42,34 C50,30 50,22 44,14 C36,2 34,-14 36,-30 Z"/>
      ${vinco("M26,28 Q40,44 58,34", .42, 2.4)}
      <g id="${pre}-s0"><path d="M-40,-52 Q-8,-72 26,-52 L24,-44 Q-8,-60 -38,-42 Z" fill="${c.cabelo}"/></g>
      <g id="${pre}-s1"><path d="M52,-54 Q72,-70 96,-54 L94,-47 Q72,-60 54,-46 Z" fill="${c.cabelo}"/></g>
      ${c.bigode ? `<path fill="${c.cabelo}" d="M6,52 Q34,38 66,50 L62,60 Q34,50 10,62 Z"/>` : ""}
      <g id="${pre}-b0"><path d="M9,67 Q36,66 63,65" fill="none" stroke="${S}" stroke-width="4.2" stroke-linecap="round"/>${vinco("M24,84 Q38,88 52,82", .3, 3)}</g>
      <g id="${pre}-b1" opacity="0"><path d="M6,70 Q36,60 64,68" fill="none" stroke="${S}" stroke-width="5" stroke-linecap="round"/><path d="M6,68 L0,63 M64,66 L70,61" stroke="${S}" stroke-width="3" opacity=".6"/>${vinco("M24,86 Q38,82 52,84", .34, 3)}</g>
      <g id="${pre}-b2" opacity="0"><ellipse cx="36" cy="69" rx="24" ry="7.5" fill="${S}"/><rect x="20" y="62" width="32" height="4" fill="var(--creme)" opacity=".85"/>${vinco("M24,86 Q38,90 52,84", .3, 3)}</g>
      <g id="${pre}-b3" opacity="0"><ellipse cx="36" cy="72" rx="20" ry="12.5" fill="${S}"/><ellipse cx="36" cy="79" rx="13" ry="5" fill="var(--vinho)"/><rect x="24" y="61.5" width="24" height="3.6" fill="var(--creme)" opacity=".85"/></g>
      <g id="${pre}-b4" opacity="0"><ellipse cx="36" cy="76" rx="26" ry="22" fill="${S}"/><ellipse cx="36" cy="88" rx="17" ry="8" fill="var(--vinho)"/><rect x="20" y="56" width="32" height="5" fill="var(--creme)" opacity=".85"/></g>
    </g>
    <g id="${pre}-cp">
      ${c.capacete && c.capacete !== "quepe" ? `<path d="M-76,-44 C-78,10 -52,90 18,118 C46,112 70,92 84,60" fill="none" stroke="${c.couro}" stroke-width="4.2" opacity=".6"/>` : ""}
      ${c.capacete === "quepe" ? `<path fill="${c.cabelo}" d="M-92,-40 C-100,-90 -80,-110 -60,-112 L100,-112 C114,-90 112,-70 108,-52 C90,-84 50,-98 10,-98 C-30,-98 -60,-84 -74,-30 Z"/>
      <path fill="${c.capaceteEsc}" d="M-104,-108 C-120,-196 -30,-226 40,-218 C110,-212 140,-168 128,-108 Z"/><path fill="${c.capaceteLuz}" opacity=".4" d="M40,-212 C94,-204 124,-168 118,-122 L74,-122 C84,-160 70,-194 40,-212 Z"/>
      <rect x="-102" y="-128" width="228" height="26" rx="4" fill="${c.capaceteLuz}"/><path fill="${S}" d="M-28,-102 Q50,-112 136,-100 C128,-78 86,-68 40,-72 C6,-76 -20,-88 -28,-102 Z"/><circle cx="22" cy="-146" r="15" fill="${c.lona}"/><circle cx="22" cy="-146" r="8" fill="${c.capaceteEsc}"/>` : c.capacete ? `<path fill="${c.peleSombra}" opacity=".62" d="M-86,-74 Q10,-112 108,-66 C108,-54 106,-50 104,-46 Q10,-92 -84,-52 Z"/>
      <path fill="${c.capaceteEsc}" d="M-96,-92 C-96,-180 -40,-232 26,-228 C86,-226 122,-170 122,-92 Z"/>
      <path fill="${c.capaceteLuz}" d="M36,-218 C86,-210 112,-160 114,-104 L54,-100 C62,-140 56,-186 36,-218 Z"/>
      <ellipse cx="14" cy="-92" rx="146" ry="22" fill="${c.capaceteEsc}" transform="rotate(-3 14 -92)"/><path d="M-132,-88 Q14,-118 160,-100 Q14,-102 -132,-88 Z" fill="${c.capaceteLuz}" opacity=".55"/><path d="M-128,-82 Q14,-66 156,-96 Q18,-84 -128,-82 Z" fill="${S}" opacity=".45"/>` : `<path fill="${c.cabelo}" d="M-92,-40 C-108,-120 -40,-170 26,-164 C88,-160 120,-110 110,-56 C90,-90 50,-110 10,-110 C-30,-110 -60,-90 -74,-30 Z"/>`}
    </g>
  </g></g>`;
}
