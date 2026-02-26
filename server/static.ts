import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const publicPath = path.resolve(process.cwd(), "server", "public");

export function serveStatic(app: Express) {
  if (!fs.existsSync(publicPath)) {
    // في الإنتاج عندما Apache يخدم الواجهة (مثل Cloudways) قد لا يكون server/public موجوداً — نكتفي بـ /api
    if (process.env.NODE_ENV === "production") {
      return;
    }
    throw new Error(
      `Could not find the build directory: ${publicPath}, make sure to build the client first (npm run build)`,
    );
  }

  app.use(
    express.static(publicPath, {
      index: "index.html",
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (filePath.endsWith(".html") || ext === ".html") {
          res.setHeader("Content-Type", "text/html; charset=utf-8");
        } else if (ext === ".js" || ext === ".mjs") {
          res.setHeader("Content-Type", "application/javascript; charset=utf-8");
        } else if (ext === ".css") {
          res.setHeader("Content-Type", "text/css; charset=utf-8");
        }
      },
    }),
  );

  // أي طلب /api يصل إلى هنا = مسار غير معروف → 404 JSON (لا نرجع HTML أبداً لـ /api)
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "Not Found" });
    }
    next();
  });

  // SPA fallback: أي طلب GET غير /api يُرجَع له index.html (لتجنب 404 لـ /admin وغيرها)
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    const indexFile = path.resolve(publicPath, "index.html");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.sendFile(indexFile);
  });
}
