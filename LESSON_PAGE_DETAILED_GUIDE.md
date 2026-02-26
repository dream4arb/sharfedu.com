# 📖 دليل تفصيلي: صفحة الدرس (Lesson Page)

## 🎯 نظرة عامة

صفحة الدرس هي **القلب النابض** للمنصة التعليمية. تحتوي على 4 تبويبات رئيسية تقدم تجربة تعليمية شاملة.

---

## 📋 البنية الأساسية

### **المسار:**
```
/lesson/:stage/:subject/:lessonId?
```

### **المعاملات:**
- `stage`: المرحلة الدراسية (`primary`, `middle`, `high`)
- `subject`: المادة الدراسية (`math`, `science`, `arabic`, etc.)
- `lessonId`: معرف الدرس (اختياري، مثال: `5-1`)

---

## 🎨 المكونات الرئيسية

### **1. الرأس (Header)**

```tsx
<header className="bg-white dark:bg-card backdrop-blur-lg shadow-sm">
  <h1>{currentLesson.title}</h1>
  
  {/* التبويبات الأربعة */}
  <div className="tabs">
    <Tab id="lesson" icon={BookOpenCheck} />
    <Tab id="video" icon={Video} />
    <Tab id="education" icon={GraduationCap} />
    <Tab id="questions" icon={HelpCircle} />
  </div>
  
  {/* مؤشر التقدم */}
  <ProgressBar value={progressPercentage} />
</header>
```

**الميزات:**
- عنوان الدرس
- التبويبات الأربعة مع أيقونات
- مؤشر التقدم (0-100%)
- زر إكمال الدرس

---

### **2. الشريط الجانبي (Sidebar)**

```tsx
<Sidebar>
  {/* قائمة الدروس */}
  <SidebarGroup>
    <SidebarGroupLabel>الدروس</SidebarGroupLabel>
    {lessons.map(lesson => (
      <SidebarMenuItem
        key={lesson.id}
        active={lesson.id === currentLesson.id}
      >
        {lesson.title}
      </SidebarMenuItem>
    ))}
  </SidebarGroup>
  
  {/* قسم الاختبارات */}
  <SidebarGroup>
    <SidebarGroupLabel>الاختبارات</SidebarGroupLabel>
    {/* قائمة الاختبارات */}
  </SidebarGroup>
  
  {/* قسم المرفقات */}
  <SidebarGroup>
    <SidebarGroupLabel>المرفقات</SidebarGroupLabel>
    {/* قائمة المرفقات */}
  </SidebarGroup>
  
  {/* زر العودة للصفحة الرئيسية */}
  <Link href="/">
    <HomeIcon />
  </Link>
</Sidebar>
```

**الميزات:**
- قائمة بجميع الدروس في المادة
- تمييز الدرس الحالي
- قسم الاختبارات (Collapsible)
- قسم المرفقات (Collapsible)
- زر العودة للصفحة الرئيسية

---

## 📑 التبويبات الأربعة

### **🔵 التبويب 1: الدرس (Lesson Tab)**

#### **الوظيفة:**
عرض ملف PDF للدرس في iframe

#### **الكود:**

