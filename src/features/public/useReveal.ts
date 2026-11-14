//! Scroll reveal: toggles a `revealed` flag the first time an element enters
//! the viewport. Pairs with the CSS classes `opacity-0 translate-y-6` +
//! `transition-all duration-700` on the observed element.

import { useEffect, useRef, useState } from "react";

export default function useReveal<T extends HTMLElement = HTMLDivElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, revealed };
}

/** Convenience class string for a reveal container. */
export const revealClass = (revealed: boolean, delay = 0) =>
  `transition-all duration-700 ease-out ${revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}` +
  (delay ? ` [transition-delay:${delay}ms]` : "");
