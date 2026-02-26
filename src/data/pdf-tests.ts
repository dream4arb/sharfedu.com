export interface PdfTestData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  semester: string;
  year: string;
  questionPages: string[];
  answerPages: string[];
}

export const pdfMathTests: PdfTestData[] = [
  {
    id: "math-high1-period-1446-pdf",
    title: "اختبار الفترة - الفصل الدراسي الثاني 1446هـ",
    subject: "الرياضيات",
    grade: "أول ثانوي",
    semester: "الفصل الدراسي الثاني",
    year: "1446",
    questionPages: [
      "/tests/math-test-01.png",
      "/tests/math-test-02.png",
      "/tests/math-test-03.png",
      "/tests/math-test-04.png"
    ],
    answerPages: [
      "/tests/math-test-05.png",
      "/tests/math-test-06.png",
      "/tests/math-test-07.png",
      "/tests/math-test-08.png"
    ]
  },
  {
    id: "math-high1-monthly-pdf",
    title: "اختبار شهري - أول ثانوي مسارات",
    subject: "الرياضيات",
    grade: "أول ثانوي مسارات",
    semester: "الفصل الدراسي الثاني",
    year: "1446",
    questionPages: [
      "/tests/math-test-09.png",
      "/tests/math-test-10.png"
    ],
    answerPages: [
      "/tests/math-test-11.png",
      "/tests/math-test-12.png"
    ]
  }
];
