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

interface HierarchyStage {
  slug: string;
  name: string;
  grades: {
    id: string;
    name: string;
    subjects: {
      slug: string;
      name: string;
      semesters: any[];
    }[];
  }[];
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
  | { type: "add-grade"; stageSlug: string }
  | { type: "edit-grade"; stageSlug: string; gradeId: string; currentName: string }
  | { type: "delete-grade"; stageSlug: string; gradeId: string; name: string }
  | { type: "add-subject"; stageSlug: string; gradeId: string }
  | { type: "edit-subject"; stageSlug: string; gradeId: string; subjectSlug: string; currentName: string }
  | { type: "delete-subject"; stageSlug: string; gradeId: string; subjectSlug: string; name: string };

export function useAdminStageControls(onStructureChanged: () => void) {
  const { user } = useAuth();
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [inputValue, setInputValue] = useState("");
  const [inputSlug, setInputSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "admin";

  const closeModal = () => {
    setModal({ type: "none" });
    setInputValue("");
    setInputSlug("");
    setError("");
  };

  const handlers = {
    addGrade: (stageSlug: string) => {
      if (!isAdmin) return;
      setInputValue(""); setInputSlug(""); setError("");
      setModal({ type: "add-grade", stageSlug });
    },
    editGrade: (stageSlug: string, gradeId: string, currentName: string) => {
      if (!isAdmin) return;
      setInputValue(currentName); setError("");
      setModal({ type: "edit-grade", stageSlug, gradeId, currentName });
    },
    deleteGrade: (stageSlug: string, gradeId: string, name: string) => {
      if (!isAdmin) return;
      setError("");
      setModal({ type: "delete-grade", stageSlug, gradeId, name });
    },
    addSubject: (stageSlug: string, gradeId: string) => {
      if (!isAdmin) return;
      setInputValue(""); setInputSlug(""); setError("");
      setModal({ type: "add-subject", stageSlug, gradeId });
    },
    editSubject: (stageSlug: string, gradeId: string, subjectSlug: string, currentName: string) => {
      if (!isAdmin) return;
      setInputValue(currentName); setError("");
      setModal({ type: "edit-subject", stageSlug, gradeId, subjectSlug, currentName });
    },
    deleteSubject: (stageSlug: string, gradeId: string, subjectSlug: string, name: string) => {
      if (!isAdmin) return;
      setError("");
      setModal({ type: "delete-subject", stageSlug, gradeId, subjectSlug, name });
    },
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const hierarchy = await fetchStructure();

      if (modal.type === "add-grade") {
        const name = inputValue.trim();
        const id = inputSlug.trim() || String(Date.now());
        if (!name) { setError("أدخل اسم الصف"); setSaving(false); return; }
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        if (!stage) throw new Error("المرحلة غير موجودة");
        stage.grades.push({ id, name, subjects: [] });
      } else if (modal.type === "edit-grade") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم الصف"); setSaving(false); return; }
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        const grade = stage?.grades.find((g) => g.id === modal.gradeId);
        if (!grade) throw new Error("الصف غير موجود");
        grade.name = name;
      } else if (modal.type === "delete-grade") {
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        if (!stage) throw new Error("المرحلة غير موجودة");
        stage.grades = stage.grades.filter((g) => g.id !== modal.gradeId);
      } else if (modal.type === "add-subject") {
        const name = inputValue.trim();
        const slug = inputSlug.trim();
        if (!name) { setError("أدخل اسم المادة"); setSaving(false); return; }
        if (!slug) { setError("أدخل معرف المادة (بالإنجليزي)"); setSaving(false); return; }
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        const grade = stage?.grades.find((g) => g.id === modal.gradeId);
        if (!grade) throw new Error("الصف غير موجود");
        grade.subjects.push({
          slug, name,
          semesters: [
            { id: "s1", name: "الفصل الأول", chapters: [] },
            { id: "s2", name: "الفصل الثاني", chapters: [] },
          ],
        });
      } else if (modal.type === "edit-subject") {
        const name = inputValue.trim();
        if (!name) { setError("أدخل اسم المادة"); setSaving(false); return; }
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        const grade = stage?.grades.find((g) => g.id === modal.gradeId);
        const subject = grade?.subjects.find((s) => s.slug === modal.subjectSlug);
        if (!subject) throw new Error("المادة غير موجودة");
        subject.name = name;
      } else if (modal.type === "delete-subject") {
        const stage = hierarchy.find((s) => s.slug === modal.stageSlug);
        const grade = stage?.grades.find((g) => g.id === modal.gradeId);
        if (!grade) throw new Error("الصف غير موجود");
        grade.subjects = grade.subjects.filter((s) => s.slug !== modal.subjectSlug);
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

  const isDelete = modal.type === "delete-grade" || modal.type === "delete-subject";
  const needsSlug = modal.type === "add-grade" || modal.type === "add-subject";
  const dialogTitle = modal.type === "add-grade" ? "إضافة صف جديد"
    : modal.type === "edit-grade" ? "تعديل اسم الصف"
    : modal.type === "delete-grade" ? "حذف الصف"
    : modal.type === "add-subject" ? "إضافة مادة جديدة"
    : modal.type === "edit-subject" ? "تعديل اسم المادة"
    : modal.type === "delete-subject" ? "حذف المادة"
    : "";

  const deleteItemName = (modal.type === "delete-grade" || modal.type === "delete-subject") ? modal.name : "";

  const ModalComponent = () => {
    if (!isAdmin || modal.type === "none") return null;
    return (
      <Dialog open onOpenChange={(open) => { if (!open) closeModal(); }}>
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
            <div className="py-4 space-y-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={modal.type?.includes("grade") ? "اسم الصف (مثال: الصف الأول متوسط)" : "اسم المادة (مثال: الرياضيات)"}
                dir="rtl"
                data-testid="input-admin-stage-name"
                onKeyDown={(e) => { if (e.key === "Enter" && !needsSlug) handleSave(); }}
              />
              {needsSlug && (
                <Input
                  value={inputSlug}
                  onChange={(e) => setInputSlug(e.target.value)}
                  placeholder={modal.type === "add-grade" ? "معرف الصف (مثال: 4)" : "معرف المادة بالإنجليزي (مثال: math)"}
                  dir="ltr"
                  data-testid="input-admin-stage-slug"
                  onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
                />
              )}
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="ghost" onClick={closeModal} disabled={saving} data-testid="button-admin-stage-cancel">
              إلغاء
            </Button>
            <Button
              variant={isDelete ? "destructive" : "default"}
              onClick={handleSave}
              disabled={saving}
              data-testid="button-admin-stage-save"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              {isDelete ? "حذف" : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return { isAdmin, handlers, ModalComponent };
}

export function AdminGradeActions({
  stageSlug,
  gradeId,
  gradeName,
  onEdit,
  onDelete,
}: {
  stageSlug: string;
  gradeId: string;
  gradeName: string;
  onEdit: (stageSlug: string, gradeId: string, name: string) => void;
  onDelete: (stageSlug: string, gradeId: string, name: string) => void;
}) {
  return (
    <span className="flex items-center gap-1 shrink-0">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(stageSlug, gradeId, gradeName); }}
        className="p-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-white/10 text-current opacity-60 hover:opacity-100 transition-all"
        data-testid={`button-admin-edit-grade-${gradeId}`}
        title="تعديل الصف"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(stageSlug, gradeId, gradeName); }}
        className="p-1.5 rounded-lg hover:bg-red-500/20 text-current opacity-60 hover:opacity-100 hover:text-red-500 transition-all"
        data-testid={`button-admin-delete-grade-${gradeId}`}
        title="حذف الصف"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </span>
  );
}

export function AdminAddGradeButton({
  stageSlug,
  onAdd,
}: {
  stageSlug: string;
  onAdd: (stageSlug: string) => void;
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onAdd(stageSlug); }}
      className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl border-2 border-dashed border-primary/20 hover:border-primary/40 text-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
      data-testid={`button-admin-add-grade-${stageSlug}`}
    >
      <Plus className="w-5 h-5" />
      <span className="font-semibold text-sm">إضافة صف</span>
    </button>
  );
}

