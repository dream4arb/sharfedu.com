import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { setPageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import {
  Baby,
  BookOpen,
  GraduationCap,
  Route,
  Target,
  ArrowLeft,
  Users,
  Sparkles,
  CheckCircle,
  Star,
  Calculator,
  FlaskConical,
  Pen,
  Book,
  Languages,
  Monitor,
  Briefcase,
  Atom,
  Globe,
  Heart,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const stages = [
  {
    id: "elementary",
    name: "المرحلة الابتدائية",
    subtitle: "الصف الأول إلى السادس",
    description: "أساسيات التعلم بأسلوب ممتع وتفاعلي يناسب الأطفال، مع شروحات مبسطة وتمارين تفاعلية تبني قاعدة علمية متينة.",
    icon: Baby,
    color: "text-sky-500",
    bgColor: "bg-sky-500",
    gradient: "from-sky-400 to-blue-500",
    lightBg: "bg-sky-50 dark:bg-sky-950/30",
    borderColor: "border-sky-200 dark:border-sky-800",
    grades: "6 صفوف دراسية",
    subjects: [
      { name: "الرياضيات", icon: Calculator },
      { name: "لغتي", icon: Pen },
      { name: "العلوم", icon: FlaskConical },
      { name: "الدراسات الإسلامية", icon: Book },
      { name: "الإنجليزي", icon: Languages },
      { name: "التربية الفنية", icon: Heart },
    ],
    stats: { students: "50,000+", lessons: "1,200+", subjects: "8 مواد" },
  },
  {
    id: "middle",
    name: "المرحلة المتوسطة",
    subtitle: "أول متوسط إلى ثالث متوسط",
    description: "مرحلة تأسيسية مهمة تربط بين الابتدائية والثانوية، مع تعمق في المواد العلمية وتنمية مهارات التفكير النقدي.",
    icon: BookOpen,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500",
    gradient: "from-emerald-400 to-teal-500",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    grades: "3 صفوف دراسية",
    subjects: [
      { name: "الرياضيات", icon: Calculator },
      { name: "العلوم", icon: FlaskConical },
      { name: "اللغة العربية", icon: Pen },
      { name: "الإنجليزي", icon: Languages },
      { name: "الاجتماعيات", icon: Globe },
      { name: "الحاسب الآلي", icon: Monitor },
    ],
    stats: { students: "35,000+", lessons: "900+", subjects: "8 مواد" },
  },
  {
    id: "high",
    name: "المرحلة الثانوية",
    subtitle: "أول ثانوي إلى ثالث ثانوي",
    description: "مرحلة التخصص والتأهيل للجامعة مع شروحات تفصيلية للمواد العلمية المتقدمة ومراجعات شاملة للاختبارات.",
    icon: GraduationCap,
    color: "text-violet-500",
    bgColor: "bg-violet-500",
    gradient: "from-violet-400 to-purple-500",
    lightBg: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-violet-200 dark:border-violet-800",
    grades: "3 صفوف دراسية",
    subjects: [
      { name: "الرياضيات", icon: Calculator },
      { name: "الفيزياء", icon: Atom },
      { name: "الكيمياء", icon: FlaskConical },
      { name: "الأحياء", icon: Heart },
      { name: "الإنجليزي", icon: Languages },
      { name: "الحاسب الآلي", icon: Monitor },
    ],
    stats: { students: "40,000+", lessons: "1,000+", subjects: "9 مواد" },
  },
  {
    id: "paths",
    name: "المسارات",
    subtitle: "نظام المسارات الجديد",
    description: "تغطية شاملة لنظام المسارات الجديد بما يشمل المسار العام ومسار علوم الحاسب والصحة وإدارة الأعمال.",
    icon: Route,
    color: "text-amber-500",
    bgColor: "bg-amber-500",
    gradient: "from-amber-400 to-orange-500",
    lightBg: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-amber-200 dark:border-amber-800",
    grades: "4 مسارات",
    subjects: [
      { name: "الرياضيات", icon: Calculator },
      { name: "العلوم", icon: FlaskConical },
      { name: "علوم الحاسب", icon: Monitor },
      { name: "إدارة الأعمال", icon: Briefcase },
    ],
    stats: { students: "25,000+", lessons: "600+", subjects: "4 تخصصات" },
  },
  {
    id: "qudurat",
    name: "القدرات والتحصيلي",
    subtitle: "اختبارات القبول الجامعي",
    description: "تحضير مكثف لاختبارات القدرات العامة والتحصيلي مع نماذج محاكاة حقيقية وتدريبات مكثفة ترفع درجاتك.",
    icon: Target,
    color: "text-rose-500",
    bgColor: "bg-rose-500",
    gradient: "from-rose-400 to-pink-500",
    lightBg: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-rose-200 dark:border-rose-800",
    grades: "اختبارين رئيسيين",
    subjects: [
      { name: "القسم اللفظي", icon: Pen },
      { name: "القسم الكمي", icon: Calculator },
      { name: "التحصيلي", icon: GraduationCap },
    ],
    stats: { students: "30,000+", lessons: "500+", subjects: "3 أقسام" },
  },
];

const highlights = [
  { icon: Users, label: "أكثر من 180,000 طالب", color: "text-primary" },
  { icon: BookOpen, label: "أكثر من 4,200 درس", color: "text-emerald-500" },
  { icon: Star, label: "تقييم 4.9 من 5", color: "text-amber-500" },
  { icon: Sparkles, label: "مدعوم بالذكاء الاصطناعي", color: "text-violet-500" },
];

export default function Stages() {
  useEffect(() => {
    setPageMeta({
      title: "المراحل الدراسية - منصة شارف التعليمية",
      description: "تصفح جميع المراحل الدراسية في منصة شارف: الابتدائية، المتوسطة، الثانوية، المسارات، والقدرات والتحصيلي. محتوى تعليمي شامل للمنهج السعودي.",
      keywords: "المراحل الدراسية, ابتدائي, متوسط, ثانوي, مسارات, قدرات, تحصيلي, منهج سعودي, شارف",
    });
  }, []);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />

      <section className="relative pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-cyan-500/5 to-transparent" />

        <svg className="absolute top-0 left-0 w-full h-full opacity-[0.03] dark:opacity-[0.02]" viewBox="0 0 800 400">
          <circle cx="100" cy="80" r="60" fill="currentColor" />
          <circle cx="700" cy="120" r="40" fill="currentColor" />
          <polygon points="400,30 430,90 370,90" fill="currentColor" />
          <rect x="600" y="280" width="50" height="50" rx="8" fill="currentColor" />
          <circle cx="200" cy="350" r="30" fill="currentColor" />
        </svg>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6" data-testid="badge-stages">
              <GraduationCap className="w-4 h-4" />
              جميع المراحل الدراسية
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent" data-testid="heading-stages">
              المراحل الدراسية
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed" data-testid="text-stages-description">
              منصة شارف تغطي جميع المراحل الدراسية في المنهج السعودي — من الصف الأول ابتدائي حتى اختبارات القدرات والتحصيلي. اختر مرحلتك وابدأ رحلة التفوق!
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-medium" data-testid={`highlight-${i}`}>
                <h.icon className={`w-5 h-5 ${h.color}`} />
                <span className="text-foreground">{h.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              return (
                <motion.div
                  key={stage.id}
                  custom={index}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-50px" }}
                  data-testid={`card-stage-${stage.id}`}
                >
                  <div className={`relative rounded-2xl border ${stage.borderColor} ${stage.lightBg} overflow-hidden transition-shadow hover:shadow-md`}>
                    <div className={`absolute top-0 end-0 w-40 h-40 bg-gradient-to-bl ${stage.gradient} opacity-10 rounded-bl-full`} />
                    <div className={`absolute bottom-0 start-0 w-24 h-24 bg-gradient-to-tr ${stage.gradient} opacity-5 rounded-tr-full`} />

                    <div className="relative p-6 sm:p-8">
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-foreground" data-testid={`heading-stage-${stage.id}`}>
                                {stage.name}
                              </h2>
                              <p className="text-sm text-muted-foreground mt-0.5">{stage.subtitle}</p>
                            </div>
                          </div>

                          <p className="text-muted-foreground leading-relaxed mb-5 text-base" data-testid={`text-stage-desc-${stage.id}`}>
                            {stage.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-5">
                            {stage.subjects.map((subject, si) => {
                              const SubIcon = subject.icon;
                              return (
                                <span
                                  key={si}
                                  className="inline-flex items-center gap-1.5 bg-background/80 dark:bg-background/40 border border-border/50 rounded-full px-3 py-1.5 text-xs font-medium text-foreground"
                                  data-testid={`subject-tag-${stage.id}-${si}`}
                                >
                                  <SubIcon className={`w-3.5 h-3.5 ${stage.color}`} />
                                  {subject.name}
                                </span>
                              );
                            })}
                          </div>

                          <Link href={`/stage/${stage.id}`}>
                            <Button
                              className={`bg-gradient-to-r ${stage.gradient} text-white border-0 hover:opacity-90 gap-2`}
                              data-testid={`button-explore-${stage.id}`}
                            >
                              استكشف {stage.name}
                              <ArrowLeft className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>

                        <div className="lg:w-72 shrink-0">
                          <div className="grid grid-cols-3 gap-3">
                            {Object.entries(stage.stats).map(([key, value], si) => {
                              const statLabels: Record<string, string> = {
                                students: "طالب مسجل",
                                lessons: "درس متاح",
                                subjects: "",
                              };
                              return (
                                <div
                                  key={key}
                                  className="text-center p-3 rounded-xl bg-background/60 dark:bg-background/30 border border-border/30"
                                  data-testid={`stat-${stage.id}-${key}`}
                                >
                                  <div className={`text-lg font-bold ${stage.color}`}>{value}</div>
                                  <div className="text-[10px] text-muted-foreground mt-0.5">{statLabels[key] || value}</div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className={`w-4 h-4 ${stage.color}`} />
                              <span>شروحات فيديو مفصلة</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className={`w-4 h-4 ${stage.color}`} />
                              <span>تمارين تفاعلية</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className={`w-4 h-4 ${stage.color}`} />
                              <span>متابعة التقدم</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-primary to-cyan-500 relative overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 200">
          <circle cx="100" cy="100" r="80" fill="white" />
          <circle cx="700" cy="50" r="60" fill="white" />
          <circle cx="400" cy="150" r="40" fill="white" />
        </svg>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4" data-testid="heading-cta">
              ابدأ رحلتك التعليمية الآن
            </h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              سجّل مجاناً واستكشف جميع المراحل الدراسية مع شروحات احترافية وأدوات ذكية تساعدك على التفوق.
            </p>
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2 text-base px-8" data-testid="button-register-cta">
                <Sparkles className="w-5 h-5" />
                سجّل الآن مجاناً
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
