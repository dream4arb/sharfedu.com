import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { lessonRegistry } from "../shared/lesson-engine/registry";
import { gradeLessonQuestion } from "../shared/lesson-engine/grade";
import type { InteractiveLessonDefinition } from "../shared/lesson-engine/types";

type Check = {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  severity: "blocking" | "warning";
};

function unique(values: string[]) {
  return new Set(values).size === values.length;
}

function isOfficialEducationPortal(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "moe.gov.sa" || url.hostname.endsWith(".moe.gov.sa"));
  } catch {
    return false;
  }
}

function validateLesson(lesson: InteractiveLessonDefinition) {
  const checks: Check[] = [];
  const check = (id: string, label: string, passed: boolean, detail: string, severity: Check["severity"] = "blocking") => {
    checks.push({ id, label, passed, detail, severity });
  };

  const skillIds = lesson.skills.map((skill) => skill.id);
  const questionIds = lesson.questions.map((question) => question.id);
  const stepIds = lesson.steps.map((step) => step.id);
  const videoIds = (lesson.videos ?? []).map((video) => video.id);
  const referencedQuestionIds = lesson.steps.flatMap((step) => step.questionIds ?? []);
  const assessmentStepIndex = lesson.steps.findIndex((step) => step.type === "assessment");
  const reportStepIndex = lesson.steps.findIndex((step) => step.type === "report");
  const officialBookStepIndex = lesson.steps.findIndex((step) => step.type === "official_book");
  const videoStepIndex = lesson.steps.findIndex((step) => step.type === "video");
  const assessedSkills = new Set(lesson.assessmentQuestionIds.map((questionId) => lesson.questions.find((question) => question.id === questionId)?.skillId).filter((skillId): skillId is string => Boolean(skillId)));

  check("unique-skills", "معرّفات المهارات غير مكررة", unique(skillIds), `${skillIds.length} مهارات`);
  check("unique-questions", "معرّفات الأسئلة غير مكررة", unique(questionIds), `${questionIds.length} أسئلة`);
  check("unique-steps", "معرّفات خطوات الرحلة غير مكررة", unique(stepIds), `${stepIds.length} خطوات`);
  check("unique-videos", "معرّفات الفيديو غير مكررة", unique(videoIds), `${videoIds.length} فيديو`);
  check("journey-order", "رحلة الدرس تنتهي باختبار ثم تقرير", assessmentStepIndex >= 0 && reportStepIndex === assessmentStepIndex + 1, `الاختبار ${assessmentStepIndex + 1}، التقرير ${reportStepIndex + 1}`);
  check("question-references", "كل سؤال مستخدم في الرحلة موجود", referencedQuestionIds.every((id) => questionIds.includes(id)), "لا توجد مراجع مفقودة");
  check("assessment-references", "كل سؤال في الاختبار موجود", lesson.assessmentQuestionIds.every((id) => questionIds.includes(id)), `${lesson.assessmentQuestionIds.length} أسئلة نهائية`);
  check("assessment-only-questions", "جميع الأسئلة محصورة في اختبار الدرس", lesson.steps.every((step) => step.type === "assessment" || !(step.questionIds?.length)), `الشرح حتى الخطوة ${assessmentStepIndex} بلا أسئلة`);
  check("assessment-skills", "الاختبار يغطي جميع المهارات", skillIds.every((id) => assessedSkills.has(id)), `${assessedSkills.size} من ${skillIds.length} مهارات`);
  check("non-written-questions", "لا توجد إجابات كتابية", lesson.questions.every((question) => !["numeric", "short_answer"].includes(question.type)), "اختيار، صح/خطأ، وترتيب فقط");
  check("question-feedback", "لكل سؤال تغذية راجعة تعليمية", lesson.questions.every((question) => Boolean(question.correctFeedback.trim()) && Boolean(question.defaultIncorrectFeedback.trim())), "الصحيح والخطأ مفسران");
  check("question-options", "خيارات الأسئلة متوافقة مع الإجابات", lesson.questions.every((question) => {
    if (question.type === "ordering") {
      const optionIds = new Set(question.options?.map((option) => option.id) ?? []);
      return Array.isArray(question.correctAnswer) && question.correctAnswer.every((answer) => optionIds.has(answer));
    }
    if (["multiple_choice", "true_false"].includes(question.type)) {
      const expected = question.type === "true_false" ? String(question.correctAnswer) : question.correctAnswer;
      return question.options?.some((option) => option.id === expected) ?? false;
    }
    return true;
  }), "كل إجابة موجودة ضمن الخيارات");
  check("visual-learning", "يتضمن الدرس نشاطين بصريين على الأقل", lesson.steps.filter((step) => Boolean(step.visualKind)).length >= 2, `${lesson.steps.filter((step) => Boolean(step.visualKind)).length} أنشطة بصرية`);
  check("video-limit", "عدد الشروحات لا يتجاوز أربعة", (lesson.videos?.length ?? 0) <= 4, `${lesson.videos?.length ?? 0} فيديو`);
  check("teacher-claim", "الملخص لا يدّعي اعتمادًا غير موجود", lesson.teacherSummary.status === "teacher_reviewed" || /بانتظار اعتماد/.test(lesson.teacherSummary.attribution), lesson.teacherSummary.attribution);
  check("tutor-grounding", "معرفة المعلم مرتبطة بالدرس", lesson.tutorKnowledge.approvedFacts.length >= 5 && lesson.tutorKnowledge.socraticPrompts.length >= 3, `${lesson.tutorKnowledge.approvedFacts.length} حقائق و${lesson.tutorKnowledge.socraticPrompts.length} أسئلة سقراطية`);

  const officialSource = isOfficialEducationPortal(lesson.curriculumSource.portalUrl);
  check("official-source", "مصدر الكتاب بوابة رسمية لوزارة التعليم", officialSource, lesson.curriculumSource.portalUrl);
  check("source-policy", "سياسة النسخة الرسمية الحالية محددة", lesson.curriculumSource.requiredEdition === "النسخة المنشورة حاليًا في بوابة مدرستي", lesson.curriculumSource.requiredEdition);
  check("source-verified", "المصدر الرسمي معتمد", officialSource && lesson.curriculumSource.editionStatus === "verified", lesson.curriculumSource.editionEvidence ?? "لا يوجد دليل اعتماد");
  check("official-book-order", "مرجع الكتاب موجود قبل الفيديو", officialBookStepIndex > 0 && videoStepIndex === officialBookStepIndex + 1, `الكتاب ${officialBookStepIndex + 1}، الفيديو ${videoStepIndex + 1}`);

  const excerpt = lesson.curriculumSource.lessonExcerpt;
  if (excerpt) {
    const excerptPageNumbers = excerpt.pages.map((page) => page.pageNumber);
    check("official-book-permission", "إذن عرض صفحات المصدر موثق", excerpt.permissionStatus === "authorized", excerpt.attribution);
    check("official-book-pages", "صفحات العارض تطابق الصفحات الموثقة", JSON.stringify(excerptPageNumbers) === JSON.stringify(lesson.curriculumSource.lessonPages ?? []), excerptPageNumbers.join("، "));
    check("official-book-assets", "ملفات صفحات الكتاب موجودة", [excerpt.pdfUrl, ...excerpt.pages.map((page) => page.imageUrl)].every((url) => existsSync(path.resolve(process.cwd(), "public", url.replace(/^\/+/, "")))), `${excerpt.pages.length} صور وملف PDF`);
  } else {
    check("official-book-excerpt", "نسخة صفحات الدرس المحلية مربوطة", false, "المصدر الرسمي موثق، لكن قص صفحات الدرس وربطها لم يكتمل بعد", "warning");
  }

  check("correct-answer-grading", "محرك التصحيح يقبل جميع الإجابات الصحيحة", lesson.questions.every((question) => gradeLessonQuestion(question, question.correctAnswer, 1).correct), `${lesson.questions.length} حالات صحيحة`);
  check("wrong-answer-grading", "محرك التصحيح يرفض حالة خطأ لكل سؤال", lesson.questions.every((question) => {
    if (question.type === "ordering" && Array.isArray(question.correctAnswer)) return !gradeLessonQuestion(question, [...question.correctAnswer].reverse(), 1).correct;
    const wrongOption = question.options?.find((option) => option.id !== String(question.correctAnswer));
    const wrongAnswer = question.type === "true_false" ? !question.correctAnswer : wrongOption?.id;
    return wrongAnswer === undefined ? true : !gradeLessonQuestion(question, wrongAnswer, 1).correct;
  }), `${lesson.questions.length} حالات خطأ`);

  const blockingFailures = checks.filter((item) => !item.passed && item.severity === "blocking");
  const warnings = checks.filter((item) => !item.passed && item.severity === "warning");
  return {
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    generatedAt: new Date().toISOString(),
    decision: blockingFailures.length === 0 ? "READY_FOR_STAGING_REVIEW" : "BLOCKED",
    summary: { passed: checks.filter((item) => item.passed).length, blockingFailures: blockingFailures.length, warnings: warnings.length },
    checks,
  };
}

const outputDirectory = path.resolve(process.cwd(), ".local", "quality-reports");
await mkdir(outputDirectory, { recursive: true });

let blocked = false;
for (const { lesson } of Object.values(lessonRegistry)) {
  const report = validateLesson(lesson);
  await writeFile(path.join(outputDirectory, `${lesson.id}.json`), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`\nتقرير جودة درس: ${lesson.title}`);
  for (const item of report.checks) {
    const marker = item.passed ? "PASS" : item.severity === "warning" ? "WARN" : "FAIL";
    console.log(`${marker} | ${item.label} | ${item.detail}`);
  }
  console.log(`القرار: ${report.decision}`);
  if (report.decision === "BLOCKED") blocked = true;
}

if (blocked) process.exitCode = 1;
