/**
 * تحميل .env قبل أي وحدة أخرى (يُستورد كأول سطر في index.ts).
 * يضمن قراءة GOOGLE_CLIENT_ID/SECRET وغيرها من .env على السيرفر حتى بعد كل بناء.
 */
import path from "path";
import dotenv from "dotenv";
import { getDirname } from "./resolve-dir";

const __dirname = getDirname();
const envSameDir = path.resolve(__dirname, ".env");
const envParent = path.resolve(__dirname, "..", ".env");
const envCwd = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envSameDir });
dotenv.config({ path: envParent });
dotenv.config({ path: envCwd });
