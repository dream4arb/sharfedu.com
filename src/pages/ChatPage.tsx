import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "مرحباً! أنا المعلم الذكي في منصة شارف التعليمية.\n\nأنا هنا لمساعدتك في فهم دروسك والإجابة على أسئلتك التعليمية.\n\nاسألني أي سؤال وسأحاول مساعدتك بأفضل طريقة ممكنة!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          lessonTitle: "",
          subjectName: "",
          conversationHistory: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("[Chat UI] API Error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        
        // Extract Google error message if available
        const googleError = errorData.googleError || errorData.technicalError;
        const userFriendlyError = errorData.error || "فشل في الحصول على إجابة من المعلم الذكي";
        
        // Log Google error to console for debugging (this will show in browser console)
        console.error("========================================");
        console.error("[Chat UI] ❌ API ERROR DETAILS");
        console.error("========================================");
        console.error("User-Friendly Error:", userFriendlyError);
        if (googleError) {
          console.error("Google Error Message:", googleError);
          console.error("Error Code:", errorData.errorCode);
          console.error("Error Status:", errorData.errorStatus);
          console.error("Error Type:", errorData.errorType);
        }
        console.error("Full Error Data:", errorData);
        console.error("========================================");
        
        // Throw with Google error if available, otherwise use user-friendly message
        throw new Error(googleError || userFriendlyError);
      }

      const data = await response.json();

      if (!data.response) {
        throw new Error("لم يتم استلام إجابة من المعلم الذكي");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("[Chat UI] Error:", error);
      console.error("[Chat UI] Error Details:", {
        message: error?.message,
        name: error?.name,
        stack: error?.stack,
      });
      
      // Create user-friendly error message
      let errorMessage = "عذراً، حدث خطأ أثناء التواصل مع المعلم الذكي.";
      
      if (error.message) {
        // Use the error message (which may contain Google's actual error)
        // If it's a technical error, show a user-friendly message but log the technical one
        const isTechnicalError = error.message.includes("API") || 
                                 error.message.includes("404") || 
                                 error.message.includes("401") ||
                                 error.message.includes("429") ||
                                 error.message.includes("model not found");
        
        if (isTechnicalError) {
          // Show user-friendly message
          errorMessage = "المعلم الذكي غير متاح حالياً. يرجى المحاولة لاحقاً.";
          // But log the technical error
          console.error("[Chat UI] Technical Error (logged for debugging):", error.message);
        } else {
          // Use the error message as-is
          errorMessage = error.message;
        }
      } else if (error.name === "TypeError" && error.message?.includes("fetch")) {
        errorMessage = "فشل الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.";
      }

      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black">المعلم الذكي</h1>
                <p className="text-sm text-muted-foreground">اسأل أي سؤال تعليمي وسأجيبك</p>
              </div>
            </div>
          </motion.div>

          {/* Chat Container */}
          <Card className="h-[calc(100vh-280px)] flex flex-col overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] sm:max-w-[70%] rounded-2xl p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      <p className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {message.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-accent rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">جاري الكتابة...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border/50 p-4 bg-card">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 min-h-[60px] max-h-[120px] resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px] shrink-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                اضغط Enter للإرسال، Shift+Enter للسطر الجديد
              </p>
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
