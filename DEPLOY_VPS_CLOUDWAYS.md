# نشر الموقع الكامل على سيرفرك (Cloudways أو VPS)

دليل خطوة بخطوة: تثبيت Node.js، استنساخ المشروع، البناء، تشغيل التطبيق بـ PM2، وتوجيه Nginx أو Apache إلى المنفذ 5000.

---

## المتطلبات

- سيرفر يعمل عليه **Ubuntu** أو **Debian** (أو وصول SSH لسيرفر Cloudways/VPS).
- دومين يشير إلى عنوان IP السيرفر (مثل `sharfedu.com`).

---

## الخطوة 1: الدخول إلى السيرفر عبر SSH

من جهازك:

```bash
ssh root@عنوان-IP-السيرفر
```

أو استخدم المستخدم الذي أنشأته (مثل `ubuntu@عنوان-IP`). على Cloudways: من لوحة التحكم → Server → SSH Terminal أو استخدم بيانات SSH المعطاة لك.

---

## الخطوة 2: تثبيت Node.js (إصدار 20 LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

التحقق:

```bash
node -v
npm -v
```

يُفترض أن ترى شيئاً مثل `v20.x.x` ورقم إصدار npm.

---

## الخطوة 3: تثبيت Git (إن لم يكن مثبتاً)

```bash
sudo apt-get update
sudo apt-get install -y git
```

---

## الخطوة 4: استنساخ المشروع

اختر مجلداً مناسباً (مثلاً داخل `/var/www` أو المجلد الذي تستخدمه لمواقعك):

```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/tariqalmarifa/sharfedu.com.git
sudo chown -R $USER:$USER /var/www/sharfedu.com
cd /var/www/sharfedu.com
```

إذا كان المستودع خاصاً، استخدم SSH أو Personal Access Token بدل الرابط أعلاه.

---

## الخطوة 5: إنشاء ملف `.env`

```bash
cd /var/www/sharfedu.com
nano .env
```

الصق المحتوى التالي **وغيّر القيم حسب حاجتك**:

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

SESSION_SECRET=غيّر-هذا-إلى-سلسلة-عشوائية-طويلة-مثل-a1b2c3d4e5f6
ADMIN_EMAIL=admin@sharfedu.com
```

احفظ الملف (في nano: `Ctrl+O` ثم Enter ثم `Ctrl+X`).

لتوليد سلسلة عشوائية لـ `SESSION_SECRET` يمكنك تشغيل:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

واستبدال `غيّر-هذا-...` بالناتج.

---

## الخطوة 6: رفع ملف قاعدة البيانات (إن وُجد)

إذا كان لديك ملف **`sqlite.db`** على جهازك (يحتوي المستخدمين والإعدادات):

- ارفعه إلى **جذر المشروع** على السيرفر: `/var/www/sharfedu.com/sqlite.db`
- يمكنك استخدام SCP من جهازك:

```bash
scp sqlite.db المستخدم@عنوان-IP:/var/www/sharfedu.com/
```

أو استخدم SFTP/FileZilla لرفع الملف إلى نفس المسار. إن لم يكن لديك ملف، التطبيق سينشئ قاعدة جديدة عند أول تشغيل.

---

## الخطوة 7: تثبيت الاعتماديات والبناء

```bash
cd /var/www/sharfedu.com
npm install
npm run build
```

انتظر حتى ينتهي البناء (قد يستغرق دقيقتين). عند النجاح ستجد:
- مجلد `dist/public`
- ملف `dist/index.cjs`

---

## الخطوة 8: تثبيت PM2 وتشغيل التطبيق

```bash
sudo npm install -g pm2
cd /var/www/sharfedu.com
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
```

انسخ السطر الذي يظهر بعد `pm2 startup` (مثل `sudo env PATH=...`) ونفّذه كما هو، ثم:

```bash
pm2 save
```

التحقق:

```bash
pm2 status
pm2 logs sharfedu --lines 20
```

يفترض أن ترى `sharfedu` في حالة **online** وبدون أخطاء. التطبيق يعمل الآن على المنفذ **5000** داخل السيرفر.

---

## الخطوة 9: توجيه Nginx أو Apache إلى المنفذ 5000

يجب جعل الويب سيرفر (Nginx أو Apache) يمرّر الطلبات إلى `http://127.0.0.1:5000`.

