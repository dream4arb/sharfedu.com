import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setPageMeta } from "@/lib/seo";
import {
  Sparkles, Brain, BarChart3, BookOpen, Shield, Zap,
  Check, X, ArrowLeft, Star, ChevronLeft,
  GraduationCap, Target, Users, TrendingUp, Award,
  Video, Lightbulb, Rocket
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const mainFeatures = [
  {
    icon: Brain,
    title: "ذكاء اصطناعي تعليمي",
    desc: "يُحلل مستوى الطالب ويُخصص المحتوى تلقائياً باستخدام نماذج Gemini المتقدمة. يتكيّف مع نقاط القوة والضعف لكل طالب ويقدم خطة تعلّم مخصصة.",
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    stats: "تعلم ذكي",
    details: ["تحليل مستوى فوري", "مسار تعلّم مخصص", "تقييم ذكي مستمر"]
  },
  {
    icon: Sparkles,
    title: "توليد دروس تلقائي من PDF",
    desc: "ارفع ملف PDF لأي درس وسيُنشئ الذكاء الاصطناعي صفحة شرح تفاعلية كاملة مع رسوم بيانية وأشكال SVG هندسية واختبارات تفاعلية فورية.",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    stats: "شارف AI",
    details: ["رسوم بيانية تلقائية", "أشكال هندسية SVG", "اختبارات تفاعلية"]
  },
  {
    icon: Video,
    title: "دروس مصورة احترافية",
    desc: "أكثر من 500 درس فيديو عالي الجودة معدّة بعناية من نخبة المعلمين المعتمدين. كل درس مقسّم لأجزاء قصيرة سهلة الاستيعاب مع أمثلة تطبيقية.",
    color: "from-blue-500 to-cyan-500",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    stats: "500+ درس",
    details: ["فيديو HD", "أمثلة تطبيقية", "إعادة مشاهدة غير محدودة"]
  },
  {
    icon: BarChart3,
    title: "تتبع الأداء المتقدم",
    desc: "لوحة تحكم متكاملة تعرض تقدم الطالب في كل مادة ودرس مع إحصائيات مرئية ورسوم بيانية تفاعلية ونسب إنجاز دقيقة.",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    stats: "تتبع مستمر",
    details: ["رسوم بيانية تفاعلية", "تقارير أسبوعية", "نسب إنجاز مفصّلة"]
  },
  {
    icon: BookOpen,
    title: "مناهج سعودية محدّثة K-12",
    desc: "محتوى تعليمي يغطي جميع المراحل من الابتدائية حتى الثانوية بما يتوافق مع أحدث المنهج السعودي — مع دعم مسارات القدرات والتحصيلي.",
    color: "from-rose-500 to-pink-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    stats: "جميع المراحل",
    details: ["المنهج السعودي كاملاً", "5 مراحل دراسية", "القدرات والتحصيلي"]
  },
  {
    icon: Shield,
    title: "بيئة آمنة وموثوقة",
    desc: "منصة مصممة بمعايير أمان عالية مع حماية بيانات الطلاب وتجربة تعليمية خالية من المحتوى غير المناسب. متاحة 24/7 من أي جهاز.",
    color: "from-cyan-500 to-teal-500",
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    stats: "24/7",
    details: ["حماية بيانات الطلاب", "محتوى آمن 100%", "يعمل على جميع الأجهزة"]
  }
];

const circleStats = [
  { label: "نسبة تحسن الطلاب", value: 87, color: "#0d9488" },
  { label: "رضا أولياء الأمور", value: 94, color: "#0891b2" },
  { label: "معدل إكمال الدروس", value: 78, color: "#7c3aed" },
  { label: "تفوق على الطرق التقليدية", value: 65, color: "#f59e0b" },
];

const barChartData = [
  { label: "الرياضيات", before: 55, after: 88, color: "#0d9488" },
  { label: "العلوم", before: 60, after: 85, color: "#0891b2" },
  { label: "العربية", before: 65, after: 90, color: "#7c3aed" },
  { label: "الإنجليزية", before: 50, after: 82, color: "#f59e0b" },
];

const comparisonItems = [
  { feature: "شرح تفاعلي بالذكاء الاصطناعي", sharaf: true, traditional: false },
  { feature: "توليد دروس تلقائي من PDF", sharaf: true, traditional: false },
  { feature: "محتوى مخصص لمستوى كل طالب", sharaf: true, traditional: false },
  { feature: "رسوم بيانية وأشكال هندسية تلقائية", sharaf: true, traditional: false },
  { feature: "اختبارات تفاعلية فورية مع تصحيح", sharaf: true, traditional: false },
  { feature: "تتبع التقدم والأداء المتقدم", sharaf: true, traditional: false },
  { feature: "متاح 24/7 من أي مكان وأي جهاز", sharaf: true, traditional: false },
  { feature: "تفاعل مباشر مع المعلم", sharaf: false, traditional: true, sharafComingSoon: true },
];

const steps = [
  { num: 1, title: "سجّل حسابك مجاناً", desc: "إنشاء حساب بسيط وسريع خلال دقيقة واحدة فقط. اختر مرحلتك الدراسية وابدأ فوراً.", icon: Users },
  { num: 2, title: "اختر مرحلتك ومادتك", desc: "تصفح المراحل الدراسية واختر المادة التي تريد تعلمها. المحتوى منظم بشكل بسيط وواضح.", icon: Target },
  { num: 3, title: "تعلّم بالذكاء الاصطناعي", desc: "استمتع بشرح تفاعلي مدعوم بالذكاء الاصطناعي مع رسوم بيانية وأشكال هندسية ومحتوى مخصص.", icon: Brain },
  { num: 4, title: "اختبر نفسك وتفوق", desc: "حل اختبارات تفاعلية فورية لقياس فهمك واحصل على تقييم مباشر مع شرح لكل إجابة.", icon: TrendingUp },
];

const testimonials = [
  { name: "احمد السيد", grade: "الصف الثالث متوسط", text: "ارتفع معدلي من 78% إلى 95% خلال فصل دراسي واحد! الشروحات واضحة جداً والاختبارات ساعدتني أفهم نقاط ضعفي.", rating: 5, avatar: "أ" },
  { name: "نورة الشمري", grade: "الصف الأول ثانوي", text: "أفضل منصة تعليمية استخدمتها. الملخصات الذكية وفرت عليّ ساعات طويلة وساعدتني في فهم المواد الصعبة.", rating: 5, avatar: "ن" },
  { name: "محمد القحطاني", grade: "تحضيري قدرات", text: "حصلت على درجة 94 في اختبار القدرات بفضل التدريبات المكثفة والشروحات الممتازة. أنصح الجميع بشارف.", rating: 5, avatar: "م" },
  { name: "سارة محمد", grade: "ولي أمر", text: "كأم، أقدّر إن المنصة آمنة ومحتواها موثوق. أولادي صاروا يحبون المذاكرة عبر شارف بدل الكتب التقليدية.", rating: 4, avatar: "س" },
];

const pieSegments = [
  { label: "دروس فيديو", percent: 35, color: "#0891b2" },
  { label: "شرح AI تفاعلي", percent: 30, color: "#0d9488" },
  { label: "اختبارات", percent: 20, color: "#7c3aed" },
  { label: "تتبع الأداء", percent: 15, color: "#f59e0b" },
];

function CircleProgress({ value, color, size = 110 }: { value: number; color: string; size?: number }) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="mx-auto" role="img" aria-label={`${value}%`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-border/40" />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ}
        whileInView={{ strokeDashoffset: offset }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform={`rotate(-90 ${size/2} ${size/2})`}
      />
      <text x={size/2} y={size/2} textAnchor="middle" dy="0.35em" fill={color} fontSize="24" fontWeight="900" fontFamily="Tajawal">
        {value}%
      </text>
    </svg>
  );
}

function PieChart() {
  let cumulative = 0;
  const segments = pieSegments.map((seg) => {
    const start = cumulative;
    cumulative += seg.percent;
    return { ...seg, start, end: cumulative };
  });
  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56 drop-shadow-lg" role="img" aria-label="رسم بياني دائري يوضح توزيع المحتوى التعليمي">
        {segments.map((seg, i) => {
          const startAngle = (seg.start / 100) * 360 - 90;
          const endAngle = (seg.end / 100) * 360 - 90;
          const largeArc = seg.percent > 50 ? 1 : 0;
          const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
          const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
          const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
          return (
            <motion.path
              key={i}
              d={`M100,100 L${x1},${y1} A80,80 0 ${largeArc},1 ${x2},${y2} Z`}
              fill={seg.color}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              viewport={{ once: true }}
              className="cursor-pointer"
            />
          );
        })}
        <circle cx="100" cy="100" r="40" className="fill-white dark:fill-card" />
        <text x="100" y="96" textAnchor="middle" className="fill-foreground" fontSize="13" fontWeight="800">محتوى</text>
        <text x="100" y="112" textAnchor="middle" className="fill-muted-foreground" fontSize="11">متكامل</text>
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {pieSegments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label} ({seg.percent}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Features() {
  useEffect(() => {
    setPageMeta(
      "مميزات منصة شارف التعليمية | لماذا تختار شارف؟",
      "اكتشف مميزات منصة شارف التعليمية: ذكاء اصطناعي، توليد دروس تلقائي، اختبارات تفاعلية، تتبع الأداء لجميع المراحل الدراسية السعودية K-12",
      "مميزات شارف، منصة تعليمية، ذكاء اصطناعي، اختبارات، المنهج السعودي، K-12"
    );
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-cyan-600 to-blue-700" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="100,50 170,150 30,150" fill="white"/>
            <polygon points="300,400 380,400 380,480 300,480" fill="white" transform="rotate(20 340 440)"/>
            <polygon points="900,80 970,80 1000,130 970,180 900,180 870,130" fill="white"/>
            <circle cx="600" cy="120" r="50" fill="white"/>
            <circle cx="800" cy="450" r="70" fill="white"/>
            <polygon points="500,350 560,300 620,350 600,420 520,420" fill="white"/>
            <polygon points="1050,250 1110,250 1140,300 1110,350 1050,350 1020,300" fill="white"/>
            <polygon points="150,350 220,300 290,350 270,420 170,420" fill="white"/>
          </svg>
          <div className="absolute top-20 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-5 py-2 rounded-full text-white font-bold text-sm mb-6" data-testid="badge-features">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                مدعوم بالذكاء الاصطناعي
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight mb-5"
              data-testid="text-features-title"
            >
              كل ما تحتاجه للتفوق{" "}
              <span className="relative inline-block">
                في مكان واحد
                <svg className="absolute -bottom-4 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C40 2 160 2 198 8" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round"/>
                </svg>
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
              className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed"
              data-testid="text-features-subtitle"
            >
              منصة تعليمية سعودية تجمع بين الذكاء الاصطناعي والمحتوى التفاعلي لتوفير تجربة تعلّم فريدة تُساعد طلاب K-12 على التفوق الدراسي
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10"
            >
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold rounded-full px-8 shadow-xl shadow-black/15 text-base gap-2" data-testid="button-features-register">
                  <ArrowLeft className="w-5 h-5" />
                  ابدأ مجاناً الآن
                </Button>
              </Link>
              <a href="#main-features">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-bold rounded-full px-8 text-base gap-2" data-testid="button-features-explore">
                  <ChevronLeft className="w-5 h-5" />
                  استكشف المميزات
                </Button>
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap justify-center gap-3 sm:gap-5"
            >
              {[
                { icon: GraduationCap, val: "K-12", lbl: "جميع المراحل" },
                { icon: BookOpen, val: "+500", lbl: "درس تفاعلي" },
                { icon: Users, val: "+20,000", lbl: "طالب مسجل" },
                { icon: Award, val: "95%", lbl: "نسبة الرضا" },
              ].map((s, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3.5 text-center min-w-[90px] sm:min-w-[110px]" data-testid={`stat-hero-${i}`}>
                  <s.icon className="w-5 h-5 text-white/60 mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-black text-white">{s.val}</div>
                  <div className="text-xs text-white/60">{s.lbl}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Features */}
        <section id="main-features" className="py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center max-w-3xl mx-auto mb-16">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Zap className="w-4 h-4" />
                المميزات الرئيسية
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5" data-testid="text-main-features-title">
                أدوات تعليمية{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">متقدمة ومبتكرة</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                مجموعة شاملة من الأدوات والميزات التي تجعل تجربة التعلم أكثر فعالية ومتعة
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {mainFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group relative"
                  data-testid={`card-feature-${i}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-accent/50 dark:from-gray-800 dark:to-gray-900 rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
                  <div className={`relative ${f.bg} backdrop-blur-sm rounded-3xl p-7 sm:p-8 border border-border/30 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <f.icon className="w-7 h-7 sm:w-8 sm:h-8" />
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{f.stats}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary transition-colors">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{f.desc}</p>
                    <ul className="space-y-2.5">
                      {f.details.map((d, di) => (
                        <li key={di} className="flex items-center gap-2.5 text-sm text-foreground/80">
                          <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${f.color} flex items-center justify-center flex-shrink-0`}>
                            <Check className="w-3 h-3 text-white" />
                          </div>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics & Charts */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-accent/30 via-accent/50 to-accent/30 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 400" aria-hidden="true">
            <line x1="0" y1="100" x2="800" y2="100" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="0" y1="200" x2="800" y2="200" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="600" y1="0" x2="600" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
          </svg>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center max-w-3xl mx-auto mb-16">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <BarChart3 className="w-4 h-4" />
                أرقام تتحدث عن نفسها
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5" data-testid="text-stats-title">
                نتائج حقيقية{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">قابلة للقياس</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                أرقام حقيقية من طلاب منصة شارف تثبت فعالية المنصة في تحسين الأداء الدراسي
              </motion.p>
            </motion.div>

            {/* Circle Progress Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 mb-12">
              {circleStats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-[1.5rem] p-5 sm:p-6 border border-white dark:border-gray-700 text-center shadow-sm"
                  data-testid={`stat-circle-${i}`}
                >
                  <CircleProgress value={s.value} color={s.color} />
                  <p className="text-sm font-bold text-foreground mt-3">{s.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white dark:border-gray-700 shadow-lg"
                data-testid="chart-bar"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  مقارنة الأداء: قبل وبعد شارف
                </h3>
                <p className="text-sm text-muted-foreground mb-8">متوسط درجات الطلاب قبل وبعد استخدام المنصة</p>
                <div className="flex items-end justify-between gap-3 sm:gap-6 h-56 sm:h-64">
                  {barChartData.map((item, i) => (
                    <div key={i} className="flex items-end gap-1 sm:gap-2 flex-1">
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{item.before}%</span>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.before * 2.2}px` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                          className="w-full rounded-t-lg"
                          style={{ background: `${item.color}35` }}
                        />
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">قبل</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 flex-1">
                        <span className="text-[10px] sm:text-xs font-bold" style={{ color: item.color }}>{item.after}%</span>
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${item.after * 2.2}px` }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + i * 0.1, duration: 0.8 }}
                          className="w-full rounded-t-lg"
                          style={{ background: item.color }}
                        />
                        <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold">بعد</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 px-1">
                  {barChartData.map((item, i) => (
                    <span key={i} className="text-[10px] sm:text-xs font-bold text-muted-foreground text-center flex-1">{item.label}</span>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>متوسط التحسن: <strong className="text-primary">+30%</strong> في جميع المواد</span>
                </div>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-white dark:border-gray-700 shadow-lg"
                data-testid="chart-pie"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  توزيع المحتوى التعليمي
                </h3>
                <p className="text-sm text-muted-foreground mb-8">تنوع المحتوى لضمان تجربة تعلم شاملة ومتكاملة</p>
                <PieChart />
              </motion.div>
            </div>

            {/* Additional Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-10"
            >
              {[
                { icon: TrendingUp, value: "93%", label: "نسبة تحسن الأداء", color: "text-green-500" },
                { icon: Star, value: "4.9/5", label: "تقييم الطلاب", color: "text-amber-500" },
                { icon: Shield, value: "100%", label: "محتوى معتمد", color: "text-blue-500" },
                { icon: Zap, value: "3x", label: "أسرع في الفهم", color: "text-purple-500" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center p-5 sm:p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10" data-testid={`stat-extra-${i}`}>
                  <stat.icon className={`w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl sm:text-3xl font-black text-foreground mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center max-w-3xl mx-auto mb-16">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Target className="w-4 h-4" />
                لماذا شارف؟
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5" data-testid="text-comparison-title">
                الفرق الذي{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">يصنع التفوق</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                قارن بين الأساليب التقليدية ومنصة شارف واكتشف الفرق بنفسك
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
              data-testid="table-comparison"
            >
              <div className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-3xl border border-white dark:border-gray-700 shadow-lg overflow-x-auto">
                <div className="grid grid-cols-[1fr_auto_auto] min-w-[400px]">
                  <div className="p-4 sm:p-5 bg-muted/50 text-right font-bold text-foreground text-sm">الميزة</div>
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-primary to-cyan-500 text-white font-bold text-sm min-w-[80px] sm:min-w-[110px] text-center flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    شارف
                  </div>
                  <div className="p-4 sm:p-5 bg-muted/50 font-bold text-muted-foreground text-sm min-w-[80px] sm:min-w-[110px] text-center">تقليدي</div>
                </div>
                {comparisonItems.map((item, i) => (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`grid grid-cols-[1fr_auto_auto] border-t border-border/30 ${i % 2 === 0 ? "" : "bg-muted/15"}`}
                  >
                    <div className="p-3.5 sm:p-4 text-right text-sm text-foreground">{item.feature}</div>
                    <div className="p-3.5 sm:p-4 min-w-[80px] sm:min-w-[110px] flex items-center justify-center">
                      {item.sharaf ? (
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (item as any).sharafComingSoon ? (
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full whitespace-nowrap">قريباً</span>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 sm:p-4 min-w-[80px] sm:min-w-[110px] flex items-center justify-center">
                      {item.traditional ? (
                        <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                          <X className="w-4 h-4 text-red-500" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-accent/30 via-accent/50 to-accent/30 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 600" aria-hidden="true">
            <circle cx="100" cy="100" r="80" className="fill-none stroke-primary" strokeWidth="2" strokeDasharray="10 10" />
            <circle cx="700" cy="500" r="100" className="fill-none stroke-cyan-500" strokeWidth="2" strokeDasharray="10 10" />
            <rect x="600" y="50" width="120" height="120" rx="20" className="fill-none stroke-primary" strokeWidth="2" strokeDasharray="8 8" />
          </svg>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center max-w-3xl mx-auto mb-16">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Rocket className="w-4 h-4" />
                كيف تبدأ؟
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5" data-testid="text-steps-title">
                أربع خطوات نحو{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">التفوق الدراسي</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                ابدأ رحلتك التعليمية مع شارف بخطوات بسيطة وسهلة
              </motion.p>
            </motion.div>

            <div className="max-w-3xl mx-auto relative">
              <div className="absolute right-[27px] sm:right-[31px] top-0 bottom-0 w-[3px] bg-gradient-to-b from-primary via-cyan-500 to-blue-600 rounded-full hidden sm:block" />
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.5 }}
                  className="flex gap-4 sm:gap-6 mb-6 sm:mb-8 relative"
                  data-testid={`card-step-${i}`}
                >
                  <div className="flex-shrink-0 relative z-10">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                      <span className="text-white font-black text-lg sm:text-xl">{step.num}</span>
                    </div>
                  </div>
                  <div className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-[1.25rem] p-5 sm:p-6 border border-white dark:border-gray-700 flex-1 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <step.icon className="w-5 h-5 text-primary" />
                      <h3 className="text-base sm:text-lg font-bold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="text-center max-w-3xl mx-auto mb-16">
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Users className="w-4 h-4" />
                آراء الطلاب
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-3xl sm:text-4xl lg:text-5xl font-black mb-5" data-testid="text-testimonials-title">
                طلابنا{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">يتحدثون عنا</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                تجارب حقيقية من طلاب وأولياء أمور حققوا نتائج استثنائية مع شارف
              </motion.p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group"
                  data-testid={`card-testimonial-${i}`}
                >
                  <div className="bg-white/80 dark:bg-card backdrop-blur-sm rounded-3xl p-6 border border-white dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-center gap-1 mb-4" dir="ltr">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 dark:text-gray-600"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">"{t.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.grade}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-cyan-600 to-blue-700" />
              <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none" viewBox="0 0 800 400" aria-hidden="true">
                <circle cx="100" cy="200" r="120" fill="white" />
                <circle cx="700" cy="100" r="80" fill="white" />
                <polygon points="400,50 500,200 300,200" fill="white" />
                <rect x="550" y="250" width="100" height="100" rx="15" fill="white" transform="rotate(20 600 300)" />
              </svg>

              <div className="relative p-10 sm:p-16 lg:p-20 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-7"
                >
                  <Rocket className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>

                <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black mb-5 max-w-3xl mx-auto" data-testid="text-cta-title">
                  مستعد لبدء رحلة التفوق؟
                </h2>
                <p className="text-white/90 text-sm sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  انضم لأكثر من 20,000 طالب يتعلمون مع شارف كل يوم.
                  سجّل الآن مجاناً واحصل على وصول كامل لجميع الدروس والمميزات!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-primary hover:bg-white/90 rounded-full font-bold shadow-xl text-base px-8 gap-2"
                      data-testid="button-cta-register"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      سجّل مجاناً الآن
                    </Button>
                  </Link>
                  <Link href="/stage/middle">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 rounded-full font-bold text-base px-8 gap-2"
                      data-testid="button-cta-explore"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      تصفح المراحل الدراسية
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
