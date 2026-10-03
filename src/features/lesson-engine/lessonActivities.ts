import { POLYGON_ANGLES_LESSON_ID } from "@shared/lesson-engine/polygon-angles";
import type { InteractiveLessonDefinition, LessonStepDefinition } from "@shared/lesson-engine/types";

export interface LessonActivity {
  stepId: string;
  stepIndex: number;
  title: string;
  instruction: string;
}

const activityInstructions: Record<NonNullable<LessonStepDefinition["visualKind"]>, string> = {
  "polygon-pattern": "اختر شكلًا آخر، ولاحظ كيف يتغيّر عدد المثلثات.",
  "polygon-discovery": "اضغط «قسّم المضلع» لإظهار المثلثات، ثم جرّب عددًا آخر من الأضلاع.",
  "polygon-formula": "اضغط «قسّم الشكل»، ثم تابع الأزرار خطوة خطوة حتى تصل إلى مجموع الزوايا.",
  "polygon-missing-angle": "اضغط «أظهر الزوايا المعروفة»، ثم تابع الخطوات لتكشف الزاوية المجهولة.",
  "polygon-exterior": "اضغط «انتقل إلى الرأس التالي» عدة مرات حتى تكمل دورة حول المضلع.",
  "real-number-sets": "اختر عددًا آخر، وشاهد المجموعات التي ينتمي إليها.",
  "real-number-decimals": "اضغط على أحد الأعداد، وقارن بين النهاية والتكرار في الأعداد الأخرى.",
  "real-number-properties": "اضغط «حرّك» لتشاهد الخاصية، ثم اختر خاصية أخرى للمقارنة.",
  "rational-number-line": "اختر كسرًا آخر، وشاهد انتقاله على خط الأعداد.",
  "fraction-decimal-machine": "اضغط «الخطوة التالية» لتشاهد التحويل من كسر إلى قسمة ثم عدد عشري.",
};

export function getLessonActivities(lesson: InteractiveLessonDefinition): LessonActivity[] {
  return lesson.steps.flatMap((step, stepIndex) => {
    const instruction = step.visualKind ? activityInstructions[step.visualKind]
      : step.type === "teacher_summary" && lesson.id === POLYGON_ANGLES_LESSON_ID
        ? "اختر «زاوية مجهولة» أو «الزوايا الخارجية» لتستكشف مسارًا آخر في خريطة الدرس."
        : undefined;
    return instruction ? [{ stepId: step.id, stepIndex, title: step.title, instruction }] : [];
  });
}

// Activity exploration is separate from question results and mastery scores.
export function readTriedActivities(raw: string | null, activities: LessonActivity[]): string[] {
  try {
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || !("triedStepIds" in parsed)
      || !Array.isArray(parsed.triedStepIds)) return [];
    const validIds = new Set(activities.map((activity) => activity.stepId));
    return [...new Set(parsed.triedStepIds.filter((id): id is string => typeof id === "string" && validIds.has(id)))];
  } catch {
    return [];
  }
}

export function getPendingActivities(activities: LessonActivity[], triedStepIds: string[]): LessonActivity[] {
  const tried = new Set(triedStepIds);
  return activities.filter((activity) => !tried.has(activity.stepId));
}
