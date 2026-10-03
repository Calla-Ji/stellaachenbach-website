import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useHasHover } from '../lib/useHasHover'

// The Starfield-style circular readout frame — built from our own hairline
// stroke language (Neutron on Supernova), not a borrowed sci-fi skin.
// The circle is interrupted twice — at the top for the wordmark, at the
// bottom for the tagline — leaving a left and a right arc, each still
// carrying one stitchhole where it crosses the horizontal line. Both gaps
// are deliberately smaller than their text's own arc container, since the
// text doesn't stretch to fill that whole span; this brings the line in
// close without actually touching a letter.
// The two stitchholes double as menu items — About on the left, Imprint on
// the right — each revealing its "// Label" beside the dot on hover.
const DOT_LINKS = {
  180: { label: 'About', path: '/about' },
  0: { label: 'Imprint', path: '/imprint' },
}

// How long the arc draw-in itself takes — shared with the dot-reveal delay
// calculation below so the stitchholes pop up exactly when the drawing line
// reaches them, not on a guessed fixed timer.
const ARC_DRAW_MS = 1188

// A slow breathing pulse on the resting (unhovered) dot — a plain static
// stitchhole doesn't read as clickable, so this hints there's more here.
// Paired with a radar-style ping ring (below) since the breathing alone was
// too subtle for new visitors to register as interactive.
const dotPulseKeyframes = `
  @keyframes hud-dot-pulse {
    0%, 100% { r: 5px; }
    50% { r: 7px; }
  }
`

// A soft radial-gradient glow blooming outward from the resting dot and
// fading as it grows — reads as clickable at a glance rather than requiring
// someone to notice a few pixels of radius wobble on the dot itself.
const dotPingKeyframes = `
  @keyframes hud-dot-ping {
    0% { r: 5px; opacity: 1; }
    100% { r: 28px; opacity: 0; }
  }
`

// How long each periodic auto-reveal blink stays visible, and the full
// cycle (gap + blink) between them.
const AUTO_REVEAL_VISIBLE_MS = 2200
const AUTO_REVEAL_CYCLE_MS = 9000

// Touch devices never fire hover, so the "// About" / "// Imprint" labels
// (otherwise only shown on hover) would never be discoverable at all on
// mobile — nothing hints at what the pulsing dot even is. Rather than
// permanently showing the label (which was tried and didn't feel right),
// both dots periodically blink their label on their own, reusing the exact
// same hover-reveal styling/transitions on a timer instead of a mouse
// event. Skipped entirely on devices that do support hover, since the
// real hover reveal already covers the use case there.
function useAutoRevealDots(enabled) {
  const [autoRevealed, setAutoRevealed] = useState(false)
  const hasHover = useHasHover()

  useEffect(() => {
    if (!enabled || hasHover) return

    let hideTimeout
    const interval = setInterval(() => {
      setAutoRevealed(true)
      hideTimeout = setTimeout(() => setAutoRevealed(false), AUTO_REVEAL_VISIBLE_MS)
    }, AUTO_REVEAL_CYCLE_MS)

    return () => {
      clearInterval(interval)
      clearTimeout(hideTimeout)
    }
  }, [enabled, hasHover])

  return autoRevealed
}

