import { useState, useEffect } from "react";
import type { CurriculumContentStatus } from "@shared/curriculum/catalog";

export type DisplayLesson = {
  id: string;
  title: string;
  status?: CurriculumContentStatus;
  engineLessonId?: string;
};

export type DisplaySemester = {
  id: string;
  name: string;
  chapters: { id: string; name: string; number?: number; lessons: DisplayLesson[] }[];
};

export type DisplayStructure = Record<string, { semesters: DisplaySemester[] }>;

export type LessonTitlesMap = Record<string, string>;

export interface PublicStructureData {
  displayStructure: DisplayStructure;
  lessonTitles: LessonTitlesMap;
}

export function usePublicStructure(version?: number): PublicStructureData {
  const [data, setData] = useState<PublicStructureData>({
    displayStructure: {},
    lessonTitles: {},
  });

  useEffect(() => {
    fetch("/api/public/structure")
      .then((r) => r.json())
      .then((d) => {
        setData({
          displayStructure: d?.displayStructure ?? {},
          lessonTitles: d?.lessonTitles ?? {},
        });
      })
      .catch(() => {});
  }, [version]);

  return data;
}

export function useLessonTitlesFromApi(): Record<string, string> {
  const { lessonTitles } = usePublicStructure();
  return lessonTitles;
}
