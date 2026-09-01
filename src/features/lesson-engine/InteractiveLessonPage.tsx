import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
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
import { polygonAnglesLesson, polygonAnglesQuestionMap } from "@shared/lesson-engine/polygon-angles";
import type { LessonStepDefinition, TutorVisualAction } from "@shared/lesson-engine/types";
import { MasteryReport } from "./MasteryReport";
import { MathFormula } from "./MathFormula";
import { LessonIntroduction } from "./LessonIntroduction";
import { PolygonLab } from "./PolygonLab";
import { QuestionCard } from "./QuestionCard";
import { TutorPanel } from "./TutorPanel";
import { useLessonSession } from "./useLessonSession";
import { setPageMeta } from "@/lib/seo";

const lesson = polygonAnglesLesson;
const lessonVideos = (lesson.videos ?? []).slice(0, 4);

export default function InteractiveLessonPage() {
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
  const [loadedVideoId, setLoadedVideoId] = useState<string | null>(null);
  const [playedVideoIds, setPlayedVideoIds] = useState<string[]>([]);
  const assessmentEventSent = useRef(false);
  const currentStep = lesson.steps[session.stepIndex];
  const selectedVideo = lessonVideos[selectedVideoIndex] ?? lessonVideos[0];
  const progress = Math.round(((session.unlockedStepIndex + 1) / lesson.steps.length) * 100);

  useEffect(() => {
    setPageMeta({
      title: "زوايا المضلع - درس تفاعلي",
      description: "تعلّم مجموع الزوايا الداخلية للمضلع بالرسم التفاعلي والأسئلة وشارف Tutor واختبار إتقان المهارات.",
      keywords: "زوايا المضلع, مجموع الزوايا الداخلية, رياضيات أول ثانوي, درس تفاعلي",
    });
  }, []);

  const currentQuestions = useMemo(() => (currentStep.questionIds ?? [])
    .map((id) => polygonAnglesQuestionMap[id])
    .filter(Boolean), [currentStep]);

  const stepComplete = useMemo(() => {
    if (currentStep.type === "video") return lessonVideos.length === 0 || playedVideoIds.length > 0;
    if (!currentQuestions.length) return true;
    if (currentStep.type === "assessment") {
      return currentQuestions.every((question) => (session.questions[question.id]?.attempts ?? 0) > 0);
    }
    return currentQuestions.every((question) => session.questions[question.id]?.correct === true);
  }, [currentQuestions, currentStep.type, session.questions, playedVideoIds]);

  function selectVideo(index: number) {
    setSelectedVideoIndex(index);
    setLoadedVideoId(null);
  }

  function playSelectedVideo() {
    if (!selectedVideo) return;
    setLoadedVideoId(selectedVideo.id);
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
    if (currentStep.type === "assessment" && stepComplete && !assessmentEventSent.current) {
      assessmentEventSent.current = true;
      emitEvent({ name: "assessment_completed" });
    }
    if (currentStep.type === "report") completeLesson();
  }, [completeLesson, currentStep.type, emitEvent, stepComplete]);

  function next() {
    if (!stepComplete || session.stepIndex >= lesson.steps.length - 1) return;
    setStepIndex(session.stepIndex + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function previous() {
    if (session.stepIndex === 0) return;
    setStepIndex(session.stepIndex - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleVisualAction(action: TutorVisualAction) {
    const discoveryIndex = lesson.steps.findIndex((step) => step.type === "polygon_discovery");
    if (discoveryIndex >= 0) setStepIndex(discoveryIndex);
    setVisualAction({ ...action });
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function reviewSkill(skillId: string) {
    const stepIndex = lesson.steps.findIndex((step) => step.questionIds?.some((questionId) => polygonAnglesQuestionMap[questionId]?.skillId === skillId));
    setStepIndex(stepIndex >= 0 ? stepIndex : 0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderStep(step: LessonStepDefinition) {
    return (
      <>
        <div className="mb-6">
          <p className="text-sm font-black text-cyan-700">{step.eyebrow}</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl" data-testid="lesson-step-title">{step.title}</h1>
          {step.tutorMessage && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 leading-7 text-cyan-950">
              <Sparkles className="mt-1 h-5 w-5 shrink-0 text-cyan-700" />
              <p><strong>شارف:</strong> {step.tutorMessage}</p>
            </div>
          )}
        </div>

        {step.type === "objectives" && (
          <div className="space-y-5">
            <LessonIntroduction introduction={lesson.introduction} />
            <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
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
            <section className="rounded-3xl bg-gradient-to-l from-cyan-800 to-slate-900 p-6 text-white sm:p-8">
              <p className="text-sm font-bold text-cyan-200">طريقة التعلم</p>
              <h2 className="mt-2 text-2xl font-black">افهم، شاهد، حرّك، ثم طبّق</h2>
              <p className="mt-3 max-w-2xl leading-8 text-slate-200">تبدأ بشرح واضح، ثم فيديو، ثم أنشطة رسم وسحب واختيار. إذا أخطأت، ستحصل على ملاحظة مرتبطة بنوع الخطأ ثم محاولة جديدة.</p>
            </section>
          </div>
        )}

        {step.type === "polygon_discovery" && <PolygonLab externalAction={visualAction} />}

        {step.body && (
          <section className="mb-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
            <ul className="space-y-3">
              {step.body.map((paragraph) => <li key={paragraph} className="flex gap-3 text-lg leading-8 text-slate-800"><span className="mt-3 h-2 w-2 shrink-0 rounded-full bg-cyan-600" />{paragraph}</li>)}
            </ul>
            {step.type === "worked_example" && <MathFormula expression="360^\circ - (135^\circ + 90^\circ + 90^\circ) = 45^\circ" label="ثلاثمئة وستون ناقص مجموع مئة وخمس وثلاثين وتسعين وتسعين يساوي خمسًا وأربعين درجة" />}
          </section>
        )}

        {step.formula && <MathFormula expression={step.formula} label={step.formulaLabel} />}

        {step.type === "assessment" && (
          <div className="mb-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 leading-7 text-violet-950">
            <p className="flex items-center gap-2 font-black"><ListChecks className="h-5 w-5" /> خمسة أسئلة تغطي مهارات الدرس</p>
            <p className="mt-1 text-sm">أجب من دون تلميحات. يمكنك تصحيح إجابتك، لكن التقرير سيأخذ عدد المحاولات في الحسبان.</p>
          </div>
        )}

        {currentQuestions.length > 0 && (
          <div className="space-y-4">
            {currentQuestions.map((question) => (
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
              <div className="border-b border-slate-200 p-5 sm:p-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-cyan-700">اختر الشرح الأنسب لك</p>
                    <h2 className="mt-1 text-xl font-black text-slate-950">{lessonVideos.length} {lessonVideos.length === 1 ? "شرح متاح" : "شروحات متاحة"}</h2>
                  </div>
                  {playedVideoIds.length > 0 && <p className="text-sm font-bold text-emerald-700">شاهدت {playedVideoIds.length} من {lessonVideos.length}</p>}
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
                          {played && <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-xs font-black text-white">شاهدته</span>}
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

              <div className="aspect-video bg-slate-950">
                {selectedVideo && loadedVideoId === selectedVideo.id ? (
                  selectedVideo.source === "hosted" ? (
                    <video
                      className="h-full w-full"
                      controls
                      playsInline
                      autoPlay
                      preload="metadata"
                      poster={selectedVideo.thumbnailUrl}
                      aria-label={selectedVideo.title}
                    >
                      <source src={selectedVideo.url} type="video/mp4" />
                      {selectedVideo.captionsUrl && (
                        <track
                          kind="subtitles"
                          src={selectedVideo.captionsUrl}
                          srcLang="ar"
                          label="العربية"
                          default
                        />
                      )}
                      متصفحك لا يدعم تشغيل الفيديو.
                    </video>
                  ) : (
                    <iframe
                      className="h-full w-full"
                      src={selectedVideo.url}
                      title={selectedVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <button
                    type="button"
                    onClick={playSelectedVideo}
                    disabled={!selectedVideo}
                    className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_center,_#164e63,_#020617_70%)] text-white"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-cyan-800"><PlayCircle className="h-9 w-9" /></span>
                    <span className="px-5 text-center text-lg font-black">شغّل {selectedVideo?.title ?? "الفيديو"}</span>
                    <span className="text-sm text-slate-300">الشرح {selectedVideoIndex + 1} من {lessonVideos.length}</span>
                  </button>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-black text-slate-900">{selectedVideo?.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedVideo?.channelName}{selectedVideo?.duration ? ` · ${selectedVideo.duration}` : ""}</p>
                <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">أثناء المشاهدة، تتبّع رأسًا واحدًا في الرسم وعدّ المثلثات التي تظهر. بعد تشغيل الفيديو ستتمكن من الانتقال إلى النشاط التالي.</p>
              </div>
          </section>
        )}

        {step.type === "teacher_summary" && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-7">
            <div className="flex items-center gap-2 text-emerald-900"><ShieldCheck className="h-6 w-6" /><h2 className="text-xl font-black">ملخص المعلم</h2></div>
            <p className="mt-2 text-sm font-bold text-emerald-700">{lesson.teacherSummary.attribution}</p>
            <ol className="mt-5 grid gap-3 sm:grid-cols-2">
              {lesson.teacherSummary.points.map((point, index) => (
                <li key={point} className="flex gap-3 rounded-2xl border border-emerald-100 bg-white/80 p-4 leading-7 text-emerald-950">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-700 font-black text-white">{index + 1}</span>
                  {point}
                </li>
              ))}
            </ol>
          </section>
        )}

        {step.type === "report" && <MasteryReport lesson={lesson} mastery={mastery} onReview={reviewSkill} />}
      </>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen overflow-x-hidden bg-[#f7fafb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6">
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
        <div className="h-1.5 bg-slate-100" role="progressbar" aria-label="تقدم الدرس" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-gradient-to-l from-cyan-600 to-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white/80">
        <nav className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-4 py-3 sm:px-6" aria-label="مراحل الدرس">
          {lesson.steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => { if (index <= session.unlockedStepIndex) setStepIndex(index); }}
              disabled={index > session.unlockedStepIndex}
              aria-current={index === session.stepIndex ? "step" : undefined}
              className={`min-h-9 shrink-0 rounded-full px-3 text-xs font-bold transition ${
                index === session.stepIndex ? "bg-cyan-800 text-white" : index <= session.unlockedStepIndex ? "bg-cyan-50 text-cyan-800 hover:bg-cyan-100" : "bg-slate-100 text-slate-400"
              }`}
            >
              {index < session.unlockedStepIndex && <Check className="ml-1 inline h-3.5 w-3.5" />}{index + 1}. {step.eyebrow}
            </button>
          ))}
        </nav>
      </div>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:py-8">
        <article className="min-w-0">
          {renderStep(currentStep)}

          {currentStep.type !== "report" && (
            <footer className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
              {!stepComplete && <p className="mb-3 text-center text-sm font-bold text-amber-700">{currentStep.type === "video" ? "شغّل الفيديو التعليمي للانتقال إلى النشاط التالي." : `أكمل ${currentStep.type === "assessment" ? "جميع إجابات الاختبار" : "التحقق الحالي"} للانتقال إلى الخطوة التالية.`}</p>}
              <div className="flex items-center justify-between gap-3">
                <button type="button" onClick={previous} disabled={session.stepIndex === 0} className="flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-4 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30"><ArrowRight className="h-5 w-5" /> السابق</button>
                <span className="hidden text-sm font-bold text-slate-500 sm:inline">{session.stepIndex + 1} من {lesson.steps.length}</span>
                <button type="button" onClick={next} disabled={!stepComplete} className="flex min-h-12 items-center gap-2 rounded-xl bg-slate-950 px-5 font-black text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-35" data-testid="button-next-step">
                  {currentStep.type === "assessment" ? "اعرض تقريري" : "الخطوة التالية"}<ArrowLeft className="h-5 w-5" />
                </button>
              </div>
            </footer>
          )}
        </article>

        <TutorPanel
          lesson={lesson}
          currentStepId={currentStep.id}
          mastery={mastery}
          questions={session.questions}
          onVisualAction={handleVisualAction}
          onTutorQuestion={() => emitEvent({ name: "tutor_question", stepId: currentStep.id })}
        />
      </main>

      <Link href="/" className="fixed bottom-4 left-4 hidden h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg hover:text-cyan-800 xl:flex" aria-label="العودة للرئيسية"><ChevronLeft className="h-5 w-5" /></Link>
    </div>
  );
}
