"""Scoped SEO deployment with checksummed bundle, private backups and explicit rollback.
No database, environment, authentication config or progress records are replaced.
"""
import argparse, hashlib, json, os, shutil, subprocess, tarfile, time, urllib.request, urllib.error
from pathlib import Path
ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
APP = ROOT / 'node_app'
PUBLIC = APP / 'server/public'
BACKUP = ROOT.parent / 'tmp/seo-backup-20261005'
EXPECTED = '7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63'
NODE = '/home/master/.nvm/versions/node/v20.20.0/bin/node'
PM2 = '/home/master/.nvm/versions/node/v20.20.0/lib/node_modules/pm2/bin/pm2'
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def restart():
    subprocess.run([NODE, PM2, 'restart', '0'], check=True, stdout=subprocess.DEVNULL)
def check_candidate():
    shutil.copy2(BACKUP/'database-safety.db', BACKUP/'candidate-check.db')
    env=dict(os.environ, DATABASE_URL=f'file:{BACKUP / "candidate-check.db"}', NODE_ENV='production', HOST='127.0.0.1', PORT='5105')
    with (BACKUP/'candidate-check.log').open('w') as log:
        process=subprocess.Popen([NODE,str(APP/'index.seo-next.cjs')],cwd=APP,env=env,stdout=log,stderr=log)
        try:
            for _ in range(40):
                if process.poll() is not None: raise RuntimeError('Candidate stopped; inspect private log')
                try:
                    with urllib.request.urlopen('http://127.0.0.1:5105/api/health',timeout=2) as response:
                        assert json.load(response)['ok']; break
                except urllib.error.URLError: time.sleep(.25)
            else: raise RuntimeError('Candidate health timeout')
            checks=[]
            def read(path, status=200):
                try: response=urllib.request.urlopen('http://127.0.0.1:5105'+path,timeout=10)
                except urllib.error.HTTPError as error: response=error
                assert response.code==status,(path,response.code,status)
                body=response.read().decode(); checks.append({'path':path,'status':status}); return body,response.headers
            page,headers=read('/lesson/secondary/math/l-mm6el08l')
            assert '540°' in page and 'LearningResource' in page and 'زوايا المضلع' in page
            assert 'content="index, follow' in page
            page,headers=read('/lesson/secondary/math/math-high1-s2-prep-5')
            assert 'الأشكال الرباعية مضلعات' in page and 'content="index, follow' in page
            page,_=read('/lesson/secondary/math/math-high1-s1-4-6')
            assert 'content="noindex, follow' in page
            page,_=read('/lesson/secondary/math?grade=2')
            assert 'ثاني ثانوي' in page and '?grade=2' in page and 'content="noindex, follow' in page
            read('/lesson/secondary/math/not-a-real-lesson',404); read('/this-page-is-missing',404); read('/assets/missing.js',404)
            for path in ('/login','/admin','/dashboard'):
                page,_=read(path); assert 'content="noindex, nofollow' in page
            read('/api/admin/structure',401); read('/api/admin/sitemap-info',401)
            xml,_=read('/sitemap.xml'); assert 'l-mm6el08l' in xml and 'math-high1-s2-prep-5' in xml and '/login' not in xml
            import xml.etree.ElementTree as ET
            locs=[el.text for el in ET.fromstring(xml).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
            assert len(locs)==len(set(locs)) and not '<lastmod>' in xml
            data,_=read('/api/public/structure'); data=json.loads(data)
            assert data['lessonLocations']['l-mm6el08l']['gradeId']=='1'
            assert 'high_2_math' in data['displayStructure']
            report={'passed':True,'checks':checks,'sitemapUrls':len(locs),'backendSha':sha(APP/'index.seo-next.cjs')}
            (BACKUP/'candidate-check.json').write_text(json.dumps(report)); print(json.dumps(report))
        finally:
            process.terminate()
            try: process.wait(timeout=10)
            except subprocess.TimeoutExpired: process.kill(); process.wait()
def main():
    global BACKUP, EXPECTED
    parser = argparse.ArgumentParser()
    parser.add_argument('--bundle'); parser.add_argument('--sha256')
    parser.add_argument('--prepare', action='store_true'); parser.add_argument('--activate', action='store_true')
    parser.add_argument('--rollback', action='store_true'); parser.add_argument('--check', action='store_true')
    parser.add_argument('--follow-up', action='store_true')
    parser.add_argument('--polish', action='store_true')
    parser.add_argument('--grade-editor', action='store_true')
    parser.add_argument('--rating-heading', action='store_true')
    parser.add_argument('--sidebar-current-caption', action='store_true')
    parser.add_argument('--end-dashboard-button', action='store_true')
    parser.add_argument('--reset-button-size', action='store_true'); args = parser.parse_args()
    if args.follow_up:
        BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-final'
        EXPECTED = 'e8f8b03cef7a269d65edb68e24a19dbc02a71ee88509b1f7b14d64754deb1f27'
    if args.polish:
        BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-polish'
        EXPECTED = '1b09f4513ea86ea14c6c1a5ce658e306b0d185581c8884cc6de132f528f16fc0'
    if args.grade_editor:
        BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-grade-editor'
        EXPECTED = 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
    if args.rating_heading:
        BACKUP = ROOT.parent / 'tmp/rating-heading-backup-20261005'
        EXPECTED = 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
    if args.sidebar_current_caption:
        BACKUP = ROOT.parent / 'tmp/sidebar-current-caption-backup-20261005'
        EXPECTED = 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
    if args.end_dashboard_button:
        BACKUP = ROOT.parent / 'tmp/end-dashboard-button-backup-20261005'
        EXPECTED = 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
    if args.reset_button_size:
        BACKUP = ROOT.parent / 'tmp/reset-button-size-backup-20261005'
        EXPECTED = 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
    assert ROOT.resolve() == ROOT and PUBLIC.is_dir()
    if args.rollback:
        for target, name in [(APP/'index.cjs','backend.cjs'), (PUBLIC/'index.html','index.html'), (ROOT/'.htaccess','htaccess')]:
            shutil.copy2(BACKUP/name, str(target)+'.rollback'); os.replace(str(target)+'.rollback', target)
        for name in ('sitemap.xml','robots.txt'):
            if (BACKUP/name).is_file(): shutil.copy2(BACKUP/name, ROOT/name)
        restart(); print('SEO_ROLLED_BACK'); return
    if args.prepare:
        assert sha(APP/'index.cjs') == EXPECTED, 'Backend changed since inspection'
        if BACKUP.exists():
            assert sha(BACKUP/'backend.cjs') == EXPECTED and sha(BACKUP/'index.html') == sha(PUBLIC/'index.html'), 'Only resume the unchanged preparation'
        bundle = ROOT / args.bundle
        assert bundle.resolve().parent == ROOT and sha(bundle) == args.sha256
        BACKUP.mkdir(mode=0o700,exist_ok=True); os.chmod(BACKUP,0o700)
        for source,name in [(APP/'index.cjs','backend.cjs'),(PUBLIC/'index.html','index.html'),(ROOT/'.htaccess','htaccess'),(ROOT/'sitemap.xml','sitemap.xml'),(ROOT/'robots.txt','robots.txt')]:
            if source.is_file() and not (BACKUP/name).exists(): shutil.copy2(source, BACKUP/name)
        # SQLite's own backup API creates a consistent private safety snapshot; never restored automatically.
        import sqlite3
        source = sqlite3.connect(f'file:{APP / "sqlite.db"}?mode=ro', uri=True)
        dest = sqlite3.connect(BACKUP/'database-safety.db'); source.backup(dest); dest.close(); source.close()
        os.chmod(BACKUP/'database-safety.db',0o600)
        with tarfile.open(bundle,'r:gz') as archive:
            members=archive.getmembers()
            for member in members:
                assert member.isfile() or member.isdir()
                assert not member.name.startswith('/') and '..' not in Path(member.name).parts
                assert member.name.startswith(('assets/','lesson-books/')) or member.name in ('index.html','index.cjs','pdf.worker.min.mjs') or (member.isdir() and member.name in ('assets','lesson-books'))
            for member in members:
                if not member.isfile(): continue
                target = APP/'index.seo-next.cjs' if member.name == 'index.cjs' else PUBLIC/('index.seo-next.html' if member.name == 'index.html' else member.name)
                assert APP.resolve() in target.resolve().parents
                data=archive.extractfile(member).read()
                if member.name.startswith('assets/') and target.exists(): assert target.read_bytes() == data, 'Asset hash collision'
                target.parent.mkdir(parents=True,exist_ok=True); target.write_bytes(data)
        shutil.move(bundle, BACKUP/'published-seo.tar.gz')
        print(json.dumps({'prepared':True,'backup':str(BACKUP),'backendSha':sha(APP/'index.seo-next.cjs')}))
    if args.check: check_candidate()
    if args.activate:
        assert (BACKUP/'backend.cjs').is_file() and (APP/'index.seo-next.cjs').is_file()
        assert sha(APP/'index.cjs') == EXPECTED
        report=json.loads((BACKUP/'candidate-check.json').read_text())
        assert report['passed'] and report['backendSha']==sha(APP/'index.seo-next.cjs'), 'Candidate must pass before activation'
        # Existing static root index and sitemap otherwise bypass the Node metadata renderer.
        old=(ROOT/'.htaccess').read_text()
        rules='''
# Route-specific SEO HTML and live publication sitemap
RewriteCond %{HTTP_HOST} ^www\\.sharfedu\\.com$ [NC]
RewriteRule ^ https://sharfedu.com%{REQUEST_URI} [R=301,L,NE]
RewriteRule ^(?:node_app|prompt-files|tests)(?:/|$) - [F,L]
RewriteRule ^(?:index\\.html|sitemap\\.xml|robots\\.txt)?$ http://127.0.0.1:5000%{REQUEST_URI} [P,L]
'''
        assert 'RewriteBase /' in old
        (ROOT/'.htaccess.seo-next').write_text(old if '# Route-specific SEO HTML and live publication sitemap' in old else old.replace('RewriteBase /','RewriteBase /\n'+rules,1))
        os.replace(APP/'index.seo-next.cjs', APP/'index.cjs')
        os.replace(PUBLIC/'index.seo-next.html', PUBLIC/'index.html')
        restart()
        os.replace(ROOT/'.htaccess.seo-next', ROOT/'.htaccess')
        # Preserve stale public crawler files privately; all future requests use the live endpoints.
        for name in ('sitemap.xml','robots.txt'):
            if (ROOT/name).exists(): shutil.move(ROOT/name, BACKUP/('retired-'+name))
        print(json.dumps({'activated':True,'backendSha':sha(APP/'index.cjs'),'databaseReplaced':False}))
if __name__ == '__main__': main()
