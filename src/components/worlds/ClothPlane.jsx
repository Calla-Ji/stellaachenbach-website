import { useTexture } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, Plane as ThreePlane, PlaneGeometry, RepeatWrapping, Vector3 } from 'three'

// The fabric itself — the physical silk weave (alpha/ao/height/normal) — is
// the same material regardless of which pattern is printed on it, so these
// are shared and tiled across the surface, unlike `pattern.map` (the actual
// scarf artwork), which is per-pattern and mapped once, untiled.
// FABRIC_REPEAT is a first pass — tune once it's visible live.
// No metalnessMap/roughnessMap here on purpose — the current source textures
// for both are completely flat (every pixel the same value), so multiplying
// a map against a slider is pointless; the `roughness`/`metalness` sliders
// below just set a flat value directly instead (0 = black/off, 1 = white/
// full). Once there's a real per-pixel map for either, it can come back as
// a genuine multiplier against these same sliders.
const FABRIC_MAPS = {
  alphaMap: '/worlds/traveling-patronage/cloth/fabric/silk-alpha.jpg',
  aoMap: '/worlds/traveling-patronage/cloth/fabric/silk-ao.jpg',
  bumpMap: '/worlds/traveling-patronage/cloth/fabric/silk-height.jpg',
  normalMap: '/worlds/traveling-patronage/cloth/fabric/silk-normal.png',
}
const FABRIC_REPEAT = 100
const FABRIC_BUMP_SCALE = 0.015

// Real cloth — a grid of particles integrated with Verlet (position + previous
// position, no explicit velocity) and connected by structural constraints
// (rest-length springs to the right/below neighbor) relaxed a few times per
// frame. The two top corners are pinned so it hangs and sways like real
// fabric instead of a flat plane. Replaces the earlier sine-ripple test —
// see git history for that version if the fake version is ever needed again.
const COLS = 25
const ROWS = 25
const SIZE = 2.4
const SPACING_X = SIZE / (COLS - 1)
const SPACING_Y = SIZE / (ROWS - 1)
const DIAGONAL_LENGTH = Math.hypot(SPACING_X, SPACING_Y)
const GRAVITY = -1
const DAMPING = 0.99
// More iterations (and the diagonal shear constraints below) is what
// actually fixes "stretchy" — with only structural (horizontal/vertical)
// constraints, the grid can shear freely on the diagonal and looks rubbery;
// resolving it harder per frame reads as silk rather than elastic.
const CONSTRAINT_ITERATIONS = 10
const DT = 1 / 60
// A gentle idle sway so the cloth isn't a dead, static image when nobody's
// touching it — small enough to read as ambient air movement, not wind.
const IDLE_SWAY_AMPLITUDE = 0.015
// Self-collision: particles that aren't already held together by a
// structural/shear constraint (i.e. not close by in the grid — TOPOLOGY_SKIP)
// get pushed apart once they drift within COLLISION_RADIUS, so a fold or a
// dragged bunch of fabric doesn't just pass through itself. A spatial hash
// keeps this to roughly O(n) — only nearby cells get checked — instead of
// testing every pair.
const COLLISION_RADIUS = SPACING_X * 0.75
const COLLISION_CELL_SIZE = COLLISION_RADIUS * 2
const COLLISION_TOPOLOGY_SKIP = 2

function buildParticles() {
  const particles = []
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * SPACING_X - SIZE / 2
      const y = SIZE / 2 - row * SPACING_Y
      const pinned = row === 0 && (col === 0 || col === COLS - 1)
      particles.push({ x, y, z: 0, px: x, py: y, pz: 0, pinned })
    }
  }
  return particles
}

function buildConstraints() {
  const constraints = []
  const index = (row, col) => row * COLS + col
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (col < COLS - 1) constraints.push([index(row, col), index(row, col + 1), SPACING_X])
      if (row < ROWS - 1) constraints.push([index(row, col), index(row + 1, col), SPACING_Y])
      // Shear (diagonal) constraints — without these the grid can skew
      // freely on the bias, which is what reads as "stretchy" rather than
      // like a woven fabric holding its shape while it drapes.
      if (row < ROWS - 1 && col < COLS - 1) {
        constraints.push([index(row, col), index(row + 1, col + 1), DIAGONAL_LENGTH])
        constraints.push([index(row, col + 1), index(row + 1, col), DIAGONAL_LENGTH])
      }
    }
  }
  return constraints
}

