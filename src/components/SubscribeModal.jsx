import { useEffect } from 'react'

// Same full-bleed frosted-glass backdrop as Lightbox — the iframe floats
// directly on it rather than sitting inside its own separate card.
// Paragraph's own hosted embed sets its inner copy's height dynamically
// (e.g. the post-submit "Thanks for subscribing" state is taller than the
// initial form) — `scrolling="auto"` plus a little headroom over its base
// 360px keeps that text from ever being clipped instead of hard-cropping it.
export function SubscribeModal({ onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center border border-white/25 bg-white/24 backdrop-blur-[8px]"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="font-display absolute right-6 top-6 text-2xl text-pink-dwarf transition-colors hover:text-neutron"
      >
        ✕
      </button>
      <iframe
        src="https://paragraph.com/@stellaachenbach/embed"
        width="480"
        height="400"
        scrolling="auto"
        frameBorder="0"
        className="max-w-full rounded-[4px]"
        title="Subscribe to Stella Achenbach's newsletter"
      />
    </div>
  )
}
