import { useState } from 'react'

// Whether this device supports real :hover (desktop mouse/trackpad) as
// opposed to touch-primary (phones/tablets). Touch devices fire a synthetic
// mouseenter on the first tap of anything with a hover handler, so a
// component that mixes hover-driven open state with an onClick toggle on
// the same element ends up needing two taps there — the first tap's
// synthetic mouseenter opens it, and the click that follows on that same
// tap immediately toggles it back closed. Checked once on mount — this
// genuinely changes only if someone plugs in/unplugs a mouse, rare enough
// not to warrant a live-updating listener.
export function useHasHover() {
  const [hasHover] = useState(() => window.matchMedia('(hover: hover)').matches)
  return hasHover
}
