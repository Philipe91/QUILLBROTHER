# Protótipo Ampulheta: revisão

**Estado:** protótipo pronto, aguardando aprovação do dono. Roteiro completo, capítulos e vídeo inteiro **não** foram iniciados, como manda o briefing.

**Entrega:** `D:\projetos\studio-dark-engine\output\ampulheta\prototipo_30s.mp4`; versão leve `prototipo_30s_celular.mp4`.

## Medido no MP4 final
- H.264 High, 1920×1080, 30 fps, 1006 quadros, 33,53 s, AAC 48 kHz, 73,2 MB.
- Volume: -16,1 LUFS; pico -4,5 dBFS.
- Um par de quadros idênticos, em 9,33 s: fim do fade para preto, esperado.
- Render: cerca de 1 min 27 s, 2 processos.
- Nenhuma cor fora da paleta no HTML das cenas.
- `check`: sem erros; 2 avisos `dead_stretch` mantidos.

## Só visto em quadros
Revisado em folhas e quadros extraídos do MP4. Ninguém assistiu em 1x. **O som foi medido, não ouvido.**

## Limites e pendências
1. **Duração:** 33,5 s, não 30 s; a voz define o tempo.
2. **Voz:** Kokoro `pm_alex`. Pronúncia não confirmada: transcrição às cegas entendeu mal "Henry Gunther" e "Chaumont-devant-Damvillers". Não é grave como o briefing pede. Decisão de voz em aberto.
3. **Sem trilha:** MusicGen descartado por licença não comercial dos pesos oficiais; catálogo HeyGen exige conta. Só voz e efeitos CC0, escolhidos pelo título e sem audição.
4. **Trecho mais fraco:** mapa de 1 a 3 s, com movimento pequeno; a diferença entre quadros é baixa (0,38). O aviso `dead_stretch` em 12,46 a 16,20 s é falso alarme: há marcha e câmera (1,5 de diferença).
5. **Animação:** boneco de papel, como pedido; não há atuação. Corrida usa cinemática direta sem IK; o pé de apoio é calculado para não deslizar, sem medição separada nesta versão.
6. **Coerência de cena:** a mesma cena do campo é reaproveitada, escurecida, no cartão de citação; barricada e campo são dramatização.
7. **Fatos:** horário diverge nas fontes (10h58 / 10h59), resolvido com "menos de dois minutos". Ver `docs/FONTES.md`; o texto do documento na tela é ilustrativo, não reprodução do armistício.
8. **Prévia x render:** a resolução de fontes por nome funcionou na prévia e falhou no render. Fontes agora embutidas em `assets/fonts/`. Sempre conferir no MP4.

## Instalado para este estilo
- `hyperframes@0.9.11` via npx; skills principais em `~/.claude/skills` (`hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`).
- No projeto: `d3-geo`, `@turf/bezier-spline`, `@turf/helpers`, `@fontsource/oswald`, `@fontsource/eb-garamond`.
- Modelo Whisper `small` (461 MB) em `~/.cache/whisper`; voz Kokoro baixada pelo HyperFrames.
- Telemetria do HyperFrames: padrão, não alterei (`hyperframes telemetry disable` desliga).

## Reproduzir
`python tools/narrar.py` → `node tools/mapa.mjs <pasta geojson>` → `node tools/build.mjs` → `python tools/mix.py` → `npx hyperframes check` → `npx hyperframes render --fps 30 -q delivery --workers 2`.

## V2: movimento refeito (pedido do dono: "eles não andam direito")
**Causa medida na v1:** pernas em senoide; cada pé no chão exatamente 50% do ciclo (sem apoio duplo); sem tornozelo, com sapato inclinado no chão em média 9,6° (máx. 16,5°) na marcha e 15,2° (máx. 30°) na corrida; mãos soltas do fuzil.

**Agora (`templates/locomocao.mjs`):** pé planta e trava; calcanhar pousa e rola até a ponta; joelho por IK; quadril com altura limitada pelo alcance da perna; tornozelo próprio; mãos presas ao fuzil por IK; mochila, túnica e cabeça com movimento secundário; câmera acompanha a marcha.

**Medido nas tabelas de animação (`qa_movimento.json`, unidades do boneco):** marcha com 60% de apoio e 20% de apoio duplo; corrida com 36% de apoio e fase no ar; erro de contato no chão 0, deslize 0 e erro do fuzil 0.

**Limite:** esses números vêm do cálculo, não dos pixels. O render foi conferido só em tiras de quadros do MP4; quem decide se parece natural é o dono, em 1x.

**Arquivo:** `output/ampulheta/prototipo_v2_movimento.mp4` (H.264, 1080p, 30 fps, 1006 quadros, 33,53 s, 72,9 MB). A v1 foi mantida em `prototipo_30s.mp4` para comparação.