// The label sits right on top of the full-width horizontal line, so its
// backing patch — sized to the label's own measured ink, not a guessed
// box — has to actually paint over that line rather than just fading it,
// since the line and the dot's hover state live in separate components.
function HudDotLink({ dcx, dcy, onLeftSide, link, hovered, revealed, revealDelayMs, onEnter, onLeave, onClick, centerX, lineGapHalfWidth }) {
  const textRef = useRef(null)
  const [box, setBox] = useState(null)

  useEffect(() => {
    // Waits for the real "AG Stella" font to finish loading before
    // measuring — measuring against the fallback font's metrics (which can
    // differ in width) leaves this sized for text that's about to reflow,
    // so the backing patch doesn't fully cover the line once the real font
    // swaps in.
    let cancelled = false
    document.fonts.ready.then(() => {
      if (!cancelled && textRef.current) setBox(textRef.current.getBBox())
    })
    return () => {
      cancelled = true
    }
  }, [link.label])

  const pad = 3
  // The label starts 16 units away from the dot (see the <text> below), so
  // a patch sized to just the text's own bbox leaves two real gaps in the
  // horizontal line uncovered: one between the dot and where the text
  // starts (fixed by extending the near edge back to the dot's own center
  // — safe to overlap it, since the dot is drawn after this rect and
  // always renders on top), and a second, easy-to-miss one on the FAR
  // side — Hero's own line is only actually absent inside a gap centered
  // on the circle (`lineGapHalfWidth` from center; see Hero.jsx's
  // LINE_GAP_BASE_WIDTH), which sits well past where a short label like
  // "About" ends, leaving a stray stretch of real line visible between the
  // end of the word and where the line genuinely stops existing. Extending
  // the far edge out to that same boundary (never *in* past the text
  // itself, via max/min) closes that too, regardless of label length.
  const farEdgeX = onLeftSide ? centerX - lineGapHalfWidth : centerX + lineGapHalfWidth
  const rectX = box ? (onLeftSide ? dcx : Math.min(box.x - pad, farEdgeX)) : null
  const rectWidth = box
    ? onLeftSide
      ? Math.max(box.x + box.width + pad, farEdgeX) - dcx
      : dcx - rectX
    : null

  return (
    <g style={{ pointerEvents: 'auto', cursor: 'pointer' }} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={onClick}>
      {/* Generous invisible hit area — the dot itself stays small. */}
      <circle cx={dcx} cy={dcy} r="16" fill="transparent" />
      {box && (
        <rect
          x={rectX}
          y={box.y - pad}
          width={rectWidth}
          height={box.height + pad * 2}
          fill="var(--color-supernova)"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 200ms ease' }}
        />
      )}
      <circle
        cx={dcx}
        cy={dcy}
        r="5"
        fill="url(#hud-dot-glow)"
        pointerEvents="none"
        style={{
          opacity: 0,
          animation:
            revealed && !hovered ? `hud-dot-ping 1.8s ease-in-out ${revealDelayMs}ms infinite` : 'none',
        }}
      />
      <circle
        cx={dcx}
        cy={dcy}
        r="5"
        fill={hovered ? 'var(--color-pink-dwarf)' : 'var(--color-neutron)'}
        style={{
          opacity: revealed ? 1 : 0,
          transition: `fill 200ms ease, r 200ms ease, opacity 330ms ease-out ${revealDelayMs}ms`,
          animation: hovered ? 'none' : 'hud-dot-pulse 1.8s ease-in-out infinite',
        }}
      />
      {/* Revealed toward the circle's interior rather than out past its
          edge — plain label, no "// " prefix, since that convention reads
          fine as a lone quadrant-menu header but felt crowded this close
          to the dot itself. */}
      <text
        ref={textRef}
        x={onLeftSide ? dcx + 16 : dcx - 16}
        y={dcy}
        textAnchor={onLeftSide ? 'start' : 'end'}
        dominantBaseline="middle"
        style={{
          fontFamily: "'AG Stella', sans-serif",
          fontSize: 15,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fill: 'var(--color-neutron)',
          opacity: hovered ? 1 : 0,
          transform: `translateX(${hovered ? 0 : onLeftSide ? -6 : 6}px)`,
          transition: 'opacity 200ms ease, transform 200ms ease',
        }}
      >
        {link.label}
      </text>
    </g>
  )
}

