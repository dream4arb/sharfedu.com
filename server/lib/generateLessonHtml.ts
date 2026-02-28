import { getGeminiClient } from "./gemini";
import * as cmsStorage from "../admin/cmsStorage";
import { readFile } from "fs/promises";
import path from "path";

const generationStatus = new Map<string, { status: "pending" | "generating" | "done" | "error"; message?: string; updatedAt: number }>();

export function getGenerationStatus(lessonId: string) {
  return generationStatus.get(lessonId) || null;
}

const CSS_TEMPLATE = `
:root {
  --primary: #1e3a8a;
  --primary-light: #2563eb;
  --bg: #f8fafc;
  --card: #ffffff;
  --green: #10b981;
  --red: #ef4444;
  --orange: #f59e0b;
  --purple: #7c3aed;
  --shadow: 0 4px 24px rgba(30,58,138,0.10);
  --shadow-lg: 0 8px 40px rgba(30,58,138,0.15);
  --radius: 20px;
}
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Tajawal',sans-serif; background:var(--bg); color:#1e293b; line-height:1.8; padding-bottom:80px; }
.container { max-width:1200px; margin:0 auto; padding:0 16px; }
section { margin:24px 0; }
section:first-of-type { margin-top:0; }

.hero {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
  padding:40px 20px; position:relative; overflow:hidden;
  border-radius:var(--radius); min-height:280px;
  display:flex; align-items:center; justify-content:center;
}
.hero-deco { position:absolute; top:0; left:0; width:100%; height:100%; overflow:hidden; pointer-events:none; }
.ds { position:absolute; background:rgba(255,255,255,0.1); border-radius:50%; animation:float 20s infinite ease-in-out; }
.ds:nth-child(1) { width:300px; height:300px; top:-150px; right:-100px; }
.ds:nth-child(2) { width:200px; height:200px; bottom:-100px; left:-50px; animation-delay:7s; }
.ds:nth-child(3) { width:150px; height:150px; top:50%; left:10%; animation-delay:14s; }
@keyframes float {
  0%,100% { transform:translate(0,0) rotate(0deg); }
  33% { transform:translate(30px,-30px) rotate(120deg); }
  66% { transform:translate(-20px,20px) rotate(240deg); }
}
.hero-card { position:relative; z-index:1; text-align:center; color:white; }
.hero h1 { font-size:clamp(28px,5vw,42px); font-weight:900; margin-bottom:12px; text-shadow:0 2px 10px rgba(0,0,0,0.2); }
.hsub { font-size:16px; opacity:0.95; font-weight:500; }
.badge-hero { background:rgba(255,255,255,0.25); color:white; border:2px solid rgba(255,255,255,0.4); padding:12px 32px; border-radius:50px; font-size:16px; font-weight:700; margin-top:20px; backdrop-filter:blur(10px); display:inline-block; }

.bb, .csheet, .genius, .clb, .qgen, .share {
  background:var(--card); padding:32px 24px; border-radius:var(--radius); box-shadow:var(--shadow); margin-bottom:24px;
}
h2 { font-size:clamp(22px,4vw,28px); color:var(--primary); margin-bottom:24px; font-weight:800; display:flex; align-items:center; gap:12px; }
.bd { background:linear-gradient(135deg,#eff6ff,#dbeafe); padding:20px; border-radius:16px; border-right:4px solid var(--primary-light); margin-bottom:20px; font-size:16px; line-height:1.8; color:#1e40af; font-weight:500; }

.mi { padding:16px; border-radius:12px; margin-bottom:12px; background:linear-gradient(135deg,#f0fdf4,#dcfce7); border-right:3px solid var(--green); }
.si { padding:16px; border-radius:12px; margin-bottom:12px; background:linear-gradient(135deg,#fef3c7,#fde68a); border-right:3px solid var(--orange); }
.lb { font-weight:800; margin-bottom:8px; font-size:15px; }
.mi .lb { color:#065f46; }
.si .lb { color:#92400e; }

.tg { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-top:20px; }
.tc { background:linear-gradient(135deg,#f0fdf4,#ecfdf5); border:2px solid #a7f3d0; border-radius:16px; padding:24px; text-align:center; transition:transform 0.2s; }
.tc:hover { transform:translateY(-4px); }
.tc .emoji { font-size:48px; margin-bottom:12px; display:block; }
.tc strong { display:block; color:#065f46; margin-bottom:8px; font-size:16px; }

.rule-card { background:linear-gradient(135deg,#eff6ff,#dbeafe); padding:20px; border-radius:16px; margin-bottom:16px; border:2px solid #93c5fd; text-align:center; }
.rule-card .formula { font-size:24px; font-weight:900; color:var(--primary); margin:16px 0; direction:ltr; }
.rule-card .desc { color:#1e40af; font-weight:500; }

.step { display:flex; gap:16px; margin-bottom:20px; align-items:flex-start; }
.step-num { min-width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg,var(--primary),var(--primary-light)); color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:20px; flex-shrink:0; }
.step-content { flex:1; background:#f8fafc; padding:16px; border-radius:12px; border:1px solid #e2e8f0; }

.example-card { background:linear-gradient(135deg,#faf5ff,#f3e8ff); padding:24px; border-radius:16px; border:2px solid #c4b5fd; margin-bottom:20px; }
.example-card h3 { color:var(--purple); font-weight:800; margin-bottom:12px; }
.solution-step { padding:12px; margin:8px 0; background:rgba(255,255,255,0.7); border-radius:8px; border-right:3px solid var(--purple); }

.svg-scroll { overflow-x:auto; max-width:100%; margin:20px 0; }
.visual-card { background:var(--card); padding:24px; border-radius:16px; box-shadow:var(--shadow); text-align:center; margin-bottom:20px; }
.visual-card svg { overflow:visible; }
.gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px; margin-top:20px; }

.q-card { background:var(--card); padding:24px; border-radius:16px; box-shadow:var(--shadow); margin-bottom:16px; border:2px solid transparent; transition:border-color 0.3s; }
.q-card.correct { border-color:var(--green); background:#f0fdf4; }
.q-card.wrong { border-color:var(--red); background:#fef2f2; }
.q-num { background:linear-gradient(135deg,var(--primary),var(--primary-light)); color:white; width:36px; height:36px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-weight:900; margin-left:12px; }
.q-text { font-size:17px; font-weight:700; margin-bottom:16px; }
.opts { display:grid; gap:10px; }
.opt-btn { display:block; width:100%; padding:14px 20px; border:2px solid #e2e8f0; border-radius:12px; background:#f8fafc; cursor:pointer; font-family:'Tajawal',sans-serif; font-size:15px; font-weight:600; text-align:right; transition:all 0.2s; }
.opt-btn:hover { border-color:var(--primary-light); background:#eff6ff; }
.opt-btn.selected-correct { background:#dcfce7; border-color:var(--green); color:#065f46; }
.opt-btn.selected-wrong { background:#fecaca; border-color:var(--red); color:#991b1b; }
.opt-btn.show-correct { background:#dcfce7; border-color:var(--green); }
.opt-btn:disabled { cursor:default; opacity:0.8; }
.feedback { margin-top:12px; padding:10px; border-radius:8px; font-weight:700; font-size:14px; }
.feedback.correct-fb { background:#dcfce7; color:#065f46; }
.feedback.wrong-fb { background:#fecaca; color:#991b1b; }

.result-box { background:linear-gradient(135deg,var(--primary),var(--primary-light)); color:white; padding:40px; border-radius:var(--radius); text-align:center; margin-top:24px; }
.result-box .score { font-size:64px; font-weight:900; }
.result-box .msg { font-size:22px; font-weight:700; margin:16px 0; }
.result-btns { display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap; }
.result-btns button { padding:12px 32px; border-radius:50px; border:none; font-family:'Tajawal',sans-serif; font-size:16px; font-weight:700; cursor:pointer; transition:transform 0.2s; }
.result-btns button:hover { transform:scale(1.05); }
.btn-retry { background:white; color:var(--primary); }
.btn-share { background:rgba(255,255,255,0.2); color:white; border:2px solid rgba(255,255,255,0.4)!important; }

.ref-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px; }
.ref-item { background:linear-gradient(135deg,#eff6ff,#dbeafe); padding:16px; border-radius:12px; text-align:center; }
.ref-item .ref-label { font-weight:800; color:var(--primary); margin-bottom:8px; }
.ref-item .ref-formula { font-size:18px; font-weight:700; color:#1e40af; direction:ltr; }

.checklist { list-style:none; }
.checklist li { padding:12px 16px; margin-bottom:8px; border-radius:12px; background:#f8fafc; border:2px solid #e2e8f0; display:flex; align-items:center; gap:12px; font-weight:600; cursor:pointer; transition:all 0.2s; }
.checklist li:hover { border-color:var(--primary-light); }
.checklist li.done { background:#f0fdf4; border-color:var(--green); text-decoration:line-through; color:#6b7280; }
.check-icon { width:24px; height:24px; border-radius:50%; border:2px solid #cbd5e1; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
.checklist li.done .check-icon { background:var(--green); border-color:var(--green); color:white; }

@media(max-width:768px) {
  .hero { padding:30px 16px; min-height:200px; }
  .hero h1 { font-size:24px; }
  .bb,.csheet,.genius,.clb,.qgen,.share { padding:20px 16px; }
  .tg,.gallery,.ref-grid { grid-template-columns:1fr; }
  .step { flex-direction:column; align-items:center; text-align:center; }
  .info-bar { flex-direction:column; gap:8px; }
}
`;

