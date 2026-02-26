# النشر بدون PowerShell أو CMD — متصفح + SSH فقط

**ملاحظة:** على سيرفرك الحالي الهيكل هو **git_repo** + **public_html** (بدون مجلد `node_app`). للنشر التلقائي بعد دفع Git استخدم **deploy-on-server.sh** من داخل **git_repo** — راجع **أتمتة_النشر_واستعراض_السيرفر.md**. الأوامر أدناه مناسبة إن كنت تنشر بطريقة الـ zip إلى سيرفر فيه **public_html** و **node_app** منفصلان.

- **ما يخص المحلي (Cursor):** البناء + إنشاء الـ zip + إعداد المشروع.  
- **ما يخصك أنت:** رفع الرابطين من المتصفح ثم تنفيذ أوامر SSH على السيرفر.

---

## ما يقوم به Cursor (محلياً)

- تشغيل **`npm run build:upload`** لإنشاء:
  - **public_html_upload.zip** (الواجهة والملفات الثابتة)
  - **node_app_upload.zip** (تطبيق Node مع **pm2** مضافاً للمشروع)
- التأكد من وجود الملفين في جذر المشروع.  
أنت لا تحتاج تشغيل أي أوامر محلياً إلا إذا طلبت من Cursor تحديث البناء لاحقاً.

---

## ما تقوم به أنت

### 1) من المتصفح — رفع الملفين والحصول على الرابطين

1. من مجلد المشروع **sharfedu.com** تأكد من وجود:
   - **public_html_upload.zip**
   - **node_app_upload.zip**
2. افتح **https://transfer.sh** أو **https://file.io** (أو **tmpfile.link**).
3. ارفع **public_html_upload.zip** → انسخ **رابط التحميل** واحفظه (رابط الواجهة).
4. ارفع **node_app_upload.zip** → انسخ **رابط التحميل** واحفظه (رابط تطبيق Node).

---

### 2) من SSH — أوامر السيرفر فقط

ادخل إلى السيرفر عبر **SSH** ثم انسخ والصق هذا البلوك بالكامل:

```bash
# الواجهة
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
wget "https://d5.tfdl.net/public/2026-02-04/2f185939-5a96-4274-b7d0-84e0e48b0182/public_html_upload.zip" -O public_html_upload.zip
unzip -o public_html_upload.zip

# تطبيق Node (pm2 يأتي مع المشروع بعد npm install)
mkdir -p /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
wget "https://d10.tfdl.net/public/2026-02-04/d2edd7db-4ac4-4039-8e9f-818fcc7b5db1/node_app_upload.zip" -O node_app_upload.zip
unzip -o node_app_upload.zip
npm install
npx pm2 restart sharfedu
```

**أول نشر (لم يُشغّل التطبيق من قبل):** استبدل السطرين الأخيرين (`npx pm2 restart sharfedu`) بـ:

```bash
npx pm2 start index.cjs --name sharfedu
npx pm2 save
```

---

### التحقق

افتح في المتصفح: **https://sharfedu.com** وتأكد أن الموقع يعمل.

**إذا لم يعمل تسجيل الدخول (التقليدي أو جوجل):** راجع ملف **إصلاح_تسجيل_الدخول_على_السيرفر.md** (التحقق من `.env` و X-Forwarded-Proto و إعدادات جوجل).

### بديل عن pm2 (تشغيل يدوي)

إذا أردت تشغيل التطبيق بدون pm2:

```bash
pkill -f "node index.cjs"
nohup node index.cjs > app.log 2>&1 &
```

ملاحظة: **pm2** مضاف للمشروع؛ بعد `npm install` استخدم دائماً **`npx pm2`** (لا تثبّت pm2 عاماً: `npm install -g pm2` يسبب EACCES على السيرفر).

---

## إذا ظهر "An unexpected error" عند فتح SSH من لوحة Cloudways

- جرّب متصفحاً آخر أو نافذة خاصة (Incognito).
- تأكد أن الـ IP الخاص بك غير محظور في إعدادات السيرفر.
- يمكنك الاتصال بنفس الحساب عبر SSH من جهازك: استخدم **Application Access** في Cloudways لنسخ بيانات SSH (المستخدم، العنوان، المفتاح أو كلمة المرور) ثم اتصل من PowerShell أو Terminal بـ:  
  `ssh master_nyrmduupwf@عنوان_السيرفر`.

---

## ملخص سريع

| من | المهمة |
|----|--------|
| **Cursor (محلياً)** | `npm run build:upload` → إنشاء **public_html_upload.zip** و **node_app_upload.zip** (ومشروعك يتضمن pm2). |
| **أنت — متصفح** | رفع الملفين إلى transfer.sh أو file.io ونسخ رابط كل ملف. |
| **أنت — SSH** | `wget` + `unzip` + `npm install` + `npx pm2 start` أو `npx pm2 restart sharfedu`. |

لا حاجة لـ PowerShell أو CMD — فقط متصفح و SSH.
