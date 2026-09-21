import { useEffect, useRef, useState } from 'react'
import { AnimatedWordmark, TAGLINE_CUE_MS } from './AnimatedWordmark'
import { WordmarkFlight, WORDMARK_FLIGHT_TOTAL_MS } from './WordmarkFlight'

const FADE_DURATION_MS = 220
const TRAVEL_DURATION_MS = 650
// The old live-text wordmark's own job ends the instant the real letters
// (WordmarkFlight) take over — it just needs to get out of the way fast,
// not fly itself anymore.
const WORDMARK_HANDOFF_FADE_MS = 120
// The pink background itself gets out of the way fast, on its own short
// timer — Home's reveal (circle draw-in, lines, tagline, dots) starts the
// instant you click and shouldn't stay hidden behind the splash waiting
// for the letters/tagline to finish their own, longer flights.
const BACKGROUND_FADE_DELAY_MS = 120
// Whichever of the two independent animations (letters landing on the arc,
// tagline flying to the nav) takes longer gates the full unmount — neither
// should get yanked out of the DOM mid-flight.
const WORDMARK_AND_TAGLINE_TRAVEL_MS = Math.max(TRAVEL_DURATION_MS, WORDMARK_FLIGHT_TOTAL_MS)
// Kept at the original cue time on purpose — the outline itself keeps
// drawing much longer, but the tagline shouldn't wait for all of that.
const TAGLINE_DELAY_MS = TAGLINE_CUE_MS

// Computes the translate+scale needed to move `fromEl` on top of `toEl`,
// preserving aspect ratio (fits inside the target rect).
function flightTransform(fromEl, toEl) {
  const from = fromEl.getBoundingClientRect()
  const to = toEl.getBoundingClientRect()
  const scale = Math.min(to.width / from.width, to.height / from.height)
  const dx = to.left + to.width / 2 - (from.left + from.width / 2)
  const dy = to.top + to.height / 2 - (from.top + from.height / 2)
  return `translate(${dx}px, ${dy}px) scale(${scale})`
}

// Full-scale intro: the wordmark draws in, then the tagline animates down
// from above. Clicking the logo sends its real letters flying, individually,
// onto the circle's actual arc, and the tagline toward the nav — both
// already sitting there in their true final form, just hidden behind this
// overlay. The background fades away fast so the rest of Home's own reveal
// plays out live, rather than waiting behind a curtain for everything to
// finish.
export function Splash({ onEnter, onDone }) {
  const [taglineIn, setTaglineIn] = useState(false)
  const [flying, setFlying] = useState(false)
  const [fading, setFading] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [wordmarkSourceRect, setWordmarkSourceRect] = useState(null)
  const [taglineFlight, setTaglineFlight] = useState(null)
  const wordmarkRef = useRef(null)
  const taglineRef = useRef(null)

  useEffect(() => {
    const taglineTimer = setTimeout(() => setTaglineIn(true), TAGLINE_DELAY_MS)
    return () => clearTimeout(taglineTimer)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const handleLogoClick = () => {
    if (flying) return

    const navTagline = document.getElementById('nav-tagline')
    if (wordmarkRef.current) {
      const rect = wordmarkRef.current.getBoundingClientRect()
      setWordmarkSourceRect({ centerX: rect.left + rect.width / 2, bottom: rect.bottom, width: rect.width })
    }
    if (navTagline && taglineRef.current) {
      setTaglineFlight(flightTransform(taglineRef.current, navTagline))
    }

    setFlying(true)
    onEnter?.()
    setTimeout(() => setFading(true), BACKGROUND_FADE_DELAY_MS)
    setTimeout(() => onDone?.(), WORDMARK_AND_TAGLINE_TRAVEL_MS)
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden bg-supernova px-6"
        style={{
          opacity: fading ? 0 : 1,
          transition: `opacity ${FADE_DURATION_MS}ms ease-in`,
          pointerEvents: flying ? 'none' : 'auto',
        }}
      >
        <button
          ref={wordmarkRef}
          type="button"
          onClick={handleLogoClick}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          aria-label="Enter site"
          className="w-full max-w-6xl cursor-pointer border-0 bg-transparent p-0"
          style={{
            opacity: flying ? 0 : 1,
            transition: flying ? `opacity ${WORDMARK_HANDOFF_FADE_MS}ms ease-in` : 'none',
          }}
        >
          <AnimatedWordmark className="w-full" forceSolid={hovering} />
        </button>
        <div className="overflow-hidden py-1">
          <p
            ref={taglineRef}
            className="text-sm uppercase tracking-[0.2em] text-wormhole"
            style={{
              opacity: taglineIn || flying ? 1 : 0,
              transform: flying
                ? (taglineFlight ?? 'none')
                : taglineIn
                  ? 'translateY(0)'
                  : 'translateY(-24px)',
              transformOrigin: 'center center',
              transition: flying
                ? `transform ${TRAVEL_DURATION_MS}ms ease-in-out`
                : 'opacity 0.7s ease-out, transform 0.7s ease-out',
            }}
          >
            Design Alchemist — Tools · Worlds · Systems
          </p>
        </div>
      </div>
      {/* Rendered outside the fading background so the letters keep flying
          on their own schedule even after the pink curtain is already
          gone — the background disappearing early shouldn't truncate them. */}
      {flying && wordmarkSourceRect && <WordmarkFlight sourceRect={wordmarkSourceRect} />}
    </>
  )
}
