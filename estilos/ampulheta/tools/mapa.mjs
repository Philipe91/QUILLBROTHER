// Natural Earth (domínio público) -> caminhos SVG já projetados, em assets/mapa_base.json.
// Uso: node tools/mapa.mjs <pasta com os .geojson>
import { readFileSync, writeFileSync } from "node:fs";
import { geoMercator, geoPath } from "d3-geo";
import bezierSpline from "@turf/bezier-spline";
import { lineString } from "@turf/helpers";

const pasta = process.argv[2];
const ler = (n) => JSON.parse(readFileSync(`${pasta}/${n}.geojson`, "utf8"));
const W = 2400, H = 1350;
const caixa = { type: "Polygon", coordinates: [[[-0.2, 47.4], [8.9, 47.4], [8.9, 51.6], [-0.2, 51.6], [-0.2, 47.4]].reverse()] };
const proj = geoMercator().fitExtent([[0, 0], [W, H]], caixa).clipExtent([[-40, -40], [W + 40, H + 40]]);
const caminho = geoPath(proj).digits(1);
const P = (lng, lat) => proj([lng, lat]).map((v) => +v.toFixed(1));

const terra = caminho(ler("ne_10m_land"));
const NOMES = new Set(["Seine", "Marne", "Oise", "Meuse", "Moselle", "Rhin", "Rhein", "Rhine", "Aisne", "Somme", "Loire"]);
const rios = ler("ne_10m_rivers_lake_centerlines").features
  .filter((f) => NOMES.has(f.properties.name) || NOMES.has(f.properties.name_en))
  .map((f) => caminho(f)).filter(Boolean);

const locais = {
  paris: { rotulo: "PARIS", p: P(2.35, 48.86) },
  compiegne: { rotulo: "COMPIÈGNE", p: P(2.906, 49.427) },
  reims: { rotulo: "REIMS", p: P(4.03, 49.25) },
  verdun: { rotulo: "VERDUN", p: P(5.38, 49.16) },
  chaumont: { rotulo: "CHAUMONT-DEVANT-DAMVILLERS", p: P(5.42, 49.31) },
};
const regioes = [
  { rotulo: "FRANÇA", p: P(3.0, 48.25), g: 62 },
  { rotulo: "BÉLGICA", p: P(4.5, 50.72), g: 46 },
  { rotulo: "ALEMANHA", p: P(7.7, 50.45), g: 54 },
];
// Ícones de relevo: Ardenas, Vosges, Eifel, Floresta Negra. Posições repetíveis (LCG semeado).
let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
const relevo = [];
for (const [lo, la, n, dx, dy] of [[5.3, 50.05, 16, 1.15, .55], [7.05, 48.3, 13, .35, .95], [6.75, 50.2, 11, .8, .45], [8.25, 48.2, 8, .3, .85]]) {
  for (let i = 0; i < n; i++) relevo.push(P(lo + (r() - .5) * dx, la + (r() - .5) * dy));
}
relevo.sort((a, b) => a[1] - b[1]);

const rota = bezierSpline(lineString([[2.906, 49.427], [3.45, 49.62], [4.2, 49.5], [4.85, 49.52], [5.42, 49.31]]), { resolution: 8000 });
writeFileSync(new URL("../assets/mapa_base.json", import.meta.url), JSON.stringify({ W, H, terra, rios, locais, regioes, relevo: relevo.map((p) => p.map((v) => +v.toFixed(0))), rota: caminho(rota) }));
console.log("terra", (terra.length / 1024).toFixed(0), "KB; rios", rios.length, "; relevo", relevo.length, locais);
