import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateAttemptMastery, calculateSkillMastery } from "@shared/lesson-engine/grade";
import type {
  InteractiveLessonDefinition,
  LessonQuestionDefinition,
  SkillMasterySnapshot,
} from "@shared/lesson-engine/types";
import { getInitialLessonStepIndex } from "./lessonNavigation";

export interface QuestionProgress {
  questionId: string;
  skillId: string;
  answer: unknown;
  correct: boolean;
  feedback: string;
  attempts: number;
  hintsUsed: number;
  score: number;
}

export interface StoredLessonSession {
  lessonVersion: number;
  sessionId: string;
  stepIndex: number;
  unlockedStepIndex: number;
  visitedStepIds: string[];
  startedAt: string;
  completedAt?: string;
  assessmentRunId?: string;
  questions: Record<string, QuestionProgress>;
}

export interface LessonAnalyticsEvent {
  name:
    | "lesson_started"
    | "lesson_completed"
    | "checkpoint_answered"
    | "answer_correct"
    | "answer_wrong"
    | "hint_requested"
    | "tutor_question"
    | "book_opened"
    | "book_page_viewed"
    | "video_started"
    | "assessment_completed";
  questionId?: string;
  skillId?: string;
  stepId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export function createLessonSession(lesson: InteractiveLessonDefinition): StoredLessonSession {
  const initialStepIndex = getInitialLessonStepIndex(lesson);
  return {
    lessonVersion: lesson.version,
    sessionId: crypto.randomUUID(),
    stepIndex: initialStepIndex,
    unlockedStepIndex: initialStepIndex,
    visitedStepIds: [lesson.steps[initialStepIndex].id],
    startedAt: new Date().toISOString(),
    questions: {},
  };
}

export function restartLessonAssessment(lesson: InteractiveLessonDefinition, session: StoredLessonSession): StoredLessonSession {
  const assessmentIndex = lesson.steps.findIndex((step) => step.type === "assessment");
  if (assessmentIndex < 0) return session;
  const assessmentStep = lesson.steps[assessmentIndex];
  const questionIds = new Set(assessmentStep.questionIds ?? lesson.assessmentQuestionIds);
  const assessmentStepIds = new Set(lesson.steps.filter((step) => step.type === "assessment" || step.type === "report").map((step) => step.id));
  return {
    ...session,
    assessmentRunId: crypto.randomUUID(),
    stepIndex: assessmentIndex,
    unlockedStepIndex: Math.max(session.unlockedStepIndex, assessmentIndex),
    completedAt: undefined,
    questions: Object.fromEntries(Object.entries(session.questions).filter(([id]) => !questionIds.has(id))),
    visitedStepIds: [...session.visitedStepIds.filter((id) => !assessmentStepIds.has(id)), assessmentStep.id],
  };
}

function loadSession(lesson: InteractiveLessonDefinition, key: string): StoredLessonSession {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return createLessonSession(lesson);
    const parsed = JSON.parse(raw) as StoredLessonSession;
    if (parsed.lessonVersion !== lesson.version || !parsed.sessionId) return createLessonSession(lesson);
    const stepIndex = Number.isInteger(parsed.stepIndex)
      ? Math.max(0, Math.min(parsed.stepIndex, lesson.steps.length - 1))
      : getInitialLessonStepIndex(lesson);
    const unlockedStepIndex = Math.min(lesson.steps.length - 1, Math.max(stepIndex, parsed.unlockedStepIndex ?? stepIndex));
    const validStepIds = new Set(lesson.steps.map((step) => step.id));
    return {
      ...parsed,
      stepIndex,
      unlockedStepIndex,
      // Older sessions were sequential. Preserve their answers and visited content.
      visitedStepIds: Array.isArray(parsed.visitedStepIds)
        ? Array.from(new Set([...parsed.visitedStepIds.filter((id) => validStepIds.has(id)), lesson.steps[stepIndex].id]))
        : lesson.steps.slice(0, unlockedStepIndex + 1).map((step) => step.id),
      // Preserve saved answers and history while upgrading the old penalty-based scores.
      questions: Object.fromEntries(Object.entries(parsed.questions ?? {}).map(([id, progress]) => [id, {
        ...progress,
        score: progress.correct ? 100 : 0,
      }])),
    };
  } catch {
    return createLessonSession(lesson);
  }
}

