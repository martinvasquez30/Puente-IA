'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { EjercicioCard } from './EjercicioCard'
import { Temario } from './Temario'
import { TestLeccion } from './TestLeccion'
import { VideoPlayer } from './VideoPlayer'
import { Icono } from '@/components/app/Icono'
import { Portada } from '@/components/app/Portada'
import { buscarLeccion } from '@/data/modulos'
import { estadoLeccion, formatoDuracion } from '@/lib/avance'
import {
  abrirLeccion,
  avanceVideo,
  marcarEjercicio,
  marcarVisto,
  progresoLeccion,
  registrarTest,
  useProgreso,
  verSolucion,
} from '@/lib/progreso'

export function LeccionVista({ leccionId }: { leccionId: string }) {
  const { modulo: m, leccion: l, indice } = buscarLeccion(leccionId)!
  const progreso = useProgreso()
  const pl = progresoLeccion(progreso, l.id)
  const e = estadoLeccion(progreso, l)
  const [temarioMovil, setTemarioMovil] = useState(false)
  // El progreso vive en localStorage: el reproductor se monta cuando ya se puede leer.
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    abrirLeccion(l.id)
    setMontado(true)
  }, [l.id])

  const onAvance = useCallback((f: number) => avanceVideo(l.id, f), [l.id])
  const onTerminar = useCallback(() => {
    document.getElementById('ejercicios')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const anterior = m.lecciones[indice - 1]
  const siguiente = m.lecciones[indice + 1]
  const etiqueta = `Módulo ${String(m.numero).padStart(2, '0')} · Lección ${indice + 1}`

  return (
    <div className="min-h-dvh bg-white">
      {/* Barra superior de la lección */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-2 px-2 sm:px-4">
          <Link
            href={`/modulos/${m.id}`}
            className="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-[10px] px-2 text-sm font-medium hover:bg-panel"
          >
            <Icono nombre="atras" className="size-5" />
            <span className="truncate">
              <span className="sr-only">Volver a </span>
              {m.titulo}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden font-mono text-xs text-ink-2 sm:inline">
              Lección {indice + 1} de {m.lecciones.length}
            </span>
            <button
              type="button"
              aria-expanded={temarioMovil}
              aria-controls="temario-movil"
              onClick={() => setTemarioMovil((t) => !t)}
              className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium lg:hidden"
            >
              <Icono nombre={temarioMovil ? 'cerrar' : 'menu'} className="size-4" />
              Contenido
            </button>
          </div>
        </div>
        {temarioMovil && (
          <div id="temario-movil" className="max-h-[70dvh] overflow-y-auto border-t border-line bg-white p-3 animate-aparecer lg:hidden">
            <Temario modulo={m} actual={l.id} progreso={progreso} onNavegar={() => setTemarioMovil(false)} />
          </div>
        )}
      </header>

      <div className="lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden border-r border-line lg:block">
          <div className="sticky top-14 max-h-[calc(100dvh-3.5rem)] overflow-y-auto p-4">
            <p className="px-3 font-mono text-xs uppercase tracking-wider text-ink-2">Módulo {String(m.numero).padStart(2, '0')}</p>
            <p className="mt-1 mb-4 px-3 font-display text-lg leading-snug font-semibold">{m.titulo}</p>
            <Temario modulo={m} actual={l.id} progreso={progreso} />
          </div>
        </aside>

        <main id="contenido" className="min-w-0">
          <div className="mx-auto max-w-3xl px-4 pt-5 pb-16 sm:px-6 lg:pt-8">
            <section id="video" aria-labelledby="titulo-leccion" className="scroll-mt-20">
              <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{etiqueta}</p>
              <h1 id="titulo-leccion" className="mt-1.5 text-[26px] leading-tight font-semibold sm:text-[32px]">
                {l.titulo}
              </h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
                <span className="flex items-center gap-1.5">
                  <Icono nombre="docente" className="size-4" />
                  {m.docente}
                </span>
                <span className="flex items-center gap-1.5">
                  <Icono nombre="reloj" className="size-4" />
                  {formatoDuracion(l.duracion)}
                </span>
              </p>

              <div className="mt-5">
                {l.enProduccion ? (
                  <div className="relative">
                    <Portada tex={l.portada} etiqueta={etiqueta} className="rounded-[16px] opacity-90" />
                    <div className="absolute inset-0 grid place-items-center">
                      <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-ink">Video en producción</span>
                    </div>
                  </div>
                ) : montado ? (
                  <VideoPlayer
                    key={l.id}
                    leccion={l}
                    etiqueta={etiqueta}
                    docente={m.docente}
                    inicio={pl.video}
                    onAvance={onAvance}
                    onTerminar={onTerminar}
                  />
                ) : (
                  <div className="aspect-video rounded-[16px] bg-ink" aria-busy="true" />
                )}
              </div>

              {!l.enProduccion && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  {e.visto ? (
                    <p className="flex items-center gap-1.5 text-sm font-medium text-dom">
                      <Icono nombre="check" className="size-4" /> Video visto
                    </p>
                  ) : (
                    <p className="text-sm text-ink-2">
                      {pl.video > 0 ? `Llevas ${Math.round(pl.video * 100)}% del video.` : 'Se marca como visto al llegar al 90%.'}
                    </p>
                  )}
                  {!e.visto && (
                    <button
                      type="button"
                      onClick={() => marcarVisto(l.id)}
                      className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium hover:border-ink-2/50"
                    >
                      <Icono nombre="check" className="size-4" />
                      Marcar como visto
                    </button>
                  )}
                </div>
              )}

              <details className="group mt-4 rounded-[14px] border border-line">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 font-medium [&::-webkit-details-marker]:hidden">
                  Resumen del video y objetivos
                  <Icono nombre="abajo" className="size-4 transition-transform duration-150 group-open:rotate-180" />
                </summary>
                <div className="grid gap-4 border-t border-line px-4 py-4 text-[15px] sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-ink-2">En este video</p>
                    {l.enProduccion ? (
                      <p className="mt-2 text-ink-2">[GUION Y GRABACIÓN PENDIENTES]</p>
                    ) : (
                      <ul className="mt-2 grid gap-1.5 text-ink-2">
                        {l.resumen.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Al terminar podrás</p>
                    <ul className="mt-2 grid gap-1.5">
                      {l.objetivos.map((o) => (
                        <li key={o} className="flex gap-2">
                          <Icono nombre="check" className="mt-0.5 size-4 text-ink-2" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            </section>

            {l.enProduccion ? (
              <p className="mt-10 rounded-[16px] border border-dashed border-line p-6 text-center text-ink-2">
                Los ejercicios y el test de esta lección se publican junto con el video.
              </p>
            ) : (
              <>
                <section id="ejercicios" aria-labelledby="titulo-ejercicios" className="mt-12 scroll-mt-20">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h2 id="titulo-ejercicios" className="text-2xl font-semibold">
                        Ejercicios
                      </h2>
                      <p className="mt-1 text-[15px] text-ink-2">Cinco ejercicios con su solución paso a paso. Resuélvelos en papel y después compara.</p>
                    </div>
                    <p className="font-mono text-sm text-ink-2">
                      {e.ejercicios} de {l.ejercicios.length} revisados
                    </p>
                  </div>
                  <ol className="mt-5 grid gap-4">
                    {l.ejercicios.map((ej, i) => (
                      <li key={ej.id}>
                        <EjercicioCard
                          ejercicio={ej}
                          numero={i + 1}
                          estado={pl.ejercicios[ej.id]}
                          solucionVista={pl.soluciones.includes(ej.id)}
                          onVerSolucion={() => verSolucion(l.id, ej.id)}
                          onMarcar={(est) => marcarEjercicio(l.id, ej.id, est)}
                        />
                      </li>
                    ))}
                  </ol>
                </section>

                <section id="test" aria-labelledby="titulo-test" className="mt-12 scroll-mt-20">
                  <h2 id="titulo-test" className="text-2xl font-semibold">
                    Test de la lección
                  </h2>
                  <p className="mt-1 mb-5 text-[15px] text-ink-2">Para completar la lección: ver el video y aprobar este test.</p>
                  {montado && (
                    <TestLeccion
                      key={l.id}
                      leccion={l}
                      resultado={pl.test}
                      videoVisto={e.visto}
                      onEnviar={(resp, aciertos, total) => registrarTest(l.id, resp, aciertos, total)}
                    />
                  )}
                </section>
              </>
            )}

            <nav aria-label="Otras lecciones" className="mt-14 grid gap-3 border-t border-line pt-6 sm:grid-cols-2">
              {anterior ? (
                <Link href={`/modulos/${m.id}/${anterior.id}`} className="flex min-h-14 items-center gap-3 rounded-[14px] border border-line px-4 py-3 hover:border-ink-2/50">
                  <Icono nombre="atras" className="size-5 text-ink-2" />
                  <span className="min-w-0">
                    <span className="block text-xs text-ink-2">Lección anterior</span>
                    <span className="block truncate font-medium">{anterior.titulo}</span>
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {siguiente ? (
                <Link
                  href={`/modulos/${m.id}/${siguiente.id}`}
                  className="flex min-h-14 items-center justify-end gap-3 rounded-[14px] border border-line px-4 py-3 text-right hover:border-ink-2/50"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-ink-2">Siguiente lección</span>
                    <span className="block truncate font-medium">{siguiente.titulo}</span>
                  </span>
                  <Icono nombre="adelante" className="size-5 text-ink-2" />
                </Link>
              ) : (
                <Link
                  href={`/modulos/${m.id}`}
                  className="flex min-h-14 items-center justify-end gap-3 rounded-[14px] border border-line px-4 py-3 text-right hover:border-ink-2/50"
                >
                  <span>
                    <span className="block text-xs text-ink-2">Fin del módulo</span>
                    <span className="block font-medium">Volver al módulo</span>
                  </span>
                  <Icono nombre="adelante" className="size-5 text-ink-2" />
                </Link>
              )}
            </nav>
          </div>
        </main>
      </div>
    </div>
  )
}
