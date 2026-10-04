import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { OfficialBookLesson } from "../src/features/lesson-engine/OfficialBookLesson";
import { lessonPresentation } from "../src/features/lesson-engine/lessonPresentation";
import { VisualLessonMap } from "../src/features/lesson-engine/VisualLessonLabs";

assert.equal(lessonPresentation.showTutor, false, "Tutor is temporarily hidden, not removed");
const lessonMapHtml = renderToStaticMarkup(createElement(VisualLessonMap));
assert.ok(!lessonMapHtml.includes("خريطة بصرية قبل الاختبار"), "Redundant map introduction is removed");
assert.match(lessonMapHtml, /id="lesson-map-title" class="[^"]*text-center/, "Lesson map heading is centered");
assert.equal((lessonMapHtml.match(/role="tab"/g) ?? []).length, 3, "All recap tracks remain available");

for (const { lesson } of Object.values(lessonRegistry)) {
  const html = renderToStaticMarkup(createElement(OfficialBookLesson, { source: lesson.curriculumSource, lessonTitle: lesson.title }));
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
  assert.ok(sourceDetailsPosition > firstPagePosition, "Source footer comes after the pages");
  assert.match(html, /id="official-book-source-heading" class="[^"]*text-center/, "Source footer heading is centered");
  assert.match(html.slice(sourceDetailsPosition), /<p class="[^"]*text-center[^"]*">/, "Book title in the footer is centered");
  assert.ok(!html.includes(lesson.curriculumSource.lessonExcerpt!.attribution), "Redundant source attribution is not displayed");
  assert.ok(!html.includes("<details") && !html.includes("<summary"), "Source and download links are always visible, without disclosure controls");
  assert.ok(html.includes('aria-labelledby="official-book-source-heading"'), "Source footer has a semantic heading");
  assert.ok(!html.includes("العرض بموافقة المصدر الرسمي"), "Removed approval wording does not appear");
  assert.ok(!html.includes("المرجع الرسمي للدرس"), "No redundant introductory heading");
  assert.ok(!html.includes("مرّر للأسفل لمتابعة الدرس"), "No redundant scrolling instructions");
  assert.ok(html.includes('data-testid="official-book-toolbar"'), "Compact toolbar retains zoom controls");
  assert.ok(html.includes('data-testid="book-fullscreen-toggle"') && html.includes("عرض بملء الشاشة"), "Reader offers an accessible fullscreen control");
  assert.ok(html.includes('aria-pressed="false"') && html.includes('data-fullscreen="false"'), "The reader starts in normal mode");
  assert.ok(!html.includes("كتاب الوزارة"), "Redundant official-book link is removed from the toolbar");
  assert.match(html, /id="official-book-heading" class="[^"]*text-center[^"]*md:col-start-2/, "Book heading is centered in the balanced toolbar");
  assert.ok(html.includes("الكتاب كاملًا من المصدر"), "The official full-book link remains in the source footer");
  assert.ok(html.includes(`صفحة درس ${lesson.title}`), "Book toolbar names the current lesson");
  let previousPosition = -1;
  for (const page of pages) {
    const position = html.indexOf(`data-book-page="${page.pageNumber}"`);
    assert.ok(position > previousPosition, "Book pages remain in source order");
    previousPosition = position;
  }
  assert.ok(!html.includes("الصفحة التالية"), "No single-page navigation remains");
  console.log(`PASS ${lesson.id}: ${pages.length} stacked full-size pages, lazy loading, no thumbnails`);
}
const bookSource = readFileSync(new URL("../src/features/lesson-engine/OfficialBookLesson.tsx", import.meta.url), "utf8");
assert.ok(bookSource.includes("[100, 125, 150, 200, 250, 300]"), "Small screens can enlarge textbook text to 300 percent");
assert.ok(bookSource.includes("requestFullscreen()") && bookSource.includes("document.exitFullscreen()"), "Native fullscreen has enter and exit paths");
assert.ok(bookSource.includes('event.key === "Escape"') && bookSource.includes('event.key !== "Tab"'), "Fallback reader supports keyboard exit and contained focus");
assert.ok(bookSource.includes('document.body.style.overflow = previousOverflow'), "Leaving reading mode restores page scrolling");
assert.ok(bookSource.includes('"sticky top-0 z-10 "'), "Zoom and exit remain reachable while reading fullscreen pages");
