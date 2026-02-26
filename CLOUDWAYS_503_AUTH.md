# تجنب 503 عند تسجيل الدخول (Cloudways)

## ما تم تطبيقه

1. **GOOGLE_CALLBACK_URL** في `.env`: `https://sharfedu.com/api/auth/google/callback` (بدون api-proxy.php).
2. **المسار برمجياً** في `server/auth/localAuth.ts`: يُستخدم المتغير من .env مع احتياطي للإنتاج `https://sharfedu.com/api/auth/google/callback`.
3. **api-proxy.php**: لا يُستخدم لمسارات المصادقة؛ التوثيق داخل الملف يوضح أن توجيه `/api` يجب أن يكون مباشرة إلى Node.
4. **CORS**: تمت إضافة middleware في `server/index.ts` يسمح بـ:
   - `https://sharfedu.com` و `https://www.sharfedu.com`
   - localhost للتطوير
   - `Access-Control-Allow-Credentials: true` للجلسات والكوكيز
5. **.htaccess**: التأكيد أن طلبات `/api` تُوجّه فقط إلى Node على المنفذ 5000 وليس إلى api-proxy.php.

## إذا استمر 503 على Cloudways

خطأ **503 Service Unavailable** يعني عادة أن البروكسي (Nginx أو Apache) لا يستطيع الاتصال بالخادم الخلفي (Node).

- **تأكد أن تطبيق Node يعمل** على المنفذ 5000 (مثلاً عبر PM2: `pm2 status` و `pm2 logs`).
- على **Cloudways** قد يكون Nginx هو المدخل الأول. تحقق من إعدادات التطبيق:
  - من لوحة Cloudways: **Application** → **Application Settings** → **Nginx** (أو ما يعادله).
  - يجب أن يكون هناك توجيه لـ `/api` إلى `http://127.0.0.1:5000` (أو المنفذ الذي يشغّل عليه Node).
- إذا كانت الطلبات تمر عبر **Apache** فقط، فملف `.htaccess` الحالي كافٍ شرط تفعيل `mod_proxy` و `mod_proxy_http`.
- **لا تضبط** `VITE_API_BASE` على `/api-proxy.php` إذا كنت توجّه `/api` مباشرة إلى Node؛ اتركها فارغة ثم أعد البناء.

## اختبار سريع من السيرفر

```bash
# من داخل السيرفر (SSH)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5000/api/auth/user
# المتوقع: 200 (وليس 503)
```

إذا حصلت على 200 من هذا الطلب لكن المتصفح يعطي 503، فالمشكلة من إعداد البروكسي (Nginx/Apache) وليس من Node.
