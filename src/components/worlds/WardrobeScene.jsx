import { Environment, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { HudSpinner } from '../LoadingScreen'

// Shown in place of the mannequin/garment for archetypes that don't have a
// real model exported yet — dashed ring echoes the same "Soon" treatment as
// the WIP filmstrip below, sized to sit comfortably in the stage instead of
// a placeholder body.
function ComingSoon() {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="flex h-36 w-36 flex-col items-center justify-center gap-1.5 rounded-full border border-dashed border-neutron/25 text-center">
        <p className="text-[9px] uppercase tracking-[0.2em] text-pink-dwarf">Archetype</p>
        <p className="font-display text-xs uppercase tracking-[0.15em] text-neutron">Coming soon</p>
      </div>
    </div>
  )
}

// Tied to drei's global load tracker rather than local state — it's true only
// while a GLTF fetch/parse is actually in flight, so it appears exactly as
// long as a swap takes and disappears the instant it resolves (cached models
// resolve immediately and never show it at all).
function ModelLoadingOverlay() {
  const { active } = useProgress()
  if (!active) return null
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <HudSpinner size={72} />
    </div>
  )
}

// Loads and renders an archetype's garment model. `offsetY` is per-archetype
// (see reinaArchetypes.js) since each garment export's own local origin
// doesn't line up the same way from asset to asset.
function ArchetypeModel({ src, offsetY }) {
  const { scene } = useGLTF(src)
  return <primitive object={scene} position={[0, offsetY, 0]} />
}

// The actual name/stats/paragraphs markup, with no wrapper of its own —
// shared between the always-visible desktop panel below and the on-demand
// mobile modal, so the two surfaces can't drift out of sync with each
// other content-wise.
function ArchetypeDescriptionContent({ archetype }) {
  const description = archetype.description

  return (
    <>
      <h3 className="font-display mb-1 text-sm uppercase tracking-[0.15em] text-neutron">{archetype.name}</h3>
      {description ? (
        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-[0.1em] text-pink-dwarf">Archetype N°{description.number}</p>
          <dl className="space-y-1.5 text-[11px] leading-snug text-wormhole">
            <div>
              <dt className="uppercase tracking-[0.1em] text-neutron/80">Strength</dt>
              <dd>{description.strength}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.1em] text-neutron/80">Weakness</dt>
              <dd>{description.weakness}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.1em] text-neutron/80">Attribute</dt>
              <dd>{description.attribute}</dd>
            </div>
          </dl>
          <div className="space-y-2 border-t border-neutron/15 pt-2 text-[11px] leading-relaxed text-wormhole">
            {description.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-wormhole">Description coming soon.</p>
      )}
    </>
  )
}

// Desktop (md+) only now — below md, a permanently-visible card pushed the
// whole page down a lot just to read one archetype's description, so that
// space got traded for an on-demand info icon + modal instead (see
// ArchetypeDescriptionModal and the info button in WardrobeScene).
// Fades back in every time the selected archetype changes, rather than just
// once on mount — flipping visible straight to true on a change React
// already batches into the same paint wouldn't replay the transition, so
// this drops to invisible first and waits a frame before re-showing.
function DescriptionPanel({ archetype }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(false)
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [archetype.id])

  return (
    <div
      className="hidden md:absolute md:left-10 md:top-1/2 md:z-10 md:block md:max-h-[calc(100%-4rem)] md:w-[240px] md:-translate-y-1/2 md:overflow-y-auto md:rounded-[8px] md:border md:border-white/25 md:bg-white/24 md:p-4 md:backdrop-blur-[8px] md:transition-opacity md:duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <ArchetypeDescriptionContent archetype={archetype} />
    </div>
  )
}

// Below md: tapping the info button (see WardrobeScene) opens this instead
// of the stage showing a permanent card — same glass-backdrop shell
// convention as Lightbox/SubscribeModal elsewhere on the site. The content
// card itself is a solid supernova surface, not another layer of glass —
// backdrop-filter can't sample through an already-blurred ancestor (same
// reason noted in Nav.jsx's TopicDropdown), so nesting a second blur here
// would just render blurless.
function ArchetypeDescriptionModal({ archetype, onClose }) {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center border border-white/25 bg-white/24 p-6 backdrop-blur-[8px] md:hidden"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="font-display absolute right-6 top-6 text-2xl text-pink-dwarf transition-colors hover:text-neutron"
      >
        ✕
      </button>
      <div
        className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-[8px] border border-white/25 bg-supernova p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <ArchetypeDescriptionContent archetype={archetype} />
      </div>
    </div>
  )
}

