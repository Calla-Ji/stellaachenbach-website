import { WORDMARK_GLYPHS, WORDMARK_HEIGHT } from '../data/wordmarkGlyphs'

// Bends the real brand letterforms along the top of the HUD circle, instead
// of SVG textPath on live text. Each glyph here is a real vector <path>, so
// a per-letter rotate+translate genuinely renders — unlike the earlier
// attempt to transform <tspan> elements, which Chromium silently ignores
// (see AnimatedWordmark's arc mode, which had to fall back to textPath for
// exactly this reason). Letters are laid out flat first using their true
// advance widths (same approach as WordmarkStatic), then that flat strip is
// wrapped onto the arc by angle so the real kerning survives the curve.
const TOTAL_FLAT_WIDTH = WORDMARK_GLYPHS.reduce((sum, g) => sum + g.width, 0)
const PAD = 30

export function WordmarkArc({ id, className = '', radius = 268, targetWidth = 331, color = 'var(--color-neutron)', offsetY = 0 }) {
  const scale = targetWidth / TOTAL_FLAT_WIDTH
  const totalAngleRad = (TOTAL_FLAT_WIDTH * scale) / radius

  let cursor = 0
  const placedGlyphs = WORDMARK_GLYPHS.map((glyph, i) => {
    const centerFlat = cursor + glyph.width / 2
    cursor += glyph.width
    const angleRad = (centerFlat * scale) / radius - totalAngleRad / 2
    const angleDeg = (angleRad * 180) / Math.PI
    const x = radius * Math.sin(angleRad)
    const y = -radius * Math.cos(angleRad)
    return { key: i, glyph, angleDeg, x, y }
  })

  const boxSize = 2 * (radius + PAD)
  const boxCenter = radius + PAD

  return (
    <svg
      id={id}
      viewBox={`0 0 ${boxSize} ${boxSize}`}
      className={className}
      style={{ overflow: 'visible' }}
      aria-label="Stella · Achenbach"
    >
      {placedGlyphs.map(({ key, glyph, angleDeg, x, y }) => (
        <path
          key={key}
          d={glyph.d}
          fill={color}
          transform={`translate(${boxCenter + x}, ${boxCenter + y + offsetY}) rotate(${angleDeg}) scale(${scale}) translate(${-glyph.width / 2}, ${-WORDMARK_HEIGHT})`}
        />
      ))}
    </svg>
  )
}
