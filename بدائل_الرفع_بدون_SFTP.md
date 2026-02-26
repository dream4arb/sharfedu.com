# بدائل رفع الملفات بدون SFTP/SCP

إذا لم تتمكن من استخدام SFTP أو SCP (أو أي رفع يعتمد على SSH)، يمكنك استخدام أحد الخيارات التالية.

---

## 1. File Manager في لوحة الاستضافة (الأبسط)

معظم الاستضافات (بما فيها Cloudways) توفر **File Manager** في المتصفح.

**الخطوات:**

1. **على جهازك:** نفّذ البناء وإنشاء ملفات الـ zip:
   ```bash
   npm run build:upload
   ```
   ستجد في جذر المشروع:
   - `public_html_upload.zip`
   - `node_app_upload.zip`

2. **في لوحة الاستضافة (Cloudways أو غيرها):**
   - ادخل إلى **Application** → **File Manager** (أو **Access Details** ثم رابط إدارة الملفات).
   - ارفع **public_html_upload.zip** إلى مجلد **جذر الدومين** (مثلاً `public_html`).
   - ارفع **node_app_upload.zip** إلى مجلد تطبيق Node (نفس المستوى أو داخل المسار الذي تستخدمه).

3. **فك الضغط:**
   - إن وُجدت في File Manager خيار **Extract** أو **Unzip**: استخدمها على كل ملف zip.
   - إن لم توجد: ادخل عبر **SSH** ونفّذ:
     ```bash
     cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html
     unzip -o public_html_upload.zip
     cd /home/894422.cloudwaysapps.com/cmkdrtgqcv   # أو مسار node_app
     unzip -o node_app_upload.zip
     ```

بهذا تكون رفعت الملفات من المتصفح فقط (بدون SFTP/SCP).

---

## 2. النشر عبر Git (بدون رفع ملفات يدوي)

لا ترفع أي zip؛ الكود يصل عبر Git والسيرفر يبني بنفسه.

**على جهازك:**

```bash
git add -A
git commit -m "تحديث الموقع"
git push origin main
```

**على السيرفر (عبر SSH مرة واحدة):**

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/git_repo   # أو مسار تطبيقك
git fetch --all
git reset --hard origin/main
npm install
npm run build
# ثم نسخ الواجهة و إعادة تشغيل التطبيق (PM2 أو الطريقة التي تستخدمها)
```

المطلوب: **وصول SSH مرة واحدة** لإعداد المجلد وربط Git. بعدها التحديثات تتم بـ `git pull` وبناء على السيرفر، ولا تحتاج رفع ملفات من جهازك.

---

## 3. رفع الـ zip عبر متصفح ثم فك الضغط عبر SSH فقط

- ارفع **public_html_upload.zip** و **node_app_upload.zip** من جهازك عبر **File Manager** (السحب والإفلات أو Upload).
- ادخل إلى السيرفر **عبر SSH** فقط لفك الضغط وتشغيل الأوامر:
  ```bash
  cd /المسار/إلى/public_html
  unzip -o public_html_upload.zip
  cd /المسار/إلى/node_app
  unzip -o node_app_upload.zip
  pm2 restart sharfedu   # أو أي اسم تطبيقك
  ```
هنا لا تحتاج SFTP/SCP أبداً؛ الرفع من المتصفح، وSSH فقط للأوامر.

---

## 4. FTP (إن وفرته الاستضافة)

إذا كانت الاستضافة توفّر **FTP** فقط (بدون SFTP):

1. احصل على: عنوان السيرفر، اسم المستخدم، كلمة المرور، ومنفذ FTP (غالباً 21).
2. استخدم برنامج FTP من جهازك (مثل FileZilla مع وضع FTP عادي) أو سكربت يرفع الملفات.
3. ارفع **public_html_upload.zip** إلى جذر الدومين و **node_app_upload.zip** إلى مجلد تطبيق Node.
4. فك الضغط إما من File Manager إن وُجد Unzip، أو عبر SSH كما في (3).

---

## 5. سحابة ثم سحب من السيرفر (مؤقت)

إذا استطاع السيرفر الاتصال بالإنترنت وكان لديك رابط تحميل:

1. ارفع الـ zip إلى OneDrive أو Google Drive أو أي خدمة تعطيك **رابط تحميل مباشر**.
2. ادخل السيرفر عبر **SSH** ونفّذ مثلاً:
   ```bash
   cd /المسار/إلى/public_html
   wget "رابط_تحميل_public_html_upload.zip" -O public_html_upload.zip
   unzip -o public_html_upload.zip
   ```
   (وكذلك لـ node_app إن رفعت له zip منفصل.)

هذا حل مؤقت وليس مهنياً للاستخدام الدائم (خصوصاً لأسباب أمنية وروابط عامة).

---

## ملخص التوصية

| وضعك | الأنسب |
|------|--------|
| لا SFTP/SCP، لكن تتوفر لوحة استضافة (File Manager) | **الخيار 1**: رفع الـ zip من المتصفح + فك الضغط من File Manager أو من SSH |
| لديك SSH (ولو نادراً) وتفضل عدم رفع ملفات كل مرة | **الخيار 2**: نشر عبر Git وبناء على السيرفر |
| FTP فقط بدون SSH | **الخيار 4**: رفع الـ zip عبر FTP ثم فك الضغط إن وُجد Unzip في لوحة التحكم |

الخلاصة: **لا تحتاج SFTP**. يمكنك الاعتماد على **File Manager** لرفع الـ zip ثم **فك الضغط** من لوحة التحكم أو عبر **SSH** مرة واحدة لكل نشر.