function ArchetypePicker({ archetypes, selectedIndex, onSelectIndex }) {
  return (
    // Below md: a horizontal scroll row stacked under the stage (same
    // pattern as the cloth-pattern picker on Traveling Patronage) instead
    // of the vertical overlay column — see WardrobeScene for why. pb-3
    // gives the row (the last visible element on mobile) breathing room
    // from the container's bottom edge instead of sitting flush against it.
    <div className="flex gap-2 overflow-x-auto px-3 pb-3 md:absolute md:right-10 md:top-1/2 md:z-10 md:max-h-[calc(100%-4rem)] md:w-auto md:-translate-y-1/2 md:flex-col md:overflow-x-visible md:overflow-y-auto md:px-0 md:pb-0 md:pr-1">
      {archetypes.map((archetype, index) => (
        <button
          key={archetype.id}
          type="button"
          onClick={() => onSelectIndex(index)}
          // Portrait, not landscape — future archetypes will sit here as
          // front-render PNGs (a standing figure), which reads much better
          // in a taller box than the current wide one.
          className={`flex h-24 w-16 shrink-0 items-center justify-center rounded border p-1 text-center text-[8px] uppercase leading-tight tracking-[0.1em] backdrop-blur-[8px] transition-colors ${
            index === selectedIndex
              ? 'border-pink-dwarf bg-white/24 text-neutron'
              : 'border-white/25 bg-white/10 text-wormhole/80 hover:border-pink-dwarf/60 hover:text-wormhole'
          }`}
        >
          {archetype.name}
        </button>
      ))}
    </div>
  )
}

// Same Canvas/lighting recipe as ClothScene, reused rather than standing up
// a second r3f pipeline. Full-width "asset browser" window — the mannequin
// stage, the archetype picker, and the description panel all live inside
// this one bordered frame instead of being separate blocks on the page, so
// it reads as a single browser rather than stacked pieces, at least once
// there's enough width for the two side panels to overlay the stage without
// colliding (md and up). Below that, the picker and description stack as
// normal blocks under the stage instead — see each component's own comment.
// The outer flex column's `gap` only affects elements still in normal
// flow, so it has no effect once the panels switch to `absolute` at md,
// without needing separate mobile-only margin classes to reset there.
export function WardrobeScene({ archetypes, selectedIndex, onSelectIndex }) {
  const selected = archetypes[selectedIndex]
  const [descriptionOpen, setDescriptionOpen] = useState(false)

  return (
    <div className="relative flex w-full flex-col gap-3 overflow-hidden rounded-[8px] border border-white/25 bg-neutron/5 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]">
      <div className="relative h-[70vh] max-h-[680px] min-h-[440px] w-full overflow-hidden">
        <Canvas camera={{ position: [0, 0.85, 6], fov: 26 }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[2, 4, 3]} intensity={1.2} />
          <directionalLight position={[-3, 1, -2]} intensity={0.4} />
          <Suspense fallback={null}>
            <Environment preset="studio" environmentIntensity={0.6} />
            <group>
              {selected.model && (
                <Suspense fallback={null}>
                  <ArchetypeModel src={selected.model} offsetY={selected.modelOffsetY ?? 0} />
                </Suspense>
              )}
            </group>
          </Suspense>
          <OrbitControls enablePan={false} target={[0, 0.72, 0]} minDistance={2.5} maxDistance={7} />
        </Canvas>
        {selected.model ? <ModelLoadingOverlay /> : <ComingSoon />}
        {/* Below md only — desktop already shows the description
            permanently via DescriptionPanel, so this would be redundant
            there. Opens ArchetypeDescriptionModal instead of a permanent
            on-page card, which was pushing the whole page down a lot just
            to show one archetype's description. Icon is the project's own
            (public/icons.svg), matching Material Icons' Rounded/Filled
            style — the house icon set. */}
        <button
          type="button"
          onClick={() => setDescriptionOpen(true)}
          aria-label={`About ${selected.name}`}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/24 text-neutron backdrop-blur-[8px] transition-colors hover:border-pink-dwarf/60 hover:text-pink-dwarf md:hidden"
        >
          <svg width={24} height={24} fill="currentColor" aria-hidden="true">
            <use href="/icons.svg#info-icon" />
          </svg>
        </button>
      </div>
      {/* Picker before description below md — pick an archetype first, then
          read about it — but DOM order has no effect on desktop, where both
          are independently absolutely positioned. */}
      <ArchetypePicker archetypes={archetypes} selectedIndex={selectedIndex} onSelectIndex={onSelectIndex} />
      <DescriptionPanel archetype={selected} />
      {descriptionOpen && (
        <ArchetypeDescriptionModal archetype={selected} onClose={() => setDescriptionOpen(false)} />
      )}
    </div>
  )
}
