# توجيه الدومين إلى Node.js عبر .htaccess (حسب اقتراح دعم Cloudways)

الدليل الذي أرسله محمد: [How to host a NodeJS App on Cloudways](https://thakurguman.medium.com/how-to-host-a-nodejs-app-on-cloudways-120daa55e7fa)

---

## الشاشة البيضاء و"غير آمن"

- **الشاشة البيضاء**: سببها غالباً أن السيرفر يقدّم ملفات التطوير (مثل `/src/main.tsx`) أو يرسل ملفات JavaScript بنوع MIME خاطئ (`application/octet-stream` بدل `application/javascript`). المتصفح يرفض تنفيذ السكربت فيظهر الشاشة البيضاء.
- **"غير آمن" (SSL)**: مشكلة منفصلة عن الشاشة البيضاء. إصلاح الشهادة مهم للأمان والثقة لكنه لا يحل مشكلة نوع MIME.

**ما يجب فعله:**
1. التأكد أن `public_html` يحتوي فقط على **مخرجات البناء** (مجلد `server/public` بعد `npm run build`)، وليس مشروع التطوير كاملاً (لا مجلد `src/` ولا `index.html` الجذر).
2. إضافة أنواع MIME الصحيحة في `.htaccess` عندما يقدّم Apache الملفات من `public_html` (انظر الأسفل).

---

## ملاحظة مهمة

- الطريقة تعمل عندما يكون **Apache** هو من يقرأ ملف `.htaccess` (مثلاً في **Hybrid Stack** أو إذا فعّل الدعم **mod_proxy** لتطبيقك).
- إن كان تطبيقك على **Lightning Stack** فقط (Nginx بدون Apache)، فـ `.htaccess` **لا يُقرأ** عادةً، وتحتاج إعداد Nginx كما طلبنا سابقاً.
- بما أن دعم Cloudways (محمد) اقترح عليك `.htaccess`، فغالباً سيفعّلون **mod_proxy** لتطبيقك أو يوضحون أن تطبيقك يمر عبر Apache.

---

## ما الذي تطلبه من الدعم أولاً؟

اكتب لهم شيئاً مثل:

"كما اقترحتم، أريد استخدام .htaccess لتوجيه الطلبات إلى تطبيق Node.js على المنفذ 5000. **يرجى تفعيل mod_proxy لتطبيقي (sharfedu.com)** حتى تعمل قواعد الـ proxy في .htaccess. بعد التفعيل سأضيف القواعد في public_html."

---

## ماذا تضيف في .htaccess بعد تفعيل mod_proxy؟

1. ادخل عبر SSH إلى مجلد المشروع:
   ```bash
   cd /home/master/applications/cmkdrtgqcv/public_html
   ```

2. إن وُجد ملف اسمه `.htaccess` فافتحه للتعديل، وإلا أنشئ ملفاً جديداً باسم `.htaccess`:
   ```bash
   nano .htaccess
   ```

3. أضف **أنواع MIME** في أعلى الملف حتى لا يرسل السيرفر JS كـ `application/octet-stream` (سبب الشاشة البيضاء):

```apache
# أنواع MIME صحيحة لملفات التطبيق (تجنّب الشاشة البيضاء)
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType text/html .html
</IfModule>
```

4. ثم الصق **إما** (توجيه الطلبات غير الموجودة كملفات إلى Node):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]
```

أو إذا أراد الدليل توجيه كل شيء دون استثناء الملفات:

```apache
RewriteEngine On
RewriteRule ^(.*)$ http://127.0.0.1:5000/$1 [P,L]
```

5. احفظ الملف (في nano: Ctrl+O ثم Enter ثم Ctrl+X).

6. **مهم**: تأكد أن محتويات `public_html` هي **مخرجات البناء فقط**. على السيرفر:
   - نفّذ `npm run build` ثم انسخ محتويات مجلد `server/public` (مثل `index.html` ومجلد `assets/`) إلى `public_html`.
   - لا تضع مجلد `src/` ولا `index.html` من جذر المشروع في `public_html`؛ وإلا المتصفح سيطلب `/src/main.tsx` وستستمر الشاشة البيضاء.

7. جرّب فتح **https://sharfedu.com** في المتصفح.

---

## إن لم يعمل .htaccess

إذا كان تطبيقك على **Lightning Stack** (Nginx فقط)، فقواعد `.htaccess` لن تُطبَّق. في هذه الحالة اطلب من الدعم مرة أخرى إضافة إعداد **Nginx** (proxy_pass إلى 127.0.0.1:5000) كما في الطلب السابق.

---

## شهادة SSL ("غير آمن")

تحذير "غير آمن" (غير آمن) يظهر عندما لا تكون الشهادة مثبتة أو غير موثوقة. **هذا لا يسبب الشاشة البيضاء**؛ الشاشة البيضاء سببها نوع MIME أو تقديم ملفات التطوير بدل البناء.

لإصلاح SSL على Cloudways: من لوحة التحكم → تطبيقك → **Domain Management** → **SSL Certificate**، ثم تفعيل Let's Encrypt أو ربط شهادتك الخاصة.
