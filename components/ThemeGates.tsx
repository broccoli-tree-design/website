"use client";
import { useEffect } from "react";

/** Page colour follows the scroll: the active gate is the last [data-gate]
 *  whose top has passed 55% of the viewport. Sets <html data-theme>; the
 *  themes and their fade live in globals.css. */
export default function ThemeGates() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.55;
      let gate = 0;
      document.querySelectorAll<HTMLElement>("[data-gate]").forEach((sec) => {
        if (sec.getBoundingClientRect().top < line) gate = Number(sec.dataset.gate);
      });
      const theme = gate <= 2 ? "dark" : gate === 3 ? "sage" : "deep";
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
