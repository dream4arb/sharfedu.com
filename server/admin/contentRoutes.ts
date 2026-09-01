import { Router } from "express";
import fs from "fs";
import { access, readFile, readdir } from "fs/promises";
import path from "path";
import { getDirname } from "../resolve-dir";
import * as storage from "./contentStorage";
import * as cmsStorage from "./cmsStorage";
import rateLimit from "express-rate-limit";
import { requireAdmin } from "../middleware/adminAuth";

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}
async function readTextFile(p: string): Promise<string> {
  return readFile(p, "utf-8");
}

const __dirname = getDirname();
const attachedRoot = path.resolve(__dirname, "..", "..", "attached_assets");

const router = Router();
const generationLimiter = rateLimit({ windowMs: 30 * 60_000, limit: 6, standardHeaders: true, legacyHeaders: false });

/**
 * GET /api/content/lesson/:lessonId/tab/:tabType
 * يُرجع محتوى التبويب من جدول cms_content (contentType + dataValue)
 * للاستخدام في الواجهة الأمامية لعرض المحتوى بناءً على lesson_id و tab_type
 */
router.get("/lesson/:lessonId/tab/:tabType", async (req, res) => {
  try {
    const { lessonId, tabType } = req.params;
    let data: { contentType: string; dataValue: string } | null = null;
    try {
      data = await cmsStorage.getCmsContentFull(lessonId, tabType);
    } catch (_) {
      /* جدول cms_content قد يكون غير موجود */
    }
    if (data) {
      res.json(data);
      return;
    }
    res.status(404).json({ message: "لا يوجد محتوى من CMS لهذا التبويب." });
  } catch (e) {
    console.error("Content tab fetch error:", e);
    res.status(500).json({ message: "خطأ في جلب محتوى التبويب." });
  }
});

/**
 * GET /api/content/lesson/:lessonId/education-html
 * يُرجع HTML التعلم من DB، وإلا من الملف الثابت .../html/lessons/{id}-education.html
 */
router.get("/lesson/:lessonId/education-html", async (req, res) => {
  try {
    const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
    if (!lessonId || !/^[a-zA-Z0-9_-]{1,80}$/.test(lessonId)) {
      return res.status(400).json({ message: "معرّف الدرس غير صالح." });
    }
    let html: string | null = null;
    try {
      const cms = await cmsStorage.getCmsContent(lessonId, "education");
      if (cms && cms.trim().length > 0) html = cms;
    } catch (_) { /* جدول cms_content قد يكون غير موجود */ }
    if (!html) try {
      html = await storage.getLessonHtml(lessonId);
    } catch (_) {
      /* جدول admin_lesson_html قد يكون غير موجود — نعتمد الملف الثابت */
    }
    if (html != null && html.length > 0) {
      res.type("text/html").send(html);
      return;
    }
    const fallbackPath = path.join(
      attachedRoot,
      "html",
      "lessons",
      `${lessonId}-education.html`
    );
    if (await fileExists(fallbackPath)) {
      const raw = await readTextFile(fallbackPath);
      res.type("text/html").send(raw);
      return;
    }
    res.status(404).json({ message: "لم يُعثر على محتوى التعليم لهذا الدرس." });
  } catch (e) {
    console.error("Content education-html error:", e);
    res.status(500).json({ message: "خطأ في جلب محتوى التعليم." });
  }
});

/**
 * GET /api/content/lesson/:lessonId/ssa-html
 * يُرجع HTML SSA: من ملف {id}-ssa.html إن وُجد، وإلا يُرجع نفس محتوى education-html
 */
