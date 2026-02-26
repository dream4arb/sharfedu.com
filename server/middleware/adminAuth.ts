import type { RequestHandler } from "express";
import type { User } from "@shared/models/auth";

/**
 * Middleware: يحمي لوحة التحكم — لا يسمح إلا للمدير (Admin).
 * يتطلب تسجيل الدخول أولاً ثم التحقق من role === 'admin'.
 */
export const requireAdmin: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "يجب تسجيل الدخول للوصول إلى لوحة التحكم." });
  }
  const user = req.user as User;
  if (user.role !== "admin") {
    return res.status(403).json({ message: "ليس لديك صلاحية الوصول إلى لوحة التحكم." });
  }
  next();
};
