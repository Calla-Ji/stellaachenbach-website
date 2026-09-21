import { WORDMARK_GLYPHS, WORDMARK_HEIGHT } from '../data/wordmarkGlyphs'

// The real brand wordmark, assembled from the actual per-letter artwork
// instead of live text — each glyph's own canvas width is its true advance
// width, so placing them edge-to-edge reproduces the real kerning exactly.
// Both "solid" and "outline" glyphs are filled shapes straight from the
// source art — the hollow/fragmented look of the "outline" letters is
// already baked into their path geometry (each stroke is its own thin
// closed shape), not something to fake with an SVG `stroke`.
export function WordmarkStatic({ id, className = '', height = 32, color = 'var(--color-neutron)' }) {
  return (
    <svg
      id={id}
      viewBox={`0 0 ${WORDMARK_GLYPHS.reduce((sum, g) => sum + g.width, 0)} ${WORDMARK_HEIGHT}`}
      className={className}
      style={{ height, width: 'auto', overflow: 'visible' }}
      aria-label="Stella · Achenbach"
    >
      {WORDMARK_GLYPHS.reduce((acc, glyph, i) => {
        const x = i === 0 ? 0 : acc.x
        acc.x = x + glyph.width
        acc.nodes.push(
          <path key={i} d={glyph.d} transform={`translate(${x}, 0)`} fill={color} />,
        )
        return acc
      }, { x: 0, nodes: [] }).nodes}
    </svg>
  )
}
