import { useState } from 'react'
import { MOODBOARD_ITEMS } from '../../data/interstellarMoodboard'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import { Lightbox } from '../Lightbox'
import { PageHeader } from '../PageHeader'
import { MoodBoardScene } from './MoodBoardScene'

// Unlike Traveling Patronage (a collection of editions, each a set of
// patterns), InterSTELLAr Paradise is a single ongoing world — no editions,
// no pattern gallery, just a project page designed to grow (status/updates,
// eventually the real pixel-streamed build) as the build itself progresses.
export function InterstellarParadise() {
  const [selectedItem, setSelectedItem] = useState(null)

  useDocumentMeta({
    title: 'InterSTELLAr Paradise — Stella Achenbach',
    description:
      'InterSTELLAr Paradise — an in-progress virtual world and 3D portfolio space, built in Unreal Engine 5.',
  })

  return (
    <section className="px-10 py-20">
      <PageHeader topic="Worlds" title="InterSTELLAr Paradise" />
      <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-wormhole">
        <p>
          A virtual space designed to enhance my freedom of expression as a creator. This initiative serves as a 3D
          portfolio, offering an immersive experience of my work to visitors. In addition to its visual appeal, I
          plan to incorporate interactive game elements to demonstrate the extensive capabilities of such platforms.
        </p>
        <p>
          The inspiration behind the theme of this space stems from places I've visited throughout my life that have
          instilled a sense of profound inner peace within me. Whether it's the tranquility of the Amazon Rainforest
          or the serene beauty of the Maldives, InterSTELLAr Paradise seeks to recreate these feelings, providing a
          sanctuary not just for visitors but for myself as well when the space is unoccupied. To translate these
          ideas, I am utilizing AI and digital sketching for the mock-ups, Blender for the 3D modeling, Substance for
          texturing, and Unreal Engine 5 to make it game-ready. Worldbuilding is a natural element of game design and
          always has been — with Metaverse spaces, though, the possibilities to expand are infinite, which means
          worldbuilding becomes infinite and diverse beyond imagination.
        </p>
      </div>

      <h2 className="font-display mb-2 text-sm uppercase tracking-[0.15em] text-neutron">
        Work in progress — mood and concept snapshots
      </h2>
      <p className="mb-10 max-w-2xl text-sm leading-relaxed text-wormhole">
        Drag to look around, scroll to zoom, and click any pin to see it up close — dig in and discover the work in
        progress for yourself.
      </p>
      {/* A real interactive stand-in for the eventual UE5 pixel stream — most
          items are still labeled color placeholders (see
          interstellarMoodboard.js); swapping in real images/video later is a
          data change only, no layout changes here. Real photos and videos
          are both clickable and open full-screen in the Lightbox below. */}
      <MoodBoardScene items={MOODBOARD_ITEMS} onSelectImage={setSelectedItem} />
      {selectedItem && (
        <Lightbox
          src={selectedItem.video || selectedItem.image}
          alt={selectedItem.label}
          type={selectedItem.video ? 'video' : 'image'}
          description={selectedItem.description}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  )
}
