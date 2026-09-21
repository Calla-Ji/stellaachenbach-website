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

  const description = archetype.description

  return (
    <div
      className="absolute left-10 top-1/2 z-10 max-h-[calc(100%-4rem)] w-[240px] -translate-y-1/2 overflow-y-auto rounded-[8px] border border-white/25 bg-white/24 p-4 backdrop-blur-[8px] transition-opacity duration-500 sm:left-14"
      style={{ opacity: visible ? 1 : 0 }}
    >
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
    </div>
  )
}

function ArchetypePicker({ archetypes, selectedIndex, onSelectIndex }) {
  return (
    <div className="absolute right-10 top-1/2 z-10 flex max-h-[calc(100%-4rem)] -translate-y-1/2 flex-col gap-2 overflow-y-auto pr-1 sm:right-14">
      {archetypes.map((archetype, index) => (
        <button
          key={archetype.id}
          type="button"
          onClick={() => onSelectIndex(index)}
          className={`flex h-14 w-16 shrink-0 items-center justify-center rounded border p-1 text-center text-[8px] uppercase leading-tight tracking-[0.1em] backdrop-blur-[8px] transition-colors ${
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
// it reads as a single browser rather than stacked pieces.
export function WardrobeScene({ archetypes, selectedIndex, onSelectIndex }) {
  const selected = archetypes[selectedIndex]

  return (
    <div className="relative h-[70vh] max-h-[680px] min-h-[440px] w-full overflow-hidden rounded-[8px] border border-white/25 bg-neutron/5 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)]">
      <Canvas camera={{ position: [0, 0.5, 4], fov: 32 }} dpr={[1, 2]}>
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
        <OrbitControls enablePan={false} target={[0, 0.4, 0]} minDistance={2.5} maxDistance={6} />
      </Canvas>
      {selected.model ? <ModelLoadingOverlay /> : <ComingSoon />}
      <DescriptionPanel archetype={selected} />
      <ArchetypePicker archetypes={archetypes} selectedIndex={selectedIndex} onSelectIndex={onSelectIndex} />
    </div>
  )
}
