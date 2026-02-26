import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";

// Session storage table for Express sessions
export const sessions = sqliteTable("sessions", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(), // JSON stored as text in SQLite
  expire: integer("expire", { mode: "timestamp" }).notNull(),
});

// User storage table.
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => randomUUID()),
  email: text("email").unique().notNull(),
  password: text("password"), // Hashed password for local auth
  googleId: text("google_id"), // Google OAuth
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default("user").notNull(), // 'admin' | 'user'
  /** المرحلة الدراسية: elementary | middle | high | paths | qudurat */
  stageSlug: text("stage_slug"),
  /** الصف ضمن المرحلة: 1-6 للابتدائي، 1-3 للمتوسط والثانوي */
  gradeId: text("grade_id"),
  /** قفل البروفايل حتى نهاية السنة - لا يمكن تغيير المرحلة/الصف */
  profileLocked: integer("profile_locked", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// رموز استعادة كلمة المرور (صلاحية 15 دقيقة)
export const passwordResetCodes = sqliteTable("password_reset_codes", {
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
