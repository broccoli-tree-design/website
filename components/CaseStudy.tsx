interface Stat {
  value: string
  label: string
}

interface Props {
  flip?: boolean
  image: { src: string; alt: string; objectPosition?: string }
  stats: [Stat, Stat]
  title: string
}

export default function CaseStudy({ flip, image, stats, title }: Props) {
  return (
    <div className={`case${flip ? ' flip' : ''}`}>
      <div className="case-screenshot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          style={image.objectPosition ? { objectPosition: image.objectPosition } : undefined}
        />
      </div>
      <div className="case-info">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
        <div className="case-divider">
          <h3 className="case-title">{title}</h3>
          <a href="#" className="case-link">Case study coming soon</a>
        </div>
      </div>
    </div>
  )
}
