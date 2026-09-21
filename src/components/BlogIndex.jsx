import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { excerptFromHtml } from '../lib/excerpt'
import { formatDate } from '../lib/formatDate'
import { getBlogPost, listBlogPosts } from '../lib/paragraphApi'
import { splitCategoryFromTitle } from '../lib/postTitle'
import { useDocumentMeta } from '../lib/useDocumentMeta'
import { LoadingScreen, MIN_VISIBLE_MS } from './LoadingScreen'
import { ReadNowButton } from './ReadNowButton'
import { WipeReveal } from './WipeReveal'

export function BlogIndex() {
  const [posts, setPosts] = useState(null)
  const [bodiesBySlug, setBodiesBySlug] = useState({})
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()

  useDocumentMeta({
    title: 'Blog — Stella Achenbach',
    description: 'Writing on design, technology, and the projects in between.',
  })

  useEffect(() => {
    const start = Date.now()
    listBlogPosts()
      .then(async (items) => {
        const sorted = items.sort((a, b) => Number(b.publishedAt) - Number(a.publishedAt))
        const bodies = await Promise.all(
          sorted.map((post) =>
            getBlogPost(post.slug)
              .then((full) => full.staticHtml)
              .catch(() => ''),
          ),
        )
        const remaining = Math.max(MIN_VISIBLE_MS - (Date.now() - start), 0)
        setTimeout(() => {
          setPosts(sorted)
          setBodiesBySlug(Object.fromEntries(sorted.map((post, i) => [post.slug, bodies[i]])))
        }, remaining)
      })
      .catch((err) => setError(err.message))
  }, [])

  if (error) {
    return (
      <section className="mx-auto max-w-3xl px-6 py-20">
        <p className="text-sm text-wormhole">Couldn't load the blog right now ({error}).</p>
      </section>
    )
  }

  if (!posts) {
    return <LoadingScreen />
  }

  const topicFilter = searchParams.get('topic') || ''
  const hasActiveFilter = Boolean(topicFilter)

  // The first result keeps the pinned-hero treatment even under a filter —
  // it's just "whichever result is first" instead of "most recent overall".
  const filtered = hasActiveFilter
    ? posts.filter((post) => splitCategoryFromTitle(post.title).category === topicFilter)
    : posts

  const [pinned, ...rest] = filtered

  return (
    <WipeReveal>
      <section>
        {pinned && (
          <PinnedPost post={pinned} excerpt={excerptFromHtml(bodiesBySlug[pinned.slug]) || pinned.subtitle || ''} />
        )}

        {hasActiveFilter && filtered.length === 0 && (
          <p className="mx-auto max-w-3xl px-6 py-16 text-sm text-wormhole">No articles match that topic.</p>
        )}

        <div className="mx-auto max-w-3xl divide-y divide-neutron/10 px-6 py-4">
          {rest.map((post) => {
            const { category, title } = splitCategoryFromTitle(post.title)
            const excerpt = excerptFromHtml(bodiesBySlug[post.slug], 3) || post.subtitle || ''
            return (
              <div key={post.id} className="flex items-start gap-5 py-6 first:pt-6">
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="aspect-[2/1] w-[12.1rem] shrink-0 rounded object-cover sm:w-[15.4rem]" />
                )}
                <div className="flex min-w-0 flex-1 flex-col self-stretch">
                  <p className="font-display mb-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.15em] text-wormhole">
                    {category && <span className="text-pink-dwarf">{`// ${category}`}</span>}
                    <span>{formatDate(post.publishedAt)}</span>
                  </p>
                  <h2 className="font-display mb-2 text-base uppercase tracking-tight text-neutron">{title}</h2>
                  {excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-wormhole">{excerpt}</p>}
                </div>
                <ReadNowButton slug={post.slug} variant="dark" className="shrink-0 self-end" />
              </div>
            )
          })}
        </div>
      </section>
    </WipeReveal>
  )
}

// The image itself isn't a link — only the "Read Now" button is. Text just
// renders in place; the page's own WipeReveal already covers the reveal.
function PinnedPost({ post, excerpt }) {
  const { category, title } = splitCategoryFromTitle(post.title)
  const categoryText = category ? `// ${category}` : ''

  return (
    <div className="relative block h-[70vh] min-h-[420px] w-full overflow-hidden">
      {post.imageUrl && (
        <img src={post.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(19,23,24,0.92) 0%, rgba(19,23,24,0.65) 32%, rgba(19,23,24,0.05) 65%, rgba(19,23,24,0) 100%)' }}
      />
      <div className="absolute inset-0 flex flex-col justify-center px-10">
        <div className="max-w-md">
          {categoryText && (
            <p className="font-display mb-3 text-sm uppercase tracking-[0.2em]" style={{ color: 'var(--color-pink-dwarf)' }}>
              {categoryText}
            </p>
          )}
          <h1 className="font-display mb-4 text-3xl uppercase tracking-tight text-white sm:text-4xl">{title}</h1>
          {excerpt && <p className="mb-5 text-sm leading-relaxed text-white/80">{excerpt}</p>}
          <ReadNowButton slug={post.slug} />
        </div>
      </div>
    </div>
  )
}
