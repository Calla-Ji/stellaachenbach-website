import { useEffect } from 'react'

// Generic full-screen media viewer — click the backdrop, press Escape, or
// hit the close button to dismiss. Not tied to the mood board specifically,
// so any other "click to enlarge" spot can reuse this as-is. `type="video"`
// renders a real <video> with controls (and sound, unlike the muted inline
// card) instead of an <img>. `description`, when set, renders as a short
// caption under the media — omit it (or pass '') to show nothing.
export function Lightbox({ src, alt, type = 'image', description, onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const mediaClassName =
    'max-h-[85vh] max-w-[90vw] rounded-[4px] object-contain shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]'

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
      <div className="flex max-w-[90vw] flex-col items-center gap-3" onClick={(event) => event.stopPropagation()}>
        {type === 'video' ? (
          <video src={src} controls autoPlay loop playsInline className={mediaClassName} />
        ) : (
          <img src={src} alt={alt} className={mediaClassName} />
        )}
        {description && <p className="max-w-[70vw] text-center text-sm text-neutron">{description}</p>}
      </div>
    </div>
  )
}
