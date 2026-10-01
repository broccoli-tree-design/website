"use client";
import { useEffect } from "react";

const DARK = { bg: "#173f35", ink: "#efeede", muted: "#d7dccb", accent: "#a8cf8a", warm: "#fb7e4f", ring: "#9cc47e" };
const SAGE = { bg: "#d7dccb", ink: "#173f35", muted: "#3c4a3f", accent: "#476f33", warm: "#9e4220", ring: "#5b8c42" };
const DEEP = { ...DARK, bg: "#102e27" };

/** Page colour follows the scroll: the active gate is the last [data-gate]
 *  whose top has passed 55% of the viewport. The @property-registered
 *  colours on :root fade between themes (see globals.css). */
export default function ThemeGates() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let current: object | null = null;
    const update = () => {
      raf = 0;
      const line = innerHeight * 0.55;
      let gate = 0;
      document.querySelectorAll<HTMLElement>("[data-gate]").forEach((sec) => {
        if (sec.getBoundingClientRect().top < line) gate = Number(sec.dataset.gate);
      });
      const theme = gate <= 2 ? DARK : gate === 3 ? SAGE : DEEP;
      if (theme === current) return;
      current = theme;
      for (const [k, v] of Object.entries(theme)) root.style.setProperty(`--${k}`, v);
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
