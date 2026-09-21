// Traveling Patronage — an ongoing project turning travel observations into
// wearable silk scarf designs, one city at a time.
const PARIS_IMG = '/worlds/traveling-patronage/paris-2026'
const MEXICO_IMG = '/worlds/traveling-patronage/mexico-city-2024'
const BUENOS_AIRES_IMG = '/worlds/traveling-patronage/buenos-aires-2019'

// The "try it on the cloth" gallery — grouped by edition (3 pattern slots
// each, matching how many designs an edition holds), newest edition first.
// `map` is each pattern's own printed artwork (the only per-pattern texture);
// the fabric material itself — alpha/ao/height/normal — is shared across
// every pattern (same physical silk) and lives in ClothPlane's FABRIC_MAPS,
// not here. Empty slots (`map: null`) are real designs still waiting to be
// delivered.
export const CLOTH_GALLERY = [
  {
    slug: 'paris-2026',
    city: 'Paris',
    year: 2026,
    patterns: [
      { id: 'coeur-du-serpent', label: 'Cœur du Serpent', map: `${PARIS_IMG}/cloth/coeur-du-serpent-base.jpg` },
      { id: 'lapin-dans-le-ciel', label: 'Le Lapin Dans le Ciel', map: `${PARIS_IMG}/cloth/lapin-dans-le-ciel-base.jpg` },
      {
        id: 'escargots-de-linfini',
        label: "Les Escargots de L'Infini",
        map: `${PARIS_IMG}/cloth/escargots-de-linfini-base.jpg`,
      },
    ],
  },
  {
    slug: 'mexico-city-2024',
    city: 'Mexico City',
    year: 2024,
    patterns: [
      { id: 'mexico-1', label: "PST It's Mexico", map: `${MEXICO_IMG}/cloth/mexico-1-base.jpg` },
      { id: 'mexico-2', label: 'The Holy Rabbiton', map: `${MEXICO_IMG}/cloth/mexico-2-base.jpg` },
      { id: 'mexico-3', label: 'Time Is Running Out', map: `${MEXICO_IMG}/cloth/mexico-3-base.jpg` },
    ],
  },
  {
    // Was 2018 in this data (and briefly called 2016 in conversation) —
    // 2019 is confirmed correct, and matches the original edition intro
    // text ("born from a 2019 trip through Buenos Aires").
    slug: 'buenos-aires-2019',
    city: 'Buenos Aires',
    year: 2019,
    patterns: [
      { id: 'buenos-aires-1', label: 'EYJA', map: `${BUENOS_AIRES_IMG}/cloth/buenos-aires-1-base.jpg` },
      { id: 'buenos-aires-2', label: 'JAMO', map: `${BUENOS_AIRES_IMG}/cloth/buenos-aires-2-base.jpg` },
      { id: 'buenos-aires-3', label: 'OAYE', map: `${BUENOS_AIRES_IMG}/cloth/buenos-aires-3-base.jpg` },
    ],
  },
]
