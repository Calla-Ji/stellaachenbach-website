import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { NovaModel } from './NovaModel'

// Centerpiece 3D render — the real glTF placeholder, not a CSS stand-in.
// Swap `/models/nova-placeholder.glb` for the final rigged export later;
// nothing else here needs to change.
export function NovaScene({ state = 'idle', size = 340, interactive = true, revealed = true }) {
  return (
    <div
      style={{ width: size, height: size }}
      className={interactive ? 'cursor-grab active:cursor-grabbing' : ''}
    >
      <Canvas
        camera={{ position: [0, -0.12, 4.4], fov: 28 }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true
        }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[2, 4, 3]} intensity={1.4} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} />
        <Suspense fallback={null}>
          <NovaModel state={state} revealed={revealed} position={[0, -1.3, 0]} />
        </Suspense>
        {interactive && (
          <OrbitControls
            target={[0, -0.4, 0]}
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2 - 0.35}
            maxPolarAngle={Math.PI / 2 + 0.15}
          />
        )}
      </Canvas>
    </div>
  )
}
