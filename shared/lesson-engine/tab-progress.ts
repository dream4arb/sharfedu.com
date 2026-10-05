/** Completion is distinct from assessment mastery: four tabs, exactly 25 each. */
export const COMPLETION_TABS = ["book", "video", "learn", "assessment"] as const;
export type CompletionTabId = typeof COMPLETION_TABS[number];
export interface FourTabCompletion {
  model: "four-tabs-v1";
  completedTabs: CompletionTabId[];
  updatedAt: number;
}
export type FourTabProgress = Record<string, Record<string, FourTabCompletion>>;

export function normalizeCompletionTabs(value: unknown): CompletionTabId[] {
  return COMPLETION_TABS.filter((tab) => Array.isArray(value) && value.includes(tab));
}

export function tabCompletionPercent(tabs: unknown): number {
  return normalizeCompletionTabs(tabs).length * 25;
}

/** Advancing through the header is the same completion action as the footer's Next. */
export function shouldCompleteContentTabOnAdvance(current: CompletionTabId, target: CompletionTabId): boolean {
  return current !== "assessment" && COMPLETION_TABS.indexOf(target) > COMPLETION_TABS.indexOf(current);
}

export function updateTabCompletion(previous: FourTabCompletion | undefined, tab: CompletionTabId, completed: boolean, now = Date.now()): FourTabCompletion {
  const tabs = normalizeCompletionTabs(previous?.completedTabs);
  if (tabs.includes(tab) === completed && previous) return previous;
  return {
    model: "four-tabs-v1",
    completedTabs: normalizeCompletionTabs(completed ? [...tabs, tab] : tabs.filter((item) => item !== tab)),
    updatedAt: Math.max(now, (previous?.updatedAt ?? 0) + 1),
  };
}

export function readFourTabCompletion(raw: unknown): FourTabCompletion | null {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || parsed.model !== "four-tabs-v1" || !Array.isArray(parsed.completedTabs) ||
        !Number.isFinite(parsed.updatedAt) || parsed.updatedAt < 0 ||
        parsed.completedTabs.some((tab: unknown) => !COMPLETION_TABS.includes(tab as CompletionTabId))) return null;
    return { model: "four-tabs-v1", completedTabs: normalizeCompletionTabs(parsed.completedTabs), updatedAt: parsed.updatedAt };
  } catch { return null; }
}

export function readFourTabProgress(raw: string | null): FourTabProgress {
  try {
    const parsed = JSON.parse(raw ?? "{}");
    const result: FourTabProgress = {};
    for (const [subject, lessons] of Object.entries(parsed ?? {})) {
      if (!lessons || typeof lessons !== "object") continue;
      for (const [id, value] of Object.entries(lessons)) {
        const record = readFourTabCompletion(value);
        if (record) result[subject] = { ...result[subject], [id]: record };
      }
    }
    return result;
  } catch { return {}; }
}

export function mergeFourTabProgress(local: FourTabProgress, remote: FourTabProgress): FourTabProgress {
  const merged = { ...local };
  for (const [subject, lessons] of Object.entries(remote)) {
    for (const [id, record] of Object.entries(lessons)) {
      const current = merged[subject]?.[id];
      // Latest snapshot wins, not union: restarting an assessment must remove its 25%.
      if (!current || record.updatedAt > current.updatedAt) merged[subject] = { ...merged[subject], [id]: record };
    }
  }
  return merged;
}

export function fourTabApiFields(record: FourTabCompletion) {
  return {
    lessonCompleted: record.completedTabs.includes("book"),
    videoCompleted: record.completedTabs.includes("video"),
    // Legacy field remains completion-only here, not a student's quiz grade.
    questionsScore: record.completedTabs.includes("assessment") ? 100 : 0,
    // Existing text column carries a versioned completion record; no schema/backend mutation.
    questionsProgress: JSON.stringify(record),
    totalProgress: String(tabCompletionPercent(record.completedTabs)),
  };
}
