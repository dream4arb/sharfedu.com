import { useCallback, useEffect, useRef, useState } from "react";
import { fourTabApiFields, mergeFourTabProgress, readFourTabCompletion, readFourTabProgress, updateTabCompletion,
  type CompletionTabId, type FourTabProgress } from "@shared/lesson-engine/tab-progress";

export function useFourTabProgress(userId: string | undefined, authLoading: boolean) {
  const storageKey = `sharaf_four_tab_progress_v1:${userId ?? "guest"}`;
  function load(): FourTabProgress {
    try { return readFourTabProgress(localStorage.getItem(storageKey)); } catch { return {}; }
  }
  const [saved, setSaved] = useState(() => ({ storageKey, progress: load() }));
  const progress = saved.storageKey === storageKey ? saved.progress : load();
  const live = useRef({ storageKey, progress });
  live.current = { storageKey, progress };
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const confirmed = useRef(new Map<string, string>());
  const queued = useRef(new Map<string, string>());
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    if (saved.storageKey === storageKey) return;
    setSaved({ storageKey, progress: load() });
  }, [saved.storageKey, storageKey]);

  useEffect(() => {
    if (authLoading || saved.storageKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify(saved.progress)); } catch { /* Continue in memory. */ }
  }, [authLoading, saved, storageKey]);

  useEffect(() => {
    if (authLoading || !userId) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    void fetch(`/api/progress/user?userId=${encodeURIComponent(userId)}`, { credentials: "include", signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Progress unavailable");
        const items = await response.json();
        if (!Array.isArray(items)) throw new Error("Invalid progress response");
        if (cancelled) return;
        const remote: FourTabProgress = {};
        for (const item of items) {
          const record = readFourTabCompletion(item.questionsProgress);
          if (!record || typeof item.subjectSlug !== "string" || typeof item.lessonId !== "string") continue;
          remote[item.subjectSlug] = { ...remote[item.subjectSlug], [item.lessonId]: record };
          confirmed.current.set(`${storageKey}:${item.subjectSlug}:${item.lessonId}`, JSON.stringify(record));
        }
        setSaved((previous) => ({ storageKey, progress: mergeFourTabProgress(previous.storageKey === storageKey ? previous.progress : load(), remote) }));
        setHydratedKey(storageKey);
      }).catch(() => {
        if (!cancelled) retryTimer = setTimeout(() => setRetry((value) => value + 1), 30000);
      }).finally(() => clearTimeout(timeout));
    return () => { cancelled = true; controller.abort(); clearTimeout(timeout); clearTimeout(retryTimer); };
  }, [authLoading, storageKey, userId, retry]);

  const setLessonTabCompleted = useCallback((subject: string, id: string, tab: CompletionTabId, completed: boolean) => {
    if (authLoading) return;
    setSaved((previous) => {
      const current = previous.storageKey === storageKey ? previous.progress : load();
      const before = current[subject]?.[id];
      const next = updateTabCompletion(before, tab, completed);
      if (before === next && previous.storageKey === storageKey) return previous;
      return { storageKey, progress: { ...current, [subject]: { ...current[subject], [id]: next } } };
    });
  }, [authLoading, storageKey]);

  // Serialize and coalesce writes; an older 25% request cannot overwrite a later 100%.
  useEffect(() => {
    if (!userId || authLoading || hydratedKey !== storageKey || saved.storageKey !== storageKey) return;
    let cancelled = false;
    const retryTimers: ReturnType<typeof setTimeout>[] = [];
    for (const [subject, lessons] of Object.entries(progress)) {
      for (const [id, record] of Object.entries(lessons)) {
        const key = `${storageKey}:${subject}:${id}`;
        const signature = JSON.stringify(record);
        if (confirmed.current.get(key) === signature || queued.current.get(key) === signature) continue;
        queued.current.set(key, signature);
        writeQueue.current = writeQueue.current.catch(() => undefined).then(async () => {
          if (live.current.storageKey !== storageKey || JSON.stringify(live.current.progress[subject]?.[id]) !== signature) {
            if (queued.current.get(key) === signature) queued.current.delete(key);
            return;
          }
          try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);
            try {
              const response = await fetch("/api/progress/lesson", {
                method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", signal: controller.signal,
                body: JSON.stringify({ userId, subjectSlug: subject, lessonId: id, ...fourTabApiFields(record) }),
              });
              if (!response.ok) throw new Error("Progress not saved");
              confirmed.current.set(key, signature);
            } finally { clearTimeout(timer); }
          } catch {
            if (!cancelled) retryTimers.push(setTimeout(() => setRetry((value) => value + 1), 15000));
          } finally { if (queued.current.get(key) === signature) queued.current.delete(key); }
        });
      }
    }
    return () => { cancelled = true; retryTimers.forEach(clearTimeout); };
  }, [authLoading, hydratedKey, progress, retry, saved.storageKey, storageKey, userId]);

  const progressReady = !authLoading;
  return { fourTabProgress: progress, setLessonTabCompleted, progressReady };
}
