import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
    eyebrow: "03 — Expanding internal reporting capabilities",
    heading: (
      <>
        A shared vocabulary
        <br />
        for messy data
      </>
    ),
    body: "Design highlight: Admin and user-side taxonomy tools gave dozens of data sources and client accounts a single source of truth to report against.",
    stat: "10+ data sources centralized",
  },
];

export default function Home() {
  return (
    <>
      {/* NAV — logo pinned top-left, actions top-right */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" />
          <span>Broccoli Tree Design</span>
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

      {/* ABOUT — water marks the section */}
      <section className="panel panel-about" id="about">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/water.svg" alt="" className="motif-water" />
        <div className="panel-inner">
          <h2 className="display-m about-h2">
            A designer who speaks some <em>legalese</em>
          </h2>
          <p className="body body-invert about-body">
            As a Paralegal turned Designer, I&rsquo;ve experienced first-hand the
            stress and fulfillment operating within legal systems in U.S. and
            China — from managing trademark portfolios for tech companies, to
            conducting site visits for insurance due diligence, to helping state
            attorneys enforce immigrant children&rsquo;s rights to education. I
            understand when technology can make legal systems easier to deal
            with, and when humans should make the judgment.
          </p>
          <div className="thinking">
            <p className="thinking-quote">
              How does AI reshape the way clients engage with and evaluate legal
              services?
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

      {/* HINGE — sun rising over the horizon, services → case studies */}
      <div className="hinge">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/earth-terracotta.svg" alt="" />
      </div>

      {/* CASE STUDIES */}
      <section className="work">
        <h2 className="display-m">Case studies of data and workflow apps</h2>
        <p className="body work-intro">
          Examples from my past life designing enterprise software that help
          humans overwhelmed by datageddon and fragmented tools make informed
          decisions and develop shared understanding
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
      <footer className="panel panel-cta" id="cta">
        <div className="panel-inner">
          <h2 className="display-l">Let&rsquo;s talk about your product.</h2>
          <a
            href="https://www.linkedin.com/in/liaiqi/"
            target="_blank"
            rel="noopener"
            className="cta-btn"
          >
            Chat on LinkedIn
          </a>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/fire-terracotta.svg" alt="" className="motif-fire" />
      </footer>

      <Analytics />
      <SpeedInsights />
    </>
  );
}
