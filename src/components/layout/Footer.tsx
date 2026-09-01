import { Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-white pt-20 pb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white font-black text-lg shadow-lg">
                ش
              </div>
              <div>
                <span className="text-2xl font-black block leading-none">شـارف</span>
                <span className="text-xs text-white/50">التعليمية</span>
              </div>
            </div>
            <p className="text-white/60 leading-relaxed">
              نبني تجربة تعلم عربية تفاعلية للمناهج السعودية، تجمع الشرح المرئي والأنشطة ومعلم شارف داخل مسار واحد.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">روابط سريعة</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-home">
                  <span className="w-1 h-1 rounded-full bg-primary" />الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-features">
                  <span className="w-1 h-1 rounded-full bg-primary" />المميزات
                </Link>
              </li>
              <li>
                <Link href="/stages" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-grades">
                  <span className="w-1 h-1 rounded-full bg-primary" />المراحل الدراسية
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-privacy">
                  <span className="w-1 h-1 rounded-full bg-primary" />سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">تواصل معنا</h3>
            <ul className="space-y-4">
              <li>
                <a href="mailto:info@sharfedu.com" className="flex items-center gap-3 text-white/60 transition-colors hover:text-white">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  info@sharfedu.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">التوسع التدريجي</h3>
            <p className="text-white/60 mb-4 text-sm">
              نبدأ برياضيات الصف الثاني المتوسط ورياضيات الصف الثاني الثانوي، ثم نضيف الدروس بعد اكتمال المراجعة والاختبار.
            </p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} شارف التعليمية. جميع الحقوق محفوظة.</p>
          <p>منصة تعليمية سعودية — محتوى يُنشر تدريجيًا بعد المراجعة</p>
        </div>
      </div>
    </footer>
  );
}
