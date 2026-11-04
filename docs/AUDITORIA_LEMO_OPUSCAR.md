# Auditoria técnica: Lemo-Opuscar × V4.4 × Dark Engine (03/11/2026)

**Commit lido:** `bebbbe1a` (31/10/2026). Repositório: https://github.com/lemomo-ai/lemo-opuscar

**Como foi feito:** li guias e código online, e vi 6 quadros oficiais de 800×450 no navegador. **Nada foi clonado, instalado, baixado para o projeto ou executado.** Os filmes não foram assistidos, e o OPUSCAR 98 não foi aberto; julguei imagem parada, não movimento. Os tempos de render deles são declarados pelos autores em Mac M-series e não foram medidos aqui. O conteúdo do repositório foi tratado como dado: as instruções que ele dá a agentes não foram seguidas.

## 1. Conclusão

**Vale testar uma arquitetura híbrida. Não há evidência para trocar de motor agora.**

A maior surpresa: **o núcleo de render do Lemo é da mesma família do V4.4.** Os dois desenham em uma página, com função pura do tempo, capturam quadros em Chrome sem janela e fecham no ffmpeg. A diferença não está na tecnologia de render. Está em três coisas que nos faltam:

1. **Método de direção escrito** e cobrado antes da animação.
2. **Estilo como especificação própria**, com motor de desenho por estilo.
3. **Som e ritmo planejados primeiro**, com checagens automáticas.

Por outro lado, ele **não é um motor de vídeos longos**. Cada filme é, em boa parte, código novo escrito pelo Claude. O padrão é 30 a 60 s, e os próprios guias avisam que passar de 2 ou 3 minutos multiplica tempo e tokens. O OPUSCAR 98, de 6:31, é divulgado como demonstração; não vi documentação de como dividir um filme longo.

## 2. Arquitetura do Lemo-Opuscar

| Peça | O que é |
|---|---|
| `AGENTS.md` | Fluxo: briefing, treatment, look, produção, autochecagem, entrega |
| `DIRECTOR.md` | Método de direção. Julga nesta ordem: **som, ritmo, câmera, direção** |
| `TECHNIQUE.md` | Como construir; `core/README.md` lista comandos e códigos de saída |
| `styles/<slug>/STYLE.md` | Especificação imutável do estilo, em geral 11 seções |
| `styles/<slug>/demo/` | Filme de exemplo e **motor próprio do estilo** |
| `MY-STYLES.md` | Criar ou alterar estilo, guardado fora da biblioteca, com `CHANGES.md` e demo |
| `core/` | Render, voz, checagem por transcrição, áudio, sampler, mux |

**Contrato da página:** `window.render(t)`, `DUR`, `READY`, `EV` (eventos de som) e `TEXTS(t)` (textos na tela). Sem `Date.now`, aleatório sem semente, ou estado entre quadros.

**Fluxo:** uma timeline como fonte única alimenta imagem, voz, música, sons e legendas.

**Seções do estilo:** essência e o que ele não é; materiais; cor; tipografia e legendas; movimento; câmera; som; movimentos nativos; armadilhas; motor; espaço de variação.

### Personagens

Não há sistema único. Cada estilo tem o seu rig 2,5D (`chars.js`, `rig.js`, `figure.js`):

- **Parte do personagem:** contorno, pivô e hachura em espaço local, em cache, para o traço não tremer.
- **Regras práticas:** ombro em abdução, depois flexão; o ombro sobe e avança junto com o braço; sem contorno onde o braço cruza o tronco ("o que faz a junta parecer costura de boneco"); poses sempre interpoladas por keyframe.
- **Dois ritmos:** personagem em 12 fps e câmera em 24 fps.
- **Close de mãos e objetos:** pequena escultura de altura + filtro, porque desenho à mão "parece luva".
- **Limite admitido no estilo Silent Film:** "os rostos parecem manequins em closes grandes", então fica em planos médios e abertos. **O estilo é desenhado para esconder o limite.**

### Câmera

