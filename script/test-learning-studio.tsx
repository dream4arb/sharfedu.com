import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { buildLessonTabs } from "../src/features/lesson-engine/lessonNavigation";
import { LearningSection } from "../src/features/lesson-engine/LearningStudio";
import { PolygonLab } from "../src/features/lesson-engine/PolygonLab";
import { FormulaDiscoveryLab, MissingAngleLab, ExteriorTurnLab } from "../src/features/lesson-engine/VisualLessonLabs";

for (const { lesson } of Object.values(lessonRegistry)) {
  const tab = buildLessonTabs(lesson).find(tab => tab.id === "learn")!;
  for (const [number, index] of tab.stepIndexes.entries()) {
    const step = lesson.steps[index];
    const html = renderToStaticMarkup(createElement(LearningSection, {
      step, index, sectionNumber: number + 1, onFocus: () => undefined,
      children: createElement("p", {}, "محتوى القسم"),
    }));
    assert.ok(html.includes(`data-testid="learning-section-${step.id}"`));
    assert.ok(html.includes(`aria-labelledby="learning-title-${step.id}"`));
    assert.ok(html.includes(`data-learning-step-index="${index}"`));
    assert.ok(html.includes(step.title), "Original section titles remain intact");
    assert.ok(!/hidden|<details|<summary/.test(html.replace('aria-hidden="true"', "")), "Every section stays open");
    assert.notEqual(step.type, "assessment", "No exam in explanation tab");
  }
  console.log(`PASS ${lesson.id}: open studio sections, original labels and navigation IDs`);
}
for (const Lab of [PolygonLab, FormulaDiscoveryLab, MissingAngleLab, ExteriorTurnLab]) {
  const html = renderToStaticMarkup(createElement(Lab));
  assert.ok(html.includes("studio-workspace"));
  assert.ok(html.includes("data-activity-primary"));
  assert.ok(html.includes('role="img"'));
  assert.ok(!html.includes("disabled="));
}
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.id === "teacher-summary")?.tutorMessage,
  undefined, "The redundant pre-exam tutor banner is removed from the content, not merely hidden");
const page = readFileSync(new URL("../src/features/lesson-engine/InteractiveLessonPage.tsx", import.meta.url), "utf8");
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.type === "video")?.tutorMessage, undefined,
  "Redundant video tutor banner is removed");
assert.equal(lessonRegistry["l-mm6el08l"].lesson.steps.find(step => step.type === "video")?.title,
  lessonRegistry["l-mm6el08l"].lesson.title, "The video tab heading uses the lesson name");
assert.ok(page.indexOf('data-testid="lesson-video-player"') < page.indexOf('data-testid="lesson-video-options"'),
  "The video player comes before the alternative explanation cards in DOM and keyboard order");
assert.ok(page.includes('tab.id === "learn" ? "lesson-studio" : ""'), "Theme is scoped to learning tab");
const css = readFileSync(new URL("../src/features/lesson-engine/learningStudio.css", import.meta.url), "utf8");
assert.ok(css.includes("prefers-reduced-motion"));
assert.ok(css.includes("focus-visible"));
assert.ok(!css.includes("sharaf-activity-glow"));
console.log("PASS interactive controls, SVG semantics, scoped styling, reduced motion and keyboard focus");
