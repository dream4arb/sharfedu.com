# مسارات المصادقة (Auth) والتحقق من السجلات

## 1. مسارات المصادقة المسجّلة في السيرفر

| الطريقة | المسار | الوصف |
|--------|--------|--------|
| POST | `/api/login` | تسجيل الدخول بالبريد وكلمة المرور |
| POST | `/api/register` | إنشاء حساب جديد |
| GET | `/api/auth/user` | جلب المستخدم الحالي (أو null إن لم يكن مسجلاً) |
| GET | `/api/auth/google` | بدء الدخول عبر جوجل (إعادة توجيه) |
| GET | `/api/auth/google/callback` | استقبال callback من جوجل بعد الموافقة |
| GET | `/api/logout` | تسجيل الخروج |
| PUT | `/api/user/profile` | تحديث المرحلة والصف (يتطلب تسجيل دخول) |

## 2. التحقق من عدم ظهور 404

- تأكد أن طلبات `/api/*` تصل إلى تطبيق Node وليس إلى صفحة ثابتة.
- إذا كنت تستخدم **Apache** مع `.htaccess`: يجب تفعيل `mod_proxy` و `mod_proxy_http` وتوجيه `/api` إلى `http://127.0.0.1:5000` (كما في الملف الحالي).
- إذا كنت تستخدم **api-proxy.php**: ضع في `.env` للبناء:
  - `VITE_API_BASE=/api-proxy.php`
  - ثم `npm run build` وأعد نشر الملفات. الواجهة تستخدم الآن `getApiUrl()` لجميع طلبات المصادقة.

يمكنك اختبار المسارات من السيرفر:

```bash
# اختبار أن السيرفر يستجيب لـ /api/auth/user (يتوقع 200 و null أو بيانات مستخدم)
curl -s -o /dev/null -w "%{http_code}" https://sharfedu.com/api/auth/user

# اختبار تسجيل الدخول (يتوقع 401 بدون بيانات صحيحة)
curl -s -X POST https://sharfedu.com/api/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"wrong"}' -w "\n%{http_code}\n"
```

إذا حصلت على **404** فالمسار لا يصل إلى Node؛ راجع إعدادات البروكسي (Apache/Nginx أو api-proxy).

## 3. ملفات السجلات (Logs) لفشل تسجيل الدخول

- لا يوجد في المشروع ملفات `.log` مخزنة على القرص؛ السجلات تذهب إلى **stdout/stderr** لتطبيق Node.
- إذا كنت تشغّل التطبيق بـ **PM2**:
  ```bash
  pm2 logs
  # أو لآخر 200 سطر:
  pm2 logs --lines 200
  ```
- عند فشل تسجيل الدخول (بريد/كلمة مرور) ستظهر رسائل مثل:
  - `[Auth] Login failed: البريد الإلكتروني أو كلمة المرور غير صحيحة. email: xxx***`
- عند حدوث خطأ تقني أثناء تسجيل الدخول:
  - `[Auth] Login error: ...`
  - `[Auth] req.logIn error: ...`

استخدم هذه الرسائل لمعرفة إن كان الفشل بسبب: بريد/كلمة مرور خاطئة، أو خطأ في قاعدة البيانات، أو خطأ في الجلسة (session).

## 4. إعدادات .env المهمة للإنتاج

- `GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback` (يجب أن يطابق تماماً رابط "Authorized redirect URIs" في Google Cloud Console).
- `SESSION_SECRET`: ضع سلسلة عشوائية طويلة في الإنتاج (مثلاً: `openssl rand -base64 32`). عدم تغييرها يضعف أمان الجلسات.
- خلف بروكسي (مثل Apache/Nginx): السيرفر يفعّل بالفعل `app.set("trust proxy", 1)` حتى تعمل الكوكيز والجلسات بشكل صحيح.

## 5. ملخص التعديلات التي تمت

1. **ملف `.env`**: تحديث `GOOGLE_CALLBACK_URL` إلى `https://sharfedu.com/api/auth/google/callback`.
2. **الواجهة (Frontend)**: استخدام `getApiUrl()` لجميع طلبات المصادقة (`/api/login`, `/api/register`, `/api/auth/user`, `/api/logout`, `/api/auth/google`, `/api/user/profile`) حتى تعمل مع أي قاعدة عنوان API (مثلاً مع api-proxy).
3. **السيرفر**: إضافة تسجيل (log) عند فشل تسجيل الدخول أو حدوث خطأ في `logIn` لتسهيل التشخيص من خلال `pm2 logs` أو طرفية التشغيل.
