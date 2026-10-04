"""Publish frontend-only bundle, retaining old assets and a private rollback index."""
import argparse,hashlib,json,os,re,shutil,tarfile
from pathlib import Path
ROOT=Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
PUBLIC=ROOT/'node_app/server/public'
BACKUP=ROOT.parent/'tmp/lesson-ui-backup-20261004'
EXPECTED_BACKEND='7352d186e2dcc3774f53c6893a2182baa51d2c9a2cebf9a50ca2dc24e9305c63'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--bundle');p.add_argument('--sha256');p.add_argument('--activate',action='store_true');p.add_argument('--rollback',action='store_true');p.add_argument('--backup-name',default=BACKUP.name);args=p.parse_args()
 if not re.fullmatch(r'lesson-ui-backup-[0-9a-z-]+',args.backup_name):raise ValueError('Unsafe backup name')
 backup=ROOT.parent/'tmp'/args.backup_name
 assert ROOT.resolve()==ROOT and PUBLIC.is_dir() and digest(ROOT/'node_app/index.cjs')==EXPECTED_BACKEND
 if args.rollback:
  shutil.copy2(backup/'index.html',PUBLIC/'index.rollback.html');os.replace(PUBLIC/'index.rollback.html',PUBLIC/'index.html')
  if (backup/'pdf.worker.min.mjs').is_file():shutil.copy2(backup/'pdf.worker.min.mjs',PUBLIC/'pdf.worker.min.mjs')
  print('FRONTEND_ROLLED_BACK');return
 if args.bundle:
  bundle=ROOT/args.bundle
  assert bundle.resolve().parent==ROOT and digest(bundle)==args.sha256
  if backup.exists():raise ValueError('Backup already exists; do not overwrite')
  backup.mkdir(mode=0o700);os.chmod(backup,0o700)
  shutil.copy2(PUBLIC/'index.html',backup/'index.html')
  if (PUBLIC/'pdf.worker.min.mjs').is_file():shutil.copy2(PUBLIC/'pdf.worker.min.mjs',backup/'pdf.worker.min.mjs')
  with tarfile.open(bundle,'r:gz') as archive:
   all_members=archive.getmembers()
   if any(not (m.isfile() or m.isdir()) for m in all_members):raise ValueError('Non-regular archive member')
   members=[m for m in all_members if m.isfile()]
   for member in members:
    name=member.name
    if not member.isfile() or name.startswith('/') or '..' in Path(name).parts or not (name.startswith(('assets/','lesson-books/')) or name in ('index.html','pdf.worker.min.mjs')):raise ValueError('Unsafe archive member: '+name)
    dest=PUBLIC/name
    if PUBLIC.resolve() not in dest.resolve().parents:raise ValueError('Unsafe destination')
   for member in members:
    dest=PUBLIC/('index.next.html' if member.name=='index.html' else member.name)
    data=archive.extractfile(member).read()
    if member.name.startswith('assets/') and dest.exists() and dest.read_bytes()!=data:raise ValueError('Asset-name collision: '+member.name)
    dest.parent.mkdir(parents=True,exist_ok=True)
    dest.write_bytes(data)
  shutil.move(str(bundle),str(backup/'published-ui.tar.gz'))
  print(json.dumps({'prepared':True,'files':len(members),'indexSha256':digest(PUBLIC/'index.next.html'),'backendUnchanged':True}))
 if args.activate:
  assert (PUBLIC/'index.next.html').is_file() and (backup/'index.html').is_file()
  os.replace(PUBLIC/'index.next.html',PUBLIC/'index.html')
  print(json.dumps({'activated':True,'indexSha256':digest(PUBLIC/'index.html'),'backendUnchanged':True}))
if __name__=='__main__':main()
