'use client'

import type { CSSProperties } from 'react'
import { ESTADOS } from './StatusChip'
import { concepto as buscar } from '@/lib/data'
import { padres } from '@/lib/graph'
import type { Concepto, Estado } from '@/lib/types'

export type ModoNodo = 'normal' | 'foco' | 'ancestro' | 'apagado'

interface Props {
  concepto: Concepto
  estado?: Estado
  modo?: ModoNodo
  /** Retraso (ms) para que los nodos se iluminen en cadena. */
  retraso?: number
  fijado?: boolean
  style?: CSSProperties
  onActivar?: (id: string) => void
  onDesactivar?: () => void
  onFijar?: (id: string) => void
}

const colorEstado: Record<Estado, string> = {
  dominado: 'bg-dom-bg text-dom border-dom/30',
  parcial: 'bg-par-bg text-par border-par/30',
  brecha: 'bg-bre-bg text-bre border-bre/30',
  'sin-evidencia': 'bg-white text-ink-2 borde-punteado',
}

export function ConceptNode({ concepto, estado, modo = 'normal', retraso = 0, fijado = false, style, onActivar, onDesactivar, onFijar }: Props) {
  const conEstado = Boolean(estado)
  let color: string
  if (concepto.objetivo) color = 'bg-ink text-white border-ink'
  else if (estado) color = colorEstado[estado]
  else color = 'bg-white text-ink border-line'

  let resalte = ''
  if (modo === 'foco') {
    resalte = conEstado || concepto.objetivo ? 'ring-2 ring-accent ring-offset-2' : 'bg-accent! text-white! border-accent! ring-2 ring-accent/25 ring-offset-1'
  } else if (modo === 'ancestro') {
    resalte = conEstado ? 'ring-2 ring-accent ring-offset-1' : 'bg-accent-soft! text-accent! border-accent!'
  } else if (modo === 'apagado') {
    resalte = conEstado ? 'opacity-60' : 'opacity-50'
  }

  const prereqs = padres(concepto.id).map((p) => buscar(p).nombre)
  const aria = [
    concepto.nombre,
    concepto.objetivo ? 'objetivo' : estado ? ESTADOS[estado].etiqueta : null,
    prereqs.length ? `requiere ${prereqs.join(' y ')}` : concepto.objetivo ? null : 'sin prerrequisitos en el mapa',
  ]
    .filter(Boolean)
    .join('. ')

  return (
    <button
      type="button"
      aria-label={aria}
      aria-pressed={fijado}
      onMouseEnter={() => onActivar?.(concepto.id)}
      onFocus={() => onActivar?.(concepto.id)}
      onBlur={() => onDesactivar?.()}
      onClick={() => onFijar?.(concepto.id)}
      style={{ ...style, transitionDelay: `${retraso}ms` }}
      className={`absolute flex min-h-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[10px] border px-1.5 text-center text-[12.5px] leading-tight font-medium transition-[background-color,border-color,box-shadow,opacity,color] duration-200 ease-out @[540px]:text-sm ${color} ${resalte} ${fijado ? 'outline-2 outline-offset-3 outline-ink' : ''}`}
    >
      <span className="line-clamp-2">{concepto.corto}</span>
      {estado && !concepto.objetivo && (
        <span
          aria-hidden="true"
          className={`absolute -top-2 -right-2 grid size-5 place-items-center rounded-full border bg-white font-mono text-[10px] font-medium ${
            estado === 'sin-evidencia' ? 'borde-punteado text-ink-2' : colorEstado[estado].split(' ').filter((c) => c.startsWith('text-') || c.startsWith('border-')).join(' ')
          }`}
        >
          {ESTADOS[estado].letra}
        </span>
      )}
      {concepto.objetivo && (
        <span aria-hidden="true" className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-ink bg-white px-1.5 font-mono text-[9px] uppercase tracking-wider text-ink">
          Objetivo
        </span>
      )}
    </button>
  )
}
