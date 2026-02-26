# النشر التلقائي عبر SSH (بدون دخول SSH كل يوم)

عند كل **push** إلى فرع `main`، الـ workflow **Deploy to Cloudways** يتصل بالسيرفر عبر SSH ويشغّل سكربت النشر تلقائياً. النتيجة: أي تعديل على GitHub ينعكس على الموقع دون الحاجة لفتح SSH يدوياً.

---

## ما الذي يحدث تلقائياً؟

1. ترفع التعديلات من جهازك: `git push origin main` (أو عبر `npm run deploy`).
2. **GitHub Actions** يشغّل الـ workflow.
3. الـ workflow يتصل بالسيرفر عبر **SSH** وينفّذ:
   - الدخول لمجلد المستودع على السيرفر
   - تشغيل `bash scripts/deploy-on-server.sh`
4. السكربت على السيرفر:
   - يسحب آخر التعديلات من GitHub (`git fetch` + `git reset`)
   - يثبت الحزم إن لزم (`npm install`)
   - ينسخ الواجهة من `deploy_public_html` إلى `public_html`
   - يعيد تشغيل تطبيق Node

بهذا يصبح الموقع محدثاً بعد كل push بدون أي خطوة يدوية.

---

## الإعداد (مرة واحدة فقط)

### 1) إنشاء مفتاح SSH خاص بـ GitHub Actions

على جهازك (PowerShell أو Git Bash):

```powershell
# إنشاء مفتاح جديد بدون كلمة مرور (للاستخدام من الآلة فقط)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f deploy_key -N '""'
```

يُنشأ ملفان:
- **deploy_key** — المفتاح الخاص (ستضعه في GitHub Secrets).
- **deploy_key.pub** — المفتاح العام (ستضعه على السيرفر).

### 2) إضافة المفتاح العام على السيرفر (Cloudways)

1. اتصل بالسيرفر عبر SSH **مرة واحدة** (من لوحة Cloudways → Application → SSH).
2. أضف المفتاح العام إلى الملف المصرح به:
   ```bash
   # انسخ محتوى deploy_key.pub من جهازك ثم نفّذ (استبدل المحتوى بين الاقتباس):
   echo "محتويات ملف deploy_key.pub بالكامل" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```
   أو افتح `~/.ssh/authorized_keys` بأي محرر وألصق سطراً واحداً هو محتوى **deploy_key.pub** كاملاً ثم احفظ.

3. تأكد أن مجلد المستودع موجود على السيرفر (مثلاً `git_repo` تحت مسار التطبيق) وأن فيه السكربت `scripts/deploy-on-server.sh` (من أول clone أو نشر سابق).

### 3) إضافة الـ Secrets في GitHub

1. اذهب إلى المستودع على **GitHub** → **Settings** → **Secrets and variables** → **Actions**.
2. اضغط **New repository secret** وأضف الأسرار التالية (الأسماء بالضبط):

| اسم الـ Secret | القيمة | مثال |
|----------------|--------|------|
| `SSH_PRIVATE_KEY` | محتوى ملف **deploy_key** بالكامل (السطر الذي يبدأ بـ `-----BEGIN...` حتى `-----END...`) | انسخ من الملف دون تعديل |
| `SERVER_SSH_HOST` | عنوان السيرفر (بدون المستخدم) | `server-12345.cloudwaysapps.com` أو الـ IP |
| `SERVER_SSH_USER` | اسم المستخدم SSH | `master_nyrmduupwf` |
| `SERVER_GIT_REPO_PATH` | المسار الكامل لمجلد المستودع على السيرفر | `/home/894422.cloudwaysapps.com/cmkdrtgqcv/git_repo` |

**كيف تحصل على القيم من Cloudways:**
- من لوحة Cloudways → **Application** → **SSH**: يظهر شيء مثل `master_xxx@server-xxx.cloudwaysapps.com` → **SERVER_SSH_USER** = `master_xxx`، **SERVER_SSH_HOST** = `server-xxx.cloudwaysapps.com` (أو العنوان الذي يعطيك إياه).
- **SERVER_GIT_REPO_PATH**: المسار الذي فيه المستودع. إذا كان المستودع داخل مجلد التطبيق في مجلد اسمه `git_repo`، يكون مثلاً: `/home/894422.cloudwaysapps.com/cmkdrtgqcv/git_repo`. (يمكنك التأكد مرة عبر SSH: `pwd` عندما تكون داخل مجلد المستودع.)

### 4) حذف المفتاح من جهازك (أمان)

بعد إضافة المفتاح في GitHub Secrets وإضافته على السيرفر، احذف الملفات من جهازك:

```powershell
del deploy_key deploy_key.pub
```

---

## التحقق أن كل شيء يعمل

1. اعمل أي تعديل بسيط (مثلاً تعديل نص في الواجهة).
2. ارفع التعديل: `git add -A` ثم `git commit -m "test deploy"` ثم `git push origin main`.
3. افتح **GitHub** → تبويب **Actions** وانتظر انتهاء الـ workflow **Deploy to Cloudways** (علامة خضراء).
4. افتح الموقع وتأكد أن التعديل ظهر.

إذا فشل الـ workflow، اضغط على التشغيل الفاشل واقرأ رسالة الخطأ (غالباً: مفتاح خاطئ، أو مسار خاطئ، أو المفتاح العام غير مضاف على السيرفر).

---

## ملخص

| ما تريده | ما تفعله |
|----------|----------|
| نشر يومي بدون SSH | أضف الـ 4 Secrets مرة واحدة + المفتاح العام على السيرفر |
| رفع التعديلات | `npm run deploy` أو `git push origin main` |
| التأكد من النشر | GitHub → Actions → Deploy to Cloudways (أخضر = تم) |

لا حاجة بعد اليوم لفتح SSH لتحديث الموقع — يكفي الـ push إلى `main`.
