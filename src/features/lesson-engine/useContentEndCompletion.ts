import { useEffect, useRef } from "react";

/** A visible end marker alone (mount, tab change, or restored scroll) is not reading. */
export function useContentEndCompletion(end: HTMLElement | null, active: boolean, onComplete: () => void) {
  const callback = useRef(onComplete);
  callback.current = onComplete;
  useEffect(() => {
    if (!active || !end) return;
    let cancelled = false, scrolled = false, visible = false, completed = false;
    let previousOffset = window.scrollY;
    const finish = () => {
      if (!cancelled && scrolled && visible && !completed) { completed = true; callback.current(); }
    };
    const onScroll = (event: Event) => {
      // Ignore the independent sidebar and require movement in the content's scroll root.
      const target = event.target;
      if (target !== document && target !== window && !(target instanceof HTMLElement && target.contains(end))) return;
      const offset = target instanceof HTMLElement ? target.scrollTop : window.scrollY;
      if (offset > previousOffset) scrolled = true;
      previousOffset = offset;
      const bounds = end.getBoundingClientRect();
      visible = Boolean(bounds && bounds.top >= 0 && bounds.bottom <= window.innerHeight);
      finish();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      finish();
    }, { threshold: 1 });
    observer.observe(end);
    document.addEventListener("scroll", onScroll, true);
    return () => { cancelled = true; observer.disconnect(); document.removeEventListener("scroll", onScroll, true); };
  }, [active, end]);
}
