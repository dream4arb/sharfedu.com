import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterLessonOutline, findLessonLocation, getSemesterLessonNeighbors, normalizeLessonSearch } from '../src/components/lessons/lessonSidebarModel';
import type { LessonData, SemesterData } from '../src/data/lessons';

const lesson = (id: string, title: string): LessonData => ({ id, title, duration: '', videoUrl: '' });
const semesters: SemesterData[] = [
  { id: 'first', name: 'الفصل الدراسي الأول', chapters: [{ id: 'logic', name: 'التبرير والبرهان', number: 1, lessons: [
    lesson('math-high1-s1-prep-1', 'التهيئة للفصل 1'), lesson('logic-lesson', 'المنطق'), lesson('proof', 'أثبت الفكرة'),
  ] }] },
  { id: 'second', name: 'الفصل الدراسي الثاني', chapters: [{ id: 'polygons', name: 'الأشكال الرباعية', number: 5, lessons: [
    lesson('math-high1-s2-prep-5', 'التهيئة للفصل 5'), lesson('polygon', 'زوايا المضلع'), lesson('parallelogram', 'متوازي الأضلاع'),
  ] }] },
];
const getTitle = (item: LessonData) => item.title;
assert.equal(normalizeLessonSearch(' أَثْبِـت  الفكرة '), 'اثبت الفكرة');
assert.equal(findLessonLocation(semesters, 'polygon')?.semester.id, 'second');
assert.equal(findLessonLocation(semesters, 'logic-lesson')?.chapter.id, 'logic');
assert.equal(findLessonLocation(semesters, 'missing'), undefined);
for (const semester of semesters) {
  const entries = semester.chapters.flatMap(chapter => chapter.lessons);
  for (const [index, entry] of entries.entries()) {
    const neighbors = getSemesterLessonNeighbors(semesters, entry.id);
    assert.equal(neighbors.prevLesson?.id ?? null, entries[index - 1]?.id ?? null);
    assert.equal(neighbors.nextLesson?.id ?? null, entries[index + 1]?.id ?? null);
  }
}
assert.deepEqual(getSemesterLessonNeighbors(semesters, undefined), { prevLesson: null, nextLesson: null });
assert.deepEqual(getSemesterLessonNeighbors(semesters, 'missing'), { prevLesson: null, nextLesson: null });
assert.deepEqual(getSemesterLessonNeighbors([], 'missing'), { prevLesson: null, nextLesson: null });
const acrossChapters: SemesterData[] = [{ ...semesters[0], chapters: [
  { ...semesters[0].chapters[0], lessons: [lesson('a', 'أ')] },
  { ...semesters[0].chapters[0], id: 'empty', lessons: [] },
  { ...semesters[0].chapters[0], id: 'b', lessons: [lesson('b', 'ب')] },
] }];
assert.equal(getSemesterLessonNeighbors(acrossChapters, 'a').nextLesson?.id, 'b', 'Chapter boundaries remain navigable inside a semester');
assert.equal(getSemesterLessonNeighbors(acrossChapters, 'b').prevLesson?.id, 'a');
assert.equal(getSemesterLessonNeighbors(semesters, 'math-high1-s2-prep-5').prevLesson, null, 'Second-semester preparation cannot link back to first semester');
assert.equal(getSemesterLessonNeighbors(semesters, 'proof').nextLesson, null, 'First semester cannot link forward to second semester');
assert.deepEqual(filterLessonOutline(semesters, '', 'second', getTitle).map(item => item.semester.id), ['second']);
const acrossSemesters = filterLessonOutline(semesters, 'المنطق', 'second', getTitle);
assert.equal(acrossSemesters[0].semester.id, 'first');
assert.equal(acrossSemesters[0].chapters[0].lessons[0].lesson.id, 'logic-lesson');
assert.equal(acrossSemesters[0].chapters[0].lessons[0].lessonIndex, 0, 'First actual lesson starts at 1');
assert.equal(filterLessonOutline(semesters, 'اثبت', 'second', getTitle)[0].chapters[0].lessons[0].lesson.id, 'proof');
assert.equal(filterLessonOutline(semesters, 'الأشكال الرباعية', 'first', getTitle)[0].chapters[0].lessons.length, 2);
assert.equal(filterLessonOutline(semesters, 'التهيئة', 'first', getTitle).length, 2);
assert.equal(filterLessonOutline(semesters, 'التهيئة للوحدة', 'first', getTitle)[0].chapters[0].preparations.length, 1);
assert.equal(filterLessonOutline(semesters, 'التهيئة', 'first', getTitle)[0].chapters[0].lessons.length, 0);
assert.equal(findLessonLocation(semesters, 'math-high1-s2-prep-5')?.chapter.id, 'polygons');
assert.equal(filterLessonOutline(semesters, 'not found', 'first', getTitle).length, 0);
assert.equal(filterLessonOutline(semesters, 'اسم معدل', 'first', item => item.id === 'polygon' ? 'اسم معدل' : item.title)[0].chapters[0].lessons[0].lesson.id, 'polygon');
assert.equal(semesters[0].chapters[0].lessons.length, 3, 'Filtering does not mutate curriculum');
const component = readFileSync('src/components/lessons/LessonSidebar.tsx', 'utf8');
assert.ok(component.includes('aria-current={active ? "page"'));
assert.ok(!component.includes('{active && <small>الدرس الحالي</small>}'), 'No redundant current-lesson caption inside lesson cards');
assert.ok(component.includes('aria-expanded={open} aria-controls={panelId}'));
assert.ok(component.includes('aria-label="ابحث عن درس"'));
assert.ok(component.includes('key={chapter.id} data-open={open}'), 'One shared frame per chapter');
assert.ok(component.includes('const currentChapter = activeLocation?.semester.id === semester.id && activeLocation?.chapter.id === chapter.id;'), 'Current unit follows the lesson location, including semester scope, never accordion state');
assert.ok(component.includes('data-current={currentChapter || undefined}'), 'Current unit remains marked when its lessons are collapsed');
assert.ok(component.includes('id={panelId} hidden={!open} className="lesson-outline__chapter-body"'), 'Lessons inside the chapter panel');
assert.ok(component.includes('className="lesson-outline__lesson-label">دروس الوحدة'), 'Clear visual hierarchy label');
assert.ok(component.includes('<small>الوحدة {chapter.number ?? chapterIndex + 1}</small>'), 'Unit number retained without lesson count');
assert.ok(!component.includes('{chapter.lessons.length} دروس'), 'No lesson counts in unit headings');
const sidebarCss = readFileSync('src/components/lessons/lessonSidebar.css', 'utf8');
assert.match(sidebarCss, /\.lesson-outline__chapter \{[^}]*border: 1px[^}]*overflow: hidden/, 'The outer frame contains both heading and lesson panel');
assert.match(sidebarCss, /\.lesson-outline__chapter\[data-open=true\] \.lesson-outline__chapter-heading/, 'Unit heading differs from nested lesson cards');
assert.match(sidebarCss, /\.lesson-outline__chapter\[data-current=true\] \{[^}]*border-color/, 'Current unit retains its border independently of open state');
assert.match(sidebarCss, /\.lesson-outline__chapter\[data-current=true\] \.lesson-outline__chapter-heading \{[^}]*background: var\(--outline-soft\)[^}]*box-shadow/, 'Current unit retains shading and an accent edge after collapse');
assert.ok(component.includes('if (isMobile) setOpenMobile(false)'));
assert.ok(component.includes('scroller.current.scrollBy'));
assert.ok(!component.includes('attachmentsOpen'), 'Resources have no collapsed state');
assert.ok(!component.includes('<strong>المرفقات</strong>'), 'No separate attachments menu heading');
assert.ok(component.replace(/\r\n/g, '\n').includes('</nav>\n          {semesters.length > 0 && !isSearching && <div className="lesson-outline__attachments"'), 'Resources follow the unit navigation at the same level');
assert.ok(component.includes('<hr className="lesson-outline__resources-divider" />'), 'Only a divider separates units and resource cards');
for (const kind of ['book', 'summary', 'worksheets', 'test']) assert.ok(component.includes(`kind: "${kind}" as const`), `Retain ${kind} resource`);
assert.ok(component.includes('getAttachmentUrl(kind, selectedSemesterIndex)'), 'Resource destination still follows selected semester');
assert.ok(component.includes('onOpenAttachment(getAttachmentUrl(kind, selectedSemesterIndex), label); closeOnMobile();'), 'Opening resources retains viewer and mobile close behavior');
for (const control of ['AdminLessonActions', 'AdminAddLessonButton', 'AdminChapterActions', 'AdminAddChapterButton']) assert.ok(component.includes('<' + control));
const page = readFileSync('src/pages/Lesson.tsx', 'utf8');
assert.ok(page.includes('getSemesterLessonNeighbors(semesters, lessonId)'), 'Live navigation uses semester-scoped data');
assert.ok(!page.includes('lessons[currentLessonIndex'), 'No globally flattened cross-semester navigation');
for (const destination of ['"/attachments/book-math-high1-s2.pdf"', 'currentLesson?.bookPdfUrl', 'currentLesson?.summaryPdfUrl', 'currentLesson?.worksheetsPdfUrl', 'currentLesson?.testQuestionsPdfUrl']) assert.ok(page.includes(destination));
assert.ok(page.includes('getLessonProgress={(id) => getLessonProgress(subjectId, id)}'));
console.log('PASS: Arabic search, separated preparations, instructional numbering, location, accessibility, mobile close, progress and attachment/admin wiring.');
