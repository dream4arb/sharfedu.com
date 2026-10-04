"""Scoped, recoverable production content retirement. No credentials in this file.

Run on the existing application host: python3 retire-legacy-lesson-content.py
Inspect plan first; --apply archives old lesson content; --restore reverses it.
Website hierarchy, SEO, users, progress and semester book attachments are preserved.
"""
import argparse, hashlib, json, os, re, shutil, sqlite3
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
ARCHIVE = ROOT.parent / 'tmp' / 'lesson-content-retired-20261004'
TABLES = ('cms_content', 'admin_lesson_html', 'admin_lesson_json')
DB = ROOT / 'node_app/sqlite.db'

def fingerprint(db):
    names = [r[0] for r in db.execute("select name from sqlite_master where type='table'")]
    # Sessions may change while the site remains online. Do not modify them.
    return {t: hashlib.sha256(repr(db.execute('select * from "'+t+'" order by rowid').fetchall()).encode()).hexdigest()
            for t in names if t not in TABLES and t not in ('sessions', 'sqlite_sequence')}

def safe_file(path):
    if path.is_symlink(): raise ValueError('Symlink rejected: '+str(path))
    resolved = path.resolve()
    if ROOT.resolve() not in resolved.parents: raise ValueError('Outside application: '+str(path))
    if not path.is_file(): raise ValueError('Not a file: '+str(path))
    return path

def plan(db):
    protected = set()
    for value, in db.execute("select value from platform_stats where key='semester_attachments'"):
        for url in re.findall(r'/(?:attached_assets|attachments)/[^\s"<>]+',value):
            for prefix in ('', 'node_app/'):
                protected.add((ROOT / prefix / unquote(urlsplit(url).path).lstrip('/')).resolve())
    # Preserve subjects' book sources and sidebar files; retire lesson uploads only.
    candidates = set()
    for prefix in ('', 'node_app/'):
        asset = ROOT / prefix / 'attached_assets'
        for folder in ('html/lessons','json/lessons','lessons','uploads'):
            directory = asset / folder
            if directory.exists(): candidates.update(p for p in directory.rglob('*') if p.is_file())
        candidates.update(asset.glob('درس_زوايا_المضلع_*.pdf'))
    return sorted((safe_file(p) for p in candidates if p.resolve() not in protected),key=str), sorted(map(str,protected))

def restore(db):
    saved = json.loads((ARCHIVE/'content-rows.json').read_text())
    manifest = json.loads((ARCHIVE/'manifest.json').read_text())
    for relative in manifest['files']:
        src = ARCHIVE/'files'/relative
        dst = ROOT/relative
        if dst.exists(): raise ValueError('Refusing to overwrite new content: '+relative)
        if ROOT.resolve() not in dst.resolve().parents: raise ValueError('Unsafe restore path')
        if not src.is_file(): raise ValueError('Missing archived file: '+relative)
    for table in TABLES:
        if db.execute('select count(*) from '+table).fetchone()[0]:
            raise ValueError('Refusing to overwrite new CMS content: '+table)
    before=fingerprint(db)
    with db:
        for table, saved_table in saved.items():
            columns=saved_table['columns']; rows=saved_table['rows']
            if rows: db.executemany('insert into '+table+' ('+','.join(columns)+') values ('+','.join('?' for _ in columns)+')',rows)
    for relative in manifest['files']:
        dst=ROOT/relative; dst.parent.mkdir(parents=True,exist_ok=True)
        shutil.move(str(ARCHIVE/'files'/relative),str(dst))
    assert before==fingerprint(db), 'Protected table changed'
    print(json.dumps({'restoredRows':sum(len(t['rows']) for t in saved.values()),'restoredFiles':len(manifest['files'])}))

def main():
    parser=argparse.ArgumentParser(); parser.add_argument('--apply',action='store_true'); parser.add_argument('--restore',action='store_true')
    args=parser.parse_args()
    assert ROOT.resolve()==ROOT and DB.is_file() and ROOT.parent.joinpath('tmp').is_dir()
    db=sqlite3.connect(DB,timeout=30)
    if args.restore: return restore(db)
    files,protected=plan(db)
    counts={t:db.execute('select count(*) from '+t).fetchone()[0] for t in TABLES}
    summary={'rows':counts,'files':len(files),'bytes':sum(p.stat().st_size for p in files),'protectedBookPaths':len(protected)}
    if not args.apply: print(json.dumps(summary)); return
    if ARCHIVE.exists(): raise ValueError('Archive already exists; inspect instead of repeating')
    ARCHIVE.mkdir(mode=0o700); os.chmod(ARCHIVE,0o700)
    backup=sqlite3.connect(ARCHIVE/'before.sqlite.db'); db.backup(backup); backup.close()
    saved={t:{'columns':[r[1] for r in db.execute('pragma table_info('+t+')')], 'rows':db.execute('select * from '+t).fetchall()} for t in TABLES}
    (ARCHIVE/'content-rows.json').write_text(json.dumps(saved,ensure_ascii=False),encoding='utf-8')
    manifest={**summary,'files':[str(p.relative_to(ROOT)) for p in files],'protected':protected}
    (ARCHIVE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    protected_before=fingerprint(db)
    moved=[]
    try:
        for src in files:
            dst=ARCHIVE/'files'/src.relative_to(ROOT); dst.parent.mkdir(parents=True,exist_ok=True)
            shutil.move(str(src),str(dst)); moved.append((src,dst))
        with db:
            for table in TABLES: db.execute('delete from '+table)
        protected_after=fingerprint(db)
        assert protected_before==protected_after, 'Protected tables changed during retirement'
        assert all(db.execute('select count(*) from '+t).fetchone()[0]==0 for t in TABLES)
        (ARCHIVE/'verified.json').write_text(json.dumps({'before':protected_before,'after':protected_after,'contentCountsAfter':{t:0 for t in TABLES}}),encoding='utf-8')
    except Exception:
        for src,dst in reversed(moved): shutil.move(str(dst),str(src))
        with db:
            for table,data in saved.items():
                if db.execute('select count(*) from '+table).fetchone()[0]==0 and data['rows']:
                    cols=data['columns']; db.executemany('insert into '+table+' ('+','.join(cols)+') values ('+','.join('?' for _ in cols)+')',data['rows'])
        raise
    print(json.dumps({**summary,'archivedAt':str(ARCHIVE),'protectedTablesUnchanged':True,'contentCleared':True}))

if __name__=='__main__': main()
