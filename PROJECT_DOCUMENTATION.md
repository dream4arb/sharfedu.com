# 📚 Smart Learn Hub - وثيقة المشروع الكاملة

## 🎯 نظرة عامة على المشروع

**Smart Learn Hub** هو منصة تعليمية إلكترونية شاملة باللغة العربية تهدف إلى تقديم محتوى تعليمي تفاعلي للطلاب في المراحل الدراسية المختلفة (ابتدائي، متوسط، ثانوي). المنصة توفر دروس فيديو، ملفات PDF، أسئلة تفاعلية، وواجهة تعليمية متقدمة.

---

## 🏗️ البنية التقنية

### **Stack التقني:**

#### **Frontend:**
- **React 18.3** - مكتبة JavaScript لبناء واجهات المستخدم
- **TypeScript** - لكتابة كود آمن ومنظم
- **Vite** - أداة بناء سريعة
- **Wouter** - مكتبة توجيه خفيفة الوزن
- **Tailwind CSS** - إطار عمل CSS للتصميم
- **Framer Motion** - مكتبة للحركات والانتقالات
- **Radix UI** - مكونات واجهة مستخدم قابلة للوصول
- **Lucide React** - مكتبة أيقونات
- **React Query (TanStack Query)** - لإدارة حالة الخادم

#### **Backend:**
- **Express.js 5.0** - إطار عمل Node.js
- **TypeScript** - للكود الخلفي
- **SQLite** - قاعدة بيانات خفيفة
- **Drizzle ORM** - ORM لإدارة قاعدة البيانات
- **Passport.js** - للمصادقة
- **Express Session** - لإدارة الجلسات
- **Google Generative AI (Gemini)** - للذكاء الاصطناعي

#### **أدوات التطوير:**
- **ESBuild** - محول JavaScript سريع
- **PostCSS** - معالج CSS
- **Cross-env** - لإدارة متغيرات البيئة

---

## 📁 هيكل المشروع

```
Smart-Learn-Hub/
├── client/                    # واجهة المستخدم الأمامية
│   ├── src/
│   │   ├── components/       # المكونات القابلة لإعادة الاستخدام
│   │   │   ├── home/         # مكونات الصفحة الرئيسية
│   │   │   ├── layout/       # مكونات التخطيط (Navbar, Footer)
│   │   │   └── ui/           # مكونات واجهة المستخدم الأساسية
│   │   ├── pages/            # صفحات التطبيق
│   │   │   ├── Home.tsx      # الصفحة الرئيسية
│   │   │   ├── Lesson.tsx    # صفحة الدرس التفاعلية
│   │   │   ├── Stage.tsx     # صفحة المرحلة الدراسية
│   │   │   ├── Subject.tsx   # صفحة المادة الدراسية
│   │   │   └── Dashboard.tsx # لوحة التحكم
│   │   ├── data/             # البيانات الثابتة
│   │   │   ├── lessons.ts    # بيانات الدروس
│   │   │   └── math-tests-final.ts # بيانات الاختبارات
│   │   ├── hooks/            # React Hooks مخصصة
│   │   │   ├── use-auth.ts   # Hook للمصادقة
│   │   │   └── use-lesson-progress.tsx # Hook لتتبع التقدم
│   │   └── lib/              # مكتبات مساعدة
│   └── public/               # الملفات الثابتة
│       └── tests/           # صور الاختبارات
│
├── server/                    # الخادم الخلفي
│   ├── index.ts             # نقطة دخول الخادم
│   ├── routes.ts            # تعريفات المسارات
│   ├── auth/                # نظام المصادقة
│   ├── db.ts                # إعدادات قاعدة البيانات
│   └── routes/              # مسارات API
│       ├── extract-questions.ts # استخراج الأسئلة من الصور
│       └── pdf-extractor.ts     # استخراج من PDF
│
├── attached_assets/          # الأصول المرفقة
│   ├── html/                # ملفات HTML للدروس
│   │   └── lessons/
│   │       ├── 5-1.html              # صفحة ملخص AI
│   │       └── 5-1-education.html     # صفحة التعليم المختصر
│   ├── lessons/             # ملفات PDF للدروس
│   └── json/                # ملفات JSON للأسئلة
│
├── shared/                   # الكود المشترك
│   ├── models/              # النماذج المشتركة
│   └── schema.ts            # مخططات قاعدة البيانات
│
└── scripts/                  # سكريبتات مساعدة
    ├── analyze-pdf-gemini.ts # تحليل PDF باستخدام Gemini
    └── extract-math-questions.ts # استخراج أسئلة الرياضيات
```

