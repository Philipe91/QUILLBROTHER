// Peças comuns aos 7 modelos. Tudo é função do tempo da timeline: sem Date.now nem random sem semente.
export const rng = (seed) => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

// Monta o arquivo de uma cena no formato HyperFrames.
export function cenaHTML(id, dur, corpo, script, dissolveEntrada = 0) {
  return `<template>
  <style>#root { position: absolute; inset: 0; }</style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-layout-allow-overflow data-layout-allow-overlap>
    <div id="${id}-w" class="cena" data-layout-allow-overflow data-layout-allow-overlap>
${corpo}
      <div id="${id}-preto" class="preto" data-layout-ignore></div>
    </div>
  </div>
  <script>
  (function () {
    const tl = gsap.timeline({ paused: true });
    const DUR = ${dur.toFixed(3)};
    ${RUNTIME}
    ${dissolveEntrada > 0 ? `tl.fromTo("#${id}-w", { opacity: 0 }, { opacity: 1, duration: ${dissolveEntrada}, ease: "sine.inOut" }, 0);` : ""}
${script}
    tl.set({}, {}, DUR);
    window.__timelines["${id}"] = tl;
  })();
  </script>
</template>
`;
}

// Runtime que entra em cada cena: oscilação finita e ciclo de andar sem pé deslizando.
const RUNTIME = `
    const osc = (alvo, de, ate, per, ini, fim) => { const n = Math.max(1, Math.round((fim - ini) / (per / 2))); tl.fromTo(alvo, { ...de, ...(ate.svgOrigin ? { svgOrigin: ate.svgOrigin } : {}) }, { ...ate, duration: (fim - ini) / n, ease: "sine.inOut", repeat: n - 1, yoyo: true }, ini); };
    const ORIG = { svgOrigin: "0 0" };
    // Toca as tabelas gravadas no build. Um tween por parte, com a curva vinda da tabela: sem milhares de tweens e repetível em qualquer seek.
    function aplicar(pre, tab, t0) {
      const FPS = 30;
      const faixa = (sel, prop, a) => { const n = a.length - 1, d = n / FPS; const ease = (p) => { const f = Math.min(Math.max(p, 0), 1) * n, i = Math.floor(f); return i >= n ? a[n] : a[i] + (a[i + 1] - a[i]) * (f - i); }; const de = { [prop]: 0 }, ate = { [prop]: 1, ease, duration: d, immediateRender: true }; if (prop === "rotation") { de.svgOrigin = "0 0"; ate.svgOrigin = "0 0"; } tl.fromTo(sel, de, ate, t0); };
      faixa("#" + pre + "-rt", "x", tab.rtx); faixa("#" + pre + "-rt", "y", tab.rty);
      for (const n of Object.keys(tab)) { if (n !== "rtx" && n !== "rty") faixa("#" + pre + "-" + n, "rotation", tab[n]); }
    }`;

// Silhueta de terreno: pontos suaves com semente.
export function crista(seed, y, amp, W = 2400, n = 16, x0 = -200) {
  const r = rng(seed), pts = [];
  for (let i = 0; i <= n; i++) pts.push([x0 + (W * i) / n, y + (r() - .5) * 2 * amp]);
  let d = `M${x0},1400 L${pts[0][0]},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) { const [a, b] = pts[i], [c, e] = pts[i + 1], m = (a + c) / 2; d += ` C${m},${b.toFixed(1)} ${m},${e.toFixed(1)} ${c},${e.toFixed(1)}`; }
  return d + ` L${x0 + W},1400 Z`;
}

export const tufos = (seed, n, x0, x1, y, h, cor, cls = "") => {
  const r = rng(seed); let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), yy = y + r() * 16, H = h * (.6 + r() * .7), a = (r() - .5) * 14;
    s += `<path class="${cls}" transform="translate(${x.toFixed(0)},${yy.toFixed(0)})" d="M-9,6 Q${(-13 + a).toFixed(1)},${(-H * .6).toFixed(1)} ${(-17 + a).toFixed(1)},${(-H).toFixed(1)} Q-5,${(-H * .55).toFixed(1)} -2,${(-H * .25).toFixed(1)} Q${(1 + a).toFixed(1)},${(-H * .85).toFixed(1)} ${(4 + a).toFixed(1)},${(-H * 1.2).toFixed(1)} Q6,${(-H * .5).toFixed(1)} 6,${(-H * .2).toFixed(1)} Q${(12 + a).toFixed(1)},${(-H * .6).toFixed(1)} ${(19 + a).toFixed(1)},${(-H * .85).toFixed(1)} Q13,${(-H * .25).toFixed(1)} 10,6 Z" fill="${cor}"/>`;
  }
  return s;
};

export const arvorePartida = (x, y, e, cor) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M-20,10 L-13,-96 L-22,-168 L-9,-142 L-5,-230 L6,-168 L19,-210 L12,-120 L36,-156 L15,-72 L20,10 Z"/></g>`;

export const ruina = (x, y, e, cor, furo) => `<g transform="translate(${x},${y}) scale(${e})"><path fill="${cor}" d="M0,20 L0,-84 L52,-150 L74,-112 L92,-132 L126,-86 L148,-98 L150,20 Z"/><rect x="24" y="-68" width="28" height="44" fill="${furo}"/><rect x="92" y="-62" width="26" height="34" fill="${furo}"/></g>`;

export const arame = (x0, x1, y, passo, cor) => {
  let s = "", d = `M${x0},${y - 34}`;
  for (let x = x0; x <= x1; x += passo) {
    s += `<path d="M${x},${y + 6} L${x + 4},${y - 62} L${x + 12},${y - 62} L${x + 12},${y + 6} Z" fill="${cor}"/>`;
    const nx = x + passo / 2;
    if (x < x1) { d += ` Q${x + passo / 4},${y - 14} ${nx},${y - 42} Q${x + passo * .75},${y - 60} ${x + passo},${y - 34}`; }
  }
  return s + `<path d="${d}" fill="none" stroke="${cor}" stroke-width="3"/><path d="${d.replace(/-?\d+\.?\d*,(-?\d+\.?\d*)/g, (m, b) => m.split(",")[0] + "," + (Number(b) + 22))}" fill="none" stroke="${cor}" stroke-width="2.5"/>`;
};

export const fumaca = (id, x, y, e, cor, op) => `<g transform="translate(${x},${y}) scale(${e})"><g id="${id}" opacity="${op}"><circle cx="0" cy="0" r="46" fill="${cor}"/><circle cx="-40" cy="-30" r="36" fill="${cor}"/><circle cx="34" cy="-50" r="52" fill="${cor}"/><circle cx="-8" cy="-96" r="60" fill="${cor}"/><circle cx="44" cy="-148" r="58" fill="${cor}"/><circle cx="-16" cy="-196" r="66" fill="${cor}"/></g></g>`;

export const passaro = (id, cor) => `<g id="${id}"><path id="${id}-a" fill="${cor}" d="M-20,-4 Q-9,-13 0,0 Q9,-13 20,-4 Q9,-8 0,5 Q-9,-8 -20,-4 Z"/></g>`;
