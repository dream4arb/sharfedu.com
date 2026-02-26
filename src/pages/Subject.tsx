import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Play, CheckCircle, Clock, BookOpen, Home, LayoutDashboard, Calculator } from "lucide-react";
import { lessonsData, subjectNames, subjectsData, getSemestersForSidebar } from "@/data/lessons";
import { useLessonProgress } from "@/hooks/use-lesson-progress";

const stageNames: Record<string, string> = {
  elementary: "المرحلة الابتدائية",
  middle: "المرحلة المتوسطة",
  high: "المرحلة الثانوية",
  paths: "المسارات",
  qudurat: "القدرات والتحصيلي",
};

const gradeNames: Record<string, Record<string, string>> = {
  elementary: {
    "1": "الصف الأول",
    "2": "الصف الثاني",
    "3": "الصف الثالث",
    "4": "الصف الرابع",
    "5": "الصف الخامس",
    "6": "الصف السادس",
  },
  middle: {
    "1": "الصف الأول متوسط",
    "2": "الصف الثاني متوسط",
    "3": "الصف الثالث متوسط",
  },
  high: {
    "1": "الصف الأول ثانوي",
    "2": "الصف الثاني ثانوي",
    "3": "الصف الثالث ثانوي",
  },
  paths: {
    general: "المسار العام",
    cs: "مسار علوم الحاسب",
    health: "مسار الصحة والحياة",
    business: "مسار إدارة الأعمال",
    shariah: "مسار الشريعة",
  },
  qudurat: {
    qudurat: "اختبار القدرات",
    tahsili: "اختبار التحصيلي",
    step: "اختبار STEP",
  },
};

const stageGradients: Record<string, string> = {
  elementary: "from-sky-400 to-blue-500",
  middle: "from-emerald-400 to-teal-500",
  high: "from-violet-400 to-purple-500",
  paths: "from-amber-400 to-orange-500",
  qudurat: "from-rose-400 to-pink-500",
};

