"use client";
import { useEffect } from "react";

/** Moves every [data-depth] element relative to its [data-sec] section's
 *  distance from viewport center. depth 0.1–0.45; negative = moves against scroll. */
export default function Drift() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      document.querySelectorAll<HTMLElement>("[data-sec]").forEach((sec) => {
        const r = sec.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        const off = r.top + r.height / 2 - vh / 2;
        sec.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
          if (el.closest("[data-sec]") !== sec) return;
          el.style.transform = `translate3d(0,${(off * parseFloat(el.dataset.depth!)).toFixed(1)}px,0)`;
        });
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    update();
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
