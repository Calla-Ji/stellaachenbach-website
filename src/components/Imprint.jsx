import { PageHeader } from './PageHeader'

export function Imprint() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <PageHeader topic="Imprint" title="Imprint" />

      <div className="mb-8 text-sm leading-relaxed text-wormhole">
        <p>Stella Achenbach</p>
        <p>Lima, La Molina 15026</p>
        <p>PERU</p>
        <p>WhatsApp +49 (0)160 960 10 584</p>
      </div>

      <p className="mb-8 text-sm leading-relaxed text-wormhole">
        Stella Achenbach is responsible for the shown content. Any doubts or mistakes that might occur please
        consult via email:{' '}
        <a href="mailto:contact@stellaachenbach.com" className="text-pink-dwarf hover:underline">
          contact@stellaachenbach.com
        </a>
      </p>

      <h2 className="font-display mb-3 text-base uppercase tracking-tight text-neutron">Legal Notice</h2>
      <p className="mb-8 text-sm leading-relaxed text-wormhole">
        Stella Achenbach constantly checks and updates the information on her website. Despite all the care, the
        data may have changed in the meantime. A liability or guarantee for the timeliness, accuracy, and
        completeness of the information provided can therefore not be assumed. The same applies to all other
        websites that are referred to by hyperlink. Stella Achenbach is not responsible for the content of
        websites that are accessed through such a link. Furthermore, Stella Achenbach reserves the right to make
        changes or additions to the information provided. The content and structure of Stella Achenbach's
        websites are protected by copyright. Reproduction of information or data, in particular, the use of
        texts, parts of texts or images, requires the prior consent.
      </p>

      <div className="text-sm leading-relaxed text-wormhole">
        <p>Design &amp; Coding:</p>
        <p>Stella Achenbach</p>
        <p className="mt-4">Made with</p>
        <p>Claude Console</p>
      </div>
    </section>
  )
}
