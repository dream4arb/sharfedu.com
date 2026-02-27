import React, { useMemo } from "react";
import { useLocation, Link } from "wouter";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageSeo } from "@/hooks/use-page-seo";

export default function PdfViewer() {
  usePageSeo({
    title: "عرض ملف PDF",
    description: "عرض ملف الدرس أو الملخص بصيغة PDF - منصة شارف التعليمية.",
  });
  const [location] = useLocation();
  const url = useMemo(() => {
    const search = location.includes("?") ? location.slice(location.indexOf("?")) : "";
    const params = new URLSearchParams(search);
    return params.get("url") || "";
  }, [location]);

  const decodedUrl = url ? decodeURIComponent(url) : "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 bg-card/50 px-4 py-3 flex items-center gap-4 shrink-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowRight className="w-4 h-4" />
            الرئيسية
          </Button>
        </Link>
      </header>
      <main className="flex-1 flex flex-col p-4">
        {decodedUrl ? (
          <div className="rounded-xl overflow-hidden border border-border/50 bg-card flex-1 flex flex-col" style={{ minHeight: "calc(100vh - 8rem)" }}>
            <iframe
              src={`${decodedUrl}#toolbar=1&navpanes=1`}
              className="w-full flex-1 border-0 min-h-[600px]"
              title="عرض PDF"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-medium">سيتم إضافة ملف PDF قريباً</p>
            <p className="text-sm text-muted-foreground/80 mt-2">عند توفير الرابط سيتم عرض الملف هنا</p>
            <Link href="/">
              <Button variant="outline" className="mt-6 gap-2">
                <ArrowRight className="w-4 h-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
