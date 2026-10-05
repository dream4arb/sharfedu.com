import curriculum from "./math-high1-names.json";

// Classify by audited, stable IDs, not by an editable display title.
const preparationIds = new Set(curriculum.supplemental.filter(entry => entry.kind === "preparation").map(entry => {
  const semester = curriculum.chapters.find(chapter => chapter.id === entry.chapter)!.semester;
  return `math-high1-${semester}-${entry.number}`;
}));
// Production retained this original identifier during the textbook-name audit.
preparationIds.add("intro-1");

export function isUnitPreparation(lessonId: string | undefined): boolean {
  return !!lessonId && preparationIds.has(lessonId);
}

export function instructionalLessons<T extends { id: string }>(entries: T[]): T[] {
  return entries.filter(entry => !isUnitPreparation(entry.id));
}
