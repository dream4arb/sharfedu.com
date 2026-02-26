# إصلاح server/static.ts على السيرفر

نفّذ هذا الأمر في SSH لإصلاح static.ts:

```bash
cd /home/master/applications/cmkdrtgqcv/public_html
sed -i 's|import { fileURLToPath } from "url";|import { getDirname } from "./resolve-dir";|' server/static.ts
sed -i '/const __dirname = path.dirname(fileURLToPath(import.meta.url));/d' server/static.ts
sed -i 's|path.resolve(__dirname|path.resolve(getDirname()|g' server/static.ts
```

إذا كان static.ts يستخدم `publicPath` مع `__dirname`، استبدله بـ:
```bash
sed -i 's|const publicPath = path.resolve(__dirname|const publicPath = path.resolve(getDirname()|g' server/static.ts
```

ثم:
```bash
npm run build
npx pm2 restart sharfedu
curl http://127.0.0.1:5000/
```
