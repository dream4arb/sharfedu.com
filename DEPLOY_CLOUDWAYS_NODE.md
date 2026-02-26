# لماذا لا يظهر موقع شارف على رابط Cloudways؟ + كيفية النشر الصحيح

## السبب المباشر

الرابط الذي تستخدمه:
```
https://phpstack-894422-6182755.cloudwaysapps.com/
```

هذا الرابط يشير إلى **تطبيق PHP Stack** على Cloudways. الصفحة التي تظهر ("Let's Get Started with Best PHP Cloud Hosting" و Laravel و Symfony...) هي **الصفحة الافتراضية** لهذا التطبيق.

**موقع منصة شارف مبني بتقنية Node.js (Express + React)** وليس PHP، لذلك لن يعمل أبداً داخل تطبيق "PHP Stack" بدون إعداد خاص.

---

## الخيارات المتاحة

### الخيار 1: تشغيل Node.js على نفس السيرفر (مُوصى به على Cloudways)

يجب تشغيل تطبيق Node.js على السيرفر ثم توجيه الدومين أو الرابط إليه.

#### الخطوات المختصرة:

1. **الدخول إلى لوحة Cloudways** وتفعيل **SSH** للسيرفر.
2. **تثبيت Node.js** على السيرفر (مثلاً عبر NVM أو من مصدر Cloudways إن وُجد).
3. **رفع مشروعك** (مثلاً عبر Git):
   ```bash
   git clone https://github.com/YOUR_USER/sharfedu.com.git
   cd sharfedu.com
   ```
4. **تثبيت الاعتماديات والبناء:**
   ```bash
   npm ci
   npm run build
   ```
5. **تشغيل التطبيق** باستخدام **PM2** (حتى يعمل في الخلفية ويعيد التشغيل تلقائياً):
   ```bash
   npm install -g pm2
   PORT=8080 pm2 start dist/index.cjs --name sharfedu
   pm2 save
   pm2 startup
   ```
6. **ضبط Nginx (أو Apache)** كـ Reverse Proxy لتوجيه الطلبات من المنفذ 80/443 إلى منفذ تطبيقك (مثلاً 8080).

مصادر من Cloudways:
- [How to Host a Node.js app on Cloudways](https://www.cloudways.com/blog/how-to-host-a-node-js-application/)
- [Deploy a Node.js App on Cloudways in 10 Minutes](https://article.arunangshudas.com/deploy-a-node-js-app-on-cloudways-in-10-minutes-a779cb8528b2)

---

### الخيار 2: استخدام منصة مبنية لـ Node.js (أسهل للنشر)

إذا كان الهدف هو تشغيل الموقع بأقل تعقيد، يمكن استخدام استضافة تدعم Node.js مباشرة، مثل:

| المنصة        | ملاحظة سريعة                    |
|---------------|-----------------------------------|
| **Railway**   | ربط Git ونشر تلقائي، دعم Node.js |
| **Render**    | مجاني للمشاريع الصغيرة، Node.js |
| **Vercel**    | ممتاز للـ Frontend + Serverless  |
| **DigitalOcean App Platform** | يدعم Node.js ونشر من Git |

في هذه الحالة ترفع المشروع من Git وتحدد أمر البناء (`npm run build`) وأمر التشغيل (`npm start`) وتترك المنصة تتولى الباقي.

---

## ملخص سريع

| ما يحدث الآن | ما المطلوب |
|-------------|-------------|
| الرابط يفتح تطبيق **PHP Stack** | تشغيل تطبيق **Node.js** (شارف) على السيرفر أو على منصة تدعم Node.js |
| الصفحة الافتراضية لـ Cloudways تظهر | نشر كود شارف وبناءه ثم تشغيل `node dist/index.cjs` (أو عبر PM2) |

---

## أوامر البناء والتشغيل (للمشروع الحالي)

على جهازك أو على السيرفر بعد رفع المشروع:

```bash
# تثبيت الاعتماديات
npm ci

# بناء الواجهة والسيرفر
npm run build

# تشغيل في الإنتاج (مع تحديد المنفذ إن لزم)
PORT=5000 node dist/index.cjs
```

أو مع PM2:
```bash
PORT=5000 pm2 start dist/index.cjs --name sharfedu
```

بعد تنفيذ الخطوات المناسبة لخيارك (Node على Cloudways أو منصة أخرى)، الرابط الذي تربطه بتطبيق Node.js سيعرض موقع شارف بدلاً من صفحة PHP الافتراضية.
