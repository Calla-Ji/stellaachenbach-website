// Pins for the 3D mood board on the InterSTELLAr Paradise page — most don't
// have real WIP screenshots yet, so those fall back to numbered color
// swatches (same honesty as the cloth gallery's "Soon" slots) standing in
// for actual concept art/renders. Set `image` (a static photo) or `video` (a
// looping, muted, autoplaying clip) — matching its real aspect ratio in
// `width`/`height` so the texture doesn't stretch — once real content exists
// for a slot; MoodBoardScene renders it instead of the placeholder
// automatically. `video` takes priority if both are somehow set.
//
// `label` is the pin's reference number — no longer rendered on the board
// itself (that was a temporary aid while Stella supplied captions by
// number), but still used as alt text and kept in sync with array order.
// `description` is the short explainer shown in the Lightbox when a pin is
// enlarged; leave it '' for a pin that doesn't have real caption text yet.
//
// Position/size/rotation live per-item (not a separate shared layout) so a
// hand-arranged, overlapping "pinned board" collage is fully authorable here.
export const MOODBOARD_ITEMS = [
  {
    id: 'concept-sketch',
    label: '01',
    description: 'First building blockouts in Blender, planning additional elements across the island map.',
    color: '#E0D1D4',
    image: '/worlds/interstellar-paradise/concept-sketch.jpg',
    // Real image is ~1.858:1 — width/height matched to that so the texture
    // doesn't stretch on a differently-proportioned plane.
    width: 1.21,
    height: 0.65,
    x: -1.75,
    y: 0.55,
    rotation: -0.03,
  },
  {
    id: 'blender-blockout',
    label: '02',
    description: 'Preview of the Stella Achenbach logo animation, in front of the entrance building.',
    color: '#4E5455',
    image: null,
    video: '/worlds/interstellar-paradise/blender-blockout.mp4',
    // Real video is 1920x1080 (16:9) — reformatted from the original
    // portrait placeholder so the actual footage isn't stretched/cropped.
    width: 1.0,
    height: 0.5625,
    x: -0.65,
    y: 0.25,
    rotation: 0.16,
  },
  {
    id: 'lighting-test',
    label: '03',
    description: 'Seat testing for the interview space at the center of the entrance building.',
    color: '#FF99D8',
    image: '/worlds/interstellar-paradise/lighting-test.webp',
    // Real image is ~1.852:1 — width/height matched to that so the texture
    // doesn't stretch on a differently-proportioned plane. Saved as WebP
    // (not JPEG) since this one has real alpha transparency to preserve.
    width: 0.85,
    height: 0.459,
    x: 0.35,
    y: 0.68,
    rotation: -0.14,
  },
  {
    id: 'wip-04',
    label: '04',
    description:
      'The entry portal onto the island itself — buys loading time and doubles as a transition space into the level.',
    color: '#E0D1D4',
    image: null,
    video: '/worlds/interstellar-paradise/wip-04.mp4',
    // Real video is 1920x1080 (16:9) — sits just below Lighting Test (03).
    width: 0.8,
    height: 0.45,
    x: 0.45,
    y: 0.08,
    rotation: 0.12,
  },
  {
    id: 'environment-ref',
    label: '05',
    description:
      "The finalized main exhibition hall, at the island's lower end — a relaxation area, an entertainment space, and two exhibition wings.",
    color: '#FEE6EA',
    image: '/worlds/interstellar-paradise/item-05.webp',
    // Real image is ~1.856:1 — width/height matched to that so the texture
    // doesn't stretch. Saved as WebP (not JPEG) since this one has real
    // alpha transparency to preserve.
    width: 1.2,
    height: 0.647,
    x: 1.55,
    y: 0.45,
    rotation: 0.03,
  },
  {
    id: 'ue5-screenshot',
    label: '06',
    description: 'Second blockout pass, with a finalized sketch of the main exhibition hall.',
    color: '#131718',
    image: '/worlds/interstellar-paradise/ue5-screenshot.jpg',
    // Real image is ~1.856:1 — same reasoning as concept-sketch above.
    width: 1.11,
    height: 0.6,
    x: -1.5,
    y: -0.5,
    rotation: 0.1,
  },
  {
    id: 'texture-study',
    label: '07',
    description: "Totem pole blockouts — entry portals into InterSTELLAr Paradise's additional gamified levels.",
    color: '#E0D1D4',
    image: '/worlds/interstellar-paradise/texture-study.jpg',
    // Real image is ~1.854:1 — width/height matched to that so the texture
    // doesn't stretch on a differently-proportioned plane.
    width: 0.9,
    height: 0.485,
    x: -0.3,
    y: -0.45,
    rotation: -0.03,
  },
  {
    id: 'mood-reference',
    label: '09',
    description: 'One of the side pavilions in Blender, built for private or restricted use.',
    color: '#FF99D8',
    image: '/worlds/interstellar-paradise/item-08.jpg',
    // Real image is ~1.896:1 (landscape) — the old placeholder guessed
    // portrait, so width/height are updated to match the real ratio rather
    // than cropping/stretching it to fit the old footprint.
    width: 1.2,
    height: 0.633,
    x: 1.7,
    y: -0.29,
    rotation: -0.1,
  },
  {
    id: 'wip-08',
    label: '08',
    description: "Height map exported from Blender's island model, for a one-shot import into UE5's landscape editor.",
    color: '#4E5455',
    image: '/worlds/interstellar-paradise/item-08b.jpg',
    // Real image is 1:1 — matches the placeholder's square footprint
    // exactly. Sits after (so it stacks on top of) the mood reference photo
    // (09), just barely clipping its lower-left corner, and also just
    // barely clips Blender Blockout's follow-up video (04) above it.
    width: 0.75,
    height: 0.75,
    x: 0.78,
    y: -0.55,
    rotation: 0.02,
  },
]
