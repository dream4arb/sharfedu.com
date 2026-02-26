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
export function usePublicStructure(): PublicStructureData & { refetch: () => void } {
  const [data, setData] = useState<PublicStructureData>({
    displayStructure: {},
    lessonTitles: {},
  });
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  return { ...data, refetch };
}

/** للتوافق مع الكود القديم */
export function useLessonTitlesFromApi(): Record<string, string> {
  const { lessonTitles } = usePublicStructure();
  return lessonTitles;
}
