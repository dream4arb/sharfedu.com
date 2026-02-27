/**
 * CMS Hierarchy - هيكل المراحل والمواد والفصول والدروس
 * يستخدم في الرفع الذكي وقوائم الاختيار
 */
export const STAGE_NAMES: Record<string, string> = {
  elementary: "الابتدائية",
  middle: "المتوسطة",
  high: "الثانوية",
  paths: "المسارات",
  qudurat: "القدرات والتحصيلي",
};

export interface HierarchyLesson {
  id: string;
  title: string;
}

export interface HierarchyChapter {
  id: string;
  name: string;
  /** رقم الوحدة للعرض (اختياري) */
  number?: number;
  lessons: HierarchyLesson[];
}

export interface HierarchySemester {
  id: string;
  name: string;
  chapters: HierarchyChapter[];
}

export interface HierarchySubject {
  slug: string;
  name: string;
  semesters: HierarchySemester[];
}

/** الصف الدراسي داخل المرحلة - أول متوسط، ثاني ثانوي، إلخ */
export interface HierarchyGrade {
  id: string;
  name: string;
  subjects: HierarchySubject[];
}

export interface HierarchyStage {
  slug: string;
  name: string;
  /** المرحلة > الصف > المادة > الفصل > الوحدة > الدرس */
  grades: HierarchyGrade[];
}

// هيكل افتراضي - يُحمّل من DB عند التشغيل
let currentHierarchy: HierarchyStage[] | null = null;

export function setCurrentHierarchy(h: HierarchyStage[] | null): void {
  currentHierarchy = h;
}

function getHierarchy(): HierarchyStage[] {
  return currentHierarchy ?? CMS_HIERARCHY;
}

/** أسماء الصفوف حسب المرحلة */
export const GRADE_NAMES: Record<string, Record<string, string>> = {
  elementary: { "1": "الصف الأول", "2": "الصف الثاني", "3": "الصف الثالث", "4": "الصف الرابع", "5": "الصف الخامس", "6": "الصف السادس" },
  middle: { "1": "أول متوسط", "2": "ثاني متوسط", "3": "ثالث متوسط" },
  high: { "1": "أول ثانوي", "2": "ثاني ثانوي", "3": "ثالث ثانوي" },
  paths: { general: "المسار العام" },
  qudurat: { general: "القدرات والتحصيلي" },
};

