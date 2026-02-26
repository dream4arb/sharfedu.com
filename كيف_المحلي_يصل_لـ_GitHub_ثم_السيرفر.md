# كيف يجعل أي تعديل في المحلي يُحفظ على GitHub ثم يُطبَّق على السيرفر

---

## (اختياري) ربط تلقائي: أي commit يُرفع مباشرة إلى GitHub

إذا أردت أن **كل مرة تعمل فيها commit يُنفَّذ push تلقائياً** (بدون كتابة `git push`):

1. شغّل **مرة واحدة** من جذر المشروع:
   - **Windows (PowerShell):**
     ```powershell
     .\scripts\setup-auto-push-to-github.ps1
     ```
   - **Linux / Mac / Git Bash:**
     ```bash
     chmod +x scripts/setup-auto-push-to-github.sh
     ./scripts/setup-auto-push-to-github.sh
     ```
2. بعد ذلك: عند أي تعديل نفّذ فقط:
   ```bash
   git add -A
   git commit -m "وصف التعديل"
   ```
   وسيتم **push إلى GitHub تلقائياً** بعد الـ commit.

---

## ١) من المحلي → حفظ التعديلات على GitHub

بعد أي تعديل في المشروع (في Cursor على جهازك):

1. افتح **Terminal** في Cursor (أو PowerShell في مجلد المشروع).
2. نفّذ **أمراً واحداً**:
   ```bash
   npm run deploy
   ```
   أو مع وصف للتعديل:
   ```bash
   npm run deploy -- "إصلاح صفحة الدخول"
   ```

**ماذا يفعل هذا الأمر؟**
- يضيف كل الملفات المعدّلة.
- ينشئ commit ويرفع إلى **GitHub** (فرع `main`).

بهذا **أي تعديل هنا في المحلي يصبح محفوظاً على GitHub** بعد تشغيل هذا الأمر.

---

## ٢) من GitHub → انعكاس التحديث على السيرفر مباشرة

عند كل **push** إلى فرع `main` يحدث التالي تلقائياً (إن كان الإعداد مكتملاً):

1. **GitHub Actions** يعمل:
   - يتحقق من البناء.
   - يرسل طلباً لـ **Cloudways** لتنفيذ **Git Pull** على السيرفر.
2. **Cloudways** يسحب آخر كود من GitHub إلى مجلد التطبيق على السيرفر.

**شرط أن يعمل هذا تلقائياً:**

- إعداد **Deployment via Git** على تطبيقك في لوحة Cloudways (ربط المستودع وفرع `main`).
- إضافة **Secrets** في GitHub:
  - المستودع → **Settings** → **Secrets and variables** → **Actions**
  - إضافة: `CLOUDWAYS_EMAIL`, `CLOUDWAYS_API_KEY`, `CLOUDWAYS_SERVER_ID`, `CLOUDWAYS_APP_ID`

بعد الـ **Pull** على السيرفر، Cloudways قد يشغّل أوامر البناء والتشغيل حسب إعداد التطبيق. إن لم يكن هناك أمر تلقائي بعد السحب، شغّل يدوياً مرة واحدة بعد كل نشر (عبر SSH):

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/git_repo
bash scripts/deploy-on-server.sh
```

(يمكن لاحقاً ضبط Cloudways ليشغّل هذا السكربت تلقائياً بعد كل Pull إن وُجدت الخيارات لذلك.)

---

## ملخص سريع

| ماذا تريد | ماذا تفعل |
|-----------|------------|
| **حفظ أي تعديل محلي على GitHub** | بعد التعديل شغّل: `npm run deploy` (أو مع رسالة: `npm run deploy -- "وصف"`) |
| **أن يعكس GitHub التحديث على السيرفر** | أضف Secrets في GitHub + ربط Git على Cloudways؛ عند كل `npm run deploy` يتم الـ push ثم يُسحب الكود على السيرفر تلقائياً. إن لم يُحدَّث الموقع، شغّل `deploy-on-server.sh` على السيرفر بعد النشر. |

---

بهذا: **تعديل في المحلي** → تشغيل **`npm run deploy`** → **GitHub يحفظ التعديل** → **السيرفر يحصل على التحديث** (بعد إعداد Cloudways و GitHub مرة واحدة).
