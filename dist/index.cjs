const path = require("path");
const express = require("express");
const fs = require("fs");
const http = require("http");
const https = require("https");

const publicPath = path.resolve(__dirname, "..", "server", "public");
const origCreateServer = http.createServer.bind(http);

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const follow = (u, redirects) => {
      if (redirects > 5) return reject(new Error("Too many redirects"));
      const mod = u.startsWith("https") ? https : http;
      mod.get(u, (resp) => {
        if (resp.statusCode >= 300 && resp.statusCode < 400 && resp.headers.location) {
          return follow(resp.headers.location, redirects + 1);
        }
        if (resp.statusCode !== 200) {
          resp.resume();
          return reject(new Error(`HTTP ${resp.statusCode}`));
        }
        const chunks = [];
        resp.on("data", (c) => chunks.push(c));
        resp.on("end", () => resolve({ buffer: Buffer.concat(chunks), contentType: resp.headers["content-type"] }));
        resp.on("error", reject);
      }).on("error", reject);
    };
    follow(url, 0);
  });
}

http.createServer = function (app) {
  if (app && typeof app === "function") {
    if (app.set) app.set("trust proxy", 1);
  }
  const server = origCreateServer.apply(this, arguments);

  if (app && typeof app === "function" && fs.existsSync(publicPath)) {
    setTimeout(() => {
      app.get("/attached_assets/:folder/:filename", async (req, res, next) => {
        const { folder, filename } = req.params;
        if (!SAFE_NAME.test(folder) || !SAFE_NAME.test(filename)) {
          return res.status(400).json({ error: "Invalid path" });
        }
        const localPath = path.join(publicPath, "attached_assets", folder, filename);
        if (fs.existsSync(localPath)) {
          return res.sendFile(localPath);
        }
        try {
          const upstream = `https://sharfedu.com/attached_assets/${encodeURIComponent(folder)}/${encodeURIComponent(filename)}`;
          const { buffer, contentType } = await downloadFile(upstream);
          if (contentType) res.setHeader("Content-Type", contentType);
          res.setHeader("Cache-Control", "public, max-age=86400");
          const dir = path.dirname(localPath);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(localPath, buffer);
          res.send(buffer);
        } catch (err) {
          console.error(`[proxy] Failed to fetch ${folder}/${filename}:`, err.message);
          next();
        }
      });

      app.use(
        express.static(publicPath, {
          index: "index.html",
          setHeaders: (res, filePath) => {
            const ext = path.extname(filePath).toLowerCase();
            if (ext === ".html")
              res.setHeader("Content-Type", "text/html; charset=utf-8");
            else if (ext === ".js" || ext === ".mjs")
              res.setHeader("Content-Type", "application/javascript; charset=utf-8");
            else if (ext === ".css")
              res.setHeader("Content-Type", "text/css; charset=utf-8");
          },
        }),
      );

      app.use((req, res, next) => {
        if (req.method !== "GET" || req.path.startsWith("/api")) return next();
        const indexFile = path.resolve(publicPath, "index.html");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.sendFile(indexFile);
      });
    }, 0);
  }

  return server;
};

require("./server-original.cjs");
