import { useState } from 'react'
import { REINA_ARCHETYPES } from '../../data/reinaArchetypes'
import { REINA_WIP_GALLERY } from '../../data/reinaWipGallery'
import { useDocumentMeta } from '../../lib/useDocumentMeta'
import { Lightbox } from '../Lightbox'
import { PageHeader } from '../PageHeader'
import { WardrobeScene } from './WardrobeScene'

// The wardrobe flipper is one self-contained "asset browser" window — see
// WardrobeScene for the mannequin stage, description panel, and archetype
// picker, all overlaid on the same frame. This page just owns which
// archetype is selected and supplies the surrounding page copy.
export function ReinaDeLaCasa() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedItem, setSelectedItem] = useState(null)

  useDocumentMeta({
    title: 'La Reina de la Casa — Stella Achenbach',
    description:
      "La Reina de la Casa — a wardrobe of eleven web3 archetypes, each a distinct outfit rendered onto a shared mannequin.",
  })

  return (
    <section className="px-10 py-20">
      <PageHeader topic="Worlds" title="La Reina de la Casa" />
      <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-wormhole">
        <p>
          La Reina de la Casa is the ultimate embodiment of the powerful and dynamic web3 era. The collection
          features a wardrobe of distinct archetypes — The Gamer, The Whale, The VR Pioneer, and more — each
          representing a key player in the world of web3. Every archetype is designed with its own attributes,
          strengths, and areas for improvement, building a comprehensive picture of the diverse players in the web3
          ecosystem.
        </p>
        <p>
          But she's not a fictional character; she's a symbol of female empowerment and a call to action for women
          everywhere to take the reins and master the tools of web3. Join the movement, become a part of La Reina's
          kingdom, and reign in your own world with the power of web3.
        </p>
        <p>
          La Reina de la Casa is an invitation to join me in driving ambitious and inclusive projects that will
          change the world.
        </p>
      </div>

      <WardrobeScene archetypes={REINA_ARCHETYPES} selectedIndex={selectedIndex} onSelectIndex={setSelectedIndex} />

      <h2 className="font-display mb-5 mt-16 text-sm uppercase tracking-[0.15em] text-neutron">Work in progress</h2>
      {/* Same filmstrip treatment (fixed h-56, flex + overflow-x-auto, max-w-3xl)
          as Sea Breeze's galleries — just filled with dashed "Soon" placeholders
          for now, same convention as travelingPatronage.js's empty pattern slots.
          Swapping a slot's `src` in reinaWipGallery.js later makes it a real,
          clickable thumbnail with no other changes needed here. */}
      <div className="flex h-56 max-w-3xl gap-3 overflow-x-auto pb-2">
        {REINA_WIP_GALLERY.map((item) => {
          const isPlaceholder = !item.src
          return (
            <button
              key={item.id}
              type="button"
              disabled={isPlaceholder}
              onClick={() => setSelectedItem(item)}
              aria-label={isPlaceholder ? 'Coming soon' : undefined}
              className={
                isPlaceholder
                  ? 'flex h-full w-36 shrink-0 items-center justify-center rounded-[4px] border border-dashed border-neutron/20 text-center text-[9px] uppercase tracking-[0.1em] text-wormhole/60'
                  : 'h-full shrink-0 overflow-hidden rounded-[4px]'
              }
            >
              {isPlaceholder ? (
                'Soon'
              ) : item.type === 'video' ? (
                <video src={item.src} autoPlay muted loop playsInline className="h-full w-auto object-cover" />
              ) : (
                <img src={item.src} alt="La Reina de la Casa work-in-progress" className="h-full w-auto object-cover" />
              )}
            </button>
          )
        })}
      </div>

      {selectedItem && (
        <Lightbox
          src={selectedItem.src}
          alt="La Reina de la Casa work-in-progress"
          type={selectedItem.type}
          description={selectedItem.description}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </section>
  )
}
