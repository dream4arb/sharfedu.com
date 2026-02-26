# سحب التحديثات على سيرفر Cloudways (بدون تعارضات، مع الحفاظ على .env)

بعد كل **push** من Cursor إلى `origin/main`، على السيرفر نفّذ التالي لتصبح النسخة مطابقة تماماً للمستودع دون فقدان ملف `.env` المحلي.

---

## الطريقة الأسهل: أمر واحد فقط

من مجلد **git_repo** على السيرفر (بعد الدخول مرة واحدة):

```bash
cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/git_repo
bash scripts/deploy-on-server.sh
```

هذا السكربت ينفّذ تلقائياً: حفظ `.env` → جلب التحديثات → استعادة `.env` → `npm install` → نسخ الواجهة (من `deploy_public_html` أو `server/public`) → إعادة تشغيل التطبيق. لا حاجة لنسخ أوامر متعددة.

---

## إعداد مرة واحدة فقط: Git بدون يوزر/باسوورد أبداً (SSH)

لكي لا يطلب منك GitHub اسم مستخدم وكلمة مرور في كل مرة، استخدم **SSH** بدلاً من HTTPS. تُنفَّذ الخطوات التالية **مرة واحدة** على السيرفر ثم تنسى الموضوع.

### أ) التأكد من أن الـ remote يستخدم SSH

على السيرفر داخل مجلد المشروع (`git_repo`):

```bash
git remote -v
```

- إن ظهر `https://github.com/...` فغيّره إلى SSH:

```bash
git remote set-url origin git@github.com:tariqalmarifa/sharfedu.com.git
```

- تحقق مرة أخرى:

```bash
git remote -v
```

يجب أن ترى: `origin  git@github.com:tariqalmarifa/sharfedu.com.git`

### ب) مفتاح SSH على السيرفر (إن لم يكن موجوداً)

أنت سابقاً أضفت مفتاحاً من السيرفر إلى GitHub (Deploy key). إن كان لا يزال موجوداً على السيرفر، لا تحتاج لفعل شيء.

إن ظهرت رسالة أن الاتصال مرفوض أو يطلب كلمة مرور، أنشئ مفتاحاً جديداً **مرة واحدة**:

```bash
ssh-keygen -t ed25519 -C "sharfedu-server" -f ~/.ssh/id_ed25519_sharf -N ""
cat ~/.ssh/id_ed25519_sharf.pub
```

انسخ المحتوى الذي يظهر (يبدأ بـ `ssh-ed25519 ...`) ثم في GitHub: المستودع → **Settings** → **Deploy keys** → **Add deploy key** → الصق المفتاح واحفظ. بعدها على السيرفر:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519_sharf
```

(إن أردت استخدام المفتاح تلقائياً في كل جلسة، أضف السطر التالي إلى `~/.ssh/config`:

```
Host github.com
  IdentityFile ~/.ssh/id_ed25519_sharf
```

إن لم يكن لديك `~/.ssh/config` أنشئ الملف ثم أضف السطرين أعلاه.)

### ج) اختبار

```bash
ssh -T git@github.com
```

إن ظهرت رسالة مثل: `Hi user/repo! You've successfully authenticated...` فكل شيء مضبوط. بعدها `git fetch` و `git pull` يعملان **بدون يوزر أو باسوورد نهائياً**.

---

## 1) الدخول لمجلد المشروع

```bash
cd "/home/master/applications/cmkdrtgqcv/git_repo"
```

أو إن كان المسار تحت التطبيق:

```bash
cd "/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/git_repo"
```

## 2) حفظ .env مؤقتاً (إن وُجد)

```bash
cp .env .env.backup 2>/dev/null || true
```

## 3) جلب وإعادة تعيين إلى origin/main (حل التعارضات بالكامل)

```bash
git fetch --all
git reset --hard origin/main
```

## 4) استعادة .env

```bash
mv .env.backup .env 2>/dev/null || true
```

## 5) تثبيت الحزم (فقط إن تغيّر package.json)

```bash
npm install
```

## 6) نسخ واجهة الموقع (ملفات الإنتاج)

محتوى الواجهة الجاهز في **deploy_public_html**. انسخه إلى مكانين:

```bash
# أ) إلى المجلد الأب (إن كان جذر الموقع = public_html)
cp -r deploy_public_html/* ../

# ب) إلى جذر git_repo (مهم: إن كان جذر الموقع = git_repo، وإلا تظهر شاشة بيضاء)
cp -r deploy_public_html/* .
```

بهذا تعمل الصفحة سواء كان Document Root في Cloudways مضبوطاً على **public_html** أو على **git_repo**.

## 7) تشغيل تطبيق Node

```bash
PORT=5000 node dist/index.cjs
```

أو في الخلفية:

```bash
nohup env PORT=5000 node dist/index.cjs > ../app.log 2>&1 &
```

---

**ملاحظة:** ملفات الإنتاج (`dist/`, `server/public/`, `deploy_public_html/`) تُرفع مع المستودع، فلا حاجة لـ `npm run build` على السيرفر بعد كل سحب.