---

## 🚀 الميزات الرئيسية

### 1. **الصفحة الرئيسية (Home Page)**

#### المكونات:
- **Hero Section**: قسم ترحيبي مع صورة خلفية
- **SearchBar**: شريط بحث للبحث في الدروس
- **StageSelector**: اختيار المرحلة الدراسية (ابتدائي، متوسط، ثانوي)
- **Features**: عرض الميزات الرئيسية
- **Stats**: إحصائيات المنصة
- **CTA**: دعوة للعمل
- **WelcomePopup**: نافذة ترحيبية عند أول زيارة

#### المسار: `/`

---

### 2. **صفحة المرحلة الدراسية (Stage Page)**

#### الوظائف:
- عرض جميع المواد الدراسية للمرحلة
- بطاقات تفاعلية لكل مادة مع أيقونات وألوان مميزة
- التنقل إلى صفحة المادة

#### المسار: `/stage/:stageId`
- `stageId` يمكن أن يكون: `primary`, `middle`, `high`

#### المواد المتاحة:
- **الرياضيات** (Calculator icon)
- **العلوم** (FlaskConical icon)
- **اللغة العربية** (Languages icon)
- **اللغة الإنجليزية** (Globe icon)
- **الفيزياء** (Atom icon)
- **الكيمياء** (FlaskConical icon)

---

### 3. **صفحة المادة الدراسية (Subject Page)**

#### الوظائف:
- عرض الفصول الدراسية (Semesters)
- عرض الدروس في كل فصل
- شريط جانبي للتنقل بين الدروس
- تتبع التقدم في الدروس

#### المسار: `/lesson/:stage/:subject/:lessonId?`
- `stage`: المرحلة الدراسية
- `subject`: المادة الدراسية
- `lessonId`: معرف الدرس (اختياري)

---

### 4. **صفحة الدرس التفاعلية (Lesson Page)** ⭐ **الأهم**

#### التبويبات الرئيسية:

##### أ) **تبويب "الدرس" (Lesson Tab)**
- عرض ملف PDF للدرس في iframe
- تتبع تقدم التمرير
- زر تحميل PDF
- وصف الدرس

##### ب) **تبويب "الفيديو" (Video Tab)**
- مشغل فيديو YouTube مدمج
- قائمة فيديوهات إضافية
- تتبع وقت المشاهدة
- إكمال الدرس بعد مشاهدة 2 دقيقة

##### ج) **تبويب "تعليم" (Education Tab)** ⭐
- محتوى HTML تفاعلي مختصر
- شرح مبسط للدرس
- صور من ملف PDF الأصلي
- تصميم احترافي مع:
  - بطاقات معلومات
  - جداول مقارنة
  - صيغ رياضية
  - أمثلة عملية
- يتم تحميل المحتوى من: `/attached_assets/html/lessons/{lessonId}-education.html`

##### د) **تبويب "أسئلة" (Questions Tab)**
- أسئلة تفاعلية متعددة الخيارات
- نظام تصحيح فوري
- عرض النتيجة النهائية
- تحميل الأسئلة من: `/attached_assets/json/lessons/{lessonId}-questions.json`

#### الميزات الإضافية:
- **شريط جانبي (Sidebar)**:
  - قائمة الدروس
  - قسم الاختبارات
  - قسم المرفقات
  - أيقونة العودة للصفحة الرئيسية

- **تتبع التقدم**:
  - حفظ حالة إكمال كل تبويب
  - عرض النسبة المئوية للتقدم
  - إحصائيات مفصلة

- **الرأس (Header)**:
  - عنوان الدرس
  - التبويبات الأربعة
  - مؤشر التقدم
  - زر إكمال الدرس

---

### 5. **نظام المصادقة (Authentication)**

#### الميزات:
- تسجيل الدخول
- تسجيل الخروج
- إدارة الجلسات
- حماية المسارات

