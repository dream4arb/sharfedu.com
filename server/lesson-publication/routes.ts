import type { Express } from "express";
import { requireAdmin } from "../middleware/adminAuth";
import { getAllLessons, getLessonFullInfo } from "../data/cms-hierarchy";
import { CONTENT_PROFILES, createLessonTemplate, validatePublishableLesson, type ContentProfile } from "../../shared/lesson-engine/publication-package";
import { initialPublicationCatalog } from "../../shared/seo/publication";
import { isUnitPreparation } from "../../shared/curriculum/unit-preparation";
import { getPublicationCatalog, readPublication, writePublication, type PublicationRecord } from "./store";

export function installLessonPublicationRoutes(app: Express) {
  app.get("/api/public/lesson-package/:id", async (req, res, next) => {
    try {
      const entry = (await getPublicationCatalog())[String(req.params.id)];
      res.set("Cache-Control", "no-store");
      if (!entry) return res.status(404).json({ message: "الدرس غير منشور" });
      res.json(entry);
    } catch (error) { next(error); }
  });
  app.get("/api/admin/lesson-publications", requireAdmin, async (_req, res, next) => {
    try {
      const catalog = await getPublicationCatalog();
      res.set("Cache-Control", "no-store").json(getAllLessons().filter(l => !isUnitPreparation(l.lessonId)).map(l => ({
        id: l.lessonId, title: l.title, path: `${l.stage} / ${l.gradeName} / ${l.subject} / ${l.semesterName} / ${l.chapterName}`, published: Boolean(catalog[l.lessonId]),
      })));
    } catch (error) { next(error); }
  });
  app.get("/api/admin/lesson-publications/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = String(req.params.id), info = getLessonFullInfo(id);
      if (!info || isUnitPreparation(id)) return res.status(404).json({ message: "اختر درسًا من الهيكل، وليس تهيئة وحدة" });
      const { record } = await readPublication(id);
      const requested = String(req.query.profile ?? "general");
      const contentProfile = (requested in CONTENT_PROFILES ? requested : "general") as ContentProfile;
      const template = createLessonTemplate({ id, title: info.lessonTitle, stage: info.stageName, grade: info.gradeName, subject: info.subjectName, unit: info.chapterName }, contentProfile);
      res.set("Cache-Control", "no-store").json({ info, revision: record?.revision ?? 0, draft: record?.draft ?? initialPublicationCatalog[id]?.lesson ?? template, published: Boolean(record ? record.published : initialPublicationCatalog[id]), template });
    } catch (error) { next(error); }
  });
  app.post("/api/admin/lesson-publications/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = String(req.params.id), info = getLessonFullInfo(id);
      if (!info || isUnitPreparation(id)) return res.status(404).json({ message: "الدرس غير موجود في الهيكل" });
      if (!["draft", "publish", "withdraw"].includes(req.body.action)) return res.status(400).json({ message: "إجراء غير صالح" });
      const { raw, record } = await readPublication(id);
      if (req.body.revision !== (record?.revision ?? 0)) return res.status(409).json({ message: "عُدّل الدرس في جلسة أخرى؛ أعد تحميله قبل الحفظ" });
      const nextRecord: PublicationRecord = { schemaVersion: 1, revision: (record?.revision ?? 0) + 1, draft: req.body.draft ?? record?.draft ?? initialPublicationCatalog[id]?.lesson, published: record ? record.published : initialPublicationCatalog[id] ?? null };
      if (JSON.stringify(nextRecord.draft ?? null).length > 750000) return res.status(413).json({ message: "محتوى المسودة كبير جدًا" });
      if (req.body.action === "publish") {
        if (req.body.reviewed !== true) return res.status(400).json({ message: "أكد مراجعة المصدر والشرح والفيديو والإجابات قبل النشر" });
        const validation = validatePublishableLesson(nextRecord.draft);
        if (!validation.lesson) return res.status(422).json({ message: "الدرس غير مكتمل للنشر", errors: validation.errors });
        if (validation.lesson.id !== id) return res.status(422).json({ message: "معرّف المحتوى لا يطابق الدرس المختار" });
        const now = new Date().toISOString();
        const lesson = { ...validation.lesson, title: info.lessonTitle, stage: info.stageName, grade: info.gradeName, subject: info.subjectName, unit: info.chapterName };
        nextRecord.draft = lesson;
        nextRecord.published = { lesson, location: { stage: info.stageSlug, grade: info.gradeId, subject: info.subjectSlug }, publishedAt: now };
        nextRecord.reviewedAt = now;
        nextRecord.reviewedBy = String((req.user as any)?.id);
      }
      if (req.body.action === "withdraw") nextRecord.published = null; // Keep draft for recovery; never delete content.
      if (!await writePublication(id, raw, nextRecord)) return res.status(409).json({ message: "تعارض حفظ؛ أعد تحميل الدرس" });
      res.json({ revision: nextRecord.revision, published: Boolean(nextRecord.published), draft: nextRecord.draft, message: req.body.action === "publish" ? "نُشر المحتوى والسيو وخريطة الموقع معًا" : req.body.action === "withdraw" ? "أُلغي النشر مع الاحتفاظ بالمسودة" : "حُفظت المسودة دون تغيير النسخة المنشورة" });
    } catch (error) { next(error); }
  });
}
