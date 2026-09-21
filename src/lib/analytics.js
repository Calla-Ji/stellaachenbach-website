// Google tag (gtag.js) is never present in index.html — it's injected here,
// client-side, and only once the visitor has actually granted cookie
// consent (see ConsentBanner). Declining just never calls loadGoogleAnalytics
// at all, so no Google script, cookie, or request ever happens.
const GA_MEASUREMENT_ID = 'G-DZHMFNG8XD'
export const CONSENT_STORAGE_KEY = 'cookie-consent'

export function getStoredConsent() {
  return localStorage.getItem(CONSENT_STORAGE_KEY)
}

export function setStoredConsent(value) {
  localStorage.setItem(CONSENT_STORAGE_KEY, value)
}

let loaded = false

// Idempotent — safe to call from both "consent already granted on a past
// visit" (App's own startup check) and "visitor just clicked Accept"
// (ConsentBanner) without double-injecting the script.
export function loadGoogleAnalytics() {
  if (loaded) return
  loaded = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_MEASUREMENT_ID)
}

// react-router doesn't trigger real page loads, so the automatic pageview
// from the `config` call above only ever covers whichever route was live
// when the tag first loaded — every client-side navigation after that needs
// its own explicit event, or GA only ever sees a single pageview per visit.
export function trackPageview(path) {
  if (!loaded || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path })
}