export function HudFrame({ size = 560, gapAngleDeg = 80, bottomGapAngleDeg = gapAngleDeg, revealed = true, strokeWidth = 1 }) {
  const [hoveredAngle, setHoveredAngle] = useState(null)
  const autoRevealed = useAutoRevealDots(revealed)
  const navigate = useNavigate()
  const location = useLocation()
  const r = size / 2 - 2
  const cx = size / 2
  const cy = size / 2
  // Half-width of the horizontal line's own center gap, in this same
  // unscaled coordinate space — must stay in sync with Hero.jsx's
  // LINE_GAP_BASE_WIDTH (336, i.e. 60% of the circle's 560px diameter at
  // 1x), since the dot labels' backing patches (below) need to know
  // exactly where that line actually stops existing to fully cover it.
  const lineGapHalfWidth = size * 0.3
  // The two stitchholes sit exactly where the circle crosses the
  // horizontal line (its left/right points, 180°/0° in this convention).
  const dotAngles = [180, 0]

  const point = (deg) => {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }

  const half = gapAngleDeg / 2
  const bottomHalf = bottomGapAngleDeg / 2
  // 270° = top gap (wordmark), 90° = bottom gap (tagline) — the bottom gap
  // has its own (usually wider) angle, since the tagline's real string is
  // longer than the wordmark and needs more room to sit inside it. Each
  // remaining arc runs from just past one gap to just before the next,
  // through the side point (0° right / 180° left) in between.
  const [rightStartX, rightStartY] = point(270 + half)
  const [rightEndX, rightEndY] = point(90 - bottomHalf)
  const [leftStartX, leftStartY] = point(90 + bottomHalf)
  const [leftEndX, leftEndY] = point(270 - half)
  // Both arcs' `d` starts near the top gap and sweeps down — the right arc
  // through 0° (right dot), the left arc (reversed from the left/right
  // start/end points above, sweep flag flipped to match) through 180° (left
  // dot) — so the stroke-dashoffset draw-in reads top-to-bottom on both
  // sides, not bottom-to-top on the left.
  const rightArcD = `M ${rightStartX} ${rightStartY} A ${r} ${r} 0 0 1 ${rightEndX} ${rightEndY}`
  const leftArcD = `M ${leftEndX} ${leftEndY} A ${r} ${r} 0 0 0 ${leftStartX} ${leftStartY}`
  // Both remaining arcs are always the same span by construction (the full
  // circle minus the two gaps, split evenly) — exact, no DOM measurement
  // needed to drive the draw-in.
  const arcSpanDeg = 180 - half - bottomHalf
  const arcLength = (r * arcSpanDeg * Math.PI) / 180
  const arcDrawStyle = {
    strokeDasharray: arcLength,
    strokeDashoffset: revealed ? 0 : arcLength,
    transition: `stroke-dashoffset ${ARC_DRAW_MS}ms ease-out`,
  }
  // Both arcs start their draw the same angular distance from the top gap,
  // so the fraction of the draw that's elapsed by the time the line reaches
  // either side dot is identical — drive the dot's own reveal off that same
  // fraction of ARC_DRAW_MS instead of a guessed fixed delay.
  const dotRevealDelayMs = ((90 - half) / arcSpanDeg) * ARC_DRAW_MS

  return (
    <svg
      width={size}
      height={size}
      className="pointer-events-none absolute"
      style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', overflow: 'visible' }}
    >
      <style>{dotPulseKeyframes}{dotPingKeyframes}</style>
      <defs>
        <radialGradient id="hud-dot-glow">
          <stop offset="0%" stopColor="var(--color-pink-dwarf)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--color-pink-dwarf)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path id="hud-circle-right" d={rightArcD} fill="none" stroke="var(--color-neutron)" strokeWidth={strokeWidth} style={arcDrawStyle} />
      <path id="hud-circle-left" d={leftArcD} fill="none" stroke="var(--color-neutron)" strokeWidth={strokeWidth} style={arcDrawStyle} />
      {dotAngles.map((angle) => {
        const rad = (angle * Math.PI) / 180
        const dcx = cx + r * Math.cos(rad)
        const dcy = cy + r * Math.sin(rad)
        const link = DOT_LINKS[angle]

        return (
          <HudDotLink
            key={angle}
            dcx={dcx}
            dcy={dcy}
            onLeftSide={angle === 180}
            link={link}
            hovered={hoveredAngle === angle || autoRevealed}
            revealed={revealed}
            revealDelayMs={dotRevealDelayMs}
            onEnter={() => setHoveredAngle(angle)}
            onLeave={() => setHoveredAngle(null)}
            onClick={() => navigate(link.path, { state: { backgroundLocation: location } })}
            centerX={cx}
            lineGapHalfWidth={lineGapHalfWidth}
          />
        )
      })}
    </svg>
  )
}
