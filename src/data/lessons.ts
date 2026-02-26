import { Calculator, FlaskConical, Globe, Pen, Languages, Atom, GraduationCap, Book, Heart, Palette, BookOpen, Monitor, Target, Briefcase, DollarSign } from "lucide-react";

export interface AdditionalVideo {
  url: string;
  title?: string;
  channelName?: string;
  duration?: string;
}

export interface LessonData {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  pdfUrl?: string;
  summaryPdfUrl?: string;
  bookPdfUrl?: string;
  worksheetsPdfUrl?: string;
  testQuestionsPdfUrl?: string;
  htmlUrl?: string;
  questionsUrl?: string;
  additionalVideos?: AdditionalVideo[];
}

export interface ChapterData {
  id: string;
  name: string;
  lessons: LessonData[];
  number?: number; // رقم الفصل المعروض في المربع (اختياري)
}

export interface SemesterData {
  id: string;
  name: string;
  chapters: ChapterData[];
}

export interface SubjectData {
  slug: string;
  name: string;
  icon: typeof Calculator;
  color: string;
  lessons: LessonData[];
  semesters?: SemesterData[];
}

export const lessonsData: Record<string, LessonData[]> = {
  math: [
    { id: "1", title: "مقدمة في الأعداد", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "الجمع والطرح", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الضرب والقسمة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الكسور", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "5", title: "الأعداد العشرية", duration: "17 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "6", title: "النسبة والتناسب", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  // الصف الخامس الابتدائي - الفصل الثاني - الرياضيات
  math_5_s2: [
    // الفصل 7 - الإحصاء والاحتمال
    { id: "7-1", title: "المتوسط الحسابي والوسيط والمنوال", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-2", title: "استقصاء حل المسألة", duration: "20 دقيقة", videoUrl: "" },
    { id: "7-3", title: "التمثيل بالأعمدة", duration: "22 دقيقة", videoUrl: "" },
    { id: "7-4", title: "الاحتمال", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-5", title: "الاحتمال والكسور", duration: "23 دقيقة", videoUrl: "" },
    { id: "7-6", title: "خطة حل المسألة: إنشاء قائمة", duration: "20 دقيقة", videoUrl: "" },
    { id: "7-7", title: "تحديد النواتج الممكنة", duration: "22 دقيقة", videoUrl: "" },
    // الفصل 8 - القواسم والمضاعفات
    { id: "8-1", title: "القواسم المشتركة", duration: "25 دقيقة", videoUrl: "" },
    { id: "8-2", title: "الأعداد الأولية والأعداد غير الأولية", duration: "28 دقيقة", videoUrl: "" },
    { id: "8-3", title: "الكسور المتكافئة", duration: "22 دقيقة", videoUrl: "" },
    { id: "8-4", title: "تبسيط الكسور", duration: "20 دقيقة", videoUrl: "" },
    { id: "8-5", title: "خطة حل المسألة: البحث عن نمط", duration: "18 دقيقة", videoUrl: "" },
    { id: "8-6", title: "المضاعفات المشتركة", duration: "25 دقيقة", videoUrl: "" },
    { id: "8-7", title: "مقارنة الكسور الاعتيادية", duration: "22 دقيقة", videoUrl: "" },
    // الفصل 9 - جمع الكسور وطرحها
    { id: "9-1", title: "جمع الكسور المتشابهة", duration: "20 دقيقة", videoUrl: "" },
    { id: "9-2", title: "طرح الكسور المتشابهة", duration: "20 دقيقة", videoUrl: "" },
    { id: "9-3", title: "جمع الكسور غير المتشابهة", duration: "25 دقيقة", videoUrl: "" },
    { id: "9-4", title: "طرح الكسور غير المتشابهة", duration: "25 دقيقة", videoUrl: "" },
    { id: "9-5", title: "مهارة حل المسألة: تحديد معقولية الإجابة", duration: "18 دقيقة", videoUrl: "" },
    // الفصل 10 - وحدات القياس
    { id: "10-1", title: "وحدات الطول", duration: "22 دقيقة", videoUrl: "" },
    { id: "10-2", title: "وحدات الكتلة", duration: "20 دقيقة", videoUrl: "" },
    { id: "10-3", title: "وحدات السعة", duration: "20 دقيقة", videoUrl: "" },
    { id: "10-4", title: "وحدات الزمن", duration: "22 دقيقة", videoUrl: "" },
    { id: "10-5", title: "استقصاء حل المسألة", duration: "18 دقيقة", videoUrl: "" },
    { id: "10-6", title: "حساب الزمن المنقضي", duration: "25 دقيقة", videoUrl: "" },
    // الفصل 11 - الأشكال الهندسية
    { id: "11-1", title: "مفردات هندسية", duration: "20 دقيقة", videoUrl: "" },
    { id: "11-2", title: "خطة حل المسألة: الاستدلال المنطقي", duration: "22 دقيقة", videoUrl: "" },
    { id: "11-3", title: "الأشكال الرباعية", duration: "25 دقيقة", videoUrl: "" },
    { id: "11-4", title: "الهندسة: الأزواج المرتبة", duration: "23 دقيقة", videoUrl: "" },
    { id: "11-5", title: "الجبر والهندسة: تمثيل الدوال", duration: "28 دقيقة", videoUrl: "" },
    { id: "11-6", title: "الانسحاب في المستوى الإحداثي", duration: "25 دقيقة", videoUrl: "" },
    { id: "11-7", title: "الانعكاس في المستوى الإحداثي", duration: "25 دقيقة", videoUrl: "" },
    { id: "11-8", title: "الدوران في المستوى الإحداثي", duration: "25 دقيقة", videoUrl: "" },
    // الفصل 12 - المحيط والمساحة والحجم
    { id: "12-1", title: "محيط مضلع", duration: "22 دقيقة", videoUrl: "" },
    { id: "12-2", title: "المساحة", duration: "20 دقيقة", videoUrl: "" },
    { id: "12-3", title: "مساحة المستطيل والمربع", duration: "25 دقيقة", videoUrl: "" },
    { id: "12-4", title: "الأشكال الثلاثية الأبعاد", duration: "28 دقيقة", videoUrl: "" },
    { id: "12-5", title: "خطة حل المسألة: إنشاء نموذج", duration: "22 دقيقة", videoUrl: "" },
    { id: "12-6", title: "حجم المنشور", duration: "25 دقيقة", videoUrl: "" },
  ],
  science: [
    { id: "1", title: "مقدمة في العلوم", duration: "12 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "المادة وخصائصها", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الطاقة وأشكالها", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الضوء والصوت", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "5", title: "الكائنات الحية", duration: "19 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  arabic: [
    { id: "1", title: "مقدمة في النحو", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "أقسام الكلمة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الجملة الاسمية", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الجملة الفعلية", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  english: [
    { id: "1", title: "Introduction to English", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "Basic Grammar", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "Vocabulary Building", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "Reading Comprehension", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "5", title: "Writing Skills", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  social: [
    { id: "1", title: "مقدمة في الجغرافيا", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "تاريخ المملكة", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الحضارات القديمة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "المواطنة", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  physics: [
    { id: "1", title: "مقدمة في الفيزياء", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "الحركة والسرعة", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "القوة والكتلة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الطاقة الحركية", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "5", title: "الكهرباء", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  chemistry: [
    { id: "1", title: "مقدمة في الكيمياء", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "الذرة والعنصر", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الجدول الدوري", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "التفاعلات الكيميائية", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  biology: [
    { id: "1", title: "مقدمة في الأحياء", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "الخلية", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الوراثة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "البيئة", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "5", title: "جسم الإنسان", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  cs: [
    { id: "1", title: "مقدمة في البرمجة", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "المتغيرات والأنواع", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الشروط والحلقات", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الدوال", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  health: [
    { id: "1", title: "مقدمة في الصحة", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "التغذية السليمة", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "الصحة النفسية", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  business: [
    { id: "1", title: "مقدمة في إدارة الأعمال", duration: "15 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "التسويق", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "المحاسبة", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  verbal: [
    { id: "1", title: "استيعاب المقروء", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "إكمال الجمل", duration: "18 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "التناظر اللفظي", duration: "22 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "الخطأ السياقي", duration: "20 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  tahsili: [
    { id: "1", title: "مراجعة الرياضيات", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "2", title: "مراجعة الفيزياء", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "3", title: "مراجعة الكيمياء", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
    { id: "4", title: "مراجعة الأحياء", duration: "25 دقيقة", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" },
  ],
  // أول ثانوي - دروس الفصل الدراسي الأول - الرياضيات
  // الفصل الأول: التبرير والبرهان
  math_high1_s1_ch1: [
    { id: "intro-1", title: "التهيئة للفصل 1", duration: "20 دقيقة", videoUrl: "", htmlUrl: "/attached_assets/html/lessons/intro-1.html" },
    { id: "1-1", title: "التبرير الاستقرائي والتخمين", duration: "25 دقيقة", videoUrl: "", htmlUrl: "/attached_assets/html/lessons/1-1.html" },
    { id: "1-2", title: "المنطق", duration: "28 دقيقة", videoUrl: "" },
    { id: "1-3", title: "العبارات الشرطية", duration: "30 دقيقة", videoUrl: "" },
    { id: "expand-3-1", title: "توسع 3-1 معمل الهندسة: العبارات الشرطية الثنائية", duration: "25 دقيقة", videoUrl: "" },
    { id: "1-4", title: "التبرير الاستنتاجي", duration: "28 دقيقة", videoUrl: "" },
    { id: "1-5", title: "المسلمات والبراهين الحرة", duration: "30 دقيقة", videoUrl: "" },
    { id: "1-6", title: "البرهان الجبري", duration: "25 دقيقة", videoUrl: "" },
    { id: "1-7", title: "إثبات علاقات بين القطع المستقيمة", duration: "28 دقيقة", videoUrl: "" },
    { id: "1-8", title: "إثبات علاقات بين الزوايا", duration: "30 دقيقة", videoUrl: "" },
  ],
  // الفصل الثاني: التوازي والتعامد
  math_high1_s1_ch2: [
    { id: "intro-2", title: "التهيئة للفصل 2", duration: "20 دقيقة", videoUrl: "" },
    { id: "2-1", title: "المستقيمان والقاطع", duration: "25 دقيقة", videoUrl: "" },
    { id: "2-2", title: "الزوايا والمستقيمات المتوازية", duration: "28 دقيقة", videoUrl: "" },
    { id: "2-3", title: "إثبات توازي مستقيمين", duration: "30 دقيقة", videoUrl: "" },
    { id: "2-4", title: "ميل المستقيم", duration: "25 دقيقة", videoUrl: "" },
    { id: "2-5", title: "صيغ معادلة المستقيم", duration: "28 دقيقة", videoUrl: "" },
    { id: "expand-5-2", title: "توسع 5-2 معمل الهندسة: معادلة العمود المنصف", duration: "25 دقيقة", videoUrl: "" },
    { id: "2-6", title: "الأعمدة والمسافة", duration: "30 دقيقة", videoUrl: "" },
  ],
  // الفصل الثالث: المثلثات المتطابقة
  math_high1_s1_ch3: [
    { id: "intro-3", title: "التهيئة للفصل 3", duration: "20 دقيقة", videoUrl: "" },
    { id: "3-1", title: "تصنيف المثلثات", duration: "25 دقيقة", videoUrl: "" },
    { id: "3-2", title: "زوايا المثلثات", duration: "28 دقيقة", videoUrl: "" },
    { id: "3-3", title: "المثلثات المتطابقة", duration: "30 دقيقة", videoUrl: "" },
    { id: "3-4", title: "إثبات تطابق المثلثات SSS, SAS", duration: "25 دقيقة", videoUrl: "" },
    { id: "3-5", title: "إثبات تطابق المثلثات ASA, AAS", duration: "28 دقيقة", videoUrl: "" },
    { id: "3-6", title: "المثلثات المتطابقة الضلعين والمثلثات المتطابقة الأضلاع", duration: "30 دقيقة", videoUrl: "" },
    { id: "3-7", title: "المثلثات والبرهان الإحداثي", duration: "28 دقيقة", videoUrl: "" },
  ],
  // الفصل الرابع: العلاقات في المثلث
  math_high1_s1_ch4: [
    { id: "intro-4", title: "التهيئة للفصل 4", duration: "20 دقيقة", videoUrl: "" },
    { id: "4-1", title: "المنصفات في المثلث", duration: "25 دقيقة", videoUrl: "" },
    { id: "4-2", title: "القطع المتوسطة والارتفاعات في المثلث", duration: "28 دقيقة", videoUrl: "" },
    { id: "4-3", title: "المتباينات في المثلث", duration: "30 دقيقة", videoUrl: "" },
    { id: "4-4", title: "البرهان غير المباشر", duration: "25 دقيقة", videoUrl: "" },
    { id: "4-5", title: "متباينة المثلث", duration: "28 دقيقة", videoUrl: "" },
    { id: "4-6", title: "المتباينات في مثلثين", duration: "30 دقيقة", videoUrl: "" },
  ],
  // أول ثانوي - دروس الفصل الدراسي الثاني - الرياضيات
  // الفصل الخامس: الأشكال الرباعية
  math_high1_s2_ch5: [
    { 
      id: "5-1", 
      title: "زوايا المضلع", 
      duration: "25 دقيقة", 
      videoUrl: "https://www.youtube.com/embed/_l49Ard1--U", 
      pdfUrl: "/attached_assets/lessons/lesson_4-1.pdf", 
      summaryPdfUrl: "/attached_assets/lessons/5-1-summary.pdf",
      htmlUrl: "/attached_assets/html/lessons/5-1.html", 
      questionsUrl: "/attached_assets/json/lessons/5-1-questions.json",
      additionalVideos: [
        { url: "https://www.youtube.com/watch?v=E-ndz2M-yfM" },
        { url: "https://www.youtube.com/watch?v=20JoAErwksw" },
        { url: "https://www.youtube.com/watch?v=O9-_Yy6l-Ok" }
      ]
    },
    { id: "expand-1-5", title: "توسع 1-5 معمل الجداول الإلكترونية: زوايا المضلع", duration: "25 دقيقة", videoUrl: "" },
    { id: "5-2", title: "متوازي الأضلاع", duration: "28 دقيقة", videoUrl: "" },
    { id: "5-3", title: "تمييز متوازي الأضلاع", duration: "30 دقيقة", videoUrl: "" },
    { id: "5-4", title: "المستطيل", duration: "25 دقيقة", videoUrl: "" },
    { id: "5-5", title: "المعين والمربع", duration: "28 دقيقة", videoUrl: "" },
    { id: "5-6", title: "شبه المنحرف وشكل الطائرة الورقية", duration: "30 دقيقة", videoUrl: "" },
  ],
  // الفصل السادس: التشابه
  math_high1_s2_ch6: [
    { id: "intro-6", title: "التهيئة للفصل 6", duration: "20 دقيقة", videoUrl: "" },
    { id: "6-1", title: "المضلعات المتشابهة", duration: "25 دقيقة", videoUrl: "" },
    { id: "6-2", title: "المثلثات المتشابهة", duration: "28 دقيقة", videoUrl: "" },
    { id: "6-3", title: "المستقيمات المتوازية والأجزاء المتناسبة", duration: "30 دقيقة", videoUrl: "" },
    { id: "6-4", title: "عناصر المثلثات المتشابهة", duration: "25 دقيقة", videoUrl: "" },
    { id: "expand-4-6", title: "توسع 4-6 معمل الهندسة: الكسريات", duration: "28 دقيقة", videoUrl: "" },
  ],
  // الفصل السابع: التحويلات الهندسية والتماثل
  math_high1_s2_ch7: [
    { id: "intro-7", title: "التهيئة للفصل 7", duration: "20 دقيقة", videoUrl: "" },
    { id: "7-1", title: "الانعكاس", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-2", title: "الإزاحة (الانسحاب)", duration: "28 دقيقة", videoUrl: "" },
    { id: "explore-3-7", title: "استكشاف 3-7 معمل الهندسة: الدوران", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-3", title: "الدوران", duration: "30 دقيقة", videoUrl: "" },
    { id: "explore-4-7", title: "استكشاف 4-7 معمل الحاسبة البيانية: تركيب التحويلات الهندسية", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-4", title: "تركيب التحويلات الهندسية", duration: "28 دقيقة", videoUrl: "" },
    { id: "expand-4-7", title: "توسع 4-7 معمل الهندسة: التبليط", duration: "25 دقيقة", videoUrl: "" },
    { id: "7-5", title: "التماثل", duration: "30 دقيقة", videoUrl: "" },
    { id: "7-6", title: "التمدد", duration: "28 دقيقة", videoUrl: "" },
  ],
  // أول متوسط - رياضيات - الفصل الدراسي الثاني
  // الفصل 4: النسبة والتناسب
  math_middle1_s2_ch4: [
    { 
      id: "m1-4-1", 
      title: "النسبة", 
      duration: "22 دقيقة", 
      videoUrl: "https://www.youtube.com/watch?v=2GRQStE-SGo", 
      pdfUrl: "/attached_assets/lessons/m1-4-1-ratio.pdf",
      summaryPdfUrl: "/attached_assets/lessons/m1-4-1-summary.pdf",
      additionalVideos: [
        { url: "https://www.youtube.com/watch?v=77niuMZji3Y" },
        { url: "https://www.youtube.com/watch?v=5wyxPLC27RE" },
        { url: "https://www.youtube.com/watch?v=vKDGW2jk8C8&t=85s" },
        { url: "https://www.youtube.com/watch?v=132EvpZx618&t=432s" },
      ]
    },
    { id: "m1-4-2", title: "المعدل", duration: "20 دقيقة", videoUrl: "" },
    { id: "m1-4-3", title: "القياس: التحويل بين الوحدات الإنجليزية", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-4-4", title: "القياس: التحويل بين الوحدات المترية", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-4-5", title: "الجبر: حل التناسبات", duration: "28 دقيقة", videoUrl: "" },
    { id: "m1-4-6", title: "الرسم", duration: "20 دقيقة", videoUrl: "" },
    { id: "m1-4-7", title: "مقياس الرسم", duration: "22 دقيقة", videoUrl: "" },
    { id: "m1-4-8", title: "الكسور والنسب المئوية", duration: "25 دقيقة", videoUrl: "" },
  ],
  // الفصل 5: تطبيقات النسبة المئوية
  math_middle1_s2_ch5: [
    { id: "m1-5-1", title: "النسبة المئوية من عدد", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-5-2", title: "تقدير النسبة المئوية", duration: "22 دقيقة", videoUrl: "" },
    { id: "m1-5-3", title: "تحديد معقولية الإجابة", duration: "20 دقيقة", videoUrl: "" },
    { id: "m1-5-4", title: "التناسب المئوي", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-5-5", title: "تطبيقات على النسبة المئوية", duration: "28 دقيقة", videoUrl: "" },
  ],
  // الفصل 6: الإحصاء
  math_middle1_s2_ch6: [
    { id: "m1-6-1", title: "التمثيل بالنقاط", duration: "22 دقيقة", videoUrl: "" },
    { id: "m1-6-2", title: "مقاييس النزعة المركزية والمدى", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-6-3", title: "التمثيل بالأعمدة والمدرجات التكرارية", duration: "28 دقيقة", videoUrl: "" },
    { id: "m1-6-4", title: "استعمال التمثيلات البيانية للتنبؤ", duration: "25 دقيقة", videoUrl: "" },
    { id: "m1-6-5", title: "استعمال التمثيل البياني", duration: "22 دقيقة", videoUrl: "" },
  ],
  // الفصل الثامن: الدائرة
  math_high1_s2_ch8: [
    { id: "intro-8", title: "التهيئة للفصل 8", duration: "20 دقيقة", videoUrl: "" },
    { id: "8-1", title: "الدائرة ومحيطها", duration: "25 دقيقة", videoUrl: "" },
    { id: "8-2", title: "قياس الزوايا والأقواس", duration: "28 دقيقة", videoUrl: "" },
    { id: "8-3", title: "الأقواس والأوتار", duration: "30 دقيقة", videoUrl: "" },
    { id: "8-4", title: "الزوايا المحيطية", duration: "25 دقيقة", videoUrl: "" },
    { id: "8-5", title: "المماسات", duration: "28 دقيقة", videoUrl: "" },
    { id: "8-6", title: "القاطع والمماس وقياسات الزوايا", duration: "30 دقيقة", videoUrl: "" },
    { id: "8-7", title: "قطع مستقيمة خاصة في الدائرة", duration: "25 دقيقة", videoUrl: "" },
    { id: "explore-8-8", title: "استكشاف 8-8 معمل الحاسبة البيانية: معادلة الدائرة", duration: "25 دقيقة", videoUrl: "" },
    { id: "8-8", title: "معادلة الدائرة", duration: "28 دقيقة", videoUrl: "" },
  ],
};

export const subjectsData: Record<string, SubjectData[]> = {
  elementary: [
    { 
      slug: "math", 
      name: "الرياضيات", 
      icon: Calculator, 
      color: "bg-blue-100 text-blue-600", 
      lessons: [...lessonsData.math, ...lessonsData.math_5_s2],
      semesters: [
        { 
          id: "sem1", 
          name: "دروس الفصل الدراسي الأول",
          chapters: [
            { id: "ch1", name: "الفصل 1: القيمة المنزلية", lessons: lessonsData.math.slice(0, 3) },
            { id: "ch2", name: "الفصل 2: الجمع والطرح", lessons: lessonsData.math.slice(3, 6) },
          ]
        },
        { 
          id: "sem2", 
          name: "دروس الفصل الدراسي الثاني",
          chapters: [
            { id: "ch7", name: "الفصل 7: الإحصاء والاحتمال", lessons: lessonsData.math_5_s2.slice(0, 7) },
            { id: "ch8", name: "الفصل 8: القواسم والمضاعفات", lessons: lessonsData.math_5_s2.slice(7, 14) },
            { id: "ch9", name: "الفصل 9: جمع الكسور وطرحها", lessons: lessonsData.math_5_s2.slice(14, 19) },
            { id: "ch10", name: "الفصل 10: وحدات القياس", lessons: lessonsData.math_5_s2.slice(19, 25) },
            { id: "ch11", name: "الفصل 11: الأشكال الهندسية", lessons: lessonsData.math_5_s2.slice(25, 33) },
            { id: "ch12", name: "الفصل 12: المحيط والمساحة والحجم", lessons: lessonsData.math_5_s2.slice(33) },
          ]
        },
      ]
    },
    { 
      slug: "arabic", 
      name: "لغتي", 
      icon: Pen, 
      color: "bg-rose-100 text-rose-600", 
      lessons: lessonsData.arabic,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.arabic.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.arabic.slice(2) }] },
      ]
    },
    { 
      slug: "science", 
      name: "العلوم", 
      icon: FlaskConical, 
      color: "bg-emerald-100 text-emerald-600", 
      lessons: lessonsData.science,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.science.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.science.slice(3) }] },
      ]
    },
    { 
      slug: "social", 
      name: "الدراسات الاجتماعية", 
      icon: Globe, 
      color: "bg-amber-100 text-amber-600", 
      lessons: lessonsData.social,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.social.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.social.slice(2) }] },
      ]
    },
    { slug: "islamic", name: "الدراسات الإسلامية", icon: Book, color: "bg-green-100 text-green-600", lessons: [], semesters: [] },
    { slug: "english", name: "انجليزي", icon: Languages, color: "bg-indigo-100 text-indigo-600", lessons: [], semesters: [] },
    { slug: "family", name: "الأسرية", icon: Heart, color: "bg-pink-100 text-pink-600", lessons: [], semesters: [] },
    { slug: "art", name: "التربية الفنية", icon: Palette, color: "bg-purple-100 text-purple-600", lessons: [], semesters: [] },
    { slug: "fikria", name: "التربية الفكرية", icon: GraduationCap, color: "bg-cyan-100 text-cyan-600", lessons: [], semesters: [] },
    { slug: "tajweed", name: "التجويد", icon: BookOpen, color: "bg-teal-100 text-teal-600", lessons: [], semesters: [] },
    { slug: "quran", name: "تلاوة القرآن وتجويده", icon: BookOpen, color: "bg-amber-100 text-amber-600", lessons: [], semesters: [] },
    { slug: "digital", name: "الرقمية", icon: Monitor, color: "bg-slate-100 text-slate-600", lessons: [], semesters: [] },
  ],
  middle: [
    { 
      slug: "math", 
      name: "الرياضيات", 
      icon: Calculator, 
      color: "bg-blue-100 text-blue-600", 
      lessons: [
        ...lessonsData.math.slice(0, 3),
        ...(lessonsData.math_middle1_s2_ch4 || []),
        ...(lessonsData.math_middle1_s2_ch5 || []),
        ...(lessonsData.math_middle1_s2_ch6 || []),
      ],
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الفصل 1", lessons: lessonsData.math.slice(0, 3) }] },
        { 
          id: "s2", 
          name: "دروس الفصل الدراسي الثاني", 
          chapters: [
            { id: "ch4", name: "النسبة والتناسب", number: 4, lessons: lessonsData.math_middle1_s2_ch4 || [] },
            { id: "ch5", name: "تطبيقات النسبة المئوية", number: 5, lessons: lessonsData.math_middle1_s2_ch5 || [] },
            { id: "ch6", name: "الإحصاء", number: 6, lessons: lessonsData.math_middle1_s2_ch6 || [] },
          ]
        },
      ]
    },
    { 
      slug: "science", 
      name: "العلوم", 
      icon: FlaskConical, 
      color: "bg-emerald-100 text-emerald-600", 
      lessons: lessonsData.science,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.science.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.science.slice(3) }] },
      ]
    },
    { 
      slug: "arabic", 
      name: "لغتي", 
      icon: Pen, 
      color: "bg-rose-100 text-rose-600", 
      lessons: lessonsData.arabic,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.arabic.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.arabic.slice(2) }] },
      ]
    },
    { 
      slug: "english", 
      name: "اللغة الإنجليزية", 
      icon: Languages, 
      color: "bg-purple-100 text-purple-600", 
      lessons: lessonsData.english,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.english.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.english.slice(3) }] },
      ]
    },
    { 
      slug: "social", 
      name: "الدراسات الاجتماعية", 
      icon: Globe, 
      color: "bg-amber-100 text-amber-600", 
      lessons: lessonsData.social,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.social.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.social.slice(2) }] },
      ]
    },
    { slug: "tajweed", name: "التجويد", icon: BookOpen, color: "bg-teal-100 text-teal-600", lessons: [], semesters: [] },
    { slug: "islamic", name: "الدراسات الإسلامية", icon: Book, color: "bg-green-100 text-green-600", lessons: [], semesters: [] },
    { slug: "digital", name: "الرقمية", icon: Monitor, color: "bg-slate-100 text-slate-600", lessons: [], semesters: [] },
    { slug: "family", name: "الأسرية", icon: Heart, color: "bg-pink-100 text-pink-600", lessons: [], semesters: [] },
    { slug: "art", name: "التربية الفنية", icon: Palette, color: "bg-purple-100 text-purple-600", lessons: [], semesters: [] },
    { slug: "fikria", name: "التربية الفكرية", icon: GraduationCap, color: "bg-cyan-100 text-cyan-600", lessons: [], semesters: [] },
    { slug: "critical", name: "التفكير الناقد", icon: Target, color: "bg-orange-100 text-orange-600", lessons: [], semesters: [] },
  ],
  high: [
    { 
      slug: "math", 
      name: "الرياضيات", 
      icon: Calculator, 
      color: "bg-blue-100 text-blue-600", 
      lessons: [...lessonsData.math, ...(lessonsData.math_high1_s2_ch5 || []), ...(lessonsData.math_high1_s2_ch6 || []), ...(lessonsData.math_high1_s2_ch7 || []), ...(lessonsData.math_high1_s2_ch8 || [])],
      semesters: [
        { 
          id: "s1", 
          name: "دروس الفصل الدراسي الأول", 
          chapters: [
            { id: "ch1", name: "الفصل الأول: التبرير والبرهان", lessons: lessonsData.math_high1_s1_ch1 || [] },
            { id: "ch2", name: "الفصل الثاني: التوازي والتعامد", lessons: lessonsData.math_high1_s1_ch2 || [] },
            { id: "ch3", name: "الفصل الثالث: المثلثات المتطابقة", lessons: lessonsData.math_high1_s1_ch3 || [] },
            { id: "ch4", name: "الفصل الرابع: العلاقات في المثلث", lessons: lessonsData.math_high1_s1_ch4 || [] },
          ] 
        },
        { 
          id: "s2", 
          name: "دروس الفصل الدراسي الثاني",
          chapters: [
            { id: "ch5", name: "الفصل الخامس: الأشكال الرباعية", lessons: lessonsData.math_high1_s2_ch5 || [] },
            { id: "ch6", name: "الفصل السادس: التشابه", lessons: lessonsData.math_high1_s2_ch6 || [] },
            { id: "ch7", name: "الفصل السابع: التحويلات الهندسية والتماثل", lessons: lessonsData.math_high1_s2_ch7 || [] },
            { id: "ch8", name: "الفصل الثامن: الدائرة", lessons: lessonsData.math_high1_s2_ch8 || [] },
          ]
        },
      ]
    },
    { 
      slug: "physics", 
      name: "الفيزياء", 
      icon: Atom, 
      color: "bg-indigo-100 text-indigo-600", 
      lessons: lessonsData.physics,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الفصل 1", lessons: lessonsData.physics.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الفصل 2", lessons: lessonsData.physics.slice(3) }] },
      ]
    },
    { 
      slug: "chemistry", 
      name: "الكيمياء", 
      icon: FlaskConical, 
      color: "bg-emerald-100 text-emerald-600", 
      lessons: lessonsData.chemistry,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الفصل 1", lessons: lessonsData.chemistry.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الفصل 2", lessons: lessonsData.chemistry.slice(2) }] },
      ]
    },
    { 
      slug: "biology", 
      name: "الأحياء", 
      icon: FlaskConical, 
      color: "bg-green-100 text-green-600", 
      lessons: lessonsData.biology,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الفصل 1", lessons: lessonsData.biology.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الفصل 2", lessons: lessonsData.biology.slice(3) }] },
      ]
    },
    { 
      slug: "arabic", 
      name: "اللغة العربية", 
      icon: Pen, 
      color: "bg-rose-100 text-rose-600", 
      lessons: lessonsData.arabic,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.arabic.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.arabic.slice(2) }] },
      ]
    },
    { 
      slug: "english", 
      name: "اللغة الإنجليزية", 
      icon: Languages, 
      color: "bg-purple-100 text-purple-600", 
      lessons: lessonsData.english,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.english.slice(0, 3) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.english.slice(3) }] },
      ]
    },
    { slug: "hadith", name: "حديث", icon: Book, color: "bg-green-100 text-green-600", lessons: [], semesters: [] },
    { slug: "ecology", name: "علم البيئة", icon: FlaskConical, color: "bg-lime-100 text-lime-600", lessons: [], semesters: [] },
    { slug: "digital", name: "الرقمية", icon: Monitor, color: "bg-slate-100 text-slate-600", lessons: [], semesters: [] },
    { slug: "vocational", name: "التربية المهنية", icon: Briefcase, color: "bg-sky-100 text-sky-600", lessons: [], semesters: [] },
    { slug: "social", name: "الدراسات الاجتماعية", icon: Globe, color: "bg-amber-100 text-amber-600", lessons: lessonsData.social || [], semesters: [] },
    { slug: "financial", name: "المعرفة المالية", icon: DollarSign, color: "bg-emerald-100 text-emerald-600", lessons: [], semesters: [] },
    { slug: "fikria", name: "التربية الفكرية", icon: GraduationCap, color: "bg-cyan-100 text-cyan-600", lessons: [], semesters: [] },
    { slug: "qiraat", name: "قراءات", icon: BookOpen, color: "bg-teal-100 text-teal-600", lessons: [], semesters: [] },
    { slug: "tawheed", name: "توحيد", icon: Book, color: "bg-green-100 text-green-600", lessons: [], semesters: [] },
    { slug: "financial-mgmt", name: "الإدارة المالية", icon: DollarSign, color: "bg-emerald-100 text-emerald-600", lessons: [], semesters: [] },
    { slug: "arts", name: "الفنون", icon: Palette, color: "bg-pink-100 text-pink-600", lessons: [], semesters: [] },
    { slug: "business-decision", name: "صناعة القرار في الأعمال", icon: Briefcase, color: "bg-amber-100 text-amber-600", lessons: [], semesters: [] },
    { slug: "intro-business", name: "مقدمة في الأعمال", icon: Briefcase, color: "bg-orange-100 text-orange-600", lessons: [], semesters: [] },
    { slug: "iot", name: "انترنت الأشياء", icon: Monitor, color: "bg-indigo-100 text-indigo-600", lessons: [], semesters: [] },
    { slug: "health-sciences", name: "مبادئ العلوم الصحية", icon: FlaskConical, color: "bg-lime-100 text-lime-600", lessons: [], semesters: [] },
    { slug: "fiqh", name: "فقه", icon: Book, color: "bg-green-100 text-green-600", lessons: [], semesters: [] },
    { slug: "chinese", name: "اللغة الصينية", icon: Languages, color: "bg-red-100 text-red-600", lessons: [], semesters: [] },
    { slug: "earth-space", name: "علوم الأرض والفضاء", icon: FlaskConical, color: "bg-sky-100 text-sky-600", lessons: [], semesters: [] },
    { slug: "ai", name: "الذكاء الاصطناعي", icon: Atom, color: "bg-violet-100 text-violet-600", lessons: [], semesters: [] },
    { slug: "digital-design", name: "التصميم الرقمي", icon: Monitor, color: "bg-pink-100 text-pink-600", lessons: [], semesters: [] },
    { slug: "statistics", name: "الإحصاء", icon: Calculator, color: "bg-blue-100 text-blue-600", lessons: [], semesters: [] },
    { slug: "law", name: "مبادئ القانون", icon: Book, color: "bg-amber-100 text-amber-600", lessons: [], semesters: [] },
    { slug: "marketing-planning", name: "تخطيط الحملات التسويقية", icon: Briefcase, color: "bg-orange-100 text-orange-600", lessons: [], semesters: [] },
    { slug: "sustainability", name: "التنمية المستدامة", icon: Globe, color: "bg-emerald-100 text-emerald-600", lessons: [], semesters: [] },
    { slug: "mgmt-skills", name: "المهارات الإدارية", icon: Briefcase, color: "bg-indigo-100 text-indigo-600", lessons: [], semesters: [] },
    { slug: "writing", name: "الكتابة الوظيفية والإبداعية", icon: Pen, color: "bg-rose-100 text-rose-600", lessons: [], semesters: [] },
    { slug: "event-mgmt", name: "إدارة الفعاليات", icon: Briefcase, color: "bg-teal-100 text-teal-600", lessons: [], semesters: [] },
  ],
  paths: [
    { 
      slug: "cs", 
      name: "علوم الحاسب", 
      icon: Calculator, 
      color: "bg-blue-100 text-blue-600", 
      lessons: lessonsData.cs,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.cs.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.cs.slice(2) }] },
      ]
    },
    { 
      slug: "health", 
      name: "الصحة والحياة", 
      icon: FlaskConical, 
      color: "bg-emerald-100 text-emerald-600", 
      lessons: lessonsData.health,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.health.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.health.slice(2) }] },
      ]
    },
    { 
      slug: "business", 
      name: "إدارة الأعمال", 
      icon: Globe, 
      color: "bg-amber-100 text-amber-600", 
      lessons: lessonsData.business,
      semesters: [
        { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: lessonsData.business.slice(0, 2) }] },
        { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: lessonsData.business.slice(2) }] },
      ]
    },
  ],
  qudurat: [
    { slug: "verbal", name: "القسم اللفظي", icon: Pen, color: "bg-rose-100 text-rose-600", lessons: lessonsData.verbal, semesters: [] },
    { slug: "math", name: "القسم الكمي", icon: Calculator, color: "bg-blue-100 text-blue-600", lessons: lessonsData.math, semesters: [] },
    { slug: "tahsili", name: "التحصيلي", icon: GraduationCap, color: "bg-violet-100 text-violet-600", lessons: lessonsData.tahsili, semesters: [] },
  ],
};

