import { useAnimations, useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Box3, Plane, Vector3 } from 'three'
import { createHolographicMaterial } from '../lib/holographicMaterial'

// Delay is timed to land after the rest of the HUD reveal (letters, circle,
// lines, tagline, menu) has settled — NOVA is deliberately the last thing
// to "come online". A clip plane sweeps up from its feet to its head over
// SWEEP_DURATION_MS (the "loading in bottom to top" part), the hologram
// keeps flickering for the rest of HOLOGRAM_DURATION_MS, then fades its own
// opacity out while the real materials get restored underneath — a
// temporary overlay, not a replacement, so this keeps working unchanged
// once the placeholder is swapped for the real export with baked skin/
// wearable textures.
const HOLOGRAM_START_DELAY_MS = 2350
const SWEEP_DURATION_MS = 700
const HOLOGRAM_DURATION_MS = 1300
const HOLOGRAM_FADE_MS = 350

// Rigged Mixamo placeholder (single "mixamo.com" clip) standing in for the
// real lowpoly Nova export. Every named state plays the same clip for now —
// once the real glTF ships with distinct greeting/idle/presenting/reading
// clips, map `state` to `names` here instead of always picking names[0].
export function NovaModel({ state = 'idle', revealed = true, ...props }) {
  const group = useRef()
  const { scene, animations } = useGLTF('/models/nova-placeholder.glb')
  const { actions, names } = useAnimations(animations, group)
  const [hologramActive, setHologramActive] = useState(false)
  const originalMaterials = useRef(new Map())
  const elapsedMsRef = useRef(0)
  const boundsRef = useRef({ minY: 0, maxY: 1 })
  // Sweeps upward — kept as points above `constant` are the ones clipped
  // away, so raising it from the model's feet to its head reveals bottom
  // to top.
  const clipPlane = useMemo(() => new Plane(new Vector3(0, -1, 0), 0), [])
  const hologramMaterial = useMemo(
    () => createHolographicMaterial({ hologramColor: '#FF99D8', clippingPlanes: [clipPlane] }),
    [clipPlane],
  )

  useEffect(() => {
    const name = names[0]
    const action = name && actions[name]
    if (!action) return
    action.reset().fadeIn(0.3).play()
    return () => action.fadeOut(0.3)
  }, [actions, names, state])

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && !originalMaterials.current.has(child.uuid)) {
        originalMaterials.current.set(child.uuid, child.material)
      }
    })
    scene.updateMatrixWorld(true)
    const box = new Box3().setFromObject(scene)
    boundsRef.current = { minY: box.min.y, maxY: box.max.y }
    // Stays hidden until its own reveal moment — otherwise it's just sitting
    // here fully visible with its normal materials from the very first
    // page load, well before the hologram boot-up ever gets to run.
    scene.visible = false
  }, [scene])

  useEffect(() => {
    if (!revealed) return
    const timer = setTimeout(() => {
      elapsedMsRef.current = 0
      hologramMaterial.uniforms.hologramOpacity.value = 1
      clipPlane.constant = boundsRef.current.minY
      scene.traverse((child) => {
        if (child.isMesh) child.material = hologramMaterial
      })
      scene.visible = true
      setHologramActive(true)
    }, HOLOGRAM_START_DELAY_MS)
    return () => clearTimeout(timer)
  }, [revealed, scene, hologramMaterial, clipPlane])

  useFrame((_, delta) => {
    if (!hologramActive) return
    hologramMaterial.uniforms.time.value += delta
    elapsedMsRef.current += delta * 1000
    const elapsed = elapsedMsRef.current

    const { minY, maxY } = boundsRef.current
    const sweepProgress = Math.min(1, elapsed / SWEEP_DURATION_MS)
    clipPlane.constant = minY + (maxY - minY) * sweepProgress

    const fadeStart = HOLOGRAM_DURATION_MS - HOLOGRAM_FADE_MS
    if (elapsed > fadeStart) {
      const fadeElapsed = elapsed - fadeStart
      hologramMaterial.uniforms.hologramOpacity.value = Math.max(0, 1 - fadeElapsed / HOLOGRAM_FADE_MS)
    }

    if (elapsed >= HOLOGRAM_DURATION_MS) {
      scene.traverse((child) => {
        if (child.isMesh) {
          const original = originalMaterials.current.get(child.uuid)
          if (original) child.material = original
        }
      })
      setHologramActive(false)
    }
  })

  return <primitive ref={group} object={scene} {...props} />
}

useGLTF.preload('/models/nova-placeholder.glb')
