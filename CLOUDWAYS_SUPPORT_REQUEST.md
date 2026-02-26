# رسالة لدعم Cloudways — تفعيل Proxy لـ Node.js

انسخ النص المناسب (إنجليزي أو عربي) وأرسله لدعم Cloudways.

---

## النسخة الإنجليزية (للإرسال للدعم)

**Subject:** Enable mod_proxy for Apache to forward /api to Node.js on port 5000

**Message:**

Hello,

I have a hybrid setup on my application: the main site is static (HTML/JS) served by Apache from `public_html`, and the API runs as a Node.js app on **port 5000** (localhost).

I need **Apache to forward all requests under `/api`** to the Node.js backend at `http://127.0.0.1:5000`. I added the following to my `.htaccess` in `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  <IfModule mod_proxy.c>
    RewriteCond %{REQUEST_URI} ^/api
    RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]
  </IfModule>
  ...
</IfModule>
```

Currently, when users visit `https://mydomain.com/api/...`, Apache returns **404** instead of proxying to Node.js. I believe **mod_proxy** and **mod_proxy_http** need to be enabled for the `[P]` flag to work.

Could you please:
1. Enable **mod_proxy** and **mod_proxy_http** for my Apache (or confirm they are enabled), and  
2. Confirm that `.htaccess` proxy rules are allowed for my application?

**Application / Server:** [ضع هنا اسم تطبيقك أو رقم السيرفر إن ورد في لوحة التحكم]  
**Domain:** sharfedu.com  
**Node.js port:** 5000 (running via `node dist/index.cjs`)

Thank you.

---

## النسخة العربية (للمرجع فقط)

**الموضوع:** تفعيل mod_proxy في Apache لتوجيه طلبات /api إلى Node.js على المنفذ 5000

السلام عليكم،

أشغّل تطبيقاً هجيناً: الموقع الثابت يُخدم من Apache من مجلد public_html، وواجهة الـ API تعمل بتطبيق Node.js على **المنفذ 5000** (على نفس السيرفر).

أحتاج أن يقوم **Apache بتوجيه كل الطلبات التي تبدأ بـ /api** إلى تطبيق Node.js على العنوان `http://127.0.0.1:5000`. أضفت في ملف `.htaccess` داخل public_html القواعد التالية:

(نفس كود الـ RewriteRule أعلاه)

حالياً، عند زيارة `https://sharfedu.com/api/...` يرد Apache بخطأ **404** بدلاً من تمرير الطلب إلى Node.js. أعتقد أن تفعيل **mod_proxy** و **mod_proxy_http** ضروري حتى تعمل علامة [P] في القواعد.

هل يمكنكم:
1. تفعيل **mod_proxy** و **mod_proxy_http** لـ Apache (أو التأكيد أنهما مفعّلان)، و  
2. التأكيد أن قواعد الـ proxy في `.htaccess` مسموحة لتطبيقي؟

**التطبيق / السيرفر:** [اسم التطبيق أو رقم السيرفر]  
**النطاق:** sharfedu.com  
**منفذ Node.js:** 5000

شكراً لكم.
