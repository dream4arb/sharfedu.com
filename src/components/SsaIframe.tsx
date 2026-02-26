import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface SsaIframeProps {
  src: string;
  lessonId: string;
}

export function SsaIframe({ src, lessonId }: SsaIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "sharef-iframe-height" && typeof e.data.height === "number") {
        setHeight(Math.max(e.data.height, 300));
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setHeight(null);
  }, [lessonId]);

  return (
    <div data-testid="ssa-iframe-container">
      {height === null && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="mr-3 text-muted-foreground">جاري تحميل الأسئلة...</span>
        </div>
      )}
      <iframe
        ref={iframeRef}
        key={lessonId}
        src={src}
        className="w-full border-0 block"
        scrolling="no"
        style={{
          height: height !== null ? `${height}px` : "0px",
          overflow: "hidden",
          opacity: height !== null ? 1 : 0,
        }}
        title="محتوى شارف AI"
        data-testid="ssa-iframe"
      />
    </div>
  );
}
