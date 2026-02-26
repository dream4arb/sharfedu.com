import "./load-env";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS: السماح بطلبات من الموقع وجوجل (Cloudways) — قبل أي routes
const allowedOrigins = [
  "https://sharfedu.com",
  "https://www.sharfedu.com",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some((o) => origin === o || origin.startsWith("http://localhost:"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (req.path.startsWith("/api")) {
    res.setHeader("Access-Control-Allow-Origin", "https://sharfedu.com");
  }
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // المنفذ من .env (مطابق لبوابة .htaccess: localhost:5000)
  const port = parseInt(process.env.PORT || "5000", 10);
  // محلياً: استمع على كل الواجهات حتى يعمل http://localhost:5000 و http://127.0.0.1:5000
  const host = process.env.HOST || (process.env.NODE_ENV === "development" ? "0.0.0.0" : "127.0.0.1");
  httpServer.listen(
    port,
    host,
    () => {
      const url = host === "0.0.0.0" ? `http://localhost:${port}` : `http://${host}:${port}`;
      log(`serving on ${url}`);
      const hasGoogle = !!(process.env.GOOGLE_CLIENT_ID?.trim() && process.env.GOOGLE_CLIENT_SECRET?.trim());
      log(`Google OAuth: ${hasGoogle ? "enabled" : "disabled (set GOOGLE_CLIENT_ID/SECRET in .env)"}`);
      // في التطوير: فتح المتصفح تلقائياً ليعرض الموقع المحلي
      if (process.env.NODE_ENV === "development") {
        import("open").then(({ default: open }) => open(url).catch(() => {})).catch(() => {});
      }
    },
  ).on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      log(`Port ${port} is already in use. Please stop the other process or use a different port.`, "error");
      process.exit(1);
    } else {
      log(`Server error: ${err.message}`, "error");
      process.exit(1);
    }
  });
})().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
