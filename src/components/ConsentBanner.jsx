import { useEffect, useState } from 'react'
import { getStoredConsent, loadGoogleAnalytics, setStoredConsent } from '../lib/analytics'

// Mounted once at the App root so it shows on whichever page a visitor
// actually lands on first, not just Home — before any decision has been
// stored. z-[60] sits above Splash's own z-50 curtain so it's visible
// immediately on landing there too, not just after clicking through to
// Hero. Declining never loads Google's script at all; there's nothing to
// "undo" later.
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!getStoredConsent()) setVisible(true)
  }, [])

  function accept() {
    setStoredConsent('granted')
    loadGoogleAnalytics()
    setVisible(false)
  }

  function decline() {
    setStoredConsent('denied')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-4">
      <div className="flex w-full max-w-2xl flex-col gap-3 rounded-[8px] border border-white/25 bg-white/24 p-4 shadow-2xl backdrop-blur-[8px] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-wormhole">
          <span className="text-pink-dwarf">// Cookies</span> — this site uses a small amount of anonymous
          analytics to understand how it's used. Nothing loads unless you say yes.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="font-display rounded-[4px] border border-neutron px-4 py-1.5 text-xs uppercase tracking-[0.1em] text-neutron transition-colors hover:bg-neutron hover:text-supernova"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="font-display rounded-[4px] border border-neutron bg-neutron px-4 py-1.5 text-xs uppercase tracking-[0.1em] text-supernova transition-colors hover:bg-supernova hover:text-neutron"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
