import { motion } from "framer-motion";
import { Bot, ChartNoAxesColumnIncreasing, MousePointer2, Shapes } from "lucide-react";

const stats = [
  {
    icon: MousePointer2,
    value: "تعلّم بالمشاركة",
    label: "أسئلة ومحاولات أثناء الشرح",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Shapes,
    value: "رسم تفاعلي",
    label: "SVG واضح على كل الشاشات",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: Bot,
    value: "معلم سياقي",
    label: "يفهم الدرس والمحاولات السابقة",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: ChartNoAxesColumnIncreasing,
    value: "إتقان المهارات",
    label: "تقرير يوضح ما يحتاج مراجعة",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function Stats() {
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-foreground via-gray-900 to-foreground rounded-[2rem] p-10 lg:p-16 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          
          <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div className="text-xl lg:text-2xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-white/60 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
