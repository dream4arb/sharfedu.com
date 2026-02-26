# رفع الملفات عبر SSH فقط (بدون File Manager)

يمكنك الاعتماد على **أمر SCP من جهازك** أو **سحب الملف من رابط مؤقت من داخل SSH**. لا حاجة لـ File Manager.

---

## الطريقة 1 — SCP من جهازك (الأبسط إن كان SSH يعمل)

هنا الرفع يتم من **طرفية على جهازك** (Cursor أو PowerShell)، باستخدام أمر `scp` الذي يعتمد على SSH. لا تدخل إلى جلسة SSH لرفع الملف؛ فقط تنفّذ الأوامر من جهازك.

### الخطوات

1. **على جهازك** من جذر المشروع:
   ```bash
   npm run build:upload
   ```
   يتولد: `public_html_upload.zip` و `node_app_upload.zip`.

2. **من نفس الجهاز** (طرفية محلية، وليس داخل SSH) نفّذ أوامر الرفع. عدّل المسارات وأسماء المستخدم والسيرفر إن لزم.

   **رفع الواجهة إلى public_html:**
   ```bash
   scp public_html_upload.zip master_nyrmduupwf@165.227.236.121:/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/
   ```

   **رفع تطبيق Node:**
   ```bash
   scp node_app_upload.zip master_nyrmduupwf@165.227.236.121:/home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app/
   ```
   (إن لم يكن عندك مجلد `node_app` فاستخدم المسار الذي تشغّل فيه Node، مثلاً `/home/894422.cloudwaysapps.com/cmkdrtgqcv/`.)

3. عند الطلب أدخل **كلمة مرور SSH** الخاصة بحساب السيرفر.

4. **بعد الرفع** ادخل السيرفر عبر SSH ونفّذ فك الضغط وإعادة التشغيل:
   ```bash
   cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
   unzip -o public_html_upload.zip

   cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
   unzip -o node_app_upload.zip
   npm install
   pm2 restart sharfedu
   ```

### استخدام السكربت الجاهز (نفس الفكرة)

من جذر المشروع على **جهازك**:
```bash
npm run upload:public
```
هذا السكربت يشغّل أوامر SCP نيابة عنك (يحتاج نفس بيانات الاتصال). إن كان يعمل عندك، لا حاجة لكتابة أوامر scp يدوياً.

---

## الطريقة 2 — رابط مؤقت + wget من داخل SSH

إذا لم يكن SCP متاحاً أو لا يعمل من جهازك، يمكن أن تضع ملف الـ zip على **رابط تحميل مؤقت** ثم من **داخل جلسة SSH على السيرفر** تسحب الملف بأمر `wget`.

### الخطوة أ — على جهازك: بناء ثم رفع الـ zip إلى رابط مؤقت

1. من جذر المشروع:
   ```bash
   npm run build:upload
   ```

2. ارفع **public_html_upload.zip** إلى خدمة تعطيك رابط تحميل مباشر، مثل:
   - **https://transfer.sh** — ادخل الموقع، اسحب الملف، انسخ الرابط الذي يعطيك إياه.
   - أو **https://file.io** — نفس الفكرة.
   - أو إن كان المشروع على GitHub: يمكنك رفع الملف كـ Release asset أو استخدام طريقة أخرى تعطيك رابطاً مباشراً.

3. انسخ **رابط التحميل** (يجب أن يفتح عند وضعه في المتصفح ويبدأ تحميل الملف).

4. كرر نفس العملية لـ **node_app_upload.zip** واحصل على رابط ثانٍ.

### الخطوة ب — من داخل SSH على السيرفر: سحب الملفات وفك الضغط

ادخل السيرفر عبر SSH، ثم (استبدل **رابط_الواجهة** و **رابط_التطبيق** بالرابطين الحقيقيين):

```bash
# سحب وفك ضغط الواجهة
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
wget "رابط_الواجهة" -O public_html_upload.zip
unzip -o public_html_upload.zip

# سحب وفك ضغط تطبيق Node (عدّل المسار إن لزم)
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/node_app
wget "رابط_التطبيق" -O node_app_upload.zip
unzip -o node_app_upload.zip
npm install
pm2 restart sharfedu
```

مثال برابط transfer.sh:
```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
wget "https://transfer.sh/xxxxx/public_html_upload.zip" -O public_html_upload.zip
unzip -o public_html_upload.zip
```

بهذه الطريقة **كل شيء من خلال SSH** من طرف السيرفر (سحب الملف ثم فك الضغط)، والرفع الفعلي للملف من جهازك يتم فقط إلى موقع الرابط المؤقت.

---

## ملخص

| الطريقة | من أين | ماذا تفعل |
|---------|--------|-----------|
| **1 — SCP** | طرفية على **جهازك** | `scp ملف.zip user@host:/مسار/` ثم من SSH: unzip و pm2 restart |
| **2 — رابط + wget** | **جهازك**: رفع zip لموقع رابط مؤقت. **SSH**: `wget "رابط"` ثم unzip و pm2 restart | كل التفاعل مع السيرفر من خلال SSH |

إذا كان لديك وصول SSH عادي، جرّب الطريقة 1 أولاً؛ إن لم يتوفر SCP استخدم الطريقة 2.
