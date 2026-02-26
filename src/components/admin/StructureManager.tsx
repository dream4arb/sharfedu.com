/**
 * إدارة الهيكلية الدراسية - المراحل، الوحدات، والدروس
 * قاعدة الأمان: تغيير الأسماء فقط، الـ ID يظل ثابتاً لربط المحتوى (PDF، فيديوهات، HTML)
 */
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Plus, Pencil, Trash2, Search, Layers, BookOpen, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HierarchyLesson {
  id: string;
  title: string;
}

interface HierarchyChapter {
  id: string;
  name: string;
  number?: number;
  lessons: HierarchyLesson[];
}

interface HierarchySemester {
  id: string;
  name: string;
  chapters: HierarchyChapter[];
}

interface HierarchySubject {
  slug: string;
  name: string;
  semesters: HierarchySemester[];
}

interface HierarchyGrade {
  id: string;
  name: string;
  subjects: HierarchySubject[];
}

interface HierarchyStage {
  slug: string;
  name: string;
  grades?: HierarchyGrade[];
  subjects?: HierarchySubject[];
}

/** أسماء الصفوف حسب المرحلة - للتطبيع عند وصول بيانات قديمة */
const GRADE_NAMES: Record<string, Record<string, string>> = {
  elementary: { "1": "الصف الأول", "2": "الصف الثاني", "3": "الصف الثالث", "4": "الصف الرابع", "5": "الصف الخامس", "6": "الصف السادس" },
  middle: { "1": "أول متوسط", "2": "ثاني متوسط", "3": "ثالث متوسط" },
  high: { "1": "أول ثانوي", "2": "ثاني ثانوي", "3": "ثالث ثانوي" },
  paths: { general: "المسار العام" },
  qudurat: { general: "القدرات والتحصيلي" },
};

const DEFAULT_SEMESTERS: HierarchySemester[] = [
  { id: "s1", name: "الفصل الدراسي الأول", chapters: [] },
  { id: "s2", name: "الفصل الدراسي الثاني", chapters: [] },
];

const DEFAULT_CHAPTERS: HierarchyChapter[] = [
  { id: "ch1", name: "الوحدة الأولى", lessons: [] },
];

function ensureSemesterHasChapters(semester: HierarchySemester): HierarchySemester {
  const chs = semester.chapters ?? [];
  if (chs.length > 0) return semester;
  return { ...semester, chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTERS)) };
}

function ensureSubjectHasSemesters(subject: HierarchySubject): HierarchySubject {
  const sems = (subject.semesters ?? []).map(ensureSemesterHasChapters);
  if (sems.length > 0) return { ...subject, semesters: sems };
  return {
    ...subject,
    semesters: DEFAULT_SEMESTERS.map((s) => ensureSemesterHasChapters(JSON.parse(JSON.stringify(s)))),
  };
}

