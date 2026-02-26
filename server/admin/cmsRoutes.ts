import { Router, type Request } from "express";
import * as cmsStorage from "./cmsStorage";
import {
  getStages,
  getGrades,
  getSubjects,
  getSemesters,
  getChapters,
  getLessons,
  getAllLessons,
  getLessonFullInfo,
  getAllSeoPaths,
  getFullHierarchy,
  setCurrentHierarchy,
} from "../data/cms-hierarchy";
import { saveHierarchyToDb } from "./hierarchyStore";
import multer from "multer";
import path from "path";
import { mkdir } from "fs/promises";
import { getDirname } from "../resolve-dir";

const __dirname = getDirname();

const uploadsDir = path.join(__dirname, "..", "..", "attached_assets", "uploads");
mkdir(uploadsDir, { recursive: true }).catch(() => {});

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || ".pdf";
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("نوع الملف غير مسموح به."));
    }
    cb(null, true);
  },
});

const router = Router();

// الهيكل الكامل
router.get("/hierarchy", (_req, res) => {
  res.json({
    stages: getStages(),
  });
});

router.get("/grades", (req, res) => {
  const stage = req.query.stage as string;
  if (!stage) return res.status(400).json({ message: "stage مطلوب" });
  res.json(getGrades(stage));
});

router.get("/subjects", (req, res) => {
  const stage = req.query.stage as string;
  const grade = req.query.grade as string;
  if (!stage || !grade) return res.status(400).json({ message: "stage و grade مطلوبان" });
  res.json(getSubjects(stage, grade));
});

router.get("/semesters", (req, res) => {
  const stage = req.query.stage as string;
  const grade = req.query.grade as string;
  const subject = req.query.subject as string;
  if (!stage || !grade || !subject) return res.status(400).json({ message: "stage و grade و subject مطلوبة" });
  res.json(getSemesters(stage, grade, subject));
});

router.get("/chapters", (req, res) => {
  const stage = req.query.stage as string;
  const grade = req.query.grade as string;
  const subject = req.query.subject as string;
  const semester = req.query.semester as string;
  if (!stage || !grade || !subject || !semester) return res.status(400).json({ message: "stage و grade و subject و semester مطلوبة" });
  res.json(getChapters(stage, grade, subject, semester));
});

router.get("/lessons", (req, res) => {
  const stage = req.query.stage as string;
  const grade = req.query.grade as string;
  const subject = req.query.subject as string;
  const semester = req.query.semester as string;
  const chapter = req.query.chapter as string;
  if (!stage || !grade || !subject || !semester || !chapter)
    return res.status(400).json({ message: "stage و grade و subject و semester و chapter مطلوبة" });
  res.json(getLessons(stage, grade, subject, semester, chapter));
});

router.get("/lessons/flat", (_req, res) => {
  res.json(getAllLessons());
});

// إدارة الهيكلية الدراسية
router.get("/structure", (_req, res) => {
  res.json(getFullHierarchy());
});

router.put("/structure", async (req, res) => {
  try {
    const hierarchy = req.body;
    if (!Array.isArray(hierarchy)) return res.status(400).json({ message: "الهيكل يجب أن يكون مصفوفة" });
    await saveHierarchyToDb(hierarchy);
    setCurrentHierarchy(hierarchy);
    res.json({ ok: true });
  } catch (e) {
    console.error("Structure save:", e);
    res.status(500).json({ message: "خطأ في حفظ الهيكلية" });
  }
});

router.get("/seo-paths", (_req, res) => {
  res.json(getAllSeoPaths());
});

router.get("/seo-pages-with-content", async (_req, res) => {
  try {
    const pages = await cmsStorage.getSeoPagesWithContent();
    res.json(pages);
  } catch (e) {
    console.error("seo-pages-with-content:", e);
    res.json([]);
  }
});

// استيراد المحتوى القديم (ملفات + جداول) إلى cms_content
router.post("/content/import-legacy", async (_req, res) => {
  try {
    const { runLegacyMigration } = await import("./legacyMigration");
    const result = await runLegacyMigration();
    res.json({ ok: true, ...result });
  } catch (e) {
    console.error("Import legacy:", e);
    res.status(500).json({ message: "خطأ في استيراد المحتوى القديم" });
  }
});

