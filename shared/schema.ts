import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/replit-chat";

// Educational stages/categories
export const educationalStages = sqliteTable("educational_stages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(), // 'elementary', 'middle', 'high', 'paths', 'qudurat'
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description"),
  iconName: text("icon_name"), // lucide icon name
  colorScheme: text("color_scheme"), // e.g., 'sky', 'emerald', 'violet', 'amber', 'rose'
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertEducationalStageSchema = createInsertSchema(educationalStages).omit({ id: true, createdAt: true });
export type InsertEducationalStage = z.infer<typeof insertEducationalStageSchema>;
export type EducationalStage = typeof educationalStages.$inferSelect;

// Grade levels within each stage
export const gradeLevels = sqliteTable("grade_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stageId: integer("stage_id").notNull(),
  slug: text("slug").notNull(), // 'grade-1', 'grade-2', etc.
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  order: integer("order").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertGradeLevelSchema = createInsertSchema(gradeLevels).omit({ id: true, createdAt: true });
export type InsertGradeLevel = z.infer<typeof insertGradeLevelSchema>;
export type GradeLevel = typeof gradeLevels.$inferSelect;

// Subjects
export const subjects = sqliteTable("subjects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(), // 'math', 'science', 'arabic', etc.
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  iconName: text("icon_name"),
  colorScheme: text("color_scheme"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

// Courses (updated to reference new tables)
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  stageSlug: text("stage_slug").notNull(), // 'elementary', 'middle', 'high', 'paths', 'qudurat'
  gradeLevel: text("grade_level").notNull(), // '1', '2', '3', etc.
  subjectSlug: text("subject_slug").notNull(), // 'math', 'science', 'arabic', etc.
  imageUrl: text("image_url").notNull(),
  lessonsCount: integer("lessons_count").default(0),
  duration: text("duration"), // e.g., '10 ساعات'
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertCourseSchema = createInsertSchema(courses).omit({ id: true, createdAt: true });
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

// Lesson Progress Tracking
export const lessonProgress = sqliteTable("lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(), // Reference to user
  subjectSlug: text("subject_slug").notNull(), // e.g., 'math_high1_s2'
  lessonId: text("lesson_id").notNull(), // e.g., '5-1'
  lessonCompleted: integer("lesson_completed", { mode: "boolean" }).default(false),
  videoCompleted: integer("video_completed", { mode: "boolean" }).default(false),
  questionsScore: integer("questions_score").default(0), // 0-100 (percentage)
  questionsProgress: text("questions_progress").default("0"), // Stored as string to handle decimals (0-33.33)
  totalProgress: text("total_progress").default("0"), // Total progress for this lesson (0-100)
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertLessonProgressSchema = createInsertSchema(lessonProgress).omit({ id: true, createdAt: true });
export type InsertLessonProgress = z.infer<typeof insertLessonProgressSchema>;
export type LessonProgress = typeof lessonProgress.$inferSelect;

// Legacy compatibility - keeping old subject field name
export const legacyCourses = sqliteTable("legacy_courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  gradeLevel: text("grade_level").notNull(),
  imageUrl: text("image_url").notNull(),
  subject: text("subject").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin: مرفقات الدروس (PDF، صور)
export const adminAttachments = sqliteTable("admin_attachments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lessonId: text("lesson_id").notNull(),
  type: text("type").notNull(), // 'pdf' | 'image'
  url: text("url").notNull(),
  label: text("label").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin: HTML تعليمي للدروس (يعكس في الموقع فوراً)
export const adminLessonHtml = sqliteTable("admin_lesson_html", {
  lessonId: text("lesson_id").primaryKey(),
  htmlContent: text("html_content").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// Admin: JSON للدروس (أسئلة، هيكل المنهج، إلخ)
export const adminLessonJson = sqliteTable(
  "admin_lesson_json",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonId: text("lesson_id").notNull(),
    jsonKey: text("json_key").notNull(), // 'questions' | 'curriculum' | etc.
    jsonData: text("json_data").notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("admin_lesson_json_lesson_key").on(t.lessonId, t.jsonKey)]
);

// إحصائيات المنصة (نسبة الإنجاز، إلخ)
export const platformStats = sqliteTable("platform_stats", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

// CMS: محتوى الدرس (ربط lesson_id + tab_type بالمحتوى)
export const cmsContent = sqliteTable(
  "cms_content",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    lessonId: text("lesson_id").notNull(),
    tabType: text("tab_type").notNull(), // lesson | video | summary | education | questions
    contentType: text("content_type").notNull(), // pdf | youtube | html | json
    dataValue: text("data_value").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  },
  (t) => [uniqueIndex("cms_content_lesson_tab").on(t.lessonId, t.tabType)]
);

// CMS: بيانات السيو
export const seoData = sqliteTable("seo_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pagePath: text("page_path").notNull().unique(),
  title: text("title"),
  description: text("description"),
  keywords: text("keywords"),
  ogTitle: text("og_title"),
  ogDescription: text("og_description"),
  ogImage: text("og_image"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
