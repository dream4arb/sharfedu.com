# حل مشكلة EPERM مع esbuild

## المشكلة
الخادم لا يعمل بسبب خطأ `spawn EPERM` مع esbuild. هذا عادة يحدث بسبب:
- صلاحيات Windows
- ملفات esbuild تالفة أو محظورة
- برنامج مكافحة الفيروسات يمنع esbuild

## الحلول

### الحل 1: استخدام ملف fix-esbuild.bat
1. انقر نقراً مزدوجاً على ملف `fix-esbuild.bat`
2. سيتم حذف المجلدات المؤقتة وإعادة تثبيت esbuild تلقائياً

### الحل 2: تنفيذ الأوامر يدوياً

افتح PowerShell أو CMD في مجلد المشروع واكتب:

```powershell
# 1. إيقاف جميع عمليات Node.js
taskkill /F /IM node.exe

# 2. حذف مجلدات الكاش
if (Test-Path ".vite") { Remove-Item -Recurse -Force ".vite" }
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }
if (Test-Path "node_modules\esbuild") { Remove-Item -Recurse -Force "node_modules\esbuild" }

# 3. إعادة تثبيت esbuild
npm install esbuild --save-exact --force

# 4. تشغيل الخادم
npm run dev
```

### الحل 3: إعادة تثبيت جميع الحزم

إذا استمرت المشكلة:

```powershell
# حذف node_modules بالكامل
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# إعادة التثبيت
npm install

# تشغيل الخادم
npm run dev
```

### الحل 4: تشغيل كمسؤول

1. افتح PowerShell كمسؤول (Run as Administrator)
2. انتقل إلى مجلد المشروع:
   ```powershell
   cd "C:\Users\arb-1\Downloads\Smart-Learn-Hub\Smart-Learn-Hub"
   ```
3. شغّل الأوامر من الحل 2

### الحل 5: تعطيل برنامج مكافحة الفيروسات مؤقتاً

إذا استمرت المشكلة، قد يكون برنامج مكافحة الفيروسات يمنع esbuild:
1. أضف مجلد المشروع إلى قائمة الاستثناءات
2. أو عطّل برنامج مكافحة الفيروسات مؤقتاً أثناء التطوير

## التحقق من vite.config.ts

ملف `vite.config.ts` لا يحتوي على إعدادات منفذ محددة، مما يعني:
- Vite يستخدم المنفذ الافتراضي (عادة 5173)
- الخادم الرئيسي يعمل على المنفذ 5000 (كما هو محدد في server/index.ts)

هذا صحيح ولا يحتاج تعديل.

## بعد الحل

بعد تنفيذ الحلول:
1. انتظر 10-15 ثانية بعد تشغيل `npm run dev`
2. افتح المتصفح وانتقل إلى: **http://127.0.0.1:5000**
3. إذا استمرت المشكلة، راجع ملف `FIX_SERVER.md` للمزيد من الحلول
