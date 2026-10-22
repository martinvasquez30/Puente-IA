'use client'

import { useState } from 'react'

/** Muestra un tooltip con el texto del elemento [data-tip] bajo el cursor. */
export function ZonaTooltip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [tip, setTip] = useState<{ x: number; y: number; texto: string } | null>(null)
  return (
    <div
      className={className}
      onMouseMove={(e) => {
        const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]')
        setTip(el ? { x: e.clientX, y: e.clientY, texto: el.dataset.tip! } : null)
      }}
      onMouseLeave={() => setTip(null)}
    >
      {children}
      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-72 rounded-[8px] bg-ink px-2.5 py-1.5 text-xs text-white"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          {tip.texto}
        </div>
      )}
    </div>
  )
}
