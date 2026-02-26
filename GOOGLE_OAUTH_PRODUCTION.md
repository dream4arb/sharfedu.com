# إعداد تسجيل الدخول بـ Google للإنتاج (sharfedu.com)

على السيرفر نستخدم **api-proxy.php** لتوجيه طلبات الـ API إلى Node، لذلك رابط الـ callback من Google يجب أن يمر عبر البروكسي.

## 1. على السيرفر (ملف .env)

ضع ملف `.env` داخل **مجلد المشروع (git_repo)**. التطبيق يقرأه تلقائياً عند كل تشغيل (حل load-env في الكود):

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback
```

- شغّل التطبيق دائماً من داخل `git_repo` (مثلاً `cd ~/applications/.../git_repo && node dist/index.cjs`).
- بعد كل بناء: أعد تشغيل العملية فقط؛ لا حاجة لتعديل .env أو نسخ كود يدوياً.

## 2. في Google Cloud Console

1. اذهب إلى: **APIs & Services → Credentials** وافتح **Client ID for Web application**.
2. في **Authorized redirect URIs** تأكد من وجود الرابط التالي (أضفه إن لم يكن موجوداً):
   ```
   https://sharfedu.com/api-proxy.php/api/auth/google/callback
   ```
3. احفظ (Save).

يمكنك الإبقاء أيضاً على:
- `https://sharfedu.com/api/auth/google/callback` إذا كان Apache يوجّه `/api` إلى Node.
- `http://localhost:5000/api/auth/google/callback` للتطوير المحلي.
