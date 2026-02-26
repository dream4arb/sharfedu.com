import type { Express } from "express";
import express from "express";
import session from "express-session";
import passport from "passport";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db, ensurePasswordResetTable } from "./db";
import { platformStats } from "@shared/schema";
import { api } from "@shared/routes";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfExtractorRoutes from "./routes/pdf-extractor";
import extractQuestionsRoutes from "./routes/extract-questions";
import adminRoutes from "./admin/adminRoutes";
import contentRoutes from "./admin/contentRoutes";
import authRoutes from "./auth/authRoutes";
import { createSessionStore } from "./auth/sessionStore";
import { requireAdmin } from "./middleware/adminAuth";
import path from "path";
import { getDirname } from "./resolve-dir";

// Check API Key at module load
console.log("Using API Key:", process.env.GEMINI_API_KEY ? "Found" : "Not Found");

/**
 * Initialize Gemini client using @google/generative-ai library
 * Uses v1 API version (default in latest SDK)
 * Hardcoded to use gemini-1.5-flash model
 */
function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.error("[Gemini] GEMINI_API_KEY is not set in environment variables");
    return null;
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  
  if (!apiKey || apiKey.length === 0) {
    console.error("[Gemini] GEMINI_API_KEY is empty");
    return null;
  }

  try {
    // Initialize using @google/generative-ai library
    // SDK uses v1 API by default in latest versions
    const client = new GoogleGenerativeAI(apiKey);
    console.log("[Gemini] Client initialized successfully with API key");
    return client;
  } catch (error: any) {
    console.error("[Gemini] Failed to initialize client:", error?.message || error);
    return null;
  }
}

