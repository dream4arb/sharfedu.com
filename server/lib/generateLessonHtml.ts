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

### لوحة الألوان:
- خلفية رئيسية: تدرج دقيق بين #0f0f23 (أزرق غامق جداً) و #1a1a3e
- لون مميز أساسي: #00d4aa (أخضر فيروزي متوهج)
- لون مميز ثانوي: #7b68ee (بنفسجي ناعم)
- لون تأكيد: #ff6b6b (أحمر مرجاني)
- لون نجاح: #00e676 (أخضر ساطع)
- لون تحذير: #ffd93d (أصفر ذهبي)
- النصوص: #e8e8ff (أبيض مائل للبنفسجي)
- النصوص الثانوية: #8888bb
- خلفية البطاقات: rgba(255,255,255,0.04) مع backdrop-filter: blur(20px) و border: 1px solid rgba(255,255,255,0.08)

### مؤثرات بصرية مطلوبة:
1. **Glassmorphism**: كل البطاقات بخلفية شفافة مع blur و border شفاف
2. **Glow effects**: ظلال متوهجة بألوان النيون على العناصر المهمة (box-shadow: 0 0 30px rgba(0,212,170,0.15))
3. **خطوط نيون**: حدود متوهجة على البطاقات عند التمرير (hover)
4. **تدرجات متحركة**: خلفية الـ hero بتدرج متحرك (animation: gradient-shift)
5. **أشكال هندسية عائمة**: دوائر وأشكال بخلفية شفافة تتحرك ببطء
6. **شريط تقدم عائم**: شريط progress ثابت أعلى الصفحة يتتبع التمرير
7. **أرقام الأقسام**: كل قسم له رقم كبير شفاف (opacity:0.03) بحجم 200px في الخلفية

