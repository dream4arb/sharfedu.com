import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { OfficialBookLesson } from "../src/features/lesson-engine/OfficialBookLesson";
import { lessonPresentation } from "../src/features/lesson-engine/lessonPresentation";

assert.equal(lessonPresentation.showTutor, false, "Tutor is temporarily hidden, not removed");

for (const { lesson } of Object.values(lessonRegistry)) {
  const html = renderToStaticMarkup(createElement(OfficialBookLesson, { source: lesson.curriculumSource }));
  const pages = lesson.curriculumSource.lessonExcerpt?.pages ?? [];
  if (!pages.length) {
    assert.ok(html.includes("صفحات الكتاب قيد الربط"), "Missing excerpts retain the honest official-source fallback");
    continue;
  }
  assert.equal((html.match(/data-book-page=/g) ?? []).length, pages.length, "All full-size pages render together");
  assert.equal((html.match(/<img /g) ?? []).length, pages.length, "No duplicate thumbnail images");
  assert.equal((html.match(/loading="eager"/g) ?? []).length, 1, "Only the first page loads eagerly");
  assert.equal((html.match(/loading="lazy"/g) ?? []).length, pages.length - 1);
  const firstPagePosition = html.indexOf("data-book-page=");
  const sourceDetailsPosition = html.indexOf('data-testid="official-book-source-details"');
  assert.ok(sourceDetailsPosition > firstPagePosition, "Detailed source attribution comes after the pages");
  assert.ok(!html.includes("المرجع الرسمي للدرس"), "No redundant introductory heading");
  assert.ok(!html.includes("مرّر للأسفل لمتابعة الدرس"), "No redundant scrolling instructions");
  assert.ok(html.includes('data-testid="official-book-toolbar"'), "Compact toolbar retains zoom and official link");
  let previousPosition = -1;
  for (const page of pages) {
    const position = html.indexOf(`data-book-page="${page.pageNumber}"`);
    assert.ok(position > previousPosition, "Book pages remain in source order");
    previousPosition = position;
  }
  assert.ok(!html.includes("الصفحة التالية"), "No single-page navigation remains");
  console.log(`PASS ${lesson.id}: ${pages.length} stacked full-size pages, lazy loading, no thumbnails`);
}