```tsx
{activeTab === "lesson" && (
  <div className="pdf-container">
    <div className="pdf-header">
      <BookOpenCheckIcon />
      <h2>شرح الدرس</h2>
      <p>في هذا الدرس سنتعلم {currentLesson.title}...</p>
    </div>
    
    <div className="pdf-viewer">
      <iframe
        src={`${currentLesson.pdfUrl}#toolbar=0&navpanes=0`}
        width="100%"
        height="850px"
        title="شرح الدرس PDF"
      />
    </div>
    
    {/* زر التحميل */}
    <Button onClick={downloadPDF}>
      <DownloadIcon />
      تحميل PDF
    </Button>
  </div>
)}
```

#### **الميزات:**
- عرض PDF في iframe
- إخفاء شريط الأدوات (`toolbar=0`)
- إخفاء لوحة التنقل (`navpanes=0`)
- زر تحميل PDF
- تتبع تقدم التمرير (اختياري)

#### **البيانات المطلوبة:**
```typescript
currentLesson.pdfUrl = "/attached_assets/lessons/lesson_4-1.pdf"
```

---

### **🔴 التبويب 2: الفيديو (Video Tab)**

#### **الوظيفة:**
عرض فيديو YouTube مع قائمة فيديوهات إضافية

#### **الكود:**

```tsx
{activeTab === "video" && (
  <div className="video-container">
    {/* معلومات الدرس */}
    <div className="lesson-info">
      <VideoIcon />
      <h2>{currentLesson.title}</h2>
    </div>
    
    {/* مشغل الفيديو الرئيسي */}
    <div className="video-player">
      <iframe
        src={`${activeVideoUrl}?rel=0&modestbranding=1`}
        width="100%"
        height="500px"
        allowFullScreen
      />
    </div>
    
    {/* قائمة الفيديوهات الإضافية */}
    {currentLesson.additionalVideos && (
      <div className="video-playlist">
        <h3>فيديوهات إضافية</h3>
        {currentLesson.additionalVideos.map((video, index) => (
          <VideoCard
            key={index}
            video={video}
            onClick={() => setActiveVideoUrl(video.url)}
          />
        ))}
      </div>
    )}
    
    {/* تتبع وقت المشاهدة */}
    <div className="watch-progress">
      <ProgressBar value={(watchTime / totalDuration) * 100} />
      <p>شاهد {watchTime} من {totalDuration} دقيقة</p>
    </div>
  </div>
)}
```

#### **الميزات:**
- مشغل فيديو YouTube مدمج
- قائمة فيديوهات إضافية
- تتبع وقت المشاهدة
- إكمال التبويب بعد مشاهدة 2 دقيقة

#### **البيانات المطلوبة:**
```typescript
currentLesson.videoUrl = "https://www.youtube.com/embed/_l49Ard1--U"
currentLesson.additionalVideos = [
  { url: "https://www.youtube.com/watch?v=E-ndz2M-yfM" },
  { url: "https://www.youtube.com/watch?v=20JoAErwksw" }
]
```

#### **تتبع وقت المشاهدة:**

```typescript
const [videoWatchTime, setVideoWatchTime] = useState(0);

