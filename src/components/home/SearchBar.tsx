import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, BookOpen, GraduationCap, Baby, Route, Target, ArrowLeft, Lock } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { isProfileComplete, canAccessStageGrade } from "@/lib/profile";

const stageIcons: Record<string, React.ElementType> = {
  elementary: Baby,
  middle: BookOpen,
  high: GraduationCap,
  paths: Route,
  qudurat: Target,
};

const stageColors: Record<string, string> = {
  elementary: "text-sky-500",
  middle: "text-emerald-500",
  high: "text-violet-500",
  paths: "text-amber-500",
  qudurat: "text-rose-500",
};

const stageBgColors: Record<string, string> = {
  elementary: "bg-sky-100",
  middle: "bg-emerald-100",
  high: "bg-violet-100",
  paths: "bg-amber-100",
  qudurat: "bg-rose-100",
};

// Sample search data - in real app this would come from API
// Note: hrefs are now generated dynamically to point to first lesson
const searchableItems = [
  // Elementary
  { title: "الرياضيات - الصف الأول", stage: "elementary", stageLabel: "ابتدائي", subject: "math", gradeId: "1" },
  { title: "لغتي - الصف الثاني", stage: "elementary", stageLabel: "ابتدائي", subject: "arabic", gradeId: "2" },
  { title: "العلوم - الصف الثالث", stage: "elementary", stageLabel: "ابتدائي", subject: "science", gradeId: "3" },
  // Middle
  { title: "الرياضيات - الأول متوسط", stage: "middle", stageLabel: "متوسط", subject: "math", gradeId: "1" },
  { title: "العلوم - الثاني متوسط", stage: "middle", stageLabel: "متوسط", subject: "science", gradeId: "2" },
  { title: "الدراسات الاجتماعية - الثالث متوسط", stage: "middle", stageLabel: "متوسط", subject: "social", gradeId: "3" },
  // High
  { title: "الرياضيات - الأول ثانوي", stage: "high", stageLabel: "ثانوي", subject: "math", gradeId: "1" },
  { title: "الفيزياء - الثاني ثانوي", stage: "high", stageLabel: "ثانوي", subject: "physics", gradeId: "2" },
  { title: "الكيمياء - الثالث ثانوي", stage: "high", stageLabel: "ثانوي", subject: "chemistry", gradeId: "3" },
  // Qudurat
  { title: "اختبار القدرات العامة", stage: "qudurat", stageLabel: "قدرات", subject: "verbal", gradeId: "qudurat" },
  { title: "اختبار التحصيل الدراسي", stage: "qudurat", stageLabel: "تحصيلي", subject: "tahsili", gradeId: "tahsili" },
  // Paths
  { title: "مسار علوم الحاسب", stage: "paths", stageLabel: "مسارات", subject: "cs", gradeId: "cs" },
  { title: "مسار الصحة والحياة", stage: "paths", stageLabel: "مسارات", subject: "health", gradeId: "health" },
];

export function SearchBar() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof searchableItems>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const profileComplete = isProfileComplete(user);

  useEffect(() => {
    if (query.length >= 2) {
      let filtered = searchableItems.filter(
        (item) =>
          item.title.includes(query) ||
          item.subject.includes(query) ||
          item.stageLabel.includes(query)
      );
      if (profileComplete && user) {
        filtered = filtered.filter((item) => canAccessStageGrade(item.stage, item.gradeId, user));
      }
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, profileComplete, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <section className="py-8 -mt-8 relative z-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          ref={containerRef}
          className="max-w-3xl mx-auto relative"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-cyan-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <Search className="w-6 h-6 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="ابحث عن مادة أو صف دراسي..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:text-muted-foreground/60"
                  data-testid="input-search"
                />
                {query && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleClear}
                    className="shrink-0"
                    data-testid="button-search-clear"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 overflow-hidden z-50"
              >
                <div className="p-2 max-h-96 overflow-y-auto">
                  {results.map((item, index) => {
                    const Icon = stageIcons[item.stage] || BookOpen;
                    // Map stage ID to URL stage name
                    const stageUrlMap: Record<string, string> = {
                      elementary: "primary",
                      middle: "middle",
                      high: "secondary",
                    };
                    const urlStage = stageUrlMap[item.stage] || item.stage;
                    // Navigate to lesson page without lessonId to show welcome message
                    const href = `/lesson/${urlStage}/${item.subject}`;
                    
                    return (
                      <Link
                        key={index}
                        href={href}
                        onClick={() => setIsOpen(false)}
                        data-testid={`search-result-${index}`}
                      >
                        <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover-elevate cursor-pointer">
                          <div className={`w-10 h-10 rounded-xl ${stageBgColors[item.stage]} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${stageColors[item.stage]}`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{item.title}</div>
                            <div className="text-sm text-muted-foreground">{item.stageLabel}</div>
                          </div>
                          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {isOpen && results.length === 0 && query.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border/50 p-8 text-center"
              >
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">لم نجد نتائج لـ "{query}"</p>
                <p className="text-sm text-muted-foreground/70 mt-1">جرّب البحث بكلمات أخرى</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
