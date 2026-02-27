import { useEffect } from "react";
import { setPageMeta, type PageMetaOptions } from "@/lib/seo";

export function usePageSeo(opts: PageMetaOptions | null) {
  useEffect(() => {
    if (opts) {
      setPageMeta(opts);
    }
  }, [opts?.title, opts?.description, opts?.keywords]);
}
