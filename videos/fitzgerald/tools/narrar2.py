"""Voz em duas fases, para caber na RAM: 'sintese' pede as falas ao VoiceStudio; 'alinha' roda o Whisper depois, com o VoiceStudio fechado.
Uso: python narrar2.py sintese job.json | python narrar2.py alinha job.json. Usa o vs_narrar.py do canal sem alterá-lo."""
import json, subprocess, sys
from pathlib import Path
sys.path.insert(0, r'D:\ViralReplicator_motion\remotion')
import vs_narrar as V
fase, jb = sys.argv[1], sys.argv[2]; job = json.loads(Path(jb).read_text(encoding='utf-8'))
if fase == 'sintese':
    for it in job:
        mp3 = Path(it['mp3'])
        if mp3.exists() and mp3.stat().st_size > 1000: continue
        wav = mp3.with_suffix('.vs.wav'); V.sintetizar(it['texto'], it['perfil'], wav, it.get('lang', 'en'))
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(wav), '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse', '-ar', '24000', '-c:a', 'libmp3lame', '-b:a', '128k', str(mp3)], check=True)
        wav.unlink(); print(it['id'], flush=True)
else:
    from faster_whisper import WhisperModel
    m = WhisperModel('small.en', device='cpu', compute_type='int8', cpu_threads=4); out = []
    for it in job:
        mp3 = it['mp3']; dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3], capture_output=True, text=True).stdout)
        segs, _ = m.transcribe(mp3, word_timestamps=True); out.append(V.alinhar(it['texto'], [w for s in segs for w in s.words], dur)); print(it['id'], round(dur, 2), flush=True)
    Path(jb + '.out').write_text(json.dumps(out, ensure_ascii=False), encoding='utf-8')
