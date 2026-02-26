export interface TestQuestion {
  id: number;
  questionText: string;
  hasGeometricShape: boolean;
  shapeImageUrl?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

export interface TrueFalseQuestion {
  id: number;
  statement: string;
  correctAnswer: boolean;
}

export interface MathTestData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  semester: string;
  year: string;
  multipleChoice: TestQuestion[];
  trueFalse: TrueFalseQuestion[];
}

export const mathPeriodTest1446: MathTestData = {
  id: "math-period-1446",
  title: "اختبار الفترة - الفصل الدراسي الثاني 1446هـ",
  subject: "الرياضيات",
  grade: "أول ثانوي",
  semester: "الفصل الدراسي الثاني",
  year: "1446",
  multipleChoice: [
    {
      id: 1,
      questionText: "قياس كل زاوية في مثلث متطابق الأضلاع تساوي:",
      hasGeometricShape: true,
      shapeImageUrl: "/tests/shapes/q1-triangle.png",
      options: {
        a: "90°",
        b: "60°",
        c: "180°",
        d: "50°"
      },
      correctAnswer: "b"
    },
    {
      id: 2,
      questionText: "تصنيف المثلث الموضح في الشكل (الذي زواياه 34° و 49° و 97°) هو:",
      hasGeometricShape: true,
      shapeImageUrl: "/tests/shapes/q2-triangle.png",
      options: {
        a: "قائم الزاوية",
        b: "حاد الزوايا",
        c: "منفرج الزاوية",
        d: "متطابق الزوايا"
      },
      correctAnswer: "c"
    },
    {
      id: 3,
      questionText: "من الشكل المجاور، قيمة m∠1 تساوي:",
      hasGeometricShape: true,
      shapeImageUrl: "/tests/shapes/q3-angle.png",
      options: {
        a: "102°",
        b: "79°",
        c: "50°",
        d: "30°"
      },
      correctAnswer: "b"
    },
    {
      id: 4,
      questionText: "يصنف المثلث في الشكل المجاور بالنسبة لزواياه بأنه:",
      hasGeometricShape: true,
      shapeImageUrl: "/tests/shapes/q4-right-triangle.png",
      options: {
        a: "حاد الزوايا",
        b: "قائم الزاوية",
        c: "منفرج الزاوية",
        d: "متطابق الزوايا"
      },
      correctAnswer: "b"
    },
    {
      id: 5,
      questionText: "قياس الزاوية 1 في الشكل المقابل يساوي:",
      hasGeometricShape: true,
      shapeImageUrl: "/tests/shapes/q5-angles.png",
      options: {
        a: "73°",
        b: "80°",
        c: "60°",
        d: "30°"
      },
      correctAnswer: "b"
    }
  ],
  trueFalse: []
};

export const allMathTestsFinal: MathTestData[] = [mathPeriodTest1446];
