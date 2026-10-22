'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { ConceptNode, type ModoNodo } from './ConceptNode'
import { aristas, conceptos } from '@/lib/data'
import { ancestros } from '@/lib/graph'
import type { Estado } from '@/lib/types'

interface Props {
  /** Estado por concepto (vista de perfil). Sin estados, el grafo es neutro. */
  estados?: Record<string, Estado>
  etiqueta?: string
  /** Concepto fijado al inicio. */
  inicial?: string | null
  onFoco?: (id: string | null) => void
  className?: string
}

const PASO_CADENA = 110 // ms entre un nivel y el siguiente al iluminarse

export function PrereqGraph({ estados, etiqueta = 'Mapa de prerrequisitos hacia Cálculo I', inicial = null, onFoco, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [ancho, setAncho] = useState(0)
  const [hover, setHover] = useState<string | null>(null)
  const [fijado, setFijado] = useState<string | null>(inicial)
  const foco = hover ?? fijado

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    onFoco?.(foco)
  }, [foco, onFoco])

  const compacto = ancho === 0 || ancho < 540
  const filaAlto = compacto ? 80 : 94
  const nodoAlto = compacto ? 46 : 52
  const filas = Math.max(...conceptos.map((c) => c.fila)) + 1
  const alto = filas * filaAlto

  const distancias = useMemo(() => (foco ? ancestros(foco) : null), [foco])
  const modo = (id: string): ModoNodo => {
    if (!foco) return 'normal'
    if (id === foco) return 'foco'
    if (distancias?.has(id)) return 'ancestro'
    return 'apagado'
  }

  const pos = (id: string) => {
    const c = conceptos.find((k) => k.id === id)!
    return { x: c.x * ancho, y: (c.fila + 0.5) * filaAlto }
  }

  return (
    <div
      ref={ref}
      role="group"
      aria-label={etiqueta}
      className={`@container relative w-full ${className}`}
      style={{ height: alto }}
      onMouseLeave={() => setHover(null)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setFijado(null)
          setHover(null)
        }
      }}
    >
      {ancho > 0 && (
        <svg aria-hidden="true" className="absolute inset-0" width={ancho} height={alto}>
          <defs>
            <marker id={`${uid}-n`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#B4C0CF" />
            </marker>
            <marker id={`${uid}-a`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="#2448C8" />
            </marker>
          </defs>
          {aristas.map((a) => {
            const p1 = pos(a.desde)
            const p2 = pos(a.hacia)
            const y1 = p1.y + nodoAlto / 2
            const y2 = p2.y - nodoAlto / 2 - 3
            const dy = (y2 - y1) / 2
            const activa = Boolean(
              distancias && distancias.has(a.desde) && (a.hacia === foco || distancias.has(a.hacia)),
            )
            const atenuada = Boolean(foco) && !activa
            const retraso = activa ? Math.max(0, (distancias!.get(a.desde)! - 0.5) * PASO_CADENA) : 0
            return (
              <path
                key={`${a.desde}-${a.hacia}`}
                d={`M ${p1.x} ${y1} C ${p1.x} ${y1 + dy}, ${p2.x} ${y2 - dy}, ${p2.x} ${y2}`}
                fill="none"
                stroke={activa ? '#2448C8' : '#B4C0CF'}
                strokeWidth={activa ? 2 : 1.25}
                markerEnd={`url(#${uid}-${activa ? 'a' : 'n'})`}
                style={{
                  opacity: atenuada ? 0.35 : 1,
                  transition: 'stroke 200ms ease-out, opacity 200ms ease-out, stroke-width 200ms ease-out',
                  transitionDelay: `${retraso}ms`,
                }}
              />
            )
          })}
        </svg>
      )}
      <ul className="contents">
        {conceptos.map((c) => {
          const m = modo(c.id)
          const d = distancias?.get(c.id) ?? 0
          return (
            <li key={c.id} className="contents">
              <ConceptNode
                concepto={c}
                estado={estados?.[c.id]}
                modo={m}
                retraso={m === 'ancestro' ? d * PASO_CADENA : 0}
                fijado={fijado === c.id}
                onActivar={setHover}
                onDesactivar={() => setHover(null)}
                onFijar={(id) => setFijado((f) => (f === id ? null : id))}
                style={{
                  left: `${c.x * 100}%`,
                  top: (c.fila + 0.5) * filaAlto,
                  width: 'clamp(92px, 27%, 172px)',
                  height: nodoAlto,
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