export const subjectNames: Record<string, string> = {
  math: "الرياضيات",
  math_5_s2: "رياضيات خامس - ف2",
  science: "العلوم",
  arabic: "اللغة العربية",
  english: "اللغة الإنجليزية",
  social: "الدراسات الاجتماعية",
  islamic: "الدراسات الإسلامية",
  family: "الأسرية",
  art: "التربية الفنية",
  fikria: "التربية الفكرية",
  tajweed: "التجويد",
  critical: "التفكير الناقد",
  hadith: "حديث",
  ecology: "علم البيئة",
  vocational: "التربية المهنية",
  financial: "المعرفة المالية",
  qiraat: "قراءات",
  tawheed: "توحيد",
  "financial-mgmt": "الإدارة المالية",
  arts: "الفنون",
  "business-decision": "صناعة القرار في الأعمال",
  "intro-business": "مقدمة في الأعمال",
  iot: "انترنت الأشياء",
  "health-sciences": "مبادئ العلوم الصحية",
  fiqh: "فقه",
  chinese: "اللغة الصينية",
  "earth-space": "علوم الأرض والفضاء",
  ai: "الذكاء الاصطناعي",
  "digital-design": "التصميم الرقمي",
  statistics: "الإحصاء",
  law: "مبادئ القانون",
  "marketing-planning": "تخطيط الحملات التسويقية",
  sustainability: "التنمية المستدامة",
  "mgmt-skills": "المهارات الإدارية",
  writing: "الكتابة الوظيفية والإبداعية",
  "event-mgmt": "إدارة الفعاليات",
  quran: "تلاوة القرآن وتجويده",
  digital: "الرقمية",
  physics: "الفيزياء",
  chemistry: "الكيمياء",
  biology: "الأحياء",
  cs: "علوم الحاسب",
  health: "الصحة والحياة",
  business: "إدارة الأعمال",
  verbal: "القسم اللفظي",
  tahsili: "التحصيلي",
};

