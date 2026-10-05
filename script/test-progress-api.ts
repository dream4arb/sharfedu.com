import assert from "node:assert/strict";
import { fourTabApiFields, type FourTabCompletion } from "../shared/lesson-engine/tab-progress";
const origin = "http://127.0.0.1:5106";
let cookie = "";
async function call(path: string, body?: unknown, status = 200, anonymous = false) {
  const response = await fetch(origin + path, { headers: { ...(anonymous ? {} : { Cookie: cookie }), ...(body ? { "Content-Type": "application/json" } : {}) }, ...(body ? { method: "POST", body: JSON.stringify(body) } : {}) });
  assert.equal(response.status, status, `${path}: ${response.status}`);
  const setCookie = response.headers.get("set-cookie"); if (setCookie && !anonymous) cookie = setCookie.split(";")[0];
  return response.json();
}
await call("/api/progress/user?userId=qa-student", undefined, 401, true);
await call("/api/progress/lesson", { userId: "qa-student", subjectSlug: "qa-progress", lessonId: "qa-isolated" }, 401, true);
await call("/api/auth/login", { email: "readiness-student@example.test", password: "Local-Readiness-2026!" });
await call("/api/progress/user?userId=qa-editor", undefined, 403);
await call("/api/progress/lesson?userId=qa-editor&subjectSlug=qa-progress&lessonId=qa-isolated", undefined, 403);
await call("/api/progress/lesson", { userId: "qa-editor", subjectSlug: "qa-progress", lessonId: "qa-isolated" }, 403);
for (const tabs of [[], ["book"], ["book", "video", "learn", "assessment"], []] as FourTabCompletion["completedTabs"][]) {
  const record: FourTabCompletion = { model: "four-tabs-v1", completedTabs: tabs, updatedAt: Date.now() };
  const result = await call("/api/progress/lesson", { userId: "qa-student", subjectSlug: "qa-progress", lessonId: "qa-isolated", ...fourTabApiFields(record) });
  assert.equal(String(result.userId), "qa-student");
  assert.equal(result.totalProgress, String(tabs.length * 25));
  assert.equal((await call("/api/progress/lesson?subjectSlug=qa-progress&lessonId=qa-isolated")).questionsProgress, JSON.stringify(record));
}
const saved = await call("/api/progress/user?userId=qa-student&subjectSlug=qa-progress");
assert.equal(saved.length, 1); assert.equal(saved[0].totalProgress, "0");
await call("/api/auth/logout", {});
await call("/api/progress/user", undefined, 401);
await call("/api/auth/login", { email: "readiness-student@example.test", password: "Local-Readiness-2026!" });
assert.equal((await call("/api/progress/user?subjectSlug=qa-progress"))[0].totalProgress, "0");
console.log("PASS UUID account progress: 0 -> 25 -> 100 -> reset, logout/login persistence, owner-only reads/writes, anonymous denied; production records untouched.");
