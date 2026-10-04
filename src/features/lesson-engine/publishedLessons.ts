import { POLYGON_ANGLES_LESSON_ID } from "@shared/lesson-engine/polygon-angles";
import { getRegisteredLesson } from "@shared/lesson-engine/registry";

// Add a lesson here only after its content has been reviewed for publication.
// Titles, questions, videos and book pages come from that lesson's definition.
export const publishedLessonIds: readonly string[] = [POLYGON_ANGLES_LESSON_ID];

export function isPublishedLesson(id?: string) {
  return Boolean(id && publishedLessonIds.includes(id) && getRegisteredLesson(id));
}
