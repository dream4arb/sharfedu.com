import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Bot, BrainCircuit, ChartNoAxesColumnIncreasing, Check, MousePointer2, Shapes } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { setPageMeta } from "@/lib/seo";

const capabilities = [
  {
    icon: MousePointer2,
    title: "رحلة تعلم نشطة",
    description: "يتقدم الطالب خطوة بخطوة، ويجيب ويحاول ويحصل على تغذية راجعة قبل الانتقال.",
  },
  {
    icon: Shapes,
    title: "رسومات رياضية تفاعلية",
    description: "مكوّنات SVG واضحة وقابلة للتفاعل بدل الاعتماد على صور ثابتة يصعب فهمها على الجوال.",
  },
  {
    icon: Bot,
    title: "شارف Tutor",
    description: "معلم افتراضي مرتبط بأهداف الدرس ومحتواه ومحاولات الطالب، ويستخدم أسئلة وتلميحات متدرجة.",
  },
  {
    icon: BrainCircuit,
    title: "سياق معرفي لكل درس",
    description: "إجابات المعلم تنطلق من حقائق وأمثلة محددة لكل درس، وإذا لم تكفِ المعلومات لا يخترع إجابة.",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "إتقان حسب المهارة",
    description: "يحوّل المحاولات والتلميحات إلى تقرير واضح يحدد ما أتقنه الطالب وما يحتاج إلى مراجعة.",
  },
];

const availableNow = [
  "النموذج التفاعلي الكامل لدرس زوايا المضلع",
  "رسم تقسيم المضلع إلى مثلثات",
  "أسئلة اختيار ورقم وترتيب وكتابة قصيرة",
  "تغذية راجعة تشخّص الأخطاء الشائعة",
  "معلم شارف المرتبط بسياق الدرس",
  "اختبار نهائي وتقرير إتقان للمهارات",
];

export default function Features() {
  useEffect(() => {
    setPageMeta({
      title: "كيف يتعلم الطالب في شارف؟",
      description: "تجربة شارف التفاعلية: شرح ورسوم وتمارين ومعلم افتراضي وتقرير إتقان داخل رحلة تعلم عربية واحدة.",
      keywords: "شارف, تعليم تفاعلي, معلم افتراضي, رياضيات, منهج سعودي",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-cyan-50 to-white px-4 pb-16 pt-32 text-center">
          <p className="text-sm font-black text-cyan-700">Sharaf 2.0</p>
          <h1 className="mx-auto mt-3 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-6xl">من القراءة إلى تجربة تعلم فعلية</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">نجمع الشرح والرسم والمحاولة والتغذية الراجعة والمعلم الافتراضي في مسار واحد. نبدأ بدرس واحد متقن، ثم نوسّع المحتوى تدريجيًا.</p>
          <Link href="/lesson/secondary/math/l-mm6el08l">
            <Button size="lg" className="mt-8 rounded-full font-black">جرّب درس زوايا المضلع <ArrowLeft className="mr-2 h-5 w-5" /></Button>
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-800"><Icon className="h-6 w-6" /></span>
                <h2 className="mt-5 text-xl font-black text-slate-900">{title}</h2>
                <p className="mt-2 leading-7 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-16 text-white">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-black text-cyan-300">المتاح في النسخة التجريبية الحالية</p>
              <h2 className="mt-3 text-3xl font-black">وظائف حقيقية، بلا أرقام تسويقية مختلقة</h2>
              <p className="mt-4 leading-8 text-slate-300">المحتوى ما يزال محدودًا عمدًا بينما نثبت جودة محرك الدرس. لن نعرض درسًا فارغًا على أنه مكتمل، ولن ننسب محتوى إلى معلم قبل اعتماده.</p>
            </div>
            <ul className="space-y-3">
              {availableNow.map((item) => <li key={item} className="flex gap-3 rounded-2xl bg-white/5 p-4 leading-7"><Check className="mt-1 h-5 w-5 shrink-0 text-emerald-300" />{item}</li>)}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
