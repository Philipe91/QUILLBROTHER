# Pesquisa: pipeline profissional de personagens (03/11/2026)

**Estado:** pesquisa concluída. **Nenhuma alternativa foi testada com sucesso em imagem até agora.** Nada foi baixado ou instalado. O A, o B e os renders anteriores estão intactos, e o Brother Quill não foi alterado.

**Como ler:** "verificado" significa que li a página oficial do projeto. "Secundário" significa blog, listagem ou artigo de terceiros. As avaliações visuais são minha opinião e vêm só de miniaturas oficiais, não de testes.

## 1. Conclusão

**Recomendo testar primeiro a alternativa 3 (híbrida), partindo do personagem Snow do Blender Studio.**

O motivo principal é que o defeito dos testes anteriores estava na arte do personagem, não no Blender. O que muda é partir de um personagem feito por artistas profissionais. O Snow é gratuito, tem licença de atribuição, rig de corpo e rosto, e câmera livre em qualquer ângulo.

**Isso ainda é hipótese.** O risco principal é ele continuar parecendo "o Snow de capacete", ou uma animação comum em vez do estilo do canal.

## 2. As três alternativas

| Critério | 1. 2D ilustrado em camadas | 2. 3D de modelo-base | 3. Híbrido: base 3D + NPR |
|---|---|---|---|
| **Qualidade visual** | Depende do ilustrador; pode ser a melhor | Alta com base de estúdio; risco de cara genérica | Alta se a base e o shader combinarem |
| **Consistência artística** | Difícil entre vistas e personagens, sem artista fixo | Boa | Boa: um só shader unifica |
| **Expressão facial** | Excelente: desenho livre | Boa com rig facial | Boa, e pode somar elementos gráficos |
| **Anatomia** | Depende do desenho | Resolvida pela base | Resolvida pela base |
| **Rig e animação** | Simples, mas limitado | Pronto na base | Pronto na base |
| **POV e rotação** | **Fraco:** cada ângulo exige novo desenho | **Excelente** | **Excelente** |
| **Vários personagens** | Cada um exige nova arte | Limitado pelas bases gratuitas | Limitado, roupa e cabeça precisam variar |
| **RTX 3060 / 16 GB** | Leve | Pesado para abrir (rig grande), não medido | Parecido com o anterior, não medido |
| **Trabalho manual** | Alto, por personagem e vista | Médio: roupa, ajustes | Médio: roupa, shader, ajustes |
| **Custo por vídeo** | Alto se comissionado | Só tempo e energia | Só tempo e energia |

Não estimei tempo ou custo por vídeo em números, porque ainda não há teste para medir.

## 3. O que estúdios reais fazem

