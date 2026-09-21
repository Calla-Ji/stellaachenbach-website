const WIPE_MS = 700

const keyframes = `
  @keyframes wipe-reveal-panel { from { transform: scaleY(1); } to { transform: scaleY(0); } }
  @keyframes wipe-reveal-line { from { top: 0%; } to { top: 100%; } }
`

// Plays once over the first screenful when loaded content mounts — a
// vertical take on a classic horizontal wipe. A solid panel retreats
// upward (anchored to the bottom, so its top edge sweeps down) with a
// pink-dwarf hairline riding that edge, instead of just blending the
// content in.
export function WipeReveal({ children }) {
  return (
    <div className="relative">
      {children}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden">
        <style>{keyframes}</style>
        <div
          className="absolute inset-0 bg-supernova"
          style={{ transformOrigin: 'bottom', animation: `wipe-reveal-panel ${WIPE_MS}ms ease-in-out forwards` }}
        />
        <div
          className="absolute left-0 right-0 h-px bg-pink-dwarf"
          style={{ animation: `wipe-reveal-line ${WIPE_MS}ms ease-in-out forwards` }}
        />
      </div>
    </div>
  )
}
