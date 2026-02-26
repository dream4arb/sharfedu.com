# تطبيق تعديل الـ API يدوياً على السيرفر (عند فشل git pull)

إذا ظلّ السيرفر على commit قديم (dfbb560f) ولم يجلب c56ddfb، يمكن تطبيق التعديلات يدوياً.

## 1) إنشاء/تعديل ملف `.htaccess` في جذر الموقع

على السيرفر، المسار: **`/home/master/applications/cmkdrtgqcv/public_html/.htaccess`**

أنشئ الملف أو استبدل محتواه بالكامل بما يلي:

```apache
# منصة شارف - توجيه /api إلى Node.js + SPA routing
# يوجّه كل مسار غير موجود إلى index.html ليعمل التوجيه من جانب العميل (wouter)

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # توجيه طلبات /api إلى Node.js على المنفذ 5000 (يتطلب mod_proxy)
  <IfModule mod_proxy.c>
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]
  </IfModule>

  # لا نعيد كتابة الملفات والمجلدات الموجودة
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # توجيه الباقي إلى index.html
  RewriteRule ^ index.html [QSA,L]
</IfModule>

# أنواع MIME للملفات الثابتة
<IfModule mod_mime.c>
  AddType application/javascript .js .mjs
  AddType text/css .css
  AddType text/html .html
</IfModule>

# ضغط النصوص والموارد إن وُجد mod_deflate
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css application/javascript application/json
</IfModule>

# كاش للمتصفح للملفات الثابتة
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/png "access plus 1 month"
  ExpiresByType image/jpeg "access plus 1 month"
  ExpiresByType image/webp "access plus 1 month"
  ExpiresByType text/css "access plus 1 week"
  ExpiresByType application/javascript "access plus 1 week"
</IfModule>
```

**طريقة التعديل عبر SSH:**
```bash
cd /home/master/applications/cmkdrtgqcv/public_html
nano .htaccess
```
الصق المحتوى أعلاه، احفظ (Ctrl+O ثم Enter) واخرج (Ctrl+X).

## 2) التأكد من وجود api-proxy.php في الجذر (احتياطي)

إذا كان البروكسي عبر Apache (mod_proxy) لا يعمل، ستحتاج لاحقاً لاستخدام البروكسي PHP. تأكد من وجود الملف:
`public_html/api-proxy.php`
إن وُجد في المشروع تحت `public/api-proxy.php` انسخه إلى الجذر:
```bash
cp public/api-proxy.php ./
```

## 3) إعادة تشغيل Node (إن كان يعمل)

بعد تعديل .htaccess لا حاجة لإعادة البناء؛ فقط تأكد أن السيرفر يعمل:
```bash
node dist/index.cjs
```

## 4) اختبار الموقع

افتح https://sharfedu.com وجرّب تسجيل الدخول (بالبريد أو جوجل).

إذا استمر ظهور 404 لـ /api، قد يكون mod_proxy غير مفعّل على الاستضافة — راجع دعم Cloudways أو استخدم البروكسي PHP (VITE_API_BASE=/api-proxy.php ثم إعادة البناء).
