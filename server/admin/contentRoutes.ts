import { Router } from "express";
import { access, readFile } from "fs/promises";
import path from "path";
import { getDirname } from "../resolve-dir";
import * as storage from "./contentStorage";
import * as cmsStorage from "./cmsStorage";

async function fileExists(p: string): Promise<boolean> {
  try { await access(p); return true; } catch { return false; }
}
async function readTextFile(p: string): Promise<string> {
  return readFile(p, "utf-8");
}

const __dirname = getDirname();
const attachedRoot = path.resolve(__dirname, "..", "attached_assets");

const router = Router();

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
    const { lessonId } = req.params;
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
  const injectFix = (html: string) => {
    if (html.includes("</head>")) return html.replace("</head>", iframeFix + "</head>");
    if (html.includes("<body")) return html.replace("<body", iframeFix + "<body");
    return iframeFix + html;
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

export default router;
