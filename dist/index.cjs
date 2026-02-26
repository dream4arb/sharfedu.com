const path = require("path");
const express = require("express");
const fs = require("fs");
const http = require("http");

const publicPath = path.resolve(__dirname, "..", "server", "public");
const origCreateServer = http.createServer.bind(http);

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

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
          const response = await fetch(upstream);
          if (!response.ok) return res.status(response.status).end();
          const ct = response.headers.get("content-type");
          if (ct) res.setHeader("Content-Type", ct);
          res.setHeader("Cache-Control", "public, max-age=86400");
          const buffer = Buffer.from(await response.arrayBuffer());
          const dir = path.dirname(localPath);
          fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(localPath, buffer);
          res.send(buffer);
        } catch {
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
