import { useEffect, useRef, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { About } from './components/About'
import { BlogIndex } from './components/BlogIndex'
import { BlogPost } from './components/BlogPost'
import { ConsentBanner } from './components/ConsentBanner'
import { Contact } from './components/Contact'
import { Home } from './components/Home'
import { Imprint } from './components/Imprint'
import { Nav } from './components/Nav'
import { Splash } from './components/Splash'
import { GlassOverlay } from './components/worlds/GlassOverlay'
import { InterstellarParadise } from './components/worlds/InterstellarParadise'
import { ReinaDeLaCasa } from './components/worlds/ReinaDeLaCasa'
import { SeaBreeze } from './components/worlds/SeaBreeze'
import { TravelingPatronageIndex } from './components/worlds/TravelingPatronageIndex'
import { getStoredConsent, loadGoogleAnalytics, trackPageview } from './lib/analytics'

function App() {
  const location = useLocation()
  const isFirstPageview = useRef(true)

  // A returning visitor who already granted consent shouldn't have to see
  // the banner again, or lose tracking just because they landed somewhere
  // other than Home this time — this runs once, on any route.
  useEffect(() => {
    if (getStoredConsent() === 'granted') loadGoogleAnalytics()
  }, [])

  // The `gtag('config', ...)` call inside loadGoogleAnalytics already sends
  // one automatic pageview for whichever route was live when it fired —
  // react-router never triggers a real navigation after that, so every
  // subsequent route change needs its own explicit event or GA only ever
  // sees a single page per visit.
  useEffect(() => {
    if (isFirstPageview.current) {
      isFirstPageview.current = false
      return
    }
    trackPageview(location.pathname)
  }, [location.pathname])

  // Set only when a link inside the app navigated here explicitly carrying
  // a background to restore (see HudCategoryPanel/TravelingPatronageIndex) —
  // a direct/deep link to the exact same URL has no such state, so it just
  // renders as a normal full page. Same URL, two different presentations,
  // both real routes.
  const backgroundLocation = location.state?.backgroundLocation
  const effectiveLocation = backgroundLocation ?? location
  const isHome = effectiveLocation.pathname === '/'
  const [splashDone, setSplashDone] = useState(false)
  // Fires the instant the splash is clicked — before the splash itself is
  // done fading — so Home's own reveal (circle draw-in, lines, tagline,
  // menu) starts in parallel with the letters flying, not after.
  const [entered, setEntered] = useState(false)
  const showSplash = isHome && !splashDone

  return (
    <div className={isHome ? 'flex h-screen flex-col overflow-hidden' : 'flex min-h-screen flex-col'}>
      {!isHome && <Nav />}
      <main className={isHome ? 'flex-1 overflow-hidden' : 'flex-1'}>
        <Routes location={effectiveLocation}>
          <Route path="/" element={<Home revealed={entered} />} />
          <Route path="/about" element={<About />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/worlds/traveling-patronage" element={<TravelingPatronageIndex />} />
          <Route path="/worlds/interstellar-paradise" element={<InterstellarParadise />} />
          <Route path="/worlds/sea-breeze" element={<SeaBreeze />} />
          <Route path="/worlds/la-reina-de-la-casa" element={<ReinaDeLaCasa />} />
        </Routes>
      </main>
      {showSplash && <Splash onEnter={() => setEntered(true)} onDone={() => setSplashDone(true)} />}
      {/* Glass-card overlay stays reserved for // About and // Imprint —
          // Worlds content is a real standalone page now (see
          HudCategoryPanel), room to grow into galleries/interactive pieces
          like the cloth pattern gallery without being boxed into a small
          card. */}
      {backgroundLocation && (
        <GlassOverlay>
          <Routes location={location}>
            <Route path="/about" element={<About />} />
            <Route path="/imprint" element={<Imprint />} />
          </Routes>
        </GlassOverlay>
      )}
      <ConsentBanner />
    </div>
  )
}

export default App