- **Guilty Gear Xrd (Arc System Works, GDC 2015):** modelos 3D feitos especificamente para shaders de cel, luz própria por personagem, e animação limitada, com menos quadros e sem interpolação. É a referência técnica da alternativa 3. Os detalhes vêm da [página da palestra](https://gdcvault.com/play/1022031/GuiltyGearXrd-s-Art-Style-The), de [slides oficiais](https://www.ggxrd.com/Motomura_Junya_GuiltyGearXrd.pdf) e de resumos secundários; não li os slides inteiros.
- **Wing It! (Blender Studio):** curta em estilo cartoon renderizado inteiramente em EEVEE, o mesmo motor deste projeto, com objetivo declarado de explorar NPR ([blog oficial](https://studio.blender.org/blog/wing-it-premiere/)). Prova que o caminho existe no Blender. A miniatura do Cat e do Dog é o alvo visual mais próximo que encontrei.
- **Singularity (Blender Studio):** projeto seguinte, com testes de visual pintado e NPR ([projeto](https://studio.blender.org/projects/singularity/3e1df33e9e2bc8)).

## 4. Ativos e ferramentas

### Selecionados para teste

| Item | Licença | Atribuição | Status |
|---|---|---|---|
| [Snow, Blender Studio](https://studio.blender.org/characters/snow/) | CC-BY 4.0, verificado | **Obrigatória:** "Snow Rig (CC) Blender Foundation \| studio.blender.org" | 106,4 MB. Rig de corpo e rosto com shape keys. Blender 4.1 em diante; não testado no 5.2 |
| Blender EEVEE (já instalado) | GPL | Não | Toon com Shader to RGB, contorno por casco invertido, luz por personagem, animação em poses |
| [Rig embutido nos arquivos do Snow](https://studio.blender.org/characters/snow/) | Mesmo acima | Mesmo acima | Roda scripts ao abrir: preciso permitir execução e ler os scripts antes |

### Alternativas viáveis

| Item | Licença | Observação |
|---|---|---|
| [Rain, Blender Studio](https://studio.blender.org/characters/rain) | CC-BY 4.0, verificado | 64,4 MB. Personagem feminina jovem, serve para outras histórias |
| [Sprite Fright: Phil, Rex etc.](https://studio.blender.org/characters/phil/v1/) | CC-BY, verificado | Exige Blender 3.3 a 3.6, com aviso de que pode quebrar em outras versões; provável retrabalho |
| [MPFB 2 (MakeHuman)](https://static.makehumancommunity.org/about/license.html) | Ativos centrais CC0 (verificado); código GPL | Gera vários corpos, com Rigify. Risco: visual realista e genérico. Saída comercial confirmada só em fonte secundária |
| [Quaternius Universal Base Characters](https://quaternius.com/packs/universalbasecharacters.html) | CC0, verificado | Sem rig facial mencionado. Os `.blend` ficam na versão Source, com preço informado só em imagem ou listagem; pode exigir pagamento |
| [Brushstroke Tools](https://extensions.blender.org/add-ons/brushstroke-tools/) | GPL (secundário) | Visual pintado, do Blender Studio |
| [Inochi2D](https://kitsunebi-games.itch.io/inochi-creator) | BSD-2 (secundário) | Rig 2D em camadas |
| [See-through](https://github.com/shitagaki-lab/see-through) | Código Apache-2.0; **licença dos pesos não informada** | Separa uma ilustração em até 23 camadas, cerca de 8 GB de VRAM. Foco em anime; os autores dizem que não entrega rig pronto |
| [UniRig](https://github.com/VAST-AI-Research/UniRig) | MIT, verificado | Rig automático, 8 GB de VRAM, sem rosto |

### Descartados

| Item | Motivo |
|---|---|
| [TRELLIS.2](https://github.com/microsoft/TRELLIS.2) | Exige 24 GB de VRAM e só foi testado em Linux (verificado) |
| Hunyuan3D 2.1 | Licença exclui UE, Reino Unido e Coreia do Sul, proíbe uso militar; cerca de 29 GB no processo completo (secundário) |
| MB-Lab | Descontinuado; a licença AGPL pode alcançar os personagens gerados (secundário) |
| Wing It! Cat e Dog, Storm, Mikassa | Sem etiqueta "Free" na [biblioteca](https://studio.blender.org/characters/). Podem exigir assinatura. Personagens de animais também não servem |
| Marketplaces (CGTrader, Superhive etc.) | Pagos ou com procedência variável |
| Flux Dev (instalado no PC) | A licença da Black Forest Labs é não comercial, pelo que conheço; não verifiquei nesta pesquisa |

## 5. Teste visual tentado hoje

Tentei gerar ilustrações-teste para a alternativa 1 com o ComfyUI e o modelo Juggernaut XL v9 que **já estão no seu PC**, sem baixar nada. **Não saiu nenhuma imagem.**

| Tentativa | Resultado |
|---|---|
| Modo normal | A minha trava de memória interrompeu: RAM livre caiu para cerca de 0,14 GB, mesmo com folga em memória virtual |
| Modo só GPU, sem extensões | O ComfyUI caiu ao carregar o modelo |

O servidor foi encerrado. Com o Chrome (4,7 GB), as sessões do Claude e outros serviços abertos, sobram só 3 a 4 GB de RAM livres. Em uso normal, o ComfyUI precisaria de mais.

**A licença do modelo também é um problema.** O [Juggernaut XL v9](https://huggingface.co/RunDiffusion/Juggernaut-XL-v9) cita uso pessoal e criativo sob RAIL-M, e encaminha o licenciamento comercial à parte. Eu só usaria para testar a direção de arte, **não em vídeo publicado**, sem confirmar a licença. Se a alternativa 1 for adiante, o caminho mais limpo é o SDXL base (OpenRAIL++-M, por fontes secundárias) ou um ilustrador.

Observação sobre a alternativa 1 com IA: a proteção de direitos autorais sobre imagem gerada é incerta, e o estilo precisa ser mantido entre personagens e vistas. Quero considerar isso uma limitação real, não um detalhe.

## 6. Limites do caminho recomendado

1. **O Snow é um personagem específico.** Sem esculpir rosto novo, todo soldado parecerá a mesma pessoa. Dá para variar por shape keys e cabeça, com limites que preciso ver no arquivo.
2. **Roupa de época não vem pronta.** O uniforme alemão, capacete e equipamento precisam ser modelados e ajustados ao corpo. Código pode não dar conta, especialmente no caimento.
3. **Identidade do canal.** Um visual de estúdio não é automaticamente o Brother Quill. Um shader sozinho não dá identidade; pode ser preciso reformular cabeça e olhos.
4. **Rig pesado.** Rigs de estúdio podem pesar em 16 GB de RAM.
5. **Versão do Blender.** A página diz 4.1 em diante, mas o Blender daqui é o 5.2. Pode exigir ajustes.
6. **Execução de scripts.** O arquivo roda scripts próprios ao abrir. Vou lê-los antes de permitir.

## 7. Critério para interromper

Se o Snow, com roupa e shader, ainda parecer teste de programação, eu paro e digo. Nesse caso, o caminho honesto é contratar um artista para a identidade principal (um personagem-mestre e um guia de estilo), e automatizar só o restante. Isso sairia da regra de custo zero, então seria decisão sua.

## 8. Fontes adicionais

- [Biblioteca de personagens do Blender Studio](https://studio.blender.org/characters/)
- [Proposta de motor NPR do Blender (design de 2024; não confirmei se foi lançado)](https://projects.blender.org/blender/blender/issues/120403)
- [Goo Engine sob MIT (secundário)](https://80.lv/articles/goo-engine-has-gone-open-source)
- [CharMorph (secundário)](https://www.cgchannel.com/2025/03/check-out-new-open-source-3d-character-generator-charmorph/)
- [Malt, licença MIT (secundário)](https://github.com/Kolupsy/Malt)
- [Análise prática do See-through](https://lilting.ch/en/articles/see-through-anime-layer-decomposition)
