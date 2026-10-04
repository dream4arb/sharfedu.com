import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  ChevronLeft,
  Clock3,
  GraduationCap,
  ListChecks,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { POLYGON_ANGLES_LESSON_ID } from "@shared/lesson-engine/polygon-angles";
import { getRegisteredLesson, lessonRegistry } from "@shared/lesson-engine/registry";
import type { LessonStepDefinition, TutorVisualAction } from "@shared/lesson-engine/types";
import { MasteryReport } from "./MasteryReport";
import { StudioLessonIntroduction } from "./StudioLessonIntroduction";
import { LearningSection } from "./LearningStudio";
import "./learningStudio.css";
import { OfficialBookLesson } from "./OfficialBookLesson";
import { LessonVideoPlayer } from "./LessonVideoPlayer";
import { PolygonLab } from "./PolygonLab";
import { QuestionCard } from "./QuestionCard";
import { TutorPanel } from "./TutorPanel";
import { useLessonSession } from "./useLessonSession";
import {
  ExteriorTurnLab,
  FormulaDiscoveryLab,
  MissingAngleLab,
  PolygonPatternExplorer,
  VisualLessonMap,
} from "./VisualLessonLabs";
import {
  DecimalPatternLab,
  FractionDecimalMachine,
  OperationPropertiesLab,
  RationalNumberLineLab,
  RealNumberSetsLab,
} from "./RealNumberVisualLabs";
import { setPageMeta } from "@/lib/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildLessonTabs, getLessonTabId, getReviewStepIndex, type LessonTabId } from "./lessonNavigation";
import { lessonPresentation } from "./lessonPresentation";
import { ActivityGuide } from "./ActivityGuide";
import { ActivityReminder } from "./ActivityReminder";
import { getLessonActivities, getPendingActivities } from "./lessonActivities";
import { useActivityProgress } from "./useActivityProgress";

