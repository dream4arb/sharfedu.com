/**
 * إعداد PM2 للسيرفر — استخدمه داخل مجلد node_app على السيرفر.
 * يقرأ .env من نفس المجلد (node_app) ويبقي التطبيق يعمل بعد إغلاق SSH.
 *
 * على السيرفر:
 *   cd ~/applications/cmkdrtgqcv/public_html/node_app
 *   pm2 start ecosystem.server.cjs
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: "sharfedu",
      script: "index.cjs",
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
    },
  ],
};
