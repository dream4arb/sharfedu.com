"""Repair Cloudways' PHP directory fallback and retire the old root HTML recoverably."""
from pathlib import Path
import hashlib, os, shutil, urllib.request
ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-final'
assert ROOT.resolve() == ROOT and BACKUP.is_dir()
assert hashlib.sha256((ROOT/'node_app/index.cjs').read_bytes()).hexdigest() == '1b09f4513ea86ea14c6c1a5ce658e306b0d185581c8884cc6de132f528f16fc0'
config = ROOT / '.htaccess'
old = config.read_text()
old_rule = r'RewriteRule ^(?:index\.html|sitemap\.xml|robots\.txt)?$ http://127.0.0.1:5000%{REQUEST_URI} [P,L]'
assert old.count(old_rule) == 1
new_rule = r"""RewriteRule ^(?:index\.php)?$ http://127.0.0.1:5000/ [P,L]
RewriteRule ^(index\.html|sitemap\.xml|robots\.txt)$ http://127.0.0.1:5000/$1 [P,L]"""
assert not (BACKUP/'entrypoint-htaccess').exists()
shutil.copy2(config, BACKUP/'entrypoint-htaccess')
retired = ROOT / 'index.html'
if retired.is_file():
    assert not (BACKUP/'legacy-root-index.html').exists()
    shutil.move(retired, BACKUP/'legacy-root-index.html')
try:
    candidate = ROOT / '.htaccess.seo-entrypoint'
    candidate.write_text(old.replace(old_rule, new_rule))
    os.replace(candidate, config)
    with urllib.request.urlopen('https://sharfedu.com/',timeout=15) as response:
        body = response.read().decode()
        assert response.status == 200 and '<title>' in body and 'page-structured-data' in body
    print('ENTRYPOINT_REPAIRED_ROOT_200_WITH_SEO')
except Exception:
    config.write_text(old)
    if (BACKUP/'legacy-root-index.html').exists():
        shutil.move(BACKUP/'legacy-root-index.html', retired)
    raise
