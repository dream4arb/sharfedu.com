import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { COMPLETION_TABS, fourTabApiFields, mergeFourTabProgress, readFourTabCompletion, readFourTabProgress, resetLessonCompletion, shouldCompleteContentTabOnAdvance, tabCompletionPercent, updateTabCompletion, type FourTabCompletion } from '../shared/lesson-engine/tab-progress';
import { isBookReadingComplete } from '../src/features/lesson-engine/bookReadingCompletion';

let record: FourTabCompletion | undefined;
assert.equal(tabCompletionPercent(undefined), 0);
for (const [index, tab] of COMPLETION_TABS.entries()) {
  record = updateTabCompletion(record, tab, true, index + 1);
  assert.equal(tabCompletionPercent(record.completedTabs), (index + 1) * 25);
  assert.equal(updateTabCompletion(record, tab, true, 99), record, 'Repeated completion is idempotent');
  const fields = fourTabApiFields(record);
  assert.equal(Number(fields.totalProgress), (index + 1) * 25);
  assert.deepEqual(readFourTabCompletion(fields.questionsProgress), record, 'API text column round-trips all four flags');
}
assert.equal(tabCompletionPercent(['assessment', 'book', 'video', 'learn', 'book']), 100);
const reset = updateTabCompletion(record, 'assessment', false, 20);
assert.equal(tabCompletionPercent(reset.completedTabs), 75, 'Restart keeps the other three tabs');
assert.deepEqual(reset.completedTabs, ['book', 'video', 'learn']);
const complete = updateTabCompletion(reset, 'assessment', true, 30);
assert.equal(tabCompletionPercent(complete.completedTabs), 100);
assert.equal(fourTabApiFields(reset).questionsScore, 0);
assert.equal(fourTabApiFields(complete).questionsScore, 100);
assert.equal(readFourTabCompletion('0'), null, 'Legacy quiz score is not four-tab completion');
assert.equal(readFourTabCompletion('{broken'), null);
assert.equal(readFourTabCompletion({ ...complete, completedTabs: ['fake'] }), null);
assert.equal(readFourTabCompletion({ ...complete, updatedAt: NaN }), null);
const before = { math: { polygon: record!, unrelated: reset } };
const after = { math: { polygon: reset } };
assert.deepEqual(mergeFourTabProgress(before, after).math.polygon, reset, 'Newer restart wins, not union');
assert.deepEqual(mergeFourTabProgress(after, before).math.polygon, reset, 'Older server completion cannot restore the reset tab');
assert.deepEqual(mergeFourTabProgress(before, after).math.unrelated, reset);
assert.deepEqual(readFourTabProgress(JSON.stringify(before)), before);
const fullResetBefore = { ...before, science: { other: complete } };
const fullReset = resetLessonCompletion(fullResetBefore, 'math', 'polygon', 0);
assert.equal(tabCompletionPercent(fullReset.math.polygon.completedTabs), 0, 'Whole-lesson reset clears all four tabs atomically');
assert.ok(fullReset.math.polygon.updatedAt > record!.updatedAt, 'Reset snapshot is newer even when clock moves backwards');
assert.equal(fullReset.math.unrelated, fullResetBefore.math.unrelated, 'Other lesson remains intact');
assert.equal(fullReset.science, fullResetBefore.science, 'Other subject remains intact');
assert.equal(tabCompletionPercent(fullResetBefore.math.polygon.completedTabs), 100, 'Reset does not mutate previous data');
assert.deepEqual(mergeFourTabProgress(fullReset, fullResetBefore), fullReset, 'Older server completion cannot undo full reset');
assert.deepEqual(readFourTabProgress(JSON.stringify(fullReset)), fullReset, 'Zero snapshot survives reload');
assert.equal(fourTabApiFields(fullReset.math.polygon).totalProgress, '0');
assert.equal(fourTabApiFields(fullReset.math.polygon).questionsScore, 0);
assert.equal(tabCompletionPercent(resetLessonCompletion({}, 'math', 'new', 1).math.new.completedTabs), 0);
const page = readFileSync('src/features/lesson-engine/InteractiveLessonPage.tsx', 'utf8');
assert.ok(page.includes('assessmentComplete && progressReady') && page.includes('"assessment", true'), 'All checked answers complete assessment regardless of grade');
assert.ok(page.includes('"assessment", false'), 'Retest clears assessment completion');
assert.ok(page.includes('resetSession();') && page.includes('resetActivities();') && page.includes('resetLessonProgress(progressSubjectSlug, lesson.id);'), 'Whole reset clears quiz, activity and completion state for current lesson only');
assert.ok(page.includes('data-testid="assessment-reset-actions"') && page.includes('data-testid="button-reset-lesson-progress"') && page.includes('data-testid="confirm-reset-lesson-progress"') && page.includes('data-testid="cancel-reset-lesson-progress"'), 'Adjacent reset action requires confirmation and supports cancel');
for (const current of COMPLETION_TABS) for (const target of COMPLETION_TABS) {
  assert.equal(shouldCompleteContentTabOnAdvance(current, target), current !== 'assessment' && COMPLETION_TABS.indexOf(target) > COMPLETION_TABS.indexOf(current));
}
const reportedCase = updateTabCompletion(undefined, 'video', true, 1);
const withLearning = updateTabCompletion(reportedCase, 'learn', true, 2);
const withAssessment = updateTabCompletion(withLearning, 'assessment', true, 3);
assert.equal(tabCompletionPercent(withAssessment.completedTabs), 75);
assert.equal(tabCompletionPercent(updateTabCompletion(withAssessment, 'book', true, 4).completedTabs), 100, 'Missing book completion repairs 75% without resetting answers or other tabs');
assert.ok(page.includes('shouldCompleteContentTabOnAdvance(activeTabRef.current, tabId)'), 'Header and footer share forward-navigation completion');
assert.ok(page.includes('onCompleted={() => setLessonTabCompleted(progressSubjectSlug, lesson.id, "book", true)}'), 'Reading completion records book tab');
assert.equal(isBookReadingComplete([12,13,14], new Set([12,13,14]), true), true);
assert.equal(isBookReadingComplete([12,13,14], new Set([12,14]), true), false, 'Jump to end does not complete skipped pages');
assert.equal(isBookReadingComplete([12,13,14], new Set([12,13,14]), false), false, 'All pages seen but not finished');
assert.equal(isBookReadingComplete([], new Set(), true), false, 'Empty reader cannot auto-complete');
const reader = readFileSync('src/features/lesson-engine/OfficialBookLesson.tsx', 'utf8');
assert.ok(reader.includes('isBookReadingComplete(requiredPages, viewedPages.current, reachedEnd)'));
assert.ok(reader.includes('if (!completed &&') && reader.includes('if (cancelled) return;'), 'Observer reports once and ignores queued callbacks after leaving the reader');
assert.ok(page.includes('data-testid="button-complete-lesson-tab"'));
const provider = readFileSync('src/hooks/use-four-tab-progress.ts', 'utf8');
assert.ok(provider.includes('${userId ?? "guest"}'), 'Guest and student records are isolated');
assert.ok(provider.includes('hydratedKey !== storageKey'), 'No server write before successful hydration');
assert.ok(provider.includes('writeQueue.current.catch'), 'Writes are serialized against stale completion overwrites');
assert.ok(readFileSync('src/pages/Lesson.tsx', 'utf8').includes('if (!legacyContentEnabled || isPublishedLesson(lessonId)'), 'Legacy writer cannot overwrite the new model');
for (const buttonId of ['button-restart-assessment', 'button-reset-lesson-progress']) {
  const classes = page.match(new RegExp(`className="([^"]*)" data-testid="${buttonId}"`))?.[1] || '';
  for (const size of ['h-12', 'w-[8.6rem]', 'sm:w-[9.6rem]', 'justify-center', 'shrink-0']) assert.ok(classes.split(' ').includes(size), `${buttonId}: ${size}`);
}
console.log('PASS four-tab progress: 0/25/50/75/100, idempotence, full-score-independent completion, restart, persistence, scoped merge, equal reset-button sizes and integration guards.');
