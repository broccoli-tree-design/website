import type { CSSProperties, ReactNode } from "react";

/** a length in the portal's artboard units */
export const u = (n: number) => `calc(${n} * var(--u))`;

type Pos = { l: number; t: number; w?: number; h?: number; r: number };
const at = ({ l, t, w, h, r }: Pos): CSSProperties => ({
  left: u(l),
  top: u(t),
  width: w ? u(w) : undefined,
  height: h ? u(h) : undefined,
  transform: `rotate(${r}deg)`,
});

/** An app: an outlined window, pale so the paper on top of it reads first.
 *  Its body is a 160×90 line drawing. */
function App({ name, pos, children }: { name: string; pos: Pos; children: ReactNode }) {
  return (
    <div className="cp-app" style={at(pos)}>
      <div className="cp-app-bar">
        <i />
        <i />
        <i />
        <span>{name}</span>
      </div>
      <svg viewBox="0 0 160 90">{children}</svg>
    </div>
  );
}

function Mail({ pos, subject, bars }: { pos: Pos; subject: string; bars: number[] }) {
  return (
    <div className="cp-mail" style={at(pos)}>
      <span className="cp-bar-sk" style={{ width: "26%" }} />
      <b>{subject}</b>
      {bars.map((w, i) => (
        <span key={i} className="cp-bar-sk" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}

/** The daily operations workspace, as it really is: a handful of apps with
 *  the work that never made it into them (email, notes, a sticky note and the
 *  Excel and PowerPoint files) lying on top. Decorative: the portal is
 *  aria-hidden. */
export default function CaseWorkspace() {
  return (
    <>
      <App name="Consumer insights app" pos={{ l: 18, t: 54, w: 180, h: 118, r: -1 }}>
        <path d="M6 4V84H156" opacity="0.5" />
        <path d="M6 74L34 66 62 70 90 50 118 56 146 38" strokeDasharray="3 4" opacity="0.6" />
        <path d="M6 66L34 48 62 58 90 26 118 38 146 12" />
        <circle cx="90" cy="26" r="2.5" />
        <circle cx="146" cy="12" r="2.5" />
      </App>
      <App name="Audience data app" pos={{ l: 222, t: 46, w: 180, h: 118, r: 0.5 }}>
        <path d="M6 6H154V84H6ZM6 24H154M6 42H154M6 60H154M44 6V84M82 6V84M120 6V84" opacity="0.28" />
        <rect x="46" y="26" width="34" height="14" />
        <rect x="84" y="44" width="52" height="14" opacity="0.7" />
        <text x="50" y="36" fontSize="8" fill="currentColor" stroke="none">
          #REF!
        </text>
      </App>
      <App name="Creative library app" pos={{ l: 22, t: 216, w: 170, h: 118, r: -1 }}>
        <path d="M8 8H56V40H8ZM64 8H112V40H64ZM120 8H152V40H120ZM8 48H56V80H8ZM64 48H112V80H64ZM120 48H152V80H120Z" />
      </App>
      <App name="Flighting app" pos={{ l: 214, t: 226, w: 180, h: 112, r: 1 }}>
        <rect x="8" y="8" width="84" height="18" rx="9" />
        <rect x="52" y="34" width="96" height="18" rx="9" opacity="0.8" />
        <rect x="8" y="60" width="66" height="18" rx="9" />
      </App>
      <App name="Taxonomy app" pos={{ l: 136, t: 382, w: 170, h: 102, r: 1.5 }}>
        <rect x="6" y="6" width="8" height="8" />
        <path d="M10 14V66M10 34H24M10 62H24M20 10H80" opacity="0.6" />
        <rect x="24" y="30" width="8" height="8" />
        <rect x="24" y="58" width="8" height="8" />
        <path d="M38 34H100M38 62H128" opacity="0.6" />
      </App>

      <Mail
        pos={{ l: 248, t: 178, w: 150, h: 66, r: -3 }}
        subject="can you resend the deck?"
        bars={[80, 52]}
      />
      <Mail
        pos={{ l: 150, t: 318, w: 170, h: 74, r: 1 }}
        subject="Fwd: planner sent excel AGAIN"
        bars={[88, 60]}
      />

      <div className="cp-note" style={at({ l: 18, t: 366, w: 140, h: 150, r: -2 })}>
        <b>Planner x ACME Weekly sync</b>
        <span className="cp-note-row">
          <i />
          <span className="cp-bar-sk" style={{ width: "70%" }} />
        </span>
        <span className="cp-note-row">
          <i className="is-done" />
          <span className="cp-bar-sk" style={{ width: "48%" }} />
        </span>
        <span className="cp-bar-sk" style={{ width: "86%" }} />
      </div>

      <div className="cp-sticky" style={at({ l: 112, t: 150, w: 92, h: 92, r: 4 })}>
        call ACME re: deck version
      </div>

      <span className="cp-pill" style={at({ l: 160, t: 96, r: 2 })}>
        deck_FINAL(2).pptx
      </span>
      <span className="cp-pill" style={at({ l: 168, t: 452, r: -1 })}>
        ACME_Plan_v7_Final_FINAL2.xlsx
      </span>
    </>
  );
}
