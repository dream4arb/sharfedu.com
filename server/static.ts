import express, { type Express } from "express";
import { existsSync } from "fs";
import path from "path";
import { pageWithOverrides, ORIGIN } from "./seo/model";
import { renderSeoHtml } from "./seo/routes";

function resolvePublicPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "server", "public"),
    path.resolve(path.dirname(process.argv[1] || ""), "server", "public"),
    path.resolve(path.dirname(process.argv[1] || ""), "..", "server", "public"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

const publicPath = resolvePublicPath();

export function serveStatic(app: Express) {
  if (!existsSync(publicPath)) {
    if (process.env.NODE_ENV === "production") {
      console.log(`[static] Public directory not found, tried: ${publicPath}`);
      return;
    }
    throw new Error(
      `Could not find the build directory: ${publicPath}, make sure to build the client first (npm run build)`,
    );
  }
  console.log(`[static] Serving static files from: ${publicPath}`);

  app.use(async (req, res, next) => {
    if (!["GET", "HEAD"].includes(req.method) || req.path.startsWith("/api")) return next();
    if (/^\/(node_app|prompt-files|tests)(\/|$)/.test(req.path)) return res.status(404).set("X-Robots-Tag", "noindex").send("Not Found");
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (path.extname(req.path)) return next();
    try {
      const page = await pageWithOverrides(req.originalUrl);
      const canonicalPath = page.canonical.slice(ORIGIN.length);
      if (page.status === 200 && req.path !== canonicalPath.split("?")[0]) {
        const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
        return res.redirect(301, canonicalPath + (canonicalPath.includes("?") ? "" : query));
      }
      res.status(page.status).type("html").set("Cache-Control", "no-store").set("X-Robots-Tag", page.robots)
        .send(await renderSeoHtml(path.resolve(publicPath, "index.html"), page));
    } catch (error) { next(error); }
  });

  app.use(
    express.static(publicPath, {
      index: false,
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
    if (req.path.startsWith("/api")) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ message: "Not Found" });
    }
    next();
  });

  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.status(404).set("X-Robots-Tag", "noindex").send("Not Found");
  });
}
