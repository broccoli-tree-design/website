import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ServiceCard from '@/components/ServiceCard'
import CaseStudy from '@/components/CaseStudy'

const SERVICES = [
  { num: '01', title: '0→1 product design', desc: 'Translating complex real-life workflows into prototypes to test with real users, before investing in development' },
  { num: '02', title: 'Redesign & consolidation', desc: 'Merging legacy & third-party tools into a coherent platform, without breaking the existing system users are familiar with' },
  { num: '03', title: 'Research & strategy', desc: 'User research, testing, roadmap, and monetization strategy for teams still finding product-market fit' },
  { num: '04', title: 'Design systems', desc: 'Reusable components and patterns so your product scales without a redesign every quarter' },
]

const CASES = [
  {
    image: { src: '/geolift.jpg', alt: 'GeoLift tool screenshot' },
    stats: [{ value: '20 hrs↓', label: 'runtime decrease' }, { value: '$1M+', label: 'revenue driven' }] as [{ value: string; label: string }, { value: string; label: string }],
    title: 'No-code data analytics: Increasing efficiency with human-in-the-lead',
  },
  {
    flip: true,
    image: { src: '/omnicom.jpg', alt: 'Omnicom Marketing OS screenshot', objectPosition: 'right bottom' },
    stats: [{ value: '15 steps↓', label: 'workflow simplified' }, { value: '5k→22k', label: 'user base growth' }] as [{ value: string; label: string }, { value: string; label: string }],
    title: 'Campaign planning: One workflow that unites competing stakeholders',
  },
  {
    image: { src: '/reporting.jpg', alt: 'Reporting Hub screenshot' },
    stats: [{ value: '10+', label: 'data sources centralized' }, { value: '50+', label: 'clients distributed' }] as [{ value: string; label: string }, { value: string; label: string }],
    title: 'Reporting Hub: Surfacing standardized taxonomy for cross-team collaboration',
  },
]

export default function Home() {
  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <a href="#" className="nav-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" />
          <span>Broccoli Tree Design</span>
        </a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#work">Work</a></li>
          <li><a href="https://www.linkedin.com/in/liaiqi/" target="_blank" rel="noopener" className="nav-cta">Chat on LinkedIn</a></li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-text">
          <h1 className="hero-h1">Hi, I&rsquo;m <span className="name">Aiqi</span></h1>
          <h2 className="hero-h2">
            I turn complex legal workflows into <span className="hl">UX designs</span> that support humans make informed decisions.
          </h2>
          <p className="hero-sub">
            I work with early-stage legal tech teams to design products &amp; systems that humans can understand, navigate around and collaborate with — sourced from personal legal experience, not a generic UX playbook.
          </p>
        </div>
        <div className="hero-photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/profile.png" alt="Aiqi sitting on the roots of a large tree" />
        </div>
      </section>

      {/* ABOUT */}
      <section className="about" id="about">
        <h2 className="about-heading">
          A <span className="hl">designer</span> who speaks some <span className="hl">legalese</span>
        </h2>
        <p className="about-body">
          As a Paralegal turned Designer, I&rsquo;ve experienced first-hand the stress and fulfillment operating within legal systems in U.S. and China — from managing trademark portfolios for tech companies, to conducting site visits for insurance due diligence, to helping state attorneys enforce immigrant children&rsquo;s rights to education. I understand when technology can make legal systems easier to deal with, and when humans should make the judgment.
        </p>
        <div className="thinking-card">
          <div className="thinking-label">
            <span className="thinking-dot" aria-hidden="true" />
            Recent thoughts
          </div>
          <div className="thinking-row">
            <p className="thinking-quote">How does AI reshape the way clients engage with and evaluate legal services?</p>
            <a href="https://lnkd.in/p/gPGaJ2Sa" target="_blank" rel="noopener" className="thinking-link">Read the article</a>
          </div>
        </div>
      </section>

      {/* WORK */}
      <section className="work" id="work">
        <h2 className="services-heading">Where I help early-stage teams</h2>
        <div className="services-grid">
          {SERVICES.map((s) => <ServiceCard key={s.num} {...s} />)}
        </div>

        <div className="case-studies">
          <h2 className="work-heading">Case studies of <span className="hl">data</span> and <span className="hl">workflow</span> apps</h2>
          <p className="work-intro">
            Examples from my past life designing enterprise software that help humans overwhelmed by datageddon and fragmented tools make informed decisions and develop shared understanding
          </p>
          <div className="case-list">
            {CASES.map((c, i) => <CaseStudy key={i} {...c} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <footer className="cta" id="cta">
        <h2 className="cta-heading">Let&rsquo;s talk about your product.</h2>
        <a href="https://www.linkedin.com/in/liaiqi/" target="_blank" rel="noopener" className="cta-btn">Chat on LinkedIn</a>
      </footer>

      <Analytics />
      <SpeedInsights />
    </>
  )
}
