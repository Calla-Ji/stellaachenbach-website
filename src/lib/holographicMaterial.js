import { AdditiveBlending, BackSide, Color, DoubleSide, FrontSide, NormalBlending, ShaderMaterial } from 'three'

// Vendored from Anderson Mancini's "threejs-holographic-material" gist
// (https://gist.github.com/ektogamat/f33dce31ee3ab02ea68f7b7c18ecd016), not
// published as an npm package. Ported from the React-Three-Fiber
// `<HolographicMaterial>` JSX wrapper (built on drei's `shaderMaterial` +
// `extend`, meant for a single `<mesh>`) to a plain factory returning a
// real `THREE.ShaderMaterial` instance instead — NOVA's placeholder has
// several meshes sharing one skeleton, so this gets traversed onto all of
// them at once and driven by one shared `time` uniform, which the JSX/
// single-mesh pattern doesn't support.
const vertexShader = `
#define STANDARD

varying vec3 vViewPosition;

#ifdef USE_TRANSMISSION
varying vec3 vWorldPosition;
#endif

varying vec2 vUv;
varying vec4 vPos;
varying vec3 vNormalW;
varying vec3 vPositionW;

#include <common>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {
  #include <uv_vertex>
  #include <color_vertex>
  #include <morphcolor_vertex>

  #if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinbase_vertex>
    #include <skinnormal_vertex>
    #include <defaultnormal_vertex>
  #endif

  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <envmap_vertex>
  #include <fog_vertex>

  mat4 modelViewProjectionMatrix = projectionMatrix * modelViewMatrix;

  vUv = uv;
  vPos = projectionMatrix * modelViewMatrix * vec4( transformed, 1.0 );
  vPositionW = vec3( vec4( transformed, 1.0 ) * modelMatrix);
  vNormalW = normalize( vec3( vec4( normal, 0.0 ) * modelMatrix ) );

  gl_Position = modelViewProjectionMatrix * vec4( transformed, 1.0 );
}
`

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPositionW;
varying vec4 vPos;
varying vec3 vNormalW;

uniform float time;
uniform float fresnelOpacity;
uniform float scanlineSize;
uniform float fresnelAmount;
uniform float signalSpeed;
uniform float hologramBrightness;
uniform float hologramOpacity;
uniform bool blinkFresnelOnly;
uniform bool enableBlinking;
uniform vec3 hologramColor;

#include <clipping_planes_pars_fragment>

float flicker( float amt, float time ) {return clamp( fract( cos( time ) * 43758.5453123 ), amt, 1.0 );}

float random(in float a, in float b) { return fract((cos(dot(vec2(a,b) ,vec2(12.9898,78.233))) * 43758.5453)); }

void main() {
  #include <clipping_planes_fragment>

  vec2 vCoords = vPos.xy;
  vCoords /= vPos.w;
  vCoords = vCoords * 0.5 + 0.5;

  vec2 myUV = fract( vCoords );

  // Defines hologram main color
  vec4 hColor = vec4(hologramColor, mix(hologramBrightness, vUv.y, 0.5));

  // Add scanlines
  float scanlines = 10.;
  scanlines += 20. * sin(time *signalSpeed * 20.8 - myUV.y * 60. * scanlineSize);
  scanlines *= smoothstep(1.3 * cos(time *signalSpeed + myUV.y * scanlineSize), 0.78, 0.9);
  scanlines *= max(0.25, sin(time *signalSpeed) * 1.0);

  // Scanlines offsets
  float r = random(vUv.x, vUv.y);
  float g = random(vUv.y * 20.2, vUv.y * .2);
  float b = random(vUv.y * .9, vUv.y * .2);

  // Scanline composition
  hColor += vec4(r*scanlines, b*scanlines, r, 1.0) / 84.;

  vec4 scanlineMix = mix(vec4(0.0), hColor, hColor.a);

  // Calculates fresnel
  vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
  float fresnelEffect = dot(viewDirectionW, vNormalW) * (1.6 - fresnelOpacity/2.);
  fresnelEffect = clamp(fresnelAmount - fresnelEffect, 0., fresnelOpacity);

  // Blinking effect
  float blinkValue = enableBlinking ? 0.6 - signalSpeed : 1.0;
  float blink = flicker(blinkValue, time * signalSpeed * .02);

  // Final shader composition
  vec3 finalColor;

  if(blinkFresnelOnly){
    finalColor = scanlineMix.rgb + fresnelEffect * blink;
  }else{
    finalColor = scanlineMix.rgb * blink + fresnelEffect;
  }

  gl_FragColor = vec4( finalColor, hologramOpacity);
}
`

const SIDES = { FrontSide, BackSide, DoubleSide }

export function createHolographicMaterial({
  fresnelAmount = 0.45,
  fresnelOpacity = 1.0,
  scanlineSize = 8.0,
  hologramBrightness = 1.2,
  signalSpeed = 0.45,
  hologramColor = '#51a4de',
  enableBlinking = true,
  blinkFresnelOnly = true,
  enableAdditive = true,
  hologramOpacity = 1.0,
  side = 'FrontSide',
  clippingPlanes = null,
} = {}) {
  return new ShaderMaterial({
    // Unlike built-in materials, ShaderMaterial requires this explicit
    // opt-in — the renderer won't treat a user-authored shader as clipping-
    // aware just because `clippingPlanes` is set, since it can't know the
    // shader actually contains the clipping chunks.
    clipping: true,
    clippingPlanes,
    uniforms: {
      time: { value: 0 },
      fresnelOpacity: { value: fresnelOpacity },
      fresnelAmount: { value: fresnelAmount },
      scanlineSize: { value: scanlineSize },
      hologramBrightness: { value: hologramBrightness },
      signalSpeed: { value: signalSpeed },
      hologramColor: { value: new Color(hologramColor) },
      enableBlinking: { value: enableBlinking },
      blinkFresnelOnly: { value: blinkFresnelOnly },
      hologramOpacity: { value: hologramOpacity },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: SIDES[side] ?? FrontSide,
    blending: enableAdditive ? AdditiveBlending : NormalBlending,
  })
}