### بنية الـ CSS (اكتبها كاملة في <style>):
\`\`\`
:root {
  --bg-primary: #0f0f23;
  --bg-secondary: #1a1a3e;
  --bg-card: rgba(255,255,255,0.04);
  --accent: #00d4aa;
  --accent-purple: #7b68ee;
  --accent-coral: #ff6b6b;
  --accent-success: #00e676;
  --accent-warning: #ffd93d;
  --text-primary: #e8e8ff;
  --text-secondary: #8888bb;
  --glass-border: rgba(255,255,255,0.08);
  --glass-blur: blur(20px);
  --glow-accent: 0 0 30px rgba(0,212,170,0.15);
  --glow-purple: 0 0 30px rgba(123,104,238,0.15);
  --radius: 24px;
  --radius-sm: 16px;
  --radius-xs: 12px;
}
* { margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior:smooth; }
body {
  font-family:'Tajawal',sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height:1.9;
  min-height:100vh;
  overflow-x:hidden;
}

/* شريط التقدم العائم */
#progress-bar {
  position:fixed; top:0; right:0; height:3px; z-index:1000;
  background: linear-gradient(90deg, var(--accent), var(--accent-purple), var(--accent-coral));
  width:0%; transition: width 0.1s;
  box-shadow: 0 0 15px var(--accent);
}

/* خلفية الكواكب المتحركة */
.stars-bg {
  position:fixed; top:0; left:0; width:100%; height:100%; z-index:0; pointer-events:none;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.15), transparent),
    radial-gradient(2px 2px at 40% 70%, rgba(255,255,255,0.1), transparent),
    radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.12), transparent),
    radial-gradient(2px 2px at 80% 50%, rgba(255,255,255,0.08), transparent),
    radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.1), transparent),
    radial-gradient(1px 1px at 70% 90%, rgba(255,255,255,0.07), transparent),
    radial-gradient(2px 2px at 50% 10%, rgba(255,255,255,0.12), transparent);
}

.page-wrapper { position:relative; z-index:1; }
.container { max-width:1100px; margin:0 auto; padding:0 20px; }

/* ========== HERO ========== */
.hero-section {
  min-height:420px; display:flex; align-items:center; justify-content:center;
  position:relative; overflow:hidden; padding:60px 20px 50px;
  background: linear-gradient(135deg, #0f0f23, #1a1a3e, #0d1b3e, #0f0f23);
  background-size: 400% 400%;
  animation: gradient-shift 15s ease infinite;
}
@keyframes gradient-shift {
  0%,100% { background-position:0% 50%; }
  25% { background-position:100% 0%; }
  50% { background-position:100% 100%; }
  75% { background-position:0% 100%; }
}
.hero-orb {
  position:absolute; border-radius:50%; filter:blur(80px); opacity:0.4; pointer-events:none;
  animation: orb-float 20s ease-in-out infinite;
}
.hero-orb-1 { width:400px; height:400px; background:var(--accent); top:-200px; right:-100px; }
.hero-orb-2 { width:350px; height:350px; background:var(--accent-purple); bottom:-150px; left:-100px; animation-delay:7s; }
.hero-orb-3 { width:200px; height:200px; background:var(--accent-coral); top:50%; left:50%; animation-delay:12s; }
@keyframes orb-float {
  0%,100% { transform:translate(0,0) scale(1); }
  33% { transform:translate(40px,-40px) scale(1.1); }
  66% { transform:translate(-30px,30px) scale(0.9); }
}
.hero-content { position:relative; z-index:2; text-align:center; max-width:800px; }
.hero-badge {
  display:inline-flex; align-items:center; gap:8px;
  background: rgba(0,212,170,0.1); border:1px solid rgba(0,212,170,0.3);
  padding:8px 24px; border-radius:50px; font-size:14px; font-weight:700;
  color:var(--accent); margin-bottom:24px;
  backdrop-filter: blur(10px);
}
.hero-badge::before { content:''; width:8px; height:8px; border-radius:50%; background:var(--accent); animation:pulse-dot 2s infinite; }
@keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(1.5);} }
.hero-title {
  font-size:clamp(32px,6vw,56px); font-weight:900;
  background: linear-gradient(135deg, #ffffff, var(--accent), var(--accent-purple));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  background-clip:text; line-height:1.3; margin-bottom:16px;
}
.hero-subtitle { font-size:18px; color:var(--text-secondary); font-weight:500; max-width:600px; margin:0 auto 30px; line-height:1.8; }
.hero-stats {
  display:flex; justify-content:center; gap:12px; flex-wrap:wrap;
}
.hero-stat-chip {
  background:var(--bg-card); backdrop-filter:var(--glass-blur);
  border:1px solid var(--glass-border); border-radius:var(--radius-sm);
  padding:12px 20px; text-align:center; min-width:100px;
}
.hero-stat-chip .val { font-size:22px; font-weight:900; color:var(--accent); display:block; }
.hero-stat-chip .lbl { font-size:12px; color:var(--text-secondary); }
.platform-badge {
  margin-top:28px; display:inline-block;
  background: linear-gradient(135deg, rgba(0,212,170,0.15), rgba(123,104,238,0.15));
  border:1px solid rgba(0,212,170,0.3); padding:12px 36px; border-radius:50px;
  font-size:15px; font-weight:800; color:white;
  box-shadow: var(--glow-accent);
}

/* ========== الأقسام ========== */
.lesson-section {
  margin:32px 0; position:relative;
}
.section-card {
  background:var(--bg-card); backdrop-filter:var(--glass-blur);
  border:1px solid var(--glass-border); border-radius:var(--radius);
  padding:36px 28px; position:relative; overflow:hidden;
  transition: border-color 0.4s, box-shadow 0.4s;
}
.section-card:hover {
  border-color: rgba(0,212,170,0.2);
  box-shadow: var(--glow-accent);
}
.section-card::before {
  content:attr(data-section-num); position:absolute; top:-20px; left:20px;
  font-size:180px; font-weight:900; color:rgba(255,255,255,0.02);
  line-height:1; pointer-events:none; z-index:0;
}
.section-card > * { position:relative; z-index:1; }

.section-header {
  display:flex; align-items:center; gap:14px; margin-bottom:28px;
}
.section-icon {
  width:52px; height:52px; border-radius:var(--radius-xs);
  display:flex; align-items:center; justify-content:center;
  font-size:24px; flex-shrink:0;
}
.section-icon.teal { background:linear-gradient(135deg,rgba(0,212,170,0.2),rgba(0,212,170,0.05)); box-shadow:inset 0 0 20px rgba(0,212,170,0.1); }
.section-icon.purple { background:linear-gradient(135deg,rgba(123,104,238,0.2),rgba(123,104,238,0.05)); box-shadow:inset 0 0 20px rgba(123,104,238,0.1); }
.section-icon.coral { background:linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,107,107,0.05)); box-shadow:inset 0 0 20px rgba(255,107,107,0.1); }
.section-icon.gold { background:linear-gradient(135deg,rgba(255,217,61,0.2),rgba(255,217,61,0.05)); box-shadow:inset 0 0 20px rgba(255,217,61,0.1); }
.section-icon.green { background:linear-gradient(135deg,rgba(0,230,118,0.2),rgba(0,230,118,0.05)); box-shadow:inset 0 0 20px rgba(0,230,118,0.1); }

.section-title {
  font-size:clamp(22px,4vw,30px); font-weight:800;
  background: linear-gradient(135deg, var(--text-primary), var(--accent));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}

/* بطاقة المعلومة المضيئة */
.info-glow {
  background: linear-gradient(135deg, rgba(0,212,170,0.08), rgba(123,104,238,0.05));
  border:1px solid rgba(0,212,170,0.15); border-radius:var(--radius-sm);
  padding:20px 24px; margin-bottom:20px; font-size:16px; line-height:2;
  color:var(--text-primary); font-weight:500;
  border-right:4px solid var(--accent);
}

/* بطاقات المصطلحات */
.term-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:16px; }
.term-card {
  background: rgba(255,255,255,0.03); border:1px solid var(--glass-border);
  border-radius:var(--radius-sm); padding:20px; transition:all 0.3s;
  position:relative; overflow:hidden;
}
.term-card:hover { border-color:rgba(0,212,170,0.3); transform:translateY(-2px); box-shadow:var(--glow-accent); }
.term-card.primary { border-right:3px solid var(--accent); }
.term-card.secondary { border-right:3px solid var(--accent-purple); }
.term-name { font-weight:800; font-size:17px; margin-bottom:8px; }
.term-card.primary .term-name { color:var(--accent); }
.term-card.secondary .term-name { color:var(--accent-purple); }
.term-def { color:var(--text-secondary); font-size:15px; line-height:1.8; }

/* بطاقات القواعد */
.rule-card {
  background: linear-gradient(135deg, rgba(123,104,238,0.1), rgba(0,212,170,0.05));
  border:1px solid rgba(123,104,238,0.2); border-radius:var(--radius-sm);
  padding:24px; text-align:center; margin-bottom:16px;
  transition:all 0.3s;
}
.rule-card:hover { box-shadow:var(--glow-purple); border-color:rgba(123,104,238,0.4); }
.rule-formula {
  font-size:28px; font-weight:900; margin:16px 0;
  background: linear-gradient(135deg, var(--accent), var(--accent-purple));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  direction:ltr; display:inline-block;
}
.rule-desc { color:var(--text-secondary); font-weight:500; }

/* خطوات الحل */
.steps-timeline { position:relative; padding-right:40px; }
.steps-timeline::before {
  content:''; position:absolute; right:18px; top:0; bottom:0; width:2px;
  background: linear-gradient(to bottom, var(--accent), var(--accent-purple), transparent);
}
.step-item { display:flex; gap:20px; margin-bottom:24px; align-items:flex-start; position:relative; }
.step-marker {
  min-width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center;
  font-weight:900; font-size:16px; color:white; flex-shrink:0; position:relative; z-index:2;
  background: linear-gradient(135deg, var(--accent), var(--accent-purple));
  box-shadow: 0 0 20px rgba(0,212,170,0.3);
}
.step-body {
  flex:1; background:rgba(255,255,255,0.03); border:1px solid var(--glass-border);
  border-radius:var(--radius-xs); padding:18px 20px;
  transition: border-color 0.3s;
}
.step-body:hover { border-color:rgba(0,212,170,0.2); }
.step-body strong { color:var(--accent); display:block; margin-bottom:6px; }

/* الرسوم التوضيحية */
.visual-gallery { display:grid; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap:20px; }
.visual-card {
  background:rgba(255,255,255,0.03); border:1px solid var(--glass-border);
  border-radius:var(--radius-sm); padding:24px; text-align:center;
  transition:all 0.3s;
}
.visual-card:hover { border-color:rgba(123,104,238,0.3); box-shadow:var(--glow-purple); }
.visual-card svg { overflow:visible; max-width:100%; height:auto; }
.visual-title { font-size:15px; font-weight:700; color:var(--accent-purple); margin-top:14px; }
.svg-scroll { overflow-x:auto; max-width:100%; padding:10px 0; }

/* الأمثلة المحلولة */
.example-card {
  background: linear-gradient(135deg, rgba(123,104,238,0.08), rgba(255,107,107,0.04));
  border:1px solid rgba(123,104,238,0.15); border-radius:var(--radius-sm);
  padding:28px; margin-bottom:20px;
}
.example-title { color:var(--accent-purple); font-weight:800; font-size:18px; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
.solution-step {
  padding:14px 18px; margin:10px 0; border-radius:var(--radius-xs);
  background:rgba(255,255,255,0.03); border-right:3px solid var(--accent-purple);
  color:var(--text-primary); font-size:15px; line-height:1.9;
}
.solution-step .step-label { color:var(--accent); font-weight:800; margin-bottom:4px; display:block; font-size:13px; }
.solution-result {
  background:linear-gradient(135deg,rgba(0,230,118,0.1),rgba(0,212,170,0.05));
  border:1px solid rgba(0,230,118,0.2); border-radius:var(--radius-xs);
  padding:16px; text-align:center; margin-top:14px;
  font-weight:800; font-size:18px; color:var(--accent-success);
}

/* المرجع السريع */
.ref-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:14px; }
.ref-item {
  background: linear-gradient(135deg, rgba(0,212,170,0.08), rgba(0,212,170,0.02));
  border:1px solid rgba(0,212,170,0.15); border-radius:var(--radius-xs);
  padding:18px; text-align:center; transition:all 0.3s;
}
.ref-item:hover { border-color:rgba(0,212,170,0.4); box-shadow:var(--glow-accent); }
.ref-label { font-weight:800; color:var(--accent); margin-bottom:8px; font-size:14px; }
.ref-formula { font-size:20px; font-weight:900; color:var(--text-primary); direction:ltr; }

/* ========== الاختبار التفاعلي ========== */
.quiz-wrapper {
  background: linear-gradient(135deg, rgba(123,104,238,0.06), rgba(255,107,107,0.04));
  border:1px solid rgba(123,104,238,0.15); border-radius:var(--radius);
  padding:0; overflow:hidden;
}
.quiz-header {
  background: linear-gradient(135deg, rgba(123,104,238,0.15), rgba(0,212,170,0.08));
  padding:20px 28px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;
  border-bottom:1px solid var(--glass-border);
}
.quiz-progress-bar { flex:1; min-width:200px; height:6px; background:rgba(255,255,255,0.08); border-radius:10px; overflow:hidden; }
.quiz-progress-fill { height:100%; background:linear-gradient(90deg,var(--accent),var(--accent-purple)); border-radius:10px; transition:width 0.5s; width:0%; }
.quiz-counter { font-weight:800; color:var(--accent); font-size:14px; white-space:nowrap; }
.quiz-body { padding:28px; }

.q-card {
  background:rgba(255,255,255,0.03); border:1px solid var(--glass-border);
  border-radius:var(--radius-sm); padding:28px; margin-bottom:16px;
  transition: all 0.4s;
}
.q-card.correct { border-color:var(--accent-success); box-shadow:0 0 25px rgba(0,230,118,0.15); background:rgba(0,230,118,0.05); }
.q-card.wrong { border-color:var(--accent-coral); box-shadow:0 0 25px rgba(255,107,107,0.15); background:rgba(255,107,107,0.05); }
.q-num {
  display:inline-flex; align-items:center; justify-content:center;
  width:38px; height:38px; border-radius:var(--radius-xs);
  background:linear-gradient(135deg, var(--accent), var(--accent-purple));
  color:white; font-weight:900; font-size:16px; margin-left:12px;
  box-shadow: 0 0 15px rgba(0,212,170,0.2);
}
.q-text { font-size:18px; font-weight:700; margin-bottom:20px; color:var(--text-primary); display:flex; align-items:center; }
.opts { display:grid; gap:12px; }
.opt-btn {
  display:flex; align-items:center; gap:12px; width:100%;
  padding:16px 20px; border:1px solid var(--glass-border);
  border-radius:var(--radius-xs); background:rgba(255,255,255,0.02);
  cursor:pointer; font-family:'Tajawal',sans-serif; font-size:15px;
  font-weight:600; text-align:right; color:var(--text-primary);
  transition:all 0.3s; position:relative; overflow:hidden;
}
.opt-btn::before {
  content:''; position:absolute; top:0; right:0; width:0; height:100%;
  background:linear-gradient(90deg, transparent, rgba(0,212,170,0.05));
  transition:width 0.3s;
}
.opt-btn:hover { border-color:rgba(0,212,170,0.3); }
.opt-btn:hover::before { width:100%; }
.opt-letter {
  min-width:32px; height:32px; border-radius:10px; display:flex; align-items:center;
  justify-content:center; font-weight:800; font-size:14px; flex-shrink:0;
  background:rgba(255,255,255,0.06); color:var(--text-secondary);
  border:1px solid var(--glass-border);
}
.opt-btn.selected-correct { background:rgba(0,230,118,0.1); border-color:var(--accent-success); }
.opt-btn.selected-correct .opt-letter { background:var(--accent-success); color:#0f0f23; border-color:var(--accent-success); }
.opt-btn.selected-wrong { background:rgba(255,107,107,0.1); border-color:var(--accent-coral); }
.opt-btn.selected-wrong .opt-letter { background:var(--accent-coral); color:white; border-color:var(--accent-coral); }
.opt-btn.show-correct { background:rgba(0,230,118,0.08); border-color:var(--accent-success); }
.opt-btn.show-correct .opt-letter { background:var(--accent-success); color:#0f0f23; border-color:var(--accent-success); }
.opt-btn:disabled { cursor:default; }
.feedback { margin-top:14px; padding:12px 16px; border-radius:var(--radius-xs); font-weight:700; font-size:14px; }
.feedback.correct-fb { background:rgba(0,230,118,0.1); color:var(--accent-success); border:1px solid rgba(0,230,118,0.2); }
.feedback.wrong-fb { background:rgba(255,107,107,0.1); color:var(--accent-coral); border:1px solid rgba(255,107,107,0.2); }

.result-box {
  background: linear-gradient(135deg, rgba(0,212,170,0.15), rgba(123,104,238,0.15));
  border:1px solid rgba(0,212,170,0.3); border-radius:var(--radius);
  padding:48px 32px; text-align:center; margin-top:28px;
  box-shadow: 0 0 60px rgba(0,212,170,0.1);
}
.result-score {
  font-size:72px; font-weight:900;
  background:linear-gradient(135deg,var(--accent),var(--accent-purple));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
}
.result-msg { font-size:24px; font-weight:800; margin:16px 0; color:var(--text-primary); }
.result-detail { color:var(--text-secondary); font-size:16px; margin-bottom:24px; }
.result-btns { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
.btn-retry {
  padding:14px 40px; border-radius:50px; border:none; font-family:'Tajawal',sans-serif;
  font-size:16px; font-weight:800; cursor:pointer; transition:all 0.3s;
  background:linear-gradient(135deg,var(--accent),var(--accent-purple));
  color:white; box-shadow:0 0 25px rgba(0,212,170,0.3);
}
.btn-retry:hover { transform:scale(1.05); box-shadow:0 0 40px rgba(0,212,170,0.4); }
.btn-share {
  padding:14px 40px; border-radius:50px; font-family:'Tajawal',sans-serif;
  font-size:16px; font-weight:800; cursor:pointer; transition:all 0.3s;
  background:transparent; color:var(--text-primary);
  border:1px solid var(--glass-border);
}
.btn-share:hover { border-color:rgba(0,212,170,0.3); }

/* ========== قائمة الإنجاز ========== */
.checklist { list-style:none; }
.checklist li {
  padding:14px 18px; margin-bottom:10px; border-radius:var(--radius-xs);
  background:rgba(255,255,255,0.03); border:1px solid var(--glass-border);
  display:flex; align-items:center; gap:14px; font-weight:600;
  cursor:pointer; transition:all 0.3s; font-size:15px;
}
.checklist li:hover { border-color:rgba(0,212,170,0.2); }
.checklist li.done { background:rgba(0,230,118,0.06); border-color:rgba(0,230,118,0.2); color:var(--text-secondary); text-decoration:line-through; }
.check-box {
  width:26px; height:26px; border-radius:8px; border:2px solid rgba(255,255,255,0.15);
  display:flex; align-items:center; justify-content:center; font-size:14px;
  flex-shrink:0; transition:all 0.3s; color:transparent;
}
.checklist li.done .check-box { background:var(--accent-success); border-color:var(--accent-success); color:white; }

/* ========== Footer ========== */
.page-footer {
  text-align:center; padding:40px 20px; margin-top:48px;
  border-top:1px solid var(--glass-border);
  color:var(--text-secondary); font-size:14px;
}
.page-footer strong { color:var(--accent); }

/* ========== متجاوب ========== */
@media(max-width:768px) {
  .hero-section { padding:40px 16px 30px; min-height:320px; }
  .hero-title { font-size:28px; }
  .section-card { padding:24px 18px; }
  .term-grid, .visual-gallery, .ref-grid { grid-template-columns:1fr; }
  .steps-timeline { padding-right:30px; }
  .steps-timeline::before { right:13px; }
  .step-marker { min-width:30px; height:30px; font-size:13px; }
  .quiz-body { padding:18px; }
  .q-card { padding:20px; }
  .result-score { font-size:48px; }
  .hero-stats { gap:8px; }
  .hero-stat-chip { padding:8px 14px; min-width:80px; }
  .hero-stat-chip .val { font-size:18px; }
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
  <div class="stars-bg"></div>
  <div class="page-wrapper">

    <!-- Hero -->
    <section class="hero-section">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
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
          <div class="info-glow">[شرح أهمية الدرس]</div>
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
          <div class="visual-gallery">
            [بطاقات visual-card مع SVG دقيقة]
          </div>
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
        <div class="section-card" data-section-num="08" style="padding:0;background:transparent;border:none;backdrop-filter:none;">
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

## 📐 قواعد رسوم SVG:
1. أنشئ 3+ رسوم SVG دقيقة رياضياً تشرح المفاهيم
2. كل رسم في <div class="visual-card"><div class="svg-scroll"><svg>...</svg></div><div class="visual-title">...</div></div>
3. استخدم ألوان النيون: stroke="#00d4aa" و fill="rgba(0,212,170,0.1)" للأشكال الأساسية
4. stroke="#7b68ee" للعناصر الثانوية
5. النصوص في SVG: fill="#e8e8ff" font-family="Tajawal"
6. خلفية SVG: شفافة (لتتناسب مع الخلفية الداكنة)
7. viewBox مناسب، وارتفاع/عرض مناسب (400-600px عرض)

## 🎲 قواعد الاختبار:
1. 8-10 أسئلة اختيار من متعدد (4 خيارات مع حروف أ ب ج د)
2. عرض سؤال واحد فقط في كل مرة (ليس كل الأسئلة معاً)
3. عند الإجابة الصحيحة: selected-correct + feedback.correct-fb + انتقال تلقائي للسؤال التالي بعد 1.5 ثانية
4. عند الإجابة الخاطئة: selected-wrong + feedback.wrong-fb + إظهار الصحيحة بـ show-correct
5. تحديث quiz-progress-fill و quiz-counter مع كل سؤال
6. بعد الانتهاء: result-box مع result-score و result-msg و btn-retry
7. زر إعادة المحاولة يعيد الاختبار كاملاً
8. أضف تأثير انتقال fade عند تغيير الأسئلة

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
- لا تستخدم ألوان فاتحة أو خلفية بيضاء — التصميم داكن بالكامل

## 🎨 معايير الجودة:
- 2000+ سطر كحد أدنى
- تصميم داكن أنيق مع مؤثرات النيون والزجاج
- كل العناصر تتفاعل عند التمرير (hover effects)
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
