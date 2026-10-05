"""Produce additive responsive book images; retain full originals for zoom/PDF."""
from pathlib import Path
from PIL import Image
import hashlib
import re
import urllib.request

root = Path(__file__).resolve().parents[1]
for source in (root / 'public/lesson-books/l-mm6el08l').glob('page-*.jpg'):
    with Image.open(source) as image:
        for width in (480, 640, 960, 1417):
            target = source.with_name(f'{source.stem}-{width}-v1.webp')
            height = round(image.height * width / image.width)
            image.resize((width, height), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=86, method=6)
            print(source.name, width, target.stat().st_size)

# Download the official WOFF2 subsets unchanged. No new runtime/dependency needed.
ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36'
req = urllib.request.Request('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=optional', headers={'User-Agent': ua})
css = urllib.request.urlopen(req).read().decode()
for url in re.findall(r'url\((https://fonts.gstatic.com/[^)]+\.woff2)\)', css):
    data = urllib.request.urlopen(url).read()
    name = 'tajawal-' + hashlib.sha256(data).hexdigest()[:12] + '.woff2'
    target = root / 'public/assets' / name
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(data)
    css = css.replace(url, '/assets/' + name)
target = root / 'public/assets/tajawal-v12.css'
target.write_text(css, encoding='utf8')
print('Official font CSS saved:', target.name)
