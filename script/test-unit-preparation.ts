import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import curriculum from '../shared/curriculum/math-high1-names.json';
import { instructionalLessons, isUnitPreparation } from '../shared/curriculum/unit-preparation';
import { unitPreparationReviews } from '../src/components/lessons/unitPreparationReview';
const ids = curriculum.chapters.flatMap(chapter => [
  ...chapter.lessons.map(lesson => ({ id: `math-high1-${chapter.semester}-${lesson.number}` })),
  ...curriculum.supplemental.filter(entry => entry.chapter === chapter.id).map(entry => ({ id: `math-high1-${chapter.semester}-${entry.number}` })),
]);
assert.equal(ids.length, 73);
assert.equal(ids.filter(entry => isUnitPreparation(entry.id)).length, 8);
assert.equal(instructionalLessons(ids).length, 65);
assert.equal(instructionalLessons(ids.filter(entry => entry.id.includes('-s1-'))).length, 35);
assert.equal(instructionalLessons(ids.filter(entry => entry.id.includes('-s2-'))).length, 30);
assert.equal(isUnitPreparation('l-mm6el08l'), false);
assert.equal(isUnitPreparation('math-high1-s1-prep-5'), false, 'Wrong-semester identifier is not classified');
assert.equal(isUnitPreparation('unrelated-prep-5'), false);
assert.equal(isUnitPreparation(undefined), false);
assert.equal(isUnitPreparation('intro-1'), true, 'Preserved production identifier for chapter 1 preparation');
const productionIds = ids.map(entry => entry.id === 'math-high1-s1-prep-1' ? { id: 'intro-1' } : entry);
assert.equal(instructionalLessons(productionIds).length, 65);
// Historic preparation records remain intact, but contribute neither numerator nor denominator.
const historical = { 'math-high1-s2-prep-5': 100, 'l-mm6el08l': 75 };
const actual = instructionalLessons(Object.keys(historical).map(id => ({ id })));
assert.equal(actual.reduce((sum, item) => sum + historical[item.id as keyof typeof historical], 0), 75);
assert.equal(historical['math-high1-s2-prep-5'], 100);
for (let unit = 1; unit <= 8; unit++) {
  assert.ok(unitPreparationReviews[unit].reminders.length >= 2);
  assert.equal(unitPreparationReviews[unit].questions.length, 2);
  for (const question of unitPreparationReviews[unit].questions) {
    assert.ok(question.correct >= 0 && question.correct < question.options.length);
    assert.equal(new Set(question.options).size, question.options.length);
    assert.ok(question.explanation.length > 20);
  }
}
assert.equal(unitPreparationReviews[5].questions[0].options[unitPreparationReviews[5].questions[0].correct], `${180 - 65 - 45}°`);
assert.equal(unitPreparationReviews[6].questions[1].options[unitPreparationReviews[6].questions[1].correct], `${2 / 3 * 12}`);
const component = readFileSync('src/components/lessons/UnitPreparationPage.tsx', 'utf8');
for (const forbidden of ['useLessonProgress', 'fetch(', 'localStorage', 'sessionStorage', 'InteractiveLessonPage', 'LessonRatingWidget']) assert.ok(!component.includes(forbidden), forbidden);
assert.ok(component.includes('من إعداد منصة شارف'), 'Do not misattribute original warm-ups to the ministry');
assert.ok(component.includes('aria-pressed={selected === optionIndex}') && component.includes('role="status"'));
const sidebar = readFileSync('src/components/lessons/LessonSidebar.tsx', 'utf8');
const card = sidebar.slice(sidebar.indexOf('const preparationCard'), sidebar.indexOf('\n  return (', sidebar.indexOf('const preparationCard')));
assert.ok(!card.includes('getLessonProgress') && !card.includes('lesson-outline__number') && !card.includes('lesson-outline__percent'));
assert.ok(sidebar.indexOf('{preparations.map') < sidebar.indexOf('>دروس الوحدة'));
console.log('PASS: all eight preparations isolated, 65 instructional entries, historic records intact, ungraded review, no progress writes or four tabs.');
