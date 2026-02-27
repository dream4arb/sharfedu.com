import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/use-page-seo";
import { Cloud, Home } from "lucide-react";

export default function NotFound() {
  usePageSeo({
    title: "الصفحة غير موجودة - 404",
    description: "عذراً، الصفحة التي تبحث عنها غير موجودة. عد إلى الصفحة الرئيسية لمنصة شارف التعليمية.",
  });
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center" dir="rtl">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-primary/30">
        <Cloud className="w-10 h-10" />
      </div>
      
      <h1 className="text-8xl font-extrabold text-primary mb-4">
        404
      </h1>
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        الصفحة غير موجودة
      </h2>
      
      <p className="text-muted-foreground mb-8 max-w-md text-lg">
        عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>

      <Link href="/">
        <Button size="lg" className="rounded-full px-8" data-testid="button-go-home">
          <Home className="w-4 h-4 ml-2" />
          العودة للرئيسية
        </Button>
      </Link>
    </div>
  );
}
