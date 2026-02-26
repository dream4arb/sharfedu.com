import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
// @ts-expect-error no types for passport-google-oauth20
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "../db";
import { users, passwordResetCodes } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendPasswordResetCode } from "../lib/sendMail";

const router = Router();

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
      role: string;
      stageSlug?: string | null;
      gradeId?: string | null;
    }
  }
}

function toPublicUser(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    email: u.email,
    firstName: u.firstName ?? null,
    lastName: u.lastName ?? null,
    profileImageUrl: u.profileImageUrl ?? null,
    role: u.role,
    stageSlug: u.stageSlug ?? null,
    gradeId: u.gradeId ?? null,
  };
}

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
        if (rows.length === 0) return done(null, false, { message: "البريد أو كلمة المرور غير صحيحة." });
        const user = rows[0];
        if (!user.password) return done(null, false, { message: "سجّل الدخول عبر جوجل أو استخدم استعادة كلمة المرور." });
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return done(null, false, { message: "البريد أو كلمة المرور غير صحيحة." });
        return done(null, toPublicUser(user));
      } catch (e) {
        return done(e as Error);
      }
    }
  )
);

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const BASE_URL = process.env.BASE_URL || process.env.APP_URL || "http://localhost:5000";

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BASE_URL.replace(/\/$/, "")}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (_accessToken: string, _refreshToken: string, profile: { id: string; emails?: { value: string }[]; name?: { givenName?: string; familyName?: string }; photos?: { value: string }[] }, done: (err: Error | null, user?: Express.User) => void) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) return done(new Error("لم يتم الحصول على البريد من جوجل."));
          const googleId = profile.id;
          const existing = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
          if (existing.length > 0) return done(null, toPublicUser(existing[0]));
          const byEmail = await db.select().from(users).where(eq(users.email, email)).limit(1);
          if (byEmail.length > 0) {
            await db.update(users).set({ googleId, updatedAt: new Date() }).where(eq(users.id, byEmail[0].id));
            const updated = await db.select().from(users).where(eq(users.id, byEmail[0].id)).limit(1);
            return done(null, toPublicUser(updated[0]));
          }
          const [inserted] = await db
            .insert(users)
            .values({
              email,
              googleId,
              firstName: profile.name?.givenName ?? null,
              lastName: profile.name?.familyName ?? null,
              profileImageUrl: profile.photos?.[0]?.value ?? null,
              role: "user",
            })
            .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
          if (!inserted) return done(new Error("فشل إنشاء المستخدم."));
          return done(null, toPublicUser(inserted as typeof users.$inferSelect));
        } catch (e) {
          return done(e as Error);
        }
      }
    )
  );
}

passport.serializeUser((user: Express.User, done) => done(null, user.id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (rows.length === 0) return done(null, null);
    return done(null, toPublicUser(rows[0]));
  } catch (e) {
    return done(e as Error);
  }
});

function requireAuth(req: Request, res: Response, next: (err?: unknown) => void) {
  if (req.isAuthenticated?.()) return next();
  return res.status(401).json({ message: "يجب تسجيل الدخول." });
}

router.get("/user", (req, res) => {
  if (req.isAuthenticated?.() && req.user) return res.json(req.user);
  res.json(null);
});

