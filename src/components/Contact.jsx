import { useDocumentMeta } from '../lib/useDocumentMeta'

// Placeholder copy — swap in the real contact details/form.
export function Contact() {
  useDocumentMeta({
    title: 'Contact — Stella Achenbach',
    description: 'Get in touch with Stella Achenbach.',
  })

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="font-display mb-6 text-2xl uppercase tracking-tight">Contact</h1>
      <p className="text-sm text-wormhole">Contact details pending.</p>
    </section>
  )
}
