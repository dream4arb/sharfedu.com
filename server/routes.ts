import type { Express } from "express";
import express from "express";
import session from "express-session";
import passport from "passport";
import { type Server } from "http";
import { storage } from "./storage";
import { db, ensurePasswordResetTable } from "./db";
import { platformStats } from "@shared/schema";
import { api } from "@shared/routes";
import { getGeminiClient, getGeminiModel } from "./lib/gemini";
import pdfExtractorRoutes from "./routes/pdf-extractor";
import extractQuestionsRoutes from "./routes/extract-questions";
import adminRoutes from "./admin/adminRoutes";
import contentRoutes from "./admin/contentRoutes";
import authRoutes from "./auth/authRoutes";
import { createSessionStore } from "./auth/sessionStore";
import { requireAdmin } from "./middleware/adminAuth";
import path from "path";
import { access } from "fs/promises";

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

export async function registerRoutes(httpServer: Server, app: Express) {
  const { initHierarchy } = await import("./admin/hierarchyStore");
  await initHierarchy();
  await ensurePasswordResetTable();

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "sharfedu-api" });
  });

  app.get("/attached_assets/:folder/:filename", async (req, res) => {
    const { folder, filename } = req.params;
    if (!SAFE_NAME.test(folder) || !SAFE_NAME.test(filename)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const pathsToTry = [
      path.join(process.cwd(), "attached_assets", folder, filename),
      path.join(process.cwd(), "server", "public", "attached_assets", folder, filename),
      path.join(process.cwd(), "..", "attached_assets", folder, filename),
    ];
    for (const p of pathsToTry) {
      try { await access(p); return res.sendFile(p); } catch {}
    }
    res.status(404).json({ error: "File not found" });
  });

  const sessionStore = createSessionStore();
  const isSecure = process.env.NODE_ENV === "production" && (process.env.BASE_URL?.startsWith("https:") ?? false);
  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "sharf-edu-session-secret-change-in-production",
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

  app.post("/api/progress/lesson", async (req, res) => {
    try {
      const { userId, subjectSlug, lessonId, lessonCompleted, videoCompleted, questionsScore, questionsProgress, totalProgress } = req.body;
      
      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "userId, subjectSlug, and lessonId are required" });
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

  app.get("/api/progress/lesson", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const subjectSlug = req.query.subjectSlug as string;
      const lessonId = req.query.lessonId as string;

      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "userId, subjectSlug, and lessonId are required" });
      }

      const progress = await storage.getLessonProgress(userId, subjectSlug, lessonId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      res.status(500).json({ error: "Failed to get lesson progress" });
    }
  });

  app.get("/api/progress/user", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const subjectSlug = req.query.subjectSlug as string | undefined;

      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const progress = await storage.getUserProgress(userId, subjectSlug);
      res.json(progress);
    } catch (error) {
      console.error("Error getting user progress:", error);
      res.status(500).json({ error: "Failed to get user progress" });
    }
  });

  const existingCourses = await storage.getCourses();
  if (existingCourses.length === 0) {
    const initialCourses = [
      { title: "العلوم", description: "استكشف عجائب الطبيعة والكون", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+1" },
      { title: "الرياضيات", description: "أساسيات الحساب والمنطق", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+1" },
      { title: "الاجتماعيات", description: "تاريخنا وحضارتنا العريقة", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+1" },
      { title: "العلوم", description: "تجارب علمية متقدمة", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+2" },
      { title: "الرياضيات", description: "الجبر والهندسة للمستوى الثاني", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+2" },
      { title: "الاجتماعيات", description: "الجغرافيا والمجتمع", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+2" },
      { title: "العلوم", description: "التحضير للفيزياء والكيمياء", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+3" },
      { title: "الرياضيات", description: "التحليل الرياضي المتقدم", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+3" },
      { title: "الاجتماعيات", description: "التاريخ الحديث والمعاصر", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+3" },
    ];

    for (const course of initialCourses) {
      await storage.createCourse(course);
    }
  }

  return httpServer;
}
