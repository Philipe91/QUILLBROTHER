// Falas publicadas do Gunther -> cenas -> index.html. A voz manda no tempo.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { cenaHTML } from "../templates/base.mjs";
import * as T from "../templates/modelos.mjs";
import * as B from "../templates/cenas_bq.mjs";

const raiz = new URL("../", import.meta.url), ler = (p) => JSON.parse(readFileSync(new URL(p, raiz), "utf8"));
const JOB = ler("job_voz.json"), OUT = ler("job_voz.json.out"), PAL = Object.fromEntries(JOB.map((j, i) => [j.mp3.match(/(s\d+)\.mp3/)[1], OUT[i]])), M = ler("assets/mapa_base.json");
mkdirSync(new URL("compositions", raiz), { recursive: true });
const dVoz = (id) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", new URL(`assets/audio/voz_sem_marca/${id}.mp3`, raiz).pathname.slice(1)]).toString().trim();

const cenas = [
  { id: "s29", depois: .22 }, { id: "s30", depois: .3 }, { id: "s31", depois: .34 }, { id: "s32", depois: .1 }, { id: "s33", depois: .12 },
  { id: "s34", depois: .34 }, { id: "s35", depois: .34 }, { id: "s36", depois: .95, saida: "dissolve" }, { id: "s37", depois: 1.5 },
];
let t = 0, ant = null;
for (const c of cenas) {
  const dis = ant?.saida === "dissolve" ? .7 : 0, start = Math.max(0, t - dis); c.dissolve = dis;
  c.voz_em = start + Math.max(.08, dis * .5);
  const pal = PAL[c.id], fimV = pal.at(-1).t + pal.at(-1).d; c.voz_dur = dVoz(c.id);
  c.start = +start.toFixed(3); c.end = +(c.voz_em + fimV + c.depois).toFixed(3); t = c.end; ant = c;
}
const total = cenas.at(-1).end;
const sem = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w]/g, "").toLowerCase();
const cueDe = (c) => (p, n = 0) => { const v = PAL[c.id].filter((w) => sem(w.w).startsWith(sem(p))); return v[n] ? +(c.voz_em - c.start + v[n].t).toFixed(3) : null; };

const tempos = {};
for (const c of cenas) {
  const dur = c.end - c.start, cue = cueDe(c); let m;
  if (c.id === "s29") m = B.cenaVala(c.id, dur, cue, { titulo: "CHAUMONT-DEVANT-DAMVILLERS", sub: "Meuse, northeastern France", ano: "1918" });
  if (c.id === "s30") m = B.cenaAlemaes(c.id, dur, cue, "calados");
  if (c.id === "s31") m = B.cenaRetrato(c.id, dur, cue, { titulo: "PVT. HENRY GUNTHER", sub: "313th Infantry", ano: "" });
  if (c.id === "s32") m = T.cenaCorrida(c.id, dur, cue, { tLev: cue("ran") - .3, tParte: cue("ran") + .02, opArr: { hK0: 146, pe1x: 40, pe2x: -44, pe2lift: 0, pe2ang: 0, tr0: 7, hd0: -4 } });
  if (c.id === "s33") m = B.cenaPowell(c.id, dur, cue, { titulo: "SGT. ERNEST POWELL", sub: "his best friend", ano: "" });
  if (c.id === "s34") m = B.cartao(c.id, dur, cue, B.cenaAlemaes(c.id, dur, cue, "acenam"), ["GO BACK!", "THE WAR", "IS OVER!"]);
  if (c.id === "s35") { m = B.cenaTiro(c.id, dur, cue); tempos.tiros = m.tiros.map((x) => x + c.start); tempos.mg = m.tm + c.start; }
  if (c.id === "s36") { m = T.numero(c.id, dur, cue, { menos: "", n: "10:59", unidade: "", apoio: "One minute before the armistice", tam: 300, pN: "10", pA: "10", hh: 329.5, hm: 354 }); m.script += `\n    tl.set("#${c.id}-preto", { opacity: 1 }, 0); tl.to("#${c.id}-preto", { opacity: 0, duration: 1, ease: "sine.inOut" }, ${Math.max(.2, cue("It") - .9).toFixed(3)});`; }
  if (c.id === "s37") m = B.cenaFront(c.id, dur, cue, M);
  writeFileSync(new URL(`compositions/${c.id}.html`, raiz), cenaHTML(c.id, dur, m.corpo, m.script, c.dissolve));
}
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
const fontes = [["Titulo Ampulheta", 500, "normal", "oswald-latin-500-normal"], ["Titulo Ampulheta", 600, "normal", "oswald-latin-600-normal"], ["Titulo Ampulheta", 700, "normal", "oswald-latin-700-normal"], ["Apoio Ampulheta", 400, "normal", "eb-garamond-latin-400-normal"], ["Apoio Ampulheta", 500, "normal", "eb-garamond-latin-500-normal"], ["Apoio Ampulheta", 400, "italic", "eb-garamond-latin-400-italic"]].map(([f, w, st, n]) => `@font-face{font-family:'${f}';font-weight:${w};font-style:${st};src:url('assets/fonts/${n}.woff2') format('woff2');}`).join("");
const hosts = cenas.map((c, i) => `      <div id="${c.id}" data-composition-id="${c.id}" data-composition-src="compositions/${c.id}.html" data-start="${c.start}" data-duration="${(c.end - c.start).toFixed(3)}" data-track-index="${i % 2 + 1}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join("\n");
writeFileSync(new URL("index.html", raiz), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <link rel="stylesheet" href="design-system.css" />
    <style>${fontes}</style>
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
`);
writeFileSync(new URL("cenas.json", raiz), JSON.stringify({ total, cenas, tempos, palavras: PAL }, null, 1));
console.log("total", total.toFixed(2)); for (const c of cenas) console.log(c.id, c.start, c.end, (c.end - c.start).toFixed(2));
