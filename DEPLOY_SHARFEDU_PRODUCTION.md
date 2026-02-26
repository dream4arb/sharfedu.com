# نشر https://sharfedu.com بشكل نهائي (Cloudways)

## سبب أن الموقع لا يعمل على الرابط المباشر

على السيرفر يجب أن يتحقق **ثلاثة أشياء** معاً:

1. **مجلد الويب (public_html)** يعرض **الواجهة المُبناة** (index.html + مجلد assets)، وليس نسخة التطوير.
2. **تطبيق Node.js** يعمل على المنفذ **5000** ويستقبل طلبات `/api`.
3. **ملف .htaccess** يوجّه كل طلب يبدأ بـ `/api` إلى `http://localhost:5000`.

إذا فُقد أحدها، الصفحة أو تسجيل الدخول لا يعمل.

---

## خطوات الحل (على السيرفر بعد git pull)

### 1) البناء

```bash
cd /path/to/sharfedu.com   # مجلد المشروع على السيرفر
npm ci
npm run build
```

بعد البناء ستجد:
- **server/public/** — فيه index.html المُبنى + assets/ + .htaccess (هذا محتوى الواجهة).
- **deploy_public_html/** — نسخة جاهزة من نفس المحتوى لرفعها إلى الدومين.
- **dist/index.cjs** — تطبيق السيرفر (Node).

### 2) وضع محتوى الويب في مجلد الدومين

يجب أن يكون **جذر الموقع (public_html أو مجلد الدومين على Cloudways)** يحتوي بالضبط على محتوى **server/public** (أو **deploy_public_html**).

على Cloudways غالباً المسار يشبه:
`applications/اسم_التطبيق/public_html`

**انسخ كل محتويات server/public إلى هذا المجلد:**

```bash
# استبدل مسار public_html بالمسار الفعلي عندك
cp -r server/public/* /path/to/public_html/
# أو إذا استخدمت المجلد الجاهز:
cp -r deploy_public_html/* /path/to/public_html/
```

يجب أن ترى داخل public_html:
- **index.html** (الذي بداخله روابط مثل `/assets/index-xxx.js`)
- **assets/** (ملفات js و css)
- **.htaccess**
- favicon.png, hero-main.png إن وُجدت

**مهم:** لا ترفع **index.html من جذر المشروع** (ذلك للتطوير ويشير إلى `/src/main.tsx`)؛ استخدم فقط المحتوى من **server/public** أو **deploy_public_html**.

### 3) تشغيل Node على المنفذ 5000

```bash
# من مجلد المشروع
export NODE_ENV=production
node dist/index.cjs
# أو باستخدام PM2 (مُوصى به):
pm2 start dist/index.cjs --name sharfedu
pm2 save
```

تأكد أن ملف **.env** في جذر المشروع على السيرفر ويحتوي على الأقل:
- `PORT=5000`
- `DATABASE_URL=file:sqlite.db` (أو المسار الصحيح لملف القاعدة)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback`

### 4) التحقق من البوابة (.htaccess)

يجب أن يكون داخل **public_html** ملف **.htaccess** به القواعد التالية (أو ما يعادلها):

```apache
RewriteEngine On
RewriteRule ^api/(.*) http://localhost:5000/api/$1 [P,L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

على Cloudways قد تحتاج تفعيل **mod_proxy** و **mod_proxy_http** (من الدعم إن لزم).

---

## فحص أن كل شيء يعمل

1. **الواجهة:** افتح https://sharfedu.com/ — يجب أن تظهر الصفحة الرئيسية.
2. **الـ API (Node):** افتح https://sharfedu.com/api/health — يجب أن ترى `{"ok":true,"service":"sharfedu-api"}`.
   - إن ظهر **503** أو خطأ اتصال: Node غير مشغّل أو البوابة لا تصل إلى المنفذ 5000.
   - إن ظهر **404**: تأكد أن .htaccess موجود في public_html وأن القواعد مطبقة.
3. **تسجيل الدخول:** جرّب الدخول بالبريد وكلمة المرور — يجب أن يعمل كما على الرابط المحلي.

---

## ملخص السبب والحل

| المشكلة | السبب المحتمل | الحل |
|--------|----------------|------|
| الصفحة بيضاء أو لا تُحمّل | public_html يعرض index.html التطوير (يشير إلى /src/main.tsx) | نسخ محتوى **server/public** (أو deploy_public_html) إلى public_html |
| 503 عند تسجيل الدخول أو عند /api/health | Node غير مشغّل أو المنفذ 5000 مغلق | تشغيل `node dist/index.cjs` أو PM2 والتأكد من PORT=5000 |
| 404 لـ /api/* | .htaccess غير موجود أو mod_proxy غير مفعّل | وضع .htaccess الصحيح في public_html وطلب تفعيل mod_proxy من Cloudways |

بعد تطبيق الخطوات أعلاه، الموقع https://sharfedu.com/ وتسجيل الدخول يعملان بشكل نهائي.
