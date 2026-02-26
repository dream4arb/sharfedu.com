# لماذا لم ينعكس التعديل على السيرفر؟

التعديلات **موجودة على GitHub** (تم الـ push بنجاح)، لكن **سيرفر Cloudways لم يُحدَّث** لأن **GitHub Actions فشل** (العلامة الحمراء ✗ في تبويب Actions).

---

## ما الذي يفشل؟

يوجد workflowان:

1. **Check & Build** — يتحقق من عدم وجود `.env` في المستودع ثم يشغّل `npm run build:upload`. إذا فشل هنا فلن يُنفَّذ النشر.
2. **Deploy to Cloudways** — يطلب من Cloudways (عبر الـ API) تنفيذ **git pull** على السيرفر. إذا فشل فلن يُحدَّث الموقع.

---

## خطوات الإصلاح

### 1) معرفة سبب الفشل من السجلات

1. ادخل إلى المستودع على GitHub: **tariqalmarifa/sharfedu.com**
2. افتح تبويب **Actions**
3. اضغط على أي تشغيل فاشل (العلامة الحمراء)
4. اضغط على الـ job الفاشل (مثلاً **deploy** أو **check-env-and-build**)
5. اقرأ الرسالة في الأسفل لمعرفة السبب (مثلاً: خطأ في الـ API، أو secrets ناقصة، أو فشل البناء)

### 2) إذا كان الفشل من **Deploy to Cloudways**

تأكد من إعداد **GitHub Secrets** في المستودع:

- **Settings** → **Secrets and variables** → **Actions**
- يجب وجود هذه الـ secrets (أسماءها بالضبط):
  - `CLOUDWAYS_EMAIL` — بريدك في Cloudways
  - `CLOUDWAYS_API_KEY` — مفتاح الـ API من [Cloudways Platform](https://platform.cloudways.com/api)
  - `CLOUDWAYS_SERVER_ID` — رقم السيرفر
  - `CLOUDWAYS_APP_ID` — رقم التطبيق

اختياري:
- `CLOUDWAYS_BRANCH_NAME` — إن لم تضفه يُستخدم `main`
- `CLOUDWAYS_DEPLOY_PATH` — مسار النشر؛ اتركه فارغاً للنشر داخل `public_html`

وتأكد من تفعيل **Deployment Via Git** على Cloudways وربط المستودع كما في [دليل Cloudways](https://support.cloudways.com/en/articles/5124087-deploy-code-to-your-application-using-git).

### 3) إذا كان الفشل من **Check & Build**

- إن ظهرت رسالة عن وجود `.env`: تأكد أن ملف `.env` **غير مرفوع** إلى المستودع (موجود في `.gitignore`).
- إن فشل البناء (`npm run build:upload`): شغّل محلياً `npm run build:upload` وراجع الخطأ الذي يظهر.

### 4) نشر يدوي مؤقتاً (حتى يعمل الـ workflow)

يمكنك تحديث السيرفر يدوياً عبر SSH:

```bash
# اتصل بالسيرفر ثم ادخل مجلد التطبيق (مثلاً public_html أو المسار الذي فيه المستودع)
cd /path/to/your/app
git pull origin main
# ثم أعد تشغيل التطبيق إن لزم (مثلاً pm2 restart)
```

بعد الـ pull ستظهر آخر التعديلات (بما فيها تغيير الفوتر) على الموقع.

---

## ملخص

| السبب المحتمل | ما تفعله |
|---------------|----------|
| Secrets ناقصة أو خاطئة | أضف/صحّح الـ secrets في GitHub ثم أعد تشغيل الـ workflow |
| Deployment Via Git غير مضبوط على Cloudways | اربط المستودع من لوحة Cloudways واتبع الدليل |
| فشل Check & Build (مثلاً .env أو خطأ بناء) | أزل .env من المستودع أو أصلح خطأ البناء ثم أعد الـ push |
| تحتاج الموقع محدثاً فوراً | نفّذ `git pull origin main` على السيرفر عبر SSH |

بعد إصلاح السبب من سجلات Actions، أعد تشغيل الـ workflow من تبويب **Actions** → **Run workflow** (أو اعمل push جديد) للتأكد أن النشر يعمل.