export default function InteractiveLessonPage() {
  const { lessonId: requestedLessonId } = useParams<{ lessonId?: string }>();
  const requestedEntry = getRegisteredLesson(requestedLessonId);
  const registered = requestedEntry ?? lessonRegistry[POLYGON_ANGLES_LESSON_ID];
  const lesson = registered.lesson;
  const activities = useMemo(() => getLessonActivities(lesson), [lesson]);
  const { triedStepIds, markTried } = useActivityProgress(lesson, activities);
  const pendingActivities = getPendingActivities(activities, triedStepIds);
  const questionMap = registered.questionMap;
  const lessonVideos = (lesson.videos ?? []).slice(0, 4);
  const {
    session,
    setStepIndex,
    recordAttempt,
    recordHint,
    mastery,
    emitEvent,
    completeLesson,
  } = useLessonSession(lesson);
  const [visualAction, setVisualAction] = useState<TutorVisualAction | null>(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [playedVideoIds, setPlayedVideoIds] = useState<string[]>([]);
  const assessmentEventSent = useRef(false);
  const currentStep = lesson.steps[session.stepIndex];
  const lessonTabs = useMemo(() => buildLessonTabs(lesson), [lesson]);
  const activeTabId = getLessonTabId(currentStep);
  const activeTabIndex = lessonTabs.findIndex((tab) => tab.id === activeTabId);
  const learningTab = lessonTabs.find((tab) => tab.id === "learn")!;
  const assessmentStep = lesson.steps.find((step) => step.type === "assessment");
  const reportStepIndex = lesson.steps.findIndex((step) => step.type === "report");
  const lastLearningStep = useRef(learningTab.stepIndexes[0]);
  if (activeTabId === "learn") lastLearningStep.current = session.stepIndex;
  const currentStepIndexRef = useRef(session.stepIndex);
  currentStepIndexRef.current = session.stepIndex;
  const setStepIndexRef = useRef(setStepIndex);
  setStepIndexRef.current = setStepIndex;
  const layoutWidth = lessonPresentation.showTutor ? "max-w-[1500px]" : "max-w-[1280px]";
  const selectedVideo = lessonVideos[selectedVideoIndex] ?? lessonVideos[0];
  const assessmentQuestions = useMemo(() => (assessmentStep?.questionIds ?? lesson.assessmentQuestionIds)
    .map((id) => questionMap[id]).filter(Boolean), [assessmentStep, lesson.assessmentQuestionIds, questionMap]);
  const answeredCount = assessmentQuestions.filter((question) => (session.questions[question.id]?.attempts ?? 0) > 0).length;
  const assessmentComplete = assessmentQuestions.length > 0 && answeredCount === assessmentQuestions.length;
  const showReport = activeTabId === "assessment" && currentStep.type === "report" && assessmentComplete;
  const contentSteps = lesson.steps.filter((step) => step.type !== "assessment" && step.type !== "report");
  const visitedContentCount = contentSteps.filter((step) => session.visitedStepIds.includes(step.id)).length;
  const progress = session.completedAt ? 100 : Math.round(
    (visitedContentCount / Math.max(1, contentSteps.length)) * 75
    + (answeredCount / Math.max(1, assessmentQuestions.length)) * 25,
  );

  useEffect(() => {
    setPageMeta({
      title: `${lesson.title} - درس تفاعلي`,
      description: `تعلّم ${lesson.title} بالشرح التفاعلي ومعلم شارف واختبار إتقان المهارات.`,
      keywords: `${lesson.title}, ${lesson.subject}, ${lesson.grade}, درس تفاعلي`,
    });
  }, [lesson.grade, lesson.subject, lesson.title]);

  function selectVideo(index: number) {
    setSelectedVideoIndex(index);
  }

  function recordVideoStarted() {
    if (!selectedVideo) return;
    setPlayedVideoIds((ids) => ids.includes(selectedVideo.id) ? ids : [...ids, selectedVideo.id]);
    emitEvent({
      name: "video_started",
      metadata: {
        videoId: selectedVideo.id,
        videoNumber: selectedVideoIndex + 1,
        availableVideos: lessonVideos.length,
      },
    });
  }

  useEffect(() => {
    const key = `sharaf:started-event:${lesson.id}:${session.sessionId}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      emitEvent({ name: "lesson_started", stepId: currentStep.id });
    }
  }, [currentStep.id, emitEvent, session.sessionId]);

  useEffect(() => {
    if (activeTabId === "assessment" && assessmentComplete && !assessmentEventSent.current) {
      assessmentEventSent.current = true;
      emitEvent({ name: "assessment_completed" });
    }
    if (showReport) completeLesson();
  }, [completeLesson, activeTabId, emitEvent, assessmentComplete, showReport]);

  useEffect(() => {
    if (currentStep.type !== "official_book") return;
    const key = `sharaf:book-opened-event:${lesson.id}:${session.sessionId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    emitEvent({ name: "book_opened", stepId: currentStep.id, metadata: { pages: lesson.curriculumSource.lessonPages?.length ?? 0 } });
  }, [currentStep.id, currentStep.type, emitEvent, session.sessionId]);

  useEffect(() => {
    if (activeTabId !== "learn") return;
    // Expanded sections count as visited when reached, not merely when mounted.
    const observer = new IntersectionObserver((entries) => {
      const visibleHeading = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!visibleHeading) return;
      const index = Number((visibleHeading.target as HTMLElement).dataset.learningStepIndex);
      if (index === currentStepIndexRef.current) return;
      currentStepIndexRef.current = index;
      setStepIndexRef.current(index);
    }, { rootMargin: "0px 0px -35% 0px", threshold: 0.5 });
    document.querySelectorAll("[data-learning-step-index]").forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [activeTabId, lesson.id]);

  function selectTab(tabId: LessonTabId) {
    const tab = lessonTabs.find((item) => item.id === tabId);
    if (!tab || !tab.stepIndexes.length) return false;
    const nextStepIndex = tabId === "learn" ? lastLearningStep.current
      : tabId === "assessment" && session.completedAt && assessmentComplete ? reportStepIndex
      : tab.stepIndexes[0];
    setStepIndex(nextStepIndex >= 0 ? nextStepIndex : tab.stepIndexes[0]);
    return true;
  }

  function navigateTab(direction: -1 | 1) {
    const nextTab = lessonTabs[activeTabIndex + direction];
    if (!nextTab) return;
    if (selectTab(nextTab.id)) window.scrollTo({ top: 0 });
  }

  function showResults() {
    if (!assessmentComplete || reportStepIndex < 0) return;
    setStepIndex(reportStepIndex);
    requestAnimationFrame(() => document.getElementById("lesson-result")?.focus());
  }

  function handleVisualAction(action: TutorVisualAction) {
    if (action.type !== "show_polygon") return;
    const discoveryIndex = lesson.steps.findIndex((step) => step.type === "polygon_discovery");
    if (discoveryIndex >= 0) openLearningSection(discoveryIndex);
    setVisualAction({ ...action });
  }

  function openLearningSection(index: number) {
    setStepIndex(index);
    requestAnimationFrame(() => {
      const section = document.getElementById(`learning-section-${lesson.steps[index].id}`);
      section?.scrollIntoView({ block: "start" });
      section?.focus({ preventScroll: true });
    });
  }

  function reviewSkill(skillId: string) {
    const stepIndex = getReviewStepIndex(lesson, skillId);
    openLearningSection(stepIndex >= 0 ? stepIndex : learningTab.stepIndexes[0]);
  }

  function renderStep(step: LessonStepDefinition, showHeading = true, showTutorMessage = true) {
    // Graded questions live only in the final tab, not in the learning sections.
    const stepQuestions = step.type === "assessment" ? assessmentQuestions : [];
    const tutorMessage = showTutorMessage ? step.tutorMessage : undefined;
    const activity = activities.find((item) => item.stepId === step.id);
    const visuals = {
      "polygon-pattern": <PolygonPatternExplorer />,
      "polygon-discovery": <PolygonLab externalAction={visualAction} />,
      "polygon-formula": <FormulaDiscoveryLab />,
      "polygon-missing-angle": <MissingAngleLab />,
      "polygon-exterior": <ExteriorTurnLab />,
      "real-number-sets": <RealNumberSetsLab />,
      "real-number-decimals": <DecimalPatternLab />,
      "real-number-properties": <OperationPropertiesLab />,
      "rational-number-line": <RationalNumberLineLab />,
      "fraction-decimal-machine": <FractionDecimalMachine />,
    };
    return (
      <>
        {step.type !== "official_book" && (showHeading || tutorMessage) && <div className="mb-6">
          {showHeading && <div className={step.type === "video" ? "text-center" : undefined} data-testid="lesson-step-heading">
            <p className="text-sm font-black text-cyan-700">{lessonTabs[activeTabIndex].title}</p>
            <h1 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl" data-testid="lesson-step-title">{step.title}</h1>
          </div>}
          {tutorMessage && (
            <div className="studio-note mt-4 flex gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 leading-7 text-cyan-950">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-cyan-700" />
              <p><strong>شارف:</strong> {tutorMessage}</p>
            </div>
          )}
        </div>}

        {step.type === "objectives" && (
          <div className="space-y-5">
            <StudioLessonIntroduction introduction={lesson.introduction} />
            <section className="studio-objectives rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Clock3 className="h-4 w-4" /> نحو {lesson.estimatedMinutes} دقيقة</span>
                <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><GraduationCap className="h-4 w-4" /> {lesson.grade}</span>
                <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><BookOpenCheck className="h-4 w-4" /> {lesson.subject}</span>
              </div>
              <h2 className="mt-6 flex items-center gap-2 text-xl font-black text-slate-900"><Target className="h-6 w-6 text-cyan-700" /> أهداف الدرس</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {lesson.objectives.map((objective) => (
                  <li key={objective} className="flex gap-3 rounded-2xl bg-slate-50 p-4 leading-7 text-slate-800"><span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-800"><Check className="h-4 w-4" /></span>{objective}</li>
                ))}
              </ul>
            </section>
            <section className="studio-learning-method rounded-3xl bg-gradient-to-l from-cyan-800 to-slate-900 p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-cyan-200">طريقة التعلم</p>
              <h2 className="mt-2 text-2xl font-black">افهم، شاهد، حرّك، ثم طبّق</h2>
              <p className="mt-3 max-w-2xl leading-8 text-slate-200">راجع الدرس من كتاب الوزارة، واختر شرح الفيديو الأنسب لك. هنا تجد الشرح والأنشطة البصرية مجتمعة بلا درجات، ثم تنتقل إلى اختبار واحد ونتيجته في المكان نفسه.</p>
            </section>
          </div>
        )}

        {step.type === "official_book" && (
          <OfficialBookLesson
            source={lesson.curriculumSource}
            lessonTitle={lesson.title}
            onPageViewed={(pageNumber) => emitEvent({ name: "book_page_viewed", stepId: step.id, metadata: { pageNumber } })}
          />
        )}

        {step.visualKind && activity && <ActivityGuide activity={activity} tried={triedStepIds.includes(step.id)} onTry={markTried}>{visuals[step.visualKind]}</ActivityGuide>}

        {step.body && !step.visualKind?.startsWith("polygon-") && (
          <section className="studio-prose-block mb-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <ul className="space-y-3">
              {step.body.map((paragraph) => <li key={paragraph} className="flex gap-3 text-lg leading-8 text-slate-800"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-cyan-600" />{paragraph}</li>)}
            </ul>
          </section>
        )}

        {step.type === "assessment" && (
          <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 leading-7 text-violet-950">
            <p className="flex items-center gap-2 font-black"><ListChecks className="h-5 w-5" /> {stepQuestions.length} أسئلة تغطي مهارات الدرس</p>
          </div>
        )}

        {stepQuestions.length > 0 && (
          <div className="space-y-4">
            {stepQuestions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                progress={session.questions[question.id]}
                assessmentMode={step.type === "assessment"}
                onAttempt={recordAttempt}
                onHint={recordHint}
              />
            ))}
          </div>
        )}

        {step.type === "video" && (
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div data-testid="lesson-video-player" className="aspect-video bg-slate-950">
                {selectedVideo ? <LessonVideoPlayer key={selectedVideo.id} video={selectedVideo} onStarted={recordVideoStarted} />
                  : <p className="flex h-full items-center justify-center p-5 text-center text-white">لا يتوفر شرح مرئي لهذا الدرس حاليًا.</p>}
              </div>
              <div className="p-5">
                <h2 className="font-black text-slate-900">{selectedVideo?.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedVideo?.channelName}{selectedVideo?.duration ? ` · ${selectedVideo.duration}` : ""}</p>
              </div>
              <div data-testid="lesson-video-options" className="border-t border-slate-200 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-cyan-700">اختر الشرح الأنسب لك</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{lessonVideos.length} {lessonVideos.length === 1 ? "شرح متاح" : "شروحات متاحة"}</h2>
                  </div>
                  {playedVideoIds.length > 0 && <p className="text-sm font-bold text-emerald-700">شغّلت {playedVideoIds.length} من {lessonVideos.length}</p>}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" role="group" aria-label="شروحات الفيديو المتاحة">
                  {lessonVideos.map((video, index) => {
                    const selected = selectedVideo?.id === video.id;
                    const played = playedVideoIds.includes(video.id);
                    const thumbnailUrl = video.thumbnailUrl ?? `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
                    return (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => selectVideo(index)}
                        aria-pressed={selected}
                        className={`overflow-hidden rounded-2xl border-2 text-right transition ${selected ? "border-cyan-700 bg-cyan-50 ring-4 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-300"}`}
                      >
                        <span className="relative block aspect-video overflow-hidden bg-slate-900">
                          <img src={thumbnailUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                          <span className="absolute inset-0 flex items-center justify-center bg-slate-950/35"><PlayCircle className="h-10 w-10 text-white" /></span>
                          {video.source === "hosted" && <span className="absolute right-2 top-2 rounded-full bg-cyan-700 px-2 py-1 text-xs font-black text-white">شرح شارف</span>}
                          {played && <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-black text-white">شغّلته</span>}
                        </span>
                        <span className="block p-3">
                          <span className="block text-xs font-black text-cyan-700">الشرح {index + 1}</span>
                          <span className="mt-1 block line-clamp-2 text-sm font-black text-slate-900">{video.title}</span>
                          {video.channelName && <span className="mt-1 block truncate text-xs text-slate-500">{video.channelName}</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {lessonVideos.length > 1 && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-950">لم يناسبك شرح المعلم الأول؟ اختر أي شرح آخر من البطاقات، ويمكنك العودة بينها في أي وقت.</p>}
              </div>
          </section>
        )}

        {step.type === "teacher_summary" && (
          <div className="space-y-5">
            {lesson.id === POLYGON_ANGLES_LESSON_ID && activity ? <ActivityGuide activity={activity} tried={triedStepIds.includes(step.id)} onTry={markTried}><VisualLessonMap /></ActivityGuide> : (
              <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-5 sm:p-7">
                <p className="text-sm font-black text-cyan-700">خريطة المهارات</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {lesson.skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-start gap-3 rounded-2xl border border-cyan-100 bg-white p-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-800 font-black text-white">{index + 1}</span>
                      <div><p className="font-black text-slate-900">{skill.title}</p><p className="mt-1 text-sm leading-6 text-slate-600">{skill.description}</p></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section className="studio-summary rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
              <div className="flex items-center justify-center gap-2 text-emerald-900"><ShieldCheck className="h-6 w-6" /><h2 className="text-xl font-black">ملخص المحتوى</h2></div>
              <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                {lesson.teacherSummary.points.map((point, index) => (
                  <li key={point} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 leading-7 text-emerald-950">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-black text-white">{index + 1}</span>
                    {point}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        )}

        {step.type === "report" && <MasteryReport lesson={lesson} mastery={mastery} onReview={reviewSkill} />}
      </>
    );
  }

  if (requestedLessonId && !requestedEntry) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 p-6 text-center">
        <div><h1 className="text-2xl font-black">الدرس غير متاح بعد</h1><p className="mt-2 text-slate-600">لن نعرض صفحة فارغة. عد إلى فهرس المادة واختر درسًا متاحًا.</p><Link href="/" className="mt-5 inline-flex min-h-12 items-center rounded-xl bg-cyan-800 px-5 font-black text-white">العودة إلى شارف</Link></div>
      </main>

    );
  }

  return (
    <Tabs value={activeTabId} onValueChange={(value) => selectTab(value as LessonTabId)} dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f7fafb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className={`mx-auto flex ${layoutWidth} items-center gap-3 px-4 py-3 sm:px-6`}>
          <Link href="/" className="flex shrink-0 items-center gap-2 font-black text-cyan-800" aria-label="العودة إلى منصة شارف">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-800 text-white">ش</span>
            <span className="hidden sm:inline">شارف</span>
          </Link>
          <span className="h-7 w-px bg-slate-200" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-slate-500">{lesson.stage} · {lesson.grade} · {lesson.subject}</p>
            <p className="truncate text-sm font-black text-slate-900">{lesson.title}</p>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:inline">يحفظ التقدم تلقائيًا</span>
        </div>
        <div className="h-1.5 bg-slate-100" role="progressbar" aria-label="تقدم تصفح الدرس والاختبار" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gradient-to-l from-cyan-600 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white/80">
        <nav className={`mx-auto ${layoutWidth} px-4 py-3 sm:px-6`} aria-label="أقسام الدرس">
          <TabsList className="grid h-auto grid-cols-2 items-stretch gap-2 rounded-none bg-transparent p-0 sm:grid-cols-4" aria-label="تبويبات الدرس">
          {lessonTabs.map((tab, index) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={!tab.stepIndexes.length}
              className="min-h-12 min-w-0 gap-2 whitespace-normal rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center text-xs font-bold leading-5 text-slate-600 hover:bg-cyan-50 data-[state=active]:border-cyan-800 data-[state=active]:bg-cyan-800 data-[state=active]:text-white data-[state=active]:shadow-none sm:text-sm"
            >
              <span aria-hidden="true" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100/20">{index + 1}</span>
              <span>{tab.title}</span>
            </TabsTrigger>
          ))}
          </TabsList>
        </nav>
      </div>

      <main className={`mx-auto grid ${layoutWidth} gap-6 px-4 py-6 sm:px-6 lg:items-start lg:py-8 ${lessonPresentation.showTutor ? "lg:grid-cols-[minmax(0,1fr)_390px]" : "grid-cols-1"}`}>
        <article className="min-w-0">
          {lessonTabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className={`mt-0 min-w-0 ${tab.id === "learn" ? "lesson-studio" : ""}`}>
              {tab.id === "book" || tab.id === "video" ? tab.stepIndexes.map((index) => <div key={lesson.steps[index].id}>{renderStep(lesson.steps[index])}</div>) : null}

              {tab.id === "learn" && <>
                <div className="studio-page-heading">
                  <h1 data-testid="lesson-step-title">شرح درس {lesson.title}</h1>
                </div>
                <div className="studio-section-stack" data-testid="learning-section-stack">
                  {tab.stepIndexes.map((index, sectionIndex) => {
                    const step = lesson.steps[index];
                    return <LearningSection key={step.id} step={step} index={index} sectionNumber={sectionIndex + 1}
                      onFocus={() => {
                        if (currentStepIndexRef.current !== index) setStepIndexRef.current(index);
                      }}>{renderStep(step, false, step.type !== "objectives")}</LearningSection>;
                  })}
                </div>
              </>}

              {tab.id === "assessment" && assessmentStep && <>
                {showReport ? <>
                  <section id="lesson-result" tabIndex={-1} className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700" data-testid="lesson-result">
                    <p className="text-sm font-black text-cyan-700">اختبار الدرس والنتيجة</p>
                    <h1 className="mb-6 mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl" data-testid="lesson-step-title">نتيجتك وما تحتاج إلى مراجعته</h1>
                    <details className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5" data-testid="assessment-answer-review">
                      <summary className="cursor-pointer rounded-lg py-2 font-black text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700">راجع إجابات الاختبار</summary>
                      <div className="mt-4">{renderStep(assessmentStep, false)}</div>
                    </details>
                    <MasteryReport lesson={lesson} mastery={mastery} onReview={reviewSkill} />
                  </section>
                </> : renderStep(assessmentStep)}
              </>}
            </TabsContent>
          ))}

            <footer className={`mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 ${activeTabId === "learn" ? "studio-footer" : ""}`}>
              {activeTabId === "assessment" && !showReport && <p className="mb-3 text-center text-sm font-bold text-slate-600" role="status">أجبت عن {answeredCount} من {assessmentQuestions.length}. {assessmentComplete ? "نتيجتك جاهزة للعرض هنا." : "أجب عن جميع الأسئلة لإظهار نتيجتك."}</p>}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button type="button" onClick={() => navigateTab(-1)} disabled={activeTabIndex === 0} className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-4 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30"><ArrowRight className="h-5 w-5" /> السابق</button>
                <span className="hidden text-sm font-bold text-slate-500 sm:inline">{activeTabIndex + 1} من 4</span>
                {activeTabId === "assessment" ? !showReport && (
                  <button type="button" onClick={showResults} disabled={!assessmentComplete} className="flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-35" data-testid="button-show-results">اعرض نتيجتي<ArrowLeft className="h-5 w-5" /></button>
                ) : (
                  <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-4 gap-y-2" data-testid="next-step-area">
                    {activeTabId === "learn" && !assessmentComplete && <ActivityReminder pendingCount={pendingActivities.length} />}
                    <button type="button" onClick={() => navigateTab(1)} className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-black text-white hover:bg-cyan-800" data-testid="button-next-step">
                      {activeTabId === "learn" ? "ابدأ اختبار الدرس" : lessonTabs[activeTabIndex + 1].title}<ArrowLeft className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </footer>
        </article>

        {lessonPresentation.showTutor && <TutorPanel
          lesson={lesson}
          currentStepId={currentStep.id}
          mastery={mastery}
          questions={session.questions}
          onVisualAction={handleVisualAction}
          onTutorQuestion={() => emitEvent({ name: "tutor_question", stepId: currentStep.id })}
        />}
      </main>

      <Link href="/" className="fixed bottom-4 left-4 hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:text-cyan-800 xl:flex" aria-label="العودة للرئيسية"><ChevronLeft className="h-5 w-5" /></Link>
    </Tabs>
  );
}
