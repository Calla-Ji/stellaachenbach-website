// A deliberate, full-screen loading beat — reuses the same circular
// hairline language as HudFrame's arc-draw (Pink Dwarf track, Neutron
// sweep, stitchhole dot) so entering a sub-page reads as part of the same
// HUD, not a generic spinner. Held open for at least MIN_VISIBLE_MS so it
// never flashes past too fast to register as intentional.
export const MIN_VISIBLE_MS = 2400

const keyframes = `
  @keyframes hud-loading-spin { to { transform: rotate(360deg); } }
`

// The bare spin graphic, sized to fit anywhere the brand's circular loading
// language is needed (full-screen page transitions here, smaller in-place
// loads like WardrobeScene's model swap) — LoadingScreen wraps this with the
// full-screen backdrop and page-level min-visible-time policy; other callers
// bring their own container and timing.
export function HudSpinner({ size = 140 }) {
  const r = 50
  const cx = 70
  const cy = 70
  const sweepDeg = 80
  const start = -90
  const end = start + sweepDeg
  const point = (deg) => {
    const rad = (deg * Math.PI) / 180
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  const [sx, sy] = point(start)
  const [ex, ey] = point(end)

  return (
    <svg width={size} height={size} viewBox="0 0 140 140">
      <style>{keyframes}</style>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-pink-dwarf)" strokeOpacity="0.4" strokeWidth="1" />
      <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'hud-loading-spin 1.1s linear infinite' }}>
        <path
          d={`M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`}
          fill="none"
          stroke="var(--color-neutron)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <circle cx={ex} cy={ey} r="3.5" fill="var(--color-neutron)" />
      </g>
    </svg>
  )
}

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-supernova">
      <HudSpinner size={140} />
    </div>
  )
}