// هيكل افتراضي: المرحلة > الصف > المادة > الفصل > الوحدة > الدرس
export const CMS_HIERARCHY: HierarchyStage[] = [
  {
    slug: "elementary",
    name: "الابتدائية",
    grades: [
      { id: "1", name: "الصف الأول", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "انجليزي", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "2", name: "الصف الثاني", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "انجليزي", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "3", name: "الصف الثالث", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "انجليزي", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "4", name: "الصف الرابع", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "social", name: "الدراسات الاجتماعية", semesters: [] }, { slug: "tajweed", name: "التجويد", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "إنجليزي", semesters: [] }, { slug: "digital", name: "الرقمية", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "5", name: "الصف الخامس", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "social", name: "الدراسات الاجتماعية", semesters: [] }, { slug: "quran", name: "تلاوة القرآن وتجويده", semesters: [] }, { slug: "tajweed", name: "التجويد", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "إنجليزي", semesters: [] }, { slug: "digital", name: "الرقمية", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "6", name: "الصف السادس", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "social", name: "الدراسات الاجتماعية", semesters: [] }, { slug: "quran", name: "تلاوة القرآن وتجويده", semesters: [] }, { slug: "tajweed", name: "التجويد", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "english", name: "إنجليزي", semesters: [] }, { slug: "digital", name: "الرقمية", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
    ],
  },
  {
    slug: "middle",
    name: "المتوسطة",
    grades: [
      {
        id: "1",
        name: "أول متوسط",
        subjects: [
          {
            slug: "math",
            name: "الرياضيات",
            semesters: [
              { id: "s1", name: "الفصل الدراسي الأول", chapters: [{ id: "ch1", name: "الفصل 1", lessons: [{ id: "1", title: "مقدمة في الأعداد" }, { id: "2", title: "الجمع والطرح" }, { id: "3", title: "الضرب والقسمة" }] }] },
              {
                id: "s2",
                name: "الفصل الدراسي الثاني",
                chapters: [
                  { id: "ch4", name: "النسبة والتناسب", lessons: [
                    { id: "m1-4-1", title: "النسبة" }, { id: "m1-4-2", title: "المعدل" }, { id: "m1-4-3", title: "القياس: التحويل بين الوحدات الإنجليزية" },
                    { id: "m1-4-4", title: "القياس: التحويل بين الوحدات المترية" }, { id: "m1-4-5", title: "الجبر: حل التناسبات" }, { id: "m1-4-6", title: "الرسم" }, { id: "m1-4-7", title: "مقياس الرسم" }, { id: "m1-4-8", title: "الكسور والنسب المئوية" },
                  ]},
                  { id: "ch5", name: "تطبيقات النسبة المئوية", lessons: [
                    { id: "m1-5-1", title: "النسبة المئوية من عدد" }, { id: "m1-5-2", title: "تقدير النسبة المئوية" }, { id: "m1-5-3", title: "تحديد معقولية الإجابة" }, { id: "m1-5-4", title: "التناسب المئوي" }, { id: "m1-5-5", title: "تطبيقات على النسبة المئوية" },
                  ]},
                  { id: "ch6", name: "الإحصاء", lessons: [
                    { id: "m1-6-1", title: "التمثيل بالنقاط" }, { id: "m1-6-2", title: "مقاييس النزعة المركزية والمدى" }, { id: "m1-6-3", title: "التمثيل بالأعمدة والمدرجات التكرارية" }, { id: "m1-6-4", title: "استعمال التمثيلات البيانية للتنبؤ" }, { id: "m1-6-5", title: "استعمال التمثيل البياني" },
                  ]},
                ],
              },
            ],
          },
          { slug: "science", name: "العلوم", semesters: [] },
          { slug: "arabic", name: "لغتي", semesters: [] },
          { slug: "english", name: "اللغة الإنجليزية", semesters: [] },
          { slug: "social", name: "الدراسات الاجتماعية", semesters: [] },
          { slug: "tajweed", name: "التجويد", semesters: [] },
          { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] },
          { slug: "digital", name: "الرقمية", semesters: [] },
          { slug: "family", name: "الأسرية", semesters: [] },
          { slug: "art", name: "التربية الفنية", semesters: [] },
          { slug: "fikria", name: "التربية الفكرية", semesters: [] },
        ],
      },
      { id: "2", name: "ثاني متوسط", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "english", name: "اللغة الإنجليزية", semesters: [] }, { slug: "social", name: "الدراسات الاجتماعية", semesters: [] }, { slug: "tajweed", name: "التجويد", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "digital", name: "الرقمية", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "3", name: "ثالث متوسط", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "science", name: "العلوم", semesters: [] }, { slug: "arabic", name: "لغتي", semesters: [] }, { slug: "english", name: "اللغة الإنجليزية", semesters: [] }, { slug: "social", name: "الدراسات الاجتماعية", semesters: [] }, { slug: "tajweed", name: "التجويد", semesters: [] }, { slug: "islamic", name: "الدراسات الإسلامية", semesters: [] }, { slug: "critical", name: "التفكير الناقد", semesters: [] }, { slug: "digital", name: "الرقمية", semesters: [] }, { slug: "family", name: "الأسرية", semesters: [] }, { slug: "art", name: "التربية الفنية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
    ],
  },
  {
    slug: "high",
    name: "الثانوية",
    grades: [
      {
        id: "1",
        name: "أول ثانوي",
        subjects: [
          {
            slug: "math",
            name: "الرياضيات",
            semesters: [
              { id: "s1", name: "الفصل الدراسي الأول", chapters: [
                { id: "ch1", name: "التبرير والبرهان", lessons: [{ id: "intro-1", title: "التهيئة" }, { id: "1-1", title: "التبرير الاستقرائي والتخمين" }, { id: "1-2", title: "المنطق" }, { id: "1-3", title: "العبارات الشرطية" }] },
                { id: "ch2", name: "التوازي والتعامد", lessons: [] },
                { id: "ch3", name: "المثلثات المتطابقة", lessons: [] },
                { id: "ch4", name: "العلاقات في المثلث", lessons: [] },
              ]},
              { id: "s2", name: "الفصل الدراسي الثاني", chapters: [
                { id: "ch5", name: "الأشكال الرباعية", lessons: [{ id: "5-1", title: "زوايا المضلع" }, { id: "5-2", title: "متوازي الأضلاع" }, { id: "5-3", title: "تمييز متوازي الأضلاع" }] },
                { id: "ch6", name: "التشابه", lessons: [{ id: "6-1", title: "المضلعات المتشابهة" }, { id: "6-2", title: "المثلثات المتشابهة" }] },
                { id: "ch7", name: "التحويلات الهندسية والتماثل", lessons: [] },
                { id: "ch8", name: "الدائرة", lessons: [] },
              ]},
            ],
          },
          { slug: "physics", name: "الفيزياء", semesters: [] },
          { slug: "arabic", name: "اللغة العربية", semesters: [] },
          { slug: "english", name: "اللغة الإنجليزية", semesters: [] },
          { slug: "hadith", name: "حديث", semesters: [] },
          { slug: "ecology", name: "علم البيئة", semesters: [] },
          { slug: "digital", name: "الرقمية", semesters: [] },
          { slug: "vocational", name: "التربية المهنية", semesters: [] },
          { slug: "social", name: "الدراسات الاجتماعية", semesters: [] },
          { slug: "financial", name: "المعرفة المالية", semesters: [] },
          { slug: "fikria", name: "التربية الفكرية", semesters: [] },
        ],
      },
      { id: "2", name: "ثاني ثانوي", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "chemistry", name: "الكيمياء", semesters: [] }, { slug: "biology", name: "الأحياء", semesters: [] }, { slug: "arabic", name: "اللغة العربية", semesters: [] }, { slug: "qiraat", name: "قراءات", semesters: [] }, { slug: "tawheed", name: "توحيد", semesters: [] }, { slug: "english", name: "إنجليزي", semesters: [] }, { slug: "financial-mgmt", name: "الإدارة المالية", semesters: [] }, { slug: "arts", name: "الفنون", semesters: [] }, { slug: "business-decision", name: "صناعة القرار في الأعمال", semesters: [] }, { slug: "intro-business", name: "مقدمة في الأعمال", semesters: [] }, { slug: "iot", name: "انترنت الأشياء", semesters: [] }, { slug: "health-sciences", name: "مبادئ العلوم الصحية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }] },
      { id: "3", name: "ثالث ثانوي", subjects: [{ slug: "math", name: "الرياضيات", semesters: [] }, { slug: "physics", name: "الفيزياء", semesters: [] }, { slug: "english", name: "اللغة الإنجليزية", semesters: [] }, { slug: "fiqh", name: "فقه", semesters: [] }, { slug: "chinese", name: "اللغة الصينية", semesters: [] }, { slug: "fikria", name: "التربية الفكرية", semesters: [] }, { slug: "earth-space", name: "علوم الأرض والفضاء", semesters: [] }, { slug: "ai", name: "الذكاء الاصطناعي", semesters: [] }, { slug: "digital-design", name: "التصميم الرقمي", semesters: [] }, { slug: "statistics", name: "الإحصاء", semesters: [] }, { slug: "law", name: "مبادئ القانون", semesters: [] }, { slug: "marketing-planning", name: "تخطيط الحملات التسويقية", semesters: [] }, { slug: "sustainability", name: "التنمية المستدامة", semesters: [] }, { slug: "mgmt-skills", name: "المهارات الإدارية", semesters: [] }, { slug: "writing", name: "الكتابة الوظيفية والإبداعية", semesters: [] }, { slug: "event-mgmt", name: "إدارة الفعاليات", semesters: [] }] },
    ],
  },
  {
    slug: "paths",
    name: "المسارات",
    grades: [
      { id: "general", name: "المسار العام", subjects: [{ slug: "math", name: "الرياضيات العامة", semesters: [] }, { slug: "science", name: "العلوم العامة", semesters: [] }] },
      { id: "cs", name: "علوم الحاسب", subjects: [{ slug: "cs", name: "علوم الحاسب", semesters: [] }] },
      { id: "health", name: "الصحة والحياة", subjects: [{ slug: "health", name: "الصحة والحياة", semesters: [] }] },
      { id: "business", name: "إدارة الأعمال", subjects: [{ slug: "business", name: "إدارة الأعمال", semesters: [] }] },
    ],
  },
  {
    slug: "qudurat",
    name: "القدرات والتحصيلي",
    grades: [
      { id: "qudurat", name: "القدرات", subjects: [{ slug: "verbal", name: "اللفظي", semesters: [] }] },
      { id: "tahsili", name: "التحصيلي", subjects: [{ slug: "tahsili", name: "التحصيلي", semesters: [] }] },
    ],
  },
];

export function getStages(): { slug: string; name: string }[] {
  return getHierarchy().map((s) => ({ slug: s.slug, name: s.name }));
}

/** الصفوف داخل المرحلة - يستخدم الهيكل المُطبَّع لضمان وجود الصفوف ديناميكياً */
export function getGrades(stageSlug: string): { id: string; name: string }[] {
  const normalized = getFullHierarchy();
  const stage = normalized.find((s) => s.slug === stageSlug);
  const grades = stage?.grades ?? [];
  return grades.map((g) => ({ id: g.id, name: g.name }));
}

/** المواد داخل الصف */
export function getSubjects(stageSlug: string, gradeId: string): { slug: string; name: string }[] {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  return grade?.subjects.map((sub) => ({ slug: sub.slug, name: sub.name })) ?? [];
}

export function getSemesters(stageSlug: string, gradeId: string, subjectSlug: string): { id: string; name: string }[] {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  return subject?.semesters.map((sem) => ({ id: sem.id, name: sem.name })) ?? [];
}

export function getChapters(stageSlug: string, gradeId: string, subjectSlug: string, semesterId: string): { id: string; name: string }[] {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  const semester = subject?.semesters.find((s) => s.id === semesterId);
  return semester?.chapters.map((ch) => ({ id: ch.id, name: ch.name })) ?? [];
}

export function getLessons(
  stageSlug: string,
  gradeId: string,
  subjectSlug: string,
  semesterId: string,
  chapterId: string
): { id: string; title: string }[] {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  const semester = subject?.semesters.find((s) => s.id === semesterId);
  const chapter = semester?.chapters.find((c) => c.id === chapterId);
  return chapter?.lessons ?? [];
}

const DEFAULT_SEMESTERS: HierarchySemester[] = [
  { id: "s1", name: "الفصل الدراسي الأول", chapters: [] },
  { id: "s2", name: "الفصل الدراسي الثاني", chapters: [] },
];

const DEFAULT_CHAPTERS: HierarchyChapter[] = [
  { id: "ch1", name: "الوحدة الأولى", lessons: [] },
];

/** ضمان أن كل فصل دراسي يحتوي على وحدة واحدة على الأقل */
function ensureSemesterHasChapters(semester: HierarchySemester): HierarchySemester {
  const chs = semester.chapters ?? [];
  if (chs.length > 0) return semester;
  return { ...semester, chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTERS)) };
}

