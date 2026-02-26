# نشر الموقع الكامل (الواجهة + لوحة التحكم + تسجيل الدخول + API)

هذا الدليل يشرح كيف تنقل **الموقع كاملاً** (مع لوحة التحكم، تسجيل الدخول، وكل الوظائف) وليس واجهة فقط.

---

## ما الذي تحتاج تشغيله؟

المشروع يعمل كـ **تطبيق Node.js واحد**:
- **السيرفر (Express)** يخدم الواجهة (React) وواجهة الـ API (تسجيل الدخول، لوحة التحكم، إلخ).
- **قاعدة البيانات:** SQLite (ملف `sqlite.db` في جذر المشروع).
- بعد البناء: تشغيل أمر واحد (`npm start`) يشغّل كل شيء.

---

## الخطوات العامة (أي سيرفر يدعم Node.js)

### 1. رفع المشروع إلى السيرفر

- إما **استنساخ من GitHub:**
  ```bash
  git clone https://github.com/tariqalmarifa/sharfedu.com.git
  cd sharfedu.com
  ```
- أو رفع الملفات يدوياً (FTP/SFTP) مع الاحتفاظ بنفس هيكل المجلدات.

### 2. تثبيت الاعتماديات والبناء

```bash
npm install
npm run build
```

هذا ينشئ:
- مجلد `dist/public` (الواجهة الأمامية).
- ملف `dist/index.cjs` (السيرفر).

### 3. قاعدة البيانات (SQLite)

- إذا كان لديك بالفعل ملف **`sqlite.db`** (مستخدمين، إعدادات، إلخ): ارفعه إلى **جذر المشروع** على السيرفر (نفس مستوى `package.json`).
- إذا لا: بعد أول تشغيل يمكن إنشاء المستخدمين؛ للتأكد من وجود جدول الأدمن يمكن تشغيل السكربتات الموجودة في المشروع حسب الحاجة (مثل `npm run migrate:admin` إن وُجدت في المشروع).

### 4. متغيرات البيئة (مهم للإنتاج)

أنشئ ملف **`.env`** في جذر المشروع (أو اضبط المتغيرات في لوحة الاستضافة):

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# الجلسات — غيّر هذا إلى سلسلة عشوائية طويلة
SESSION_SECRET=ضع-هنا-سلسلة-عشوائية-طويلة-وفريدة

# بريد الأدمن (للتسجيل الأول أو استعادة الأدمن)
ADMIN_EMAIL=admin@example.com

# اختياري: قاعدة البيانات (اتركه فارغاً لاستخدام sqlite.db في الجذر)
# DATABASE_URL=/path/to/sqlite.db

# اختياري: تسجيل الدخول بـ Google
# GOOGLE_CLIENT_ID=...
# GOOGLE_CLIENT_SECRET=...
# GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback

# اختياري: Gemini API (للميزات التي تستخدمها)
# GEMINI_API_KEY=...
```

- **PORT:** المنفذ الذي يعمل عليه التطبيق (غالباً الاستضافة تحددها أو تضعها في لوحة التحكم).
- **HOST=0.0.0.0:** ضروري على معظم الاستضافات السحابية حتى يقبل الاتصالات من الخارج.

### 5. تشغيل التطبيق بشكل دائم (PM2)

لتشغيل الموقع حتى بعد إغلاق الطرفية وإعادة تشغيل السيرفر:

```bash
npm install -g pm2
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
```

بعدها الموقع يعمل على المنفذ الذي حددته في `PORT` (مثلاً 5000).

### 6. ربط الدومين (Nginx أو Apache)

السيرفر (Nginx أو Apache) يجب أن يوجّه الطلبات إلى تطبيق Node.js.

**مثال Nginx (على نفس السيرفر):**

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

غيّر `5000` إذا غيّرت `PORT` في `.env`.

**مثال Apache (mod_proxy):**

```apache
ProxyPreserveHost On
ProxyPass / http://127.0.0.1:5000/
ProxyPassReverse / http://127.0.0.1:5000/
```

ثم تفعيل: `a2enmod proxy proxy_http` وإعادة تشغيل Apache.

---

## خيار 1: استضافة جاهزة لـ Node.js (أسهل)

منصات مثل **Railway** أو **Render** أو **DigitalOcean App Platform** تدعم نشر تطبيق Node.js من GitHub بدون إعداد سيرفر يدوياً.

### الخطوات النموذجية (مثل Railway / Render)

1. ربط المستودع (GitHub) بالمشروع.
2. **أمر البناء (Build):**  
   `npm install && npm run build`
3. **أمر التشغيل (Start):**  
   `npm start`  
   أو: `node dist/index.cjs`
4. **متغيرات البيئة:** أضف في لوحة المنصة:
   - `NODE_ENV=production`
   - `HOST=0.0.0.0`
   - `SESSION_SECRET=سلسلة-عشوائية-طويلة`
   - `ADMIN_EMAIL=بريدك@example.com`
   - (اختياري) `PORT` إذا طلبت المنصة ذلك
5. **قاعدة البيانات:**  
   - هذه المنصات قد لا تحفظ ملف `sqlite.db` بين إعادة النشر؛ إن احتجت استمرارية البيانات ابحث عن "persistent disk" أو استخدم قاعدة بيانات خارجية وضبط `DATABASE_URL` إن كان المشروع يدعمها.

بعد النشر، المنصة تعطيك رابطاً مثل `https://your-app.up.railway.app` — هذا هو الموقع الكامل (واجهة + لوحة تحكم + API).

---

## خيار 2: سيرفرك على Cloudways أو VPS (Apache/Nginx + Node)

لديك سيرفر يعمل عليه PHP أو Nginx (مثل Cloudways أو VPS).

### أ. تثبيت Node.js

- على Ubuntu/Debian مثلاً:
  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
  ```
- تحقق: `node -v` و `npm -v`.

### ب. استنساخ المشروع والبناء

```bash
cd /path/where/you/want/the/site
git clone https://github.com/tariqalmarifa/sharfedu.com.git
cd sharfedu.com
npm install
npm run build
```

### ج. ملف `.env`

كما في القسم "متغيرات البيئة" أعلاه، مع `HOST=0.0.0.0` و `PORT=5000` (أو المنفذ الذي تختاره).

### د. تشغيل التطبيق بـ PM2

```bash
npm install -g pm2
cd /path/to/sharfedu.com
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
```

### هـ. توجيه Nginx أو Apache إلى Node

- استخدم أمثلة Nginx/Apache أعلاه بحيث الدومين (مثل `sharfedu.com`) يوجّه إلى `http://127.0.0.1:5000`.
- إن استخدمت SSL، اضبط شهادة SSL على Nginx/Apache (مثلاً Let's Encrypt).

---

## ملخص الأوامر (على السيرفر أو بيئة النشر)

```bash
# من جذر المشروع
npm install
npm run build

# تشغيل مباشر (للتجربة)
npm start

# أو تشغيل دائم بـ PM2
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
```

---

## ماذا سيعمل بعد النشر؟

- الصفحة الرئيسية وكل صفحات الواجهة.
- تسجيل الدخول (محلي و/أو Google إن ضبطته).
- لوحة التحكم للمستخدم.
- لوحة الإدارة (إن كان حسابك أدمن).
- كل طلبات `/api/*` (دروس، تقدم، إلخ).
- قاعدة البيانات من ملف `sqlite.db` (أو من `DATABASE_URL` إن استخدمتها).

بهذا تكون نقلت **الموقع كاملاً** مع لوحة التحكم وكل الوظائف، وليس واجهة فقط.
