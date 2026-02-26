import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PdfCanvasViewerProps {
  url: string;
  title?: string;
}

export function PdfCanvasViewer({ url, title }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const renderedRef = useRef(false);

  useEffect(() => {
    renderedRef.current = false;
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("canvas").forEach((c) => c.remove());
    setLoading(true);
    setError(null);
    setPageCount(0);

    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

        if (cancelled) return;
        setPageCount(pdf.numPages);

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
        }

        renderedRef.current = true;
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError("تعذّر تحميل ملف PDF");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="w-full" data-testid="pdf-canvas-viewer">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">
            جاري تحميل الملف...{pageCount > 0 ? ` (${pageCount} صفحات)` : ""}
          </p>
        </div>
      )}
      {error && (
        <div className="text-center py-12 text-destructive">
          <p className="font-semibold">{error}</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full space-y-1"
        aria-label={title || "عارض PDF"}
      />
    </div>
  );
}
