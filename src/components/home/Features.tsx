import { motion } from "framer-motion";
import { Bot, ChartNoAxesColumnIncreasing, CheckCircle, FileCheck2, Shapes, Video, Zap } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "فيديو داخل رحلة الدرس",
    description: "فيديو مدمج داخل رحلة التعلم عند الحاجة بدل التنقل بين صفحات منفصلة",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "شارف Tutor",
    description: "معلم افتراضي يعرف سياق الدرس ومحاولات الطالب ويقدّم تلميحات متدرجة",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: CheckCircle,
    title: "تغذية راجعة تعليمية",
    description: "لا يكتفي بقول إن الإجابة خاطئة؛ بل يشخّص نمط الخطأ ويتيح محاولة جديدة",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Shapes,
    title: "رسومات تفاعلية",
    description: "مكوّنات SVG مرنة وواضحة تساعد الطالب على اكتشاف المفهوم بنفسه",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    title: "إتقان حسب المهارة",
    description: "تقرير مبني على المحاولات والتلميحات يوضح ما أتقنه الطالب وما يحتاج مراجعة",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: FileCheck2,
    title: "ملخص واضح المصدر",
    description: "تظهر حالة اعتماد الملخص بوضوح، ولا ننسب محتوى إلى معلم قبل مراجعته",
    gradient: "from-primary to-cyan-500",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 bg-gradient-to-b from-accent/30 via-accent/50 to-accent/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <Zap className="w-4 h-4" />
            مميزات المنصة
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            لماذا تختار{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
              شارف؟
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            نقدم لك تجربة تعليمية متكاملة تجمع بين المتعة والفائدة، مع أدوات حديثة تساعدك على التفوق
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative h-full"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-accent/50 rounded-3xl transform group-hover:scale-[1.02] transition-transform duration-300" />
              <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-lg hover:shadow-xl transition-all duration-300 h-full">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
