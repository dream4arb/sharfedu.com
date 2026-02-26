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
  dbUrl = `file:${path.resolve(__dirname, "..", "sqlite.db")}`;
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
