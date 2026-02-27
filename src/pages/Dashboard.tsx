import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useToast } from "@/hooks/use-toast";
import { usePageSeo } from "@/hooks/use-page-seo";
import { subjectsData as sharedSubjectsData, lessonsData } from "@/data/lessons";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  Loader2, BookOpen, Clock, Star, Trophy, Calendar, 
  Home, GraduationCap, Play, FileText,
  Baby, Route, Target, CheckCircle, Lock, Flame, Crown, Beaker,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const sidebarItems = [
  { id: "home", label: "لوحة التحكم", icon: Home },
  { id: "lessons", label: "دروسي", icon: BookOpen },
  { id: "schedule", label: "جدول المذاكرة", icon: Calendar },
  { id: "achievements", label: "الإنجازات", icon: Trophy },
];

const stages = [
  { id: "elementary", name: "الابتدائية", icon: Baby, color: "from-sky-400 to-blue-500", grades: "1-6" },
  { id: "middle", name: "المتوسطة", icon: BookOpen, color: "from-emerald-400 to-teal-500", grades: "1-3" },
  { id: "high", name: "الثانوية", icon: GraduationCap, color: "from-violet-400 to-purple-500", grades: "1-3" },
  { id: "paths", name: "المسارات", icon: Route, color: "from-amber-400 to-orange-500", grades: "" },
  { id: "qudurat", name: "القدرات والتحصيلي", icon: Target, color: "from-rose-400 to-pink-500", grades: "" },
];

const achievementsData = [
  { title: "المتعلم المبتدئ", desc: "أكمل 5 دروس", icon: Target, color: "bg-blue-100 text-blue-600", unlocked: true },
  { title: "نجم الرياضيات", desc: "أكمل مادة الرياضيات", icon: Star, color: "bg-amber-100 text-amber-600", unlocked: true },
  { title: "المثابر", desc: "ادخل 7 أيام متتالية", icon: Flame, color: "bg-orange-100 text-orange-600", unlocked: true },
  { title: "عبقري العلوم", desc: "أكمل مادة العلوم", icon: Beaker, color: "bg-emerald-100 text-emerald-600", unlocked: false },
  { title: "متفوق", desc: "احصل على 90% في اختبار", icon: Trophy, color: "bg-violet-100 text-violet-600", unlocked: false },
  { title: "خبير", desc: "أكمل جميع المواد", icon: Crown, color: "bg-rose-100 text-rose-600", unlocked: false },
];


