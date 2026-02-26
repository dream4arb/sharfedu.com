# أتمتة النشر من GitHub إلى Cloudways

## 1. التأكد من رفع تعديلات "دخول جوجل" (Push)

ملف **`.env`** مضاف إلى `.gitignore` ولا يُرفع إلى GitHub (لأسباب أمنية). المتغيرات تضبط في لوحة Cloudways أو على السيرفر يدوياً.

**الملفات التي يجب أن تكون مرفوعة (مُضافة للـ commit ثم push):**

| الملف | الغرض |
|--------|--------|
| `server/auth/localAuth.ts` | رابط callback جوجل واحتياطي الإنتاج |
| `server/index.ts` | CORS وmiddleware |
| `src/hooks/use-auth.ts` | استخدام getApiUrl لطلبات المصادقة |
| `src/pages/Login.tsx` | استخدام getApiUrl للدخول والتسجيل وجوجل |
| `src/pages/CompleteProfile.tsx` | استخدام getApiUrl لتحديث البروفايل |
| `src/lib/api-base.ts` | تعليق يوضح الرابط المباشر للدخول عبر جوجل |
| `.htaccess` | توجيه /api إلى Node (بدون api-proxy) |
| `.gitignore` | استثناء .env من الرفع |

**أوامر الرفع من جهازك (بعد التأكد أن .env غير مُضاف):**

```bash
# التحقق أن .env غير مُتتبّع
git status
# يجب ألا يظهر .env تحت "Changes to be committed"

# إضافة الملفات (بدون .env)
git add .gitignore server/auth/localAuth.ts server/index.ts src/hooks/use-auth.ts src/pages/Login.tsx src/pages/CompleteProfile.tsx src/lib/api-base.ts .htaccess
# إضافة ملفات التوثيق إن رغبت
git add AUTH_ROUTES_AND_LOGS.md CLOUDWAYS_503_AUTH.md CLOUDWAYS_AUTO_DEPLOY.md

# commit ثم push
git commit -m "fix: Google login callback + CORS + auth routes; add Cloudways auto-deploy guide"
git push origin main
```

**على السيرفر (Cloudways):** تأكد أن ملف `.env` موجود في مجلد التطبيق وأن فيه على الأقل:
`GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback`

---

## 2. تفعيل النشر التلقائي (Auto-Deploy) من لوحة Cloudways

Cloudways يدعم النشر التلقائي عند الدفع إلى GitHub عبر **Webhooks**.

### الخطوة 1: إعداد Git على التطبيق (مرة واحدة)

1. من لوحة **Cloudways** → اختر السيرفر ثم التطبيق.
2. **Application** → **Deployment via Git** (أو **Git**).
3. إذا لم يكن الربط موجوداً:
   - أنشئ مفتاح SSH من Cloudways وأضف **المفتاح العام** إلى GitHub:
     - GitHub → المستودع → **Settings** → **Deploy keys** → Add deploy key.
   - في Cloudways أدخل **Repository URL** (مثل `git@github.com:username/sharfedu.com.git`) والـ **Branch** (مثل `main`).
   - احفظ ثم نفّذ **Deploy** يدوياً مرة واحدة للتأكد أن السحب يعمل.

### الخطوة 2: الحصول على Webhook URL للنشر التلقائي

