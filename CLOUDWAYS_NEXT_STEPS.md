# الخطوات التالية بعد إنشاء تطبيق sharfedu.com على Cloudways

بعد إنشاء التطبيق، اتبع الخطوات بالترتيب لنشر الموقع الكامل (Node.js).

---

## 1. الحصول على بيانات SSH للسيرفر

- من لوحة Cloudways: **Servers** → اختر السيرفر الذي عليه التطبيق.
- ادخل إلى **SSH Terminal** أو انسخ بيانات **SSH** (المستخدم، عنوان IP، ومفتاح SSH أو كلمة المرور).
- من جهازك افتح الطرفية واتصل عبر SSH، مثلاً:
  ```bash
  ssh master@عنوان-IP-السيرفر
  ```
  (استخدم المستخدم والعنوان الذي يظهر في Cloudways.)

---

## 2. معرفة مسار التطبيق على السيرفر

على Cloudways، كل تطبيق له مجلد خاص، غالباً يشبه:

```text
/home/master/applications/اسم_التطبيق/
```

مثال لـ `sharfedu.com`:

```text
/home/master/applications/sharfedu_com/
```

يمكنك التأكد من لوحة التطبيق: **Application** → **Access Details** أو **Application Settings** لرؤية **Application Path**.

---

## 3. تثبيت Node.js على السيرفر

بعد الدخول عبر SSH نفّذ:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

---

## 4. استنساخ المشروع داخل مسار التطبيق (أو بجانبه)

مثال إذا كان مسار التطبيق `/home/master/applications/sharfedu_com`:

```bash
cd /home/master/applications/sharfedu_com
sudo git clone https://github.com/tariqalmarifa/sharfedu.com.git app
sudo chown -R master:master app
cd app
```

(إن كان المستودع خاصاً استخدم رابط SSH أو Token بدل الرابط أعلاه.)

---

## 5. إنشاء ملف `.env`

```bash
cd /home/master/applications/sharfedu_com/app
nano .env
```

أضف (وغيّر القيم):

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
SESSION_SECRET=ضع-سلسلة-عشوائية-طويلة-هنا
ADMIN_EMAIL=admin@sharfedu.com
```

احفظ ثم أغلق المحرر.

---

## 6. رفع ملف `sqlite.db` (إن وُجد)

إذا كان لديك ملف قاعدة بيانات من جهازك، ارفعه إلى مجلد المشروع المستنسخ، مثلاً:

```text
/home/master/applications/sharfedu_com/app/sqlite.db
```

(يمكن عبر SFTP أو SCP من جهازك.)

---

## 7. البناء وتشغيل التطبيق بـ PM2

```bash
cd /home/master/applications/sharfedu_com/app
npm install
npm run build
sudo npm install -g pm2
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
```

نفّذ السطر الذي يظهر بعد `pm2 startup` (إن طُلب منك)، ثم:

```bash
pm2 save
pm2 status
```

تأكد أن `sharfedu` يظهر **online**.

---

## 8. ضبط Nginx لتمرير الطلبات إلى المنفذ 5000

على Cloudways يمكن إضافة إعداد Nginx من لوحة السيرفر:

- **Servers** → سيرفرك → **Settings & Packages** أو **Nginx** أو **Application Settings**.
- ابحث عن **Varnish / Nginx** أو **Custom Nginx Configuration** أو **Application URL**.
- المطلوب: جعل الطلبات الواردة إلى دومين التطبيق (مثلاً `sharfedu.com`) تُمرَّر إلى `http://127.0.0.1:5000`.

إن وُجد خيار **Custom Nginx Config** أو **Nginx Configuration** للتطبيق، أضف شيئاً مثل:

```nginx
location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

ثم احفظ وأعد تحميل Nginx إن لزم.

إن لم تجد مكاناً واضحاً، راجع توثيق Cloudways لـ "Custom App" أو "Node.js" أو "Reverse Proxy".

---

## 9. ربط الدومين بالتطبيق

- من لوحة Cloudways: **Application** → **Domain** أو **Application Settings**.
- أضف الدومين (مثل `sharfedu.com` و `www.sharfedu.com`) وربطه بهذا التطبيق.
- تأكد أن سجل الـ DNS للدومين يشير إلى عنوان IP السيرفر (أو إلى الـ CNAME الذي تعطيك إياه Cloudways).

---

## 10. التحقق

- افتح المتصفح وادخل إلى `https://sharfedu.com` (أو الرابط الذي ربطته).
- يفترض أن تظهر الصفحة الرئيسية لمنصة شارف، وتسجيل الدخول ولوحة التحكم يعملان إذا كان كل شيء مضبوطاً.

---

## ملخص الترتيب

1. SSH → تثبيت Node.js → استنساخ المشروع في مسار التطبيق.
2. إنشاء `.env` ورفع `sqlite.db` إن وُجد.
3. `npm install` → `npm run build` → تشغيل بـ PM2.
4. ضبط Nginx لتمرير الطلبات إلى المنفذ 5000.
5. ربط الدومين بالتطبيق والتحقق من الموقع.

لتفاصيل أوامر البناء وPM2 وNginx كاملة راجع الملف **DEPLOY_VPS_CLOUDWAYS.md** في المشروع.
