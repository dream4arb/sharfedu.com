import type {
  LessonQuestionDefinition,
  LessonQuestionResult,
} from "./types";

function normalizeArabicText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[°٪%،,.!?؟]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeScalar(value: unknown): string | number | boolean {
  if (typeof value === "boolean" || typeof value === "number") return value;
  const text = String(value ?? "").trim();
  if (text === "true") return true;
  if (text === "false") return false;
  const numeric = Number(text.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))));
  if (text !== "" && Number.isFinite(numeric)) return numeric;
  return normalizeArabicText(text);
}

function scalarEquals(
  answer: string | number | boolean,
  expected: string | number | boolean,
  tolerance = 0,
): boolean {
  const normalizedAnswer = normalizeScalar(answer);
  const normalizedExpected = normalizeScalar(expected);
  if (typeof normalizedAnswer === "number" && typeof normalizedExpected === "number") {
    return Math.abs(normalizedAnswer - normalizedExpected) <= tolerance;
  }
  return normalizedAnswer === normalizedExpected;
}

export function gradeLessonQuestion(
  question: LessonQuestionDefinition,
  answer: unknown,
): LessonQuestionResult {
  const normalizedAnswer = Array.isArray(answer)
    ? answer.map((item) => String(item))
    : normalizeScalar(answer);

  let correct = false;
  if (question.type === "ordering") {
    const expected = Array.isArray(question.correctAnswer) ? question.correctAnswer : [];
    const received = Array.isArray(answer) ? answer.map(String) : [];
    correct = expected.length === received.length && expected.every((item, index) => item === received[index]);
  } else {
    const expected = question.correctAnswer as string | number | boolean;
    correct = scalarEquals(
      normalizedAnswer as string | number | boolean,
      expected,
      question.tolerance ?? 0,
    );
    if (!correct && question.acceptedAnswers?.length) {
      const text = normalizeArabicText(String(answer ?? ""));
      correct = question.acceptedAnswers.some((item) => {
        const accepted = normalizeArabicText(item);
        return text === accepted || text.includes(accepted);
      });
    }
  }

  if (correct) {
    return {
      correct: true,
      feedback: question.correctFeedback,
      normalizedAnswer,
    };
  }

  const matchedPattern = question.errorPatterns?.find((pattern) =>
    pattern.answers.some((candidate) =>
      scalarEquals(
        normalizedAnswer as string | number | boolean,
        candidate,
        question.tolerance ?? 0,
      ),
    ),
  );

  return {
    correct: false,
    feedback: matchedPattern?.feedback ?? question.defaultIncorrectFeedback,
    normalizedAnswer,
  };
}

export function calculateAttemptMastery(input: {
  correct: boolean;
  attemptNumber: number;
  hintsUsed: number;
}): number {
  if (!input.correct) return 0;
  const retryPenalty = Math.max(0, input.attemptNumber - 1) * 12;
  const hintPenalty = input.hintsUsed * 8;
  return Math.max(55, Math.round(100 - retryPenalty - hintPenalty));
}
