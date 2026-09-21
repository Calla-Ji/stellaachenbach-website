import { useEffect, useState } from 'react'
import { WORDMARK_GLYPHS, WORDMARK_HEIGHT } from '../data/wordmarkGlyphs'

// Flies the real brand letters, individually, from wherever the flat splash
// wordmark was sitting straight into their actual curved slots on the HUD
// arc — replacing the old "whole block flies + curved version fades in
// underneath" illusion with a real per-letter tween, now possible because
// both layouts share the same vector letterforms. Staggered left to right,
// straight linear timing — a brisk, evenly-paced "typewriter" feel, no
// randomness, no overshoot.
//
// Mirrors Hero's WordmarkArc placement exactly (radius/targetWidth/
// offsetY) so the letters land pixel-identical to what's already sitting
// underneath once the splash fades away.
const ARC_RADIUS = 268
const ARC_TARGET_WIDTH = 331
const ARC_OFFSET_Y = 6

const TOTAL_FLAT_WIDTH = WORDMARK_GLYPHS.reduce((sum, g) => sum + g.width, 0)
const ARC_SCALE = ARC_TARGET_WIDTH / TOTAL_FLAT_WIDTH
const ARC_TOTAL_ANGLE_RAD = (TOTAL_FLAT_WIDTH * ARC_SCALE) / ARC_RADIUS

const LETTER_DURATION_MS = 343
const STAGGER_MS = 53
export const WORDMARK_FLIGHT_TOTAL_MS = LETTER_DURATION_MS + STAGGER_MS * (WORDMARK_GLYPHS.length - 1)

// Pure geometry, independent of where the flight starts on screen — safe to
// compute once at module load rather than per render.
let cursor = 0
const LETTER_PLACEMENT = WORDMARK_GLYPHS.map((glyph) => {
  const centerFlat = cursor + glyph.width / 2
  cursor += glyph.width
  const flatOffsetFromCenter = centerFlat - TOTAL_FLAT_WIDTH / 2

  const angleRad = (centerFlat * ARC_SCALE) / ARC_RADIUS - ARC_TOTAL_ANGLE_RAD / 2
  const angleDeg = (angleRad * 180) / Math.PI
  const arcX = ARC_RADIUS * Math.sin(angleRad)
  const arcY = -ARC_RADIUS * Math.cos(angleRad) + ARC_OFFSET_Y

  return { glyph, flatOffsetFromCenter, arcX, arcY, angleDeg }
})

// `sourceRect` is the flat wordmark's own on-screen box at the moment of
// click ({ centerX, bottom, width }) — flight starts exactly there, so
// there's no pop when this takes over from the live-text loop. `bottom`
// (not vertical center) is used as the shared baseline, since both the old
// live-text wordmark and these letters are all-caps with no descenders —
// their bounding-box floor is a much closer stand-in for the true baseline
// than the box's vertical middle would be.
export function WordmarkFlight({ sourceRect, onDone }) {
  const [landed, setLanded] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setLanded(true))
    const timer = setTimeout(() => onDone?.(), WORDMARK_FLIGHT_TOTAL_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [onDone])

  const flatScale = sourceRect.width / TOTAL_FLAT_WIDTH
  const viewportCenterX = window.innerWidth / 2
  const viewportCenterY = window.innerHeight / 2

  return (
    <svg
      className="pointer-events-none fixed inset-0 z-50"
      width="100%"
      height="100%"
      viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
      style={{ overflow: 'visible' }}
    >
      {LETTER_PLACEMENT.map(({ glyph, flatOffsetFromCenter, arcX, arcY, angleDeg }, i) => {
        const x = landed ? viewportCenterX + arcX : sourceRect.centerX + flatOffsetFromCenter * flatScale
        const y = landed ? viewportCenterY + arcY : sourceRect.bottom
        const rotate = landed ? angleDeg : 0
        const scale = landed ? ARC_SCALE : flatScale
        return (
          <path
            key={i}
            d={glyph.d}
            fill="var(--color-neutron)"
            transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale}) translate(${-glyph.width / 2}, ${-WORDMARK_HEIGHT})`}
            style={{ transition: `transform ${LETTER_DURATION_MS}ms linear ${i * STAGGER_MS}ms` }}
          />
        )
      })}
    </svg>
  )
}
