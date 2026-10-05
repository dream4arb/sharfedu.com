import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { MasteryReport } from "../src/features/lesson-engine/MasteryReport";
import { getReviewStepIndex } from "../src/features/lesson-engine/lessonNavigation";
import { calculateAttemptMastery, calculateSkillMastery } from "../shared/lesson-engine/grade";
import { createLessonSession, restartLessonAssessment, useLessonSession, type StoredLessonSession } from "../src/features/lesson-engine/useLessonSession";

const page = readFileSync("src/features/lesson-engine/InteractiveLessonPage.tsx", "utf8");
assert.match(page, /const showReport = activeTabId === "assessment" && assessmentComplete;/,
  "Saved checked answers show results even when the current step is assessment and other tabs are incomplete");
assert.match(page, /tabId === "assessment" && assessmentComplete \? reportStepIndex/,
  "Returning from any tab restores the report without requiring whole-lesson completedAt");
assert.ok(!page.includes('button-show-results'), "No redundant show-results gate after returning");

for (const attemptNumber of [1, 2, 3, 10, 1000]) {
  for (const hintsUsed of [0, 1, 10]) {
    assert.equal(calculateAttemptMastery({ correct: true, attemptNumber, hintsUsed }), 100);
    assert.equal(calculateAttemptMastery({ correct: false, attemptNumber, hintsUsed }), 0);
  }
}
assert.equal(calculateSkillMastery([
  { questionId: "q1", correct: false }, { questionId: "q1", correct: false },
  { questionId: "q1", correct: true },
]), 100, "A correct retry earns full credit; earlier wrong attempts do not count against it");
assert.equal(calculateSkillMastery([
  { questionId: "q1", correct: true }, { questionId: "q1", correct: false },
]), 100, "Previously earned credit is not lost");
assert.equal(calculateSkillMastery([
  { questionId: "q1", correct: false }, { questionId: "q1", correct: true },
  { questionId: "q2", correct: false },
]), 50, "Uncorrected questions still need review, without duplicate attempt weighting");
assert.equal(calculateSkillMastery([]), 0);

// Loading existing local results must upgrade scores, not reset student progress.
const savedLesson = lessonRegistry["l-mm6el08l"].lesson;
const savedQuestion = savedLesson.questions.find(question => question.role === "assessment") ?? savedLesson.questions[0];
const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
  getItem: () => JSON.stringify({
    lessonVersion: savedLesson.version, sessionId: "preserved-session", stepIndex: 0,
    unlockedStepIndex: 0, visitedStepIds: [savedLesson.steps[0].id], startedAt: "2026-10-01T00:00:00Z",
    questions: { [savedQuestion.id]: { questionId: savedQuestion.id, skillId: savedQuestion.skillId,
      answer: savedQuestion.correctAnswer, correct: true, feedback: savedQuestion.correctFeedback,
      attempts: 3, hintsUsed: 0, score: 76 } },
  }),
} });
function SavedProgressProbe() {
  const { session, mastery } = useLessonSession(savedLesson);
  assert.equal(session.sessionId, "preserved-session");
  assert.equal(session.questions[savedQuestion.id].score, 100);
  assert.equal(session.questions[savedQuestion.id].attempts, 3);
  assert.deepEqual(session.questions[savedQuestion.id].answer, savedQuestion.correctAnswer);
  assert.equal(mastery.find(item => item.skillId === savedQuestion.skillId)!.score, 100);
  return null;
}
try {
  renderToStaticMarkup(createElement(SavedProgressProbe));
} finally {
  if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage);
  else Reflect.deleteProperty(globalThis, "localStorage");
}

