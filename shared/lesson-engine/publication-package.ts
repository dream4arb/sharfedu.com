import { z } from "zod";
import { gradeLessonQuestion } from "./grade";
import type { InteractiveLessonDefinition } from "./types";
import { isUnitPreparation } from "../curriculum/unit-preparation";

export const CONTENT_PROFILES = {
  math: { label: "الرياضيات", sections: ["فهم المفهوم", "مثال محلول", "تطبيق واكتشاف"] },
  english: { label: "اللغة الإنجليزية", sections: ["المفردات والتراكيب", "القراءة والاستماع", "حوار وتطبيق لغوي"] },
  science: { label: "العلوم", sections: ["المفهوم العلمي", "الملاحظة والتفسير", "تجربة واستنتاج"] },
  islamic: { label: "الدراسات الإسلامية", sections: ["النص والمعنى", "الشرح والفوائد", "تطبيق وتأمل"] },
  arabic: { label: "اللغة العربية", sections: ["النص والمفردات", "الفهم والتحليل", "تطبيق لغوي"] },
  general: { label: "قالب عام مرن", sections: ["الفكرة الأساسية", "شرح وتطبيق", "نشاط تعلّم"] },
} as const;
export type ContentProfile = keyof typeof CONTENT_PROFILES;
const text = z.string().trim().min(1).max(20000);
const id = z.string().min(1).max(160).regex(/^[\w-]+$/);
// Relative public assets or encrypted web resources only; never executable URLs.
const url = z.string().max(2000).refine(value => {
  if (/^\/(?!\/)[\w\-/.]+$/.test(value) && !value.includes("..")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "رابط غير آمن أو غير صالح");
const profile = z.enum(["math", "english", "science", "islamic", "arabic", "general"]);
const option = z.object({ id: text, label: text, visual: z.object({ kind: z.literal("polygon"), sides: z.number().int().min(3).max(16), split: z.boolean().optional() }).optional() });
const question = z.object({
  id, skillId: id, type: z.enum(["multiple_choice", "true_false", "ordering"]),
  prompt: text, helperText: text.optional(), options: z.array(option).min(2).max(12),
  correctAnswer: z.union([text, z.number().finite(), z.boolean(), z.array(text).min(2)]),
  acceptedAnswers: z.array(text).optional(), tolerance: z.number().nonnegative().optional(), unit: text.optional(),
  hints: z.array(text).max(10), correctFeedback: text, defaultIncorrectFeedback: text,
  errorPatterns: z.array(z.object({ answers: z.array(z.union([text, z.number().finite(), z.boolean()])), feedback: text })).optional(),
});
export const lessonPackageSchema = z.object({
  id, version: z.number().int().positive(), contentProfile: profile.default("general"),
  slug: text, title: text, stage: text, grade: text, subject: text, unit: text,
  estimatedMinutes: z.number().int().positive().max(240),
  introduction: z.object({
    heading: text, paragraphs: z.array(text).min(1).max(30),
    foundationSteps: z.array(z.object({ title: text, description: text })).min(1).max(15),
    examples: z.array(z.object({ label: text, sides: z.number().int().min(3).max(16), triangles: z.number().int().positive(), angleSum: z.number().positive() })).max(10),
    takeawayLabel: text.optional(), takeaway: text,
    formula: z.object({ expression: text, label: text, eyebrow: text.optional(), heading: text.optional(), parts: z.array(z.object({ symbol: text, meaning: text })) }).optional(),
    workedExample: z.object({ title: text, steps: z.array(text).min(1), result: text, direction: z.enum(["rtl", "ltr", "auto"]).optional() }).optional(),
    commonMistake: z.object({ wrong: text, correction: text }).optional(),
  }),
  objectives: z.array(text).min(1).max(15),
  skills: z.array(z.object({ id, title: text, shortTitle: text, description: text })).min(1).max(20),
  questions: z.array(question).min(1).max(50), assessmentQuestionIds: z.array(id).min(1).max(50),
  steps: z.array(z.object({
    id, type: z.enum(["objectives", "official_book", "warmup", "polygon_discovery", "concept", "worked_example", "practice", "video", "teacher_summary", "assessment", "report"]),
    title: text, eyebrow: z.string().max(500), tutorMessage: text.optional(), body: z.array(text).optional(),
    formula: text.optional(), formulaLabel: text.optional(), questionIds: z.array(id).optional(), skillIds: z.array(id).optional(),
    visualKind: z.enum(["polygon-pattern", "polygon-discovery", "polygon-formula", "polygon-missing-angle", "polygon-exterior", "real-number-sets", "real-number-decimals", "real-number-properties", "rational-number-line", "fraction-decimal-machine"]).optional(),
    activity: z.object({ kind: z.enum(["vocabulary", "dialogue", "experiment", "reading", "reflection", "practice"]), title: text, instructions: text, items: z.array(z.object({ prompt: text, explanation: text })).min(1).max(20) }).optional(),
  })).min(6).max(60),
  videos: z.array(z.object({ id, title: text, url, source: z.enum(["youtube", "hosted"]).default("youtube"), thumbnailUrl: url.optional(), captionsUrl: url.optional(), channelName: text.optional(), duration: text.optional() })).min(1).max(4),
  curriculumSource: z.object({
    authority: text, portalUrl: url, bookTitle: text, requiredEdition: text,
    editionStatus: z.literal("verified"), observedEdition: text.optional(), editionEvidence: text,
    checkedAt: text.optional(), verifiedAt: text.optional(), lessonPages: z.array(z.number().int().positive()).min(1),
    lessonExcerpt: z.object({ permissionStatus: z.literal("authorized"), pdfUrl: url, officialPdfUrl: url, attribution: text,
      pages: z.array(z.object({ pageNumber: z.number().int().positive(), imageUrl: url, alt: text })).min(1).max(80),
    }),
  }),
  teacherSummary: z.object({ status: z.enum(["teacher_reviewed", "editorial"]), attribution: text, points: z.array(text).min(1) }),
  tutorKnowledge: z.object({ approvedFacts: z.array(text).min(1), socraticPrompts: z.array(text).min(1), outOfScopeReply: text }),
});

export function validatePublishableLesson(input: unknown) {
  const result = lessonPackageSchema.safeParse(input);
  if (!result.success) return { lesson: null, errors: result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`) };
  const lesson: InteractiveLessonDefinition = result.data;
  const errors: string[] = [];
  const check = (passed: boolean, message: string) => { if (!passed) errors.push(message); };
  const unique = (values: string[]) => new Set(values).size === values.length;
  check(!isUnitPreparation(lesson.id), "تهيئة الوحدة منفصلة وليست درسًا بأربعة تبويبات");
  check(unique(lesson.skills.map(x => x.id)) && unique(lesson.questions.map(x => x.id)) && unique(lesson.steps.map(x => x.id)) && unique(lesson.videos!.map(x => x.id)), "توجد معرّفات مكررة");
  const skillIds = lesson.skills.map(x => x.id), questionIds = lesson.questions.map(x => x.id);
  check(unique(lesson.assessmentQuestionIds) && lesson.assessmentQuestionIds.every(x => questionIds.includes(x)), "مراجع الاختبار غير صحيحة");
  check(skillIds.every(id => lesson.questions.some(q => q.skillId === id && lesson.assessmentQuestionIds.includes(q.id))), "الاختبار لا يغطي جميع المهارات");
  check(lesson.steps.every(s => (s.questionIds ?? []).every(id => questionIds.includes(id)) && (s.skillIds ?? []).every(id => skillIds.includes(id))), "مرجع سؤال أو مهارة مفقود");
  check(lesson.steps.filter(s => s.type === "official_book").length === 1 && lesson.steps.filter(s => s.type === "video").length === 1 && lesson.steps.filter(s => s.type === "objectives").length === 1, "يلزم تبويب كتاب وفيديو ومقدمة واحدة");
  const assessment = lesson.steps.findIndex(s => s.type === "assessment");
  check(assessment > 0 && lesson.steps.filter(s => s.type === "assessment").length === 1 && lesson.steps.filter(s => s.type === "report").length === 1 && lesson.steps[assessment + 1]?.type === "report" && assessment + 2 === lesson.steps.length, "يجب أن تنتهي الرحلة باختبار واحد ثم نتيجة");
  check(JSON.stringify(lesson.steps[assessment]?.questionIds) === JSON.stringify(lesson.assessmentQuestionIds), "أسئلة تبويب الاختبار لا تطابق الاختبار المعتمد");
  check(lesson.steps.every(s => s.type === "assessment" || !s.questionIds?.length), "الأسئلة المقيمة يجب أن تكون في تبويب الاختبار فقط");
  check(lesson.steps.some(s => s.activity || s.visualKind), "أضف نشاطًا تفاعليًا مناسبًا للمادة");
  check(lesson.steps.some(s => ["concept", "worked_example", "practice"].includes(s.type) && Boolean(s.body?.length || s.activity || s.visualKind)), "أضف شرحًا فعليًا إلى تبويب التعلم");
  for (const q of lesson.questions) {
    const options = q.options!.map(x => x.id);
    const answer = q.type === "true_false" ? String(q.correctAnswer) : q.correctAnswer;
    check(skillIds.includes(q.skillId) && unique(options), `خيارات أو مهارة السؤال غير صحيحة: ${q.id}`);
    check(q.type === "ordering" ? Array.isArray(answer) && unique(answer) && answer.length === options.length && answer.every(x => options.includes(x)) : !Array.isArray(answer) && options.includes(String(answer)), `الإجابة الصحيحة غير متوافقة: ${q.id}`);
    check(q.type !== "true_false" || typeof q.correctAnswer === "boolean", `صح وخطأ يتطلب قيمة منطقية: ${q.id}`);
    check(gradeLessonQuestion(q, q.correctAnswer).correct, `التصحيح لا يقبل الإجابة المعتمدة: ${q.id}`);
  }
  const source = lesson.curriculumSource;
  check(JSON.stringify(source.lessonPages) === JSON.stringify(source.lessonExcerpt!.pages.map(x => x.pageNumber)) && unique(source.lessonPages!.map(String)), "صفحات الكتاب لا تطابق الصفحات الموثقة");
  check(lesson.contentProfile === "math" || !lesson.steps.some(s => s.visualKind?.startsWith("polygon-") || s.visualKind?.startsWith("real-number-")) && !lesson.introduction.examples.length, "الرسوم الرياضية لا تناسب قالب هذه المادة");
  check(lesson.videos!.every(v => v.source !== "youtube" || /^https:\/\/(www\.)?youtube(-nocookie)?\.com\/embed\/[\w-]{11}(\?|$)/.test(v.url)), "رابط يوتيوب يجب أن يكون رابط تضمين صالحًا");
  return { lesson: errors.length ? null : lesson, errors };
}

export function createLessonTemplate(info: { id: string; title: string; stage: string; grade: string; subject: string; unit: string }, contentProfile: ContentProfile) {
  const sections = CONTENT_PROFILES[contentProfile].sections;
  return {
    ...info, version: 1, slug: info.id, contentProfile, estimatedMinutes: 20,
    introduction: { heading: info.title, paragraphs: [""], foundationSteps: [{ title: sections[0], description: "" }], examples: [], takeaway: "" },
    objectives: [""], skills: [{ id: "skill-1", title: "", shortTitle: "", description: "" }],
    steps: [
      { id: "intro", type: "objectives", title: info.title, eyebrow: "" },
      { id: "book", type: "official_book", title: info.title, eyebrow: "" },
      { id: "video", type: "video", title: info.title, eyebrow: "" },
      ...sections.map((title, index) => ({ id: `learn-${index + 1}`, type: "concept", title, eyebrow: "", body: [""], ...(index === 2 ? { activity: { kind: contentProfile === "english" ? "dialogue" : contentProfile === "science" ? "experiment" : contentProfile === "islamic" ? "reflection" : contentProfile === "arabic" ? "reading" : "practice", title, instructions: "", items: [{ prompt: "", explanation: "" }] } } : {}) })),
      { id: "assessment", type: "assessment", title: info.title, eyebrow: "", questionIds: ["question-1"] },
      { id: "report", type: "report", title: "النتيجة", eyebrow: "" },
    ],
    questions: [{ id: "question-1", skillId: "skill-1", type: "multiple_choice", prompt: "", options: [{ id: "a", label: "" }, { id: "b", label: "" }], correctAnswer: "", hints: [], correctFeedback: "", defaultIncorrectFeedback: "" }],
    assessmentQuestionIds: ["question-1"], videos: [],
    curriculumSource: { authority: "", portalUrl: "", bookTitle: "", requiredEdition: "", editionStatus: "pending", editionEvidence: "", lessonPages: [], lessonExcerpt: { permissionStatus: "authorized", pdfUrl: "", officialPdfUrl: "", attribution: "", pages: [] } },
    teacherSummary: { status: "editorial", attribution: "", points: [""] },
    tutorKnowledge: { approvedFacts: [""], socraticPrompts: [""], outOfScopeReply: "يمكنني مساعدتك في هذا الدرس فقط." },
  };
}
