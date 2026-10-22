'use client'

import { useEffect, useState } from 'react'
import type { Rango } from '@/lib/types'

interface Props {
  rango: Rango
  etiqueta?: string
  tamano?: 'lg' | 'sm'
  animar?: boolean
  className?: string
}

const p = (x: number) => Math.round(x * 100)

/** Barra de cobertura con el intervalo de confianza dibujado encima. */
export function CoverageBar({ rango, etiqueta = 'Cobertura de prerrequisitos', tamano = 'lg', animar = true, className = '' }: Props) {
  const [lleno, setLleno] = useState(!animar)
  useEffect(() => {
    if (!animar) return
    const id = window.setTimeout(() => setLleno(true), 30)
    return () => window.clearTimeout(id)
  }, [animar])

  const est = p(rango.est)
  const lo = p(rango.lo)
  const hi = p(rango.hi)
  const alto = tamano === 'lg' ? 'h-4' : 'h-2.5'

  return (
    <div className={className}>
      {tamano === 'lg' && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium text-ink-2">{etiqueta}</span>
          <span className="font-mono text-sm text-ink-2">
            rango {lo}–{hi}%
          </span>
        </div>
      )}
      <div
        role="meter"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={est}
        aria-valuetext={`Estimación ${est}%, con un rango probable entre ${lo}% y ${hi}%`}
        className={`relative ${alto} w-full rounded-full border border-line bg-panel`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-250 ease-out"
          style={{ width: lleno ? `${est}%` : '0%' }}
        />
        {/* Intervalo: corchete sobre la barra */}
        <div
          aria-hidden="true"
          className="absolute -inset-y-1.5 rounded-[4px] border-x-2 border-ink transition-opacity delay-150 duration-200"
          style={{ left: `${lo}%`, width: `${Math.max(hi - lo, 1)}%`, opacity: lleno ? 1 : 0 }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-ink/50" />
        </div>
      </div>
      {tamano === 'lg' && (
        <div aria-hidden="true" className="relative mt-2 h-5 font-mono text-xs text-ink-2">
          <span className="absolute -translate-x-1/2" style={{ left: `${Math.min(Math.max(lo, 4), 96)}%` }}>
            {lo}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${Math.min(Math.max(hi, 4), 96)}%` }}>
            {hi}
          </span>
        </div>
      )}
    </div>
  )
}

/** Mini-intervalo para un concepto: punto (estimación) y segmento (rango). */
export function IntervaloMini({ media, lo, hi, etiqueta }: { media: number | null; lo: number; hi: number; etiqueta: string }) {
  if (media === null) {
    return (
      <div
        role="img"
        aria-label={`${etiqueta}: sin evidencia, el rango va de 0 a 100%`}
        className="relative h-2 w-full rounded-full borde-punteado"
      />
    )
  }
  return (
    <div
      role="img"
      aria-label={`${etiqueta}: estimación ${p(media)}%, rango entre ${p(lo)}% y ${p(hi)}%`}
      className="relative h-2 w-full rounded-full bg-panel ring-1 ring-line ring-inset"
    >
      <div className="absolute inset-y-0 rounded-full bg-ink/25" style={{ left: `${p(lo)}%`, width: `${p(hi) - p(lo)}%` }} />
      <div
        className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink"
        style={{ left: `${p(media)}%` }}
      />
    </div>
  )
}
