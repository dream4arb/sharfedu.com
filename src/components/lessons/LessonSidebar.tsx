import { useEffect, useId, useRef, useState } from "react";
import { Link } from "wouter";
import { BookOpen, Check, ChevronDown, ClipboardList, Compass, FileText, Home, LayoutDashboard, LocateFixed, Search, X } from "lucide-react";
import { Sidebar, SidebarContent, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { AdminLessonActions, AdminAddLessonButton, AdminChapterActions, AdminAddChapterButton } from "@/components/admin/AdminSidebarControls";
import type { LessonData, SemesterData } from "@/data/lessons";
import { filterLessonOutline, findLessonLocation, normalizeLessonSearch } from "./lessonSidebarModel";
import { instructionalLessons, isUnitPreparation } from "../../../shared/curriculum/unit-preparation";
import "./lessonSidebar.css";

type AttachmentKind = "book" | "summary" | "worksheets" | "test";
interface SidebarProps {
  subjectName: string;
  gradeName?: string;
  stageLink: string;
  subjectSlug: string;
  routeStage: string;
  lessonId?: string;
  semesters: SemesterData[];
  lessons: LessonData[];
  progress: number;
  completedCount: number;
  getLessonTitle: (lesson: LessonData) => string;
  getLessonProgress: (lessonId: string) => number;
  getAttachmentUrl: (kind: AttachmentKind, semesterIndex: number) => string | undefined;
  onOpenAttachment: (url: string | undefined, label: string) => void;
  adminHandlers: {
    addLesson: (semesterId: string, chapterId: string) => void;
    editLesson: (semesterId: string, chapterId: string, lessonId: string, title: string) => void;
    deleteLesson: (semesterId: string, chapterId: string, lessonId: string, title: string) => void;
    addChapter: (semesterId: string) => void;
    editChapter: (semesterId: string, chapterId: string, name: string) => void;
    deleteChapter: (semesterId: string, chapterId: string, name: string) => void;
  };
}
const attachments = [
  { kind: "book" as const, label: "كتاب المادة", description: "الكتاب الدراسي", icon: BookOpen },
  { kind: "summary" as const, label: "الملخص", description: "ملخص شامل للمادة", icon: FileText },
  { kind: "worksheets" as const, label: "أوراق العمل", description: "تمارين وأنشطة", icon: ClipboardList },
  { kind: "test" as const, label: "أسئلة الاختبار", description: "اختبارات المادة", icon: ClipboardList },
];

export default function LessonSidebar(props: SidebarProps) {
  const { subjectName, gradeName, stageLink, subjectSlug, routeStage, lessonId, semesters, lessons, progress, completedCount,
    getLessonTitle, getLessonProgress, getAttachmentUrl, onOpenAttachment, adminHandlers } = props;
  const { isMobile, setOpenMobile } = useSidebar();
  const activeLocation = findLessonLocation(semesters, lessonId);
  const [selectedId, setSelectedId] = useState(activeLocation?.semester.id ?? semesters[0]?.id);
  const [openChapterId, setOpenChapterId] = useState<string | null>(activeLocation?.chapter.id ?? null);
  const [query, setQuery] = useState("");
  const [locateVersion, setLocateVersion] = useState(0);
  const activeLink = useRef<HTMLAnchorElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const instanceId = useId();
  const selectedSemesterId = semesters.some(semester => semester.id === selectedId)
    ? selectedId : activeLocation?.semester.id ?? semesters[0]?.id;
  const selectedSemesterIndex = Math.max(0, semesters.findIndex(semester => semester.id === selectedSemesterId));
  const isSearching = normalizeLessonSearch(query).length > 0;
  const outline = filterLessonOutline(semesters, query, selectedSemesterId, getLessonTitle);
  const numberedLessons = instructionalLessons(lessons);

  useEffect(() => {
    setSelectedId(activeLocation?.semester.id ?? semesters[0]?.id);
    setOpenChapterId(activeLocation?.chapter.id ?? null);
    setQuery("");
  }, [subjectSlug, lessonId, activeLocation?.semester.id, activeLocation?.chapter.id]);

  // Scroll the outline only; never move the lesson content or page position.
  useEffect(() => {
    if (!locateVersion || !activeLink.current || !scroller.current) return;
    const card = activeLink.current.getBoundingClientRect();
    const viewport = scroller.current.getBoundingClientRect();
    scroller.current.scrollBy({ top: card.top - viewport.top - 16,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [locateVersion]);

  const closeOnMobile = () => { if (isMobile) setOpenMobile(false); };
  const locateCurrent = () => {
    setQuery("");
    setSelectedId(activeLocation?.semester.id ?? semesters[0]?.id);
    setOpenChapterId(activeLocation?.chapter.id ?? null);
    setLocateVersion(version => version + 1);
  };
  const lessonCard = (lesson: LessonData, index: number, semester?: SemesterData, chapterId?: string) => {
    const active = lesson.id === lessonId;
    const percent = Math.max(0, Math.min(100, Math.round(getLessonProgress(lesson.id))));
    const title = getLessonTitle(lesson);
    return (
      <li key={lesson.id} className="lesson-outline__item" data-complete={percent === 100 || undefined}>
        <Link href={`/lesson/${routeStage}/${subjectSlug}/${lesson.id}`} className="lesson-outline__lesson"
          aria-current={active ? "page" : undefined} ref={active ? activeLink : undefined} onClick={closeOnMobile}
          data-testid={chapterId ? `sidebar-lesson-${chapterId}-${lesson.id}` : `sidebar-lesson-${lesson.id}`}>
          <span className="lesson-outline__number" aria-label={`الدرس ${index + 1}`}>
            {percent === 100 ? <Check aria-hidden="true" size={18} /> : index + 1}
          </span>
          <span className="lesson-outline__lesson-text"><span>{title}</span>
          </span>
          <span className="lesson-outline__percent" data-started={percent > 0 || undefined} aria-label={`التقدم ${percent}%`}>{percent}%</span>
        </Link>
        {semester && chapterId && <div className="lesson-outline__admin"><AdminLessonActions semesterId={semester.id} chapterId={chapterId}
          lessonId={lesson.id} lessonTitle={title} onEdit={adminHandlers.editLesson} onDelete={adminHandlers.deleteLesson} /></div>}
      </li>
    );
  };
  const preparationCard = (lesson: LessonData, semester?: SemesterData, chapterId?: string) => {
    const active = lesson.id === lessonId;
    const title = getLessonTitle(lesson);
    return <div key={lesson.id} className="lesson-outline__preparation-item">
      <Link href={`/lesson/${routeStage}/${subjectSlug}/${lesson.id}`} className="lesson-outline__preparation"
        aria-label={`التهيئة للوحدة: ${title}`} aria-current={active ? "page" : undefined}
        ref={active ? activeLink : undefined} onClick={closeOnMobile} data-testid={`sidebar-preparation-${lesson.id}`}>
        <span className="lesson-outline__preparation-icon"><Compass size={19} aria-hidden="true" /></span>
        <span><strong>التهيئة للوحدة</strong><small>مراجعة قبل البدء · دون درجات</small></span>
      </Link>
      {semester && chapterId && <div className="lesson-outline__admin"><AdminLessonActions semesterId={semester.id} chapterId={chapterId}
        lessonId={lesson.id} lessonTitle={title} onEdit={adminHandlers.editLesson} onDelete={adminHandlers.deleteLesson} /></div>}
    </div>;
  };

  return (
    <Sidebar side="right" className="border-l border-border/50">
      <div className="lesson-outline" dir="rtl" data-testid="lesson-sidebar-outline">
        <SidebarHeader className="lesson-outline__header">
          <div className="lesson-outline__heading">
            <div className="lesson-outline__subject"><strong>{subjectName}</strong>{gradeName && <small>{gradeName}</small>}</div>
            <Link href={stageLink} onClick={closeOnMobile} aria-label="الرجوع للمرحلة" className="lesson-outline__icon-link" data-testid="link-stage"><LayoutDashboard size={18} /></Link>
            <Link href="/" onClick={closeOnMobile} aria-label="الصفحة الرئيسية" className="lesson-outline__icon-link" data-testid="link-home"><Home size={18} /></Link>
            {isMobile && <button type="button" onClick={() => setOpenMobile(false)} aria-label="إغلاق قائمة الدروس" className="lesson-outline__icon-link"><X size={18} /></button>}
          </div>
          <div className="lesson-outline__progress">
            <div><span>تقدمك في المادة</span><strong>{progress}%</strong></div>
            <div className="lesson-outline__track" role="progressbar" aria-label="تقدمك في المادة" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }} /></div>
            <small>{completedCount} من {numberedLessons.length} درس مكتمل</small>
          </div>
          <div className="lesson-outline__search"><Search size={17} aria-hidden="true" />
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="ابحث عن درس" aria-label="ابحث عن درس" />
            {query && <button type="button" aria-label="مسح البحث" onClick={() => setQuery("")}><X size={16} /></button>}
          </div>
          {semesters.length > 0 && <div className="lesson-outline__semesters" aria-label="الفصول الدراسية">
            {semesters.map((semester, index) => <button key={semester.id} type="button" aria-pressed={selectedSemesterId === semester.id}
              aria-label={semester.name} onClick={() => {
                setSelectedId(semester.id); setQuery("");
                setOpenChapterId(activeLocation?.semester.id === semester.id ? activeLocation.chapter.id : null);
              }}>{index === 0 ? "الفصل الأول" : index === 1 ? "الفصل الثاني" : semester.name}</button>)}
          </div>}
          <div className="lesson-outline__caption"><span>فهرس الدروس</span>
            {lessonId && <button type="button" onClick={locateCurrent}><LocateFixed size={14} aria-hidden="true" />الدرس الحالي</button>}
          </div>
        </SidebarHeader>
        <SidebarContent ref={scroller} className="lesson-outline__content">
          <nav aria-label="فهرس دروس المادة">
            {isSearching && <p className="lesson-outline__search-count" role="status">{outline.reduce((count, item) => count + item.chapters.reduce((sum, chapter) => sum + chapter.lessons.length + chapter.preparations.length, 0), 0)} نتيجة في جميع الفصول</p>}
            {outline.map(({ semester, chapters }) => <div key={semester.id}>
              {isSearching && <h2 className="lesson-outline__semester-label">{semester.name}</h2>}
              {chapters.map(({ chapter, chapterIndex, lessons: chapterLessons, preparations }) => {
                const open = isSearching || openChapterId === chapter.id;
                const panelId = `${instanceId}-${semester.id}-${chapter.id}`;
                return <section className="lesson-outline__chapter" key={chapter.id} data-open={open}>
                  <div className="lesson-outline__chapter-heading">
                    <button type="button" className="lesson-outline__chapter-toggle" aria-expanded={open} aria-controls={panelId}
                      onClick={() => setOpenChapterId(open ? null : chapter.id)} disabled={isSearching}>
                      <span className="lesson-outline__chapter-icon"><BookOpen size={19} aria-hidden="true" /></span>
                      <span className="lesson-outline__chapter-text"><small>الوحدة {chapter.number ?? chapterIndex + 1}</small><strong>{chapter.name}</strong></span>
                      <ChevronDown size={16} className="lesson-outline__chevron" aria-hidden="true" />
                    </button>
                    <div className="lesson-outline__admin"><AdminChapterActions semesterId={semester.id} chapterId={chapter.id} chapterName={chapter.name}
                      onEdit={adminHandlers.editChapter} onDelete={adminHandlers.deleteChapter} /></div>
                  </div>
                  <div id={panelId} hidden={!open} className="lesson-outline__chapter-body">
                    {preparations.map(lesson => preparationCard(lesson, semester, chapter.id))}
                    {chapterLessons.length > 0 && <p className="lesson-outline__lesson-label">دروس الوحدة</p>}
                    <ul className="lesson-outline__lessons">{chapterLessons.map(({ lesson, lessonIndex }) => lessonCard(lesson, lessonIndex, semester, chapter.id))}</ul>
                    {!isSearching && <AdminAddLessonButton semesterId={semester.id} chapterId={chapter.id} onAdd={adminHandlers.addLesson} />}
                  </div>
                </section>;
              })}
              {!isSearching && <AdminAddChapterButton semesterId={semester.id} onAdd={adminHandlers.addChapter} />}
            </div>)}
            {semesters.length === 0 && <>
              {lessons.filter(lesson => isUnitPreparation(lesson.id)).filter(lesson => !isSearching || normalizeLessonSearch(`${getLessonTitle(lesson)} التهيئة للوحدة`).includes(normalizeLessonSearch(query))).map(lesson => preparationCard(lesson))}
              <ul className="lesson-outline__lessons">{numberedLessons.map((lesson, index) => ({ lesson, index })).filter(({ lesson }) => !isSearching || normalizeLessonSearch(getLessonTitle(lesson)).includes(normalizeLessonSearch(query))).map(({ lesson, index }) => lessonCard(lesson, index))}</ul>
            </>}
            {((isSearching && outline.length === 0 && semesters.length > 0) || lessons.length === 0) && <div className="lesson-outline__empty"><BookOpen size={26} aria-hidden="true" /><p>{isSearching ? "لا توجد دروس مطابقة للبحث" : "لا توجد دروس متاحة حالياً"}</p>{isSearching && <button type="button" onClick={() => setQuery("")}>عرض جميع الدروس</button>}</div>}
          </nav>
          {semesters.length > 0 && !isSearching && <div className="lesson-outline__attachments" data-testid="sidebar-material-resources">
            <hr className="lesson-outline__resources-divider" />
            <div className="lesson-outline__attachment-list">
              {attachments.map(({ kind, label, description, icon: Icon }) => <button type="button" key={kind} className="lesson-outline__attachment" data-testid={`sidebar-resource-${kind}`} onClick={() => {
                onOpenAttachment(getAttachmentUrl(kind, selectedSemesterIndex), label); closeOnMobile();
              }}>
                <span className="lesson-outline__attachment-icon" data-kind={kind}><Icon size={21} aria-hidden="true" /></span><span><strong>{label}</strong><small>{description}</small></span>
              </button>)}
            </div>
          </div>}
        </SidebarContent>
      </div>
    </Sidebar>
  );
}
