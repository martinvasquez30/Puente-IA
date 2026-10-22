'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AvisoEjemplo } from './AvisoEjemplo'
import { Etiqueta } from '@/components/ui/Badges'
import { ConceptDetail } from '@/components/ui/ConceptDetail'
import { CoverageBar, IntervaloMini } from '@/components/ui/CoverageBar'
import { RichText } from '@/components/ui/Formula'
import { PrereqGraph } from '@/components/ui/PrereqGraph'
import { ESTADOS, ORDEN_ESTADOS, StatusChip } from '@/components/ui/StatusChip'
import { concepto, conceptosEvaluables } from '@/lib/data'
import { fraseEvidencia } from '@/lib/profile'
import { borrarResultado } from '@/lib/storage'
import type { Estado, Estimacion, Perfil } from '@/lib/types'
import { usePerfil } from '@/lib/usePerfil'

const EXPLICACION: Record<Estado, string> = {
  brecha: 'La evidencia muestra que hoy este concepto no está firme. Aquí está lo que más conviene trabajar.',
  parcial: 'Hay señales mixtas o la evidencia es indirecta. Puede bastar un repaso corto.',
  dominado: 'Respondiste bien lo que medía este concepto. No lo vamos a repetir.',
  'sin-evidencia': 'Aún no sabemos: ninguna pregunta lo midió todavía. Lo revisa el próximo mini-diagnóstico.',
}

function resumenEvidencia(e: Estimacion) {
  const directas = e.evidencias.filter((x) => x.directa).length
  const indirectas = e.evidencias.length - directas
  const partes = []
  if (directas) partes.push(`${directas} pregunta${directas > 1 ? 's' : ''} directa${directas > 1 ? 's' : ''}`)
  if (indirectas) partes.push(`${indirectas} indirecta${indirectas > 1 ? 's' : ''}`)
  return partes.join(' · ') || 'Sin preguntas'
}

