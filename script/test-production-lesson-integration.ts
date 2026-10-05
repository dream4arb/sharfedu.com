import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { isPublishedLesson, publishedLessonIds } from '../src/features/lesson-engine/publishedLessons';
const baseline = execFileSync('git',['show','1d2176c:src/pages/Lesson.tsx'],{encoding:'utf8'});
const source=readFileSync('src/pages/Lesson.tsx','utf8');
const normalizePreparationChanges = (s: string) => s.replace(/\r\n/g, '\n')
  .replace('import UnitPreparationPage from "@/components/lessons/UnitPreparationPage";\n', '')
  .replace('import { findLessonLocation, getSemesterLessonNeighbors } from "@/components/lessons/lessonSidebarModel";\n', '')
  .replace('  const { prevLesson, nextLesson } = getSemesterLessonNeighbors(semesters, lessonId);', '  const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : null;\n  const prevLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex - 1] : null;')
  .replace('  const currentLesson = lessonId && lessons.length > 0 ? (lessons.find(l => l.id === lessonId) || null) : null;\n', '  const currentLesson = lessonId && lessons.length > 0 ? (lessons.find(l => l.id === lessonId) || null) : null;\n  const currentLessonIndex = lessonId && lessons.length > 0 ? lessons.findIndex(l => l.id === lessonId) : -1;\n')
  .replace('import { instructionalLessons, isUnitPreparation } from "../../shared/curriculum/unit-preparation";\n', '')
  .replace('  const currentPreparation = isUnitPreparation(lessonId);\n', '')
  .replace('  const preparationLocation = currentPreparation ? findLessonLocation(semesters, lessonId) : undefined;\n', '')
  .replace('  const firstUnitLesson = preparationLocation ? instructionalLessons(preparationLocation.chapter.lessons)[0] : undefined;\n', '')
  .replace('  const progressLessons = instructionalLessons(lessons);\n', '')
  .replace('getProgress(subjectId, progressLessons.length, progressLessons.map(lesson => lesson.id))', 'getProgress(subjectId, lessons.length, lessons.map(lesson => lesson.id))')
  .replace(`{currentPreparation ? (
                  <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200" data-testid="preparation-status">تهيئة · دون درجات</span>
                ) : currentLesson && lessonId ? (`, '{currentLesson && lessonId ? (')
  .replaceAll(' && !currentPreparation && !isPublishedLesson(params.lessonId)', ' && !isPublishedLesson(params.lessonId)')
  .replace(`{currentPreparation && preparationLocation ? (
                <UnitPreparationPage key={lessonIdFromParams}
                  unitNumber={preparationLocation.chapter.number ?? Number(preparationLocation.chapter.id.replace(/\\D/g, ""))}
                  unitName={preparationLocation.chapter.name}
                  firstLessonHref={firstUnitLesson ? \`/lesson/\${urlStage}/\${subjectId}/\${firstUnitLesson.id}\` : undefined}
                  firstLessonTitle={firstUnitLesson ? getLessonDisplayTitle(firstUnitLesson, lessonTitlesFromApi) : undefined} />
              ) : isPublishedLesson(lessonIdFromParams) ? (`, '{isPublishedLesson(lessonIdFromParams) ? (')
  .replace('currentLesson && lessonIdFromParams && !currentPreparation', 'currentLesson && lessonIdFromParams')
  .replace('{isUnitPreparation(prevLesson.id) ? "تهيئة الوحدة" : "الدرس السابق"}', 'الدرس السابق')
  .replace('{isUnitPreparation(nextLesson.id) ? "تهيئة الوحدة التالية" : "الدرس التالي"}', 'الدرس التالي');
assert.equal(normalizePreparationChanges(source), baseline.replace(/\r\n/g, '\n'), 'Only explicit preparation and semester-navigation exceptions; normal lesson body and admin UI unchanged');
assert.ok(source.includes('<LessonSidebar'));
assert.equal(readFileSync('shared/curriculum/math-high1-names.json','utf8').replace(/\r\n/g,'\n'),
  execFileSync('git',['show','364f773:shared/curriculum/math-high1-names.json'],{encoding:'utf8'}).replace(/\r\n/g,'\n'));
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
console.log('PASS: scoped preparation/sidebar redesign; instructional lesson body, curriculum names, other pages and backend unchanged; only polygon published.');
