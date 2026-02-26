export interface TestQuestion {
  id: number;
  question: string;
  image?: string;
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

export interface MatchingQuestion {
  id: number;
  leftColumn: string[];
  rightColumn: string[];
  correctMatches: Record<number, string>;
}

export interface TestData {
  id: string;
  title: string;
  subject: string;
  grade: string;
  semester: string;
  year: string;
  multipleChoice: TestQuestion[];
  trueFalse?: TrueFalseQuestion[];
  matching?: MatchingQuestion[];
}

export const mathTestsHigh1S2: TestData[] = [
  {
    id: "math-high1-s2-test1",
    title: "اختبار الفترة - الفصل الدراسي الثاني",
    subject: "الرياضيات",
    grade: "أول ثانوي",
    semester: "الفصل الدراسي الثاني",
    year: "1446",
    multipleChoice: [
      {
        id: 1,
        question: "قياس كل زاوية في مثلث متطابق الأضلاع تساوي",
        options: {
          a: "30°",
          b: "45°",
          c: "90°",
          d: "60°"
        },
        correctAnswer: "d"
      },
      {
        id: 2,
        question: "تصنيف المثلث التالي",
        image: "q2-triangle-obtuse",
        options: {
          a: "متطابق الزوايا",
          b: "منفرج الزاوية",
          c: "حاد الزوايا",
          d: "قائم الزاوية"
        },
        correctAnswer: "b"
      },
      {
        id: 3,
        question: "من الشكل التالي m∠ يساوي",
        image: "triangle-angles",
        options: {
          a: "50°",
          b: "60°",
          c: "70°",
          d: "80°"
        },
        correctAnswer: "c"
      },
      {
        id: 4,
        question: "من الشكل المجاور m∠ يساوي",
        image: "triangle-measure",
        options: {
          a: "35°",
          b: "45°",
          c: "55°",
          d: "65°"
        },
        correctAnswer: "b"
      },
      {
        id: 5,
        question: "يصنف المثلث في الشكل المجاور بالنسبة لزواياه بأنه",
        image: "triangle-classify",
        options: {
          a: "حاد الزوايا",
          b: "قائم الزاوية",
          c: "منفرج الزاوية",
          d: "متطابق الزوايا"
        },
        correctAnswer: "a"
      },
      {
        id: 6,
        question: "قياس الزاوية 1 في الشكل المقابل يساوي",
        image: "exterior-angle",
        options: {
          a: "73°",
          b: "107°",
          c: "53°",
          d: "127°"
        },
        correctAnswer: "a"
      },
      {
        id: 7,
        question: "الزاويتان الحادتان في مثلث قائم الزاوية هي",
        options: {
          a: "متكاملتان",
          b: "متتامتان",
          c: "متخالفتان",
          d: "متقابلة بالرأس"
        },
        correctAnswer: "b"
      },
      {
        id: 8,
        question: "أوجدي إحداثي النقطة H",
        image: "coordinate-plane",
        options: {
          a: "(2b, c)",
          b: "(0, 0)",
          c: "(0, 4b)",
          d: "(0, c)"
        },
        correctAnswer: "d"
      },
      {
        id: 9,
        question: "قيمة y في المثلث متطابق الضلعين",
        image: "isosceles-triangle-y",
        options: {
          a: "2",
          b: "3",
          c: "4",
          d: "6"
        },
        correctAnswer: "c"
      },
      {
        id: 10,
        question: "في الشكل المجاور m∠P",
        image: "angle-p",
        options: {
          a: "45°",
          b: "30°",
          c: "60°",
          d: "20°"
        },
        correctAnswer: "b"
      },
      {
        id: 11,
        question: "من الشكل الآتي المثلثان متطابقان حسب مسلمة",
        image: "congruent-triangles",
        options: {
          a: "SSS",
          b: "AAS",
          c: "ASA",
          d: "SAS"
        },
        correctAnswer: "d"
      },
      {
        id: 12,
        question: "قيمة x في الشكل المجاور تساوي",
        image: "triangle-x-value",
        options: {
          a: "3",
          b: "2",
          c: "6",
          d: "4"
        },
        correctAnswer: "a"
      },
      {
        id: 13,
        question: "هو البرهان الذي يستعمل الأشكال في المستوى الإحداثي والجبر لإثبات صحة المفاهيم الهندسية",
        options: {
          a: "النتيجة",
          b: "البرهان التسلسلي",
          c: "البرهان المباشر",
          d: "البرهان الإحداثي"
        },
        correctAnswer: "d"
      }
    ],
    trueFalse: [
      {
        id: 1,
        statement: "المثلث الذي يحوي زاوية أكبر من 90° هو مثلث حاد الزوايا",
        correctAnswer: false
      },
      {
        id: 2,
        statement: "يكون المثلث متطابق الأضلاع إذا وفقط إذا كان متطابق الزوايا",
        correctAnswer: true
      },
      {
        id: 3,
        statement: "الزاويتان الحادتان في أي مثلث قائم الزاوية متتامتان",
        correctAnswer: true
      },
      {
        id: 4,
        statement: "إذا تطابقت زاويتان في مثلث فإن الضلعين المقابلين لهما غير متطابقان",
        correctAnswer: false
      },
      {
        id: 5,
        statement: "قياس الزاوية الخارجية لمثلث يساوي مجموع قياسي الزاويتين الداخليتين البعيدتين",
        correctAnswer: true
      },
      {
        id: 6,
        statement: "المثلث المختلف الأضلاع يوجد فيه ضلعان متطابقان",
        correctAnswer: false
      }
    ]
  },
  {
    id: "math-high1-s2-test2",
    title: "اختبار شهري - أول ثانوي مسارات",
    subject: "الرياضيات",
    grade: "أول ثانوي",
    semester: "الفصل الدراسي الثاني",
    year: "1446",
    multipleChoice: [
      {
        id: 1,
        question: "يصنف المثلث في الشكل المقابل بالنسبة لزواياه بأنه",
        image: "triangle-classification",
        options: {
          a: "حاد الزوايا",
          b: "قائم الزاوية",
          c: "منفرج الزاوية",
          d: "متطابق الزوايا"
        },
        correctAnswer: "c"
      },
      {
        id: 2,
        question: "في الشكل المقابل m∠1 = .....",
        image: "angle-measure-1",
        options: {
          a: "25°",
          b: "79°",
          c: "101°",
          d: "128°"
        },
        correctAnswer: "c"
      },
      {
        id: 3,
        question: "المثلثان في الشكل المقابل متطابقان، أي العبارات الآتية صحيحة",
        image: "congruent-triangles-str",
        options: {
          a: "ΔRTS ≅ ΔJKL",
          b: "ΔRTS ≅ ΔLKJ",
          c: "ΔSTR ≅ ΔJKL",
          d: "ΔSTR ≅ ΔLJK"
        },
        correctAnswer: "b"
      },
      {
        id: 4,
        question: "في الشكل المقابل m∠1 = .....",
        image: "angle-measure-2",
        options: {
          a: "67°",
          b: "59°",
          c: "58°",
          d: "32°"
        },
        correctAnswer: "b"
      },
      {
        id: 5,
        question: "لإثبات تطابق المثلثين الآتيين نستعمل مسلمة",
        image: "prove-congruence",
        options: {
          a: "SSS",
          b: "SAS",
          c: "AAS",
          d: "ASA"
        },
        correctAnswer: "b"
      },
      {
        id: 6,
        question: "مجموع قياسات زوايا المثلث يساوي",
        options: {
          a: "90°",
          b: "180°",
          c: "120°",
          d: "60°"
        },
        correctAnswer: "b"
      },
      {
        id: 7,
        question: "إذا كان ΔABC متطابق الأضلاع فإن m∠C = .....",
        options: {
          a: "180°",
          b: "90°",
          c: "60°",
          d: "30°"
        },
        correctAnswer: "c"
      },
      {
        id: 8,
        question: "قياس الزاوية الخارجية للمثلث المتطابق الأضلاع تساوي",
        options: {
          a: "360°",
          b: "180°",
          c: "120°",
          d: "100°"
        },
        correctAnswer: "c"
      },
      {
        id: 9,
        question: "في المثلث المتطابق الضلعين إذا كان قياس إحدى زاويتي القاعدة 77° فإن قياس زاوية الرأس تساوي",
        options: {
          a: "24°",
          b: "26°",
          c: "77°",
          d: "180°"
        },
        correctAnswer: "b"
      },
      {
        id: 10,
        question: "في المثلث القائم الزاوية تكون الزاويتان الحادتان",
        options: {
          a: "متكاملتان",
          b: "متتامتان",
          c: "متطابقتان",
          d: "متقابلتان"
        },
        correctAnswer: "b"
      }
    ]
  }
];

export const getTestsForSubject = (subjectId: string, semester: string): TestData[] => {
  if (subjectId === "math" && semester === "s2") {
    return mathTestsHigh1S2;
  }
  return [];
};
