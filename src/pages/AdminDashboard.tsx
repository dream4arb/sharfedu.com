import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableDropdown } from "@/components/ui/searchable-dropdown";
import {
  LayoutDashboard,
  Loader2,
  Trash2,
  Upload,
  Save,
  Home,
  Shield,
  Users,
  Search,
  Settings,
  Eye,
  Pencil,
  BookOpen,
  Code,
  FileVideo,
  Paperclip,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
  Share2,
  Calendar,
  Layers,
} from "lucide-react";
import { StructureManager } from "@/components/admin/StructureManager";
import { useToast } from "@/hooks/use-toast";

type AdminSection = "home" | "content" | "users" | "school-year" | "seo" | "structure";

interface Stats {
  studentCount: number;
  completionRate: number;
}

interface OverviewStats {
  totalLessons: number;
  interactiveContent: number;
  totalMembers: number;
  attachments: number;
  lessonsPerStage: { stage: string; count: number }[];
  completedLessons: number;
  incompleteLessons: number;
  recentUploads: { id: number; lessonTitle: string; subjectName: string; tabType: string; createdAt: string }[];
}

interface Attachment {
  id: number;
  lessonId: string;
  type: string;
  url: string;
  label: string;
}

interface UserRow {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: Date | number;
}

interface SeoRow {
  pagePath: string;
  title: string | null;
  description: string | null;
  keywords: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
}

interface SeoPathItem {
  value: string;
  label: string;
  searchText?: string;
  group?: string;
}

interface ContentRow {
  id: number;
  lessonId: string;
  tabType: string;
  contentType: string;
  dataValue: string;
  stageName: string;
  gradeName?: string;
  subjectName: string;
  semesterName: string;
  chapterName: string;
  lessonTitle: string;
}

const TAB_TYPES = [
  { value: "lesson", label: "الدرس (PDF)" },
  { value: "video", label: "الفيديو" },
  { value: "summary", label: "الملخص" },
  { value: "education", label: "التعليم" },
  { value: "questions", label: "الأسئلة" },
];

