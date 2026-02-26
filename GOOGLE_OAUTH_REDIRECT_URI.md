# إصلاح خطأ 400: redirect_uri_mismatch (دخول جوجل)

## السبب
Google يقبل فقط عناوين callback مسجّلة مسبقاً. إذا كان الرابط المرسل لا يطابق بالضبط أحد المسجّلين، يظهر **redirect_uri_mismatch**.

## ما يجب إضافته في Google Cloud Console

1. افتح [Google Cloud Console](https://console.cloud.google.com/) → مشروعك.
2. **APIs & Services** → **Credentials** → اختر **OAuth 2.0 Client ID** (نوع Web application).
3. في **Authorized redirect URIs** أضف **كل** العناوين التالية (بدون شرطة في النهاية):

   **للإنتاج (السيرفر):**
   ```
   https://sharfedu.com/api/auth/google/callback
   ```

   **للتجربة المحلية (إن كنت تختبر على localhost):**
   ```
   http://localhost:5000/api/auth/google/callback
   ```

4. احفظ (Save).

## على السيرفر (ملف .env)

تأكد أن السيرفر يستخدم نفس الرابط بالضبط:

```env
GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback
```

- بدون شرطة في النهاية.
- يجب أن يكون **https** في الإنتاج.

## ملاحظة
بعد تعديل Redirect URIs في Google قد يستغرق التطبيق دقائق قليلة. جرّب تسجيل الدخول عبر جوجل مرة أخرى بعد الحفظ.
