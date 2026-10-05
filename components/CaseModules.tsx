"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { phoneFlow } from "./flow";

/** Client view, then the four modules it is built from */
const MODULES = [
  { name: "Client view", color: "var(--neutral-100)", fg: "var(--green-900)" },
  {
    name: "Audience insights",
    img: "/case2/m-audience.png",
    h: 725,
    color: "var(--green-300)",
    fg: "var(--green-900)",
  },
  {
    name: "Channel planning",
    img: "/case2/m-channel.png",
    h: 729,
    color: "var(--orange-400)",
    fg: "var(--green-900)",
  },
  {
    name: "Investment planning",
    img: "/case2/m-investment.png",
    h: 729,
    color: "var(--neutral-200)",
    fg: "var(--green-900)",
  },
  {
    name: "Performance reporting",
    img: "/case2/m-performance.png",
    h: 729,
    color: "var(--green-800)",
    fg: "var(--neutral-100)",
  },
];
const num = (i: number) => (i ? `0${i}` : "");

const DESKTOP = "(min-width: 900px)";
const TAB = 84; // collapsed tab width, matches .mod-item

/** One curve from the open tab's centre down to the result label's start.
 *  The centre comes from the layout rule (collapsed 84px, open tab takes the
 *  rest), so the path lands where the flex transition ends and CSS animates
 *  `d` there. */
function desktopFlow(w: number, ex: number, active: number) {
  const open = w - (MODULES.length - 1) * TAB;
  const cx = (Math.max(active, 0) * TAB + open / 2).toFixed(1);
  return `M ${cx} 0 C ${cx} 110, ${ex} 60, ${ex} 170`;
}

export default function CaseModules() {
  const [active, setActive] = useState(1);
  const [width, setWidth] = useState(1384);
  const [labelX, setLabelX] = useState(1000); // label's left edge in track space
  const track = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    const res = result.current;
    if (!el || !res) return;
    // the result block's width follows the 400% (and its font loading)
    const measure = () => {
      const t = el.getBoundingClientRect();
      setWidth(t.width);
      setLabelX(Math.round(res.getBoundingClientRect().left - t.left));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(res);
    // desktop always has one tab open
    const mq = matchMedia(DESKTOP);
    const onChange = () => mq.matches && setActive((a) => (a < 0 ? 1 : a));
    mq.addEventListener("change", onChange);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onChange);
    };
  }, []);

  const flow = desktopFlow(width, labelX, active);
  // the label starts mid-screen, so start right of it for a curve
  const mobileFlow = phoneFlow(width, labelX, 0.75);

  // desktop opens; mobile toggles, so tapping the open row closes it
  const toggle = (i: number) =>
    setActive((a) => (a === i && !matchMedia(DESKTOP).matches ? -1 : i));

  return (
    <>
      <div className="case-frame case-frame-2 mod-frame">
        <div
          className="case-ring case-ring-1"
          data-ring={1}
          aria-hidden="true"
        />
        <div
          className="case-ring case-ring-0"
          data-ring={0}
          aria-hidden="true"
        />
        <div className="mod-track" ref={track}>
          {MODULES.map((m, i) => {
            const open = i === active;
            return (
              <div
                key={m.name}
                className={`mod-item${open ? " is-open" : ""}${
                  m.img ? "" : " mod-client"
                }`}
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
                  <span className="text-num mod-num">{num(i)}</span>
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
                        <span className="text-label">Client view</span>
                        <span className="text-title mod-client-title">
                          Super Plate campaign Spring 2027
                        </span>
                      </div>
                      <ol className="mod-client-list">
                        {MODULES.slice(1).map((s, j) => (
                          <li key={s.name}>
                            <span className="text-num">{num(j + 1)}</span>
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
        <path d={flow} style={{ d: `path("${flow}")` } as CSSProperties} />
      </svg>
      <svg
        className="mod-flow mod-flow-mobile"
        viewBox={`0 0 ${width} 90`}
        aria-hidden="true"
      >
        <path d={mobileFlow} />
      </svg>

      <div className="mod-result" ref={result}>
        <span className="text-sub result-label">User base grew</span>
        <span className="text-stat result-stat">400%</span>
      </div>
    </>
  );
}
