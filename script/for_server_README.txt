هيكل الرفع إلى السيرفر
========================

public_html/  → ضع محتواه في جذر الدومين (المجلد الذي يخدمه الموقع، مثلاً public_html على Cloudways).
                فيه: index.html، assets/، .htaccess، favicon.png، إلخ.

node_app/     → مجلد منفصل لتطبيق Node (مثلاً بجانب public_html أو تحته).
                فيه: index.cjs، package.json، package-lock.json.
                على السيرفر: أنشئ .env داخل node_app، ثم npm install، ثم شغّل: PORT=5000 node index.cjs

الـ .htaccess في public_html يوجّه طلبات /api إلى Node على المنفذ 5000.