export const getLessonsForSubject = (subjectSlug: string): LessonData[] => {
  return lessonsData[subjectSlug] || [];
};

export const getSubjectName = (subjectSlug: string): string => {
  return subjectNames[subjectSlug] || "المادة";
};

/** الهيكل الافتراضي للقائمة الجانبية: دروس الفصل الأول/الثاني + مرفقات لكل فصل */
export const DEFAULT_SEMESTERS_FOR_SIDEBAR: SemesterData[] = [
  { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: [] }] },
  { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: [] }] },
];

/** التأكد من وجود فصلين دراسيين بالشكل الموحد (دروس الفصل الأول/الثاني) لعرض مرفقات كل فصل */
export function ensureTwoSemestersWithAttachments(semesters: SemesterData[]): SemesterData[] {
  const s1Name = "دروس الفصل الدراسي الأول";
  const s2Name = "دروس الفصل الدراسي الثاني";
  const empty = { id: "ch2", name: "الوحدة الثانية", lessons: [] as LessonData[] };
  if (semesters.length === 0) {
    return [
      { id: "s1", name: s1Name, chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: [] }] },
      { id: "s2", name: s2Name, chapters: [empty] },
    ];
  }
  const [first, second] = semesters;
  const out: SemesterData[] = [
    { ...first, id: first.id || "s1", name: s1Name, chapters: first.chapters ?? [] },
  ];
  if (second) {
    out.push({ ...second, id: second.id || "s2", name: s2Name, chapters: second.chapters ?? [] });
  } else {
    out.push({ id: "s2", name: s2Name, chapters: [empty] });
  }
  return out;
}

