import { createClient } from "@libsql/client";
import path from "node:path";
import { CMS_HIERARCHY } from "../server/data/cms-hierarchy";
const response = await fetch("https://sharfedu.com/api/public/structure");
if (!response.ok) throw new Error("Public curriculum unavailable");
const { displayStructure } = await response.json();
const hierarchy = structuredClone(CMS_HIERARCHY);
for (const stage of hierarchy) for (const grade of stage.grades) for (const subject of grade.subjects) {
  const entry = displayStructure[`${stage.slug}_${grade.id}_${subject.slug}`];
  if (entry?.semesters) subject.semesters = entry.semesters;
}
const db = createClient({ url: `file:${path.resolve(".local/readiness-qa.db")}` });
await db.execute({ sql: "INSERT INTO platform_stats(key,value,updated_at) VALUES('academic_hierarchy',?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at", args: [JSON.stringify(hierarchy), Math.floor(Date.now() / 1000)] });
db.close();
console.log("QA-only curriculum refreshed from public structure. No production mutation.");
