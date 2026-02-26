import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Sparkles, Star, Users, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import heroStudentImg from "@/assets/images/hero-student-new.jpg";

const heroImageUrl = "/hero-main.webp";
const heroImageFallback = "/hero-main.png";

export function Hero() {
  const { toast } = useToast();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-primary/15 via-cyan-200/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-cyan-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-right order-2 lg:order-1"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary/10 to-cyan-100/50 text-primary text-xs sm:text-sm font-bold mb-8 border border-primary/20"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="break-words">منصة تعليمية متكاملة لجميع المراحل الدراسية</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-foreground leading-[1.1] mb-6">
              شارف التعليمية
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-cyan-500 to-primary">
                ارتقِ بطموحك
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              تعلّم بأسلوب عصري وممتع مع دروس تفاعلية، شروحات مبسطة، 
              واختبارات ذكية تساعدك على التفوق في كل مادة.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Link href="/courses/1">
                <Button 
                  size="lg" 
                  className="rounded-full font-bold shadow-lg shadow-primary/25"
                  data-testid="button-start-learning"
                >
                  ابدأ الآن مجاناً
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full font-semibold"
                data-testid="button-watch-video"
                onClick={() => toast({ title: "قريباً", description: "سيتم إضافة الفيديو التعريفي في نسخة لاحقة" })}
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2">
                  <Play className="w-3 h-3 text-primary fill-primary" />
                </div>
                شاهد الفيديو
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">+20,000</div>
                  <div className="text-sm text-muted-foreground">طالب مسجل</div>
                </div>
              </div>
              <div className="w-px h-12 bg-border" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">4.9</div>
                  <div className="text-sm text-muted-foreground">تقييم الطلاب</div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative order-1 lg:order-2 ml-6 lg:ml-16"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-cyan-200/30 rounded-[2.5rem] blur-2xl scale-95" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-primary/20 border-4 border-white">
                <picture>
                  <source srcSet={heroImageUrl} type="image/webp" />
                  <source srcSet={heroImageFallback} type="image/png" />
                  <img 
                    src={heroImageFallback}
                    alt="طلاب وطالبات سعوديون يتعلمون - منصة شارف التعليمية"
                    className="w-full aspect-[4/3] object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    data-testid="img-hero"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = heroStudentImg;
                      (e.target as HTMLImageElement).onerror = null;
                    }}
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
              </div>
            </div>
            
            <motion.div 
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 lg:right-auto lg:-left-8 bg-white p-4 rounded-2xl shadow-xl border border-border/50 hidden sm:flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">تم إكمال الدرس</div>
                <div className="text-xs text-muted-foreground">أحسنت! واصل التقدم</div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 lg:left-auto lg:-right-8 bg-white p-4 rounded-2xl shadow-xl border border-border/50 hidden sm:flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="font-bold text-sm">+500 درس تفاعلي</div>
                <div className="text-xs text-muted-foreground">في جميع المواد</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