const HTML_STRUCTURE_TEMPLATE = `
<!-- هذا هو الهيكل الذي يجب اتباعه بالضبط -->

<section class="hero">
  <div class="hero-deco"><div class="ds"></div><div class="ds"></div><div class="ds"></div></div>
  <div class="hero-card">
    <h1>[عنوان الدرس]</h1>
    <p class="hsub">مساعد تعليمي ذكي • شرح تفاعلي شامل • تدريب غير محدود</p>
    <div class="badge-hero">📚 منصة شارف التعليمية</div>
  </div>
</section>

<div class="container">

  <section class="bb">
    <h2>🎯 الفائدة من هذا الدرس</h2>
    <div class="bd">[شرح موجز عن أهمية الدرس وتطبيقاته العملية]</div>
  </section>

  <section class="bb">
    <h2>📚 المصطلحات الأساسية</h2>
    [بطاقات mi و si للمصطلحات مع lb للعنوان]
  </section>

  <section class="bb">
    <h2>⚖️ القواعد الذهبية</h2>
    [بطاقات rule-card لكل قاعدة مع formula و desc]
  </section>

  <section class="bb">
    <h2>🔧 خطوات الحل</h2>
    [خطوات مرقمة باستخدام step و step-num و step-content]
  </section>

  <section class="bb">
    <h2>📐 الرسوم التوضيحية</h2>
    <div class="gallery">
      [بطاقات visual-card تحتوي على رسوم SVG واضحة مع تسميات عربية]
    </div>
  </section>

  <section class="bb">
    <h2>💡 أمثلة محلولة</h2>
    [بطاقات example-card مع solution-step]
  </section>

  <section class="bb">
    <h2>📋 المرجع السريع</h2>
    <div class="ref-grid">
      [بطاقات ref-item مع ref-label و ref-formula]
    </div>
  </section>

  <section class="qgen">
    <h2>🎲 الأسئلة التفاعلية</h2>
    <div id="quiz-area">
      [أسئلة q-card مع q-num و q-text و opts مع opt-btn]
    </div>
    <div id="quiz-result"></div>
  </section>

  <section class="clb">
    <h2>✅ قائمة الإنجاز</h2>
    <ul class="checklist" id="checklist">
      [عناصر li مع check-icon لكل مهارة في الدرس]
    </ul>
  </section>

</div>
`;

