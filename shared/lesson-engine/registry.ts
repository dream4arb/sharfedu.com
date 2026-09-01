import {
  polygonAnglesLesson,
  polygonAnglesQuestionMap,
} from "./polygon-angles";
import {
  realNumberPropertiesLesson,
  realNumberPropertiesQuestionMap,
} from "./real-number-properties";
import { rationalNumbersLesson, rationalNumbersQuestionMap } from "./rational-numbers";
import type { InteractiveLessonDefinition, LessonQuestionDefinition } from "./types";

export interface RegisteredLesson {
  lesson: InteractiveLessonDefinition;
  questionMap: Record<string, LessonQuestionDefinition>;
}

const registeredLessons: RegisteredLesson[] = [
  { lesson: polygonAnglesLesson, questionMap: polygonAnglesQuestionMap },
  { lesson: rationalNumbersLesson, questionMap: rationalNumbersQuestionMap },
  { lesson: realNumberPropertiesLesson, questionMap: realNumberPropertiesQuestionMap },
];

export const lessonRegistry = Object.fromEntries(
  registeredLessons.map((entry) => [entry.lesson.id, entry]),
) as Record<string, RegisteredLesson>;

export const registeredLessonIds = registeredLessons.map((entry) => entry.lesson.id);

export function getRegisteredLesson(lessonId: string | undefined): RegisteredLesson | undefined {
  if (!lessonId) return undefined;
  return lessonRegistry[lessonId];
}
