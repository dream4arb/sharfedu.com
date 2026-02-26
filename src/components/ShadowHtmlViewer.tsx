import { useEffect, useRef, useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";

interface ShadowHtmlViewerProps {
  url: string;
  lessonId: string;
}

export function ShadowHtmlViewer({ url, lessonId }: ShadowHtmlViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    (async () => {
      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error("fetch failed");
        const html = await resp.text();
        if (cancelled || !hostRef.current) return;

        if (!shadowRef.current) {
          shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
        }
        const shadow = shadowRef.current;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const styles = Array.from(doc.querySelectorAll("style"));
        const links = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        const bodyContent = doc.body?.innerHTML || "";

        const mobileFixCss = `
          :host { display: block; width: 100%; overflow: hidden; }
          * { max-width: 100% !important; box-sizing: border-box !important; }
          body, html { overflow-x: hidden !important; width: 100% !important; }
          img, video, canvas, svg, table { max-width: 100% !important; height: auto !important; }
          pre, code { overflow-x: auto !important; white-space: pre-wrap !important; word-break: break-word !important; }
          .container { padding: 0 8px !important; }
          @media (max-width: 768px) {
            .hero { min-height: auto !important; padding: 24px 12px !important; }
            .container { padding: 0 4px !important; }
            section { margin: 12px 0 !important; }
          }
        `;

        const wrapper = document.createElement("div");
        wrapper.setAttribute("dir", "rtl");
        wrapper.setAttribute("lang", "ar");

        const fixStyle = document.createElement("style");
        fixStyle.textContent = mobileFixCss;
        shadow.innerHTML = "";
        shadow.appendChild(fixStyle);

        for (const link of links) {
          const cloned = link.cloneNode(true) as HTMLElement;
          shadow.appendChild(cloned);
        }
        for (const style of styles) {
          const cloned = style.cloneNode(true) as HTMLElement;
          shadow.appendChild(cloned);
        }

        wrapper.innerHTML = bodyContent;
        shadow.appendChild(wrapper);

        const scripts = doc.querySelectorAll("body script");
        scripts.forEach((origScript) => {
          const s = document.createElement("script");
          if (origScript.getAttribute("src")) {
            s.src = origScript.getAttribute("src")!;
          } else {
            s.textContent = origScript.textContent;
          }
          shadow.appendChild(s);
        });

        setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [url, lessonId]);

  if (error) {
    return (
      <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-sm border border-border/50">
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 mx-auto mb-4 text-primary/50" />
          <p className="text-muted-foreground">تعذّر تحميل المحتوى</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="shadow-html-viewer" className="w-full">
      {loading && (
        <div className="bg-white dark:bg-card rounded-2xl p-8 shadow-sm border border-border/50">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="mr-3 text-muted-foreground">جاري تحميل الأسئلة...</span>
          </div>
        </div>
      )}
      <div ref={hostRef} className="w-full" />
    </div>
  );
}
