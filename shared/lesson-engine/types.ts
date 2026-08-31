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
  questionIds?: string[];
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
  objectives: string[];
  skills: LessonSkillDefinition[];
  questions: LessonQuestionDefinition[];
  steps: LessonStepDefinition[];
  assessmentQuestionIds: string[];
  video?: {
    title: string;
    duration: string;
    url: string;
    teacherName: string;
  };
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