export function PerfilView() {
  const { perfil, ejemplo, listo, conTests } = usePerfil()
  const router = useRouter()
  const [vista, setVista] = useState<'lista' | 'grafo'>('lista')
  const [foco, setFoco] = useState<string | null>(null)

  if (!listo || !perfil) return <div className="min-h-[60vh]" aria-busy="true" />

  const c = perfil.cobertura
  const estados = Object.fromEntries(Object.values(perfil.conceptos).map((e) => [e.id, e.estado])) as Record<string, Estado>

  return (
    <div>
      {ejemplo && <AvisoEjemplo />}

      <Etiqueta>Tu perfil</Etiqueta>
      <h2 className="mt-2 text-2xl leading-tight font-semibold sm:text-[28px]">Cómo llegas a Cálculo I</h2>
      <p className="mt-2 text-ink-2">
        Basado en {perfil.respondidas} respuestas del diagnóstico
        {perfil.noSe > 0 && `, ${perfil.noSe} de ellas con «Todavía no sé»`}
        {conTests && ', más tus tests de los módulos'}. El tiempo que te tomaste no influye en este perfil.
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section aria-labelledby="cobertura-titulo" className="rounded-[18px] border border-line bg-white p-5 sm:p-6">
          <h2 id="cobertura-titulo" className="sr-only">
            Cobertura de prerrequisitos
          </h2>
          <p className="font-mono text-5xl font-medium tracking-tight">
            {Math.round(c.est * 100)}
            <span className="text-2xl text-ink-2">%</span>
          </p>
          <CoverageBar rango={c} className="mt-4" />
          <p className="text-[15px] text-ink-2">
            Es nuestra mejor estimación de cuánto de los prerrequisitos ya tienes. El rango es amplio porque{' '}
            {perfil.sinEvidencia > 0 && `${perfil.sinEvidencia} conceptos aún no tienen evidencia y `}el resto se basa en pocas preguntas. Se
            achica con cada mini-diagnóstico.
          </p>
        </section>

        <EmpiezaAqui perfil={perfil} />
      </div>

      <section aria-labelledby="conceptos-titulo" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="conceptos-titulo" className="text-2xl font-semibold">
            Concepto por concepto
          </h2>
          <div role="tablist" aria-label="Vista del perfil" className="inline-flex rounded-[12px] border border-line bg-panel p-1">
            {(['lista', 'grafo'] as const).map((v) => (
              <button
                key={v}
                role="tab"
                id={`tab-${v}`}
                aria-selected={vista === v}
                aria-controls={`panel-${v}`}
                tabIndex={vista === v ? 0 : -1}
                onClick={() => setVista(v)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                    const otra = v === 'lista' ? 'grafo' : 'lista'
                    setVista(otra)
                    document.getElementById(`tab-${otra}`)?.focus()
                  }
                }}
                className={`min-h-11 rounded-[9px] px-4 text-sm font-medium transition-colors duration-150 ${
                  vista === v ? 'bg-white text-ink shadow-[0_0_0_1px_var(--color-line)]' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {v === 'lista' ? 'Por estado' : 'Como mapa'}
              </button>
            ))}
          </div>
        </div>

        {vista === 'lista' ? (
          <div id="panel-lista" role="tabpanel" aria-labelledby="tab-lista" className="mt-6 grid gap-8 animate-aparecer">
            {ORDEN_ESTADOS.map((estado) => {
              const lista = conceptosEvaluables.filter((k) => perfil.conceptos[k.id].estado === estado)
              if (!lista.length) return null
              return (
                <div key={estado}>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold">
                      {ESTADOS[estado].etiqueta}
                      <span className="ml-2 font-mono text-base font-normal text-ink-2">{lista.length}</span>
                    </h3>
                  </div>
                  <p className="mt-1 text-sm text-ink-2">{EXPLICACION[estado]}</p>
                  <ul className="mt-3 grid gap-2 md:grid-cols-2">
                    {lista.map((k) => {
                      const e = perfil.conceptos[k.id]
                      return (
                        <li key={k.id} className="rounded-[14px] border border-line bg-white">
                          <details className="group">
                            <summary className="flex min-h-11 cursor-pointer list-none flex-col gap-2.5 p-4 [&::-webkit-details-marker]:hidden">
                              <span className="flex items-start justify-between gap-3">
                                <span className="font-medium">{k.nombre}</span>
                                <StatusChip estado={e.estado} tamano="sm" />
                              </span>
                              <IntervaloMini media={e.media} lo={e.lo} hi={e.hi} etiqueta={k.nombre} />
                              <span className="flex items-center justify-between font-mono text-xs text-ink-2">
                                <span>{resumenEvidencia(e)}</span>
                                <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap">
                                  <span className="group-open:hidden">Evidencia</span>
                                  <span className="hidden group-open:inline">Ocultar</span>
                                  <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3 transition-transform duration-150 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <path d="M2 4l4 4 4-4" />
                                  </svg>
                                </span>
                              </span>
                            </summary>
                            <div className="border-t border-line px-4 py-3 text-sm text-ink-2">
                              {e.evidencias.length ? (
                                <ul className="grid gap-1.5">
                                  {e.evidencias.map((ev, i) => (
                                    <li key={i}>
                                      <RichText texto={fraseEvidencia(ev, k.id)} />
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p>Ninguna pregunta de esta versión midió este concepto.</p>
                              )}
                            </div>
                          </details>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            id="panel-grafo"
            role="tabpanel"
            aria-labelledby="tab-grafo"
            className="mt-6 grid gap-6 animate-aparecer lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start"
          >
            <div className="rounded-[18px] border border-line bg-white p-3 sm:p-6">
              <PrereqGraph estados={estados} onFoco={setFoco} etiqueta="Tu perfil como mapa de prerrequisitos" />
              <p className="mt-2 px-1 text-xs text-ink-2">Cada concepto lleva su letra: D dominado, P parcial, B brecha crítica, ? sin evidencia.</p>
            </div>
            <div className="lg:sticky lg:top-20">
              <ConceptDetail
                id={foco}
                estimacion={foco ? perfil.conceptos[foco] : undefined}
                vacio="Toca o enfoca un concepto para ver qué sabemos de él y de qué depende. Se iluminan sus prerrequisitos."
              />
            </div>
          </div>
        )}
      </section>

      <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">
          Cómo leer las barras: el punto es la estimación; la franja gris, el rango probable. Una franja ancha significa que todavía sabemos poco.
        </p>
        <button
          type="button"
          onClick={() => {
            borrarResultado()
            router.push('/diagnostico/prueba')
          }}
          className="min-h-11 shrink-0 rounded-[10px] border border-line px-4 text-sm font-medium hover:border-ink-2/50"
        >
          {ejemplo ? 'Hacer el diagnóstico' : 'Rehacer el diagnóstico'}
        </button>
      </div>
    </div>
  )
}

function EmpiezaAqui({ perfil }: { perfil: Perfil }) {
  const e = perfil.empezar
  if (!e) {
    return (
      <section className="rounded-[18px] border border-line bg-panel p-5 sm:p-6">
        <h2 className="text-xl font-semibold">No encontramos brechas con esta evidencia</h2>
        <p className="mt-2 text-ink-2">
          Puede que llegues bien preparado o que falte información. El próximo mini-diagnóstico revisa los conceptos sin evidencia.
        </p>
      </section>
    )
  }
  const k = concepto(e.id)
  return (
    <section aria-labelledby="empieza-titulo" className="rounded-[18px] border border-accent bg-white p-5 ring-4 ring-accent-soft sm:p-6">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">Empieza por aquí</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h2 id="empieza-titulo" className="text-2xl font-semibold">
          {k.nombre}
        </h2>
        <StatusChip estado={perfil.conceptos[e.id].estado} tamano="sm" />
      </div>
      <p className="mt-3 text-sm font-medium">Por qué, según tus respuestas:</p>
      <ul className="mt-1.5 grid gap-1.5 text-[15px] text-ink-2">
        {e.razones.map((r, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
            <RichText texto={r} />
          </li>
        ))}
      </ul>
      {e.desbloquea.length > 0 && (
        <p className="mt-3 text-sm">
          <span className="text-ink-2">Desbloquea: </span>
          {e.desbloquea.map((d) => concepto(d).corto).join(' · ')}
        </p>
      )}
      <Link
        href="/diagnostico/ruta"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6] sm:w-auto"
      >
        Ver mi ruta completa
      </Link>
    </section>
  )
}
