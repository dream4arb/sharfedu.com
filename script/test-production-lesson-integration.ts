import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isPublishedLesson, publishedLessonIds } from '../src/features/lesson-engine/publishedLessons';
const baseline = execFileSync('git',['show','90002a8:src/pages/Lesson.tsx'],{encoding:'utf8'});
const source=readFileSync('src/pages/Lesson.tsx','utf8');
const sidebar=(s:string)=>s.slice(s.indexOf('<Sidebar '),s.indexOf('</Sidebar>')+'</Sidebar>'.length).replace(/\r\n/g,'\n');
assert.ok(sidebar(source).length>5000);
assert.equal(sidebar(source),sidebar(baseline));
assert.deepEqual(publishedLessonIds,['l-mm6el08l']);
assert.equal(isPublishedLesson('l-mm6el08l'),true);
assert.equal(isPublishedLesson('m2-1-1'),false);
assert.equal(isPublishedLesson('missing'),false);
assert.ok(source.includes('embedded lessonId={lessonIdFromParams}'));
assert.ok(source.includes('data-testid="lesson-content-pending"'));
assert.ok(source.includes('const legacyContentEnabled = false'));
for (const path of ['src/App.tsx','src/index.css','src/pages/Home.tsx','src/pages/Stage.tsx','src/components/ui/sidebar.tsx','server/index.ts','server/admin/contentRoutes.ts']) {
  assert.equal(readFileSync(path,'utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show',`90002a8:${path}`],{encoding:'utf8'}).replace(/\r\n/g,'\n'),path);
}
console.log('PASS: original sidebar, other page sources and backend unchanged; only polygon published; legacy renderers disabled.');
