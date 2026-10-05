import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
const text = (path: string) => readFileSync(path, "utf8").replace(/\r\n/g,"\n");
// Only reset-button styling is allowed to differ; preserve all handlers and dialog behavior.
const normalizeResetStyle = (source: string) => source.replace(/className="[^"]*"(?= data-testid="button-(?:restart-assessment|reset-lesson-progress)")/g, 'className="RESET_BUTTON_STYLE"');
// The tab navigation now owns the completion control. Nothing outside that scoped
// navigation and the old footer control may change, including all progress handlers.
const normalizeProgressPlacement = (source: string) => normalizeResetStyle(source)
  .replace(/        <nav[^>]*aria-label="أقسام الدرس">[\s\S]*?        <\/nav>/, '        TAB_NAVIGATION')
  .replace(/              \{activeTabId !== "assessment" && <div className="mb-4 flex justify-center">[\s\S]*?              <\/div>\}\n/, '');
for (const path of ["src/App.tsx","src/index.css","src/components/lessons/LessonSidebar.tsx","src/components/lessons/UnitPreparationPage.tsx","src/features/lesson-engine/InteractiveLessonPage.tsx","src/hooks/use-lesson-progress.tsx","server/index.ts","server/auth/authRoutes.ts","server/auth/sessionStore.ts","server/storage.ts","server/admin/contentRoutes.ts","shared/curriculum/math-high1-names.json"]) {
  const baseline = execFileSync("git",["show",`8e72c3c:${path}`],{encoding:"utf8"}).replace(/\r\n/g,"\n");
  const expected = path === "src/components/lessons/LessonSidebar.tsx"
    ? baseline.replace('            {active && <small>الدرس الحالي</small>}\n', '')
      .replace('                const open = isSearching || openChapterId === chapter.id;', '                const currentChapter = activeLocation?.semester.id === semester.id && activeLocation?.chapter.id === chapter.id;\n                const open = isSearching || openChapterId === chapter.id;')
      .replace('key={chapter.id} data-open={open}>', 'key={chapter.id} data-open={open} data-current={currentChapter || undefined}>') : baseline;
  assert.equal(path.endsWith("InteractiveLessonPage.tsx") ? normalizeProgressPlacement(text(path)) : text(path),
    path.endsWith("InteractiveLessonPage.tsx") ? normalizeProgressPlacement(expected) : expected, path);
}
const lesson = text("src/pages/Lesson.tsx");
for (const guard of ["const legacyContentEnabled = false", "getSemesterLessonNeighbors(semesters, lessonId)", "data-testid=\"lesson-content-pending\"", "<UnitPreparationPage", "<LessonSidebar", "<InteractiveLessonPage", "getLessonProgress={(id) => getLessonProgress(subjectId, id)}"]) assert.ok(lesson.includes(guard),guard);
assert.ok(lesson.includes("selectedGradeId"));
assert.ok(lesson.includes('selectedGradeId === firstGradeId'));
assert.ok(lesson.includes('!lessonId && selectedGradeId !== firstGradeId ? `?grade=${encodeURIComponent(selectedGradeId)}`'));
assert.ok(lesson.includes('internalStage === "qudurat" ? "general"'));
const routes = text("server/routes.ts");
assert.ok(routes.indexOf("installSeoAdminRoutes(app)") > routes.indexOf("app.use(passport.session())"));
assert.ok(!routes.includes('app.get("/sitemap.xml"'));
assert.ok(!lesson.includes('sessionStorage.getItem("lesson_grade") : null;\n    const ss'));
console.log("PASS: authentication, sessions, progress/reset/report, curriculum IDs, sidebar/design and semester boundaries preserved.");
