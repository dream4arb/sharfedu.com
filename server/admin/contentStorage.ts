import {
  adminAttachments,
  adminLessonHtml,
  adminLessonJson,
  platformStats,
  users,
} from "@shared/schema";
import { db } from "../db";
import { eq, and } from "drizzle-orm";

export interface AttachmentRow {
  id: number;
  lessonId: string;
  type: "pdf" | "image";
  url: string;
  label: string;
  createdAt: Date;
}

export async function listAttachments(lessonId?: string): Promise<AttachmentRow[]> {
  const rows = lessonId
    ? await db.select().from(adminAttachments).where(eq(adminAttachments.lessonId, lessonId))
    : await db.select().from(adminAttachments);
  return rows as AttachmentRow[];
}

export async function addAttachment(data: {
  lessonId: string;
  type: "pdf" | "image";
  url: string;
  label: string;
}): Promise<AttachmentRow> {
  const [row] = await db
    .insert(adminAttachments)
    .values(data)
    .returning();
  return row as AttachmentRow;
}

export async function deleteAttachment(id: number): Promise<void> {
  await db.delete(adminAttachments).where(eq(adminAttachments.id, id));
}

export async function getLessonHtml(lessonId: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(adminLessonHtml)
    .where(eq(adminLessonHtml.lessonId, lessonId))
    .limit(1);
  return row?.htmlContent ?? null;
}

export async function setLessonHtml(lessonId: string, htmlContent: string): Promise<void> {
  await db
    .insert(adminLessonHtml)
    .values({ lessonId, htmlContent, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: adminLessonHtml.lessonId,
      set: { htmlContent, updatedAt: new Date() },
    });
}

export async function getLessonJson(lessonId: string, jsonKey: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(adminLessonJson)
    .where(
      and(
        eq(adminLessonJson.lessonId, lessonId),
        eq(adminLessonJson.jsonKey, jsonKey)
      )
    )
    .limit(1);
  return rows[0]?.jsonData ?? null;
}

export async function setLessonJson(
  lessonId: string,
  jsonKey: string,
  jsonData: string
): Promise<void> {
  const existing = await db
    .select()
    .from(adminLessonJson)
    .where(
      and(
        eq(adminLessonJson.lessonId, lessonId),
        eq(adminLessonJson.jsonKey, jsonKey)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(adminLessonJson)
      .set({ jsonData, updatedAt: new Date() })
      .where(eq(adminLessonJson.id, existing[0].id));
  } else {
    await db.insert(adminLessonJson).values({ lessonId, jsonKey, jsonData });
  }
}

export async function getPlatformStat(key: string): Promise<string | null> {
  const [row] = await db
    .select()
    .from(platformStats)
    .where(eq(platformStats.key, key))
    .limit(1);
  return row?.value ?? null;
}

export async function setPlatformStat(key: string, value: string): Promise<void> {
  await db
    .insert(platformStats)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: platformStats.key,
      set: { value, updatedAt: new Date() },
    });
}

export async function getStudentCount(): Promise<number> {
  const rows = await db.select().from(users);
  return rows.length;
}

export async function getCompletionRate(): Promise<number> {
  const raw = await getPlatformStat("completion_rate");
  if (raw == null) return 2;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 2;
}
