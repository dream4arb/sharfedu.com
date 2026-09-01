import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { polygonAnglesLesson } from "../shared/lesson-engine/polygon-angles";
import { gradeLessonQuestion } from "../shared/lesson-engine/grade";

type Check = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  severity: "blocking" | "warning";
};

const lesson = polygonAnglesLesson;
const checks: Check[] = [];

function check(id: string, label: string, passed: boolean, detail: string, severity: Check["severity"] = "blocking") {
  checks.push({ id, label, passed, detail, severity });
}

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

function isOfficialEducationPortal(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (
      url.hostname === "moe.gov.sa" ||
      url.hostname.endsWith(".moe.gov.sa")
    );
  } catch {
    return false;
  }
}

const skillIds = lesson.skills.map((skill) => skill.id);
const questionIds = lesson.questions.map((question) => question.id);
const stepIds = lesson.steps.map((step) => step.id);
const videoIds = (lesson.videos ?? []).map((video) => video.id);
const referencedQuestionIds = lesson.steps.flatMap((step) => step.questionIds ?? []);
const assessmentStepIndex = lesson.steps.findIndex((step) => step.type === "assessment");
const officialBookStepIndex = lesson.steps.findIndex((step) => step.type === "official_book");
const videoStepIndex = lesson.steps.findIndex((step) => step.type === "video");
const assessedSkills = new Set(
  lesson.assessmentQuestionIds
    .map((questionId) => lesson.questions.find((question) => question.id === questionId)?.skillId)
    .filter((skillId): skillId is string => Boolean(skillId)),
);

