# ربط GitHub بـ Cloudways — خطوة بخطوة

الربط يسمح بأن يسحب السيرفر آخر التعديلات من GitHub تلقائياً بعد كل **push** إلى فرع `main`.

---

## الجزء الأول: من لوحة Cloudways

### 1) الحصول على بيانات الحساب و API

1. ادخل إلى **[Cloudways Platform](https://platform.cloudways.com/)** (حسابك).
2. من القائمة أو الإعدادات ابحث عن **API** أو **API Management**.
3. انسخ واحفظ:
   - **Email:** البريد المسجّل لحساب Cloudways.
   - **API Key:** المفتاح الذي يعطيك إياه Cloudways (إن لم يكن موجوداً فأنشئ واحداً).

### 2) الحصول على Server ID و Application ID

1. من لوحة Cloudways اختر **السيرفر** الذي عليه موقعك.
2. في صفحة السيرفر ستجد **Server ID** (رقم أو حروف) — انسخه.
3. اختر **التطبيق (Application)** المرتبط بموقعك (مثلاً sharfedu.com).
4. في صفحة التطبيق ستجد **Application ID** — انسخه.

> هذه الأرقام تظهر عادة في أعلى الصفحة أو في تفاصيل السيرفر/التطبيق. إن لم تجدها ابحث في القائمة عن "Server Details" أو "Application Details".

### 3) إعداد Git على التطبيق (Deployment via Git)

1. من لوحة Cloudways: **السيرفر** → **التطبيق** (مثلاً sharfedu.com).
2. من قائمة التطبيق اختر **Application** أو **Deployment** ثم **Deployment via Git** (أو **Git**).
3. إذا لم يكن الربط مضبوطاً:
   - **Repository URL:** ضع رابط المستودع، مثل:
     - `https://github.com/tariqalmarifa/sharfedu.com.git`
     - أو (إن استخدمت SSH): `git@github.com:tariqalmarifa/sharfedu.com.git`
   - **Branch:** ضع `main`.
   - إن طلب Cloudways **مفتاح Deploy Key**:
     - من Cloudways أنشئ مفتاح SSH (إن وُجدت الخيار) وانسخ **المفتاح العام (Public Key)**.
     - اذهب إلى GitHub (انظر الجزء الثاني) → المستودع → **Settings** → **Deploy keys** → **Add deploy key** → الصق المفتاح العام واحفظ.
   - احفظ الإعدادات في Cloudways.
4. جرّب **Deploy** أو **Pull** يدوياً مرة واحدة من Cloudways للتأكد أن السحب يعمل (من الفرع `main`).

---

## الجزء الثاني: من GitHub

### 4) إضافة الأسرار (Secrets) في المستودع

1. افتح المستودع على **GitHub** (مثلاً `https://github.com/tariqalmarifa/sharfedu.com`).
2. اضغط **Settings** (إعدادات المستودع).
3. من القائمة اليسرى: **Secrets and variables** → **Actions**.
4. اضغط **New repository secret** وأضف الأسرار **واحداً تلو الآخر** بالاسم والقيمة التالية:

| الاسم (Name)        | القيمة (Value)                    |
|---------------------|-----------------------------------|
| `CLOUDWAYS_EMAIL`   | البريد الذي نسخته من Cloudways   |
| `CLOUDWAYS_API_KEY` | مفتاح API من Cloudways            |
| `CLOUDWAYS_SERVER_ID`  | رقم السيرفر (Server ID)      |
| `CLOUDWAYS_APP_ID`     | رقم التطبيق (Application ID) |

5. (اختياري) إن احتجت فرعاً أو مساراً مختلفاً:
   - `CLOUDWAYS_BRANCH_NAME` = مثلاً `main`
   - `CLOUDWAYS_DEPLOY_PATH` = مسار النشر إن طلبه Cloudways

بعد حفظ الأسرار الأربعة الأساسية يصبح الربط من جهة GitHub جاهزاً.

---

## الجزء الثالث: التأكد من الربط

1. نفّذ **push** إلى فرع `main` (مثلاً تعديل بسيط ثم `git push origin main`).
2. في GitHub اذهب إلى تبويب **Actions** في المستودع.
3. يجب أن يظهر تشغيل للـ workflow اسمه **Deploy to Cloudways** وأن ينتهي **بنجاح (علامة خضراء)**.
4. إن ظهر **فشل (X حمراء)** اضغط على التشغيل واقرأ رسالة الخطأ (غالباً خطأ في أحد الأسرار أو في إعداد Git على Cloudways).

---

## ملخص سريع

| أين        | ماذا تفعل |
|-----------|-----------|
| **Cloudways** | تأخذ Email + API Key + Server ID + App ID، وتضبط **Deployment via Git** (رابط المستودع + فرع `main` + Deploy key إن لزم). |
| **GitHub**    | تضيف أربعة **Repository secrets**: `CLOUDWAYS_EMAIL`, `CLOUDWAYS_API_KEY`, `CLOUDWAYS_SERVER_ID`, `CLOUDWAYS_APP_ID`. |
| **بعد الربط** | كل **push** إلى `main` يشغّل النشر ويسحب السيرفر آخر الكود من GitHub. |

---

## ملاحظة بعد السحب على السيرفر

بعد أن يسحب السيرفر الكود، قد يحتاج التطبيق إلى **بناء** و**إعادة تشغيل** حتى يظهر التعديل على الموقع. إن وُجد في Cloudways خيار **Deployment Script** أو **Post-Deploy Command** فاضبط فيه أمراً مثل:

- `npm ci && npm run build` ثم إعادة تشغيل Node (أو PM2).

وإلا يمكن تشغيل سكربت النشر يدوياً عبر SSH مرة بعد كل تحديث (مثل `bash scripts/deploy-on-server.sh` من مجلد `git_repo`).
