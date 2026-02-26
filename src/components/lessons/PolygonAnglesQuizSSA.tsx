import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, Trophy, AlertCircle } from 'lucide-react';

const PolygonAnglesQuizSSA = () => {
  const rawJson = {
    lessonId: "math-polygon-angles",
    title: "زوايا المضلع - الرياضيات",
    questions: [
      {
        id: 1,
        questionText: "ما هو مجموع قياسات الزوايا الداخلية للمضلع العشاري المحدب (الذي له 10 أضلاع)؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "1080 درجة", b: "1440 درجة", c: "1800 درجة", d: "1260 درجة" },
        correctAnswer: "b" as const,
        explanation: "باستعمال القانون S = (n-2) × 180°، وحيث أن n=10: فإن (10-2) × 180 = 8 × 180 = 1440°.",
      },
      {
        id: 2,
        questionText: "إذا كان قياس الزاوية الداخلية لمضلع منتظم يساوي 135 درجة، فما هو عدد أضلاعه؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "6 أضلاع", b: "7 أضلاع", c: "8 أضلاع", d: "10 أضلاع" },
        correctAnswer: "c" as const,
        explanation: "بناءً على المثال 3 في الملف: 135n = (n-2) × 180. بحل المعادلة: 135n = 180n - 360 ⇒ 45n = 360 ⇒ n = 8.",
      },
      {
        id: 3,
        questionText: "ما هو مجموع قياسات الزوايا الخارجية للمضلع السباعي المحدب (بأخذ زاوية واحدة عند كل رأس)؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "900 درجة", b: "540 درجة", c: "360 درجة", d: "180 درجة" },
        correctAnswer: "c" as const,
        explanation: "حسب النظرية 5.2، مجموع قياسات الزوايا الخارجية لأي مضلع محدب يساوي دائماً 360 درجة، بغض النظر عن عدد أضلاعه.",
      },
      {
        id: 4,
        questionText: "أوجد قياس الزاوية الداخلية الواحدة للسداسي المنتظم (مثل خلايا النحل).",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "120 درجة", b: "100 درجة", c: "140 درجة", d: "60 درجة" },
        correctAnswer: "a" as const,
        explanation: "مجموع زوايا السداسي هو (6-2) × 180 = 720°. وبما أنه منتظم، نقسم المجموع على عدد الزوايا: 720 ÷ 6 = 120°.",
      },
      {
        id: 5,
        questionText: "ما هو قياس الزاوية الخارجية للمضلع التساعي المنتظم؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "30 درجة", b: "40 درجة", c: "45 درجة", d: "50 درجة" },
        correctAnswer: "b" as const,
        explanation: "لقياس الزاوية الخارجية لمضلع منتظم، نقسم 360 على عدد الأضلاع n. هنا 360 ÷ 9 = 40°.",
      },
    ],
  };

  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelect = (qId: number, option: string) => {
    if (answers[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const calculateScore = () => {
    let score = 0;
    rawJson.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  const allAnswered = Object.keys(answers).length === rawJson.questions.length;
  const score = calculateScore();
  const percentage = (score / rawJson.questions.length) * 100;

  const getFeedback = () => {
    if (percentage === 100) return "ممتاز! لقد أتقنت نظريات زوايا المضلع تماماً.";
    if (percentage >= 70) return "جيد جداً! استمر في التدريب لتصل للدرجة الكاملة.";
    return "محاولة جيدة! راجع قوانين مجموع الزوايا الداخلية والخارجية في الملف.";
  };

  const handleRetry = () => setAnswers({});

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-['Tajawal'] text-right" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;900&display=swap');
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3); }
          50% { opacity: 1; transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }

        .animate-fadeIn { animation: fadeIn 0.4s ease-out forwards; }
        .animate-bounceIn { animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-10 text-center">
        <div className="bg-blue-600 rounded-3xl p-6 md:p-8 shadow-lg transform hover:scale-[1.01] transition-transform">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{rawJson.title}</h1>
          <p className="text-blue-100 text-base md:text-lg opacity-90">مراجعة تفاعلية لنظريات الزوايا الداخلية والخارجية</p>
        </div>
      </header>

      {/* Questions */}
      <main className="max-w-3xl mx-auto space-y-8 pb-10">
        {rawJson.questions.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border-t-4 border-blue-500 p-6 md:p-8 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <span className="bg-blue-50 text-blue-600 font-bold px-3 py-1.5 rounded-xl text-base">{q.id}</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-800 mb-6 leading-relaxed">{q.questionText}</h3>

                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(q.options).map(([key, text]) => {
                    const isSelected = answers[q.id] === key;
                    const isCorrect = key === q.correctAnswer;
                    const hasAnswered = !!answers[q.id];

                    let btnClass =
                      "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-right ";
                    if (!hasAnswered) {
                      btnClass += "border-slate-100 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                    } else {
                      if (isCorrect) {
                        btnClass += "border-green-500 bg-[#dcfce7] text-green-700 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass += "border-red-500 bg-[#fee2e2] text-red-700";
                      } else {
                        btnClass += "border-slate-50 bg-slate-50 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={key}
                        disabled={hasAnswered}
                        onClick={() => handleSelect(q.id, key)}
                        className={btnClass}
                      >
                        <span className="text-base md:text-lg">{text}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {hasAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                      </button>
                    );
                  })}
                </div>

                {answers[q.id] && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start animate-fadeIn">
                    <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-amber-800 font-bold mb-1 text-sm">توضيح الحل:</p>
                      <p className="text-amber-700 leading-relaxed text-sm md:text-base">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Final Score Card */}
        {allAnswered && (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border-4 border-blue-100 animate-bounceIn">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">النتيجة النهائية</h2>
            <div className="text-5xl font-black text-blue-600 my-6">
              {score} / {rawJson.questions.length}
            </div>
            <p className="text-lg text-slate-600 mb-6">{getFeedback()}</p>
            <button
              onClick={handleRetry}
              className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md"
            >
              إعادة الاختبار
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto text-center py-8 text-slate-500 border-t border-slate-200 mt-10">
        <p className="flex items-center justify-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4" />
          تم تطوير هذا المحتوى التعليمي بالـ ai ليكون مساعد تفاعلي ولا يغني عن الكتاب المدرسي
        </p>
      </footer>
    </div>
  );
};

export default PolygonAnglesQuizSSA;
