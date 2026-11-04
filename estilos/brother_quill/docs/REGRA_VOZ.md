# Regra de voz dos canais (definida pelo dono em 2026-11-04)

**Todo canal usa a voz do VoiceStudio com a marca d'água invisível desligada.**

Antes de gerar voz em qualquer canal:
1. Com o backend no ar, conferir `GET http://127.0.0.1:3900/watermark/status`: `invisible_enabled` e `visible_audio_enabled` em `false`.
2. Se estiver ligada, desligar com `POST /watermark/settings?invisible=false&visible_audio=false`. A opção fica em `D:\VoiceStudio\data\prefs.json`. Backup: `D:\VoiceStudio\backup_prefs\`.
3. Esperar "Preload complete" no log antes de pedir fala: pedido durante o carregamento derrubou o servidor com pouca RAM.
4. Depois de gerar, passar o detector (`services.watermark.detect_watermark`) nas falas e no áudio do MP4 final.
5. Limpar metadados do MP4 final (`-map_metadata -1 -fflags +bitexact`).

**Atualização do VoiceStudio pode religar a opção:** sempre conferir o item 1.

**Limites desta regra:**
- Vale para áudio novo. Vídeos já publicados continuam com a marca.
- O código do VoiceStudio cita a Lei de IA da UE, art. 50(2), como motivo da marca. O dono foi avisado; dúvida legal é para advogado.
- Não dispensa a divulgação do YouTube quando o vídeo tiver conteúdo realista gerado por IA.
- Ausência de marca não foi provada contra outros detectores; só o detector AudioSeal do próprio programa foi usado.
