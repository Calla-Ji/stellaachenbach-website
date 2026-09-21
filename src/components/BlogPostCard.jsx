import { useEffect, useState } from 'react'
import { excerptFromHtml } from '../lib/excerpt'
import { formatDate } from '../lib/formatDate'
import { getBlogPost } from '../lib/paragraphApi'
import { splitCategoryFromTitle } from '../lib/postTitle'
import { ReadNowButton } from './ReadNowButton'

// Same row styling as a blog list row (BlogIndex) — reused here so linking
// out to a relevant post from elsewhere on the site (e.g. a Worlds gallery)
// reads as the same "article card" rather than a one-off treatment. Unlike
// BlogIndex, this fetches its own single post by slug rather than relying on
// a batch fetch, since callers only ever want one or two specific posts.
export function BlogPostCard({ slug }) {
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setPost(null)
    setError(null)
    getBlogPost(slug)
      .then(setPost)
      .catch((err) => setError(err.message))
  }, [slug])

  if (error) return null
  if (!post) return <div className="py-6 first:pt-0" />

  const { category, title } = splitCategoryFromTitle(post.title)
  const excerpt = excerptFromHtml(post.staticHtml, 3) || post.subtitle || ''

  return (
    <div className="flex items-start gap-5 py-6 first:pt-0">
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt=""
          className="aspect-[2/1] w-[12.1rem] shrink-0 rounded object-cover sm:w-[15.4rem]"
        />
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
}
