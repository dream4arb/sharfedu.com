/**
 * تخزين الهيكلية الدراسية في قاعدة البيانات
 * المحتوى (PDF، فيديوهات، HTML) مرتبط بـ lesson_id الثابت - تغيير الأسماء فقط لا يؤثر
 */
import { db } from "../db";
import { platformStats } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { HierarchyStage, HierarchyGrade, HierarchySubject, HierarchySemester } from "../data/cms-hierarchy";
import { setCurrentHierarchy, GRADE_NAMES, CMS_HIERARCHY } from "../data/cms-hierarchy";

const DEFAULT_SEMESTERS = [
  { id: "s1", name: "الفصل الدراسي الأول", chapters: [] },
  { id: "s2", name: "الفصل الدراسي الثاني", chapters: [] },
];

const DEFAULT_CHAPTERS = [{ id: "ch1", name: "الوحدة الأولى", lessons: [] }];

function ensureSemesterHasChapters(sem: HierarchySemester): HierarchySemester {
  const chs = sem.chapters ?? [];
  if (chs.length > 0) return sem;
  return { ...sem, chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTERS)) };
}

function ensureSubjectHasSemesters(subj: HierarchySubject): HierarchySubject {
  const sems = (subj.semesters ?? []).map(ensureSemesterHasChapters);
  if (sems.length > 0) return { ...subj, semesters: sems };
  return {
    ...subj,
    semesters: DEFAULT_SEMESTERS.map((s) => ensureSemesterHasChapters(JSON.parse(JSON.stringify(s)))),
  };
}

const HIERARCHY_KEY = "academic_hierarchy";

/** تحويل الهيكل القديم (subjects مباشرة تحت stage) إلى الجديد (grades > subjects) */
function migrateOldToNew(parsed: unknown): HierarchyStage[] {
  const arr = Array.isArray(parsed) ? parsed : [];
  const result: HierarchyStage[] = [];
  for (const stage of arr) {
    const s = stage as Record<string, unknown>;
    if (!s || typeof s !== "object") continue;
    const slug = String(s.slug ?? "");
    const name = String(s.name ?? "");
    const gradesRaw = s.grades;
    if (Array.isArray(gradesRaw) && gradesRaw.length > 0) {
      const grades = (gradesRaw as HierarchyGrade[]).map((g) => ({
        ...g,
        subjects: (g.subjects ?? []).map(ensureSubjectHasSemesters),
      }));
      result.push({ slug, name, grades });
      continue;
    }
    const subjectsRaw = s.subjects;
    if (!Array.isArray(subjectsRaw)) {
      const defaults = GRADE_NAMES[slug];
      const gradeIds = defaults ? Object.keys(defaults) : ["1"];
      const gradeNames = defaults ? Object.values(defaults) : ["الصف الأول"];
      result.push({
        slug,
        name,
        grades: gradeIds.map((id, i) => ({ id, name: gradeNames[i] ?? id, subjects: [] })),
      });
      continue;
    }
    const subjects = (subjectsRaw as HierarchySubject[]).map(ensureSubjectHasSemesters);
    const gradeLabels = GRADE_NAMES[slug];
    const gradeIds = gradeLabels ? Object.keys(gradeLabels) : ["1"];
    const gradeNames = gradeLabels ? Object.values(gradeLabels) : ["الصف الأول"];
    result.push({
      slug,
      name,
      grades: gradeIds.map((id, i) => ({
        id,
        name: gradeNames[i] ?? id,
        subjects: i === 0 ? subjects : subjects.map((sub) => ensureSubjectHasSemesters({ ...sub, semesters: [] })),
      })),
    });
  }
  return result;
}

/**
 * دمج الهيكل المحمّل من DB مع الهيكل الافتراضي (CMS_HIERARCHY).
 * يُضيف أي مادة موجودة في الافتراضي وغير موجودة في المحمّل - لضمان ظهور المواد المضافة مستقبلاً في الفلاتر.
 */
function mergeWithDefaults(loaded: HierarchyStage[]): HierarchyStage[] {
  const result = JSON.parse(JSON.stringify(loaded)) as HierarchyStage[];
  for (const defStage of CMS_HIERARCHY) {
    let stage = result.find((s) => s.slug === defStage.slug);
    if (!stage) {
      stage = { slug: defStage.slug, name: defStage.name, grades: [] };
      result.push(stage);
    }
    for (const defGrade of defStage.grades ?? []) {
      let grade = stage.grades?.find((g) => g.id === defGrade.id);
      if (!grade) {
        grade = { id: defGrade.id, name: defGrade.name, subjects: [] };
        stage.grades = stage.grades ?? [];
        stage.grades.push(grade);
      }
      for (const defSubject of defGrade.subjects ?? []) {
        const exists = grade.subjects?.some((s) => s.slug === defSubject.slug);
        if (!exists) {
          const newSub = ensureSubjectHasSemesters(
            JSON.parse(JSON.stringify(defSubject)) as HierarchySubject
          );
          grade.subjects = grade.subjects ?? [];
          grade.subjects.push(newSub);
        }
      }
    }
  }
  return result;
}

export async function loadHierarchyFromDb(): Promise<HierarchyStage[] | null> {
  try {
    const rows = await db.select().from(platformStats).where(eq(platformStats.key, HIERARCHY_KEY)).limit(1);
    const row = rows[0];
    if (!row?.value) return null;
    const parsed = JSON.parse(row.value) as unknown;
    if (Array.isArray(parsed) && parsed.length > 0) {
      const migrated = migrateOldToNew(parsed);
      return mergeWithDefaults(migrated);
    }
  } catch (e) {
    console.warn("[hierarchyStore] load failed:", (e as Error).message);
  }
  return null;
}

export async function saveHierarchyToDb(hierarchy: HierarchyStage[]): Promise<void> {
  await db
    .insert(platformStats)
    .values({ key: HIERARCHY_KEY, value: JSON.stringify(hierarchy), updatedAt: new Date() })
    .onConflictDoUpdate({
      target: platformStats.key,
      set: { value: JSON.stringify(hierarchy), updatedAt: new Date() },
    });
}

/** تهيئة الهيكلية عند تشغيل السيرفر - تحميل من DB وتحديث الذاكرة */
export async function initHierarchy(): Promise<void> {
  const fromDb = await loadHierarchyFromDb();
  if (fromDb) {
    setCurrentHierarchy(fromDb);
    console.log("[hierarchyStore] Loaded from DB");
  }
}