export default function Subject() {
  const { stageId, gradeId, subjectId } = useParams<{ stageId: string; gradeId: string; subjectId: string }>();
  const { isCompleted, getProgress, getLessonProgress } = useLessonProgress();
  
  // Map stage ID to URL stage name
  const stageUrlMap: Record<string, string> = {
    elementary: "primary",
    middle: "middle",
    high: "secondary",
  };
  
  const stageName = stageNames[stageId || ""] || "المرحلة";
  const gradeName = gradeNames[stageId || ""]?.[gradeId || ""] || "الصف";
  const subjectName = subjectNames[subjectId || ""] || "المادة";
  const lessons = lessonsData[subjectId || ""] || [];
  const gradient = stageGradients[stageId || ""] || "from-sky-400 to-blue-500";
  
  const subjectData = subjectsData[stageId || ""]?.find(s => s.slug === subjectId);
  const semesters = getSemestersForSidebar(subjectData?.semesters, lessons);

  // حفظ الصف والمرحلة للاستخدام في صفحة الدرس
  useEffect(() => {
    if (stageId && gradeId) {
      sessionStorage.setItem("lesson_grade", gradeId);
      sessionStorage.setItem("lesson_stage", stageId);
    }
  }, [stageId, gradeId]);
  
  // Get subject icon
  const SubjectIcon = subjectData?.icon || Calculator;
  
  const { completed, percentage } = getProgress(subjectId || "", lessons.length);
  const total = lessons.length;

  const getTotalLessonsInSemester = (semester: typeof semesters[0]) => {
    if ('chapters' in semester && semester.chapters) {
      return semester.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    }
    return 0;
  };

  // Get first lesson ID from a semester
  const getFirstLessonId = (semester: typeof semesters[0]) => {
    if ('chapters' in semester && semester.chapters && semester.chapters.length > 0) {
      const firstChapter = semester.chapters[0];
      if (firstChapter.lessons && firstChapter.lessons.length > 0) {
        return firstChapter.lessons[0].id;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-28 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors" data-testid="link-breadcrumb-home">الرئيسية</Link>
            <ArrowLeft className="w-4 h-4" />
            <Link href={`/stage/${stageId}`} className="hover:text-primary transition-colors" data-testid="link-breadcrumb-stage">{stageName}</Link>
            <ArrowLeft className="w-4 h-4" />
            <span className="text-foreground font-medium">{gradeName} - {subjectName}</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 overflow-hidden mb-8"
          >
            <div className={`p-6 bg-gradient-to-l ${gradient} text-white`}>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-white mb-1">{subjectName} - {gradeName}</h1>
                      <p className="text-white/80 text-sm">{stageName} · {lessons.length} درس متاح</p>
                    </div>
                    {/* Navigation Icons - Positioned at the far right, side by side */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href="/dashboard" className="flex-shrink-0 block">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 rounded-xl h-10 w-10 border border-white/30 bg-white/10 transition-all hover:scale-105"
                                data-testid="button-dashboard-icon"
                                aria-label="لوحة التحكم"
                              >
                                <LayoutDashboard className="w-5 h-5 stroke-2" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm z-50">
                            <p>لوحة التحكم</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href="/" className="flex-shrink-0 block">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 rounded-xl h-10 w-10 border border-white/30 bg-white/10 transition-all hover:scale-105"
                                data-testid="button-home-icon"
                                aria-label="الصفحة الرئيسية"
                              >
                                <Home className="w-5 h-5 stroke-2" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm z-50">
                            <p>الصفحة الرئيسية</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 min-w-[140px]">
                  <div className="text-center">
                    <div className="text-3xl font-black">{percentage}%</div>
                    <div className="text-sm text-white/80">نسبة التقدم</div>
                    <div className="text-xs text-white/60 mt-1">{completed} من {total} درس</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 bg-white/20 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Welcome Placeholder - Show when page first loads */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 p-12 flex flex-col items-center justify-center min-h-[400px] text-center mb-8"
          >
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg`}>
              <SubjectIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">
              مرحباً بك في مادة {subjectName} - {gradeName}
            </h2>
            <p className="text-base text-muted-foreground max-w-md">
              اختر درساً من القائمة للبدء
            </p>
          </motion.div>

          {semesters.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-4 mb-8"
            >
              {semesters.map((semester, semesterIndex) => {
                const firstLessonId = getFirstLessonId(semester);
                const semesterTotalLessons = getTotalLessonsInSemester(semester);
                const urlStage = stageId ? (stageUrlMap[stageId] || stageId) : "primary";
                
                return (
                  <Link
                    key={semester.id}
                    href={firstLessonId ? `/lesson/${urlStage}/${subjectId}/${firstLessonId}` : `#`}
                    className="flex-1 min-w-[280px]"
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: semesterIndex * 0.1 }}
                      className={`p-6 rounded-2xl shadow-lg border border-border/50 overflow-hidden bg-gradient-to-l ${gradient} text-white cursor-pointer hover:shadow-xl transition-all hover:scale-105`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-sm font-bold text-xl">
                          {semesterIndex + 1}
                        </div>
                        <div className="flex-1 text-right">
                          <h3 className="font-bold text-xl mb-1">{semester.name}</h3>
                          <p className="text-sm text-white/80">{semesterTotalLessons} درس - {semester.chapters?.length || 0} فصول</p>
                        </div>
                        <ArrowLeft className="w-5 h-5 text-white/80" />
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson, index) => {
                const lessonProg = getLessonProgress(subjectId || "", lesson.id);
                const lessonProgRounded = Math.round(lessonProg);
                const lessonCompleted = lessonProgRounded >= 100;
                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={`/lesson/${stageId ? (stageUrlMap[stageId] || stageId) : "primary"}/${subjectId}/${lesson.id}`}
                      data-testid={`link-lesson-${lesson.id}`}
                    >
                      <div className={`
                        group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer hover-elevate
                        ${lessonCompleted 
                          ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" 
                          : "bg-white dark:bg-card border-border/50 hover:border-primary/30 hover:shadow-md"
                        }
                      `}>
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                          ${lessonCompleted 
                            ? "bg-emerald-500 text-white" 
                            : `bg-gradient-to-br ${gradient} text-white`
                          }
                        `}>
                          {lessonCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <span className="font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold truncate ${lessonCompleted ? "text-emerald-700 dark:text-emerald-300" : "group-hover:text-primary"} transition-colors`}>
                            {lesson.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {lesson.duration}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                          lessonProgRounded >= 100 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : 
                          lessonProgRounded === 0 ? "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" :
                          "bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400"
                        }`}>
                          الإنجاز {lessonProgRounded}%
                        </span>
                        <Button
                          size="icon"
                          variant={lessonCompleted ? "outline" : "default"}
                          className={`shrink-0 ${lessonCompleted ? "border-emerald-300" : ""}`}
                          data-testid={`button-play-${lesson.id}`}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}

          {lessons.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="text-xl font-bold text-muted-foreground mb-2">لا توجد دروس متاحة</h2>
              <p className="text-muted-foreground/80">سيتم إضافة الدروس قريباً</p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link href={`/stage/${stageId}`}>
              <Button variant="outline" className="gap-2" data-testid="button-back-stage">
                <ArrowRight className="w-4 h-4" />
                العودة إلى {stageName}
              </Button>
            </Link>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
