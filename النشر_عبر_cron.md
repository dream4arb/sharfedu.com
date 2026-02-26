# النشر التلقائي عبر Cron (بدون SSH من GitHub)

الاتصال SSH من خوادم GitHub إلى Cloudways يعيد **exit code 255** (اتصال مرفوض)، لذلك النشر يتم **من السيرفر نفسه** عبر جدولة (cron).

---

## الفكرة

1. أنت ترفع التعديلات إلى GitHub (مع الملفات المبنية `deploy_public_html` في الـ commit).
2. السيرفر يشغّل **كل دقيقتين** أمراً يسحب آخر التعديلات ثم ينسخ الواجهة إلى `public_html` ويعيد تشغيل التطبيق.
3. خلال دقيقتين من أي push يظهر التحديث على الموقع.

---

## الإعداد (مرة واحدة على السيرفر)

اتصل بالسيرفر عبر **SSH** ثم نفّذ:

### 1) التأكد أن السيرفر يسحب من GitHub

إذا كان المستودع **خاصاً** (private)، السيرفر يحتاج مفتاح نشر (Deploy Key) في GitHub. إذا كان المستودع **عاماً** لا حاجة لمفتاح.

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/git_repo
git fetch origin
```

إن ظهر خطأ (مثلاً Permission denied)، أضف مفتاح SSH من السيرفر إلى GitHub: **المستودع → Settings → Deploy keys → Add deploy key** والصق محتوى `cat ~/.ssh/id_rsa.pub` من السيرفر (أو أنشئ مفتاحاً جديداً للسيرفر).

### 2) إضافة Cron

```bash
crontab -e
```

أضف السطر التالي (كل دقيقتين) ثم احفظ واخرج:

```
*/2 * * * * cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/git_repo && git fetch origin && git reset --hard origin/main && bash scripts/deploy-on-server.sh >> /home/894422.cloudwaysapps.com/cmkdrtgqcv/logs/cron-deploy.log 2>&1
```

**مهم:** استبدل المسار `/home/894422.cloudwaysapps.com/cmkdrtgqcv` بمسار تطبيقك إن كان مختلفاً.

### 3) إنشاء ملف السجل (إن لم يكن موجوداً)

```bash
mkdir -p /home/894422.cloudwaysapps.com/cmkdrtgqcv/logs
touch /home/894422.cloudwaysapps.com/cmkdrtgqcv/logs/cron-deploy.log
```

---

## بعد الإعداد

- عند كل **push** إلى `main` (مع وجود الملفات المبنية في الـ commit)، خلال **دقيقتين** يشغّل الـ cron السحب وسكربت النشر ويظهر التحديث على الموقع.
- لمعرفة ما إذا كان الـ cron يعمل: `tail -f /home/.../logs/cron-deploy.log`

---

## إن لم ترفع الملفات المبنية مع كل push

يجب أن يكون في الـ commit مجلد **deploy_public_html** (نتيجة `npm run build`). إذا كنت ترفع من جهازك:

```powershell
npm run build
git add deploy_public_html server/public
git add -A
git commit -m "تحديث الموقع"
git push origin main
```

أو استخدم `npm run deploy` إذا كان يضيف هذه الملفات تلقائياً.
