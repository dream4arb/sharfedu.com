import { courses, lessonProgress, type Course, type InsertCourse, type LessonProgress, type InsertLessonProgress } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getCourses(gradeLevel?: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;
  saveLessonProgress(userId: number, subjectSlug: string, lessonId: string, progress: {
    lessonCompleted?: boolean;
    videoCompleted?: boolean;
    questionsScore?: number;
    questionsProgress?: string;
    totalProgress?: string;
  }): Promise<LessonProgress>;
  getLessonProgress(userId: number, subjectSlug: string, lessonId: string): Promise<LessonProgress | null>;
  getUserProgress(userId: number, subjectSlug?: string): Promise<LessonProgress[]>;
}

export class DatabaseStorage implements IStorage {
  async getCourses(gradeLevel?: string): Promise<Course[]> {
    if (gradeLevel) {
      return await db.select().from(courses).where(eq(courses.gradeLevel, gradeLevel));
    }
    return await db.select().from(courses);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  async saveLessonProgress(
    userId: number,
    subjectSlug: string,
    lessonId: string,
    progress: {
      lessonCompleted?: boolean;
      videoCompleted?: boolean;
      questionsScore?: number;
      questionsProgress?: string;
      totalProgress?: string;
    }
  ): Promise<LessonProgress> {
    // Check if progress exists
    const existing = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.subjectSlug, subjectSlug),
          eq(lessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing
      const [updated] = await db
        .update(lessonProgress)
        .set({
          ...progress,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.subjectSlug, subjectSlug),
            eq(lessonProgress.lessonId, lessonId)
          )
        )
        .returning();
      return updated;
    } else {
      // Create new
      const [newProgress] = await db
        .insert(lessonProgress)
        .values({
          userId,
          subjectSlug,
          lessonId,
          ...progress,
        })
        .returning();
      return newProgress;
    }
  }

  async getLessonProgress(
    userId: number,
    subjectSlug: string,
    lessonId: string
  ): Promise<LessonProgress | null> {
    const result = await db
      .select()
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.userId, userId),
          eq(lessonProgress.subjectSlug, subjectSlug),
          eq(lessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);
    return result[0] || null;
  }

  async getUserProgress(userId: number, subjectSlug?: string): Promise<LessonProgress[]> {
    if (subjectSlug) {
      return await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.subjectSlug, subjectSlug)
          )
        );
    }
    return await db
      .select()
      .from(lessonProgress)
      .where(eq(lessonProgress.userId, userId));
  }
}

export const storage = new DatabaseStorage();
