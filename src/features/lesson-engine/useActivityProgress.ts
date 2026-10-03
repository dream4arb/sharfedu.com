import { useCallback, useEffect, useState } from "react";
import type { InteractiveLessonDefinition } from "@shared/lesson-engine/types";
import { readTriedActivities, type LessonActivity } from "./lessonActivities";

export function useActivityProgress(lesson: InteractiveLessonDefinition, activities: LessonActivity[]) {
  const storageKey = `sharaf:activity-exploration:${lesson.id}:v${lesson.version}`;
  function load() {
    try { return readTriedActivities(localStorage.getItem(storageKey), activities); }
    catch { return []; }
  }
  const [saved, setSaved] = useState(() => ({ storageKey, triedStepIds: load() }));
  const triedStepIds = saved.storageKey === storageKey ? saved.triedStepIds : load();

  useEffect(() => {
    if (saved.storageKey !== storageKey) return;
    try { localStorage.setItem(storageKey, JSON.stringify({ triedStepIds: saved.triedStepIds })); }
    catch { /* Keep the activity usable when browser storage is unavailable. */ }
  }, [saved, storageKey]);

  const markTried = useCallback((stepId: string) => {
    if (!activities.some((activity) => activity.stepId === stepId)) return;
    setSaved((previous) => {
      let ids = previous.triedStepIds;
      if (previous.storageKey !== storageKey) {
        try { ids = readTriedActivities(localStorage.getItem(storageKey), activities); }
        catch { ids = []; }
      }
      if (previous.storageKey === storageKey && ids.includes(stepId)) return previous;
      return { storageKey, triedStepIds: [...new Set([...ids, stepId])] };
    });
  }, [activities, storageKey]);

  return { triedStepIds, markTried };
}
