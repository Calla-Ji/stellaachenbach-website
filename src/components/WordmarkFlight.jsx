import { useLayoutEffect, useRef, useState } from 'react'
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
// Mirrors Hero's WordmarkArc placement exactly (radius/targetWidth/offsetY,
// each scaled by the same useHudScale factor Hero itself applies to its
// circle) so the letters land pixel-identical to what's already sitting
// underneath once the splash fades away, at whatever size the HUD circle
// currently renders at — without this, the flight lands at the old
// desktop-only radius while the real (possibly shrunk) wordmark sits
// somewhere else entirely.
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

// `sourceRect` is the flat wordmark's own on-screen box at the moment of
// click ({ centerX, bottom, width }) — flight starts exactly there, so
// there's no pop when this takes over from the live-text loop. `bottom`
// (not vertical center) is used as the shared baseline, since both the old
// live-text wordmark and these letters are all-caps with no descenders —
// their bounding-box floor is a much closer stand-in for the true baseline
// than the box's vertical middle would be.
export function WordmarkFlight({ sourceRect, onDone }) {
  const [landed, setLanded] = useState(false)
  // Landing target and viewBox default to window.innerWidth/Height until
  // measured, then get replaced with the real rendered rects below — on
  // mobile Safari, `window.innerHeight` doesn't reliably match the actual
  // rendered height of a `100vh`/`fixed inset-0` layout (the well-known
  // mobile-Safari-vs-100vh mismatch, driven by the address bar showing or
  // hiding), so computing the landing center from it can be visibly off —
  // measuring the real elements sidesteps that entirely, and matches why
  // Chromium (which handles this viewport case more consistently) landed
  // in the right spot while Safari didn't, even though both dropped the
  // per-letter animation frames the same way.
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [center, setCenter] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
  const hudScale = useHudScale()
  const rootRef = useRef(null)

  useLayoutEffect(() => {
    if (rootRef.current) {
      const svgRect = rootRef.current.getBoundingClientRect()
      setViewport({ width: svgRect.width, height: svgRect.height })
    }
    const landingEl = document.getElementById('landing')
    if (landingEl) {
      const landingRect = landingEl.getBoundingClientRect()
      setCenter({ x: landingRect.left + landingRect.width / 2, y: landingRect.top + landingRect.height / 2 })
    }
    // A double rAF alone (the usual fix for this) still wasn't enough on a
    // real iOS Simulator/device — confirmed by disabling NOVA entirely and
    // recording the actual device screen: the HUD circle's own draw-in
    // (driven by a plain prop, no rAF at all) animated fine right next to
    // these letters snapping instantly, so it's specifically about how this
    // freshly-mounted overlay's first paint gets scheduled on that engine,
    // not about anything else competing for the main thread. Forcing a
    // synchronous layout read (a plain rAF races the engine's own paint
    // scheduling, which apparently isn't reliable here; reading a layout
    // property forces the browser to actually flush and compute the current
    // — flat, unlanded — styles right now, giving the transition below a
    // real "before" state no matter how any engine schedules its paints).
    if (rootRef.current) void rootRef.current.getBoundingClientRect()
    const raf = requestAnimationFrame(() => setLanded(true))
    const timer = setTimeout(() => onDone?.(), WORDMARK_FLIGHT_TOTAL_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [onDone])

  const flatScale = sourceRect.width / TOTAL_FLAT_WIDTH
  const arcRadius = BASE_ARC_RADIUS * hudScale
  const arcScale = BASE_ARC_SCALE * hudScale
  const arcOffsetY = BASE_ARC_OFFSET_Y * hudScale

  return (
    <svg
      ref={rootRef}
      className="pointer-events-none fixed inset-0 z-50"
      width="100%"
      height="100%"
      viewBox={`0 0 ${viewport.width} ${viewport.height}`}
      style={{ overflow: 'visible' }}
    >
      {LETTER_ANGLES.map(({ glyph, flatOffsetFromCenter, angleRad, angleDeg }, i) => {
        const arcX = arcRadius * Math.sin(angleRad)
        const arcY = -arcRadius * Math.cos(angleRad) + arcOffsetY
        const x = landed ? center.x + arcX : sourceRect.centerX + flatOffsetFromCenter * flatScale
        const y = landed ? center.y + arcY : sourceRect.bottom
        const rotate = landed ? angleDeg : 0
        const scale = landed ? arcScale : flatScale
        return (
          <path
            key={i}
            d={glyph.d}
            fill="var(--color-neutron)"
            transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale}) translate(${-glyph.width / 2}, ${-WORDMARK_HEIGHT})`}
            style={{
              transition: `transform ${LETTER_DURATION_MS}ms linear ${i * STAGGER_MS}ms`,
              // Pre-promotes each letter to its own GPU layer so the browser
              // can move it via the compositor instead of repainting on the
              // main thread every frame — 16 simultaneously-transitioning
              // elements is enough compositing work that mobile GPUs can
              // drop every intermediate frame without this, making a real,
              // correctly-configured transition look like an instant jump
              // (confirmed on a real iPhone in both Safari and Chromium —
              // desktop testing never reproduced it, only real mobile
              // hardware showed the dropped frames).
              willChange: 'transform',
            }}
          />
        )
      })}
    </svg>
  )
}
