# تشغيل الـ API على Cloudways بدون تعديل Nginx (دعم قياسي)

عندما لا يسمح الدعم بتعديل Nginx، يمكن استخدام **بروكسي PHP** لتمرير طلبات `/api` إلى Node.js.

---

## 1. الملفات المطلوبة

- **`public/api-proxy.php`** — موجود في المشروع، يُنسخ مع البناء إلى `server/public/` ثم إلى `public_html/` على السيرفر.
- تأكد أن **PHP** و **cURL** مفعّلان على تطبيقك (عادةً متوفران على Cloudways).

---

## 2. البناء للنشر على Cloudways

عند البناء للنشر على Cloudways، اجعل الواجهة تستدعي البروكسي:

```bash
# في جذر المشروع
# أنشئ أو عدّل .env وأضف:
VITE_API_BASE=/api-proxy.php

# ثم البناء
npm run build
```

بدون `VITE_API_BASE`، الطلبات تذهب إلى `/api/...` مباشرة (مناسب للتشغيل المحلي أو عند وجود proxy في Nginx).

---

## 3. النشر على السيرفر

1. انسخ محتويات **`server/public/`** (بما فيها `api-proxy.php`) إلى **`public_html`** على السيرفر.
2. تأكد أن **Node.js** يعمل على المنفذ **5000** (مثلاً عبر PM2).
3. لا حاجة لأي قواعد في Web Rules أو Nginx لـ `/api`.

---

## 4. آلية العمل

- المستخدم يفتح الموقع من `https://sharfedu.com`.
- الطلبات من الواجهة تذهب إلى:
  - `https://sharfedu.com/api-proxy.php/api/login`
  - `https://sharfedu.com/api-proxy.php/api/auth/user`
  - ... إلخ
- **api-proxy.php** يقرأ المسار من `PATH_INFO` (مثل `/api/login`) ويُعيد إرسال الطلب إلى `http://127.0.0.1:5000/api/login` ثم يُرجع الاستجابة للمتصفح.

---

## 5. الدخول عبر جوجل

رابط الدخول عبر جوجل يصبح أيضاً عبر البروكسي، لأن الواجهة تستخدم `getApiUrl("/api/auth/google")`، فيصبح:

`https://sharfedu.com/api-proxy.php/api/auth/google`

عند استخدام البروكسي، يجب أن يعود callback جوجل عبر البروكسي أيضاً. على السيرفر في `.env` وضمن **Google Cloud Console → Authorized redirect URIs** استخدم:

```env
GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback
```

وأضف في Google: `https://sharfedu.com/api-proxy.php/api/auth/google/callback`

---

## ملخص

| البيئة              | VITE_API_BASE   | النتيجة                          |
|---------------------|-----------------|-----------------------------------|
| تطوير محلي / Nginx | غير معيّن أو فارغ | الطلبات إلى `/api/...`           |
| Cloudways (بدون Nginx) | `/api-proxy.php` | الطلبات إلى `/api-proxy.php/api/...` |
