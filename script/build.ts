import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, cp, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-google-oauth20",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  // المخرجات النهائية في server/public (للنشر: انسخ محتوى server/public إلى public_html على السيرفر).
  // لا نستبدل index.html في الجذر حتى يبقى للتطوير (npm run dev) يشير إلى /src/main.tsx.
  const publicDir = path.join(root, "server", "public");
  for (const file of ["favicon.png", "hero-main.png"]) {
    try {
      await cp(path.join(publicDir, file), path.join(root, file), { force: true });
    } catch (_) {}
  }
  for (const file of [".htaccess", "api-proxy.php"]) {
    try {
      await cp(path.join(publicDir, file), path.join(root, file), { force: true });
    } catch (_) {}
  }
  const deployDir = path.join(root, "deploy_public_html");
  await rm(deployDir, { recursive: true, force: true });
  await cp(publicDir, deployDir, { recursive: true });
  const webDir = path.join(root, "web");
  await rm(webDir, { recursive: true, force: true });
  await cp(publicDir, webDir, { recursive: true });
  const webhookPhp = path.join(__dirname, "deploy-webhook.php");
  for (const dir of [publicDir, deployDir, webDir]) {
    try {
      await cp(webhookPhp, path.join(dir, "deploy-webhook.php"), { force: true });
    } catch (_) {}
  }
  const buildId = `build: ${new Date().toISOString()}\n`;
  for (const dir of [publicDir, deployDir, webDir]) {
    try {
      await writeFile(path.join(dir, "build-id.txt"), buildId, "utf-8");
    } catch (_) {}
  }

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.url": '""',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  // مجلد واحد للرفع: for_server — فيه مكانان واضحان
  const forServer = path.join(root, "for_server");
  await rm(forServer, { recursive: true, force: true });
  const publicHtmlDir = path.join(forServer, "public_html");
  const nodeAppDir = path.join(forServer, "node_app");
  await cp(publicDir, publicHtmlDir, { recursive: true });
  await cp(path.join(root, "dist", "index.cjs"), path.join(nodeAppDir, "index.cjs"));
  await cp(path.join(root, "package.json"), path.join(nodeAppDir, "package.json"));
  await cp(path.join(root, "package-lock.json"), path.join(nodeAppDir, "package-lock.json"));
  try {
    await cp(path.join(root, "sqlite.db"), path.join(nodeAppDir, "sqlite.db"));
  } catch (_) {}
  try {
    await cp(path.join(__dirname, "for_server_README.txt"), path.join(forServer, "README.txt"));
  } catch (_) {}
  console.log("built; for_server/public_html + for_server/node_app ready to upload.");
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
