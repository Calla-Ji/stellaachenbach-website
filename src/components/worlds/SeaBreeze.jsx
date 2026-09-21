import { useState } from 'react'
import { SEA_BREEZE_GALLERY, SEA_BREEZE_WIP_GALLERY } from '../../data/seaBreezeGallery'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import { Lightbox } from '../Lightbox'
import { PageHeader } from '../PageHeader'

// Unlike Traveling Patronage and InterSTELLAr Paradise (both ongoing), Sea
// Breeze is finished — a real collaboration, not a WIP snapshot. The page
// reads as a case study: the credit and the story first, the showreel
// second, since the point of this project was the collaboration itself
// more than the final renders.
export function SeaBreeze() {
  const [selectedItem, setSelectedItem] = useState(null)

  useDocumentMeta({
    title: 'Sea Breeze — Stella Achenbach',
    description:
      'Sea Breeze — a completed textile collaboration with digital fashion designer Laura Senkute, six fabric patterns designed and rendered in Substance Designer.',
  })

  return (
    <section className="px-10 py-20">
      <PageHeader topic="Worlds" title="Sea Breeze" />
      <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-wormhole">
        <p>
          SEA BREEZE is a collaboration with digital fashion designer Laura Senkute of{' '}
          <a
            href="https://www.senkdesign.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-dwarf transition-colors hover:text-neutron"
          >
            SENK DESIGN
          </a>
          . For her theme and
          along her inspiration her digitally drawn patterns were translated by Stella Achenbach into fabric texture
          sets entirely produced in Substance Designer.
        </p>
        <p>
          Laura led the collection's silhouettes and digital fashion direction and I created an additions scene in
          Blender to render out just the fabrics in a similar setting and with a similar sentiment as her original
          art direction.
        </p>
        <p>See the final showreel of the fabrics, the rendered fabrics and part of the work in progress below.</p>
      </div>

      <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-[8px]">
        <iframe
          src="https://www.youtube.com/embed/O9BxKBMvMec"
          title="Sea Breeze showreel"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <h2 className="font-display mb-5 mt-16 text-sm uppercase tracking-[0.15em] text-neutron">
        Finished pattern renders
      </h2>
      {/* Fixed height on the row itself, not per item — every item just
          inherits it via h-full, so there's one single place controlling
          scale instead of it being set redundantly per button. Natural width
          per item — a real filmstrip rather than a uniform thumbnail grid.
          Click any item to enlarge. */}
      <div className="flex h-56 max-w-3xl gap-3 overflow-x-auto pb-2">
        {SEA_BREEZE_GALLERY.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className="h-full shrink-0 overflow-hidden rounded-[4px]"
          >
            {item.type === 'video' ? (
              <video src={item.src} autoPlay muted loop playsInline className="h-full w-auto object-cover" />
            ) : (
              <img src={item.src} alt="Sea Breeze fabric render" className="h-full w-auto object-cover" />
            )}
          </button>
        ))}
      </div>

      <h2 className="font-display mb-5 mt-16 text-sm uppercase tracking-[0.15em] text-neutron">
        Work in progress screenshots
      </h2>
      <div className="flex h-56 max-w-3xl gap-3 overflow-x-auto pb-2">
        {SEA_BREEZE_WIP_GALLERY.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSelectedItem(item)}
            className="h-full shrink-0 overflow-hidden rounded-[4px]"
          >
            {item.type === 'video' ? (
              <video src={item.src} autoPlay muted loop playsInline className="h-full w-auto object-cover" />
            ) : (
              <img src={item.src} alt="Sea Breeze work-in-progress screenshot" className="h-full w-auto object-cover" />
            )}
          </button>
        ))}
      </div>

      {selectedItem && (
        <Lightbox
          src={selectedItem.src}
          alt="Sea Breeze fabric render"
          type={selectedItem.type}
          description={selectedItem.description}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  )
}