export function AdminSubjectActions({
  stageSlug,
  gradeId,
  subjectSlug,
  subjectName,
  onEdit,
  onDelete,
}: {
  stageSlug: string;
  gradeId: string;
  subjectSlug: string;
  subjectName: string;
  onEdit: (stageSlug: string, gradeId: string, slug: string, name: string) => void;
  onDelete: (stageSlug: string, gradeId: string, slug: string, name: string) => void;
}) {
  return (
    <span className="absolute top-1 left-1 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(stageSlug, gradeId, subjectSlug, subjectName); }}
        className="p-1 rounded-md bg-white/80 dark:bg-black/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shadow-sm"
        data-testid={`button-admin-edit-subject-${gradeId}-${subjectSlug}`}
        title="تعديل المادة"
      >
        <Pencil className="w-3 h-3" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(stageSlug, gradeId, subjectSlug, subjectName); }}
        className="p-1 rounded-md bg-white/80 dark:bg-black/50 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shadow-sm"
        data-testid={`button-admin-delete-subject-${gradeId}-${subjectSlug}`}
        title="حذف المادة"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </span>
  );
}

export function AdminAddSubjectButton({
  stageSlug,
  gradeId,
  onAdd,
}: {
  stageSlug: string;
  gradeId: string;
  onAdd: (stageSlug: string, gradeId: string) => void;
}) {
  return (
    <button
      onClick={(e) => { e.preventDefault(); onAdd(stageSlug, gradeId); }}
      className="flex items-center gap-2 p-3 sm:p-4 rounded-2xl border-2 border-dashed border-primary/15 hover:border-primary/30 text-primary/40 hover:text-primary hover:bg-primary/5 transition-all min-h-[60px]"
      data-testid={`button-admin-add-subject-${gradeId}`}
    >
      <Plus className="w-5 h-5" />
      <span className="font-medium text-xs">إضافة مادة</span>
    </button>
  );
}
