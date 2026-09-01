export type CurriculumContentStatus = "ready" | "in_review" | "coming_soon";

export interface CurriculumCatalogLesson {
  id: string;
  title: string;
  status: CurriculumContentStatus;
  engineLessonId?: string;
}

export interface CurriculumCatalogChapter {
  id: string;
  number: number;
  name: string;
  lessons: CurriculumCatalogLesson[];
}

export interface CurriculumCatalogSemester {
  id: string;
  name: string;
  chapters: CurriculumCatalogChapter[];
}

export interface CurriculumBookSource {
  title: string;
  officialPageUrl: string;
  officialPdfUrl: string;
  portal: "madrasati";
  editionPolicy: string;
  verifiedAt: string;
}

export interface CurriculumSubjectCatalog {
  id: string;
  stageSlug: "middle" | "high";
  gradeId: string;
  subjectSlug: "math";
  title: string;
  academicYear: string;
  sources: Record<"s1" | "s2", CurriculumBookSource>;
  semesters: CurriculumCatalogSemester[];
}

const comingSoon = (id: string, title: string): CurriculumCatalogLesson => ({
  id,
  title,
  status: "coming_soon",
});

const chapter = (
  id: string,
  number: number,
  name: string,
  lessons: Array<[string, string]>,
): CurriculumCatalogChapter => ({
  id,
  number,
  name,
  lessons: lessons.map(([lessonId, title]) => comingSoon(lessonId, title)),
});

const currentEditionPolicy = "النسخة المنشورة حاليًا في بوابة مدرستي الرسمية";

