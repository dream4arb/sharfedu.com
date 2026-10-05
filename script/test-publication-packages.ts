import assert from "node:assert/strict";
import { validatePublishableLesson, createLessonTemplate, CONTENT_PROFILES } from "../shared/lesson-engine/publication-package";
import { polygonAnglesLesson } from "../shared/lesson-engine/polygon-angles";
import { initialPublicationCatalog, hasPublishedContent } from "../shared/seo/publication";
import { resolveSeoPage, sitemapPaths } from "../server/seo/model";
import type { HierarchyStage } from "../server/data/cms-hierarchy";

assert.deepEqual(validatePublishableLesson(polygonAnglesLesson).errors, []);
for (const contentProfile of Object.keys(CONTENT_PROFILES) as Array<keyof typeof CONTENT_PROFILES>) {
  const template = createLessonTemplate({ id: "new-lesson", title: "عنوان درس جديد", stage: "الثانوية", grade: "الأول", subject: CONTENT_PROFILES[contentProfile].label, unit: "وحدة" }, contentProfile);
  assert.ok(validatePublishableLesson(template).errors.length, "An empty template must never publish");
  assert.equal(template.contentProfile, contentProfile);
  assert.equal("formula" in template.introduction, false, "Math formulas are optional");
  assert.deepEqual(template.introduction.examples, [], "No polygon diagrams are imposed on other subjects");
}
const valid = structuredClone(polygonAnglesLesson);
valid.id = "new-lesson";
const catalog = { ...initialPublicationCatalog, [valid.id]: { lesson: valid, location: { stage: "high", grade: "2", subject: "math" } } };
const hierarchy: HierarchyStage[] = [{ slug: "high", name: "الثانوية", grades: [{ id: "2", name: "ثاني ثانوي", subjects: [{ slug: "math", name: "الرياضيات", semesters: [{ id: "s1", name: "الأول", chapters: [{ id: "ch1", name: "وحدة", lessons: [{ id: valid.id, title: valid.title }] }] }] }] }] }];
const path = "/lesson/secondary/math/new-lesson";
assert.ok(resolveSeoPage(path, hierarchy, catalog).robots.startsWith("index"));
assert.ok(sitemapPaths(hierarchy, catalog).includes(path), "A newly approved ID needs no code whitelist");
assert.ok(resolveSeoPage(path, hierarchy, {}).robots.startsWith("noindex"));
assert.ok(!sitemapPaths(hierarchy, {}).includes(path), "Withdrawn and draft-only content is excluded");
assert.equal(hasPublishedContent(valid.id, "high", "1", "math", catalog), false, "Publication cannot leak to another grade");
for (const mutation of [
  (l: typeof valid) => { l.questions[0].correctAnswer = "not-an-option"; },
  (l: typeof valid) => { l.videos![0].url = "javascript:alert(1)"; },
  (l: typeof valid) => { l.curriculumSource.editionStatus = "pending"; },
  (l: typeof valid) => { l.steps = l.steps.filter(s => s.type !== "video"); },
  (l: typeof valid) => { l.assessmentQuestionIds.push("missing-question"); },
  (l: typeof valid) => { l.id = "math-high1-s2-prep-5"; },
]) {
  const invalid = structuredClone(valid); mutation(invalid);
  assert.ok(validatePublishableLesson(invalid).errors.length);
}
console.log("PASS publication: flexible subject templates, reviewed completeness, answer keys, safe URLs, scoped location, automatic SEO and sitemap inclusion/exclusion.");
