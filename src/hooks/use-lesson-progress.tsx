import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

type TabType = "lesson" | "video" | "questions" | "tests";

interface TabProgress {
  lesson: boolean;
  video: boolean;
  questions: number; // 0-33.34 based on correct answers percentage
  tests: boolean;
}

interface ApiProgressItem {
  subjectSlug: string;
  lessonId: string;
  lessonCompleted?: boolean;
  videoCompleted?: boolean;
  questionsScore?: number;
  totalProgress?: string;
}

interface LessonProgress {
  completedTabs: Record<string, Record<string, TabProgress>>;
  markTabComplete: (subjectSlug: string, lessonId: string, tab: TabType, score?: number) => void;
  hydrateFromApi: (items: ApiProgressItem[]) => void;
  markTabIncomplete: (subjectSlug: string, lessonId: string, tab: TabType) => void;
  isTabCompleted: (subjectSlug: string, lessonId: string, tab: TabType) => boolean;
  getTabScore: (subjectSlug: string, lessonId: string, tab: TabType) => number;
  getLessonProgress: (subjectSlug: string, lessonId: string) => number;
  isCompleted: (subjectSlug: string, lessonId: string) => boolean;
  markComplete: (subjectSlug: string, lessonId: string) => void;
  markIncomplete: (subjectSlug: string, lessonId: string) => void;
  getProgress: (subjectSlug: string, totalLessons: number) => { completed: number; percentage: number };
}

const LessonProgressContext = createContext<LessonProgress | null>(null);

const STORAGE_KEY = "sharaf_lesson_progress_v2";

const defaultTabProgress: TabProgress = {
  lesson: false,
  video: false,
  questions: 0,
  tests: false,
};

// Progress distribution: 33.33% for lesson and video, 33.34% for questions (total = 100%)
const PROGRESS_PER_TAB = 33.33; // For lesson and video tabs
const QUESTIONS_PROGRESS_MAX = 33.34; // For questions tab (to ensure total = 100%)

