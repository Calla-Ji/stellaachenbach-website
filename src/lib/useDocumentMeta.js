import { useEffect } from 'react'

// The whole point of pulling this content onto the site instead of leaving
// it on Paragraph is SEO — each real page needs its own title/description,
// which this app has no head-management library for yet. Minimal manual
// version until that's worth adding.
export function useDocumentMeta({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title
    if (title) document.title = title

    let meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    if (description) {
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    return () => {
      document.title = previousTitle
      if (meta && previousDescription !== null) meta.setAttribute('content', previousDescription)
    }
  }, [title, description])
}
