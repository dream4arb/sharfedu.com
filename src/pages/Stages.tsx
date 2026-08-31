import { useEffect } from "react";
import { Link } from "wouter";
import { Baby, BookOpen, GraduationCap, Route, Target, ArrowLeft, Clock3 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { setPageMeta } from "@/lib/seo";

const stages = [
  { id: "elementary", name: "المرحلة الابتدائية", subtitle: "الصف الأول إلى السادس", icon: Baby, color: "bg-sky-100 text-sky-700" },
  { id: "middle", name: "المرحلة المتوسطة", subtitle: "أول متوسط إلى ثالث متوسط", icon: BookOpen, color: "bg-emerald-100 text-emerald-700" },
  { id: "high", name: "المرحلة الثانوية", subtitle: "نموذج أول ثانوي متاح الآن", icon: GraduationCap, color: "bg-violet-100 text-violet-700", pilot: true },
  { id: "paths", name: "المسارات", subtitle: "سيضاف بعد اعتماد المحتوى", icon: Route, color: "bg-amber-100 text-amber-700" },
  { id: "qudurat", name: "القدرات والتحصيلي", subtitle: "سيضاف بعد اعتماد المحتوى", icon: Target, color: "bg-rose-100 text-rose-700" },
];

export default function Stages() {
  useEffect(() => {
    setPageMeta({
      title: "المراحل الدراسية - منصة شارف",
      description: "خطة المراحل الدراسية في شارف، مع نموذج تفاعلي متاح حاليًا لدرس زوايا المضلع للمرحلة الثانوية.",
      keywords: "المراحل الدراسية, منهج سعودي, شارف, تعليم تفاعلي",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-cyan-50 to-white px-4 pb-14 pt-32 text-center">
          <p className="text-sm font-black text-cyan-700">المحتوى يضاف تدريجيًا</p>
          <h1 className="mt-3 text-4xl font-black text-slate-950 sm:text-5xl">المراحل الدراسية</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">نبني محرك الدرس أولًا، ثم نعتمد المحتوى التعليمي لكل مرحلة. المراحل غير الجاهزة تظهر بوضوح كـ«قريبًا» ولا تقود إلى صفحات فارغة.</p>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stages.map(({ id, name, subtitle, icon: Icon, color, pilot }) => (
              <article key={id} className={`rounded-3xl border p-6 ${pilot ? "border-cyan-300 bg-cyan-50/50 shadow-sm" : "border-slate-200 bg-white"}`}>
                <div className="flex items-start gap-4">
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon className="h-6 w-6" /></span>
                  <div><h2 className="text-xl font-black text-slate-900">{name}</h2><p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p></div>
                </div>
                {pilot ? (
                  <>
                    <p className="mt-5 rounded-2xl bg-white p-4 text-sm leading-7 text-slate-700">متاح الآن: تجربة «زوايا المضلع» بالرسم التفاعلي وشارف Tutor واختبار الإتقان.</p>
                    <Link href="/lesson/secondary/math/l-mm6el08l"><Button className="mt-4 w-full font-black">ابدأ النموذج <ArrowLeft className="mr-2 h-4 w-4" /></Button></Link>
                  </>
                ) : (
                  <div className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 font-bold text-slate-500"><Clock3 className="h-4 w-4" /> قريبًا</div>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