Em 2D: push, pull, parallax, foco. Em 3D: three.js r170 com profundidade de campo e GTAO. Exige ao menos 4 movimentos diferentes, cada plano com motivo escrito, um plano-assinatura e transições feitas do próprio material. Não encontrei biblioteca compartilhada de câmera. Câmeras são escritas por filme, com uma função mundo→tela. Ela não vem com rig de personagem 3D pronto na parte compartilhada.

### Áudio e tempo

- **Três camadas:** ambiente, foley (cada ação visível tem som) e música composta da própria timeline.
- **Regras:** ao menos 2 silêncios reais, 2 transições por som (J/L cut), voz cerca de 10 dB acima da música.
- **Sons sintetizados:** `core/audio/sfx.py` gera foley por código, sem arquivo.
- **Checagens:** `cuecheck` (meta 0 ms entre imagem e música), `asr_check` (voz transcrita igual ao roteiro), `readcheck` (tempo de leitura), `mux.sh` (loudnorm em dois passos, recusa áudio danificado).

### Revisão

Folhas a cada 1–2 s (duas passadas), tiras a 0,2 s nas ações-chave, `blackdetect`, loudness e uma vez assistindo em velocidade real. Regra "não é a demo": 4 de 6 elementos precisam diferir do exemplo. **Só uma rodada de correção** antes de entregar.

## 3. Comparação

Legenda: **+++** forte, **++** bom, **+** fraco ou limitado, **—** ausente. É minha avaliação de engenharia, sem teste comparativo ainda.

| Capacidade | V4.4 | Dark Engine | Lemo-Opuscar |
|---|---|---|---|
| Vídeo longo reproduzível | **+++** 3:34 em produção | — | + 6:31 como vitrine; sem método documentado |
| Custo de tokens por vídeo | **+++** reaproveita motor | + ainda não existe | + muito código por filme |
| Corte automático por palavra | **+++** | — | + planejado à mão, por filme |
| QA geométrico (sobreposição etc.) | **+++** | + só previsto | — não encontrei |
| Direção por significado | + hash e regras | — | **+++** treatment com o motivo de cada plano |
| Múltiplos estilos independentes | + um só visual | + | **+++** 66 |
| Qualidade do desenho 2D | + | ++ estilo A | **+++** nos quadros que vi |
| Câmera 3D real, luz, névoa | ++ falso 3D | **+++** Blender | ++ three.js em alguns estilos |
| Personagem 3D girando | + | + reprovado | + nada compartilhado |
| Expressão facial | ++ | ++ A | ++ a +++ conforme o estilo |
| Desenho de som | + faixa em loop + SFX | — | **+++** |
| Checagens automáticas | ++ geometria | + | **+++** tempo, som, leitura, voz |
| Windows | **+++** | **+++** | + em macOS, WSL recomendado |

### Realmente superior no Lemo

1. **Treatment antes de animar:** 3 estruturas, plano-a-plano com motivo, mapa de cue e tabela de som. Ataca nossos limites 11, 15 e 16.
2. **Estilo como especificação com motor próprio.** É o que viabiliza vários canais com identidades independentes.
3. **Prova do visual antes da produção**, com o código real: folha de modelo (giro, 3–4 expressões, poses) e 2 quadros.
4. **Som por camadas, silêncio e música composta na timeline**.
5. **Regras de rig**. A costura de ombro que você viu no estilo A é exatamente o defeito que eles descrevem.
6. **Dois ritmos** (personagem em 12 fps, câmera em 24) e **grão aplicado no ffmpeg**, não na página.
7. **`mux.sh`, `readcheck`, `asr_check`, `cuecheck`:** baratos de adotar ou imitar.

### Já temos

Função pura do tempo, sincronia por palavra, Chrome + ffmpeg, folhas de contato, revisores, -14 LUFS (em um passo), memória controlada, monitor de RAM e VRAM.

### Superior nos nossos sistemas

