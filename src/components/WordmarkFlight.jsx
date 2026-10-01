import { useLayoutEffect, useRef } from 'react'
import { WORDMARK_GLYPHS, WORDMARK_HEIGHT } from '../data/wordmarkGlyphs'
import { useHudScale } from '../lib/useHudScale'

// Flies the real brand letters, individually, from wherever the flat splash
// wordmark was sitting straight into their actual curved slots on the HUD
// arc — replacing the old "whole block flies + curved version fades in
// underneath" illusion with a real per-letter tween, now possible because
// both layouts share the same vector letterforms. Staggered left to right,
// straight linear timing — a brisk, evenly-paced "typewriter" feel, no
// randomness, no overshoot.
//
// Driven by a single requestAnimationFrame loop that writes each letter's
// transform straight to the DOM every frame, rather than 16 independent CSS
// transitions. Confirmed on a real iPhone (frame-by-frame analysis of screen
// recordings, in both Safari and Chromium) that 16 simultaneously
// transitioning SVG elements is too much compositing work for a mobile GPU
// to render intermediate frames for — the letters just snapped straight to
// their landed position regardless of paint-timing fixes (double rAF,
// forced reflow) or `will-change: transform`. A JS-driven loop sidesteps
// that: every frame it does render reflects genuinely elapsed real time, so
// even a device that only manages a handful of frames during the ~1.1s
// flight still shows real in-between motion instead of an instant jump.
//
// Mirrors Hero's WordmarkArc placement exactly (radius/targetWidth/offsetY,
// each scaled by the same useHudScale factor Hero itself applies to its
// circle) so the letters land pixel-identical to what's already sitting
// underneath once the splash fades away, at whatever size the HUD circle
// currently renders at.
const BASE_ARC_RADIUS = 268
const BASE_ARC_TARGET_WIDTH = 331
const BASE_ARC_OFFSET_Y = 6

const TOTAL_FLAT_WIDTH = WORDMARK_GLYPHS.reduce((sum, g) => sum + g.width, 0)
const BASE_ARC_SCALE = BASE_ARC_TARGET_WIDTH / TOTAL_FLAT_WIDTH
// The angle each letter sits at around the arc is a pure ratio of
// arc-length to radius — scaling both by the same hudScale factor leaves it
// unchanged, so the angles can stay real constants instead of being
// recomputed on every render; only the radial distance (arcX/arcY) and the
// glyphs' own size need to scale live with hudScale, below.
const ARC_TOTAL_ANGLE_RAD = (TOTAL_FLAT_WIDTH * BASE_ARC_SCALE) / BASE_ARC_RADIUS

const LETTER_DURATION_MS = 343
const STAGGER_MS = 53
export const WORDMARK_FLIGHT_TOTAL_MS = LETTER_DURATION_MS + STAGGER_MS * (WORDMARK_GLYPHS.length - 1)

// Pure geometry, independent of where the flight starts on screen or the
// current hudScale — safe to compute once at module load rather than per
// render.
let cursor = 0
const LETTER_ANGLES = WORDMARK_GLYPHS.map((glyph) => {
  const centerFlat = cursor + glyph.width / 2
  cursor += glyph.width
  const flatOffsetFromCenter = centerFlat - TOTAL_FLAT_WIDTH / 2

  const angleRad = (centerFlat * BASE_ARC_SCALE) / BASE_ARC_RADIUS - ARC_TOTAL_ANGLE_RAD / 2
  const angleDeg = (angleRad * 180) / Math.PI

  return { glyph, flatOffsetFromCenter, angleRad, angleDeg }
})

function letterTransform(x, y, rotate, scale, glyphWidth) {
  return `translate(${x}, ${y}) rotate(${rotate}) scale(${scale}) translate(${-glyphWidth / 2}, ${-WORDMARK_HEIGHT})`
}

