import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { findCurriculumCatalog, type CurriculumContentStatus } from "@shared/curriculum/catalog";
import { usePublicStructure, type DisplayLesson } from "@/hooks/use-public-structure";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setPageMeta } from "@/lib/seo";

const statusMeta: Record<CurriculumContentStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  ready: { label: "متاح الآن", classes: "bg-emerald-50 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  in_review: { label: "نسخة تجريبية", classes: "bg-amber-50 text-amber-800 border-amber-200", icon: Sparkles },
  coming_soon: { label: "قريبًا", classes: "bg-slate-100 text-slate-500 border-slate-200", icon: LockKeyhole },
};

function LessonRow({ lesson, index }: { lesson: DisplayLesson; index: number }) {
  const status = lesson.status ?? "coming_soon";
  const meta = statusMeta[status];
  const StatusIcon = meta.icon;
  const href = lesson.engineLessonId ? `/learn/${lesson.engineLessonId}` : null;
  const content = (
    <div className={`group flex min-h-20 items-center gap-3 rounded-2xl border p-3.5 transition sm:p-4 ${href ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md" : "border-slate-200 bg-slate-50/70"}`}>
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${href ? "bg-cyan-800 text-white" : "bg-slate-200 text-slate-500"}`}>{index + 1}</span>
      <div className="min-w-0 flex-1">
        <h3 className={`text-sm font-black leading-6 sm:text-base ${href ? "text-slate-950" : "text-slate-600"}`}>{lesson.title}</h3>
        {href && <p className="mt-0.5 text-xs text-slate-500">شرح تفاعلي · معلم شارف · اختبار إتقان</p>}
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-black ${meta.classes}`}>
        <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
      </span>
      {href && <ArrowLeft className="hidden h-5 w-5 shrink-0 text-cyan-800 sm:block" />}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export default function CurriculumSubject() {
  const { stage, grade, subject } = useParams<{ stage: string; grade: string; subject: string }>();
  const catalog = findCurriculumCatalog(stage ?? "", grade ?? "", subject ?? "");
  const { displayStructure } = usePublicStructure();
  const structure = displayStructure[`${stage}_${grade}_${subject}`];
  const [semesterId, setSemesterId] = useState("s1");

  useEffect(() => {
    if (!catalog) return;
    sessionStorage.setItem("lesson_grade", catalog.gradeId);
    sessionStorage.setItem("lesson_stage", catalog.stageSlug);
    setPageMeta({
      title: `${catalog.title} | شارف`,
      description: `فهرس ${catalog.title} من المصدر الرسمي، مع توضيح الدروس المتاحة وقيد التجهيز دون صفحات فارغة.`,
      keywords: `${catalog.title}, منصة شارف, منهج السعودية, رياضيات`,
    });
  }, [catalog]);

  const semesters = structure?.semesters ?? catalog?.semesters ?? [];
  const activeSemester = semesters.find((semester) => semester.id === semesterId) ?? semesters[0];
  const counts = useMemo(() => {
    const lessons = semesters.flatMap((semester) => semester.chapters.flatMap((chapter) => chapter.lessons));
    return {
      all: lessons.length,
      ready: lessons.filter((lesson) => lesson.status === "ready").length,
      review: lessons.filter((lesson) => lesson.status === "in_review").length,
    };
  }, [semesters]);

  if (!catalog) {
    return (
      <div dir="rtl" className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-32 text-center">
          <BookOpen className="mx-auto h-14 w-14 text-slate-400" />
          <h1 className="mt-4 text-2xl font-black">هذه المادة لم تدخل مرحلة البناء بعد</h1>
          <p className="mt-2 text-slate-600">نبدأ حاليًا برياضيات ثاني متوسط ورياضيات ثاني ثانوي.</p>
          <Link href={`/stage/${stage}`} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-cyan-800 px-5 font-black text-white"><ArrowRight className="h-5 w-5" /> العودة للمرحلة</Link>
        </main>
      </div>
    );
  }

  const source = catalog.sources[(activeSemester?.id === "s2" ? "s2" : "s1")];

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7fafb] text-slate-950">
      <Navbar />
      <main className="pb-20 pt-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500" aria-label="مسار الصفحة">
            <Link href="/" className="hover:text-cyan-800">الرئيسية</Link><ArrowLeft className="h-4 w-4" />
            <Link href={`/stage/${catalog.stageSlug}`} className="hover:text-cyan-800">{catalog.stageSlug === "middle" ? "المرحلة المتوسطة" : "المرحلة الثانوية"}</Link><ArrowLeft className="h-4 w-4" />
            <span className="font-bold text-slate-800">{catalog.title}</span>
          </nav>

          <section className="overflow-hidden rounded-[2rem] bg-gradient-to-l from-cyan-900 via-cyan-800 to-slate-900 p-6 text-white shadow-xl sm:p-9">
            <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="flex items-center gap-2 text-sm font-bold text-cyan-200"><GraduationCap className="h-5 w-5" /> منهج سعودي موثّق</p>
                <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">{catalog.title}</h1>
                <p className="mt-3 max-w-3xl leading-8 text-slate-200">نعرض الفهرس الحقيقي للمقرر كاملًا، ونفتح فقط الدروس التي اكتمل بناؤها واختبارها. لن تدخل إلى صفحة فارغة.</p>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-3 backdrop-blur">
                <div className="min-w-20 text-center"><span className="block text-2xl font-black">{counts.all}</span><span className="text-xs text-cyan-100">درسًا في المقرر</span></div>
                <div className="min-w-20 border-x border-white/15 text-center"><span className="block text-2xl font-black">{counts.ready}</span><span className="text-xs text-cyan-100">متاح</span></div>
                <div className="min-w-20 text-center"><span className="block text-2xl font-black">{counts.review}</span><span className="text-xs text-cyan-100">تجريبي</span></div>
              </div>
            </div>
          </section>

          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <section>
              <div className="mb-5 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2" role="tablist" aria-label="أجزاء المقرر">
                {semesters.map((semester) => (
                  <button key={semester.id} type="button" role="tab" aria-selected={semester.id === activeSemester?.id} onClick={() => setSemesterId(semester.id)} className={`min-h-11 flex-1 whitespace-nowrap rounded-xl px-4 font-black transition ${semester.id === activeSemester?.id ? "bg-cyan-800 text-white" : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-900"}`}>{semester.name}</button>
                ))}
              </div>

              <div className="space-y-5">
                {activeSemester?.chapters.map((chapter, chapterIndex) => (
                  <motion.section key={chapter.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: chapterIndex * 0.04 }} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 font-black text-violet-800">{chapter.number ?? chapterIndex + 1}</span>
                      <div><p className="text-xs font-black text-violet-700">الفصل {chapter.number ?? chapterIndex + 1}</p><h2 className="text-lg font-black sm:text-xl">{chapter.name}</h2></div>
                    </div>
                    <div className="grid gap-2.5 xl:grid-cols-2">
                      {chapter.lessons.map((lesson, lessonIndex) => <LessonRow key={lesson.id} lesson={lesson} index={lessonIndex} />)}
                    </div>
                  </motion.section>
                ))}
              </div>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-24">
              <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="flex items-center gap-2 text-sm font-black text-emerald-800"><ShieldCheck className="h-5 w-5" /> مصدر المقرر</p>
                <h2 className="mt-2 font-black leading-7 text-emerald-950">{source.title}</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-900">تم التحقق من وجوده في بوابة مدرستي بتاريخ {source.verifiedAt}. نعتمد النسخة المنشورة حاليًا في البوابة.</p>
                <a href={source.officialPageUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 text-sm font-black text-white">افتح المصدر الرسمي <ExternalLink className="h-4 w-4" /></a>
              </section>
              <section className="rounded-3xl border border-slate-200 bg-white p-5">
                <p className="flex items-center gap-2 font-black"><Clock3 className="h-5 w-5 text-cyan-700" /> معنى الحالات</p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                  <li><strong className="text-emerald-700">متاح:</strong> درس تفاعلي مكتمل ويمكنك البدء به.</li>
                  <li><strong className="text-amber-700">نسخة تجريبية:</strong> جاهز لتجربتك على Staging قبل الاعتماد.</li>
                  <li><strong className="text-slate-600">قريبًا:</strong> اسمه مثبت في المنهج لكن محتواه لم يُنشر بعد.</li>
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
