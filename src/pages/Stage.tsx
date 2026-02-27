import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { setPageMeta } from "@/lib/seo";
import { InlineSeoEditor } from "@/components/admin/InlineSeoEditor";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { canAccessStageGrade } from "@/lib/profile";
import { 
  ArrowRight, ArrowLeft, BookOpen, Baby, GraduationCap, Route, Target,
  Calculator, FlaskConical, Globe, Pen, Book, Atom, Languages, History, Palette, Heart, Monitor, Briefcase, DollarSign
} from "lucide-react";
import {
  useAdminStageControls,
  AdminGradeActions,
  AdminAddGradeButton,
  AdminSubjectActions,
  AdminAddSubjectButton,
} from "@/components/admin/AdminStageControls";

const stageData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  gradeHeaderBg: string;
  grades: { id: string; name: string; subjects: { id: string; name: string; icon: React.ElementType }[] }[];
}> = {
  elementary: {
    title: "المرحلة الابتدائية",
    subtitle: "الصف الأول إلى السادس",
    description: "أساسيات التعلم بأسلوب ممتع وتفاعلي للطلاب الصغار",
    icon: Baby,
    gradient: "from-sky-400 to-blue-500",
    bgGradient: "from-sky-50/50 to-blue-50/50",
    gradeHeaderBg: "from-sky-200 to-blue-200",
    grades: [
      { id: "1", name: "الصف الأول ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "4", name: "الصف الرابع ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "5", name: "الصف الخامس ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "quran", name: "تلاوة القرآن وتجويده", icon: BookOpen },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "6", name: "الصف السادس ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "quran", name: "تلاوة القرآن وتجويده", icon: BookOpen },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
    ],
  },
  middle: {
    title: "المرحلة المتوسطة",
    subtitle: "الصف الأول إلى الثالث",
    description: "تعمق في المواد الدراسية الأساسية بأسلوب تفاعلي",
    icon: BookOpen,
    gradient: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-50/50 to-teal-50/50",
    gradeHeaderBg: "from-emerald-200 to-teal-200",
    grades: [
      { id: "1", name: "الصف الأول متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "critical", name: "التفكير الناقد", icon: Target },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
    ],
  },
  high: {
    title: "المرحلة الثانوية",
    subtitle: "الصف الأول إلى الثالث",
    description: "استعد للمرحلة الجامعية بثقة ومحتوى متقدم",
    icon: GraduationCap,
    gradient: "from-violet-400 to-purple-500",
    bgGradient: "from-violet-50/50 to-purple-50/50",
    gradeHeaderBg: "from-violet-200 to-purple-200",
    grades: [
      { id: "1", name: "الصف الأول ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "arabic", name: "اللغة العربية", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "hadith", name: "حديث", icon: Book },
        { id: "ecology", name: "علم البيئة", icon: FlaskConical },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "vocational", name: "التربية المهنية", icon: Briefcase },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "financial", name: "المعرفة المالية", icon: DollarSign },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
        { id: "biology", name: "الأحياء", icon: FlaskConical },
        { id: "arabic", name: "اللغة العربية", icon: Pen },
        { id: "qiraat", name: "قراءات", icon: BookOpen },
        { id: "tawheed", name: "توحيد", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "financial-mgmt", name: "الإدارة المالية", icon: DollarSign },
        { id: "arts", name: "الفنون", icon: Palette },
        { id: "business-decision", name: "صناعة القرار في الأعمال", icon: Briefcase },
        { id: "intro-business", name: "مقدمة في الأعمال", icon: Briefcase },
        { id: "iot", name: "انترنت الأشياء", icon: Monitor },
        { id: "health-sciences", name: "مبادئ العلوم الصحية", icon: FlaskConical },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "fiqh", name: "فقه", icon: Book },
        { id: "chinese", name: "اللغة الصينية", icon: Languages },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
        { id: "earth-space", name: "علوم الأرض والفضاء", icon: FlaskConical },
        { id: "ai", name: "الذكاء الاصطناعي", icon: Atom },
        { id: "digital-design", name: "التصميم الرقمي", icon: Monitor },
        { id: "statistics", name: "الإحصاء", icon: Calculator },
        { id: "law", name: "مبادئ القانون", icon: Book },
        { id: "marketing-planning", name: "تخطيط الحملات التسويقية", icon: Briefcase },
        { id: "sustainability", name: "التنمية المستدامة", icon: Globe },
        { id: "mgmt-skills", name: "المهارات الإدارية", icon: Briefcase },
        { id: "writing", name: "الكتابة الوظيفية والإبداعية", icon: Pen },
        { id: "event-mgmt", name: "إدارة الفعاليات", icon: Briefcase },
      ]},
    ],
  },
  paths: {
    title: "المسارات",
    subtitle: "المسارات الأكاديمية والتخصصية",
    description: "اختر مسارك التخصصي المناسب لميولك ومستقبلك",
    icon: Route,
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-50/50 to-orange-50/50",
    gradeHeaderBg: "from-amber-200 to-orange-200",
    grades: [
      { id: "general", name: "المسار العام", subjects: [
        { id: "math", name: "الرياضيات العامة", icon: Calculator },
        { id: "science", name: "العلوم العامة", icon: FlaskConical },
      ]},
      { id: "cs", name: "مسار علوم الحاسب والهندسة", subjects: [
        { id: "programming", name: "البرمجة", icon: Book },
        { id: "math", name: "الرياضيات المتقدمة", icon: Calculator },
      ]},
      { id: "health", name: "مسار الصحة والحياة", subjects: [
        { id: "biology", name: "الأحياء", icon: FlaskConical },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
      ]},
      { id: "business", name: "مسار إدارة الأعمال", subjects: [
        { id: "accounting", name: "المحاسبة", icon: Calculator },
        { id: "management", name: "الإدارة", icon: Book },
      ]},
      { id: "shariah", name: "مسار الشريعة", subjects: [
        { id: "fiqh", name: "الفقه", icon: Book },
        { id: "tafseer", name: "التفسير", icon: Book },
      ]},
    ],
  },
  qudurat: {
    title: "القدرات والتحصيلي",
    subtitle: "اختبارات القياس",
    description: "تحضير مكثف لاختبارات القدرات والتحصيل الدراسي",
    icon: Target,
    gradient: "from-rose-400 to-pink-500",
    bgGradient: "from-rose-50/50 to-pink-50/50",
    gradeHeaderBg: "from-rose-200 to-pink-200",
    grades: [
      { id: "qudurat", name: "اختبار القدرات العامة", subjects: [
        { id: "verbal", name: "القسم اللفظي", icon: Pen },
        { id: "quantitative", name: "القسم الكمي", icon: Calculator },
      ]},
      { id: "tahsili", name: "اختبار التحصيل الدراسي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
        { id: "biology", name: "الأحياء", icon: FlaskConical },
      ]},
      { id: "step", name: "اختبار STEP", subjects: [
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
      ]},
    ],
  },
};

