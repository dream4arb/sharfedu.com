# حل جذري — تسجيل الدخول (بريد + Google) على Cloudways

اتبع **أحد** المسارين بالكامل. المسار (أ) أنظف إن نجح.

---

## المسار (أ) — توجيه Apache مباشرة لـ /api إلى Node (بدون PHP)

**المتطلب:** أن يكون Node يعمل **قبل** أي طلب، ودعم Cloudways سمح بتفعيل mod_proxy.

### على السيرفر

**1)** تأكد أن Node يعمل:
```bash
cd /home/master/applications/cmkdrtgqcv/public_html
node dist/index.cjs
```
اترك الطرفية مفتوحة.

**2)** في `.env` على السيرفر:
- **احذف** السطر `VITE_API_BASE=/api-proxy.php` (أو اتركه فارغاً: `VITE_API_BASE=`).
- تأكد من:
  - `GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback` (بدون api-proxy.php)

**3)** استبدل محتوى `.htaccess` في جذر الموقع (public_html) بالكامل بما يلي:

```apache
RewriteEngine On
RewriteBase /

# توجيه /api إلى Node على المنفذ 5000
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]

# عدم إرسال api-proxy.php إلى SPA
RewriteRule ^api-proxy\.php - [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

**4)** أعد بناء الواجهة على السيرفر (بعد تعديل .env) حتى تستدعي /api مباشرة:
```bash
npm run build
```

**5)** في Google Cloud Console → تطبيق OAuth → Authorized redirect URIs يجب أن يكون:
`https://sharfedu.com/api/auth/google/callback`
(بدون api-proxy.php)

**6)** أعد تشغيل Node (Ctrl+C ثم `node dist/index.cjs`).

إن ظهر **500** بعد ذلك، استخدم المسار (ب).

---

## المسار (ب) — الاعتماد على البروكسي PHP فقط (بدون [P])

إذا المسار (أ) يعطي 500 أو لا يعمل، استخدم هذا.

### على السيرفر

**1)** في `.env`:
- `VITE_API_BASE=/api-proxy.php`
- `GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback`

**2)** استبدل محتوى `.htaccess` بالكامل بما يلي (بدون أي قواعد [P]):

```apache
RewriteEngine On
RewriteBase /

RewriteRule ^api-proxy\.php - [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

**3)** تأكد أن `api-proxy.php` موجود في جذر public_html (نفس مجلد index.html). إن لم يكن:
```bash
cp public/api-proxy.php ./
```

**4)** أعد البناء بعد ضبط VITE_API_BASE:
```bash
npm run build
```

**5)** في Google Cloud Console → Authorized redirect URIs:
`https://sharfedu.com/api-proxy.php/api/auth/google/callback`

**6)** شغّل Node:
```bash
node dist/index.cjs
```

---

## ملخص

| المسار | VITE_API_BASE في .env | GOOGLE_CALLBACK_URL | .htaccess |
|--------|------------------------|----------------------|-----------|
| (أ)    | فارغ أو محذوف          | .../api/auth/google/callback | توجيه /api [P] + SPA |
| (ب)    | /api-proxy.php         | .../api-proxy.php/api/auth/google/callback | استثناء api-proxy فقط + SPA |

في الحالتين: Node **يجب** أن يعمل باستمرار (أو عبر pm2).
