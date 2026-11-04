# Comparação visual: Etapa 2 (03/11/2026)

**Tomada:** cena 34, close, t = 18,80 s do trecho. "...and WAVED at him. Go back!" O alemão acena desesperado.

Os dois quadros usam o mesmo cenário, câmera, luzes e névoa (`shots/ref_t18_80.json`). Só muda o personagem. O enquadramento segue o original (cintura para cima, mão erguida à esquerda, metralhadora embaixo à direita), mas não é idêntico: a cabeça é menor do que a do V4.4 e a metralhadora foi girada para ficar legível.

## Medições (1920x1080, 64 amostras, um quadro)

| | Estilo A | Estilo B |
|---|---|---|
| Construção da cena por script | 3,2 s | 17,9 s |
| Render do quadro | 2,65 s | 2,97 s |
| Pico de RAM do Blender | 0,88 GB | 0,90 GB |
| Pico de VRAM da placa inteira | 2.468 MB | 2.516 MB |
| Temperatura máxima da GPU | 52 °C | 53 °C |
| Potência máxima informada pelo nvidia-smi | 119 W | 127 W |
| Polígonos | 128 mil, a maioria do cenário | 253 mil |
| Falhas | Nenhuma nos finais | Nenhuma nos finais |

**Falha nas prévias:** um render não salvou o PNG por arquivo bloqueado momentaneamente. Corrigi gravando em arquivo temporário e renomeando, com novas tentativas.

**Limites destes números:** é um quadro parado, e a primeira execução compila os shaders (cerca de 8 a 12 s em 540p). Movimento ainda não foi medido, então **não há estimativa de tempo para os 26 s**. A etapa 3 mede isso.

## Comparação honesta

| Critério | Estilo A | Estilo B |
|---|---|---|
| Expressão | **Forte:** o desespero lê na hora | Fraca: rosto de borracha, olhar parado |
| Celular (360 px) | **Rosto e gesto claros** | Rosto mais confuso |
| Integração com o cenário | Personagem "colado", sem receber névoa e luz como o resto | **Melhor:** mesma luz e mesmos materiais |
| Consistência entre ângulos | **Ponto fraco:** só vale de frente; cada ângulo exige desenho novo | **Ponto forte:** a câmera pode girar em volta |
| POV, contraplano, órbita | Limitado, precisa de vistas extras | **Natural** |
| Rig e deformação | Simples e seguro; juntas parecem recorte de papel | Rig real, cotovelo e ombro ainda não testados em movimento |
| Maturidade visual | Graphic novel, ainda um pouco caricato | Parece boneco amador neste estado |
| Custo para criar personagem novo | Desenho vetorial por personagem e por vista | Alto para esculpir bem; depois reaproveita |

## O que ainda está ruim

**Nos dois:**
- A mão esquerda não segura a metralhadora.
- Sem segundo alemão na tomada (fiel ao quadro de 18,80 s, mas ele aparece pouco antes).
- Falta sujeira e desgaste na arma.
- O céu e o chão estão bem monocromáticos.

**Estilo A:**
- Braço superior parece um retângulo de papel.
- A roupa tem pouco detalhe.

**Estilo B:**
- Cabeça e pescoço parecem peças separadas.
- A roupa parece feltro, com braços de "macarrão de piscina".
- A boca está pequena para um grito.

## Limite real

O cenário funciona com código. **Personagem 3D profissional não sai bem só de código.** O estilo B foi gerado inteiro por fórmula, sem escultura. Ele não mostra o melhor possível do 3D: mostra o 3D sem artista. Para o B chegar ao nível profissional, precisaria de um modelo-base com licença comercial documentada ou de escultura feita à mão. Isso ainda não foi testado.

## Recomendação

**Estilo A para o próximo teste, com o cenário 3D.** É o que já funciona melhor no rosto e no celular, e é o mais barato de animar. Riscos: POV e mudanças de ângulo ficam mais caros de fazer.

**Alternativa:** antes de decidir, gastar uma rodada testando o estilo B com um modelo-base licenciado. Se for bom, ele resolve de vez os ângulos e a rotação de câmera que você pediu.
