export interface TestQuestion {
  id: number;
  question: string;
  hasImage?: boolean;
  imageDescription?: string;
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

export interface MatchingItem {
  id: number;
  leftColumn: string;
  rightColumn: string;
  correctMatch: string;
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
  matching?: MatchingItem[];
}

// اختبار الفترة - الفصل الدراسي الثاني 1446هـ
export const mathTest1446: TestData = {
  id: "math-high1-s2-period-1446",
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
      hasImage: true,
      imageDescription: "مثلث بزوايا 97°, 49°, 34°",
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
      hasImage: true,
      imageDescription: "مثلث بزاويتين 50° و 60°",
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
      hasImage: true,
      imageDescription: "مثلث بزاويتين 65° و 70°",
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
      hasImage: true,
      imageDescription: "مثلث بثلاث زوايا حادة 60°, 60°, 60°",
      options: {
        a: "حاد الزوايا",
        b: "قائم الزاوية",
        c: "منفرج الزاوية",
        d: "متطابق الزوايا"
      },
      correctAnswer: "d"
    },
    {
      id: 6,
      question: "قياس الزاوية 1 في الشكل المقابل يساوي",
      hasImage: true,
      imageDescription: "مثلث بزاويتين 50° و 50° وزاوية خارجية 1",
      options: {
        a: "73°",
        b: "80°",
        c: "60°",
        d: "30°"
      },
      correctAnswer: "b"
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
      hasImage: true,
      imageDescription: "مثلث في المستوى الإحداثي مع نقاط (0,0) و (4b,0) و H",
      options: {
        a: "(2b,c)",
        b: "(0,0)",
        c: "(0,4b)",
        d: "(0,c)"
      },
      correctAnswer: "a"
    },
    {
      id: 9,
      question: "قيمة y في المثلث متطابق الضلعين",
      hasImage: true,
      imageDescription: "مثلث متطابق الضلعين بضلع y+2 وضلع 6",
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
      hasImage: true,
      imageDescription: "مثلث متطابق الضلعين بزاويتي قاعدة 75° و 75°",
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
      hasImage: true,
      imageDescription: "مثلثان متطابقان بثلاثة أضلاع",
      options: {
        a: "SSS",
        b: "AAS",
        c: "ASA",
        d: "SAS"
      },
      correctAnswer: "a"
    },
    {
      id: 12,
      question: "قيمة x في الشكل المجاور تساوي",
      hasImage: true,
      imageDescription: "مثلث متطابق الضلعين بضلع 2x وضلع 6",
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
      statement: "المثلث الذي يحوي زاوية أكبر من 90 هو مثلث حاد الزوايا",
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
  ],
  matching: [
    {
      id: 1,
      leftColumn: "AAS",
      rightColumn: "يتطابق مثلثان إذا طابقت زاويتان وضلع غير محصور بينهما في المثلث الأول نظائرها في المثلث الآخر",
      correctMatch: "أ"
    },
    {
      id: 2,
      leftColumn: "ASA", 
      rightColumn: "يتطابق مثلثان إذا طابقت زاويتان والضلع المحصور بينهما في المثلث الأول نظائرها في المثلث الآخر",
      correctMatch: "ب"
    },
    {
      id: 3,
      leftColumn: "SAS",
      rightColumn: "يتطابق المثلثان إذا طابق ضلعان والزاوية المحصورة بينهما في المثلث الأول نظائرها في المثلث الآخر",
      correctMatch: "ج"
    }
  ]
};

// اختبار شهري - أول ثانوي مسارات
export const mathTestMonthly: TestData = {
  id: "math-high1-monthly-1446",
  title: "اختبار شهري - أول ثانوي مسارات",
  subject: "الرياضيات",
  grade: "أول ثانوي مسارات",
  semester: "الفصل الدراسي الثاني",
  year: "1446",
  multipleChoice: [
    {
      id: 1,
      question: "يصنف المثلث في الشكل المقابل بالنسبة لزواياه بأنه",
      hasImage: true,
      imageDescription: "مثلث بزوايا محددة",
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
      question: "في الشكل المقابل m∠1 =",
      hasImage: true,
      imageDescription: "مثلث مع زاوية خارجية",
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
      hasImage: true,
      imageDescription: "مثلثان △STR و △JKL",
      options: {
        a: "△RTS ≅ △JKL",
        b: "△RTS ≅ △LKJ",
        c: "△STR ≅ △JKL",
        d: "△STR ≅ △LJK"
      },
      correctAnswer: "b"
    },
    {
      id: 4,
      question: "في الشكل المقابل m∠1 =",
      hasImage: true,
      imageDescription: "مثلث مع زاوية خارجية 1",
      options: {
        a: "67°",
        b: "59°",
        c: "58°",
        d: "32°"
      },
      correctAnswer: "a"
    },
    {
      id: 5,
      question: "لإثبات تطابق المثلثين الآتيين نستعمل مسلمة",
      hasImage: true,
      imageDescription: "مثلثان متطابقان",
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
      question: "إذا كان △ABC متطابق الأضلاع فإن m∠C =",
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
      question: "قياس كل زاوية داخلية في المثلث متطابق الزوايا تساوي",
      options: {
        a: "30°",
        b: "45°",
        c: "60°",
        d: "90°"
      },
      correctAnswer: "c"
    }
  ]
};

export const allMathTests: TestData[] = [mathTest1446, mathTestMonthly];
