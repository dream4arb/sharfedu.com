import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Lightbulb, RotateCcw, XCircle } from "lucide-react";
import { gradeLessonQuestion } from "@shared/lesson-engine/grade";
import type { LessonQuestionDefinition } from "@shared/lesson-engine/types";
import type { QuestionProgress } from "./useLessonSession";

interface QuestionCardProps {
  question: LessonQuestionDefinition;
  progress?: QuestionProgress;
  assessmentMode?: boolean;
  onAttempt: (input: {
    question: LessonQuestionDefinition;
    answer: unknown;
    correct: boolean;
    feedback: string;
    hintsUsed: number;
  }) => void;
  onHint: (question: LessonQuestionDefinition, hintIndex: number) => void;
}

export function QuestionCard({ question, progress, assessmentMode = false, onAttempt, onHint }: QuestionCardProps) {
  const defaultOrdering = useMemo(() => [...(question.options?.map((option) => option.id) ?? [])].reverse(), [question.options]);
  const [answer, setAnswer] = useState<unknown>(progress?.answer ?? (question.type === "ordering" ? defaultOrdering : ""));
  const [feedback, setFeedback] = useState(progress?.feedback ?? "");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(progress ? progress.correct : null);
  const [hintCount, setHintCount] = useState(progress?.hintsUsed ?? 0);

  useEffect(() => {
    setAnswer(progress?.answer ?? (question.type === "ordering" ? defaultOrdering : ""));
    setFeedback(progress?.feedback ?? "");
    setIsCorrect(progress ? progress.correct : null);
    setHintCount(progress?.hintsUsed ?? 0);
  }, [defaultOrdering, progress, question.id]);

  const canSubmit = Array.isArray(answer) ? answer.length > 0 : String(answer ?? "").trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    const result = gradeLessonQuestion(question, answer);
    setFeedback(result.feedback);
    setIsCorrect(result.correct);
    onAttempt({ question, answer, correct: result.correct, feedback: result.feedback, hintsUsed: hintCount });
  }

  function requestHint() {
    if (hintCount >= question.hints.length) return;
    onHint(question, hintCount);
    setHintCount((count) => count + 1);
  }

  function moveOrdering(index: number, direction: -1 | 1) {
    const current = [...(answer as string[])];
    const target = index + direction;
    if (target < 0 || target >= current.length) return;
    [current[index], current[target]] = [current[target], current[index]];
    setAnswer(current);
    setIsCorrect(null);
    setFeedback("");
  }

  function renderInput() {
    if (question.type === "multiple_choice" || question.type === "true_false") {
      return (
        <div className="grid gap-3 sm:grid-cols-2" role="group" aria-label="خيارات الإجابة">
          {question.options?.map((option) => {
            const optionValue = question.type === "true_false" ? option.id === "true" : option.id;
            const selected = answer === optionValue;
            return (
              <button
                type="button"
                key={option.id}
                onClick={() => { setAnswer(optionValue); setIsCorrect(null); setFeedback(""); }}
                aria-pressed={selected}
                className={`min-h-14 rounded-2xl border px-4 text-right font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 ${
                  selected ? "border-cyan-600 bg-cyan-50 text-cyan-950" : "border-slate-200 bg-white text-slate-800 hover:border-cyan-300"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      );
    }

    if (question.type === "ordering") {
      const labels = Object.fromEntries(question.options?.map((option) => [option.id, option.label]) ?? []);
      return (
        <ol className="space-y-2" aria-label="رتّب الخطوات">
          {(answer as string[]).map((id, index) => (
            <li key={id} className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-black text-cyan-800">{index + 1}</span>
              <span className="flex-1 font-bold text-slate-800">{labels[id]}</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => moveOrdering(index, -1)} disabled={index === 0} aria-label={`حرّك ${labels[id]} إلى أعلى`} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"><ArrowUp className="h-5 w-5" /></button>
                <button type="button" onClick={() => moveOrdering(index, 1)} disabled={index === (answer as string[]).length - 1} aria-label={`حرّك ${labels[id]} إلى أسفل`} className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-30"><ArrowDown className="h-5 w-5" /></button>
              </div>
            </li>
          ))}
        </ol>
      );
    }

    return (
      <label className="block">
        <span className="sr-only">إجابتك</span>
        {question.type === "short_answer" ? (
          <textarea
            value={String(answer ?? "")}
            onChange={(event) => { setAnswer(event.target.value); setIsCorrect(null); setFeedback(""); }}
            rows={3}
            maxLength={240}
            placeholder="اكتب فكرتك هنا..."
            className="w-full resize-y rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
          />
        ) : (
          <div className="relative max-w-sm">
            <input
              type="text"
              inputMode="decimal"
              value={String(answer ?? "")}
              onChange={(event) => { setAnswer(event.target.value); setIsCorrect(null); setFeedback(""); }}
              onKeyDown={(event) => { if (event.key === "Enter") submit(); }}
              placeholder="اكتب الرقم"
              className="min-h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 pl-20 text-xl font-black outline-none transition focus:border-cyan-600 focus:ring-4 focus:ring-cyan-100"
              dir="ltr"
            />
            {question.unit && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">{question.unit}</span>}
          </div>
        )}
      </label>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6" data-testid={`question-${question.id}`}>
      <div className="flex items-start gap-3">
        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-black text-white">؟</span>
        <div>
          <h3 className="text-lg font-black leading-8 text-slate-900">{question.prompt}</h3>
          {question.helperText && <p className="mt-1 text-sm text-slate-600">{question.helperText}</p>}
        </div>
      </div>

      <div className="mt-5">{renderInput()}</div>

      {hintCount > 0 && (
        <div className="mt-4 space-y-2" aria-live="polite">
          {question.hints.slice(0, hintCount).map((hint, index) => (
            <div key={hint} className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
              <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p><strong>تلميح {index + 1}:</strong> {hint}</p>
            </div>
          ))}
        </div>
      )}

      {feedback && (
        <div
          className={`mt-4 flex gap-3 rounded-2xl border p-4 leading-7 ${
            isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-rose-200 bg-rose-50 text-rose-950"
          }`}
          role="status"
          data-testid="question-feedback"
        >
          {isCorrect ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-1 h-5 w-5 shrink-0 text-rose-600" />}
          <p>{assessmentMode && !isCorrect ? "تم تسجيل محاولتك. " : ""}{feedback}</p>
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={requestHint}
          disabled={hintCount >= question.hints.length || question.hints.length === 0}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 font-bold text-slate-700 hover:bg-white disabled:hidden"
        >
          <Lightbulb className="h-5 w-5" /> {hintCount ? "تلميح أقوى" : "أعطني تلميحًا"}
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || isCorrect === true}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-6 font-black text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="button-submit-answer"
        >
          {isCorrect === false && <RotateCcw className="h-4 w-4" />}
          {isCorrect === false ? "أعد المحاولة" : isCorrect ? "تمت الإجابة" : "تحقق من إجابتي"}
        </button>
      </div>
    </section>
  );
}
