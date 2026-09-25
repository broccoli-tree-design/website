import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Drift from "@/components/Drift";

const SERVICES = [
  {
    num: "01",
    title: "0\u21921 product design",
    desc: "Translating complex real-life workflows into prototypes to test with real users, before investing in development",
  },
  {
    num: "02",
    title: "Redesign & consolidation",
    desc: "Merging legacy & third-party tools into a coherent platform, without breaking the existing system users are familiar with",
  },
  {
    num: "03",
    title: "Research & strategy",
    desc: "User research, testing, roadmap, and monetization strategy for teams still finding product-market fit",
  },
  {
    num: "04",
    title: "Design systems",
    desc: "Reusable components and patterns so your product scales without a redesign every quarter",
  },
];

const CASES = [
  {
    frame: 1 as const,
    image: { src: "/geolift.jpg", alt: "GeoLift tool screenshot" },
    eyebrow: "01 — Productizing an underutilized data science methodology",
    heading: "No-code data experimentation workflow",
    body: "Design highlight: surfacing the model\u2019s reasoning so scientists can discuss, compare, and make tradeoffs. When metrics can be reviewed and explained, scientists gained the confidence to make rapid decisions that are defensible in front of clients.",
    stat: "Experiment runtime: weeks \u2192 minutes",
  },
  {
    flip: true,
    frame: 2 as const,
    image: { src: "/omnicom.jpg", alt: "Omnicom Marketing OS screenshot" },
    eyebrow: "02 — Redesigning a monolithic software into customizable modules",
    heading: "One workflow for teams with competing needs",
    body: "Design highlight: modules that pull data from various internal workspaces to consist a unified workflow so teams can still present a cohesive front to clients.",
    stat: "User base increased 400%",
  },
  {
    frame: 3 as const,
    image: { src: "/reporting.jpg", alt: "Reporting Hub screenshot" },
    eyebrow: "03 — Expanding reporting capabilities",
    heading: (
      <>
        A shared vocabulary
        <br />
        for messy data
      </>
    ),
    body: "Design highlight: taxonomy tools for admin and analysts to form a single source of truth for reporting.",
    stat: "XX data sources centralized; XXX client accounts distributed",
  },
];

