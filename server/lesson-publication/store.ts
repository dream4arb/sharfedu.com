import { db, sqlite } from "../db";
import { adminLessonJson } from "@shared/schema";
import { eq } from "drizzle-orm";
import { initialPublicationCatalog, type PublicationCatalog, type PublishedLesson } from "../../shared/seo/publication";
import { validatePublishableLesson } from "../../shared/lesson-engine/publication-package";
import { getLessonFullInfo } from "../data/cms-hierarchy";

export const PACKAGE_KEY = "lesson-publication-v1";
export interface PublicationRecord {
  schemaVersion: 1; revision: number; draft: unknown;
  published: PublishedLesson | null; reviewedBy?: string; reviewedAt?: string;
}
export async function readPublication(id: string) {
  const result = await sqlite.execute({ sql: "SELECT json_data FROM admin_lesson_json WHERE lesson_id=? AND json_key=?", args: [id, PACKAGE_KEY] });
  const raw = result.rows[0]?.json_data as string | undefined;
  if (!raw) return { raw, record: null };
  const record = JSON.parse(raw) as PublicationRecord;
  if (record.schemaVersion !== 1 || !Number.isInteger(record.revision)) throw new Error("Invalid publication record");
  return { raw, record };
}
export async function writePublication(id: string, previousRaw: string | undefined, record: PublicationRecord) {
  // A write transaction gives optimistic concurrency without requiring a production schema migration.
  const transaction = await sqlite.transaction("write");
  try {
    const current = await transaction.execute({ sql: "SELECT id,json_data FROM admin_lesson_json WHERE lesson_id=? AND json_key=?", args: [id, PACKAGE_KEY] });
    if ((current.rows[0]?.json_data as string | undefined) !== previousRaw || current.rows.length > 1) { await transaction.rollback(); return false; }
    const data = JSON.stringify(record), now = Math.floor(Date.now() / 1000);
    if (current.rows.length) await transaction.execute({ sql: "UPDATE admin_lesson_json SET json_data=?,updated_at=? WHERE id=?", args: [data, now, current.rows[0].id as number] });
    else await transaction.execute({ sql: "INSERT INTO admin_lesson_json(lesson_id,json_key,json_data,updated_at) VALUES(?,?,?,?)", args: [id, PACKAGE_KEY, data, now] });
    await transaction.commit();
    return true;
  } finally { transaction.close(); }
}
export async function getPublicationCatalog(): Promise<PublicationCatalog> {
  const catalog = { ...initialPublicationCatalog };
  const rows = await db.select().from(adminLessonJson).where(eq(adminLessonJson.jsonKey, PACKAGE_KEY));
  for (const row of rows) {
    delete catalog[row.lessonId]; // An explicit withdrawn publication also overrides the built-in seed.
    try {
      const record = JSON.parse(row.jsonData) as PublicationRecord;
      const info = getLessonFullInfo(row.lessonId);
      if (record.schemaVersion !== 1 || !record.published || !info) continue;
      const { lesson } = validatePublishableLesson(record.published.lesson);
      const location = record.published.location;
      if (!lesson || lesson.id !== row.lessonId || location.stage !== info.stageSlug || location.grade !== info.gradeId || location.subject !== info.subjectSlug) continue;
      catalog[row.lessonId] = { ...record.published, lesson: { ...lesson, title: info.lessonTitle, stage: info.stageName, grade: info.gradeName, subject: info.subjectName, unit: info.chapterName } };
    } catch { /* Malformed drafts/publications fail closed; retired legacy records are never read. */ }
  }
  return catalog;
}
