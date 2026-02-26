import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useCmsTabContent } from "@/hooks/use-cms-tab-content";
import { usePublicStructure } from "@/hooks/use-public-structure";
import { lessonsData, getSubjectName, subjectsData, getSemestersForSidebar, ensureTwoSemestersWithAttachments, type SemesterData, type LessonData } from "@/data/lessons";
import { setPageMeta } from "@/lib/seo";
import { type MathTestData } from "@/data/math-tests-final";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { 
  Loader2, Play, FileText, Download, CheckCircle,
  Lock, ArrowRight, Home, BookOpen, Check, Video, Clock,
  ClipboardList, BookOpenCheck, ChevronDown, ChevronUp, X, RotateCcw, Paperclip, GraduationCap, HelpCircle, Sparkles
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from "@/components/ui/sidebar";
import PolygonAnglesQuizSSA from "@/components/lessons/PolygonAnglesQuizSSA";

type TabType = "lesson" | "video" | "summary" | "education" | "ssa";

const tabs = [
  { id: "lesson" as TabType, label: "الدرس", icon: BookOpenCheck },
  { id: "video" as TabType, label: "الفيديو", icon: Video },
  { id: "ssa" as TabType, label: "شارف AI", icon: Sparkles },
  { id: "summary" as TabType, label: "الملخص", icon: FileText },
];

function scopeEducationCss(css: string, scopeClass = ".education-sandbox") {
  if (!css || css.trim().length === 0) return "";

  // 1) Keep variables local (avoid leaking to :root / body / html)
  let out = css;
  out = out.replace(/:root\b/g, scopeClass);
  out = out.replace(/\bhtml\b/g, scopeClass);
  out = out.replace(/\bbody\b/g, scopeClass);

  // 2) Prefix normal selectors with the sandbox class
  // - Skip at-rules (@keyframes/@font-face/...)
  // - Skip keyframe steps (from/to/0%/100%)
  out = out.replace(/(^|}\s*)([^@}{][^{]+)\{/g, (m, prefix, selectorGroup) => {
    const raw = String(selectorGroup || "").trim();
    if (!raw) return m;

    const isKeyframeStep = /^(from|to|\d+%)(\s*,\s*(from|to|\d+%))*\s*$/i.test(raw);
    if (isKeyframeStep) return m;

    const scoped = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith(scopeClass) ? s : `${scopeClass} ${s}`))
      .join(", ");

    return `${prefix}${scoped}{`;
  });

  return out;
}

/** عنوان الدرس المعروض - يُفضّل التعديل من لوحة التحكم عند توفره (لا نعرض المعرف إن بدا كمعرف تلقائي) */
function getLessonDisplayTitle(lesson: { id: string; title: string }, titlesFromApi: Record<string, string>): string {
  const fromApi = titlesFromApi[lesson.id];
  if (fromApi) return fromApi;
  const t = lesson.title?.trim() || "";
  if (t && !/^[a-z]-[a-z0-9]+$/i.test(t)) return t;
  return "درس";
}

/** دمج بيانات الدرس الثابتة (duration, videoUrl) مع العنوان من الهيكل المحدث */
function mergeLessonWithApi(staticLesson: LessonData | undefined, apiId: string, apiTitle: string): LessonData {
  return {
    ...(staticLesson ?? { id: apiId, title: apiTitle, duration: "—", videoUrl: "" }),
    id: apiId,
    title: apiTitle,
  } as LessonData;
}

