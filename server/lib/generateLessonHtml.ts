import { getGeminiClient } from "./gemini";
import * as cmsStorage from "../admin/cmsStorage";
import { readFile, readdir, stat } from "fs/promises";
import path from "path";
import { getDirname } from "../resolve-dir";

const generationStatus = new Map<string, { status: "pending" | "generating" | "done" | "error"; message?: string; updatedAt: number }>();

export function getGenerationStatus(lessonId: string) {
  return generationStatus.get(lessonId) || null;
}

const PROMPT_FILES_DIR = path.resolve(getDirname(), "..", "prompt-files");

const MAX_PROMPT_CHARS = 900_000;

async function loadPromptFiles(): Promise<{ name: string; content: string }[]> {
  const results: { name: string; content: string }[] = [];
  const files = await readdir(PROMPT_FILES_DIR);
  const sorted = files.slice().sort((a, b) => a.localeCompare(b));
  for (const name of sorted) {
    const filePath = path.join(PROMPT_FILES_DIR, name);
    const fileStat = await stat(filePath);
    if (fileStat.isFile()) {
      const content = await readFile(filePath, "utf-8");
      results.push({ name, content });
    }
  }
  return results;
}

async function buildPromptFromFiles(): Promise<string> {
  let files: { name: string; content: string }[];
  try {
    files = await loadPromptFiles();
  } catch (err: any) {
    throw new Error(`خطأ في قراءة ملفات الأوامر: ${err?.message || err}`);
  }

  if (files.length === 0) {
    throw new Error("لا توجد ملفات أوامر مرفوعة في لوحة التحكم. يرجى رفع ملفات الأوامر أولاً.");
  }

  const mdFiles = files.filter(f => f.name.endsWith(".md"));
  const htmlFiles = files.filter(f => f.name.endsWith(".html"));
  const otherFiles = files.filter(f => !f.name.endsWith(".md") && !f.name.endsWith(".html"));

  let prompt = `أنت مصمم ويب مبدع ومعلم خبير متخصص في إنشاء تجارب تعليمية تفاعلية مذهلة بالعربية لمنصة شارف التعليمية.

## مهمتك:
1. تحليل ملف PDF المرفق واستخراج كل محتوى الدرس بدقة تامة
2. إنشاء صفحة HTML تعليمية تفاعلية واحدة كاملة ومستقلة بناءً على التعليمات والقوالب والأمثلة المرفقة أدناه

## ⚠️ قاعدة صارمة ومطلقة:
- يجب أن يكون الناتج صفحة HTML واحدة كاملة ومستقلة
- ابدأ بـ <!DOCTYPE html> وانتهِ بـ </html>
- لا تكتب أي نص قبل <!DOCTYPE html> أو بعد </html>
- لا تلف الكود في markdown أو code blocks
- لا مكتبات خارجية — فقط CSS و JavaScript مضمّن
- لا صور خارجية — فقط SVG مرسومة
- المحتوى فقط من ملف PDF المرفق — لا بيانات وهمية

---

## 📂 فيما يلي جميع ملفات التعليمات والقوالب والأمثلة المرجعية:
اقرأها بعناية فائقة واتبع كل التعليمات الواردة فيها بنسبة 100%.

`;

  if (mdFiles.length > 0) {
    prompt += `\n### 📋 ملفات التعليمات والقواعد (${mdFiles.length} ملف):\n\n`;
    for (const file of mdFiles) {
      prompt += `---\n#### 📄 ملف: ${file.name}\n---\n${file.content}\n\n`;
    }
  }

  if (htmlFiles.length > 0) {
    prompt += `\n### 🎨 ملفات القوالب والأمثلة المرجعية (${htmlFiles.length} ملف):\n`;
    prompt += `استخدم هذه الملفات كأمثلة مرجعية للتصميم والهيكل والجودة المطلوبة.\n\n`;
    for (const file of htmlFiles) {
      prompt += `---\n#### 📄 مثال مرجعي: ${file.name}\n---\n${file.content}\n\n`;
    }
  }

  if (otherFiles.length > 0) {
    prompt += `\n### 📎 ملفات إضافية (${otherFiles.length} ملف):\n\n`;
    for (const file of otherFiles) {
      prompt += `---\n#### 📄 ملف: ${file.name}\n---\n${file.content}\n\n`;
    }
  }

  prompt += `
---

## 🎯 التعليمات النهائية:
1. اقرأ ملف PDF المرفق بالكامل واستخرج كل المحتوى
2. اتبع جميع التعليمات الواردة في الملفات أعلاه بنسبة 100%
3. استخدم القالب والأمثلة المرجعية كأساس للتصميم
4. أنشئ صفحة HTML واحدة كاملة ومستقلة تحتوي على كل الأقسام المطلوبة
5. تأكد من جودة الرسوم SVG ووضوحها
6. الناتج النهائي: ملف HTML واحد فقط — بدون أي نص إضافي

ابدأ الآن بتحليل ملف PDF وإنشاء الدرس:`;

  if (prompt.length > MAX_PROMPT_CHARS) {
    console.warn(`[شارف AI] تحذير: حجم الأمر (${prompt.length} حرف) يتجاوز الحد (${MAX_PROMPT_CHARS}). قد يتم اقتطاع المحتوى.`);
    prompt = prompt.slice(0, MAX_PROMPT_CHARS) + "\n\n[تم اقتطاع باقي المحتوى بسبب حدود الحجم]";
  }

  console.log(`[شارف AI] تم بناء الأمر من ${files.length} ملف (${mdFiles.length} تعليمات + ${htmlFiles.length} قوالب) — ${prompt.length} حرف`);

  return prompt;
}