/** ضمان أن كل مادة تحتوي على الفصلين الدراسيين على الأقل */
function ensureSubjectHasSemesters(subject: HierarchySubject): HierarchySubject {
  const sems = (subject.semesters ?? []).map(ensureSemesterHasChapters);
  if (sems.length > 0) return { ...subject, semesters: sems };
  return {
    ...subject,
    semesters: DEFAULT_SEMESTERS.map((s) => ensureSemesterHasChapters(JSON.parse(JSON.stringify(s)))),
  };
}

/** تطبيع المرحلة لضمان وجود grades (تحويل subjects القديم إن لزم) */
function ensureStageHasGrades(stage: Record<string, unknown>): HierarchyStage {
  const slug = String(stage.slug ?? "");
  const name = String(stage.name ?? "");
  const gradesRaw = stage.grades;
  if (Array.isArray(gradesRaw) && gradesRaw.length > 0) {
    const grades = (gradesRaw as HierarchyGrade[]).map((g) => ({
      ...g,
      subjects: (g.subjects ?? []).map(ensureSubjectHasSemesters),
    }));
    return { slug, name, grades };
  }
  const subjectsRaw = stage.subjects;
  if (!Array.isArray(subjectsRaw)) {
    const defs = GRADE_NAMES[slug];
    const ids = defs ? Object.keys(defs) : ["1"];
    const names = defs ? Object.values(defs) : ["الصف الأول"];
    return { slug, name, grades: ids.map((id, i) => ({ id, name: names[i] ?? id, subjects: [] })) };
  }
  const subjects = (subjectsRaw as HierarchySubject[]).map(ensureSubjectHasSemesters);
  const defs = GRADE_NAMES[slug];
  const ids = defs ? Object.keys(defs) : ["1"];
  const names = defs ? Object.values(defs) : ["الصف الأول"];
  return {
    slug,
    name,
    grades: ids.map((id, i) => ({
      id,
      name: names[i] ?? id,
      subjects: i === 0 ? subjects : subjects.map((s) => ensureSubjectHasSemesters({ ...s, semesters: [] })),
    })),
  };
}