#### الملفات:
- `server/auth/` - منطق المصادقة
- `client/src/hooks/use-auth.ts` - Hook للمصادقة
- `client/src/pages/Login.tsx` - صفحة تسجيل الدخول

---

### 6. **لوحة التحكم (Dashboard)**

#### الوظائف:
- عرض إحصائيات المستخدم
- الدروس المكتملة
- التقدم العام
- الرسوم البيانية

---

### 7. **استخراج الأسئلة من الصور (AI-Powered)**

#### الوظائف:
- رفع صورة لاختبار
- استخراج الأسئلة تلقائياً باستخدام Google Gemini AI
- تحويل الصورة إلى JSON
- دعم الأشكال الهندسية

#### المسار: `/admin/pdf-extractor`

---

## 🎨 التصميم والواجهة

### **نظام الألوان:**
- **الأزرق الأساسي**: `#0ea5e9`, `#0284c7`
- **الأخضر للنجاح**: `#10b981`
- **البرتقالي للتنبيهات**: `#f59e0b`
- **الأحمر للأخطاء**: `#ef4444`

### **الخطوط:**
- **Tajawal** - خط عربي احترافي من Google Fonts

### **الحركات:**
- استخدام Framer Motion للانتقالات السلسة
- تأثيرات Hover على البطاقات
- تحميل متدرج للعناصر

---

## 📊 قاعدة البيانات

### **المخططات الرئيسية:**

#### **users** - المستخدمون
```typescript
{
  id: string
  username: string
  password: string (مشفرة)
  createdAt: Date
}
```

#### **lesson_progress** - تقدم الدروس
```typescript
{
  id: string
  userId: string
  lessonId: string
  stage: string
  subject: string
  completedTabs: string[] // ['lesson', 'video', 'education', 'questions']
  progress: number // 0-100
  completedAt: Date
}
```

---

## 🔌 API Endpoints

