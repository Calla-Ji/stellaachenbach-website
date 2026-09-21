// A single mixed-media strip for the Sea Breeze case study — images keep
// Stella's original pasted order; the two videos are interleaved between
// them rather than tacked on at an end. Each item renders at a fixed height
// with its natural aspect ratio (no width stored here — the browser derives
// it from the media itself), so the row reads as a proper filmstrip.
export const SEA_BREEZE_GALLERY = [
  { id: 'sb-1', type: 'image', src: '/worlds/sea-breeze/sea-breeze-1.jpg' },
  { id: 'sb-5', type: 'video', src: '/worlds/sea-breeze/sea-breeze-5.mp4' },
  { id: 'sb-2', type: 'image', src: '/worlds/sea-breeze/sea-breeze-2.jpg' },
  { id: 'sb-6', type: 'video', src: '/worlds/sea-breeze/sea-breeze-6.mp4' },
  { id: 'sb-3', type: 'image', src: '/worlds/sea-breeze/sea-breeze-3.jpg' },
  { id: 'sb-7', type: 'video', src: '/worlds/sea-breeze/sea-breeze-7.mp4' },
  { id: 'sb-4', type: 'image', src: '/worlds/sea-breeze/sea-breeze-4.jpg' },
]

// Work-in-progress screenshots — same filmstrip treatment as the finished
// gallery above, kept as a separate list/section so the two don't mix.
export const SEA_BREEZE_WIP_GALLERY = [
  {
    id: 'sb-wip-1',
    type: 'image',
    src: '/worlds/sea-breeze/sea-breeze-wip-1.png',
    description: 'Mood board by Laura Senkute at SENK DESIGN.',
  },
  { id: 'sb-wip-2', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-2.png' },
  { id: 'sb-wip-3', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-3.png' },
  { id: 'sb-wip-4', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-4.png' },
  { id: 'sb-wip-5', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-5.png' },
  { id: 'sb-wip-6', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-6.png' },
  { id: 'sb-wip-7', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-7.png' },
  { id: 'sb-wip-8', type: 'image', src: '/worlds/sea-breeze/sea-breeze-wip-8.png' },
]
