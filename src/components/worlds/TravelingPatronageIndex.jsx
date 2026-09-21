import { useState } from 'react'
import { CLOTH_GALLERY } from '../../data/travelingPatronage'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import { BlogPostCard } from '../BlogPostCard'
import { PageHeader } from '../PageHeader'
import { ClothScene } from './ClothScene'

// The full story behind some of these patterns, for anyone who wants to read
// deeper — Mexico City and Buenos Aires share one BTS post covering both.
const RELATED_POSTS = ['bts-or-traveling-patronage-chapter-ii', 'bts-or-traveling-patronage-mexico-2025']

const ALL_PATTERNS = CLOTH_GALLERY.flatMap((edition) => edition.patterns)
const FIRST_REAL_PATTERN = ALL_PATTERNS.find((pattern) => pattern.map) ?? ALL_PATTERNS[0]

// The play window sits on top, full-width (up to a cap) so it can be as
// large as possible — the picker below is a single horizontal queue (every
// pattern across every edition, left to right, newest edition first,
// matching CLOTH_GALLERY's own order) that scrolls sideways rather than a
// tall sidebar competing with the canvas for width. Also just plain more
// mobile-friendly than a side-by-side layout. Real patterns get a clickable
// thumbnail; empty slots (no `map` yet) render as a dashed placeholder and
// aren't clickable. New editions/designs just mean appending to
// CLOTH_GALLERY, no changes here.
function ClothGallery() {
  const [selectedId, setSelectedId] = useState(FIRST_REAL_PATTERN.id)
  const selected = ALL_PATTERNS.find((pattern) => pattern.id === selectedId)

  return (
    <div className="mb-16">
      <div className="flex flex-col gap-4">
        <ClothScene pattern={selected} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ALL_PATTERNS.map((pattern) => {
            const isPlaceholder = !pattern.map
            return (
              <button
                key={pattern.id}
                type="button"
                disabled={isPlaceholder}
                onClick={() => setSelectedId(pattern.id)}
                aria-label={pattern.label ?? 'Pattern coming soon'}
                className={
                  isPlaceholder
                    ? 'flex h-24 w-24 shrink-0 items-center justify-center rounded border border-dashed border-neutron/20 text-center text-[9px] uppercase tracking-[0.1em] text-wormhole/60'
                    : `h-24 w-24 shrink-0 overflow-hidden rounded border transition-colors ${
                        pattern.id === selectedId ? 'border-pink-dwarf' : 'border-neutron/15 hover:border-pink-dwarf/60'
                      }`
                }
              >
                {isPlaceholder ? (
                  'Soon'
                ) : (
                  <img src={pattern.map} alt={pattern.label} className="h-full w-full object-cover" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// A real standalone page, not a glass overlay — // Worlds content needs
// room to grow (galleries, interactive pieces), which the glass-card
// treatment (still used for // About / // Imprint) doesn't really give.
export function TravelingPatronageIndex() {
  useDocumentMeta({
    title: 'Traveling Patronage — Stella Achenbach',
    description:
      'Traveling Patronage turns travel observations into wearable silk scarf designs, one city at a time — Buenos Aires 2018, Mexico City 2024, Paris 2026.',
  })

  return (
    <section className="px-10 py-20">
      <PageHeader topic="Worlds" title="Traveling Patronage" />
      <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-wormhole">
        <p>
          An ongoing project turning travel observations into wearable silk scarf designs, one city at a time.
          Digitally painted with Procreate and transformed into 3D texture maps with Substance Designer.
        </p>
        <p>
          Explore the patterns below, turn, drag and adjust the fabric values to your liking and explore the
          different designs up close.
        </p>
      </div>

      <ClothGallery />

      <h2 className="font-display mb-5 mt-16 text-sm uppercase tracking-[0.15em] text-neutron">
        Learn more about the story behind these patterns
      </h2>
      <div className="max-w-3xl divide-y divide-neutron/10">
        {RELATED_POSTS.map((slug) => (
          <BlogPostCard key={slug} slug={slug} />
        ))}
      </div>
    </section>
  )
}
