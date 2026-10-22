'use client'

import { useMemo } from 'react'
import { AvisoEjemplo } from '@/components/perfil/AvisoEjemplo'
import { Etiqueta } from '@/components/ui/Badges'
import { RichText } from '@/components/ui/Formula'
import { RouteStep } from '@/components/ui/RouteStep'
import { moduloDeConcepto } from '@/data/modulos'
import { concepto } from '@/lib/data'
import { formatoFecha, proximoMiniDiagnostico } from '@/lib/fecha'
import { arista } from '@/lib/graph'
import { construirRuta } from '@/lib/route'
import { usePerfil } from '@/lib/usePerfil'

export function RutaView() {
  const { perfil, ejemplo, listo } = usePerfil()
  const ruta = useMemo(() => (perfil ? construirRuta(perfil) : null), [perfil])
  const fecha = useMemo(() => formatoFecha(proximoMiniDiagnostico()), [])

  if (!listo || !perfil || !ruta) return <div className="min-h-[60vh]" aria-busy="true" />

  const pendientes = ruta.pasos.filter((p) => p.estadoPaso !== 'objetivo')
  const enCurso = ruta.pasos.find((p) => p.estadoPaso === 'en-curso')
  const porDiagnosticar = ruta.pasos.filter((p) => p.estadoPaso === 'diagnosticar')
  const paralelos = ruta.pasos.filter((p) => p.estadoPaso === 'disponible')
  const revisa = [...porDiagnosticar.map((p) => p.id), ...(enCurso ? [enCurso.id] : [])]

  return (
    <div>
      {ejemplo && <AvisoEjemplo />}

      <Etiqueta>Tu ruta</Etiqueta>
      <h2 className="mt-2 text-2xl leading-tight font-semibold sm:text-[28px]">Tu ruta a Cálculo I</h2>
      <p className="mt-2 max-w-2xl text-ink-2">
        {pendientes.length} pasos ordenados según los prerrequisitos. Cada paso es un módulo; ninguno se activa antes de que estén firmes los conceptos que necesita.
      </p>

      {ruta.dominados.length > 0 && (
        <div className="mt-6 rounded-[14px] border border-line bg-panel p-4">
          <p className="text-[15px]">
            <span className="font-medium">Ya dominas {ruta.dominados.length} conceptos</span>
            <span className="text-ink-2"> y no los vamos a repetir:</span>
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {ruta.dominados.map((id) => (
              <li key={id} className="inline-flex items-center gap-1.5 rounded-full border border-dom/20 bg-dom-bg py-1 pr-3 pl-1 text-sm text-dom">
                <span aria-hidden="true" className="grid size-5 place-items-center rounded-full bg-white/80 font-mono text-[11px] font-medium">
                  D
                </span>
                {concepto(id).nombre}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <section aria-labelledby="pasos-titulo">
          <h2 id="pasos-titulo" className="sr-only">
            Pasos de la ruta
          </h2>
          <ol>
            {ruta.pasos.map((p, i) => (
              <RouteStep
                key={p.id}
                paso={p}
                numero={i + 1}
                ultimo={i === ruta.pasos.length - 1}
                href={moduloDeConcepto(p.id) ? `/modulos/${moduloDeConcepto(p.id)!.id}` : undefined}
              />
            ))}
          </ol>
        </section>

        <aside className="grid gap-4 lg:sticky lg:top-20">
          <section aria-labelledby="mini-titulo" className="rounded-[18px] border border-line bg-white p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Próximo mini-diagnóstico</p>
            <h2 id="mini-titulo" className="mt-1 text-xl font-semibold first-letter:uppercase">
              {fecha}
            </h2>
            <p className="mt-1 font-mono text-sm text-ink-2">~8 preguntas · sin cronómetro</p>
            {revisa.length > 0 && (
              <>
                <p className="mt-3 text-sm font-medium">Va a revisar:</p>
                <ul className="mt-1.5 grid gap-1.5 text-sm">
                  {revisa.map((id) => (
                    <li key={id} className="flex items-center justify-between gap-2">
                      <span>{concepto(id).nombre}</span>
                      <span className="shrink-0 font-mono text-xs text-ink-2">
                        {perfil.conceptos[id].estado === 'sin-evidencia' ? 'aún no sabemos' : 'paso en curso'}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <p className="mt-3 text-sm text-ink-2">Puede cambiar tu ruta: si muestras dominio en un concepto, ese paso se salta.</p>
          </section>

          <section aria-labelledby="orden-titulo" className="rounded-[18px] border border-line bg-panel p-5">
            <h2 id="orden-titulo" className="text-xl font-semibold">
              ¿Por qué este orden?
            </h2>
            {ruta.cadena.length > 1 ? (
              <>
                <p className="mt-2 text-sm text-ink-2">Cada paso de la cadena principal usa el anterior:</p>
                <ol className="mt-3">
                  {ruta.cadena.map((id, i) => {
                    const sig = ruta.cadena[i + 1]
                    const k = concepto(id)
                    return (
                      <li key={id}>
                        <span
                          className={`inline-flex rounded-[8px] border px-2.5 py-1 text-sm font-medium ${
                            k.objetivo
                              ? 'border-ink bg-ink text-white'
                              : i === 0
                                ? 'border-accent bg-accent-soft text-accent'
                                : 'border-line bg-white'
                          }`}
                        >
                          {k.nombre}
                        </span>
                        {sig && (
                          <div className="my-1 ml-3 flex gap-3 text-sm text-ink-2">
                            <span aria-hidden="true" className="flex w-3 shrink-0 flex-col items-center">
                              <span className="w-px flex-1 bg-ink-2/40" />
                              <svg viewBox="0 0 10 6" className="h-1.5 w-2.5 text-ink-2/60" fill="currentColor">
                                <path d="M0 0h10L5 6z" />
                              </svg>
                            </span>
                            <span className="py-1.5">
                              <RichText texto={arista(id, sig)!.razon} />
                            </span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink-2">Con esta evidencia no hay una cadena de brechas que ordenar.</p>
            )}
            {(paralelos.length > 0 || porDiagnosticar.length > 0) && (
              <ul className="mt-4 grid gap-2 border-t border-line pt-4 text-sm text-ink-2">
                {paralelos.length > 0 && (
                  <li>
                    <span className="font-medium text-ink">{paralelos.map((p) => concepto(p.id).corto).join(' y ')}</span> va en paralelo: no
                    depende de esta cadena.
                  </li>
                )}
                {porDiagnosticar.length > 0 && (
                  <li>
                    <span className="font-medium text-ink">{porDiagnosticar.map((p) => concepto(p.id).corto).join(' y ')}</span> espera el
                    mini-diagnóstico: no te vamos a hacer practicar algo que quizá ya dominas.
                  </li>
                )}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
