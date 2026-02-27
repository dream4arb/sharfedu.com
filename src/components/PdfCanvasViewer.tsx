import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Loader2 } from "lucide-react";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs?v=${pdfjsLib.version}`;

interface PdfCanvasViewerProps {
  url: string;
  title?: string;
}

export function PdfCanvasViewer({ url, title }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState("");
  const cleanupRef = useRef<(() => void) | null>(null);

  const renderPdf = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("canvas").forEach((c) => c.remove());
    setStatus("loading");
    setErrMsg("");

    let cancelled = false;
    cleanupRef.current = () => { cancelled = true; };

    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument(url).promise;
        if (cancelled) return;

        const containerWidth = container.offsetWidth || 700;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const unscaledViewport = page.getViewport({ scale: 1 });
          const scale = (containerWidth / unscaledViewport.width) * dpr;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.style.display = "block";
          canvas.setAttribute("data-testid", `pdf-page-${i}`);

          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          await page.render({ canvasContext: ctx, viewport }).promise;
          if (cancelled) return;
          container.appendChild(canvas);

          if (i === 1) setStatus("ready");
        }

        if (pdf.numPages === 0) setStatus("ready");
      } catch (err: any) {
        if (!cancelled) {
          setErrMsg(err?.message || "unknown");
          setStatus("error");
        }
      }
    })();
  }, [url]);

  useEffect(() => {
    renderPdf();
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [renderPdf]);

  return (
    <div className="w-full" data-testid="pdf-canvas-viewer">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">جاري تحميل الملف...</p>
        </div>
      )}
      {status === "error" && (
        <div className="text-center py-8">
          <p className="text-destructive font-semibold mb-2">تعذّر تحميل ملف PDF</p>
          <p className="text-xs text-muted-foreground mb-4 dir-ltr">{errMsg}</p>
          <button
            onClick={renderPdf}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
            data-testid="button-retry-pdf"
          >
            <Loader2 className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full"
        role="document"
        aria-label={title || "عارض PDF"}
      />
    </div>
  );
}
