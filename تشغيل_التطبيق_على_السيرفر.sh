#!/bin/bash
# تشغيل تطبيق Node من public_html مع تفعيل الدخول عبر جوجل
# انسخ هذا الملف إلى السيرفر أو انسخ الأوامر إلى SSH.
# ضع قيم جوجل الحقيقية من ملف .env على جهازك (أو من Google Cloud Console).

cd /home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html

export NODE_ENV=production
export PORT=5000
export HOST=127.0.0.1
export SESSION_SECRET=sharfedu-secret-key-change-in-production-2026
export ADMIN_EMAIL=arb-33@hotmail.com
export DATABASE_URL=file:/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html/sqlite.db

# تفعيل الدخول عبر جوجل — استبدل القيم من .env أو Google Console
export GOOGLE_CLIENT_ID=ضع_Client_ID_من_جوجل
export GOOGLE_CLIENT_SECRET=ضع_Client_Secret_من_جوجل
export GOOGLE_CALLBACK_URL=https://sharfedu.com/api/auth/google/callback

pkill -f "node index.cjs" 2>/dev/null
nohup node index.cjs > app.log 2>&1 &
echo "تم التشغيل. تحقق: curl -s http://127.0.0.1:5000/api/auth/user"