function normalizeHierarchy(raw: HierarchyStage[]): HierarchyStage[] {
  return raw.map((s) => {
    const grades = s.grades;
    if (Array.isArray(grades) && grades.length > 0) {
      return {
        ...s,
        grades: grades.map((g) => ({
          ...g,
          subjects: (g.subjects ?? []).map(ensureSubjectHasSemesters),
        })),
      };
    }
    const subjects = s.subjects;
    const defs = GRADE_NAMES[s.slug];
    const ids = defs ? Object.keys(defs) : ["1"];
    const names = defs ? Object.values(defs) : ["الصف الأول"];
    return {
      slug: s.slug,
      name: s.name,
      grades: ids.map((id, i) => ({
        id,
        name: names[i] ?? id,
        subjects: Array.isArray(subjects)
          ? (i === 0 ? subjects : subjects.map((sub) => ({ ...sub, semesters: [] }))).map(ensureSubjectHasSemesters)
          : [],
      })),
    };
  });
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  const r = await fetch(path, { credentials: "include", ...options });
  if (r.status === 401 || r.status === 403) throw new Error("غير مصرح");
  if (!r.ok) {
    const j = await r.json().catch(() => ({}));
    throw new Error(j?.message || "خطأ في الطلب");
  }
  return r.json();
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

export function StructureManager({ onError, onStructureSaved }: { onError?: (msg: string) => void; onStructureSaved?: () => void }) {
  const { toast } = useToast();
  const [hierarchy, setHierarchy] = useState<HierarchyStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"units" | "lessons">("units");

  const [structStage, setStructStage] = useState("");
  const [structGrade, setStructGrade] = useState("");
  const [structSubject, setStructSubject] = useState("");
  const [structSemester, setStructSemester] = useState("");
  const [structChapter, setStructChapter] = useState("");

  const [editingUnit, setEditingUnit] = useState<{ id: string; name: string; number?: number } | null>(null);
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitNumber, setNewUnitNumber] = useState<number | "">("");
  const [newSemesterName, setNewSemesterName] = useState("");
  const [editingLesson, setEditingLesson] = useState<{ id: string; title: string } | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "unit" | "lesson"; id: string; name: string } | null>(null);

  const stages = useMemo(() => hierarchy.map((s) => ({ slug: s.slug, name: s.name })), [hierarchy]);
  const structGrades = useMemo(() => {
    const stage = hierarchy.find((s) => s.slug === structStage);
    const grades = stage?.grades ?? [];
    return grades.map((g) => ({ id: g.id, name: g.name }));
  }, [hierarchy, structStage]);
  const structSubjects = useMemo(() => {
    const stage = hierarchy.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    return grade?.subjects.map((sub) => ({ slug: sub.slug, name: sub.name })) ?? [];
  }, [hierarchy, structStage, structGrade]);
  const structSemesters = useMemo(() => {
    const stage = hierarchy.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    return sub?.semesters.map((sem) => ({ id: sem.id, name: sem.name })) ?? [];
  }, [hierarchy, structStage, structGrade, structSubject]);
  const structChapters = useMemo(() => {
    const stage = hierarchy.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    const sem = sub?.semesters.find((s) => s.id === structSemester);
    return sem?.chapters.map((ch) => ({ id: ch.id, name: ch.name, number: ch.number })) ?? [];
  }, [hierarchy, structStage, structGrade, structSubject, structSemester]);
  const structLessons = useMemo(() => {
    const stage = hierarchy.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    const sem = sub?.semesters.find((s) => s.id === structSemester);
    const ch = sem?.chapters.find((c) => c.id === structChapter);
    return ch?.lessons ?? [];
  }, [hierarchy, structStage, structGrade, structSubject, structSemester, structChapter]);

  const flatLessons = useMemo(() => {
    const out: { lessonId: string; title: string; path: string }[] = [];
    for (const stage of hierarchy) {
      for (const grade of stage.grades ?? []) {
        for (const subject of grade.subjects) {
          for (const semester of subject.semesters) {
            for (const chapter of semester.chapters) {
              for (const lesson of chapter.lessons) {
                out.push({
                  lessonId: lesson.id,
                  title: lesson.title,
                  path: `${stage.name} > ${grade.name} > ${subject.name} > ${semester.name} > ${chapter.name} > ${lesson.title}`,
                });
              }
            }
          }
        }
      }
    }
    return out;
  }, [hierarchy]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return flatLessons;
    const q = searchQuery.trim().toLowerCase();
    return flatLessons.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.path.toLowerCase().includes(q) ||
        l.lessonId.toLowerCase().includes(q)
    );
  }, [flatLessons, searchQuery]);

  useEffect(() => {
    setLoading(true);
    fetchAdmin<HierarchyStage[]>("/api/admin/cms/structure")
      .then((data) => setHierarchy(normalizeHierarchy(Array.isArray(data) ? data : [])))
      .catch((e) => {
        toast({ title: "خطأ", description: e.message, variant: "destructive" });
        onError?.(e.message);
      })
      .finally(() => setLoading(false));
  }, [toast, onError]);

  const saveHierarchy = async (newHierarchy: HierarchyStage[]) => {
    setSaving(true);
    try {
      const res = await fetchAdmin<{ ok?: boolean }>("/api/admin/cms/structure", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newHierarchy),
      });
      if (res?.ok !== undefined && !res.ok) throw new Error("لم يتم حفظ التعديلات");
      // إعادة جلب الهيكل من السيرفر للتأكد من الحفظ
      const saved = await fetchAdmin<HierarchyStage[]>("/api/admin/cms/structure");
      setHierarchy(normalizeHierarchy(Array.isArray(saved) ? saved : newHierarchy));
      setEditingUnit(null);
      setEditingLesson(null);
      setNewUnitName("");
      setNewUnitNumber("");
      setNewLessonTitle("");
      toast({ title: "تم الحفظ بنجاح" });
      onStructureSaved?.();
    } catch (e: unknown) {
      toast({ title: "فشل الحفظ", description: (e as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const updateInPlace = (
    path: { stageSlug: string; gradeId: string; subjectSlug: string; semesterId: string },
    updater: (sem: HierarchySemester) => void
  ) => {
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === path.stageSlug);
    const grade = stage?.grades?.find((g) => g.id === path.gradeId);
    const sub = grade?.subjects.find((s) => s.slug === path.subjectSlug);
    const sem = sub?.semesters.find((s) => s.id === path.semesterId);
    if (sem) updater(sem);
    saveHierarchy(next);
  };

  const pathBase = { stageSlug: structStage, gradeId: structGrade, subjectSlug: structSubject, semesterId: structSemester };

  const addSemester = () => {
    if (!newSemesterName.trim() || !structStage || !structGrade || !structSubject) {
      toast({ title: "اختر المرحلة والصف والمادة وأدخل اسم الفصل", variant: "destructive" });
      return;
    }
    const id = generateId("s");
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    if (sub) {
      sub.semesters = sub.semesters || [];
      sub.semesters.push({ id, name: newSemesterName.trim(), chapters: [] });
    }
    saveHierarchy(next);
    setStructSemester(id);
    setNewSemesterName("");
  };

  const addUnit = () => {
    if (!newUnitName.trim() || !structStage || !structGrade || !structSubject || !structSemester) {
      toast({ title: "اختر المرحلة والصف والمادة والفصل وأدخل اسم الوحدة", variant: "destructive" });
      return;
    }
    const id = generateId("ch");
    updateInPlace(pathBase, (sem) => {
      sem.chapters = sem.chapters || [];
      sem.chapters.push({ id, name: newUnitName.trim(), lessons: [] });
    });
    setStructChapter(id);
    setNewUnitName("");
  };

  const updateUnit = () => {
    if (!editingUnit || !newUnitName.trim() || !structStage || !structGrade || !structSubject || !structSemester) return;
    const num = newUnitNumber !== "" && Number.isFinite(Number(newUnitNumber)) ? Number(newUnitNumber) : undefined;
    updateInPlace(pathBase, (sem) => {
      const ch = sem.chapters.find((c) => c.id === editingUnit.id);
      if (ch) {
        ch.name = newUnitName.trim();
        if (num !== undefined && num >= 1) ch.number = num;
        else delete ch.number;
      }
    });
    setEditingUnit(null);
    setNewUnitName("");
    setNewUnitNumber("");
  };

  const deleteUnit = () => {
    if (!deleteTarget || deleteTarget.type !== "unit" || !structStage || !structGrade || !structSubject || !structSemester) return;
    updateInPlace(pathBase, (sem) => {
      sem.chapters = sem.chapters.filter((c) => c.id !== deleteTarget.id);
    });
    setDeleteTarget(null);
    if (structChapter === deleteTarget.id) setStructChapter("");
  };

  const addLesson = () => {
    if (!newLessonTitle.trim() || !structStage || !structGrade || !structSubject || !structSemester || !structChapter) {
      toast({ title: "اختر الوحدة وأدخل اسم الدرس", variant: "destructive" });
      return;
    }
    const id = generateId("l");
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    const sem = sub?.semesters.find((s) => s.id === structSemester);
    const ch = sem?.chapters.find((c) => c.id === structChapter);
    if (ch) {
      ch.lessons = ch.lessons || [];
      ch.lessons.push({ id, title: newLessonTitle.trim() });
    }
    saveHierarchy(next);
    setNewLessonTitle("");
  };

  const updateLesson = () => {
    if (!editingLesson || !newLessonTitle.trim() || !structStage || !structGrade || !structSubject || !structSemester || !structChapter) return;
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    const sem = sub?.semesters.find((s) => s.id === structSemester);
    const ch = sem?.chapters.find((c) => c.id === structChapter);
    const les = ch?.lessons.find((l) => l.id === editingLesson.id);
    if (les) les.title = newLessonTitle.trim();
    saveHierarchy(next);
    setEditingLesson(null);
    setNewLessonTitle("");
  };

  const deleteLesson = () => {
    if (!deleteTarget || deleteTarget.type !== "lesson" || !structStage || !structGrade || !structSubject || !structSemester || !structChapter) return;
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === structStage);
    const grade = stage?.grades?.find((g) => g.id === structGrade);
    const sub = grade?.subjects.find((s) => s.slug === structSubject);
    const sem = sub?.semesters.find((s) => s.id === structSemester);
    const ch = sem?.chapters.find((c) => c.id === structChapter);
    if (ch) ch.lessons = ch.lessons.filter((l) => l.id !== deleteTarget.id);
    saveHierarchy(next);
    setDeleteTarget(null);
  };

  const reorderChapters = (fromIndex: number, toIndex: number) => {
    if (!pathBase.stageSlug || !pathBase.gradeId || !pathBase.subjectSlug || !pathBase.semesterId) return;
    if (fromIndex === toIndex) return;
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === pathBase.stageSlug);
    const grade = stage?.grades?.find((g) => g.id === pathBase.gradeId);
    const sub = grade?.subjects.find((s) => s.slug === pathBase.subjectSlug);
    const sem = sub?.semesters.find((s) => s.id === pathBase.semesterId);
    if (!sem?.chapters?.length) return;
    const [moved] = sem.chapters.splice(fromIndex, 1);
    const insertIdx = fromIndex < toIndex ? toIndex - 1 : toIndex;
    sem.chapters.splice(insertIdx, 0, moved);
    saveHierarchy(next);
  };

  const reorderLessons = (fromIndex: number, toIndex: number) => {
    if (!pathBase.stageSlug || !pathBase.gradeId || !pathBase.subjectSlug || !pathBase.semesterId || !structChapter) return;
    if (fromIndex === toIndex) return;
    const next = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stage = next.find((s) => s.slug === pathBase.stageSlug);
    const grade = stage?.grades?.find((g) => g.id === pathBase.gradeId);
    const sub = grade?.subjects.find((s) => s.slug === pathBase.subjectSlug);
    const sem = sub?.semesters.find((s) => s.id === pathBase.semesterId);
    const ch = sem?.chapters.find((c) => c.id === structChapter);
    if (!ch?.lessons?.length) return;
    const [moved] = ch.lessons.splice(fromIndex, 1);
    const insertIdx = fromIndex < toIndex ? toIndex - 1 : toIndex;
    ch.lessons.splice(insertIdx, 0, moved);
    saveHierarchy(next);
  };

  const gotoLesson = (lessonId: string) => {
    for (const stage of hierarchy) {
      for (const grade of stage.grades ?? []) {
        for (const subject of grade.subjects) {
          for (const semester of subject.semesters) {
            for (const chapter of semester.chapters) {
              const les = chapter.lessons.find((l) => l.id === lessonId);
              if (les) {
                setStructStage(stage.slug);
                setStructGrade(grade.id);
                setStructSubject(subject.slug);
                setStructSemester(semester.id);
                setStructChapter(chapter.id);
                setActiveTab("lessons");
                return;
              }
            }
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-16 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 font-['Tajawal']">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-6 h-6" />
            إدارة الهيكلية الدراسية
          </CardTitle>
          <CardDescription>
            إضافة/تعديل الوحدات والدروس. تغيير الأسماء فقط - الرقم التعريفي (ID) يظل ثابتاً لربط المحتوى (PDF، فيديوهات، HTML) تلقائياً.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن درس بالاسم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            {searchQuery && (
              <div className="rounded-lg border p-2 max-h-48 overflow-y-auto min-w-[300px]">
                {searchResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد نتائج</p>
                ) : (
                  searchResults.slice(0, 10).map((l) => (
                    <button
                      key={l.lessonId}
                      type="button"
                      className="block w-full text-right text-sm py-2 px-2 hover:bg-accent rounded-lg truncate"
                      onClick={() => gotoLesson(l.lessonId)}
                    >
                      {l.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <Label>المرحلة</Label>
              <Select value={structStage || "_"} onValueChange={(v) => { setStructStage(v === "_" ? "" : v); setStructGrade(""); setStructSubject(""); setStructSemester(""); setStructChapter(""); }}>
                <SelectTrigger className="mt-1 font-tajawal">
                  <SelectValue placeholder="اختر المرحلة" />
                </SelectTrigger>
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
              <Select value={structGrade || "_"} onValueChange={(v) => { setStructGrade(v === "_" ? "" : v); setStructSubject(""); setStructSemester(""); setStructChapter(""); }} disabled={!structStage}>
                <SelectTrigger className="mt-1 font-tajawal">
                  <SelectValue placeholder="اختر الصف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">اختر الصف</SelectItem>
                  {structGrades.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>المادة</Label>
              <Select value={structSubject || "_"} onValueChange={(v) => { setStructSubject(v === "_" ? "" : v); setStructSemester(""); setStructChapter(""); }} disabled={!structGrade}>
                <SelectTrigger className="mt-1 font-tajawal">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">اختر المادة</SelectItem>
                  {structSubjects.map((s) => (
                    <SelectItem key={s.slug} value={s.slug}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الفصل الدراسي</Label>
              <Select value={structSemester || "_"} onValueChange={(v) => { setStructSemester(v === "_" ? "" : v); setStructChapter(""); }} disabled={!structSubject}>
                <SelectTrigger className="mt-1 font-tajawal">
                  <SelectValue placeholder="اختر الفصل" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">اختر الفصل</SelectItem>
                  {structSemesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الوحدة</Label>
              <Select value={structChapter || "_"} onValueChange={(v) => setStructChapter(v === "_" ? "" : v)} disabled={!structSemester}>
                <SelectTrigger className="mt-1 font-tajawal">
                  <SelectValue placeholder="اختر الوحدة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_">اختر الوحدة</SelectItem>
                  {structChapters.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "units" | "lessons")}>
            <TabsList>
              <TabsTrigger value="units" className="gap-2">
                <Layers className="w-4 h-4" />
                الوحدات
              </TabsTrigger>
              <TabsTrigger value="lessons" className="gap-2">
                <BookOpen className="w-4 h-4" />
                الدروس
              </TabsTrigger>
            </TabsList>

            <TabsContent value="units" className="space-y-4 mt-4">
              {structSubject && structSemesters.length === 0 && (
                <div className="flex gap-2 flex-wrap items-end p-4 rounded-lg bg-muted/30 border">
                  <div className="flex-1 min-w-[200px]">
                    <Label>إضافة فصل دراسي جديد</Label>
                    <Input
                      placeholder="مثال: الفصل الدراسي الأول"
                      value={newSemesterName}
                      onChange={(e) => setNewSemesterName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={addSemester} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                    إضافة فصل
                  </Button>
                </div>
              )}
              <div className="flex gap-2 flex-wrap items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>{editingUnit ? "تعديل اسم الوحدة" : "اسم الوحدة الجديدة"}</Label>
                  <Input
                    placeholder="مثال: النسبة والتناسب"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                {editingUnit && (
                  <div className="w-24">
                    <Label>رقم الوحدة</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newUnitNumber === "" ? "" : newUnitNumber}
                      onChange={(e) => {
                        const v = e.target.value;
                        const n = parseInt(v, 10);
                        setNewUnitNumber(v === "" ? "" : (Number.isNaN(n) ? "" : n));
                      }}
                      className="mt-1"
                    />
                  </div>
                )}
                {editingUnit ? (
                  <>
                    <Button onClick={updateUnit} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                      حفظ التعديل
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingUnit(null); setNewUnitName(""); setNewUnitNumber(""); }}>
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button onClick={addUnit} disabled={saving || !structSemester}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                    إضافة وحدة
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">اسحب الوحدات لتغيير ترتيبها</p>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-right p-2 w-[40px]"></th>
                      <th className="text-right p-3 w-[80px]">رقم الوحدة</th>
                      <th className="text-right p-3">الوحدة</th>
                      <th className="text-right p-3 w-[120px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structChapters.map((ch, idx) => (
                      <tr
                        key={ch.id}
                        className="border-b hover:bg-muted/30 transition-colors data-[drag-over=true]:bg-primary/10 data-[dragging=true]:opacity-50"
                        draggable={!editingUnit}
                        onDragStart={(e) => {
                          if (editingUnit) return;
                          e.dataTransfer.setData("text/plain", String(idx));
                          e.dataTransfer.effectAllowed = "move";
                          (e.currentTarget as HTMLTableRowElement).setAttribute("data-dragging", "true");
                        }}
                        onDragEnd={(e) => {
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-dragging");
                          document.querySelectorAll("[data-drag-over]").forEach((el) => el.removeAttribute("data-drag-over"));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          (e.currentTarget as HTMLTableRowElement).setAttribute("data-drag-over", "true");
                        }}
                        onDragLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-drag-over");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-drag-over");
                          const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                          if (Number.isNaN(fromIdx) || fromIdx === idx) return;
                          reorderChapters(fromIdx, idx);
                        }}
                      >
                        <td
                          className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                          title="اسحب لتغيير الترتيب"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </td>
                        <td className="p-3">
                          {editingUnit?.id === ch.id ? (
                            <Input
                              type="number"
                              min={1}
                              value={newUnitNumber === "" ? "" : newUnitNumber}
                              onChange={(e) => {
                                const v = e.target.value;
                                const n = parseInt(v, 10);
                                setNewUnitNumber(v === "" ? "" : (Number.isNaN(n) ? "" : n));
                              }}
                              placeholder={(idx + 1).toString()}
                              className="h-8 w-16"
                            />
                          ) : (
                            <span className="font-medium">{ch.number ?? idx + 1}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {editingUnit?.id === ch.id ? (
                            <Input
                              value={newUnitName}
                              onChange={(e) => setNewUnitName(e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            <>
                              <span className="font-medium">{ch.name}</span>
                              <span className="text-muted-foreground text-xs mr-2">(ID: {ch.id})</span>
                            </>
                          )}
                        </td>
                        <td className="p-3">
                          {editingUnit?.id === ch.id ? (
                            <div className="flex gap-1">
                              <Button size="sm" onClick={updateUnit} disabled={saving}>
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingUnit(null); setNewUnitName(""); setNewUnitNumber(""); }}>
                                إلغاء
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" title="تعديل" onClick={() => { setEditingUnit({ id: ch.id, name: ch.name, number: ch.number }); setNewUnitName(ch.name); setNewUnitNumber(ch.number ?? idx + 1); }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: "unit", id: ch.id, name: ch.name })}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {structChapters.length === 0 && structSemester && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا توجد وحدات - أضف وحدة جديدة</td></tr>
                    )}
                    {!structSemester && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">اختر المرحلة والصف والمادة والفصل أولاً</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            <TabsContent value="lessons" className="space-y-4 mt-4">
              <div className="flex gap-2 flex-wrap items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label>اسم الدرس الجديد</Label>
                  <Input
                    placeholder="مثال: النسبة"
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    className="mt-1"
                  />
                </div>
                {editingLesson ? (
                  <>
                    <Button onClick={updateLesson} disabled={saving}>
                      {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Save className="w-4 h-4 ml-2" />}
                      حفظ التعديل
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingLesson(null); setNewLessonTitle(""); }}>
                      إلغاء
                    </Button>
                  </>
                ) : (
                  <Button onClick={addLesson} disabled={saving || !structChapter}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Plus className="w-4 h-4 ml-2" />}
                    إضافة درس
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">اسحب الدروس لتغيير ترتيبها</p>
              <div className="rounded-lg border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-right p-2 w-[40px]"></th>
                      <th className="text-right p-3">الدرس</th>
                      <th className="text-right p-3 w-[100px]">ID</th>
                      <th className="text-right p-3 w-[120px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structLessons.map((les, idx) => (
                      <tr
                        key={les.id}
                        className="border-b hover:bg-muted/30 transition-colors data-[drag-over=true]:bg-primary/10 data-[dragging=true]:opacity-50"
                        draggable={!editingLesson}
                        onDragStart={(e) => {
                          if (editingLesson) return;
                          e.dataTransfer.setData("text/plain", String(idx));
                          e.dataTransfer.effectAllowed = "move";
                          (e.currentTarget as HTMLTableRowElement).setAttribute("data-dragging", "true");
                        }}
                        onDragEnd={(e) => {
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-dragging");
                          document.querySelectorAll("[data-drag-over]").forEach((el) => el.removeAttribute("data-drag-over"));
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          (e.currentTarget as HTMLTableRowElement).setAttribute("data-drag-over", "true");
                        }}
                        onDragLeave={(e) => {
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-drag-over");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          (e.currentTarget as HTMLTableRowElement).removeAttribute("data-drag-over");
                          const fromIdx = parseInt(e.dataTransfer.getData("text/plain"), 10);
                          if (Number.isNaN(fromIdx) || fromIdx === idx) return;
                          reorderLessons(fromIdx, idx);
                        }}
                      >
                        <td
                          className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                          title="اسحب لتغيير الترتيب"
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </td>
                        <td className="p-3">
                          {editingLesson?.id === les.id ? (
                            <Input
                              value={newLessonTitle}
                              onChange={(e) => setNewLessonTitle(e.target.value)}
                              className="h-8"
                            />
                          ) : (
                            <span className="font-medium">{les.title}</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">{les.id}</td>
                        <td className="p-3">
                          {editingLesson?.id === les.id ? null : (
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => { setEditingLesson({ id: les.id, title: les.title }); setNewLessonTitle(les.title); }}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setDeleteTarget({ type: "lesson", id: les.id, name: les.title })}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {structLessons.length === 0 && structChapter && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">لا توجد دروس - أضف درساً جديداً</td></tr>
                    )}
                    {!structChapter && (
                      <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">اختر الوحدة أولاً</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === "unit"
                ? `هل أنت متأكد من حذف الوحدة "${deleteTarget.name}"؟ سيتم حذف جميع الدروس داخلها.`
                : `هل أنت متأكد من حذف الدرس "${deleteTarget?.name}"؟ المحتوى المرتبط (PDF، فيديوهات) سيبقى في النظام ولكن لن يظهر في القائمة.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { deleteTarget?.type === "unit" ? deleteUnit() : deleteLesson(); }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
