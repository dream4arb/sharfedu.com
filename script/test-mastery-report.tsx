import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { MasteryReport } from "../src/features/lesson-engine/MasteryReport";
import { getReviewStepIndex } from "../src/features/lesson-engine/lessonNavigation";

for (const { lesson } of Object.values(lessonRegistry)) {
  const cases = [
    [100, 0, 0, 100, 0], // Screenshot regression: three zero-score skills.
    [84, 65, 85, 64, 100], // Review and reinforcement use the same mastery threshold.
    [100, 100, 100, 100, 0],
    [85, 100, 85, 100, 100],
    [0, 0, 0, 0, 0],
  ];
  for (const scores of cases) {
    const mastery = lesson.skills.map((skill, index) => ({
      skillId: skill.id, score: scores[index % scores.length],
      attempts: 1, correctAttempts: scores[index % scores.length] === 100 ? 1 : 0, hintsUsed: 0,
    }));
    const html = renderToStaticMarkup(createElement(MasteryReport, { lesson, mastery: [...mastery].reverse(), onReview: () => undefined }));
    const actual = [...html.matchAll(/data-review-skill="([^"]+)"/g)].map(match => match[1]);
    const expected = mastery.filter(item => item.score < 85).sort((a, b) => a.score - b.score).map(item => item.skillId);
    assert.deepEqual(actual, expected, "Every non-mastered skill appears once, in increasing score order");
    assert.equal((html.match(/<button /g) ?? []).length, expected.length, "Each skill has its own review button");
    assert.equal(html.includes('data-testid="mastery-review-plan"'), expected.length > 0);
    assert.equal(html.includes("أحسنت، أتقنت مهارات الدرس"), expected.length === 0);
    for (const id of expected) {
      const skill = lesson.skills.find(skill => skill.id === id)!;
      assert.ok(html.includes(`aria-label="راجع مهارة ${skill.title}"`));
      const stepIndex = getReviewStepIndex(lesson, id);
      assert.ok(stepIndex >= 0, "Every review recommendation links to an existing explanation");
      assert.ok(lesson.steps[stepIndex].skillIds?.includes(id), "The destination actually covers the requested skill");
    }
  }
  const missing = renderToStaticMarkup(createElement(MasteryReport, { lesson, mastery: [], onReview: () => undefined }));
  assert.equal((missing.match(/data-review-skill=/g) ?? []).length, lesson.skills.length, "Skills without evidence are not silently skipped");
  console.log(`PASS ${lesson.id}: all review skills, thresholds, order, destinations, and missing evidence`);
}
