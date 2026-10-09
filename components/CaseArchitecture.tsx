import type { CSSProperties } from "react";
import type { CaseStep } from "./CaseParts";

/** Every module a client workflow can use, in workflow order; the last one
 *  bleeds off the box to say there are more */
const MODULES = [
  "Insights",
  "Ideation",
  "Opportunity",
  "Audience",
  "Attention",
  "Channel",
  "Investment",
  "Flight",
  "Optimization",
];

/** The daily-operations apps, placed by hand on the 1282×321 box:
 *  name, left, top, and whether it fades out past the right edge */
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
  ["Measurement app", 1064, 247],
  ["Flighting app", 100, 256],
  ["Budget management app", 568, 256],
];

export type ArchRow = {
  label: string;
  steps: CaseStep[];
  onOpen: () => void;
};

/** Client portal (workflows built from modules) over the daily operations
 *  apps, joined by shared data. Laid out at 1384 wide; `scale` zooms it to
 *  the frame on desktop */
export default function CaseArchitecture({
  rows,
  scale,
}: {
  rows: ArchRow[];
  scale: number;
}) {
  return (
    <div className="arch" style={{ "--z": scale } as CSSProperties}>
      <div className="arch-box">
        <span className="arch-tag">Sample client workflows</span>
        <div className="arch-rows">
          {rows.map((r) => (
            <button
              type="button"
              key={r.label}
              className="arch-row"
              onClick={r.onOpen}
              aria-label={`Open the ${r.label} workflow`}
            >
              <span className="arch-row-name">{r.label}</span>
              {MODULES.map((name, i) => {
                const step = r.steps.find((s) => s.name === name);
                return (
                  <span
                    key={name}
                    className={`arch-tile${step ? "" : " is-unused"}${
                      i === MODULES.length - 1 ? " arch-more" : ""
                    }`}
                    style={
                      step &&
                      ({ "--c": step.color, "--fg": step.fg } as CSSProperties)
                    }
                  >
                    {name}
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      </div>

      <div className="arch-link">
        <svg viewBox="0 0 22 56" aria-hidden="true">
          <path d="M11 3v50M3 11l8-8 8 8M3 45l8 8 8-8" />
        </svg>
        <span>
          Shared data between workflow modules and daily operations workspace
        </span>
      </div>

      <div className="arch-box arch-ops">
        <span className="arch-tag">Daily operations workspace</span>
        <ul className="arch-apps">
          {APPS.map(([name, x, y, fade]) => (
            <li
              key={name}
              className={`arch-app${fade ? " arch-more" : ""}`}
              style={{ "--x": `${x}px`, "--y": `${y}px` } as CSSProperties}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
