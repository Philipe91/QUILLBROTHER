// Eventos de áudio derivados da animação. Nada é colocado à mão na linha do tempo global:
// o passo vem do pé tocando o chão nas tabelas; o resto vem de marcas nomeadas da cena. Mudou a duração, os eventos acompanham.
import { COXA, CANELA, SOLA } from "../../estilos/ampulheta/templates/locomocao.mjs";
const RAD = Math.PI / 180;
const rotY = (x, y, g) => x * Math.sin(g * RAD) + y * Math.cos(g * RAD);

/* Momentos em que cada pé toca o chão. Serve para marcha, parada, retomada e corrida. */
export function contatos(T, fps = 30, { de = 0, ate = Infinity } = {}) {
  const out = [];
  for (const [perna, a, b, p] of [["a", "ca", "ja", "pa"], ["b", "cb", "jb", "pb"]]) {
    let noAr = false;
    for (let k = 0; k < T.rtx.length; k++) {
      const c = T[a][k], j = T[b][k], ang = T[p][k] + c + j, y = T.rty[k] + COXA * Math.cos(c * RAD) + CANELA * Math.cos((c + j) * RAD);
      const sola = y + Math.max(rotY(-9, SOLA, ang), rotY(27, SOLA, ang)); // sola mais baixa; chão em 0
      if (sola < -3) noAr = true;
      else if (noAr && sola >= -1.2) { const t = k / fps; if (t >= de && t < ate) out.push({ t, perna, x: T.rtx[k] }); noAr = false; }
    }
  }
  return out.sort((u, v) => u.t - v.t);
}

/* Evento: som da biblioteca + espaço. dist 0 (colado) a 1 (longe). pan -1 a 1. bus: voz, musica, ambiente, efeitos, transicoes. */
export const evento = (t, som, { bus = "efeitos", dist = 0, pan = 0, db = 0, origem = "" } = {}) => ({ t: +t.toFixed(4), som, bus, dist, pan: +pan.toFixed(3), db, origem });

/* Passos e equipamento de um personagem numa cena. telaX(t) devolve o x na tela para o panorama. */
export function passosDe(nome, T, { inicio = 0, dist = .3, telaX = () => 960, superficie = "terra", db = 0, de = 0, ate = Infinity } = {}) {
  const ev = []; const lista = contatos(T, 30, { de, ate });
  lista.forEach((c, i) => {
    const pan = Math.max(-.85, Math.min(.85, (telaX(c.t) - 960) / 960));
    ev.push(evento(inicio + c.t, `passo_${superficie}`, { dist, pan, db, origem: `${nome}: pé ${c.perna} tocou o chão` }));
    if (i % 2 === 0) ev.push(evento(inicio + c.t + .035, "equipamento", { dist, pan, db: db - 8, origem: `${nome}: equipamento acompanha o passo` }));
    else ev.push(evento(inicio + c.t + .02, "pano", { dist, pan, db: db - 7, origem: `${nome}: roupa acompanha o passo` }));
  });
  return ev;
}
