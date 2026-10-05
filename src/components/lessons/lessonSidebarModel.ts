import type { LessonData, SemesterData } from "../../data/lessons";

export function normalizeLessonSearch(value: string): string {
  return value.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/\s+/g, " ").trim().toLowerCase();
}

export function findLessonLocation(semesters: SemesterData[], lessonId: string | undefined) {
  for (const semester of semesters) {
    for (const chapter of semester.chapters ?? []) {
      if (chapter.lessons.some(lesson => lesson.id === lessonId)) return { semester, chapter };
    }
  }
  return undefined;
}

/** Keep original lesson positions and IDs when filtering the outline. */
export function filterLessonOutline(
  semesters: SemesterData[], query: string, selectedSemesterId: string | undefined,
  getTitle: (lesson: LessonData) => string,
) {
  const search = normalizeLessonSearch(query);
  return semesters.filter(semester => search || semester.id === selectedSemesterId).map(semester => ({
    semester,
    chapters: (semester.chapters ?? []).map((chapter, chapterIndex) => ({
      chapter, chapterIndex,
      lessons: chapter.lessons.map((lesson, lessonIndex) => ({ lesson, lessonIndex })).filter(({ lesson }) =>
        !search || normalizeLessonSearch(getTitle(lesson)).includes(search) || normalizeLessonSearch(chapter.name).includes(search)),
    })).filter(({ lessons }) => !search || lessons.length > 0),
  })).filter(({ chapters }) => !search || chapters.length > 0);
}
