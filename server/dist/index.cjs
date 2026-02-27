"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/resolve-dir.ts
function getFilename() {
  if (typeof __filename === "string") return __filename;
  if (process.argv[1]) return import_path.default.resolve(process.argv[1]);
  try {
    const metaUrl = import_meta?.url;
    if (metaUrl) return (0, import_url.fileURLToPath)(metaUrl);
  } catch {
  }
  return import_path.default.join(process.cwd(), "index.js");
}
function getDirname() {
  if (typeof __dirname === "string") return __dirname;
  return import_path.default.dirname(getFilename());
}
var import_path, import_url, import_meta;
var init_resolve_dir = __esm({
  "server/resolve-dir.ts"() {
    "use strict";
    import_path = __toESM(require("path"), 1);
    import_url = require("url");
    import_meta = {};
  }
});

// shared/models/auth.ts
var import_sqlite_core, import_crypto, sessions, users, passwordResetCodes;
var init_auth = __esm({
  "shared/models/auth.ts"() {
    "use strict";
    import_sqlite_core = require("drizzle-orm/sqlite-core");
    import_crypto = require("crypto");
    sessions = (0, import_sqlite_core.sqliteTable)("sessions", {
      sid: (0, import_sqlite_core.text)("sid").primaryKey(),
      sess: (0, import_sqlite_core.text)("sess").notNull(),
      // JSON stored as text in SQLite
      expire: (0, import_sqlite_core.integer)("expire", { mode: "timestamp" }).notNull()
    });
    users = (0, import_sqlite_core.sqliteTable)("users", {
      id: (0, import_sqlite_core.text)("id").primaryKey().$defaultFn(() => (0, import_crypto.randomUUID)()),
      email: (0, import_sqlite_core.text)("email").unique().notNull(),
      password: (0, import_sqlite_core.text)("password"),
      // Hashed password for local auth
      googleId: (0, import_sqlite_core.text)("google_id"),
      // Google OAuth
      firstName: (0, import_sqlite_core.text)("first_name"),
      lastName: (0, import_sqlite_core.text)("last_name"),
      profileImageUrl: (0, import_sqlite_core.text)("profile_image_url"),
      role: (0, import_sqlite_core.text)("role").default("user").notNull(),
      // 'admin' | 'user'
      /** المرحلة الدراسية: elementary | middle | high | paths | qudurat */
      stageSlug: (0, import_sqlite_core.text)("stage_slug"),
      /** الصف ضمن المرحلة: 1-6 للابتدائي، 1-3 للمتوسط والثانوي */
      gradeId: (0, import_sqlite_core.text)("grade_id"),
      /** قفل البروفايل حتى نهاية السنة - لا يمكن تغيير المرحلة/الصف */
      profileLocked: (0, import_sqlite_core.integer)("profile_locked", { mode: "boolean" }).default(false),
      createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      updatedAt: (0, import_sqlite_core.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    passwordResetCodes = (0, import_sqlite_core.sqliteTable)("password_reset_codes", {
      email: (0, import_sqlite_core.text)("email").notNull(),
      code: (0, import_sqlite_core.text)("code").notNull(),
      expiresAt: (0, import_sqlite_core.integer)("expires_at", { mode: "timestamp" }).notNull(),
      createdAt: (0, import_sqlite_core.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
  }
});

// shared/models/replit-chat.ts
var import_sqlite_core2, conversations, messages;
var init_replit_chat = __esm({
  "shared/models/replit-chat.ts"() {
    "use strict";
    import_sqlite_core2 = require("drizzle-orm/sqlite-core");
    conversations = (0, import_sqlite_core2.sqliteTable)("replit_conversations", {
      id: (0, import_sqlite_core2.integer)("id").primaryKey({ autoIncrement: true }),
      title: (0, import_sqlite_core2.text)("title").notNull(),
      createdAt: (0, import_sqlite_core2.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    messages = (0, import_sqlite_core2.sqliteTable)("replit_messages", {
      id: (0, import_sqlite_core2.integer)("id").primaryKey({ autoIncrement: true }),
      conversationId: (0, import_sqlite_core2.integer)("conversation_id").notNull(),
      role: (0, import_sqlite_core2.text)("role").notNull(),
      content: (0, import_sqlite_core2.text)("content").notNull(),
      createdAt: (0, import_sqlite_core2.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
  }
});

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminAttachments: () => adminAttachments,
  adminLessonHtml: () => adminLessonHtml,
  adminLessonJson: () => adminLessonJson,
  cmsContent: () => cmsContent,
  conversations: () => conversations,
  courses: () => courses,
  educationalStages: () => educationalStages,
  gradeLevels: () => gradeLevels,
  insertCourseSchema: () => insertCourseSchema,
  insertEducationalStageSchema: () => insertEducationalStageSchema,
  insertGradeLevelSchema: () => insertGradeLevelSchema,
  insertLessonProgressSchema: () => insertLessonProgressSchema,
  insertSubjectSchema: () => insertSubjectSchema,
  legacyCourses: () => legacyCourses,
  lessonProgress: () => lessonProgress,
  messages: () => messages,
  passwordResetCodes: () => passwordResetCodes,
  platformStats: () => platformStats,
  seoData: () => seoData,
  sessions: () => sessions,
  subjects: () => subjects,
  users: () => users
});
var import_sqlite_core3, import_drizzle_zod, educationalStages, insertEducationalStageSchema, gradeLevels, insertGradeLevelSchema, subjects, insertSubjectSchema, courses, insertCourseSchema, lessonProgress, insertLessonProgressSchema, legacyCourses, adminAttachments, adminLessonHtml, adminLessonJson, platformStats, cmsContent, seoData;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    import_sqlite_core3 = require("drizzle-orm/sqlite-core");
    import_drizzle_zod = require("drizzle-zod");
    init_auth();
    init_replit_chat();
    educationalStages = (0, import_sqlite_core3.sqliteTable)("educational_stages", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      slug: (0, import_sqlite_core3.text)("slug").notNull().unique(),
      // 'elementary', 'middle', 'high', 'paths', 'qudurat'
      nameAr: (0, import_sqlite_core3.text)("name_ar").notNull(),
      nameEn: (0, import_sqlite_core3.text)("name_en").notNull(),
      description: (0, import_sqlite_core3.text)("description"),
      iconName: (0, import_sqlite_core3.text)("icon_name"),
      // lucide icon name
      colorScheme: (0, import_sqlite_core3.text)("color_scheme"),
      // e.g., 'sky', 'emerald', 'violet', 'amber', 'rose'
      order: (0, import_sqlite_core3.integer)("order").default(0),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertEducationalStageSchema = (0, import_drizzle_zod.createInsertSchema)(educationalStages).omit({ id: true, createdAt: true });
    gradeLevels = (0, import_sqlite_core3.sqliteTable)("grade_levels", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      stageId: (0, import_sqlite_core3.integer)("stage_id").notNull(),
      slug: (0, import_sqlite_core3.text)("slug").notNull(),
      // 'grade-1', 'grade-2', etc.
      nameAr: (0, import_sqlite_core3.text)("name_ar").notNull(),
      nameEn: (0, import_sqlite_core3.text)("name_en").notNull(),
      order: (0, import_sqlite_core3.integer)("order").default(0),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertGradeLevelSchema = (0, import_drizzle_zod.createInsertSchema)(gradeLevels).omit({ id: true, createdAt: true });
    subjects = (0, import_sqlite_core3.sqliteTable)("subjects", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      slug: (0, import_sqlite_core3.text)("slug").notNull(),
      // 'math', 'science', 'arabic', etc.
      nameAr: (0, import_sqlite_core3.text)("name_ar").notNull(),
      nameEn: (0, import_sqlite_core3.text)("name_en").notNull(),
      iconName: (0, import_sqlite_core3.text)("icon_name"),
      colorScheme: (0, import_sqlite_core3.text)("color_scheme"),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertSubjectSchema = (0, import_drizzle_zod.createInsertSchema)(subjects).omit({ id: true, createdAt: true });
    courses = (0, import_sqlite_core3.sqliteTable)("courses", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      title: (0, import_sqlite_core3.text)("title").notNull(),
      description: (0, import_sqlite_core3.text)("description").notNull(),
      stageSlug: (0, import_sqlite_core3.text)("stage_slug").notNull(),
      // 'elementary', 'middle', 'high', 'paths', 'qudurat'
      gradeLevel: (0, import_sqlite_core3.text)("grade_level").notNull(),
      // '1', '2', '3', etc.
      subjectSlug: (0, import_sqlite_core3.text)("subject_slug").notNull(),
      // 'math', 'science', 'arabic', etc.
      imageUrl: (0, import_sqlite_core3.text)("image_url").notNull(),
      lessonsCount: (0, import_sqlite_core3.integer)("lessons_count").default(0),
      duration: (0, import_sqlite_core3.text)("duration"),
      // e.g., '10 ساعات'
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertCourseSchema = (0, import_drizzle_zod.createInsertSchema)(courses).omit({ id: true, createdAt: true });
    lessonProgress = (0, import_sqlite_core3.sqliteTable)("lesson_progress", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      userId: (0, import_sqlite_core3.integer)("user_id").notNull(),
      // Reference to user
      subjectSlug: (0, import_sqlite_core3.text)("subject_slug").notNull(),
      // e.g., 'math_high1_s2'
      lessonId: (0, import_sqlite_core3.text)("lesson_id").notNull(),
      // e.g., '5-1'
      lessonCompleted: (0, import_sqlite_core3.integer)("lesson_completed", { mode: "boolean" }).default(false),
      videoCompleted: (0, import_sqlite_core3.integer)("video_completed", { mode: "boolean" }).default(false),
      questionsScore: (0, import_sqlite_core3.integer)("questions_score").default(0),
      // 0-100 (percentage)
      questionsProgress: (0, import_sqlite_core3.text)("questions_progress").default("0"),
      // Stored as string to handle decimals (0-33.33)
      totalProgress: (0, import_sqlite_core3.text)("total_progress").default("0"),
      // Total progress for this lesson (0-100)
      updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    insertLessonProgressSchema = (0, import_drizzle_zod.createInsertSchema)(lessonProgress).omit({ id: true, createdAt: true });
    legacyCourses = (0, import_sqlite_core3.sqliteTable)("legacy_courses", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      title: (0, import_sqlite_core3.text)("title").notNull(),
      description: (0, import_sqlite_core3.text)("description").notNull(),
      gradeLevel: (0, import_sqlite_core3.text)("grade_level").notNull(),
      imageUrl: (0, import_sqlite_core3.text)("image_url").notNull(),
      subject: (0, import_sqlite_core3.text)("subject").notNull(),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    adminAttachments = (0, import_sqlite_core3.sqliteTable)("admin_attachments", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      lessonId: (0, import_sqlite_core3.text)("lesson_id").notNull(),
      type: (0, import_sqlite_core3.text)("type").notNull(),
      // 'pdf' | 'image'
      url: (0, import_sqlite_core3.text)("url").notNull(),
      label: (0, import_sqlite_core3.text)("label").notNull(),
      createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    adminLessonHtml = (0, import_sqlite_core3.sqliteTable)("admin_lesson_html", {
      lessonId: (0, import_sqlite_core3.text)("lesson_id").primaryKey(),
      htmlContent: (0, import_sqlite_core3.text)("html_content").notNull(),
      updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    adminLessonJson = (0, import_sqlite_core3.sqliteTable)(
      "admin_lesson_json",
      {
        id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
        lessonId: (0, import_sqlite_core3.text)("lesson_id").notNull(),
        jsonKey: (0, import_sqlite_core3.text)("json_key").notNull(),
        // 'questions' | 'curriculum' | etc.
        jsonData: (0, import_sqlite_core3.text)("json_data").notNull(),
        updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
      },
      (t) => [(0, import_sqlite_core3.uniqueIndex)("admin_lesson_json_lesson_key").on(t.lessonId, t.jsonKey)]
    );
    platformStats = (0, import_sqlite_core3.sqliteTable)("platform_stats", {
      key: (0, import_sqlite_core3.text)("key").primaryKey(),
      value: (0, import_sqlite_core3.text)("value").notNull(),
      updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
    cmsContent = (0, import_sqlite_core3.sqliteTable)(
      "cms_content",
      {
        id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
        lessonId: (0, import_sqlite_core3.text)("lesson_id").notNull(),
        tabType: (0, import_sqlite_core3.text)("tab_type").notNull(),
        // lesson | video | summary | education | questions
        contentType: (0, import_sqlite_core3.text)("content_type").notNull(),
        // pdf | youtube | html | json
        dataValue: (0, import_sqlite_core3.text)("data_value").notNull(),
        createdAt: (0, import_sqlite_core3.integer)("created_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date()),
        updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
      },
      (t) => [(0, import_sqlite_core3.uniqueIndex)("cms_content_lesson_tab").on(t.lessonId, t.tabType)]
    );
    seoData = (0, import_sqlite_core3.sqliteTable)("seo_data", {
      id: (0, import_sqlite_core3.integer)("id").primaryKey({ autoIncrement: true }),
      pagePath: (0, import_sqlite_core3.text)("page_path").notNull().unique(),
      title: (0, import_sqlite_core3.text)("title"),
      description: (0, import_sqlite_core3.text)("description"),
      keywords: (0, import_sqlite_core3.text)("keywords"),
      ogTitle: (0, import_sqlite_core3.text)("og_title"),
      ogDescription: (0, import_sqlite_core3.text)("og_description"),
      ogImage: (0, import_sqlite_core3.text)("og_image"),
      updatedAt: (0, import_sqlite_core3.integer)("updated_at", { mode: "timestamp" }).$defaultFn(() => /* @__PURE__ */ new Date())
    });
  }
});

// server/db.ts
async function ensurePasswordResetTable() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER
    )
  `);
}
var import_libsql, import_client, import_path3, __dirname3, envDb, dbUrl, client, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    import_libsql = require("drizzle-orm/libsql");
    import_client = require("@libsql/client");
    init_schema();
    import_path3 = __toESM(require("path"), 1);
    init_resolve_dir();
    __dirname3 = getDirname();
    envDb = process.env.DATABASE_URL?.trim();
    if (envDb?.startsWith("file:")) {
      const p = envDb.slice(5).trim();
      dbUrl = import_path3.default.isAbsolute(p) ? envDb : `file:${import_path3.default.resolve(process.cwd(), p)}`;
    } else if (envDb && import_path3.default.isAbsolute(envDb)) {
      dbUrl = `file:${envDb}`;
    } else if (envDb) {
      dbUrl = `file:${import_path3.default.resolve(process.cwd(), envDb)}`;
    } else {
      dbUrl = `file:${import_path3.default.resolve(__dirname3, "..", "sqlite.db")}`;
    }
    client = (0, import_client.createClient)({
      url: dbUrl
    });
    db = (0, import_libsql.drizzle)(client, { schema: schema_exports });
  }
});

// server/data/cms-hierarchy.ts
var cms_hierarchy_exports = {};
__export(cms_hierarchy_exports, {
  CMS_HIERARCHY: () => CMS_HIERARCHY,
  GRADE_NAMES: () => GRADE_NAMES,
  STAGE_NAMES: () => STAGE_NAMES,
  getAllLessons: () => getAllLessons,
  getAllSeoPaths: () => getAllSeoPaths,
  getChapters: () => getChapters,
  getDisplayStructure: () => getDisplayStructure,
  getFullHierarchy: () => getFullHierarchy,
  getGrades: () => getGrades,
  getLessonFullInfo: () => getLessonFullInfo,
  getLessons: () => getLessons,
  getSemesters: () => getSemesters,
  getStages: () => getStages,
  getSubjects: () => getSubjects,
  lessonIdExists: () => lessonIdExists,
  setCurrentHierarchy: () => setCurrentHierarchy
});
function setCurrentHierarchy(h) {
  currentHierarchy = h;
}
function getHierarchy() {
  return currentHierarchy ?? CMS_HIERARCHY;
}
function getStages() {
  return getHierarchy().map((s) => ({ slug: s.slug, name: s.name }));
}
function getGrades(stageSlug) {
  const normalized = getFullHierarchy();
  const stage = normalized.find((s) => s.slug === stageSlug);
  const grades = stage?.grades ?? [];
  return grades.map((g) => ({ id: g.id, name: g.name }));
}
function getSubjects(stageSlug, gradeId) {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  return grade?.subjects.map((sub) => ({ slug: sub.slug, name: sub.name })) ?? [];
}
function getSemesters(stageSlug, gradeId, subjectSlug) {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  return subject?.semesters.map((sem) => ({ id: sem.id, name: sem.name })) ?? [];
}
function getChapters(stageSlug, gradeId, subjectSlug, semesterId) {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  const semester = subject?.semesters.find((s) => s.id === semesterId);
  return semester?.chapters.map((ch) => ({ id: ch.id, name: ch.name })) ?? [];
}
function getLessons(stageSlug, gradeId, subjectSlug, semesterId, chapterId) {
  const stage = getHierarchy().find((s) => s.slug === stageSlug);
  const grade = stage?.grades?.find((g) => g.id === gradeId);
  const subject = grade?.subjects.find((s) => s.slug === subjectSlug);
  const semester = subject?.semesters.find((s) => s.id === semesterId);
  const chapter = semester?.chapters.find((c) => c.id === chapterId);
  return chapter?.lessons ?? [];
}
function ensureSemesterHasChapters(semester) {
  const chs = semester.chapters ?? [];
  if (chs.length > 0) return semester;
  return { ...semester, chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTERS)) };
}
function ensureSubjectHasSemesters(subject) {
  const sems = (subject.semesters ?? []).map(ensureSemesterHasChapters);
  if (sems.length > 0) return { ...subject, semesters: sems };
  return {
    ...subject,
    semesters: DEFAULT_SEMESTERS.map((s) => ensureSemesterHasChapters(JSON.parse(JSON.stringify(s))))
  };
}
function ensureStageHasGrades(stage) {
  const slug = String(stage.slug ?? "");
  const name = String(stage.name ?? "");
  const gradesRaw = stage.grades;
  if (Array.isArray(gradesRaw) && gradesRaw.length > 0) {
    const grades = gradesRaw.map((g) => ({
      ...g,
      subjects: (g.subjects ?? []).map(ensureSubjectHasSemesters)
    }));
    return { slug, name, grades };
  }
  const subjectsRaw = stage.subjects;
  if (!Array.isArray(subjectsRaw)) {
    const defs2 = GRADE_NAMES[slug];
    const ids2 = defs2 ? Object.keys(defs2) : ["1"];
    const names2 = defs2 ? Object.values(defs2) : ["\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644"];
    return { slug, name, grades: ids2.map((id, i) => ({ id, name: names2[i] ?? id, subjects: [] })) };
  }
  const subjects2 = subjectsRaw.map(ensureSubjectHasSemesters);
  const defs = GRADE_NAMES[slug];
  const ids = defs ? Object.keys(defs) : ["1"];
  const names = defs ? Object.values(defs) : ["\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644"];
  return {
    slug,
    name,
    grades: ids.map((id, i) => ({
      id,
      name: names[i] ?? id,
      subjects: i === 0 ? subjects2 : subjects2.map((s) => ensureSubjectHasSemesters({ ...s, semesters: [] }))
    }))
  };
}
function getFullHierarchy() {
  const raw = getHierarchy();
  return raw.map((s) => ensureStageHasGrades(s));
}
function getAllLessons() {
  const result = [];
  for (const stage of getHierarchy()) {
    const grades = stage.grades ?? [];
    for (const grade of grades) {
      for (const subject of grade.subjects) {
        for (const semester of subject.semesters) {
          for (const chapter of semester.chapters) {
            for (const lesson of chapter.lessons) {
              result.push({
                lessonId: lesson.id,
                title: lesson.title,
                stage: stage.name,
                gradeId: grade.id,
                gradeName: grade.name,
                subject: subject.name,
                stageSlug: stage.slug,
                subjectSlug: subject.slug,
                semesterId: semester.id,
                semesterName: semester.name,
                chapterId: chapter.id,
                chapterName: chapter.name,
                path: `${stage.name} > ${grade.name} > ${subject.name} > ${semester.name} > ${chapter.name} > ${lesson.title}`
              });
            }
          }
        }
      }
    }
  }
  return result;
}
function getAllSeoPaths() {
  const staticPaths = [
    { value: "/", label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", searchText: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629", type: "general", group: "\u0635\u0641\u062D\u0627\u062A \u0639\u0627\u0645\u0629" },
    { value: "/login", label: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 / \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628", searchText: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0646\u0634\u0627\u0621 \u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644", type: "general", group: "\u0635\u0641\u062D\u0627\u062A \u0639\u0627\u0645\u0629" },
    { value: "/about", label: "\u0645\u0646 \u0646\u062D\u0646", searchText: "\u0645\u0646 \u0646\u062D\u0646 \u0639\u0646 \u0627\u0644\u0645\u0648\u0642\u0639", type: "general", group: "\u0635\u0641\u062D\u0627\u062A \u0639\u0627\u0645\u0629" },
    { value: "/dashboard", label: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645", searchText: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645", type: "general", group: "\u0635\u0641\u062D\u0627\u062A \u0639\u0627\u0645\u0629" },
    { value: "/admin", label: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629", searchText: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062F\u064A\u0631", type: "general", group: "\u0635\u0641\u062D\u0627\u062A \u0639\u0627\u0645\u0629" },
    { value: "/stage/elementary", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629", searchText: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629 \u0627\u0628\u062A\u062F\u0627\u0626\u064A", type: "stage", group: "\u0627\u0644\u0645\u0631\u0627\u062D\u0644" },
    { value: "/stage/middle", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629", searchText: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629 \u0645\u062A\u0648\u0633\u0637 \u0623\u0648\u0644 \u0645\u062A\u0648\u0633\u0637 \u062B\u0627\u0646\u064A \u0645\u062A\u0648\u0633\u0637", type: "stage", group: "\u0627\u0644\u0645\u0631\u0627\u062D\u0644" },
    { value: "/stage/high", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629", searchText: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u062B\u0627\u0646\u0648\u064A \u0623\u0648\u0644 \u062B\u0627\u0646\u0648\u064A \u062B\u0627\u0646\u064A \u062B\u0627\u0646\u0648\u064A", type: "stage", group: "\u0627\u0644\u0645\u0631\u0627\u062D\u0644" },
    { value: "/lesson/elementary/math", label: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A - \u0627\u0628\u062A\u062F\u0627\u0626\u064A", searchText: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0627\u0628\u062A\u062F\u0627\u0626\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629", type: "lesson", group: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A" },
    { value: "/lesson/middle/math", label: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A - \u0645\u062A\u0648\u0633\u0637", searchText: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629 \u0623\u0648\u0644 \u0645\u062A\u0648\u0633\u0637", type: "lesson", group: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A" },
    { value: "/lesson/high/math", label: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A - \u062B\u0627\u0646\u0648\u064A", searchText: "\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u062B\u0627\u0646\u0648\u064A \u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u0623\u0648\u0644 \u062B\u0627\u0646\u0648\u064A", type: "lesson", group: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A" }
  ];
  const lessons = getAllLessons();
  const lessonPaths = lessons.map((l) => {
    const shortLabel = `${l.title} \u2014 ${l.subject} (${l.gradeName} ${l.stage})`;
    const searchText = [l.title, l.subject, l.stage, l.gradeName, l.semesterName, l.chapterName].filter(Boolean).join(" ");
    return {
      value: `/lesson/${l.stageSlug}/${l.subjectSlug}/${l.lessonId}`,
      label: shortLabel,
      searchText,
      type: "lesson",
      group: l.subject
    };
  });
  return [...staticPaths, ...lessonPaths];
}
function getDisplayStructure() {
  const out = {};
  for (const stage of getFullHierarchy()) {
    const grades = stage.grades ?? [];
    for (const grade of grades) {
      for (const subject of grade.subjects) {
        const key = `${stage.slug}_${subject.slug}`;
        if (out[key]) continue;
        out[key] = {
          semesters: (subject.semesters ?? []).map((s) => ({
            id: s.id,
            name: s.name,
            chapters: (s.chapters ?? []).map((ch) => ({
              id: ch.id,
              name: ch.name,
              number: ch.number,
              lessons: (ch.lessons ?? []).map((l) => ({ id: l.id, title: l.title }))
            }))
          }))
        };
      }
    }
  }
  return out;
}
function lessonIdExists(lessonId) {
  return getAllLessons().some((l) => l.lessonId === lessonId);
}
function getLessonFullInfo(lessonId) {
  const all = getAllLessons();
  const found = all.find((l) => l.lessonId === lessonId);
  if (!found) return null;
  return {
    stageSlug: found.stageSlug,
    stageName: found.stage,
    gradeId: found.gradeId,
    gradeName: found.gradeName,
    subjectSlug: found.subjectSlug,
    subjectName: found.subject,
    semesterId: found.semesterId,
    semesterName: found.semesterName ?? "\u2014",
    chapterId: found.chapterId,
    chapterName: found.chapterName ?? "\u2014",
    lessonTitle: found.title
  };
}
var STAGE_NAMES, currentHierarchy, GRADE_NAMES, CMS_HIERARCHY, DEFAULT_SEMESTERS, DEFAULT_CHAPTERS;
var init_cms_hierarchy = __esm({
  "server/data/cms-hierarchy.ts"() {
    "use strict";
    STAGE_NAMES = {
      elementary: "\u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629",
      middle: "\u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629",
      high: "\u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629",
      paths: "\u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A",
      qudurat: "\u0627\u0644\u0642\u062F\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A"
    };
    currentHierarchy = null;
    GRADE_NAMES = {
      elementary: { "1": "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644", "2": "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A", "3": "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B", "4": "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639", "5": "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633", "6": "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633" },
      middle: { "1": "\u0623\u0648\u0644 \u0645\u062A\u0648\u0633\u0637", "2": "\u062B\u0627\u0646\u064A \u0645\u062A\u0648\u0633\u0637", "3": "\u062B\u0627\u0644\u062B \u0645\u062A\u0648\u0633\u0637" },
      high: { "1": "\u0623\u0648\u0644 \u062B\u0627\u0646\u0648\u064A", "2": "\u062B\u0627\u0646\u064A \u062B\u0627\u0646\u0648\u064A", "3": "\u062B\u0627\u0644\u062B \u062B\u0627\u0646\u0648\u064A" },
      paths: { general: "\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0627\u0645" },
      qudurat: { general: "\u0627\u0644\u0642\u062F\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A" }
    };
    CMS_HIERARCHY = [
      {
        slug: "elementary",
        name: "\u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629",
        grades: [
          { id: "1", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0627\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "2", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0646\u064A", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0627\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "3", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062B\u0627\u0644\u062B", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0627\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "4", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0631\u0627\u0628\u0639", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0625\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "5", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u062E\u0627\u0645\u0633", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "quran", name: "\u062A\u0644\u0627\u0648\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0648\u062A\u062C\u0648\u064A\u062F\u0647", semesters: [] }, { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0625\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "6", name: "\u0627\u0644\u0635\u0641 \u0627\u0644\u0633\u0627\u062F\u0633", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "quran", name: "\u062A\u0644\u0627\u0648\u0629 \u0627\u0644\u0642\u0631\u0622\u0646 \u0648\u062A\u062C\u0648\u064A\u062F\u0647", semesters: [] }, { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "english", name: "\u0625\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] }
        ]
      },
      {
        slug: "middle",
        name: "\u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629",
        grades: [
          {
            id: "1",
            name: "\u0623\u0648\u0644 \u0645\u062A\u0648\u0633\u0637",
            subjects: [
              {
                slug: "math",
                name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A",
                semesters: [
                  { id: "s1", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0623\u0648\u0644", chapters: [{ id: "ch1", name: "\u0627\u0644\u0641\u0635\u0644 1", lessons: [{ id: "1", title: "\u0645\u0642\u062F\u0645\u0629 \u0641\u064A \u0627\u0644\u0623\u0639\u062F\u0627\u062F" }, { id: "2", title: "\u0627\u0644\u062C\u0645\u0639 \u0648\u0627\u0644\u0637\u0631\u062D" }, { id: "3", title: "\u0627\u0644\u0636\u0631\u0628 \u0648\u0627\u0644\u0642\u0633\u0645\u0629" }] }] },
                  {
                    id: "s2",
                    name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062B\u0627\u0646\u064A",
                    chapters: [
                      { id: "ch4", name: "\u0627\u0644\u0646\u0633\u0628\u0629 \u0648\u0627\u0644\u062A\u0646\u0627\u0633\u0628", lessons: [
                        { id: "m1-4-1", title: "\u0627\u0644\u0646\u0633\u0628\u0629" },
                        { id: "m1-4-2", title: "\u0627\u0644\u0645\u0639\u062F\u0644" },
                        { id: "m1-4-3", title: "\u0627\u0644\u0642\u064A\u0627\u0633: \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u064A\u0646 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629" },
                        { id: "m1-4-4", title: "\u0627\u0644\u0642\u064A\u0627\u0633: \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u064A\u0646 \u0627\u0644\u0648\u062D\u062F\u0627\u062A \u0627\u0644\u0645\u062A\u0631\u064A\u0629" },
                        { id: "m1-4-5", title: "\u0627\u0644\u062C\u0628\u0631: \u062D\u0644 \u0627\u0644\u062A\u0646\u0627\u0633\u0628\u0627\u062A" },
                        { id: "m1-4-6", title: "\u0627\u0644\u0631\u0633\u0645" },
                        { id: "m1-4-7", title: "\u0645\u0642\u064A\u0627\u0633 \u0627\u0644\u0631\u0633\u0645" },
                        { id: "m1-4-8", title: "\u0627\u0644\u0643\u0633\u0648\u0631 \u0648\u0627\u0644\u0646\u0633\u0628 \u0627\u0644\u0645\u0626\u0648\u064A\u0629" }
                      ] },
                      { id: "ch5", name: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629", lessons: [
                        { id: "m1-5-1", title: "\u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629 \u0645\u0646 \u0639\u062F\u062F" },
                        { id: "m1-5-2", title: "\u062A\u0642\u062F\u064A\u0631 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629" },
                        { id: "m1-5-3", title: "\u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0642\u0648\u0644\u064A\u0629 \u0627\u0644\u0625\u062C\u0627\u0628\u0629" },
                        { id: "m1-5-4", title: "\u0627\u0644\u062A\u0646\u0627\u0633\u0628 \u0627\u0644\u0645\u0626\u0648\u064A" },
                        { id: "m1-5-5", title: "\u062A\u0637\u0628\u064A\u0642\u0627\u062A \u0639\u0644\u0649 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0626\u0648\u064A\u0629" }
                      ] },
                      { id: "ch6", name: "\u0627\u0644\u0625\u062D\u0635\u0627\u0621", lessons: [
                        { id: "m1-6-1", title: "\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0628\u0627\u0644\u0646\u0642\u0627\u0637" },
                        { id: "m1-6-2", title: "\u0645\u0642\u0627\u064A\u064A\u0633 \u0627\u0644\u0646\u0632\u0639\u0629 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629 \u0648\u0627\u0644\u0645\u062F\u0649" },
                        { id: "m1-6-3", title: "\u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0628\u0627\u0644\u0623\u0639\u0645\u062F\u0629 \u0648\u0627\u0644\u0645\u062F\u0631\u062C\u0627\u062A \u0627\u0644\u062A\u0643\u0631\u0627\u0631\u064A\u0629" },
                        { id: "m1-6-4", title: "\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u062A\u0645\u062B\u064A\u0644\u0627\u062A \u0627\u0644\u0628\u064A\u0627\u0646\u064A\u0629 \u0644\u0644\u062A\u0646\u0628\u0624" },
                        { id: "m1-6-5", title: "\u0627\u0633\u062A\u0639\u0645\u0627\u0644 \u0627\u0644\u062A\u0645\u062B\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u064A" }
                      ] }
                    ]
                  }
                ]
              },
              { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] },
              { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] },
              { slug: "english", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", semesters: [] },
              { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] },
              { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] },
              { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] },
              { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] },
              { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] },
              { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] },
              { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }
            ]
          },
          { id: "2", name: "\u062B\u0627\u0646\u064A \u0645\u062A\u0648\u0633\u0637", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "english", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", semesters: [] }, { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "3", name: "\u062B\u0627\u0644\u062B \u0645\u062A\u0648\u0633\u0637", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645", semesters: [] }, { slug: "arabic", name: "\u0644\u063A\u062A\u064A", semesters: [] }, { slug: "english", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", semesters: [] }, { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "tajweed", name: "\u0627\u0644\u062A\u062C\u0648\u064A\u062F", semesters: [] }, { slug: "islamic", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629", semesters: [] }, { slug: "critical", name: "\u0627\u0644\u062A\u0641\u0643\u064A\u0631 \u0627\u0644\u0646\u0627\u0642\u062F", semesters: [] }, { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] }, { slug: "family", name: "\u0627\u0644\u0623\u0633\u0631\u064A\u0629", semesters: [] }, { slug: "art", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] }
        ]
      },
      {
        slug: "high",
        name: "\u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629",
        grades: [
          {
            id: "1",
            name: "\u0623\u0648\u0644 \u062B\u0627\u0646\u0648\u064A",
            subjects: [
              {
                slug: "math",
                name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A",
                semesters: [
                  { id: "s1", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0623\u0648\u0644", chapters: [
                    { id: "ch1", name: "\u0627\u0644\u062A\u0628\u0631\u064A\u0631 \u0648\u0627\u0644\u0628\u0631\u0647\u0627\u0646", lessons: [{ id: "intro-1", title: "\u0627\u0644\u062A\u0647\u064A\u0626\u0629" }, { id: "1-1", title: "\u0627\u0644\u062A\u0628\u0631\u064A\u0631 \u0627\u0644\u0627\u0633\u062A\u0642\u0631\u0627\u0626\u064A \u0648\u0627\u0644\u062A\u062E\u0645\u064A\u0646" }, { id: "1-2", title: "\u0627\u0644\u0645\u0646\u0637\u0642" }, { id: "1-3", title: "\u0627\u0644\u0639\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0634\u0631\u0637\u064A\u0629" }] },
                    { id: "ch2", name: "\u0627\u0644\u062A\u0648\u0627\u0632\u064A \u0648\u0627\u0644\u062A\u0639\u0627\u0645\u062F", lessons: [] },
                    { id: "ch3", name: "\u0627\u0644\u0645\u062B\u0644\u062B\u0627\u062A \u0627\u0644\u0645\u062A\u0637\u0627\u0628\u0642\u0629", lessons: [] },
                    { id: "ch4", name: "\u0627\u0644\u0639\u0644\u0627\u0642\u0627\u062A \u0641\u064A \u0627\u0644\u0645\u062B\u0644\u062B", lessons: [] }
                  ] },
                  { id: "s2", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062B\u0627\u0646\u064A", chapters: [
                    { id: "ch5", name: "\u0627\u0644\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u0631\u0628\u0627\u0639\u064A\u0629", lessons: [{ id: "5-1", title: "\u0632\u0648\u0627\u064A\u0627 \u0627\u0644\u0645\u0636\u0644\u0639" }, { id: "5-2", title: "\u0645\u062A\u0648\u0627\u0632\u064A \u0627\u0644\u0623\u0636\u0644\u0627\u0639" }, { id: "5-3", title: "\u062A\u0645\u064A\u064A\u0632 \u0645\u062A\u0648\u0627\u0632\u064A \u0627\u0644\u0623\u0636\u0644\u0627\u0639" }] },
                    { id: "ch6", name: "\u0627\u0644\u062A\u0634\u0627\u0628\u0647", lessons: [{ id: "6-1", title: "\u0627\u0644\u0645\u0636\u0644\u0639\u0627\u062A \u0627\u0644\u0645\u062A\u0634\u0627\u0628\u0647\u0629" }, { id: "6-2", title: "\u0627\u0644\u0645\u062B\u0644\u062B\u0627\u062A \u0627\u0644\u0645\u062A\u0634\u0627\u0628\u0647\u0629" }] },
                    { id: "ch7", name: "\u0627\u0644\u062A\u062D\u0648\u064A\u0644\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0627\u062B\u0644", lessons: [] },
                    { id: "ch8", name: "\u0627\u0644\u062F\u0627\u0626\u0631\u0629", lessons: [] }
                  ] }
                ]
              },
              { slug: "physics", name: "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621", semesters: [] },
              { slug: "arabic", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", semesters: [] },
              { slug: "english", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", semesters: [] },
              { slug: "hadith", name: "\u062D\u062F\u064A\u062B", semesters: [] },
              { slug: "ecology", name: "\u0639\u0644\u0645 \u0627\u0644\u0628\u064A\u0626\u0629", semesters: [] },
              { slug: "digital", name: "\u0627\u0644\u0631\u0642\u0645\u064A\u0629", semesters: [] },
              { slug: "vocational", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u0647\u0646\u064A\u0629", semesters: [] },
              { slug: "social", name: "\u0627\u0644\u062F\u0631\u0627\u0633\u0627\u062A \u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629", semesters: [] },
              { slug: "financial", name: "\u0627\u0644\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629", semesters: [] },
              { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }
            ]
          },
          { id: "2", name: "\u062B\u0627\u0646\u064A \u062B\u0627\u0646\u0648\u064A", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "chemistry", name: "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621", semesters: [] }, { slug: "biology", name: "\u0627\u0644\u0623\u062D\u064A\u0627\u0621", semesters: [] }, { slug: "arabic", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", semesters: [] }, { slug: "qiraat", name: "\u0642\u0631\u0627\u0621\u0627\u062A", semesters: [] }, { slug: "tawheed", name: "\u062A\u0648\u062D\u064A\u062F", semesters: [] }, { slug: "english", name: "\u0625\u0646\u062C\u0644\u064A\u0632\u064A", semesters: [] }, { slug: "financial-mgmt", name: "\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629", semesters: [] }, { slug: "arts", name: "\u0627\u0644\u0641\u0646\u0648\u0646", semesters: [] }, { slug: "business-decision", name: "\u0635\u0646\u0627\u0639\u0629 \u0627\u0644\u0642\u0631\u0627\u0631 \u0641\u064A \u0627\u0644\u0623\u0639\u0645\u0627\u0644", semesters: [] }, { slug: "intro-business", name: "\u0645\u0642\u062F\u0645\u0629 \u0641\u064A \u0627\u0644\u0623\u0639\u0645\u0627\u0644", semesters: [] }, { slug: "iot", name: "\u0627\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u0623\u0634\u064A\u0627\u0621", semesters: [] }, { slug: "health-sciences", name: "\u0645\u0628\u0627\u062F\u0626 \u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0635\u062D\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }] },
          { id: "3", name: "\u062B\u0627\u0644\u062B \u062B\u0627\u0646\u0648\u064A", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", semesters: [] }, { slug: "physics", name: "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621", semesters: [] }, { slug: "english", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629", semesters: [] }, { slug: "fiqh", name: "\u0641\u0642\u0647", semesters: [] }, { slug: "chinese", name: "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0635\u064A\u0646\u064A\u0629", semesters: [] }, { slug: "fikria", name: "\u0627\u0644\u062A\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0643\u0631\u064A\u0629", semesters: [] }, { slug: "earth-space", name: "\u0639\u0644\u0648\u0645 \u0627\u0644\u0623\u0631\u0636 \u0648\u0627\u0644\u0641\u0636\u0627\u0621", semesters: [] }, { slug: "ai", name: "\u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A", semesters: [] }, { slug: "digital-design", name: "\u0627\u0644\u062A\u0635\u0645\u064A\u0645 \u0627\u0644\u0631\u0642\u0645\u064A", semesters: [] }, { slug: "statistics", name: "\u0627\u0644\u0625\u062D\u0635\u0627\u0621", semesters: [] }, { slug: "law", name: "\u0645\u0628\u0627\u062F\u0626 \u0627\u0644\u0642\u0627\u0646\u0648\u0646", semesters: [] }, { slug: "marketing-planning", name: "\u062A\u062E\u0637\u064A\u0637 \u0627\u0644\u062D\u0645\u0644\u0627\u062A \u0627\u0644\u062A\u0633\u0648\u064A\u0642\u064A\u0629", semesters: [] }, { slug: "sustainability", name: "\u0627\u0644\u062A\u0646\u0645\u064A\u0629 \u0627\u0644\u0645\u0633\u062A\u062F\u0627\u0645\u0629", semesters: [] }, { slug: "mgmt-skills", name: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629", semesters: [] }, { slug: "writing", name: "\u0627\u0644\u0643\u062A\u0627\u0628\u0629 \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629 \u0648\u0627\u0644\u0625\u0628\u062F\u0627\u0639\u064A\u0629", semesters: [] }, { slug: "event-mgmt", name: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0641\u0639\u0627\u0644\u064A\u0627\u062A", semesters: [] }] }
        ]
      },
      {
        slug: "paths",
        name: "\u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062A",
        grades: [
          { id: "general", name: "\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0639\u0627\u0645", subjects: [{ slug: "math", name: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629", semesters: [] }, { slug: "science", name: "\u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u0639\u0627\u0645\u0629", semesters: [] }] },
          { id: "cs", name: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628", subjects: [{ slug: "cs", name: "\u0639\u0644\u0648\u0645 \u0627\u0644\u062D\u0627\u0633\u0628", semesters: [] }] },
          { id: "health", name: "\u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u062D\u064A\u0627\u0629", subjects: [{ slug: "health", name: "\u0627\u0644\u0635\u062D\u0629 \u0648\u0627\u0644\u062D\u064A\u0627\u0629", semesters: [] }] },
          { id: "business", name: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", subjects: [{ slug: "business", name: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644", semesters: [] }] }
        ]
      },
      {
        slug: "qudurat",
        name: "\u0627\u0644\u0642\u062F\u0631\u0627\u062A \u0648\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A",
        grades: [
          { id: "qudurat", name: "\u0627\u0644\u0642\u062F\u0631\u0627\u062A", subjects: [{ slug: "verbal", name: "\u0627\u0644\u0644\u0641\u0638\u064A", semesters: [] }] },
          { id: "tahsili", name: "\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A", subjects: [{ slug: "tahsili", name: "\u0627\u0644\u062A\u062D\u0635\u064A\u0644\u064A", semesters: [] }] }
        ]
      }
    ];
    DEFAULT_SEMESTERS = [
      { id: "s1", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0623\u0648\u0644", chapters: [] },
      { id: "s2", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062B\u0627\u0646\u064A", chapters: [] }
    ];
    DEFAULT_CHAPTERS = [
      { id: "ch1", name: "\u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", lessons: [] }
    ];
  }
});

// server/admin/cmsStorage.ts
var cmsStorage_exports = {};
__export(cmsStorage_exports, {
  deleteCmsContent: () => deleteCmsContent,
  getCmsContent: () => getCmsContent,
  getCmsContentById: () => getCmsContentById,
  getCmsContentFull: () => getCmsContentFull,
  getPlatformOverviewStats: () => getPlatformOverviewStats,
  getSeo: () => getSeo,
  getSeoForPath: () => getSeoForPath,
  getSeoPagesWithContent: () => getSeoPagesWithContent,
  listCmsContent: () => listCmsContent,
  listSeo: () => listSeo,
  upsertCmsContent: () => upsertCmsContent,
  upsertSeo: () => upsertSeo
});
async function upsertCmsContent(data) {
  const existing = await db.select().from(cmsContent).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(cmsContent.lessonId, data.lessonId), (0, import_drizzle_orm3.eq)(cmsContent.tabType, data.tabType))).limit(1);
  if (existing.length > 0) {
    await db.update(cmsContent).set({ contentType: data.contentType, dataValue: data.dataValue, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm3.eq)(cmsContent.id, existing[0].id));
  } else {
    await db.insert(cmsContent).values(data);
  }
}
async function getCmsContent(lessonId, tabType) {
  const rows = await db.select().from(cmsContent).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(cmsContent.lessonId, lessonId), (0, import_drizzle_orm3.eq)(cmsContent.tabType, tabType))).limit(1);
  return rows[0]?.dataValue ?? null;
}
async function getCmsContentFull(lessonId, tabType) {
  const rows = await db.select({ contentType: cmsContent.contentType, dataValue: cmsContent.dataValue }).from(cmsContent).where((0, import_drizzle_orm3.and)((0, import_drizzle_orm3.eq)(cmsContent.lessonId, lessonId), (0, import_drizzle_orm3.eq)(cmsContent.tabType, tabType))).limit(1);
  const row = rows[0];
  return row && row.dataValue ? { contentType: row.contentType, dataValue: row.dataValue } : null;
}
async function listSeo() {
  const rows = await db.select().from(seoData);
  return rows.map((r) => ({
    pagePath: r.pagePath,
    title: r.title ?? null,
    description: r.description ?? null,
    keywords: r.keywords ?? null,
    ogTitle: r.ogTitle ?? null,
    ogDescription: r.ogDescription ?? null,
    ogImage: r.ogImage ?? null
  }));
}
async function getSeo(pagePath) {
  const rows = await db.select().from(seoData).where((0, import_drizzle_orm3.eq)(seoData.pagePath, pagePath)).limit(1);
  return rows[0] ?? null;
}
async function getSeoPagesWithContent() {
  const staticPages = [
    { value: "/", label: "\u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629" },
    { value: "/login", label: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" },
    { value: "/dashboard", label: "\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645" },
    { value: "/admin", label: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0625\u062F\u0627\u0631\u0629" },
    { value: "/stage/elementary", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0627\u0628\u062A\u062F\u0627\u0626\u064A\u0629" },
    { value: "/stage/middle", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u0645\u062A\u0648\u0633\u0637\u0629" },
    { value: "/stage/high", label: "\u0627\u0644\u0645\u0631\u062D\u0644\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629" },
    { value: "/lesson/elementary/math", label: "\u0627\u0644\u062F\u0631\u0633 - \u0627\u0628\u062A\u062F\u0627\u0626\u064A \u0631\u064A\u0627\u0636\u064A\u0627\u062A" },
    { value: "/lesson/middle/math", label: "\u0627\u0644\u062F\u0631\u0633 - \u0645\u062A\u0648\u0633\u0637 \u0631\u064A\u0627\u0636\u064A\u0627\u062A" },
    { value: "/lesson/high/math", label: "\u0627\u0644\u062F\u0631\u0633 - \u062B\u0627\u0646\u0648\u064A \u0631\u064A\u0627\u0636\u064A\u0627\u062A" }
  ];
  let lessonIds = [];
  try {
    const rows = await db.select({ lessonId: cmsContent.lessonId }).from(cmsContent);
    lessonIds = Array.from(new Set(rows.map((r) => r.lessonId)));
  } catch {
    return staticPages;
  }
  const lessonPages = [];
  const seen = /* @__PURE__ */ new Set();
  for (const lessonId of lessonIds) {
    const info = getLessonFullInfo(lessonId);
    if (!info) continue;
    const url = `/lesson/${info.stageSlug}/${info.subjectSlug}/${lessonId}`;
    if (seen.has(url)) continue;
    seen.add(url);
    const label = `${info.stageName} - ${info.subjectName} - ${info.semesterName} - ${info.chapterName} - ${info.lessonTitle}`;
    lessonPages.push({ value: url, label });
  }
  lessonPages.sort((a, b) => a.label.localeCompare(b.label));
  return [...staticPages, ...lessonPages];
}
async function getSeoForPath(currentPath) {
  const pathNorm = currentPath.startsWith("/") ? currentPath : `/${currentPath}`;
  const parts = pathNorm.split("/").filter(Boolean);
  const pathsToTry = [pathNorm];
  for (let i = parts.length - 1; i > 0; i--) {
    pathsToTry.push("/" + parts.slice(0, i).join("/"));
  }
  pathsToTry.push("/");
  for (const p of pathsToTry) {
    const row = await getSeo(p);
    if (row && (row.title || row.description)) return row;
  }
  return null;
}
function normFilter(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return s === "" || s === "_" ? void 0 : s;
}
async function listCmsContent(filters) {
  let rows;
  try {
    rows = await db.select().from(cmsContent).orderBy((0, import_drizzle_orm3.desc)(cmsContent.updatedAt), (0, import_drizzle_orm3.desc)(cmsContent.id));
  } catch {
    return [];
  }
  const stageSlug = normFilter(filters?.stageSlug);
  const gradeId = normFilter(filters?.gradeId);
  const subjectSlug = normFilter(filters?.subjectSlug);
  const semesterId = normFilter(filters?.semesterId);
  const chapterId = normFilter(filters?.chapterId);
  const lessonIdFilter = normFilter(filters?.lessonId);
  const tabTypeFilter = normFilter(filters?.tabType);
  const lessonCache = /* @__PURE__ */ new Map();
  const result = [];
  for (const r of rows) {
    let info = lessonCache.get(r.lessonId);
    if (info === void 0) {
      info = getLessonFullInfo(r.lessonId);
      lessonCache.set(r.lessonId, info);
    }
    if (stageSlug || gradeId || subjectSlug || semesterId || chapterId || lessonIdFilter) {
      if (!info) continue;
    }
    if (stageSlug && info?.stageSlug !== stageSlug) continue;
    if (gradeId && info?.gradeId !== gradeId) continue;
    if (subjectSlug && info?.subjectSlug !== subjectSlug) continue;
    if (semesterId && info?.semesterId !== semesterId) continue;
    if (chapterId && info?.chapterId !== chapterId) continue;
    if (lessonIdFilter && r.lessonId !== lessonIdFilter) continue;
    if (tabTypeFilter && r.tabType !== tabTypeFilter) continue;
    result.push({
      id: r.id,
      lessonId: r.lessonId,
      tabType: r.tabType,
      contentType: r.contentType,
      dataValue: r.dataValue,
      stageName: info?.stageName ?? "\u2014",
      gradeName: info?.gradeName ?? "\u2014",
      subjectName: info?.subjectName ?? "\u2014",
      semesterName: info?.semesterName ?? "\u2014",
      chapterName: info?.chapterName ?? "\u2014",
      lessonTitle: info?.lessonTitle ?? r.lessonId
    });
  }
  return result;
}
async function getCmsContentById(id) {
  const rows = await db.select().from(cmsContent).where((0, import_drizzle_orm3.eq)(cmsContent.id, id)).limit(1);
  return rows[0] ?? null;
}
async function deleteCmsContent(id) {
  const row = await getCmsContentById(id);
  if (!row) return false;
  if ((row.contentType === "pdf" || row.contentType === "image") && row.dataValue.startsWith("/attached_assets/uploads/")) {
    const fileName = import_path5.default.basename(row.dataValue);
    const filePath = import_path5.default.join(__dirname4, "..", "attached_assets", "uploads", fileName);
    const resolved = import_path5.default.resolve(filePath);
    const uploadsBase = import_path5.default.resolve(__dirname4, "..", "attached_assets", "uploads");
    if (resolved.startsWith(uploadsBase)) {
      try {
        await import_fs.default.promises.unlink(resolved);
      } catch {
      }
    }
  }
  await db.delete(cmsContent).where((0, import_drizzle_orm3.eq)(cmsContent.id, id));
  return true;
}
async function upsertSeo(data) {
  const pathNorm = data.pagePath.startsWith("/") ? data.pagePath : `/${data.pagePath}`;
  const existing = await db.select().from(seoData).where((0, import_drizzle_orm3.eq)(seoData.pagePath, pathNorm)).limit(1);
  const payload = {
    title: data.title ?? null,
    description: data.description ?? null,
    keywords: data.keywords ?? null,
    ogTitle: data.ogTitle ?? null,
    ogDescription: data.ogDescription ?? null,
    ogImage: data.ogImage ?? null,
    updatedAt: /* @__PURE__ */ new Date()
  };
  if (existing.length > 0) {
    await db.update(seoData).set(payload).where((0, import_drizzle_orm3.eq)(seoData.id, existing[0].id));
  } else {
    await db.insert(seoData).values({ pagePath: pathNorm, ...payload });
  }
}
async function getPlatformOverviewStats() {
  const { users: users2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
  let rows = [];
  try {
    rows = await db.select({ id: cmsContent.id, lessonId: cmsContent.lessonId, tabType: cmsContent.tabType, contentType: cmsContent.contentType, createdAt: cmsContent.createdAt }).from(cmsContent);
  } catch {
    rows = [];
  }
  const lessonIds = Array.from(new Set(rows.map((r) => r.lessonId)));
  const totalLessons = lessonIds.length;
  const interactiveContent = rows.filter((r) => r.tabType === "education" || r.tabType === "questions").length;
  const attachments = rows.filter((r) => r.contentType === "pdf" || r.contentType === "youtube").length;
  let totalMembers = 0;
  try {
    const userRows = await db.select().from(users2);
    totalMembers = userRows.length;
  } catch {
  }
  const stageLessons = /* @__PURE__ */ new Map();
  for (const r of rows) {
    const info = getLessonFullInfo(r.lessonId);
    const stage = info?.stageName ?? "\u2014";
    if (!stageLessons.has(stage)) stageLessons.set(stage, /* @__PURE__ */ new Set());
    stageLessons.get(stage).add(r.lessonId);
  }
  const lessonsPerStage = Array.from(stageLessons.entries()).filter(([s]) => s !== "\u2014").map(([stage, set]) => ({ stage, count: set.size })).sort((a, b) => b.count - a.count);
  const hasVideo = new Set(rows.filter((r) => r.tabType === "video").map((r) => r.lessonId));
  const hasSummary = new Set(rows.filter((r) => r.tabType === "summary").map((r) => r.lessonId));
  const hasQuestions = new Set(rows.filter((r) => r.tabType === "questions").map((r) => r.lessonId));
  let completedLessons = 0;
  let incompleteLessons = 0;
  for (const lid of lessonIds) {
    if (hasVideo.has(lid) && hasSummary.has(lid) && hasQuestions.has(lid)) completedLessons++;
    else incompleteLessons++;
  }
  const withInfo = rows.map((r) => {
    const info = getLessonFullInfo(r.lessonId);
    const createdAt = r.createdAt;
    const ts = createdAt instanceof Date ? createdAt.getTime() : createdAt * 1e3;
    return { ...r, subjectName: info?.subjectName ?? "\u2014", lessonTitle: info?.lessonTitle ?? r.lessonId, createdAt: ts };
  });
  withInfo.sort((a, b) => b.createdAt - a.createdAt);
  const recentUploads = withInfo.slice(0, 5).map((r) => ({
    id: r.id,
    lessonTitle: r.lessonTitle,
    subjectName: r.subjectName,
    tabType: r.tabType,
    createdAt: new Date(r.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })
  }));
  return {
    totalLessons,
    interactiveContent,
    totalMembers,
    attachments,
    lessonsPerStage,
    completedLessons,
    incompleteLessons,
    recentUploads
  };
}
var import_drizzle_orm3, import_fs, import_path5, __dirname4;
var init_cmsStorage = __esm({
  "server/admin/cmsStorage.ts"() {
    "use strict";
    init_schema();
    init_db();
    import_drizzle_orm3 = require("drizzle-orm");
    init_cms_hierarchy();
    import_fs = __toESM(require("fs"), 1);
    import_path5 = __toESM(require("path"), 1);
    init_resolve_dir();
    __dirname4 = getDirname();
  }
});

// server/admin/hierarchyStore.ts
var hierarchyStore_exports = {};
__export(hierarchyStore_exports, {
  initHierarchy: () => initHierarchy,
  loadHierarchyFromDb: () => loadHierarchyFromDb,
  saveHierarchyToDb: () => saveHierarchyToDb
});
function ensureSemesterHasChapters2(sem) {
  const chs = sem.chapters ?? [];
  if (chs.length > 0) return sem;
  return { ...sem, chapters: JSON.parse(JSON.stringify(DEFAULT_CHAPTERS2)) };
}
function ensureSubjectHasSemesters2(subj) {
  const sems = (subj.semesters ?? []).map(ensureSemesterHasChapters2);
  if (sems.length > 0) return { ...subj, semesters: sems };
  return {
    ...subj,
    semesters: DEFAULT_SEMESTERS2.map((s) => ensureSemesterHasChapters2(JSON.parse(JSON.stringify(s))))
  };
}
function migrateOldToNew(parsed) {
  const arr = Array.isArray(parsed) ? parsed : [];
  const result = [];
  for (const stage of arr) {
    const s = stage;
    if (!s || typeof s !== "object") continue;
    const slug = String(s.slug ?? "");
    const name = String(s.name ?? "");
    const gradesRaw = s.grades;
    if (Array.isArray(gradesRaw) && gradesRaw.length > 0) {
      const grades = gradesRaw.map((g) => ({
        ...g,
        subjects: (g.subjects ?? []).map(ensureSubjectHasSemesters2)
      }));
      result.push({ slug, name, grades });
      continue;
    }
    const subjectsRaw = s.subjects;
    if (!Array.isArray(subjectsRaw)) {
      const defaults = GRADE_NAMES[slug];
      const gradeIds2 = defaults ? Object.keys(defaults) : ["1"];
      const gradeNames2 = defaults ? Object.values(defaults) : ["\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644"];
      result.push({
        slug,
        name,
        grades: gradeIds2.map((id, i) => ({ id, name: gradeNames2[i] ?? id, subjects: [] }))
      });
      continue;
    }
    const subjects2 = subjectsRaw.map(ensureSubjectHasSemesters2);
    const gradeLabels = GRADE_NAMES[slug];
    const gradeIds = gradeLabels ? Object.keys(gradeLabels) : ["1"];
    const gradeNames = gradeLabels ? Object.values(gradeLabels) : ["\u0627\u0644\u0635\u0641 \u0627\u0644\u0623\u0648\u0644"];
    result.push({
      slug,
      name,
      grades: gradeIds.map((id, i) => ({
        id,
        name: gradeNames[i] ?? id,
        subjects: i === 0 ? subjects2 : subjects2.map((sub) => ensureSubjectHasSemesters2({ ...sub, semesters: [] }))
      }))
    });
  }
  return result;
}
function mergeWithDefaults(loaded) {
  const result = JSON.parse(JSON.stringify(loaded));
  for (const defStage of CMS_HIERARCHY) {
    let stage = result.find((s) => s.slug === defStage.slug);
    if (!stage) {
      stage = { slug: defStage.slug, name: defStage.name, grades: [] };
      result.push(stage);
    }
    for (const defGrade of defStage.grades ?? []) {
      let grade = stage.grades?.find((g) => g.id === defGrade.id);
      if (!grade) {
        grade = { id: defGrade.id, name: defGrade.name, subjects: [] };
        stage.grades = stage.grades ?? [];
        stage.grades.push(grade);
      }
      for (const defSubject of defGrade.subjects ?? []) {
        const exists = grade.subjects?.some((s) => s.slug === defSubject.slug);
        if (!exists) {
          const newSub = ensureSubjectHasSemesters2(
            JSON.parse(JSON.stringify(defSubject))
          );
          grade.subjects = grade.subjects ?? [];
          grade.subjects.push(newSub);
        }
      }
    }
  }
  return result;
}
async function loadHierarchyFromDb() {
  try {
    const rows = await db.select().from(platformStats).where((0, import_drizzle_orm7.eq)(platformStats.key, HIERARCHY_KEY)).limit(1);
    const row = rows[0];
    if (!row?.value) return null;
    const parsed = JSON.parse(row.value);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const migrated = migrateOldToNew(parsed);
      return mergeWithDefaults(migrated);
    }
  } catch (e) {
    console.warn("[hierarchyStore] load failed:", e.message);
  }
  return null;
}
async function saveHierarchyToDb(hierarchy) {
  await db.insert(platformStats).values({ key: HIERARCHY_KEY, value: JSON.stringify(hierarchy), updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
    target: platformStats.key,
    set: { value: JSON.stringify(hierarchy), updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function initHierarchy() {
  const fromDb = await loadHierarchyFromDb();
  if (fromDb) {
    setCurrentHierarchy(fromDb);
  }
}
var import_drizzle_orm7, DEFAULT_SEMESTERS2, DEFAULT_CHAPTERS2, HIERARCHY_KEY;
var init_hierarchyStore = __esm({
  "server/admin/hierarchyStore.ts"() {
    "use strict";
    init_db();
    init_schema();
    import_drizzle_orm7 = require("drizzle-orm");
    init_cms_hierarchy();
    DEFAULT_SEMESTERS2 = [
      { id: "s1", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u0623\u0648\u0644", chapters: [] },
      { id: "s2", name: "\u0627\u0644\u0641\u0635\u0644 \u0627\u0644\u062F\u0631\u0627\u0633\u064A \u0627\u0644\u062B\u0627\u0646\u064A", chapters: [] }
    ];
    DEFAULT_CHAPTERS2 = [{ id: "ch1", name: "\u0627\u0644\u0648\u062D\u062F\u0629 \u0627\u0644\u0623\u0648\u0644\u0649", lessons: [] }];
    HIERARCHY_KEY = "academic_hierarchy";
  }
});

// server/admin/legacyMigration.ts
var legacyMigration_exports = {};
__export(legacyMigration_exports, {
  runLegacyMigration: () => runLegacyMigration
});
async function runLegacyMigration() {
  const validLessonIds = new Set(getAllLessons().map((l) => l.lessonId));
  const items = [];
  function safeReadFile(p) {
    try {
      if (import_fs3.default.existsSync(p)) return import_fs3.default.readFileSync(p, "utf-8");
    } catch (_) {
    }
    return null;
  }
  const lessonsDir = import_path8.default.join(attachedRoot2, "lessons");
  if (import_fs3.default.existsSync(lessonsDir)) {
    for (const f of import_fs3.default.readdirSync(lessonsDir).filter((x) => x.endsWith(".pdf"))) {
      const override = FILE_TO_LESSON_OVERRIDE[f];
      let lessonId;
      let tabType;
      if (override) {
        lessonId = override.lessonId;
        tabType = override.tabType;
      } else if (f.endsWith("-summary.pdf")) {
        lessonId = f.replace(/-summary\.pdf$/, "");
        tabType = "summary";
      } else if (f.endsWith("-ratio.pdf")) {
        lessonId = f.replace(/-ratio\.pdf$/, "");
        tabType = "lesson";
      } else if (f.startsWith("lesson_")) {
        lessonId = f.replace(/^lesson_/, "").replace(/\.pdf$/, "");
        tabType = "lesson";
      } else {
        lessonId = f.replace(/\.pdf$/, "");
        tabType = "lesson";
      }
      if (validLessonIds.has(lessonId) || override) {
        items.push({ lessonId, tabType, contentType: "pdf", dataValue: `/attached_assets/lessons/${f}` });
      }
    }
  }
  const htmlDir = import_path8.default.join(attachedRoot2, "html", "lessons");
  if (import_fs3.default.existsSync(htmlDir)) {
    for (const f of import_fs3.default.readdirSync(htmlDir).filter((x) => x.endsWith(".html"))) {
      let lessonId;
      let tabType;
      if (f.endsWith("-education.html")) {
        lessonId = f.replace(/-education\.html$/, "");
        tabType = "education";
      } else if (f.endsWith("-ssa.html")) {
        lessonId = f.replace(/-ssa\.html$/, "");
        tabType = "questions";
      } else {
        lessonId = f.replace(/\.html$/, "");
        tabType = "education";
      }
      const content = safeReadFile(import_path8.default.join(htmlDir, f));
      if (content && validLessonIds.has(lessonId)) {
        items.push({ lessonId, tabType, contentType: "html", dataValue: content });
      }
    }
  }
  const jsonDir = import_path8.default.join(attachedRoot2, "json", "lessons");
  if (import_fs3.default.existsSync(jsonDir)) {
    for (const f of import_fs3.default.readdirSync(jsonDir).filter((x) => x.endsWith("-questions.json"))) {
      const lessonId = f.replace(/-questions\.json$/, "");
      const content = safeReadFile(import_path8.default.join(jsonDir, f));
      if (content && validLessonIds.has(lessonId)) {
        items.push({ lessonId, tabType: "questions", contentType: "json", dataValue: content });
      }
    }
  }
  try {
    const htmlRows = await db.select().from(adminLessonHtml);
    for (const r of htmlRows) {
      if (r.htmlContent?.trim()) {
        items.push({ lessonId: r.lessonId, tabType: "education", contentType: "html", dataValue: r.htmlContent });
      }
    }
  } catch (_) {
  }
  try {
    const jsonRows = await db.select().from(adminLessonJson).where((0, import_drizzle_orm8.eq)(adminLessonJson.jsonKey, "questions"));
    for (const r of jsonRows) {
      if (r.jsonData?.trim()) {
        items.push({ lessonId: r.lessonId, tabType: "questions", contentType: "json", dataValue: r.jsonData });
      }
    }
  } catch (_) {
  }
  for (const [lessonId, config] of Object.entries(LESSON_VIDEOS)) {
    const urls = [];
    if (config.videoUrl) urls.push(config.videoUrl);
    if (config.additionalVideos) urls.push(...config.additionalVideos);
    const unique = Array.from(new Set(urls));
    if (unique.length > 0) {
      items.push({ lessonId, tabType: "video", contentType: "youtube", dataValue: unique.join("\n") });
    }
  }
  const seen = /* @__PURE__ */ new Set();
  const deduped = [];
  for (const item of items) {
    const key = `${item.lessonId}:${item.tabType}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(item);
    }
  }
  let imported = 0;
  let updated = 0;
  for (const item of deduped) {
    const existing = await db.select().from(cmsContent).where((0, import_drizzle_orm8.and)((0, import_drizzle_orm8.eq)(cmsContent.lessonId, item.lessonId), (0, import_drizzle_orm8.eq)(cmsContent.tabType, item.tabType))).limit(1);
    if (existing.length > 0) {
      await db.update(cmsContent).set({ contentType: item.contentType, dataValue: item.dataValue, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm8.eq)(cmsContent.id, existing[0].id));
      updated++;
    } else {
      await db.insert(cmsContent).values(item);
      imported++;
    }
  }
  return { imported, updated };
}
var import_fs3, import_path8, import_drizzle_orm8, __dirname7, attachedRoot2, FILE_TO_LESSON_OVERRIDE, LESSON_VIDEOS;
var init_legacyMigration = __esm({
  "server/admin/legacyMigration.ts"() {
    "use strict";
    import_fs3 = __toESM(require("fs"), 1);
    import_path8 = __toESM(require("path"), 1);
    init_resolve_dir();
    init_db();
    init_schema();
    import_drizzle_orm8 = require("drizzle-orm");
    init_cms_hierarchy();
    __dirname7 = getDirname();
    attachedRoot2 = import_path8.default.resolve(__dirname7, "..", "attached_assets");
    FILE_TO_LESSON_OVERRIDE = {
      "lesson_4-1.pdf": { lessonId: "5-1", tabType: "lesson" }
    };
    LESSON_VIDEOS = {
      "5-1": {
        videoUrl: "https://www.youtube.com/embed/_l49Ard1--U",
        additionalVideos: [
          "https://www.youtube.com/watch?v=E-ndz2M-yfM",
          "https://www.youtube.com/watch?v=20JoAErwksw",
          "https://www.youtube.com/watch?v=O9-_Yy6l-Ok"
        ]
      },
      "m1-4-1": {
        videoUrl: "https://www.youtube.com/watch?v=2GRQStE-SGo",
        additionalVideos: [
          "https://www.youtube.com/watch?v=77niuMZji3Y",
          "https://www.youtube.com/watch?v=5wyxPLC27RE",
          "https://www.youtube.com/watch?v=vKDGW2jk8C8&t=85s",
          "https://www.youtube.com/watch?v=132EvpZx618&t=432s"
        ]
      }
    };
  }
});

// server/admin/cmsRoutes.ts
var cmsRoutes_exports = {};
__export(cmsRoutes_exports, {
  default: () => cmsRoutes_default
});
var import_express6, import_multer2, import_path9, import_promises3, __dirname8, uploadsDir2, ALLOWED_MIME_TYPES2, upload2, router6, cmsRoutes_default;
var init_cmsRoutes = __esm({
  "server/admin/cmsRoutes.ts"() {
    "use strict";
    import_express6 = require("express");
    init_cmsStorage();
    init_cms_hierarchy();
    init_hierarchyStore();
    import_multer2 = __toESM(require("multer"), 1);
    import_path9 = __toESM(require("path"), 1);
    import_promises3 = require("fs/promises");
    init_resolve_dir();
    __dirname8 = getDirname();
    uploadsDir2 = import_path9.default.join(__dirname8, "..", "attached_assets", "uploads");
    (0, import_promises3.mkdir)(uploadsDir2, { recursive: true }).catch(() => {
    });
    ALLOWED_MIME_TYPES2 = /* @__PURE__ */ new Set([
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/gif",
      "image/svg+xml"
    ]);
    upload2 = (0, import_multer2.default)({
      storage: import_multer2.default.diskStorage({
        destination: (_req, _file, cb) => cb(null, uploadsDir2),
        filename: (_req, file, cb) => {
          const ext = import_path9.default.extname(file.originalname) || ".pdf";
          cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`);
        }
      }),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES2.has(file.mimetype)) {
          return cb(new Error("\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0647."));
        }
        cb(null, true);
      }
    });
    router6 = (0, import_express6.Router)();
    router6.get("/hierarchy", (_req, res) => {
      res.json({
        stages: getStages()
      });
    });
    router6.get("/grades", (req, res) => {
      const stage = req.query.stage;
      if (!stage) return res.status(400).json({ message: "stage \u0645\u0637\u0644\u0648\u0628" });
      res.json(getGrades(stage));
    });
    router6.get("/subjects", (req, res) => {
      const stage = req.query.stage;
      const grade = req.query.grade;
      if (!stage || !grade) return res.status(400).json({ message: "stage \u0648 grade \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
      res.json(getSubjects(stage, grade));
    });
    router6.get("/semesters", (req, res) => {
      const stage = req.query.stage;
      const grade = req.query.grade;
      const subject = req.query.subject;
      if (!stage || !grade || !subject) return res.status(400).json({ message: "stage \u0648 grade \u0648 subject \u0645\u0637\u0644\u0648\u0628\u0629" });
      res.json(getSemesters(stage, grade, subject));
    });
    router6.get("/chapters", (req, res) => {
      const stage = req.query.stage;
      const grade = req.query.grade;
      const subject = req.query.subject;
      const semester = req.query.semester;
      if (!stage || !grade || !subject || !semester) return res.status(400).json({ message: "stage \u0648 grade \u0648 subject \u0648 semester \u0645\u0637\u0644\u0648\u0628\u0629" });
      res.json(getChapters(stage, grade, subject, semester));
    });
    router6.get("/lessons", (req, res) => {
      const stage = req.query.stage;
      const grade = req.query.grade;
      const subject = req.query.subject;
      const semester = req.query.semester;
      const chapter = req.query.chapter;
      if (!stage || !grade || !subject || !semester || !chapter)
        return res.status(400).json({ message: "stage \u0648 grade \u0648 subject \u0648 semester \u0648 chapter \u0645\u0637\u0644\u0648\u0628\u0629" });
      res.json(getLessons(stage, grade, subject, semester, chapter));
    });
    router6.get("/lessons/flat", (_req, res) => {
      res.json(getAllLessons());
    });
    router6.get("/structure", (_req, res) => {
      res.json(getFullHierarchy());
    });
    router6.put("/structure", async (req, res) => {
      try {
        const hierarchy = req.body;
        if (!Array.isArray(hierarchy)) return res.status(400).json({ message: "\u0627\u0644\u0647\u064A\u0643\u0644 \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0635\u0641\u0648\u0641\u0629" });
        await saveHierarchyToDb(hierarchy);
        setCurrentHierarchy(hierarchy);
        res.json({ ok: true });
      } catch (e) {
        console.error("Structure save:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0647\u064A\u0643\u0644\u064A\u0629" });
      }
    });
    router6.get("/seo-paths", (_req, res) => {
      res.json(getAllSeoPaths());
    });
    router6.get("/seo-pages-with-content", async (_req, res) => {
      try {
        const pages = await getSeoPagesWithContent();
        res.json(pages);
      } catch (e) {
        console.error("seo-pages-with-content:", e);
        res.json([]);
      }
    });
    router6.post("/content/import-legacy", async (_req, res) => {
      try {
        const { runLegacyMigration: runLegacyMigration2 } = await Promise.resolve().then(() => (init_legacyMigration(), legacyMigration_exports));
        const result = await runLegacyMigration2();
        res.json({ ok: true, ...result });
      } catch (e) {
        console.error("Import legacy:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0642\u062F\u064A\u0645" });
      }
    });
    router6.get("/content/list", async (_req, res) => {
      try {
        const clean = (v) => (typeof v === "string" ? v.trim() : "") || void 0;
        const stageSlug = clean(_req.query.stage);
        const gradeId = clean(_req.query.grade);
        const subjectSlug = clean(_req.query.subject);
        const semesterId = clean(_req.query.semester);
        const chapterId = clean(_req.query.chapter);
        const lessonId = clean(_req.query.lesson);
        const tabType = clean(_req.query.tabType);
        const hasFilters = !!(stageSlug || gradeId || subjectSlug || semesterId || chapterId || lessonId || tabType);
        const list = await listCmsContent(
          hasFilters ? { stageSlug, gradeId, subjectSlug, semesterId, chapterId, lessonId, tabType } : void 0
        );
        res.json(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("CMS list content:", e);
        res.json([]);
      }
    });
    router6.get("/content/by-id/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
        const row = await getCmsContentById(id);
        if (!row) return res.status(404).json({ message: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        const lessonInfo = getLessonFullInfo(row.lessonId);
        res.json({
          ...row,
          stageSlug: lessonInfo?.stageSlug,
          gradeId: lessonInfo?.gradeId,
          subjectSlug: lessonInfo?.subjectSlug,
          semesterId: lessonInfo?.semesterId,
          chapterId: lessonInfo?.chapterId,
          lessonTitle: lessonInfo?.lessonTitle
        });
      } catch (e) {
        console.error("CMS get by id:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u062D\u062A\u0648\u0649" });
      }
    });
    router6.delete("/content/:id", async (req, res) => {
      try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
        const ok = await deleteCmsContent(id);
        if (!ok) return res.status(404).json({ message: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
        res.json({ ok: true });
      } catch (e) {
        console.error("CMS delete:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0630\u0641" });
      }
    });
    router6.get("/content", async (req, res) => {
      try {
        const lessonId = req.query.lessonId;
        const tabType = req.query.tabType;
        if (!lessonId || !tabType) return res.status(400).json({ message: "lessonId \u0648 tabType \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
        const value = await getCmsContent(lessonId, tabType);
        res.json({ data: value });
      } catch (e) {
        console.error("CMS get content:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u062D\u062A\u0648\u0649" });
      }
    });
    router6.post("/content", async (req, res) => {
      try {
        const { lessonId, tabType, contentType, dataValue } = req.body;
        if (!lessonId || !tabType || !contentType || dataValue == null)
          return res.status(400).json({ message: "lessonId \u0648 tabType \u0648 contentType \u0648 dataValue \u0645\u0637\u0644\u0648\u0628\u0629" });
        await upsertCmsContent({
          lessonId: String(lessonId),
          tabType: String(tabType),
          contentType: String(contentType),
          dataValue: typeof dataValue === "string" ? dataValue : JSON.stringify(dataValue)
        });
        res.json({ ok: true });
      } catch (e) {
        console.error("CMS save content:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0645\u062D\u062A\u0648\u0649" });
      }
    });
    router6.post("/content/upload", upload2.single("file"), async (req, res) => {
      try {
        const file = req.file;
        const { lessonId, tabType } = req.body;
        if (!file || !lessonId || !tabType) return res.status(400).json({ message: "\u0645\u0644\u0641 \u0648 lessonId \u0648 tabType \u0645\u0637\u0644\u0648\u0628\u0629" });
        const url = `/attached_assets/uploads/${file.filename}`;
        const contentType = file.mimetype === "application/pdf" ? "pdf" : "image";
        await upsertCmsContent({
          lessonId: String(lessonId),
          tabType: String(tabType),
          contentType,
          dataValue: url
        });
        res.json({ ok: true, url });
      } catch (e) {
        console.error("CMS upload:", e);
        res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0631\u0641\u0639" });
      }
    });
    cmsRoutes_default = router6;
  }
});

// vite.config.ts
var import_vite, import_plugin_react, import_path12, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    import_vite = require("vite");
    import_plugin_react = __toESM(require("@vitejs/plugin-react"), 1);
    import_path12 = __toESM(require("path"), 1);
    vite_config_default = (0, import_vite.defineConfig)({
      plugins: [(0, import_plugin_react.default)()],
      root: ".",
      publicDir: false,
      resolve: {
        alias: {
          "@": import_path12.default.resolve(__dirname, "src"),
          "@shared": import_path12.default.resolve(__dirname, "shared"),
          "@assets": import_path12.default.resolve(__dirname, "attached_assets")
        }
      },
      build: {
        outDir: "server/public",
        emptyDirBefore: true,
        rollupOptions: {
          input: "index.html"
        }
      }
    });
  }
});

// server/vite.ts
var vite_exports = {};
__export(vite_exports, {
  setupVite: () => setupVite
});
async function setupVite(server, app2) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server, path: "/vite-hmr" },
    allowedHosts: true
  };
  const vite = await (0, import_vite2.createServer)({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use(async (req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    const url = req.originalUrl;
    try {
      const clientTemplate = import_path13.default.resolve(getDirname(), "..", "index.html");
      let template = await import_fs5.default.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${(0, import_nanoid.nanoid)()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
var import_vite2, import_fs5, import_path13, import_nanoid, viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    import_vite2 = require("vite");
    init_vite_config();
    import_fs5 = __toESM(require("fs"), 1);
    import_path13 = __toESM(require("path"), 1);
    import_nanoid = require("nanoid");
    init_resolve_dir();
    viteLogger = (0, import_vite2.createLogger)();
  }
});

// server/index.ts
var index_exports = {};
__export(index_exports, {
  log: () => log
});
module.exports = __toCommonJS(index_exports);

// server/load-env.ts
var import_path2 = __toESM(require("path"), 1);
var import_dotenv = __toESM(require("dotenv"), 1);
init_resolve_dir();
var __dirname2 = getDirname();
var envSameDir = import_path2.default.resolve(__dirname2, ".env");
var envParent = import_path2.default.resolve(__dirname2, "..", ".env");
var envCwd = import_path2.default.resolve(process.cwd(), ".env");
import_dotenv.default.config({ path: envSameDir });
import_dotenv.default.config({ path: envParent });
import_dotenv.default.config({ path: envCwd });

// server/index.ts
var import_express8 = __toESM(require("express"), 1);

// server/routes.ts
var import_express_session2 = __toESM(require("express-session"), 1);
var import_passport2 = __toESM(require("passport"), 1);

// server/storage.ts
init_schema();
init_db();
var import_drizzle_orm = require("drizzle-orm");
var DatabaseStorage = class {
  async getCourses(gradeLevel) {
    if (gradeLevel) {
      return await db.select().from(courses).where((0, import_drizzle_orm.eq)(courses.gradeLevel, gradeLevel));
    }
    return await db.select().from(courses);
  }
  async createCourse(insertCourse) {
    const [course] = await db.insert(courses).values(insertCourse).returning();
    return course;
  }
  async saveLessonProgress(userId, subjectSlug, lessonId, progress) {
    const existing = await db.select().from(lessonProgress).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(lessonProgress.userId, userId),
        (0, import_drizzle_orm.eq)(lessonProgress.subjectSlug, subjectSlug),
        (0, import_drizzle_orm.eq)(lessonProgress.lessonId, lessonId)
      )
    ).limit(1);
    if (existing.length > 0) {
      const [updated] = await db.update(lessonProgress).set({
        ...progress,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(lessonProgress.userId, userId),
          (0, import_drizzle_orm.eq)(lessonProgress.subjectSlug, subjectSlug),
          (0, import_drizzle_orm.eq)(lessonProgress.lessonId, lessonId)
        )
      ).returning();
      return updated;
    } else {
      const [newProgress] = await db.insert(lessonProgress).values({
        userId,
        subjectSlug,
        lessonId,
        ...progress
      }).returning();
      return newProgress;
    }
  }
  async getLessonProgress(userId, subjectSlug, lessonId) {
    const result = await db.select().from(lessonProgress).where(
      (0, import_drizzle_orm.and)(
        (0, import_drizzle_orm.eq)(lessonProgress.userId, userId),
        (0, import_drizzle_orm.eq)(lessonProgress.subjectSlug, subjectSlug),
        (0, import_drizzle_orm.eq)(lessonProgress.lessonId, lessonId)
      )
    ).limit(1);
    return result[0] || null;
  }
  async getUserProgress(userId, subjectSlug) {
    if (subjectSlug) {
      return await db.select().from(lessonProgress).where(
        (0, import_drizzle_orm.and)(
          (0, import_drizzle_orm.eq)(lessonProgress.userId, userId),
          (0, import_drizzle_orm.eq)(lessonProgress.subjectSlug, subjectSlug)
        )
      );
    }
    return await db.select().from(lessonProgress).where((0, import_drizzle_orm.eq)(lessonProgress.userId, userId));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
init_db();
init_schema();

// shared/routes.ts
var import_zod = require("zod");
var errorSchemas = {
  validation: import_zod.z.object({
    message: import_zod.z.string(),
    field: import_zod.z.string().optional()
  }),
  notFound: import_zod.z.object({
    message: import_zod.z.string()
  }),
  internal: import_zod.z.object({
    message: import_zod.z.string()
  })
};
var api = {
  courses: {
    list: {
      method: "GET",
      path: "/api/courses",
      input: import_zod.z.object({
        gradeLevel: import_zod.z.string().optional()
      }).optional(),
      responses: {
        200: import_zod.z.array(import_zod.z.custom())
      }
    }
  }
};

// server/lib/gemini.ts
var import_generative_ai = require("@google/generative-ai");
var cachedClient = null;
function getGeminiClient() {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[Gemini] GEMINI_API_KEY is not set");
    return null;
  }
  try {
    cachedClient = new import_generative_ai.GoogleGenerativeAI(apiKey);
    return cachedClient;
  } catch (error) {
    console.error("[Gemini] Failed to initialize:", error?.message);
    return null;
  }
}
function getGeminiModel(client2, options) {
  return client2.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      maxOutputTokens: options?.maxOutputTokens ?? 1e3,
      temperature: options?.temperature ?? 0.7
    }
  });
}

// server/routes/pdf-extractor.ts
var import_express = require("express");
var router = (0, import_express.Router)();
router.post("/api/extract-questions", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }
    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({
        error: "Gemini API key not configured."
      });
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.4
      }
    });
    const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0641\u064A \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0645\u0646 \u0635\u0648\u0631 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629. 
\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0628\u0635\u064A\u063A\u0629 JSON.

\u0644\u0643\u0644 \u0633\u0624\u0627\u0644 \u0627\u0633\u062A\u062E\u0631\u062C:
- id: \u0631\u0642\u0645 \u0627\u0644\u0633\u0624\u0627\u0644
- question: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644
- hasImage: \u0647\u0644 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0634\u0643\u0644 \u0647\u0646\u062F\u0633\u064A (true/false)
- imageDescription: \u0648\u0635\u0641 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0647\u0646\u062F\u0633\u064A \u0625\u0646 \u0648\u062C\u062F
- options: \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A (a, b, c, d)
- type: \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 (multipleChoice \u0623\u0648 trueFalse)

\u0623\u0631\u062C\u0639 JSON \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u0646\u0635 \u0625\u0636\u0627\u0641\u064A.

\u0627\u0633\u062A\u062E\u0631\u062C \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0645\u0646 \u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629 \u0628\u0635\u064A\u063A\u0629 JSON`;
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    };
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    let content = "";
    try {
      content = response.text();
    } catch {
      const candidates = response.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content) {
        content = candidates[0].content.parts.map((part) => part.text).join("");
      }
    }
    if (!content) {
      content = "";
    }
    let jsonContent = content.trim();
    const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    } else {
      const jsonObjectMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonObjectMatch) {
        jsonContent = jsonObjectMatch[0];
      }
    }
    try {
      const questions = JSON.parse(jsonContent);
      res.json({ success: true, questions });
    } catch {
      res.json({ success: true, rawContent: content });
    }
  } catch (error) {
    console.error("Error extracting questions:", error?.message);
    if (error?.message?.includes("API_KEY_INVALID") || error?.message?.includes("401")) {
      return res.status(401).json({ error: "Invalid Gemini API key" });
    }
    if (error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({ error: "Gemini API rate limit exceeded" });
    }
    if (error?.message?.includes("SAFETY")) {
      return res.status(400).json({ error: "Content was blocked by safety filters" });
    }
    res.status(500).json({ error: "Failed to extract questions" });
  }
});
var pdf_extractor_default = router;

// server/routes/extract-questions.ts
var import_express2 = require("express");
var import_promises = require("fs/promises");
var import_path4 = __toESM(require("path"), 1);
var router2 = (0, import_express2.Router)();
router2.post("/api/extract-questions-from-file", async (req, res) => {
  try {
    const { imagePath } = req.body;
    if (!imagePath) {
      return res.status(400).json({ error: "Image path is required" });
    }
    const safePath = import_path4.default.basename(imagePath);
    const fullPath = import_path4.default.join(process.cwd(), "public", safePath);
    try {
      await (0, import_promises.access)(fullPath);
    } catch {
      return res.status(404).json({ error: "Image not found" });
    }
    const genAI = getGeminiClient();
    if (!genAI) {
      return res.status(503).json({ error: "Gemini API not configured" });
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.3
      }
    });
    const imageBuffer = await (0, import_promises.readFile)(fullPath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType = fullPath.endsWith(".png") ? "image/png" : "image/jpeg";
    const prompt = `\u062D\u0644\u0644 \u0647\u0630\u0647 \u0627\u0644\u0635\u0648\u0631\u0629 \u0648\u0627\u0633\u062A\u062E\u0631\u062C \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629. \u0623\u0631\u062C\u0639 \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0628\u0635\u064A\u063A\u0629 JSON \u0641\u0642\u0637.

\u0644\u0643\u0644 \u0633\u0624\u0627\u0644:
- id: \u0631\u0642\u0645 \u0627\u0644\u0633\u0624\u0627\u0644
- questionText: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 \u0643\u0627\u0645\u0644\u0627\u064B
- hasGeometricShape: \u0647\u0644 \u064A\u0648\u062C\u062F \u0634\u0643\u0644 \u0647\u0646\u062F\u0633\u064A (true/false)
- shapeDescription: \u0648\u0635\u0641 \u0627\u0644\u0634\u0643\u0644 \u0625\u0646 \u0648\u062C\u062F
- options: { a, b, c, d }
- correctAnswer: \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u0625\u0646 \u0643\u0627\u0646\u062A \u0645\u062D\u062F\u062F\u0629

\u0623\u0631\u062C\u0639 \u0645\u0635\u0641\u0648\u0641\u0629 JSON \u0641\u0642\u0637 \u0628\u062F\u0648\u0646 \u0623\u064A \u0646\u0635 \u0625\u0636\u0627\u0641\u064A.`;
    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } }
    ]);
    const response = result.response;
    let content = response.text();
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) content = jsonMatch[1];
    const questions = JSON.parse(content);
    res.json({ success: true, questions });
  } catch (error) {
    console.error("Extract questions error:", error?.message);
    res.status(500).json({ error: "Failed to extract questions" });
  }
});
var extract_questions_default = router2;

// server/admin/adminRoutes.ts
var import_express3 = require("express");
var import_path6 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var import_bcrypt = __toESM(require("bcrypt"), 1);
init_resolve_dir();
var import_multer = __toESM(require("multer"), 1);

// server/admin/contentStorage.ts
init_schema();
init_db();
var import_drizzle_orm2 = require("drizzle-orm");
async function listAttachments(lessonId) {
  const rows = lessonId ? await db.select().from(adminAttachments).where((0, import_drizzle_orm2.eq)(adminAttachments.lessonId, lessonId)) : await db.select().from(adminAttachments);
  return rows;
}
async function addAttachment(data) {
  const [row] = await db.insert(adminAttachments).values(data).returning();
  return row;
}
async function deleteAttachment(id) {
  await db.delete(adminAttachments).where((0, import_drizzle_orm2.eq)(adminAttachments.id, id));
}
async function getLessonHtml(lessonId) {
  const [row] = await db.select().from(adminLessonHtml).where((0, import_drizzle_orm2.eq)(adminLessonHtml.lessonId, lessonId)).limit(1);
  return row?.htmlContent ?? null;
}
async function setLessonHtml(lessonId, htmlContent) {
  await db.insert(adminLessonHtml).values({ lessonId, htmlContent, updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
    target: adminLessonHtml.lessonId,
    set: { htmlContent, updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function getLessonJson(lessonId, jsonKey) {
  const rows = await db.select().from(adminLessonJson).where(
    (0, import_drizzle_orm2.and)(
      (0, import_drizzle_orm2.eq)(adminLessonJson.lessonId, lessonId),
      (0, import_drizzle_orm2.eq)(adminLessonJson.jsonKey, jsonKey)
    )
  ).limit(1);
  return rows[0]?.jsonData ?? null;
}
async function setLessonJson(lessonId, jsonKey, jsonData) {
  const existing = await db.select().from(adminLessonJson).where(
    (0, import_drizzle_orm2.and)(
      (0, import_drizzle_orm2.eq)(adminLessonJson.lessonId, lessonId),
      (0, import_drizzle_orm2.eq)(adminLessonJson.jsonKey, jsonKey)
    )
  ).limit(1);
  if (existing.length > 0) {
    await db.update(adminLessonJson).set({ jsonData, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm2.eq)(adminLessonJson.id, existing[0].id));
  } else {
    await db.insert(adminLessonJson).values({ lessonId, jsonKey, jsonData });
  }
}
async function getPlatformStat(key) {
  const [row] = await db.select().from(platformStats).where((0, import_drizzle_orm2.eq)(platformStats.key, key)).limit(1);
  return row?.value ?? null;
}
async function setPlatformStat(key, value) {
  await db.insert(platformStats).values({ key, value, updatedAt: /* @__PURE__ */ new Date() }).onConflictDoUpdate({
    target: platformStats.key,
    set: { value, updatedAt: /* @__PURE__ */ new Date() }
  });
}
async function getStudentCount() {
  const rows = await db.select().from(users);
  return rows.length;
}
async function getCompletionRate() {
  const raw = await getPlatformStat("completion_rate");
  if (raw == null) return 2;
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 2;
}

// server/admin/adminRoutes.ts
init_cmsStorage();
init_schema();
init_db();
var import_drizzle_orm4 = require("drizzle-orm");
var __dirname5 = getDirname();
var uploadsDir = import_path6.default.join(__dirname5, "..", "attached_assets", "uploads");
import_fs2.default.promises.mkdir(uploadsDir, { recursive: true }).catch(() => {
});
var ALLOWED_MIME_TYPES = /* @__PURE__ */ new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml"
]);
var upload = (0, import_multer.default)({
  storage: import_multer.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = import_path6.default.extname(file.originalname) || (file.mimetype === "application/pdf" ? ".pdf" : ".png");
      cb(null, `${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(new Error("\u0646\u0648\u0639 \u0627\u0644\u0645\u0644\u0641 \u063A\u064A\u0631 \u0645\u0633\u0645\u0648\u062D \u0628\u0647."));
    }
    cb(null, true);
  }
});
var router3 = (0, import_express3.Router)();
router3.get("/overview", async (_req, res) => {
  try {
    const stats = await getPlatformOverviewStats();
    res.json(stats);
  } catch (e) {
    console.error("Admin overview stats:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0645\u0646\u0635\u0629." });
  }
});
router3.get("/stats", async (_req, res) => {
  try {
    const [studentCount, completionRate] = await Promise.all([
      getStudentCount(),
      getCompletionRate()
    ]);
    res.json({ studentCount, completionRate });
  } catch (e) {
    console.error("Admin stats error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A." });
  }
});
router3.put("/stats", async (req, res) => {
  try {
    const { completionRate } = req.body;
    const n = typeof completionRate === "number" ? completionRate : parseFloat(String(completionRate ?? "2"));
    const value = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 2;
    await setPlatformStat("completion_rate", String(value));
    res.json({ completionRate: value });
  } catch (e) {
    console.error("Admin stats update error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A." });
  }
});
router3.get("/school-year", async (_req, res) => {
  try {
    const [start, end, sem1End] = await Promise.all([
      getPlatformStat("school_year_start"),
      getPlatformStat("school_year_end"),
      getPlatformStat("semester1_end")
    ]);
    res.json({
      schoolYearStart: start || "2025-08-25",
      schoolYearEnd: end || "2026-06-15",
      semester1End: sem1End || "2025-12-15"
    });
  } catch (e) {
    console.error("School year get:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629." });
  }
});
router3.put("/school-year", async (req, res) => {
  try {
    const { schoolYearStart, schoolYearEnd, semester1End } = req.body;
    if (schoolYearStart) await setPlatformStat("school_year_start", String(schoolYearStart));
    if (schoolYearEnd) await setPlatformStat("school_year_end", String(schoolYearEnd));
    if (semester1End) await setPlatformStat("semester1_end", String(semester1End));
    const [start, end, sem1] = await Promise.all([
      getPlatformStat("school_year_start"),
      getPlatformStat("school_year_end"),
      getPlatformStat("semester1_end")
    ]);
    res.json({
      schoolYearStart: start || "2025-08-25",
      schoolYearEnd: end || "2026-06-15",
      semester1End: sem1 || "2025-12-15"
    });
  } catch (e) {
    console.error("School year update:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062F\u0631\u0627\u0633\u064A\u0629." });
  }
});
router3.get("/attachments", async (req, res) => {
  try {
    const lessonId = req.query.lessonId;
    const list = await listAttachments(lessonId);
    res.json(list);
  } catch (e) {
    console.error("Admin attachments list error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0645\u0631\u0641\u0642\u0627\u062A." });
  }
});
router3.post("/attachments", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const lessonId = req.body.lessonId;
    const label = req.body.label || "\u0645\u0631\u0641\u0642";
    if (!file || !lessonId) {
      return res.status(400).json({ message: "\u064A\u062C\u0628 \u0625\u0631\u0641\u0627\u0642 \u0645\u0644\u0641 \u0648\u062A\u062D\u062F\u064A\u062F \u0645\u0639\u0631\u0641 \u0627\u0644\u062F\u0631\u0633." });
    }
    const MAGIC = {
      "application/pdf": [[37, 80, 68, 70]],
      "image/png": [[137, 80, 78, 71]],
      "image/jpeg": [[255, 216, 255]],
      "image/gif": [[71, 73, 70, 56]],
      "image/webp": [[82, 73, 70, 70]]
    };
    const sigs = MAGIC[file.mimetype];
    if (sigs) {
      try {
        const buf = await import_fs2.default.promises.readFile(file.path);
        const header = Array.from(buf.slice(0, 8));
        const valid = sigs.some((sig) => sig.every((b, i) => header[i] === b));
        if (!valid) {
          await import_fs2.default.promises.unlink(file.path).catch(() => {
          });
          return res.status(400).json({ message: "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0644\u0641 \u0644\u0627 \u064A\u062A\u0637\u0627\u0628\u0642 \u0645\u0639 \u0646\u0648\u0639\u0647 \u0627\u0644\u0645\u064F\u0639\u0644\u0646." });
        }
      } catch {
      }
    }
    const type = file.mimetype === "application/pdf" ? "pdf" : "image";
    const url = `/attached_assets/uploads/${file.filename}`;
    const row = await addAttachment({ lessonId, type, url, label });
    res.status(201).json(row);
  } catch (e) {
    console.error("Admin attachment upload error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0631\u0641\u0639 \u0627\u0644\u0645\u0631\u0641\u0642." });
  }
});
router3.delete("/attachments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) return res.status(400).json({ message: "\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." });
    await deleteAttachment(id);
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin attachment delete error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0630\u0641 \u0627\u0644\u0645\u0631\u0641\u0642." });
  }
});
router3.get("/lessons/:lessonId/html", async (req, res) => {
  try {
    const html = await getLessonHtml(req.params.lessonId);
    res.json(html != null ? { html } : { html: null });
  } catch (e) {
    console.error("Admin get lesson HTML error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u062D\u062A\u0648\u0649 HTML." });
  }
});
router3.put("/lessons/:lessonId/html", async (req, res) => {
  try {
    const { html } = req.body;
    await setLessonHtml(req.params.lessonId, typeof html === "string" ? html : "");
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin set lesson HTML error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0645\u062D\u062A\u0648\u0649 HTML." });
  }
});
router3.get("/lessons/:lessonId/json", async (req, res) => {
  try {
    const key = req.query.key || "questions";
    const data = await getLessonJson(req.params.lessonId, key);
    res.json(data != null ? { data } : { data: null });
  } catch (e) {
    console.error("Admin get lesson JSON error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A JSON." });
  }
});
router3.put("/lessons/:lessonId/json", async (req, res) => {
  try {
    const key = req.body.key || "questions";
    const data = typeof req.body.data === "string" ? req.body.data : JSON.stringify(req.body.data ?? {});
    await setLessonJson(req.params.lessonId, key, data);
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin set lesson JSON error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0628\u064A\u0627\u0646\u0627\u062A JSON." });
  }
});
router3.get("/users", async (req, res) => {
  try {
    const q = req.query.q || "";
    const all = await db.select().from(users);
    let filtered = all;
    if (q.trim()) {
      const lower = q.toLowerCase().trim();
      filtered = all.filter(
        (u) => u.email?.toLowerCase().includes(lower) || u.firstName?.toLowerCase().includes(lower) || u.lastName?.toLowerCase().includes(lower)
      );
    }
    const list = filtered.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: u.createdAt
    }));
    res.json(list);
  } catch (e) {
    console.error("Admin users list:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u0623\u0639\u0636\u0627\u0621." });
  }
});
router3.get("/users/stats", async (req, res) => {
  try {
    const all = await db.select().from(users);
    const today = /* @__PURE__ */ new Date();
    today.setHours(0, 0, 0, 0);
    const todayTs = Math.floor(today.getTime() / 1e3);
    const newToday = all.filter((u) => {
      const ct = u.createdAt;
      if (ct == null) return false;
      const ts = ct instanceof Date ? ct.getTime() / 1e3 : ct;
      return ts >= todayTs;
    }).length;
    res.json({ total: all.length, newToday });
  } catch (e) {
    console.error("Admin users stats:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A." });
  }
});
router3.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, role, email, newPassword } = req.body;
    const updates = {
      firstName: firstName ?? void 0,
      lastName: lastName ?? void 0,
      role: role ?? void 0,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (email != null && String(email).trim() !== "") {
      updates.email = String(email).trim();
    }
    if (newPassword != null && String(newPassword).trim() !== "") {
      updates.password = await import_bcrypt.default.hash(String(newPassword).trim(), 10);
    }
    await db.update(users).set(updates).where((0, import_drizzle_orm4.eq)(users.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin user update:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062A\u062D\u062F\u064A\u062B." });
  }
});
router3.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(users).where((0, import_drizzle_orm4.eq)(users.id, id));
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin user delete:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062D\u0630\u0641." });
  }
});
router3.get("/seo", async (_req, res) => {
  try {
    const list = await listSeo();
    res.json(list);
  } catch (e) {
    console.error("Admin SEO list:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u064A\u0648." });
  }
});
router3.get("/seo/by-path", async (req, res) => {
  try {
    const pagePath = req.query.path || "/";
    const pathNorm = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
    const row = await getSeo(pathNorm);
    res.json(row ?? { pagePath: pathNorm, title: null, description: null, keywords: null });
  } catch (e) {
    console.error("Admin SEO get:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u064A\u0648." });
  }
});
router3.put("/seo", async (req, res) => {
  try {
    const { pagePath, title, description, keywords, ogTitle, ogDescription, ogImage } = req.body;
    if (!pagePath) return res.status(400).json({ message: "pagePath \u0645\u0637\u0644\u0648\u0628" });
    const pathNorm = String(pagePath).startsWith("/") ? String(pagePath) : `/${pagePath}`;
    await upsertSeo({ pagePath: pathNorm, title, description, keywords, ogTitle, ogDescription, ogImage });
    res.json({ ok: true });
  } catch (e) {
    console.error("Admin SEO save:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062D\u0641\u0638 \u0627\u0644\u0633\u064A\u0648." });
  }
});
var adminRoutes_default = router3;

// server/admin/contentRoutes.ts
var import_express4 = require("express");
var import_promises2 = require("fs/promises");
var import_path7 = __toESM(require("path"), 1);
init_resolve_dir();
init_cmsStorage();
async function fileExists(p) {
  try {
    await (0, import_promises2.access)(p);
    return true;
  } catch {
    return false;
  }
}
async function readTextFile(p) {
  return (0, import_promises2.readFile)(p, "utf-8");
}
var __dirname6 = getDirname();
var attachedRoot = import_path7.default.resolve(__dirname6, "..", "attached_assets");
var router4 = (0, import_express4.Router)();
router4.get("/lesson/:lessonId/tab/:tabType", async (req, res) => {
  try {
    const { lessonId, tabType } = req.params;
    let data = null;
    try {
      data = await getCmsContentFull(lessonId, tabType);
    } catch (_) {
    }
    if (data) {
      res.json(data);
      return;
    }
    res.status(404).json({ message: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u062D\u062A\u0648\u0649 \u0645\u0646 CMS \u0644\u0647\u0630\u0627 \u0627\u0644\u062A\u0628\u0648\u064A\u0628." });
  } catch (e) {
    console.error("Content tab fetch error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u0628\u0648\u064A\u0628." });
  }
});
router4.get("/lesson/:lessonId/education-html", async (req, res) => {
  try {
    const { lessonId } = req.params;
    let html = null;
    try {
      const cms = await getCmsContent(lessonId, "education");
      if (cms && cms.trim().length > 0) html = cms;
    } catch (_) {
    }
    if (!html) try {
      html = await getLessonHtml(lessonId);
    } catch (_) {
    }
    if (html != null && html.length > 0) {
      res.type("text/html").send(html);
      return;
    }
    const fallbackPath = import_path7.default.join(
      attachedRoot,
      "html",
      "lessons",
      `${lessonId}-education.html`
    );
    if (await fileExists(fallbackPath)) {
      const raw = await readTextFile(fallbackPath);
      res.type("text/html").send(raw);
      return;
    }
    res.status(404).json({ message: "\u0644\u0645 \u064A\u064F\u0639\u062B\u0631 \u0639\u0644\u0649 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u0639\u0644\u064A\u0645 \u0644\u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633." });
  } catch (e) {
    console.error("Content education-html error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u062A\u0639\u0644\u064A\u0645." });
  }
});
router4.get("/lesson/:lessonId/ssa-html", async (req, res) => {
  const iframeFix = `<style>html,body{max-width:100%!important;overflow-x:hidden!important;width:100%!important;margin:0!important;padding:0!important}*{box-sizing:border-box!important}img,video,canvas,svg,table,iframe{max-width:100%!important}pre,code{overflow-x:auto!important;white-space:pre-wrap!important;word-break:break-word!important}</style><script>function _sh(){var els=document.body.children;var h=0;for(var i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();var b=r.top+r.height+window.scrollY;if(b>h)h=b}h=Math.ceil(h);if(h<100)h=document.documentElement.scrollHeight;window.parent.postMessage({type:"sharef-iframe-height",height:h},"*")}window.addEventListener("load",function(){_sh();setTimeout(_sh,300);setTimeout(_sh,1000);new ResizeObserver(_sh).observe(document.body)});</script>`;
  const injectFix = (html) => {
    if (html.includes("</head>")) return html.replace("</head>", iframeFix + "</head>");
    if (html.includes("<body")) return html.replace("<body", iframeFix + "<body");
    return iframeFix + html;
  };
  try {
    const { lessonId } = req.params;
    try {
      const cms = await getCmsContent(lessonId, "education");
      if (cms && cms.trim().length > 0) {
        res.type("text/html").send(injectFix(cms));
        return;
      }
    } catch (_) {
    }
    const pathsToTry = [
      import_path7.default.resolve(attachedRoot, "html", "lessons", `${lessonId}-ssa.html`),
      import_path7.default.resolve(process.cwd(), "attached_assets", "html", "lessons", `${lessonId}-ssa.html`)
    ];
    for (const ssaPath of pathsToTry) {
      if (await fileExists(ssaPath)) {
        const raw = await readTextFile(ssaPath);
        res.type("text/html").send(injectFix(raw));
        return;
      }
    }
    let html = null;
    try {
      html = await getLessonHtml(lessonId);
    } catch (_) {
    }
    if (html != null && html.length > 0) {
      res.type("text/html").send(injectFix(html));
      return;
    }
    const eduPaths = [
      import_path7.default.resolve(attachedRoot, "html", "lessons", `${lessonId}-education.html`),
      import_path7.default.resolve(process.cwd(), "attached_assets", "html", "lessons", `${lessonId}-education.html`)
    ];
    for (const educationPath of eduPaths) {
      if (await fileExists(educationPath)) {
        const raw = await readTextFile(educationPath);
        res.type("text/html").send(injectFix(raw));
        return;
      }
    }
    res.status(404).json({ message: "\u0644\u0645 \u064A\u064F\u0639\u062B\u0631 \u0639\u0644\u0649 \u0645\u062D\u062A\u0648\u0649 SSA \u0644\u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633." });
  } catch (e) {
    console.error("Content ssa-html error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0645\u062D\u062A\u0648\u0649 SSA." });
  }
});
router4.get("/lesson/:lessonId/json", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const key = req.query.key || "questions";
    let data = null;
    if (key === "questions") {
      try {
        const cms = await getCmsContent(lessonId, "questions");
        if (cms && cms.trim().length > 0) data = cms;
      } catch (_) {
      }
    }
    if (!data) try {
      data = await getLessonJson(lessonId, key);
    } catch (_) {
    }
    if (data != null && data.length > 0) {
      res.type("application/json").send(data);
      return;
    }
    if (key === "questions") {
      const fallbackPath = import_path7.default.join(
        attachedRoot,
        "json",
        "lessons",
        `${lessonId}-questions.json`
      );
      if (await fileExists(fallbackPath)) {
        const raw = await readTextFile(fallbackPath);
        res.type("application/json").send(raw);
        return;
      }
    }
    res.status(404).json({ message: "\u0644\u0645 \u064A\u064F\u0639\u062B\u0631 \u0639\u0644\u0649 \u0628\u064A\u0627\u0646\u0627\u062A JSON \u0644\u0647\u0630\u0627 \u0627\u0644\u062F\u0631\u0633." });
  } catch (e) {
    console.error("Content JSON error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u062C\u0644\u0628 \u0628\u064A\u0627\u0646\u0627\u062A JSON." });
  }
});
var contentRoutes_default = router4;

// server/auth/authRoutes.ts
var import_express5 = require("express");
var import_bcrypt2 = __toESM(require("bcrypt"), 1);
var import_passport = __toESM(require("passport"), 1);
var import_passport_local = require("passport-local");
var import_passport_google_oauth20 = require("passport-google-oauth20");
init_db();
init_schema();
var import_drizzle_orm5 = require("drizzle-orm");

// server/lib/sendMail.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
var transporter = import_nodemailer.default.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  } : void 0
});
var FROM = process.env.MAIL_FROM || process.env.SMTP_USER || "noreply@sharfedu.com";
if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("[Mail] SMTP \u063A\u064A\u0631 \u0645\u064F\u0639\u062F (SMTP_USER \u0623\u0648 SMTP_PASS \u0641\u0627\u0631\u063A \u0641\u064A .env)");
}
async function sendPasswordResetCode(email, code) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("[Mail] SMTP \u063A\u064A\u0631 \u0645\u064F\u0639\u062F \u2014 \u0631\u0645\u0632 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (\u0644\u0644\u062A\u062C\u0631\u0628\u0629):", code);
    return { sent: false };
  }
  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: "\u0631\u0645\u0632 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u2014 \u0645\u0646\u0635\u0629 \u0634\u0627\u0631\u0641 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629",
      text: `\u0631\u0645\u0632\u0643 \u0647\u0648: ${code}
\u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 15 \u062F\u0642\u064A\u0642\u0629.
\u0644\u0645 \u062A\u0637\u0644\u0628 \u0647\u0630\u0627\u061F \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629.`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 400px;">
          <h2>\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631</h2>
          <p>\u0631\u0645\u0632\u0643 \u0644\u0644\u062A\u062D\u0642\u0642:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0ea5e9;">${code}</p>
          <p style="color: #64748b;">\u0635\u0627\u0644\u062D \u0644\u0645\u062F\u0629 15 \u062F\u0642\u064A\u0642\u0629.</p>
          <p style="color: #64748b;">\u0644\u0645 \u062A\u0637\u0644\u0628 \u0647\u0630\u0627\u061F \u064A\u0645\u0643\u0646\u0643 \u062A\u062C\u0627\u0647\u0644 \u0647\u0630\u0647 \u0627\u0644\u0631\u0633\u0627\u0644\u0629.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #94a3b8;">\u0645\u0646\u0635\u0629 \u0634\u0627\u0631\u0641 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A\u0629</p>
        </div>
      `
    });
    return { sent: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Mail] \u0641\u0634\u0644 \u0625\u0631\u0633\u0627\u0644 \u0628\u0631\u064A\u062F \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631:", err);
    return { sent: false, error: msg };
  }
}

// server/auth/authRoutes.ts
var router5 = (0, import_express5.Router)();
function toPublicUser(u) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    profileImageUrl: u.profileImageUrl ?? null,
    role: u.role,
    stageSlug: u.stageSlug ?? null,
    gradeId: u.gradeId ?? null
  };
}
import_passport.default.use(
  new import_passport_local.Strategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const rows = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.email, email.toLowerCase().trim())).limit(1);
        if (rows.length === 0) return done(null, false, { message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
        const user = rows[0];
        if (!user.password) return done(null, false, { message: "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0639\u0628\u0631 \u062C\u0648\u062C\u0644 \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631." });
        const ok = await import_bcrypt2.default.compare(password, user.password);
        if (!ok) return done(null, false, { message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
        return done(null, toPublicUser(user));
      } catch (e) {
        return done(e);
      }
    }
  )
);
var GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
var BASE_URL = process.env.BASE_URL || process.env.APP_URL || "http://localhost:5000";
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  import_passport.default.use(
    new import_passport_google_oauth20.Strategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL.replace(/\/$/, "")}/api/auth/google/callback`,
        scope: ["profile", "email"]
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error("\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0646 \u062C\u0648\u062C\u0644."));
          const googleId = profile.id;
          const existing = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.googleId, googleId)).limit(1);
          if (existing.length > 0) return done(null, toPublicUser(existing[0]));
          const byEmail = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.email, email)).limit(1);
          if (byEmail.length > 0) {
            await db.update(users).set({ googleId, updatedAt: /* @__PURE__ */ new Date() }).where((0, import_drizzle_orm5.eq)(users.id, byEmail[0].id));
            const updated = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.id, byEmail[0].id)).limit(1);
            return done(null, toPublicUser(updated[0]));
          }
          const [inserted] = await db.insert(users).values({
            email,
            googleId,
            firstName: profile.name?.givenName ?? null,
            lastName: profile.name?.familyName ?? null,
            profileImageUrl: profile.photos?.[0]?.value ?? null,
            role: "user"
          }).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
          if (!inserted) return done(new Error("\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645."));
          return done(null, toPublicUser(inserted));
        } catch (e) {
          return done(e);
        }
      }
    )
  );
}
import_passport.default.serializeUser((user, done) => done(null, user.id));
import_passport.default.deserializeUser(async (id, done) => {
  try {
    const rows = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.id, id)).limit(1);
    if (rows.length === 0) return done(null, null);
    return done(null, toPublicUser(rows[0]));
  } catch (e) {
    return done(e);
  }
});
function requireAuth(req, res, next) {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644." });
}
router5.get("/user", (req, res) => {
  if (req.isAuthenticated?.() && req.user) return res.json(req.user);
  res.json(null);
});
router5.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailNorm = String(email ?? "").toLowerCase().trim();
    if (!emailNorm || !password || password.length < 6)
      return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 (6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644) \u0645\u0637\u0644\u0648\u0628\u0627\u0646." });
    const existing = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.email, emailNorm)).limit(1);
    if (existing.length > 0) return res.status(400).json({ message: "\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0633\u062C\u0651\u0644 \u0645\u0633\u0628\u0642\u0627\u064B." });
    const hash = await import_bcrypt2.default.hash(password, 10);
    const [inserted] = await db.insert(users).values({
      email: emailNorm,
      password: hash,
      firstName: null,
      lastName: null,
      role: "user"
    }).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
    if (!inserted) return res.status(500).json({ message: "\u0641\u0634\u0644 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628." });
    req.login(inserted, (err) => {
      if (err) return res.status(500).json({ message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062D\u0633\u0627\u0628 \u0644\u0643\u0646 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0641\u0634\u0644." });
      res.json({ user: toPublicUser(inserted) });
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645." });
  }
});
router5.post("/login", (req, res, next) => {
  import_passport.default.authenticate("local", (err, user, info) => {
    if (err) return res.status(500).json({ message: err.message || "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645." });
    if (!user) return res.status(401).json({ message: info?.message || "\u0627\u0644\u0628\u0631\u064A\u062F \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
    req.login(user, (loginErr) => {
      if (loginErr) return res.status(500).json({ message: "\u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644." });
      res.json({ user });
    });
  })(req, res, next);
});
router5.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session?.destroy(() => res.json({ ok: true }));
  });
});
router5.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628." });
    const code = String(Math.floor(1e5 + Math.random() * 9e5));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1e3);
    await db.delete(passwordResetCodes).where((0, import_drizzle_orm5.eq)(passwordResetCodes.email, email));
    await db.insert(passwordResetCodes).values({ email, code, expiresAt });
    const result = await sendPasswordResetCode(email, code);
    const message = result.sent ? "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0631\u0645\u0632 \u0625\u0644\u0649 \u0628\u0631\u064A\u062F\u0643." : result.error ? `\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0631\u0645\u0632 \u0644\u0643\u0646 \u0641\u0634\u0644 \u0627\u0644\u0625\u0631\u0633\u0627\u0644: ${result.error}` : "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0631\u0645\u0632. (\u0627\u0644\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0641\u0639\u0644\u064A \u064A\u062A\u0637\u0644\u0628 \u0625\u0639\u062F\u0627\u062F SMTP \u0641\u064A .env.)";
    res.json({ message, code: result.sent ? void 0 : code });
  } catch (e) {
    console.error("Forgot password error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645." });
  }
});
router5.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    const emailNorm = String(email ?? "").toLowerCase().trim();
    if (!emailNorm || !code || !newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0648\u0627\u0644\u0631\u0645\u0632 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 (6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644) \u0645\u0637\u0644\u0648\u0628\u0629." });
    const now = /* @__PURE__ */ new Date();
    const rows = await db.select().from(passwordResetCodes).where(
      (0, import_drizzle_orm5.and)(
        (0, import_drizzle_orm5.eq)(passwordResetCodes.email, emailNorm),
        (0, import_drizzle_orm5.eq)(passwordResetCodes.code, String(code).trim()),
        (0, import_drizzle_orm5.gt)(passwordResetCodes.expiresAt, now)
      )
    ).limit(1);
    if (rows.length === 0) return res.status(400).json({ message: "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629." });
    const hash = await import_bcrypt2.default.hash(newPassword, 10);
    await db.update(users).set({ password: hash, updatedAt: now }).where((0, import_drizzle_orm5.eq)(users.email, emailNorm));
    await db.delete(passwordResetCodes).where((0, import_drizzle_orm5.eq)(passwordResetCodes.email, emailNorm));
    res.json({ message: "\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631. \u064A\u0645\u0643\u0646\u0643 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0627\u0644\u0622\u0646." });
  } catch (e) {
    console.error("Reset password error:", e);
    res.status(500).json({ message: "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645." });
  }
});
router5.put("/account", requireAuth, (req, res, next) => {
  (async () => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644." });
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const rows = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.id, userId)).limit(1);
      if (rows.length === 0) return res.status(404).json({ message: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
      const current = rows[0];
      const updates = { updatedAt: /* @__PURE__ */ new Date() };
      if (body.email !== void 0 && body.email !== null) {
        const emailNorm = String(body.email).toLowerCase().trim();
        if (!emailNorm) return res.status(400).json({ message: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0637\u0644\u0648\u0628." });
        const existing = await db.select().from(users).where((0, import_drizzle_orm5.eq)(users.email, emailNorm)).limit(1);
        if (existing.length > 0 && existing[0].id !== userId) return res.status(400).json({ message: "\u0647\u0630\u0627 \u0627\u0644\u0628\u0631\u064A\u062F \u0645\u0633\u062C\u0651\u0644 \u0644\u062D\u0633\u0627\u0628 \u0622\u062E\u0631." });
        updates.email = emailNorm;
      }
      if (body.newPassword !== void 0 && body.newPassword !== null && String(body.newPassword).trim().length >= 6) {
        const curPass = String(body.currentPassword ?? "").trim();
        if (!curPass) return res.status(400).json({ message: "\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631." });
        if (!current.password) return res.status(400).json({ message: "\u0633\u062C\u0651\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u0643\u0644\u0645\u0629 \u0645\u0631\u0648\u0631 \u0644\u062A\u062A\u0645\u0643\u0646 \u0645\u0646 \u062A\u063A\u064A\u064A\u0631\u0647\u0627." });
        const ok = await import_bcrypt2.default.compare(curPass, current.password);
        if (!ok) return res.status(400).json({ message: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629." });
        updates.password = await import_bcrypt2.default.hash(String(body.newPassword).trim(), 10);
      }
      if (body.firstName !== void 0 && body.firstName !== null) updates.firstName = String(body.firstName).trim() || null;
      if (body.lastName !== void 0 && body.lastName !== null) updates.lastName = String(body.lastName).trim() || null;
      if (body.profileImageUrl !== void 0 && body.profileImageUrl !== null) updates.profileImageUrl = String(body.profileImageUrl).trim() || null;
      const result = await db.update(users).set(updates).where((0, import_drizzle_orm5.eq)(users.id, userId)).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
      const updated = result[0];
      if (!updated) return res.status(500).json({ message: "\u0641\u0634\u0644 \u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u062D\u0633\u0627\u0628 \u0628\u0639\u062F \u0627\u0644\u062A\u062D\u062F\u064A\u062B." });
      return res.json({ user: toPublicUser(updated) });
    } catch (e) {
      const err = e;
      console.error("Account update error:", err?.message ?? e);
      if (err?.stack) console.error(err.stack);
      return res.status(500).json({ message: err?.message ?? "\u0641\u0634\u0644 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062D\u0633\u0627\u0628." });
    }
  })().catch(next);
});
router5.get("/google", import_passport.default.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));
router5.get(
  "/google/callback",
  import_passport.default.authenticate("google", { session: true, failureRedirect: "/login?error=google" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);
var authRoutes_default = router5;

// server/auth/sessionStore.ts
var import_express_session = __toESM(require("express-session"), 1);
var import_drizzle_orm6 = require("drizzle-orm");
init_db();
init_schema();
function getExpire(sess) {
  const exp = sess.cookie?.expires;
  if (exp instanceof Date) return exp;
  if (typeof exp === "number") return new Date(exp);
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
}
var SQLiteStore = class extends import_express_session.default.Store {
  get(sid, cb) {
    db.select().from(sessions).where((0, import_drizzle_orm6.eq)(sessions.sid, sid)).limit(1).then((rows) => {
      if (rows.length === 0) return cb(null, null);
      const row = rows[0];
      if (row.expire && new Date(row.expire).getTime() < Date.now()) {
        db.delete(sessions).where((0, import_drizzle_orm6.eq)(sessions.sid, sid)).then(() => cb(null, null)).catch(cb);
        return;
      }
      try {
        const sess = JSON.parse(row.sess);
        cb(null, sess);
      } catch {
        cb(null, null);
      }
    }).catch(cb);
  }
  set(sid, sess, cb) {
    const expire = getExpire(sess);
    const sessStr = JSON.stringify(sess);
    const done = cb ?? (() => {
    });
    db.delete(sessions).where((0, import_drizzle_orm6.eq)(sessions.sid, sid)).then(
      () => db.insert(sessions).values({ sid, sess: sessStr, expire }).then(() => done()).catch(done)
    ).catch(done);
  }
  destroy(sid, cb) {
    const done = cb ?? (() => {
    });
    db.delete(sessions).where((0, import_drizzle_orm6.eq)(sessions.sid, sid)).then(() => done()).catch(done);
  }
  touch(sid, sess, cb) {
    const expire = getExpire(sess);
    const done = cb ?? (() => {
    });
    db.update(sessions).set({ expire }).where((0, import_drizzle_orm6.eq)(sessions.sid, sid)).then(() => done()).catch(done);
  }
  /** حذف الجلسة القديمة ثم استدعاء generate الذي يضيفه express-session على الـ store. */
  regenerate(req, cb) {
    const oldSid = req.sessionID;
    if (!oldSid) {
      cb();
      return;
    }
    this.destroy(oldSid, (err) => {
      if (err) return cb(err);
      const s = this;
      if (typeof s.generate === "function") s.generate(req);
      cb();
    });
  }
};
function createSessionStore() {
  return new SQLiteStore();
}

// server/middleware/adminAuth.ts
var requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645." });
  }
  const user = req.user;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "\u0644\u064A\u0633 \u0644\u062F\u064A\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645." });
  }
  next();
};

// server/routes.ts
var import_path10 = __toESM(require("path"), 1);
var import_promises4 = require("fs/promises");
var SAFE_NAME = /^[a-zA-Z0-9._-]+$/;
async function registerRoutes(httpServer2, app2) {
  const { initHierarchy: initHierarchy2 } = await Promise.resolve().then(() => (init_hierarchyStore(), hierarchyStore_exports));
  await initHierarchy2();
  await ensurePasswordResetTable();
  app2.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "sharfedu-api" });
  });
  app2.get("/attached_assets/:folder/:filename", async (req, res) => {
    const { folder, filename } = req.params;
    if (!SAFE_NAME.test(folder) || !SAFE_NAME.test(filename)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    const pathsToTry = [
      import_path10.default.join(process.cwd(), "attached_assets", folder, filename),
      import_path10.default.join(process.cwd(), "server", "public", "attached_assets", folder, filename),
      import_path10.default.join(process.cwd(), "..", "attached_assets", folder, filename)
    ];
    for (const p of pathsToTry) {
      try {
        await (0, import_promises4.access)(p);
        return res.sendFile(p);
      } catch {
      }
    }
    res.status(404).json({ error: "File not found" });
  });
  const sessionStore = createSessionStore();
  const isSecure = process.env.NODE_ENV === "production" && (process.env.BASE_URL?.startsWith("https:") ?? false);
  app2.use(
    (0, import_express_session2.default)({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "sharf-edu-session-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      name: "sharf.sid",
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        httpOnly: true,
        secure: isSecure,
        sameSite: "lax"
      }
    })
  );
  app2.use(import_passport2.default.initialize());
  app2.use(import_passport2.default.session());
  app2.use("/api/auth", authRoutes_default);
  app2.get("/api/school-year", async (_req, res) => {
    try {
      const rows = await db.select().from(platformStats);
      const map = {};
      for (const r of rows) {
        if (["school_year_start", "school_year_end", "semester1_end"].includes(r.key)) {
          map[r.key] = r.value;
        }
      }
      res.json({
        schoolYearStart: map.school_year_start || "2025-08-25",
        schoolYearEnd: map.school_year_end || "2026-06-15",
        semester1End: map.semester1_end || "2025-12-15"
      });
    } catch {
      res.json({
        schoolYearStart: "2025-08-25",
        schoolYearEnd: "2026-06-15",
        semester1End: "2025-12-15"
      });
    }
  });
  app2.use("/api/content", contentRoutes_default);
  app2.get("/api/public/structure", async (_req, res) => {
    try {
      const { getDisplayStructure: getDisplayStructure2, getAllLessons: getAllLessons2 } = await Promise.resolve().then(() => (init_cms_hierarchy(), cms_hierarchy_exports));
      const displayStructure = getDisplayStructure2();
      const flatLessons = getAllLessons2();
      const lessonTitles = {};
      for (const l of flatLessons) lessonTitles[l.lessonId] = l.title;
      res.json({ displayStructure, lessonTitles });
    } catch (e) {
      console.error("Public structure:", e);
      res.json({ displayStructure: {}, lessonTitles: {} });
    }
  });
  app2.get("/api/seo", async (req, res) => {
    try {
      const seoPath = req.query.path || "/";
      const pathNorm = seoPath.startsWith("/") ? seoPath : `/${seoPath}`;
      const { getSeoForPath: getSeoForPath2 } = await Promise.resolve().then(() => (init_cmsStorage(), cmsStorage_exports));
      const row = await getSeoForPath2(pathNorm);
      const fallback = { pagePath: pathNorm, title: null, description: null, keywords: null, ogTitle: null, ogDescription: null, ogImage: null };
      res.json(row ? { ...fallback, ...row } : fallback);
    } catch (e) {
      console.error("SEO fetch:", e);
      res.json({ pagePath: req.query.path || "/", title: null, description: null, keywords: null });
    }
  });
  const videoInfoCache = /* @__PURE__ */ new Map();
  const CACHE_TTL = 36e5;
  const CACHE_MAX = 500;
  function getCachedInfo(id) {
    const entry = videoInfoCache.get(id);
    if (!entry) return void 0;
    if (Date.now() - entry.ts > CACHE_TTL) {
      videoInfoCache.delete(id);
      return void 0;
    }
    return entry.data;
  }
  function setCachedInfo(id, info) {
    if (videoInfoCache.size >= CACHE_MAX) {
      const oldest = videoInfoCache.keys().next().value;
      if (oldest) videoInfoCache.delete(oldest);
    }
    videoInfoCache.set(id, { data: info, ts: Date.now() });
  }
  function formatSeconds(total) {
    const h = Math.floor(total / 3600);
    const m = Math.floor(total % 3600 / 60);
    const s = total % 60;
    const durationCompact = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
    let duration = "";
    if (h > 0) duration += `${h} \u0633\u0627\u0639\u0629 `;
    if (m > 0) duration += `${m} \u062F\u0642\u064A\u0642\u0629 `;
    if (s > 0 && h === 0) duration += `${s} \u062B\u0627\u0646\u064A\u0629`;
    duration = duration.trim() || "0 \u062B\u0627\u0646\u064A\u0629";
    return { duration, durationCompact };
  }
  function formatRelativeDate(isoDate) {
    try {
      const d = new Date(isoDate);
      const now = /* @__PURE__ */ new Date();
      const diffMs = now.getTime() - d.getTime();
      const days = Math.floor(diffMs / 864e5);
      if (days < 1) return "\u0627\u0644\u064A\u0648\u0645";
      if (days < 30) return `\u0645\u0646\u0630 ${days} \u064A\u0648\u0645`;
      const months = Math.floor(days / 30);
      if (months < 12) return `\u0645\u0646\u0630 ${months} \u0634\u0647\u0631`;
      const years = Math.floor(months / 12);
      return `\u0645\u0646\u0630 ${years} \u0633\u0646\u0629`;
    } catch {
      return "";
    }
  }
  async function getVideoInfoViaOembed(videoId) {
    try {
      const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const data = await resp.json();
      return {
        title: data.title || "",
        channelName: data.author_name || "",
        duration: "",
        durationCompact: "",
        likeCount: "0",
        viewCount: "0",
        publishedAt: "",
        commentCount: "0"
      };
    } catch {
      return null;
    }
  }
  app2.get("/api/content/youtube-video-info", async (req, res) => {
    try {
      const ids = (req.query.ids || "").split(",").filter(Boolean).slice(0, 20);
      if (ids.length === 0) return res.json({});
      const result = {};
      const uncached = [];
      for (const id of ids) {
        const cached = getCachedInfo(id);
        if (cached) result[id] = cached;
        else uncached.push(id);
      }
      if (uncached.length > 0) {
        const apiKey = process.env.YOUTUBE_API_KEY?.trim();
        if (apiKey) {
          try {
            const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${uncached.join(",")}&key=${apiKey}`;
            const apiResp = await fetch(url);
            if (apiResp.ok) {
              const data = await apiResp.json();
              for (const item of data.items || []) {
                const iso = item.contentDetails?.duration || "";
                const m2 = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
                const totalSec = m2 ? parseInt(m2[1] || "0") * 3600 + parseInt(m2[2] || "0") * 60 + parseInt(m2[3] || "0") : 0;
                const { duration, durationCompact } = totalSec > 0 ? formatSeconds(totalSec) : { duration: "", durationCompact: "" };
                const info = {
                  title: item.snippet?.title || "",
                  channelName: item.snippet?.channelTitle || "",
                  duration,
                  durationCompact,
                  likeCount: item.statistics?.likeCount || "0",
                  viewCount: item.statistics?.viewCount || "0",
                  publishedAt: item.snippet?.publishedAt ? formatRelativeDate(item.snippet.publishedAt) : "",
                  commentCount: item.statistics?.commentCount || "0"
                };
                result[item.id] = info;
                setCachedInfo(item.id, info);
              }
            }
          } catch {
          }
        }
        const stillMissing = uncached.filter((id) => !result[id]);
        if (stillMissing.length > 0) {
          await Promise.allSettled(
            stillMissing.map(async (id) => {
              const info = await getVideoInfoViaOembed(id);
              if (info) {
                result[id] = info;
                setCachedInfo(id, info);
              }
            })
          );
        }
      }
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to fetch video info" });
    }
  });
  app2.use(pdf_extractor_default);
  app2.use(extract_questions_default);
  app2.use("/api/admin", requireAdmin, adminRoutes_default);
  const cmsRoutes = (await Promise.resolve().then(() => (init_cmsRoutes(), cmsRoutes_exports))).default;
  app2.use("/api/admin/cms", requireAdmin, cmsRoutes);
  app2.post("/api/ai/summarize", async (req, res) => {
    try {
      const { lessonTitle, subjectName } = req.body;
      const genAI = getGeminiClient();
      if (!genAI) {
        return res.status(503).json({
          error: "\u0627\u0644\u0645\u0639\u0644\u0645 \u0627\u0644\u0630\u0643\u064A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D \u062D\u0627\u0644\u064A\u0627\u064B."
        });
      }
      const prompt = `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u062A\u0639\u0644\u064A\u0645\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u062F\u0631\u0648\u0633 \u0644\u0644\u0637\u0644\u0627\u0628 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u064A\u0646. \u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0645\u0644\u062E\u0635 \u0645\u0641\u064A\u062F \u0648\u0645\u0646\u0638\u0645.

\u0642\u0645 \u0628\u0625\u0646\u0634\u0627\u0621 \u0645\u0644\u062E\u0635 \u062A\u0639\u0644\u064A\u0645\u064A \u0645\u062E\u062A\u0635\u0631 \u0648\u0645\u0641\u064A\u062F \u0644\u062F\u0631\u0633 "${lessonTitle || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}" \u0641\u064A \u0645\u0627\u062F\u0629 "${subjectName || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F"}".

\u0627\u062A\u0628\u0639 \u0647\u0630\u0627 \u0627\u0644\u062A\u0646\u0633\u064A\u0642:
\u0627\u0644\u0646\u0642\u0627\u0637 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629:
- [\u0646\u0642\u0637\u0629 1]
- [\u0646\u0642\u0637\u0629 2]
- [\u0646\u0642\u0637\u0629 3]

\u0627\u0644\u0645\u0641\u0627\u0647\u064A\u0645 \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629:
- [\u0645\u0641\u0647\u0648\u0645 1]
- [\u0645\u0641\u0647\u0648\u0645 2]

\u0646\u0635\u0627\u0626\u062D \u0644\u0644\u0645\u0630\u0627\u0643\u0631\u0629:
- [\u0646\u0635\u064A\u062D\u0629 1]
- [\u0646\u0635\u064A\u062D\u0629 2]`;
      const model = getGeminiModel(genAI);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let summary = response.text();
      if (!summary?.trim()) {
        summary = "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u062F\u0631\u0633. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649.";
      }
      res.json({ summary });
    } catch (error) {
      console.error("[Summarize] Error:", error?.message);
      return res.status(500).json({
        error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u062F\u0631\u0633. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649."
      });
    }
  });
  app2.get(api.courses.list.path, async (req, res) => {
    const gradeLevel = req.query.gradeLevel;
    const courses2 = await storage.getCourses(gradeLevel);
    res.json(courses2);
  });
  app2.post("/api/progress/lesson", async (req, res) => {
    try {
      const { userId, subjectSlug, lessonId, lessonCompleted, videoCompleted, questionsScore, questionsProgress, totalProgress } = req.body;
      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "userId, subjectSlug, and lessonId are required" });
      }
      const progress = await storage.saveLessonProgress(
        userId,
        subjectSlug,
        lessonId,
        { lessonCompleted, videoCompleted, questionsScore, questionsProgress, totalProgress }
      );
      res.json(progress);
    } catch (error) {
      console.error("Error saving lesson progress:", error);
      res.status(500).json({ error: "Failed to save lesson progress" });
    }
  });
  app2.get("/api/progress/lesson", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      const subjectSlug = req.query.subjectSlug;
      const lessonId = req.query.lessonId;
      if (!userId || !subjectSlug || !lessonId) {
        return res.status(400).json({ error: "userId, subjectSlug, and lessonId are required" });
      }
      const progress = await storage.getLessonProgress(userId, subjectSlug, lessonId);
      res.json(progress);
    } catch (error) {
      console.error("Error getting lesson progress:", error);
      res.status(500).json({ error: "Failed to get lesson progress" });
    }
  });
  app2.get("/api/progress/user", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId);
      const subjectSlug = req.query.subjectSlug;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }
      const progress = await storage.getUserProgress(userId, subjectSlug);
      res.json(progress);
    } catch (error) {
      console.error("Error getting user progress:", error);
      res.status(500).json({ error: "Failed to get user progress" });
    }
  });
  const existingCourses = await storage.getCourses();
  if (existingCourses.length === 0) {
    const initialCourses = [
      { title: "\u0627\u0644\u0639\u0644\u0648\u0645", description: "\u0627\u0633\u062A\u0643\u0634\u0641 \u0639\u062C\u0627\u0626\u0628 \u0627\u0644\u0637\u0628\u064A\u0639\u0629 \u0648\u0627\u0644\u0643\u0648\u0646", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+1" },
      { title: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", description: "\u0623\u0633\u0627\u0633\u064A\u0627\u062A \u0627\u0644\u062D\u0633\u0627\u0628 \u0648\u0627\u0644\u0645\u0646\u0637\u0642", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+1" },
      { title: "\u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0627\u062A", description: "\u062A\u0627\u0631\u064A\u062E\u0646\u0627 \u0648\u062D\u0636\u0627\u0631\u062A\u0646\u0627 \u0627\u0644\u0639\u0631\u064A\u0642\u0629", gradeLevel: "1", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+1" },
      { title: "\u0627\u0644\u0639\u0644\u0648\u0645", description: "\u062A\u062C\u0627\u0631\u0628 \u0639\u0644\u0645\u064A\u0629 \u0645\u062A\u0642\u062F\u0645\u0629", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+2" },
      { title: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", description: "\u0627\u0644\u062C\u0628\u0631 \u0648\u0627\u0644\u0647\u0646\u062F\u0633\u0629 \u0644\u0644\u0645\u0633\u062A\u0648\u0649 \u0627\u0644\u062B\u0627\u0646\u064A", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+2" },
      { title: "\u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0627\u062A", description: "\u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0627 \u0648\u0627\u0644\u0645\u062C\u062A\u0645\u0639", gradeLevel: "2", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+2" },
      { title: "\u0627\u0644\u0639\u0644\u0648\u0645", description: "\u0627\u0644\u062A\u062D\u0636\u064A\u0631 \u0644\u0644\u0641\u064A\u0632\u064A\u0627\u0621 \u0648\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "science", imageUrl: "https://placehold.co/600x400?text=Science+3" },
      { title: "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A", description: "\u0627\u0644\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u064A \u0627\u0644\u0645\u062A\u0642\u062F\u0645", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "math", imageUrl: "https://placehold.co/600x400?text=Math+3" },
      { title: "\u0627\u0644\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0627\u062A", description: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062D\u062F\u064A\u062B \u0648\u0627\u0644\u0645\u0639\u0627\u0635\u0631", gradeLevel: "3", stageSlug: "elementary", subjectSlug: "social", imageUrl: "https://placehold.co/600x400?text=Social+3" }
    ];
    for (const course of initialCourses) {
      await storage.createCourse(course);
    }
  }
  return httpServer2;
}

// server/static.ts
var import_express7 = __toESM(require("express"), 1);
var import_fs4 = require("fs");
var import_path11 = __toESM(require("path"), 1);
var publicPath = import_path11.default.resolve(process.cwd(), "server", "public");
function serveStatic(app2) {
  if (!(0, import_fs4.existsSync)(publicPath)) {
    if (process.env.NODE_ENV === "production") {
      return;
    }
    throw new Error(
      `Could not find the build directory: ${publicPath}, make sure to build the client first (npm run build)`
    );
  }
  app2.use(
    import_express7.default.static(publicPath, {
      index: "index.html",
      maxAge: "1y",
      immutable: true,
      setHeaders: (res, filePath) => {
        const ext = import_path11.default.extname(filePath).toLowerCase();
        if (ext === ".html") {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-cache");
        } else if (ext === ".js" || ext === ".mjs") {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (ext === ".css") {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      }
    })
  );
  app2.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "Not Found" });
    }
    next();
  });
  app2.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    const indexFile = import_path11.default.resolve(publicPath, "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexFile);
  });
}

// server/index.ts
var import_http = require("http");
var app = (0, import_express8.default)();
app.set("trust proxy", 1);
var httpServer = (0, import_http.createServer)(app);
var BASE_URL2 = process.env.BASE_URL || "";
var allowedOrigins = [
  "https://sharfedu.com",
  "https://www.sharfedu.com"
];
if (BASE_URL2) allowedOrigins.push(BASE_URL2);
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5000", "http://127.0.0.1:5000");
}
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});
app.use(
  import_express8.default.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    }
  })
);
app.use(import_express8.default.urlencoded({ extended: false }));
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      log(`${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  next();
});
(async () => {
  await registerRoutes(httpServer, app);
  app.use((err, _req, res, next) => {
    const status = err.status || err.statusCode || 500;
    console.error("Server Error:", err.message);
    if (res.headersSent) {
      return next(err);
    }
    const message = process.env.NODE_ENV === "production" && status >= 500 ? "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649." : err.message || "Internal Server Error";
    return res.status(status).json({ message });
  });
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite: setupVite2 } = await Promise.resolve().then(() => (init_vite(), vite_exports));
    await setupVite2(httpServer, app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.HOST || "0.0.0.0";
  httpServer.listen(port, host, () => {
    log(`serving on http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${port}`);
    const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
    log(`Google OAuth: ${hasGoogle ? "enabled" : "disabled"}`);
    const hasYoutube = !!process.env.YOUTUBE_API_KEY?.trim();
    log(`YouTube Data API (\u0645\u062F\u0629/\u0645\u0634\u0627\u0647\u062F\u0627\u062A \u0627\u0644\u0641\u064A\u062F\u064A\u0648): ${hasYoutube ? "enabled" : "disabled"}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} is already in use.`, "error");
    } else {
      log(`Server error: ${err.message}`, "error");
    }
    process.exit(1);
  });
})().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  log
});