export default function Stage() {
  const { stageId } = useParams<{ stageId: string }>();
  const { user } = useAuth();
  const [, setVersion] = useState(0);
  const stage = stageData[stageId || ""] || stageData.middle;
  const StageIcon = stage.icon;
  const profileComplete = !!user;

  const { isAdmin, handlers: adminHandlers, ModalComponent: AdminModal } = useAdminStageControls(() => setVersion((v) => v + 1));

  const stageUrlMap: Record<string, string> = {
    elementary: "primary",
    middle: "middle",
    high: "secondary",
  };
  const urlStage = stageUrlMap[stageId || ""] || stageId || "primary";

  useEffect(() => {
    if (!stage) return;
    const autoTitle = `${stage.title} - ${stage.subtitle}`;
    const autoDesc = `${stage.title} في منصة شارف التعليمية. ${stage.description}. شرح تفاعلي وملخصات واختبارات لجميع المواد الدراسية.`;
    const autoKw = `${stage.title}, دروس ${stage.title}, مواد ${stage.title}, شرح ${stage.title}, منصة شارف`;
    const path = `/stage/${stageId}`;
    fetch(`/api/seo?path=${encodeURIComponent(path)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && (data.title || data.description)) {
          setPageMeta({
            title: data.title || autoTitle,
            description: data.description || autoDesc,
            keywords: data.keywords || autoKw,
            ogTitle: data.ogTitle,
            ogDescription: data.ogDescription,
            ogImage: data.ogImage,
          });
        } else {
          setPageMeta(autoTitle, autoDesc, autoKw);
        }
      })
      .catch(() => setPageMeta(autoTitle, autoDesc, autoKw));
  }, [stageId, stage]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <AdminModal />
      <Navbar />
      <main className="pb-20 bg-white dark:bg-background">
        {/* Hero - تصميم عصري مع تأثير زجاجي */}
        <div className={`relative overflow-hidden bg-gradient-to-br ${stage.bgGradient} pb-16`} style={{ paddingTop: "200px" }}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,255,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.08),transparent_50%)]" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/90 mb-10">
              <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">الرئيسية</Link>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-foreground font-medium">{stage.title}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br ${stage.gradient} text-white shadow-2xl shadow-black/15 shrink-0 ring-4 ring-white/20`}>
                <StageIcon className="w-12 h-12" />
              </div>
              <div className="text-center md:text-right">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-l from-foreground to-foreground/80">{stage.title}</h1>
                <p className="text-lg text-muted-foreground mb-2 font-medium">{stage.subtitle}</p>
                <p className="text-muted-foreground/90 max-w-xl">{stage.description}</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* المواد - تصميم بطاقات زجاجية عصري */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10">
          <div className="space-y-8">
            {stage.grades.map((grade, gradeIndex) => {
              const gradeLocked = profileComplete && !canAccessStageGrade(stageId || "", grade.id, user);
              return (
                <motion.section
                  key={grade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gradeIndex * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`rounded-3xl overflow-hidden backdrop-blur-xl ${gradeLocked ? "bg-muted/30 dark:bg-muted/10" : "bg-white/80 dark:bg-card/90 shadow-xl shadow-black/5 border border-white/60 dark:border-white/5"}`}
                >
                  <div className={`px-6 sm:px-8 py-5 flex items-center justify-between relative overflow-hidden ${gradeLocked ? "bg-muted/40 border-b border-muted" : stageId === "elementary" 
                    ? `border-b border-white/20 bg-gradient-to-br ${stage.gradient} shadow-lg shadow-sky-500/20` 
                    : `bg-gradient-to-l ${stage.gradeHeaderBg} dark:bg-muted/30 border-b border-black/5 dark:border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}`}>
                    <div className="flex items-center gap-4">
                      {stageId === "elementary" && !gradeLocked && (
                        <div className={`w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0`}>
                          {grade.id}
                        </div>
                      )}
                      <h2 className={`text-lg font-bold ${gradeLocked ? "text-muted-foreground" : stageId === "elementary" ? "text-white" : "text-foreground"}`}>{grade.name}</h2>
                      {isAdmin && (
                        <AdminGradeActions
                          stageSlug={stageId || "middle"}
                          gradeId={grade.id}
                          gradeName={grade.name}
                          onEdit={adminHandlers.editGrade}
                          onDelete={adminHandlers.deleteGrade}
                        />
                      )}
                    </div>
                    {gradeLocked && (
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5">
                        <Lock className="w-3.5 h-3.5" />
                        مقفل
                      </span>
                    )}
                  </div>
                  <div className="p-5 sm:p-7">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                      {grade.subjects.map((subject, subIndex) => {
                        const SubjectIcon = subject.icon;
                        const subjectHref = `/lesson/${urlStage}/${subject.id}`;
                        
                        if (gradeLocked) {
                          return (
                            <div
                              key={subject.id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-muted/50 bg-muted/5 opacity-60 cursor-not-allowed"
                            >
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/40 text-muted-foreground shrink-0">
                                <SubjectIcon className="w-6 h-6" />
                              </div>
                              <h3 className="font-semibold text-sm text-muted-foreground line-clamp-2">{subject.name}</h3>
                              <Lock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                            </div>
                          );
                        }
                        
                        return (
                          <Link
                            key={subject.id}
                            href={subjectHref}
                            data-testid={`link-subject-${grade.id}-${subject.id}`}
                            className="block"
                            onClick={() => {
                              sessionStorage.setItem("lesson_grade", grade.id);
                              sessionStorage.setItem("lesson_stage", stageId || "");
                            }}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: gradeIndex * 0.06 + subIndex * 0.015, duration: 0.35 }}
                              whileHover={{ y: -4, transition: { duration: 0.2 } }}
                              whileTap={{ scale: 0.98 }}
                              className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-transparent hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer overflow-hidden min-w-0"
                            >
                              {isAdmin && (
                                <AdminSubjectActions
                                  stageSlug={stageId || "middle"}
                                  gradeId={grade.id}
                                  subjectSlug={subject.id}
                                  subjectName={subject.name}
                                  onEdit={adminHandlers.editSubject}
                                  onDelete={adminHandlers.deleteSubject}
                                />
                              )}
                              <div className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                              <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.gradient} text-white shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                                <SubjectIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                              </div>
                              <div className="relative flex-1 min-w-0">
                                <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">{subject.name}</h3>
                                <span className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  الدخول
                                  <ArrowLeft className="w-3 h-3" />
                                </span>
                              </div>
                            </motion.div>
                          </Link>
                        );
                      })}
                      {isAdmin && (
                        <AdminAddSubjectButton
                          stageSlug={stageId || "middle"}
                          gradeId={grade.id}
                          onAdd={adminHandlers.addSubject}
                        />
                      )}
                    </div>
                  </div>
                </motion.section>
              );
            })}
            {isAdmin && (
              <AdminAddGradeButton
                stageSlug={stageId || "middle"}
                onAdd={adminHandlers.addGrade}
              />
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <InlineSeoEditor
            pagePath={`/stage/${stageId}`}
            autoTitle={`${stage.title} - ${stage.subtitle}`}
            autoDescription={`${stage.title} في منصة شارف التعليمية. ${stage.description}. شرح تفاعلي وملخصات واختبارات لجميع المواد الدراسية.`}
            autoKeywords={`${stage.title}, دروس ${stage.title}, مواد ${stage.title}, منصة شارف`}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
