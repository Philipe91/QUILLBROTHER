"""Side-by-side board: V4.4 reference | style A | style B, plus a phone-size legibility strip."""
import os
from PIL import Image, ImageDraw, ImageFont
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SF = os.path.join(R, 'output', 'style_frames')
ref = Image.open(os.path.join(R, 'refs', 'v44_t18_80.png')).convert('RGB')
A = Image.open(os.path.join(SF, 'estilo_A_cutout_2_5D.png')).convert('RGB')
B = Image.open(os.path.join(SF, 'estilo_B_3D_estilizado.png')).convert('RGB')
font = ImageFont.truetype('arial.ttf', 30); small = ImageFont.truetype('arial.ttf', 22)
W, H, bar = 960, 540, 54
items = [('V4.4 original (t = 18,80 s)', ref), ('Estilo A: 2,5D rigado + cenario 3D', A), ('Estilo B: 3D estilizado + cenario 3D', B)]
board = Image.new('RGB', (W * 3 + 40, H + bar + 20), '#111111'); d = ImageDraw.Draw(board)
for i, (t, im) in enumerate(items):
    x = 10 + i * (W + 10); board.paste(im.resize((W, H), Image.LANCZOS), (x, bar)); d.text((x + 6, 12), t, fill='#f2e9d8', font=font)
board.save(os.path.join(SF, 'comparativo_V44_A_B.jpg'), quality=93)
# a phone in portrait shows a 16:9 video about 360 px wide
pw, ph = 360, 202
strip = Image.new('RGB', (pw * 3 + 40, ph + 50), '#111111'); d = ImageDraw.Draw(strip)
for i, (t, im) in enumerate(items):
    x = 10 + i * (pw + 10); strip.paste(im.resize((pw, ph), Image.LANCZOS), (x, 40)); d.text((x + 2, 8), t.split(':')[0].split(' (')[0], fill='#f2e9d8', font=small)
strip.save(os.path.join(SF, 'teste_celular_360px.png'))
print('ok')
