# أوامر إصلاح صلاحيات sqlite.db على السيرفر

شغّل هذه الأوامر عبر SSH من مجلد التطبيق (نفس المجلد الذي فيه `dist/index.cjs`).

## 1) معرفة المستخدم الذي يشغّل Node

```bash
ps -o user= -p 601429
```

(أو استبدل `601429` بـ PID العملية الحالية من `ps aux | grep node`.)

## 2) الانتقال لمجلد التطبيق والتحقق من sqlite.db

```bash
cd /home/master/applications/اسم_التطبيق/app
# أو المسار الذي فيه dist/index.cjs حسب سيرفرك
ls -la sqlite.db
pwd
```

## 3) منح الصلاحيات للمستخدم الصحيح

استبدل `master_nyrmduu` بالمستخدم الذي ظهر من الأمر في الخطوة 1 (مثلاً `master_+` أو الاسم الكامل مثل `master_nyrmduu` على Cloudways):

```bash
# صلاحيات الملف
chmod 664 sqlite.db

# تملك الملف للمستخدم الذي يشغّل Node
sudo chown master_nyrmduu:master_nyrmduu sqlite.db
```

إن لم يكن لديك `sudo`، جرّب بدونها (إن كنت نفس المستخدم):

```bash
chown $(ps -o user= -p 601429) sqlite.db
```

## 4) التأكد من .env ومسار قاعدة البيانات

```bash
grep DATABASE .env
```

يُفضّل أن يكون المسار مطلقاً، مثلاً:

```
DATABASE_URL=file:/home/master/applications/اسم_التطبيق/app/sqlite.db
```

عدّل `.env` إن لزم (استخدم `nano .env` أو `vim .env`).

## 5) إعادة تشغيل التطبيق

```bash
pm2 restart all
```

أو إن كنت تشغّل Node يدوياً: أوقف العملية (Ctrl+C) ثم شغّلها من جديد من نفس المجلد.

---

بعد ذلك جرّب تسجيل الدخول من الموقع مرة أخرى.
