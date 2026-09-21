import { useEffect } from 'react'

// The whole point of pulling blog content onto this site instead of leaving
// it on Paragraph is SEO — each real page needs its own title/description/
// canonical/Open Graph tags, not just whatever's baked into index.html.
// This only ever runs client-side though, so it helps crawlers that execute
// JS (Google's own renderer) but does nothing for crawlers that don't —
// most social-preview bots (Slack, Twitter, iMessage, etc.) only ever see
// index.html's static tags, unchanged, on every route. Fixing that for real
// needs prerendering/SSR per route — tracked separately, this is the
// JS-only half of the picture.
export const SITE_URL = 'https://stellaachenbach.com'

function ensureElement(tag, selector, attrs) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement(tag)
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value)
    document.head.appendChild(el)
  }
  return el
}

// Sets `attrName` to `value` (when given) and returns a thunk that restores
// whatever the attribute held before — same "leave it as you found it"
// contract for every tag this hook touches, not just title/description.
function syncAttribute(el, attrName, value) {
  const previous = el.getAttribute(attrName)
  if (value != null) el.setAttribute(attrName, value)
  return () => {
    if (previous !== null) el.setAttribute(attrName, previous)
    else el.removeAttribute(attrName)
  }
}

export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title
    if (title) document.title = title

    const url = `${SITE_URL}${window.location.pathname}`
    const restoreFns = []

    if (description) {
      const el = ensureElement('meta', 'meta[name="description"]', { name: 'description' })
      restoreFns.push(syncAttribute(el, 'content', description))
    }
    if (title) {
      const el = ensureElement('meta', 'meta[property="og:title"]', { property: 'og:title' })
      restoreFns.push(syncAttribute(el, 'content', title))
    }
    if (description) {
      const el = ensureElement('meta', 'meta[property="og:description"]', { property: 'og:description' })
      restoreFns.push(syncAttribute(el, 'content', description))
    }

    const ogUrlEl = ensureElement('meta', 'meta[property="og:url"]', { property: 'og:url' })
    restoreFns.push(syncAttribute(ogUrlEl, 'content', url))

    const canonicalEl = ensureElement('link', 'link[rel="canonical"]', { rel: 'canonical' })
    restoreFns.push(syncAttribute(canonicalEl, 'href', url))

    return () => {
      document.title = previousTitle
      for (const restore of restoreFns) restore()
    }
  }, [title, description])
}
