import { Router, type Request } from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { getDirname } from "../resolve-dir";
import multer from "multer";
import * as storage from "./contentStorage";
import * as cmsStorage from "./cmsStorage";
import { users } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const __dirname = getDirname();

const uploadsDir = path.join(__dirname, "..", "..", "attached_assets", "uploads");
fs.promises.mkdir(uploadsDir, { recursive: true }).catch(() => {});

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
      const ext = path.extname(file.originalname) || (file.mimetype === "application/pdf" ? ".pdf" : ".png");
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

// إحصائيات المنصة الشاملة
router.get("/overview", async (_req, res) => {
  try {
    const stats = await cmsStorage.getPlatformOverviewStats();
    res.json(stats);
  } catch (e) {
    console.error("Admin overview stats:", e);
    res.status(500).json({ message: "خطأ في جلب إحصائيات المنصة." });
  }
});

// الإحصائيات
router.get("/stats", async (_req, res) => {
  try {
    const [studentCount, completionRate] = await Promise.all([
      storage.getStudentCount(),
      storage.getCompletionRate(),
    ]);
    res.json({ studentCount, completionRate });
  } catch (e) {
    console.error("Admin stats error:", e);
    res.status(500).json({ message: "خطأ في جلب الإحصائيات." });
  }
});

router.put("/stats", async (req, res) => {
  try {
    const { completionRate } = req.body;
    const n = typeof completionRate === "number" ? completionRate : parseFloat(String(completionRate ?? "2"));
    const value = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 2;
    await storage.setPlatformStat("completion_rate", String(value));
    res.json({ completionRate: value });
  } catch (e) {
    console.error("Admin stats update error:", e);
    res.status(500).json({ message: "خطأ في تحديث الإحصائيات." });
  }
});

// إعدادات السنة الدراسية
router.get("/school-year", async (_req, res) => {
  try {
    const [start, end, sem1End] = await Promise.all([
      storage.getPlatformStat("school_year_start"),
      storage.getPlatformStat("school_year_end"),
      storage.getPlatformStat("semester1_end"),
    ]);
    res.json({
      schoolYearStart: start || "2025-08-25",
      schoolYearEnd: end || "2026-06-15",
      semester1End: sem1End || "2025-12-15",
    });
  } catch (e) {
    console.error("School year get:", e);
    res.status(500).json({ message: "خطأ في جلب إعدادات السنة الدراسية." });
  }
});

router.put("/school-year", async (req, res) => {
  try {
    const { schoolYearStart, schoolYearEnd, semester1End } = req.body;
    if (schoolYearStart) await storage.setPlatformStat("school_year_start", String(schoolYearStart));
    if (schoolYearEnd) await storage.setPlatformStat("school_year_end", String(schoolYearEnd));
    if (semester1End) await storage.setPlatformStat("semester1_end", String(semester1End));
    const [start, end, sem1] = await Promise.all([
      storage.getPlatformStat("school_year_start"),
      storage.getPlatformStat("school_year_end"),
      storage.getPlatformStat("semester1_end"),
    ]);
    res.json({
      schoolYearStart: start || "2025-08-25",
      schoolYearEnd: end || "2026-06-15",
      semester1End: sem1 || "2025-12-15",
    });
  } catch (e) {
    console.error("School year update:", e);
    res.status(500).json({ message: "خطأ في تحديث إعدادات السنة الدراسية." });
  }
});

// المرفقات
router.get("/attachments", async (req, res) => {
  try {
    const lessonId = req.query.lessonId as string | undefined;
    const list = await storage.listAttachments(lessonId);
    res.json(list);
  } catch (e) {
    console.error("Admin attachments list error:", e);
    res.status(500).json({ message: "خطأ في جلب المرفقات." });
  }
});

router.post("/attachments", upload.single("file"), async (req: Request & { file?: { originalname: string; mimetype: string; filename: string; path: string } }, res) => {
  try {
    const file = req.file;
    const lessonId = req.body.lessonId as string;
    const label = (req.body.label as string) || "مرفق";
    if (!file || !lessonId) {
      return res.status(400).json({ message: "يجب إرفاق ملف وتحديد معرف الدرس." });
    }

    const MAGIC: Record<string, number[][]> = {
      "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
      "image/png": [[0x89, 0x50, 0x4E, 0x47]],
      "image/jpeg": [[0xFF, 0xD8, 0xFF]],
      "image/gif": [[0x47, 0x49, 0x46, 0x38]],
      "image/webp": [[0x52, 0x49, 0x46, 0x46]],
    };
    const sigs = MAGIC[file.mimetype];
    if (sigs) {
      try {
        const buf = await fs.promises.readFile(file.path);
        const header = Array.from(buf.slice(0, 8));
        const valid = sigs.some(sig => sig.every((b, i) => header[i] === b));
        if (!valid) {
          await fs.promises.unlink(file.path).catch(() => {});
          return res.status(400).json({ message: "محتوى الملف لا يتطابق مع نوعه المُعلن." });
        }
      } catch {}
    }

    const type = file.mimetype === "application/pdf" ? "pdf" : "image";
    const url = `/attached_assets/uploads/${file.filename}`;
    const row = await storage.addAttachment({ lessonId, type, url, label });
    res.status(201).json(row);
  } catch (e) {
    console.error("Admin attachment upload error:", e);
    res.status(500).json({ message: "خطأ في رفع المرفق." });
  }
});

