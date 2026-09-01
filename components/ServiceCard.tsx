interface Props {
  num: string
  title: string
  desc: string
}

export default function ServiceCard({ num, title, desc }: Props) {
  return (
    <div className="service-card">
      <div className="service-num">{num}</div>
      <h3 className="service-title">{title}</h3>
      <p className="service-desc">{desc}</p>
    </div>
  )
}
