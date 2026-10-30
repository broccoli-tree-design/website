"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { CaseZoom, usePhone, useZoom, type CaseStep } from "./CaseParts";

/** Glass cards in a row, shared by both case studies: each screen fills a
 *  clear glass card of its own, with its number, name and description below.
 *  On desktop the first card is centred and in focus (wide, so its screen is
 *  easy to read), the next peeks in at the frame's edge and a click on a side
 *  card brings it into focus. On phones one card shows at a time with the
 *  next peeking in, and a tap on the screen opens it full size (CaseZoom).
 *  All the sizes live in cases.css, on the 1384 artboard's units (--u). */

export type GlassDeck = {
  name: string;
  /** "01", "02"…; empty for a front deck */
  num: string;
  desc?: string;
  /** the old tinted deck's glass tint over the ivory base (a colour) */
  tint?: string;
  /** a solid fill instead of glass (the black box) */
  solid?: boolean;
  /** ivory type, for the dark decks */
  dark?: boolean;
  img?: { src: string; w: number; h: number; quality?: number };
  alt?: string;
  /** a front deck's own content, in place of a number and a screen */
  body?: ReactNode;
};

/** Sizes in the artboard's units, matching cases.css: the side card, the one
 *  in focus and the gap */
const SIZES = { sm: 590, big: 965, gap: 24 };
const FRAME = 1384;
/** the caption under the focused card (the gap, the name and a line of
 *  description) */
const CAPTION = 72;

export default function GlassCarousel({
  decks,
  ratio,
  focus,
  onFocus,
  noun,
  zoomClass,
}: {
  decks: GlassDeck[];
  /** the screens' width over height */
  ratio: number;
  focus: number;
  onFocus: (i: number) => void;
  /** for the zoom dialog's label: "step", "module" */
  noun: string;
  zoomClass: string;
}) {
  const phone = usePhone();
  const zoom = useZoom();
  const n = decks.length;
  const foc = Math.min(focus, n - 1);

  // phones: the frame itself scrolls, so a deck chosen from outside (the
  // architecture board) is scrolled into view
  const frame = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = frame.current;
    const deck = el?.querySelector<HTMLElement>(".gc-deck");
    if (!el || !deck || !phone) return;
    el.scrollTo({ left: foc * (deck.offsetWidth + 10) });
  }, [foc, phone]);

  // the row slides so the focused card sits in the middle of the frame, the
  // ones before and after it on either side
  const tx = (FRAME - SIZES.big) / 2 - foc * (SIZES.sm + SIZES.gap);

  const style = {
    "--foc": foc,
    "--tx": tx,
    "--gc-h": SIZES.big / ratio + CAPTION,
    "--ratio": ratio,
  } as CSSProperties;

  const step = (d: GlassDeck): CaseStep => ({
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
      className="gc is-card"
      style={style}
    >
      <div className="gc-track">
        {decks.map((d, i) => {
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
              className={`gc-deck${on ? " is-focus" : ""}${
                Math.abs(i - foc) > 1 ? " is-far" : ""
              }${d.solid ? " is-solid" : ""}${d.dark ? " is-dark" : ""}`}
              style={d.tint ? ({ "--tint": d.tint } as CSSProperties) : undefined}
            >
              {!on && (
                <button
                  type="button"
                  className="gc-pick"
                  onClick={() => onFocus(i)}
                  aria-label={`Show ${d.name}`}
                />
              )}
              {d.body ? (
                <div className="gc-body">{d.body}</div>
              ) : (
                <>
                  <div className="gc-glass">{screen}</div>
                  <GlassCaption num={d.num} name={d.name} desc={d.desc} />
                </>
              )}
            </div>
          );
        })}
      </div>

      {foc > 0 && (
        <button
          type="button"
          className="gc-arrow gc-arrow-prev"
          onClick={() => onFocus(foc - 1)}
          aria-label="Show the previous deck"
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
          aria-label="Show the next deck"
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
