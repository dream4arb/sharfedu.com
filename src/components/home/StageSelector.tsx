import { motion } from "framer-motion";
import { Baby, BookOpen, GraduationCap, Route, Target, Lock } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { isProfileComplete, canAccessStage } from "@/lib/profile";

const stages = [
  {
    id: "elementary",
    title: "المرحلة الابتدائية",
    subtitle: "الصف الأول - السادس",
    description: "أساسيات التعلم بأسلوب ممتع وتفاعلي",
    icon: Baby,
    gradient: "from-sky-400 to-blue-500",
    bgGradient: "from-sky-50 to-blue-50",
    shadowColor: "shadow-sky-400/30",
    borderColor: "border-sky-200",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    id: "middle",
    title: "المرحلة المتوسطة",
    subtitle: "الصف الأول - الثالث",
    description: "تعمق في المواد الدراسية الأساسية",
    icon: BookOpen,
    gradient: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    shadowColor: "shadow-emerald-400/30",
    borderColor: "border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    id: "high",
    title: "المرحلة الثانوية",
    subtitle: "الصف الأول - الثالث",
    description: "استعد للمرحلة الجامعية بثقة",
    icon: GraduationCap,
    gradient: "from-violet-400 to-purple-500",
    bgGradient: "from-violet-50 to-purple-50",
    shadowColor: "shadow-violet-400/30",
    borderColor: "border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    id: "paths",
    title: "المسارات",
    subtitle: "المسارات الأكاديمية",
    description: "اختر مسارك التخصصي المناسب",
    comingSoon: true,
    icon: Route,
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    shadowColor: "shadow-amber-400/30",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    id: "qudurat",
    title: "القدرات والتحصيلي",
    subtitle: "اختبارات القياس",
    description: "تحضير مكثف لاختبارات القدرات والتحصيلي",
    comingSoon: true,
    icon: Target,
    gradient: "from-rose-400 to-pink-500",
    bgGradient: "from-rose-50 to-pink-50",
    shadowColor: "shadow-rose-400/30",
    borderColor: "border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
];

export function StageSelector() {
  const { user } = useAuth();
  const profileComplete = isProfileComplete(user);

  return (
    <section id="stages" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <BookOpen className="w-4 h-4" />
            جميع المراحل الدراسية
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            اختر{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
              مرحلتك الدراسية
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            منصة شارف تغطي جميع المراحل الدراسية من الابتدائية وحتى الثانوية، بالإضافة إلى المسارات واختبارات القدرات والتحصيلي
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {stages.map((stage, index) => {
            const locked = profileComplete && !canAccessStage(stage.id, user) && !(stage as { comingSoon?: boolean }).comingSoon;
            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                {locked ? (
                  <div className={`
                    relative bg-muted/50 rounded-[1.5rem] p-6 border border-muted
                    opacity-75 h-full cursor-not-allowed select-none
                  `}>
                    <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-muted text-muted-foreground z-10 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      مقفل
                    </span>
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-muted text-muted-foreground`}>
                        <stage.icon className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-black mb-2 text-muted-foreground">{stage.title}</h3>
                      <p className="text-sm text-muted-foreground/80">متاح لصفك الحالي فقط</p>
                    </div>
                  </div>
                ) : (
                  <Link href={`/stage/${stage.id}`} data-testid={`link-stage-${stage.id}`} className="block h-full">
                    <div className={`
                      group relative bg-white rounded-[1.5rem] p-6 border ${stage.borderColor}
                      shadow-lg hover:shadow-2xl ${stage.shadowColor}
                      transition-all duration-500 cursor-pointer
                      hover:-translate-y-2 h-full
                    `}>
                      {(stage as { comingSoon?: boolean }).comingSoon && (
                        <span className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 z-10">
                          قريباً
                        </span>
                      )}
                      <div className={`absolute inset-0 rounded-[1.5rem] bg-gradient-to-b ${stage.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      
                      <div className="relative">
                        <div className={`
                          w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                          bg-gradient-to-br ${stage.gradient} text-white shadow-lg ${stage.shadowColor}
                          group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
                        `}>
                          <stage.icon className="w-8 h-8" />
                        </div>

                        <h3 className="text-lg font-black mb-2 group-hover:text-primary transition-colors">
                          {stage.title}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground/80 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