export function LessonProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [completedTabs, setCompletedTabs] = useState<Record<string, Record<string, TabProgress>>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load progress from storage", e);
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedTabs));
    } catch (e) {
      console.error("Failed to save progress to storage", e);
    }
  }, [completedTabs]);

  const hydrateFromApi = useCallback((items: ApiProgressItem[]) => {
    if (!items?.length) return;
    setCompletedTabs(prev => {
      let next = { ...prev };
      for (const item of items) {
        const { subjectSlug, lessonId, lessonCompleted, videoCompleted, questionsScore } = item;
        const subjectProgress = next[subjectSlug] || {};
        const lessonProgress = subjectProgress[lessonId] || { ...defaultTabProgress };
        if (lessonCompleted) lessonProgress.lesson = true;
        if (videoCompleted) lessonProgress.video = true;
        if (questionsScore != null) {
          lessonProgress.questions = questionsScore >= 100 ? QUESTIONS_PROGRESS_MAX : Math.round((questionsScore / 100) * QUESTIONS_PROGRESS_MAX * 100) / 100;
        }
        next = {
          ...next,
          [subjectSlug]: { ...subjectProgress, [lessonId]: lessonProgress },
        };
      }
      return next;
    });
  }, []);

  // تحميل التقدم من API عند تسجيل الدخول
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/progress/user?userId=${user.id}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then((data: ApiProgressItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          hydrateFromApi(data);
        }
      })
      .catch(() => {});
  }, [user?.id, hydrateFromApi]);

  const markTabComplete = (subjectSlug: string, lessonId: string, tab: TabType, score?: number) => {
    setCompletedTabs(prev => {
      const subjectProgress = prev[subjectSlug] || {};
      const lessonProgress = subjectProgress[lessonId] || { ...defaultTabProgress };
      
      let value: boolean | number;
      if (tab === "questions") {
        // For questions, store the score (0-33.34) based on correct answers percentage
        // score is 0-100 (percentage), convert to 0-33.34
        const percentage = score !== undefined ? score : 100;
        if (percentage >= 100) {
          // Full completion = 33.34% to ensure total = 100%
          value = QUESTIONS_PROGRESS_MAX;
        } else {
          // Partial completion = percentage of 33.34
          value = Math.round((percentage / 100) * QUESTIONS_PROGRESS_MAX * 100) / 100; // Round to 2 decimals
        }
      } else {
        value = true;
      }
      
      return {
        ...prev,
        [subjectSlug]: {
          ...subjectProgress,
          [lessonId]: {
            ...lessonProgress,
            [tab]: value,
          },
        },
      };
    });
  };

  const markTabIncomplete = (subjectSlug: string, lessonId: string, tab: TabType) => {
    setCompletedTabs(prev => {
      const subjectProgress = prev[subjectSlug] || {};
      const lessonProgress = subjectProgress[lessonId] || { ...defaultTabProgress };
      return {
        ...prev,
        [subjectSlug]: {
          ...subjectProgress,
          [lessonId]: {
            ...lessonProgress,
            [tab]: tab === "questions" ? 0 : false,
          },
        },
      };
    });
  };

  const isTabCompleted = (subjectSlug: string, lessonId: string, tab: TabType): boolean => {
    const value = completedTabs[subjectSlug]?.[lessonId]?.[tab];
    if (tab === "questions") {
      return (value as number) > 0;
    }
    return Boolean(value);
  };

  const getTabScore = (subjectSlug: string, lessonId: string, tab: TabType) => {
    const value = completedTabs[subjectSlug]?.[lessonId]?.[tab];
    if (tab === "questions") {
      return (value as number) || 0;
    }
    return value ? PROGRESS_PER_TAB : 0;
  };

  const getLessonProgress = (subjectSlug: string, lessonId: string) => {
    const tabs = completedTabs[subjectSlug]?.[lessonId];
    if (!tabs) return 0;
    
    let total = 0;
    if (tabs.lesson) total += PROGRESS_PER_TAB;
    if (tabs.video) total += PROGRESS_PER_TAB;
    total += tabs.questions; // Already 0-33.34
    // Note: tests tab is not included in the 3 main tabs (lesson, video, questions)
    
    // Round to 2 decimals to avoid floating point issues, but ensure it doesn't exceed 100
    const rounded = Math.round(total * 100) / 100;
    return Math.min(rounded, 100);
  };

  const isCompleted = (subjectSlug: string, lessonId: string) => {
    const progress = getLessonProgress(subjectSlug, lessonId);
    return Math.round(progress) >= 100; // Round to handle floating point precision
  };

  const markComplete = (subjectSlug: string, lessonId: string) => {
    setCompletedTabs(prev => {
      const subjectProgress = prev[subjectSlug] || {};
      return {
        ...prev,
        [subjectSlug]: {
          ...subjectProgress,
          [lessonId]: {
            lesson: true,
            video: true,
            questions: QUESTIONS_PROGRESS_MAX,
            tests: true,
          },
        },
      };
    });
  };

  const markIncomplete = (subjectSlug: string, lessonId: string) => {
    setCompletedTabs(prev => {
      const subjectProgress = prev[subjectSlug] || {};
      return {
        ...prev,
        [subjectSlug]: {
          ...subjectProgress,
          [lessonId]: { ...defaultTabProgress },
        },
      };
    });
  };

  const getProgress = (subjectSlug: string, totalLessons: number) => {
    const subjectProgress = completedTabs[subjectSlug] || {};
    let totalProgress = 0;
    
    for (const lessonId in subjectProgress) {
      const tabs = subjectProgress[lessonId];
      let lessonTotal = 0;
      if (tabs.lesson) lessonTotal += PROGRESS_PER_TAB;
      if (tabs.video) lessonTotal += PROGRESS_PER_TAB;
      lessonTotal += tabs.questions; // 0-33.34
      // Note: tests tab is not included in the 3 main tabs
      totalProgress += lessonTotal;
    }
    
    const maxProgress = totalLessons * 100;
    const percentage = maxProgress > 0 ? Math.round((totalProgress / maxProgress) * 100) : 0;
    const completed = Object.keys(subjectProgress).filter(lessonId => {
      const tabs = subjectProgress[lessonId];
      // Check if all 3 main tabs are completed (lesson, video, questions)
      return tabs.lesson && tabs.video && tabs.questions >= QUESTIONS_PROGRESS_MAX;
    }).length;
    
    return { completed, percentage };
  };

  return (
    <LessonProgressContext.Provider value={{ 
      completedTabs, 
      markTabComplete, 
      markTabIncomplete, 
      isTabCompleted,
      getTabScore,
      getLessonProgress,
      markComplete, 
      markIncomplete, 
      isCompleted, 
      getProgress,
      hydrateFromApi,
    }}>
      {children}
    </LessonProgressContext.Provider>
  );
}

export function useLessonProgress() {
  const context = useContext(LessonProgressContext);
  if (!context) {
    throw new Error("useLessonProgress must be used within a LessonProgressProvider");
  }
  return context;
}
