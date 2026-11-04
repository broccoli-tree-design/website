"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { usePhone } from "@/lib/hooks";
import { CaseZoom, useZoom, type CaseStep } from "./CaseZoom";

/** Glass cards in a row, shared by both case studies: each screen fills a
 *  clear glass card of its own, with its number, name and description below.
 *  On desktop the first card is centred and in focus (wide, so its screen is
 *  easy to read), the next peeks in at the frame's edge and a click on a side
 *  card brings it into focus. On phones one card shows at a time with the
 *  next peeking in, and a tap on the screen opens it full size (CaseZoom).
 *  All the sizes live in shared.css, on the 1384 artboard's units (--u). */

export type GlassSlide = {
  name: string;
  /** "01", "02"… */
  num: string;
  desc?: string;
  img?: { src: string; w: number; h: number; quality?: number };
  alt?: string;
};

/** Sizes in the artboard's units, matching shared.css: the side card, the one
 *  in focus and the gap */
const SIZES = { sm: 590, big: 965, gap: 24 };
export type GlassSizes = typeof SIZES;
const FRAME = 1384;
/** the caption under the focused card (the gap, the name and a line of
 *  description) */
const CAPTION = 80;

export default function GlassCarousel({
  slides,
  ratio,
  focus,
  onFocus,
  noun,
  zoomClass,
  sizes,
}: {
  slides: GlassSlide[];
  /** the screens' width over height */
  ratio: number;
  focus: number;
  onFocus: (i: number) => void;
  /** for the zoom dialog's label: "step", "module" */
  noun: string;
  zoomClass: string;
  /** smaller cards, the focused one centred with a side card cut off on
   *  each side and the arrows on its edges (case 2); the default is the
   *  wide card of case 1 */
  sizes?: GlassSizes;
}) {
  const sz = sizes ?? SIZES;
  const phone = usePhone();
  const zoom = useZoom();
  const n = slides.length;
  const foc = Math.min(focus, n - 1);

  // phones: the frame itself scrolls, so a slide chosen from outside (the
  // architecture board) is scrolled into view
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = frame.current;
    const slide = el?.querySelector<HTMLElement>(".gc-slide");
    if (!el || !slide || !phone) return;
    el.scrollTo({ left: foc * (slide.offsetWidth + 10) });
  }, [foc, phone]);

  // the row slides so the focused card sits in the middle of the frame, the
  // ones before and after it on either side
  const tx = (FRAME - sz.big) / 2 - foc * (sz.sm + sz.gap);

  const style = {
    "--foc": foc,
    "--tx": tx,
    "--gc-h": sz.big / ratio + CAPTION,
    "--gc-big": sz.big,
    "--gc-sm": sz.sm,
    "--gc-gap": sz.gap,
    "--ratio": ratio,
  } as CSSProperties;

  const step = (d: GlassSlide): CaseStep => ({
    name: d.name,
    color: "",
    fg: "",
    img: d.img?.src,
    w: d.img?.w,
    h: d.img?.h,
    quality: d.img?.quality,
    desc: d.desc,
  });

  return (
    <div
      ref={frame}
      className="gc"
      style={style}
    >
      <div className="gc-track">
        {slides.map((d, i) => {
          const on = i === foc;
          const shot = d.img && (
            <Image
              src={d.img.src}
              alt={d.alt ?? `${d.name} ${noun}`}
              width={d.img.w}
              height={d.img.h}
              quality={d.img.quality}
              sizes={
                on
                  ? "(min-width: 900px) 72vw, 90vw"
                  : "(min-width: 900px) 30vw, 90vw"
              }
            />
          );
          const screen = shot && (
            <div className="gc-shot">
              {phone ? (
                <button
                  type="button"
                  className="gc-enlarge"
                  onClick={() => zoom.open(step(d))}
                  aria-haspopup="dialog"
                  aria-label={`Enlarge ${d.name}`}
                >
                  {shot}
                  <span className="gc-enlarge-hint" aria-hidden="true">
                    Tap to enlarge
                  </span>
                </button>
              ) : (
                shot
              )}
            </div>
          );
          return (
            <div
              key={d.name}
              className={`gc-slide${on ? " is-focus" : ""}${
                Math.abs(i - foc) > 1 ? " is-far" : ""
              }`}
            >
              {!on && (
                <button
                  type="button"
                  className="gc-pick"
                  onClick={() => onFocus(i)}
                  aria-label={`Show ${d.name}`}
                />
              )}
              <div className="gc-glass">{screen}</div>
              <GlassCaption num={d.num} name={d.name} desc={d.desc} />
            </div>
          );
        })}
      </div>

      {foc > 0 && (
        <button
          type="button"
          className="gc-arrow gc-arrow-prev"
          onClick={() => onFocus(foc - 1)}
          aria-label="Show the previous slide"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
      )}
      {foc < n - 1 && (
        <button
          type="button"
          className="gc-arrow gc-arrow-next"
          onClick={() => onFocus(foc + 1)}
          aria-label="Show the next slide"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      <CaseZoom zoom={zoom} phone={phone} noun={noun} className={zoomClass} />
    </div>
  );
}

/** A card's number, name and description, under its glass (the black box's
 *  faces carry the same caption) */
export function GlassCaption({
  num,
  name,
  desc,
}: {
  num: string;
  name: string;
  desc?: string;
}) {
  return (
    <div className="gc-caption">
      <span className="gc-num">{num}</span>
      <div className="gc-text">
        <b>{name}</b>
        {desc && <p>{desc}</p>}
      </div>
    </div>
  );
}