useEffect(() => {
  if (activeTab === "video") {
    const interval = setInterval(() => {
      setVideoWatchTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }
}, [activeTab]);

// إكمال التبويب بعد 2 دقيقة
useEffect(() => {
  if (videoWatchTime >= 120) {
    markTabComplete("video");
  }
}, [videoWatchTime]);
```

---

### **🟢 التبويب 3: التعليم (Education Tab)** ⭐ **الأهم**

#### **الوظيفة:**
عرض محتوى HTML تفاعلي مختصر للدرس

#### **الكود:**

```tsx
{activeTab === "education" && (
  <div className="education-container">
    {loadingEducation ? (
      <Loader />
    ) : educationContent ? (
      <div
        dangerouslySetInnerHTML={{ __html: educationContent }}
        style={{ height: 'auto' }}
      />
    ) : (
      <EmptyState message="لا يوجد محتوى تعليمي متاح" />
    )}
  </div>
)}
```

#### **تحميل المحتوى:**

```typescript
const [educationContent, setEducationContent] = useState<string>("");
const [loadingEducation, setLoadingEducation] = useState(false);

useEffect(() => {
  if (activeTab === "education" && currentLesson.id) {
    setLoadingEducation(true);
    
    fetch(`/attached_assets/html/lessons/${currentLesson.id}-education.html`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to load");
        return res.text();
      })
      .then(html => {
        // استخراج محتوى body و style
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const bodyContent = doc.body.innerHTML;
        const styleContent = doc.head.querySelector('style')?.innerHTML || '';
        
        // دمج style و body
        setEducationContent(`<style>${styleContent}</style>${bodyContent}`);
      })
      .catch(error => {
        console.error("Error loading education content:", error);
        setEducationContent("");
      })
      .finally(() => {
        setLoadingEducation(false);
      });
  }
}, [activeTab, currentLesson.id]);
```

#### **هيكل ملف HTML:**

```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <title>زوايا المضلع - شرح مختصر</title>
    <style>
        /* CSS هنا */
        body {
            font-family: 'Tajawal', sans-serif;
            background: #f8fafc;
        }
        .section-card {
            background: white;
            border-radius: 16px;
            padding: 30px;
            margin-bottom: 25px;
        }
        /* ... المزيد من CSS */
    </style>
</head>
<body>
    <div class="main-wrapper">
        <div class="hero-section">
            <h1>زوايا المضلع</h1>
            <p>شرح مختصر وواضح</p>
        </div>
        
        <div class="content-section">
            <!-- القسم الأول -->
            <div class="section-card">
                <h2>تعريفات أساسية</h2>
                <!-- المحتوى -->
            </div>
            
            <!-- المزيد من الأقسام -->
        </div>
    </div>
</body>
</html>
```

#### **استخدام صور من PDF:**

```html
<div class="diagram-container">
    <h3>رسم توضيحي من الدرس</h3>
    <iframe 
        src="/attached_assets/lessons/lesson_4-1.pdf#page=1&zoom=150" 
        type="application/pdf"
        width="100%"
        height="600px"
    ></iframe>
</div>
```

#### **الميزات:**
- محتوى HTML تفاعلي
- تصميم احترافي مع CSS
- صور من ملف PDF الأصلي
- بطاقات معلومات
- جداول مقارنة
- صيغ رياضية
- أمثلة عملية

#### **البيانات المطلوبة:**
```typescript
// اسم الملف يجب أن يكون: {lessonId}-education.html
// مثال: 5-1-education.html
```

---

### **🟡 التبويب 4: الأسئلة (Questions Tab)**

#### **الوظيفة:**
عرض أسئلة تفاعلية مع نظام تصحيح فوري

#### **الكود:**

```tsx
{activeTab === "questions" && (
  <div className="questions-container">
    {loadingQuestions ? (
      <Loader />
    ) : lessonQuestions.length > 0 ? (
      <>
        {/* النتيجة */}
        {showResults && (
          <div className={`results ${score >= passingScore ? 'success' : 'fail'}`}>
            <h2>{score} / {lessonQuestions.length}</h2>
            <p>نسبة النجاح: {Math.round((score / lessonQuestions.length) * 100)}%</p>
          </div>
        )}
        
        {/* قائمة الأسئلة */}
        <div className="questions-list">
          {lessonQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              selectedAnswer={questionAnswers[question.id]}
              showResult={showResults}
              onAnswerSelect={(answer) => {
                setQuestionAnswers(prev => ({
                  ...prev,
                  [question.id]: answer
                }));
              }}
            />
          ))}
        </div>
        
        {/* زر التصحيح */}
        {!showResults && (
          <Button onClick={checkAnswers}>
            تصحيح الإجابات
          </Button>
        )}
      </>
    ) : (
      <EmptyState message="لا توجد أسئلة متاحة" />
    )}
  </div>
)}
```

#### **تحميل الأسئلة:**

```typescript
const [lessonQuestions, setLessonQuestions] = useState<QuestionData[]>([]);
const [loadingQuestions, setLoadingQuestions] = useState(false);
const [questionAnswers, setQuestionAnswers] = useState<Record<number, number>>({});
const [showResults, setShowResults] = useState(false);
const [score, setScore] = useState(0);