router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const emailNorm = String(email ?? "").toLowerCase().trim();
    if (!emailNorm || !password || password.length < 6)
      return res.status(400).json({ message: "البريد وكلمة المرور (6 أحرف على الأقل) مطلوبان." });
    const existing = await db.select().from(users).where(eq(users.email, emailNorm)).limit(1);
    if (existing.length > 0) return res.status(400).json({ message: "هذا البريد مسجّل مسبقاً." });
    const hash = await bcrypt.hash(password, 10);
    // لا نخزن الاسم من صفحة التسجيل (لتجنب الإكمال التلقائي من المتصفح). الطالب يضيف اسمه لاحقاً من البروفايل.
    const [inserted] = await db
      .insert(users)
      .values({
        email: emailNorm,
        password: hash,
        firstName: null,
        lastName: null,
        role: "user",
      })
      .returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
    if (!inserted) return res.status(500).json({ message: "فشل إنشاء الحساب." });
    req.login(inserted as Express.User, (err) => {
      if (err) return res.status(500).json({ message: "تم إنشاء الحساب لكن تسجيل الدخول فشل." });
      res.json({ user: toPublicUser(inserted as typeof users.$inferSelect) });
    });
  } catch (e) {
    console.error("Register error:", e);
    res.status(500).json({ message: "خطأ في الخادم." });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err: Error | null, user: Express.User | false, info?: { message?: string }) => {
    if (err) return res.status(500).json({ message: err.message || "خطأ في الخادم." });
    if (!user) return res.status(401).json({ message: info?.message || "البريد أو كلمة المرور غير صحيحة." });
    req.login(user, (loginErr) => {
      if (loginErr) return res.status(500).json({ message: "فشل تسجيل الدخول." });
      res.json({ user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session?.destroy(() => res.json({ ok: true }));
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    if (!email) return res.status(400).json({ message: "البريد الإلكتروني مطلوب." });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.delete(passwordResetCodes).where(eq(passwordResetCodes.email, email));
    await db.insert(passwordResetCodes).values({ email, code, expiresAt });
    const result = await sendPasswordResetCode(email, code);
    const message = result.sent
      ? "تم إرسال الرمز إلى بريدك."
      : result.error
        ? `تم إنشاء الرمز لكن فشل الإرسال: ${result.error}`
        : "تم إنشاء الرمز. (الإرسال الفعلي يتطلب إعداد SMTP في .env.)";
    res.json({ message, code: result.sent ? undefined : code });
  } catch (e) {
    console.error("Forgot password error:", e);
    res.status(500).json({ message: "خطأ في الخادم." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body as { email?: string; code?: string; newPassword?: string };
    const emailNorm = String(email ?? "").toLowerCase().trim();
    if (!emailNorm || !code || !newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "البريد والرمز وكلمة المرور الجديدة (6 أحرف على الأقل) مطلوبة." });
    const now = new Date();
    const rows = await db
      .select()
      .from(passwordResetCodes)
      .where(
        and(
          eq(passwordResetCodes.email, emailNorm),
          eq(passwordResetCodes.code, String(code).trim()),
          gt(passwordResetCodes.expiresAt, now)
        )
      )
      .limit(1);
    if (rows.length === 0) return res.status(400).json({ message: "الرمز غير صالح أو منتهي الصلاحية." });
    const hash = await bcrypt.hash(newPassword, 10);
    await db.update(users).set({ password: hash, updatedAt: now }).where(eq(users.email, emailNorm));
    await db.delete(passwordResetCodes).where(eq(passwordResetCodes.email, emailNorm));
    res.json({ message: "تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن." });
  } catch (e) {
    console.error("Reset password error:", e);
    res.status(500).json({ message: "خطأ في الخادم." });
  }
});

router.put("/account", requireAuth, (req: Request, res: Response, next: (err?: unknown) => void) => {
  (async () => {
    try {
      const userId = (req.user as Express.User)?.id;
      console.log("[auth] PUT /account", userId ? "userId=" + userId : "no user");
      if (!userId) return res.status(401).json({ message: "يجب تسجيل الدخول." });
      const body = (req.body && typeof req.body === "object" ? req.body : {}) as {
        email?: string;
        currentPassword?: string;
        newPassword?: string;
        firstName?: string;
        lastName?: string;
        profileImageUrl?: string;
      };
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (rows.length === 0) return res.status(404).json({ message: "المستخدم غير موجود." });
    const current = rows[0];
    const updates: {
      updatedAt: Date;
      email?: string;
      password?: string;
      firstName?: string | null;
      lastName?: string | null;
      profileImageUrl?: string | null;
    } = { updatedAt: new Date() };

    if (body.email !== undefined && body.email !== null) {
      const emailNorm = String(body.email).toLowerCase().trim();
      if (!emailNorm) return res.status(400).json({ message: "البريد الإلكتروني مطلوب." });
      const existing = await db.select().from(users).where(eq(users.email, emailNorm)).limit(1);
      if (existing.length > 0 && existing[0].id !== userId) return res.status(400).json({ message: "هذا البريد مسجّل لحساب آخر." });
      updates.email = emailNorm;
    }
    if (body.newPassword !== undefined && body.newPassword !== null && String(body.newPassword).trim().length >= 6) {
      const curPass = String(body.currentPassword ?? "").trim();
      if (!curPass) return res.status(400).json({ message: "أدخل كلمة المرور الحالية لتغيير كلمة المرور." });
      if (!current.password) return res.status(400).json({ message: "سجّل الدخول بكلمة مرور لتتمكن من تغييرها." });
      const ok = await bcrypt.compare(curPass, current.password);
      if (!ok) return res.status(400).json({ message: "كلمة المرور الحالية غير صحيحة." });
      updates.password = await bcrypt.hash(String(body.newPassword).trim(), 10);
    }
    if (body.firstName !== undefined && body.firstName !== null) updates.firstName = String(body.firstName).trim() || null;
    if (body.lastName !== undefined && body.lastName !== null) updates.lastName = String(body.lastName).trim() || null;
    if (body.profileImageUrl !== undefined && body.profileImageUrl !== null) updates.profileImageUrl = String(body.profileImageUrl).trim() || null;

    const result = await db.update(users).set(updates).where(eq(users.id, userId)).returning({ id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName, profileImageUrl: users.profileImageUrl, role: users.role, stageSlug: users.stageSlug, gradeId: users.gradeId });
    const updated = result[0];
    if (!updated) return res.status(500).json({ message: "فشل قراءة الحساب بعد التحديث." });
    return res.json({ user: toPublicUser(updated) });
    } catch (e) {
      const err = e as Error;
      console.error("Account update error:", err?.message ?? e);
      if (err?.stack) console.error(err.stack);
      return res.status(500).json({ message: err?.message ?? "فشل تحديث الحساب." });
    }
  })().catch(next);
});

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: true, failureRedirect: "/login?error=google" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

export default router;
export { requireAuth, toPublicUser };