for (const { lesson } of Object.values(lessonRegistry)) {
  const assessmentIndex = lesson.steps.findIndex(step => step.type === "assessment");
  const reportIndex = lesson.steps.findIndex(step => step.type === "report");
  const assessmentIds = lesson.steps[assessmentIndex].questionIds ?? lesson.assessmentQuestionIds;
  const prior: StoredLessonSession = {
    lessonVersion: lesson.version, sessionId: "lesson-session", assessmentRunId: "old-test-run",
    stepIndex: reportIndex, unlockedStepIndex: reportIndex, startedAt: "2026-10-01T00:00:00Z", completedAt: "2026-10-02T00:00:00Z",
    visitedStepIds: lesson.steps.map(step => step.id),
    questions: Object.fromEntries(assessmentIds.map(id => {
      const q = lesson.questions.find(question => question.id === id)!;
      return [id, { questionId: id, skillId: q.skillId, answer: q.correctAnswer, correct: true,
        feedback: q.correctFeedback, attempts: 3, hintsUsed: 2, score: 100 }];
    })),
  };
  const restarted = restartLessonAssessment(lesson, prior);
  const wholeLessonReset = createLessonSession(lesson);
  assert.deepEqual(wholeLessonReset.questions, {}, 'Whole lesson reset removes answers, attempts, hints, scores and feedback');
  assert.equal(wholeLessonReset.completedAt, undefined);
  assert.equal(wholeLessonReset.assessmentRunId, undefined);
  assert.notEqual(wholeLessonReset.sessionId, prior.sessionId, 'Fresh session remounts assessment drafts');
  assert.equal(lesson.steps[wholeLessonReset.stepIndex].type, 'official_book', 'Whole lesson reset returns to book');
  assert.deepEqual(wholeLessonReset.visitedStepIds, [lesson.steps[wholeLessonReset.stepIndex].id]);
  assert.equal(wholeLessonReset.unlockedStepIndex, wholeLessonReset.stepIndex);
  // Completed quiz from an earlier 75% session must survive reload/navigation,
  // even without a completedAt timestamp and with a non-report saved step.
  const returningSession = { ...prior, completedAt: undefined, stepIndex: 0 };
  const returningStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => JSON.stringify(returningSession) } });
  function ReturningResultProbe() {
    const { session } = useLessonSession(lesson);
    assert.equal(session.completedAt, undefined);
    assert.equal(session.stepIndex, 0);
    assert.ok(assessmentIds.every(id => session.questions[id]?.attempts > 0), "All checked answers persist and automatically qualify for the report");
    assert.deepEqual(session.questions, returningSession.questions, "Showing results does not mutate answers");
    return null;
  }
  try { renderToStaticMarkup(createElement(ReturningResultProbe)); }
  finally {
    if (returningStorage) Object.defineProperty(globalThis, "localStorage", returningStorage);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
  assert.deepEqual(restarted.questions, {}, "Restart removes all exam answers, feedback, attempts, hints and scores");
  assert.equal(restarted.completedAt, undefined);
  assert.equal(restarted.stepIndex, assessmentIndex);
  assert.equal(restarted.sessionId, prior.sessionId, "The lesson session is preserved");
  assert.equal(restarted.startedAt, prior.startedAt);
  assert.notEqual(restarted.assessmentRunId, prior.assessmentRunId, "A new run remounts even unanswered draft inputs");
  assert.notEqual(restartLessonAssessment(lesson, restarted).assessmentRunId, restarted.assessmentRunId);
  assert.deepEqual(restarted.visitedStepIds.filter(id => id !== lesson.steps[assessmentIndex].id),
    prior.visitedStepIds.filter(id => id !== lesson.steps[assessmentIndex].id && id !== lesson.steps[reportIndex].id),
    "Book, video and interactive explanation progress is preserved");
  assert.ok(assessmentIds.every(id => prior.questions[id].score === 100), "Restart does not mutate the prior session");
  for (const skill of lesson.skills) {
    assert.equal(calculateSkillMastery(Object.values(restarted.questions).filter(q => q.skillId === skill.id)), 0);
  }
  const storageBeforeRestartTest = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => JSON.stringify(restarted) } });
  function RestartedProgressProbe() {
    const { session, mastery } = useLessonSession(lesson);
    assert.deepEqual(session.questions, {});
    assert.equal(session.completedAt, undefined);
    assert.equal(session.assessmentRunId, restarted.assessmentRunId);
    assert.equal(session.stepIndex, assessmentIndex);
    assert.ok(mastery.every(skill => skill.score === 0 && skill.attempts === 0 && skill.hintsUsed === 0));
    return null;
  }
  try { renderToStaticMarkup(createElement(RestartedProgressProbe)); }
  finally {
    if (storageBeforeRestartTest) Object.defineProperty(globalThis, "localStorage", storageBeforeRestartTest);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }
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
