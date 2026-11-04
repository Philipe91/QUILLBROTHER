# Direção: "Lente longa" no trecho do Gunther

**Trecho:** 16,85 a 21,85 s do clipe (159,85 a 164,85 s do longo). Mesmo áudio e mesmos acontecimentos. **Estado:** provas estáticas prontas; animação só depois da sua aprovação.

## Proposta de direção

A lente longa conta a tragédia: **ela encosta quem está a 30 metros de distância.** Henry e os alemães parecem quase ao alcance da mão, mas a mensagem não chega. O chão ondulado engole o caminho, e o gesto de "volte" fica pendurado no ar até Henry parar e apontar.

Vemos sempre pelos olhos de quem testemunhou, nunca de perto do rosto. **A lente longa não é enfeite aqui:** ela esconde o nosso ponto fraco (o rosto) e transforma o personagem em silhueta e pose.

## O que veio de cada lado

| Do Nº 98 e do método Lemo | Da Dark Engine / Blender |
|---|---|
| Ângulo horizontal muito fechado (1,8° a 8,6° neste teste) | Câmera e lente reais, com distâncias medidas |
| Ondas de terreno empilhadas | Terreno 3D com crista e vale |
| Alternar plano longo e momento próximo | Névoa volumétrica por profundidade |
| Fim em gesto segurado até o último quadro | Luz de contra, com céu e luz ambiente separados |
| Grão fino (±2 %) | Passes de acabamento em render novo |
| Motivo escrito para cada plano | Dados em JSON, sem código por cena |

**Não copiado:** deserto, carros, cor, personagens ou o enredo do filme. **Mudança consciente:** o Nº 98 pede luz dura e rejeita imagem lavada, mas a história pede névoa. Mantive a névoa e escureci o primeiro plano.

## Lista de planos

Cortes presos às palavras reais da narração.

| Plano | Tempo | Dur. | Narração | Imagem e câmera | Por quê |
|---|---|---|---|---|---|
| **S1** | 16,85–17,78 | 0,93 s | "Witnesses said the Germans" | Lente muito longa, do lado alemão, olhando a estrada. Henry é um ponto que afunda e reaparece nas ondas | Mostra o que as testemunhas viram |
| **S2** | 17,78–18,35 | 0,57 s | "stood up" | Lente longa pelo lado americano. Dois capacetes sobem atrás da barricada | O corte coincide com a ação |
| **S3** | 18,35–19,31 | 0,96 s | "and waved at him." | Câmera baixa, de lado. Braço contra o céu, pequeno recuo | O gesto vira o assunto |
| **S4** | 19,31–20,51 | 1,20 s | "Go back!" | **Prova 1.** Lente longa atrás de Henry. Todos na mesma linha, imagem segura, com "11:00 IN 60 SECONDS" | Mantém o freeze do V4.4, agora com sentido: tão perto, sem chance |
| **S5** | 20,51–21,12 | 0,61 s | "The war is over!" | Lente longa de frente, pela frente da barricada. Henry sobe a crista | Ele continua, apesar da frase |
| **S6** | 21,12–21,85 | 0,73 s | "Henry fired a" | **Prova 2.** Perfil na crista contra o céu. Câmera baixa. Pose segurada até o último quadro | Final com pose forte |

**Observação:** o trecho inclui "Henry fired a...", o início da cena seguinte no V4.4. Por isso o final é ele apontando, e o tiro fica para depois.

**Som:** o áudio é o mesmo mix do V4.4, para a comparação ser justa. O scratch em 19,31 s pede o congelamento. Som em camadas, método Lemo, fica para outra rodada.

## Provas e medições

Arquivos: `output/longlens/prova1_S4_go_back.png` e `output/longlens/prova2_S6_pose_final.png`. Medições em `output/logs/LL_final_F*.json`.

## Reaproveitamento em outros canais

Terreno, névoa, paleta, figurino, poses e câmeras estão em `shots/gunther_longlens.json`. O código em `direcao/` não contém história. O uniforme é dado (`kits`), então trocar de canal significa trocar dados e, às vezes, peças. **Isso ainda não foi testado com outro tema.**
