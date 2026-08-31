import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    // قاعدة التطوير منفصلة افتراضيًا؛ يجب تمرير DATABASE_URL صراحة في البيئات المنشورة.
    url: process.env.DATABASE_URL || "file:.local/sharaf-dev.db",
  },
});