const CONTENT_TYPES = [
  { value: "pdf", label: "ملف PDF" },
  { value: "youtube", label: "رابط يوتيوب" },
  { value: "html", label: "كود HTML" },
  { value: "json", label: "بيانات JSON" },
];

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch(path, { credentials: "include", ...options });
  if (r.status === 401 || r.status === 403) throw new Error("غير مصرح");
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.message || "خطأ في الطلب");
  }
  return r.json();
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<AdminSection>("home");

  // Stats
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [completionInput, setCompletionInput] = useState("");
  const [savingStats, setSavingStats] = useState(false);

  // Smart Uploader
  const [stageSlug, setStageSlug] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [subjectSlug, setSubjectSlug] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [tabType, setTabType] = useState("lesson");
  const [contentType, setContentType] = useState("pdf");
  const [contentValue, setContentValue] = useState("");
  const [youtubeUrls, setYoutubeUrls] = useState<string[]>(["", "", "", "", "", ""]);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [stages, setStages] = useState<{ slug: string; name: string }[]>([]);
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ slug: string; name: string }[]>([]);
  const [semesters, setSemesters] = useState<{ id: string; name: string }[]>([]);
  const [chapters, setChapters] = useState<{ id: string; name: string }[]>([]);
  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [flatLessons, setFlatLessons] = useState<{ lessonId: string; title: string; path: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [htmlPreview, setHtmlPreview] = useState(false);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);
  const isLoadingEditRef = useRef(false);

  // قائمة المحتوى المرفوع
  const [contentList, setContentList] = useState<ContentRow[]>([]);
  const [contentListLoading, setContentListLoading] = useState(false);
  const [importingLegacy, setImportingLegacy] = useState(false);
  const [filterStage, setFilterStage] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterChapter, setFilterChapter] = useState("");
  const [filterLesson, setFilterLesson] = useState("");
  const [filterTabType, setFilterTabType] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ContentRow | null>(null);
  const [filterGrades, setFilterGrades] = useState<{ id: string; name: string }[]>([]);
  const [filterSubjects, setFilterSubjects] = useState<{ slug: string; name: string }[]>([]);
  const [filterSemesters, setFilterSemesters] = useState<{ id: string; name: string }[]>([]);
  const [filterChapters, setFilterChapters] = useState<{ id: string; name: string }[]>([]);
  const [filterLessons, setFilterLessons] = useState<{ id: string; title: string }[]>([]);

  // Users
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userStats, setUserStats] = useState({ total: 0, newToday: 0 });
  const [userSearch, setUserSearch] = useState("");
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editFormPassword, setEditFormPassword] = useState("");

  // SEO
  const [seoList, setSeoList] = useState<SeoRow[]>([]);
  const [seoPaths, setSeoPaths] = useState<SeoPathItem[]>([]);
  const [seoPath, setSeoPath] = useState("/");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoOgTitle, setSeoOgTitle] = useState("");
  const [seoOgDesc, setSeoOgDesc] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");
  const [seoHasData, setSeoHasData] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoTab, setSeoTab] = useState("pages");

  // إعدادات السنة الدراسية
  const [schoolYearStart, setSchoolYearStart] = useState("");
  const [schoolYearEnd, setSchoolYearEnd] = useState("");
  const [semester1End, setSemester1End] = useState("");
  const [schoolYearLoading, setSchoolYearLoading] = useState(false);
  const [schoolYearSaving, setSchoolYearSaving] = useState(false);

  // تم إزالة تسجيل الدخول — لوحة الإدارة متاحة لجميع الزوار دون توجيه للرئيسية

  useEffect(() => {
    if (activeSection !== "home") return;
    setStatsLoading(true);
    setOverviewLoading(true);
    fetchAdmin<Stats>("/api/admin/stats")
      .then((s) => {
        setStats(s);
        setCompletionInput(String(s.completionRate));
      })
      .catch((e) => toast({ title: "خطأ", description: e.message, variant: "destructive" }))
      .finally(() => setStatsLoading(false));
    fetchAdmin<OverviewStats>("/api/admin/overview")
      .then((data) => {
        if (data && typeof data === "object" && Array.isArray(data.lessonsPerStage) && Array.isArray(data.recentUploads)) {
          setOverviewStats(data);
        } else {
          setOverviewStats(null);
        }
      })
      .catch(() => setOverviewStats(null))
      .finally(() => setOverviewLoading(false));
  }, [activeSection, user, toast]);

  useEffect(() => {
    if (activeSection !== "content") return;
    fetchAdmin<{ stages: { slug: string; name: string }[] }>("/api/admin/cms/hierarchy")
      .then((d) => setStages(d.stages || []))
      .catch(() => setStages([]));
    fetchAdmin<{ lessonId: string; title: string; path: string }[]>("/api/admin/cms/lessons/flat")
      .then(setFlatLessons)
      .catch(() => setFlatLessons([]));
  }, [activeSection, user]);

  useEffect(() => {
    if (filterStage) {
      fetchAdmin<{ id: string; name: string }[]>(`/api/admin/cms/grades?stage=${filterStage}`)
        .then(setFilterGrades)
        .catch(() => setFilterGrades([]));
    } else {
      setFilterGrades([]);
      setFilterGrade("");
      setFilterSubjects([]);
      setFilterSubject("");
      setFilterSemesters([]);
      setFilterSemester("");
      setFilterChapters([]);
      setFilterChapter("");
      setFilterLessons([]);
      setFilterLesson("");
    }
  }, [filterStage]);

  useEffect(() => {
    if (filterStage && filterGrade) {
      fetchAdmin<{ slug: string; name: string }[]>(`/api/admin/cms/subjects?stage=${filterStage}&grade=${filterGrade}`)
        .then(setFilterSubjects)
        .catch(() => setFilterSubjects([]));
    } else {
      setFilterSubjects([]);
      setFilterSubject("");
      setFilterSemesters([]);
      setFilterSemester("");
      setFilterChapters([]);
      setFilterChapter("");
      setFilterLessons([]);
      setFilterLesson("");
    }
  }, [filterStage, filterGrade]);

  useEffect(() => {
    if (!filterStage || !filterGrade || !filterSubject) {
      setFilterSemesters([]);
      setFilterSemester("");
      setFilterChapters([]);
      setFilterChapter("");
      setFilterLessons([]);
      setFilterLesson("");
      return;
    }
    fetchAdmin<{ id: string; name: string }[]>(`/api/admin/cms/semesters?stage=${filterStage}&grade=${filterGrade}&subject=${filterSubject}`)
      .then(setFilterSemesters)
      .catch(() => setFilterSemesters([]));
    setFilterSemester("");
    setFilterChapters([]);
    setFilterChapter("");
    setFilterLessons([]);
    setFilterLesson("");
  }, [filterStage, filterGrade, filterSubject]);

  useEffect(() => {
    if (!filterStage || !filterGrade || !filterSubject || !filterSemester) {
      setFilterChapters([]);
      setFilterChapter("");
      setFilterLessons([]);
      setFilterLesson("");
      return;
    }
    fetchAdmin<{ id: string; name: string }[]>(
      `/api/admin/cms/chapters?stage=${filterStage}&grade=${filterGrade}&subject=${filterSubject}&semester=${filterSemester}`
    )
      .then(setFilterChapters)
      .catch(() => setFilterChapters([]));
    setFilterChapter("");
    setFilterLessons([]);
    setFilterLesson("");
  }, [filterStage, filterGrade, filterSubject, filterSemester]);

  useEffect(() => {
    if (!filterStage || !filterGrade || !filterSubject || !filterSemester || !filterChapter) {
      setFilterLessons([]);
      setFilterLesson("");
      return;
    }
    fetchAdmin<{ id: string; title: string }[]>(
      `/api/admin/cms/lessons?stage=${filterStage}&grade=${filterGrade}&subject=${filterSubject}&semester=${filterSemester}&chapter=${filterChapter}`
    )
      .then(setFilterLessons)
      .catch(() => setFilterLessons([]));
    setFilterLesson("");
  }, [filterStage, filterGrade, filterSubject, filterSemester, filterChapter]);

  useEffect(() => {
    if (activeSection !== "content") return;
    setContentListLoading(true);
    const params = new URLSearchParams();
    const add = (k: string, v: string) => { if (v && v !== "_") params.set(k, v); };
    add("stage", filterStage);
    add("grade", filterGrade);
    add("subject", filterSubject);
    add("semester", filterSemester);
    add("chapter", filterChapter);
    add("lesson", filterLesson);
    add("tabType", filterTabType);
    fetchAdmin<ContentRow[]>(`/api/admin/cms/content/list?${params}`)
      .then((data) => setContentList(Array.isArray(data) ? data : []))
      .catch(() => setContentList([]))
      .finally(() => setContentListLoading(false));
  }, [activeSection, user, filterStage, filterGrade, filterSubject, filterSemester, filterChapter, filterLesson, filterTabType]);

  useEffect(() => {
    if (stageSlug) {
      fetchAdmin<{ id: string; name: string }[]>(`/api/admin/cms/grades?stage=${stageSlug}`)
        .then(setGrades)
        .catch(() => setGrades([]));
      if (!isLoadingEditRef.current) setGradeId("");
    } else {
      setGrades([]);
      setGradeId("");
      setSubjects([]);
      setSubjectSlug("");
      setSemesterId("");
      setChapterId("");
      setLessonId("");
    }
  }, [stageSlug]);

  useEffect(() => {
    if (stageSlug && gradeId) {
      fetchAdmin<{ slug: string; name: string }[]>(`/api/admin/cms/subjects?stage=${stageSlug}&grade=${gradeId}`)
        .then(setSubjects)
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
      setSubjectSlug("");
      setSemesterId("");
      setChapterId("");
      setLessonId("");
    }
    if (!isLoadingEditRef.current) {
      setSemesterId("");
      setChapterId("");
      setLessonId("");
    }
  }, [stageSlug, gradeId]);

  useEffect(() => {
    if (!stageSlug || !gradeId || !subjectSlug) return;
    fetchAdmin<{ id: string; name: string }[]>(
      `/api/admin/cms/semesters?stage=${stageSlug}&grade=${gradeId}&subject=${subjectSlug}`
    )
      .then(setSemesters)
      .catch(() => setSemesters([]));
    if (!isLoadingEditRef.current) {
      setSemesterId("");
      setChapterId("");
      setLessonId("");
    }
  }, [stageSlug, gradeId, subjectSlug]);

  useEffect(() => {
    if (!stageSlug || !gradeId || !subjectSlug || !semesterId) return;
    fetchAdmin<{ id: string; name: string }[]>(
      `/api/admin/cms/chapters?stage=${stageSlug}&grade=${gradeId}&subject=${subjectSlug}&semester=${semesterId}`
    )
      .then(setChapters)
      .catch(() => setChapters([]));
    if (!isLoadingEditRef.current) {
      setChapterId("");
      setLessonId("");
    }
  }, [stageSlug, gradeId, subjectSlug, semesterId]);

  useEffect(() => {
    if (!stageSlug || !gradeId || !subjectSlug || !semesterId || !chapterId) return;
    fetchAdmin<{ id: string; title: string }[]>(
      `/api/admin/cms/lessons?stage=${stageSlug}&grade=${gradeId}&subject=${subjectSlug}&semester=${semesterId}&chapter=${chapterId}`
    )
      .then(setLessons)
      .catch(() => setLessons([]));
    if (!isLoadingEditRef.current) setLessonId("");
  }, [stageSlug, gradeId, subjectSlug, semesterId, chapterId]);

  useEffect(() => {
    if (activeSection !== "users") return;
    setUsersLoading(true);
    Promise.all([
      fetchAdmin<UserRow[]>(`/api/admin/users?q=${encodeURIComponent(userSearch)}`),
      fetchAdmin<{ total: number; newToday: number }>("/api/admin/users/stats"),
    ])
      .then(([list, s]) => {
        setUsers(list);
        setUserStats(s);
      })
      .catch((e) => toast({ title: "خطأ", description: e.message, variant: "destructive" }))
      .finally(() => setUsersLoading(false));
  }, [activeSection, user, userSearch, toast]);

  useEffect(() => {
    if (activeSection !== "school-year") return;
    setSchoolYearLoading(true);
    fetchAdmin<{ schoolYearStart: string; schoolYearEnd: string; semester1End: string }>("/api/admin/school-year")
      .then((d) => {
        setSchoolYearStart(d.schoolYearStart || "");
        setSchoolYearEnd(d.schoolYearEnd || "");
        setSemester1End(d.semester1End || "");
      })
      .catch(() => {})
      .finally(() => setSchoolYearLoading(false));
  }, [activeSection, user]);

  useEffect(() => {
    if (activeSection !== "seo") return;
    setSeoLoading(true);
    Promise.all([
      fetchAdmin<SeoRow[]>("/api/admin/seo"),
      fetchAdmin<SeoPathItem[]>("/api/admin/cms/seo-paths"),
    ])
      .then(([list, paths]) => {
        setSeoList(list);
        setSeoPaths(Array.isArray(paths) ? paths : []);
      })
      .catch(() => {
        setSeoList([]);
        setSeoPaths([]);
      })
      .finally(() => setSeoLoading(false));
  }, [activeSection, user]);

  const loadSeoForPath = async (path: string) => {
    try {
      const row = await fetchAdmin<SeoRow & { pagePath?: string }>(`/api/admin/seo/by-path?path=${encodeURIComponent(path)}`);
      const hasData = !!(row?.title || row?.description || row?.keywords);
      setSeoPath(row?.pagePath || path);
      setSeoTitle(row?.title ?? "");
      setSeoDesc(row?.description ?? "");
      setSeoKeywords(row?.keywords ?? "");
      setSeoOgTitle(row?.ogTitle ?? "");
      setSeoOgDesc(row?.ogDescription ?? "");
      setSeoOgImage(row?.ogImage ?? "");
      setSeoHasData(hasData);
    } catch {
      setSeoPath(path);
      setSeoTitle("");
      setSeoDesc("");
      setSeoKeywords("");
      setSeoOgTitle("");
      setSeoOgDesc("");
      setSeoOgImage("");
      setSeoHasData(false);
    }
  };

  useEffect(() => {
    if (activeSection === "seo" && seoPaths.length > 0 && seoPath) {
      loadSeoForPath(seoPath);
    }
  }, [activeSection, seoPaths.length]);

  const saveStats = async () => {
    const v = parseFloat(completionInput);
    if (!Number.isFinite(v) || v < 0 || v > 100) {
      toast({ title: "قيمة غير صالحة", description: "نسبة الإنجاز بين 0 و 100.", variant: "destructive" });
      return;
    }
    setSavingStats(true);
    try {
      await fetchAdmin("/api/admin/stats", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completionRate: v }),
      });
      setStats((s) => (s ? { ...s, completionRate: v } : null));
      toast({ title: "تم الحفظ", description: "تم تحديث نسبة الإنجاز." });
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSavingStats(false);
    }
  };

  const loadContentForEdit = async (row: ContentRow) => {
    try {
      const data = await fetchAdmin<ContentRow & { stageSlug?: string; gradeId?: string; subjectSlug?: string; semesterId?: string; chapterId?: string; lessonTitle?: string }>(
        `/api/admin/cms/content/by-id/${row.id}`
      );
      isLoadingEditRef.current = true;
      setEditingContentId(row.id);
      setStageSlug(data.stageSlug || "");
      setGradeId(data.gradeId || "");
      setSubjectSlug(data.subjectSlug || "");
      setSemesterId(data.semesterId || "");
      setChapterId(data.chapterId || "");
      setLessonId(data.lessonId);
      setTabType(data.tabType);
      setContentType(data.contentType);
      setContentValue(data.dataValue || "");
      if (data.contentType === "youtube" && data.dataValue) {
        const urls = data.dataValue.split(/\r?\n/).filter(Boolean);
        setYoutubeUrls([...urls.slice(0, 6), "", "", "", "", "", ""].slice(0, 6));
      } else {
        setYoutubeUrls(["", "", "", "", "", ""]);
      }
      setContentFile(null);
      if (data.stageSlug && stages.length === 0) {
        fetchAdmin<{ stages: { slug: string; name: string }[] }>("/api/admin/cms/hierarchy").then((d) => setStages(d.stages || []));
      }
      if (data.stageSlug && grades.length === 0) {
        fetchAdmin<{ id: string; name: string }[]>(`/api/admin/cms/grades?stage=${data.stageSlug}`).then(setGrades).catch(() => {});
      }
      setTimeout(() => { isLoadingEditRef.current = false; }, 100);
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل تحميل المحتوى", variant: "destructive" });
    }
  };

  const clearEditForm = () => {
    setEditingContentId(null);
    setStageSlug("");
    setGradeId("");
    setSubjectSlug("");
    setSemesterId("");
    setChapterId("");
    setLessonId("");
    setTabType("lesson");
    setContentType("pdf");
    setContentValue("");
    setYoutubeUrls(["", "", "", "", "", ""]);
    setContentFile(null);
  };

  const deleteContent = async (row: ContentRow) => {
    try {
      await fetchAdmin(`/api/admin/cms/content/${row.id}`, { method: "DELETE" });
      setContentList((prev) => prev.filter((c) => c.id !== row.id));
      if (editingContentId === row.id) clearEditForm();
      toast({ title: "تم الحذف", description: "تم حذف المحتوى." });
      setDeleteConfirm(null);
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل الحذف", variant: "destructive" });
    }
  };

  const quickViewContent = (row: ContentRow) => {
    const v = row.dataValue?.trim() || "";
    if (row.contentType === "pdf" || row.contentType === "image") {
      const url = v.startsWith("http") ? v : `${window.location.origin}${v.startsWith("/") ? v : "/" + v}`;
      window.open(url, "_blank");
    } else if (row.contentType === "youtube") {
      const firstUrl = v.split(/\s+/)[0] || v;
      window.open(firstUrl.startsWith("http") ? firstUrl : `https://www.youtube.com/watch?v=${firstUrl}`, "_blank");
    } else if (row.contentType === "html") {
      const w = window.open("", "_blank");
      if (w) w.document.write(v);
    } else {
      const w = window.open("", "_blank");
      if (w) w.document.write(`<pre dir="ltr" style="padding:1rem;font:14px monospace;">${v.replace(/</g, "&lt;")}</pre>`);
    }
  };

  const saveContent = async () => {
    const lid = lessonId || (flatLessons.find((l) => l.lessonId)?.lessonId ?? "");
    if (!lid.trim()) {
      toast({ title: "مطلوب", description: "اختر الدرس المستهدف.", variant: "destructive" });
      return;
    }
    const isPdfWithFile = contentType === "pdf" && contentFile;
    const isPdfWithUrl = contentType === "pdf" && contentValue.trim() && !contentFile;
    const youtubeUrlsFiltered = contentType === "youtube" ? youtubeUrls.map(u => u.trim()).filter(Boolean) : [];
    const isYoutubeWithValue = contentType === "youtube" && youtubeUrlsFiltered.length > 0;
    const isOtherWithValue = contentType !== "pdf" && contentType !== "youtube" && contentValue.trim();

    if (contentType === "pdf" && !isPdfWithFile && !isPdfWithUrl) {
      toast({ title: "مطلوب", description: "ارفع ملف PDF أو أبقِ الرابط الحالي عند التعديل.", variant: "destructive" });
      return;
    }
    if (contentType === "youtube" && !isYoutubeWithValue) {
      toast({ title: "مطلوب", description: "أضف رابط يوتيوب واحد على الأقل (اختياري حتى 6 روابط).", variant: "destructive" });
      return;
    }
    if (!isPdfWithFile && !isPdfWithUrl && !isYoutubeWithValue && !isOtherWithValue) {
      toast({ title: "مطلوب", description: "أدخل المحتوى (رابط، HTML، أو JSON).", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      if (isPdfWithFile) {
        const fd = new FormData();
        fd.append("lessonId", lid);
        fd.append("tabType", tabType);
        fd.append("file", contentFile!);
        const r = await fetch("/api/admin/cms/content/upload", { method: "POST", credentials: "include", body: fd });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).message || "فشل الرفع");
      } else {
        const dataVal = contentType === "youtube" ? youtubeUrlsFiltered.join("\n") : contentValue.trim();
        await fetchAdmin("/api/admin/cms/content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessonId: lid,
            tabType,
            contentType: contentType === "youtube" ? "youtube" : contentType === "html" ? "html" : contentType === "pdf" ? "pdf" : "json",
            dataValue: dataVal,
          }),
        });
      }
      toast({ title: "تم الحفظ", description: "سيُنعكس المحتوى في الموقع." });
      setContentValue("");
      setYoutubeUrls(["", "", "", "", "", ""]);
      setContentFile(null);
      setEditingContentId(null);
      const params = new URLSearchParams();
      if (filterStage) params.set("stage", filterStage);
      if (filterGrade) params.set("grade", filterGrade);
      if (filterSubject) params.set("subject", filterSubject);
      if (filterSemester) params.set("semester", filterSemester);
      if (filterChapter) params.set("chapter", filterChapter);
      if (filterLesson) params.set("lesson", filterLesson);
      if (filterTabType) params.set("tabType", filterTabType);
      fetchAdmin<ContentRow[]>(`/api/admin/cms/content/list?${params}`).then(setContentList).catch(() => {});
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const importLegacyContent = async () => {
    setImportingLegacy(true);
    try {
      const r = await fetchAdmin<{ imported: number; updated: number }>(
        "/api/admin/cms/content/import-legacy",
        { method: "POST" }
      );
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${r.imported} عنصر جديد وتحديث ${r.updated} عنصر من الملفات والجداول القديمة.`,
      });
      const params = new URLSearchParams();
      const add = (k: string, v: string) => { if (v && v !== "_") params.set(k, v); };
      add("stage", filterStage); add("grade", filterGrade); add("subject", filterSubject); add("semester", filterSemester);
      add("chapter", filterChapter); add("lesson", filterLesson); add("tabType", filterTabType);
      fetchAdmin<ContentRow[]>(`/api/admin/cms/content/list?${params}`).then(setContentList).catch(() => {});
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل الاستيراد", variant: "destructive" });
    } finally {
      setImportingLegacy(false);
    }
  };

  const saveSeo = async () => {
    setSeoSaving(true);
    try {
      await fetchAdmin("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: seoPath,
          title: seoTitle,
          description: seoDesc,
          keywords: seoKeywords,
          ogTitle: seoOgTitle || undefined,
          ogDescription: seoOgDesc || undefined,
          ogImage: seoOgImage || undefined,
        }),
      });
      toast({ title: "تم الحفظ", description: "تم تحديث بيانات السيو." });
      setSeoList((prev) => {
        const exist = prev.find((p) => p.pagePath === seoPath);
        if (exist) return prev.map((p) => (p.pagePath === seoPath ? { ...p, title: seoTitle, description: seoDesc, keywords: seoKeywords, ogTitle: seoOgTitle, ogDescription: seoOgDesc, ogImage: seoOgImage } : p));
        return [...prev, { pagePath: seoPath, title: seoTitle, description: seoDesc, keywords: seoKeywords, ogTitle: seoOgTitle, ogDescription: seoOgDesc, ogImage: seoOgImage }];
      });
      setSeoHasData(true);
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message || "فشل الحفظ", variant: "destructive" });
    } finally {
      setSeoSaving(false);
    }
  };

  const updateUser = async (u: UserRow, patch: Partial<UserRow> & { newPassword?: string }) => {
    try {
      const body = { ...patch };
      if (body.newPassword !== undefined) {
        if (!body.newPassword.trim()) delete body.newPassword;
      }
      await fetchAdmin(`/api/admin/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const { newPassword: _, ...rest } = patch;
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...rest } : x)));
      setEditingUser(null);
      setEditFormPassword("");
      toast({ title: "تم التحديث" });
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message, variant: "destructive" });
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العضو؟")) return;
    try {
      await fetchAdmin(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((x) => x.id !== id));
      toast({ title: "تم الحذف" });
    } catch (e: unknown) {
      toast({ title: "خطأ", description: (e as Error)?.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "home", label: "الرئيسية", icon: LayoutDashboard },
    { id: "content", label: "المحتوى", icon: Upload },
    { id: "structure", label: "إدارة الهيكلية الدراسية", icon: Layers },
    { id: "users", label: "إدارة الأعضاء", icon: Users },
    { id: "school-year", label: "إعدادات السنة الدراسية", icon: Calendar },
    { id: "seo", label: "إعدادات SEO", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <Sidebar side="right" className="border-l border-border/50">
            <SidebarHeader className="p-4 border-b border-border/50 flex flex-row items-center gap-2">
              <SidebarTrigger className="mr-2" />
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold block">لوحة التحكم</span>
                  <span className="text-xs text-muted-foreground">نظام إدارة المحتوى</span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map(({ id, label, icon: Icon }) => (
                      <SidebarMenuItem key={id}>
                        <SidebarMenuButton
                          isActive={activeSection === id}
                          onClick={() => setActiveSection(id)}
                          className="gap-3"
                        >
                          <Icon className="w-5 h-5" />
                          <span>{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {activeSection === "home" && "الرئيسية"}
                  {activeSection === "content" && "الرفع الذكي - إضافة محتوى"}
                  {activeSection === "users" && "إدارة الأعضاء"}
                  {activeSection === "school-year" && "إعدادات السنة الدراسية"}
                  {activeSection === "seo" && "محرك السيو"}
                </h1>
                <Link href="/">
                  <Button variant="outline" size="sm">
                    <Home className="w-4 h-4 ml-2" />
                    الرئيسية
                  </Button>
                </Link>
              </div>

              {activeSection === "home" && (
                <div className="space-y-6 font-['Tajawal']">
                  <Card>
                    <CardHeader>
                      <CardTitle>إحصائيات المنصة</CardTitle>
                      <CardDescription>نظرة عامة على حالة المحتوى والأعضاء</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {overviewLoading || statsLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-2">
                                  <BookOpen className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">إجمالي الدروس</p>
                                  <p className="text-2xl font-bold">{overviewStats?.totalLessons ?? 0}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-emerald-500/10 p-2">
                                  <Code className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">المحتوى التفاعلي</p>
                                  <p className="text-2xl font-bold">{overviewStats?.interactiveContent ?? 0}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/10 p-2">
                                  <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">إجمالي الأعضاء</p>
                                  <p className="text-2xl font-bold">{overviewStats?.totalMembers ?? 0}</p>
                                </div>
                              </div>
                            </div>
                            <div className="rounded-xl border bg-card p-5 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-amber-500/10 p-2">
                                  <Paperclip className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">المرفقات</p>
                                  <p className="text-2xl font-bold">{overviewStats?.attachments ?? 0}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-6 md:grid-cols-2 mb-8">
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <BarChart3 className="h-5 w-5" />
                                  توزيع المحتوى حسب المرحلة
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                {overviewStats?.lessonsPerStage?.length ? (
                                  <div className="rounded-lg border overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>المرحلة</TableHead>
                                          <TableHead className="text-left">عدد الدروس</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {overviewStats.lessonsPerStage.map((r) => (
                                          <TableRow key={r.stage}>
                                            <TableCell>{r.stage}</TableCell>
                                            <TableCell className="font-bold">{r.count}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground py-4">لا توجد بيانات</p>
                                )}
                              </CardContent>
                            </Card>
                            <Card>
                              <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <FileVideo className="h-5 w-5" />
                                  الدروس المكتملة مقابل الناقصة
                                </CardTitle>
                                <CardDescription>المكتمل = فيديو + ملخص + أسئلة</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      <span className="text-sm">مكتملة</span>
                                    </div>
                                    <span className="text-xl font-bold">{overviewStats?.completedLessons ?? 0}</span>
                                  </div>
                                  <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="flex items-center gap-2">
                                      <Clock className="h-5 w-5 text-amber-600" />
                                      <span className="text-sm">ناقصة</span>
                                    </div>
                                    <span className="text-xl font-bold">{overviewStats?.incompleteLessons ?? 0}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>

                          <Card>
                            <CardHeader>
                              <CardTitle>أحدث النشاطات</CardTitle>
                              <CardDescription>آخر 5 ملفات تم رفعها</CardDescription>
                            </CardHeader>
                            <CardContent>
                              {overviewStats?.recentUploads?.length ? (
                                <div className="rounded-lg border overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>الدرس</TableHead>
                                        <TableHead>المادة</TableHead>
                                        <TableHead>نوع التبويب</TableHead>
                                        <TableHead>تاريخ الرفع</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {overviewStats.recentUploads.map((r) => (
                                        <TableRow key={r.id}>
                                          <TableCell className="font-medium">{r.lessonTitle}</TableCell>
                                          <TableCell>{r.subjectName}</TableCell>
                                          <TableCell>{TAB_TYPES.find((t) => t.value === r.tabType)?.label ?? r.tabType}</TableCell>
                                          <TableCell className="text-muted-foreground">{r.createdAt}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground py-4">لا توجد رفعات حديثة</p>
                              )}
                            </CardContent>
                          </Card>

                          {stats && (
                            <Card>
                              <CardHeader>
                                <CardTitle>تحديث نسبة الإنجاز</CardTitle>
                                <CardDescription>قيمة مخصصة (0–100) لعرضها في المنصة</CardDescription>
                              </CardHeader>
                              <CardContent className="flex gap-2 items-end flex-wrap">
                                <div className="grid gap-2 flex-1 max-w-xs">
                                  <Label>نسبة الإنجاز %</Label>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={completionInput}
                                    onChange={(e) => setCompletionInput(e.target.value)}
                                  />
                                </div>
                                <Button onClick={saveStats} disabled={savingStats}>
                                  {savingStats ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                  حفظ
                                </Button>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "content" && (
                <>
                <Card>
                  <CardHeader>
                    <CardTitle>الرفع الذكي</CardTitle>
                    <CardDescription>اختر المسار (مرحلة → صف → مادة → فصل → وحدة → درس) ثم التبويب المستهدف</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div>
                        <Label>المرحلة</Label>
                        <Select value={stageSlug || "_"} onValueChange={(v) => setStageSlug(v === "_" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="اختر المرحلة" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر المرحلة</SelectItem>
                            {stages.map((s) => (
                              <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>الصف</Label>
                        <Select value={gradeId || "_"} onValueChange={(v) => setGradeId(v === "_" ? "" : v)} disabled={!stageSlug}>
                          <SelectTrigger><SelectValue placeholder="اختر الصف" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر الصف</SelectItem>
                            {grades.map((g) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>المادة</Label>
                        <Select value={subjectSlug || "_"} onValueChange={(v) => setSubjectSlug(v === "_" ? "" : v)} disabled={!stageSlug || !gradeId}>
                          <SelectTrigger><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر المادة</SelectItem>
                            {subjects.map((s) => (
                              <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>الفصل</Label>
                        <Select value={semesterId || "_"} onValueChange={(v) => setSemesterId(v === "_" ? "" : v)} disabled={!gradeId || !subjectSlug}>
                          <SelectTrigger><SelectValue placeholder="اختر الفصل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر الفصل</SelectItem>
                            {semesters.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>الوحدة</Label>
                        <Select value={chapterId || "_"} onValueChange={(v) => setChapterId(v === "_" ? "" : v)} disabled={!semesterId}>
                          <SelectTrigger><SelectValue placeholder="اختر الوحدة" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر الوحدة</SelectItem>
                            {chapters.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>الدرس</Label>
                        <Select value={lessonId || "_"} onValueChange={(v) => setLessonId(v === "_" ? "" : v)} disabled={!chapterId}>
                          <SelectTrigger><SelectValue placeholder="اختر الدرس" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر الدرس</SelectItem>
                            {lessons.map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {lessons.length === 0 && (stageSlug || gradeId || subjectSlug) && (
                      <div className="flex gap-4">
                        <Label className="pt-2">أو اختر من القائمة:</Label>
                        <Select value={lessonId || "_"} onValueChange={(v) => setLessonId(v === "_" ? "" : v)}>
                          <SelectTrigger className="w-80"><SelectValue placeholder="اختر درس" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">اختر درس</SelectItem>
                            {flatLessons.map((l) => (
                              <SelectItem key={l.lessonId} value={l.lessonId}>{l.path}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>التبويب المستهدف</Label>
                        <Select value={tabType} onValueChange={setTabType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {TAB_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>نوع المحتوى</Label>
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {CONTENT_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {contentType === "pdf" && (
                      <div>
                        <Label>ملف PDF</Label>
                        {editingContentId && contentValue && (
                          <p className="text-sm text-muted-foreground mb-2">
                            الملف الحالي: <a href={contentValue.startsWith("/") ? contentValue : `/${contentValue}`} target="_blank" rel="noreferrer" className="text-primary underline">{contentValue}</a>
                          </p>
                        )}
                        <Input type="file" accept=".pdf" onChange={(e) => setContentFile(e.target.files?.[0] ?? null)} />
                        {editingContentId && <p className="text-xs text-muted-foreground mt-1">اتركه فارغاً للإبقاء على الملف الحالي</p>}
                      </div>
                    )}
                    {contentType === "youtube" && (
                      <div className="space-y-3">
                        <Label>روابط يوتيوب (اختياري — أضف من 1 إلى 6 روابط)</Label>
                        <p className="text-xs text-muted-foreground">عدد الفيديوهات المعروضة في الدرس = عدد الروابط المُدخلة</p>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <Input
                            key={i}
                            placeholder={`رابط ${i + 1}: https://youtube.com/watch?v=...`}
                            value={youtubeUrls[i] ?? ""}
                            onChange={(e) => {
                              const next = [...youtubeUrls];
                              next[i] = e.target.value;
                              setYoutubeUrls(next);
                            }}
                          />
                        ))}
                      </div>
                    )}
                    {(contentType === "html" || contentType === "json") && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <Label>{contentType === "html" ? "كود HTML" : "بيانات JSON"}</Label>
                          {contentType === "html" && (
                            <Button type="button" variant="outline" size="sm" onClick={() => setHtmlPreview(!htmlPreview)}>
                              <Eye className="w-4 h-4 ml-2" />
                              {htmlPreview ? "إخفاء المعاينة" : "معاينة"}
                            </Button>
                          )}
                        </div>
                        <Textarea
                          className="font-mono min-h-[200px]"
                          value={contentValue}
                          onChange={(e) => setContentValue(e.target.value)}
                          placeholder={contentType === "html" ? "<div>...</div>" : '{"lessonId":"","questions":[]}'}
                        />
                        {htmlPreview && contentValue && (
                          <div className="mt-4 rounded-lg border p-4 bg-white dark:bg-card max-h-96 overflow-auto">
                            <div dangerouslySetInnerHTML={{ __html: contentValue }} dir="rtl" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={saveContent} disabled={uploading}>
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                        {editingContentId ? "تحديث المحتوى" : "حفظ وربط بالمحتوى"}
                      </Button>
                      {editingContentId && (
                        <Button variant="outline" onClick={clearEditForm}>
                          إلغاء التعديل
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle>إدارة المحتوى المرفوع</CardTitle>
                        <CardDescription>عرض وتعديل وحذف المحتويات المرفوعة في قاعدة البيانات</CardDescription>
                      </div>
                      <Button variant="outline" onClick={importLegacyContent} disabled={importingLegacy} title="استيراد الملفات والأكواد المرفوعة سابقاً إلى القائمة">
                        {importingLegacy ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Upload className="w-4 h-4 ml-2" />}
                        استيراد المحتوى القديم
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3 items-center">
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">المرحلة:</Label>
                        <Select value={filterStage || "_"} onValueChange={(v) => setFilterStage(v === "_" ? "" : v)}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {stages.map((s) => (
                              <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">الصف:</Label>
                        <Select value={filterGrade || "_"} onValueChange={(v) => setFilterGrade(v === "_" ? "" : v)} disabled={!filterStage}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {filterGrades.map((g) => (
                              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">المادة:</Label>
                        <Select value={filterSubject || "_"} onValueChange={(v) => setFilterSubject(v === "_" ? "" : v)} disabled={!filterGrade}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {filterSubjects.map((s) => (
                              <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">الفصل:</Label>
                        <Select value={filterSemester || "_"} onValueChange={(v) => setFilterSemester(v === "_" ? "" : v)} disabled={!filterGrade || !filterSubject}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {filterSemesters.map((s) => (
                              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">الوحدة:</Label>
                        <Select value={filterChapter || "_"} onValueChange={(v) => setFilterChapter(v === "_" ? "" : v)} disabled={!filterSemester}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {filterChapters.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">الدرس:</Label>
                        <Select value={filterLesson || "_"} onValueChange={(v) => setFilterLesson(v === "_" ? "" : v)} disabled={!filterChapter}>
                          <SelectTrigger className="w-[160px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {filterLessons.map((l) => (
                              <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Label className="text-sm shrink-0">التبويب:</Label>
                        <Select value={filterTabType || "_"} onValueChange={(v) => setFilterTabType(v === "_" ? "" : v)}>
                          <SelectTrigger className="w-[140px]"><SelectValue placeholder="الكل" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {TAB_TYPES.map((t) => (
                              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {filterSemesters.length === 0 && filterStage && filterGrade && filterSubject && (
                      <div className="flex gap-4 items-center">
                        <Label className="text-sm pt-2">أو اختر الدرس من القائمة:</Label>
                        <Select value={filterLesson || "_"} onValueChange={(v) => setFilterLesson(v === "_" ? "" : v)}>
                          <SelectTrigger className="w-80"><SelectValue placeholder="اختر درس" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="_">الكل</SelectItem>
                            {flatLessons
                              .filter(
                                (l) =>
                                  l.path.includes(stages.find((s) => s.slug === filterStage)?.name ?? "") &&
                                  l.path.includes(filterGrades.find((g) => g.id === filterGrade)?.name ?? "") &&
                                  l.path.includes(filterSubjects.find((s) => s.slug === filterSubject)?.name ?? "")
                              )
                              .map((l) => (
                                <SelectItem key={l.lessonId} value={l.lessonId}>
                                  {l.path}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {contentListLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>المرحلة</TableHead>
                              <TableHead>المادة</TableHead>
                              <TableHead>الفصل</TableHead>
                              <TableHead>الوحدة</TableHead>
                              <TableHead>الدرس</TableHead>
                              <TableHead>نوع التبويب</TableHead>
                              <TableHead>نوع الملف</TableHead>
                              <TableHead className="w-[140px]">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {contentList.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>{row.stageName}</TableCell>
                                <TableCell>{row.gradeName ?? "—"}</TableCell>
                                <TableCell>{row.subjectName}</TableCell>
                                <TableCell>{row.semesterName || "—"}</TableCell>
                                <TableCell>{row.chapterName || "—"}</TableCell>
                                <TableCell>{row.lessonTitle}</TableCell>
                                <TableCell>{TAB_TYPES.find((t) => t.value === row.tabType)?.label ?? row.tabType}</TableCell>
                                <TableCell>
                                  {row.contentType === "youtube" && row.dataValue
                                    ? (() => {
                                        const urls = row.dataValue.split(/\r?\n/).filter((u) => u.trim());
                                        const n = urls.length;
                                        const base = CONTENT_TYPES.find((t) => t.value === "youtube")?.label ?? "رابط يوتيوب";
                                        return n > 1 ? `${base} (${n} فيديوهات)` : base;
                                      })()
                                    : (CONTENT_TYPES.find((t) => t.value === row.contentType)?.label ?? row.contentType)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1 items-center">
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => quickViewContent(row)} title="معاينة">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => loadContentForEdit(row)} title="تعديل">
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteConfirm(row)} title="حذف">
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {contentList.length === 0 && !contentListLoading && (
                              <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                  لا يوجد محتوى مرفوع. استخدم النموذج أعلاه لإضافة محتوى.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                      <AlertDialogDescription>
                        هل أنت متأكد من حذف هذا المحتوى؟ سيتم الحذف نهائياً من قاعدة البيانات{deleteConfirm?.contentType === "pdf" || deleteConfirm?.contentType === "image" ? " وحذف الملف من التخزين" : ""}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteConfirm && deleteContent(deleteConfirm)}>
                        حذف
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                </>
              )}

              {activeSection === "structure" && (
                <StructureManager
                  onStructureSaved={() => {
                    fetchAdmin<{ stages: { slug: string; name: string }[] }>("/api/admin/cms/hierarchy")
                      .then((d) => setStages(d.stages || []))
                      .catch(() => {});
                    fetchAdmin<{ lessonId: string; title: string; path: string }[]>("/api/admin/cms/lessons/flat")
                      .then(setFlatLessons)
                      .catch(() => {});
                  }}
                />
              )}

              {activeSection === "users" && (
                <Card>
                  <CardHeader>
                    <CardTitle>إدارة الأعضاء</CardTitle>
                    <CardDescription>البحث والتعديل والحذف</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="بحث بالبريد أو الاسم..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="pr-10"
                        />
                      </div>
                      <div className="flex gap-4">
                        <div className="rounded-lg border px-4 py-2">
                          <span className="text-sm text-muted-foreground">الإجمالي: </span>
                          <span className="font-bold">{userStats.total}</span>
                        </div>
                        <div className="rounded-lg border px-4 py-2">
                          <span className="text-sm text-muted-foreground">جدد اليوم: </span>
                          <span className="font-bold text-green-600">{userStats.newToday}</span>
                        </div>
                      </div>
                    </div>
                    {usersLoading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>البريد</TableHead>
                              <TableHead>الاسم</TableHead>
                              <TableHead>الدور</TableHead>
                              <TableHead>التسجيل</TableHead>
                              <TableHead className="w-[100px]">إجراءات</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {users.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || "-"}</TableCell>
                                <TableCell>{u.role}</TableCell>
                                <TableCell>{u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "-"}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingUser({ ...u });
                                        setEditFormPassword("");
                                      }}
                                    >
                                      تعديل
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteUser(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                            {users.length === 0 && !usersLoading && (
                              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">لا يوجد أعضاء</TableCell></TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Dialog open={!!editingUser} onOpenChange={(open) => !open && (setEditingUser(null), setEditFormPassword(""))}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>تعديل بيانات العضو</DialogTitle>
                  </DialogHeader>
                  {editingUser && (
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editingUser.email ?? ""}
                          onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, email: e.target.value } : null))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-firstName">الاسم الأول</Label>
                        <Input
                          id="edit-firstName"
                          value={editingUser.firstName ?? ""}
                          onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, firstName: e.target.value } : null))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-lastName">اسم العائلة</Label>
                        <Input
                          id="edit-lastName"
                          value={editingUser.lastName ?? ""}
                          onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, lastName: e.target.value } : null))}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>المنصب</Label>
                        <Select
                          value={editingUser.role || "user"}
                          onValueChange={(v) => setEditingUser((prev) => (prev ? { ...prev, role: v } : null))}
                        >
                          <SelectTrigger id="edit-role">
                            <SelectValue placeholder="اختر المنصب" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">عضو عادي</SelectItem>
                            <SelectItem value="admin">آدمن</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-password">كلمة المرور الجديدة (اختياري)</Label>
                        <Input
                          id="edit-password"
                          type="password"
                          placeholder="اتركها فارغة للإبقاء على كلمة المرور الحالية"
                          value={editFormPassword}
                          onChange={(e) => setEditFormPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button variant="outline" onClick={() => (setEditingUser(null), setEditFormPassword(""))}>
                      إلغاء
                    </Button>
                    <Button
                      onClick={() =>
                        editingUser &&
                        updateUser(editingUser, {
                          email: editingUser.email,
                          firstName: editingUser.firstName ?? undefined,
                          lastName: editingUser.lastName ?? undefined,
                          role: editingUser.role || "user",
                          newPassword: editFormPassword.trim() || undefined,
                        })
                      }
                    >
                      حفظ
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {activeSection === "school-year" && (
                <div className="space-y-6 font-['Tajawal']">
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات السنة الدراسية</CardTitle>
                      <CardDescription>تواريخ بداية ونهاية السنة والفصلين (للمرجعية)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {schoolYearLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                      ) : (
                        <div className="grid gap-4 max-w-xl">
                          <div>
                            <Label>تاريخ بداية السنة الدراسية</Label>
                            <Input type="date" value={schoolYearStart} onChange={(e) => setSchoolYearStart(e.target.value)} className="mt-1 font-tajawal" />
                          </div>
                          <div>
                            <Label>تاريخ نهاية السنة الدراسية</Label>
                            <Input type="date" value={schoolYearEnd} onChange={(e) => setSchoolYearEnd(e.target.value)} className="mt-1 font-tajawal" />
                          </div>
                          <div>
                            <Label>نهاية الفصل الأول / بداية الفصل الثاني</Label>
                            <Input type="date" value={semester1End} onChange={(e) => setSemester1End(e.target.value)} className="mt-1 font-tajawal" placeholder="مثال: 2025-12-15" />
                          </div>
                          <Button
                            onClick={async () => {
                              setSchoolYearSaving(true);
                              try {
                                await fetchAdmin("/api/admin/school-year", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({
                                    schoolYearStart: schoolYearStart || undefined,
                                    schoolYearEnd: schoolYearEnd || undefined,
                                    semester1End: semester1End || undefined,
                                  }),
                                });
                                toast({ title: "تم الحفظ" });
                              } catch {
                                toast({ title: "فشل الحفظ", variant: "destructive" });
                              } finally {
                                setSchoolYearSaving(false);
                              }
                            }}
                            disabled={schoolYearSaving}
                          >
                            {schoolYearSaving ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
                            حفظ
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeSection === "seo" && (
                <div className="space-y-6 font-['Tajawal']">
                  <Card>
                    <CardHeader>
                      <CardTitle>إعدادات SEO</CardTitle>
                      <CardDescription>إدارة بيانات البحث والتواصل الاجتماعي للموقع</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {seoLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                      ) : (
                        <Tabs value={seoTab} onValueChange={(v) => { setSeoTab(v); if (v === "general") { setSeoPath("/"); loadSeoForPath("/"); } }} className="w-full">
                          <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="general" className="gap-2">
                              <Globe className="w-4 h-4" />
                              إعدادات عامة
                            </TabsTrigger>
                            <TabsTrigger value="pages" className="gap-2">
                              <Settings className="w-4 h-4" />
                              صفحات فردية
                            </TabsTrigger>
                            <TabsTrigger value="og" className="gap-2">
                              <Share2 className="w-4 h-4" />
                              Open Graph
                            </TabsTrigger>
                          </TabsList>

                          <TabsContent value="general" className="space-y-6 mt-0">
                            <p className="text-sm text-muted-foreground">الإعدادات الافتراضية للصفحة الرئيسية (/) - تُستخدم عندما لا توجد إعدادات خاصة لصفحة معينة.</p>
                            <div className="grid gap-4 max-w-xl">
                              <div>
                                <Label>العنوان الافتراضي</Label>
                                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="عنوان الموقع" className="mt-1" />
                              </div>
                              <div>
                                <Label>الوصف الافتراضي</Label>
                                <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="وصف الموقع" rows={2} className="mt-1" />
                              </div>
                              <div>
                                <Label>الكلمات المفتاحية</Label>
                                <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="كلمات مفتاحية" className="mt-1" />
                              </div>
                              <Button onClick={saveSeo} disabled={seoSaving}>
                                {seoSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                حفظ الإعدادات العامة
                              </Button>
                            </div>
                          </TabsContent>

                          <TabsContent value="pages" className="space-y-6 mt-0">
                            <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
                              <div className="space-y-6">
                                <div>
                                  <Label>اختر الصفحة</Label>
                                  <SearchableDropdown
                                    items={seoPaths}
                                    value={seoPath}
                                    onChange={(v) => { setSeoPath(v); loadSeoForPath(v); }}
                                    placeholder="اختر صفحة..."
                                    searchPlaceholder="ابحث بالاسم العربي (رياضيات، فيزياء، النسبة، زوايا المضلع...)"
                                    emptyMessage="لا توجد نتائج مطابقة"
                                    loading={seoLoading}
                                    grouped
                                  />
                                </div>

                                {!seoHasData && seoPath && (
                                  <div className="flex gap-2 items-center rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-amber-800 dark:text-amber-200">
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <span className="text-sm">لم يتم ضبط إعدادات SEO لهذه الصفحة بعد</span>
                                  </div>
                                )}

                                <div>
                                  <Label>العنوان (Title)</Label>
                                  <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="عنوان الصفحة" className="mt-1" />
                                  <p className={`text-xs mt-1 ${seoTitle.length > 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                    {seoTitle.length}/60 حرف (الموصى به 60)
                                  </p>
                                </div>

                                <div>
                                  <Label>الوصف (Description)</Label>
                                  <Textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder="وصف الصفحة" rows={3} className="mt-1" />
                                  <p className={`text-xs mt-1 ${seoDesc.length > 160 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                                    {seoDesc.length}/160 حرف (الموصى به 160)
                                  </p>
                                </div>

                                <div>
                                  <Label>الكلمات المفتاحية</Label>
                                  <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} placeholder="كلمات مفتاحية، مفصولة بفواصل" className="mt-1" />
                                </div>

                                <Button onClick={saveSeo} disabled={seoSaving}>
                                  {seoSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                  حفظ
                                </Button>
                              </div>

                              <Card className="h-fit">
                                <CardHeader>
                                  <CardTitle className="text-base">معاينة Google</CardTitle>
                                  <CardDescription>شكل النتيجة المتوقع في نتائج البحث</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                                    <p className="text-blue-600 dark:text-blue-400 text-sm truncate">{seoPath || "yourdomain.com"}</p>
                                    <p className="font-medium text-lg text-foreground line-clamp-1">{seoTitle || "عنوان الصفحة"}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{seoDesc || "وصف الصفحة سيظهر هنا..."}</p>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </TabsContent>

                          <TabsContent value="og" className="space-y-6 mt-0">
                            <p className="text-sm text-muted-foreground">إعدادات Open Graph للصفحة المختارة: {seoPaths.find((p) => p.value === seoPath)?.label ?? seoPath}</p>
                            <div className="grid gap-4 max-w-xl">
                              <div>
                                <Label>عنوان المشاركة (og:title)</Label>
                                <Input value={seoOgTitle} onChange={(e) => setSeoOgTitle(e.target.value)} placeholder="يُفترض استخدام عنوان الصفحة إن تُرك فارغاً" className="mt-1" />
                              </div>
                              <div>
                                <Label>وصف المشاركة (og:description)</Label>
                                <Textarea value={seoOgDesc} onChange={(e) => setSeoOgDesc(e.target.value)} placeholder="وصف المشاركة على وسائل التواصل" rows={2} className="mt-1" />
                              </div>
                              <div>
                                <Label>رابط الصورة (og:image)</Label>
                                <Input value={seoOgImage} onChange={(e) => setSeoOgImage(e.target.value)} placeholder="https://..." className="mt-1" />
                              </div>
                              <Button onClick={saveSeo} disabled={seoSaving}>
                                {seoSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                                حفظ إعدادات Open Graph
                              </Button>
                            </div>
                          </TabsContent>
                        </Tabs>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
