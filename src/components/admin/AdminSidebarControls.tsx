import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

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
  grades: HierarchyGrade[];
}

async function fetchStructure(): Promise<HierarchyStage[]> {
  const res = await fetch("/api/admin/cms/structure", { credentials: "include" });
  if (!res.ok) throw new Error("فشل تحميل الهيكل");
  return res.json();
}

async function saveStructure(hierarchy: HierarchyStage[]): Promise<void> {
  const res = await fetch("/api/admin/cms/structure", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(hierarchy),
  });
  if (!res.ok) throw new Error("فشل حفظ الهيكل");
}

type ModalState =
  | { type: "none" }
  | { type: "add-lesson"; chapterId: string; semesterId: string }
  | { type: "edit-lesson"; lessonId: string; chapterId: string; semesterId: string; currentTitle: string }
  | { type: "delete-lesson"; lessonId: string; chapterId: string; semesterId: string; title: string }
  | { type: "add-chapter"; semesterId: string }
  | { type: "edit-chapter"; chapterId: string; semesterId: string; currentName: string }
  | { type: "delete-chapter"; chapterId: string; semesterId: string; name: string };

interface AdminSidebarControlsProps {
  stageSlug: string;
  gradeId: string;
  subjectSlug: string;
  onStructureChanged: () => void;
}

export function AdminSidebarControls({
  stageSlug,
  gradeId,
  subjectSlug,
  onStructureChanged,
}: AdminSidebarControlsProps) {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "admin") return null;

  const closeModal = () => {
    setModal({ type: "none" });
    setInputValue("");
    setError("");
  };

  const openAddLesson = (semesterId: string, chapterId: string) => {
    setInputValue("");
    setError("");
    setModal({ type: "add-lesson", chapterId, semesterId });
  };

  const openEditLesson = (semesterId: string, chapterId: string, lessonId: string, currentTitle: string) => {
    setInputValue(currentTitle);
    setError("");
    setModal({ type: "edit-lesson", lessonId, chapterId, semesterId, currentTitle });
  };

  const openDeleteLesson = (semesterId: string, chapterId: string, lessonId: string, title: string) => {
    setError("");
    setModal({ type: "delete-lesson", lessonId, chapterId, semesterId, title });
  };

  const openAddChapter = (semesterId: string) => {
    setInputValue("");
    setError("");
    setModal({ type: "add-chapter", semesterId });
  };

  const openEditChapter = (semesterId: string, chapterId: string, currentName: string) => {
    setInputValue(currentName);
    setError("");
    setModal({ type: "edit-chapter", chapterId, semesterId, currentName });
  };

  const openDeleteChapter = (semesterId: string, chapterId: string, name: string) => {
    setError("");
    setModal({ type: "delete-chapter", chapterId, semesterId, name });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const hierarchy = await fetchStructure();
      const stage = hierarchy.find((s) => s.slug === stageSlug);
      if (!stage) throw new Error("المرحلة غير موجودة");
      const grade = stage.grades.find((g) => g.id === gradeId);
      if (!grade) throw new Error("الصف غير موجود");
      const subject = grade.subjects.find((s) => s.slug === subjectSlug);
      if (!subject) throw new Error("المادة غير موجودة");

      if (modal.type === "add-lesson") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم الدرس"); setSaving(false); return; }
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        const ch = sem?.chapters.find((c) => c.id === modal.chapterId);
        if (!ch) throw new Error("الوحدة غير موجودة");
        const newId = `${modal.chapterId}-${Date.now()}`;
        ch.lessons.push({ id: newId, title: name });
      } else if (modal.type === "edit-lesson") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم الدرس"); setSaving(false); return; }
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        const ch = sem?.chapters.find((c) => c.id === modal.chapterId);
        const lesson = ch?.lessons.find((l) => l.id === modal.lessonId);
        if (!lesson) throw new Error("الدرس غير موجود");
        lesson.title = name;
      } else if (modal.type === "delete-lesson") {
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        const ch = sem?.chapters.find((c) => c.id === modal.chapterId);
        if (!ch) throw new Error("الوحدة غير موجودة");
        ch.lessons = ch.lessons.filter((l) => l.id !== modal.lessonId);
      } else if (modal.type === "add-chapter") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم الوحدة"); setSaving(false); return; }
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        if (!sem) throw new Error("الفصل غير موجود");
        const newId = `ch-${Date.now()}`;
        const num = sem.chapters.length + 1;
        sem.chapters.push({ id: newId, name, number: num, lessons: [] });
      } else if (modal.type === "edit-chapter") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم الوحدة"); setSaving(false); return; }
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        const ch = sem?.chapters.find((c) => c.id === modal.chapterId);
        if (!ch) throw new Error("الوحدة غير موجودة");
        ch.name = name;
      } else if (modal.type === "delete-chapter") {
        const sem = subject.semesters.find((s) => s.id === modal.semesterId);
        if (!sem) throw new Error("الفصل غير موجود");
        sem.chapters = sem.chapters.filter((c) => c.id !== modal.chapterId);
      }

      await saveStructure(hierarchy);
      onStructureChanged();
      closeModal();
    } catch (e: any) {
      setError(e.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  };

  const isDialogOpen = modal.type !== "none";
  const isDelete = modal.type === "delete-lesson" || modal.type === "delete-chapter";
  const dialogTitle = modal.type === "add-lesson" ? "إضافة درس جديد"
    : modal.type === "edit-lesson" ? "تعديل اسم الدرس"
    : modal.type === "delete-lesson" ? "حذف الدرس"
    : modal.type === "add-chapter" ? "إضافة وحدة جديدة"
    : modal.type === "edit-chapter" ? "تعديل اسم الوحدة"
    : modal.type === "delete-chapter" ? "حذف الوحدة"
    : "";

  const deleteItemName = modal.type === "delete-lesson" ? modal.title
    : modal.type === "delete-chapter" ? modal.name
    : "";

  return (
    <>
      <AdminSidebarButtons
        openAddLesson={openAddLesson}
        openEditLesson={openEditLesson}
        openDeleteLesson={openDeleteLesson}
        openAddChapter={openAddChapter}
        openEditChapter={openEditChapter}
        openDeleteChapter={openDeleteChapter}
      />

      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) closeModal(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            {isDelete && (
              <DialogDescription>
                هل أنت متأكد من حذف &quot;{deleteItemName}&quot;؟ لا يمكن التراجع عن هذا الإجراء.
              </DialogDescription>
            )}
          </DialogHeader>
          {!isDelete && (
            <div className="py-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modal.type?.includes("lesson") ? "اسم الدرس" : "اسم الوحدة"}
                dir="rtl"
                data-testid="input-admin-structure-name"
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
              />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal} disabled={saving} data-testid="button-admin-structure-cancel">
              إلغاء
            </Button>
            <Button
              variant={isDelete ? "destructive" : "default"}
              onClick={handleSave}
              disabled={saving}
              data-testid="button-admin-structure-save"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {isDelete ? "حذف" : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface AdminSidebarButtonsProps {
  openAddLesson: (semesterId: string, chapterId: string) => void;
  openEditLesson: (semesterId: string, chapterId: string, lessonId: string, currentTitle: string) => void;
  openDeleteLesson: (semesterId: string, chapterId: string, lessonId: string, title: string) => void;
  openAddChapter: (semesterId: string) => void;
  openEditChapter: (semesterId: string, chapterId: string, currentName: string) => void;
  openDeleteChapter: (semesterId: string, chapterId: string, name: string) => void;
}

function AdminSidebarButtons(_props: AdminSidebarButtonsProps) {
  return null;
}

export function AdminLessonActions({
  semesterId,
  chapterId,
  lessonId,
  lessonTitle,
  onEdit,
  onDelete,
}: {
  semesterId: string;
  chapterId: string;
  lessonId: string;
  lessonTitle: string;
  onEdit: (semesterId: string, chapterId: string, lessonId: string, title: string) => void;
  onDelete: (semesterId: string, chapterId: string, lessonId: string, title: string) => void;
}) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <span className="flex items-center gap-0.5 shrink-0 mr-1">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(semesterId, chapterId, lessonId, lessonTitle); }}
        className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        data-testid={`button-admin-edit-lesson-${lessonId}`}
        title="تعديل"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(semesterId, chapterId, lessonId, lessonTitle); }}
        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        data-testid={`button-admin-delete-lesson-${lessonId}`}
        title="حذف"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </span>
  );
}

