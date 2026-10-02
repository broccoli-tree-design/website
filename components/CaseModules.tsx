"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/** Client view, then the four modules it is built from */
const MODULES = [
  { name: "Client view", color: "#e6e5dc", fg: "#102e27" },
  { name: "Audience insights", img: "/case2/m-audience.png", h: 725, color: "#a8cf8a", fg: "#102e27" },
  { name: "Channel planning", img: "/case2/m-channel.png", h: 729, color: "#fb7e4f", fg: "#102e27" },
  { name: "Investment planning", img: "/case2/m-investment.png", h: 729, color: "#d7dccb", fg: "#102e27" },
  { name: "Performance reporting", img: "/case2/m-performance.png", h: 729, color: "#173f35", fg: "#efeede" },
];
const num = (i: number) => (i ? `0${i}` : "");

const DESKTOP = "(min-width: 900px)";
const TAB = 84; // collapsed tab width, matches .mod-item
const LABEL = { desktop: 200, mobile: 100 }; // half the result label's width

/** One curve per tab, from its centre down to the result label. Tab centres
 *  come from the layout rule (collapsed 84px, open tab takes the rest), so the
 *  paths land where the flex transition ends and CSS animates `d` there. */
function desktopFlow(w: number, active: number) {
  const open = w - (MODULES.length - 1) * TAB;
  const ex = w - LABEL.desktop;
  let x = 0;
  return MODULES.map((_, i) => {
    const tw = i === active ? open : TAB;
    const cx = (x + tw / 2).toFixed(1);
    x += tw;
    return `M ${cx} 0 C ${cx} 110, ${ex} 60, ${ex} 170`;
  });
}

/** three static curves, drawn on a 350-wide frame and stretched to fit */
function mobileFlow(w: number) {
  const s = w / 350;
  const ex = w - LABEL.mobile;
  return [
    [40, 50, 30],
    [175, 50, 40],
    [310, 40, 50],
  ].map(([x, a, b]) => {
    const sx = (x * s).toFixed(1);
    return `M ${sx} 0 C ${sx} ${a}, ${ex} ${b}, ${ex} 90`;
  });
}

export default function CaseModules() {
  const [active, setActive] = useState(1);
  const [width, setWidth] = useState(1384);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    // desktop always has one tab open
    const mq = matchMedia(DESKTOP);
    const onChange = () => mq.matches && setActive((a) => (a < 0 ? 1 : a));
    mq.addEventListener("change", onChange);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  // desktop opens; mobile toggles, so tapping the open row closes it
  const toggle = (i: number) =>
    setActive((a) => (a === i && !matchMedia(DESKTOP).matches ? -1 : i));

  return (
    <>
      <div className="case-frame case-frame-2 mod-frame">
        <div className="case-ring case-ring-1" data-ring={1} aria-hidden="true" />
        <div className="case-ring case-ring-0" data-ring={0} aria-hidden="true" />
        <div className="mod-track" ref={track}>
          {MODULES.map((m, i) => {
            const open = i === active;
            return (
              <div
                key={m.name}
                className={`mod-item${open ? " is-open" : ""}${m.img ? "" : " mod-client"}`}
                style={{ "--c": m.color, "--fg": m.fg } as CSSProperties}
              >
                <button
                  type="button"
                  id={`mod-tab-${i}`}
                  className="mod-tab"
                  aria-expanded={open}
                  aria-controls={`mod-panel-${i}`}
                  onClick={() => toggle(i)}
                >
                  <span className="mod-num">{num(i)}</span>
                  <span className="mod-name">{m.name}</span>
                  <span className="mod-sign" aria-hidden="true">
                    {open ? "–" : "+"}
                  </span>
                </button>
                <div
                  id={`mod-panel-${i}`}
                  className="mod-panel"
                  role="region"
                  aria-labelledby={`mod-tab-${i}`}
                  hidden={!open}
                >
                  {m.img ? (
                    <div className="mod-shot">
                      <Image
                        src={m.img}
                        alt={`${m.name} module, Omnicom Marketing OS`}
                        width={1406}
                        height={m.h}
                        sizes="(min-width: 900px) 990px, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="mod-client-view">
                      <div className="mod-client-head">
                        <span className="mod-label">Client view</span>
                        <span className="mod-client-title">Pepsi Super Bowl campaign</span>
                      </div>
                      <ol className="mod-client-list">
                        {MODULES.slice(1).map((s, j) => (
                          <li key={s.name}>
                            <span className="mod-client-num">{num(j + 1)}</span>
                            {s.name}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <svg
        className="mod-flow mod-flow-desktop"
        viewBox={`0 0 ${width} 170`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {desktopFlow(width, active).map((d, i) => (
          <path key={i} d={d} style={{ d: `path("${d}")` } as CSSProperties} />
        ))}
      </svg>
      <svg
        className="mod-flow mod-flow-mobile"
        viewBox={`0 0 ${width} 90`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {mobileFlow(width).map((d, i) => (
          <path key={i} d={d} />
        ))}
      </svg>

      <div className="mod-result">
        <span className="stat-label">Result: User base grew</span>
        <span className="mod-stat">400%</span>
      </div>
    </>
  );
}
