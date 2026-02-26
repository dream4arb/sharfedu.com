import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Lock, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { canAccessStageGrade } from "@/lib/profile";
import { getApiUrl } from "@/lib/api-base";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, BookOpen, Baby, GraduationCap, Route, Target,
  Calculator, FlaskConical, Globe, Pen, Book, Atom, Languages, Palette, Heart, Monitor, Briefcase, DollarSign
} from "lucide-react";

const stageData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  bgGradient: string;
  gradeHeaderBg: string;
  grades: { id: string; name: string; subjects: { id: string; name: string; icon: React.ElementType }[] }[];
}> = {
  elementary: {
    title: "المرحلة الابتدائية",
    subtitle: "الصف الأول إلى السادس",
    description: "أساسيات التعلم بأسلوب ممتع وتفاعلي للطلاب الصغار",
    icon: Baby,
    gradient: "from-sky-400 to-blue-500",
    bgGradient: "from-sky-50/50 to-blue-50/50",
    gradeHeaderBg: "from-sky-200 to-blue-200",
    grades: [
      { id: "1", name: "الصف الأول ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "انجليزي", icon: Languages },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "4", name: "الصف الرابع ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "5", name: "الصف الخامس ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "quran", name: "تلاوة القرآن وتجويده", icon: BookOpen },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "6", name: "الصف السادس ابتدائي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "quran", name: "تلاوة القرآن وتجويده", icon: BookOpen },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
    ],
  },
  middle: {
    title: "المرحلة المتوسطة",
    subtitle: "الصف الأول إلى الثالث",
    description: "تعمق في المواد الدراسية الأساسية بأسلوب تفاعلي",
    icon: BookOpen,
    gradient: "from-emerald-400 to-teal-500",
    bgGradient: "from-emerald-50/50 to-teal-50/50",
    gradeHeaderBg: "from-emerald-200 to-teal-200",
    grades: [
      { id: "1", name: "الصف الأول متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث متوسط", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "science", name: "العلوم", icon: FlaskConical },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "arabic", name: "لغتي", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "tajweed", name: "التجويد", icon: BookOpen },
        { id: "islamic", name: "الدراسات الإسلامية", icon: Book },
        { id: "critical", name: "التفكير الناقد", icon: Target },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "family", name: "الأسرية", icon: Heart },
        { id: "art", name: "التربية الفنية", icon: Palette },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
    ],
  },
  high: {
    title: "المرحلة الثانوية",
    subtitle: "الصف الأول إلى الثالث",
    description: "استعد للمرحلة الجامعية بثقة ومحتوى متقدم",
    icon: GraduationCap,
    gradient: "from-violet-400 to-purple-500",
    bgGradient: "from-violet-50/50 to-purple-50/50",
    gradeHeaderBg: "from-violet-200 to-purple-200",
    grades: [
      { id: "1", name: "الصف الأول ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "arabic", name: "اللغة العربية", icon: Pen },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "hadith", name: "حديث", icon: Book },
        { id: "ecology", name: "علم البيئة", icon: FlaskConical },
        { id: "digital", name: "الرقمية", icon: Monitor },
        { id: "vocational", name: "التربية المهنية", icon: Briefcase },
        { id: "social", name: "الدراسات الاجتماعية", icon: Globe },
        { id: "financial", name: "المعرفة المالية", icon: DollarSign },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "2", name: "الصف الثاني ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
        { id: "biology", name: "الأحياء", icon: FlaskConical },
        { id: "arabic", name: "اللغة العربية", icon: Pen },
        { id: "qiraat", name: "قراءات", icon: BookOpen },
        { id: "tawheed", name: "توحيد", icon: Book },
        { id: "english", name: "إنجليزي", icon: Languages },
        { id: "financial-mgmt", name: "الإدارة المالية", icon: DollarSign },
        { id: "arts", name: "الفنون", icon: Palette },
        { id: "business-decision", name: "صناعة القرار في الأعمال", icon: Briefcase },
        { id: "intro-business", name: "مقدمة في الأعمال", icon: Briefcase },
        { id: "iot", name: "انترنت الأشياء", icon: Monitor },
        { id: "health-sciences", name: "مبادئ العلوم الصحية", icon: FlaskConical },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
      ]},
      { id: "3", name: "الصف الثالث ثانوي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
        { id: "fiqh", name: "فقه", icon: Book },
        { id: "chinese", name: "اللغة الصينية", icon: Languages },
        { id: "fikria", name: "التربية الفكرية", icon: GraduationCap },
        { id: "earth-space", name: "علوم الأرض والفضاء", icon: FlaskConical },
        { id: "ai", name: "الذكاء الاصطناعي", icon: Atom },
        { id: "digital-design", name: "التصميم الرقمي", icon: Monitor },
        { id: "statistics", name: "الإحصاء", icon: Calculator },
        { id: "law", name: "مبادئ القانون", icon: Book },
        { id: "marketing-planning", name: "تخطيط الحملات التسويقية", icon: Briefcase },
        { id: "sustainability", name: "التنمية المستدامة", icon: Globe },
        { id: "mgmt-skills", name: "المهارات الإدارية", icon: Briefcase },
        { id: "writing", name: "الكتابة الوظيفية والإبداعية", icon: Pen },
        { id: "event-mgmt", name: "إدارة الفعاليات", icon: Briefcase },
      ]},
    ],
  },
  paths: {
    title: "المسارات",
    subtitle: "المسارات الأكاديمية والتخصصية",
    description: "اختر مسارك التخصصي المناسب لميولك ومستقبلك",
    icon: Route,
    gradient: "from-amber-400 to-orange-500",
    bgGradient: "from-amber-50/50 to-orange-50/50",
    gradeHeaderBg: "from-amber-200 to-orange-200",
    grades: [
      { id: "general", name: "المسار العام", subjects: [
        { id: "math", name: "الرياضيات العامة", icon: Calculator },
        { id: "science", name: "العلوم العامة", icon: FlaskConical },
      ]},
      { id: "cs", name: "مسار علوم الحاسب والهندسة", subjects: [
        { id: "programming", name: "البرمجة", icon: Book },
        { id: "math", name: "الرياضيات المتقدمة", icon: Calculator },
      ]},
      { id: "health", name: "مسار الصحة والحياة", subjects: [
        { id: "biology", name: "الأحياء", icon: FlaskConical },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
      ]},
      { id: "business", name: "مسار إدارة الأعمال", subjects: [
        { id: "accounting", name: "المحاسبة", icon: Calculator },
        { id: "management", name: "الإدارة", icon: Book },
      ]},
      { id: "shariah", name: "مسار الشريعة", subjects: [
        { id: "fiqh", name: "الفقه", icon: Book },
        { id: "tafseer", name: "التفسير", icon: Book },
      ]},
    ],
  },
  qudurat: {
    title: "القدرات والتحصيلي",
    subtitle: "اختبارات القياس",
    description: "تحضير مكثف لاختبارات القدرات والتحصيل الدراسي",
    icon: Target,
    gradient: "from-rose-400 to-pink-500",
    bgGradient: "from-rose-50/50 to-pink-50/50",
    gradeHeaderBg: "from-rose-200 to-pink-200",
    grades: [
      { id: "qudurat", name: "اختبار القدرات العامة", subjects: [
        { id: "verbal", name: "القسم اللفظي", icon: Pen },
        { id: "quantitative", name: "القسم الكمي", icon: Calculator },
      ]},
      { id: "tahsili", name: "اختبار التحصيل الدراسي", subjects: [
        { id: "math", name: "الرياضيات", icon: Calculator },
        { id: "physics", name: "الفيزياء", icon: Atom },
        { id: "chemistry", name: "الكيمياء", icon: FlaskConical },
        { id: "biology", name: "الأحياء", icon: FlaskConical },
      ]},
      { id: "step", name: "اختبار STEP", subjects: [
        { id: "english", name: "اللغة الإنجليزية", icon: Languages },
      ]},
    ],
  },
};

