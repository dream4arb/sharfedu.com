import q1Image from "@assets/image_1769372229767.png";

export interface ImageTestData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  semester: string;
  questionImages: string[];
  answers: Array<{
    questionNumber: number;
    correctAnswer: 'a' | 'b' | 'c' | 'd';
  }>;
}

export const mathImageTests: ImageTestData[] = [
  {
    id: "math-high1-s2-period-test",
    title: "اختبار الفترة - الفصل الدراسي الثاني",
    subject: "الرياضيات",
    grade: "أول ثانوي",
    semester: "الفصل الدراسي الثاني",
    questionImages: [
      q1Image,
    ],
    answers: [
      { questionNumber: 1, correctAnswer: 'c' },
    ]
  }
];
