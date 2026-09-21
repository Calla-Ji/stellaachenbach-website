// Industrial-glass HUD chrome — built from the brand kit's own component
// language (glassmorphic panel, real backdrop-blur, soft elevation), not
// borrowed sci-fi/game skin.

export function HudPanel({ rows, className = '' }) {
  return (
    <div
      className={`rounded-sm border border-neutron/15 bg-supernova/60 backdrop-blur-md shadow-[0_10px_30px_-10px_rgba(19,23,24,0.25)] ${className}`}
    >
      <div className="flex flex-col divide-y divide-neutron/10">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-baseline justify-between gap-4 px-3 py-1.5"
          >
            <span className="font-display text-[10px] tracking-[0.2em] uppercase text-wormhole">
              {label}
            </span>
            <span className="text-[11px] tracking-[0.1em] uppercase text-neutron">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