function resolveSelfCollisions(particles, dragIndex) {
  const grid = new Map()
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    const key = `${Math.floor(p.x / COLLISION_CELL_SIZE)}_${Math.floor(p.y / COLLISION_CELL_SIZE)}_${Math.floor(p.z / COLLISION_CELL_SIZE)}`
    let bucket = grid.get(key)
    if (!bucket) {
      bucket = []
      grid.set(key, bucket)
    }
    bucket.push(i)
  }

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    const rowA = Math.floor(i / COLS)
    const colA = i % COLS
    const cx = Math.floor(p.x / COLLISION_CELL_SIZE)
    const cy = Math.floor(p.y / COLLISION_CELL_SIZE)
    const cz = Math.floor(p.z / COLLISION_CELL_SIZE)

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = grid.get(`${cx + dx}_${cy + dy}_${cz + dz}`)
          if (!bucket) continue
          for (const j of bucket) {
            if (j <= i) continue
            const rowB = Math.floor(j / COLS)
            const colB = j % COLS
            // Already linked by a structural/shear constraint — let that
            // handle it, don't fight it with a collision push too.
            if (Math.abs(rowA - rowB) <= COLLISION_TOPOLOGY_SKIP && Math.abs(colA - colB) <= COLLISION_TOPOLOGY_SKIP) {
              continue
            }

            const q = particles[j]
            const ddx = q.x - p.x
            const ddy = q.y - p.y
            const ddz = q.z - p.z
            const distSq = ddx * ddx + ddy * ddy + ddz * ddz
            if (distSq >= COLLISION_RADIUS * COLLISION_RADIUS || distSq < 1e-9) continue

            const dist = Math.sqrt(distSq)
            const push = (COLLISION_RADIUS - dist) / dist
            const aFree = !p.pinned && i !== dragIndex
            const bFree = !q.pinned && j !== dragIndex
            if (!aFree && !bFree) continue
            const share = aFree && bFree ? 0.5 : 1
            if (aFree) {
              p.x -= ddx * push * share
              p.y -= ddy * push * share
              p.z -= ddz * push * share
            }
            if (bFree) {
              q.x += ddx * push * share
              q.y += ddy * push * share
              q.z += ddz * push * share
            }
          }
        }
      }
    }
  }
}

