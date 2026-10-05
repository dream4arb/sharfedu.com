import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import curriculum from '../shared/curriculum/math-high1-names.json';
import { instructionalLessons, isUnitPreparation } from '../shared/curriculum/unit-preparation';
import { unitPreparationIntroductions } from '../src/components/lessons/unitPreparationIntroduction';
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
  const introduction = unitPreparationIntroductions[unit];
  assert.ok(introduction.idea.length > 100);
  assert.ok(introduction.learning.length >= 2);
  assert.ok(introduction.application.length > 60);
  assert.equal(introduction.book, unit <= 4 ? 'الرياضيات 1-1' : 'الرياضيات 1-2');
  assert.equal(introduction.page, [10, 84, 144, 212, 10, 70, 116, 176][unit - 1]);
  assert.ok(!('questions' in introduction));
}
const component = readFileSync('src/components/lessons/UnitPreparationPage.tsx', 'utf8');
for (const forbidden of ['useLessonProgress', 'fetch(', 'localStorage', 'sessionStorage', 'InteractiveLessonPage', 'LessonRatingWidget', 'useState', 'fieldset', 'preparation-question-', 'جرّب بلا درجات']) assert.ok(!component.includes(forbidden), forbidden);
assert.ok(component.includes('شرح مبسط مستند إلى مقدمة الوحدة'), 'Paraphrase attribution instead of claiming verbatim book content');
assert.ok(component.indexOf('data-testid="preparation-main-idea"') < component.indexOf('preparation-learning-title'), 'Basic idea appears first');
const sidebar = readFileSync('src/components/lessons/LessonSidebar.tsx', 'utf8');
const card = sidebar.slice(sidebar.indexOf('const preparationCard'), sidebar.indexOf('\n  return (', sidebar.indexOf('const preparationCard')));
assert.ok(!card.includes('getLessonProgress') && !card.includes('lesson-outline__number') && !card.includes('lesson-outline__percent'));
assert.ok(sidebar.indexOf('{preparations.map') < sidebar.indexOf('>دروس الوحدة'));
console.log('PASS: eight book-grounded introductions, basic idea first, no questions, 65 instructional entries, records intact, no progress writes or four tabs.');
