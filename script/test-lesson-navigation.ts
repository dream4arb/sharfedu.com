import assert from "node:assert/strict";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { buildLessonTabs, getInitialLessonStepIndex, getLessonTabId, getReviewStepIndex } from "../src/features/lesson-engine/lessonNavigation";

for (const { lesson } of Object.values(lessonRegistry)) {
  const tabs = buildLessonTabs(lesson);
  assert.deepEqual(tabs.map((tab) => tab.id), ["book", "video", "learn", "assessment"]);
  assert.equal(tabs[3].title, "الاختبار والنتيجة");
  assert.ok(tabs.every((tab) => tab.stepIndexes.length > 0));
  const indexes = tabs.flatMap((tab) => tab.stepIndexes);
  assert.deepEqual([...indexes].sort((a, b) => a - b), lesson.steps.map((_, index) => index));
  assert.equal(new Set(indexes).size, lesson.steps.length, "Each existing step appears exactly once");
  assert.equal(getLessonTabId(lesson.steps[getInitialLessonStepIndex(lesson)]), "book");
  assert.deepEqual(tabs[3].stepIndexes.map((index) => lesson.steps[index].type), ["assessment", "report"]);
  for (const skill of lesson.skills) {
    const reviewStep = lesson.steps[getReviewStepIndex(lesson, skill.id)];
    assert.equal(getLessonTabId(reviewStep), "learn", "Review returns to learning, not the exam");
    assert.ok(reviewStep.skillIds?.includes(skill.id), `Review section exists for ${skill.id}`);
  }
  assert.equal(getLessonTabId(lesson.steps[getReviewStepIndex(lesson, "unknown-skill")]), "learn");
  console.log(`PASS ${lesson.id}: four tabs, all content retained, every skill review mapped`);
}
