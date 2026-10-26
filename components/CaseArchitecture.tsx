"use client";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { MODULES, usePhone } from "./CaseParts";

const MODULE_LIST = Object.entries(MODULES);

/** The daily-operations apps, placed by hand on a 1282×321 box: name, left,
 *  top, and whether it fades out past the right edge. Phones list them. */
const APPS: [string, number, number, boolean?][] = [
  ["Consumer insights app", 71, 99],
  ["Audience data app", 440, 68],
  ["Brand tracking app", 712, 58],
  ["Cross channel planning app", 1110, 58, true],
  ["Cultural trends app", 298, 125],
  ["Media consumption app", 575, 124],
  ["Investment planning app", 952, 151],
  ["Taxonomy app", 1165, 147, true],
  ["Optimization app", 152, 175],
  ["Social listening app", 474, 190],
  ["Creative library app", 852, 216],
  ["Flighting app", 100, 256],
  ["Budget management app", 568, 256],
];

type BoardStep = {
  /** a module's key in MODULES */
  key: string;
  name: string;
  /** a small copy of the module's screen */
  thumb: string;
  tint: string;
  /** opens the workflow on this module */
  onOpen: () => void;
};

type BoardRow = {
  label: string;
  steps: BoardStep[];
  /** opens the workflow on its brief */
  onOpen: () => void;
};

/** The client portal's workflows over the daily operations apps, joined by
 *  shared data. The portal is a board: a column per module, a row per
 *  workflow, each screen a small copy of its deck. On phones the board
 *  scrolls sideways, opening at Opportunity. */
export default function CaseArchitecture({ rows }: { rows: BoardRow[] }) {
  const phone = usePhone();
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = scroller.current;
    if (!s || !phone) return;
    const col = s.querySelector<HTMLElement>('[data-module="opportunity"]');
    if (col) s.scrollLeft = col.offsetLeft - 18;
  }, [phone]);

  return (
    <div className="gc-arch">
      <section className="gc-tile" aria-label="Sample client workflows">
        <h4 className="gc-tile-title">Sample client workflows</h4>
        <div className="gc-board" ref={scroller}>
          <div className="gc-grid">
            <div className="gc-row gc-head" aria-hidden="true">
              <span />
              {MODULE_LIST.map(([key, name]) => (
                <span
                  key={key}
                  data-module={key}
                  className={
                    rows.some((r) => r.steps.some((s) => s.key === key))
                      ? ""
                      : "is-unused"
                  }
                >
                  {name}
                </span>
              ))}
            </div>
            {rows.map((r) => (
              <div className="gc-row gc-band" key={r.label}>
                <button type="button" className="gc-label" onClick={r.onOpen}>
                  {r.label}
                </button>
                {MODULE_LIST.map(([key, name]) => {
                  const s = r.steps.find((x) => x.key === key);
                  return s ? (
                    <button
                      type="button"
                      key={key}
                      className="gc-thumb"
                      style={{ "--tint": s.tint } as CSSProperties}
                      onClick={s.onOpen}
                      aria-label={`Open the ${r.label} workflow on ${name}`}
                    >
                      <Image
                        src={s.thumb}
                        alt=""
                        width={360}
                        height={179}
                        sizes="(min-width: 900px) 9vw, 106px"
                      />
                    </button>
                  ) : (
                    <span key={key} className="gc-slot" aria-hidden="true" />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <p className="gc-link">
          Shared data between workflow modules and daily operations workspace
          <svg viewBox="0 0 22 56" aria-hidden="true">
            <path d="M11 3v50M3 11l8-8 8 8M3 45l8 8 8-8" />
          </svg>
        </p>
      </section>

      <section className="gc-tile gc-ops" aria-label="Daily operations workspace">
        <ul className="gc-apps">
          {APPS.map(([name, x, y, fade]) => (
            <li
              key={name}
              className={fade ? "is-fade" : undefined}
              style={{ "--x": x, "--y": y } as CSSProperties}
            >
              {name}
            </li>
          ))}
        </ul>
        <h4 className="gc-tile-title">Daily operations workspace</h4>
      </section>
    </div>
  );
}
