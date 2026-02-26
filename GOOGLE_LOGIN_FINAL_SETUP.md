# إعداد نهائي — تسجيل الدخول عبر Google (بدون api-proxy.php)

استخدم **مساراً واحداً** فقط: توجيه Apache لـ `/api` مباشرة إلى Node، وعدم استخدام `api-proxy.php` في callback جوجل.

---

## الرابط الدقيق لـ Google Cloud Console

في **Authorized redirect URIs** ضع **هذا الرابط فقط** (بدون api-proxy.php):

```
https://sharfedu.com/api/auth/google/callback
```

- بدون شرطة في النهاية
- بدون مسافات
- نفس الحروف (https و sharfedu.com)

---

## القيم في ملف `.env` على السيرفر

```env
# احذف أو علّق السطر التالي (لا تستخدم api-proxy في الـ callback)
# VITE_API_BASE=/api-proxy.php

# أو اجعلها فارغة حتى تستدعي الواجهة /api مباشرة:
VITE_API_BASE=

GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback
```

يجب أن يكون **GOOGLE_CALLBACK_URL** بهذا الشكل بالضبط (بدون api-proxy.php).

---

## محتوى ملف `.htaccess` على السيرفر

يجب توجيه طلبات `/api` إلى Node (المنفذ 5000). استبدل محتوى `.htaccess` **بالكامل** بما يلي:

```apache
RewriteEngine On
RewriteBase /

RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]

RewriteRule ^api-proxy\.php - [L]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [QSA,L]
```

**ملاحظة:** القاعدة `[P,L]` تحتاج تفعيل **mod_proxy** و **mod_proxy_http** على السيرفر (طلبنا من دعم Cloudways تفعيلهما سابقاً). إن ظهر خطأ **500** بعد تطبيق هذا الملف، راجع قسم "إذا ظهر 500" في الأسفل.

---

## ترتيب التنفيذ على السيرفر

1. **تعديل `.env`:**
   - `VITE_API_BASE=` (فارغ أو محذوف)
   - `GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback`

2. **استبدال `.htaccess`** بالمحتوى أعلاه.

3. **إعادة البناء:**  
   `npm run build`

4. **تشغيل Node:**  
   `node dist/index.cjs`

5. **في Google Cloud Console:**  
   التأكد من وجود **Authorized redirect URI** بالضبط:  
   `https://sharfedu.com/api/auth/google/callback`  
   وحذف أي رابط قديم يحتوي على `api-proxy.php` إن لم تعد تستخدمه.

---

## إذا ظهر خطأ 500 بعد تطبيق .htaccess

معناه أن توجيه البروكسي `[P]` غير مسموح أو غير مفعّل. في هذه الحالة:

- ارجع لاستخدام **api-proxy.php**:
  - `VITE_API_BASE=/api-proxy.php`
  - `GOOGLE_CALLBACK_URL=https://sharfedu.com/api-proxy.php/api/auth/google/callback`
  - في Google Console: `https://sharfedu.com/api-proxy.php/api/auth/google/callback`
  - واستخدم `.htaccess` **بدون** أي سطر يحتوي على `[P,L]` (كما في السكربت السابق).

---

## ملخص الرابط النهائي لـ Google Console

| الإعداد | الرابط في Authorized redirect URIs |
|--------|-------------------------------------|
| توجيه Apache مباشرة لـ /api (بدون PHP proxy) | `https://sharfedu.com/api/auth/google/callback` |
| استخدام api-proxy.php | `https://sharfedu.com/api-proxy.php/api/auth/google/callback` |

استخدم **واحداً فقط** من الرابطين حسب الإعداد الذي تعمل به، وتأكد أن نفس القيمة موجودة في `GOOGLE_CALLBACK_URL` في `.env`.