// `sourceRect` is the flat wordmark's own on-screen box at the moment of
// click ({ centerX, bottom, width }) — flight starts exactly there, so
// there's no pop when this takes over from the live-text loop. `bottom`
// (not vertical center) is used as the shared baseline, since both the old
// live-text wordmark and these letters are all-caps with no descenders —
// their bounding-box floor is a much closer stand-in for the true baseline
// than the box's vertical middle would be.
export function WordmarkFlight({ sourceRect, onDone }) {
  const hudScale = useHudScale()
  const pathRefs = useRef([])

  const flatScale = sourceRect.width / TOTAL_FLAT_WIDTH
  const arcRadius = BASE_ARC_RADIUS * hudScale
  const arcScale = BASE_ARC_SCALE * hudScale
  const arcOffsetY = BASE_ARC_OFFSET_Y * hudScale

  useLayoutEffect(() => {
    // Measures the real rendered `#landing` box rather than trusting
    // window.innerWidth/innerHeight — mobile Safari's window.innerHeight
    // doesn't reliably match the actual rendered height of a 100vh/fixed
    // layout (depends on whether the address bar happens to be shown or
    // hidden right then), which previously landed the flight in the wrong
    // spot on Safari specifically while Chromium (which handles this more
    // consistently) landed correctly.
    const landingEl = document.getElementById('landing')
    const landingRect = landingEl
      ? landingEl.getBoundingClientRect()
      : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    const centerX = landingRect.left + landingRect.width / 2
    const centerY = landingRect.top + landingRect.height / 2

    const letters = LETTER_ANGLES.map(({ glyph, flatOffsetFromCenter, angleRad, angleDeg }, i) => {
      const arcX = arcRadius * Math.sin(angleRad)
      const arcY = -arcRadius * Math.cos(angleRad) + arcOffsetY
      return {
        glyph,
        startX: sourceRect.centerX + flatOffsetFromCenter * flatScale,
        startY: sourceRect.bottom,
        startRotate: 0,
        startScale: flatScale,
        endX: centerX + arcX,
        endY: centerY + arcY,
        endRotate: angleDeg,
        endScale: arcScale,
        delayMs: i * STAGGER_MS,
      }
    })

    const startTime = performance.now()
    let rafId

    function tick(now) {
      const elapsed = now - startTime
      letters.forEach((letter, i) => {
        const el = pathRefs.current[i]
        if (!el) return
        const progress = Math.min(1, Math.max(0, (elapsed - letter.delayMs) / LETTER_DURATION_MS))
        const x = letter.startX + (letter.endX - letter.startX) * progress
        const y = letter.startY + (letter.endY - letter.startY) * progress
        const rotate = letter.startRotate + (letter.endRotate - letter.startRotate) * progress
        const scale = letter.startScale + (letter.endScale - letter.startScale) * progress
        el.setAttribute('transform', letterTransform(x, y, rotate, scale, letter.glyph.width))
      })

      if (elapsed < WORDMARK_FLIGHT_TOTAL_MS) {
        rafId = requestAnimationFrame(tick)
      } else {
        onDone?.()
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // Deliberately runs once per mount, not on every hudScale/sourceRect
    // change — this component only ever mounts once per splash click and
    // the whole flight is over in ~1.1s, so reacting to a mid-flight resize
    // would just restart it oddly rather than improve anything.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <svg className="pointer-events-none fixed inset-0 z-50" width="100%" height="100%" style={{ overflow: 'visible' }}>
      {LETTER_ANGLES.map(({ glyph, flatOffsetFromCenter }, i) => (
        <path
          key={i}
          ref={(el) => {
            pathRefs.current[i] = el
          }}
          d={glyph.d}
          fill="var(--color-neutron)"
          transform={letterTransform(
            sourceRect.centerX + flatOffsetFromCenter * flatScale,
            sourceRect.bottom,
            0,
            flatScale,
            glyph.width,
          )}
        />
      ))}
    </svg>
  )
}
