#!/usr/bin/env python3
"""Size existing promotional artwork without cropping, stretching or redrawing it."""
from pathlib import Path
import hashlib
import json
from PIL import Image, ImageOps, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'store/appintoss-reference/screenshots'
OUTPUT = ROOT / 'store/ios-upload/screenshots'
# Accepted portrait sizes in Apple's screenshot specification, checked 2026-11-18.
SIZES = {'iphone-large-1320x2868': (1320, 2868),
         'iphone-1284x2778': (1284, 2778),
         'ipad-13-2048x2732': (2048, 2732)}
manifest = []
for label, size in SIZES.items():
    folder = OUTPUT / label
    folder.mkdir(parents=True, exist_ok=True)
    previews = []
    for index in range(1, 5):
        source = SOURCE / f'{index:02}.png'
        artwork = Image.open(source).convert('RGB')
        scaled = ImageOps.contain(artwork, size, Image.Resampling.LANCZOS)
        # Plain margins preserve every part of the supplied image and its aspect ratio.
        canvas = Image.new('RGB', size, '#232832')
        offset = ((size[0]-scaled.width)//2, (size[1]-scaled.height)//2)
        canvas.paste(scaled, offset)
        target = folder / f'{index:02}.png'
        canvas.save(target, optimize=True)
        manifest.append({'file': str(target.relative_to(OUTPUT.parent)),
                         'source': str(source.relative_to(ROOT)),
                         'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                         'output_size': list(size), 'artwork_size': list(scaled.size),
                         'offset': list(offset), 'background': '#232832',
                         'method': 'contain; no crop, no stretch, no content changes',
                         'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
        previews.append(canvas)
    thumb_w = 230
    thumb_h = round(thumb_w*size[1]/size[0])
    sheet = Image.new('RGB', (thumb_w*4, thumb_h+28), '#e5e7eb')
    draw = ImageDraw.Draw(sheet)
    for i, im in enumerate(previews):
        sheet.paste(im.resize((thumb_w,thumb_h),Image.Resampling.LANCZOS),(i*thumb_w,28))
        draw.text((i*thumb_w+12,8),f'{i+1:02} / {size[0]} x {size[1]}',fill='black')
    sheet.save(OUTPUT.parent/f'{label}-preview.jpg', quality=90)
(OUTPUT.parent/'screenshots-manifest.json').write_text(json.dumps({
    'spec_checked_on': '2026-11-18',
    'source': 'https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications',
    'files': manifest}, ensure_ascii=False, indent=2)+'\n')
print(f'Exported {len(manifest)} opaque RGB PNGs in {len(SIZES)} sets.')
