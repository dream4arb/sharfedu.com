/**
 * ترحيل المحتوى القديم إلى cms_content (ملفات + admin tables + فيديوهات)
 */
import fs from "fs";
import path from "path";
import { getDirname } from "../resolve-dir";
import { db } from "../db";
import { cmsContent, adminLessonHtml, adminLessonJson } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getAllLessons } from "../data/cms-hierarchy";

const __dirname = getDirname();
const attachedRoot = path.resolve(__dirname, "..", "..", "attached_assets");

const FILE_TO_LESSON_OVERRIDE: Record<string, { lessonId: string; tabType: string }> = {
  "lesson_4-1.pdf": { lessonId: "5-1", tabType: "lesson" },
};

const LESSON_VIDEOS: Record<string, { videoUrl?: string; additionalVideos?: string[] }> = {
  "5-1": {
    videoUrl: "https://www.youtube.com/embed/_l49Ard1--U",
    additionalVideos: [
      "https://www.youtube.com/watch?v=E-ndz2M-yfM",
      "https://www.youtube.com/watch?v=20JoAErwksw",
      "https://www.youtube.com/watch?v=O9-_Yy6l-Ok",
    ],
  },
  "m1-4-1": {
    videoUrl: "https://www.youtube.com/watch?v=2GRQStE-SGo",
    additionalVideos: [
      "https://www.youtube.com/watch?v=77niuMZji3Y",
      "https://www.youtube.com/watch?v=5wyxPLC27RE",
      "https://www.youtube.com/watch?v=vKDGW2jk8C8&t=85s",
      "https://www.youtube.com/watch?v=132EvpZx618&t=432s",
    ],
  },
};

interface LegacyItem {
  lessonId: string;
  tabType: string;
  contentType: string;
  dataValue: string;
}

export async function runLegacyMigration(): Promise<{ imported: number; updated: number }> {
  const validLessonIds = new Set(getAllLessons().map((l) => l.lessonId));
  const items: LegacyItem[] = [];

  function safeReadFile(p: string): string | null {
    try {
      if (fs.existsSync(p)) return fs.readFileSync(p, "utf-8");
    } catch (_) {}
    return null;
  }

  const lessonsDir = path.join(attachedRoot, "lessons");
  if (fs.existsSync(lessonsDir)) {
    for (const f of fs.readdirSync(lessonsDir).filter((x) => x.endsWith(".pdf"))) {
      const override = FILE_TO_LESSON_OVERRIDE[f];
      let lessonId: string;
      let tabType: string;
      if (override) {
        lessonId = override.lessonId;
        tabType = override.tabType;
      } else if (f.endsWith("-summary.pdf")) {
        lessonId = f.replace(/-summary\.pdf$/, "");
        tabType = "summary";
      } else if (f.endsWith("-ratio.pdf")) {
        lessonId = f.replace(/-ratio\.pdf$/, "");
        tabType = "lesson";
      } else if (f.startsWith("lesson_")) {
        lessonId = f.replace(/^lesson_/, "").replace(/\.pdf$/, "");
        tabType = "lesson";
      } else {
        lessonId = f.replace(/\.pdf$/, "");
        tabType = "lesson";
      }
      if (validLessonIds.has(lessonId) || override) {
        items.push({ lessonId, tabType, contentType: "pdf", dataValue: `/attached_assets/lessons/${f}` });
      }
    }
  }

  const htmlDir = path.join(attachedRoot, "html", "lessons");
  if (fs.existsSync(htmlDir)) {
    for (const f of fs.readdirSync(htmlDir).filter((x) => x.endsWith(".html"))) {
      let lessonId: string;
      let tabType: string;
      if (f.endsWith("-education.html")) {
        lessonId = f.replace(/-education\.html$/, "");
        tabType = "education";
      } else if (f.endsWith("-ssa.html")) {
        lessonId = f.replace(/-ssa\.html$/, "");
        tabType = "questions";
      } else {
        lessonId = f.replace(/\.html$/, "");
        tabType = "education";
      }
      const content = safeReadFile(path.join(htmlDir, f));
      if (content && validLessonIds.has(lessonId)) {
        items.push({ lessonId, tabType, contentType: "html", dataValue: content });
      }
    }
  }

  const jsonDir = path.join(attachedRoot, "json", "lessons");
  if (fs.existsSync(jsonDir)) {
    for (const f of fs.readdirSync(jsonDir).filter((x) => x.endsWith("-questions.json"))) {
      const lessonId = f.replace(/-questions\.json$/, "");
      const content = safeReadFile(path.join(jsonDir, f));
      if (content && validLessonIds.has(lessonId)) {
        items.push({ lessonId, tabType: "questions", contentType: "json", dataValue: content });
      }
    }
  }

  try {
    const htmlRows = await db.select().from(adminLessonHtml);
    for (const r of htmlRows) {
      if (r.htmlContent?.trim()) {
        items.push({ lessonId: r.lessonId, tabType: "education", contentType: "html", dataValue: r.htmlContent });
      }
    }
  } catch (_) {}

  try {
    const jsonRows = await db.select().from(adminLessonJson).where(eq(adminLessonJson.jsonKey, "questions"));
    for (const r of jsonRows) {
      if (r.jsonData?.trim()) {
        items.push({ lessonId: r.lessonId, tabType: "questions", contentType: "json", dataValue: r.jsonData });
      }
    }
  } catch (_) {}

  for (const [lessonId, config] of Object.entries(LESSON_VIDEOS)) {
    const urls: string[] = [];
    if (config.videoUrl) urls.push(config.videoUrl);
    if (config.additionalVideos) urls.push(...config.additionalVideos);
    const unique = Array.from(new Set(urls));
    if (unique.length > 0) {
      items.push({ lessonId, tabType: "video", contentType: "youtube", dataValue: unique.join("\n") });
    }
  }

  const seen = new Set<string>();
  const deduped: LegacyItem[] = [];
  for (const item of items) {
    const key = `${item.lessonId}:${item.tabType}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }

  let imported = 0;
  let updated = 0;
  for (const item of deduped) {
    const existing = await db
      .select()
      .from(cmsContent)
      .where(and(eq(cmsContent.lessonId, item.lessonId), eq(cmsContent.tabType, item.tabType)))
      .limit(1);
    if (existing.length > 0) {
      await db
        .update(cmsContent)
        .set({ contentType: item.contentType, dataValue: item.dataValue, updatedAt: new Date() })
        .where(eq(cmsContent.id, existing[0].id));
      updated++;
    } else {
      await db.insert(cmsContent).values(item);
      imported++;
    }
  }
  return { imported, updated };
}