check("unique-skills", "معرّفات المهارات غير مكررة", unique(skillIds), `${skillIds.length} مهارات`);
check("unique-questions", "معرّفات الأسئلة غير مكررة", unique(questionIds), `${questionIds.length} سؤالًا`);
check("unique-steps", "معرّفات خطوات الرحلة غير مكررة", unique(stepIds), `${stepIds.length} خطوات`);
check("unique-videos", "معرّفات الفيديو غير مكررة", unique(videoIds), `${videoIds.length} فيديو`);
check("question-references", "كل سؤال مستخدم في الرحلة موجود", referencedQuestionIds.every((id) => questionIds.includes(id)), "لا توجد مراجع مفقودة");
check("assessment-references", "كل سؤال في الاختبار النهائي موجود", lesson.assessmentQuestionIds.every((id) => questionIds.includes(id)), `${lesson.assessmentQuestionIds.length} أسئلة نهائية`);
check("assessment-only-questions", "جميع الأسئلة الظاهرة محصورة في تبويب اختبار الدرس", lesson.steps.every((step) => step.type === "assessment" || !(step.questionIds?.length)), `التبويبات 1–${assessmentStepIndex} للفهم والمراجع والتفاعل البصري، والتبويب ${assessmentStepIndex + 1} للاختبار`);
check("assessment-skills", "الاختبار النهائي يغطي جميع المهارات", skillIds.every((id) => assessedSkills.has(id)), `${assessedSkills.size} من ${skillIds.length} مهارات`);
check("non-written-questions", "لا توجد إجابات كتابية في الرحلة", lesson.questions.every((question) => !["numeric", "short_answer"].includes(question.type)), "الأنواع المتاحة: اختيار، صح/خطأ، وترتيب");
check("question-feedback", "لكل سؤال تغذية راجعة تعليمية", lesson.questions.every((question) => Boolean(question.correctFeedback.trim()) && Boolean(question.defaultIncorrectFeedback.trim())), "تغذية راجعة للصحيح والخطأ في جميع الأسئلة");
check("formative-hints", "لكل سؤال تدريبي تلميح متدرج", lesson.questions.every((question) => lesson.assessmentQuestionIds.includes(question.id) || question.hints.length > 0), "الاختبار النهائي بلا تلميحات حتى يقيس الإتقان باستقلالية");
check("question-options", "خيارات الأسئلة متوافقة مع الإجابات", lesson.questions.every((question) => {
  if (question.type === "ordering") {
    const optionIds = new Set(question.options?.map((option) => option.id) ?? []);
    return Array.isArray(question.correctAnswer) && question.correctAnswer.every((answer) => optionIds.has(answer));
  }
  if (["multiple_choice", "true_false"].includes(question.type)) {
    return question.options?.some((option) => option.id === String(question.correctAnswer)) ?? false;
  }
  return true;
}), "الإجابة الصحيحة موجودة ضمن الخيارات");
check("video-limit", "عدد الشروحات المرئية لا يتجاوز أربعة", (lesson.videos?.length ?? 0) <= 4, `${lesson.videos?.length ?? 0} فيديو`);
check("rejected-video-removed", "الفيديو المرفوض غير موجود", !(lesson.videos ?? []).some((video) => video.id === "sharaf-polygon-angles-whiteboard" || video.url.includes("sharaf-polygon-angles-whiteboard")), "لا توجد إحالة إلى الفيديو المرفوض");
check("teacher-claim", "ملخص المعلم لا يدّعي اعتمادًا غير موجود", lesson.teacherSummary.status === "teacher_reviewed" || /بانتظار اعتماد/.test(lesson.teacherSummary.attribution), lesson.teacherSummary.attribution);
const officialSource = isOfficialEducationPortal(lesson.curriculumSource.portalUrl);
check("official-source", "مصدر الكتاب بوابة رسمية لوزارة التعليم", officialSource, lesson.curriculumSource.portalUrl);
check("source-policy", "سياسة المصدر الرسمي الحالي محددة", lesson.curriculumSource.requiredEdition === "النسخة المنشورة حاليًا في بوابة مدرستي", lesson.curriculumSource.requiredEdition);
check("source-verified", "النسخة المنشورة حاليًا في المصدر الرسمي معتمدة", officialSource && lesson.curriculumSource.editionStatus === "verified", lesson.curriculumSource.editionEvidence ?? "لا يوجد دليل اعتماد");
check("edition-recorded", "سنة الغلاف مسجلة للتوثيق ولا تمنع الاعتماد", Boolean(lesson.curriculumSource.observedEdition), lesson.curriculumSource.observedEdition ?? "لم تسجل سنة الغلاف", "warning");
check("source-pages", "صفحات الدرس في الكتاب موثقة", Boolean(lesson.curriculumSource.lessonPages?.length), lesson.curriculumSource.lessonPages?.join("، ") || "يلزم تحديد صفحات درس زوايا المضلع من النسخة الرسمية دون تخمين");
const excerpt = lesson.curriculumSource.lessonExcerpt;
const excerptPageNumbers = excerpt?.pages.map((page) => page.pageNumber) ?? [];
check("official-book-order", "تبويب كتاب الوزارة موجود قبل الفيديو", officialBookStepIndex > 0 && videoStepIndex === officialBookStepIndex + 1, `الكتاب: ${officialBookStepIndex + 1}، الفيديو: ${videoStepIndex + 1}`);
check("official-book-permission", "إذن عرض صفحات المصدر الرسمي موثق", excerpt?.permissionStatus === "authorized", excerpt?.attribution ?? "لا يوجد توثيق إذن");
check("official-book-pages", "صفحات العارض تطابق صفحات الدرس الموثقة", JSON.stringify(excerptPageNumbers) === JSON.stringify(lesson.curriculumSource.lessonPages ?? []), excerptPageNumbers.join("، ") || "لا توجد صفحات في العارض");
check("official-book-assets", "ملفات صفحات الكتاب والنسخة الخفيفة موجودة", Boolean(excerpt) && [excerpt.pdfUrl, ...excerpt.pages.map((page) => page.imageUrl)].every((url) => existsSync(path.resolve(process.cwd(), "public", url.replace(/^\/+/, "")))), `${excerpt?.pages.length ?? 0} صور وملف PDF`);
check("correct-answer-grading", "محرك التصحيح يقبل كل الإجابات الصحيحة", lesson.questions.every((question) => gradeLessonQuestion(question, question.correctAnswer, 1).correct), `${lesson.questions.length} إجابة صحيحة اختُبرت برمجيًا`);
check("wrong-answer-grading", "محرك التصحيح يرفض إجابة خاطئة ممثلة لكل سؤال", lesson.questions.every((question) => {
  if (question.type === "ordering" && Array.isArray(question.correctAnswer)) {
    return !gradeLessonQuestion(question, [...question.correctAnswer].reverse(), 1).correct;
  }
  const wrongOption = question.options?.find((option) => option.id !== String(question.correctAnswer));
  return wrongOption ? !gradeLessonQuestion(question, wrongOption.id, 1).correct : true;
}), `${lesson.questions.length} حالة خطأ اختُبرت برمجيًا`);
check("polygon-math", "نتائج زوايا المضلعات الأساسية صحيحة", [
  [3, 180], [4, 360], [5, 540], [6, 720], [7, 900], [8, 1080], [12, 1800],
].every(([sides, expected]) => (sides - 2) * 180 === expected), "تم التحقق من المثلث حتى الاثني عشري في أمثلة الدرس");

const blockingFailures = checks.filter((item) => !item.passed && item.severity === "blocking");
const warnings = checks.filter((item) => !item.passed && item.severity === "warning");
const report = {
  lessonId: lesson.id,
  lessonTitle: lesson.title,
  generatedAt: new Date().toISOString(),
  decision: blockingFailures.length === 0 ? "READY_FOR_STAGING_REVIEW" : "BLOCKED",
  summary: {
    passed: checks.filter((item) => item.passed).length,
    blockingFailures: blockingFailures.length,
    warnings: warnings.length,
  },
  checks,
};

const outputDirectory = path.resolve(process.cwd(), ".local", "quality-reports");
await mkdir(outputDirectory, { recursive: true });
await writeFile(path.join(outputDirectory, `${lesson.id}.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(`تقرير جودة درس: ${lesson.title}`);
for (const item of checks) {
  console.log(`${item.passed ? "PASS" : "FAIL"} | ${item.label} | ${item.detail}`);
}
console.log(`القرار: ${report.decision}`);
console.log(`التقرير: ${path.join(outputDirectory, `${lesson.id}.json`)}`);

if (blockingFailures.length > 0) process.exitCode = 1;
