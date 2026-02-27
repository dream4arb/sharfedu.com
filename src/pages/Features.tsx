import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setPageMeta } from "@/lib/seo";
import {
  Video,
  Brain,
  CheckCircle,
  BookOpen,
  Clock,
  Award,
  Sparkles,
  TrendingUp,
  BarChart3,
  Users,
  Star,
  ArrowLeft,
  Rocket,
  Shield,
  Zap,
  Target,
  GraduationCap,
  FileText,
  Lightbulb,
  ChevronLeft,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const mainFeatures = [
  {
    icon: Video,
    title: "دروس مصورة احترافية",
    description: "أكثر من 500 درس فيديو عالي الجودة بدقة HD، معدّة بعناية فائقة من نخبة المعلمين المعتمدين في المملكة. كل درس مُقسّم إلى أجزاء قصيرة سهلة الاستيعاب مع أمثلة تطبيقية حقيقية من اختبارات الوزارة.",
    gradient: "from-blue-500 to-cyan-500",
    stats: "500+ درس",
  },
  {
    icon: Brain,
    title: "ذكاء اصطناعي تعليمي",
    description: "تقنية الذكاء الاصطناعي المتقدمة تحلل مستواك الدراسي وتقدم لك خطة تعلم مخصصة. يتابع تقدمك، يحدد نقاط ضعفك، ويقترح عليك الدروس الأنسب لتحسين أدائك بشكل مستمر.",
    gradient: "from-purple-500 to-pink-500",
    stats: "تعلم ذكي",
  },
  {
    icon: CheckCircle,
    title: "اختبارات تفاعلية فورية",
    description: "بنك أسئلة ضخم يضم آلاف الأسئلة المصنفة حسب المستوى والصعوبة. اختبر نفسك بعد كل درس واحصل على تحليل فوري لأدائك مع شرح مفصل لكل إجابة خاطئة وتوجيهات للتحسين.",
    gradient: "from-green-500 to-emerald-500",
    stats: "5000+ سؤال",
  },
  {
    icon: BookOpen,
    title: "ملخصات ذكية شاملة",
    description: "ملخصات تفاعلية مولّدة بالذكاء الاصطناعي تغطي جميع النقاط الرئيسية في كل درس. مصممة خصيصاً للمراجعة السريعة قبل الاختبارات مع خرائط ذهنية وتنظيم بصري يسهل الحفظ والفهم.",
    gradient: "from-amber-500 to-orange-500",
    stats: "ملخصات ذكية",
  },
  {
    icon: FileText,
    title: "مناهج سعودية محدّثة",
    description: "محتوى تعليمي محدّث باستمرار يغطي جميع المراحل الدراسية وفق أحدث إصدارات المنهج السعودي. من الابتدائية حتى الثانوية، بما في ذلك مسارات الثانوية واختبارات القدرات والتحصيلي.",
    gradient: "from-red-500 to-rose-500",
    stats: "جميع المراحل",
  },
  {
    icon: Award,
    title: "تتبع التقدم والإنجازات",
    description: "لوحة تحكم متقدمة تعرض تقدمك بشكل مرئي عبر رسوم بيانية تفاعلية. تتبع ساعات الدراسة، نسبة الإنجاز، ومعدل الأداء في الاختبارات مع مقارنة أدائك بالمعدل العام للطلاب.",
    gradient: "from-primary to-cyan-500",
    stats: "تتبع مستمر",
  },
];

const comparisonData = [
  { feature: "الوصول للمحتوى", traditional: "محدود بالكتب والحصص", sharf: "متاح 24/7 من أي مكان" },
  { feature: "التفاعل مع المادة", traditional: "استماع فقط", sharf: "فيديو + اختبارات + ذكاء اصطناعي" },
  { feature: "تقييم الأداء", traditional: "اختبارات فصلية فقط", sharf: "تقييم فوري بعد كل درس" },
  { feature: "المراجعة والتكرار", traditional: "صعبة ومرهقة", sharf: "ملخصات ذكية وإعادة المشاهدة" },
  { feature: "التخصيص", traditional: "منهج واحد للجميع", sharf: "خطة تعلم مخصصة لكل طالب" },
  { feature: "متابعة التقدم", traditional: "غير متوفرة", sharf: "لوحة تحكم تفاعلية مع تحليلات" },
];

const steps = [
  {
    num: "01",
    title: "سجّل حسابك مجاناً",
    description: "إنشاء حساب بسيط وسريع خلال دقيقة واحدة فقط. اختر مرحلتك الدراسية وابدأ فوراً.",
    icon: Users,
  },
  {
    num: "02",
    title: "اختر مرحلتك ومادتك",
    description: "تصفح المراحل الدراسية واختر المادة التي تريد تعلمها. المحتوى منظم بشكل بسيط وواضح.",
    icon: Target,
  },
  {
    num: "03",
    title: "شاهد الدروس وتعلم",
    description: "استمتع بدروس فيديو احترافية مع ملخصات ذكية. تعلم بالسرعة التي تناسبك وأعد المشاهدة متى شئت.",
    icon: GraduationCap,
  },
  {
    num: "04",
    title: "اختبر نفسك وتفوق",
    description: "اختبر فهمك بعد كل درس واحصل على تحليل لأدائك. تتبع تقدمك وحقق أهدافك الدراسية.",
    icon: TrendingUp,
  },
];

const testimonials = [
  {
    name: "أحمد العتيبي",
    grade: "الصف الثالث متوسط",
    text: "ارتفع معدلي من 78% إلى 95% خلال فصل دراسي واحد فقط! الشروحات واضحة جداً والاختبارات ساعدتني أفهم نقاط ضعفي.",
    rating: 5,
    avatar: "أ",
  },
  {
    name: "نورة الشمري",
    grade: "الصف الأول ثانوي - مسار عام",
    text: "أفضل منصة تعليمية استخدمتها. الملخصات الذكية وفرت عليّ ساعات طويلة من المذاكرة وساعدتني في فهم المواد الصعبة.",
    rating: 5,
    avatar: "ن",
  },
  {
    name: "محمد القحطاني",
    grade: "تحضيري قدرات",
    text: "حصلت على درجة 94 في اختبار القدرات بفضل التدريبات المكثفة والشروحات الممتازة. أنصح الجميع بمنصة شارف.",
    rating: 5,
    avatar: "م",
  },
];

const chartBars = [
  { label: "قبل شارف", value: 62, color: "bg-gray-300 dark:bg-gray-600" },
  { label: "بعد شهر", value: 75, color: "bg-cyan-400" },
  { label: "بعد 3 أشهر", value: 88, color: "bg-primary" },
  { label: "بعد 6 أشهر", value: 95, color: "bg-gradient-to-t from-primary to-cyan-400" },
];

const pieSegments = [
  { label: "فيديوهات تعليمية", percent: 40, color: "#0891b2" },
  { label: "اختبارات تفاعلية", percent: 25, color: "#06b6d4" },
  { label: "ملخصات ذكية", percent: 20, color: "#22d3ee" },
  { label: "تتبع الأداء", percent: 15, color: "#67e8f9" },
];

function PieChart() {
  let cumulative = 0;
  const segments = pieSegments.map((seg) => {
    const start = cumulative;
    cumulative += seg.percent;
    return { ...seg, start, end: cumulative };
  });

  return (
    <div className="flex flex-col items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-56 h-56 drop-shadow-lg" role="img" aria-label="رسم بياني دائري يوضح توزيع المحتوى التعليمي">
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
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        <circle cx="100" cy="100" r="40" className="fill-white dark:fill-gray-900" />
        <text x="100" y="96" textAnchor="middle" className="fill-foreground text-sm font-bold" fontSize="14">
          محتوى
        </text>
        <text x="100" y="114" textAnchor="middle" className="fill-muted-foreground" fontSize="11">
          متكامل
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-3">
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
      "اكتشف مميزات منصة شارف التعليمية: دروس فيديو احترافية، ذكاء اصطناعي، اختبارات تفاعلية، ملخصات ذكية لجميع المراحل الدراسية السعودية",
      "مميزات شارف، منصة تعليمية، دروس فيديو، ذكاء اصطناعي، اختبارات، المنهج السعودي"
    );
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-gradient-to-b from-primary/5 via-accent/30 to-background">
          <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" viewBox="0 0 800 600" aria-hidden="true">
            <polygon points="100,50 150,150 50,150" className="fill-primary" />
            <polygon points="650,80 720,200 580,200" className="fill-primary" />
            <rect x="300" y="400" width="80" height="80" rx="10" className="fill-cyan-500" transform="rotate(30 340 440)" />
            <circle cx="700" cy="450" r="50" className="fill-primary" />
            <polygon points="50,400 100,350 150,400 130,460 70,460" className="fill-cyan-500" />
            <rect x="500" y="50" width="60" height="60" rx="8" className="fill-primary" transform="rotate(45 530 80)" />
            <circle cx="200" cy="300" r="35" className="fill-cyan-500" />
            <polygon points="400,200 450,280 350,280" className="fill-primary" />
          </svg>

          <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-8" data-testid="badge-features">
                <Sparkles className="w-4 h-4" />
                مميزات منصة شارف
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 leading-tight" data-testid="text-features-title">
                كل ما تحتاجه للتفوق{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  في مكان واحد
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10" data-testid="text-features-subtitle">
                منصة شارف تقدم تجربة تعليمية متكاملة تجمع بين أحدث تقنيات الذكاء الاصطناعي وأفضل أساليب التدريس الحديثة، مصممة خصيصاً للمنهج السعودي لمساعدتك على تحقيق أعلى الدرجات
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="rounded-full font-bold text-base px-8 shadow-lg" data-testid="button-features-register">
                    ابدأ مجاناً الآن
                    <ArrowLeft className="mr-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#main-features">
                  <Button size="lg" variant="outline" className="rounded-full font-bold text-base px-8" data-testid="button-features-explore">
                    استكشف المميزات
                    <ChevronLeft className="mr-2 h-5 w-5" />
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto"
            >
              {[
                { icon: Users, value: "+20,000", label: "طالب مسجل" },
                { icon: BookOpen, value: "+500", label: "درس تفاعلي" },
                { icon: Award, value: "95%", label: "نسبة الرضا" },
                { icon: Clock, value: "24/7", label: "متاح دائماً" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center p-4 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10" data-testid={`stat-hero-${i}`}>
                  <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-black text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Main Features Section */}
        <section id="main-features" className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-200/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Zap className="w-4 h-4" />
                المميزات الرئيسية
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-main-features-title">
                أدوات تعليمية{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  متقدمة ومبتكرة
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                نوفر لك مجموعة شاملة من الأدوات والميزات التي تجعل تجربة التعلم أكثر فعالية ومتعة
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mainFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  custom={index}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group relative"
                  data-testid={`card-feature-${index}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-accent/50 dark:from-gray-800 dark:to-gray-900 rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
                  <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        {feature.stats}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-1">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics & Charts Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-accent/30 via-accent/50 to-accent/30 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 400" aria-hidden="true">
            <line x1="0" y1="100" x2="800" y2="100" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="0" y1="200" x2="800" y2="200" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="200" y1="0" x2="200" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="400" y1="0" x2="400" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
            <line x1="600" y1="0" x2="600" y2="400" stroke="currentColor" strokeWidth="1" className="text-primary" />
          </svg>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <BarChart3 className="w-4 h-4" />
                أرقام تتحدث عن نفسها
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-stats-title">
                نتائج حقيقية{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  قابلة للقياس
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                أرقام حقيقية من طلاب منصة شارف تثبت فعالية المنصة في تحسين الأداء الدراسي
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Bar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white dark:border-gray-700 shadow-lg"
                data-testid="chart-bar"
              >
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  تطور معدل الطلاب
                </h3>
                <p className="text-sm text-muted-foreground mb-8">متوسط معدل الطلاب بعد استخدام منصة شارف</p>
                <div className="flex items-end justify-between gap-4 h-64">
                  {chartBars.map((bar, i) => (
                    <div key={bar.label} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
                      <span className="text-sm font-bold text-foreground">{bar.value}%</span>
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${bar.value}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15, ease: "easeOut" }}
                        viewport={{ once: true }}
                        className={`w-full rounded-t-xl ${bar.color} min-h-[20px]`}
                      />
                      <span className="text-xs text-muted-foreground text-center font-medium">{bar.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>متوسط التحسن: <strong className="text-primary">+33%</strong> خلال 6 أشهر</span>
                </div>
              </motion.div>

              {/* Pie Chart */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white dark:border-gray-700 shadow-lg"
                data-testid="chart-pie"
              >
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
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
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
            >
              {[
                { icon: TrendingUp, value: "93%", label: "نسبة تحسن الأداء", color: "text-green-500" },
                { icon: Star, value: "4.9/5", label: "تقييم الطلاب", color: "text-amber-500" },
                { icon: Shield, value: "100%", label: "محتوى معتمد", color: "text-blue-500" },
                { icon: Zap, value: "3x", label: "أسرع في الفهم", color: "text-purple-500" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-white/50 dark:border-white/10" data-testid={`stat-extra-${i}`}>
                  <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                  <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Target className="w-4 h-4" />
                لماذا شارف؟
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-comparison-title">
                الفرق الذي{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  يصنع التفوق
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                قارن بين الأساليب التقليدية ومنصة شارف واكتشف الفرق بنفسك
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
              data-testid="table-comparison"
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl border border-white dark:border-gray-700 shadow-lg overflow-hidden">
                <div className="grid grid-cols-3 bg-gradient-to-l from-primary to-cyan-600 text-white">
                  <div className="p-5 text-center font-bold text-base">المقارنة</div>
                  <div className="p-5 text-center font-bold text-base border-x border-white/20">التعلم التقليدي</div>
                  <div className="p-5 text-center font-bold text-base flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    منصة شارف
                  </div>
                </div>
                {comparisonData.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    custom={i}
                    variants={fadeIn}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className={`grid grid-cols-3 ${i % 2 === 0 ? "bg-accent/20" : ""} border-b border-border/30 last:border-b-0`}
                  >
                    <div className="p-5 font-bold text-sm flex items-center">{row.feature}</div>
                    <div className="p-5 text-sm text-muted-foreground border-x border-border/30 flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 ml-2 shrink-0" />
                      {row.traditional}
                    </div>
                    <div className="p-5 text-sm text-primary font-medium flex items-center">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary ml-2 shrink-0" />
                      {row.sharf}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-accent/30 via-accent/50 to-accent/30 relative overflow-hidden">
          <svg className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" viewBox="0 0 800 600" aria-hidden="true">
            <circle cx="100" cy="100" r="80" className="fill-none stroke-primary" strokeWidth="2" strokeDasharray="10 10" />
            <circle cx="700" cy="500" r="100" className="fill-none stroke-cyan-500" strokeWidth="2" strokeDasharray="10 10" />
            <rect x="600" y="50" width="120" height="120" rx="20" className="fill-none stroke-primary" strokeWidth="2" strokeDasharray="8 8" />
          </svg>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Rocket className="w-4 h-4" />
                كيف تبدأ؟
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-steps-title">
                أربع خطوات نحو{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  التفوق الدراسي
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                ابدأ رحلتك التعليمية مع شارف بخطوات بسيطة وسهلة
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="hidden lg:block absolute top-24 left-[12%] right-[12%] h-0.5 bg-gradient-to-l from-primary/20 via-primary to-primary/20" />

              {steps.map((step, index) => (
                <motion.div
                  key={step.num}
                  custom={index}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="relative text-center"
                  data-testid={`card-step-${index}`}
                >
                  <div className="relative z-10 mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white shadow-xl">
                      <step.icon className="w-9 h-9" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-primary flex items-center justify-center text-xs font-black text-primary shadow-md">
                      {step.num}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto mb-16"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
                <Users className="w-4 h-4" />
                آراء الطلاب
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6" data-testid="text-testimonials-title">
                طلابنا{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
                  يتحدثون عنا
                </span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                تجارب حقيقية من طلاب حققوا نتائج استثنائية مع منصة شارف
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  custom={index}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group"
                  data-testid={`card-testimonial-${index}`}
                >
                  <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-3xl p-8 border border-white dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6 flex-1">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{testimonial.name}</div>
                        <div className="text-xs text-muted-foreground">{testimonial.grade}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative rounded-[2.5rem] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-cyan-600 to-primary" />
              <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 800 400" aria-hidden="true">
                <circle cx="100" cy="200" r="120" className="fill-white" />
                <circle cx="700" cy="100" r="80" className="fill-white" />
                <polygon points="400,50 500,200 300,200" className="fill-white" />
                <rect x="550" y="250" width="100" height="100" rx="15" className="fill-white" transform="rotate(20 600 300)" />
              </svg>

              <div className="relative p-12 lg:p-20 text-center text-white">
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8"
                >
                  <Rocket className="w-10 h-10" />
                </motion.div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 max-w-3xl mx-auto" data-testid="text-cta-title">
                  مستعد لبدء رحلة التفوق؟
                </h2>
                <p className="text-white/90 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  انضم لأكثر من 20,000 طالب يتعلمون مع شارف كل يوم.
                  سجّل الآن مجاناً واحصل على وصول كامل لجميع الدروس والمميزات!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="bg-white text-primary rounded-full font-bold shadow-xl text-base px-8"
                      data-testid="button-cta-register"
                    >
                      سجّل مجاناً الآن
                      <ArrowLeft className="mr-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 rounded-full font-bold text-base px-8"
                      data-testid="button-cta-home"
                    >
                      تصفح الدروس
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
