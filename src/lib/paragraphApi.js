// Read-only pull from Paragraph's public API — no auth needed for any of
// these endpoints, they're documented as public by design.
const API_BASE = 'https://public.api.paragraph.com/api/v1'
const PUBLICATION_SLUG = 'stellaachenbach'

let publicationIdPromise = null

function getPublicationId() {
  if (!publicationIdPromise) {
    publicationIdPromise = fetch(`${API_BASE}/publications/slug/${PUBLICATION_SLUG}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load publication (${res.status})`)
        return res.json()
      })
      .then((publication) => publication.id)
  }
  return publicationIdPromise
}

// The API paginates (default page size caps out well under our real post
// count), so a single fetch silently drops the older posts — page through
// with the cursor it hands back until it says there's nothing left.
export async function listBlogPosts({ pageSize = 50 } = {}) {
  const publicationId = await getPublicationId()
  const items = []
  let cursor
  while (true) {
    const params = new URLSearchParams({ limit: String(pageSize) })
    if (cursor) params.set('cursor', cursor)
    const res = await fetch(`${API_BASE}/publications/${publicationId}/posts?${params}`)
    if (!res.ok) throw new Error(`Failed to load posts (${res.status})`)
    const data = await res.json()
    items.push(...data.items)
    if (!data.pagination?.hasMore) break
    cursor = data.pagination.cursor
  }
  return items
}

export async function getBlogPost(slug) {
  const res = await fetch(`${API_BASE}/publications/slug/${PUBLICATION_SLUG}/posts/slug/${slug}?includeContent=true`)
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`)
  return res.json()
}
