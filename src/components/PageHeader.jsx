// Shared header for every standalone content page (About, Imprint, the four
// Worlds pages) — // Topic in pink-dwarf, then the H1, then either a short
// blurb or straight into the page's own content when there's nothing more
// to say up top (About, Imprint).
export function PageHeader({ topic, title, description }) {
  return (
    <div className="mb-10">
      <p className="font-display mb-2 text-base uppercase tracking-[0.2em] text-pink-dwarf">{`// ${topic}`}</p>
      <h1 className="font-display mb-4 text-3xl uppercase tracking-tight text-neutron">{title}</h1>
      {description && <p className="max-w-2xl text-sm leading-relaxed text-wormhole">{description}</p>}
    </div>
  )
}
