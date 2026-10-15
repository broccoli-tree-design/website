"use client";
import { useEffect } from "react";
import { frameThrottle } from "./frame";

/** Page colour follows the scroll: the active gate is the last [data-gate]
 *  whose top has passed 55% of the viewport, and its value names the theme
 *  (dark | light). Sets <html data-theme>; the
 *  themes and their fade live in globals.css. */
export default function ThemeGates() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const line = innerHeight * 0.55;
      let theme = "dark";
      document.querySelectorAll<HTMLElement>("[data-gate]").forEach((sec) => {
        if (sec.getBoundingClientRect().top < line) theme = sec.dataset.gate!;
      });
      if (root.dataset.theme !== theme) root.dataset.theme = theme;
    };
    const schedule = frameThrottle(update);
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    update();
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      schedule.cancel();
    };
  }, []);
  return null;
}
