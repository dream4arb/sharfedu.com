import { publishedLessonIds } from "@shared/seo/publication";
import { getRegisteredLesson } from "@shared/lesson-engine/registry";

// Add a lesson here only after its content has been reviewed for publication.
// Titles, questions, videos and book pages come from that lesson's definition.
export { publishedLessonIds };

export function isPublishedLesson(id?: string) {
  return Boolean(id && publishedLessonIds.includes(id) && getRegisteredLesson(id));
}
