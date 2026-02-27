/**
 * CJS/ESM compatible __filename and __dirname.
 * عند التشغيل كـ CJS (dist/index.cjs): Node يوفّر __dirname/__filename تلقائياً.
 * عند التشغيل كـ ESM (تطوير): نستمد من import.meta.url أو process.argv[1].
 */
import path from "path";
import { fileURLToPath } from "url";

declare const __filename: string | undefined;
declare const __dirname: string | undefined;

export function getFilename(): string {
  if (typeof __filename === "string") return __filename;
  // في CJS المُجمَّع لا نعتمد على import.meta (يكون فارغاً) — نستخدم مسار التشغيل
  if (process.argv[1]) return path.resolve(process.argv[1]);
  try {
    const metaUrl = (import.meta as { url?: string })?.url;
    if (metaUrl) return fileURLToPath(metaUrl);
  } catch {
    // تجاهل إن لم يكن متوفراً (CJS)
  }
  return path.join(process.cwd(), "index.js");
}

export function getDirname(): string {
  if (typeof __dirname === "string") return __dirname;
  return path.dirname(getFilename());
}

export function getUploadsDir(): string {
  const dir = getDirname();
  const fromOneUp = path.resolve(dir, "..", "attached_assets", "uploads");
  const fromTwoUp = path.resolve(dir, "..", "..", "attached_assets", "uploads");
  try {
    const fs = require("fs");
    if (fs.existsSync(fromOneUp)) return fromOneUp;
    if (fs.existsSync(fromTwoUp)) return fromTwoUp;
  } catch {}
  if (dir.includes("node_app")) return fromOneUp;
  return fromTwoUp;
}
