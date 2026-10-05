import { polygonAnglesLesson } from "../lesson-engine/polygon-angles";
import { isUnitPreparation } from "../curriculum/unit-preparation";
import type { InteractiveLessonDefinition } from "../lesson-engine/types";

export interface PublishedLesson {
  lesson: InteractiveLessonDefinition;
  location: { stage: string; grade: string; subject: string };
  publishedAt?: string;
}
export type PublicationCatalog = Record<string, PublishedLesson>;
// Existing reviewed production content is the initial seed, not a whitelist for new lessons.
export const initialPublicationCatalog: PublicationCatalog = {
  [polygonAnglesLesson.id]: { lesson: polygonAnglesLesson, location: { stage: "high", grade: "1", subject: "math" } },
};

// Publication is explicit: adding a name to the hierarchy does not publish content.
export const publishedLessonIds: readonly string[] = [polygonAnglesLesson.id];
export const publishedLessonLocations: Record<string, { stage: string; grade: string; subject: string }> = {
  [polygonAnglesLesson.id]: { stage: "high", grade: "1", subject: "math" },
};
export function hasPublishedContent(id: string, stage: string, grade: string, subject: string, catalog = initialPublicationCatalog) {
  const location = catalog[id]?.location;
  return (Boolean(catalog[id]) && location?.stage === stage && location.grade === grade && location.subject === subject)
    || (stage === "high" && grade === "1" && subject === "math" && isUnitPreparation(id));
}

// Every newly published lesson needs reviewed reading text as well as its activities.
export function lessonReadingSections(id: string | undefined, catalog = initialPublicationCatalog) {
  const lesson = id ? catalog[id]?.lesson : undefined;
  if (!lesson) return [];
  if (lesson === polygonAnglesLesson) return polygonReadingSections;
  return [
    { heading: lesson.introduction.heading, paragraphs: lesson.introduction.paragraphs },
    { heading: "أهداف الدرس", paragraphs: lesson.objectives },
    ...lesson.steps.filter(s => ["concept", "worked_example", "practice", "warmup"].includes(s.type)).map(s => ({
      heading: s.title, paragraphs: [...(s.body ?? []), ...(s.activity?.items.map(item => `${item.prompt} — ${item.explanation}`) ?? [])],
    })),
    { heading: "ملخص الدرس", paragraphs: lesson.teacherSummary.points },
  ].filter(s => s.paragraphs.length);
}

// Unicode isolates keep formulas in mathematical order inside Arabic paragraphs.
const math = (value: string) => "\u2066" + value + "\u2069";
export const polygonReadingSections = [
  { heading: "كيف نحسب مجموع الزوايا الداخلية؟", paragraphs: [
    ...polygonAnglesLesson.introduction.paragraphs,
    "في المضلع المحدب الذي له n من الأضلاع، ينتج " + math("n − 2") + " من المثلثات عند رسم الأقطار من رأس واحد. لذلك مجموع الزوايا الداخلية " + math("S = (n − 2) × 180°") + ".",
  ] },
  { heading: "مثال: مجموع زوايا الخماسي", paragraphs: [
    "الخماسي له خمسة أضلاع، وينقسم إلى ثلاثة مثلثات. مجموع زواياه الداخلية يساوي " + math("(5 − 2) × 180° = 540°") + ".",
  ] },
  { heading: "الزاوية المجهولة والزوايا الخارجية", paragraphs: [
    "لإيجاد زاوية داخلية مجهولة، نحسب مجموع زوايا المضلع ثم نطرح منه مجموع الزوايا المعروفة. في المضلع المنتظم تكون الزوايا متساوية، فيساوي قياس كل زاوية داخلية مجموع الزوايا مقسومًا على عدد الأضلاع.",
    "مجموع زاوية خارجية واحدة عند كل رأس، مأخوذة في اتجاه واحد حول مضلع محدب، يساوي 360°. وقياس كل زاوية خارجية في المضلع المنتظم يساوي " + math("360° ÷ n") + ".",
  ] },
];
