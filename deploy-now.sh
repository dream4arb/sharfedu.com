#!/bin/bash
# نفّذ من داخل مجلد git_repo: bash deploy-now.sh
set -e
cd "$(dirname "$0")"

echo "[1/6] حفظ .env..."
[ -f .env ] && cp .env .env.backup || true

echo "[2/6] جلب التحديثات..."
git fetch --all
git reset --hard origin/main

echo "[3/6] استعادة .env..."
[ -f .env.backup ] && cp .env.backup .env || true

echo "[4/6] npm install..."
npm install

echo "[5/6] نسخ الواجهة (من مجلد web)..."
if [ -d web ] && [ -n "$(ls -A web 2>/dev/null)" ]; then
  cp -r web/* ../ 2>/dev/null || true
  cp -r web/* . 2>/dev/null || true
  echo "    تم من web/"
elif [ -d deploy_public_html ] && [ -n "$(ls -A deploy_public_html 2>/dev/null)" ]; then
  cp -r deploy_public_html/* ../ 2>/dev/null || true
  cp -r deploy_public_html/* . 2>/dev/null || true
elif [ -d server/public ] && [ -n "$(ls -A server/public 2>/dev/null)" ]; then
  cp -r server/public/* ../ 2>/dev/null || true
  cp -r server/public/* . 2>/dev/null || true
fi

echo "[6/6] إعادة تشغيل التطبيق..."
pkill -f "node dist/index.cjs" 2>/dev/null || true
sleep 1
nohup env PORT=5000 node dist/index.cjs > ../app.log 2>&1 &
echo "تم. تحقق من https://sharfedu.com"
