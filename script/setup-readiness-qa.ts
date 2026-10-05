import { createClient } from "@libsql/client";
import bcrypt from "bcrypt";
import path from "node:path";
import { existsSync } from "node:fs";
// Only schema and the curriculum tree are copied; no real accounts or progress.
const file = path.resolve(".local/readiness-qa.db");
if (existsSync(file)) throw new Error("QA file already exists; refusing to overwrite");
const source = createClient({ url: `file:${path.resolve("sqlite.db")}` });
const target = createClient({ url: `file:${file}` });
const schema = await source.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND sql IS NOT NULL");
for (const row of schema.rows) await target.execute(String(row.sql));
const indexes = await source.execute("SELECT sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL");
for (const row of indexes.rows) await target.execute(String(row.sql));
const hierarchy = await source.execute("SELECT key,value,updated_at FROM platform_stats WHERE key='academic_hierarchy'");
for (const row of hierarchy.rows) await target.execute({ sql: "INSERT INTO platform_stats(key,value,updated_at) VALUES(?,?,?)", args: [row.key, row.value, row.updated_at] as any });
for (const [id, email, role] of [["qa-student", "readiness-student@example.test", "user"], ["qa-editor", "readiness-editor@example.test", "admin"]]) {
  await target.execute({ sql: "INSERT INTO users(id,email,password,role,first_name,last_name,stage_slug,grade_id) VALUES(?,?,?,?,?,?,?,?)", args: [id, email, await bcrypt.hash("Local-Readiness-2026!", 10), role, "اختبار", "تجريبي", "high", "1"] });
}
source.close(); target.close();
console.log("Created isolated QA database: curriculum and test-only accounts, no student data.");
