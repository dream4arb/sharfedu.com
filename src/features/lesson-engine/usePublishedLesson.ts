import { useEffect, useState } from "react";
import type { PublishedLesson } from "@shared/seo/publication";
import type { RegisteredLesson } from "@shared/lesson-engine/registry";

export function usePublishedLesson(id: string | undefined, stage: string, grade: string, subject: string) {
  const [saved, setSaved] = useState<{ id: string; entry: PublishedLesson | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    fetch(`/api/public/lesson-package/${encodeURIComponent(id)}`, { signal: controller.signal, cache: "no-store" })
      .then(async response => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Unable to load lesson");
        return await response.json() as PublishedLesson;
      })
      .then(entry => setSaved({ id, entry })).catch(() => { if (!controller.signal.aborted) setSaved({ id, entry: null }); });
    return () => controller.abort();
  }, [id]);
  const entry = saved && saved.id === id ? saved.entry : null;
  const location = entry?.location;
  const matches = location?.stage === stage && location.grade === grade && location.subject === subject;
  const registered: RegisteredLesson | undefined = matches && entry ? {
    lesson: entry.lesson,
    questionMap: Object.fromEntries(entry.lesson.questions.map(q => [q.id, q])),
  } : undefined;
  return registered;
}
