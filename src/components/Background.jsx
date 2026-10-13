export default function Background({ blue = false, pink = false }) {
  const cls = 'bg' + (blue ? ' grow-blue' : '') + (pink ? ' grow-pink' : '')
  return (
    <div className={cls} aria-hidden="true">
      <div className="orb orb-blue" />
      <div className="orb orb-pink" />
      <div className="grid" />
      <div className="grid-lit" />
    </div>
  )
}
