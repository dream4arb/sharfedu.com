"""Move only this deployment's public helper scripts into its private recovery folder."""
import hashlib, json, shutil
from pathlib import Path

ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
BACKUP = ROOT.parent / 'tmp/seo-backup-20261005-grade-editor'
assert ROOT.resolve() == ROOT and BACKUP.is_dir()
assert BACKUP.resolve().parent == ROOT.parent / 'tmp'
assert hashlib.sha256((ROOT/'node_app/index.cjs').read_bytes()).hexdigest() == 'd7a51d9531a399dc16f88f7232770d5601b2a667f90b4d1422c17ad41211f034'
assert json.loads((BACKUP/'candidate-check.json').read_text())['passed']
names = ('publish-production-seo.py', 'repair-seo-entrypoint.py', 'force-seo-https.py', 'finalize-seo-deployment.py')
moved = []
for name in names:
    source, target = ROOT/name, BACKUP/name
    assert source.resolve().parent == ROOT and target.resolve().parent == BACKUP
    assert not target.exists(), 'Do not overwrite a recovery artifact'
    if source.is_file():
        shutil.move(source, target)
        moved.append(name)
assert all(not (ROOT/name).exists() for name in names)
print(json.dumps({'publicHelpersRemoved': moved, 'recoverableIn': str(BACKUP), 'dataRemoved': False}))