### **المصادقة:**
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/logout` - تسجيل الخروج
- `GET /api/auth/me` - معلومات المستخدم الحالي

### **الدروس:**
- `GET /api/lessons/:lessonId/progress` - تقدم الدرس
- `POST /api/lessons/:lessonId/progress` - تحديث التقدم
- `GET /api/lessons/:lessonId/complete` - إكمال الدرس

### **الذكاء الاصطناعي:**
- `POST /api/chat` - محادثة مع AI (Gemini)
- `POST /api/extract-questions` - استخراج أسئلة من صورة

---

## 📝 ملفات البيانات

### **1. بيانات الدروس (`client/src/data/lessons.ts`)**

هيكل البيانات:
```typescript
interface LessonData {
  id: string                    // معرف فريد: "5-1"
  title: string                 // "زوايا المضلع"
  duration: string              // "25 دقيقة"
  videoUrl: string              // رابط YouTube
  pdfUrl?: string               // "/attached_assets/lessons/lesson_4-1.pdf"
  htmlUrl?: string              // "/attached_assets/html/lessons/5-1.html"
  questionsUrl?: string         // "/attached_assets/json/lessons/5-1-questions.json"
  additionalVideos?: Array<{    // فيديوهات إضافية
    url: string
    title?: string
  }>
}
```

### **2. بيانات الأسئلة (`attached_assets/json/lessons/5-1-questions.json`)**

```json
{
  "lessonId": "5-1",
  "title": "زوايا المضلع",
  "questions": [
    {
      "id": 1,
      "questionText": "السؤال...",
      "hasGeometricShape": false,
      "options": {
        "a": "الخيار أ",
        "b": "الخيار ب",
        "c": "الخيار ج",
        "d": "الخيار د"
      },
      "correctAnswer": "c",
      "explanation": "الشرح..."
    }
  ]
}
```

---

## 🛠️ إعداد المشروع على Replit

### **الخطوة 1: إنشاء مشروع جديد**
1. اذهب إلى Replit
2. اختر "Create Repl"
3. اختر "Node.js" أو "TypeScript"
4. اسم المشروع: `smart-learn-hub`

### **الخطوة 2: تثبيت التبعيات**

```bash
npm install
```

### **الخطوة 3: إعداد متغيرات البيئة**

أنشئ ملف `.env`:
```env
NODE_ENV=development
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
SESSION_SECRET=your_secret_key_here
```

### **الخطوة 4: إعداد قاعدة البيانات**

```bash
npm run db:push
```

### **الخطوة 5: تشغيل المشروع**

```bash
npm run dev
```

---

## 📦 الملفات المهمة للبدء

### **1. نقطة الدخول الرئيسية:**
- `server/index.ts` - خادم Express
- `client/src/main.tsx` - نقطة دخول React
- `client/src/App.tsx` - مكون التطبيق الرئيسي

### **2. ملفات التكوين:**
- `vite.config.ts` - إعدادات Vite
- `tailwind.config.ts` - إعدادات Tailwind
- `tsconfig.json` - إعدادات TypeScript
- `package.json` - التبعيات والأوامر

### **3. ملفات البيانات:**
- `client/src/data/lessons.ts` - جميع بيانات الدروس
- `attached_assets/json/lessons/*.json` - ملفات الأسئلة
- `attached_assets/html/lessons/*.html` - صفحات التعليم

---

## 🎯 المهام المطلوبة للبرمجة

### **المرحلة 1: الإعداد الأساسي**

1. **إنشاء بنية المشروع:**
   ```
   - إنشاء مجلدات client/, server/, attached_assets/
   - إعداد package.json الرئيسي
   - إعداد vite.config.ts
   - إعداد tsconfig.json
   ```

2. **تثبيت التبعيات:**
   ```bash
   npm install react react-dom
   npm install express
   npm install typescript
   npm install vite @vitejs/plugin-react
   npm install tailwindcss
   npm install wouter
   npm install framer-motion
   npm install @radix-ui/react-*
   npm install lucide-react
   npm install @tanstack/react-query
   npm install @google/generative-ai
   npm install drizzle-orm drizzle-kit
   npm install sqlite3
   npm install passport passport-local
   npm install express-session
   ```

### **المرحلة 2: إعداد الخادم**

1. **إنشاء `server/index.ts`:**
   - إعداد Express
   - إعداد CORS
   - إعداد JSON parser
   - تسجيل المسارات
   - بدء الخادم على المنفذ 5000

2. **إنشاء `server/routes.ts`:**
   - مسارات API للمصادقة
   - مسارات API للدروس
   - مسارات API للذكاء الاصطناعي
   - مسار استخراج الأسئلة

3. **إنشاء `server/db.ts`:**
   - إعداد Drizzle ORM
   - تعريف الجداول (users, lesson_progress)
   - الاتصال بقاعدة البيانات SQLite

### **المرحلة 3: واجهة المستخدم**

1. **إعداد React:**
   - إنشاء `client/src/main.tsx`
   - إنشاء `client/src/App.tsx`
   - إعداد Router مع Wouter
   - إعداد QueryClient

2. **الصفحة الرئيسية (`client/src/pages/Home.tsx`):**
   - مكون Hero
   - مكون SearchBar
   - مكون StageSelector
   - مكون Features
   - مكون Stats
   - مكون CTA
   - مكون Footer

3. **صفحة الدرس (`client/src/pages/Lesson.tsx`):**
   - **التبويبات الأربعة:**
     - تبويب الدرس (PDF viewer)
     - تبويب الفيديو (YouTube player)
     - تبويب التعليم (HTML content loader)
     - تبويب الأسئلة (Interactive quiz)
   
   - **الشريط الجانبي:**
     - قائمة الدروس
     - قسم الاختبارات
     - قسم المرفقات
   
   - **تتبع التقدم:**
     - حفظ حالة كل تبويب
     - حساب النسبة المئوية
     - عرض الإحصائيات

### **المرحلة 4: البيانات**

1. **إنشاء `client/src/data/lessons.ts`:**
   - تعريف واجهات TypeScript
   - بيانات جميع الدروس
   - بيانات المواد الدراسية
   - بيانات المراحل الدراسية

2. **إنشاء ملفات JSON للأسئلة:**
   - `attached_assets/json/lessons/5-1-questions.json`
   - تنسيق موحد للأسئلة

3. **إنشاء ملفات HTML للتعليم:**
   - `attached_assets/html/lessons/5-1-education.html`
   - تصميم احترافي مع CSS
   - استخدام صور من PDF

### **المرحلة 5: الميزات المتقدمة**

1. **نظام المصادقة:**
   - صفحة تسجيل الدخول
   - Hook للمصادقة
   - حماية المسارات

2. **تتبع التقدم:**
   - Hook لتتبع التقدم
   - حفظ في قاعدة البيانات
   - عرض الإحصائيات

3. **الذكاء الاصطناعي:**
   - تكامل Google Gemini
   - API endpoint للمحادثة
   - استخراج الأسئلة من الصور

---

## 📋 قائمة التحقق (Checklist)

### ✅ **البنية الأساسية:**
- [ ] إعداد المشروع على Replit
- [ ] تثبيت جميع التبعيات
- [ ] إعداد ملفات التكوين
- [ ] إعداد قاعدة البيانات

### ✅ **الخادم:**
- [ ] إنشاء Express server
- [ ] إعداد المسارات
- [ ] إعداد المصادقة
- [ ] إعداد API endpoints

### ✅ **واجهة المستخدم:**
- [ ] الصفحة الرئيسية
- [ ] صفحة المرحلة الدراسية
- [ ] صفحة المادة الدراسية
- [ ] صفحة الدرس (مع جميع التبويبات)
- [ ] صفحة تسجيل الدخول
- [ ] لوحة التحكم

### ✅ **البيانات:**
- [ ] بيانات الدروس
- [ ] ملفات JSON للأسئلة
- [ ] ملفات HTML للتعليم
- [ ] ملفات PDF للدروس

### ✅ **الميزات:**
- [ ] نظام المصادقة
- [ ] تتبع التقدم
- [ ] مشغل الفيديو
- [ ] عارض PDF
- [ ] نظام الأسئلة التفاعلي
- [ ] تكامل الذكاء الاصطناعي

---

## 🎨 أمثلة الكود المهمة

### **1. صفحة الدرس - تحميل محتوى التعليم:**

```typescript
const [educationContent, setEducationContent] = useState<string>("");
const [loadingEducation, setLoadingEducation] = useState(false);

useEffect(() => {
  if (activeTab === "education" && currentLesson.id) {
    setLoadingEducation(true);
    fetch(`/attached_assets/html/lessons/${currentLesson.id}-education.html`)
      .then(res => res.text())
      .then(html => {
        // استخراج محتوى body و style من HTML الكامل
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyContent = doc.body.innerHTML;
        const styleContent = doc.head.querySelector('style')?.innerHTML || '';
        setEducationContent(`<style>${styleContent}</style>${bodyContent}`);
      })
      .finally(() => setLoadingEducation(false));
  }
}, [activeTab, currentLesson.id]);
```

### **2. عرض محتوى التعليم:**

```tsx
{activeTab === "education" && (
  <div dangerouslySetInnerHTML={{ __html: educationContent }} />
)}
```

### **3. تحميل الأسئلة:**

```typescript
useEffect(() => {
  if (activeTab === "questions" && currentLesson.questionsUrl) {
    setLoadingQuestions(true);
    fetch(currentLesson.questionsUrl)
      .then(res => res.json())
      .then(data => setLessonQuestions(data.questions))
      .finally(() => setLoadingQuestions(false));
  }
}, [activeTab, currentLesson.questionsUrl]);
```

---

## 🔑 النقاط المهمة

1. **استخدام `dangerouslySetInnerHTML`** لعرض محتوى HTML الديناميكي
2. **استخدام iframe** لعرض ملفات PDF
3. **استخدام YouTube embed** لمشغل الفيديو
4. **تتبع حالة التبويبات** باستخدام React state
5. **حفظ التقدم** في قاعدة البيانات
6. **استخدام React Query** لإدارة حالة الخادم
7. **استخدام Framer Motion** للحركات السلسة

---

## 📞 الدعم والمساعدة

إذا واجهت أي مشاكل:
1. تحقق من ملفات التكوين
2. تأكد من تثبيت جميع التبعيات
3. تحقق من متغيرات البيئة
4. راجع ملفات السجلات (logs)

---

## 🎉 الخلاصة

هذا المشروع هو منصة تعليمية شاملة تجمع بين:
- **المحتوى التعليمي** (فيديوهات، PDF، شرح مختصر)
- **التفاعل** (أسئلة، تتبع التقدم)
- **الذكاء الاصطناعي** (مساعدة ذكية)
- **تجربة مستخدم ممتازة** (تصميم احترافي، حركات سلسة)

**نتمنى لك التوفيق في البرمجة! 🚀**
