import { useEffect, useRef, useState } from 'react'

const FULL = 'STELLA · ACHENBACH'
const DOT_INDEX = FULL.indexOf('·')
// Matches the real brand wordmark: only the "S" and the second "A" resolve
// to solid fill. The round "stitchhole" dot between the two words is drawn
// separately (not the font's own middot glyph) in flat mode. Every other
// letter loops forward/backward forever — draws in, erases back out, in.
const SOLID_INDICES = new Set([0, FULL.lastIndexOf('A')])
// Sized to the wordmark's actual combined outline length (measured), so
// the sweep uses the whole duration instead of finishing early and idling.
const DASH_LENGTH = 180
export const TAGLINE_CUE_MS = 3400
const DRAW_DURATION_MS = TAGLINE_CUE_MS
// Once the initial S/second-A reveal has had time to play, later fill
// changes (from hovering) should feel snappy rather than inheriting that
// slow initial delay.
const REVEAL_SETTLE_MS = 2000
// Generous fallback box (letters aren't measured yet) — gets replaced by a
// tight crop of the real glyphs once fonts load, so the SVG's own edges
// match the visible ink exactly (no baked-in side padding to misalign
// against plain text elsewhere on the page).
const DEFAULT_VIEW_BOX = '0 0 1400 170'
const STROKE_PAD = 4

const sharedKeyframes = `
  @keyframes wordmark-draw {
    from { stroke-dashoffset: ${DASH_LENGTH}; }
    to { stroke-dashoffset: 0; }
  }
`

function letterStyle({ isDot, showSolid, started, revealed }) {
  return {
    fill: isDot ? 'none' : showSolid ? 'var(--color-neutron)' : 'transparent',
    stroke: isDot ? 'none' : undefined,
    strokeOpacity: showSolid ? 0 : 1,
    transition: !started
      ? 'none'
      : revealed
        ? 'fill 0.2s ease, stroke-opacity 0.2s ease'
        : 'fill 0.8s ease-in 1s, stroke-opacity 0.8s ease-in 1s',
  }
}

// Flat, straight-line rendering of the wordmark — used for the splash only.
// The circle-bent version on the HUD arc is WordmarkArc.jsx, a separate
// component built on real vector letterforms (this one still animates the
// draw-in stroke via live <text>, which the arc version can't do).
export function AnimatedWordmark({ id, className = '', forceSolid = false, fontSize = 120 }) {
  const [started, setStarted] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [dotBox, setDotBox] = useState(null)
  const [viewBox, setViewBox] = useState(DEFAULT_VIEW_BOX)
  const textRef = useRef(null)
  const dotRef = useRef(null)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setStarted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    if (!started) return
    const timer = setTimeout(() => setRevealed(true), REVEAL_SETTLE_MS)
    return () => clearTimeout(timer)
  }, [started])

  useEffect(() => {
    let cancelled = false
    document.fonts.ready.then(() => {
      if (cancelled) return
      if (dotRef.current) setDotBox(dotRef.current.getBBox())
      if (textRef.current) {
        const b = textRef.current.getBBox()
        setViewBox(`${b.x - STROKE_PAD} ${b.y - STROKE_PAD} ${b.width + STROKE_PAD * 2} ${b.height + STROKE_PAD * 2}`)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const textBaseStyle = {
    fontFamily: "'AG Stella', sans-serif",
    fontSize,
    stroke: 'var(--color-neutron)',
    strokeWidth: 2,
    strokeDasharray: DASH_LENGTH,
    strokeDashoffset: !started || forceSolid ? (started ? 0 : DASH_LENGTH) : undefined,
    animation: started && !forceSolid ? `wordmark-draw ${DRAW_DURATION_MS}ms linear infinite alternate` : 'none',
  }

  return (
    <svg id={id} viewBox={viewBox} className={className} aria-label={FULL}>
      <style>{sharedKeyframes}</style>
      <text
        ref={textRef}
        x="700"
        y="130"
        textAnchor="middle"
        xmlSpace="preserve"
        style={textBaseStyle}
      >
        {FULL.split('').map((char, i) => {
          const solid = SOLID_INDICES.has(i)
          const isDot = i === DOT_INDEX
          const showSolid = started && (forceSolid || solid)
          return (
            <tspan key={i} ref={isDot ? dotRef : null} style={letterStyle({ isDot, showSolid, started, revealed })}>
              {char}
            </tspan>
          )
        })}
      </text>
      {dotBox && (
        <circle
          cx={dotBox.x + dotBox.width / 2}
          cy={dotBox.y + dotBox.height / 2}
          r={7}
          fill="var(--color-neutron)"
          style={{
            opacity: started ? 1 : 0,
            transition: started ? 'opacity 0.8s ease-in 1s' : 'none',
          }}
        />
      )}
    </svg>
  )
}
