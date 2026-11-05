#!/bin/bash
# Renderiza por capítulo e junta sem recomprimir. Uso: tools/render.sh longo [c03 c06 ...]; sem lista, todos os que faltam.
cd "$(dirname "$0")/.."; F=$1; shift; mkdir -p render/$F; LISTA=${@:-$(ls build/$F)}
for C in $LISTA; do
  [ -z "$1" ] && [ -f render/$F/$C.mp4 ] && continue
  t0=$(date +%s); (cd build/$F/$C && npx --yes hyperframes@0.9.11 render . -o ../../../render/$F/_$C.mp4 --fps 30 --workers ${WORKERS:-3} --quality looks --quiet > ../../../render/$F/$C.log 2>&1) && mv -f render/$F/_$C.mp4 render/$F/$C.mp4; echo "$C $(( $(date +%s)-t0 ))s $(ffprobe -v error -show_entries format=duration -of csv=p=0 render/$F/$C.mp4)"
done
ls render/$F/c*.mp4 render/$F/z*.mp4 2>/dev/null | sed "s#render/$F/#file '#;s#\$#'#" > render/$F/lista.txt
ffmpeg -y -v error -f concat -safe 0 -i render/$F/lista.txt -c copy render/${F}_mudo.mp4 && ffprobe -v error -show_entries format=duration -of csv=p=0 render/${F}_mudo.mp4
