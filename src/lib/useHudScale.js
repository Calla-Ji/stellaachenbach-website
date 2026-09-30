import { useEffect, useState } from 'react'

// Shared between Hero's HUD circle (the circle/NOVA/wordmark/tagline group)
// and Splash's WordmarkFlight landing math — both need the exact same scale
// factor at the exact same breakpoints, or the flight's landing spot drifts
// from the real wordmark's actual on-screen size/position (see
// WordmarkFlight.jsx for the bug this fixes).
const HUD_SCALE_BREAKPOINTS = [
  { minWidth: 1024, scale: 1 },
  { minWidth: 768, scale: 0.85 },
  { minWidth: 640, scale: 0.68 },
  { minWidth: 0, scale: 0.5 },
]

export function hudScaleForWidth(width) {
  return HUD_SCALE_BREAKPOINTS.find((bp) => width >= bp.minWidth).scale
}

export function useHudScale() {
  const [scale, setScale] = useState(() => hudScaleForWidth(window.innerWidth))

  useEffect(() => {
    const handleResize = () => setScale(hudScaleForWidth(window.innerWidth))
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return scale
}
