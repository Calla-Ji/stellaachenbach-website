// Runs after `vite build` (see package.json). Fetches every post from
// Paragraph and writes a real dist/blog/<slug>/index.html per post — its own
// title/description/canonical/OG/Twitter tags and Article JSON-LD, plus a
// brand-styled static snapshot of the post's header + hero image + body in
// the page itself. That static snapshot is what crawlers that never run
// JS (Slack, Twitter/X, iMessage, Discord, LinkedIn previews) actually see —
// the client bundle still boots normally on top of it for real visitors
// (main.jsx uses createRoot, not hydrateRoot, so it fully replaces this
// markup rather than needing it to match exactly).
//
// A transient Paragraph API failure here shouldn't block deploying the rest
// of the site, so failures are logged and swallowed (exit 0) rather than
// failing the whole build — the next scheduled rebuild just tries again.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBlogPost, listBlogPosts } from '../src/lib/paragraphApi.js'
import { splitCategoryFromTitle } from '../src/lib/postTitle.js'
import { SITE_URL } from '../src/lib/useDocumentMeta.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST_DIR = path.join(__dirname, '..', 'dist')
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html')
const SEO_BLOCK_RE = /<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/
const PRERENDER_MARKER = '<!-- PRERENDER:START --><!-- PRERENDER:END -->'
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// No DOM in Node — a regex tag-strip is good enough for a plain-text excerpt
// from Paragraph's rendered HTML, without pulling in a real parser for it.
function excerptFromHtml(html, sentenceCount = 2) {
  if (!html) return ''
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  return sentences.slice(0, sentenceCount).join(' ').trim()
}

function buildHead({ url, title, description, image, isDefaultImage, publishedAt }) {
  const safeTitle = escapeHtml(`${title} — Stella Achenbach`)
  const safeDescription = escapeHtml(description)
  const safeImage = escapeHtml(image)
  // Only the fallback og-image.png's dimensions are actually known — a
  // post's own Paragraph image could be any aspect ratio, and declaring the
  // wrong size risks a cropped/stretched preview in clients that trust it.
  const imageDimensions = isDefaultImage
    ? `\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="630" />`
    : ''

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [image],
    datePublished: publishedAt ? new Date(Number(publishedAt)).toISOString() : undefined,
    author: { '@type': 'Person', name: 'Stella Achenbach', url: SITE_URL },
    publisher: { '@type': 'Person', name: 'Stella Achenbach', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  return `<!-- SEO:START -->
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${url}" />

    <meta property="og:site_name" content="Stella Achenbach" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />${imageDimensions}

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <!-- SEO:END -->`
}

// Mirrors PageHeader + BlogPost's own hero/body treatment (same Tailwind
// classes, already compiled into the build's CSS) so the static snapshot
// looks like a real page from this brand, not a bare content dump.
function buildBodySnapshot({ category, title, subtitle, image, staticHtml }) {
  return `<!-- PRERENDER:START -->
    <section class="mx-auto max-w-3xl px-6 py-20">
      <div class="mb-10">
        <p class="font-display mb-2 text-base uppercase tracking-[0.2em] text-pink-dwarf">// ${escapeHtml(category ?? 'Blog')}</p>
        <h1 class="font-display mb-4 text-3xl uppercase tracking-tight text-neutron">${escapeHtml(title)}</h1>
        ${subtitle ? `<p class="max-w-2xl text-sm leading-relaxed text-wormhole">${escapeHtml(subtitle)}</p>` : ''}
      </div>
      ${image ? `<img src="${escapeHtml(image)}" alt="" class="mb-10 w-full rounded-[4px] border border-white/25 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]" />` : ''}
      <div class="prose-blog text-sm leading-relaxed text-wormhole">${staticHtml || ''}</div>
    </section>
    <!-- PRERENDER:END -->`
}

async function updateSitemap(postEntries) {
  const sitemapPath = path.join(DIST_DIR, 'sitemap.xml')
  const existing = await readFile(sitemapPath, 'utf8')
  const postXml = postEntries
    .map(({ url, publishedAt }) => {
      const lastmod = publishedAt ? `<lastmod>${new Date(Number(publishedAt)).toISOString().slice(0, 10)}</lastmod>` : ''
      return `  <url><loc>${url}</loc>${lastmod}</url>`
    })
    .join('\n')
  // Drops the "posts aren't listed here" disclaimer comment from the static
  // template — no longer true for this generated copy.
  const updated = existing.replace(/\s*<!--[\s\S]*?-->\s*<\/urlset>/, `\n${postXml}\n</urlset>`)
  await writeFile(sitemapPath, updated)
}

async function main() {
  let posts
  try {
    posts = await listBlogPosts()
  } catch (err) {
    console.error('Blog prerender: could not reach Paragraph, skipping.', err)
    return
  }

  const template = await readFile(TEMPLATE_PATH, 'utf8')
  console.log(`Prerendering ${posts.length} blog post(s)...`)

  const sitemapEntries = []
  let failures = 0

  for (const post of posts) {
    try {
      const full = await getBlogPost(post.slug)
      const { category, title } = splitCategoryFromTitle(full.title)
      const description = full.subtitle || excerptFromHtml(full.staticHtml) || title
      const image = full.imageUrl || DEFAULT_OG_IMAGE
      const url = `${SITE_URL}/blog/${full.slug}`

      const head = buildHead({
        url,
        title,
        description,
        image,
        isDefaultImage: !full.imageUrl,
        publishedAt: full.publishedAt,
      })
      const body = buildBodySnapshot({
        category,
        title,
        subtitle: full.subtitle,
        image: full.imageUrl,
        staticHtml: full.staticHtml,
      })

      const html = template.replace(SEO_BLOCK_RE, head).replace(PRERENDER_MARKER, body)

      const outDir = path.join(DIST_DIR, 'blog', full.slug)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html)

      sitemapEntries.push({ url, publishedAt: full.publishedAt })
    } catch (err) {
      failures++
      console.error(`Blog prerender: skipping "${post.slug}" (fetch failed).`, err)
    }
  }

  await updateSitemap(sitemapEntries)
  console.log(
    `Done — wrote ${sitemapEntries.length}/${posts.length} static blog page(s), updated sitemap.xml.` +
      (failures ? ` ${failures} post(s) skipped due to fetch errors.` : ''),
  )
}

// Anything reaching here (bad template markers, filesystem errors) is a
// real bug, not a transient upstream hiccup — that's already soft-failed
// above — so this fails the build loudly instead of shipping silently.
main().catch((err) => {
  console.error('Blog prerender failed unexpectedly:', err)
  process.exit(1)
})
