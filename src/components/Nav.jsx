import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { listBlogPosts } from '../lib/paragraphApi'
import { splitCategoryFromTitle } from '../lib/postTitle'
import { SubscribeModal } from './SubscribeModal'

// Only ever auto-opens once per browser — a returning visitor has already
// seen the pitch, so re-showing it on every visit would just be annoying.
const SUBSCRIBE_POPUP_SEEN_KEY = 'blog-subscribe-popup-seen'
// Small delay so the pop-up appears once the page has actually rendered,
// not as the very first thing a visitor sees.
const SUBSCRIBE_POPUP_DELAY_MS = 1500

// Same glassmorphic HUD chrome as HudPanel — real backdrop-blur, soft
// elevation — rolled out from a plain <select>, which can't be styled or
// animated to match (the arrow and popup are OS-drawn, not CSS-controllable).
// Portaled to <body>: the header itself has backdrop-filter, which
// establishes a "backdrop root" for its whole subtree — a nested
// backdrop-filter inside it can only sample that already-flattened layer,
// not the real page, and renders blurless. Escaping via portal + fixed
// coords (measured off the button) lets this panel's own blur sample the
// actual page behind it.
function TopicDropdown({ topics, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState(null)
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(event) {
      const insideButton = buttonRef.current?.contains(event.target)
      const insidePanel = panelRef.current?.contains(event.target)
      if (!insideButton && !insidePanel) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function toggleOpen() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCoords({ left: rect.left, top: rect.bottom + 8, width: rect.width })
    }
    setOpen((o) => !o)
  }

  const options = ['', ...topics]

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex w-32 items-center justify-between gap-1.5 rounded-[4px] border border-neutron/20 bg-supernova/60 px-3 py-1.5 text-xs uppercase tracking-[0.1em] text-neutron focus:border-neutron/40 focus:outline-none"
      >
        {value || 'All Topics'}
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          className="shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease-out' }}
        >
          <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {coords &&
        createPortal(
          // Clip/reveal animation lives on this wrapper, not the glass panel
          // itself — animating max-height + overflow-hidden on the same
          // element as backdrop-filter also breaks backdrop sampling.
          <div
            ref={panelRef}
            className="fixed z-40 overflow-hidden"
            style={{
              left: coords.left,
              top: coords.top,
              width: coords.width,
              maxHeight: open ? '240px' : '0px',
              opacity: open ? 1 : 0,
              transition: 'max-height 280ms ease-out, opacity 200ms ease-out',
            }}
          >
            <div className="rounded-sm border border-white/25 bg-white/24 shadow-[0_10px_30px_-10px_rgba(19,23,24,0.25)] backdrop-blur-[8px]">
              <div className="flex flex-col divide-y divide-neutron/10 py-1">
                {options.map((item) => (
                  <button
                    key={item || 'all'}
                    type="button"
                    onClick={() => {
                      onChange(item)
                      setOpen(false)
                    }}
                    className={`px-3 py-1.5 text-left text-[11px] uppercase tracking-[0.1em] transition-colors hover:text-neutron ${
                      item === value ? 'text-neutron' : 'text-wormhole'
                    }`}
                  >
                    {item || 'All Topics'}
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

// Standalone pages (everything except Home) get a plain text way back, not
// the animated wordmark or tagline — those are Home's own identity, not a
// persistent site-wide logo bar. On an individual post (opened in its own
// tab via Read Now), that way back goes to the blog index, not Home — and
// the topic filter only makes sense on the index itself, not a single post.
export function Nav() {
  const location = useLocation()
  const isBlogIndex = location.pathname === '/blog'
  const isBlogPost = location.pathname.startsWith('/blog/')
  const [searchParams, setSearchParams] = useSearchParams()
  const [topics, setTopics] = useState([])
  const [subscribeOpen, setSubscribeOpen] = useState(false)

  useEffect(() => {
    if (!isBlogIndex) return
    let popupTimeout
    listBlogPosts()
      .then((items) => {
        const unique = [...new Set(items.map((post) => splitCategoryFromTitle(post.title).category).filter(Boolean))]
        setTopics(unique)
        if (!localStorage.getItem(SUBSCRIBE_POPUP_SEEN_KEY)) {
          popupTimeout = setTimeout(() => {
            setSubscribeOpen(true)
            localStorage.setItem(SUBSCRIBE_POPUP_SEEN_KEY, '1')
          }, SUBSCRIBE_POPUP_DELAY_MS)
        }
      })
      .catch(() => {})
    return () => clearTimeout(popupTimeout)
  }, [isBlogIndex])

  const topic = searchParams.get('topic') || ''

  function setTopic(value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set('topic', value)
    else next.delete('topic')
    setSearchParams(next, { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/25 bg-white/24 backdrop-blur-[8px]">
      <div className="flex w-full items-center justify-between gap-6 px-10 py-4">
        <NavLink
          to={isBlogPost ? '/blog' : '/'}
          className="font-display shrink-0 text-base font-medium uppercase tracking-[0.2em] text-pink-dwarf transition-colors hover:text-neutron"
        >
          {isBlogPost ? '// Back' : '// Home'}
        </NavLink>

        {isBlogIndex && (
          <div className="flex items-center gap-3">
            <TopicDropdown topics={topics} value={topic} onChange={setTopic} />
            <button
              type="button"
              onClick={() => setSubscribeOpen(true)}
              className="font-display rounded-[4px] border border-neutron bg-supernova px-4 py-1.5 text-xs uppercase tracking-[0.1em] text-neutron transition-colors hover:bg-neutron hover:text-supernova"
            >
              Subscribe
            </button>
          </div>
        )}
      </div>
      {subscribeOpen &&
        createPortal(<SubscribeModal onClose={() => setSubscribeOpen(false)} />, document.body)}
    </header>
  )
}
