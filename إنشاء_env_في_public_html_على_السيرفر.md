# إنشاء ملف .env داخل public_html على السيرفر

بعد التعديل الذي يجعل التطبيق يقرأ `.env` من مجلد التطبيق أولاً، يكفي وضع ملف **.env** داخل **public_html** على السيرفر وسيتم تحميل المتغيرات تلقائياً دون أوامر `export`.

---

## الطريقة 1 — من SSH (نسخ ولصق أمر واحد)

ادخل السيرفر عبر SSH، ثم انسخ **كل** الكتلة التالية والصقها في الطرفية واضغط **Enter** مرة واحدة. سيُنشأ ملف `.env` داخل **public_html** بالمحتوى المطلوب:

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
cat > .env << 'ENVEOF'
NODE_ENV=production
PORT=5000
HOST=127.0.0.1
SESSION_SECRET=sharfedu-secret-key-change-in-production-2026
ADMIN_EMAIL=arb-33@hotmail.com
DATABASE_URL=file:/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/sqlite.db
GOOGLE_CLIENT_ID=949610366276-emmp2cf50jp1gkgsgga8v38e0l12rk0j.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback
ENVEOF
```

بعدها شغّل التطبيق (بدون أوامر export):

```bash
pkill -f "node index.cjs"
nohup node index.cjs > app.log 2>&1 &
```

---

## الطريقة 2 — استخدام الملف المحلي env_server_public_html.txt

في المشروع على جهازك يوجد ملف **env_server_public_html.txt** يحتوي نفس المحتوى. يمكنك:

1. رفع هذا الملف إلى السيرفر (مثلاً عبر File Manager أو tmpfile.link ثم wget) داخل **public_html**.
2. من SSH إعادة تسميته إلى `.env`:
   ```bash
   cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
   mv env_server_public_html.txt .env
   ```
3. ثم تشغيل التطبيق كما في الطريقة 1.

---

## بعد إنشاء .env

في كل مرة تعيد تشغيل السيرفر أو تفتح جلسة SSH جديدة، يكفي تنفيذ:

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
pkill -f "node index.cjs"
nohup node index.cjs > app.log 2>&1 &
```

لا حاجة لأوامر **export** — التطبيق يقرأ كل المتغيرات من **.env** تلقائياً.

---

**تنبيه:** ملف **env_server_public_html.txt** مضاف إلى **.gitignore** حتى لا يُرفع إلى Git مع السكريتات. إن غيّرت السكرت أو Client ID لاحقاً، حدّث **.env** على السيرفر (أو الملف المحلي ثم أعد إنشاء .env على السيرفر).
