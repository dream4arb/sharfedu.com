export type LessonQuestionType =
  | "multiple_choice"
  | "numeric"
  | "true_false"
  | "short_answer"
  | "ordering";

export interface LessonSkillDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
}

export interface LessonQuestionOption {
  id: string;
  label: string;
  visual?: {
    kind: "polygon";
    sides: number;
    split?: boolean;
  };
}

export interface LessonErrorPattern {
  answers: Array<string | number | boolean>;
  feedback: string;
}

export interface LessonQuestionDefinition {
  id: string;
  skillId: string;
  type: LessonQuestionType;
  prompt: string;
  helperText?: string;
  options?: LessonQuestionOption[];
  correctAnswer: string | number | boolean | string[];
  acceptedAnswers?: string[];
  tolerance?: number;
  unit?: string;
  hints: string[];
  correctFeedback: string;
  defaultIncorrectFeedback: string;
  errorPatterns?: LessonErrorPattern[];
}

export type LessonStepType =
  | "objectives"
  | "official_book"
  | "warmup"
  | "polygon_discovery"
  | "concept"
  | "worked_example"
  | "practice"
  | "video"
  | "teacher_summary"
  | "assessment"
  | "report";

export interface LessonStepDefinition {
  id: string;
  type: LessonStepType;
  title: string;
  eyebrow: string;
  tutorMessage?: string;
  body?: string[];
  formula?: string;
  formulaLabel?: string;
  questionIds?: string[];
  visualKind?:
    | "polygon-pattern"
    | "polygon-discovery"
    | "polygon-formula"
    | "polygon-missing-angle"
    | "polygon-exterior"
    | "real-number-sets"
    | "real-number-decimals"
    | "real-number-properties"
    | "rational-number-line"
    | "fraction-decimal-machine";
}

export interface TeacherSummaryDefinition {
  status: "teacher_reviewed" | "editorial";
  attribution: string;
  points: string[];
}

export interface TutorKnowledgeDefinition {
  approvedFacts: string[];
  socraticPrompts: string[];
  outOfScopeReply: string;
}

export interface CurriculumSourceDefinition {
  authority: string;
  portalUrl: string;
  bookTitle: string;
  requiredEdition: string;
  editionStatus: "verified" | "pending" | "rejected";
  observedEdition?: string;
  editionEvidence?: string;
  checkedAt?: string;
  verifiedAt?: string;
  lessonPages?: number[];
  lessonExcerpt?: {
    permissionStatus: "authorized";
    pdfUrl: string;
    officialPdfUrl: string;
    attribution: string;
    pages: Array<{
      pageNumber: number;
      imageUrl: string;
      alt: string;
    }>;
  };
}

export interface LessonIntroductionExample {
  label: string;
  sides: number;
  triangles: number;
  angleSum: number;
}

export interface LessonIntroductionDefinition {
  heading: string;
  paragraphs: string[];
  foundationSteps: Array<{
    title: string;
    description: string;
  }>;
  examples: LessonIntroductionExample[];
  takeawayLabel?: string;
  takeaway: string;
  formula: {
    expression: string;
    label: string;
    eyebrow?: string;
    heading?: string;
    parts: Array<{
      symbol: string;
      meaning: string;
    }>;
  };
  workedExample: {
    title: string;
    steps: string[];
    result: string;
  };
  commonMistake: {
    wrong: string;
    correction: string;
  };
}

export interface InteractiveLessonDefinition {
  id: string;
  version: number;
  slug: string;
  title: string;
  stage: string;
  grade: string;
  subject: string;
  unit: string;
  estimatedMinutes: number;
  introduction: LessonIntroductionDefinition;
  objectives: string[];
  skills: LessonSkillDefinition[];
  questions: LessonQuestionDefinition[];
  steps: LessonStepDefinition[];
  assessmentQuestionIds: string[];
  videos?: Array<{
    id: string;
    title: string;
    url: string;
    source?: "youtube" | "hosted";
    thumbnailUrl?: string;
    captionsUrl?: string;
    channelName?: string;
    duration?: string;
  }>;
  curriculumSource: CurriculumSourceDefinition;
  teacherSummary: TeacherSummaryDefinition;
  tutorKnowledge: TutorKnowledgeDefinition;
}

export interface LessonQuestionResult {
  correct: boolean;
  feedback: string;
  normalizedAnswer: string | number | boolean | string[];
}

export interface SkillMasterySnapshot {
  skillId: string;
  score: number;
  attempts: number;
  correctAttempts: number;
  hintsUsed: number;
}

export interface TutorVisualAction {
  type: "show_polygon";
  sides: number;
  split: boolean;
}

export interface TutorReply {
  message: string;
  followUpQuestion?: string;
  action?: TutorVisualAction;
}
