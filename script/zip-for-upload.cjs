const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const root = path.resolve(__dirname, "..");
const forServer = path.join(root, "for_server");

if (!fs.existsSync(forServer)) {
  console.error("Run npm run build first (for_server not found).");
  process.exit(1);
}

const publicHtml = path.join(forServer, "public_html");
const nodeApp = path.join(forServer, "node_app");
const zip1 = path.join(root, "public_html_upload.zip");
const zip2 = path.join(root, "node_app_upload.zip");

function run(cmd) {
  try {
    execSync(cmd, { cwd: root, stdio: "inherit" });
  } catch (e) {
    process.exit(1);
  }
}

if (process.platform === "win32") {
  run(`powershell -Command "Compress-Archive -Path 'for_server\\public_html\\*' -DestinationPath 'public_html_upload.zip' -Force"`);
  run(`powershell -Command "Compress-Archive -Path 'for_server\\node_app\\*' -DestinationPath 'node_app_upload.zip' -Force"`);
} else {
  run(`cd for_server/public_html && zip -r ../../public_html_upload.zip .`);
  run(`cd for_server/node_app && zip -r ../../node_app_upload.zip .`);
}

console.log("Created public_html_upload.zip and node_app_upload.zip");
