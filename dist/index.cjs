const path = require("path");
const express = require("express");
const fs = require("fs");
const http = require("http");

const publicPath = path.resolve(__dirname, "..", "server", "public");
const origCreateServer = http.createServer.bind(http);

http.createServer = function (app) {
  if (app && typeof app === "function") {
    if (app.set) app.set("trust proxy", 1);

    app.use((req, res, next) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.setHeader("X-Frame-Options", "SAMEORIGIN");
      res.setHeader("X-XSS-Protection", "1; mode=block");
      res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
      next();
    });
  }
  const server = origCreateServer.apply(this, arguments);

  if (app && typeof app === "function" && fs.existsSync(publicPath)) {
    setTimeout(() => {
      app.use(
        express.static(publicPath, {
          index: "index.html",
          maxAge: "1y",
          immutable: true,
          setHeaders: (res, filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            if (ext === ".html") {
              res.setHeader("Content-Type", "text/html; charset=utf-8");
              res.setHeader("Cache-Control", "no-cache");
            } else if (ext === ".js" || ext === ".mjs") {
              res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            } else if (ext === ".css") {
              res.setHeader("Content-Type", "text/css; charset=utf-8");
            }
          },
        }),
      );

      app.use((req, res, next) => {
        if (req.method !== "GET" || req.path.startsWith("/api")) return next();
        const indexFile = path.resolve(publicPath, "index.html");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Cache-Control", "no-cache");
        res.sendFile(indexFile);
      });
    }, 0);
  }

  return server;
};

require("./server-original.cjs");