export async function generateLessonHtmlFromPdf(params: { lessonId: string, pdfPath: string, isRegeneration?: boolean }): Promise<{ success: boolean; message: string }> {
  const { lessonId, pdfPath, isRegeneration } = params;
  const statusKey = lessonId;
  generationStatus.set(statusKey, { status: "generating", updatedAt: Date.now() });

  try {
    const genAI = getGeminiClient();
    if (!genAI) {
      generationStatus.set(statusKey, { status: "error", message: "Gemini API غير مُعدّ", updatedAt: Date.now() });
      return { success: false, message: "Gemini API غير مُعدّ" };
    }

    let absolutePath = pdfPath;
    if (pdfPath.startsWith("/attached_assets/")) {
      absolutePath = path.resolve(process.cwd(), pdfPath.slice(1));
    } else if (!path.isAbsolute(pdfPath)) {
      absolutePath = path.resolve(process.cwd(), pdfPath);
    }

    const pdfBuffer = await readFile(absolutePath);
    const pdfBase64 = pdfBuffer.toString("base64");

    let prompt = await buildPromptFromFiles();

    if (isRegeneration) {
      prompt += `
\n
---
🚨 **تحذير كارثي وفشل ذريع في المخرجات السابقة - تدخل عاجل مطلوب:**
لقد أرسل المستخدم استغاثة! الرسومات السابقة كانت "كارثة" بكل المقاييس العلمية والجمالية. علامات الزائد والناقص ( مثل +++++++ ) مبعثرة بشكل عشوائي ومنفر، وهناك تداخلات بشعة بين النصوص والأشكال.

**المطلوب منك الآن هو "ثورة شاملة" في الكود الناتج:**
1. **الرسومات العلمية (SVG):** يُمنع منعا باتاً استخدام النصوص (+ أو -) لتمثيل الشحنات. يجب رسمها كرموز فنية احترافية (Paths/Circles) صغيرة، ملونة، وموزعة هندسياً بدقة متناهية.
2. **إنهاء التداخل فوراً:** أي تداخل بين نص ورسمة يعتبر "خطأ فادحاً". يجب أن يكون لكل عنصر "منطقة أمان" (Safe Zone) خاصة به. استخدم Flexbox و Grid بصرامة لضمان التباعد.
3. **الرموز الغريبة:** احذف أي رموز أو نصوص لا تنتمي للمحتوى التعليمي الأصلي.
4. **التغيير الجذري:** لا تقم بتغيير ألوان أو خطوط فقط. أعد بناء منطق الرسم (SVG Logic) وهيكل الصفحة من الصفر. اجعل الطالب يرى "لوحة تعليمية" وليس "خربشات تقنية".
5. **دقة 100%:** إذا لم تلتزم بهذه التعليمات بدقة 100%، فسيعتبر العمل غير مقبول نهائياً.
---
`;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 65536,
        temperature: 0.9, // زيادة الحرارة لضمان تنوع المخرجات وعدم التكرار
      },
    });

    // إضافة عنصر عشوائي (Random Seed) لضمان اختلاف النتائج في كل طلب
    const randomSeed = Math.random().toString(36).substring(7);
    const finalPrompt = `${prompt}\n\n[Random Identifier for unique generation: ${randomSeed}]`;

    const result = await model.generateContent([
      {
        text: finalPrompt
      },
      {
        inlineData: {
          data: pdfBase64,
          mimeType: "application/pdf",
        },
      },
    ]);

    const response = result.response;
    let html = "";
    try {
      html = response.text();
    } catch {
      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content) {
        html = candidates[0].content.parts.map((part: any) => part.text).join("");
      }
    }

    if (!html || html.trim().length < 500) {
      generationStatus.set(statusKey, { status: "error", message: "لم يتم توليد محتوى كافٍ", updatedAt: Date.now() });
      return { success: false, message: "لم يتم توليد محتوى كافٍ من Gemini" };
    }

    html = html.trim();
    const codeBlockMatch = html.match(/```html\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      html = codeBlockMatch[1].trim();
    } else {
      const altMatch = html.match(/```\s*([\s\S]*?)\s*```/);
      if (altMatch && altMatch[1].includes("<!DOCTYPE")) {
        html = altMatch[1].trim();
      }
    }
    if (!html.startsWith("<!DOCTYPE") && !html.startsWith("<html") && !html.startsWith("<!doctype")) {
      const htmlTagMatch = html.match(/<(!DOCTYPE|html)[\s\S]*/i);
      if (htmlTagMatch) {
        html = htmlTagMatch[0];
      }
    }

    await cmsStorage.upsertCmsContent({
      lessonId,
      tabType: "education",
      contentType: "html",
      dataValue: html,
    });

    generationStatus.set(statusKey, { status: "done", updatedAt: Date.now() });
    console.log(`[شارف AI] تم توليد HTML للدرس ${lessonId} بنجاح (${html.length} حرف)`);
    return { success: true, message: `تم توليد المحتوى بنجاح (${html.length} حرف)` };

  } catch (error: any) {
    const msg = error?.message || "خطأ غير معروف";
    console.error(`[شارف AI] خطأ في توليد HTML للدرس ${lessonId}:`, msg);
    generationStatus.set(statusKey, { status: "error", message: msg, updatedAt: Date.now() });
    return { success: false, message: msg };
  }
}