// `pattern.map` (the printed artwork) is the only thing that changes between
// patterns — the fabric material itself (FABRIC_MAPS) is fixed and shared.
export function ClothPlane({ pattern, onDraggingChange, fabricOpacity = 0.3, roughness = 0.5, metalness = 0.15 }) {
  const meshRef = useRef()
  const { camera, gl, raycaster } = useThree()
  const particles = useMemo(() => buildParticles(), [])
  const constraints = useMemo(() => buildConstraints(), [])
  const geometry = useMemo(() => {
    const geo = new PlaneGeometry(SIZE, SIZE, COLS - 1, ROWS - 1)
    // aoMap reads uv2, not uv — reuse the same UVs rather than needing a
    // genuinely separate second UV set.
    geo.setAttribute('uv2', geo.attributes.uv)
    return geo
  }, [])
  const dragRef = useRef({ index: -1, plane: new ThreePlane() })

  const colorMap = useTexture(pattern.map)
  const fabricMaps = useTexture(FABRIC_MAPS)
  for (const texture of Object.values(fabricMaps)) {
    texture.wrapS = texture.wrapT = RepeatWrapping
    texture.repeat.set(FABRIC_REPEAT, FABRIC_REPEAT)
  }

  // Stock alphaMap can only ever make the surface *more* transparent than
  // its own texel value — there's no built-in way to blend it back toward
  // fully opaque, which is what the opacity slider needs. onBeforeCompile
  // patches just the alpha line of MeshStandardMaterial's fragment shader to
  // mix between the real alpha texture (0, today's translucent look) and a
  // flat 1.0 (opaque), via a uniform — everything else about the built-in
  // PBR shader (lighting, the other maps) stays untouched.
  const shaderRef = useRef(null)
  const fabricOpacityRef = useRef(fabricOpacity)
  useEffect(() => {
    fabricOpacityRef.current = fabricOpacity
    if (shaderRef.current) shaderRef.current.uniforms.uOpacityBlend.value = fabricOpacity
  }, [fabricOpacity])

  function handleBeforeCompile(shader) {
    shader.uniforms.uOpacityBlend = { value: fabricOpacityRef.current }
    // Setting shader.uniforms alone doesn't declare it in the GLSL source —
    // that has to be injected into the text too, or it's an undeclared
    // identifier and the shader fails to compile (renders as nothing at all,
    // not just "wrong", which is what actually happened here).
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uOpacityBlend;')
      .replace(
        '#include <alphamap_fragment>',
        `
        #ifdef USE_ALPHAMAP
          float fabricAlpha = texture2D( alphaMap, vAlphaMapUv ).g;
          diffuseColor.a *= mix( fabricAlpha, 1.0, uOpacityBlend );
        #endif
        `,
      )
    shaderRef.current = shader
  }

  // Reset the sim whenever the selected pattern changes so switching
  // patterns doesn't inherit whatever drape/sway state the last one was in.
  useEffect(() => {
    const fresh = buildParticles()
    particles.forEach((p, i) => Object.assign(p, fresh[i]))
  }, [pattern, particles])

  function nearestParticleIndex(localPoint) {
    let closest = -1
    let closestDist = Infinity
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const dist = (p.x - localPoint.x) ** 2 + (p.y - localPoint.y) ** 2 + (p.z - localPoint.z) ** 2
      if (dist < closestDist) {
        closestDist = dist
        closest = i
      }
    }
    return closest
  }

  function handlePointerDown(event) {
    event.stopPropagation()
    const local = meshRef.current.worldToLocal(event.point.clone())
    const index = nearestParticleIndex(local)
    if (particles[index].pinned) return

    dragRef.current.index = index
    // Drag plane faces the camera and passes through the grabbed point, so
    // mouse movement maps to a consistent 3D offset regardless of the
    // cloth's own rotation.
    const cameraForward = new Vector3()
    camera.getWorldDirection(cameraForward)
    dragRef.current.plane.setFromNormalAndCoplanarPoint(cameraForward, event.point)
    onDraggingChange?.(true)
    gl.domElement.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (dragRef.current.index === -1) return
    const point = new Vector3()
    raycaster.setFromCamera(
      {
        x: (event.offsetX / gl.domElement.clientWidth) * 2 - 1,
        y: -(event.offsetY / gl.domElement.clientHeight) * 2 + 1,
      },
      camera,
    )
    if (!raycaster.ray.intersectPlane(dragRef.current.plane, point)) return
    const local = meshRef.current.worldToLocal(point)
    const p = particles[dragRef.current.index]
    p.x = local.x
    p.y = local.y
    p.z = local.z
  }

  function handlePointerUp(event) {
    if (dragRef.current.index === -1) return
    dragRef.current.index = -1
    onDraggingChange?.(false)
    gl.domElement.releasePointerCapture(event.pointerId)
  }

  useFrame((state) => {
    const dragging = dragRef.current.index !== -1
    const sway = Math.sin(state.clock.elapsedTime * 0.6) * IDLE_SWAY_AMPLITUDE

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      if (p.pinned || i === dragRef.current.index) continue

      const vx = (p.x - p.px) * DAMPING
      const vy = (p.y - p.py) * DAMPING
      const vz = (p.z - p.pz) * DAMPING
      p.px = p.x
      p.py = p.y
      p.pz = p.z
      p.x += vx + (dragging ? 0 : sway * DT)
      p.y += vy + GRAVITY * DT * DT
      p.z += vz
    }

    for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
      for (const [a, b, restLength] of constraints) {
        const pa = particles[a]
        const pb = particles[b]
        const dx = pb.x - pa.x
        const dy = pb.y - pa.y
        const dz = pb.z - pa.z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.0001
        const diff = (dist - restLength) / dist
        const aFree = !pa.pinned && a !== dragRef.current.index
        const bFree = !pb.pinned && b !== dragRef.current.index
        if (!aFree && !bFree) continue
        const share = aFree && bFree ? 0.5 : 1
        if (aFree) {
          pa.x += dx * diff * share
          pa.y += dy * diff * share
          pa.z += dz * diff * share
        }
        if (bFree) {
          pb.x -= dx * diff * share
          pb.y -= dy * diff * share
          pb.z -= dz * diff * share
        }
      }
    }

    resolveSelfCollisions(particles, dragRef.current.index)

    const position = geometry.attributes.position
    for (let i = 0; i < particles.length; i++) {
      position.setXYZ(i, particles[i].x, particles[i].y, particles[i].z)
    }
    position.needsUpdate = true
    geometry.computeVertexNormals()
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <meshStandardMaterial
        map={colorMap}
        alphaMap={fabricMaps.alphaMap}
        aoMap={fabricMaps.aoMap}
        bumpMap={fabricMaps.bumpMap}
        bumpScale={FABRIC_BUMP_SCALE}
        normalMap={fabricMaps.normalMap}
        metalness={metalness}
        roughness={roughness}
        transparent
        side={DoubleSide}
        onBeforeCompile={handleBeforeCompile}
      />
    </mesh>
  )
}
