import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const text = (path: string) => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const source = text('src/pages/Lesson.tsx');
// Publication comes from the server catalog, not a build-time ID whitelist.
for (const guard of ['usePublishedLesson(lessonId, internalStage, selectedGradeId, subjectId)',
  'publishedEntry={publishedEntry}', '<LessonSidebar', '<UnitPreparationPage',
  'data-testid="lesson-content-pending"', 'const legacyContentEnabled = false',
  'getSemesterLessonNeighbors(semesters, lessonId)']) assert.ok(source.includes(guard), guard);
assert.ok(source.includes(') : publishedEntry ? ('));
assert.ok(!source.includes(') : isPublishedLesson(lessonIdFromParams) ? ('));
for (const path of ['src/App.tsx', 'src/index.css', 'src/pages/Home.tsx', 'src/pages/Stage.tsx',
  'src/components/ui/sidebar.tsx', 'src/components/lessons/LessonSidebar.tsx',
  'src/components/lessons/UnitPreparationPage.tsx', 'server/index.ts',
  'server/admin/contentRoutes.ts', 'shared/curriculum/math-high1-names.json']) {
  const baseline = execFileSync('git', ['show', `61d9fa1:${path}`], {encoding: 'utf8'}).replace(/\r\n/g, '\n');
  // Performance changes only how Home is downloaded, not any route or provider.
  const expected = path === 'src/App.tsx' ? baseline.replace('import Home from "@/pages/Home";\n', '')
    .replace('const Dashboard = lazy', 'const Home = lazy(() => import("@/pages/Home"));\nconst Dashboard = lazy') : baseline;
  assert.equal(text(path), expected, path);
}
console.log('PASS: server-approved lesson packages drive rendering; other pages, curriculum, sidebar, preparation and semester boundaries preserved.');