router.get("/lesson/:lessonId/ssa-html", async (req, res) => {
  const iframeFix = `<style>html,body{max-width:100%!important;overflow-x:hidden!important;width:100%!important;margin:0!important;padding:0!important}*{box-sizing:border-box!important}img,video,canvas,svg,table,iframe{max-width:100%!important}pre,code{overflow-x:auto!important;white-space:pre-wrap!important;word-break:break-word!important}</style><script>function _sh(){var els=document.body.children;var h=0;for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();var b=r.top+r.height+window.scrollY;if(b>h)h=b}h=Math.ceil(h);if(h<100)h=document.documentElement.scrollHeight;window.parent.postMessage({type:"sharef-iframe-height",height:h},"*")}window.addEventListener("load",function(){_sh();setTimeout(_sh,300);setTimeout(_sh,1000);new ResizeObserver(_sh).observe(document.body)});</script>`;
  const fixBadge = (html: string) => {
    return html
      .replace(/شارف\s*AI\s*[✨⭐🌟💫]*\s*تم التوليد تلقائياً/g, "✨ منصة شارف التعليمية")
      .replace(/●?\s*شارف\s*AI\s*[✨⭐🌟💫]+\s*تم التوليد[^<]*/g, "✨ منصة شارف التعليمية");
  };
  const injectFix = (html: string) => {
    const fixed = fixBadge(html);
    if (fixed.includes("</head>")) return fixed.replace("</head>", iframeFix + "</head>");
    if (fixed.includes("<body")) return fixed.replace("<body", iframeFix + "<body");
    return iframeFix + fixed;
  };
  try {
    const { lessonId } = req.params;

    try {
      const cms = await cmsStorage.getCmsContent(lessonId, "education");
      if (cms && cms.trim().length > 0) {
        res.type("text/html").send(injectFix(cms));
        return;
      }
    } catch (_) {}

    const pathsToTry = [
      path.resolve(attachedRoot, "html", "lessons", `${lessonId}-ssa.html`),
      path.resolve(process.cwd(), "attached_assets", "html", "lessons", `${lessonId}-ssa.html`),
    ];
    for (const ssaPath of pathsToTry) {
      if (await fileExists(ssaPath)) {
        const raw = await readTextFile(ssaPath);
        res.type("text/html").send(injectFix(raw));
        return;
      }
    }

    let html: string | null = null;
    try {
      html = await storage.getLessonHtml(lessonId);
    } catch (_) {}
    if (html != null && html.length > 0) {
      res.type("text/html").send(injectFix(html));
      return;
    }
    const eduPaths = [
      path.resolve(attachedRoot, "html", "lessons", `${lessonId}-education.html`),
      path.resolve(process.cwd(), "attached_assets", "html", "lessons", `${lessonId}-education.html`),
    ];
    for (const educationPath of eduPaths) {
      if (await fileExists(educationPath)) {
        const raw = await readTextFile(educationPath);
        res.type("text/html").send(injectFix(raw));
        return;
      }
    }
    res.status(404).json({ message: "لم يُعثر على محتوى SSA لهذا الدرس." });
  } catch (e) {
    console.error("Content ssa-html error:", e);
    res.status(500).json({ message: "خطأ في جلب محتوى SSA." });
  }
});

/**
 * GET /api/content/lesson/:lessonId/json?key=questions
 * يُرجع JSON من DB، وإلا من الملف الثابت .../json/lessons/{id}-questions.json عند key=questions
 */
router.get("/lesson/:lessonId/json", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const key = (req.query.key as string) || "questions";
    let data: string | null = null;
    if (key === "questions") {
      try {
        const cms = await cmsStorage.getCmsContent(lessonId, "questions");
        if (cms && cms.trim().length > 0) data = cms;
      } catch (_) { /* جدول cms_content قد يكون غير موجود */ }
    }
    if (!data) try {
      data = await storage.getLessonJson(lessonId, key);
    } catch (_) {
      /* جدول admin_lesson_json قد يكون غير موجود — نعتمد الملف الثابت */
    }
    if (data != null && data.length > 0) {
      res.type("application/json").send(data);
      return;
    }
    if (key === "questions") {
      const fallbackPath = path.join(
        attachedRoot,
        "json",
        "lessons",
        `${lessonId}-questions.json`
      );
      if (await fileExists(fallbackPath)) {
        const raw = await readTextFile(fallbackPath);
        res.type("application/json").send(raw);
        return;
      }
    }
    res.status(404).json({ message: "لم يُعثر على بيانات JSON لهذا الدرس." });
  } catch (e) {
    console.error("Content JSON error:", e);
    res.status(500).json({ message: "خطأ في جلب بيانات JSON." });
  }
});

router.get("/lesson/:lessonId/has-pdf", async (req, res) => {
  try {
    const content = await cmsStorage.getCmsContentFull(req.params.lessonId, "lesson");
    const hasPdf = !!(content && content.contentType === "pdf" && content.dataValue);
    res.json({ hasPdf });
  } catch {
    res.json({ hasPdf: false });
  }
});

