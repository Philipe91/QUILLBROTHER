"""Junta capítulos cortando o quadro extra de cada um (o vídeo fica igual à mixagem), recomprime e coloca o som. Uso: python final.py"""
import json, subprocess
from pathlib import Path
R = Path(__file__).resolve().parent.parent; C = json.load(open(R / 'cenas_longo.json', encoding='utf-8')); d = {}
for c in C: d[c['cap']] = d.get(c['cap'], 0) + c['dur']
L = R / 'render/longo/lista_final.txt'; L.write_text(''.join(f"file '{k}.mp4'\noutpoint {round(v * 30) / 30:.4f}\n" for k, v in d.items()), encoding='utf-8')
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', str(L), '-i', str(R / 'audio/longo/mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-map_metadata', '-1', '-fflags', '+bitexact', '-movflags', '+faststart', str(R / 'render/fitzgerald_longo.mp4')], check=True)
