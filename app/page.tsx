import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Eye from "@/components/Eye";
import Eyes from "@/components/Eyes";
import Rings from "@/components/Rings";
import ThemeGates from "@/components/ThemeGates";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, LINKEDIN_URL } from "./site";

/** structured data: who Aiqi is and what the studio offers (schema.org) */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#aiqi`,
      name: "Aiqi Li",
      jobTitle: "UX Designer",
      description:
        "Paralegal-turned UX designer creating intuitive design for legal tech, drawing on first-hand experience inside legal systems in the U.S. and China.",
      url: SITE_URL,
      image: `${SITE_URL}/profile.jpg`,
      sameAs: [LINKEDIN_URL],
      worksFor: { "@id": `${SITE_URL}/#studio` },
      knowsAbout: [
        "UX design",
        "Legal tech",
        "Product design",
        "User research",
        "Design systems",
        "Legal workflows",
        "Intellectual property",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": `${SITE_URL}/#studio`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      logo: `${SITE_URL}/logo-icon.svg`,
      image: `${SITE_URL}/opengraph-image.jpg`,
      founder: { "@id": `${SITE_URL}/#aiqi` },
      sameAs: [LINKEDIN_URL],
      knowsAbout: ["UX design for legal tech", "Legal tech product design"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "UX design services for legal tech",
        itemListElement: [
          "0→1 product design",
          "Redesign & consolidation",
          "Research & strategy",
          "Design systems",
        ].map((name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#studio` },
    },
  ],
};

/** pointer-parallax depth per hero ring, inner → outer */
const HERO_RINGS = [0.08, 0.16, 0.24, 0.32];

/** staggered cards — column, offset and numeral size live in .svc-card-N */
const SERVICES = [
  {
    num: "01",
    title: "0→1 product design",
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

/** case image with two offset growth rings; Rings.tsx animates them */
function CaseFrame({
  frame,
  src,
  alt,
  className = "",
}: {
  frame: 1 | 2 | 3;
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <figure className={`case-frame case-frame-${frame} ${className}`}>
      <div className="case-ring case-ring-1" data-ring={1} aria-hidden="true" />
      <div className="case-ring case-ring-0" data-ring={0} aria-hidden="true" />
      <picture>
        <source srcSet={`${src}.webp`} type="image/webp" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${src}.jpg`}
          alt={alt}
          width={1728}
          height={1117}
          loading="lazy"
          decoding="async"
        />
      </picture>
    </figure>
  );
}

export default function Home() {
  return (
    <div className="page">
      {/* NAV — fixed, background follows the scroll theme */}
      <nav className="nav" aria-label="Main">
        <a href="#top" className="nav-logo" aria-label="Broccoli Tree Design">
          <span className="nav-logo-mark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-text.svg" alt="" />
            {/* live eye laid over the logo's own */}
            <span className="nav-logo-eye" aria-hidden="true">
              <Eye />
            </span>
          </span>
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
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener"
              className="nav-cta"
            >
              Chat on LinkedIn
            </a>
          </li>
        </ul>
      </nav>

      <main className="column">
        {/* HERO */}
        <section className="hero" id="top" data-gate="0">
          <div className="hero-photo">
            {/* growth rings — parallax on the wrapper, breathing on the ring */}
            {HERO_RINGS.map((depth, i) => (
              <div className="ring-layer" data-parallax={depth} key={i}>
                <div
                  className={`hero-ring hero-ring-${i}`}
                  data-ring={i}
                  aria-hidden="true"
                />
              </div>
            ))}
            <picture>
              <source srcSet="/profile.webp" type="image/webp" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/profile.jpg"
                alt="Aiqi Li, UX designer for legal tech, sitting on the roots of a large tree"
                width={800}
                height={1067}
                fetchPriority="high"
              />
            </picture>
          </div>
          <div className="hero-text">
            <h1 className="hero-h1">
              <span className="hero-hi">Hi, I&rsquo;m</span>{" "}
              <span className="hero-name">Aiqi</span>
            </h1>
            <p className="hero-slogan">
              <span className="hero-s1">Designing intuitive experience</span>{" "}
              <span className="hero-s2">for legal tech</span>
            </p>
          </div>
        </section>

        {/* ABOUT — legalese */}
        <section className="about" id="about" data-gate="1">
          <h2 className="about-h2">
            A designer
            <br />
            who speaks
            <br />
            some <em>legalese</em>
          </h2>
          <p className="body about-p">
            As a Paralegal turned Designer, I&rsquo;ve experienced first-hand
            the stress and fulfillment operating within legal systems in U.S.
            and China — from managing trademark portfolios for tech companies,
            to conducting site visits for insurance due diligence, to helping
            state attorneys enforce immigrant children&rsquo;s rights to
            education. I understand when technology can make legal systems
            easier to deal with, and when humans should make the judgment.
          </p>
        </section>

        {/* QUESTION */}
        <section className="question" data-gate="2">
          <p className="question-label">RECENT THOUGHTS</p>
          <p className="question-p">
            How does AI reshape the way clients engage with and evaluate legal
            services?
          </p>
          <a
            href="https://lnkd.in/p/gPGaJ2Sa"
            target="_blank"
            rel="noopener"
            className="question-link"
          >
            Read the article &rarr;
          </a>
        </section>

        {/* SERVICES — sage theme */}
        <section className="services" id="work" data-gate="3">
          <h2 className="services-h2">
            <span className="services-title">Where I help</span>{" "}
            <span className="services-sub">early-stage teams</span>
          </h2>
          <div className="grid services-grid">
            {SERVICES.map((s, i) => (
              <div className={`svc-card svc-card-${i + 1}`} key={s.num}>
                <span className="svc-num">{s.num}</span>
                <h3 className="svc-title">{s.title}</h3>
                <p className="svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CASE STUDIES — header */}
        <section className="cs" data-gate="4">
          <h2 className="cs-h2">
            <span className="cs-case">Case</span>{" "}
            <span className="cs-studies">studies</span>{" "}
            <span className="cs-sub">of data and workflow apps</span>
          </h2>
          <p className="body cs-p">
            Examples from my past life designing enterprise software that help
            humans overwhelmed by datageddon and fragmented tools make informed
            decisions and develop shared understanding.
          </p>
        </section>

        {/* CASE 01 — sticky text beside the image */}
        <section className="case case-1" data-gate="5">
          <div className="grid case-1-grid">
            <div className="case-1-text">
              <span className="case-eyebrow">
                01 — Productizing an underutilized data science methodology
              </span>
              <h3 className="case-1-h3">
                No-code data experimentation workflow
              </h3>
              <p className="body">
                Design highlight: surfacing the model&rsquo;s reasoning so
                scientists can discuss, compare, and make tradeoffs. When
                metrics can be reviewed and explained, scientists gained the
                confidence to make rapid decisions that are defensible in front
                of clients.
              </p>
              <div className="case-1-stat">
                <span className="stat-label">Experiment runtime</span>
                <span className="case-1-stat-value">weeks &rarr; minutes</span>
              </div>
            </div>
            <CaseFrame
              frame={1}
              src="/geolift"
              alt="GeoLift no-code data experimentation workflow, UX case study"
              className="case-1-fig"
            />
          </div>
        </section>

        {/* CASE 02 — full-width image, 400% bleeds off the right */}
        <section className="case case-2" data-gate="5">
          <CaseFrame
            frame={2}
            src="/omnicom"
            alt="Omnicom Marketing OS modular workflow redesign, UX case study"
            className="case-2-fig"
          />
          <div className="grid case-2-grid">
            <div className="case-2-text">
              <span className="case-eyebrow">
                02 — Redesigning a monolithic software into customizable modules
              </span>
              <h3 className="case-2-h3">
                One workflow for teams with <em>competing</em> needs
              </h3>
            </div>
            <p className="body case-2-p">
              Design highlight: modules that pull data from various internal
              workspaces to consist a unified workflow so teams can still
              present a cohesive front to clients.
            </p>
          </div>
          <div className="case-2-stat">
            <span className="stat-label">User base increased</span>
            <span className="case-2-stat-value">400%</span>
          </div>
        </section>

        {/* CASE 03 — headline, image, then the numbers */}
        <section className="case case-3" data-gate="6">
          <div className="case-3-head">
            <span className="case-eyebrow">
              03 — Expanding reporting capabilities
            </span>
            <h3 className="case-3-h3">
              A shared <em>vocabulary</em>
              <br />
              for messy data
            </h3>
          </div>
          <CaseFrame
            frame={3}
            src="/reporting"
            alt="Reporting Hub taxonomy tools for centralized data reporting, UX case study"
            className="case-3-fig"
          />
          <div className="grid case-3-grid">
            <p className="body case-3-p">
              Design highlight: taxonomy tools for admin and analysts to form a
              single source of truth for reporting.
            </p>
            <div className="case-3-stats">
              <div className="case-3-stat">
                <span className="case-3-stat-value">50+</span>
                <span className="stat-label">data sources centralized;</span>
              </div>
              <div className="case-3-stat">
                <span className="case-3-stat-value">100+</span>
                <span className="stat-label">client accounts distributed</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA — the nav's LinkedIn pill is the action */}
        <footer className="cta" data-gate="6">
          <h2 className="cta-h2">
            Let&rsquo;s talk about
            <br />
            <em>your product.</em>
          </h2>
        </footer>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />
      <ThemeGates />
      <Rings />
      <Eyes />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
