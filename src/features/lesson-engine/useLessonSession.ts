import { useCallback, useMemo, useState } from "react";
import { calculateAttemptMastery } from "@shared/lesson-engine/grade";
import type {
  InteractiveLessonDefinition,
  LessonQuestionDefinition,
  SkillMasterySnapshot,
} from "@shared/lesson-engine/types";

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

interface StoredLessonSession {
  lessonVersion: number;
  sessionId: string;
  stepIndex: number;
  startedAt: string;
  completedAt?: string;
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
    | "video_started"
    | "assessment_completed";
  questionId?: string;
  skillId?: string;
  stepId?: string;
  metadata?: Record<string, string | number | boolean>;
}

function createSession(lesson: InteractiveLessonDefinition): StoredLessonSession {
  return {
    lessonVersion: lesson.version,
    sessionId: crypto.randomUUID(),
    stepIndex: 0,
    startedAt: new Date().toISOString(),
    questions: {},
  };
}

function loadSession(lesson: InteractiveLessonDefinition): StoredLessonSession {
  const key = `sharaf:lesson-engine:${lesson.id}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return createSession(lesson);
    const parsed = JSON.parse(raw) as StoredLessonSession;
    if (parsed.lessonVersion !== lesson.version || !parsed.sessionId) return createSession(lesson);
    return parsed;
  } catch {
    return createSession(lesson);
  }
}

export function useLessonSession(lesson: InteractiveLessonDefinition) {
  const storageKey = `sharaf:lesson-engine:${lesson.id}`;
  const [session, setSession] = useState<StoredLessonSession>(() => loadSession(lesson));

  const persist = useCallback((next: StoredLessonSession) => {
    setSession(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [storageKey]);

  const emitEvent = useCallback((event: LessonAnalyticsEvent) => {
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
  }, [lesson.id, session.sessionId]);

  const setStepIndex = useCallback((stepIndex: number) => {
    persist({ ...session, stepIndex: Math.max(0, Math.min(stepIndex, lesson.steps.length - 1)) });
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

    void fetch("/api/lesson-engine/attempt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        lessonId: lesson.id,
        sessionId: session.sessionId,
        questionId: input.question.id,
        answer: input.answer,
        hintsUsed: input.hintsUsed,
      }),
    }).catch(() => undefined);
  }, [emitEvent, lesson.id, persist, session]);

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
    const score = results.length
      ? Math.round(results.reduce((total, result) => total + result.score, 0) / results.length)
      : 0;
    return {
      skillId: skill.id,
      score,
      attempts: results.reduce((total, result) => total + result.attempts, 0),
      correctAttempts: results.filter((result) => result.correct).length,
      hintsUsed: results.reduce((total, result) => total + result.hintsUsed, 0),
    };
  }), [lesson.skills, session.questions]);

  const reset = useCallback(() => {
    const next = createSession(lesson);
    persist(next);
    emitEvent({ name: "lesson_started" });
  }, [emitEvent, lesson, persist]);

  return {
    session,
    setStepIndex,
    recordAttempt,
    recordHint,
    completeLesson,
    mastery,
    emitEvent,
    reset,
  };
}