// قائمة المحتوى المرفوع مع فلترة
router.get("/content/list", async (_req, res) => {
  try {
    const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "") || undefined;
    const stageSlug = clean(_req.query.stage);
    const gradeId = clean(_req.query.grade);
    const subjectSlug = clean(_req.query.subject);
    const semesterId = clean(_req.query.semester);
    const chapterId = clean(_req.query.chapter);
    const lessonId = clean(_req.query.lesson);
    const tabType = clean(_req.query.tabType);
    const hasFilters = !!(stageSlug || gradeId || subjectSlug || semesterId || chapterId || lessonId || tabType);
    const list = await cmsStorage.listCmsContent(
      hasFilters ? { stageSlug, gradeId, subjectSlug, semesterId, chapterId, lessonId, tabType } : undefined
    );
    res.json(Array.isArray(list) ? list : []);
  } catch (e) {
    console.error("CMS list content:", e);
    res.json([]);
  }
});

// جلب محتوى بالمعرف للتعديل
router.get("/content/by-id/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
    const row = await cmsStorage.getCmsContentById(id);
    if (!row) return res.status(404).json({ message: "المحتوى غير موجود" });
    const lessonInfo = getLessonFullInfo(row.lessonId);
    res.json({
      ...row,
      stageSlug: lessonInfo?.stageSlug,
      gradeId: lessonInfo?.gradeId,
      subjectSlug: lessonInfo?.subjectSlug,
      semesterId: lessonInfo?.semesterId,
      chapterId: lessonInfo?.chapterId,
      lessonTitle: lessonInfo?.lessonTitle,
    });
  } catch (e) {
    console.error("CMS get by id:", e);
    res.status(500).json({ message: "خطأ في جلب المحتوى" });
  }
});

// حذف محتوى
router.delete("/content/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: "معرف غير صالح" });
    const ok = await cmsStorage.deleteCmsContent(id);
    if (!ok) return res.status(404).json({ message: "المحتوى غير موجود" });
    res.json({ ok: true });
  } catch (e) {
    console.error("CMS delete:", e);
    res.status(500).json({ message: "خطأ في الحذف" });
  }
});

// المحتوى
router.get("/content", async (req, res) => {
  try {
    const lessonId = req.query.lessonId as string;
    const tabType = req.query.tabType as string;
    if (!lessonId || !tabType) return res.status(400).json({ message: "lessonId و tabType مطلوبان" });
    const value = await cmsStorage.getCmsContent(lessonId, tabType);
    res.json({ data: value });
  } catch (e) {
    console.error("CMS get content:", e);
    res.status(500).json({ message: "خطأ في جلب المحتوى" });
  }
});

router.post("/content", async (req, res) => {
  try {
    const { lessonId, tabType, contentType, dataValue } = req.body;
    if (!lessonId || !tabType || !contentType || dataValue == null)
      return res.status(400).json({ message: "lessonId و tabType و contentType و dataValue مطلوبة" });
    await cmsStorage.upsertCmsContent({
      lessonId: String(lessonId),
      tabType: String(tabType),
      contentType: String(contentType),
      dataValue: typeof dataValue === "string" ? dataValue : JSON.stringify(dataValue),
    });
    res.json({ ok: true });
  } catch (e) {
    console.error("CMS save content:", e);
    res.status(500).json({ message: "خطأ في حفظ المحتوى" });
  }
});

router.post("/content/upload", upload.single("file"), async (req: Request & { file?: { filename: string; mimetype: string } }, res) => {
  try {
    const file = req.file;
    const { lessonId, tabType } = req.body;
    if (!file || !lessonId || !tabType) return res.status(400).json({ message: "ملف و lessonId و tabType مطلوبة" });
    const url = `/attached_assets/uploads/${file.filename}`;
    const contentType = file.mimetype === "application/pdf" ? "pdf" : "image";
    await cmsStorage.upsertCmsContent({
      lessonId: String(lessonId),
      tabType: String(tabType),
      contentType,
      dataValue: url,
    });
    res.json({ ok: true, url });
  } catch (e) {
    console.error("CMS upload:", e);
    res.status(500).json({ message: "خطأ في الرفع" });
  }
});

export default router;
