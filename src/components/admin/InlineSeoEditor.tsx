import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  Check,
  Settings,
} from "lucide-react";

interface InlineSeoEditorProps {
  pagePath: string;
  autoTitle?: string;
  autoDescription?: string;
  autoKeywords?: string;
}

export function InlineSeoEditor({
  pagePath,
  autoTitle,
  autoDescription,
  autoKeywords,
}: InlineSeoEditorProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [seoOgTitle, setSeoOgTitle] = useState("");
  const [seoOgDesc, setSeoOgDesc] = useState("");
  const [seoOgImage, setSeoOgImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasDbData, setHasDbData] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!user || user.role !== "admin") return null;

  const loadSeo = async () => {
    try {
      const res = await fetch(
        `/api/admin/seo/by-path?path=${encodeURIComponent(pagePath)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && (data.title || data.description)) {
          setSeoTitle(data.title || "");
          setSeoDesc(data.description || "");
          setSeoKeywords(data.keywords || "");
          setSeoOgTitle(data.ogTitle || "");
          setSeoOgDesc(data.ogDescription || "");
          setSeoOgImage(data.ogImage || "");
          setHasDbData(true);
        } else {
          setSeoTitle("");
          setSeoDesc("");
          setSeoKeywords("");
          setSeoOgTitle("");
          setSeoOgDesc("");
          setSeoOgImage("");
          setHasDbData(false);
        }
      }
    } catch {}
    setLoaded(true);
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (next && !loaded) loadSeo();
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          pagePath,
          title: seoTitle || undefined,
          description: seoDesc || undefined,
          keywords: seoKeywords || undefined,
          ogTitle: seoOgTitle || undefined,
          ogDescription: seoOgDesc || undefined,
          ogImage: seoOgImage || undefined,
        }),
      });
      setSuccess(true);
      setHasDbData(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setSaving(false);
  };

  return (
    <Card className="p-3 border-dashed border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" data-testid="inline-seo-editor">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between text-sm"
            data-testid="button-seo-toggle"
            onClick={handleToggle}
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span className="font-medium">إعدادات SEO لهذه الصفحة</span>
              {hasDbData && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                  مخصص
                </span>
              )}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-3">
          <div className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-md" dir="rtl">
            <Settings className="w-3 h-3 inline ml-1" />
            المسار: <code className="text-xs bg-background px-1 rounded" dir="ltr">{pagePath}</code>
            {!hasDbData && (
              <span className="block mt-1 text-amber-600">
                يستخدم الوصف التلقائي حالياً. أدخل بيانات مخصصة لتظهر في محركات البحث.
              </span>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">عنوان الصفحة (Title)</label>
            <Input
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder={autoTitle || "عنوان الصفحة في محركات البحث"}
              className="text-sm"
              dir="rtl"
              data-testid="input-seo-title"
            />
            <p className={`text-[10px] ${seoTitle.length > 60 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {seoTitle.length}/60 حرف (الموصى به 60)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">وصف الصفحة (Description)</label>
            <Textarea
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder={autoDescription || "وصف الصفحة الذي يظهر في نتائج البحث"}
              className="text-sm min-h-[60px]"
              rows={2}
              dir="rtl"
              data-testid="input-seo-description"
            />
            <p className={`text-[10px] ${seoDesc.length > 160 ? "text-destructive font-medium" : "text-muted-foreground"}`}>
              {seoDesc.length}/160 حرف (الموصى به 160)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">كلمات مفتاحية (Keywords)</label>
            <Input
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder={autoKeywords || "كلمات مفتاحية، مفصولة بفواصل"}
              className="text-sm"
              dir="rtl"
              data-testid="input-seo-keywords"
            />
          </div>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" data-testid="button-seo-og-toggle">
                <ChevronDown className="w-3 h-3" />
                Open Graph (مشاركة وسائل التواصل)
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2 space-y-2">
              <Input
                value={seoOgTitle}
                onChange={(e) => setSeoOgTitle(e.target.value)}
                placeholder="عنوان المشاركة (اختياري)"
                className="text-sm"
                dir="rtl"
                data-testid="input-seo-og-title"
              />
              <Textarea
                value={seoOgDesc}
                onChange={(e) => setSeoOgDesc(e.target.value)}
                placeholder="وصف المشاركة (اختياري)"
                className="text-sm min-h-[50px]"
                rows={2}
                dir="rtl"
                data-testid="input-seo-og-description"
              />
              <Input
                value={seoOgImage}
                onChange={(e) => setSeoOgImage(e.target.value)}
                placeholder="رابط صورة المشاركة (اختياري)"
                className="text-sm"
                dir="ltr"
                data-testid="input-seo-og-image"
              />
            </CollapsibleContent>
          </Collapsible>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              disabled={saving}
              data-testid="button-seo-save"
              onClick={handleSave}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin ml-1" />
              ) : (
                <Save className="w-4 h-4 ml-1" />
              )}
              حفظ SEO
            </Button>
            {success && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                تم الحفظ
              </span>
            )}
          </div>

          {(seoTitle || autoTitle) && (
            <div className="mt-2 p-3 rounded-lg border bg-background" dir="rtl">
              <p className="text-[10px] text-muted-foreground mb-1">معاينة في محركات البحث:</p>
              <p className="text-blue-600 text-xs truncate">{`sharfedu.com${pagePath}`}</p>
              <p className="font-medium text-sm text-foreground line-clamp-1">
                {seoTitle || autoTitle} | منصة شارف التعليمية
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {seoDesc || autoDescription || "وصف الصفحة سيظهر هنا..."}
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