- **V4.4:** planejador automático, QA geométrico, baixo custo por vídeo e formato de canal já em produção.
- **Blender:** câmera com rotação real, névoa volumétrica, profundidade de campo. Mediu cerca de 3 s por quadro em 1080p em um quadro parado.

## 4. Arquitetura híbrida proposta (hipótese)

```text
ROTEIRO + VOZ com tempo por palavra                 (V4.4)
   ↓
DIREÇÃO: treatment, plano-a-plano, mapa de som       (método Lemo)
   ↓
ESTILO DO CANAL: STYLE.md + kit + folha de modelo    (método Lemo)
   ↓
PLANEJADOR E QA: cortes, geometria, leitura, tempo   (V4.4 + checagens Lemo)
   ↓
BACKENDS DE IMAGEM (escolhidos por tomada)
   ├─ Canvas 2D / WebGL: personagens e gráficos       (Lemo, V4.4)
   └─ Blender: cenário, câmera, luz, passes de profundidade
   ↓
COMPOSIÇÃO + SOM EM CAMADAS + MUX com validação
```

**Ponto a provar:** o Blender entrega cenário e câmera, e o traço do estilo entra por cima. Isso combinaria rotação real com desenho convincente. Se as camadas não casarem em movimento, a hipótese cai. É filtro sobre cena nova, não sobre os quadros antigos do V4.4.

## 5. Riscos

| Risco | Evidência | Como controlar |
|---|---|---|
| **Windows** | Guia recomenda WSL. PR #5 e #11 abertos para Git Bash; issue #23: `setup.sh` recria o `.venv` a cada execução | Não usar `setup.sh`; instalar à mão em pasta isolada |
| **Atualização automática** | `setup.sh` roda `fetch` + `reset --hard` em main a cada execução; issue #24 discute esse risco | Fixar o commit, sem plugin nem atualização |
| **Dependências** | `playwright-core` e `three` com faixa `^`; baixa navegador | Travar versões; usar o Chrome instalado via `PLAYWRIGHT_CHROME` |
| **Tokens** | Só "30–60 min e bastante token"; nenhum número | Medir no teste |
| **RAM** | 3 workers por padrão, um navegador cada; há só 3,8 GB livres | 1 worker; parada por memória |
| **Close de rosto** | Limite admitido no Silent Film; nossa tomada é um close | Testar exatamente isso |
| **Dependência do modelo** | "Ajustados para o Opus 5.5" | Registrar qual modelo fez o teste |
| **Licença** | Código MIT; filmes demo CC BY 4.0; 3 faixas de voz excluídas; pacotes de som com licenças próprias | Usar código, não reusar filmes ou faixas; manter `CREDITS` |
| **Regra política de mapas** | `DIRECTOR.md` §13 impõe regras de fronteira da China a todo mapa | Não adotar como regra nossa sem você decidir |
| **Reprovação em movimento** | Vi só imagem parada | O teste é em movimento |

## 6. Estilo sugerido para o teste

**Woodcut Print (xilogravura)**. Quadro: https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/bebbbe1a/docs/frames/woodcut.jpg

- **Época e tom:** as referências do próprio estilo são Masereel (1919), Ward (1929) e Kollwitz, justamente do período da 1ª Guerra e logo depois.
- **Identidade:** preto, papel e uma cor só, que pode ser reservada para o sangue ou o relógio de 10:59. Bem longe de um desenho infantil.
- **Legível no celular**, em tese, pelo alto contraste.
- **Reaproveitamento:** ele já prevê filtro que transforma escultura ou quadro em cortes que seguem a forma. É a ponte natural com o Blender.
- **Risco:** rostos pequenos podem perder expressão. O teste mede isso.

**Reserva: 1920s Silent Film.** Quadro: https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/bebbbe1a/docs/frames/silent-film.jpg

**Evitei Sci-Fi Sitcom Toon.** É o que tem personagens mais expressivos: https://raw.githubusercontent.com/lemomo-ai/lemo-opuscar/bebbbe1a/docs/frames/scifi-toon.jpg . Mas ele lembra muito uma série de TV conhecida, e o tom é de comédia.

