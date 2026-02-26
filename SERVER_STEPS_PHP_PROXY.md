# خطوات السيرفر — تفعيل تسجيل الدخول (البروكسي PHP)

تم على جهازك: إضافة `VITE_API_BASE=/api-proxy.php` في `.env`، تشغيل `npm run build`، ورفع التعديلات إلى GitHub.

نفّذ الخطوات التالية **على السيرفر عبر SSH** بالترتيب.

---

## 1) الدخول لمجلد المشروع

```bash
cd /home/master/applications/cmkdrtgqcv/public_html
```

---

## 2) جلب آخر التحديثات من GitHub

```bash
git fetch origin
git reset --hard origin/main
```

(إذا طُلِب اسم المستخدم وكلمة المرور أو Token، أدخلهما.)

---

## 3) إضافة متغير البروكسي في .env على السيرفر

افتح ملف `.env`:

```bash
nano .env
```

أضف السطر التالي (أو عدّل القيمة إن وُجدت):

```
VITE_API_BASE=/api-proxy.php
```

احفظ: **Ctrl+O** ثم **Enter**، ثم خروج: **Ctrl+X**.

---

## 4) بناء المشروع على السيرفر

```bash
npm run build
```

انتظر حتى ينتهي (ستظهر رسالة مثل "copied built index.html and assets to project root").

---

## 5) التأكد من وجود api-proxy.php في الجذر

```bash
ls -la api-proxy.php
```

إن لم يظهر الملف، انسخه من مجلد public:

```bash
cp public/api-proxy.php ./
```

---

## 6) إعداد رابط callback جوجل في .env

افتح `.env` مرة أخرى:

```bash
nano .env
```

تأكد من وجود السطر (أو أضفه):

```
GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback
```

احفظ واخرج (Ctrl+O، Enter، Ctrl+X).

---

## 7) إضافة الرابط في Google Cloud Console

1. ادخل إلى: https://console.cloud.google.com/apis/credentials  
2. اختر تطبيق OAuth 2.0 الخاص بموقعك.  
3. في **Authorized redirect URIs** أضف:
   ```
   https://sharfedu.com/api-proxy.php/api/auth/google/callback
   ```
4. احفظ التغييرات.

---

## 8) تشغيل Node.js

```bash
node dist/index.cjs
```

اترك الطرفية مفتوحة (أو استخدم pm2 إن كان مُعداً).

---

## 9) اختبار الموقع

افتح **https://sharfedu.com** وجرّب:
- تسجيل الدخول بالبريد وكلمة المرور  
- تسجيل الدخول عبر Google  

إذا ظهر أي خطأ، راجع سجلات Apache أو Node أو راسل الدعم.
