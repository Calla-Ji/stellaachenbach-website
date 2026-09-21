import { useDocumentMeta } from '../lib/useDocumentMeta'
import { PageHeader } from './PageHeader'

export function About() {
  useDocumentMeta({
    title: 'About — Stella Achenbach',
    description:
      'Stella Achenbach is a Design Alchemist whose work sits where 3D craft, game design, and decentralized systems overlap. She builds tools that help creators thrive.',
  })

  return (
    <section id="about" className="mx-auto max-w-5xl px-6 py-20">
      <PageHeader topic="About" title="Stella Achenbach" />
      <div className="mb-10 max-w-2xl space-y-4 text-sm leading-relaxed text-wormhole">
        <p>
          Stella Achenbach is a Design Alchemist whose work sits where 3D craft, game design, and decentralized
          systems overlap. She builds tools that help creators thrive.
        </p>
        <p>
          She founded The ALANA Project, a decentralized community that collaborates to educate fellow creators on
          novel technologies and build useful creator tools, products, and platforms together.
        </p>
        <p>
          She models in Blender, textures in Substance, builds worlds in UE5, ships web tools, and writes about the
          technology underneath them.
        </p>
        <p>
          Her doctoral research examines governance and democratic frameworks for decentralized organizations—the
          same question her tools answer in software. She teaches the process publicly, live and unedited, from
          Lima.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div className="overflow-hidden rounded-[4px] border border-white/25 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]">
          <img
            src="https://teal-united-parrot-418.mypinata.cloud/ipfs/bafybeidm2g3gnn5zezkpajalnmkbc2mshoqdonyz3g2q2tqglzaqkpdx4i"
            alt="Headshot of Stella Achenbach"
            className="aspect-square w-full object-cover"
          />
          <div className="p-5">
            <h3 className="font-display mb-2 text-sm uppercase tracking-[0.15em]">
              Stella · Real
            </h3>
            <p className="mb-2 text-sm text-wormhole">
              Photographed by{' '}
              <a
                href="https://stuvel.eu/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-dwarf transition-colors hover:text-neutron"
              >
                Sybren A. Stüvel
              </a>{' '}
              at the 2023 Blender Conference in Amsterdam.
            </p>
            <p className="text-sm text-wormhole">
              This photo is used for speaker events and official "real-world" appearances by Stella Achenbach.
            </p>
          </div>
        </div>
        <div className="overflow-hidden rounded-[4px] border border-white/25 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]">
          {/* Placeholder render — swap once a final Nova asset exists. */}
          <img
            src="https://teal-united-parrot-418.mypinata.cloud/ipfs/bafybeiegzk7kb7pvacjrjr46r3iw7cwe5eplgagbfec3zvl7d4azfphema"
            alt="Nova, the 3D digital alter-ego of Stella Achenbach"
            className="aspect-square w-full object-cover"
          />
          <div className="p-5">
            <h3 className="font-display mb-2 text-sm uppercase tracking-[0.15em]">
              Nova · Digital Proxy
            </h3>
            <p className="mb-2 text-sm text-wormhole">
              NOVA is the 3D alter-ego of Stella Achenbach, designed to inhabit digital spaces, such as metaverses,
              games, etc.
            </p>
            <p className="text-sm text-wormhole">She's the face of the brand when it enters the digital world.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
