// scenes.json + timing_voz.json -> compositions/*.html + index.html + tempos gravados no scenes.json. O áudio manda; o vídeo se adapta.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { cenaHTML } from "../templates/base.mjs";
import * as T from "../templates/modelos.mjs";

const raiz = new URL("../", import.meta.url);
const ler = (p) => JSON.parse(readFileSync(new URL(p, raiz), "utf8"));
const S = ler("scenes.json"), V = ler("timing_voz.json"), M = ler("assets/mapa_base.json");
mkdirSync(new URL("compositions", raiz), { recursive: true });

// Respiro antes da voz e depois dela; dissolve sobrepõe a cena seguinte. Valores por tipo de saída.
const DISSOLVE = { dissolve: .7, corte: 0, fade_preto: 0 };
const ANTES = .18, DEPOIS = { dissolve: .55, corte: .28, fade_preto: 1.2 };
let t = 0, ant = null;
for (const c of S.cenas) {
  const dis = ant ? DISSOLVE[ant.transicao_saida] : 0;
  const entrada = dis || (ant?.transicao_saida === "fade_preto" ? .45 : 0);
  const start = Math.max(0, t - dis);
  c.dissolve_entrada = entrada;
  const voz = V[c.id];
  c.voz_em = voz ? start + (dis > 0 ? Math.max(ANTES, dis * .5) : ANTES) : null;
  const dur = c.duracao_fixa ?? (voz ? (c.voz_em - start) + voz.voz_fim + DEPOIS[c.transicao_saida] + (c.tipo === "numero" ? .7 : 0) : 4);
  c.start = +start.toFixed(3); c.end = +(start + dur).toFixed(3);
  t = c.end; ant = c;
}
const total = S.cenas.at(-1).end;

const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
const cueDe = (c) => (pal) => {
  const v = V[c.id]; if (!v) return null;
  const w = v.palavras.find((p) => sem(p.p).startsWith(sem(pal)));
  return w ? +(c.voz_em - c.start + w.i).toFixed(3) : null;
};

for (const c of S.cenas) {
  const dur = c.end - c.start, cue = cueDe(c); let m;
  if (c.id === "c0_s01") m = T.mapaAbertura(c.id, dur, cue, M);
  else if (c.id === "c0_s02") m = T.documento(c.id, dur, cue, { cabecalho: "CONVENTION D'ARMISTICE", sub: "Compiègne, 11 novembre 1918", rotuloG: "11 HORAS", rotuloP: "11 de novembro de 1918" });
  else if (c.tipo === "capitulo") m = T.cartela(c.id, dur, cue, M, "I", c.titulo);
  else if (c.id === "c1_s01") m = T.cenaCampo(c.id, dur, cue, { ...c.lowerthird, palavra: "Chaumont" });
  else if (c.id === "c1_s02") m = T.citacao(c.id, dur, cue, T.cenaCampo(c.id, dur, cue, null), { linhas: ["DE SARGENTO", "A SOLDADO"], sub: "Por aconselhar um amigo a evitar o alistamento." });
  else if (c.id === "c1_s03") m = T.numero(c.id, dur, cue, { menos: "MENOS DE", n: "2", unidade: "MINUTOS", apoio: "para o fim da guerra" });
  else if (c.id === "c1_s04") m = T.cenaCorrida(c.id, dur, cue);
  else throw new Error("sem modelo: " + c.id);
  writeFileSync(new URL(`compositions/${c.id}.html`, raiz), cenaHTML(c.id, dur, m.corpo, m.script, c.dissolve_entrada));
}

// Grão muda 12 vezes por segundo, em posições repetíveis.
let s = 4242; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
let grao = ""; for (let i = 0; i < total * 12; i++) grao += `tl.set("#grao",{x:${Math.round(r() * 512 - 256)},y:${Math.round(r() * 512 - 256)}},${(i / 12).toFixed(3)});`;

writeFileSync(new URL("compositions/overlay.html", raiz), `<template>
  <style>#root { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }</style>
  <div id="root" data-composition-id="overlay" data-width="1920" data-height="1080" data-layout-ignore data-layout-allow-overflow><div id="grao"></div><div id="vinheta"></div></div>
  <script>
  (function () { const tl = gsap.timeline({ paused: true }); ${grao} tl.set({}, {}, ${total.toFixed(3)}); window.__timelines["overlay"] = tl; })();
  </script>
</template>
`);
const hosts = S.cenas.map((c, i) => `      <div id="${c.id}" data-composition-id="${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${c.start}" data-duration="${(c.end - c.start).toFixed(3)}" data-track-index="${i % 2 + 1}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join("\n");
const html = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="design-system.css" />
    <style>@font-face{font-family:'Titulo Ampulheta';font-weight:500;font-style:normal;src:url('assets/fonts/oswald-latin-500-normal.woff2') format('woff2');}@font-face{font-family:'Titulo Ampulheta';font-weight:600;font-style:normal;src:url('assets/fonts/oswald-latin-600-normal.woff2') format('woff2');}@font-face{font-family:'Titulo Ampulheta';font-weight:700;font-style:normal;src:url('assets/fonts/oswald-latin-700-normal.woff2') format('woff2');}@font-face{font-family:'Apoio Ampulheta';font-weight:400;font-style:normal;src:url('assets/fonts/eb-garamond-latin-400-normal.woff2') format('woff2');}@font-face{font-family:'Apoio Ampulheta';font-weight:500;font-style:normal;src:url('assets/fonts/eb-garamond-latin-500-normal.woff2') format('woff2');}@font-face{font-family:'Apoio Ampulheta';font-weight:400;font-style:italic;src:url('assets/fonts/eb-garamond-latin-400-italic.woff2') format('woff2');}</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total.toFixed(3)}" data-width="1920" data-height="1080">
${hosts}
      <div id="overlay" data-composition-id="overlay" data-composition-src="compositions/overlay.html" data-start="0" data-duration="${total.toFixed(3)}" data-track-index="5" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:100"></div>
      <audio id="mix" class="clip" src="assets/audio/mix.wav" data-start="0" data-duration="${total.toFixed(3)}" data-track-index="6" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
writeFileSync(new URL("index.html", raiz), html);
writeFileSync(new URL("scenes.json", raiz), JSON.stringify(S, null, 2));
writeFileSync(new URL("qa_movimento.json", raiz), JSON.stringify(T.QA_MOV, null, 1));
console.log("QA", JSON.stringify(T.QA_MOV));
console.log("total", total.toFixed(2)); for (const c of S.cenas) console.log(c.id, c.start, c.end, (c.end - c.start).toFixed(2), "voz", c.voz_em);