export const middleGrade2MathCatalog: CurriculumSubjectCatalog = {
  id: "middle-2-math",
  stageSlug: "middle",
  gradeId: "2",
  subjectSlug: "math",
  title: "الرياضيات — الصف الثاني المتوسط",
  academicYear: "1447–1448هـ / 2025–2026م",
  sources: {
    s1: {
      title: "كتاب الرياضيات — الصف الثاني المتوسط — الجزء الأول",
      officialPageUrl: "https://madrasatibeta.moe.gov.sa/books/B47494BFDA4FEA2A30BBC9FC72357528?Language=1",
      officialPdfUrl: "https://iencontent.ien.edu.sa/books/98750537-GE-ME-K08-SM1-MATH.pdf",
      portal: "madrasati",
      editionPolicy: currentEditionPolicy,
      verifiedAt: "2026-09-01",
    },
    s2: {
      title: "كتاب الرياضيات — الصف الثاني المتوسط — الجزء الثاني",
      officialPageUrl: "https://madrasatibeta.moe.gov.sa/books/B47494BFDA4FEA2A30BBC9FC72357528?Language=1",
      officialPdfUrl: "https://iencontent.ien.edu.sa/books/53e7f3a7-GE-ME-K08-SM1-MATH.pdf",
      portal: "madrasati",
      editionPolicy: currentEditionPolicy,
      verifiedAt: "2026-09-01",
    },
  },
  semesters: [
    {
      id: "s1",
      name: "الجزء الأول",
      chapters: [
        chapter("m2-ch1", 1, "الأعداد النسبية", [
          ["m2-1-1", "الأعداد النسبية"],
          ["m2-1-2", "مقارنة الأعداد النسبية وترتيبها"],
          ["m2-1-3", "ضرب الأعداد النسبية"],
          ["m2-1-4", "قسمة الأعداد النسبية"],
          ["m2-1-5", "جمع الأعداد النسبية ذات المقامات المتشابهة وطرحها"],
          ["m2-1-6", "جمع الأعداد النسبية ذات المقامات المختلفة وطرحها"],
          ["m2-1-7", "استراتيجية حل المسألة: البحث عن نمط"],
          ["m2-1-8", "القوى والأسس"],
          ["m2-1-9", "الصيغة العلمية"],
        ]),
        chapter("m2-ch2", 2, "الأعداد الحقيقية ونظرية فيثاغورس", [
          ["m2-2-1", "الجذور التربيعية"],
          ["m2-2-2", "تقدير الجذور التربيعية"],
          ["m2-2-3", "استراتيجية حل المسألة: استعمال أشكال ڤن"],
          ["m2-2-4", "الأعداد الحقيقية"],
          ["m2-2-5", "استكشاف نظرية فيثاغورس"],
          ["m2-2-6", "نظرية فيثاغورس"],
          ["m2-2-7", "تطبيقات على نظرية فيثاغورس"],
          ["m2-2-8", "توسع: تمثيل الأعداد غير النسبية"],
          ["m2-2-9", "الأبعاد في المستوى الإحداثي"],
        ]),
        chapter("m2-ch3", 3, "التناسب والتشابه", [
          ["m2-3-1", "العلاقات المتناسبة وغير المتناسبة"],
          ["m2-3-2", "معدل التغير"],
          ["m2-3-3", "المعدل الثابت للتغير"],
          ["m2-3-4", "حل التناسب"],
          ["m2-3-5", "استراتيجية حل المسألة: الرسم"],
          ["m2-3-6", "تشابه المضلعات"],
          ["m2-3-7", "التكبير والتصغير"],
          ["m2-3-8", "القياس غير المباشر"],
        ]),
        chapter("m2-ch4", 4, "النسبة المئوية", [
          ["m2-4-1", "إيجاد النسب المئوية ذهنيًا"],
          ["m2-4-2", "النسبة المئوية والتقدير"],
          ["m2-4-3", "استراتيجية حل المسألة"],
          ["m2-4-4", "الجبر: المعادلة المئوية"],
          ["m2-4-5", "التغير المئوي"],
        ]),
        {
          ...chapter("m2-ch5", 5, "الهندسة والاستدلال المكاني", [
            ["m2-5-1", "علاقات الزوايا والمستقيمات"],
            ["m2-5-2", "استراتيجية حل المسألة: التبرير المنطقي"],
            ["l-mm6el08l", "المضلعات والزوايا"],
            ["m2-5-4", "تطابق المضلعات"],
            ["m2-5-5", "التماثل"],
            ["m2-5-6", "الانعكاس"],
            ["m2-5-7", "الانسحاب"],
            ["m2-5-8", "الدوران"],
          ]),
          lessons: chapter("m2-ch5", 5, "الهندسة والاستدلال المكاني", [
            ["m2-5-1", "علاقات الزوايا والمستقيمات"],
            ["m2-5-2", "استراتيجية حل المسألة: التبرير المنطقي"],
            ["l-mm6el08l", "المضلعات والزوايا"],
            ["m2-5-4", "تطابق المضلعات"],
            ["m2-5-5", "التماثل"],
            ["m2-5-6", "الانعكاس"],
            ["m2-5-7", "الانسحاب"],
            ["m2-5-8", "الدوران"],
          ]).lessons.map((lesson) => lesson.id === "l-mm6el08l"
            ? { ...lesson, status: "ready", engineLessonId: "l-mm6el08l" }
            : lesson),
        },
      ],
    },
    {
      id: "s2",
      name: "الجزء الثاني",
      chapters: [
        chapter("m2-ch6", 6, "الإحصاء", [
          ["m2-6-1", "استراتيجية حل المسألة: إنشاء جدول"],
          ["m2-6-2", "المدرجات التكرارية"],
          ["m2-6-3", "القطاعات الدائرية"],
          ["m2-6-4", "مقاييس النزعة المركزية والمدى"],
          ["m2-6-5", "مقاييس التشتت"],
          ["m2-6-6", "التمثيل بالصندوق وطرفيه"],
          ["m2-6-7", "التمثيل بالساق والورقة"],
          ["m2-6-8", "اختيار طريقة التمثيل المناسبة"],
        ]),
        chapter("m2-ch7", 7, "الاحتمالات", [
          ["m2-7-1", "عد النواتج"],
          ["m2-7-2", "احتمال الحوادث المركبة"],
          ["m2-7-3", "الاحتمال النظري والاحتمال التجريبي"],
          ["m2-7-4", "استراتيجية حل المسألة: تمثيل المسألة"],
          ["m2-7-5", "استعمال المعاينة في التنبؤ"],
        ]),
        chapter("m2-ch8", 8, "القياس: المساحة والحجم", [
          ["m2-8-1", "مساحات الأشكال المركبة"],
          ["m2-8-2", "استراتيجية حل المسألة: حل مسألة أبسط"],
          ["m2-8-3", "الأشكال الثلاثية الأبعاد"],
          ["m2-8-4", "حجم المنشور والأسطوانة"],
          ["m2-8-5", "حجم الهرم والمخروط"],
          ["m2-8-6", "مساحة سطح المنشور والأسطوانة"],
          ["m2-8-7", "مساحة سطح الهرم"],
        ]),
        chapter("m2-ch9", 9, "الجبر: المعادلات والمتباينات", [
          ["m2-9-1", "تبسيط العبارات الجبرية"],
          ["m2-9-2", "حل معادلات ذات خطوتين"],
          ["m2-9-3", "كتابة معادلات ذات خطوتين"],
          ["m2-9-4", "حل معادلات تتضمن متغيرات في طرفيها"],
          ["m2-9-5", "استراتيجية حل المسألة: التخمين والتحقق"],
          ["m2-9-6", "المتباينات"],
          ["m2-9-7", "حل المتباينات"],
        ]),
        chapter("m2-ch10", 10, "الجبر: الدوال الخطية", [
          ["m2-10-1", "المتتابعات"],
          ["m2-10-2", "الدوال"],
          ["m2-10-3", "تمثيل الدوال الخطية"],
          ["m2-10-4", "ميل المستقيم"],
          ["m2-10-5", "التغير الطردي"],
          ["m2-10-6", "استراتيجية حل المسألة: إنشاء نموذج"],
        ]),
      ],
    },
  ],
};

