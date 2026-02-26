import { useEffect, useRef, useState } from "react";

interface SsaIframeProps {
  src: string;
  lessonId: string;
}

export function SsaIframe({ src, lessonId }: SsaIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(2000);

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "sharef-iframe-height" && typeof e.data.height === "number") {
        const h = Math.max(e.data.height + 60, 400);
        setHeight(h);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    setHeight(2000);
  }, [lessonId]);

  return (
    <iframe
      ref={iframeRef}
      key={lessonId}
      src={src}
      className="w-full border-0 block"
      scrolling="no"
      style={{ height: `${height}px`, overflow: "hidden" }}
      title="محتوى شارف AI"
      data-testid="ssa-iframe"
    />
  );
}
