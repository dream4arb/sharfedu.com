import { motion } from "framer-motion";
import { Book, Atom, GraduationCap, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const grades = [
  {
    id: "1",
    title: "الصف الأول المتوسط",
    subtitle: "التأسيس والبداية",
    description: "تأسيس قوي ومناهج متكاملة لبداية ناجحة في رحلتك التعليمية",
    icon: Book,
    gradient: "from-sky-400 via-cyan-400 to-cyan-500",
    shadowColor: "shadow-sky-400/30",
    features: ["رياضيات", "علوم", "دراسات اجتماعية"],
  },
  {
    id: "2",
    title: "الصف الثاني المتوسط",
    subtitle: "التعمق والتطوير",
    description: "تعمق في المواد الدراسية بأسلوب تفاعلي وشروحات مبسطة",
    icon: Atom,
    gradient: "from-emerald-400 via-green-400 to-teal-500",
    shadowColor: "shadow-emerald-400/30",
    features: ["رياضيات متقدمة", "علوم تجريبية", "جغرافيا وتاريخ"],
  },
  {
    id: "3",
    title: "الصف الثالث المتوسط",
    subtitle: "الاستعداد للثانوية",
    description: "إعداد شامل ومراجعات مكثفة للانتقال للمرحلة الثانوية بتفوق",
    icon: GraduationCap,
    gradient: "from-amber-400 via-orange-400 to-orange-500",
    shadowColor: "shadow-amber-400/30",
    features: ["مراجعات شاملة", "اختبارات تجريبية", "تحضير مكثف"],
  },
];

export function GradeCards() {
  return (
    <section id="grades" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6">
            اختر{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-cyan-500">
              صفك الدراسي
            </span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            محتوى مخصص لكل صف دراسي مصمم بعناية ليناسب مستواك ويساعدك على التفوق
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {grades.map((grade, index) => (
            <motion.div
              key={grade.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={`/courses/${grade.id}`} data-testid={`link-grade-${grade.id}`}>
                <div className={`
                  group relative bg-white rounded-[2rem] p-8 border border-border/50
                  shadow-lg hover:shadow-2xl ${grade.shadowColor}
                  transition-all duration-500 cursor-pointer
                  hover:-translate-y-3
                `}>
                  <div className="absolute top-0 right-0 w-full h-40 bg-gradient-to-b from-accent/50 to-transparent rounded-t-[2rem] -z-10" />
                  
                  <div className={`
                    w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                    bg-gradient-to-br ${grade.gradient} text-white shadow-xl ${grade.shadowColor}
                    group-hover:scale-110 group-hover:rotate-3 transition-all duration-500
                  `}>
                    <grade.icon className="w-10 h-10" />
                  </div>

                  <div className="text-xs font-bold text-primary bg-primary/10 inline-block px-3 py-1 rounded-full mb-3">
                    {grade.subtitle}
                  </div>

                  <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">
                    {grade.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {grade.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {grade.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <Button className="w-full rounded-xl font-bold" data-testid={`button-grade-${grade.id}`}>
                    تصفح المواد
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