export const highGrade2MathCatalog: CurriculumSubjectCatalog = {
  id: "high-2-math",
  stageSlug: "high",
  gradeId: "2",
  subjectSlug: "math",
  title: "الرياضيات 2 — الصف الثاني الثانوي",
  academicYear: "1447–1448هـ / 2025–2026م",
  sources: {
    s1: {
      title: "الرياضيات 2-1 — السنة الثانية — نظام المسارات",
      officialPageUrl: "https://madrasatibeta.moe.gov.sa/books/3B7E33BCAA9DCFEE8ECBD670A0C2D6DA?Language=1",
      officialPdfUrl: "https://iencontent.ien.edu.sa/books/d00faf9a-GE-CBM-GNRL-TRC2-SM1-MATH2.1.pdf",
      portal: "madrasati",
      editionPolicy: currentEditionPolicy,
      verifiedAt: "2026-09-01",
    },
    s2: {
      title: "الرياضيات 2-2 — السنة الثانية — نظام المسارات",
      officialPageUrl: "https://madrasatibeta.moe.gov.sa/books/3B7E33BCAA9DCFEE8ECBD670A0C2D6DA?Language=1",
      officialPdfUrl: "https://iencontent.ien.edu.sa/books/80538462-GE-CBM-GNRL-TRC2-SM1-MATH2.1.pdf",
      portal: "madrasati",
      editionPolicy: currentEditionPolicy,
      verifiedAt: "2026-09-01",
    },
  },
  semesters: [
    {
      id: "s1",
      name: "الرياضيات 2-1",
      chapters: [
        {
          ...chapter("h2-ch1", 1, "الدوال والمتباينات", [
            ["h2-1-1", "خصائص الأعداد الحقيقية"],
            ["h2-1-2", "العلاقات والدوال"],
            ["h2-1-3", "دوال خاصة"],
            ["h2-1-4", "تمثيل المتباينات الخطية ومتباينات القيمة المطلقة بيانيًا"],
            ["h2-1-5", "حل أنظمة المتباينات الخطية بيانيًا"],
            ["h2-1-6", "البرمجة الخطية والحل الأمثل"],
          ]),
          lessons: chapter("h2-ch1", 1, "الدوال والمتباينات", [
            ["h2-1-1", "خصائص الأعداد الحقيقية"],
            ["h2-1-2", "العلاقات والدوال"],
            ["h2-1-3", "دوال خاصة"],
            ["h2-1-4", "تمثيل المتباينات الخطية ومتباينات القيمة المطلقة بيانيًا"],
            ["h2-1-5", "حل أنظمة المتباينات الخطية بيانيًا"],
            ["h2-1-6", "البرمجة الخطية والحل الأمثل"],
          ]).lessons.map((lesson) => lesson.id === "h2-1-1"
            ? { ...lesson, status: "in_review", engineLessonId: "h2-1-1" }
            : lesson),
        },
        chapter("h2-ch2", 2, "المصفوفات", [
          ["h2-2-1", "مقدمة في المصفوفات"],
          ["h2-2-2", "العمليات على المصفوفات"],
          ["h2-2-3", "ضرب المصفوفات"],
          ["h2-2-4", "المحددات وقاعدة كرامر"],
          ["h2-2-5", "النظير الضربي للمصفوفة وأنظمة المعادلات الخطية"],
        ]),
        chapter("h2-ch3", 3, "كثيرات الحدود ودوالها", [
          ["h2-3-1", "الأعداد المركبة"],
          ["h2-3-2", "القانون العام والمميز"],
          ["h2-3-3", "العمليات على كثيرات الحدود"],
          ["h2-3-4", "قسمة كثيرات الحدود"],
          ["h2-3-5", "دوال كثيرات الحدود"],
          ["h2-3-6", "حل معادلات كثيرات الحدود"],
          ["h2-3-7", "نظريتا الباقي والعوامل"],
          ["h2-3-8", "الجذور والأصفار"],
        ]),
        chapter("h2-ch4", 4, "العلاقات والدوال العكسية والجذرية", [
          ["h2-4-1", "العمليات على الدوال"],
          ["h2-4-2", "العلاقات والدوال العكسية"],
          ["h2-4-3", "دوال ومتباينات الجذر التربيعي"],
          ["h2-4-4", "الجذر النوني"],
          ["h2-4-5", "العمليات على العبارات الجذرية"],
          ["h2-4-6", "الأسس النسبية"],
          ["h2-4-7", "حل المعادلات والمتباينات الجذرية"],
        ]),
      ],
    },
    {
      id: "s2",
      name: "الرياضيات 2-2",
      chapters: [
        chapter("h2-ch5", 5, "العلاقات والدوال النسبية", [
          ["h2-5-1", "ضرب العبارات النسبية وقسمتها"],
          ["h2-5-2", "جمع العبارات النسبية وطرحها"],
          ["h2-5-3", "تمثيل دوال المقلوب بيانيًا"],
          ["h2-5-4", "تمثيل الدوال النسبية بيانيًا"],
          ["h2-5-5", "دوال التغير"],
          ["h2-5-6", "حل المعادلات والمتباينات النسبية"],
        ]),
        chapter("h2-ch6", 6, "المتتابعات والمتسلسلات", [
          ["h2-6-1", "المتتابعات بوصفها دوال"],
          ["h2-6-2", "المتتابعات والمتسلسلات الحسابية"],
          ["h2-6-3", "المتتابعات والمتسلسلات الهندسية"],
          ["h2-6-4", "المتسلسلات الهندسية اللانهائية"],
          ["h2-6-5", "نظرية ذات الحدين"],
          ["h2-6-6", "البرهان باستعمال مبدأ الاستقراء الرياضي"],
        ]),
        chapter("h2-ch7", 7, "الاحتمالات", [
          ["h2-7-1", "تمثيل فضاء العينة"],
          ["h2-7-2", "الاحتمال باستعمال التباديل والتوافيق"],
          ["h2-7-3", "الاحتمال الهندسي"],
          ["h2-7-4", "احتمالات الحوادث المستقلة والحوادث غير المستقلة"],
          ["h2-7-5", "احتمالات الحوادث المتنافية"],
        ]),
        chapter("h2-ch8", 8, "حساب المثلثات", [
          ["h2-8-1", "الدوال المثلثية في المثلثات القائمة الزاوية"],
          ["h2-8-2", "الزوايا وقياساتها"],
          ["h2-8-3", "الدوال المثلثية للزوايا"],
          ["h2-8-4", "قانون الجيوب"],
          ["h2-8-5", "قانون جيوب التمام"],
          ["h2-8-6", "الدوال الدائرية"],
          ["h2-8-7", "تمثيل الدوال المثلثية بيانيًا"],
          ["h2-8-8", "الدوال المثلثية العكسية"],
        ]),
      ],
    },
  ],
};

const middleRationalPilot = middleGrade2MathCatalog.semesters[0].chapters[0].lessons.find((lesson) => lesson.id === "m2-1-1");
if (middleRationalPilot) {
  middleRationalPilot.status = "in_review";
  middleRationalPilot.engineLessonId = "m2-1-1";
}

// درس زوايا المضلع الحالي يعود لمقرر الصف الأول الثانوي؛ لا نعيد استخدامه
// داخل ثاني متوسط لمجرد تشابه العنوان.
const middlePolygonLesson = middleGrade2MathCatalog.semesters[0].chapters[4].lessons.find((lesson) => lesson.id === "l-mm6el08l");
if (middlePolygonLesson) {
  middlePolygonLesson.status = "coming_soon";
  middlePolygonLesson.engineLessonId = undefined;
}

export const curriculumCatalogs = [middleGrade2MathCatalog, highGrade2MathCatalog] as const;

export function findCurriculumCatalog(stageSlug: string, gradeId: string, subjectSlug: string) {
  return curriculumCatalogs.find((catalog) => (
    catalog.stageSlug === stageSlug
    && catalog.gradeId === gradeId
    && catalog.subjectSlug === subjectSlug
  ));
}