/** إرجاع الهيكل الكامل الحالي (مُطبع دائماً مع grades) */
export function getFullHierarchy(): HierarchyStage[] {
  const raw = getHierarchy();
  return raw.map((s) => ensureStageHasGrades(s as unknown as Record<string, unknown>));
}

/** جميع الدروس المسطحة للبحث السريع */
export function getAllLessons(): {
  lessonId: string;
  title: string;
  stage: string;
  gradeId: string;
  gradeName: string;
  subject: string;
  stageSlug: string;
  subjectSlug: string;
  semesterId: string;
  semesterName: string;
  chapterId: string;
  chapterName: string;
  path: string;
}[] {
  const result: {
    lessonId: string;
    title: string;
    stage: string;
    gradeId: string;
    gradeName: string;
    subject: string;
    stageSlug: string;
    subjectSlug: string;
    semesterId: string;
    semesterName: string;
    chapterId: string;
    chapterName: string;
    path: string;
  }[] = [];
  for (const stage of getHierarchy()) {
    const grades = stage.grades ?? [];
    for (const grade of grades) {
      for (const subject of grade.subjects) {
        for (const semester of subject.semesters) {
          for (const chapter of semester.chapters) {
            for (const lesson of chapter.lessons) {
              result.push({
                lessonId: lesson.id,
                title: lesson.title,
                stage: stage.name,
                gradeId: grade.id,
                gradeName: grade.name,
                subject: subject.name,
                stageSlug: stage.slug,
                subjectSlug: subject.slug,
                semesterId: semester.id,
                semesterName: semester.name,
                chapterId: chapter.id,
                chapterName: chapter.name,
                path: `${stage.name} > ${grade.name} > ${subject.name} > ${semester.name} > ${chapter.name} > ${lesson.title}`,
              });
            }
          }
        }
      }
    }
  }
  return result;
}

