import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  FileText,
  Video,
  Code,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  Plus,
  Save,
  Loader2,
  Check,
  X,
  BookOpen,
} from "lucide-react";

interface InlineAdminToolbarProps {
  lessonId: string;
  lessonTitle: string;
  subjectName?: string;
}

interface CmsContentItem {
  id: number;
  lessonId: string;
  tabType: string;
  contentType: string;
  dataValue: string;
}

export function InlineAdminToolbar({
  lessonId,
  lessonTitle,
  subjectName,
}: InlineAdminToolbarProps) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [existingContent, setExistingContent] = useState<CmsContentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [pdfSection, setPdfSection] = useState(false);
  const [videoSection, setVideoSection] = useState(false);
  const [ssaSection, setSsaSection] = useState(false);
  const [summarySection, setSummarySection] = useState(false);

  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [youtubeUrls, setYoutubeUrls] = useState("");
  const [youtubeSaving, setYoutubeSaving] = useState(false);
  const [youtubeSuccess, setYoutubeSuccess] = useState(false);

  const [ssaHtml, setSsaHtml] = useState("");
  const [ssaSaving, setSsaSaving] = useState(false);
  const [ssaSuccess, setSsaSuccess] = useState(false);

  const [summaryHtml, setSummaryHtml] = useState("");
  const [summarySaving, setSummarySaving] = useState(false);
  const [summarySuccess, setSummarySuccess] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ open: false, title: "", message: "", onConfirm: () => {} });

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    contentId: number;
    tabType: string;
  }>({ open: false, contentId: 0, tabType: "" });

  const [deleting, setDeleting] = useState(false);

  if (!user || user.role !== "admin") return null;

  const fetchExistingContent = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/cms/content/list?lesson=${encodeURIComponent(lessonId)}`,
        { credentials: "include" }
      );
      if (res.ok) {
        const data = await res.json();
        setExistingContent(Array.isArray(data) ? data : []);
      }
    } catch {
      setExistingContent([]);
    } finally {
      setLoading(false);
    }
  };

  const getExistingByTab = (tabType: string) =>
    existingContent.find((c) => c.tabType === tabType);

  const invalidateAll = () => {
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey.map(String).join("/");
        return key.includes("content") || key.includes(lessonId) || key.includes("cms");
      },
    });
    fetchExistingContent();
  };

  const handleToggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next) fetchExistingContent();
  };

  const handlePdfUpload = async (file: File) => {
    const existing = getExistingByTab("lesson");
    if (existing) {
      setConfirmDialog({
        open: true,
        title: "استبدال ملف PDF",
        message: `يوجد ملف PDF مرفوع بالفعل. هل تريد استبداله بالملف الجديد "${file.name}"؟`,
        onConfirm: () => {
          setConfirmDialog((p) => ({ ...p, open: false }));
          doUploadPdf(file);
        },
      });
      return;
    }
    doUploadPdf(file);
  };

  const doUploadPdf = async (file: File) => {
    setPdfUploading(true);
    setPdfSuccess(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lessonId", lessonId);
      formData.append("tabType", "lesson");
      const res = await fetch("/api/admin/cms/content/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (res.ok) {
        setPdfSuccess(true);
        invalidateAll();
        setTimeout(() => setPdfSuccess(false), 3000);
      }
    } catch {
    } finally {
      setPdfUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cms/content/${contentId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        invalidateAll();
      }
    } catch {
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, contentId: 0, tabType: "" });
    }
  };

  const handleYoutubeSave = async () => {
    const existing = getExistingByTab("video");
    if (existing && youtubeUrls.trim()) {
      setConfirmDialog({
        open: true,
        title: "تحديث روابط الفيديو",
        message: "يوجد محتوى فيديو سابق. هل تريد استبداله بالروابط الجديدة؟",
        onConfirm: () => {
          setConfirmDialog((p) => ({ ...p, open: false }));
          doSaveYoutube();
        },
      });
      return;
    }
    doSaveYoutube();
  };

  const doSaveYoutube = async () => {
    setYoutubeSaving(true);
    setYoutubeSuccess(false);
    try {
      const res = await fetch("/api/admin/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId,
          tabType: "video",
          contentType: "youtube",
          dataValue: youtubeUrls.trim(),
        }),
      });
      if (res.ok) {
        setYoutubeSuccess(true);
        invalidateAll();
        setTimeout(() => setYoutubeSuccess(false), 3000);
      }
    } catch {
    } finally {
      setYoutubeSaving(false);
    }
  };

  const handleSsaSave = async () => {
    const existing = getExistingByTab("education");
    if (existing && ssaHtml.trim()) {
      setConfirmDialog({
        open: true,
        title: "تحديث محتوى شارف AI",
        message: "يوجد محتوى سابق. هل تريد استبداله بالمحتوى الجديد؟",
        onConfirm: () => {
          setConfirmDialog((p) => ({ ...p, open: false }));
          doSaveSsa();
        },
      });
      return;
    }
    doSaveSsa();
  };

  const doSaveSsa = async () => {
    setSsaSaving(true);
    setSsaSuccess(false);
    try {
      const res = await fetch("/api/admin/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId,
          tabType: "education",
          contentType: "html",
          dataValue: ssaHtml,
        }),
      });
      if (res.ok) {
        setSsaSuccess(true);
        invalidateAll();
        setTimeout(() => setSsaSuccess(false), 3000);
      }
    } catch {
    } finally {
      setSsaSaving(false);
    }
  };

  const handleSummarySave = async () => {
    const existing = getExistingByTab("summary");
    if (existing && summaryHtml.trim()) {
      setConfirmDialog({
        open: true,
        title: "تحديث الملخص",
        message: "يوجد ملخص سابق. هل تريد استبداله بالمحتوى الجديد؟",
        onConfirm: () => {
          setConfirmDialog((p) => ({ ...p, open: false }));
          doSaveSummary();
        },
      });
      return;
    }
    doSaveSummary();
  };

  const doSaveSummary = async () => {
    setSummarySaving(true);
    setSummarySuccess(false);
    try {
      const res = await fetch("/api/admin/cms/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lessonId,
          tabType: "summary",
          contentType: "html",
          dataValue: summaryHtml,
        }),
      });
      if (res.ok) {
        setSummarySuccess(true);
        invalidateAll();
        setTimeout(() => setSummarySuccess(false), 3000);
      }
    } catch {
    } finally {
      setSummarySaving(false);
    }
  };

  const tabLabelMap: Record<string, string> = {
    lesson: "PDF الدرس",
    video: "فيديو",
    summary: "الملخص",
    education: "شارف AI",
    ssa: "شارف AI",
  };

  const existingPdf = getExistingByTab("lesson");
  const existingVideo = getExistingByTab("video");
  const existingSsa = getExistingByTab("education") || getExistingByTab("ssa");
  const existingSummary = getExistingByTab("summary");

  useEffect(() => {
    if (isExpanded && existingContent.length > 0) {
      if (existingVideo) {
        setYoutubeUrls(existingVideo.dataValue || "");
      }
      if (existingSsa) {
        setSsaHtml(existingSsa.dataValue || "");
      }
      if (existingSummary) {
        setSummaryHtml(existingSummary.dataValue || "");
      }
    }
  }, [isExpanded, existingContent]);

  return (
    <>
      <Card className="mb-4 border-dashed border-2 border-primary/30 bg-primary/5 dark:bg-primary/10">
        <div
          className="flex items-center justify-between gap-2 p-3 cursor-pointer select-none"
          role="button"
          tabIndex={0}
          data-testid="button-admin-toolbar-toggle"
          onClick={handleToggleExpand}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleToggleExpand();
            }
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-foreground">
              تعديل درس: {lessonTitle}
            </span>
            {subjectName && (
              <Badge variant="secondary" className="text-xs">
                {subjectName}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {lessonId}
            </Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {existingPdf && (
              <Badge variant="secondary" className="text-xs">
                <FileText className="w-3 h-3 ml-1" />
                PDF
              </Badge>
            )}
            {existingVideo && (
              <Badge variant="secondary" className="text-xs">
                <Video className="w-3 h-3 ml-1" />
                فيديو
              </Badge>
            )}
            {existingSsa && (
              <Badge variant="secondary" className="text-xs">
                <Code className="w-3 h-3 ml-1" />
                شارف AI
              </Badge>
            )}
            {existingSummary && (
              <Badge variant="secondary" className="text-xs">
                <BookOpen className="w-3 h-3 ml-1" />
                ملخص
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 pb-3 space-y-2">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري تحميل المحتوى الحالي...
              </div>
            )}

            <Collapsible open={pdfSection} onOpenChange={setPdfSection}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  data-testid="button-admin-pdf-section"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    ملف PDF الدرس
                  </span>
                  {pdfSection ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {existingPdf && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm flex-wrap">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Check className="w-3 h-3 text-green-600" />
                      ملف مرفوع:{" "}
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {existingPdf.dataValue.split("/").pop()}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="button-admin-pdf-delete"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          contentId: existingPdf.id,
                          tabType: "lesson",
                        })
                      }
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    data-testid="input-admin-pdf-file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePdfUpload(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pdfUploading}
                    data-testid="button-admin-pdf-upload"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {pdfUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {existingPdf ? "استبدال PDF" : "رفع PDF"}
                  </Button>
                  {pdfSuccess && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تم الرفع بنجاح
                    </span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={videoSection} onOpenChange={setVideoSection}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  data-testid="button-admin-video-section"
                >
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    روابط YouTube
                  </span>
                  {videoSection ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {existingVideo && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm flex-wrap">
                    <span className="text-muted-foreground text-xs">
                      <Check className="w-3 h-3 text-green-600 inline ml-1" />
                      {existingVideo.dataValue.split("\n").filter(Boolean).length}{" "}
                      رابط محفوظ
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="button-admin-video-delete"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          contentId: existingVideo.id,
                          tabType: "video",
                        })
                      }
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                )}
                <textarea
                  className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background text-foreground resize-y font-mono"
                  dir="ltr"
                  placeholder={"رابط YouTube لكل سطر\nhttps://www.youtube.com/watch?v=...\nhttps://www.youtube.com/watch?v=..."}
                  value={youtubeUrls}
                  data-testid="input-admin-youtube-urls"
                  onChange={(e) => setYoutubeUrls(e.target.value)}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={youtubeSaving || !youtubeUrls.trim()}
                    data-testid="button-admin-youtube-save"
                    onClick={handleYoutubeSave}
                  >
                    {youtubeSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    حفظ الروابط
                  </Button>
                  {youtubeSuccess && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تم الحفظ
                    </span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={ssaSection} onOpenChange={setSsaSection}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  data-testid="button-admin-ssa-section"
                >
                  <span className="flex items-center gap-2">
                    <Code className="w-4 h-4" />
                    HTML (شارف AI)
                  </span>
                  {ssaSection ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {existingSsa && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm flex-wrap">
                    <span className="text-muted-foreground text-xs">
                      <Check className="w-3 h-3 text-green-600 inline ml-1" />
                      محتوى HTML موجود (
                      {existingSsa.dataValue.length.toLocaleString()} حرف)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="button-admin-ssa-delete"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          contentId: existingSsa.id,
                          tabType: "education",
                        })
                      }
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                )}
                <textarea
                  className="w-full min-h-[200px] p-3 text-sm rounded-md border bg-background text-foreground resize-y font-mono"
                  dir="ltr"
                  placeholder="أدخل كود HTML لمحتوى شارف AI..."
                  value={ssaHtml}
                  data-testid="input-admin-ssa-html"
                  onChange={(e) => setSsaHtml(e.target.value)}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={ssaSaving || !ssaHtml.trim()}
                    data-testid="button-admin-ssa-save"
                    onClick={handleSsaSave}
                  >
                    {ssaSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    حفظ HTML
                  </Button>
                  {ssaSuccess && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تم الحفظ
                    </span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible
              open={summarySection}
              onOpenChange={setSummarySection}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  data-testid="button-admin-summary-section"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    HTML (الملخص)
                  </span>
                  {summarySection ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {existingSummary && (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50 text-sm flex-wrap">
                    <span className="text-muted-foreground text-xs">
                      <Check className="w-3 h-3 text-green-600 inline ml-1" />
                      ملخص HTML موجود (
                      {existingSummary.dataValue.length.toLocaleString()} حرف)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      data-testid="button-admin-summary-delete"
                      onClick={() =>
                        setDeleteDialog({
                          open: true,
                          contentId: existingSummary.id,
                          tabType: "summary",
                        })
                      }
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                )}
                <textarea
                  className="w-full min-h-[200px] p-3 text-sm rounded-md border bg-background text-foreground resize-y font-mono"
                  dir="ltr"
                  placeholder="أدخل كود HTML للملخص..."
                  value={summaryHtml}
                  data-testid="input-admin-summary-html"
                  onChange={(e) => setSummaryHtml(e.target.value)}
                />
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={summarySaving || !summaryHtml.trim()}
                    data-testid="button-admin-summary-save"
                    onClick={handleSummarySave}
                  >
                    {summarySaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    حفظ الملخص
                  </Button>
                  {summarySuccess && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      تم الحفظ
                    </span>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </Card>

      <Dialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog((p) => ({ ...p, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmDialog.title}</DialogTitle>
            <DialogDescription>{confirmDialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              data-testid="button-confirm-cancel"
              onClick={() =>
                setConfirmDialog((p) => ({ ...p, open: false }))
              }
            >
              إلغاء
            </Button>
            <Button
              data-testid="button-confirm-ok"
              onClick={confirmDialog.onConfirm}
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          setDeleteDialog((p) => ({ ...p, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف المحتوى</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف محتوى{" "}
              {tabLabelMap[deleteDialog.tabType] || deleteDialog.tabType}؟ لا
              يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={deleting}
              data-testid="button-delete-cancel"
              onClick={() =>
                setDeleteDialog({ open: false, contentId: 0, tabType: "" })
              }
            >
              إلغاء
            </Button>
            <Button
              variant="destructive"
              disabled={deleting}
              data-testid="button-delete-confirm"
              onClick={() => handleDeleteContent(deleteDialog.contentId)}
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
