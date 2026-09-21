import { useState } from 'react'
import { Link } from 'react-router-dom'

const STAGGER_MS = 70

// Quadrant readout, Starfield-menu style. Label follows the brand kit's
// section-header convention ("// LABEL"), same as About's "// Identity".
// The rule underneath is invisible until hover/click, then draws itself
// in (width 0 -> full) — never present beforehand. Sub-links (if any)
// slide in one after another, staggered by index.
export function HudCategoryPanel({ label, align = 'left', links = [], direction = 'down' }) {
  const [open, setOpen] = useState(false)
  const alignClass = align === 'right' ? 'items-end text-right' : 'items-start text-left'
  // 'up' panels keep the label anchored where it is and unfold the rule +
  // links above it instead of below — column-reverse puts the first DOM
  // child (the label) at the bottom of the stack rather than the top.
  const colClass = direction === 'up' ? 'flex-col-reverse' : 'flex-col'
  const closedOffset = direction === 'up' ? 'translateY(6px)' : 'translateY(-6px)'

  return (
    <div
      className={`flex ${colClass} gap-1.5 ${alignClass}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="font-display text-base font-medium uppercase tracking-[0.2em] text-pink-dwarf"
      >
        {`// ${label}`}
      </button>

      <span
        className="h-px bg-neutron transition-[width] duration-300 ease-out"
        style={{ width: open ? '9rem' : '0px' }}
      />

      {links.length > 0 && (
        <div
          className={`flex ${colClass} gap-1 overflow-hidden`}
          style={{ maxHeight: open ? '160px' : '0px', transition: 'max-height 300ms ease-out' }}
        >
          {links.map((link, i) => {
            const itemStyle = {
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : closedOffset,
              transition: `opacity 250ms ease-out ${i * STAGGER_MS}ms, transform 250ms ease-out ${i * STAGGER_MS}ms`,
            }
            const isInternal = link.href?.startsWith('/')
            // Plain navigation, no background-location state — // Worlds
            // content is a real standalone page now, not a glass overlay
            // (that treatment stays reserved for // About / // Imprint).
            return isInternal ? (
              <Link
                key={link.label}
                to={link.href}
                target={link.newTab ? '_blank' : undefined}
                rel={link.newTab ? 'noopener noreferrer' : undefined}
                style={itemStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-wormhole hover:text-neutron"
              >
                {link.label}
              </Link>
            ) : link.href ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                style={itemStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-wormhole hover:text-neutron"
              >
                {link.label}
              </a>
            ) : (
              <span
                key={link.label}
                style={itemStyle}
                className="text-[11px] uppercase tracking-[0.1em] text-wormhole"
              >
                {link.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
