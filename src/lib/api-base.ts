/**
 * قاعدة مسار الـ API.
 * الإنتاج (توجيه /api مباشرة إلى Node): اترك VITE_API_BASE فارغاً.
 * الدخول عبر جوجل يستخدم دائماً الرابط المباشر: https://sharfedu.com/api/auth/google/callback
 */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function getApiUrl(path: string): string {
  return API_BASE + path;
}
