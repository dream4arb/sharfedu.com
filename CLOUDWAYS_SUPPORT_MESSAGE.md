# رسالة لدعم Cloudways — تفعيل Proxy لـ /api

انسخ القسم المناسب (إنجليزي أو عربي) وأرسله للدعم.

---

## English (للإرسال للدعم)

**Subject:** Enable Apache mod_proxy for Node.js API on port 5000

**Message:**

Hello,

I have a hybrid setup on my application: the main site is static (HTML/JS) served by Apache, and the API runs as a Node.js app on **port 5000** (127.0.0.1:5000).

I need requests to **/api** (and any path under /api) to be **proxied** from Apache to the Node.js backend. For that I'm using these rules in `.htaccess`:

```apache
<IfModule mod_proxy.c>
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]
</IfModule>
```

Currently, when users visit **https://sharfedu.com/api/...** they get **404 Not Found** from Apache, which suggests that either:

1. **mod_proxy** and **mod_proxy_http** are not enabled for my Apache/server, or  
2. The proxy flag **[P]** is not allowed in my environment.

Could you please:

1. **Enable mod_proxy and mod_proxy_http** for my application/server so that the above proxy rule works, **or**  
2. Tell me the correct way on Cloudways to proxy requests from a path (e.g. `/api`) to a local Node.js app listening on 127.0.0.1:5000.

My application details:
- **Server/App:** [ضع اسم السيرفر أو التطبيق من لوحة Cloudways]
- **Domain:** sharfedu.com
- **Node.js app:** runs manually / via SSH on port 5000 (127.0.0.1:5000)

Thank you.

---

## العربية (للمرجع فقط)

**الموضوع:** تفعيل Apache mod_proxy لتوجيه طلبات /api إلى Node.js على المنفذ 5000

**النص:**

السلام عليكم،

أشغّل تطبيقاً هجيناً: الموقع الثابت (HTML/JS) يُخدم عبر Apache، وواجهة الـ API تعمل بتطبيق Node.js على **المنفذ 5000** (127.0.0.1:5000).

أحتاج أن تُوجّه طلبات المسار **/api** (وكل ما تحته) من Apache إلى تطبيق Node.js (بروكسي). أستخدم حالياً قواعد في `.htaccess` تحتوي على:

```apache
<IfModule mod_proxy.c>
  RewriteCond %{REQUEST_URI} ^/api
  RewriteRule ^api(.*)$ http://127.0.0.1:5000/api$1 [P,L]
</IfModule>
```

حالياً عند زيارة **https://sharfedu.com/api/...** يظهر للمستخدم **404 Not Found** من Apache، ما يجعلني أرجّح أن **mod_proxy** و **mod_proxy_http** غير مفعّلين أو أن استخدام العلم **[P]** (بروكسي) غير مسموح في بيئتي.

المطلوب:
1. **تفعيل mod_proxy و mod_proxy_http** لتطبيقي/سيرفري حتى تعمل قاعدة البروكسي أعلاه، **أو**
2. إرشادي إلى الطريقة الصحيحة على Cloudways لتوجيه مسار (مثل `/api`) إلى تطبيق Node.js يعمل محلياً على 127.0.0.1:5000.

بيانات التطبيق:
- **السيرفر/التطبيق:** [اسم السيرفر أو التطبيق من لوحة Cloudways]
- **الدومين:** sharfedu.com
- **تطبيق Node.js:** يعمل يدوياً/عبر SSH على المنفذ 5000

شكراً لكم.
