"""Synthetic regression checks; no production connection or writes."""
import copy
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location('reconciler', ROOT / 'script/reconcile-math-high1-names.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
catalog = json.loads((ROOT / 'shared/curriculum/math-high1-names.json').read_text(encoding='utf-8'))
chapters = catalog['chapters']
assert sum(len(c['lessons']) for c in chapters if c['semester'] == 's1') == 27
assert sum(len(c['lessons']) for c in chapters if c['semester'] == 's2') == 24
assert len({x['number'] for x in catalog['supplemental']}) == 22
assert all(len({x['title'] for x in module.entries(catalog, c)}) == len(module.entries(catalog, c)) for c in chapters)

existing_semesters = []
for semester_id in ['s1', 's2']:
    semester = {'id': semester_id, 'name': semester_id, 'chapters': []}
    for reference in [c for c in chapters if c['semester'] == semester_id]:
        lessons = []
        if reference['id'] == 'ch1':
            lessons.append({'id': 'intro-1', 'title': 'التهيئة'})
            lessons.extend({'id': x['number'], 'title': x['title']} for x in reference['lessons'][:3])
        if semester_id == 's2':
            lessons.extend({'id': 'keep-' + x['number'], 'title': x['title'], 'custom': 'preserve'} for x in reference['lessons'])
        semester['chapters'].append({'id': reference['id'], 'name': reference['name'], 'lessons': lessons})
    existing_semesters.append(semester)
hierarchy = [{'slug': 'high', 'grades': [{'id': '1', 'subjects': [
    {'slug': 'math', 'semesters': existing_semesters},
    {'slug': 'physics', 'semesters': [{'id': 's1', 'chapters': [{'lessons': [{'id': 'other', 'title': 'unchanged'}]}]}]},
]}]}, {'slug': 'middle', 'grades': [], 'sentinel': 'unchanged'}]
before = copy.deepcopy(hierarchy)
after, changes, summary = module.reconcile(hierarchy, catalog)
assert hierarchy == before
assert summary['added'] == 45 and summary['renamed'] == 1 and summary['removed'] == 0
assert summary['preservedIds'] == 28
assert summary['semesters'] == {'s1': 39, 's2': 34}
assert next(x for x in module.target(after)['semesters'][0]['chapters'][0]['lessons'] if x['id'] == 'intro-1')['title'] == 'التهيئة للفصل 1'
assert after[0]['grades'][0]['subjects'][1] == before[0]['grades'][0]['subjects'][1]
assert after[1] == before[1]
again, _, second = module.reconcile(after, catalog)
assert again == after and second['added'] == second['renamed'] == second['removed'] == 0
extra = copy.deepcopy(before)
module.target(extra)['semesters'][0]['chapters'][0]['lessons'].append({'id': 'obsolete-test', 'title': 'not in book'})
_, removed, _ = module.reconcile(extra, catalog)
assert removed['removed'] == [{'id': 'obsolete-test', 'title': 'not in book', 'chapter': 'ch1'}]
print('PASS: 51 core + 22 supplementary names; existing IDs/metadata and other curricula preserved; extra-name removal and idempotency verified.')