1. في توثيق Cloudways: [Automatically Deploy From Git Using Webhooks](https://support.cloudways.com/en/articles/5124785-automatically-deploy-from-git-to-server-using-webhooks).
2. الطريقة المختصرة:
   - إنشاء ملف **gitautodeploy.php** في **public_html** (أو المسار الذي يعطيك إياه Cloudways) مع **API Key** و **Email** من [Cloudways API](https://platform.cloudways.com/api).
   - أو: التحقق إن Cloudways يوفّر في لوحة التطبيق خيار **Webhook URL** أو **Deploy Trigger URL** جاهز — إن وُجد فانسخه.

3. **رابط الـ Webhook** يبدو تقريباً كالتالي (مثال):
   ```
   https://sharfedu.com/gitautodeploy.php?server_id=XXXXX&app_id=YYYYY&git_url=git@github.com:USER/REPO.git&branch_name=main
   ```
   استبدل `server_id`, `app_id`, `git_url`, `branch_name` بقيم تطبيقك.

### الخطوة 3: إضافة الـ Webhook في GitHub

1. اذهب إلى مستودع المشروع على **GitHub** → **Settings** → **Webhooks** → **Add webhook**.
2. **Payload URL:** الصق رابط الـ Webhook من Cloudways.
3. **Content type:** `application/json` (أو ما تنص عليه Cloudways).
4. **Trigger:** اختيار **Just the push event** (أو حسب ما يدعمه سكربت Cloudways).
5. احفظ (**Add webhook**).

بعد ذلك، كل **push** إلى الفرع المُختار (مثل `main`) يطلق طلباً على الـ Webhook ويُشغّل سحب الكود ثم النشر على Cloudways.

### ملاحظة لتطبيقات Node.js

بعد سحب الكود، Cloudways يحتاج **أمر بناء** و **أمر تشغيل**:

- **Build:** مثلاً `npm ci && npm run build`
- **Start:** مثلاً `npm start` أو `node dist/index.cjs` (أو عبر PM2 إن كان مُعداً)

تأكد من ضبط هذه الأوامر في إعدادات التطبيق (مثل **Start/Stop Script** أو **Deployment** في لوحة Cloudways) حتى يعيد البناء والتشغيل بعد كل pull.

---

## 3. خيار بديل: GitHub Actions + Cloudways API

يوجد في المشروع workflow جاهز: **`.github/workflows/cloudways-deploy.yml`** — يُنفّذ عند كل **push** إلى فرع **main** ويطلب من Cloudways سحب الكود (Git Pull).

**الإعداد (مرة واحدة):**

1. من [Cloudways API](https://platform.cloudways.com/api) انسخ **Email** و **API Key**. من لوحة Cloudways احصل على **Server ID** و **Application ID**.
2. في GitHub: المستودع → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**، أضف:
   - `CLOUDWAYS_EMAIL` — بريد حساب Cloudways
   - `CLOUDWAYS_API_KEY` — مفتاح API
   - `CLOUDWAYS_SERVER_ID` — رقم السيرفر
   - `CLOUDWAYS_APP_ID` — رقم التطبيق
   - `CLOUDWAYS_BRANCH_NAME` — اسم الفرع (مثل `main`) — اختياري، الافتراضي `main`
   - `CLOUDWAYS_DEPLOY_PATH` — مسار النشر إن لزم — اختياري
3. تأكد أن **Deployment via Git** مُعدّ على تطبيق Cloudways (ربط المستودع والمفتاح والفرع).

بعد ذلك كل **push** إلى `main` سيُشغّل الـ workflow وسيرسل طلب Git Pull إلى Cloudways. يجب أن يكون على السيرفر أمر ما يعيد البناء والتشغيل بعد الـ pull (أو أن Cloudways يفعل ذلك تلقائياً حسب إعدادات التطبيق).

---

## 4. ملخص سريع

| الهدف | الإجراء |
|--------|--------|
| رفع تعديلات دخول جوجل | `git add` الملفات أعلاه (بدون .env) → `git commit` → `git push origin main` |
| عدم رفع .env | التأكد أن `.env` في `.gitignore` (تمت إضافته) |
| تفعيل Auto-Deploy | ربط Git على Cloudways → إنشاء Webhook URL → إضافته في GitHub Webhooks |
| بعد كل نشر | التأكد أن أمر البناء والتشغيل مُعدّ في Cloudways وأن `.env` على السيرفر يحتوي `GOOGLE_CALLBACK_URL=...` |