export function useLessonSession(lesson: InteractiveLessonDefinition, remoteLogging = true, ownerId?: string) {
  // Do not award a signed-in student completion from another person's local quiz answers.
  // Keep the existing guest key/history; authenticated histories are scoped to their owner.
  const storageKey = `sharaf:lesson-engine:${lesson.id}${ownerId ? `:user:${ownerId}` : ""}`;
  const [saved, setSaved] = useState(() => ({ storageKey, session: loadSession(lesson, storageKey) }));
  const session = useMemo(() => saved.storageKey === storageKey ? saved.session : loadSession(lesson, storageKey), [saved, storageKey, lesson]);
  useEffect(() => {
    if (saved.storageKey !== storageKey) setSaved({ storageKey, session });
  }, [saved.storageKey, storageKey, session]);

  const persist = useCallback((next: StoredLessonSession) => {
    setSaved({ storageKey, session: next });
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Continue in memory. */ }
  }, [storageKey]);

  const emitEvent = useCallback((event: LessonAnalyticsEvent) => {
    if (!remoteLogging) return;
    const payload = {
      ...event,
      lessonId: lesson.id,
      sessionId: session.sessionId,
      occurredAt: new Date().toISOString(),
    };
    void fetch("/api/analytics/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => undefined);
  }, [lesson.id, session.sessionId, remoteLogging]);

  const setStepIndex = useCallback((stepIndex: number) => {
    const nextStepIndex = Math.max(0, Math.min(stepIndex, lesson.steps.length - 1));
    persist({
      ...session,
      stepIndex: nextStepIndex,
      unlockedStepIndex: Math.max(session.unlockedStepIndex ?? session.stepIndex, nextStepIndex),
      visitedStepIds: Array.from(new Set([...session.visitedStepIds, lesson.steps[nextStepIndex].id])),
    });
  }, [lesson.steps.length, persist, session]);

  const recordAttempt = useCallback((input: {
    question: LessonQuestionDefinition;
    answer: unknown;
    correct: boolean;
    feedback: string;
    hintsUsed: number;
  }) => {
    const previous = session.questions[input.question.id];
    const attempts = (previous?.attempts ?? 0) + 1;
    const attemptScore = calculateAttemptMastery({
      correct: input.correct,
      attemptNumber: attempts,
      hintsUsed: input.hintsUsed,
    });
    const progress: QuestionProgress = {
      questionId: input.question.id,
      skillId: input.question.skillId,
      answer: input.answer,
      correct: previous?.correct || input.correct,
      feedback: input.feedback,
      attempts,
      hintsUsed: Math.max(previous?.hintsUsed ?? 0, input.hintsUsed),
      score: Math.max(previous?.score ?? 0, attemptScore),
    };
    persist({ ...session, questions: { ...session.questions, [input.question.id]: progress } });
    emitEvent({
      name: input.correct ? "answer_correct" : "answer_wrong",
      questionId: input.question.id,
      skillId: input.question.skillId,
      metadata: { attempts, hintsUsed: input.hintsUsed },
    });
    emitEvent({ name: "checkpoint_answered", questionId: input.question.id, skillId: input.question.skillId });

    if (remoteLogging) void fetch("/api/lesson-engine/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        lessonId: lesson.id,
        sessionId: session.assessmentRunId ?? session.sessionId,
        questionId: input.question.id,
        answer: input.answer,
        hintsUsed: input.hintsUsed,
      }),
    }).catch(() => undefined);
  }, [emitEvent, lesson.id, persist, session, remoteLogging]);

  const recordHint = useCallback((question: LessonQuestionDefinition, hintIndex: number) => {
    emitEvent({
      name: "hint_requested",
      questionId: question.id,
      skillId: question.skillId,
      metadata: { hintNumber: hintIndex + 1 },
    });
  }, [emitEvent]);

  const completeLesson = useCallback(() => {
    if (session.completedAt) return;
    const completedAt = new Date().toISOString();
    persist({ ...session, completedAt });
    emitEvent({ name: "lesson_completed" });
  }, [emitEvent, persist, session]);

  const mastery = useMemo<SkillMasterySnapshot[]>(() => lesson.skills.map((skill) => {
    const results = Object.values(session.questions).filter((result) => result.skillId === skill.id);
    const score = calculateSkillMastery(results);
    return {
      skillId: skill.id,
      score,
      attempts: results.reduce((total, result) => total + result.attempts, 0),
      correctAttempts: results.filter((result) => result.correct).length,
      hintsUsed: results.reduce((total, result) => total + result.hintsUsed, 0),
    };
  }), [lesson.skills, session.questions]);

  const reset = useCallback(() => {
    const next = createLessonSession(lesson);
    persist(next);
    emitEvent({ name: "lesson_started" });
  }, [emitEvent, lesson, persist]);

  const restartAssessment = useCallback(() => {
    persist(restartLessonAssessment(lesson, session));
  }, [lesson, persist, session]);

  return {
    session,
    setStepIndex,
    recordAttempt,
    recordHint,
    completeLesson,
    mastery,
    emitEvent,
    reset,
    restartAssessment,
  };
}
