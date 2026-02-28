import { getGeminiClient } from "./gemini";
import * as cmsStorage from "../admin/cmsStorage";
import { readFile } from "fs/promises";
import path from "path";

const generationStatus = new Map<string, { status: "pending" | "generating" | "done" | "error"; message?: string; updatedAt: number }>();

export function getGenerationStatus(lessonId: string) {
  return generationStatus.get(lessonId) || null;
}

export async function generateLessonHtmlFromPdf(lessonId: string, pdfPath: string): Promise<{ success: boolean; message: string }> {
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

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 65536,
        temperature: 0.4,
      },
    });

    const prompt = `أنت خبير في إنشاء محتوى تعليمي تفاعلي باللغة العربية. 
قم بتحليل ملف PDF التالي واستخراج محتوى الدرس بالكامل، ثم أنشئ صفحة HTML تعليمية شاملة ومتكاملة.

## المتطلبات الصارمة:

### 1. البنية العامة:
- صفحة HTML كاملة مستقلة (مع <!DOCTYPE html> و <head> و <body>)
- اتجاه RTL (dir="rtl" lang="ar")
- خط Tajawal من Google Fonts
- تصميم متجاوب (responsive) يعمل على جميع الأجهزة
- ألوان رئيسية: تدرج من teal (#0d9488) إلى cyan (#0891b2)

### 2. الأقسام المطلوبة (بالترتيب):

**أ. قسم العنوان (Hero):**
- شارة (badge) صغيرة في أعلى الهيدر تحتوي على النص: "✨ منصة شارف التعليمية" (بدون أي نص آخر مثل "تم التوليد" أو "شارف AI")
- عنوان الدرس بخط كبير وعريض
- شريط تعريفي يحتوي على: المادة، الصف، الفصل
- خلفية متدرجة جذابة

**ب. قسم الأهداف:**
- أهداف الدرس في قائمة مرقمة
- كل هدف في بطاقة منفصلة مع أيقونة ✓

**ج. قسم الشرح الرئيسي:**
- شرح المفاهيم الأساسية بالتفصيل
- استخدام عناوين فرعية واضحة
- إضافة أمثلة محلولة مع خطوات الحل
- استخدام ألوان مميزة للمعادلات والقوانين

**د. قسم الرسوم التوضيحية (SVG):**
- إنشاء رسوم بيانية أو أشكال هندسية باستخدام SVG مباشرة في HTML
- الأشكال يجب أن تكون واضحة ومُعلَّمة بالعربية
- استخدم viewBox مناسب مع overflow:visible
- لف الأشكال العريضة (أكبر من 500px) في div بـ class="svg-scroll" مع overflow-x:auto

**هـ. قسم الاختبار التفاعلي (Quiz):**
- 5-10 أسئلة اختيار من متعدد مبنية على محتوى الدرس
- كل سؤال يظهر في بطاقة منفصلة
- عند اختيار إجابة: أخضر للصحيحة، أحمر للخاطئة
- إظهار النتيجة النهائية مع نسبة مئوية
- JavaScript تفاعلي مضمّن في الصفحة

**و. قسم الملخص:**
- نقاط رئيسية مُلخصة
- قوانين أو معادلات مهمة في بطاقات مميزة

### 3. قواعد التصميم:
- CSS مضمّن بالكامل داخل <style> في <head>
- JavaScript مضمّن داخل <script> قبل </body>
- بطاقات بحواف مستديرة (border-radius: 16px) وظلال خفيفة
- تباعد مريح بين العناصر (gap, padding, margin)
- ألوان خلفية فاتحة للبطاقات (#ffffff) مع حدود رفيعة (#e5e7eb)
- نصوص بألوان داكنة للقراءة (#1f2937)

### 4. ممنوعات:
- لا تستخدم أي مكتبات خارجية (فقط HTML/CSS/JS خام + Google Fonts)
- لا تضف صور خارجية — استخدم SVG فقط للرسوم
- لا تستخدم placeholder أو بيانات وهمية — كل المحتوى من الدرس الفعلي

### 5. مهم جداً:
- أرجع كود HTML فقط بدون أي نص إضافي أو تعليقات خارج الكود
- لا تلف الكود في \`\`\`html\`\`\` — أرجع HTML مباشرة
- تأكد أن الكود كامل وقابل للعرض مباشرة في المتصفح`;

    const result = await model.generateContent([
      prompt,
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

    if (!html || html.trim().length < 100) {
      generationStatus.set(statusKey, { status: "error", message: "لم يتم توليد محتوى كافٍ", updatedAt: Date.now() });
      return { success: false, message: "لم يتم توليد محتوى كافٍ من Gemini" };
    }

    html = html.trim();
    const codeBlockMatch = html.match(/```html\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      html = codeBlockMatch[1].trim();
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
