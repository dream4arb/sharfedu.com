# حل مشكلة الخادم

## المشكلة
الخادم لا يعمل بسبب خطأ `spawn EPERM` مع esbuild.

## الحلول الممكنة

### الحل 1: تشغيل من Terminal جديد
1. افتح Terminal جديد (PowerShell أو CMD)
2. انتقل إلى مجلد المشروع:
   ```powershell
   cd "C:\Users\arb-1\Downloads\Smart-Learn-Hub\Smart-Learn-Hub"
   ```
3. شغّل الخادم:
   ```powershell
   npm run dev
   ```

### الحل 2: استخدام ملف start-server.bat
1. انقر نقراً مزدوجاً على ملف `start-server.bat`
2. سيتم تشغيل الخادم تلقائياً

### الحل 3: إعادة تثبيت الحزم
إذا استمرت المشكلة، جرب:
```powershell
# حذف node_modules وإعادة التثبيت
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### الحل 4: تشغيل كمسؤول
1. افتح PowerShell كمسؤول (Run as Administrator)
2. انتقل إلى مجلد المشروع
3. شغّل `npm run dev`

## التحقق من الخادم
بعد تشغيل الخادم، انتظر 10-15 ثانية ثم افتح:
**http://127.0.0.1:5000**

## ملاحظات
- تأكد من أن المنفذ 5000 غير مستخدم
- تأكد من وجود ملف `.env` في المجلد الرئيسي
- إذا استمرت المشكلة، قد تحتاج إلى تعطيل برنامج مكافحة الفيروسات مؤقتاً