const stageSlugMap: Record<string, string> = {
  elementary: "elementary",
  middle: "middle",
  high: "high",
  paths: "paths",
  qudurat: "qudurat",
};

interface HierarchySubject {
  slug: string;
  name: string;
  semesters: unknown[];
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

export default function Stage() {
  const { stageId } = useParams<{ stageId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const stage = stageData[stageId || ""] || stageData.middle;
  const StageIcon = stage.icon;
  const profileComplete = !!user;
  const isAdmin = user?.role === "admin";

  const stageUrlMap: Record<string, string> = {
    elementary: "primary",
    middle: "middle",
    high: "secondary",
  };
  const urlStage = stageUrlMap[stageId || ""] || stageId || "primary";

  const [hierarchy, setHierarchy] = useState<HierarchyStage[] | null>(null);
  const [saving, setSaving] = useState(false);

  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [gradeDialogMode, setGradeDialogMode] = useState<"add" | "edit">("add");
  const [gradeDialogName, setGradeDialogName] = useState("");
  const [gradeDialogId, setGradeDialogId] = useState("");
  const [editingGradeOriginalId, setEditingGradeOriginalId] = useState("");

  const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
  const [subjectDialogMode, setSubjectDialogMode] = useState<"add" | "edit">("add");
  const [subjectDialogName, setSubjectDialogName] = useState("");
  const [subjectDialogSlug, setSubjectDialogSlug] = useState("");
  const [subjectDialogGradeId, setSubjectDialogGradeId] = useState("");
  const [editingSubjectOriginalSlug, setEditingSubjectOriginalSlug] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "grade" | "subject"; gradeId: string; subjectSlug?: string; name: string } | null>(null);

  const fetchHierarchy = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("/api/admin/cms/structure"), { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setHierarchy(Array.isArray(data) ? data : []);
      }
    } catch {
      // silently fail for non-admin
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchHierarchy();
    }
  }, [isAdmin, fetchHierarchy]);

  const currentStageSlug = stageSlugMap[stageId || ""] || stageId || "middle";

  const saveHierarchy = async (updated: HierarchyStage[]) => {
    setSaving(true);
    try {
      const res = await fetch(getApiUrl("/api/admin/cms/structure"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Save failed");
      setHierarchy(updated);
      toast({ title: "تم الحفظ بنجاح", description: "تم تحديث الهيكلية الدراسية" });
    } catch {
      toast({ title: "خطأ", description: "فشل في حفظ التغييرات", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const openAddGrade = () => {
    setGradeDialogMode("add");
    setGradeDialogName("");
    setGradeDialogId("");
    setEditingGradeOriginalId("");
    setGradeDialogOpen(true);
  };

  const openEditGrade = (gradeId: string, gradeName: string) => {
    setGradeDialogMode("edit");
    setGradeDialogName(gradeName);
    setGradeDialogId(gradeId);
    setEditingGradeOriginalId(gradeId);
    setGradeDialogOpen(true);
  };

  const handleGradeSave = async () => {
    if (!gradeDialogName.trim() || !hierarchy) return;
    const updated = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    let stageObj = updated.find(s => s.slug === currentStageSlug);
    if (!stageObj) {
      stageObj = { slug: currentStageSlug, name: stage.title, grades: [] };
      updated.push(stageObj);
    }

    if (gradeDialogMode === "add") {
      const newId = gradeDialogId.trim() || `grade-${Date.now()}`;
      const exists = stageObj.grades.some(g => g.id === newId);
      if (exists) {
        toast({ title: "خطأ", description: "معرف الصف موجود مسبقاً", variant: "destructive" });
        return;
      }
      stageObj.grades.push({ id: newId, name: gradeDialogName.trim(), subjects: [] });
    } else {
      const grade = stageObj.grades.find(g => g.id === editingGradeOriginalId);
      if (grade) {
        grade.name = gradeDialogName.trim();
        if (gradeDialogId.trim() && gradeDialogId.trim() !== editingGradeOriginalId) {
          grade.id = gradeDialogId.trim();
        }
      }
    }

    await saveHierarchy(updated);
    setGradeDialogOpen(false);
  };

  const openAddSubject = (gradeId: string) => {
    setSubjectDialogMode("add");
    setSubjectDialogName("");
    setSubjectDialogSlug("");
    setSubjectDialogGradeId(gradeId);
    setEditingSubjectOriginalSlug("");
    setSubjectDialogOpen(true);
  };

  const openEditSubject = (gradeId: string, subjectSlug: string, subjectName: string) => {
    setSubjectDialogMode("edit");
    setSubjectDialogName(subjectName);
    setSubjectDialogSlug(subjectSlug);
    setSubjectDialogGradeId(gradeId);
    setEditingSubjectOriginalSlug(subjectSlug);
    setSubjectDialogOpen(true);
  };

  const handleSubjectSave = async () => {
    if (!subjectDialogName.trim() || !hierarchy) return;
    const updated = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stageObj = updated.find(s => s.slug === currentStageSlug);
    if (!stageObj) return;
    const grade = stageObj.grades.find(g => g.id === subjectDialogGradeId);
    if (!grade) return;

    if (subjectDialogMode === "add") {
      const newSlug = subjectDialogSlug.trim() || subjectDialogName.trim().toLowerCase().replace(/\s+/g, "-");
      const exists = grade.subjects.some(s => s.slug === newSlug);
      if (exists) {
        toast({ title: "خطأ", description: "معرف المادة موجود مسبقاً في هذا الصف", variant: "destructive" });
        return;
      }
      grade.subjects.push({ slug: newSlug, name: subjectDialogName.trim(), semesters: [] });
    } else {
      const subject = grade.subjects.find(s => s.slug === editingSubjectOriginalSlug);
      if (subject) {
        subject.name = subjectDialogName.trim();
        if (subjectDialogSlug.trim() && subjectDialogSlug.trim() !== editingSubjectOriginalSlug) {
          subject.slug = subjectDialogSlug.trim();
        }
      }
    }

    await saveHierarchy(updated);
    setSubjectDialogOpen(false);
  };

  const openDeleteDialog = (type: "grade" | "subject", gradeId: string, name: string, subjectSlug?: string) => {
    setDeleteTarget({ type, gradeId, subjectSlug, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget || !hierarchy) return;
    const updated = JSON.parse(JSON.stringify(hierarchy)) as HierarchyStage[];
    const stageObj = updated.find(s => s.slug === currentStageSlug);
    if (!stageObj) return;

    if (deleteTarget.type === "grade") {
      stageObj.grades = stageObj.grades.filter(g => g.id !== deleteTarget.gradeId);
    } else if (deleteTarget.type === "subject" && deleteTarget.subjectSlug) {
      const grade = stageObj.grades.find(g => g.id === deleteTarget.gradeId);
      if (grade) {
        grade.subjects = grade.subjects.filter(s => s.slug !== deleteTarget.subjectSlug);
      }
    }

    await saveHierarchy(updated);
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Navbar />
      <main className="pt-24 pb-20 bg-white dark:bg-background">
        <div className={`relative overflow-hidden bg-gradient-to-br ${stage.bgGradient} pb-24`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,120,255,0.15),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,197,94,0.08),transparent_50%)]" />
          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground/90 mb-10">
              <Link href="/" className="hover:text-foreground transition-colors" data-testid="link-breadcrumb-home">الرئيسية</Link>
              <ArrowLeft className="w-4 h-4" />
              <span className="text-foreground font-medium">{stage.title}</span>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row gap-8 items-center md:items-start"
            >
              <div className={`w-24 h-24 rounded-3xl flex items-center justify-center bg-gradient-to-br ${stage.gradient} text-white shadow-2xl shadow-black/15 shrink-0 ring-4 ring-white/20`}>
                <StageIcon className="w-12 h-12" />
              </div>
              <div className="text-center md:text-right">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-l from-foreground to-foreground/80">{stage.title}</h1>
                <p className="text-lg text-muted-foreground mb-2 font-medium">{stage.subtitle}</p>
                <p className="text-muted-foreground/90 max-w-xl">{stage.description}</p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-14 relative z-10">
          <div className="space-y-8">
            {stage.grades.map((grade, gradeIndex) => {
              const gradeLocked = profileComplete && !canAccessStageGrade(stageId || "", grade.id, user);
              return (
                <motion.section
                  key={grade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gradeIndex * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className={`rounded-3xl overflow-hidden backdrop-blur-xl ${gradeLocked ? "bg-muted/30 dark:bg-muted/10" : "bg-white/80 dark:bg-card/90 shadow-xl shadow-black/5 border border-white/60 dark:border-white/5"}`}
                >
                  <div className={`px-6 sm:px-8 py-5 flex items-center justify-between gap-2 relative overflow-hidden ${gradeLocked ? "bg-muted/40 border-b border-muted" : stageId === "elementary" 
                    ? `border-b border-white/20 bg-gradient-to-br ${stage.gradient} shadow-lg shadow-sky-500/20` 
                    : `bg-gradient-to-l ${stage.gradeHeaderBg} dark:bg-muted/30 border-b border-black/5 dark:border-white/5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]`}`}>
                    <div className="flex items-center gap-4">
                      {stageId === "elementary" && !gradeLocked && (
                        <div className={`w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-base shrink-0`}>
                          {grade.id}
                        </div>
                      )}
                      <h2 className={`text-lg font-bold ${gradeLocked ? "text-muted-foreground" : stageId === "elementary" ? "text-white" : "text-foreground"}`}>{grade.name}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && hierarchy && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditGrade(grade.id, grade.name); }}
                            data-testid={`button-edit-grade-${grade.id}`}
                            className="text-foreground/70"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteDialog("grade", grade.id, grade.name); }}
                            data-testid={`button-delete-grade-${grade.id}`}
                            className="text-destructive/70"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {gradeLocked && (
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5">
                          <Lock className="w-3.5 h-3.5" />
                          مقفل
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-5 sm:p-7">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
                      {grade.subjects.map((subject, subIndex) => {
                        const SubjectIcon = subject.icon;
                        const subjectHref = `/lesson/${urlStage}/${subject.id}`;
                        
                        if (gradeLocked) {
                          return (
                            <div
                              key={subject.id}
                              className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-muted/50 bg-muted/5 opacity-60 cursor-not-allowed"
                            >
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-muted/40 text-muted-foreground shrink-0">
                                <SubjectIcon className="w-6 h-6" />
                              </div>
                              <h3 className="font-semibold text-sm text-muted-foreground line-clamp-2">{subject.name}</h3>
                              <Lock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                            </div>
                          );
                        }
                        
                        return (
                          <div key={subject.id} className="relative group/card">
                            {isAdmin && hierarchy && (
                              <div className="absolute top-1 left-1 z-10 flex gap-1 invisible group-hover/card:visible">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="w-7 h-7"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditSubject(grade.id, subject.id, subject.name); }}
                                  data-testid={`button-edit-subject-${grade.id}-${subject.id}`}
                                >
                                  <Pencil className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="w-7 h-7 text-destructive"
                                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openDeleteDialog("subject", grade.id, subject.name, subject.id); }}
                                  data-testid={`button-delete-subject-${grade.id}-${subject.id}`}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                            <Link
                              href={subjectHref}
                              data-testid={`link-subject-${grade.id}-${subject.id}`}
                              className="block"
                              onClick={() => {
                                sessionStorage.setItem("lesson_grade", grade.id);
                                sessionStorage.setItem("lesson_stage", stageId || "");
                              }}
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: gradeIndex * 0.06 + subIndex * 0.015, duration: 0.35 }}
                                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl bg-white/60 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 hover:border-transparent hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-black/20 transition-all duration-300 cursor-pointer overflow-hidden min-w-0"
                              >
                                <div className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`} />
                                <div className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.gradient} text-white shrink-0 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300`}>
                                  <SubjectIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                                </div>
                                <div className="relative flex-1 min-w-0">
                                  <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-2">{subject.name}</h3>
                                  <span className="text-xs text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                    الدخول
                                    <ArrowLeft className="w-3 h-3" />
                                  </span>
                                </div>
                              </motion.div>
                            </Link>
                          </div>
                        );
                      })}
                      {isAdmin && hierarchy && !gradeLocked && (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: gradeIndex * 0.06 + grade.subjects.length * 0.015, duration: 0.35 }}
                        >
                          <Button
                            variant="outline"
                            className="w-full h-full min-h-[80px] rounded-2xl border-dashed border-2 flex flex-col items-center justify-center gap-2 text-muted-foreground"
                            onClick={() => openAddSubject(grade.id)}
                            data-testid={`button-add-subject-${grade.id}`}
                          >
                            <Plus className="w-5 h-5" />
                            <span className="text-sm font-medium">إضافة مادة</span>
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.section>
              );
            })}

            {isAdmin && hierarchy && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stage.grades.length * 0.06, duration: 0.45 }}
              >
                <Button
                  variant="outline"
                  className="w-full py-6 rounded-3xl border-dashed border-2 flex items-center justify-center gap-3 text-muted-foreground"
                  onClick={openAddGrade}
                  data-testid="button-add-grade"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-base font-medium">إضافة صف</span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <Dialog open={gradeDialogOpen} onOpenChange={setGradeDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{gradeDialogMode === "add" ? "إضافة صف جديد" : "تعديل الصف"}</DialogTitle>
            <DialogDescription>
              {gradeDialogMode === "add" ? "أضف صفاً جديداً في هيكل الدروس" : "عدّل اسم أو معرّف الصف"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="grade-name">اسم الصف</Label>
              <Input
                id="grade-name"
                value={gradeDialogName}
                onChange={(e) => setGradeDialogName(e.target.value)}
                placeholder="مثال: الصف الأول"
                data-testid="input-grade-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade-id">معرّف الصف (اختياري)</Label>
              <Input
                id="grade-id"
                value={gradeDialogId}
                onChange={(e) => setGradeDialogId(e.target.value)}
                placeholder="مثال: 1"
                dir="ltr"
                data-testid="input-grade-id"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setGradeDialogOpen(false)} data-testid="button-cancel-grade">إلغاء</Button>
            <Button onClick={handleGradeSave} disabled={saving || !gradeDialogName.trim()} data-testid="button-save-grade">
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={subjectDialogOpen} onOpenChange={setSubjectDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>{subjectDialogMode === "add" ? "إضافة مادة جديدة" : "تعديل المادة"}</DialogTitle>
            <DialogDescription>
              {subjectDialogMode === "add" ? "أضف مادة جديدة في هيكل الدروس" : "عدّل اسم أو معرّف المادة"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="subject-name">اسم المادة</Label>
              <Input
                id="subject-name"
                value={subjectDialogName}
                onChange={(e) => setSubjectDialogName(e.target.value)}
                placeholder="مثال: الرياضيات"
                data-testid="input-subject-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-slug">معرّف المادة (اختياري)</Label>
              <Input
                id="subject-slug"
                value={subjectDialogSlug}
                onChange={(e) => setSubjectDialogSlug(e.target.value)}
                placeholder="مثال: math"
                dir="ltr"
                data-testid="input-subject-slug"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSubjectDialogOpen(false)} data-testid="button-cancel-subject">إلغاء</Button>
            <Button onClick={handleSubjectSave} disabled={saving || !subjectDialogName.trim()} data-testid="button-save-subject">
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف {deleteTarget?.type === "grade" ? "الصف" : "المادة"} "{deleteTarget?.name}"؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel data-testid="button-cancel-delete">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground" data-testid="button-confirm-delete">
              {saving && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
