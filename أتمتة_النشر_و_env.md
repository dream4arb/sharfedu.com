# أتمتة النشر وملف .env

## ملف `.env` — لا يظهر على GitHub أبداً

- **ملف `.env`** موجود في **`.gitignore`** → عند تنفيذ `git push` لا يُرفع إلى GitHub.
- **لا نطلب من GitHub "حذف .env" بعد الجاهزية** — لأنه أصلاً غير مرفوع. نحرص فقط على أن يبقى **على السيرفر فقط** (في مجلد التطبيق).
- إذا أضفت `.env` بالخطأ ثم عملت commit، الـ workflow **Check & Build** سيفشل ويذكرك بعدم رفع `.env`.

---

## ما الذي يُنفَّذ تلقائياً؟

| الحدث | ما يحدث |
|--------|---------|
| **push** أو **pull request** إلى `main` | تشغيل **Check & Build**: التحقق من عدم وجود `.env` في المستودع، ثم `npm run build:upload` للتأكد أن البناء يعمل. |
| **push** إلى `main` | إن كانت الـ Secrets مضبوطة (Cloudways)، تشغيل **Deploy to Cloudways** لتنفيذ سحب من Git على السيرفر. |

---

## متطلبات النشر التلقائي إلى Cloudways

لكي يعمل **Deploy to Cloudways** عند الـ push إلى `main`:

1. في **GitHub** → المستودع → **Settings** → **Secrets and variables** → **Actions**: إضافة:
   - `CLOUDWAYS_EMAIL`
   - `CLOUDWAYS_API_KEY`
   - `CLOUDWAYS_SERVER_ID`
   - `CLOUDWAYS_APP_ID`
   - (اختياري) `CLOUDWAYS_BRANCH_NAME` و `CLOUDWAYS_DEPLOY_PATH`
2. على **Cloudways**: تفعيل **Deployment via Git** وربط المستودع بحيث يقوم السيرفر بعمل `git pull` عند الطلب من الـ API.

---

## عندما يصبح الموقع جاهزاً 100%

- لا حاجة لأي أمر "حذف .env من GitHub" — الملف غير موجود في المستودع.
- تأكد أن **على السيرفر** يوجد ملف `.env` في مجلد التطبيق (الذي فيه `index.cjs`) ويحتوي القيم الصحيحة.
- استمر بالعمل كالمعتاد: تعديل محلي → `git push` → (إن كان النشر التلقائي مضبوطاً) السيرفر يسحب التحديثات تلقائياً.