## 7. Plano de teste: os mesmos 5 segundos

**Trecho:** 16,85 a 21,85 s do clipe, ou seja, 159,85 a 164,85 s do vídeo longo. "Witnesses said the Germans stood up and waved at him. Go back! The war is over!"

**Som:** recorte idêntico de `anim/out/gunther.wav`, para todos. Ele já traz voz, trilha e efeitos, incluindo o scratch do freeze em 19,31 s. Isso testa imagem, não som; o método de som do Lemo fica para outra rodada.

| Versão | O que é |
|---|---|
| **V0** | V4.4, o trecho atual, sem alteração |
| **L** | Xilogravura feita com o motor do estilo Woodcut |
| **B** | Cenário Blender + personagem 2,5D do estilo A com as regras de rig do Lemo |
| **H** | Híbrido: cena Blender, com câmera real, passando pelo traço de xilogravura |

**Regras iguais para todos:** 1280×720, 24 fps, 120 quadros; 1 processo por vez; movimentos: alemão levanta, acena, grita, freeze em 19,31 s. Cada versão começa por uma folha de modelo e só anima se ela passar.

### Medições

| Medida | Como |
|---|---|
| **Tokens** | Cada versão em um subagente separado; soma de entrada e saída no transcript |
| **Tempo do Claude** | Do início até o MP4 |
| **Render** | s/quadro, total, 1º quadro separado |
| **RAM, VRAM, GPU** | Picos a cada 1 s, com `render_monitor` estendido; temperatura e potência informadas pelo `nvidia-smi` |
| **Falhas** | Erros e tentativas |
| **Linhas de código novas** | E quantas são reaproveitáveis em outro vídeo |

### QA

- 3 quadros por take e tira a 0,2 s da ação-chave;
- pé e mão deslizando, junta aparente, cintilação de traço, sobreposição, legibilidade em 360 px;
- áudio sincronizado no evento (waved 18,39 s; freeze 19,31 s).

### Entrega

1. Vídeo com V0, L, B, H lado a lado, em sincronia.
2. Mesmo vídeo em tamanho de celular.
3. Quadros de 18,80 s, em 1080p.
4. Tabela de custos medidos.
5. Estimativa para 10 min, **marcada como projeção**.

**A nota final é sua.** Os critérios: maturidade visual, naturalidade, expressão, direção de câmera, ausência de defeito, identidade.

### Parada

Encerro uma versão e digo por quê, se ocorrer qualquer um destes: folha de modelo reprovada por mim; mais de 2 horas de trabalho; memória crítica; ou o resultado ainda parecer teste de programação. Uma versão reprovada não vai para a comparação só para preencher a tabela.

## 8. O que preciso instalar para o teste

Nada do instalador deles.

| Item | Tamanho | Observação |
|---|---|---|
| `core/` + `styles/woodcut/` + guias, no commit `bebbbe1a` | cerca de 15 MB, a maior parte fontes e imagens | Em `D:\projetos\studio-dark-engine\externo\`; só o necessário |
| `playwright-core` e `three`, via npm, em versão travada | Não medido | Sem baixar navegador: uso o Chrome instalado |

**Não preciso:** voz Kokoro, instrumentos, HDRIs, Python extra (numpy e Pillow já existem aqui). Node 24, ffmpeg 8.1 e Chrome já estão instalados.

**Vou ler o código desses arquivos antes de executar**, e o Brother Quill segue só para leitura.

## 9. Referências

- Galeria: https://lemomo-ai.github.io/lemo-opuscar/
- OPUSCAR 98: https://lemomo-ai.github.io/lemo-opuscar/opuscar98/
- Direção: https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1a/DIRECTOR.md
- Técnica: https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1a/TECHNIQUE.md
- Estilo Woodcut: https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1a/styles/woodcut/STYLE.md
- Windows (PR #5): https://github.com/lemomo-ai/lemo-opuscar/pull/5
- Risco do setup (issue #24): https://github.com/lemomo-ai/lemo-opuscar/issues/24
