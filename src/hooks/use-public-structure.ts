import { useState, useEffect } from "react";

export type DisplaySemester = {
  id: string;
  name: string;
  chapters: { id: string; name: string; number?: number; lessons: { id: string; title: string }[] }[];
};

/** هيكل العرض: مرحلة_مادة → فصول ووحدات ودروس */
export type DisplayStructure = Record<string, { semesters: DisplaySemester[] }>;

/** خريطة معرف الدرس → عنوانه */
export type LessonTitlesMap = Record<string, string>;

export interface PublicStructureData {
  displayStructure: DisplayStructure;
  lessonTitles: LessonTitlesMap;
}

/** جلب الهيكل المحدث من لوحة التحكم (فصول، وحدات، دروس) */
export function usePublicStructure(): PublicStructureData {
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
  }, []);

  return data;
}

/** للتوافق مع الكود القديم */
export function useLessonTitlesFromApi(): Record<string, string> {
  const { lessonTitles } = usePublicStructure();
  return lessonTitles;
}
