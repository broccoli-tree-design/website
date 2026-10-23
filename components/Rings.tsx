"use client";
import { useEffect } from "react";

const EASE = "cubic-bezier(.2,.7,.2,1)"; // --ease-out in globals.css

/** Growth-ring motion: hero rings breathe and follow the pointer. Everything
 *  is off under prefers-reduced-motion. */
export default function Rings() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 641px) and (hover: hover)");
    let teardown: (() => void) | null = null;

    const setup = () => {
      const cleanups: (() => void)[] = [];
      const baseOf = (el: HTMLElement) => parseFloat(getComputedStyle(el).opacity);

      // 1. hero ring breathing — pulse travels outward → inward
      document.querySelectorAll<HTMLElement>(".hero-ring").forEach((ring) => {
        const i = Number(ring.dataset.ring);
        const base = baseOf(ring);
        const anim = ring.animate(
          [
            { scale: "1", opacity: base },
            { scale: "1.03", opacity: base * 0.35 },
          ],
          {
            duration: 3200,
            easing: "ease-in-out",
            iterations: Infinity,
            direction: "alternate",
            delay: -(3 - i) * 800,
          },
        );
        cleanups.push(() => anim.cancel());
      });

      // 2. hero pointer parallax — transform lives on the wrapper, not the ring
      const hero = document.querySelector<HTMLElement>(".hero");
      const layers = document.querySelectorAll<HTMLElement>("[data-parallax]");
      if (hero && layers.length) {
        layers.forEach((l) => (l.style.transition = `transform .8s ${EASE}`));
        const onMove = (e: PointerEvent) => {
          if (!desktop.matches) return;
          const r = hero.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          layers.forEach((l) => {
            const d = parseFloat(l.dataset.parallax!) * 70;
            l.style.transform = `translate3d(${(-x * d).toFixed(1)}px,${(-y * d).toFixed(1)}px,0)`;
          });
        };
        const onLeave = () => layers.forEach((l) => (l.style.transform = ""));
        hero.addEventListener("pointermove", onMove);
        hero.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          hero.removeEventListener("pointermove", onMove);
          hero.removeEventListener("pointerleave", onLeave);
          layers.forEach((l) => (l.style.transform = l.style.transition = ""));
        });
      }

      return () => cleanups.forEach((fn) => fn());
    };

    const sync = () => {
      teardown?.();
      teardown = reduce.matches ? null : setup();
    };
    sync();
    reduce.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      teardown?.();
    };
  }, []);
  return null;
}
