# إصلاح أخطاء النشر من SSH

بناءً على الأخطاء التي ظهرت، اتبع التالي بالترتيب.

---

## 1) مجلد node_app غير موجود

الخطأ: `No such file or directory` عند الدخول إلى `/home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app`.

**الحل:** إنشاء المجلد ثم تنفيذ الأوامر فيه:

```bash
mkdir -p /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
```

إذا كان تطبيق Node عندك يعمل من مجلد آخر (مثل `git_repo` أو نفس مستوى `public_html`)، استخدم مسار ذلك المجلد بدلاً من `node_app` في كل الأوامر التالية.

---

## 2) استبدال "رابط_التطبيق" بالرابط الحقيقي

لا تكتب الكلمة **رابط_التطبيق** في الأمر. استبدلها **بالرابط الفعلي** الذي حصلت عليه من tmpfile.link بعد رفع ملف **node_app_upload.zip**.

مثال (رابطك سيكون مختلفاً):

```bash
wget "https://d10.tfdl.net/public/2026-02-04/xxxxx/node_app_upload.zip" -O node_app_upload.zip
```

انسخ الرابط من المتصفح والصقه مكان `رابط_التطبيق` داخل الأوامر.

---

## 3) أمر wget الصحيح للملف الثاني

يجب أن يكون **الرابط داخل علامتي تنصيص** وأن يكون **-O** بحرف O كبير (ليس -o صغير):

```bash
wget "الرابط_الحقيقي_هنا" -O node_app_upload.zip
```

---

## 4) PM2 غير موجود (command not found)

إذا ظهر `pm2: command not found`، إما تثبيت PM2 عالمياً أو تشغيل التطبيق بدون PM2.

**الخيار أ — تثبيت PM2 ثم إعادة التشغيل:**

```bash
npm install -g pm2
pm2 start index.cjs --name sharfedu
pm2 save
pm2 startup
```

**الخيار ب — تشغيل التطبيق بدون PM2 (للتجربة):**

من داخل مجلد تطبيق Node (مثلاً node_app):

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
nohup node index.cjs > app.log 2>&1 &
```

لتوقيف التطبيق لاحقاً:

```bash
pkill -f "node index.cjs"
```

على Cloudways قد يكون هناك طريقة أخرى لتشغيل تطبيق Node من لوحة التحكم؛ راجع وثائق الاستضافة إن لزم.

---

## 5) ترتيب الأوامر الصحيح (من البداية)

استبدل **رابط_الواجهة** و **رابط_التطبيق** بالرابطين الحقيقيين من tmpfile.link، ثم نفّذ:

```bash
# الواجهة
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
wget "رابط_الواجهة" -O public_html_upload.zip
unzip -o public_html_upload.zip

# إنشاء مجلد تطبيق Node إن لم يكن موجوداً
mkdir -p /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
wget "رابط_التطبيق" -O node_app_upload.zip
unzip -o node_app_upload.zip
npm install
node index.cjs
```

إن عمل التطبيق، أوقفه بـ Ctrl+C ثم شغّله في الخلفية بـ `nohup node index.cjs > app.log 2>&1 &` أو ثبّت PM2 واستخدم `pm2 start index.cjs --name sharfedu`.

---

## 6) ملاحظة عن عنوان الموقع

الوصول عبر **https://165.227.236.121:4200** يظهر "غير آمن" وقد يسبب مشاكل في تسجيل الدخول (خصوصاً جوجل). بعد ضبط الدومين في الاستضافة، استخدم **https://sharfedu.com** للدخول والاختبار.
