import { useId } from 'react'

// Same textPath mechanic as the arc mode of AnimatedWordmark, generalized
// for arbitrary static text (the tagline) instead of the animated wordmark
// glyphs. `position` picks which side of the circle the arc bulges toward.
export function ArcText({
  text,
  radius,
  totalAngleDeg = 130,
  fontSize = 12,
  letterSpacing = '0.2em',
  pad = 30,
  position = 'top',
  className = '',
}) {
  const pathId = useId()
  const cx = radius + pad
  const cy = radius + pad
  const spanRad = (totalAngleDeg * Math.PI) / 180
  const boxSize = 2 * (radius + pad)

  const startX = cx + radius * Math.sin(-spanRad / 2)
  const endX = cx + radius * Math.sin(spanRad / 2)
  const top = position === 'top'
  const startY = cy + (top ? -1 : 1) * radius * Math.cos(-spanRad / 2)
  const endY = cy + (top ? -1 : 1) * radius * Math.cos(spanRad / 2)
  // Top arc sweeps through the apex (clockwise, sweep=1); the bottom arc
  // is its mirror image, so it needs the opposite sweep to bulge away from
  // the circle's center instead of into it.
  const sweep = top ? 1 : 0
  const d = `M ${startX} ${startY} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${endY}`

  return (
    <svg viewBox={`0 0 ${boxSize} ${boxSize}`} className={className} style={{ overflow: 'visible' }}>
      <defs>
        <path id={pathId} d={d} fill="none" />
      </defs>
      <text
        style={{
          fontFamily: "'Geist', sans-serif",
          fontSize,
          letterSpacing,
          textTransform: 'uppercase',
          fill: 'var(--color-wormhole)',
        }}
      >
        <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
          {text}
        </textPath>
      </text>
    </svg>
  )
}
