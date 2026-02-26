import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Rocket, X } from "lucide-react";

const STORAGE_KEY = "sharaf_welcome_shown";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY);
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => setIsVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
          data-testid="overlay-welcome"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-gradient-to-br from-sky-50 via-white to-violet-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-testid="modal-welcome"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-l from-sky-400 via-violet-500 to-rose-400" />
            
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 z-10"
              onClick={handleClose}
              data-testid="button-close-welcome"
            >
              <X className="w-5 h-5" />
            </Button>

            <div className="p-8 text-center" dir="rtl">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-white shadow-lg"
              >
                <Rocket className="w-10 h-10" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black mb-4 bg-gradient-to-l from-sky-600 to-violet-600 bg-clip-text text-transparent"
              >
                أهلاً بك في فجر جديد للتعليم!
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground leading-relaxed mb-6"
              >
                مرحباً بك في منصة شارف التعليمية. نحن هنا لنرتقي بطموحك عبر تجربة تعليمية فريدة، تجمع بين سهولة المحتوى وأحدث تقنيات التعلم. رحلتك نحو التفوق تبدأ من هنا.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  size="lg"
                  className="gap-2 rounded-xl px-8 bg-gradient-to-l from-sky-500 to-violet-500 text-white shadow-lg"
                  onClick={handleClose}
                  data-testid="button-explore-welcome"
                >
                  <Rocket className="w-5 h-5" />
                  استكشف الآن
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
