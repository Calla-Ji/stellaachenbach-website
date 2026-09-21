// The four HUD quadrant labels — echo the tagline itself
// ("Design Alchemist — Tools · Worlds · Systems") plus Thoughts.
// `links` are the sub-items revealed on hover/click — only wired up for
// Tools for now, as a first pass.
export const HUD_MENU_ITEMS = [
  {
    id: 'tools',
    label: 'Tools',
    links: [
      { label: 'Creator Branding', href: 'https://creator-branding.com' },
      { label: 'Creator Pricing', href: 'https://creatorpricing.com' },
      { label: 'Creator Contract Builder', href: 'https://creatorcontractbuilder.com' },
    ],
  },
  {
    id: 'worlds',
    label: 'Worlds',
    links: [
      { label: 'Traveling Patronage', href: '/worlds/traveling-patronage' },
      { label: 'InterSTELLAr Paradise', href: '/worlds/interstellar-paradise' },
      { label: 'La Reina de la Casa', href: '/worlds/la-reina-de-la-casa' },
      { label: 'Sea Breeze', href: '/worlds/sea-breeze' },
    ],
  },
  {
    id: 'systems',
    label: 'Systems',
    links: [
      { label: 'ALANA Calculator', href: 'https://contributions.the-alana-project.xyz/' },
      { label: 'adoptame.pe', href: 'https://adoptame.pe' },
    ],
  },
  {
    id: 'thoughts',
    label: 'Thoughts',
    links: [
      { label: "Stella's Blog", href: '/blog', newTab: true },
      { label: "ALANA's Blog", href: 'https://paragraph.xyz/@the-alana-project' },
    ],
  },
]
