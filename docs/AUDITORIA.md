# Auditoria: Etapa 1 (03/11/2026)

## Ambiente medido

| Item | Resultado |
|---|---|
| Blender | 5.2.1 LTS em `%LOCALAPPDATA%\Programs\Blender\blender.exe` (o plano citava 4.5; usei o instalado, nada foi instalado) |
| Motor de render | `BLENDER_EEVEE`, funcionando sem janela |
| Python / FFmpeg | 3.11.9 / 8.1 |
| GPU | RTX 3060 12 GB, driver 616.56, cerca de 1,2 GB em uso antes do render |
| RAM | 16 GB no total, **só 4 a 5 GB livres**, porque outros projetos estão rodando |
| Disco | D: 44 GB livres, E: 825 GB livres, C: 14 GB livres |
| Addon MCP do Blender | Instalado, mas sem conexão (exige o Blender aberto). Usei render sem janela |

## O trecho

- `saida/trecho_gunther_climax.mp4`: 1280x720, 24 fps, 624 quadros, 26,000 s.
- É um recorte de `gunther_final.mp4`, de **143,0 s a 169,0 s** do vídeo longo.
- Áudio mixado de origem, sem a perda de compressão do MP4: `anim/out/gunther.wav`.
- Mapa completo, com o tempo de cada palavra e cada take: `shots/trecho_climax_eventos.json`.

| Tempo | Narração | Imagem no V4.4 |
|---|---|---|
| 0,00 | "...machine guns." | Close extremo do alemão |
| 0,84 | "The Americans dived into a ditch..." | Alto, crash e close: três americanos de costas, abaixados |
| 4,66 | "And the Germans did not shoot. They knew..." | Baixo e close do alemão; barricada |
| 8,68 | "Then Henry stood up." | Médio e close com faixas pretas |
| 10,19 | "He grabbed his rifle and ran straight at the machine guns." | Médio, e **POV a partir de 11,45** |
| 13,37 | "Sergeant Powell shouted at him to stop..." | Médio e close |
| 16,85 | "Witnesses said the Germans stood up and waved..." | Médio, close; **freeze em 19,31** "11:00 IN 60 SECONDS" |
| 21,12 | "Henry fired a shot, maybe two. And the machine gun answered." | Médio; **metralhadora em 23,38** |
| 24,62 | "Henry Gunther was killed instantly." | **Relógio 10:59** |

## Divergências entre o pedido e o trecho

1. **Não há trincheira nos 26 s.** Os acontecimentos se passam na estrada, com barricada e vala. Na recriação, mantenho a estrada. Se quiser trincheira, é mudança de história.
2. **O corte de 26 s termina em "instantly".** "It was 10:59" fica de fora, embora o relógio apareça a partir de 24,62 s. Preservei os 26 s, como pedido.
3. **Não há nenhuma vala construída no V4.4.** "Dived into a ditch" mostra soldados abaixados na estrada. Na recriação, a vala precisa existir.

## Defeitos do V4.4 vistos neste trecho

- Soldados vistos de costas por quase 4 s (0,84 a 4,66 s).
- Fuzis atravessando rostos e formando uma barra contínua (perto de 9 s e 14 s).
- Alemão quase imóvel entre 6 e 9 s.
- A mão que acena encosta no rosto em 18,80 s, a tomada escolhida para o teste.
- Câmera sem rotação real, e sem som de passos na corrida.

## Preservação do Brother Quill

Nenhum arquivo do Brother Quill foi alterado, nenhuma renderização ou publicação foi tocada. A branch `v44-mundo` continua no commit `8638afc`. O projeto novo está em pasta própria, `D:\projetos\studio-dark-engine`, e só lê os dados antigos.
