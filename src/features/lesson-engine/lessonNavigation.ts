import type { InteractiveLessonDefinition, LessonStepDefinition } from "@shared/lesson-engine/types";

export const LESSON_TABS = [
  { id: "book", title: "الدرس من الكتاب" },
  { id: "video", title: "الشرح المرئي" },
  { id: "learn", title: "الشرح التفاعلي" },
  { id: "assessment", title: "الاختبار والنتيجة" },
] as const;

export type LessonTabId = typeof LESSON_TABS[number]["id"];

export function getLessonTabId(step: LessonStepDefinition): LessonTabId {
  if (step.type === "official_book") return "book";
  if (step.type === "video") return "video";
  if (step.type === "assessment" || step.type === "report") return "assessment";
  return "learn";
}

// Keep content IDs and saved step indexes intact; only group their presentation.
export function buildLessonTabs(lesson: InteractiveLessonDefinition) {
  return LESSON_TABS.map((tab) => ({
    ...tab,
    stepIndexes: lesson.steps.flatMap((step, index) => getLessonTabId(step) === tab.id ? [index] : []),
  }));
}

export function getInitialLessonStepIndex(lesson: InteractiveLessonDefinition) {
  const bookIndex = lesson.steps.findIndex((step) => step.type === "official_book");
  return bookIndex >= 0 ? bookIndex : 0;
}

export function getReviewStepIndex(lesson: InteractiveLessonDefinition, skillId: string) {
  const matchingIndex = lesson.steps.findIndex((step) => getLessonTabId(step) === "learn" && step.skillIds?.includes(skillId));
  return matchingIndex >= 0 ? matchingIndex : lesson.steps.findIndex((step) => getLessonTabId(step) === "learn");
}
