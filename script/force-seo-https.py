"""Application-only HTTPS canonical redirect, with rollback on failed live checks."""
from pathlib import Path
import os, shutil, urllib.request, urllib.error
ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-polish'
assert ROOT.resolve() == ROOT and BACKUP.is_dir()
config = ROOT / '.htaccess'
old = config.read_text()
marker = '# Route-specific SEO HTML and live publication sitemap'
assert old.count(marker) == 1 and '# Force canonical HTTPS' not in old
assert not (BACKUP/'before-force-https.htaccess').exists()
shutil.copy2(config, BACKUP/'before-force-https.htaccess')
rules = """# Force canonical HTTPS (Cloudways forwarded protocol)
RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
RewriteRule ^ https://sharfedu.com%{REQUEST_URI} [R=301,L,NE]
"""
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs): return None
try:
    temporary = ROOT / '.htaccess.seo-https'
    temporary.write_text(old.replace(marker, rules + marker))
    os.replace(temporary, config)
    direct = urllib.request.build_opener(NoRedirect())
    try: response = direct.open('http://sharfedu.com/lesson/secondary/math/l-mm6el08l?seo-check=1',timeout=15)
    except urllib.error.HTTPError as error: response = error
    assert response.code == 301, response.code
    assert response.headers['Location'] == 'https://sharfedu.com/lesson/secondary/math/l-mm6el08l?seo-check=1'
    for path in ('/', '/lesson/secondary/math/l-mm6el08l', '/sitemap.xml', '/api/health'):
        with urllib.request.urlopen('https://sharfedu.com'+path,timeout=15) as response:
            assert response.status == 200, path
    print('HTTPS_REDIRECT_301_VERIFIED_HTTPS_200_NO_LOOP')
except Exception:
    config.write_text(old)
    raise
