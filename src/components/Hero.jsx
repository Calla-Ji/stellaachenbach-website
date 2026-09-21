import { useEffect, useState } from 'react'
import { HUD_MENU_ITEMS } from '../data/hudMenu'
import { ArcText } from './ArcText'
import { HudCategoryPanel } from './HudCategoryPanel'
import { HudFrame } from './HudFrame'
import { NovaScene } from './NovaScene'
import { WordmarkArc } from './WordmarkArc'
import { WORDMARK_FLIGHT_TOTAL_MS } from './WordmarkFlight'

const [topLeft, topRight, bottomLeft, bottomRight] = HUD_MENU_ITEMS

// Timing for the post-splash-click reveal. Group A (line, tagline — the
// circle arcs and dots time themselves inside HudFrame) runs in parallel
// with the letters flying in from the splash, not strictly synced frame for
// frame but overlapping. Group B (the four menu panels) waits until group A
// and the letters have essentially landed before sliding in.
const LINE_DRAW_MS = 1056
const TAGLINE_REVEAL_DELAY_MS = 462
const TAGLINE_REVEAL_MS = 660
// Given an extra deliberate bump on top of the general slowdown, so there's
// a clear pause after the letters/circle/lines/tagline settle before the
// menu panels start sliding in — not just a proportionally-scaled gap.
const MENU_REVEAL_DELAY_MS = 1700
const MENU_REVEAL_MS = 528

export function Hero({ revealed = true }) {
  const [novaState, setNovaState] = useState('greeting')

  // Gated on `revealed`, not mount — NOVA itself stays hidden until well
  // after click, so its greeting pose shouldn't already be spent by the
  // time it's actually visible.
  useEffect(() => {
    if (!revealed) return
    const timeout = setTimeout(() => setNovaState('idle'), 2200)
    return () => clearTimeout(timeout)
  }, [revealed])

  // Straight horizontal slide only — left-side panels come in from the
  // left, right-side panels from the right, no vertical component at all.
  const menuStyle = (dx) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translate(0, 0)' : `translate(${dx}px, 0)`,
    transition: `opacity ${MENU_REVEAL_MS}ms ease-out ${MENU_REVEAL_DELAY_MS}ms, transform ${MENU_REVEAL_MS}ms ease-out ${MENU_REVEAL_DELAY_MS}ms`,
  })

  return (
    <section id="landing" className="relative h-full px-10 py-8">
      <div className="absolute left-10 top-10" style={menuStyle(-60)}>
        <HudCategoryPanel label={topLeft.label} links={topLeft.links} align="left" />
      </div>
      <div className="absolute right-10 top-10" style={menuStyle(60)}>
        <HudCategoryPanel label={topRight.label} links={topRight.links} align="right" />
      </div>
      <div className="absolute bottom-10 left-10" style={menuStyle(-60)}>
        <HudCategoryPanel label={bottomLeft.label} links={bottomLeft.links} align="left" direction="up" />
      </div>
      <div className="absolute bottom-10 right-10" style={menuStyle(60)}>
        <HudCategoryPanel label={bottomRight.label} links={bottomRight.links} align="right" direction="up" />
      </div>

      {/* Interrupted horizontal line, Starfield-style — full width edge to
          edge, broken only by a gap that lets each segment run 40% of the
          circle's radius into the circle itself. Each half draws in from
          the outer screen edge inward toward the gap. */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center">
        <span
          className="h-px flex-1 bg-neutron"
          style={{
            transformOrigin: 'left',
            transform: revealed ? 'scaleX(1)' : 'scaleX(0)',
            transition: `transform ${LINE_DRAW_MS}ms ease-out`,
          }}
        />
        <div className="shrink-0" style={{ width: 336 }} />
        <span
          className="h-px flex-1 bg-neutron"
          style={{
            transformOrigin: 'right',
            transform: revealed ? 'scaleX(1)' : 'scaleX(0)',
            transition: `transform ${LINE_DRAW_MS}ms ease-out`,
          }}
        />
      </div>

      <div className="flex h-full flex-col items-center justify-center">
        <div className="relative flex items-center justify-center">
          <HudFrame size={560} bottomGapAngleDeg={90} revealed={revealed} />
          <NovaScene state={novaState} size={504} revealed={revealed} />
          {/* Real brand letterforms bent along the circle's own (now
              interrupted) line, replacing the old live-text textPath
              version — same radius/size footprint as before. This is the
              landing target the splash's WordmarkFlight flies its letters
              onto, so it has to stay invisible until that flight actually
              finishes — otherwise it just sits here fully formed the whole
              time, visible underneath (and duplicating) the flying letters
              the moment the background curtain clears. */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 w-[596px] -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: revealed ? 1 : 0,
              transition: `opacity 0ms linear ${WORDMARK_FLIGHT_TOTAL_MS}ms`,
            }}
          >
            <WordmarkArc id="hud-wordmark" radius={268} offsetY={6} className="w-full" />
          </div>
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 w-[596px] -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: revealed ? 1 : 0,
              transform: revealed ? 'scale(1)' : 'scale(0.9)',
              transformOrigin: 'center',
              transition: `opacity ${TAGLINE_REVEAL_MS}ms ease-out ${TAGLINE_REVEAL_DELAY_MS}ms, transform ${TAGLINE_REVEAL_MS}ms ease-out ${TAGLINE_REVEAL_DELAY_MS}ms`,
            }}
          >
            <ArcText
              text="Design Alchemist — Tools · Worlds · Systems"
              radius={284}
              pad={14}
              totalAngleDeg={130}
              position="bottom"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
