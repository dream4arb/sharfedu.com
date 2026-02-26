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
import fs from "fs";

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
    const localPath = path.join(process.cwd(), "server", "public", "attached_assets", folder, filename);
    if (fs.existsSync(localPath)) {
      return res.sendFile(localPath);
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
  app.use("/api/user", authRoutes);

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

  app.use(pdfExtractorRoutes);
  app.use(extractQuestionsRoutes);

  app.use("/api/admin", requireAdmin, adminRoutes);
  const cmsRoutes = (await import("./admin/cmsRoutes")).default;
  app.use("/api/admin/cms", requireAdmin, cmsRoutes);

  app.post("/api/chat", async (req, res) => {
    try {
      const { message, lessonTitle, subjectName, conversationHistory } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const genAI = getGeminiClient();
      if (!genAI) {
        return res.status(503).json({ 
          error: "المعلم الذكي غير متاح حالياً.",
        });
      }

      const systemPrompt = `أنت المعلم الذكي في منصة شارف التعليمية. أنت مساعد تعليمي ذكي وودود متخصص في مساعدة الطلاب السعوديين في فهم دروسهم وتحسين أدائهم الأكاديمي.

السياق الحالي:
- المادة: ${subjectName || "غير محدد"}
- الدرس: ${lessonTitle || "غير محدد"}

قواعد مهمة:
1. أجب دائماً باللغة العربية الفصحى أو العامية السعودية حسب سياق السؤال
2. استخدم لغة بسيطة ومفهومة مناسبة لمستوى الطالب
3. قدم أمثلة توضيحية عملية عند الحاجة
4. شجع الطالب وحفزه على التعلم المستمر
5. إذا سُئلت عن شيء خارج نطاق التعليم، وجه الطالب بلطف للتركيز على الأسئلة التعليمية
6. كن ودوداً ومشجعاً ومهذباً في جميع ردودك
7. قدم شرحاً واضحاً ومفصلاً للمفاهيم الصعبة
8. استخدم أمثلة من الحياة اليومية لتسهيل الفهم`;

      let fullPrompt = systemPrompt + "\n\n";
      
      if (conversationHistory && Array.isArray(conversationHistory)) {
        const historyText = conversationHistory
          .filter((m: { role: "user" | "assistant"; content: string }) => m.content)
          .map((m: { role: "user" | "assistant"; content: string }) => {
            const roleLabel = m.role === "user" ? "الطالب" : "شارف";
            return `${roleLabel}: ${m.content}`;
          })
          .join("\n\n");
        
        if (historyText) {
          fullPrompt += "سجل المحادثة السابق:\n" + historyText + "\n\n";
        }
      }
      
      fullPrompt += `الطالب: ${message}\n\nشارف:`;

      const model = getGeminiModel(genAI);
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return res.json({ response: text });
    } catch (error: any) {
      console.error("[Chat] Error:", error?.message);
      return res.status(500).json({ 
        error: "حدث خطأ أثناء التواصل مع المعلم الذكي. يرجى المحاولة مرة أخرى.",
      });
    }
  });

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
