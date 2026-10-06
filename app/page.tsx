import type { CSSProperties } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Eye from "@/components/Eye";
import EyeTracker from "@/components/EyeTracker";
import CaseDeck from "@/components/CaseDeck";
import CaseModules from "@/components/CaseModules";
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
          "Branding & design system",
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
    title: "Branding & Design system",
    desc: "From brand identity to component library, a cohesive visual language so your product and marketing scale without a redesign every quarter",
  },
];

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
        <section className="hero" id="top" data-gate="dark">
          <div className="hero-photo">
            {/* growth rings — parallax on the wrapper, breathing on the ring */}
            {HERO_RINGS.map((depth, i) => (
              <div
                className="ring-layer"
                data-parallax={depth}
                style={{ "--i": i } as CSSProperties}
                key={i}
              >
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
          <div className="grid hero-text">
            <h1 className="text-display hero-h1">
              <span className="hero-hi">Hi, I&rsquo;m</span>{" "}
              <span className="text-stat hero-name">Aiqi</span>
            </h1>
            <p className="text-sub hero-slogan">
              <span className="hero-s1">
                I design <em className="hero-s1-em">intuitive</em> experiences
              </span>{" "}
              <span className="hero-s2">for legal tech</span>
            </p>
          </div>
        </section>

        {/* ABOUT — legalese */}
        <section className="about" id="about" data-gate="dark">
          <h2 className="text-display about-h2">
            To design is to <em>see</em>
            <br />
            both the human
            <br />
            and the system
          </h2>
          <p className="body about-p">
            As a Paralegal turned Designer, I’ve experienced first-hand the
            stress and fulfillment operating within legal systems in the U.S.
            and China — from working late nights alongside attorneys on urgent
            trademark prosecution, to negotiating with county clerks for the
            records behind an insurance litigation, to translating for immigrant
            families fighting for their children's right to go to school.
            <br />
            <br />I know when technology makes legal systems easier to deal
            with, and when humans should make the judgment.
          </p>
        </section>

        {/* CASE STUDIES — header */}
        <section className="cs" id="work" data-gate="light">
          <h2 className="text-display cs-h2">
            <span className="text-stat cs-case">Case</span>{" "}
            <span className="cs-studies">studies</span>{" "}
            <span className="text-sub cs-sub">of data and workflow apps</span>
          </h2>
          <p className="body cs-p">
            Examples from my past life designing enterprise software that help
            humans overwhelmed by datageddon and fragmented tools make informed
            decisions and develop shared understanding.
          </p>
        </section>

        {/* CASE — black-box deck; the four steps sit behind the answer */}
        <section className="case case-deck" data-gate="light">
          <div className="grid">
            <div className="mod-title">
              <span className="text-label case-eyebrow">
                0&rarr;1 Product design
              </span>
              <h3 className="text-display mod-h3">
                Increasing efficiency with human-in-the-lead
              </h3>
            </div>
          </div>
          <div className="grid mod-brief">
            <div className="mod-problem">
              <span className="text-label">Problem</span>
              <p className="body">
                In response to GDPR, the client needed to adopt GeoLift
                methodology to choose campaign locations. Its command-line
                interface took Marketing Scientists 20+ hours to learn and run,
                and worked like a black box.
              </p>
            </div>
            <div className="mod-solution">
              <span className="text-label">Solution</span>
              <p className="body">
                A no-code, self-explanatory workflow that runs in 10+ minutes
                and surfaces the model&rsquo;s reasoning, so Marketing
                Scientists can discuss, compare, and make tradeoffs with the
                client.
              </p>
            </div>
          </div>
          <CaseDeck />
        </section>

        {/* CASE — module accordion, curves flow into the 400% */}
        <section className="case case-mod" data-gate="light">
          <div className="grid">
            <div className="mod-title">
              <span className="text-label case-eyebrow">
                REDESIGN LEGACY APP
              </span>
              <h3 className="text-display mod-h3">
                From monolith to modular workflow
              </h3>
            </div>
          </div>
          <div className="grid mod-brief">
            <div className="mod-problem">
              <span className="text-label">Problem</span>
              <p className="body">
                One rigid system had to serve teams with competing needs. Each
                team worked around it differently, and the client saw the
                inconsistency.
              </p>
            </div>
            <div className="mod-solution">
              <span className="text-label">Solution</span>
              <p className="body">
                Customizable modules that pull data from each team&rsquo;s
                internal workspace into one unified workflow, so every team
                works its own way while the client still sees one cohesive
                front.
              </p>
            </div>
          </div>
          <CaseModules />
        </section>

        {/* QUESTION */}
        <section className="question" data-gate="light">
          <p className="text-label question-label">RECENT THOUGHTS</p>
          <p className="text-sub question-p">
            How does AI reshape the way clients engage with and evaluate legal
            services?
          </p>
          <a
            href="https://lnkd.in/p/gPGaJ2Sa"
            target="_blank"
            rel="noopener"
            className="text-label question-link"
          >
            Read the article &rarr;
          </a>
        </section>

        {/* SERVICES */}
        <section className="services" data-gate="light">
          <h2 className="text-display services-h2">
            <span className="services-title">Where I help</span>{" "}
            <span className="text-stat services-sub">early-stage teams</span>
          </h2>
          <div className="grid services-grid">
            {SERVICES.map((s, i) => (
              <div className={`svc-card svc-card-${i + 1}`} key={s.num}>
                <span className="text-stat svc-num">{s.num}</span>
                <h3 className="text-title svc-title">{s.title}</h3>
                <p className="svc-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA — the nav's LinkedIn pill is the action */}
        <footer className="cta" data-gate="dark">
          <h2 className="text-display cta-h2">
            Let&rsquo;s talk about
            <br />
            <em>your product</em>
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
      <EyeTracker />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