useEffect(() => {
  if (activeTab === "questions" && currentLesson.questionsUrl) {
    setLoadingQuestions(true);
    
    fetch(currentLesson.questionsUrl)
      .then(res => res.json())
      .then(data => {
        setLessonQuestions(data.questions || []);
      })
      .catch(error => {
        console.error("Error loading questions:", error);
        setLessonQuestions([]);
      })
      .finally(() => {
        setLoadingQuestions(false);
      });
  }
}, [activeTab, currentLesson.questionsUrl]);
```

#### **مكون السؤال:**

```tsx
function QuestionCard({ question, index, selectedAnswer, showResult, onAnswerSelect }) {
  const correctAnswerIndex = question.correctAnswer === "a" ? 0 : 
                            question.correctAnswer === "b" ? 1 : 
                            question.correctAnswer === "c" ? 2 : 3;
  const isCorrect = showResult && selectedAnswer === correctAnswerIndex;
  const isWrong = showResult && selectedAnswer !== correctAnswerIndex && selectedAnswer !== undefined;
  
  return (
    <div className={`question-card ${isCorrect ? 'correct' : isWrong ? 'wrong' : ''}`}>
      <div className="question-header">
        <span className="question-number">{index + 1}</span>
        <p className="question-text">{question.questionText}</p>
      </div>
      
      {/* الخيارات */}
      <div className="options">
        {Object.entries(question.options).map(([key, value], idx) => (
          <button
            key={key}
            className={`option ${
              showResult && idx === correctAnswerIndex ? 'correct-answer' : ''
            } ${selectedAnswer === idx ? 'selected' : ''}`}
            onClick={() => onAnswerSelect(idx)}
            disabled={showResult}
          >
            <span className="option-key">{key.toUpperCase()})</span>
            <span className="option-text">{value}</span>
          </button>
        ))}
      </div>
      
      {/* الشرح */}
      {showResult && question.explanation && (
        <div className="explanation">
          <strong>الشرح:</strong> {question.explanation}
        </div>
      )}
    </div>
  );
}
```

#### **التصحيح:**

```typescript
const checkAnswers = () => {
  let correctCount = 0;
  
  lessonQuestions.forEach(question => {
    const correctAnswerIndex = question.correctAnswer === "a" ? 0 : 
                              question.correctAnswer === "b" ? 1 : 
                              question.correctAnswer === "c" ? 2 : 3;
    
    if (questionAnswers[question.id] === correctAnswerIndex) {
      correctCount++;
    }
  });
  
  setScore(correctCount);
  setShowResults(true);
  
  // حفظ النتيجة
  if (correctCount >= Math.ceil(lessonQuestions.length / 2)) {
    markTabComplete("questions");
  }
};
```

#### **هيكل ملف JSON:**

```json
{
  "lessonId": "5-1",
  "title": "زوايا المضلع",
  "questions": [
    {
      "id": 1,
      "questionText": "إذا كان مجموع قياسات الزوايا الداخلية لمضلع يساوي 900 درجة، فكم عدد أضلاعه؟",
      "hasGeometricShape": false,
      "options": {
        "a": "5 أضلاع",
        "b": "6 أضلاع",
        "c": "7 أضلاع",
        "d": "8 أضلاع"
      },
      "correctAnswer": "c",
      "explanation": "القانون: المجموع = (ن - 2) × 180. إذن 900 = (ن - 2) × 180. بالقسمة على 180 ينتج 5 = ن - 2، إذن ن = 7."
    }
  ]
}
```

#### **الميزات:**
- أسئلة متعددة الخيارات
- تصحيح فوري
- عرض الشرح بعد التصحيح
- حساب النتيجة
- حفظ التقدم

---

## 💾 تتبع التقدم

### **الحفظ:**

```typescript
const markTabComplete = async (tab: TabType) => {
  const progress = await updateLessonProgress({
    lessonId: currentLesson.id,
    stage: params.stage,
    subject: params.subject,
    completedTab: tab,
  });
  
  setProgress(progress);
};
```

### **التحميل:**

```typescript
useEffect(() => {
  if (currentLesson.id) {
    loadLessonProgress(currentLesson.id).then(progress => {
      setProgress(progress);
      setCompletedTabs(progress.completedTabs || []);
    });
  }
}, [currentLesson.id]);
```

### **حساب النسبة المئوية:**

```typescript
const progressPercentage = useMemo(() => {
  const tabs = ['lesson', 'video', 'education', 'questions'];
  const completedCount = tabs.filter(tab => 
    completedTabs.includes(tab)
  ).length;
  
  return (completedCount / tabs.length) * 100;
}, [completedTabs]);
```

---

## 🎨 التصميم

### **الألوان:**
- **الأزرق**: للتبويبات النشطة
- **الأخضر**: للنجاح والإكمال
- **البرتقالي**: للتنبيهات
- **الأحمر**: للأخطاء

### **الحركات:**
- استخدام Framer Motion للانتقالات
- تأثيرات Hover على البطاقات
- تحميل متدرج للعناصر

---

## 📝 ملخص

صفحة الدرس تحتوي على:

1. ✅ **4 تبويبات رئيسية** (الدرس، الفيديو، التعليم، الأسئلة)
2. ✅ **شريط جانبي** للتنقل
3. ✅ **تتبع التقدم** لكل تبويب
4. ✅ **محتوى تفاعلي** (PDF، فيديو، HTML، أسئلة)
5. ✅ **تصميم احترافي** مع حركات سلسة

---

## 🚀 البدء

ابدأ بإنشاء:
1. المكون الأساسي للصفحة
2. نظام التبويبات
3. كل تبويب على حدة
4. الشريط الجانبي
5. نظام تتبع التقدم

**حظاً موفقاً! 💪**