function buildPrompt(): string {
  return `أنت مبرمج محترف ومعلم خبير في إنشاء صفحات HTML تعليمية تفاعلية احترافية بالعربية.
مهمتك: تحليل ملف PDF المرفق واستخراج محتوى الدرس بالكامل، ثم إنشاء صفحة HTML تعليمية احترافية.

## ⚠️ قاعدة صارمة ومطلقة:
يجب أن يكون الناتج صفحة HTML واحدة كاملة ومستقلة. ابدأ بـ <!DOCTYPE html> وانتهِ بـ </html>.
لا تكتب أي نص قبل <!DOCTYPE html> أو بعد </html>. لا تلف الكود في markdown.

## CSS المطلوب (انسخه حرفياً في <style>):
${CSS_TEMPLATE}

## هيكل HTML المطلوب (التزم بهذا الترتيب والأسماء):
${HTML_STRUCTURE_TEMPLATE}

## 📐 قواعد رسوم SVG (مهم جداً):
1. كل رسم SVG يوضع داخل <div class="visual-card"> ثم <div class="svg-scroll">
2. استخدم viewBox مناسب مع overflow:visible على العنصر svg
3. جميع النصوص بخط Tajawal بالعربية
4. استخدم ألوان واضحة: stroke="#1e3a8a" للخطوط، fill="#dbeafe" للتعبئة الخفيفة
5. أضف تسميات واضحة لكل عنصر في الرسم (نقاط، زوايا، أبعاد)
6. أنشئ 3 رسوم SVG على الأقل توضح المفاهيم الرئيسية
7. كل رسم يجب أن يكون دقيقاً رياضياً ومرتبطاً بمحتوى الدرس
8. حجم SVG: عرض 400-600px وارتفاع مناسب

## 🎲 قواعد الاختبار التفاعلي (مهم جداً):
1. 8-10 أسئلة اختيار من متعدد (4 خيارات لكل سؤال)
2. كل سؤال في بطاقة q-card مع q-num و q-text
3. الخيارات في div.opts مع أزرار opt-btn
4. عند الضغط على الإجابة الصحيحة: أضف class "selected-correct" + أظهر feedback.correct-fb
5. عند الضغط على الإجابة الخاطئة: أضف class "selected-wrong" + أظهر feedback.wrong-fb + أظهر الإجابة الصحيحة بـ show-correct
6. بعد الإجابة على جميع الأسئلة: أظهر النتيجة في result-box مع score و msg
7. أضف زر "أعد المحاولة" في result-btns
8. JavaScript مضمّن قبل </body>

## ✅ قواعد قائمة الإنجاز:
1. 6-8 عناصر تمثل مهارات الدرس
2. عند النقر على عنصر يتبدل بين done وعادي
3. JavaScript بسيط للتبديل

## 📋 قواعد المرجع السريع:
1. 4-6 بطاقات ref-item تلخص أهم القوانين والقواعد
2. كل بطاقة تحتوي ref-label (العنوان) و ref-formula (الصيغة/القانون)

## 🚫 ممنوعات مطلقة:
- لا تستخدم أي مكتبة خارجية (لا Chart.js، لا jQuery، لا Bootstrap)
- لا تستخدم صور خارجية — فقط SVG مرسوم بالكود
- لا تضع بيانات وهمية — كل المحتوى من ملف PDF الفعلي
- لا تكتب "شارف AI" أو "تم التوليد تلقائياً" — فقط "📚 منصة شارف التعليمية"
- لا تختصر أو تبسط — أعطِ شرحاً كاملاً وتفصيلياً
- لا تترك أي قسم فارغاً

## 🎨 معايير الجودة:
- الصفحة يجب أن تكون 2000+ سطر على الأقل
- CSS غني ومفصّل (استخدم القالب أعلاه + أضف أنماط إضافية حسب الحاجة)
- ألوان متناسقة ومتدرجة (الأزرق الداكن #1e3a8a كلون أساسي)
- تصميم متجاوب يعمل على الموبايل والديسكتوب
- خط Tajawal بجميع الأوزان (400,500,700,800,900)
- حركات انتقالية ناعمة (transitions) على البطاقات والأزرار`;
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
        temperature: 0.3,
      },
    });

    const prompt = buildPrompt();

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
