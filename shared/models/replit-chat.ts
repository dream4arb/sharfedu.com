import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/** Replit integrations: محادثات الدردشة */
export const conversations = sqliteTable("replit_conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

/** Replit integrations: رسائل المحادثة */
export const messages = sqliteTable("replit_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
