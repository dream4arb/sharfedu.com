/**
 * PM2 ecosystem config - يضمن تحميل GOOGLE_CALLBACK_URL بشكل صحيح
 * تشغيل: npx pm2 start ecosystem.config.cjs
 */
module.exports = {
  apps: [
    {
      name: "sharfedu",
      script: "dist/index.cjs",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "5000",
        GOOGLE_CALLBACK_URL: "https://sharfedu.com/api/auth/google/callback",
      },
    },
  ],
};
