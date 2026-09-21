import { useDocumentMeta } from '../lib/useDocumentMeta'
import { Hero } from './Hero'

export function Home({ revealed = true }) {
  useDocumentMeta({
    title: 'Stella Achenbach — Design Alchemist',
    description:
      'Design Alchemist working where 3D craft, game design, and decentralized systems overlap — tools, worlds, and systems for creators.',
  })

  return <Hero revealed={revealed} />
}
