# النشر: رفع الـ zip من المتصفح + أوامر من SSH

هذا الدليل للطريقة: **بناء محلي → رفع الـ zip من File Manager → فك الضغط وتشغيل التطبيق من SSH**.

---

## الخطوة 1 — على جهازك (محلياً)

في الطرفية من جذر المشروع:

```bash
npm run build:upload
```

بعد الانتهاء ستجد في جذر المشروع:
- **public_html_upload.zip** (الواجهة + index.html + assets)
- **node_app_upload.zip** (تطبيق Node)

اتركهما جاهزين للرفع.

---

## الخطوة 2 — رفع الملفين من المتصفح

### ما هو File Manager؟
**File Manager** = أداة في لوحة Cloudways تفتحها من المتصفح وتشبه "مستكشف الملفات": ترى مجلدات السيرفر وترفع ملفات من جهازك دون استخدام SFTP.

### لماذا مجلدان؟
على السيرفر عندك مكانان:
- **مجلد الواجهة (public_html):** هنا الملفات التي يراها الزائر (صفحة الموقع، الصور، الـ CSS). اسمه غالباً **public_html** وهو "جذر الدومين" أي مجلد موقع sharfedu.com.
- **مجلد تطبيق Node:** هنا كود السيرفر (Node.js) الذي يشغّل الـ API وتسجيل الدخول. قد يكون اسمه **node_app** أو **git_repo** أو داخل مسار التطبيق نفسه (مثلاً نفس مستوى public_html).

### خطوات الرفع بالتفصيل

1. **ادخل Cloudways** من المتصفح → اختر تطبيقك (sharfedu) → من القائمة اختر **Application** أو **Access Details**.
2. **افتح File Manager** (رابط مثل "File Manager" أو "Open File Manager") حتى ترى شجرة المجلدات على السيرفر.
3. **الملف الأول — الواجهة:**
   - في شجرة المجلدات ادخل إلى مجلد **public_html** (غالباً تحت مسار التطبيق، مثل `.../cmkdrtgqcv/public_html`).
   - أنت الآن **داخل** مجلد public_html (يجب أن ترى محتوياته إن وُجدت).
   - استخدم زر **Upload** أو اسحب الملف من جهازك وأفلته.
   - الملف المطلوب: **public_html_upload.zip** (الموجود على جهازك بعد `npm run build:upload`).
   - النتيجة: يصبح الملف داخل public_html، مثلاً: `public_html/public_html_upload.zip`.
4. **الملف الثاني — تطبيق Node:**
   - ارجع في File Manager وادخل إلى **المجلد الذي تشغّل فيه تطبيق Node** (مثلاً **node_app** أو **git_repo** أو المجلد الذي فيه `index.cjs` أو `package.json`).
   - أنت الآن **داخل** هذا المجلد.
   - ارفع الملف **node_app_upload.zip** هنا (Upload أو سحب وإفلات).
   - النتيجة: يصبح الملف داخل مجلد Node، مثلاً: `node_app/node_app_upload.zip`.

**مهم:** كلا الملفين يرفعان **داخل** المجلد الصحيح (لا تضع الواجهة في مجلد Node ولا العكس).

لا تحتاج SFTP؛ الرفع كله من المتصفح.

---

## الخطوة 3 — أوامر SSH (فك الضغط وإعادة التشغيل)

ادخل إلى السيرفر عبر **SSH**، ثم نفّذ الأوامر التالية. **عدّل المسارات** إذا كانت مختلفة عندك (مثال Cloudways أدناه).

### أ) فك ضغط الواجهة (public_html)

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
unzip -o public_html_upload.zip
```

بهذا يصبح محتوى الموقع (index.html، assets، .htaccess، إلخ) داخل `public_html` مباشرة.

### ب) فك ضغط تطبيق Node

إذا كان تطبيق Node في مجلد **نفس مستوى public_html** (مثلاً `node_app`):

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
unzip -o node_app_upload.zip
```

إذا كان المسار مختلفاً (مثلاً داخل تطبيق Cloudways بدون مجلد `node_app`):

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv
unzip -o node_app_upload.zip
```

(عدّل المسار إلى المجلد الذي رفعت فيه **node_app_upload.zip**.)

### ج) تثبيت الحزم (أول مرة فقط أو عند تغيير package.json)

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
npm install
```

(أو نفس المسار الذي فككت فيه node_app_upload.zip.)

### د) إعادة تشغيل التطبيق

**إن كنت تستخدم PM2:**

```bash
pm2 restart sharfedu
```

أو إذا كان اسم التطبيق مختلفاً:

```bash
pm2 list
pm2 restart <اسم_التطبيق>
```

**إن كنت تشغّله يدوياً (nohup):** أوقفه ثم شغّله من جديد من مجلد تطبيق Node:

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
pkill -f "node index.cjs"
nohup env PORT=5000 node index.cjs > app.log 2>&1 &
```

---

## ملخص الأوامر (نسخ سريع)

عدّل المسارات ثم الصق في SSH:

```bash
# فك ضغط الواجهة
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
unzip -o public_html_upload.zip

# فك ضغط تطبيق Node (عدّل المسار إن لزم)
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
unzip -o node_app_upload.zip
npm install
pm2 restart sharfedu
```

---

## التحقق

- افتح **https://sharfedu.com** وتأكد أن الواجهة تعمل وتسجيل الدخول وواجهة الـ API يعملان.

---

## تحديث لاحق (نشر مرة ثانية)

1. **محلياً:** `npm run build:upload`
2. **المتصفح:** ارفع **public_html_upload.zip** و **node_app_upload.zip** إلى نفس المواقع (استبدال الملفات القديمة).
3. **SSH:** نفس أوامر فك الضغط + `pm2 restart sharfedu` (أو إعادة تشغيل التطبيق كما فوق).

بهذا تكرار نفس الخطوات في كل نشر.
