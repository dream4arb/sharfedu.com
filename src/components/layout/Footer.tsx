import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      toast({ title: "أدخل بريدك الإلكتروني", variant: "destructive" });
      return;
    }
    toast({ title: "شكراً!", description: "تم الاشتراك في القائمة البريدية بنجاح" });
    setNewsletterEmail("");
  };
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
              منصة تعليمية رائدة تهدف إلى رفع مستوى جميع الطلاب في كافة المراحل الدراسية من خلال محتوى تعليمي متميز وأساليب حديثة.
            </p>
            <div className="flex gap-3">
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-colors hover-elevate"
                data-testid="link-social-twitter"
              >
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-colors hover-elevate"
                data-testid="link-social-instagram"
              >
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center transition-colors hover-elevate"
                data-testid="link-social-youtube"
              >
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
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
                <Link href="#features" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-features">
                  <span className="w-1 h-1 rounded-full bg-primary" />المميزات
                </Link>
              </li>
              <li>
                <Link href="#grades" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-grades">
                  <span className="w-1 h-1 rounded-full bg-primary" />المراحل الدراسية
                </Link>
              </li>
              <li>
                <Link href="#" className="text-white/60 transition-colors flex items-center gap-2 hover-elevate" data-testid="footer-link-privacy">
                  <span className="w-1 h-1 rounded-full bg-primary" />سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                info@sharfedu.com
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                +966 50 000 0000
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                الرياض، السعودية
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6">القائمة البريدية</h3>
            <p className="text-white/60 mb-4 text-sm">
              احصل على آخر التحديثات والنصائح التعليمية مباشرة في بريدك.
            </p>
            <form onSubmit={handleNewsletter} className="flex gap-2">
              <input 
                type="email" 
                placeholder="بريدك الإلكتروني" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/10 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-white placeholder:text-white/40"
                data-testid="input-newsletter-email"
              />
              <Button type="submit" size="icon" className="rounded-xl shrink-0" aria-label="اشتراك في القائمة البريدية" data-testid="button-newsletter-subscribe">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/50 text-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} شارف التعليمية. جميع الحقوق محفوظة.</p>
          <p>منصة تعليمية سعودية — جميع المراحل الدراسية المنهج السعودي</p>
        </div>
      </div>
    </footer>
  );
}