/**
 * يُرجع الفصول الدراسية للقائمة الجانبية - إن لم تكن المادة تحتوي على هيكلية، يُستخدم الهيكل الافتراضي.
 * يُطبَّق تلقائياً على جميع المواد بما فيها الجديدة.
 */
export function getSemestersForSidebar(
  subjectSemesters: SemesterData[] | undefined,
  flatLessons: LessonData[]
): SemesterData[] {
  if (subjectSemesters && subjectSemesters.length > 0) return subjectSemesters;
  if (flatLessons.length === 0) {
    return DEFAULT_SEMESTERS_FOR_SIDEBAR;
  }
  return [
    { id: "s1", name: "دروس الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الوحدة الأولى", lessons: [...flatLessons] }] },
    { id: "s2", name: "دروس الفصل الدراسي الثاني", chapters: [{ id: "ch2", name: "الوحدة الثانية", lessons: [] }] },
  ];
}

/**
 * Get the first lesson ID for a subject in a specific stage
 * Returns the first lesson from the first semester's first chapter
 */
export const getFirstLessonId = (stageId: string, subjectId: string): string | null => {
  const subjectData = subjectsData[stageId]?.find(s => s.slug === subjectId);
  
  if (!subjectData) {
    // Fallback: try to get first lesson from lessonsData
    const lessons = lessonsData[subjectId] || [];
    return lessons.length > 0 ? lessons[0].id : null;
  }
  
  // If subject has semesters, get first lesson from first semester
  if (subjectData.semesters && subjectData.semesters.length > 0) {
    const firstSemester = subjectData.semesters[0];
    if (firstSemester.chapters && firstSemester.chapters.length > 0) {
      const firstChapter = firstSemester.chapters[0];
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        return firstChapter.lessons[0].id;
      }
    }
  }
  
  // Fallback: get first lesson from subject's lessons array
  if (subjectData.lessons && subjectData.lessons.length > 0) {
    return subjectData.lessons[0].id;
  }
  
  return null;
};
