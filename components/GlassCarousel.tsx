"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { CaseZoom, usePhone, useZoom, type CaseStep } from "./CaseParts";

/** Flat glass decks in a row, shared by both case studies. On desktop the
 *  deck in focus is wide, so its screen is easy to read, and the next deck
 *  is cut off by the frame's edge with an arrow over it. On phones one deck
 *  shows at a time with the next peeking in, and a tap on the screen opens
 *  it full size (CaseZoom). All the sizes live in cases.css, on the 1384
 *  artboard's units (--u). */
/** Phones scroll the row sideways, snapping to a deck; there are no arrows */

export type GlassDeck = {
  name: string;
  /** "01", "02"…; empty for a front deck */
  num: string;
  desc?: string;
  /** the glass tint over the ivory base (a colour) */
  tint: string;
  /** a solid fill instead of glass (the black box) */
  solid?: boolean;
  /** ivory type, for the dark decks */
  dark?: boolean;
  img?: { src: string; w: number; h: number; quality?: number };
  alt?: string;
  /** a front deck's own content, in place of a number and a screen */
  body?: ReactNode;
};

/** Sizes in the artboard's units, matching cases.css */
const W_SM = 400;
const W_BIG = 1020;
const GAP = 24;
const FRAME = 1384;
/** everything above and below the screen in a wide deck / a small one: the
 *  padding, the number, the name and description. `roomy` decks have more
 *  padding (cases.css, .is-roomy). */
const chrome = (roomy: boolean) => ({
  big: roomy ? 230 : 202,
  sm: roomy ? 250 : 236,
  /** the screen's width: the deck less its side padding */
  bigW: W_BIG - (roomy ? 72 : 44),
  smW: W_SM - (roomy ? 64 : 40),
});

export default function GlassCarousel({
  decks,
  ratio,
  focus,
  onFocus,
  noun,
  zoomClass,
  roomy = false,
  className = "",
}: {
  decks: GlassDeck[];
  /** the screens' width over height */
  ratio: number;
  focus: number;
  onFocus: (i: number) => void;
  /** for the zoom dialog's label: "step", "module" */
  noun: string;
  zoomClass: string;
  /** more padding around each deck's content */
  roomy?: boolean;
  className?: string;
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

  // the row slides so the focused deck sits in the middle of the frame, the
  // ones before and after it on either side
  const slide = foc * (W_SM + GAP);
  const tx = (FRAME - W_BIG) / 2 - slide;

  const style = {
    "--foc": foc,
    "--tx": tx,
    "--gc-h": chrome(roomy).big + chrome(roomy).bigW / ratio,
    "--gc-sm-h": chrome(roomy).sm + chrome(roomy).smW / ratio,
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
      className={`gc${roomy ? " is-roomy" : ""} ${className}`}
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
          return (
            <div
              key={d.name}
              className={`gc-deck${on ? " is-focus" : ""}${
                Math.abs(i - foc) > 1 ? " is-far" : ""
              }${d.solid ? " is-solid" : ""}${d.dark ? " is-dark" : ""}`}
              style={{ "--tint": d.tint } as CSSProperties}
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
                  <span className="gc-num">{d.num}</span>
                  <div className="gc-text">
                    <b>{d.name}</b>
                    <p>{d.desc}</p>
                  </div>
                  {shot && (
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
                  )}
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
