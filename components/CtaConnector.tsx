"use client";
import { useEffect, useRef, useState } from "react";
import { FlowLine, PHONE, type Curve } from "./CaseParts";

/** The case connectors' vine, from above the heading's first line up to
 *  the nav's Let's chat button. The button is fixed at the top of the
 *  viewport, so where it sits on the page is where it will be once the page
 *  is scrolled to its end. Measured from the layout, then drawn in px so
 *  the leaves keep their shape. Lives in the heading (positioned). */
type Shape = { left: number; top: number; w: number; h: number; curve: Curve };

const PAD = 14; // room for the leaves past the curve's ends

export default function CtaConnector() {
  const ref = useRef<SVGSVGElement>(null);
  const [shape, setShape] = useState<Shape | null>(null);

  useEffect(() => {
    const heading = ref.current?.parentElement;
    const button = document.querySelector<HTMLElement>(".nav-cta");
    if (!heading || !button) return;

    const measure = () => {
      const hb = heading.getBoundingClientRect();
      const bb = button.getBoundingClientRect();
      // right edge of the first line of text
      const range = document.createRange();
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const rects: DOMRect[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!n.textContent?.trim()) continue;
        range.selectNodeContents(n);
        rects.push(...range.getClientRects());
      }
      if (!rects.length) return setShape(null);
      const first = Math.min(...rects.map((r) => r.top));
      const line = rects.filter((r) => r.top < first + 8);
      const lineStart = Math.min(...line.map((r) => r.left));
      const lineEnd = Math.max(...line.map((r) => r.right));

      const doc = document.documentElement;
      // beside the button, at the end of the page, in page coordinates
      const endY = doc.scrollHeight - innerHeight + bb.bottom + 30;
      // the middle of the text's top edge on desktop; phones keep to the
      // right, clear of the copy above
      const phone = matchMedia(PHONE).matches;
      const startX = phone ? lineEnd - 20 : (lineStart + lineEnd) / 2;
      // rise to the button's centre
      const endX = bb.left + bb.width / 2;
      // just above the heading's first line
      const startY = first + scrollY - 34;
      const w = endX - startX + 2 * PAD;
      const h = startY - endY + 2 * PAD;
      if (w < 30 || h < 60) return setShape(null);
      setShape({
        left: startX - hb.left - PAD,
        top: endY - (hb.top + scrollY) - PAD,
        w,
        h,
        // vertical at both ends, the controls crossing so it whips like the
        // case connectors
        curve: [
          [PAD, h - PAD],
          [PAD, h - PAD - (h - 2 * PAD) * 0.65],
          [w - PAD, h - PAD - (h - 2 * PAD) * 0.35],
          [w - PAD, PAD],
        ],
      });
    };

    measure();
    addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    document.fonts?.ready.then(measure);
    return () => {
      removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  return (
    <svg
      ref={ref}
      className="cta-connector"
      width={shape?.w}
      height={shape?.h}
      viewBox={shape ? `0 0 ${shape.w} ${shape.h}` : undefined}
      style={
        shape
          ? { left: shape.left, top: shape.top }
          : { display: "none" }
      }
      aria-hidden="true"
    >
      {shape && <FlowLine curve={shape.curve} />}
    </svg>
  );
}
