import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, copyFile } from "fs/promises";
import { existsSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";

let mappedDrive: string | null = null;

function getBuildRoot() {
  const current = process.cwd();
  if (process.platform !== "win32" || !/[^\x00-\x7F]/.test(current)) return current;
  for (let code = "Z".charCodeAt(0); code >= "R".charCodeAt(0); code -= 1) {
    const drive = String.fromCharCode(code);
    const driveRoot = `${drive}:\\`;
    if (existsSync(driveRoot)) continue;
    try {
      execFileSync("subst.exe", [`${drive}:`, current], { stdio: "ignore" });
      process.chdir(driveRoot);
      mappedDrive = drive;
      return driveRoot;
    } catch {
      // Try the next unused drive letter.
    }
  }
  return current;
}

const projectRoot = process.cwd();

function cleanupBuildRoot() {
  if (!mappedDrive) return;
  try {
    process.chdir(process.env.SystemDrive ? `${process.env.SystemDrive}\\` : "C:\\");
    execFileSync("subst.exe", [`${mappedDrive}:`, "/d"], { stdio: "ignore" });
  } catch {
    // The mapping is temporary; Windows also clears it when the session ends.
  }
}

const allowlist = [
  "@google/generative-ai",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-session",
  "multer",
  "nodemailer",
  "passport",
  "passport-google-oauth20",
  "passport-local",
  "zod",
];

async function buildAll() {
  await rm(path.resolve(projectRoot, "dist"), { recursive: true, force: true });

  console.log("Building client...");
  await viteBuild({ configLoader: "runner" });

  console.log("Building server...");
  const root = getBuildRoot();
  const pkg = JSON.parse(await readFile(path.resolve(root, "package.json"), "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: [path.resolve(root, "server", "index.ts")],
    absWorkingDir: root,
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: path.resolve(root, "dist", "index.cjs"),
    define: {
      "process.env.NODE_ENV": '"production"',
      "import.meta.url": '""',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });

  const pdfWorkerSrc = path.resolve(root, "node_modules/pdfjs-dist/build/pdf.worker.min.mjs");
  const pdfWorkerDst = path.resolve(root, "server/public/pdf.worker.min.mjs");
  await copyFile(pdfWorkerSrc, pdfWorkerDst);

  console.log("Build complete. Output: dist/index.cjs + server/public/");
}

buildAll()
  .then(() => cleanupBuildRoot())
  .catch((err) => {
    cleanupBuildRoot();
    console.error(err);
    process.exit(1);
  });