router.delete("/attachments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "معرف غير صالح." });
    await storage.deleteAttachment(id);
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin attachment delete error:", e);
    res.status(500).json({ message: "خطأ في حذف المرفق." });
  }
});

// HTML الدرس
router.get("/lessons/:lessonId/html", async (req, res) => {
  try {
    const html = await storage.getLessonHtml(req.params.lessonId);
    res.json(html != null ? { html } : { html: null });
  } catch (e) {
    console.error("Admin get lesson HTML error:", e);
    res.status(500).json({ message: "خطأ في جلب محتوى HTML." });
  }
});

router.put("/lessons/:lessonId/html", async (req, res) => {
  try {
    const { html } = req.body;
    await storage.setLessonHtml(req.params.lessonId, typeof html === "string" ? html : "");
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin set lesson HTML error:", e);
    res.status(500).json({ message: "خطأ في حفظ محتوى HTML." });
  }
});

// JSON الدرس (أسئلة، منهج، إلخ)
router.get("/lessons/:lessonId/json", async (req, res) => {
  try {
    const key = (req.query.key as string) || "questions";
    const data = await storage.getLessonJson(req.params.lessonId, key);
    res.json(data != null ? { data } : { data: null });
  } catch (e) {
    console.error("Admin get lesson JSON error:", e);
    res.status(500).json({ message: "خطأ في جلب بيانات JSON." });
  }
});

router.put("/lessons/:lessonId/json", async (req, res) => {
  try {
    const key = (req.body.key as string) || "questions";
    const data = typeof req.body.data === "string" ? req.body.data : JSON.stringify(req.body.data ?? {});
    await storage.setLessonJson(req.params.lessonId, key, data);
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin set lesson JSON error:", e);
    res.status(500).json({ message: "خطأ في حفظ بيانات JSON." });
  }
});

// إدارة الأعضاء
router.get("/users", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const all = await db.select().from(users);
    let filtered = all;
    if (q.trim()) {
      const lower = q.toLowerCase().trim();
      filtered = all.filter(
        (u) =>
          u.email?.toLowerCase().includes(lower) ||
          u.firstName?.toLowerCase().includes(lower) ||
          u.lastName?.toLowerCase().includes(lower)
      );
    }
    const list = filtered.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: u.createdAt,
    }));
    res.json(list);
  } catch (e) {
    console.error("Admin users list:", e);
    res.status(500).json({ message: "خطأ في جلب الأعضاء." });
  }
});

router.get("/users/stats", async (req, res) => {
  try {
    const all = await db.select().from(users);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = Math.floor(today.getTime() / 1000);
    const newToday = all.filter((u) => {
      const ct = u.createdAt;
      if (ct == null) return false;
      const ts = ct instanceof Date ? ct.getTime() / 1000 : (ct as number);
      return ts >= todayTs;
    }).length;
    res.json({ total: all.length, newToday });
  } catch (e) {
    console.error("Admin users stats:", e);
    res.status(500).json({ message: "خطأ في الإحصائيات." });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, email, newPassword } = req.body;
    const updates: Record<string, unknown> = {
      firstName: firstName ?? undefined,
      lastName: lastName ?? undefined,
      role: role ?? undefined,
      updatedAt: new Date(),
    };
    if (email != null && String(email).trim() !== "") {
      updates.email = String(email).trim();
    }
    if (newPassword != null && String(newPassword).trim() !== "") {
      updates.password = await bcrypt.hash(String(newPassword).trim(), 10);
    }
    await db
      .update(users)
      .set(updates as Record<string, unknown>)
      .where(eq(users.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin user update:", e);
    res.status(500).json({ message: "خطأ في التحديث." });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(users).where(eq(users.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin user delete:", e);
    res.status(500).json({ message: "خطأ في الحذف." });
  }
});

// إدارة السيو
router.get("/seo", async (_req, res) => {
  try {
    const list = await cmsStorage.listSeo();
    res.json(list);
  } catch (e) {
    console.error("Admin SEO list:", e);
    res.status(500).json({ message: "خطأ في جلب بيانات السيو." });
  }
});

router.get("/seo/by-path", async (req, res) => {
  try {
    const pagePath = (req.query.path as string) || "/";
    const pathNorm = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
    const row = await cmsStorage.getSeo(pathNorm);
    res.json(row ?? { pagePath: pathNorm, title: null, description: null, keywords: null });
  } catch (e) {
    console.error("Admin SEO get:", e);
    res.status(500).json({ message: "خطأ في جلب بيانات السيو." });
  }
});

router.put("/seo", async (req, res) => {
  try {
    const { pagePath, title, description, keywords, ogTitle, ogDescription, ogImage } = req.body;
    if (!pagePath) return res.status(400).json({ message: "pagePath مطلوب" });
    const pathNorm = String(pagePath).startsWith("/") ? String(pagePath) : `/${pagePath}`;
    await cmsStorage.upsertSeo({ pagePath: pathNorm, title, description, keywords, ogTitle, ogDescription, ogImage });
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin SEO save:", e);
    res.status(500).json({ message: "خطأ في حفظ السيو." });
  }
});

export default router;
