/**
 * رفع public_html_upload.zip و node_app_upload.zip إلى السيرفر عبر SCP.
 * يشغّل من جذر المشروع: node script/upload-to-server.cjs
 * يمكن تغيير السيرفر عبر متغيرات البيئة: SERVER_USER, SERVER_HOST, SERVER_PUBLIC_PATH, SERVER_NODE_PATH
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const user = process.env.SERVER_USER || "master_nyrmduupwf";
const host = process.env.SERVER_HOST || "165.227.236.121";
const publicPath = process.env.SERVER_PUBLIC_PATH || "/home/894422.cloudwaysapps.com/cmkdrtgqcv/public_html";
const nodePath = process.env.SERVER_NODE_PATH || "/home/894422.cloudwaysapps.com/cmkdrtgqcv";

const zip1 = path.join(root, "public_html_upload.zip");
const zip2 = path.join(root, "node_app_upload.zip");

if (!fs.existsSync(zip1)) {
  console.error("لم يُعثر على public_html_upload.zip. نفّذ أولاً: npm run build:upload");
  process.exit(1);
}

const target1 = `${user}@${host}:${publicPath}/`;
const target2 = `${user}@${host}:${nodePath}/`;

console.log("رفع public_html_upload.zip إلى جذر الموقع...");
console.log("الهدف:", target1);
console.log("سيُطلب منك كلمة مرور SSH.\n");
execSync(`scp "${zip1}" "${target1}"`, { stdio: "inherit", cwd: root });

if (fs.existsSync(zip2)) {
  console.log("\nرفع node_app_upload.zip...");
  console.log("الهدف:", target2);
  execSync(`scp "${zip2}" "${target2}"`, { stdio: "inherit", cwd: root });
}

console.log("\nتم الرفع. على السيرفر نفّذ:");
console.log("  cd", publicPath);
console.log("  unzip -o public_html_upload.zip");
if (fs.existsSync(zip2)) {
  console.log("  cd", nodePath);
  console.log("  unzip -o node_app_upload.zip");
}
