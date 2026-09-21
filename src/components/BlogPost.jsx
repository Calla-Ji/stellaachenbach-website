import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getBlogPost } from '../lib/paragraphApi'
import { splitCategoryFromTitle } from '../lib/postTitle'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { LoadingScreen, MIN_VISIBLE_MS } from './LoadingScreen'
import { PageHeader } from './PageHeader'
import { WipeReveal } from './WipeReveal'

// A real YouTube video ID: 11 URL-safe characters. Validated before it ever
// touches an iframe src, since it comes out of an HTML attribute we don't
// control (Paragraph's export).
const YOUTUBE_ID_RE = /^[\w-]{11}$/

// Renders Paragraph's staticHtml as-is — the brand typography rules for it
// live in .prose-blog (index.css), not here, since the markup itself is out
// of our control and carries Paragraph's own (sometimes colliding) classes.
// A few things the raw HTML can't do on its own get patched in after render,
// directly on the DOM (Paragraph's own JS would normally drive these, and we
// don't ship that JS):
// - links forced to open in a new tab
// - the static YouTube thumbnail+link swapped for a real playable embed
// - link-preview embeds (LinkedIn etc.) rebuilt from scratch — Paragraph
//   ships these as a genuinely empty div; all the real content sits packed
//   into a JSON `data` attribute meant for its own client-side renderer
// - the "details" callout (not a real <details> element) wired up with an
//   actual click-to-collapse toggle
export function BlogPost() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  const contentRef = useRef(null)

  useEffect(() => {
    setPost(null)
    setError(null)
    const start = Date.now()
    getBlogPost(slug)
      .then((data) => {
        const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - start), 0)
        setTimeout(() => setPost(data), remaining)
      })
      .catch((err) => setError(err.message))
  }, [slug])

  useEffect(() => {
    const container = contentRef.current
    if (!post || !container) return

    container.querySelectorAll('a').forEach((link) => {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    })

    container.querySelectorAll('[data-type="youtube"]').forEach((embed) => {
      const videoId = embed.getAttribute('videoid')
      if (!videoId || !YOUTUBE_ID_RE.test(videoId)) return
      const iframe = document.createElement('iframe')
      iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}`
      iframe.title = 'YouTube video'
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      iframe.allowFullscreen = true
      iframe.loading = 'lazy'
      embed.replaceChildren(iframe)
    })

    container.querySelectorAll('[data-type="embedly"]').forEach((embed) => {
      const href = embed.getAttribute('src')
      if (!href) return
      let meta = {}
      try {
        meta = JSON.parse(embed.getAttribute('data') || '{}')
      } catch {
        // Malformed metadata — still render a bare link below rather than nothing.
      }

      const card = document.createElement('a')
      card.href = href
      card.target = '_blank'
      card.rel = 'noopener noreferrer'
      card.className = 'link-embed-card'

      if (meta.thumbnail_url) {
        const thumb = document.createElement('img')
        thumb.src = meta.thumbnail_url
        thumb.alt = ''
        thumb.className = 'link-embed-thumb'
        card.appendChild(thumb)
      }

      const body = document.createElement('div')
      body.className = 'link-embed-body'

      if (meta.provider_name) {
        const provider = document.createElement('p')
        provider.className = 'link-embed-provider'
        provider.textContent = meta.provider_name
        body.appendChild(provider)
      }

      const title = document.createElement('p')
      title.className = 'link-embed-title'
      title.textContent = meta.title || href
      body.appendChild(title)

      if (meta.description) {
        const description = document.createElement('p')
        description.className = 'link-embed-desc'
        description.textContent = meta.description
        body.appendChild(description)
      }

      card.appendChild(body)
      embed.replaceChildren(card)
    })

    // StrictMode double-invokes effects in dev — without a cleanup, that
    // would double-bind this listener, so one click toggles is-open twice
    // and appears to do nothing.
    const detailsCleanups = []
    container.querySelectorAll('[data-type="details"]').forEach((details) => {
      const summary = details.querySelector('[data-type="detailsSummary"]')
      if (!summary) return
      details.classList.add('is-open')
      const toggle = () => details.classList.toggle('is-open')
      summary.addEventListener('click', toggle)
      detailsCleanups.push(() => summary.removeEventListener('click', toggle))
    })

    return () => detailsCleanups.forEach((cleanup) => cleanup())
  }, [post])

  const { category, title } = post ? splitCategoryFromTitle(post.title) : { category: null, title: null }

  useDocumentMeta({
    title: post ? `${title} — Stella Achenbach` : undefined,
    description: post?.subtitle,
  })

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm text-wormhole">Couldn't load this post ({error}).</p>
      </section>
    )
  }

  if (!post) {
    return <LoadingScreen />
  }

  return (
    <WipeReveal>
      <section className="mx-auto max-w-3xl px-6 py-20">
        <PageHeader topic={category ?? 'Blog'} title={title} description={post.subtitle} />
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt=""
            className="mb-10 w-full rounded-[4px] border border-white/25 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]"
          />
        )}
        <div
          ref={contentRef}
          className="prose-blog text-sm leading-relaxed text-wormhole"
          dangerouslySetInnerHTML={{ __html: post.staticHtml }}
        />
      </section>
    </WipeReveal>
  )
}
