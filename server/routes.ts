import type { Express } from "express";
import express from "express";
import session from "express-session";
import passport from "passport";
import { type Server } from "http";
import { storage } from "./storage";
import { db, ensurePasswordResetTable } from "./db";
import { cmsContent, platformStats } from "@shared/schema";
import { api } from "@shared/routes";
import { getGeminiClient, getGeminiModel } from "./lib/gemini";
import pdfExtractorRoutes from "./routes/pdf-extractor";
import extractQuestionsRoutes from "./routes/extract-questions";
import adminRoutes from "./admin/adminRoutes";
import contentRoutes from "./admin/contentRoutes";
import authRoutes, { requireAuth } from "./auth/authRoutes";
import lessonEngineRoutes from "./routes/lessonEngine";
import { createSessionStore } from "./auth/sessionStore";
import { requireAdmin } from "./middleware/adminAuth";
import path from "path";
import { access } from "fs/promises";
import rateLimit from "express-rate-limit";

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;
const ratingLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: true, legacyHeaders: false });

export async function registerRoutes(httpServer: Server, app: Express) {
  const { initHierarchy } = await import("./admin/hierarchyStore");
  await initHierarchy();
  await ensurePasswordResetTable();

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "sharfedu-api" });
  });

  const BASE_URL = process.env.BASE_URL || "https://sharfedu.com";

  app.get("/lesson-preview.html", (_req, res) => {
    const filePath = path.resolve(process.cwd(), "server", "public", "lesson-preview.html");
    res.sendFile(filePath);
  });

  app.get("/preview-lesson.html", (_req, res) => {
    const filePath = path.resolve(process.cwd(), "server", "public", "preview-lesson.html");
    res.sendFile(filePath);
  });

  app.post("/api/lesson-rating", ratingLimiter, (req, res) => {
    const { lessonId, lessonTitle, rating, comment, stage, subject } = req.body;
    const safeLessonId = String(lessonId ?? "").trim();
    const numericRating = Number(rating);
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(safeLessonId) || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ error: "Invalid rating" });
    }
    try {
      const dataDir = path.resolve(process.cwd(), "server", "data");
      const fs = require("fs");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const ratingsFile = path.join(dataDir, "lesson-ratings.json");
      let ratings: any[] = [];
      try { ratings = JSON.parse(fs.readFileSync(ratingsFile, "utf-8")); } catch {}
      const user = (req as any).user;
      ratings.push({
        lessonId: safeLessonId,
        lessonTitle: String(lessonTitle ?? safeLessonId).trim().slice(0, 160),
        rating: numericRating,
        comment: String(comment ?? "").trim().slice(0, 800),
        stage: String(stage ?? "").trim().slice(0, 80),
        subject: String(subject ?? "").trim().slice(0, 80),
        userId: user?.id || null,
        userName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email : "زائر",
        timestamp: new Date().toISOString(),
      });
      fs.writeFileSync(ratingsFile, JSON.stringify(ratings, null, 2), "utf-8");
      res.json({ success: true });
    } catch (err: any) {
      console.error("[Rating] Error saving rating:", err?.message);
      res.status(500).json({ error: "فشل حفظ التقييم" });
    }
  });


  app.get("/sitemap.xml", async (_req, res) => {
    try {
      const { getAllLessons, getFullHierarchy } = await import("./data/cms-hierarchy");
      const today = new Date().toISOString().split("T")[0];

      const staticPages = [
        { loc: "/", changefreq: "weekly", priority: "1.0" },
        { loc: "/features", changefreq: "monthly", priority: "0.8" },
        { loc: "/stages", changefreq: "monthly", priority: "0.9" },
        { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
        { loc: "/lesson/secondary/math/l-mm6el08l", changefreq: "monthly", priority: "0.9" },
      ];

      const publishedRows = await db.select({ lessonId: cmsContent.lessonId, tabType: cmsContent.tabType, dataValue: cmsContent.dataValue }).from(cmsContent);
      const publishedIds = new Set(publishedRows.filter((row) => row.tabType === "lesson" && row.dataValue.trim().length > 0).map((row) => row.lessonId));
      const allLessons = getAllLessons().filter((lesson) => publishedIds.has(lesson.lessonId));
      const stagePages: { loc: string; changefreq: string; priority: string }[] = [];
      for (const stageSlug of new Set(allLessons.map((lesson) => lesson.stageSlug))) {
        stagePages.push({ loc: `/stage/${stageSlug}`, changefreq: "weekly", priority: "0.8" });
      }
      for (const subjectPath of new Set(allLessons.map((lesson) => `${lesson.stageSlug}/${lesson.subjectSlug}`))) {
        stagePages.push({ loc: `/lesson/${subjectPath}`, changefreq: "weekly", priority: "0.7" });
      }

      const lessonPages: { loc: string; changefreq: string; priority: string }[] = [];
      for (const lesson of allLessons) {
        lessonPages.push({
          loc: `/lesson/${lesson.stageSlug}/${lesson.subjectSlug}/${lesson.lessonId}`,
          changefreq: "monthly",
          priority: "0.7",
        });
      }

      const allPages = [...new Map([...staticPages, ...stagePages, ...lessonPages].map((page) => [page.loc, page])).values()];

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      for (const page of allPages) {
        xml += `  <url>\n`;
        xml += `    <loc>${BASE_URL}${page.loc}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;
        xml += `  </url>\n`;
      }
      xml += `</urlset>`;

      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(xml);
    } catch (e) {
      console.error("Sitemap error:", e);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", (_req, res) => {
    const content = [
      "User-agent: *",
      "Allow: /",
      "",
      "Disallow: /api/",
      "Disallow: /admin",
      "Disallow: /dashboard",
      "Disallow: /profile",
      "Disallow: /pdf-viewer",
      "Disallow: /admin/pdf-extractor",
      "",
      `Sitemap: ${BASE_URL}/sitemap.xml`,
    ].join("\n");
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(content);
  });


  app.get("/api/admin/sitemap-info", requireAdmin, async (req, res) => {
    try {
      const { getAllLessons, getFullHierarchy } = await import("./data/cms-hierarchy");
      const hierarchy = getFullHierarchy();

      const staticPages = [
        { url: "/", label: "الرئيسية", priority: "1.0" },
        { url: "/features", label: "المميزات", priority: "0.8" },
        { url: "/login", label: "تسجيل الدخول", priority: "0.5" },
        { url: "/register", label: "إنشاء حساب", priority: "0.6" },
        { url: "/privacy", label: "سياسة الخصوصية", priority: "0.3" },
      ];

      const stagePages: { url: string; label: string; priority: string }[] = [];
      const STAGE_LABELS: Record<string, string> = {
        elementary: "الابتدائية", middle: "المتوسطة", high: "الثانوية",
        paths: "المسارات", qudurat: "القدرات والتحصيلي",
      };
      for (const stage of hierarchy) {
        stagePages.push({ url: `/stage/${stage.slug}`, label: `مرحلة: ${STAGE_LABELS[stage.slug] || stage.name}`, priority: "0.9" });
      }

      const subjectPages: { url: string; label: string; priority: string }[] = [];
      for (const stage of hierarchy) {
        for (const grade of stage.grades ?? []) {
          for (const subject of grade.subjects) {
            subjectPages.push({
              url: `/lesson/${stage.slug}/${subject.slug}`,
              label: `${STAGE_LABELS[stage.slug] || stage.name} > ${subject.name}`,
              priority: "0.8",
            });
          }
        }
      }

      const allLessons = getAllLessons();
      const lessonCount = allLessons.length;

      res.json({
        baseUrl: BASE_URL,
        sitemapUrl: `${BASE_URL}/sitemap.xml`,
        robotsUrl: `${BASE_URL}/robots.txt`,
        totalUrls: staticPages.length + stagePages.length + subjectPages.length + lessonCount,
        staticPages,
        stagePages,
        subjectPages,
        lessonCount,
        lastGenerated: new Date().toISOString(),
      });
    } catch (e) {
      console.error("Sitemap info error:", e);
      res.status(500).json({ error: "Failed to get sitemap info" });
    }
  });

  app.get("/attached_assets/:folder/:filename", async (req, res) => {
    const { folder, filename } = req.params;
    if (!SAFE_NAME.test(folder) || !SAFE_NAME.test(filename)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const pathsToTry = [
      path.join(process.cwd(), "attached_assets", folder, filename),
      path.join(process.cwd(), "server", "public", "attached_assets", folder, filename),
    ];
    for (const p of pathsToTry) {
      try { await access(p); return res.sendFile(p); } catch {}
    }
    res.status(404).json({ error: "File not found" });
  });

  const sessionStore = createSessionStore();
  const isSecure = process.env.NODE_ENV === "production" && (process.env.BASE_URL?.startsWith("https:") ?? false);
  const sessionSecret = process.env.SESSION_SECRET?.trim();
  if (process.env.NODE_ENV === "production" && !sessionSecret) {
    throw new Error("SESSION_SECRET is required in production");
  }
  app.use(
    session({
      store: sessionStore,
      secret: sessionSecret || "local-development-session-secret",
      resave: false,
      saveUninitialized: false,
      name: "sharf.sid",
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax",
      },
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api/auth", authRoutes);
  app.use("/api", lessonEngineRoutes);

  app.get("/api/admin/lesson-ratings", requireAdmin, (_req, res) => {
    const ratingsFile = path.resolve(process.cwd(), "server", "data", "lesson-ratings.json");
    const fs = require("fs");
    let ratings: any[] = [];
    try { ratings = JSON.parse(fs.readFileSync(ratingsFile, "utf-8")); } catch {}

    const grouped: Record<string, { lessonTitle: string; stage: string; subject: string; total: number; count: number; ratings: number[]; comments: { userName: string; rating: number; comment: string; timestamp: string }[] }> = {};
    ratings.forEach((r: any) => {
      if (!grouped[r.lessonId]) grouped[r.lessonId] = { lessonTitle: r.lessonTitle, stage: r.stage || "", subject: r.subject || "", total: 0, count: 0, ratings: [], comments: [] };
      grouped[r.lessonId].total += r.rating;
      grouped[r.lessonId].count++;
      grouped[r.lessonId].ratings.push(r.rating);
      if (r.comment || r.rating <= 3) {
        grouped[r.lessonId].comments.push({ userName: r.userName || "زائر", rating: r.rating, comment: r.comment || "", timestamp: r.timestamp });
      }
    });
    const summary = Object.entries(grouped).map(([id, data]) => ({
      lessonId: id,
      lessonTitle: data.lessonTitle,
      stage: data.stage,
      subject: data.subject,
      averageRating: Math.round((data.total / data.count) * 10) / 10,
      totalRatings: data.count,
      distribution: [1,2,3,4,5].map(v => data.ratings.filter((r: number) => r === v).length),
      comments: data.comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    }));
    summary.sort((a, b) => a.averageRating - b.averageRating);

    const allRatings = ratings.map((r: any) => ({
      lessonId: r.lessonId,
      lessonTitle: r.lessonTitle || r.lessonId,
      stage: r.stage || "",
      subject: r.subject || "",
      rating: r.rating,
      comment: r.comment || "",
      userName: r.userName || "زائر",
      timestamp: r.timestamp,
    })).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ ratings: summary, allRatings, totalReviews: ratings.length });
  });

  app.get("/api/school-year", async (_req, res) => {
    try {
      const rows = await db.select().from(platformStats);
      const map: Record<string, string> = {};
      for (const r of rows) {
        if (["school_year_start", "school_year_end", "semester1_end"].includes(r.key)) {
          map[r.key] = r.value;
        }
      }
      res.json({
        schoolYearStart: map.school_year_start || "2025-08-25",
        schoolYearEnd: map.school_year_end || "2026-06-15",
        semester1End: map.semester1_end || "2025-12-15",
      });
    } catch {
      res.json({
        schoolYearStart: "2025-08-25",
        schoolYearEnd: "2026-06-15",
        semester1End: "2025-12-15",
      });
    }
  });

  app.use("/api/content", contentRoutes);

  app.get("/api/public/structure", async (_req, res) => {
    try {
      const { getDisplayStructure, getAllLessons } = await import("./data/cms-hierarchy");
      const displayStructure = getDisplayStructure();
      const flatLessons = getAllLessons();
      const lessonTitles: Record<string, string> = {};
      for (const l of flatLessons) lessonTitles[l.lessonId] = l.title;
      res.json({ displayStructure, lessonTitles });
    } catch (e) {
      console.error("Public structure:", e);
      res.json({ displayStructure: {}, lessonTitles: {} });
    }
  });

  app.get("/api/seo", async (req, res) => {
    try {
      const seoPath = (req.query.path as string) || "/";
      const pathNorm = seoPath.startsWith("/") ? seoPath : `/${seoPath}`;
      const { getSeoForPath } = await import("./admin/cmsStorage");
      const row = await getSeoForPath(pathNorm);
      const fallback = { pagePath: pathNorm, title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null };
      res.json(row ? { ...fallback, ...row } : fallback);
    } catch (e) {
      console.error("SEO fetch:", e);
      res.json({ pagePath: req.query.path || "/", title: null, description: null, keywords: null });
    }
  });

  interface VideoInfo {
    title: string;
    channelName: string;
    duration: string;
    durationCompact: string;
    likeCount: string;
    viewCount: string;
    publishedAt: string;
    commentCount: string;
  }
  const videoInfoCache = new Map<string, { data: VideoInfo; ts: number }>();
  const CACHE_TTL = 3600000;
  const CACHE_MAX = 500;

  function getCachedInfo(id: string): VideoInfo | undefined {
    const entry = videoInfoCache.get(id);
    if (!entry) return undefined;
    if (Date.now() - entry.ts > CACHE_TTL) { videoInfoCache.delete(id); return undefined; }
    return entry.data;
  }
  function setCachedInfo(id: string, info: VideoInfo) {
    if (videoInfoCache.size >= CACHE_MAX) {
      const oldest = videoInfoCache.keys().next().value;
      if (oldest) videoInfoCache.delete(oldest);
    }
    videoInfoCache.set(id, { data: info, ts: Date.now() });
  }

  function formatSeconds(total: number): { duration: string; durationCompact: string } {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const durationCompact = h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${m}:${String(s).padStart(2, "0")}`;

    let duration = "";
    if (h > 0) duration += `${h} ساعة `;
    if (m > 0) duration += `${m} دقيقة `;
    if (s > 0 && h === 0) duration += `${s} ثانية`;
    duration = duration.trim() || "0 ثانية";

    return { duration, durationCompact };
  }

  function formatRelativeDate(isoDate: string): string {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const days = Math.floor(diffMs / 86400000);
      if (days < 1) return "اليوم";
      if (days < 30) return `منذ ${days} يوم`;
      const months = Math.floor(days / 30);
      if (months < 12) return `منذ ${months} شهر`;
      const years = Math.floor(months / 12);
      return `منذ ${years} سنة`;
    } catch { return ""; }
  }

  async function getVideoInfoViaOembed(videoId: string): Promise<VideoInfo | null> {
    try {
      const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json() as { title?: string; author_name?: string };
      return {
        title: data.title || "",
        channelName: data.author_name || "",
        duration: "",
        durationCompact: "",
        likeCount: "0",
        viewCount: "0",
        publishedAt: "",
        commentCount: "0",
      };
    } catch {
      return null;
    }
  }

  app.get("/api/content/youtube-video-info", async (req, res) => {
    try {
      const ids = (req.query.ids as string || "").split(",").filter(Boolean).slice(0, 20);
      if (ids.length === 0) return res.json({});

      const result: Record<string, VideoInfo> = {};
      const uncached: string[] = [];
      for (const id of ids) {
        const cached = getCachedInfo(id);
        if (cached) result[id] = cached;
        else uncached.push(id);
      }

      if (uncached.length > 0) {
        const apiKey = process.env.YOUTUBE_API_KEY?.trim();
        if (apiKey) {
          try {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${uncached.join(",")}&key=${apiKey}`;
            const apiResp = await fetch(url);
            if (apiResp.ok) {
              const data = await apiResp.json() as { items?: any[] };
              for (const item of data.items || []) {
                const iso = item.contentDetails?.duration || "";
                const m2 = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                const totalSec = m2 ? (parseInt(m2[1]||"0")*3600 + parseInt(m2[2]||"0")*60 + parseInt(m2[3]||"0")) : 0;
                const { duration, durationCompact } = totalSec > 0 ? formatSeconds(totalSec) : { duration: "", durationCompact: "" };
                const info: VideoInfo = {
                  title: item.snippet?.title || "",
                  channelName: item.snippet?.channelTitle || "",
                  duration,
                  durationCompact,
                  likeCount: item.statistics?.likeCount || "0",
                  viewCount: item.statistics?.viewCount || "0",
                  publishedAt: item.snippet?.publishedAt ? formatRelativeDate(item.snippet.publishedAt) : "",
                  commentCount: item.statistics?.commentCount || "0",
                };
                result[item.id] = info;
                setCachedInfo(item.id, info);
              }
            }
          } catch {}
        }

        const stillMissing = uncached.filter(id => !result[id]);
        if (stillMissing.length > 0) {
          await Promise.allSettled(
            stillMissing.map(async (id) => {
              const info = await getVideoInfoViaOembed(id);
              if (info) {
                result[id] = info;
                setCachedInfo(id, info);
              }
            })
          );
        }
      }

      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to fetch video info" });
    }
  });

  app.use(pdfExtractorRoutes);
  app.use(extractQuestionsRoutes);

  app.use("/api/admin", requireAdmin, adminRoutes);
  const cmsRoutes = (await import("./admin/cmsRoutes")).default;
  app.use("/api/admin/cms", requireAdmin, cmsRoutes);

  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { lessonTitle, subjectName } = req.body;

      const genAI = getGeminiClient();
      if (!genAI) {
        return res.status(503).json({ 
          error: "المعلم الذكي غير متاح حالياً.",
        });
      }

      const prompt = `أنت مساعد تعليمي متخصص في تلخيص الدروس للطلاب السعوديين. قم بإنشاء ملخص مفيد ومنظم.

قم بإنشاء ملخص تعليمي مختصر ومفيد لدرس "${lessonTitle || "غير محدد"}" في مادة "${subjectName || "غير محدد"}".

اتبع هذا التنسيق:
النقاط الرئيسية:
- [نقطة 1]
- [نقطة 2]
- [نقطة 3]

المفاهيم الأساسية:
- [مفهوم 1]
- [مفهوم 2]

نصائح للمذاكرة:
- [نصيحة 1]
- [نصيحة 2]`;

      const model = getGeminiModel(genAI);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let summary = response.text();
      
      if (!summary?.trim()) {
        summary = "عذراً، لم نتمكن من تلخيص الدرس. يرجى المحاولة مرة أخرى.";
      }
      
      res.json({ summary });
    } catch (error: any) {
      console.error("[Summarize] Error:", error?.message);
      return res.status(500).json({ 
        error: "حدث خطأ أثناء تلخيص الدرس. يرجى المحاولة مرة أخرى.",
      });
    }
  });

  app.get(api.courses.list.path, async (req, res) => {
    const gradeLevel = req.query.gradeLevel as string | undefined;
    const courses = await storage.getCourses(gradeLevel);
    res.json(courses);
  });

  app.post("/api/progress/lesson", requireAuth, async (req, res) => {
    try {
      const { subjectSlug, lessonId, lessonCompleted, videoCompleted, questionsScore, questionsProgress, totalProgress } = req.body;
      const userId = req.user!.id;
      
      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "subjectSlug and lessonId are required" });
      }

      const progress = await storage.saveLessonProgress(
        userId,
        subjectSlug,
        lessonId,
        { lessonCompleted, videoCompleted, questionsScore, questionsProgress, totalProgress }
      );

      res.json(progress);
    } catch (error) {
      console.error("Error saving lesson progress:", error);
      res.status(500).json({ error: "Failed to save lesson progress" });
    }
  });

  app.get("/api/progress/lesson", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const subjectSlug = req.query.subjectSlug as string;
      const lessonId = req.query.lessonId as string;

      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "subjectSlug and lessonId are required" });
      }

      const progress = await storage.getLessonProgress(userId, subjectSlug, lessonId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      res.status(500).json({ error: "Failed to get lesson progress" });
    }
  });

  app.get("/api/progress/user", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const subjectSlug = req.query.subjectSlug as string | undefined;

      const progress = await storage.getUserProgress(userId, subjectSlug);
      res.json(progress);
    } catch (error) {
      console.error("Error getting user progress:", error);
      res.status(500).json({ error: "Failed to get user progress" });
    }
  });

  return httpServer;
}
