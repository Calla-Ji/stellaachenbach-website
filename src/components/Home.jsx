import { Hero } from './Hero'

export function Home({ revealed = true }) {
  return <Hero revealed={revealed} />
}
