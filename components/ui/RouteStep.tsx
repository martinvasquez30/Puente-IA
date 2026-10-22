'use client'

import Link from 'next/link'
import { RichText } from './Formula'
import { StatusChip } from './StatusChip'
import { concepto as buscar } from '@/lib/data'
import type { EstadoPaso, Paso } from '@/lib/types'

export const ESTADOS_PASO: Record<EstadoPaso, { etiqueta: string; clase: string; marcador: string }> = {
  'en-curso': {
    etiqueta: 'En curso',
    clase: 'bg-accent text-white border-accent',
    marcador: 'bg-accent text-white border-accent',
  },
  disponible: {
    etiqueta: 'Disponible',
    clase: 'bg-accent-soft text-accent border-accent/30',
    marcador: 'bg-white text-accent border-accent',
  },
  bloqueado: {
    etiqueta: 'Bloqueado',
    clase: 'bg-panel text-ink-2 border-line',
    marcador: 'bg-panel text-ink-2 border-line',
  },
  diagnosticar: {
    etiqueta: 'Diagnosticar primero',
    clase: 'bg-white text-ink-2 borde-punteado',
    marcador: 'bg-white text-ink-2 borde-punteado',
  },
  objetivo: {
    etiqueta: 'Objetivo',
    clase: 'bg-ink text-white border-ink',
    marcador: 'bg-ink text-white border-ink',
  },
}

function IconoCandado() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="7" width="10" height="7" rx="1.5" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  )
}

function IconoObjetivo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.5" />
    </svg>
  )
}

interface Props {
  paso: Paso
  numero: number
  ultimo?: boolean
  compacto?: boolean
  /** Módulo que trabaja este paso. */
  href?: string
}

export function RouteStep({ paso, numero, ultimo = false, compacto = false, href }: Props) {
  const c = buscar(paso.id)
  const meta = ESTADOS_PASO[paso.estadoPaso]
  const enCurso = paso.estadoPaso === 'en-curso'

  return (
    <li className="relative flex gap-3 sm:gap-4">
      <div className="flex flex-col items-center">
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-full border font-mono text-sm ${meta.marcador}`}
          aria-hidden="true"
        >
          {paso.estadoPaso === 'bloqueado' ? <IconoCandado /> : paso.estadoPaso === 'objetivo' ? <IconoObjetivo /> : numero}
        </span>
        {!ultimo && <span aria-hidden="true" className={`w-px flex-1 ${enCurso ? 'bg-accent' : 'bg-line'}`} />}
      </div>

      <div className={`min-w-0 flex-1 ${ultimo ? '' : 'pb-6'}`}>
        <div
          className={`rounded-[14px] border p-4 ${enCurso ? 'border-accent bg-white ring-4 ring-accent-soft' : 'border-line bg-white'} ${
            paso.estadoPaso === 'objetivo' ? 'bg-panel' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium leading-none ${meta.clase}`}>
              {paso.estadoPaso === 'bloqueado' && <IconoCandado />}
              {meta.etiqueta}
            </span>
            {paso.estadoConcepto && <StatusChip estado={paso.estadoConcepto} tamano="sm" />}
          </div>
          <h3 className="mt-2 text-lg font-semibold leading-snug">
            <span className="sr-only">Paso {numero}: </span>
            {c.nombre}
          </h3>
          {!compacto && (
            <p className="mt-1 text-sm text-ink-2">
              <RichText texto={paso.porQue} />
            </p>
          )}
          {paso.requiere.length > 0 && paso.estadoPaso !== 'objetivo' && (
            <p className="mt-2 text-sm">
              <span className="text-ink-2">Se desbloquea con: </span>
              {paso.requiere.map((r) => buscar(r).nombre).join(', ')}
            </p>
          )}
          {href && !compacto && paso.estadoPaso !== 'objetivo' && (
            <div className="mt-3">
              {enCurso || paso.estadoPaso === 'disponible' ? (
                <Link
                  href={href}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-medium transition-colors duration-150 ${
                    enCurso ? 'bg-accent text-white hover:bg-[#1d3aa6]' : 'border border-line bg-white text-ink hover:border-ink-2/50'
                  }`}
                >
                  {enCurso ? 'Ir al módulo' : 'Ver el módulo'}
                  <span className="sr-only"> {c.nombre}</span>
                </Link>
              ) : (
                <Link href={href} className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
                  Ver el módulo<span className="sr-only"> {c.nombre}</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
