import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";

interface QuestionAnswer {
  questionNumber: number;
  correctAnswer: 'a' | 'b' | 'c' | 'd';
}

interface ImageBasedTestProps {
  testId: string;
  title: string;
  questionImages: string[];
  answers: QuestionAnswer[];
  onComplete?: (score: number, total: number) => void;
}

export function ImageBasedTest({ 
  testId, 
  title, 
  questionImages, 
  answers,
  onComplete 
}: ImageBasedTestProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = questionImages.length;
  const currentAnswer = answers.find(a => a.questionNumber === currentQuestion + 1);

  const handleAnswer = (answer: string) => {
    if (submitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const goToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const goToPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const submitTest = () => {
    setSubmitted(true);
    setShowResults(true);
    
    const score = answers.reduce((acc, answer) => {
      const userAnswer = userAnswers[answer.questionNumber - 1];
      return userAnswer === answer.correctAnswer ? acc + 1 : acc;
    }, 0);

    if (onComplete) {
      onComplete(score, totalQuestions);
    }
  };

  const resetTest = () => {
    setUserAnswers({});
    setShowResults(false);
    setSubmitted(false);
    setCurrentQuestion(0);
  };

  const getScore = () => {
    return answers.reduce((acc, answer) => {
      const userAnswer = userAnswers[answer.questionNumber - 1];
      return userAnswer === answer.correctAnswer ? acc + 1 : acc;
    }, 0);
  };

  const isCorrect = (questionIndex: number) => {
    const answer = answers.find(a => a.questionNumber === questionIndex + 1);
    return answer && userAnswers[questionIndex] === answer.correctAnswer;
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="text-sm text-muted-foreground">
          السؤال {currentQuestion + 1} من {totalQuestions}
        </div>
      </div>

      {showResults && (
        <Card className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">النتيجة</h3>
              <p className="text-2xl font-bold text-violet-600">
                {getScore()} / {totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">
                ({Math.round((getScore() / totalQuestions) * 100)}%)
              </p>
            </div>
            <Button onClick={resetTest} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              إعادة الاختبار
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 bg-accent/30">
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-8 h-8 rounded-full text-sm font-bold transition-all ${
                  currentQuestion === i
                    ? 'bg-violet-500 text-white'
                    : userAnswers[i]
                    ? submitted
                      ? isCorrect(i)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-violet-200 text-violet-800'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 bg-white dark:bg-gray-900 rounded-lg overflow-hidden border">
            <img
              src={questionImages[currentQuestion]}
              alt={`السؤال ${currentQuestion + 1}`}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {['a', 'b', 'c', 'd'].map((option) => {
              const isSelected = userAnswers[currentQuestion] === option;
              const isCorrectAnswer = currentAnswer?.correctAnswer === option;
              const showCorrectness = submitted;

              let buttonClass = "h-14 text-lg font-medium transition-all ";
              
              if (showCorrectness) {
                if (isCorrectAnswer) {
                  buttonClass += "bg-green-500 text-white border-green-500 hover:bg-green-500";
                } else if (isSelected && !isCorrectAnswer) {
                  buttonClass += "bg-red-500 text-white border-red-500 hover:bg-red-500";
                } else {
                  buttonClass += "opacity-50";
                }
              } else if (isSelected) {
                buttonClass += "bg-violet-500 text-white border-violet-500";
              }

              return (
                <Button
                  key={option}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswer(option)}
                  disabled={submitted}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      {option.toUpperCase()}
                    </span>
                    {showCorrectness && isCorrectAnswer && (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    {showCorrectness && isSelected && !isCorrectAnswer && (
                      <XCircle className="w-5 h-5" />
                    )}
                  </span>
                </Button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            {currentQuestion === totalQuestions - 1 && !submitted ? (
              <Button
                onClick={submitTest}
                disabled={answeredCount < totalQuestions}
                className="bg-violet-500 hover:bg-violet-600 gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                تسليم الاختبار ({answeredCount}/{totalQuestions})
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={goToNext}
                disabled={currentQuestion === totalQuestions - 1}
                className="gap-2"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
