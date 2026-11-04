import { useEffect, useRef, useState, type RefObject } from "react";

/** Hooks shared across the page */

/** The case studies' tiers: up to 640px a phone (one card at a time, screens
 *  open full size in a dialog to be read); 641 to 899 a tablet (the carousel
 *  as on desktop, the text stacked, no scroll-driven portal); 900 and up the
 *  full version. The CSS media queries use the same 640 / 900 */
const DESKTOP = "(width > 640px)";

/** The page's phone breakpoint, the same 640px as the CSS media queries
 *  (Rings.tsx combines it with hover, as its inverse) */
export const PHONE = "(max-width: 640px)";

export function usePhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = matchMedia(DESKTOP);
    const onChange = () => setPhone(!mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return phone;
}

/** Calls `measure` when any of these elements resizes, and once when
 *  watching starts. It waits until every ref holds an element; the refs
 *  are meant to be stable. */
export function useResize(
  refs: RefObject<Element | null>[],
  measure: () => void,
) {
  const latest = useRef(measure);
  useEffect(() => {
    latest.current = measure;
  });
  useEffect(() => {
    const els = refs.map((r) => r.current);
    if (els.some((el) => !el)) return;
    const ro = new ResizeObserver(() => latest.current());
    els.forEach((el) => ro.observe(el!));
    // text can reflow without its box changing (webfonts arriving, balanced
    // wrapping), which moves what connectors measure
    const remeasure = () => latest.current();
    addEventListener("resize", remeasure);
    document.fonts?.ready.then(remeasure);
    return () => {
      ro.disconnect();
      removeEventListener("resize", remeasure);
    };
    // once: the refs never change
  }, []);
}

/** True once the element has come into view (and stays true), so what's
 *  in it can play its entrance once */
export function useShown(ref: RefObject<Element | null>) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return shown;
}
