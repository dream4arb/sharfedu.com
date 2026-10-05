import { polygonAnglesLesson } from "../lesson-engine/polygon-angles";
import { isUnitPreparation } from "../curriculum/unit-preparation";

// Publication is explicit: adding a name to the hierarchy does not publish content.
export const publishedLessonIds: readonly string[] = [polygonAnglesLesson.id];
export const publishedLessonLocations: Record<string, { stage: string; grade: string; subject: string }> = {
  [polygonAnglesLesson.id]: { stage: "high", grade: "1", subject: "math" },
};
export function hasPublishedContent(id: string, stage: string, grade: string, subject: string) {
  const location = publishedLessonLocations[id];
  return (publishedLessonIds.includes(id) && location?.stage === stage && location.grade === grade && location.subject === subject)
    || (stage === "high" && grade === "1" && subject === "math" && isUnitPreparation(id));
}

// Every newly published lesson needs reviewed reading text as well as its activities.
export function lessonReadingSections(id: string | undefined) {
  return id === polygonAnglesLesson.id ? polygonReadingSections : [];
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
