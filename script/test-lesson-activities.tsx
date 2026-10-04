import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { getLessonActivities, getPendingActivities, readTriedActivities } from "../src/features/lesson-engine/lessonActivities";
import { ActivityGuide } from "../src/features/lesson-engine/ActivityGuide";
import { ActivityReminder } from "../src/features/lesson-engine/ActivityReminder";

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
  for (const tried of [false, true]) {
    const html = render(tried);
    assert.ok(!html.includes("جرّب بنفسك") && !html.includes("جرّبت النشاط"));
    assert.ok(!html.includes(first.instruction), "No repeated instruction strip");
    assert.ok(html.includes(`aria-label="نشاط: ${first.title}"`));
    assert.ok(html.includes(`data-activity-tried="${tried}"`));
    assert.ok(html.includes('<button type="button">تجربة</button>'), "Activity controls remain intact");
  }
  console.log(`PASS ${lesson.id}: ${activities.length} activities retain tracking without visible guide strips`);
}

const css = readFileSync(new URL("../src/index.css", import.meta.url), "utf8");
assert.ok(!css.includes("sharaf-activity-glow"), "Rejected attention animation is removed");
const reminder = (pendingCount: number) => renderToStaticMarkup(createElement(ActivityReminder, { pendingCount }));
assert.equal(reminder(0), "");
assert.equal(reminder(-1), "");
assert.ok(reminder(1).includes("يمكنك تجربتها أو بدء الاختبار مباشرة"));
assert.ok(!/dialog|<button|<svg/.test(reminder(6)), "Reminder is plain inline text, not an overlay or extra control");
const page = readFileSync(new URL("../src/features/lesson-engine/InteractiveLessonPage.tsx", import.meta.url), "utf8");
assert.ok(!/showActivityReminder|skipActivityReminder|restoreReminderFocus|remindedLessons/.test(page));
assert.match(page, /activeTabId === "learn" && !assessmentComplete && <ActivityReminder pendingCount=\{pendingActivities.length\}/);
assert.match(page, /data-testid="next-step-area"[\s\S]*<ActivityReminder[\s\S]*data-testid="button-next-step"/);
console.log("PASS quiet conditional reminder beside the exam button, no animation or navigation gate");