export interface SeoPathItem {
  value: string;
  label: string;
  /** نص موسع للبحث بالعربية: مادة، مرحلة، درس، فصل... */
  searchText: string;
  /** تصنيف: "general" | "stage" | "lesson" */
  type: "general" | "stage" | "lesson";
  /** للمجموعات: اسم المادة أو null للصفحات العامة */
  group?: string;
}

/** جميع مسارات الصفحات لاختيار SEO - محرك بحث ذكي */
export function getAllSeoPaths(): SeoPathItem[] {
  const staticPaths: SeoPathItem[] = [
    { value: "/", label: "الرئيسية", searchText: "الرئيسية الصفحة الرئيسية", type: "general", group: "صفحات عامة" },
    { value: "/login", label: "تسجيل الدخول / إنشاء حساب", searchText: "تسجيل الدخول إنشاء حساب التسجيل الدخول", type: "general", group: "صفحات عامة" },
    { value: "/about", label: "من نحن", searchText: "من نحن عن الموقع", type: "general", group: "صفحات عامة" },
    { value: "/dashboard", label: "لوحة التحكم", searchText: "لوحة التحكم لوحة تحكم", type: "general", group: "صفحات عامة" },
    { value: "/admin", label: "لوحة تحكم الإدارة", searchText: "لوحة تحكم الإدارة إدارة المدير", type: "general", group: "صفحات عامة" },
    { value: "/stage/elementary", label: "المرحلة الابتدائية", searchText: "المرحلة الابتدائية ابتدائي", type: "stage", group: "المراحل" },
    { value: "/stage/middle", label: "المرحلة المتوسطة", searchText: "المرحلة المتوسطة متوسط أول متوسط ثاني متوسط", type: "stage", group: "المراحل" },
    { value: "/stage/high", label: "المرحلة الثانوية", searchText: "المرحلة الثانوية ثانوي أول ثانوي ثاني ثانوي", type: "stage", group: "المراحل" },
  ];
  const subjectPathsSet = new Set<string>();
  const subjectPaths: SeoPathItem[] = [];
  const lessons = getAllLessons();
  for (const l of lessons) {
    const subjectKey = `${l.stageSlug}/${l.subjectSlug}`;
    if (!subjectPathsSet.has(subjectKey)) {
      subjectPathsSet.add(subjectKey);
      subjectPaths.push({
        value: `/lesson/${l.stageSlug}/${l.subjectSlug}`,
        label: `${l.subject} — ${l.stage}`,
        searchText: `${l.subject} ${l.stage} ${l.gradeName} مادة`,
        type: "lesson" as const,
        group: `المواد - ${l.stage}`,
      });
    }
  }
  const lessonPaths: SeoPathItem[] = lessons.map((l) => {
    const shortLabel = `${l.title} — ${l.subject} (${l.gradeName} ${l.stage})`;
    const searchText = [l.title, l.subject, l.stage, l.gradeName, l.semesterName, l.chapterName].filter(Boolean).join(" ");
    return {
      value: `/lesson/${l.stageSlug}/${l.subjectSlug}/${l.lessonId}`,
      label: shortLabel,
      searchText,
      type: "lesson" as const,
      group: l.subject,
    };
  });
  return [...staticPaths, ...subjectPaths, ...lessonPaths];
}

