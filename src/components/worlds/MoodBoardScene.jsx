import { OrbitControls, useTexture } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { DoubleSide, SRGBColorSpace, VideoTexture } from 'three'

const FRAME_MARGIN = 0.08
// How far apart each card sits from the next in the stack, and each card's
// own frontmost local offset (mat 0.001 + card face 0.002 — see Pin below).
// Each pin's own depth (see Pin) is derived from these relative to that
// specific card's stacking position, not a board-wide guess — just enough
// clearance to read as "a pin sitting on this photo," not floating above it.
const CARD_DEPTH_STEP = 0.02
const CARD_FRONT_OFFSET = 0.002
const PIN_CLEARANCE = 0.01

// Real photos are clickable (enlarges in a Lightbox, see InterstellarParadise)
// — placeholders aren't, since there's nothing real to enlarge yet.
function ImageCard({ item, onSelect }) {
  // No position/rotation here — the parent <Pin> group already applies
  // both; adding them again here would double them up.
  const texture = useTexture(item.image)
  return (
    <mesh
      position={[0, 0, 0.002]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(item)
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <planeGeometry args={[item.width, item.height]} />
      <meshStandardMaterial map={texture} side={DoubleSide} />
    </mesh>
  )
}

// Video pins (`item.video`) use a real playing <video> element fed into a
// THREE.VideoTexture — a different mechanism than useTexture (which only
// handles static images), so it isn't Suspense-driven; the video just starts
// once created. Autoplay requires muted + playsInline for browsers to allow
// it without a user gesture. Clickable-to-enlarge same as ImageCard —
// Lightbox switches to a real <video> (with sound/controls) for these.
function VideoCard({ item, onSelect }) {
  const [videoEl] = useState(() => {
    const video = document.createElement('video')
    video.src = item.video
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.crossOrigin = 'anonymous'
    video.play().catch(() => {})
    return video
  })

  const texture = useMemo(() => {
    const videoTexture = new VideoTexture(videoEl)
    videoTexture.colorSpace = SRGBColorSpace
    return videoTexture
  }, [videoEl])

  useEffect(() => {
    return () => {
      videoEl.pause()
      texture.dispose()
    }
  }, [videoEl, texture])

  return (
    <mesh
      position={[0, 0, 0.002]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(item)
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <planeGeometry args={[item.width, item.height]} />
      <meshStandardMaterial map={texture} side={DoubleSide} toneMapped={false} />
    </mesh>
  )
}

// Falls back to a plain color swatch (no real WIP screenshot exists yet) —
// swap in `item.image` later and this renders the real photo instead, no
// layout/pin changes needed.
function PlaceholderCard({ item }) {
  return (
    <mesh position={[0, 0, 0.002]}>
      <planeGeometry args={[item.width, item.height]} />
      <meshStandardMaterial color={item.color} side={DoubleSide} />
    </mesh>
  )
}

// The photo card itself is nested in a rotated/depth-stacked group (so
// overlaps between cards resolve correctly), but its pin is rendered as a
// separate, independent mesh — trig here places it where it would've landed
// had it stayed a rotated child of the card, without inheriting the card's
// own stacking depth. Depth is just barely in front of THIS card's own
// position in the stack, not the whole board's worst case — a pin only ever
// needs to clear its own photo, so e.g. Style Frame's pin sits just off
// Style Frame's own depth, regardless of how many other cards exist overall.
// It'll still correctly show through anything drawn earlier (lower depth)
// that it happens to overlap, like Texture Study underneath it.
function Pin({ item, depth, onSelect }) {
  const pinZ = depth + CARD_FRONT_OFFSET + PIN_CLEARANCE
  const pinOffset = item.height / 2 + 0.03
  const pinX = item.x - Math.sin(item.rotation) * pinOffset
  const pinY = item.y + Math.cos(item.rotation) * pinOffset

  return (
    <>
      <group position={[item.x, item.y, depth]} rotation={[0, 0, item.rotation]}>
        {/* White mat behind the card, slightly larger — a cheap Polaroid-
            style frame without needing a real border/outline texture. */}
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[item.width + FRAME_MARGIN, item.height + FRAME_MARGIN]} />
          <meshStandardMaterial color="#ffffff" side={DoubleSide} />
        </mesh>
        {item.video ? (
          <VideoCard item={item} onSelect={onSelect} />
        ) : item.image ? (
          <ImageCard item={item} onSelect={onSelect} />
        ) : (
          <PlaceholderCard item={item} />
        )}
      </group>
      <mesh position={[pinX, pinY, pinZ]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color="#FF99D8" roughness={0.3} metalness={0.4} />
      </mesh>
    </>
  )
}

// Same Canvas/lighting recipe as ClothScene, minus the physics/PBR fabric
// concerns — these are flat, static cards, no simulation, so plain ambient +
// directional lighting is enough. Orbit is deliberately constrained (not a
// free 360) so it reads as "lean in and look at the board" rather than spin
// it around like the cloth. No visible border/shadow/background of its own —
// bg-supernova matches the page exactly (Canvas itself is transparent by
// default) so the pins read as sitting directly on the page, not inside a
// framed box.
export function MoodBoardScene({ items, onSelectImage }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-[8px] bg-supernova">
      <Canvas camera={{ position: [0, 0, 4.4], fov: 40 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 3, 4]} intensity={1} />
        <directionalLight position={[-2, -1, 2]} intensity={0.3} />
        <Suspense fallback={null}>
          {items.map((item, index) => (
            <Pin key={item.id} item={item} depth={index * CARD_DEPTH_STEP} onSelect={onSelectImage} />
          ))}
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={1.2}
          maxDistance={5}
          minAzimuthAngle={-0.6}
          maxAzimuthAngle={0.6}
          minPolarAngle={Math.PI / 2 - 0.4}
          maxPolarAngle={Math.PI / 2 + 0.4}
        />
      </Canvas>
    </div>
  )
}
