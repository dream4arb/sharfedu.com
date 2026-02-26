import React, { useState } from 'react';
import { CheckCircle2, XCircle, Info, Trophy, AlertCircle } from 'lucide-react';

const RatioQuizSSA = () => {
  const rawJson = {
    lessonId: "math-1m-ratio",
    title: "النسبة - الصف الأول المتوسط",
    questions: [
      {
        id: 1,
        questionText: "باستعمال وصفة توابل المشوي (٤ ملاعق مسحوق ليمون، ٦ ملاعق كزبرة، ٢ ملعقة فلفل)، ما هي نسبة الفلفل إلى مسحوق الليمون المجفف في أبسط صورة؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "١ : ٢", b: "٢ : ١", c: "٣ : ٢", d: "٢ : ٣" },
        correctAnswer: "a" as const,
        explanation: "نسبة الفلفل إلى الليمون هي ٢ إلى ٤. بالتبسيط (قسمة الطرفين على ٢) نحصل على ١ : ٢.",
      },
      {
        id: 2,
        questionText: "في مدرسة الملك فهد، يوجد ٣٩٦ طالباً و ٢٢ معلماً. ما هي نسبة الطلاب إلى المعلمين على صورة كسر مقامه ١؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "١٥ إلى ١", b: "١٨ إلى ١", c: "٢٠ إلى ١", d: "٢٢ إلى ١" },
        correctAnswer: "b" as const,
        explanation: "نقسم عدد الطلاب على عدد المعلمين: ٣٩٦ ÷ ٢٢ = ١٨. إذاً النسبة هي ١٨ طالباً لكل معلم واحد.",
      },
      {
        id: 3,
        questionText: "هل النسبة ٢٥٠ كلم في ٤ ساعات تكافئ النسبة ٥٠٠ كلم في ٨ ساعات؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: {
          a: "نعم، النسبتان متكافئتان",
          b: "لا، النسبتان غير متكافئتين",
          c: "لا يمكن التحديد",
          d: "متكافئتان فقط إذا زاد الوقت",
        },
        correctAnswer: "a" as const,
        explanation: "بالتبسيط: ٢٥٠/٤ = ٦٢.٥، و ٥٠٠/٨ = ٦٢.٥. بما أن ناتجي التبسيط متساويان، فالنسبتان متكافئتان.",
      },
      {
        id: 4,
        questionText: "أخطأ سامي في ٣٢ رمية من أصل ٩٣ محاولة، بينما أخطأ أحمد في ١١ رمية من أصل ٣١ محاولة. هل نسبتا الخطأ لديهما متكافئتان؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: { a: "نعم، متكافئتان", b: "لا، غير متكافئتين", c: "متكافئتان بالتقريب", d: "لا توجد معلومات كافية" },
        correctAnswer: "b" as const,
        explanation: "نسبة أحمد ١١/٣١ إذا ضربنا البسط والمقام في ٣ تصبح ٣٣/٩٣. وبما أن ٣٢/٩٣ لا تساوي ٣٣/٩٣، فالنسب غير متكافئة.",
      },
      {
        id: 5,
        questionText: "يبيع متجر كل علبتين من العصير بمبلغ ١٤ ريالاً. إذا اشترى خالد ٦ علب بمبلغ ٥٦ ريالاً، فهل السعر الذي دفعه خالد يكافئ السعر الأصلي؟",
        hasGeometricShape: false,
        shapeDescription: null,
        shapeAngles: [] as string[],
        options: {
          a: "نعم، متكافئ",
          b: "السعر أقل من المفترض",
          c: "لا، غير متكافئ (دفع أكثر)",
          d: "لا، غير متكافئ (دفع أقل)",
        },
        correctAnswer: "c" as const,
        explanation: "السعر الأصلي هو ١٤ ÷ ٢ = ٧ ريالات للعلبة. خالد اشترى ٦ علب، المفترض يدفع ٦ × ٧ = ٤٢ ريالاً، لكنه دفع ٥٦ ريالاً.",
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
    if (percentage === 100) return "ممتاز! لقد أتقنت درس النسبة تماماً.";
    if (percentage >= 70) return "جيد جداً! لديك فهم قوي للمادة.";
    return "محاولة جيدة! ننصح بمراجعة أمثلة التبسيط والتكافؤ مرة أخرى.";
  };

  const handleRetry = () => setAnswers({});

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-['Tajawal']" dir="rtl">
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
      <header className="max-w-4xl mx-auto mb-10">
        <div className="bg-blue-600 rounded-3xl p-8 shadow-lg text-center transform hover:scale-[1.01] transition-transform">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{rawJson.title}</h1>
          <p className="text-blue-100 text-lg">اختبار تفاعلي لقياس مدى استيعاب المفاهيم</p>
        </div>
      </header>

      {/* Questions Container */}
      <main className="max-w-3xl mx-auto space-y-8 pb-10">
        {rawJson.questions.map((q) => (
          <div key={q.id} className="bg-white rounded-2xl shadow-sm border-t-4 border-blue-500 p-6 md:p-8 relative overflow-hidden">
            <div className="flex items-start gap-4">
              <span className="bg-blue-50 text-blue-600 font-bold px-4 py-2 rounded-xl text-lg">{q.id}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-800 mb-6 leading-relaxed">{q.questionText}</h3>

                {/* Options Grid */}
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
                        <span className="text-lg">{text}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                        {hasAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation */}
                {answers[q.id] && (
                  <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start animate-fadeIn">
                    <Info className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-amber-800 font-bold mb-1">توضيح الحل:</p>
                      <p className="text-amber-700 leading-relaxed">{q.explanation}</p>
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
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-slate-800 mb-2">النتيجة النهائية</h2>
            <div className="text-6xl font-black text-blue-600 my-6">
              {score} / {rawJson.questions.length}
            </div>
            <p className="text-xl text-slate-600 mb-6">{getFeedback()}</p>
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
        <p className="flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          تم تطوير هذا المحتوى التعليمي بالـ ai ليكون مساعد تفاعلي ولا يغني عن الكتاب المدرسي
        </p>
      </footer>
    </div>
  );
};

export default RatioQuizSSA;