---

### إذا كان السيرفر يستخدم Nginx

1. إنشاء ملف إعداد للموقع (غيّر `sharfedu.com` إلى دومينك):

```bash
sudo nano /etc/nginx/sites-available/sharfedu.com
```

2. الصق التالي (واستبدل `sharfedu.com` و `www.sharfedu.com` بدومينك):

```nginx
server {
    listen 80;
    server_name sharfedu.com www.sharfedu.com;

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
}
```

3. تفعيل الموقع واختبار Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/sharfedu.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### إذا كان السيرفر يستخدم Apache

1. تفعيل الوحدات المطلوبة:

```bash
sudo a2enmod proxy proxy_http
```

2. إنشاء ملف إعداد (غيّر الدومين):

```bash
sudo nano /etc/apache2/sites-available/sharfedu.com.conf
```

3. الصق التالي:

```apache
<VirtualHost *:80>
    ServerName sharfedu.com
    ServerAlias www.sharfedu.com

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:5000/
    ProxyPassReverse / http://127.0.0.1:5000/
</VirtualHost>
```

4. تفعيل الموقع وإعادة تشغيل Apache:

```bash
sudo a2ensite sharfedu.com.conf
sudo systemctl reload apache2
```

---

## الخطوة 10: تشفير SSL (HTTPS) — موصى به

باستخدام **Certbot** (Let's Encrypt):

```bash
sudo apt-get install -y certbot
```

- **Nginx:**
  ```bash
  sudo certbot --nginx -d sharfedu.com -d www.sharfedu.com
  ```
- **Apache:**
  ```bash
  sudo a2enmod ssl
  sudo certbot --apache -d sharfedu.com -d www.sharfedu.com
  ```

اتبع التعليمات على الشاشة. Certbot يضبط الشهادة ويجددها تلقائياً.

---

## الخطوة 11: فتح المنفذ 5000 في الجدار الناري (إن لزم)

على السيرفر، التطبيق يستمع على `127.0.0.1:5000` (محلي فقط)، لذا لا تحتاج عادةً لفتح المنفذ 5000 للإنترنت. Nginx/Apache يستقبل على 80/443 ويمرّر إلى 5000.

إن كنت قد غيّرت التطبيق ليكون `HOST=0.0.0.0` وطلبت الوصول المباشر للمنفذ 5000 (غير موصى به عادةً)، عندها فقط قد تحتاج:

```bash
sudo ufw allow 5000
sudo ufw reload
```

في الإعداد العادي (الوصول عبر Nginx/Apache فقط) لا تحتاج ذلك.

---

## ملخص الأوامر (للمراجعة)

```bash
# 1. تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. استنساخ المشروع
cd /var/www
sudo git clone https://github.com/tariqalmarifa/sharfedu.com.git
sudo chown -R $USER:$USER /var/www/sharfedu.com
cd /var/www/sharfedu.com

# 3. ملف .env (أنشئه يدوياً كما في الخطوة 5)
# 4. بناء وتشغيل
npm install
npm run build
sudo npm install -g pm2
pm2 start dist/index.cjs --name sharfedu
pm2 save
pm2 startup
# ثم تنفيذ السطر الذي يظهر من pm2 startup

# 5. إعداد Nginx أو Apache كما في الخطوة 9
# 6. SSL: certbot كما في الخطوة 10
```

---

## تحديث الموقع لاحقاً

بعد تعديل الكود ورفعه إلى GitHub:

```bash
cd /var/www/sharfedu.com
git pull
npm install
npm run build
pm2 restart sharfedu
```

---

## أوامر PM2 مفيدة

| الأمر | الوظيفة |
|--------|---------|
| `pm2 status` | عرض حالة التطبيق |
| `pm2 logs sharfedu` | عرض السجلات |
| `pm2 restart sharfedu` | إعادة تشغيل التطبيق |
| `pm2 stop sharfedu` | إيقاف التطبيق |
| `pm2 delete sharfedu` | إزالة التطبيق من PM2 |

بعد إكمال هذه الخطوات، الموقع الكامل (الواجهة + لوحة التحكم + تسجيل الدخول + API) يعمل على دومينك عبر سيرفرك (Cloudways أو VPS).