/** مكوّن مستقل لتبويب الفيديو — يدير اختيار الفيديو بحالة داخلية لضمان عمل النقر */
function VideoTabContent({
  videos,
  metadata,
  lessonTitle,
}: {
  videos: { url: string; title?: string; channelName?: string; duration?: string }[];
  metadata: Record<string, { title: string; channelName: string; duration: string }>;
  lessonTitle: string;
}) {
  const extractId = (url: string) => {
    const m = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/);
    return m ? m[1] : null;
  };
  const toEmbed = (url: string) => {
    if (url.includes("/embed/")) return url.replace("youtube.com", "youtube-nocookie.com");
    const id = extractId(url);
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : url;
  };

  const firstEmbed = videos[0] ? toEmbed(videos[0].url) : null;
  const [selectedUrl, setSelectedUrl] = useState<string | null>(firstEmbed);

  useEffect(() => {
    setSelectedUrl(firstEmbed);
  }, [firstEmbed]);

  const selectedId = selectedUrl ? extractId(selectedUrl) : null;
  const selectedMeta = selectedId
    ? Object.entries(metadata).find(([u]) => extractId(u) === selectedId)?.[1]
    : null;

  const finalSrc = selectedUrl
    ? selectedUrl + "?rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=1&controls=1&disablekb=0&autoplay=0"
    : "";

  if (videos.length === 0) return null;

  return (
    <>
      <div className="mb-8">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-xl">
          <iframe
            key={selectedUrl}
            src={finalSrc}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            title={lessonTitle}
          />
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-bold mb-4 text-foreground" id="video-list-heading">فيديوهات أخرى لنفس الدرس</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {videos.map((v, i) => {
            const emb = toEmbed(v.url);
            const vid = extractId(v.url);
            const isActive = vid && selectedId && vid === selectedId;
            const meta = metadata[v.url] || {
              title: v.title || (i === 0 ? lessonTitle : `فيديو ${i + 1}`),
              channelName: v.channelName || "قناة تعليمية",
              duration: v.duration || "غير محدد",
            };
            const thumb = vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : "";
            return (
              <div
                key={v.url + i}
                role="button"
                tabIndex={0}
                aria-pressed={isActive === true ? true : isActive === false ? false : undefined}
                className={`rounded-xl overflow-hidden border-2 cursor-pointer select-none transition-all duration-300 text-right flex sm:flex-col flex-row ${
                  isActive ? "border-primary shadow-xl shadow-primary/30 ring-2 ring-primary/50 bg-primary/10" : "border-border hover:border-primary/50 hover:ring-2 hover:ring-primary/20"
                }`}
                onClick={() => setSelectedUrl(emb)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedUrl(emb); } }}
              >
                <div className="relative aspect-video bg-black w-32 sm:w-full shrink-0">
                  <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <div className={`absolute inset-0 flex items-center justify-center ${isActive ? "bg-black/20" : "bg-black/40 hover:bg-black/30"}`}>
                    <Play className={`w-8 h-8 sm:w-12 sm:h-12 text-white ${isActive ? "opacity-100" : "opacity-80"}`} />
                  </div>
                </div>
                <div className={`p-2.5 sm:p-3 flex-1 min-w-0 ${isActive ? "bg-primary/15" : "bg-card"}`}>
                  <p className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{meta.title}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="truncate">{meta.channelName}</span>
                    {meta.duration && meta.duration !== "—" && meta.duration !== "غير محدد" && (
                      <span className="shrink-0 mr-2 flex items-center gap-1"><Clock className="w-3 h-3" />{meta.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function Lesson() {
  const { user } = useAuth();
  const { displayStructure, lessonTitles: lessonTitlesFromApi } = usePublicStructure();
  const { isCompleted, markComplete, markIncomplete, getProgress, markTabComplete, isTabCompleted, getLessonProgress, completedTabs } = useLessonProgress();
  const params = useParams<{ stage: string; subject: string; lessonId?: string }>();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("lesson");
  const [openSemesters, setOpenSemesters] = useState<Record<string, boolean>>({});
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});
  const [openTestsSection, setOpenTestsSection] = useState(false);
  const [openAttachmentsSection, setOpenAttachmentsSection] = useState(false);
  const [openAttachmentsFirstSemester, setOpenAttachmentsFirstSemester] = useState(false);
  const [activeTest, setActiveTest] = useState<MathTestData | null>(null);
  const [testAnswers, setTestAnswers] = useState<Record<string, string>>({});
  const [showTestResults, setShowTestResults] = useState(false);
  const [testScore, setTestScore] = useState(0);
  const [videoWatchTime, setVideoWatchTime] = useState(0);
  const [canCompleteVideo, setCanCompleteVideo] = useState(false);
  const [pdfScrollProgress, setPdfScrollProgress] = useState(0);
  const pdfIframeRef = useRef<HTMLIFrameElement>(null);
  const [educationContent, setEducationContent] = useState<string>("");
  const [educationRawHtml, setEducationRawHtml] = useState<string | null>(null); // للعرض في iframe عند وجود scripts
  const [loadingEducation, setLoadingEducation] = useState(false);
  const educationContainerRef = useRef<HTMLDivElement>(null);
  const [videoMetadata, setVideoMetadata] = useState<Record<string, { title: string; channelName: string; duration: string }>>({});
  const [attachmentView, setAttachmentView] = useState<{ url: string; label: string } | null>(null);

  // محتوى CMS من جدول cms_content حسب lesson_id و tab_type (استخدام lessonId من params)
  const lessonIdFromParams = params.lessonId;
  const { content: cmsLessonContent } = useCmsTabContent(lessonIdFromParams, "lesson");
  const { content: cmsVideoContent } = useCmsTabContent(lessonIdFromParams, "video");
  const { content: cmsSummaryContent } = useCmsTabContent(lessonIdFromParams, "summary");
  const { content: cmsEducationContent } = useCmsTabContent(lessonIdFromParams, "education");

  const [hasSsaContent, setHasSsaContent] = useState<boolean | null>(null);
  const [loadingSsa, setLoadingSsa] = useState(false);
  useEffect(() => {
    if (!lessonIdFromParams || activeTab !== "ssa") {
      setHasSsaContent(null);
      return;
    }
    if (cmsEducationContent?.dataValue?.trim()) {
      setHasSsaContent(true);
      setLoadingSsa(false);
      return;
    }
    setLoadingSsa(true);
    fetch(`/api/content/lesson/${encodeURIComponent(lessonIdFromParams)}/ssa-html`)
      .then((r) => {
        setHasSsaContent(Boolean(r.ok && r.headers.get("content-type")?.includes("text/html")));
        setLoadingSsa(false);
      })
      .catch(() => {
        setHasSsaContent(false);
        setLoadingSsa(false);
      });
  }, [lessonIdFromParams, activeTab, cmsEducationContent]);

  const openAttachmentPdfInPage = (url: string | undefined, label: string) => {
    setAttachmentView({ url: url ?? "", label });
  };

  // Parse video duration in minutes (e.g., "15 دقيقة" -> 15)
  const getVideoDurationMinutes = (duration: string) => {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 5;
  };

  // Extract YouTube video ID from URL (supports youtube.com and youtube-nocookie.com)
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Map URL stage names to internal stage IDs
  const stageMapping: Record<string, string> = {
    primary: "elementary",
    middle: "middle",
    secondary: "high",
    intermediate: "middle",
  };

  // Parse URL parameters and get data - MOVED BEFORE useEffect hooks
  const urlStage = params.stage || "primary";
  const internalStage = stageMapping[urlStage] || urlStage || "elementary";
  const subjectId = params.subject || "math";

  const lessonId = params.lessonId; // No default - make it optional
  
  // Get subject data based on stage - with error handling
  const subjectData = subjectsData[internalStage]?.find(s => s.slug === subjectId) || null;
  
  // Static lessons for fallback and merging (duration, videoUrl)
  const staticLessons = (() => {
    try {
      if (subjectData?.semesters && subjectData.semesters.length > 0) {
        return subjectData.semesters.flatMap(semester =>
          semester.chapters?.flatMap(chapter => chapter.lessons || []) || []
        );
      }
      if (subjectData?.lessons && subjectData.lessons.length > 0) return subjectData.lessons;
      return lessonsData[subjectId] || lessonsData.math || [];
    } catch {
      return [];
    }
  })();
  
  const staticLessonsMap = Object.fromEntries(staticLessons.map((l) => [l.id, l]));
  
  // أولوية: هيكل لوحة التحكم (displayStructure) ثم البيانات الثابتة
  const structureKey = `${internalStage}_${subjectId}`;
  const apiStruct = displayStructure[structureKey];
  let lessons: LessonData[] = [];
  let semesters: SemesterData[];
  
  if (apiStruct?.semesters && apiStruct.semesters.length > 0) {
    lessons = apiStruct.semesters.flatMap((sem) =>
      sem.chapters.flatMap((ch) =>
        ch.lessons.map((apiL) => mergeLessonWithApi(staticLessonsMap[apiL.id], apiL.id, apiL.title))
      )
    );
    const fromApi = apiStruct.semesters.map((sem) => ({
      id: sem.id,
      name: sem.name,
      chapters: sem.chapters.map((ch) => ({
        id: ch.id,
        name: ch.name,
        number: ch.number,
        lessons: ch.lessons.map((apiL) => mergeLessonWithApi(staticLessonsMap[apiL.id], apiL.id, apiL.title)),
      })),
    }));
    semesters = ensureTwoSemestersWithAttachments(fromApi);
  } else {
    lessons = staticLessons;
    const base = getSemestersForSidebar(subjectData?.semesters, lessons);
    semesters = ensureTwoSemestersWithAttachments(base);
  }
  
  // Only set currentLesson if lessonId is provided and valid
  const currentLesson = lessonId && lessons.length > 0 ? (lessons.find(l => l.id === lessonId) || null) : null;
  const currentLessonIndex = lessonId && lessons.length > 0 ? lessons.findIndex(l => l.id === lessonId) : -1;
  
  // Get subject name with error handling
  let subjectName = "المادة";
  try {
    subjectName = subjectData?.name || getSubjectName(subjectId);
  } catch (error) {
    console.error("Error getting subject name:", error);
    subjectName = subjectId || "المادة";
  }

  // اسم الصف الدراسي (من sessionStorage عند الانتقال من صفحة المرحلة أو المادة)
  const gradeNamesMap: Record<string, Record<string, string>> = {
    elementary: { "1": "الصف الأول ابتدائي", "2": "الصف الثاني ابتدائي", "3": "الصف الثالث ابتدائي", "4": "الصف الرابع ابتدائي", "5": "الصف الخامس ابتدائي", "6": "الصف السادس ابتدائي" },
    middle: { "1": "الصف الأول متوسط", "2": "الصف الثاني متوسط", "3": "الصف الثالث متوسط" },
    high: { "1": "الصف الأول ثانوي", "2": "الصف الثاني ثانوي", "3": "الصف الثالث ثانوي" },
  };
  const savedGradeId = typeof window !== "undefined" ? sessionStorage.getItem("lesson_grade") : null;
  const savedStageId = typeof window !== "undefined" ? sessionStorage.getItem("lesson_stage") : null;
  const gradeName = (savedStageId && savedGradeId && gradeNamesMap[savedStageId]?.[savedGradeId]) || null;
  const subjectDisplayName = gradeName ? `${subjectName} - ${gradeName}` : subjectName;
  
  // Get progress with error handling
  let completedCount = 0;
  let progress = 0;
  try {
    const progressData = getProgress(subjectId, lessons.length);
    completedCount = progressData.completed || 0;
    progress = progressData.percentage || 0;
  } catch (error) {
    console.error("Error getting progress:", error);
  }

  const cmsVideoDataValue = (cmsVideoContent?.contentType === "youtube" && cmsVideoContent?.dataValue) ? cmsVideoContent.dataValue : "";
  const cmsVideoUrls = cmsVideoDataValue
    ? cmsVideoDataValue.split(/\r?\n/).map((u: string) => u.trim()).filter(Boolean)
    : [];

  const currentLessonId = currentLesson?.id || "";
  const currentVideoUrl = currentLesson?.videoUrl || "";
  const additionalVideosKey = (currentLesson?.additionalVideos || []).map(v => v.url).join(",");
  const metadataFetchedRef = useRef("");

  useEffect(() => {
    if (!currentLesson) return;

    const fetchKey = `${currentLessonId}|${currentVideoUrl}|${additionalVideosKey}|${cmsVideoDataValue}`;
    if (metadataFetchedRef.current === fetchKey) return;
    metadataFetchedRef.current = fetchKey;

    let cancelled = false;

    const fetchMetadata = async () => {
      const metadata: Record<string, { title: string; channelName: string; duration: string }> = {};
      const urlsToFetch: { url: string; fallbackTitle?: string; fallbackChannel?: string; fallbackDuration?: string }[] = [];

      if (cmsVideoUrls.length > 0) {
        for (let i = 0; i < cmsVideoUrls.length; i++) {
          urlsToFetch.push({
            url: cmsVideoUrls[i],
            fallbackTitle: i === 0 ? (currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : subjectName) : `فيديو ${i + 1}`,
            fallbackDuration: currentLesson?.duration || "غير محدد"
          });
        }
      } else if (currentLesson.videoUrl) {
        urlsToFetch.push({
          url: currentLesson.videoUrl,
          fallbackTitle: currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : subjectName,
          fallbackDuration: currentLesson.duration || "غير محدد"
        });
      }
      if (cmsVideoUrls.length === 0) {
        for (const video of currentLesson.additionalVideos || []) {
          urlsToFetch.push({
            url: video.url,
            fallbackTitle: video.title,
            fallbackChannel: video.channelName,
            fallbackDuration: video.duration
          });
        }
      }

      const idToUrlMap: Record<string, string> = {};
      const fallbacks: Record<string, { title: string; channel: string; duration: string }> = {};
      for (const { url, fallbackTitle, fallbackChannel, fallbackDuration } of urlsToFetch) {
        const videoId = extractVideoId(url);
        if (!videoId) continue;
        idToUrlMap[videoId] = url;
        fallbacks[url] = {
          title: fallbackTitle || "فيديو تعليمي",
          channel: fallbackChannel || "قناة تعليمية",
          duration: fallbackDuration || "—",
        };
      }

      const videoIds = Object.keys(idToUrlMap);
      if (videoIds.length === 0) {
        if (!cancelled) setVideoMetadata(metadata);
        return;
      }

      try {
        const resp = await fetch(`/api/content/youtube-video-info?ids=${videoIds.join(",")}`);
        if (cancelled) return;
        if (resp.ok) {
          const apiData = await resp.json() as Record<string, { title: string; channelName: string; durationCompact: string }>;
          for (const [vid, info] of Object.entries(apiData)) {
            const origUrl = idToUrlMap[vid];
            if (origUrl) {
              const fb = fallbacks[origUrl];
              metadata[origUrl] = {
                title: info.title || fb.title,
                channelName: info.channelName || fb.channel,
                duration: info.durationCompact || fb.duration,
              };
            }
          }
        }
      } catch {}

      for (const { url } of urlsToFetch) {
        if (!metadata[url]) {
          const fb = fallbacks[url];
          if (fb) metadata[url] = { title: fb.title, channelName: fb.channel, duration: fb.duration };
        }
      }

      if (!cancelled) setVideoMetadata(metadata);
    };

    fetchMetadata();

    return () => { cancelled = true; };
  }, [currentLessonId, currentVideoUrl, additionalVideosKey, cmsVideoDataValue]);

  // SEO: تحديث عنوان الصفحة ووصفها عند تغيير الدرس
  useEffect(() => {
    if (currentLesson && subjectName) {
      const title = getLessonDisplayTitle(currentLesson, lessonTitlesFromApi);
      setPageMeta(
        `${title} - ${subjectName}`,
        `درس ${title} في ${subjectName} - منصة شارف التعليمية. شاهد الشرح والملخص والاختبارات.`
      );
    }
  }, [currentLesson, subjectName, lessonTitlesFromApi]);

  const toggleSemester = (semesterId: string) => {
    setOpenSemesters(prev => {
      const isCurrentlyOpen = prev[semesterId];
      // Close all, then open only this one if it was closed (accordion: one open at a time)
      return isCurrentlyOpen ? {} : { [semesterId]: true };
    });
    setOpenChapters({});
    setOpenTestsSection(false);
    setOpenAttachmentsSection(false);
    setOpenAttachmentsFirstSemester(false);
  };

  const toggleTestsSection = () => {
    const willOpen = !openTestsSection;
    setOpenTestsSection(willOpen);
    if (willOpen) {
      setOpenSemesters({});
      setOpenChapters({});
      setOpenAttachmentsSection(false);
    }
  };

  const toggleAttachmentsSection = () => {
    const willOpen = !openAttachmentsSection;
    setOpenAttachmentsSection(willOpen);
    if (willOpen) {
      setOpenSemesters({});
      setOpenChapters({});
      setOpenTestsSection(false);
      setOpenAttachmentsFirstSemester(false);
    }
  };

  const toggleAttachmentsFirstSemester = () => {
    const willOpen = !openAttachmentsFirstSemester;
    setOpenAttachmentsFirstSemester(willOpen);
    if (willOpen) {
      setOpenSemesters({});
      setOpenChapters({});
      setOpenTestsSection(false);
      setOpenAttachmentsSection(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => {
      const isCurrentlyOpen = prev[chapterId];
      // Close all, then open only this one if it was closed
      return isCurrentlyOpen ? {} : { [chapterId]: true };
    });
  };

  const isChapterOpen = (chapterId: string) => {
    return openChapters[chapterId] === true;
  };

  // Reset state when lesson changes
  useEffect(() => {
    setActiveTab("lesson");
    setVideoWatchTime(0);
    setCanCompleteVideo(false);
  }, [lessonId, subjectId]);


  // Auto-track video watching - complete after 30 seconds (أو مدة الفيديو إذا كانت أقل)
  useEffect(() => {
    if (!lessonId || activeTab !== "video" || isTabCompleted(subjectId, lessonId, "video")) return;
    
    const videoDuration = getVideoDurationMinutes(currentLesson?.duration || "5 دقيقة");
    const requiredSeconds = Math.min(45, Math.max(30, videoDuration * 20)); // 30–45 ثانية
    
    const interval = setInterval(() => {
      setVideoWatchTime(prev => {
        const newTime = prev + 1;
        if (newTime >= requiredSeconds && !isTabCompleted(subjectId, lessonId, "video")) {
          markTabComplete(subjectId, lessonId, "video");
          setCanCompleteVideo(true);
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [activeTab, lessonId, subjectId, currentLesson]);

  // Auto-track lesson tab: PDF scroll أو 45 ثانية عند عدم وجود PDF
  const effectiveLessonPdfUrl = (cmsLessonContent?.contentType === "pdf" && cmsLessonContent?.dataValue) || currentLesson?.pdfUrl;
  useEffect(() => {
    if (!lessonId || activeTab !== "lesson" || isTabCompleted(subjectId, lessonId, "lesson")) return;

    // عند عدم وجود PDF: إكمال تلقائي بعد 30 ثانية
    if (!effectiveLessonPdfUrl) {
      const timer = setTimeout(() => {
        if (!isTabCompleted(subjectId, lessonId, "lesson")) {
          markTabComplete(subjectId, lessonId, "lesson");
        }
      }, 30000);
      return () => clearTimeout(timer);
    }
    
    const iframe = pdfIframeRef.current;
    if (!iframe) return;

    let scrollCheckInterval: NodeJS.Timeout | undefined;
    let timeFallbackInterval: NodeJS.Timeout | undefined;
    let lastScrollPosition = 0;

    const checkScroll = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          if (!timeFallbackInterval) {
            const start = Date.now();
            timeFallbackInterval = setInterval(() => {
              if (Date.now() - start > 30000 && !isTabCompleted(subjectId, lessonId, "lesson")) {
                markTabComplete(subjectId, lessonId, "lesson");
                if (timeFallbackInterval) clearInterval(timeFallbackInterval);
              }
            }, 2000);
          }
          return;
        }

        const scrollableElement = iframeDoc.documentElement || iframeDoc.body;
        const currentScroll = scrollableElement.scrollTop;
        const maxScroll = scrollableElement.scrollHeight - scrollableElement.clientHeight;
        
        if (maxScroll > 0) {
          const scrollPercentage = (currentScroll / maxScroll) * 100;
          setPdfScrollProgress(scrollPercentage);
          
          lastScrollPosition = currentScroll;
          
          // إكمال عند الوصول لـ 50% أو أكثر من التمرير
          if (scrollPercentage >= 50 && !isTabCompleted(subjectId, lessonId, "lesson")) {
            markTabComplete(subjectId, lessonId, "lesson");
            if (scrollCheckInterval) clearInterval(scrollCheckInterval);
          }
        }
      } catch {
        if (!timeFallbackInterval) {
          const start = Date.now();
          timeFallbackInterval = setInterval(() => {
            if (Date.now() - start > 30000 && !isTabCompleted(subjectId, lessonId, "lesson")) {
              markTabComplete(subjectId, lessonId, "lesson");
              if (timeFallbackInterval) clearInterval(timeFallbackInterval);
            }
          }, 2000);
        }
      }
    };

    scrollCheckInterval = setInterval(checkScroll, 500);

    return () => {
      if (scrollCheckInterval) clearInterval(scrollCheckInterval);
      if (timeFallbackInterval) clearInterval(timeFallbackInterval);
    };
  }, [activeTab, lessonId, subjectId, effectiveLessonPdfUrl]);

  // إغلاق عرض المرفق عند اختيار درس من القائمة
  useEffect(() => {
    if (lessonId) setAttachmentView(null);
  }, [lessonId]);

  // Load Education HTML content when tab is active (من API المحتوى — ينعكس فوراً مع لوحة التحكم)
  useEffect(() => {
    if (activeTab !== "education" || !currentLesson) {
      setEducationContent("");
      setEducationRawHtml(null);
      return;
    }

    const htmlUrl = `/api/content/lesson/${currentLesson.id}/education-html`;
    
    setLoadingEducation(true);
    fetch(htmlUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to load education content");
        }
        return response.text();
      })
      .then(html => {
        if (html && html.length > 0) {
          const raw = html.trim();
          const hasScripts = /<script\b[\s\S]*?>[\s\S]*?<\/script>/i.test(raw);
          const isFullDoc = raw.includes("<body") && raw.includes("</body>");

          // إذا كان المستند كاملاً ويحتوي scripts، نعرضه في iframe لتنفيذ الجافاسكربت
          if (hasScripts && isFullDoc) {
            setEducationRawHtml(raw);
            setEducationContent("");
            setLoadingEducation(false);
            return;
          }

          setEducationRawHtml(null);
          let content = raw;
          const bodyStart = content.indexOf("<body");
          const bodyEnd = content.lastIndexOf("</body>");

          if (bodyStart !== -1 && bodyEnd !== -1) {
            const headStart = content.indexOf("<head");
            const headEnd = content.indexOf("</head>");
            let styleContent = "";
            let linkContent = "";
            if (headStart !== -1 && headEnd !== -1) {
              const headContent = content.substring(headStart, headEnd + 7);
              const linkMatches = headContent.match(/<link[^>]*href=["'][^"']*fonts\.googleapis\.com[^"']*["'][^>]*>/gi);
              if (linkMatches) linkContent = linkMatches.join("\n");
              const styleMatches = headContent.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
              if (styleMatches) {
                styleContent = styleMatches.map((s) => {
                  const m = s.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
                  return m ? m[1] : "";
                }).filter(Boolean).join("\n");
              }
            }
            const bodyTagEnd = content.indexOf(">", bodyStart) + 1;
            const bodyContent = content.substring(bodyTagEnd, bodyEnd);
            const scoped = styleContent ? scopeEducationCss(styleContent, ".education-sandbox") : "";
            content = `${linkContent}${scoped ? `<style>${scoped}</style>` : ""}${bodyContent}`;
          }
          setEducationContent(content.trim());
        } else {
          setEducationContent("");
        }
        setLoadingEducation(false);
      })
      .catch((error) => {
        console.error("Error loading education content:", error);
        setEducationContent("");
        setEducationRawHtml(null);
        setLoadingEducation(false);
      });
  }, [activeTab, currentLesson?.id]);

  // Enable Education interactive widgets (SOLUTION: Complete React-based handler, no HTML scripts)
  useEffect(() => {
    if (activeTab !== "education") return;
    if (!educationContent || educationContent.trim().length === 0) return;

    const container = educationContainerRef.current;
    if (!container) return;

    // Function to initialize solver (with retry mechanism)
    const initSolver = () => {
      // Remove all scripts from HTML to prevent conflicts
      container.querySelectorAll("script").forEach((s) => {
        try {
          s.parentNode?.removeChild(s);
        } catch (e) {
          // Ignore errors
        }
      });

      const calcMode = container.querySelector<HTMLSelectElement>("#calcMode");
      const inputValue = container.querySelector<HTMLInputElement>("#inputValue");
      const resultBox = container.querySelector<HTMLDivElement>("#stepsResult");

      // If elements not found, retry after a short delay
      if (!calcMode || !inputValue || !resultBox) {
        
        setTimeout(initSolver, 100);
        return;
      }

      

      // Define solver function
      const runSolver = () => {
        // Re-query elements in case DOM changed
        const modeEl = container.querySelector<HTMLSelectElement>("#calcMode");
        const inputEl = container.querySelector<HTMLInputElement>("#inputValue");
        const resultEl = container.querySelector<HTMLDivElement>("#stepsResult");

        if (!modeEl || !inputEl || !resultEl) {
          console.error("Education solver: Elements missing during execution");
          return;
        }

        const mode = modeEl.value;
        const inputVal = inputEl.value.trim();
        const val = Number.parseFloat(inputVal);

        if (!inputVal || !Number.isFinite(val) || val <= 0) {
          window.alert("يا بطل، لازم تكتب رقم صحيح!");
          return;
        }

        let htmlContent = "";

        if (mode === "mode1") {
          const n = val;
          if (n < 3) {
            window.alert("أقل مضلع هو المثلث (3 أضلاع)!");
            return;
          }

          const sum = (n - 2) * 180;
          const oneInt = sum / n;
          const oneExt = 360 / n;

          const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

          htmlContent = `
            <div class="step-row">
              <span class="step-num">1. المجموع الكلي (S):</span><br>
              القانون: (n - 2) × 180<br>
              (${fmt(n)} - 2) × 180 = <strong>${fmt(sum)}°</strong>
            </div>
            <div class="step-row">
              <span class="step-num">2. الزاوية الداخلية الواحدة (للمنتظم):</span><br>
              نقسم المجموع على عدد الأضلاع:<br>
              ${fmt(sum)} ÷ ${fmt(n)} = <strong>${fmt(oneInt)}°</strong>
            </div>
            <div class="step-row">
              <span class="step-num">3. الزاوية الخارجية الواحدة:</span><br>
              نقسم 360 على عدد الأضلاع:<br>
              360 ÷ ${fmt(n)} = <strong>${fmt(oneExt)}°</strong>
            </div>
          `;
        } else {
          const angle = val;
          if (angle >= 180) {
            window.alert("الزاوية الداخلية لازم تكون أقل من 180!");
            return;
          }

          const extAngle = 180 - angle;
          const n = 360 / extAngle;

          const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(2));

          htmlContent = `
            <div class="step-row">
              <span class="step-num">1. نحسب الزاوية الخارجية:</span><br>
              الزوايا متكاملة (مجموعهم 180).<br>
              الخارجية = 180 - ${fmt(angle)} = <strong>${fmt(extAngle)}°</strong>
            </div>
            <div class="step-row">
              <span class="step-num">2. نحسب عدد الأضلاع (n):</span><br>
              بما أن مجموع الخارجية دايماً 360:<br>
              n = 360 ÷ ${fmt(extAngle)} = <strong>${fmt(n)}</strong> ضلع
            </div>
          `;

          if (!Number.isInteger(n)) {
            htmlContent += `
              <div class="step-row" style="color:#ef4444; border:none;">
                <strong>ملاحظة:</strong> الناتج ليس عدداً صحيحاً، وهذا يعني أنه لا يوجد مضلع منتظم زاويته ${fmt(angle)} بالضبط.
              </div>
            `;
          }
        }

        resultEl.style.display = "block";
        resultEl.innerHTML = htmlContent;
      };

      // Remove old onclick attribute and bind new handler
      const btn = container.querySelector<HTMLButtonElement>(".btn-calc");
      if (btn) {
        // Remove onclick attribute if exists
        btn.removeAttribute("onclick");
        
        // Clone button to remove all old event listeners
        const cloned = btn.cloneNode(true) as HTMLButtonElement;
        cloned.removeAttribute("onclick");
        
        // Remove old button
        btn.parentNode?.replaceChild(cloned, btn);
        
        // Add new click handler
        cloned.addEventListener("click", (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          
          runSolver();
        });
        
        
      } else {
        console.error("Education solver: Button not found!");
      }

      // Bind Enter key handler
      if (inputValue) {
        // Remove old handler if exists
        const oldHandler = (inputValue as any).__solverHandler;
        if (oldHandler) {
          inputValue.removeEventListener("keydown", oldHandler);
        }

        const handler = (e: KeyboardEvent) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            
            runSolver();
          }
        };
        
        inputValue.addEventListener("keydown", handler);
        (inputValue as any).__solverHandler = handler;
        
      }
    };

    // Use MutationObserver to detect when DOM is ready
    const observer = new MutationObserver(() => {
      const calcMode = container.querySelector<HTMLSelectElement>("#calcMode");
      const inputValue = container.querySelector<HTMLInputElement>("#inputValue");
      const resultBox = container.querySelector<HTMLDivElement>("#stepsResult");
      
      if (calcMode && inputValue && resultBox) {
        observer.disconnect();
        // Small delay to ensure DOM is fully rendered
        setTimeout(initSolver, 50);
      }
    });

    // Start observing
    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    // Also try immediately (in case elements already exist)
    setTimeout(initSolver, 100);

    // Fallback: try again after 500ms
    const fallbackTimeout = setTimeout(() => {
      const calcMode = container.querySelector<HTMLSelectElement>("#calcMode");
      const inputValue = container.querySelector<HTMLInputElement>("#inputValue");
      const resultBox = container.querySelector<HTMLDivElement>("#stepsResult");
      
      if (calcMode && inputValue && resultBox) {
        initSolver();
      } else {
        console.error("Education solver: Failed to find elements after timeout");
      }
    }, 500);

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimeout);
      
      // Cleanup event handlers
      const inputValue = container?.querySelector<HTMLInputElement>("#inputValue");
      const handler = inputValue && (inputValue as any).__solverHandler;
      if (inputValue && handler) {
        inputValue.removeEventListener("keydown", handler);
        delete (inputValue as any).__solverHandler;
      }
    };
  }, [activeTab, educationContent]);

  // Save progress to database when it changes
  useEffect(() => {
    if (!user?.id || !lessonId) return; // Only save if user is logged in and lesson is selected
    
    const lessonProg = getLessonProgress(subjectId, lessonId);
    const tabs = {
      lesson: isTabCompleted(subjectId, lessonId, "lesson"),
      video: isTabCompleted(subjectId, lessonId, "video"),
      questions: 0,
    };

    const questionsProgress = "0";
    const totalProgress = Math.round(lessonProg).toString(); // Round to integer for display

    // Save to database (fire and forget - don't block UI)
    fetch("/api/progress/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        userId: user.id,
        subjectSlug: subjectId,
        lessonId: lessonId,
        lessonCompleted: tabs.lesson,
        videoCompleted: tabs.video,
        questionsScore: Math.round((tabs.questions / 33.34) * 100), // Convert back to percentage
        questionsProgress: questionsProgress,
        totalProgress: totalProgress,
      }),
    }).catch((error) => {
      console.error("Failed to save progress to database:", error);
      // Silently fail - localStorage backup is still working
    });
  }, [user?.id, subjectId, lessonId, getLessonProgress, isTabCompleted, completedTabs]);

  const getTotalLessonsInSemester = (semester: typeof semesters[0]) => {
    if ('chapters' in semester && semester.chapters) {
      return semester.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
    }
    return 0;
  };


  const handleMarkComplete = () => {
    if (subjectId == null || lessonId == null) return;
    if (isCompleted(subjectId, lessonId)) {
      markIncomplete(subjectId, lessonId);
    } else {
      markComplete(subjectId, lessonId);
    }
  };

  const goToLesson = (id: string) => {
    setLocation(`/lesson/${urlStage ?? ""}/${subjectId ?? ""}/${id}`);
  };

  const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : null;
  const prevLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex - 1] : null;

  // Function to get the home navigation link based on current stage
  const getHomeLink = () => {
    // Map internal stage to route stage ID
    const stageRouteMap: Record<string, string> = {
      elementary: "elementary",
      middle: "middle",
      high: "high",
      paths: "paths",
      qudurat: "qudurat",
    };
    
    // Get the route stage ID
    const routeStageId = stageRouteMap[internalStage] || "elementary";
    
    // Return link to stage page
    return `/stage/${routeStageId}`;
  };

  const homeLink = getHomeLink();

  const sidebarStyle = {
    "--sidebar-width": "22rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-accent/30" dir="rtl">
      <SidebarProvider style={sidebarStyle}>
        <div className="flex min-h-screen w-full">
          {/* Lessons Sidebar - إعادة تصميم */}
          <Sidebar side="right" className="border-l border-border/50 bg-background/95">
            <SidebarHeader className="p-5 border-b border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <Link href={homeLink} aria-label="الرجوع للصفحة الرئيسية" className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent/80 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                  <Home className="w-5 h-5" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-bold text-base truncate">{subjectName}</span>
                  </div>
                </div>
              </div>
              {/* شريط التقدم */}
              <div className="mt-4 p-3 rounded-xl bg-accent/30 border border-border/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground font-medium">التقدم</span>
                  <span className={`font-bold tabular-nums ${progress > 95 ? "text-emerald-600" : "text-rose-600"}`}>{progress}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${progress > 95 ? "bg-emerald-500" : "bg-rose-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-3 gap-4 flex flex-col">
              {semesters.length > 0 ? (
                <>
                  {semesters.map((semester, semesterIndex) => (
                    <div
                      key={semester.id}
                      className="rounded-2xl border border-violet-200/50 bg-violet-50/50 dark:border-violet-500/25 dark:bg-violet-500/10 p-3 space-y-2 mb-4 pt-2"
                    >
                      <div className="flex justify-center mb-1">
                        <div className="w-full text-center px-5 py-2.5 rounded-lg text-sm font-bold bg-violet-100/80 text-indigo-500 dark:bg-violet-500/20 dark:text-violet-300">
                          {semesterIndex === 0 ? "الفصل الدراسي الأول" : "الفصل الدراسي الثاني"}
                        </div>
                      </div>
                      <Collapsible open={openSemesters[semester.id]}>
                        <SidebarGroup className="space-y-0">
                          <SidebarGroupLabel
                            className="flex items-center justify-between w-full gap-3 px-3 py-2.5 min-h-[2.75rem] rounded-xl border border-gray-200/60 bg-white dark:bg-card dark:border-violet-500/20 hover:bg-gray-50/50 dark:hover:bg-violet-500/5 cursor-pointer transition-all duration-200"
                            onClick={() => toggleSemester(semester.id)}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-lg bg-violet-400 text-white flex items-center justify-center shrink-0">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-[13px] text-foreground">الدروس</span>
                            </div>
                            {openSemesters[semester.id] ? (
                              <ChevronUp className="w-4 h-4 shrink-0 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 shrink-0 text-gray-400" />
                            )}
                          </SidebarGroupLabel>
                          <CollapsibleContent>
                            <SidebarGroupContent className="pt-3 px-1 pb-4 space-y-5">
                              {semester.chapters?.map((chapter, chapterIndex) => {
                                return (
                                  <div key={chapter.id} className="space-y-2">
                                    {/* عنوان الوحدة — شكل تاب/وسم في المنتصف */}
                                    <div className="relative flex items-center justify-center gap-2 pr-1">
                                      <div className="flex-1 h-px bg-border" aria-hidden />
                                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold shrink-0 shadow-sm bg-violet-100/80 text-violet-700 dark:text-violet-300 dark:bg-violet-500/15 border border-violet-200/60 dark:border-violet-500/25">
                                        <span className="opacity-80">{chapter.number ?? chapterIndex + 1}</span>
                                        <span className="w-px h-3 bg-current opacity-30" />
                                        <span className="truncate max-w-[140px]">{chapter.name}</span>
                                      </div>
                                      <div className="flex-1 h-px bg-border" aria-hidden />
                                    </div>
                                    {/* قائمة الدروس داخل الوحدة */}
                                    <div className="space-y-1 pr-2">
                                      {chapter.lessons.map((lesson, lessonIndex) => {
                                        const isActive = lesson.id === lessonId;
                                        const lessonProg = getLessonProgress(subjectId, lesson.id);
                                        const lessonProgRounded = Math.round(lessonProg);
                                        const lessonCompleted = lessonProgRounded >= 100;
                                        return (
                                          <SidebarMenuItem key={`${chapter.id}-${lesson.id}`}>
                                            <SidebarMenuButton
                                              asChild
                                              isActive={isActive}
                                              className="gap-3 h-auto py-2.5 px-3 rounded-lg data-[active]:ring-[0.5px] data-[active]:ring-violet-400/40"
                                              data-testid={`sidebar-lesson-${chapter.id}-${lesson.id}`}
                                            >
                                              <Link href={`/lesson/${urlStage}/${subjectId}/${lesson.id}`}>
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                                                  lessonCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                                                  isActive ? "bg-violet-500 text-white" :
                                                  "bg-muted text-muted-foreground"
                                                }`}>
                                                  {lessonCompleted ? <Check className="w-4 h-4" /> : lessonIndex + 1}
                                                </div>
                                                <div className="flex-1 text-right min-w-0">
                                                  <div className="font-medium text-xs break-words">{getLessonDisplayTitle(lesson, lessonTitlesFromApi)}</div>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${lessonProgRounded > 95 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}>
                                                  {lessonProgRounded}%
                                                </span>
                                              </Link>
                                            </SidebarMenuButton>
                                          </SidebarMenuItem>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </SidebarGroupContent>
                          </CollapsibleContent>
                        </SidebarGroup>
                      </Collapsible>
                      {/* مرفقات نفس الفصل - داخل نفس الإطار */}
                      {semesterIndex === 0 && (
                        <Collapsible open={openAttachmentsFirstSemester}>
                          <SidebarGroup>
                            <SidebarGroupLabel
                              className="flex items-center justify-between w-full gap-3 px-3 py-2.5 min-h-[2.75rem] rounded-xl border border-gray-200/60 bg-white dark:bg-card dark:border-violet-500/20 hover:bg-gray-50/50 dark:hover:bg-violet-500/5 cursor-pointer transition-all duration-200"
                              onClick={toggleAttachmentsFirstSemester}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-violet-400 text-white flex items-center justify-center shrink-0">
                                  <Paperclip className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[13px] text-foreground">المرفقات</span>
                              </div>
                              {openAttachmentsFirstSemester ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                              <SidebarGroupContent className="pt-3 px-1 pb-4 space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage(currentLesson?.bookPdfUrl, "كتاب المادة")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-900/30">
                                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">كتاب المادة</div>
                                    <div className="text-xs text-muted-foreground">الكتاب الدراسي</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage(currentLesson?.summaryPdfUrl, "الملخص")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-900/30">
                                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">الملخص</div>
                                    <div className="text-xs text-muted-foreground">ملخص شامل للمادة</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage(currentLesson?.worksheetsPdfUrl, "أوراق العمل")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                                    <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">أوراق العمل</div>
                                    <div className="text-xs text-muted-foreground">تمارين وأنشطة</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer"
                                  onClick={() => openAttachmentPdfInPage(currentLesson?.testQuestionsPdfUrl, "أسئلة الاختبار")}
                                >
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-900/30">
                                    <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">أسئلة الاختبار</div>
                                    <div className="text-xs text-muted-foreground">اختبارات المادة</div>
                                  </div>
                                </div>
                              </SidebarGroupContent>
                            </CollapsibleContent>
                          </SidebarGroup>
                        </Collapsible>
                      )}
                      {semesterIndex === 1 && (
                        <Collapsible open={openAttachmentsSection}>
                          <SidebarGroup>
                            <SidebarGroupLabel
                              className="flex items-center justify-between w-full gap-3 px-3 py-2.5 min-h-[2.75rem] rounded-xl border border-gray-200/60 bg-white dark:bg-card dark:border-violet-500/20 hover:bg-gray-50/50 dark:hover:bg-violet-500/5 cursor-pointer transition-all duration-200"
                              onClick={toggleAttachmentsSection}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-violet-400 text-white flex items-center justify-center shrink-0">
                                  <Paperclip className="w-4 h-4" />
                                </div>
                                <span className="font-bold text-[13px] text-foreground">المرفقات</span>
                              </div>
                              {openAttachmentsSection ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                            </SidebarGroupLabel>
                            <CollapsibleContent>
                              <SidebarGroupContent className="pt-3 px-1 pb-4 space-y-2">
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage((internalStage === "high" && subjectId === "math") ? "/attachments/book-math-high1-s2.pdf" : currentLesson?.bookPdfUrl, "كتاب المادة")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 dark:bg-blue-900/30">
                                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">كتاب المادة</div>
                                    <div className="text-xs text-muted-foreground">الكتاب الدراسي</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage(currentLesson?.summaryPdfUrl, "الملخص")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 dark:bg-purple-900/30">
                                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">الملخص</div>
                                    <div className="text-xs text-muted-foreground">ملخص شامل للمادة</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer" onClick={() => openAttachmentPdfInPage(currentLesson?.worksheetsPdfUrl, "أوراق العمل")}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 dark:bg-emerald-900/30">
                                    <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">أوراق العمل</div>
                                    <div className="text-xs text-muted-foreground">تمارين وأنشطة</div>
                                  </div>
                                </div>
                                <div
                                  className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-primary/20 transition-all cursor-pointer"
                                  onClick={() => openAttachmentPdfInPage(currentLesson?.testQuestionsPdfUrl, "أسئلة الاختبار")}
                                >
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 dark:bg-amber-900/30">
                                    <ClipboardList className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-sm">أسئلة الاختبار</div>
                                    <div className="text-xs text-muted-foreground">اختبارات المادة</div>
                                  </div>
                                </div>
                              </SidebarGroupContent>
                            </CollapsibleContent>
                          </SidebarGroup>
                        </Collapsible>
                      )}
                    </div>
                  ))}
                </>
              ) : lessons.length > 0 ? (
                <SidebarGroup>
                  <div className="px-4 py-3 rounded-xl border border-border/60 bg-card mb-3">
                    <span className="font-bold text-base">قائمة الدروس</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{completedCount} من {lessons.length} مكتمل</p>
                  </div>
                  <SidebarGroupContent className="space-y-1">
                    <SidebarMenu className="space-y-1">
                      {lessons.map((lesson, index) => {
                        const isActive = lesson.id === lessonId;
                        const lessonProg = getLessonProgress(subjectId, lesson.id);
                        const lessonProgRounded = Math.round(lessonProg);
                        const lessonCompleted = lessonProgRounded >= 100;
                        return (
                          <SidebarMenuItem key={lesson.id}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive}
                              className="gap-3 h-auto py-2.5 px-3 rounded-lg data-[active]:ring-[0.5px] data-[active]:ring-primary/30"
                              data-testid={`sidebar-lesson-${lesson.id}`}
                            >
                              <Link href={`/lesson/${urlStage}/${subjectId}/${lesson.id}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                                  lessonCompleted ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
                                  isActive ? "bg-primary text-primary-foreground" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {lessonCompleted ? <Check className="w-4 h-4" /> : index + 1}
                                </div>
                                <div className="flex-1 text-right min-w-0">
                                  <div className="font-semibold text-xs break-words">{getLessonDisplayTitle(lesson, lessonTitlesFromApi)}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${lessonProgRounded > 95 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"}`}>
                                  {lessonProgRounded}%
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ) : (
                <SidebarGroup>
                  <SidebarGroupContent className="p-4">
                    <div className="p-6 rounded-xl border border-dashed border-border bg-muted/30 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
                      <p className="text-sm font-medium text-muted-foreground">لا توجد دروس متاحة حالياً</p>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

            </SidebarContent>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header - بنفس تنسيق الموقع */}
            <header className="sticky top-0 z-20 bg-white/95 dark:bg-card/95 backdrop-blur-lg shadow-sm border-b border-border/50">
              <div className="flex items-center justify-between gap-2 p-4 min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <SidebarTrigger aria-label="فتح قائمة الدروس" data-testid="button-toggle-lessons-sidebar" className="shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm text-muted-foreground truncate">{subjectDisplayName}</div>
                    <h1 className="font-bold text-sm sm:text-lg truncate" data-testid="text-lesson-title">
                      {currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : subjectName}
                    </h1>
                  </div>
                </div>
                {currentLesson && lessonId ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {Math.round(getLessonProgress(subjectId, lessonId))}%
                    </span>
                    <Button
                      variant={isCompleted(subjectId, lessonId) ? "default" : "outline"}
                      onClick={handleMarkComplete}
                      className="gap-1.5 text-xs sm:text-sm px-2.5 sm:px-4"
                      data-testid="button-mark-complete"
                    >
                      {isCompleted(subjectId, lessonId) ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">مكتمل</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">تم الإكمال</span>
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 shrink-0 invisible">
                    <span className="text-xs sm:text-sm">0%</span>
                    <Button variant="outline" className="gap-1.5 px-2.5 sm:px-4" tabIndex={-1}>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">تم الإكمال</span>
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Sticky Tab Navigation - Only show when lesson is selected */}
              {currentLesson && (
                <div className="flex items-center justify-center gap-2 px-4 pb-3 bg-white/95 dark:bg-card/95 backdrop-blur-lg">
                  <div className="flex items-center gap-1 p-1.5 bg-accent/50 rounded-xl">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          aria-label={tab.label}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm
                            transition-all duration-300
                            ${isActive 
                              ? "bg-primary text-white shadow-md" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            }
                          `}
                          data-testid={`tab-${tab.id}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </header>

            <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              {attachmentView !== null ? (
                // عرض PDF المرفق في نفس الصفحة مكان رسالة الترحيب
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 p-6 flex flex-col min-h-[500px]"
                >
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-bold text-foreground shrink-0">{attachmentView.label}</h2>
                    <div className="flex-1 flex justify-center">
                      {attachmentView.url ? (
                        <a
                          href={attachmentView.url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold text-sm shadow-sm"
                          title="تحميل الملف"
                        >
                          <Download className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                          تحميل الملف
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted text-muted-foreground/60 font-medium text-sm" title="لا يوجد ملف للتحميل">
                          <Download className="w-5 h-5 shrink-0" strokeWidth={2} />
                          تحميل الملف
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={() => {
                        setAttachmentView(null);
                        setLocation(`/lesson/${urlStage}/${subjectId}`);
                      }}
                    >
                      <X className="w-4 h-4" />
                      إغلاق
                    </Button>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30 flex-1 min-h-[60vh]">
                    {attachmentView.url ? (
                      <iframe
                        src={`${attachmentView.url}#toolbar=0&navpanes=0`}
                        className="w-full border-0 flex-1"
                        style={{ minHeight: "65vh" }}
                        title={attachmentView.label}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 px-4">
                        <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground text-center font-medium">سيتم إضافة ملف PDF قريباً</p>
                        <p className="text-sm text-muted-foreground/80 mt-2 text-center">عند توفير الملف سيتم عرضه هنا</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : !currentLesson || !lessonId ? (
                // Welcome Message - Show when no lesson is selected or lessonId is invalid
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white dark:bg-card rounded-2xl shadow-lg border border-border/50 p-6 sm:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[500px] text-center"
                >
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white mb-4 sm:mb-6 shadow-lg`}>
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-3 text-foreground">
                    أهلاً بك في مادة {subjectName}
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                    {lessons.length === 0 
                      ? "لا توجد دروس متاحة حالياً في هذه المادة"
                      : "يرجى اختيار الفصل الدراسي والدرس المناسب لك من القائمة الجانبية للبدء"
                    }
                  </p>
                </motion.div>
              ) : (
                <>
              {/* Test Content */}
              {activeTest ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-sm border border-border/50">
                    {/* Test Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">{activeTest.title}</h2>
                        <p className="text-muted-foreground">
                          {activeTest.subject} - {activeTest.grade} - {activeTest.semester}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setActiveTest(null);
                          setTestAnswers({});
                          setShowTestResults(false);
                        }}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        إغلاق الاختبار
                      </Button>
                    </div>

                    {/* Test Questions */}
                    {!showTestResults ? (
                      <div className="space-y-8">
                        {activeTest.multipleChoice.map((q, qIndex) => (
                          <div key={q.id} className="p-6 bg-accent/30 rounded-xl border border-border/30">
                            <div className="flex items-start gap-4 mb-4">
                              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                                {qIndex + 1}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-bold text-lg mb-2">{q.questionText}</h3>
                                {q.hasGeometricShape && q.shapeImageUrl && (
                                  <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-300 dark:border-blue-600 shadow-sm">
                                    <img 
                                      src={q.shapeImageUrl} 
                                      alt="الشكل الهندسي"
                                      className="max-w-full h-auto max-h-48 object-contain mx-auto rounded-lg"
                                      data-testid={`shape-image-${q.id}`}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              {Object.entries(q.options).map(([key, value]) => (
                                <button
                                  key={key}
                                  onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: key }))}
                                  data-testid={`option-${q.id}-${key}`}
                                  className={`
                                    relative p-5 rounded-md border text-center font-semibold text-lg
                                    min-h-[70px] flex items-center justify-center
                                    ${testAnswers[q.id] === key
                                      ? "border-primary bg-primary text-white"
                                      : "border-border bg-card hover-elevate"
                                    }
                                  `}
                                >
                                  <span className="absolute top-2 right-3 text-xs font-bold opacity-60">
                                    {key.toUpperCase()}
                                  </span>
                                  {value}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* True/False Questions */}
                        {activeTest.trueFalse && activeTest.trueFalse.length > 0 && (
                          <div className="mt-8">
                            <h3 className="text-xl font-bold mb-4">ضعي كلمة (صح) أو (خطأ)</h3>
                            <div className="space-y-4">
                              {activeTest.trueFalse.map((tf, tfIndex) => (
                                <div key={tf.id} className="p-4 bg-accent/30 rounded-xl border border-border/30">
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                                      {tfIndex + 1}
                                    </div>
                                    <p className="flex-1 font-medium">{tf.statement}</p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => setTestAnswers(prev => ({ ...prev, [`tf-${tf.id}`]: 'true' }))}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                          testAnswers[`tf-${tf.id}`] === 'true'
                                            ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                                            : "border-border/50 hover:border-emerald-300"
                                        }`}
                                      >
                                        صح
                                      </button>
                                      <button
                                        onClick={() => setTestAnswers(prev => ({ ...prev, [`tf-${tf.id}`]: 'false' }))}
                                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                                          testAnswers[`tf-${tf.id}`] === 'false'
                                            ? "border-rose-500 bg-rose-100 text-rose-700"
                                            : "border-border/50 hover:border-rose-300"
                                        }`}
                                      >
                                        خطأ
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center mt-8">
                          <Button 
                            size="lg"
                            className="gap-2 px-8"
                            onClick={() => {
                              let correct = 0;
                              activeTest.multipleChoice.forEach(q => {
                                if (testAnswers[q.id] === q.correctAnswer) correct++;
                              });
                              if (activeTest.trueFalse) {
                                activeTest.trueFalse.forEach(tf => {
                                  const userAnswer = testAnswers[`tf-${tf.id}`];
                                  if ((userAnswer === 'true' && tf.correctAnswer) || (userAnswer === 'false' && !tf.correctAnswer)) {
                                    correct++;
                                  }
                                });
                              }
                              const total = activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0);
                              setTestScore(correct);
                              setShowTestResults(true);
                            }}
                          >
                            <CheckCircle className="w-5 h-5" />
                            تسليم الاختبار
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Test Results */
                      <div className="text-center">
                        <div className={`mb-8 p-8 rounded-2xl ${
                          testScore >= (activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0)) * 0.6
                            ? "bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-400"
                            : "bg-rose-100 dark:bg-rose-900/30 border-2 border-rose-400"
                        }`}>
                          <div className={`text-5xl font-black mb-4 ${
                            testScore >= (activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0)) * 0.6
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}>
                            {testScore} / {activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0)}
                          </div>
                          <p className="text-lg font-bold">
                            {testScore >= (activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0)) * 0.6
                              ? "أحسنت! نتيجة ممتازة"
                              : "حاولي مرة أخرى"}
                          </p>
                          <p className="text-muted-foreground mt-2">
                            النسبة: {Math.round((testScore / (activeTest.multipleChoice.length + (activeTest.trueFalse?.length || 0))) * 100)}%
                          </p>
                        </div>

                        {/* Show correct answers */}
                        <div className="text-right space-y-4">
                          <h3 className="font-bold text-xl mb-4">الإجابات الصحيحة:</h3>
                          {activeTest.multipleChoice.map((q, i) => (
                            <div key={q.id} className={`p-4 rounded-xl border-2 ${
                              testAnswers[q.id] === q.correctAnswer
                                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                                : "border-rose-400 bg-rose-50 dark:bg-rose-900/20"
                            }`}>
                              <div className="flex items-center gap-3">
                                <span className="font-bold">{i + 1}.</span>
                                <span className="flex-1">{q.questionText}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  testAnswers[q.id] === q.correctAnswer
                                    ? "bg-emerald-200 text-emerald-800"
                                    : "bg-rose-200 text-rose-800"
                                }`}>
                                  الإجابة: {q.correctAnswer.toUpperCase()}) {q.options[q.correctAnswer]}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setTestAnswers({});
                              setShowTestResults(false);
                              setTestScore(0);
                            }}
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            إعادة الاختبار
                          </Button>
                          <Button 
                            onClick={() => {
                              setActiveTest(null);
                              setTestAnswers({});
                              setShowTestResults(false);
                            }}
                          >
                            العودة للدروس
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
              <AnimatePresence mode="wait">
                {/* Video Tab Content */}
                {activeTab === "video" && (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Lesson Info + Video Player + قائمة الفيديوهات — الكل داخل مستطيل واحد */}
                    <div className="bg-white dark:bg-card rounded-2xl p-3 sm:p-6 shadow-sm border border-border/50 mb-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white mb-4">
                          <Video className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold mb-2">{getLessonDisplayTitle(currentLesson, lessonTitlesFromApi)}</h2>
                      </div>

                      {(() => {
                        const allVideosFromCms = cmsVideoUrls.length > 0 ? cmsVideoUrls.map(url => ({ url })) : [];
                        const legacyMain = currentLesson?.videoUrl;
                        const legacyOthers = (currentLesson?.additionalVideos || []).map(v => ({ url: v.url, title: v.title, channelName: v.channelName, duration: v.duration }));
                        const videoList = allVideosFromCms.length > 0 ? allVideosFromCms : legacyMain ? [{ url: legacyMain, title: "", channelName: "", duration: "" }, ...legacyOthers] : legacyOthers;
                        return (
                          <VideoTabContent
                            videos={videoList}
                            metadata={videoMetadata}
                            lessonTitle={currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : "فيديو تعليمي"}
                          />
                        );
                      })()}
                    </div>

                    {/* Auto Video Progress Tracker */}
                    <div className="bg-white dark:bg-card rounded-2xl p-3 sm:p-6 shadow-sm border border-border/50 mb-8">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-lg mb-1">تتبع المشاهدة التلقائي</h3>
                          <p className="text-sm text-muted-foreground">
                            {isTabCompleted(subjectId, lessonId, "video") 
                              ? "تم تسجيل مشاهدتك للفيديو ✓" 
                              : `استمر في المشاهدة... (${Math.floor(videoWatchTime / 60)}:${(videoWatchTime % 60).toString().padStart(2, '0')})`
                            }
                          </p>
                        </div>
                        {isTabCompleted(subjectId, lessonId, "video") ? (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Check className="w-5 h-5" />
                            <span className="font-bold">+33.3%</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-bold">جاري التتبع...</span>
                          </div>
                        )}
                      </div>
                      {!isTabCompleted(subjectId, lessonId, "video") && (
                        <div className="mt-4">
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-1000"
                              style={{ width: `${Math.min((videoWatchTime / 120) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* الملخص Tab Content - PDF */}
                {activeTab === "summary" && (
                  <motion.div
                    key="summary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <div className="bg-white dark:bg-card rounded-2xl p-3 sm:p-6 shadow-sm border border-border/50 mb-8">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white mb-3 sm:mb-4">
                          <FileText className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold mb-2">{currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : "الملخص"}</h2>
                      </div>
                      {(() => {
                        const summaryPdfUrl = (cmsSummaryContent?.contentType === "pdf" && cmsSummaryContent?.dataValue)
                          ? cmsSummaryContent.dataValue
                          : currentLesson?.summaryPdfUrl;
                        return summaryPdfUrl ? (
                          <div className="w-full max-w-[1200px] mx-auto overflow-hidden pdf-iframe-container">
                            <iframe
                              src={`${summaryPdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="border-0 block w-full sm:pdf-iframe-desktop"
                              scrolling="no"
                              loading="lazy"
                              style={{ height: '5000px', overflow: 'hidden' }}
                              title={currentLesson ? `${currentLesson.title} - الملخص PDF` : "ملخص الدرس - PDF"}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-semibold mb-2">ملف PDF للملخص</p>
                            <p className="text-sm">سيتم إضافة ملف الملخص (PDF) قريباً</p>
                          </div>
                        );
                      })()}
                    </div>
                  </motion.div>
                )}

                {/* Education Tab Content */}
                {activeTab === "education" && (
                  <motion.div
                    key="education"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full min-h-[500px]"
                  >
                    {loadingEducation ? (
                      <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-8 shadow-sm border border-border/50">
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="mr-3 text-muted-foreground">جاري تحميل المحتوى التعليمي...</span>
                        </div>
                      </div>
                    ) : educationRawHtml ? (
                      <div className="w-full rounded-2xl overflow-hidden border border-border/50 bg-white dark:bg-card shadow-sm">
                        <iframe
                          srcDoc={educationRawHtml}
                          sandbox="allow-scripts allow-same-origin"
                          title="المحتوى التعليمي"
                          className="w-full border-0 block"
                          scrolling="no"
                          style={{ minHeight: "700px", width: "100%", overflow: "hidden" }}
                          onLoad={(e) => {
                            try {
                              const iframe = e.currentTarget;
                              const h = iframe.contentDocument?.documentElement?.scrollHeight;
                              if (h && h > 100) iframe.style.height = h + 40 + "px";
                            } catch (_) {}
                          }}
                        />
                      </div>
                    ) : educationContent && educationContent.trim().length > 0 ? (
                      <div 
                        ref={educationContainerRef}
                        className="w-full education-sandbox"
                        style={{ 
                          display: 'block',
                          height: 'auto'
                        }}
                        dangerouslySetInnerHTML={{ __html: educationContent }}
                      />
                    ) : (
                      <div className="bg-white dark:bg-card rounded-2xl p-4 sm:p-8 shadow-sm border border-border/50">
                        <div className="text-center py-12">
                          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-purple-500 opacity-50" />
                          <p className="text-muted-foreground">لا يوجد محتوى تعليمي متاح حالياً</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Lesson PDF Tab Content */}
                {activeTab === "lesson" && (
                  <motion.div
                    key="lesson"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <div className="bg-white dark:bg-card rounded-2xl p-3 sm:p-6 shadow-sm border border-border/50">
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white mb-3 sm:mb-4">
                          <BookOpenCheck className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold mb-2">{currentLesson ? getLessonDisplayTitle(currentLesson, lessonTitlesFromApi) : "الدرس"}</h2>
                      </div>
                      
                      {(() => {
                        const pdfUrl = (cmsLessonContent?.contentType === "pdf" && cmsLessonContent?.dataValue)
                          ? cmsLessonContent.dataValue
                          : currentLesson?.pdfUrl;
                        return pdfUrl ? (
                          <div className="w-full max-w-[1200px] mx-auto overflow-hidden pdf-iframe-container">
                            <iframe
                              ref={pdfIframeRef}
                              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                              className="border-0 block w-full sm:pdf-iframe-desktop"
                              scrolling="no"
                              loading="lazy"
                              style={{ height: '5000px', overflow: 'hidden' }}
                              title={currentLesson ? `${getLessonDisplayTitle(currentLesson, lessonTitlesFromApi)} - PDF` : "شرح الدرس PDF"}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-semibold mb-2">ملف PDF للدرس</p>
                            <p className="text-sm">سيتم عرض ملف الشرح هنا</p>
                          </div>
                        );
                      })()}

                      {/* Auto Lesson Reading Tracker */}
                      <div className="mt-6 p-4 rounded-xl border border-border/50 bg-accent/30">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold mb-1">تتبع القراءة التلقائي</h3>
                            <p className="text-sm text-muted-foreground">
                              {isTabCompleted(subjectId, lessonId, "lesson") 
                                ? "تم تسجيل قراءتك للدرس ✓" 
                                : "استمر في القراءة لمدة دقيقتين..."
                              }
                            </p>
                          </div>
                          {isTabCompleted(subjectId, lessonId, "lesson") ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm">
                              <Check className="w-4 h-4" />
                              <span className="font-bold">+33.3%</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="font-bold">جاري التتبع...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SSA Tab Content - درس النسبة يستخدم اختبار تفاعلي React */}
                {activeTab === "ssa" && (
                  <motion.div
                    key="ssa"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    {!currentLesson ? (
                      <div className="py-12 text-center text-muted-foreground">يرجى اختيار درس من القائمة الجانبية</div>
                    ) : currentLesson.id === "5-1" ? (
                      <PolygonAnglesQuizSSA />
                    ) : loadingSsa ? (
                      <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-sm border border-border/50">
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <span className="mr-3 text-muted-foreground">جاري تحميل الأسئلة...</span>
                        </div>
                      </div>
                    ) : hasSsaContent ? (
                      <iframe
                        key={currentLesson.id}
                        src={`/api/content/lesson/${currentLesson.id}/ssa-html`}
                        className="w-full border-0 block"
                        scrolling="no"
                        style={{ minHeight: "3000px", overflow: "hidden" }}
                        title="محتوى شارف AI"
                        onLoad={(e) => {
                          try {
                            const iframe = e.currentTarget;
                            const h = iframe.contentDocument?.documentElement?.scrollHeight;
                            if (h && h > 100) iframe.style.height = h + 40 + "px";
                          } catch (_) {}
                        }}
                      />
                    ) : (
                      <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-sm border border-border/50">
                        <div className="text-center py-12">
                          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-primary/50" />
                          <p className="text-muted-foreground">لا يوجد محتوى أسئلة متاح حالياً لهذا الدرس</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
              )}

              {/* Navigation Buttons - نفس التنسيق لجميع التبويبات */}
              {currentLesson && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-between gap-4 mt-8"
              >
                <div className="flex items-center justify-between gap-4 w-full">
                {prevLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(prevLesson.id)}
                    className="flex-1 gap-2 rounded-xl h-14"
                    data-testid="button-prev-lesson"
                  >
                    <ArrowRight className="w-5 h-5" />
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">الدرس السابق</div>
                      <div className="font-semibold text-sm truncate">{prevLesson.title}</div>
                    </div>
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}

                {nextLesson ? (
                  <Button
                    variant="outline"
                    onClick={() => goToLesson(nextLesson.id)}
                    className="flex-1 gap-2 rounded-xl h-14"
                    data-testid="button-next-lesson"
                  >
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">الدرس التالي</div>
                      <div className="font-semibold text-sm truncate">{nextLesson.title}</div>
                    </div>
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </Button>
                ) : (
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full gap-2 rounded-xl h-14" data-testid="button-back-dashboard">
                      <div className="text-right">
                        <div className="text-xs opacity-80">أحسنت!</div>
                        <div className="font-semibold text-sm">العودة للوحة التحكم</div>
                      </div>
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
                </div>
              </motion.div>
              )}
                </>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
