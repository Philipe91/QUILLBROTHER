# Studio Dark Engine V1 (teste de estilo)

Projeto isolado. Só lê dados do Brother Quill; não altera nada nele.

**Estado:** Etapas 1 e 2 concluídas. **Aguardando a escolha visual do dono.** O motor completo não foi construído.

## Arquivos

- `docs/AUDITORIA.md`: ambiente, tempos exatos do trecho, divergências.
- `docs/STYLE_FRAMES.md`: medições, comparação e recomendação.
- `shots/ref_t18_80.json`: câmera, luzes, névoa e personagem da tomada.
- `shots/trecho_climax_eventos.json`: cada palavra e take dos 26 s.
- `lookdev/`: `env.py` (cenário), `char_a.py` (2,5D), `char_b.py` (3D), `build_frame.py`, `common.py`.
- `blend/estilo_A.blend`, `blend/estilo_B.blend`: cenas editáveis.
- `output/style_frames/`: quadros finais, comparativo e teste de celular. `output/logs/`: medições.

## Reproduzir

```powershell
python tools/render_monitor.py --tag A_final_1080p_64s -- --style A --res 1920x1080 --samples 64 --out output/style_frames/estilo_A_cutout_2_5D.png --blend blend/estilo_A.blend
python tools/render_monitor.py --tag B_final_1080p_64s -- --style B --res 1920x1080 --samples 64 --out output/style_frames/estilo_B_3D_estilizado.png --blend blend/estilo_B.blend
python tools/comparativo.py
```

O monitor só roda um Blender por vez: feche qualquer Blender aberto antes. Ele interrompe o render se a RAM livre cair abaixo de 0,8 GB.

## Versões guardadas

- `versoes/blender_v1/`: versão Blender completa do teste de 15 s (ver `LEIA-ME.md`).

- `estilos/ampulheta/`: documentário em ilustração plana com HyperFrames (ver `REVIEW.md`). Protótipo aguardando aprovação.
