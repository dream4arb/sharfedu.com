import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterLessonOutline, findLessonLocation, normalizeLessonSearch } from '../src/components/lessons/lessonSidebarModel';
import type { LessonData, SemesterData } from '../src/data/lessons';

const lesson = (id: string, title: string): LessonData => ({ id, title, duration: '', videoUrl: '' });
const semesters: SemesterData[] = [
  { id: 'first', name: 'الفصل الدراسي الأول', chapters: [{ id: 'logic', name: 'التبرير والبرهان', number: 1, lessons: [
    lesson('intro', 'التهيئة للفصل 1'), lesson('logic-lesson', 'المنطق'), lesson('proof', 'أثبت الفكرة'),
  ] }] },
  { id: 'second', name: 'الفصل الدراسي الثاني', chapters: [{ id: 'polygons', name: 'الأشكال الرباعية', number: 5, lessons: [
    lesson('prep', 'التهيئة للفصل 5'), lesson('polygon', 'زوايا المضلع'), lesson('parallelogram', 'متوازي الأضلاع'),
  ] }] },
];
const getTitle = (item: LessonData) => item.title;
assert.equal(normalizeLessonSearch(' أَثْبِـت  الفكرة '), 'اثبت الفكرة');
assert.equal(findLessonLocation(semesters, 'polygon')?.semester.id, 'second');
assert.equal(findLessonLocation(semesters, 'logic-lesson')?.chapter.id, 'logic');
assert.equal(findLessonLocation(semesters, 'missing'), undefined);
assert.deepEqual(filterLessonOutline(semesters, '', 'second', getTitle).map(item => item.semester.id), ['second']);
const acrossSemesters = filterLessonOutline(semesters, 'المنطق', 'second', getTitle);
assert.equal(acrossSemesters[0].semester.id, 'first');
assert.equal(acrossSemesters[0].chapters[0].lessons[0].lesson.id, 'logic-lesson');
assert.equal(acrossSemesters[0].chapters[0].lessons[0].lessonIndex, 1, 'Original numbering retained');
assert.equal(filterLessonOutline(semesters, 'اثبت', 'second', getTitle)[0].chapters[0].lessons[0].lesson.id, 'proof');
assert.equal(filterLessonOutline(semesters, 'الأشكال الرباعية', 'first', getTitle)[0].chapters[0].lessons.length, 3);
assert.equal(filterLessonOutline(semesters, 'not found', 'first', getTitle).length, 0);
assert.equal(filterLessonOutline(semesters, 'اسم معدل', 'first', item => item.id === 'polygon' ? 'اسم معدل' : item.title)[0].chapters[0].lessons[0].lesson.id, 'polygon');
assert.equal(semesters[0].chapters[0].lessons.length, 3, 'Filtering does not mutate curriculum');
const component = readFileSync('src/components/lessons/LessonSidebar.tsx', 'utf8');
assert.ok(component.includes('aria-current={active ? "page"'));
assert.ok(component.includes('aria-expanded={open} aria-controls={panelId}'));
assert.ok(component.includes('aria-label="ابحث عن درس"'));
assert.ok(component.includes('key={chapter.id} data-open={open}'), 'One shared frame per chapter');
assert.ok(component.includes('id={panelId} hidden={!open} className="lesson-outline__chapter-body"'), 'Lessons inside the chapter panel');
assert.ok(component.includes('className="lesson-outline__lesson-label">دروس الوحدة'), 'Clear visual hierarchy label');
const sidebarCss = readFileSync('src/components/lessons/lessonSidebar.css', 'utf8');
assert.match(sidebarCss, /\.lesson-outline__chapter \{[^}]*border: 1px[^}]*overflow: hidden/, 'The outer frame contains both heading and lesson panel');
assert.match(sidebarCss, /\.lesson-outline__chapter\[data-open=true\] \.lesson-outline__chapter-heading/, 'Unit heading differs from nested lesson cards');
assert.ok(component.includes('if (isMobile) setOpenMobile(false)'));
assert.ok(component.includes('scroller.current.scrollBy'));
for (const control of ['AdminLessonActions', 'AdminAddLessonButton', 'AdminChapterActions', 'AdminAddChapterButton']) assert.ok(component.includes('<' + control));
const page = readFileSync('src/pages/Lesson.tsx', 'utf8');
for (const destination of ['"/attachments/book-math-high1-s2.pdf"', 'currentLesson?.bookPdfUrl', 'currentLesson?.summaryPdfUrl', 'currentLesson?.worksheetsPdfUrl', 'currentLesson?.testQuestionsPdfUrl']) assert.ok(page.includes(destination));
assert.ok(page.includes('getLessonProgress={(id) => getLessonProgress(subjectId, id)}'));
console.log('PASS: Arabic search across semesters, original numbering, automatic location, accessible navigation, mobile close, existing progress and attachment/admin wiring.');
