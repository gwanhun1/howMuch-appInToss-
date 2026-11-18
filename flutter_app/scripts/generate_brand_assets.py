#!/usr/bin/env python3
"""Generate native icon/splash sizes from the supplied artwork (requires Pillow)."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'assets/branding/app-icon-source.png'
BLUE = (12, 103, 245)
image = Image.open(SOURCE).convert('RGB')
assert image.width == image.height


def save(im, target, size):
    target.parent.mkdir(parents=True, exist_ok=True)
    im.resize((size, size), Image.Resampling.LANCZOS).save(target)


save(image, ROOT / 'assets/branding/app-icon-1024.png', 1024)
save(image, ROOT / 'assets/branding/google-play-icon-512.png', 512)
icons = ROOT / 'ios/Runner/Assets.xcassets/AppIcon.appiconset'
for item in json.loads((icons / 'Contents.json').read_text())['images']:
    size = round(float(item['size'].split('x')[0]) * float(item['scale'][:-1]))
    save(image, icons / item['filename'], size)
launch = ROOT / 'ios/Runner/Assets.xcassets/LaunchImage.imageset'
for scale in (1, 2, 3):
    save(image, launch / ('LaunchImage.png' if scale == 1 else f'LaunchImage@{scale}x.png'), 240 * scale)
res = ROOT / 'android/app/src/main/res'
for density, scale in [('mdpi', 1), ('hdpi', 1.5), ('xhdpi', 2), ('xxhdpi', 3), ('xxxhdpi', 4)]:
    save(image, res / f'mipmap-{density}/ic_launcher.png', round(48 * scale))
    save(image, res / f'drawable-{density}/launch_logo.png', round(240 * scale))
    # Keep the artwork's pale circular motif within the adaptive icon safe zone.
    canvas = Image.new('RGBA', (round(108 * scale),) * 2, (0, 0, 0, 0))
    side = round(95 * scale)
    scaled = image.resize((side, side), Image.Resampling.LANCZOS).convert('RGBA')
    offset = (canvas.width - side) // 2
    canvas.alpha_composite(scaled, (offset, offset))
    target = res / f'drawable-{density}/ic_launcher_foreground.png'
    target.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(target)
    # Android 12's 288dp splash icon canvas contains a centered 240dp image.
    splash = Image.new('RGB', (round(288 * scale),) * 2, BLUE)
    size = round(240 * scale)
    splash.paste(image.resize((size, size), Image.Resampling.LANCZOS), ((splash.width-size)//2,)*2)
    splash.save(res / f'drawable-{density}/splash_icon.png')
print('Generated iOS/Android icons, launch images and store artwork.')