router.post("/lesson/:lessonId/regenerate-ssa", requireAdmin, generationLimiter, async (req, res) => {
  try {
    const lessonId = Array.isArray(req.params.lessonId) ? req.params.lessonId[0] : req.params.lessonId;
    if (!lessonId || !/^[a-zA-Z0-9_-]{1,80}$/.test(lessonId)) {
      return res.status(400).json({ message: "معرّف الدرس غير صالح." });
    }
    
    // 1. مسح المحتوى القديم فوراً من قاعدة البيانات لضمان عدم استرجاعه
    await cmsStorage.deleteCmsContentByLesson(lessonId, "education");
    
    // 2. محاولة جلب ملف الـ PDF من تبويب الدرس أو المحتوى الأصلي
    let content = await cmsStorage.getCmsContentFull(lessonId, "lesson");
    
    // إذا لم يجد PDF في تبويب الدرس، نحاول البحث عن أي ملف PDF مرتبط بالدرس في النظام
    if (!content || content.contentType !== "pdf" || !content.dataValue) {
      // محاولة البحث في المسارات الافتراضية للملفات المرفقة
      const { resolve } = await import("path");
      const { access } = await import("fs/promises");

      const possiblePdfPaths = [
        resolve(process.cwd(), "attached_assets", "pdfs", `${lessonId}.pdf`),
        resolve(process.cwd(), "attached_assets", "lessons", `${lessonId}.pdf`),
        resolve(process.cwd(), "attached_assets", "uploads", `${lessonId}.pdf`),
        // تجربة البحث عن أي ملف ينتهي بـ lessonId في مجلد الـ uploads
        ... (await (async () => {
             try {
               const uploadsDir = resolve(process.cwd(), "attached_assets", "uploads");
               const files = await readdir(uploadsDir);
               const match = files.find(f => f.includes(lessonId) && f.endsWith(".pdf"));
               return match ? [resolve(uploadsDir, match)] : [];
             } catch { return []; }
        })())
      ];

      let foundPath = null;
      for (const p of possiblePdfPaths) {
        try {
          await access(p);
          foundPath = p;
          break;
        } catch {}
      }

      if (foundPath) {
        // تحويل المسار المطلق لمسار نسبي يفهمه النظام
        const relativePath = foundPath.includes("attached_assets") 
          ? "/attached_assets/" + foundPath.split("attached_assets/")[1]
          : foundPath;
        content = { contentType: "pdf", dataValue: relativePath };
      } else {
        return res.status(400).json({ message: "لا يوجد ملف PDF مرتبط بهذا الدرس للقيام بعملية التوليد" });
      }
    }

    let pdfPath = content.dataValue;
    if (pdfPath.startsWith("/attached_assets/") || !pdfPath.startsWith("/")) {
      const { resolveAttachedAssetPath } = await import("../resolve-dir");
      pdfPath = resolveAttachedAssetPath(pdfPath);
    }
    const { generateLessonHtmlFromPdf } = await import("../lib/generateLessonHtml");
    
    // 3. بدء عملية التوليد في الخلفية
    generateLessonHtmlFromPdf({ lessonId, pdfPath, isRegeneration: true }).then((r) => {
      if (!r.success) console.error(`[شارف AI] regenerate failed: ${r.message}`);
    });
    
    res.json({ ok: true, message: "تم مسح المحتوى القديم وبدأ التوليد الجديد" });
  } catch (e: any) {
    console.error("Regenerate SSA error:", e);
    res.status(500).json({ message: e?.message || "خطأ داخلي في الخادم" });
  }
});

router.get("/lesson/:lessonId/ssa-status", async (req, res) => {
  try {
    const { getGenerationStatus } = await import("../lib/generateLessonHtml");
    const inMemoryStatus = getGenerationStatus(req.params.lessonId);
    if (inMemoryStatus && inMemoryStatus.status === "generating") {
      res.json(inMemoryStatus);
      return;
    }
    const existing = await cmsStorage.getCmsContent(req.params.lessonId, "education");
    if (existing && existing.trim().length > 100) {
      res.json({ status: "done", updatedAt: Date.now() });
      return;
    }
    res.json(inMemoryStatus || { status: "idle" });
  } catch {
    res.json({ status: "idle" });
  }
});

export default router;
