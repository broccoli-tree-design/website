interface Props {
  flip?: boolean
  frame: 1 | 2 | 3
  image: { src: string; alt: string }
  eyebrow: string
  heading: React.ReactNode
  body: string
  stat: string
}

export default function CaseStudy({ flip, frame, image, eyebrow, heading, body, stat }: Props) {
  return (
    <div className={`case-row${flip ? ' flip' : ''}`}>
      <div className="case-text">
        <p className="case-eyebrow">{eyebrow}</p>
        <h3 className="case-heading">{heading}</h3>
        <p className="case-body">{body}</p>
        <p className="case-stat">{stat}</p>
      </div>
      <div className={`case-frame case-frame-${frame}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt={image.alt} />
      </div>
    </div>
  )
}
