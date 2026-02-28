import { getGeminiClient } from "./gemini";
import * as cmsStorage from "../admin/cmsStorage";
import { readFile } from "fs/promises";
import path from "path";

const generationStatus = new Map<string, { status: "pending" | "generating" | "done" | "error"; message?: string; updatedAt: number }>();

export function getGenerationStatus(lessonId: string) {
  return generationStatus.get(lessonId) || null;
}

function buildPrompt(): string {
  return `أنت مصمم ويب مبدع ومعلم خبير متخصص في إنشاء تجارب تعليمية تفاعلية مذهلة بالعربية.
مهمتك: تحليل ملف PDF المرفق واستخراج كل محتوى الدرس بدقة، ثم إنشاء صفحة HTML تعليمية مبتكرة وفريدة.

## ⚠️ قاعدة صارمة ومطلقة:
يجب أن يكون الناتج صفحة HTML واحدة كاملة ومستقلة. ابدأ بـ <!DOCTYPE html> وانتهِ بـ </html>.
لا تكتب أي نص قبل <!DOCTYPE html> أو بعد </html>. لا تلف الكود في markdown.

## 🎨 التصميم المبتكر المطلوب:

أنشئ تصميماً فريداً ومبدعاً يتبع المعايير التالية:

### لوحة الألوان (خلفية فاتحة بيضاء):
- خلفية الصفحة: #ffffff (أبيض نقي)
- خلفية ثانوية: #f8fafe (رمادي أزرق فاتح جداً)
- لون أساسي: #0c6b58 (أخضر فيروزي غامق)
- لون أساسي فاتح: #10b981 (أخضر زمردي)
- لون ثانوي: #6366f1 (بنفسجي)
- لون تأكيد: #ef4444 (أحمر)
- لون نجاح: #22c55e (أخضر)
- لون تحذير: #f59e0b (برتقالي)
- النصوص الرئيسية: #1e293b (أسود مزرق)
- النصوص الثانوية: #64748b (رمادي)
- خلفية البطاقات: #ffffff مع border: 1px solid #e2e8f0 و box-shadow ناعم
- خلفية Hero: تدرج من #0c6b58 إلى #10b981 إلى #059669

### مؤثرات بصرية مطلوبة:
1. **بطاقات مرتفعة**: box-shadow ناعم (0 4px 24px rgba(0,0,0,0.06)) مع hover يرفع البطاقة
2. **تدرجات متحركة**: خلفية الـ hero بتدرج متحرك
3. **أشكال زخرفية**: دوائر ومضلعات شفافة في Hero
4. **شريط تقدم عائم**: شريط progress ثابت أعلى الصفحة يتتبع التمرير
5. **أرقام الأقسام**: كل قسم له رقم كبير شفاف (opacity:0.04) بحجم 160px في الخلفية
6. **حدود ملونة**: كل قسم له شريط لوني على اليمين عند hover
7. **خلفيات متدرجة خفيفة**: للبطاقات الداخلية (من أبيض إلى رمادي فاتح جداً)

### بنية الـ CSS (اكتبها كاملة في <style>):
\`\`\`
:root {
  --bg: #ffffff;
  --bg-soft: #f8fafe;
  --bg-card: #ffffff;
  --primary: #0c6b58;
  --primary-light: #10b981;
  --primary-lighter: #d1fae5;
  --purple: #6366f1;
  --purple-light: #e0e7ff;
  --coral: #ef4444;
  --success: #22c55e;
  --warning: #f59e0b;
  --text: #1e293b;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --shadow: 0 4px 24px rgba(0,0,0,0.06);
  --shadow-lg: 0 12px 40px rgba(0,0,0,0.08);
  --shadow-hover: 0 8px 32px rgba(0,0,0,0.1);
  --radius: 24px;
  --radius-sm: 16px;
  --radius-xs: 12px;
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  font-family:'Tajawal',sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height:1.9;
  min-height:100vh;
  overflow-x:hidden;
}

#progress-bar {
  position:fixed; top:0; right:0; height:3px; z-index:1000;
  background: linear-gradient(90deg, var(--primary), var(--purple), var(--primary-light));
  width:0%; transition: width 0.1s;
  box-shadow: 0 0 10px rgba(12,107,88,0.3);
}

.container { max-width:900px; margin:0 auto; padding:0 20px; }

/* ===== HERO ===== */
.hero-section {
  min-height:400px; display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden; padding:60px 20px 50px;
  background: linear-gradient(135deg, #064e3b, #0c6b58, #10b981, #059669);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
@keyframes gradient-shift {
  0%,100% { background-position:0% 50%; }
  25% { background-position:100% 0%; }
  50% { background-position:100% 100%; }
  75% { background-position:0% 100%; }
}
.hero-deco {
  position:absolute; border-radius:50%; opacity:0.12; pointer-events:none;
  animation: deco-float 20s ease-in-out infinite;
}
.hero-deco-1 { width:350px; height:350px; background:white; top:-150px; right:-80px; }
.hero-deco-2 { width:280px; height:280px; background:white; bottom:-120px; left:-80px; animation-delay:7s; }
.hero-deco-3 { width:180px; height:180px; background:white; top:40%; left:50%; animation-delay:12s; }
@keyframes deco-float {
  0%,100% { transform:translate(0,0) scale(1); }
  33% { transform:translate(30px,-30px) scale(1.05); }
  66% { transform:translate(-20px,20px) scale(0.95); }
}
.hero-content { position:relative; z-index:2; text-align:center; max-width:750px; }
.hero-badge {
  display:inline-flex; align-items:center; gap:8px;
  background: rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3);
  padding:8px 24px; border-radius:50px; font-size:14px; font-weight:700;
  color:white; margin-bottom:24px; backdrop-filter:blur(10px);
}
.hero-badge::before { content:''; width:8px; height:8px; border-radius:50%; background:#22c55e; animation:pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.5);} }
.hero-title {
  font-size:clamp(30px,6vw,52px); font-weight:900; color:white;
  line-height:1.3; margin-bottom:16px; text-shadow:0 2px 10px rgba(0,0,0,0.15);
}
.hero-subtitle { font-size:17px; color:rgba(255,255,255,0.85); font-weight:500; max-width:600px; margin:0 auto 28px; line-height:1.8; }
.hero-stats { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
.hero-stat-chip {
  background:rgba(255,255,255,0.15); backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,0.25); border-radius:var(--radius-sm);
  padding:12px 20px; text-align:center; min-width:100px;
}
.hero-stat-chip .val { font-size:22px; font-weight:900; color:white; display:block; }
.hero-stat-chip .lbl { font-size:12px; color:rgba(255,255,255,0.7); }
.platform-badge {
  margin-top:28px; display:inline-block;
  background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.3);
  padding:12px 36px; border-radius:50px; font-size:15px; font-weight:800; color:white;
}

/* ===== الأقسام ===== */
.lesson-section { margin:28px 0; }
.section-card {
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--radius); padding:36px 32px;
  box-shadow:var(--shadow); position:relative; overflow:hidden;
  transition: box-shadow 0.3s, transform 0.3s;
}
.section-card:hover {
  box-shadow:var(--shadow-hover); transform:translateY(-2px);
}
.section-card::before {
  content:attr(data-section-num); position:absolute; top:-10px; left:20px;
  font-size:160px; font-weight:900; color:rgba(0,0,0,0.03);
  line-height:1; pointer-events:none; z-index:0;
}
.section-card > * { position:relative; z-index:1; }

.section-header { display:flex; align-items:center; gap:14px; margin-bottom:28px; }
.section-icon {
  width:52px; height:52px; border-radius:var(--radius-xs);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; flex-shrink:0;
}
.section-icon.teal { background:var(--primary-lighter); }
.section-icon.purple { background:var(--purple-light); }
.section-icon.coral { background:#fee2e2; }
.section-icon.gold { background:#fef3c7; }
.section-icon.green { background:#dcfce7; }
.section-title { font-size:clamp(22px,4vw,28px); font-weight:800; color:var(--primary); }

/* بطاقة المعلومة */
.info-highlight {
  background:linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border:1px solid #a7f3d0; border-radius:var(--radius-sm);
  padding:20px 24px; margin-bottom:20px; font-size:16px; line-height:2;
  color:#065f46; font-weight:500; border-right:4px solid var(--primary-light);
}

/* بطاقات المصطلحات */
.term-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; }
.term-card {
  background:var(--bg-soft); border:1px solid var(--border);
  border-radius:var(--radius-sm); padding:20px; transition:all 0.3s;
}
.term-card:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.term-card.primary { border-right:3px solid var(--primary-light); }
.term-card.secondary { border-right:3px solid var(--purple); }
.term-name { font-weight:800; font-size:17px; margin-bottom:8px; }
.term-card.primary .term-name { color:var(--primary); }
.term-card.secondary .term-name { color:var(--purple); }
.term-def { color:var(--text-secondary); font-size:15px; line-height:1.8; }

/* بطاقات القواعد */
.rule-card {
  background:linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border:1px solid #bae6fd; border-radius:var(--radius-sm);
  padding:24px; text-align:center; margin-bottom:16px;
  transition:all 0.3s;
}
.rule-card:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.rule-formula {
  font-size:28px; font-weight:900; margin:16px 0;
  color:var(--primary); direction:ltr; display:inline-block;
}
.rule-desc { color:var(--text-secondary); font-weight:500; }

/* خطوات الحل - Timeline */
.steps-timeline { position:relative; padding-right:40px; }
.steps-timeline::before {
  content:''; position:absolute; right:18px; top:0; bottom:0; width:2px;
  background: linear-gradient(to bottom, var(--primary-light), var(--purple), #e2e8f0);
}
.step-item { display:flex; gap:20px; margin-bottom:24px; align-items:flex-start; position:relative; }
.step-marker {
  min-width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:16px; color:white; flex-shrink:0; position:relative; z-index:2;
  background:linear-gradient(135deg, var(--primary), var(--primary-light));
  box-shadow:0 4px 12px rgba(12,107,88,0.25);
}
.step-body {
  flex:1; background:var(--bg-soft); border:1px solid var(--border);
  border-radius:var(--radius-xs); padding:18px 20px; transition: box-shadow 0.3s;
}
.step-body:hover { box-shadow:var(--shadow); }
.step-body strong { color:var(--primary); display:block; margin-bottom:6px; }

/* ===== الرسوم التوضيحية (كل رسم في صف مستقل - لا grid) ===== */
.visual-card {
  background:var(--bg-card); border:1px solid var(--border);
  border-radius:var(--radius-sm); padding:28px; text-align:center;
  margin-bottom:24px; box-shadow:var(--shadow);
  transition:all 0.3s;
}
.visual-card:hover { box-shadow:var(--shadow-hover); transform:translateY(-2px); }
.visual-card svg {
  overflow:visible; display:block; margin:0 auto;
  max-width:100%; width:100%; min-height:300px;
}
.visual-title { font-size:17px; font-weight:800; color:var(--primary); margin-top:16px; }
.svg-scroll { overflow-x:auto; max-width:100%; padding:10px 0; }

/* الأمثلة المحلولة */
.example-card {
  background:linear-gradient(135deg, #faf5ff, #f5f3ff);
  border:1px solid #ddd6fe; border-radius:var(--radius-sm);
  padding:28px; margin-bottom:20px;
}
.example-title { color:var(--purple); font-weight:800; font-size:18px; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
.solution-step {
  padding:14px 18px; margin:10px 0; border-radius:var(--radius-xs);
  background:white; border-right:3px solid var(--purple);
  color:var(--text); font-size:15px; line-height:1.9;
  box-shadow:0 1px 4px rgba(0,0,0,0.04);
}
.solution-step .step-label { color:var(--primary); font-weight:800; margin-bottom:4px; display:block; font-size:13px; }
.solution-result {
  background:linear-gradient(135deg,#dcfce7,#f0fdf4);
  border:1px solid #86efac; border-radius:var(--radius-xs);
  padding:16px; text-align:center; margin-top:14px;
  font-weight:800; font-size:18px; color:#065f46;
}

/* المرجع السريع */
.ref-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.ref-item {
  background:linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border:1px solid #a7f3d0; border-radius:var(--radius-xs);
  padding:18px; text-align:center; transition:all 0.3s;
}
.ref-item:hover { box-shadow:var(--shadow); transform:translateY(-2px); }
.ref-label { font-weight:800; color:var(--primary); margin-bottom:8px; font-size:14px; }
.ref-formula { font-size:20px; font-weight:900; color:var(--text); direction:ltr; }

/* ===== الاختبار التفاعلي ===== */
.quiz-wrapper {
  background:white; border:1px solid var(--border);
  border-radius:var(--radius); overflow:hidden; box-shadow:var(--shadow-lg);
}
.quiz-header {
  background:linear-gradient(135deg, #ecfdf5, #f0fdf4);
  padding:20px 28px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  border-bottom:1px solid var(--border);
}
.quiz-progress-bar { flex:1; min-width:200px; height:6px; background:#e2e8f0; border-radius:10px; overflow:hidden; }
.quiz-progress-fill { height:100%; background:linear-gradient(90deg,var(--primary-light),var(--purple)); border-radius:10px; transition:width 0.5s; width:0%; }
.quiz-counter { font-weight:800; color:var(--primary); font-size:14px; white-space:nowrap; }
.quiz-body { padding:28px; }

.q-card {
  background:var(--bg-soft); border:1px solid var(--border);
  border-radius:var(--radius-sm); padding:28px; margin-bottom:16px;
  transition:all 0.4s;
}
.q-card.correct { border-color:var(--success); box-shadow:0 0 20px rgba(34,197,94,0.12); background:#f0fdf4; }
.q-card.wrong { border-color:var(--coral); box-shadow:0 0 20px rgba(239,68,68,0.12); background:#fef2f2; }
.q-num {
  display:inline-flex; align-items:center; justify-content:center;
  width:38px; height:38px; border-radius:var(--radius-xs);
  background:linear-gradient(135deg, var(--primary), var(--primary-light));
  color:white; font-weight:900; font-size:16px; margin-left:12px;
  box-shadow:0 4px 12px rgba(12,107,88,0.2);
}
.q-text { font-size:18px; font-weight:700; margin-bottom:20px; color:var(--text); display:flex; align-items:center; }
.opts { display:grid; gap:12px; }
.opt-btn {
  display:flex; align-items:center; gap:12px; width:100%;
  padding:16px 20px; border:1px solid var(--border);
  border-radius:var(--radius-xs); background:white;
  cursor:pointer; font-family:'Tajawal',sans-serif; font-size:15px;
  font-weight:600; text-align:right; color:var(--text);
  transition:all 0.3s;
}
.opt-btn:hover { border-color:var(--primary-light); background:#f0fdf4; box-shadow:var(--shadow); }
.opt-letter {
  min-width:32px; height:32px; border-radius:10px; display:flex; align-items:center;
  justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;
  background:var(--bg-soft); color:var(--text-secondary);
  border:1px solid var(--border);
}
.opt-btn.selected-correct { background:#dcfce7; border-color:var(--success); }
.opt-btn.selected-correct .opt-letter { background:var(--success); color:white; border-color:var(--success); }
.opt-btn.selected-wrong { background:#fecaca; border-color:var(--coral); }
.opt-btn.selected-wrong .opt-letter { background:var(--coral); color:white; border-color:var(--coral); }
.opt-btn.show-correct { background:#dcfce7; border-color:var(--success); }
.opt-btn.show-correct .opt-letter { background:var(--success); color:white; border-color:var(--success); }
.opt-btn:disabled { cursor:default; }
.feedback { margin-top:14px; padding:12px 16px; border-radius:var(--radius-xs); font-weight:700; font-size:14px; }
.feedback.correct-fb { background:#dcfce7; color:#065f46; border:1px solid #86efac; }
.feedback.wrong-fb { background:#fecaca; color:#991b1b; border:1px solid #fca5a5; }

.result-box {
  background:linear-gradient(135deg, #064e3b, #0c6b58, #10b981);
  border-radius:var(--radius); padding:48px 32px; text-align:center; margin-top:28px;
  color:white; box-shadow:var(--shadow-lg);
}
.result-score { font-size:72px; font-weight:900; color:white; }
.result-msg { font-size:24px; font-weight:800; margin:16px 0; }
.result-detail { color:rgba(255,255,255,0.8); font-size:16px; margin-bottom:24px; }
.result-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.btn-retry {
  padding:14px 40px; border-radius:50px; border:none; font-family:'Tajawal',sans-serif;
  font-size:16px; font-weight:800; cursor:pointer; transition:all 0.3s;
  background:white; color:var(--primary); box-shadow:0 4px 15px rgba(0,0,0,0.15);
}
.btn-retry:hover { transform:scale(1.05); }
.btn-share {
  padding:14px 40px; border-radius:50px; font-family:'Tajawal',sans-serif;
  font-size:16px; font-weight:800; cursor:pointer; transition:all 0.3s;
  background:transparent; color:white; border:2px solid rgba(255,255,255,0.4);
}
.btn-share:hover { background:rgba(255,255,255,0.1); }

/* ===== قائمة الإنجاز ===== */
.checklist { list-style:none; }
.checklist li {
  padding:14px 18px; margin-bottom:10px; border-radius:var(--radius-xs);
  background:var(--bg-soft); border:1px solid var(--border);
  display:flex; align-items:center; gap:14px; font-weight:600;
  cursor:pointer; transition:all 0.3s; font-size:15px;
}
.checklist li:hover { box-shadow:var(--shadow); border-color:var(--primary-light); }
.checklist li.done { background:#f0fdf4; border-color:#86efac; color:var(--text-secondary); text-decoration:line-through; }
.check-box {
  width:26px; height:26px; border-radius:8px; border:2px solid #cbd5e1;
  display:flex; align-items:center; justify-content:center; font-size:14px;
  flex-shrink:0; transition:all 0.3s; color:transparent;
}
.checklist li.done .check-box { background:var(--success); border-color:var(--success); color:white; }

/* Footer */
.page-footer {
  text-align:center; padding:40px 20px; margin-top:48px;
  border-top:1px solid var(--border); color:var(--text-secondary); font-size:14px;
}
.page-footer strong { color:var(--primary); }

/* متجاوب */
@media(max-width:768px) {
  .hero-section { padding:40px 16px 30px; min-height:300px; }
  .hero-title { font-size:28px; }
  .section-card { padding:24px 18px; }
  .term-grid, .ref-grid { grid-template-columns:1fr; }
  .steps-timeline { padding-right:30px; }
  .steps-timeline::before { right:13px; }
  .step-marker { min-width:30px; height:30px; font-size:13px; }
  .quiz-body { padding:18px; }
  .q-card { padding:20px; }
  .result-score { font-size:48px; }
  .hero-stats { gap:8px; }
  .hero-stat-chip { padding:8px 14px; min-width:80px; }
  .hero-stat-chip .val { font-size:18px; }
  .visual-card svg { min-height:220px; }
}
\`\`\`

## هيكل HTML المطلوب (يجب اتباعه بالضبط):

\`\`\`html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[عنوان الدرس]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    [CSS الكامل أعلاه + أي أنماط إضافية]
  </style>
</head>
<body>
  <div id="progress-bar"></div>

  <!-- Hero -->
  <section class="hero-section">
    <div class="hero-deco hero-deco-1"></div>
    <div class="hero-deco hero-deco-2"></div>
    <div class="hero-deco hero-deco-3"></div>
    <div class="hero-content">
      <div class="hero-badge">✨ منصة شارف التعليمية</div>
      <h1 class="hero-title">[عنوان الدرس]</h1>
      <p class="hero-subtitle">[وصف مختصر وجذاب للدرس]</p>
      <div class="hero-stats">
        [3-4 إحصائيات عن الدرس في hero-stat-chip]
      </div>
      <div class="platform-badge">📚 شرح تفاعلي شامل • تدريب غير محدود</div>
    </div>
  </section>

  <div class="container">

    <!-- 1. لماذا هذا الدرس مهم -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="01">
        <div class="section-header">
          <div class="section-icon teal">🎯</div>
          <h2 class="section-title">لماذا هذا الدرس مهم؟</h2>
        </div>
        <div class="info-highlight">[شرح أهمية الدرس وتطبيقاته]</div>
      </div>
    </div>

    <!-- 2. المصطلحات -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="02">
        <div class="section-header">
          <div class="section-icon purple">📖</div>
          <h2 class="section-title">المصطلحات الأساسية</h2>
        </div>
        <div class="term-grid">
          [بطاقات term-card primary و secondary]
        </div>
      </div>
    </div>

    <!-- 3. القواعد الذهبية -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="03">
        <div class="section-header">
          <div class="section-icon gold">⚡</div>
          <h2 class="section-title">القواعد الذهبية</h2>
        </div>
        [بطاقات rule-card مع rule-formula و rule-desc]
      </div>
    </div>

    <!-- 4. خطوات الحل -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="04">
        <div class="section-header">
          <div class="section-icon teal">🧩</div>
          <h2 class="section-title">خطوات الحل</h2>
        </div>
        <div class="steps-timeline">
          [عناصر step-item مع step-marker و step-body]
        </div>
      </div>
    </div>

    <!-- 5. الرسوم التوضيحية -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="05">
        <div class="section-header">
          <div class="section-icon purple">📐</div>
          <h2 class="section-title">الرسوم التوضيحية</h2>
        </div>
        <!-- ⚠️ مهم جداً: كل رسم في صف مستقل — لا تستخدم grid أو gallery -->
        <div class="visual-card">
          <div class="svg-scroll"><svg ...>...</svg></div>
          <div class="visual-title">عنوان الرسم</div>
        </div>
        <div class="visual-card">
          <div class="svg-scroll"><svg ...>...</svg></div>
          <div class="visual-title">عنوان الرسم</div>
        </div>
        <!-- كل visual-card في صف مستقل بعرض كامل -->
      </div>
    </div>

    <!-- 6. أمثلة محلولة -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="06">
        <div class="section-header">
          <div class="section-icon coral">💡</div>
          <h2 class="section-title">أمثلة محلولة</h2>
        </div>
        [بطاقات example-card مع solution-step و solution-result]
      </div>
    </div>

    <!-- 7. المرجع السريع -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="07">
        <div class="section-header">
          <div class="section-icon teal">📋</div>
          <h2 class="section-title">المرجع السريع</h2>
        </div>
        <div class="ref-grid">
          [بطاقات ref-item مع ref-label و ref-formula]
        </div>
      </div>
    </div>

    <!-- 8. الاختبار التفاعلي -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="08" style="padding:0;border:none;box-shadow:none;">
        <div class="quiz-wrapper">
          <div class="quiz-header">
            <div class="section-header" style="margin:0;">
              <div class="section-icon purple">🎲</div>
              <h2 class="section-title" style="font-size:22px;">الاختبار التفاعلي</h2>
            </div>
            <div style="display:flex;align-items:center;gap:12px;">
              <div class="quiz-progress-bar"><div class="quiz-progress-fill" id="quiz-progress"></div></div>
              <span class="quiz-counter" id="quiz-counter">0/0</span>
            </div>
          </div>
          <div class="quiz-body">
            <div id="quiz-area"></div>
            <div id="quiz-result"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 9. قائمة الإنجاز -->
    <div class="lesson-section">
      <div class="section-card" data-section-num="09">
        <div class="section-header">
          <div class="section-icon green">✅</div>
          <h2 class="section-title">قائمة الإنجاز</h2>
        </div>
        <ul class="checklist" id="checklist">
          [عناصر li مع check-box لكل مهارة]
        </ul>
      </div>
    </div>

  </div>

  <div class="page-footer">
    صُمم بعناية بواسطة <strong>منصة شارف التعليمية</strong>
  </div>

  <script>
    // شريط التقدم
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      document.getElementById('progress-bar').style.width = (window.scrollY/h*100)+'%';
    });
    // قائمة الإنجاز
    document.querySelectorAll('#checklist li').forEach(li => {
      li.addEventListener('click', () => li.classList.toggle('done'));
    });
    // الاختبار التفاعلي
    [JavaScript للاختبار: عرض سؤال واحد تلو الآخر، تحديث شريط التقدم، عرض النتيجة]
  </script>
</body>
</html>
\`\`\`

## 📐 قواعد رسوم SVG (مهم جداً - تغيير كبير):
1. ⚠️ **كل رسم SVG في صف مستقل بعرض كامل** — لا تضع الرسوم في grid أو جنباً إلى جنب أبداً
2. كل رسم في <div class="visual-card"> منفصل (بدون أي div يجمعها كـ gallery أو grid)
3. حجم SVG كبير: width="100%" وviewBox بعرض 600-800 وارتفاع 350-500
4. min-height:300px على SVG لضمان حجم كبير
5. ألوان SVG تتناسب مع الخلفية البيضاء: stroke="#0c6b58" خطوط، fill="#d1fae5" تعبئة خفيفة
6. stroke="#6366f1" للعناصر الثانوية، fill="#e0e7ff" للتعبئة الثانوية
7. النصوص: fill="#1e293b" font-family="Tajawal" font-weight="700"
8. أنشئ 3-5 رسوم SVG على الأقل توضح المفاهيم الرئيسية
9. كل رسم يجب أن يكون كبيراً وواضحاً ومقروءاً بدون تمرير أفقي

## 🎲 قواعد الاختبار:
1. 8-10 أسئلة اختيار من متعدد (4 خيارات مع حروف أ ب ج د)
2. عرض سؤال واحد فقط في كل مرة
3. عند الإجابة الصحيحة: selected-correct + feedback.correct-fb + انتقال تلقائي بعد 1.5 ثانية
4. عند الإجابة الخاطئة: selected-wrong + feedback.wrong-fb + إظهار الصحيحة بـ show-correct
5. تحديث quiz-progress-fill و quiz-counter مع كل سؤال
6. بعد الانتهاء: result-box مع result-score و btn-retry
7. زر إعادة المحاولة يعيد الاختبار

## ✅ قواعد قائمة الإنجاز:
1. 6-8 مهارات من الدرس
2. كل عنصر: <li><span class="check-box">✓</span>[نص المهارة]</li>
3. عند النقر يتبدل بين done وعادي

## 🚫 ممنوعات:
- لا مكتبات خارجية
- لا صور خارجية — فقط SVG
- لا بيانات وهمية — المحتوى من PDF
- لا تكتب "تم التوليد تلقائياً"
- لا تترك أي قسم فارغاً
- ⚠️ لا تضع الرسوم SVG في grid أو بجانب بعضها — كل رسم في صف مستقل
- ⚠️ لا تستخدم خلفية داكنة أو سوداء — الخلفية بيضاء دائماً

## 🎨 معايير الجودة:
- 2000+ سطر كحد أدنى
- خلفية بيضاء نظيفة مع بطاقات بظلال ناعمة
- كل الرسوم كبيرة وواضحة في صفوف مستقلة
- شريط التقدم يعمل مع التمرير
- الأقسام مرقمة بأرقام خلفية شفافة كبيرة
- الاختبار يعرض سؤال واحد مع شريط تقدم`;
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
