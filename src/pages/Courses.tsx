import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/use-page-seo";
import { motion } from "framer-motion";
import { Beaker, Calculator, Globe, ArrowRight, Loader2 } from "lucide-react";
import type { Course } from "@shared/schema";

const subjectConfig: Record<string, { icon: typeof Beaker; color: string; bgColor: string; shadowColor: string }> = {
  science: {
    icon: Beaker,
    color: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-400 to-teal-500",
    shadowColor: "shadow-emerald-400/30",
  },
  math: {
    icon: Calculator,
    color: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-400 to-indigo-500",
    shadowColor: "shadow-blue-400/30",
  },
  social: {
    icon: Globe,
    color: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-400 to-orange-500",
    shadowColor: "shadow-amber-400/30",
  },
};

const gradeNames: Record<string, string> = {
  "1": "الصف الأول المتوسط",
  "2": "الصف الثاني المتوسط",
  "3": "الصف الثالث المتوسط",
};

export default function Courses() {
  const { gradeLevel } = useParams<{ gradeLevel: string }>();
  const gradeName = gradeNames[gradeLevel || ""] || "المواد الدراسية";
  usePageSeo({
    title: `${gradeName} - المواد الدراسية`,
    description: `جميع المواد الدراسية المتاحة لـ${gradeName} على منصة شارف التعليمية. اختر مادتك وابدأ التعلم مع دروس تفاعلية وشروحات مبسّطة.`,
    keywords: `${gradeName}, مواد دراسية, شارف, دروس, تعليم, السعودية`,
  });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", gradeLevel],
    queryFn: async () => {
      const res = await fetch(`/api/courses?gradeLevel=${gradeLevel}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2" data-testid="button-back-home">
                <ArrowRight className="w-4 h-4" />
                العودة
              </Button>
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
              {gradeNames[gradeLevel || "1"] || "المواد الدراسية"}
            </h1>
            <p className="text-muted-foreground text-lg">
              اختر المادة التي تريد دراستها وابدأ رحلة التعلم
            </p>
          </motion.div>

          {courses && courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {courses.map((course, index) => {
                const config = subjectConfig[course.subjectSlug] || subjectConfig.science;
                const IconComponent = config.icon;
                
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className={`
                      group bg-white rounded-3xl p-8 border border-border/50
                      shadow-lg hover:shadow-2xl ${config.shadowColor}
                      transition-all duration-300 cursor-pointer
                      hover:-translate-y-2
                    `}
                    data-testid={`card-course-${course.subjectSlug}`}
                  >
                    <div className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center mb-6
                      ${config.bgColor} text-white shadow-lg ${config.shadowColor}
                      group-hover:scale-110 transition-transform duration-300
                    `}>
                      <IconComponent className="w-10 h-10" />
                    </div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {course.description}
                    </p>

                    <Button className="w-full rounded-xl" data-testid={`button-start-${course.subjectSlug}`}>
                      ابدأ الدراسة
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-accent/30 rounded-3xl border border-dashed border-border max-w-2xl mx-auto">
              <div className="inline-flex w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
                <Beaker className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">لا توجد مواد متاحة حالياً</h3>
              <p className="text-muted-foreground">سيتم إضافة المواد الدراسية قريباً.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
