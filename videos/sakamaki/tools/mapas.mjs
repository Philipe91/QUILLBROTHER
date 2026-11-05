// Natural Earth (domínio público) -> caminhos SVG. Uso: node tools/mapas.mjs <pasta com ne_10m_land.geojson>
import { readFileSync, writeFileSync } from "node:fs";
import { geoMercator, geoPath } from "d3-geo";
const terra = JSON.parse(readFileSync(`${process.argv[2]}/ne_10m_land.geojson`, "utf8"));
const W = 2400, H = 1350, saida = {};
function mapa(nome, [lo0, la0, lo1, la1], locais) {
  const caixa = { type: "Polygon", coordinates: [[[lo0, la0], [lo1, la0], [lo1, la1], [lo0, la1], [lo0, la0]].reverse()] };
  const proj = geoMercator().fitExtent([[0, 0], [W, H]], caixa).clipExtent([[-60, -60], [W + 60, H + 60]]);
  saida[nome] = { W, H, terra: geoPath(proj).digits(1)(terra), locais: Object.fromEntries(Object.entries(locais).map(([k, v]) => [k, proj(v).map((n) => +n.toFixed(1))])) };
}
mapa("ilhas", [-158.55, 20.45, -156.45, 21.8], { porto: [-157.975, 21.33], bellows: [-157.71, 21.36], lanai: [-156.95, 20.72], cabo_d: [-157.81, 21.25], koko: [-157.70, 21.26], mak: [-157.65, 21.31], i24: [-158.13, 21.2], oahu: [-158.0, 21.47], s1: [-158.05, 21.22], s2: [-157.98, 21.19], s3: [-157.91, 21.21], s4: [-158.12, 21.24], s5: [-157.85, 21.2] });
const ESTADOS = { WA: [-120.5, 47.4], OR: [-120.6, 44], CA: [-119.7, 37.2], NV: [-116.8, 39.3], ID: [-114.6, 44.3], MT: [-109.6, 47], WY: [-107.5, 43], UT: [-111.7, 39.3], AZ: [-111.7, 34.3], NM: [-106, 34.5], CO: [-105.5, 39], ND: [-100.5, 47.4], SD: [-100.2, 44.4], NE: [-99.8, 41.5], KS: [-98.4, 38.5], OK: [-97.5, 35.5], TX: [-99.3, 31.4], MN: [-94.3, 46.3], IA: [-93.5, 42], MO: [-92.5, 38.4], AR: [-92.4, 34.9], LA: [-92, 31], WI: [-89.8, 44.6], IL: [-89.2, 40], IN: [-86.3, 39.9], MI: [-84.7, 43.6], OH: [-82.8, 40.3], KY: [-85.3, 37.5], TN: [-86.3, 35.8], MS: [-89.7, 32.7], AL: [-86.8, 32.8], GA: [-83.4, 32.7], FL: [-81.6, 28.3], SC: [-80.9, 33.9], NC: [-79.4, 35.5], VA: [-78.8, 37.5], WV: [-80.6, 38.6], PA: [-77.8, 40.9], NY: [-75.5, 42.9], ME: [-69.2, 45.3], VT: [-72.7, 44] };
mapa("eua", [-126, 24, -66, 50], ESTADOS);
mapa("brasil", [-84, -36, -30, 12.5], { brasil: [-46.6, -23.5] });
writeFileSync(new URL("../assets/mapas.json", import.meta.url), JSON.stringify(saida));
for (const [k, v] of Object.entries(saida)) console.log(k, (v.terra.length / 1024).toFixed(0), "KB");
