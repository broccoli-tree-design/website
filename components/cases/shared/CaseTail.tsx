import {
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
  type Ref,
  type RefObject,
} from "react";
import { useResize, useShown } from "@/lib/hooks";
import { BUD_LENGTH, FlowLine, type Curve } from "./FlowLine";

/** The horizontal middle of an element's text, in viewport px */
function textMid(el: Element) {
  const range = document.createRange();
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const rects: DOMRect[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim()) continue;
    range.selectNodeContents(n);
    rects.push(...range.getClientRects());
  }
  if (!rects.length) {
    const b = el.getBoundingClientRect();
    return b.left + b.width / 2;
  }
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  return (left + right) / 2;
}

/** The connector from the Solution down to the result label: from the
 *  middle of the Solution's text (the brief sits just above) to the middle
 *  of the result's text, in px of its own box. */
function BriefFlow({
  result,
  shown,
}: {
  result: RefObject<HTMLElement | null>;
  shown: boolean;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, sx: 0, ex: 0 });
  useResize([svg, result], () => {
    const s = svg.current!.getBoundingClientRect();
    const solution =
      svg.current!.previousElementSibling?.querySelector(".case-solution p");
    if (!solution) return;
    setBox({
      w: s.width,
      h: s.height,
      sx: textMid(solution) - s.left,
      ex: textMid(result.current!) - s.left,
    });
  });
  const { w, h, sx, ex } = box;
  // the curve stops short so the bud, pointing on down, ends at the box's
  // bottom, just above the result
  const end = h - BUD_LENGTH;
  const curve: Curve = [
    [sx, 0],
    [sx, end * 0.6],
    [ex, end * 0.4],
    [ex, end],
  ];
  return (
    <svg
      ref={svg}
      aria-hidden="true"
      className={`case-flow case-brief-flow${shown ? " is-shown" : ""}`}
      viewBox={`0 0 ${w} ${h}`}
    >
      {w > 0 && <FlowLine curve={curve} />}
    </svg>
  );
}

/** A roman subtitle over the italic result number */
function CaseResult({
  label,
  stat,
  className,
  ref,
}: {
  label: string;
  stat: string;
  className: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div className={`case-result ${className}`} ref={ref}>
      <span className="text-sub result-label">{label}</span>
      <span className="text-stat result-stat">{stat}</span>
    </div>
  );
}

/** Everything under a case's frame: the Problem and Solution (children),
 *  the connector from the Solution, and the result */
export function CaseTail({
  children,
  ...result
}: { children: ReactNode } & Omit<ComponentProps<typeof CaseResult>, "ref">) {
  const ref = useRef<HTMLDivElement>(null);
  // the vine grows once the result is in view
  const shown = useShown(ref);
  return (
    <>
      <div className="grid case-brief">{children}</div>
      <BriefFlow result={ref} shown={shown} />
      <div className="grid">
        <CaseResult ref={ref} {...result} />
      </div>
    </>
  );
}