/** هيكل العرض للموقع: مرحلة_مادة → فصول ووحدات ودروس (باستخدام أول صف) */
export function getDisplayStructure(): Record<
  string,
  { semesters: { id: string; name: string; chapters: { id: string; name: string; number?: number; lessons: { id: string; title: string }[] }[] }[] }
> {
  const out: Record<string, { semesters: { id: string; name: string; chapters: { id: string; name: string; number?: number; lessons: { id: string; title: string }[] }[] }[] }> = {};
  for (const stage of getFullHierarchy()) {
    const grades = stage.grades ?? [];
    for (const grade of grades) {
      for (const subject of grade.subjects) {
        const key = `${stage.slug}_${subject.slug}`;
        if (out[key]) continue; // استخدم أول صف فقط
        out[key] = {
          semesters: (subject.semesters ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            chapters: (s.chapters ?? []).map((ch) => ({
              id: ch.id,
              name: ch.name,
              number: ch.number,
              lessons: (ch.lessons ?? []).map((l) => ({ id: l.id, title: l.title })),
            })),
          })),
        };
      }
    }
  }
  return out;
}

/** التحقق من أن lesson_id مستخدم في الهيكل */
export function lessonIdExists(lessonId: string): boolean {
  return getAllLessons().some((l) => l.lessonId === lessonId);
}

/** معلومات الدرس بالكامل لملء نموذج التعديل */
export function getLessonFullInfo(lessonId: string): {
  stageSlug: string;
  stageName: string;
  gradeId: string;
  gradeName: string;
  subjectSlug: string;
  subjectName: string;
  semesterId: string;
  semesterName: string;
  chapterId: string;
  chapterName: string;
  lessonTitle: string;
} | null {
  const all = getAllLessons();
  const found = all.find((l) => l.lessonId === lessonId);
  if (!found) return null;
  return {
    stageSlug: found.stageSlug,
    stageName: found.stage,
    gradeId: found.gradeId,
    gradeName: found.gradeName,
    subjectSlug: found.subjectSlug,
    subjectName: found.subject,
    semesterId: found.semesterId,
    semesterName: found.semesterName ?? "—",
    chapterId: found.chapterId,
    chapterName: found.chapterName ?? "—",
    lessonTitle: found.title,
  };
}
