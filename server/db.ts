import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";
import path from "path";
import { getDirname } from "./resolve-dir";

const __dirname = getDirname();

// DATABASE_URL من .env. نستخدم مساراً مطلقاً لتجنب SQLITE_READONLY_DBMOVED على السيرفر.
const envDb = process.env.DATABASE_URL?.trim();
let dbUrl: string;
if (envDb?.startsWith("file:")) {
  const p = envDb.slice(5).trim();
  dbUrl = path.isAbsolute(p) ? envDb : `file:${path.resolve(process.cwd(), p)}`;
} else if (envDb && path.isAbsolute(envDb)) {
  dbUrl = `file:${envDb}`;
} else if (envDb) {
  dbUrl = `file:${path.resolve(process.cwd(), envDb)}`;
} else {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL is required in production");
  }
  dbUrl = `file:${path.resolve(process.cwd(), ".local", "sharaf-dev.db")}`;
}

const client = createClient({
  url: dbUrl,
});

export const sqlite = client;
export const db = drizzle(client, { schema });

/** إنشاء جدول رموز استعادة كلمة المرور إن لم يكن موجوداً (يتجنب خطأ 500 عند نسيت كلمة المرور). */
export async function ensurePasswordResetTable(): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER
    )
  `);
}

/**
 * جداول Sharaf 2.0 إضافية فقط. جميع الأوامر idempotent ولا تعدّل أو تحذف
 * الجداول القديمة أو بيانات المستخدمين الموجودة.
 */
export async function ensureLessonEngineTables(): Promise<void> {
  const statements = [
    `CREATE TABLE IF NOT EXISTS lesson_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      session_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      correct INTEGER NOT NULL,
      hints_used INTEGER NOT NULL DEFAULT 0,
      mastery_score INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS lesson_attempts_session_idx
      ON lesson_attempts (session_id, lesson_id)`,
    `CREATE INDEX IF NOT EXISTS lesson_attempts_user_lesson_idx
      ON lesson_attempts (user_id, lesson_id)`,
    `CREATE TABLE IF NOT EXISTS skill_mastery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      attempts INTEGER NOT NULL DEFAULT 0,
      correct_attempts INTEGER NOT NULL DEFAULT 0,
      hints_used INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
      UNIQUE (user_id, lesson_id, skill_id)
    )`,
    `CREATE TABLE IF NOT EXISTS product_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      session_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      question_id TEXT,
      skill_id TEXT,
      step_id TEXT,
      metadata TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`,
    `CREATE INDEX IF NOT EXISTS product_events_lesson_event_idx
      ON product_events (lesson_id, event_name, created_at)`,
    `CREATE INDEX IF NOT EXISTS product_events_session_idx
      ON product_events (session_id, created_at)`,
  ];

  for (const statement of statements) {
    await client.execute(statement);
  }
}
