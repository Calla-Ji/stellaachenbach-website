import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// The "armory panel over the still-visible game HUD" treatment — Home stays
// mounted and dimmed behind this, the routed content slides up in a frosted
// glass card on top. Only used when arriving via a background-location nav
// (see App.jsx); a direct/deep link to the same route renders as a normal
// full page instead, with no overlay machinery at all.
export function GlassOverlay({ onClose, children }) {
  const navigate = useNavigate()
  const close = onClose ?? (() => navigate(-1))

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [close])

  return (
    <div className="fixed inset-0 z-40" style={{ perspective: '1600px' }}>
      <div
        className="absolute inset-0"
        style={{ animation: 'glass-overlay-fade 250ms ease-out' }}
        onClick={close}
      />
      {/* A single `vmin` inset (not independent vw/vh sizing) keeps the gap
          to the viewport edge equal on all four sides regardless of aspect
          ratio. Small enough now that it reaches past the HUD's corner
          menu labels, covering them rather than leaving them exposed
          outside the card.
          Fill started at the real Figma spec value (14% opacity), bumped to
          24% for the same reason the blur went past its own spec value below
          — legibility against the dimmed HUD behind it. Blur started at the
          equivalent Figma-to-CSS conversion (Figma 12 → ~6px, roughly half),
          also bumped, to 8px.
          The entrance tilts up out of the screen (rotateX, pivoting off its
          own bottom edge) and overshoots slightly past flat before settling
          — reads as the tablet being lifted into place and set down, rather
          than just fading up. */}
      <div
        className="absolute flex flex-col overflow-hidden rounded-xl border border-white/25 bg-white/24 shadow-2xl backdrop-blur-[8px]"
        style={{
          inset: '2vmin',
          transformOrigin: 'bottom center',
          animation: 'glass-overlay-rise 560ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Sits near the same top inset as Home's own corner HUD labels
            (top-10) showing through behind the dimmed overlay, so it reads
            as levelled with // Worlds rather than sitting lower on its own. */}
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="font-display absolute right-6 top-10 z-10 mt-1 -translate-y-full text-lg text-pink-dwarf hover:text-neutron"
        >
          ✕
        </button>
        <div className="overflow-y-auto p-2">{children}</div>
      </div>
      <style>{`
        @keyframes glass-overlay-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes glass-overlay-rise {
          from { opacity: 0; transform: translateY(72px) rotateX(-14deg) scale(0.96); }
          to { opacity: 1; transform: translateY(0) rotateX(0deg) scale(1); }
        }
      `}</style>
    </div>
  )
}
