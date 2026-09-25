"use client";
import { useEffect } from "react";

const EASE = "cubic-bezier(.2,.7,.2,1)";

/** Growth-ring motion: hero rings breathe and follow the pointer; case-study
 *  rings ripple once on view and swell on hover. Everything is off under
 *  prefers-reduced-motion. */
export default function Rings() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = matchMedia("(min-width: 561px) and (hover: hover)");
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
      const hero = document.querySelector<HTMLElement>(".hero-wrap");
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

      // 3 + 4. case-study rings
      const frames = document.querySelectorAll<HTMLElement>(".case-frame");
      const ringsOf = (frame: Element) =>
        [...frame.querySelectorAll<HTMLElement>(".case-ring")].map((el) => ({
          el,
          i: Number(el.dataset.ring),
          base: baseOf(el),
        }));

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            ringsOf(entry.target).forEach(({ el, i, base }) => {
              el.animate(
                [
                  { scale: "0.97", opacity: 0 },
                  { scale: "1.015", opacity: Math.min(base * 2, 0.7) },
                  { scale: "1", opacity: base },
                ],
                { duration: 1600, easing: EASE, fill: "backwards", delay: i * 260 },
              );
            });
          });
        },
        { threshold: 0.45 },
      );
      frames.forEach((f) => io.observe(f));
      cleanups.push(() => io.disconnect());

      frames.forEach((frame) => {
        const rings = ringsOf(frame);
        rings.forEach(({ el }) => (el.style.transition = `scale .9s ${EASE}, opacity .9s`));
        const onEnter = () => {
          if (!desktop.matches) return;
          rings.forEach(({ el, i, base }) => {
            el.style.scale = String(1 + (i + 1) * 0.012);
            el.style.opacity = String(Math.min(base * 1.6, 0.7));
          });
        };
        const onLeave = () =>
          rings.forEach(({ el }) => (el.style.scale = el.style.opacity = ""));
        frame.addEventListener("pointerenter", onEnter);
        frame.addEventListener("pointerleave", onLeave);
        cleanups.push(() => {
          frame.removeEventListener("pointerenter", onEnter);
          frame.removeEventListener("pointerleave", onLeave);
          rings.forEach(({ el }) => {
            el.getAnimations().forEach((a) => a.cancel());
            el.style.scale = el.style.opacity = el.style.transition = "";
          });
        });
      });

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
