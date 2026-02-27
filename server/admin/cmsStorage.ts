import { cmsContent, seoData } from "@shared/schema";
import { db } from "../db";
import { eq, and, desc } from "drizzle-orm";
import { getLessonFullInfo } from "../data/cms-hierarchy";
import fs from "fs";
import path from "path";
import { getDirname } from "../resolve-dir";

const __dirname = getDirname();

export async function upsertCmsContent(data: {
  lessonId: string;
  tabType: string;
  contentType: string;
  dataValue: string;
}) {
  const existing = await db
    .select()
    .from(cmsContent)
    .where(and(eq(cmsContent.lessonId, data.lessonId), eq(cmsContent.tabType, data.tabType)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(cmsContent)
      .set({ contentType: data.contentType, dataValue: data.dataValue, updatedAt: new Date() })
      .where(eq(cmsContent.id, existing[0].id));
  } else {
    await db.insert(cmsContent).values(data);
  }
}

export async function getCmsContent(lessonId: string, tabType: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(cmsContent)
    .where(and(eq(cmsContent.lessonId, lessonId), eq(cmsContent.tabType, tabType)))
    .limit(1);
  return rows[0]?.dataValue ?? null;
}

export async function getCmsContentFull(
  lessonId: string,
  tabType: string
): Promise<{ contentType: string; dataValue: string } | null> {
  const rows = await db
    .select({ contentType: cmsContent.contentType, dataValue: cmsContent.dataValue })
    .from(cmsContent)
    .where(and(eq(cmsContent.lessonId, lessonId), eq(cmsContent.tabType, tabType)))
    .limit(1);
  const row = rows[0];
  return row && row.dataValue ? { contentType: row.contentType, dataValue: row.dataValue } : null;
}

export async function listSeo(): Promise<{ pagePath: string; title: string | null; description: string | null; keywords: string | null; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null }[]> {
  const rows = await db.select().from(seoData);
  return rows.map((r) => ({
    pagePath: r.pagePath,
    title: r.title ?? null,
    description: r.description ?? null,
    keywords: r.keywords ?? null,
    ogTitle: r.ogTitle ?? null,
    ogDescription: r.ogDescription ?? null,
    ogImage: r.ogImage ?? null,
  }));
}

export async function getSeo(pagePath: string) {
  const rows = await db.select().from(seoData).where(eq(seoData.pagePath, pagePath)).limit(1);
  return rows[0] ?? null;
}

/** صفحات لها محتوى مرفوع - للقائمة المنسدلة في SEO */
export async function getSeoPagesWithContent(): Promise<{ value: string; label: string }[]> {
  const staticPages: { value: string; label: string }[] = [
    { value: "/", label: "الرئيسية" },
    { value: "/login", label: "تسجيل الدخول" },
    { value: "/dashboard", label: "لوحة التحكم" },
    { value: "/admin", label: "لوحة تحكم الإدارة" },
    { value: "/stage/elementary", label: "المرحلة الابتدائية" },
    { value: "/stage/middle", label: "المرحلة المتوسطة" },
    { value: "/stage/high", label: "المرحلة الثانوية" },
    { value: "/lesson/elementary/math", label: "الدرس - ابتدائي رياضيات" },
    { value: "/lesson/middle/math", label: "الدرس - متوسط رياضيات" },
    { value: "/lesson/high/math", label: "الدرس - ثانوي رياضيات" },
  ];

  let lessonIds: string[] = [];
  try {
    const rows = await db.select({ lessonId: cmsContent.lessonId }).from(cmsContent);
    lessonIds = Array.from(new Set(rows.map((r) => r.lessonId)));
  } catch {
    return staticPages;
  }

  const lessonPages: { value: string; label: string }[] = [];
  const seen = new Set<string>();

  for (const lessonId of lessonIds) {
    const info = getLessonFullInfo(lessonId);
    if (!info) continue;

    const url = `/lesson/${info.stageSlug}/${info.subjectSlug}/${lessonId}`;
    if (seen.has(url)) continue;
    seen.add(url);

    const label = `${info.stageName} - ${info.subjectName} - ${info.semesterName} - ${info.chapterName} - ${info.lessonTitle}`;
    lessonPages.push({ value: url, label });
  }

  lessonPages.sort((a, b) => a.label.localeCompare(b.label));
  return [...staticPages, ...lessonPages];
}

/**
 * جلب بيانات SEO للمسار الحالي مع التجريب على المسارات الأب عند عدم وجود تطابق.
 * مثال: /lesson/middle/math/m1-4-1 → يجرب ثم /lesson/middle/math ثم /lesson ثم /
 */
export async function getSeoForPath(currentPath: string) {
  const pathNorm = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
  const parts = pathNorm.split("/").filter(Boolean);
  const pathsToTry = [pathNorm];
  for (let i = parts.length - 1; i > 0; i--) {
    pathsToTry.push("/" + parts.slice(0, i).join("/"));
  }
  pathsToTry.push("/");

  for (const p of pathsToTry) {
    const row = await getSeo(p);
    if (row && (row.title || row.description)) return row;
  }
  return null;
}

export interface CmsContentRow {
  id: number;
  lessonId: string;
  tabType: string;
  contentType: string;
  dataValue: string;
  stageName: string;
  gradeName: string;
  subjectName: string;
  semesterName: string;
  chapterName: string;
  lessonTitle: string;
}

function normFilter(v: string | undefined): string | undefined {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" || s === "_" ? undefined : s;
}

export async function listCmsContent(filters?: {
  stageSlug?: string;
  gradeId?: string;
  subjectSlug?: string;
  semesterId?: string;
  chapterId?: string;
  lessonId?: string;
  tabType?: string;
}): Promise<CmsContentRow[]> {
  let rows: { id: number; lessonId: string; tabType: string; contentType: string; dataValue: string }[];
  try {
    rows = await db.select().from(cmsContent).orderBy(desc(cmsContent.updatedAt), desc(cmsContent.id));
  } catch {
    return [];
  }

  const stageSlug = normFilter(filters?.stageSlug);
  const gradeId = normFilter(filters?.gradeId);
  const subjectSlug = normFilter(filters?.subjectSlug);
  const semesterId = normFilter(filters?.semesterId);
  const chapterId = normFilter(filters?.chapterId);
  const lessonIdFilter = normFilter(filters?.lessonId);
  const tabTypeFilter = normFilter(filters?.tabType);

  const lessonCache = new Map<string, ReturnType<typeof getLessonFullInfo>>();

  const result: CmsContentRow[] = [];
  for (const r of rows) {
    let info = lessonCache.get(r.lessonId);
    if (info === undefined) {
      info = getLessonFullInfo(r.lessonId);
      lessonCache.set(r.lessonId, info);
    }

    if (stageSlug || gradeId || subjectSlug || semesterId || chapterId || lessonIdFilter) {
      if (!info) continue;
    }
    if (stageSlug && info?.stageSlug !== stageSlug) continue;
    if (gradeId && info?.gradeId !== gradeId) continue;
    if (subjectSlug && info?.subjectSlug !== subjectSlug) continue;
    if (semesterId && info?.semesterId !== semesterId) continue;
    if (chapterId && info?.chapterId !== chapterId) continue;
    if (lessonIdFilter && r.lessonId !== lessonIdFilter) continue;
    if (tabTypeFilter && r.tabType !== tabTypeFilter) continue;

    result.push({
      id: r.id,
      lessonId: r.lessonId,
      tabType: r.tabType,
      contentType: r.contentType,
      dataValue: r.dataValue,
      stageName: info?.stageName ?? "—",
      gradeName: info?.gradeName ?? "—",
      subjectName: info?.subjectName ?? "—",
      semesterName: info?.semesterName ?? "—",
      chapterName: info?.chapterName ?? "—",
      lessonTitle: info?.lessonTitle ?? r.lessonId,
    });
  }
  // الترتيب من الاستعلام (ORDER BY updatedAt DESC, id DESC) — الأحدث أولاً
  return result;
}

export async function getCmsContentById(id: number) {
  const rows = await db.select().from(cmsContent).where(eq(cmsContent.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function deleteCmsContent(id: number): Promise<boolean> {
  const row = await getCmsContentById(id);
  if (!row) return false;
  if ((row.contentType === "pdf" || row.contentType === "image") && row.dataValue.startsWith("/attached_assets/uploads/")) {
    const fileName = path.basename(row.dataValue);
    const filePath = path.join(__dirname, "..", "attached_assets", "uploads", fileName);
    const resolved = path.resolve(filePath);
    const uploadsBase = path.resolve(__dirname, "..", "attached_assets", "uploads");
    if (resolved.startsWith(uploadsBase)) {
      try {
        await fs.promises.unlink(resolved);
      } catch {
      }
    }
  }
  await db.delete(cmsContent).where(eq(cmsContent.id, id));
  return true;
}

export async function upsertSeo(data: {
  pagePath: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}) {
  const pathNorm = data.pagePath.startsWith("/") ? data.pagePath : `/${data.pagePath}`;
  const existing = await db.select().from(seoData).where(eq(seoData.pagePath, pathNorm)).limit(1);
  const payload = {
    title: data.title ?? null,
    description: data.description ?? null,
    keywords: data.keywords ?? null,
    ogTitle: data.ogTitle ?? null,
    ogDescription: data.ogDescription ?? null,
    ogImage: data.ogImage ?? null,
    updatedAt: new Date(),
  };
  if (existing.length > 0) {
    await db.update(seoData).set(payload).where(eq(seoData.id, existing[0].id));
  } else {
    await db.insert(seoData).values({ pagePath: pathNorm, ...payload });
  }
}

/** إحصائيات المنصة للتقرير الشامل */
export interface PlatformOverviewStats {
  totalLessons: number;
  interactiveContent: number;
  totalMembers: number;
  attachments: number;
  lessonsPerStage: { stage: string; count: number }[];
  completedLessons: number;
  incompleteLessons: number;
  recentUploads: { id: number; lessonTitle: string; subjectName: string; tabType: string; createdAt: string }[];
}

export async function getPlatformOverviewStats(): Promise<PlatformOverviewStats> {
  const { users } = await import("@shared/schema");
  let rows: { id: number; lessonId: string; tabType: string; contentType: string; createdAt: Date | number | null }[] = [];
  try {
    rows = await db.select({ id: cmsContent.id, lessonId: cmsContent.lessonId, tabType: cmsContent.tabType, contentType: cmsContent.contentType, createdAt: cmsContent.createdAt }).from(cmsContent);
  } catch {
    rows = [];
  }

  const lessonIds = Array.from(new Set(rows.map((r) => r.lessonId)));
  const totalLessons = lessonIds.length;

  const interactiveContent = rows.filter((r) => r.tabType === "education" || r.tabType === "questions").length;
  const attachments = rows.filter((r) => r.contentType === "pdf" || r.contentType === "youtube").length;

  let totalMembers = 0;
  try {
    const userRows = await db.select().from(users);
    totalMembers = userRows.length;
  } catch {
    /* ignore */
  }

  const stageLessons = new Map<string, Set<string>>();
  for (const r of rows) {
    const info = getLessonFullInfo(r.lessonId);
    const stage = info?.stageName ?? "—";
    if (!stageLessons.has(stage)) stageLessons.set(stage, new Set());
    stageLessons.get(stage)!.add(r.lessonId);
  }
  const lessonsPerStage = Array.from(stageLessons.entries())
    .filter(([s]) => s !== "—")
    .map(([stage, set]) => ({ stage, count: set.size }))
    .sort((a, b) => b.count - a.count);

  const hasVideo = new Set(rows.filter((r) => r.tabType === "video").map((r) => r.lessonId));
  const hasSummary = new Set(rows.filter((r) => r.tabType === "summary").map((r) => r.lessonId));
  const hasQuestions = new Set(rows.filter((r) => r.tabType === "questions").map((r) => r.lessonId));
  let completedLessons = 0;
  let incompleteLessons = 0;
  for (const lid of lessonIds) {
    if (hasVideo.has(lid) && hasSummary.has(lid) && hasQuestions.has(lid)) completedLessons++;
    else incompleteLessons++;
  }

  const withInfo = rows.map((r) => {
    const info = getLessonFullInfo(r.lessonId);
    const createdAt = r.createdAt;
    const ts = createdAt instanceof Date ? createdAt.getTime() : (createdAt as number) * 1000;
    return { ...r, subjectName: info?.subjectName ?? "—", lessonTitle: info?.lessonTitle ?? r.lessonId, createdAt: ts };
  });
  withInfo.sort((a, b) => b.createdAt - a.createdAt);
  const recentUploads = withInfo.slice(0, 5).map((r) => ({
    id: r.id,
    lessonTitle: r.lessonTitle,
    subjectName: r.subjectName,
    tabType: r.tabType,
    createdAt: new Date(r.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" }),
  }));

  return {
    totalLessons,
    interactiveContent,
    totalMembers,
    attachments,
    lessonsPerStage,
    completedLessons,
    incompleteLessons,
    recentUploads,
  };
}