export function AdminAddLessonButton({
  semesterId,
  chapterId,
  onAdd,
}: {
  semesterId: string;
  chapterId: string;
  onAdd: (semesterId: string, chapterId: string) => void;
}) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(semesterId, chapterId); }}
      className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-medium text-primary/70 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors border border-dashed border-primary/20 hover:border-primary/40"
      data-testid={`button-admin-add-lesson-${chapterId}`}
    >
      <Plus className="w-3.5 h-3.5" />
      إضافة درس
    </button>
  );
}

export function AdminChapterActions({
  semesterId,
  chapterId,
  chapterName,
  onEdit,
  onDelete,
}: {
  semesterId: string;
  chapterId: string;
  chapterName: string;
  onEdit: (semesterId: string, chapterId: string, name: string) => void;
  onDelete: (semesterId: string, chapterId: string, name: string) => void;
}) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <span className="flex items-center gap-0.5 shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(semesterId, chapterId, chapterName); }}
        className="p-0.5 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
        data-testid={`button-admin-edit-chapter-${chapterId}`}
        title="تعديل الوحدة"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(semesterId, chapterId, chapterName); }}
        className="p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
        data-testid={`button-admin-delete-chapter-${chapterId}`}
        title="حذف الوحدة"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </span>
  );
}

export function AdminAddChapterButton({
  semesterId,
  onAdd,
}: {
  semesterId: string;
  onAdd: (semesterId: string) => void;
}) {
  const { user } = useAuth();
  if (!user || user.role !== "admin") return null;

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(semesterId); }}
      className="flex items-center gap-1.5 w-full px-3 py-2 mt-2 text-xs font-medium text-violet-500/70 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors border border-dashed border-violet-300/30 hover:border-violet-400/50"
      data-testid={`button-admin-add-chapter-${semesterId}`}
    >
      <Plus className="w-3.5 h-3.5" />
      إضافة وحدة
    </button>
  );
}
