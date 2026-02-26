import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, Copy, Check, FileJson, Image as ImageIcon, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExtractedQuestion {
  id: number;
  question: string;
  hasImage?: boolean;
  imageDescription?: string;
  options?: { a: string; b: string; c: string; d: string };
  type?: string;
  correctAnswer?: string;
}

export default function PdfExtractor() {
  const [images, setImages] = useState<{ file: File; base64: string; preview: string }[]>([]);
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        setImages(prev => [...prev, { file, base64, preview: result }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const extractQuestions = async () => {
    if (images.length === 0) return;
    
    setIsLoading(true);
    const allQuestions: ExtractedQuestion[] = [];
    
    try {
      for (const img of images) {
        const response = await fetch("/api/extract-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: img.base64 }),
        });
        
        const data = await response.json();
        
        if (data.questions) {
          if (Array.isArray(data.questions)) {
            allQuestions.push(...data.questions);
          } else if (data.questions.questions) {
            allQuestions.push(...data.questions.questions);
          }
        }
      }
      
      const numberedQuestions = allQuestions.map((q, i) => ({
        ...q,
        id: i + 1,
      }));
      
      setExtractedQuestions(numberedQuestions);
      toast({
        title: "تم الاستخراج بنجاح",
        description: `تم استخراج ${numberedQuestions.length} سؤال`,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في استخراج الأسئلة",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getJsonOutput = () => {
    const output = {
      questions: extractedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        ...(q.hasImage && { image: `q${q.id}.png`, imageDescription: q.imageDescription }),
        options: q.options,
        correctAnswer: q.correctAnswer || "a",
        type: q.type || "multipleChoice",
      })),
    };
    return JSON.stringify(output, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getJsonOutput());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "تم النسخ",
      description: "تم نسخ JSON إلى الحافظة",
    });
  };

  return (
    <div className="min-h-screen bg-background p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">أداة استخراج الأسئلة من PDF</h1>
        <p className="text-muted-foreground mb-8">
          ارفع صور صفحات PDF وسيتم استخراج الأسئلة تلقائياً بصيغة JSON
        </p>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              إضافة صور
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-sm text-muted-foreground">
              {images.length} صورة مرفوعة
            </span>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.preview}
                    alt={`صفحة ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-1 left-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <Button
            onClick={extractQuestions}
            disabled={images.length === 0 || isLoading}
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الاستخراج...
              </>
            ) : (
              <>
                <FileJson className="w-4 h-4" />
                استخراج الأسئلة
              </>
            )}
          </Button>
        </Card>

        {extractedQuestions.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                الأسئلة المستخرجة ({extractedQuestions.length})
              </h2>
              <Button onClick={copyToClipboard} variant="outline" className="gap-2">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                نسخ JSON
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              {extractedQuestions.map((q, index) => (
                <div key={index} className="p-4 bg-accent/30 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">
                      {q.id}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium mb-2">{q.question}</p>
                      {q.hasImage && (
                        <div className="flex items-center gap-2 text-sm text-amber-600 mb-2">
                          <ImageIcon className="w-4 h-4" />
                          يحتوي على شكل: {q.imageDescription}
                        </div>
                      )}
                      {q.options && (
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">A) {q.options.a}</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">B) {q.options.b}</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">C) {q.options.c}</span>
                          <span className="p-2 bg-white dark:bg-gray-800 rounded">D) {q.options.d}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-sm" dir="ltr">{getJsonOutput()}</pre>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
