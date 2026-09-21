import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useState } from 'react'
import { ClothPlane } from './ClothPlane'

const BASE_FOV = 36
// Narrower FOV reads as "zoomed in" — changing FOV instead of dollying the
// camera in/out avoids fighting OrbitControls' own zoom (scroll/pinch), which
// tracks distance from target internally and would otherwise just override an
// externally-set camera position on its next update.
const ZOOM_MIN_FOV = 16

// Plain camera-prop fov is only read once at Canvas mount — this applies
// later changes (from the zoom slider) to the live camera each render.
function ZoomController({ fov }) {
  const { camera } = useThree()
  useEffect(() => {
    camera.fov = fov
    camera.updateProjectionMatrix()
  }, [camera, fov])
  return null
}

const LABEL_VISIBLE_MS = 5000

// Blends in top-left whenever the selected pattern changes (including the
// initial one on load), holds for LABEL_VISIBLE_MS, then blends back out —
// a plain CSS opacity transition handles both directions off one bit of
// state, no separate fade-in/fade-out animations needed.
function DesignLabel({ label }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!label) return undefined
    setVisible(true)
    const timeout = setTimeout(() => setVisible(false), LABEL_VISIBLE_MS)
    return () => clearTimeout(timeout)
  }, [label])

  if (!label) return null

  return (
    <h3
      className="pointer-events-none absolute left-4 top-4 z-10 font-display text-base uppercase tracking-tight text-neutron transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {label}
    </h3>
  )
}

// Same Canvas/lighting recipe as NovaScene, reusing the r3f pipeline already
// in place rather than standing up a second one. OrbitControls is disabled
// while a cloth point is being dragged — otherwise grabbing the fabric also
// spins the camera at the same time, fighting the gesture. Fully fluid width
// (no cap) with a fixed 16:9 aspect-ratio box — r3f's Canvas fills and tracks
// its parent's size via ResizeObserver, keeping the camera's aspect in sync
// automatically, so this genuinely tracks the browser window on huge
// monitors and scales down cleanly on mobile, rather than plateauing at a
// fixed pixel size either way.
// Camera distance/fov give roughly 1.5 units of visible half-height at the
// cloth's depth — the cloth itself is a 2.4-unit (±1.2) square, so this
// leaves real margin for it to swing/drape without cropping at the edges,
// regardless of how large the canvas itself renders (a wider canvas is just
// more pixels showing the same framed view, not a different crop).
// An explicit zoom slider exists alongside scroll/pinch zoom (OrbitControls)
// since not everyone has a trackpad/scroll wheel handy for gesture zoom.
export function ClothScene({ pattern }) {
  const [dragging, setDragging] = useState(false)
  const [zoom, setZoom] = useState(0)
  const [fabricOpacity, setFabricOpacity] = useState(0.3)
  const [roughness, setRoughness] = useState(0.5)
  const [metalness, setMetalness] = useState(0.15)
  const fov = BASE_FOV - (zoom / 100) * (BASE_FOV - ZOOM_MIN_FOV)

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-[8px] border border-white/25 shadow-[0_8px_20px_-6px_rgba(19,23,24,0.18)] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      >
        <DesignLabel label={pattern.label} />
        <Canvas camera={{ position: [0, 0.3, 4.6], fov: BASE_FOV }} dpr={[1, 2]}>
          <ambientLight intensity={0.2} />
          <directionalLight position={[2, 4, 3]} intensity={1.2} />
          <directionalLight position={[-3, 1, -2]} intensity={0.4} />
          <Suspense fallback={null}>
            {/* Gives the material something real to reflect — PBR properties
                like metalness/roughness read as flat/dead without an
                environment, since plain point/directional lights alone have
                nothing for a shiny surface to actually show. Ambient light
                above is turned down accordingly, since the environment
                itself already contributes ambient-like fill from every
                direction. Loads an HDR file, so needs Suspense same as the
                cloth's own textures. */}
            <Environment preset="studio" environmentIntensity={0.6} />
            <ClothPlane
              pattern={pattern}
              onDraggingChange={setDragging}
              fabricOpacity={fabricOpacity}
              roughness={roughness}
              metalness={metalness}
            />
          </Suspense>
          <ZoomController fov={fov} />
          <OrbitControls enablePan={false} enabled={!dragging} minDistance={2.5} maxDistance={7} />
        </Canvas>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-8">
        <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-wormhole">
          Opacity
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={fabricOpacity}
            onChange={(event) => setFabricOpacity(Number(event.target.value))}
            className="flex-1 accent-pink-dwarf"
          />
        </label>
        <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-wormhole">
          Zoom
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1 accent-pink-dwarf"
          />
        </label>
        <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-wormhole">
          Roughness
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={roughness}
            onChange={(event) => setRoughness(Number(event.target.value))}
            className="flex-1 accent-pink-dwarf"
          />
        </label>
        <label className="flex items-center gap-3 text-[11px] uppercase tracking-[0.1em] text-wormhole">
          Metallic
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={metalness}
            onChange={(event) => setMetalness(Number(event.target.value))}
            className="flex-1 accent-pink-dwarf"
          />
        </label>
      </div>
    </div>
  )
}
