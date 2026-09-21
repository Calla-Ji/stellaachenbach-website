import { Link } from 'react-router-dom'

// Shared across every blog card (pinned hero, list rows, and anywhere else a
// post gets linked to, e.g. the Worlds cloth gallery) — colors invert
// (supernova/neutron swap) on hover and while held down, not just dimmed.
// `variant="light"` (default) is for sitting on a dark photo backdrop;
// `variant="dark"` starts pre-inverted for a plain supernova page
// background, where a light-on-light button would be unreadable at rest.
export function ReadNowButton({ slug, variant = 'light', className = '', style }) {
  const colors =
    variant === 'dark'
      ? 'bg-neutron text-supernova hover:bg-supernova hover:text-neutron active:bg-supernova active:text-neutron'
      : 'bg-supernova text-neutron hover:bg-neutron hover:text-supernova active:bg-neutron active:text-supernova'
  return (
    <Link
      to={`/blog/${slug}`}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className={`font-display inline-block rounded-[4px] border border-current px-5 py-2 text-xs uppercase tracking-[0.15em] transition-colors ${colors} ${className}`}
    >
      Read Now
    </Link>
  )
}
