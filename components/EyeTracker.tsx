"use client";
import { useEffect } from "react";

// squash the eye shut, or just its lid when it has one (the "see" eyes,
// whose fill must stay put)
const blink = (el: Element) =>
  (el.querySelector("[data-lid]") ?? el).animate(
    [{ scale: "1 1" }, { scale: "1 0.08" }, { scale: "1 1" }],
    { duration: 220, easing: "ease-in-out" },
  );

/** Every [data-eye] follows the pointer, blinks when clicked, and blinks on
 *  its own every few seconds. Idle blinks are off under prefers-reduced-motion;
 *  tracking and click-blinks stay since they answer the user's own input. */
export default function EyeTracker() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    // before the first move, look down at the copy
    let pt = { x: innerWidth / 2, y: innerHeight * 0.8 };
    let raf = 0;

    const look = () => {
      raf = 0;
      document.querySelectorAll<HTMLElement>("[data-eye]").forEach((eye) => {
        const r = eye.getBoundingClientRect();
        if (!r.width) return;
        const dx = pt.x - (r.left + r.width / 2);
        const dy = pt.y - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(1, d / 220);
        const pupil = eye.querySelector<HTMLElement>("[data-pupil]");
        if (pupil)
          pupil.style.transform = `translate(${((dx / d) * k * r.width * 0.3).toFixed(2)}px,${((dy / d) * k * r.height * 0.12).toFixed(2)}px)`;
      });
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(look);
    };
    const onMove = (e: PointerEvent) => {
      pt = { x: e.clientX, y: e.clientY };
      schedule();
    };
    const onClick = (e: MouseEvent) => {
      const eye = (e.target as Element).closest?.("[data-eye]");
      if (eye) blink(eye);
    };

    const idle = setInterval(() => {
      if (reduce.matches || document.hidden) return;
      const eyes = [...document.querySelectorAll("[data-eye]")].filter(
        (el) => el.getBoundingClientRect().width,
      );
      if (!eyes.length) return;
      if (Math.random() < 0.35)
        eyes.forEach((el, i) => setTimeout(() => blink(el), i * 70));
      else blink(eyes[Math.floor(Math.random() * eyes.length)]);
    }, 2600);

    addEventListener("pointermove", onMove, { passive: true });
    // eyes move under a still cursor when the page scrolls or reflows
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    // SeeEyes sizes its eyes once the font is in
    addEventListener("eyes:layout", schedule);
    addEventListener("click", onClick);
    // web font swap can shift the nav eye
    document.fonts?.ready.then(schedule);
    schedule();

    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      removeEventListener("eyes:layout", schedule);
      removeEventListener("click", onClick);
      clearInterval(idle);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
