import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Eye, EyeOff } from "lucide-react";
import type { PdfTestData } from "@/data/pdf-tests";

interface PdfTestViewerProps {
  test: PdfTestData;
}

export function PdfTestViewer({ test }: PdfTestViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showAnswers, setShowAnswers] = useState(false);

  const pages = showAnswers ? test.answerPages : test.questionPages;
  const totalPages = pages.length;

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const toggleAnswers = () => {
    setShowAnswers(!showAnswers);
    setCurrentPage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={showAnswers ? "default" : "outline"}
            onClick={toggleAnswers}
            className="gap-2"
            data-testid="button-toggle-answers"
          >
            {showAnswers ? (
              <>
                <EyeOff className="w-4 h-4" />
                إخفاء الإجابات
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                عرض الإجابات
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            data-testid="button-prev-page"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 bg-accent rounded-lg text-sm font-medium">
            صفحة {currentPage + 1} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            data-testid="button-next-page"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-border overflow-hidden">
        <img
          src={pages[currentPage]}
          alt={`صفحة ${currentPage + 1}`}
          className="w-full h-auto"
          data-testid={`img-test-page-${currentPage + 1}`}
        />
      </div>

      <div className="flex justify-center gap-2 flex-wrap">
        {pages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index)}
            className={`w-10 h-10 rounded-lg font-bold transition-all ${
              currentPage === index
                ? "bg-primary text-white"
                : "bg-accent hover:bg-accent/80"
            }`}
            data-testid={`button-page-${index + 1}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