export async function registerRoutes(httpServer: Server, app: Express) {
  const { initHierarchy } = await import("./admin/hierarchyStore");
  await initHierarchy();
  await ensurePasswordResetTable();

  // فحص صحة الـ API (للتحقق من أن Node يعمل خلف البوابة على الإنتاج)
  app.get("/api/health", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.json({ ok: true, service: "sharfedu-api" });
  });

  // الجلسة والمصادقة (قبل أي route يحتاجها)
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

  // مصادقة: تسجيل دخول، تسجيل حساب، استعادة كلمة مرور، جوجل
  app.use("/api/auth", authRoutes);
  // نفس مسارات المصادقة تحت /api/user (مثلاً PUT /api/user/account لتحديث الحساب)
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

  // Serve attached_assets files
  const __dirname = getDirname();
  const attachedAssetsPath = path.join(__dirname, "..", "attached_assets");
  app.use("/attached_assets", express.static(attachedAssetsPath));

  // Content API (public)
  app.use("/api/content", contentRoutes);

  // الهيكل الدراسي العام (public) — لعرض أسماء الفصول والوحدات والدروس المحدثة من لوحة التحكم
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

  // SEO API (public) — جلب meta tags من جدول seo_data حسب المسار الحالي
  app.get("/api/seo", async (req, res) => {
    try {
      const path = (req.query.path as string) || "/";
      const pathNorm = path.startsWith("/") ? path : `/${path}`;
      const { getSeoForPath } = await import("./admin/cmsStorage");
      const row = await getSeoForPath(pathNorm);
      const fallback = { pagePath: pathNorm, title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null };
      res.json(row ? { ...fallback, ...row } : fallback);
    } catch (e) {
      console.error("SEO fetch:", e);
      res.json({ pagePath: req.query.path || "/", title: null, description: null, keywords: null });
    }
  });

  // PDF Extractor Routes
  app.use(pdfExtractorRoutes);
  app.use(extractQuestionsRoutes);

  // Admin API — للآدمن فقط (تحقق من role === 'admin')
  app.use("/api/admin", requireAdmin, adminRoutes);
  const cmsRoutes = (await import("./admin/cmsRoutes")).default;
  app.use("/api/admin/cms", requireAdmin, cmsRoutes);

  // ====================================================================
  // AI Chat endpoint - Main endpoint for chat
  // POST /api/chat - يستقبل الرسائل من الواجهة ويعالجها عبر Gemini API
  // ====================================================================
  app.post("/api/chat", async (req, res) => {
    // CORS headers - السماح للواجهة بإرسال الطلبات
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    
    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
    console.log("=== Chat API Request Received (via /api/chat) ===");
    console.log("Request method:", req.method);
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const { message, lessonTitle, subjectName, conversationHistory } = req.body;

      console.log("Extracted data:", {
        message: message?.substring(0, 50) + "...",
        lessonTitle,
        subjectName,
        historyLength: conversationHistory?.length || 0,
      });

      if (!message) {
        console.error("[Chat] Missing message in request body");
        return res.status(400).json({ error: "Message is required" });
      }

      // Initialize Gemini client
      const genAI = getGeminiClient();
      if (!genAI) {
        console.error("[المعلم الذكي] ❌ Failed to initialize Gemini client - API key missing or invalid");
        return res.status(503).json({ 
          error: "المعلم الذكي غير متاح حالياً. يرجى التحقق من إعدادات النظام.",
          technicalError: "Gemini API key not configured or invalid"
        });
      }

      console.log("[المعلم الذكي] ✅ Client initialized successfully");

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

      console.log("Building prompt...");

      // Build full prompt with conversation history
      let fullPrompt = systemPrompt + "\n\n";
      
      // Add conversation history if provided
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
      
      // Add current message
      fullPrompt += `الطالب: ${message}\n\nشارف:`;

      // Hardcoded to use gemini-1.5-flash model with v1 API
      console.log("[Gemini] Using model: gemini-1.5-flash (v1 API)");
      
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      console.log("[Gemini] Model instance created, calling generateContent...");
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      console.log("[Gemini] ✅ Response generated successfully");
      
      console.log("[Gemini] Processing response...");
      const text = response.text();
      console.log("[Gemini] ✅ Response text extracted, length:", text.length);

      return res.json({ response: text });
    } catch (error: any) {
      console.error("[Chat] ❌ Error processing chat request:", error);
      
      const errorStatus = error?.status || error?.statusCode || 500;
      const errorMessage = error?.message || "Internal server error";
      
      console.error("[Chat] Error details:", {
        status: errorStatus,
        message: errorMessage,
        stack: error?.stack?.substring(0, 200),
      });

      return res.status(errorStatus || 500).json({ 
        error: "حدث خطأ أثناء التواصل مع المعلم الذكي. يرجى المحاولة مرة أخرى.",
        technicalError: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      });
    }
  });

  // AI Chat endpoint for lesson summaries (legacy endpoint)
  app.post("/api/ai/lesson-chat", async (req, res) => {
    // CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    
    // Handle preflight
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }
    
    console.log("=== Chat API Request Received ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request headers:", JSON.stringify(req.headers, null, 2));
    
    try {
      const { message, lessonTitle, subjectName, conversationHistory } = req.body;

      console.log("Extracted data:", {
        message: message?.substring(0, 50) + "...",
        lessonTitle,
        subjectName,
        historyLength: conversationHistory?.length || 0,
      });

      if (!message) {
        console.error("[Chat] Missing message in request body");
        return res.status(400).json({ error: "Message is required" });
      }

      // Initialize Gemini client
      const genAI = getGeminiClient();
      if (!genAI) {
        console.error("[المعلم الذكي] ❌ Failed to initialize Gemini client - API key missing or invalid");
        return res.status(503).json({ 
          error: "المعلم الذكي غير متاح حالياً. يرجى التحقق من إعدادات النظام.",
          technicalError: "Gemini API key not configured or invalid"
        });
      }

      console.log("[المعلم الذكي] ✅ Client initialized successfully");

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

      console.log("Building prompt...");

      // Build full prompt with conversation history
      let fullPrompt = systemPrompt + "\n\n";
      
      // Add conversation history if provided
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
      
      // Add current message
      fullPrompt += `الطالب: ${message}\n\nشارف:`;

      // Hardcoded to use gemini-1.5-flash model with v1 API
      console.log("[Gemini] Using model: gemini-1.5-flash (v1 API)");
      
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      console.log("[Gemini] Model instance created, calling generateContent...");
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      console.log("[Gemini] ✅ Response generated successfully");
      
      console.log("[Gemini] Processing response...");
      
      // Handle Gemini response format correctly
      let text = "";
      try {
        text = response.text();
        console.log("[Gemini] ✅ Text extracted successfully, length:", text.length);
      } catch (textError: any) {
        console.error("[Gemini] ❌ Error extracting text:", textError?.message);
        // Try to get candidate text directly
        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content) {
          const parts = candidates[0].content.parts || [];
          text = parts.map((part: any) => part.text || "").join("");
          console.log("[Gemini] ✅ Text extracted from candidates, length:", text.length);
        } else {
          console.error("[Gemini] ❌ No candidates found in response");
        }
      }
      
      if (!text || text.trim().length === 0) {
        console.warn("[Gemini] ⚠️ Empty response from Gemini");
        text = "عذراً، لم أتمكن من الإجابة. يرجى المحاولة مرة أخرى.";
      }
      
      console.log("[Gemini] ✅ Sending response to client, length:", text.length);
      res.json({ response: text });
      console.log("[Gemini] ✅ Chat request completed successfully");
    } catch (error: any) {
      // Log detailed technical error for debugging
      console.error("========================================");
      console.error("[Gemini] ❌ CHAT ERROR");
      console.error("========================================");
      console.error("Error Type:", error?.constructor?.name || "Unknown");
      console.error("Error Message:", error?.message || "No message");
      console.error("Error Code:", error?.code || "No code");
      console.error("Error Status:", error?.status || "No status");
      console.error("Error StatusText:", error?.statusText || "No statusText");
      console.error("Error Stack:", error?.stack || "No stack trace");
      console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("========================================");
      
      // Extract the actual error message from Google API
      // Try multiple ways to get the error message
      let googleErrorMessage = "Unknown error";
      
      if (error?.message) {
        googleErrorMessage = error.message;
      } else if (error?.response?.data?.error?.message) {
        googleErrorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.error) {
        googleErrorMessage = JSON.stringify(error.response.data.error);
      } else if (error?.toString) {
        googleErrorMessage = error.toString();
      }
      
      const errorCode = error?.code || error?.status || error?.response?.status || "NO_CODE";
      const errorStatus = error?.status || error?.response?.status || 500;
      
      // Log the extracted error for debugging
      console.error("[Gemini] Extracted Google Error Message:", googleErrorMessage);
      console.error("[Gemini] Error Code:", errorCode);
      console.error("[Gemini] Error Status:", errorStatus);
      
      // Return JSON with the actual Google error message
      return res.status(errorStatus || 500).json({ 
        error: "حدث خطأ أثناء التواصل مع المعلم الذكي. يرجى المحاولة مرة أخرى.",
        googleError: googleErrorMessage, // Actual error message from Google
        errorCode: errorCode,
        errorStatus: errorStatus || undefined,
        errorType: error?.constructor?.name || "Unknown",
        errorDetails: {
          message: error?.message,
          code: error?.code,
          status: error?.status,
          response: error?.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          } : undefined,
        },
        errorStack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      });
    }
  });

  // AI Summarize endpoint
  app.post("/api/ai/summarize", async (req, res) => {
    console.log("=== Summarize API Request Received ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      const { lessonTitle, subjectName } = req.body;

      console.log("Extracted data:", { lessonTitle, subjectName });

      const genAI = getGeminiClient();
      if (!genAI) {
        console.error("[المعلم الذكي] ❌ Failed to initialize Gemini client for summarization");
        return res.status(503).json({ 
          error: "المعلم الذكي غير متاح حالياً. يرجى التحقق من إعدادات النظام.",
          technicalError: "Gemini API key not configured or invalid"
        });
      }

      console.log("[المعلم الذكي] ✅ Client initialized successfully for summarization");

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

      // Hardcoded to use gemini-1.5-flash model with v1 API
      console.log("[Gemini] Using model: gemini-1.5-flash (v1 API) for summarization");
      
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      console.log("[Gemini] Model instance created, calling generateContent...");
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("[Gemini] ✅ Summary generated successfully");
      
      console.log("[Gemini] Processing summary response...");
      
      // Handle Gemini response format correctly
      let summary = "";
      try {
        summary = response.text();
        console.log("[Gemini] ✅ Summary extracted successfully, length:", summary.length);
      } catch (textError: any) {
        console.error("[Gemini] ❌ Error extracting text:", textError?.message);
        // Try to get candidate text directly
        const candidates = response.candidates;
        if (candidates && candidates.length > 0 && candidates[0].content) {
          const parts = candidates[0].content.parts || [];
          summary = parts.map((part: any) => part.text || "").join("");
          console.log("[Gemini] ✅ Summary extracted from candidates, length:", summary.length);
        } else {
          console.error("[Gemini] ❌ No candidates found in response");
        }
      }
      
      if (!summary || summary.trim().length === 0) {
        console.warn("[Gemini] ⚠️ Empty summary from Gemini");
        summary = "عذراً، لم نتمكن من تلخيص الدرس. يرجى المحاولة مرة أخرى.";
      }
      
      console.log("[Gemini] ✅ Sending summary to client, length:", summary.length);
      res.json({ summary });
      console.log("[Gemini] ✅ Summarize request completed successfully");
    } catch (error: any) {
      // Log detailed technical error for debugging
      console.error("========================================");
      console.error("[Gemini] ❌ SUMMARIZE ERROR");
      console.error("========================================");
      console.error("Error Type:", error?.constructor?.name || "Unknown");
      console.error("Error Message:", error?.message || "No message");
      console.error("Error Code:", error?.code || "No code");
      console.error("Error Status:", error?.status || "No status");
      console.error("Error Stack:", error?.stack || "No stack trace");
      console.error("Full Error Object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error("========================================");
      
      // Extract the actual error message from Google API
      // Try multiple ways to get the error message
      let googleErrorMessage = "Unknown error";
      
      if (error?.message) {
        googleErrorMessage = error.message;
      } else if (error?.response?.data?.error?.message) {
        googleErrorMessage = error.response.data.error.message;
      } else if (error?.response?.data?.error) {
        googleErrorMessage = JSON.stringify(error.response.data.error);
      } else if (error?.toString) {
        googleErrorMessage = error.toString();
      }
      
      const errorCode = error?.code || error?.status || error?.response?.status || "NO_CODE";
      const errorStatus = error?.status || error?.response?.status || 500;
      
      // Log the extracted error for debugging
      console.error("[Gemini] Extracted Google Error Message (Summarize):", googleErrorMessage);
      console.error("[Gemini] Error Code:", errorCode);
      console.error("[Gemini] Error Status:", errorStatus);
      
      // Return JSON with the actual Google error message
      return res.status(errorStatus || 500).json({ 
        error: "حدث خطأ أثناء تلخيص الدرس. يرجى المحاولة مرة أخرى.",
        googleError: googleErrorMessage, // Actual error message from Google
        errorCode: errorCode,
        errorStatus: errorStatus || undefined,
        errorType: error?.constructor?.name || "Unknown",
        errorDetails: {
          message: error?.message,
          code: error?.code,
          status: error?.status,
          response: error?.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          } : undefined,
        },
        errorStack: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      });
    }
  });

  // API Routes
  app.get(api.courses.list.path, async (req, res) => {
    const gradeLevel = req.query.gradeLevel as string | undefined;
    const courses = await storage.getCourses(gradeLevel);
    res.json(courses);
  });

  // Lesson Progress API
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
        {
          lessonCompleted,
          videoCompleted,
          questionsScore,
          questionsProgress,
          totalProgress,
        }
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

  // Seed Data (Enhanced for all grades)
  const existingCourses = await storage.getCourses();
  if (existingCourses.length === 0) {
    const initialCourses = [
      // Grade 1
      { title: "العلوم", description: "استكشف عجائب الطبيعة والكون", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+1" },
      { title: "الرياضيات", description: "أساسيات الحساب والمنطق", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+1" },
      { title: "الاجتماعيات", description: "تاريخنا وحضارتنا العريقة", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+1" },
      // Grade 2
      { title: "العلوم", description: "تجارب علمية متقدمة", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+2" },
      { title: "الرياضيات", description: "الجبر والهندسة للمستوى الثاني", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+2" },
      { title: "الاجتماعيات", description: "الجغرافيا والمجتمع", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+2" },
      // Grade 3
      { title: "العلوم", description: "التحضير للفيزياء والكيمياء", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+3" },
      { title: "الرياضيات", description: "التحليل الرياضي المتقدم", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+3" },
      { title: "الاجتماعيات", description: "التاريخ الحديث والمعاصر", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+3" },
    ];

    for (const course of initialCourses) {
      await storage.createCourse(course);
    }
    console.log("Seeded database with courses for all grades");
  }

  return httpServer;
}