export default function Dashboard() {
  usePageSeo({
    title: "لوحة التحكم",
    description: "لوحة تحكم الطالب على منصة شارف التعليمية. تتبع تقدمك الدراسي واستكمل دروسك واختباراتك.",
    keywords: "لوحة التحكم, تقدم الطالب, دروسي, شارف, تعليم",
  });
  const { user } = useAuth();
  const { getProgress, isCompleted } = useLessonProgress();
  const { toast } = useToast();
  
  const u = user as { stageSlug?: string; gradeId?: string; email?: string; firstName?: string; lastName?: string; profileImageUrl?: string } | undefined;
  const selectedStage = u?.stageSlug || null;
  const selectedGradeId = u?.gradeId || null;
  const [activeSection, setActiveSection] = useState("home");

  const subjects = selectedStage ? (sharedSubjectsData[selectedStage] || []).map(s => ({
    ...s,
    lessons: s.lessons.length,
  })) : [];
  const currentStage = stages.find(s => s.id === selectedStage);

  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-accent/30" dir="rtl">
      <SidebarProvider style={sidebarStyle}>
        <div className="flex h-screen w-full">
          {/* Sidebar */}
          <Sidebar side="right" className="border-l border-border/50">
            <SidebarHeader className="p-4 border-b border-border/50">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                  <span className="text-white font-black text-lg">ش</span>
                </div>
                <div>
                  <span className="text-lg font-black block leading-none">شـارف</span>
                  <span className="text-xs text-muted-foreground">التعليمية</span>
                </div>
              </Link>
            </SidebarHeader>

            {/* Current Stage - الحقول قابلة للتعديل دائماً */}
            {currentStage && (
              <div className="p-3 mx-3 mt-3 rounded-xl bg-accent/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <currentStage.icon className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-sm">{currentStage.name}</span>
                  </div>
                  <Link href="/complete-profile" className="text-xs text-primary hover:underline" data-testid="button-change-stage">
                    تغيير
                  </Link>
                </div>
              </div>
            )}

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setActiveSection(item.id)}
                            className="gap-3"
                            data-testid={`sidebar-${item.id}`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold">{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white font-bold">
                  {user?.firstName?.charAt(0) || "ط"}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{user?.firstName || "طالب"}</div>
                  <div className="text-xs text-muted-foreground">{currentStage?.name || "اختر مرحلتك"}</div>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <header className="sticky top-0 z-10 bg-accent/30 backdrop-blur-sm border-b border-border/50 p-4 flex items-center gap-4">
              <SidebarTrigger data-testid="button-toggle-sidebar" />
              <h1 className="text-lg font-bold" data-testid="text-dashboard-title">
                {activeSection === "home" && "لوحة التحكم"}
                {activeSection === "lessons" && "دروسي"}
                {activeSection === "schedule" && "جدول المذاكرة"}
                {activeSection === "achievements" && "الإنجازات"}
              </h1>
            </header>

            <div className="p-6 lg:p-8">
              {/* Home Section */}
              {activeSection === "home" && (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h2 className="text-2xl font-black mb-2">مرحباً بك!</h2>
                    <p className="text-muted-foreground">
                      أهلاً {user?.firstName || "طالب العلم"}، واصل تقدمك نحو التفوق!
                    </p>
                  </motion.div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: "مواد نشطة", value: subjects.length, icon: BookOpen, color: "bg-primary/10 text-primary" },
                      { label: "ساعة تعلم", value: "12", icon: Clock, color: "bg-emerald-100 text-emerald-600" },
                      { label: "نقطة تميز", value: "850", icon: Star, color: "bg-amber-100 text-amber-600" },
                      { label: "إنجاز", value: "15", icon: Trophy, color: "bg-violet-100 text-violet-600" },
                    ].map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-border/50"
                      >
                        <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="text-2xl font-black">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Quick Access to Subjects */}
                  <h2 className="text-xl font-bold mb-4">المواد الدراسية</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {subjects.slice(0, 6).map((subject, index) => {
                      const Icon = subject.icon;
                      const { completed, percentage } = getProgress(subject.slug, subject.lessons);
                      return (
                        <motion.div
                          key={subject.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow cursor-pointer hover-elevate"
                          onClick={() => setActiveSection("lessons")}
                          data-testid={`card-subject-${index}`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl ${subject.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-primary">{percentage}%</span>
                          </div>
                          <h3 className="font-bold mb-2">{subject.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <span>{completed}/{subject.lessons} درس</span>
                          </div>
                          <div className="h-2 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-l from-primary to-cyan-400 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Lessons Section */}
              {activeSection === "lessons" && (
                <div className="space-y-6">
                  {subjects.map((subject, index) => {
                    const Icon = subject.icon;
                    const { completed, percentage } = getProgress(subject.slug, subject.lessons);
                    return (
                      <motion.div
                        key={subject.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden"
                      >
                        <div className="p-6 border-b border-border/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl ${subject.color} flex items-center justify-center`}>
                                <Icon className="w-7 h-7" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{subject.name}</h3>
                                <p className="text-sm text-muted-foreground">{completed} من {subject.lessons} درس مكتمل</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="text-2xl font-black text-primary">{percentage}%</div>
                              <div className="text-xs text-muted-foreground">التقدم</div>
                            </div>
                          </div>
                          <div className="mt-4 h-3 bg-accent rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-l from-primary to-cyan-400 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Lessons List */}
                        <div className="p-4 space-y-2">
                          {(lessonsData[subject.slug] || []).map((lesson, i) => {
                            const lessonCompleted = isCompleted(subject.slug, lesson.id);
                            const prevCompleted = i === 0 || isCompleted(subject.slug, (lessonsData[subject.slug] || [])[i - 1]?.id || "");
                            const isCurrent = !lessonCompleted && prevCompleted;
                            const isLocked = !lessonCompleted && !prevCompleted;
                            // Map stage ID to URL stage name
                            const stageUrlMap: Record<string, string> = {
                              elementary: "primary",
                              middle: "middle",
                              high: "secondary",
                            };
                            const urlStage = selectedStage ? (stageUrlMap[selectedStage] || selectedStage) : "primary";
                            return (
                              <Link
                                key={lesson.id}
                                href={isLocked ? "#" : `/lesson/${urlStage}/${subject.slug}/${lesson.id}`}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                                  isCurrent ? "bg-primary/10" : "hover:bg-accent"
                                } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                onClick={(e) => {
                                  if (isLocked) e.preventDefault();
                                  else if (selectedStage && selectedGradeId) {
                                    sessionStorage.setItem("lesson_grade", selectedGradeId);
                                    sessionStorage.setItem("lesson_stage", selectedStage);
                                  }
                                }}
                                data-testid={`link-lesson-${subject.slug}-${lesson.id}`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  lessonCompleted ? "bg-green-100 text-green-600" : 
                                  isCurrent ? "bg-primary text-white" : 
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {lessonCompleted ? <CheckCircle className="w-5 h-5" /> : 
                                   isCurrent ? <Play className="w-5 h-5" /> : 
                                   <Lock className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-sm">الدرس {i + 1}: {lesson.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Play className="w-3 h-3" /> فيديو {lesson.duration}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" /> ملف PDF
                                    </span>
                                  </div>
                                </div>
                                {isCurrent && (
                                  <Button size="sm" className="rounded-lg" data-testid={`button-start-lesson-${i}`}>
                                    ابدأ
                                  </Button>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Schedule Section */}
              {activeSection === "schedule" && (
                <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-border/50 p-8 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">جدول المذاكرة</h3>
                  <p className="text-muted-foreground mb-4">سيتم إضافة ميزة جدول المذاكرة قريباً</p>
                  <Button variant="outline" className="rounded-full" data-testid="button-notify-schedule" onClick={() => toast({ title: "تم التفعيل", description: "سيتم إشعارك عند توفر جدول المذاكرة" })}>إشعاري عند التوفر</Button>
                </div>
              )}

              {/* Achievements Section */}
              {activeSection === "achievements" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievementsData.map((achievement, index) => {
                    const Icon = achievement.icon;
                    return (
                      <motion.div
                        key={achievement.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-border/50 text-center ${
                          !achievement.unlocked && "opacity-50"
                        }`}
                        data-testid={`card-achievement-${index}`}
                      >
                        <div className={`w-16 h-16 rounded-2xl ${achievement.color} flex items-center justify-center mx-auto mb-3`}>
                          <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold mb-1">{achievement.title}</h3>
                        <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                        {achievement.unlocked && (
                          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-green-600 font-semibold">
                            <CheckCircle className="w-3 h-3" />
                            مكتمل
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
