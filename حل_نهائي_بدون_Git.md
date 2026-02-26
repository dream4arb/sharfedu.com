# حل الشاشة البيضاء — رفع مجلد web يدوياً (بدون الاعتماد على Git على السيرفر)

إذا مجلد **web** لا يظهر على السيرفر بعد `git pull`، ارفعه يدوياً من جهازك.

---

## الخطوة 1: على جهازك (في مجلد المشروع)

1. افتح مجلد المشروع `sharfedu.com` في Cursor أو في مستكشف الملفات.
2. ستجد مجلداً اسمه **web** (فيه `index.html` ومجلد `assets`).
3. اضغط على مجلد **web** بزر الماوس الأيمن → **ضغط** أو **Compress** (أو استخدم أي برنامج ضغط).
4. احصل على ملف مثل **web.zip**.

---

## الخطوة 2: رفع الملف إلى السيرفر

1. استخدم **SFTP** أو **File Manager** في لوحة Cloudways.
2. اتصل بالسيرفر وادخل إلى المجلد:
   ```
   /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/git_repo
   ```
3. ارفع ملف **web.zip** داخل مجلد **git_repo**.

---

## الخطوة 3: على السيرفر (عبر SSH)

ادخل إلى مجلد المشروع ثم نفّذ:

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/git_repo
unzip -o web.zip
cp -r web/. ../
cp -r web/. .
pkill -f "node dist/index.cjs" 2>/dev/null || true
sleep 1
nohup env PORT=5000 node dist/index.cjs > ../app.log 2>&1 &
```

(إن لم يكن `unzip` مثبتاً: `apt-get install unzip` أو استخدم واجهة Cloudways لاستخراج الملف.)

---

## الخطوة 4: التحقق

افتح في المتصفح: **https://sharfedu.com** (وليس المنفذ 4200).

---

بهذا تصبح ملفات الواجهة (من مجلد web) على السيرفر دون الاعتماد على Git هناك.