export default function Home() {
  return (
    <>
      {/* NAV — logo pinned top-left, actions top-right */}
      <nav className="nav" aria-label="Main">
        <a href="#" className="nav-logo" aria-label="Broccoli Tree Design">
          <picture>
            <source media="(max-width: 560px)" srcSet="/logo-icon.svg" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-text.svg" alt="" />
          </picture>
          <span className="nav-logo-text">Broccoli Tree Design</span>
        </a>
        <ul className="nav-links">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#work">Work</a>
          </li>
          <li>
            <a
              href="https://www.linkedin.com/in/liaiqi/"
              target="_blank"
              rel="noopener"
              className="nav-cta"
            >
              Chat on LinkedIn
            </a>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="display-xl" style={{ maxWidth: "14ch" }}>
            Hi, I&rsquo;m <span className="hero-name">Aiqi</span>
          </h1>
          <p className="lede">
            I help early-stage legal tech teams transform complex workflows into{" "}
            <span className="accent">intuitive designs</span> —{" "}
            <span className="muted">
              sourced from personal legal experience, not a generic UX playbook.
            </span>
          </p>
        </div>
        <div className="leaf-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/profile.png"
            alt="Aiqi sitting on the roots of a large tree"
          />
        </div>
      </section>

      {/* ABOUT */}
      <section className="field" id="about" data-sec="">
        <svg
          className="field-edge"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 70C240 20 480 100 760 60C1040 20 1240 10 1440 50V100H0Z" />
        </svg>
        <div className="field-body">
          {/* leaves — right edge */}
          <div
            className="leaf"
            data-depth="0.2"
            aria-hidden="true"
            style={
              {
                right: -40,
                top: -60,
                width: 320,
                "--o": 0.35,
                "--r": "-150deg",
              } as React.CSSProperties
            }
          />
          <div
            className="leaf"
            data-depth="0.34"
            aria-hidden="true"
            style={
              {
                right: "12%",
                top: "40%",
                width: 120,
                "--c": "var(--text)",
                "--o": 0.18,
                "--r": "30deg",
              } as React.CSSProperties
            }
          />
          <div
            className="leaf"
            data-depth="0.12"
            aria-hidden="true"
            style={
              {
                right: "4%",
                bottom: -40,
                width: 220,
                "--o": 0.28,
                "--r": "80deg",
              } as React.CSSProperties
            }
          />
          <div
            className="leaf"
            data-depth="0.4"
            aria-hidden="true"
            style={
              {
                right: "26%",
                top: "12%",
                width: 46,
                "--c": "var(--tertiary)",
                "--o": 0.7,
                "--r": "-20deg",
              } as React.CSSProperties
            }
          />
          <div className="panel-inner">
            <h2 className="display-m about-h2">
              A designer who speaks some <em>legalese</em>
            </h2>
            <p className="body about-body">
              As a Paralegal turned Designer, I&rsquo;ve experienced first-hand
              the stress and fulfillment operating within legal systems in U.S.
              and China — from managing trademark portfolios for tech companies,
              to conducting site visits for insurance due diligence, to helping
              state attorneys enforce immigrant children&rsquo;s rights to
              education. I understand when technology can make legal systems
              easier to deal with, and when humans should make the judgment.
            </p>
            <div className="thinking">
              <p className="thinking-quote">
                How does AI reshape the way clients engage with and evaluate
                legal services?
              </p>
              <a
                href="https://lnkd.in/p/gPGaJ2Sa"
                target="_blank"
                rel="noopener"
                className="thinking-link"
              >
                Read the article
              </a>
            </div>
          </div>
        </div>
        <svg
          className="field-edge"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 0H1440V40C1180 90 960 20 700 50C440 80 220 90 0 40Z" />
        </svg>
      </section>

      {/* SERVICES — wood territory: what grows next */}
      <section className="services" id="work">
        <h2 className="display-m">Where I help early-stage teams</h2>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div className="service" key={s.num}>
              <span className="service-num">{s.num}</span>
              <div className="service-text">
                <h3 className="service-title">{s.title}</h3>
                <p className="body">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RIBBON — dark leaf ribbon, services → case studies */}
      <div className="ribbon" data-sec="" aria-hidden="true">
        <svg
          viewBox="0 0 1440 240"
          preserveAspectRatio="none"
          focusable="false"
        >
          <path d="M0 50C260 10 460 80 720 50C980 20 1200 10 1440 40V170C1200 240 980 130 720 180C460 230 240 140 0 200Z" />
        </svg>
        <div
          className="leaf"
          data-depth="0.18"
          style={
            {
              left: "7%",
              top: 56,
              width: 130,
              "--r": "-12deg",
            } as React.CSSProperties
          }
        />
        <div
          className="leaf"
          data-depth="0.3"
          style={
            {
              left: "24%",
              top: 120,
              width: 80,
              "--c": "var(--surface)",
              "--r": "70deg",
            } as React.CSSProperties
          }
        />
        <div
          className="leaf"
          data-depth="0.12"
          style={
            {
              left: "46%",
              top: 50,
              width: 120,
              "--c": "var(--leaf-deep)",
              "--r": "160deg",
            } as React.CSSProperties
          }
        />
        <div
          className="leaf"
          data-depth="0.38"
          style={
            {
              left: "62%",
              top: 100,
              width: 48,
              "--c": "var(--tertiary)",
              "--r": "-30deg",
            } as React.CSSProperties
          }
        />
        <div
          className="leaf"
          data-depth="0.22"
          style={
            {
              left: "77%",
              top: 44,
              width: 160,
              "--r": "24deg",
            } as React.CSSProperties
          }
        />
        <div
          className="leaf"
          data-depth="0.34"
          style={
            {
              left: "35%",
              top: 160,
              width: 60,
              "--r": "110deg",
            } as React.CSSProperties
          }
        />
      </div>

      {/* CASE STUDIES */}
      <section className="work">
        <h2 className="display-m">Case studies of data and workflow apps</h2>
        <p className="body work-intro">
          Examples from my past life designing enterprise software that help
          humans overwhelmed by datageddon and fragmented tools make informed
          decisions and develop shared understanding.
        </p>
        <div className="case-list">
          {CASES.map((c, i) => (
            <div className={`case-row${c.flip ? " flip" : ""}`} key={i}>
              <div className="case-text">
                <p className="case-eyebrow">{c.eyebrow}</p>
                <h3 className="case-heading">{c.heading}</h3>
                <p className="body">{c.body}</p>
                <p className="case-stat">{c.stat}</p>
              </div>
              <div className={`case-frame case-frame-${c.frame}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image.src} alt={c.image.alt} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — fire closes the page */}
      <footer className="field" id="cta" data-sec="">
        <svg
          className="field-edge"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path d="M0 50C220 10 460 90 740 56C1020 22 1240 30 1440 70V100H0Z" />
        </svg>
        <div className="field-body cta-body">
          <div
            className="leaf"
            data-depth="0.18"
            aria-hidden="true"
            style={
              {
                left: -50,
                top: -40,
                width: 260,
                "--o": 0.3,
                "--r": "30deg",
              } as React.CSSProperties
            }
          />
          <div
            className="leaf"
            data-depth="0.32"
            aria-hidden="true"
            style={
              {
                left: "14%",
                bottom: 20,
                width: 100,
                "--c": "var(--text)",
                "--o": 0.16,
                "--r": "-60deg",
              } as React.CSSProperties
            }
          />
          <div
            className="leaf"
            data-depth="0.4"
            aria-hidden="true"
            style={
              {
                left: "22%",
                top: "24%",
                width: 44,
                "--c": "var(--tertiary)",
                "--o": 0.7,
                "--r": "140deg",
              } as React.CSSProperties
            }
          />
          <div className="panel-inner">
            <h2 className="display-m">Let&rsquo;s talk about your product.</h2>
            <a
              href="https://www.linkedin.com/in/liaiqi/"
              target="_blank"
              rel="noopener"
              className="cta-btn"
            >
              Chat on LinkedIn
            </a>
          </div>
        </div>
      </footer>

      <Drift />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
