import { useEffect, useRef, useState, useCallback } from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface PdfCanvasViewerProps {
  url: string;
  title?: string;
}

export function PdfCanvasViewer({ url, title }: PdfCanvasViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [fallback, setFallback] = useState(false);

  const renderPdf = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.querySelectorAll("canvas").forEach((c) => c.remove());
    setStatus("loading");
    setFallback(false);

    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");

        if (typeof Worker !== "undefined") {
          pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        }

        const pdf = await pdfjsLib.getDocument({
          url,
          cMapUrl: undefined,
          cMapPacked: false,
        }).promise;

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
      } catch {
        if (!cancelled) {
          setFallback(true);
          setStatus("ready");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [url]);

  useEffect(() => {
    const cleanup = renderPdf();
    return cleanup;
  }, [renderPdf]);

  if (fallback) {
    return (
      <div className="w-full" data-testid="pdf-fallback-viewer">
        <iframe
          src={`${url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          className="border-0 block w-full rounded-lg"
          style={{ height: "85vh", minHeight: "500px" }}
          title={title || "عارض PDF"}
        />
      </div>
    );
  }

  return (
    <div className="w-full" data-testid="pdf-canvas-viewer">
      {status === "loading" && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">جاري تحميل الملف...</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full"
        aria-label={title || "عارض PDF"}
      />
    </div>
  );
}
