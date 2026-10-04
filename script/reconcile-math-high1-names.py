"""Names-only reconciliation of high/1/math, with dry-run, backup and guarded restore.

No server code, content tables, other curricula or existing matched lesson IDs change.
"""
import argparse
import copy
import hashlib
import json
import sqlite3
import time
from pathlib import Path

ROOT = Path('/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html')
DB = ROOT / 'node_app/sqlite.db'
BACKUPS = ROOT.parent / 'tmp/math-high1-names-20261004'
KEY = 'academic_hierarchy'


def encode(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(encode(value).encode()).hexdigest()


def target(hierarchy):
    stage = next(x for x in hierarchy if x['slug'] == 'high')
    grade = next(x for x in stage['grades'] if str(x['id']) == '1')
    return next(x for x in grade['subjects'] if x['slug'] == 'math')


def all_ids(value):
    if isinstance(value, dict):
        found = {value['id']} if 'id' in value and 'title' in value else set()
        return found.union(*(all_ids(x) for x in value.values()))
    if isinstance(value, list):
        return set().union(*(all_ids(x) for x in value))
    return set()


def entries(catalog, chapter):
    result = [dict(x, kind='core') for x in chapter['lessons']]
    result += [x for x in catalog['supplemental'] if x['chapter'] == chapter['id']]
    return sorted(result, key=lambda x: x['page'])


def reconcile(hierarchy, catalog):
    assert (catalog['stage'], catalog['grade'], catalog['subject']) == ('high', '1', 'math')
    assert len(catalog['chapters']) == 8
    assert [len(c['lessons']) for c in catalog['chapters']] == [8, 6, 7, 6, 6, 4, 6, 8]
    assert len(catalog['supplemental']) == 22
    result = copy.deepcopy(hierarchy)
    subject = target(result)
    used_ids = all_ids(hierarchy)
    changes = {'added': [], 'renamed': [], 'removed': [], 'preservedIds': []}
    assert {s['id'] for s in subject['semesters']} == {'s1', 's2'}
    for semester in subject['semesters']:
        expected = [c for c in catalog['chapters'] if c['semester'] == semester['id']]
        assert [c['id'] for c in semester['chapters']] == [c['id'] for c in expected]
        for actual, reference in zip(semester['chapters'], expected):
            assert actual['name'] == reference['name'], 'Chapter title changed since audit'
            old = actual['lessons']
            assert len(old) < 100
            matched = set()
            new = []
            for item in entries(catalog, reference):
                new_id = f"math-high1-{semester['id']}-{item['number']}"
                candidates = [x for x in old if x['id'] not in matched and (
                    x['title'] == item['title'] or x['id'] == new_id or
                    (item['kind'] == 'core' and x['id'] == item['number']) or
                    (item['number'] == 'prep-1' and x['id'] == 'intro-1'))]
                assert len(candidates) <= 1, 'Ambiguous match; no changes made'
                if candidates:
                    lesson = copy.deepcopy(candidates[0])
                    matched.add(lesson['id'])
                    changes['preservedIds'].append(lesson['id'])
                    if lesson['title'] != item['title']:
                        changes['renamed'].append({'id': lesson['id'], 'before': lesson['title'], 'after': item['title']})
                    lesson['title'] = item['title']
                else:
                    assert new_id not in used_ids, f'ID collision: {new_id}'
                    used_ids.add(new_id)
                    lesson = {'id': new_id, 'title': item['title']}
                    changes['added'].append({'chapter': actual['id'], 'kind': item['kind'], **lesson})
                new.append(lesson)
            changes['removed'] += [dict(x, chapter=actual['id']) for x in old if x['id'] not in matched]
            actual['lessons'] = new

    # Mask only the explicitly authorized lesson lists; all other structure must match.
    masked = copy.deepcopy(result)
    before_subject = target(hierarchy)
    masked_subject = target(masked)
    for before_sem, after_sem in zip(before_subject['semesters'], masked_subject['semesters']):
        for before_ch, after_ch in zip(before_sem['chapters'], after_sem['chapters']):
            after_ch['lessons'] = copy.deepcopy(before_ch['lessons'])
    assert masked == hierarchy, 'Unexpected changes outside target lesson lists'
    assert len(changes['added']) + len(changes['preservedIds']) == 73
    summary = {
        'added': len(changes['added']), 'renamed': len(changes['renamed']),
        'removed': len(changes['removed']), 'preservedIds': len(changes['preservedIds']),
        'coreLessons': 51, 'preparation': 8, 'explorationAndExtension': 14,
        'semesters': {s['id']: sum(len(c['lessons']) for c in s['chapters']) for s in subject['semesters']},
        'outsideScopeUnchanged': True, 'beforeHash': digest(hierarchy), 'afterHash': digest(result),
    }
    return result, changes, summary


def protected_tables(conn):
    result = {}
    for (table,) in conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"):
        quoted = '"' + table.replace('"', '""') + '"'
        rows = list(conn.execute('SELECT * FROM ' + quoted))
        if table == 'platform_stats':
            rows = [x for x in rows if x[0] != KEY]
        result[table] = hashlib.sha256('\n'.join(sorted(repr(x) for x in rows)).encode()).hexdigest()
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--catalog', type=Path, required=True)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--expect-before-hash')
    parser.add_argument('--restore', type=Path)
    args = parser.parse_args()
    assert ROOT.resolve() == ROOT and DB.is_file()
    catalog = json.loads(args.catalog.read_text(encoding='utf-8'))
    conn = sqlite3.connect(DB, timeout=30)
    conn.execute('BEGIN IMMEDIATE' if args.apply or args.restore else 'BEGIN')
    raw, updated = conn.execute('SELECT value,updated_at FROM platform_stats WHERE key=?', (KEY,)).fetchone()
    before = json.loads(raw)
    if args.restore:
        backup = args.restore.resolve()
        assert backup.parent == BACKUPS
        manifest = json.loads((backup / 'manifest.json').read_text(encoding='utf-8'))
        assert digest(before) == manifest['summary']['afterHash'], 'Live hierarchy changed; refusing restore'
        saved = json.loads((backup / 'hierarchy-before.json').read_text(encoding='utf-8'))
        conn.execute('UPDATE platform_stats SET value=?,updated_at=? WHERE key=?', (saved['raw'], saved['updatedAt'], KEY))
        conn.commit()
        print(encode({'restored': True, 'hash': digest(json.loads(saved['raw']))}))
        return
    after, changes, summary = reconcile(before, catalog)
    if not args.apply:
        conn.rollback()
        print(encode({'mode': 'dry-run', 'summary': summary, 'changes': changes}))
        return
    assert args.expect_before_hash == digest(before), 'Live data changed since dry-run'
    if summary['beforeHash'] == summary['afterHash']:
        conn.rollback()
        print(encode({'mode': 'already-matches', 'summary': summary}))
        return
    BACKUPS.mkdir(mode=0o700, parents=True, exist_ok=True)
    backup = BACKUPS / str(time.time_ns())
    backup.mkdir(mode=0o700)
    # Independent read connection captures a consistent private SQLite backup.
    source = sqlite3.connect(DB)
    destination = sqlite3.connect(backup / 'sqlite-before.db')
    source.backup(destination)
    assert destination.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    destination.close()
    source.close()
    (backup / 'hierarchy-before.json').write_text(encode({'raw': raw, 'updatedAt': updated}), encoding='utf-8')
    (backup / 'manifest.json').write_text(encode({'summary': summary, 'changes': changes}), encoding='utf-8')
    protected = protected_tables(conn)
    conn.execute('UPDATE platform_stats SET value=?,updated_at=? WHERE key=?', (encode(after), int(time.time() * 1000), KEY))
    assert protected_tables(conn) == protected, 'Content or unrelated data changed'
    assert json.loads(conn.execute('SELECT value FROM platform_stats WHERE key=?', (KEY,)).fetchone()[0]) == after
    conn.commit()
    assert conn.execute('PRAGMA integrity_check').fetchone()[0] == 'ok'
    print(encode({'mode': 'applied', 'summary': summary, 'backup': str(backup), 'protectedTablesUnchanged': True}))


if __name__ == '__main__':
    main()
