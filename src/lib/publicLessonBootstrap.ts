import type { PublishedLesson } from "@shared/seo/publication";
import type { PublicStructureData } from "@/hooks/use-public-structure";

interface PublicLessonBootstrap { path: string; entry?: PublishedLesson; structure: PublicStructureData }
let bootstrap: PublicLessonBootstrap | null | undefined;
export function getPublicLessonBootstrap() {
  if (typeof document === "undefined") return null;
  if (bootstrap === undefined) {
    try { bootstrap = JSON.parse(document.getElementById("public-lesson-bootstrap")?.textContent ?? "null"); }
    catch { bootstrap = null; }
  }
  return bootstrap?.path === window.location.pathname ? bootstrap : null;
}
