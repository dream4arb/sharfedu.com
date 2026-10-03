import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { getLessonActivities, getPendingActivities, readTriedActivities } from "../src/features/lesson-engine/lessonActivities";
import { ActivityGuide } from "../src/features/lesson-engine/ActivityGuide";

for (const { lesson } of Object.values(lessonRegistry)) {
  const activities = getLessonActivities(lesson);
  assert.ok(activities.length > 0);
  assert.equal(new Set(activities.map((activity) => activity.stepId)).size, activities.length);
  for (const step of lesson.steps.filter((step) => step.visualKind)) {
    assert.ok(activities.some((activity) => activity.stepId === step.id), `Guide covers ${step.visualKind}`);
  }
  assert.ok(activities.every((activity) => lesson.steps[activity.stepIndex].id === activity.stepId));
  assert.deepEqual(readTriedActivities(null, activities), []);
  for (const raw of ["bad json", "null", "[]", '{"triedStepIds":42}']) {
    assert.deepEqual(readTriedActivities(raw, activities), []);
  }
  const first = activities[0];
  const stored = JSON.stringify({ triedStepIds: [first.stepId, first.stepId, "unknown", 1, null] });
  assert.deepEqual(readTriedActivities(stored, activities), [first.stepId]);
  assert.equal(getPendingActivities(activities, [first.stepId]).length, activities.length - 1);
  assert.deepEqual(getPendingActivities(activities, activities.map((activity) => activity.stepId)), []);
  const render = (tried: boolean) => renderToStaticMarkup(createElement(ActivityGuide, {
    activity: first, tried, onTry: () => undefined,
    children: createElement("button", { type: "button" }, "تجربة"),
  }));
  assert.ok(render(false).includes("جرّب بنفسك"));
  assert.ok(render(true).includes("جرّبت النشاط"));
  assert.ok(render(false).includes(`aria-describedby="activity-instruction-${first.stepId}"`));
  assert.ok(render(false).includes(first.instruction));
  console.log(`PASS ${lesson.id}: ${activities.length} activity guides, validated independent progress, descriptive labels`);
}

const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
assert.match(css, /animation: sharaf-activity-glow 1\.15s ease-in-out 2;/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.sharaf-activity-glow \{ animation: none; \}/);
console.log("PASS cues have two finite highlights and respect reduced motion");
