# نموذج ملف .env على السيرفر (بدون تكرار)

انسخ **المربع أدناه فقط** إلى ملف `.env` على السيرفر (استبدل المحتوى كاملاً). القيم مأخوذة من OAuth 2.0 Client IDs في جوجل.

---

## الكود النهائي للصق في .env

```
DATABASE_URL=file:sqlite.db
GEMINI_API_KEY=AIzaSyAyP5cXsX4ZngiLVkPz8IPgJSUfPNdBjKY
ADMIN_EMAIL=arb998@gmail.com
GOOGLE_CLIENT_ID=949610366276-emmp2cf50jp1gkgsgga8v38e0l12rk0j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=1Tk8w7c6oxBfEmXiVSiF6JbwIojYVo4C3/nAFuKzsIo=
```

---

## مهم في Google Cloud Console

- في **Authorized redirect URIs** يجب أن يكون مضافاً بالضبط:  
  `https://sharfedu.com/api/auth/google/callback`  
  (مطابق لـ GOOGLE_CALLBACK_URL أعلاه.)
- إذا كان الموقع يستخدم **api-proxy.php** لطلبات الـ API، أضف أيضاً:  
  `https://sharfedu.com/api-proxy.php/api/auth/google/callback`  
  وغيّر في .env إلى:  
  `GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback`

بعد الحفظ:
- احفظ الملف في nano: `Ctrl+O` ثم Enter ثم `Ctrl+X`
- أعد تشغيل التطبيق: `pm2 restart all`
