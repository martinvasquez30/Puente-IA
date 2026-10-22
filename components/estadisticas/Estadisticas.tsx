'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { EncabezadoSeccion } from '@/components/app/AppShell'
import { Icono } from '@/components/app/Icono'
import { IntervaloMini } from '@/components/ui/CoverageBar'
import { StatusChip } from '@/components/ui/StatusChip'
import { ZonaTooltip } from '@/components/ui/ZonaTooltip'
import { buscarLeccion, moduloDeConcepto, modulos } from '@/data/modulos'
import { avanceModulo, estadoLeccion, resumenGeneral } from '@/lib/avance'
import { APROBACION } from '@/lib/cursos'
import { concepto, conceptosEvaluables } from '@/lib/data'
import { cargarProgresoEjemplo, reiniciarProgreso, useProgreso } from '@/lib/progreso'
import { useMontado } from '@/lib/useMontado'
import { usePerfil } from '@/lib/usePerfil'

const DIAS = 14

export function Estadisticas() {
  const progreso = useProgreso()
  const { perfil, ejemplo: perfilEjemplo } = usePerfil()
  const r = resumenGeneral(progreso)

  const tests = useMemo(
    () =>
      Object.entries(progreso.lecciones)
        .filter(([, l]) => l.test)
        .map(([id, l]) => ({ id, ref: buscarLeccion(id)!, t: l.test! }))
        .filter((x) => x.ref)
        .sort((a, b) => a.ref.modulo.numero - b.ref.modulo.numero || a.ref.indice - b.ref.indice),
    [progreso],
  )

  const actividad = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const dias = Array.from({ length: DIAS }, (_, i) => {
      const d = new Date(hoy)
      d.setDate(d.getDate() - (DIAS - 1 - i))
      return { fecha: d, n: 0 }
    })
    for (const e of progreso.eventos) {
      const d = new Date(e.fecha)
      d.setHours(0, 0, 0, 0)
      const i = Math.round((d.getTime() - dias[0].fecha.getTime()) / 864e5)
      if (i >= 0 && i < DIAS) dias[i].n++
    }
    return dias
  }, [progreso])
  const maxActividad = Math.max(1, ...actividad.map((d) => d.n))
  const diasActivos = actividad.filter((d) => d.n > 0).length
  const montado = useMontado()
  if (!montado) return <div className="min-h-[60vh]" aria-busy="true" />

  return (
    <div>
      <EncabezadoSeccion
        titulo="Estadísticas"
        bajada={<p>Tu avance en los módulos y lo que muestran tus tests. Nada de esto es una nota: sirve para decidir qué repasar.</p>}
      >
        {r.hayActividad && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Borrar el avance de los módulos guardado en este dispositivo?')) reiniciarProgreso()
            }}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-[10px] border border-line px-3 text-sm font-medium hover:border-ink-2/50"
          >
            <Icono nombre="reiniciar" className="size-4" />
            Reiniciar mi avance
          </button>
        )}
      </EncabezadoSeccion>

      {progreso.ejemplo && (
        <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink-2">
          Avance de ejemplo cargado
        </p>
      )}

      {!r.hayActividad ? (
        <div className="mt-8 rounded-[18px] borde-punteado bg-white p-6 text-center sm:p-10">
          <p className="font-display text-xl font-semibold">Todavía no hay actividad</p>
          <p className="mx-auto mt-2 max-w-md text-ink-2">Cuando veas videos, revises ejercicios y rindas tests, aquí vas a ver tu avance por módulo y tus resultados.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/modulos" className="inline-flex min-h-12 items-center justify-center rounded-[12px] bg-accent px-5 font-medium text-white hover:bg-[#1d3aa6]">
              Ir a los módulos
            </Link>
            <button
              type="button"
              onClick={cargarProgresoEjemplo}
              className="inline-flex min-h-12 items-center justify-center rounded-[12px] border border-line px-5 font-medium hover:border-ink-2/50"
            >
              Cargar avance de ejemplo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi titulo="Lecciones completadas" valor={String(r.completadas)} sufijo={`de ${r.lecciones}`} nota="Video visto y test aprobado" />
            <Kpi titulo="Video visto" valor={String(r.minutosVideo)} sufijo="min" nota={`${r.videos} videos completos`} />
            <Kpi
              titulo="Ejercicios revisados"
              valor={String(r.ejerciciosHechos)}
              sufijo={`de ${r.ejercicios}`}
              nota={`${r.ejerciciosBien} te salieron · ${r.ejerciciosHechos - r.ejerciciosBien} a revisar`}
            />
            <Kpi
              titulo="Tests aprobados"
              valor={String(r.testsAprobados)}
              sufijo={`de ${r.testsRendidos} rendidos`}
              nota={r.promedioTests !== null ? `Promedio de aciertos: ${Math.round(r.promedioTests * 100)}%` : 'Aún sin tests'}
            />
          </dl>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            {/* Resultados de tests */}
            <section aria-labelledby="tests-titulo" className="rounded-[18px] border border-line bg-white p-5">
              <h2 id="tests-titulo" className="text-lg font-semibold">
                Resultados de tests
              </h2>
              <p className="mt-0.5 text-sm text-ink-2">Último intento de cada lección. La línea marca el {Math.round(APROBACION * 100)}% necesario para aprobar.</p>
              {tests.length ? (
                <ZonaTooltip className="mt-5">
                  <ul className="grid gap-2.5">
                    {tests.map(({ id, ref, t }) => {
                      const f = t.aciertos / t.total
                      return (
                        <li key={id}>
                          <Link
                            href={`/modulos/${ref.modulo.id}/${id}#test`}
                            data-tip={`${ref.leccion.titulo}: ${t.aciertos} de ${t.total} · ${t.aprobado ? 'aprobado' : 'sin aprobar'} · intento ${t.intentos}`}
                            className="grid min-h-11 grid-cols-[minmax(0,1fr)_3.5rem] items-center gap-x-3 gap-y-1 rounded-[8px] px-1 hover:bg-panel sm:grid-cols-[11rem_minmax(0,1fr)_3.5rem]"
                          >
                            <span className="col-span-2 truncate text-sm sm:col-span-1">{ref.leccion.titulo}</span>
                            <span className="relative h-5" aria-hidden="true">
                              <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
                              <span className="absolute inset-y-0 left-0 rounded-r-[4px] bg-accent" style={{ width: `${Math.max(f * 100, 1.5)}%` }} />
                              <span className="absolute -inset-y-1 w-0.5 bg-ink" style={{ left: `${APROBACION * 100}%` }} />
                            </span>
                            <span className="flex items-center justify-end gap-1 font-mono text-xs">
                              {t.aprobado && <Icono nombre="check" className="size-3.5 text-dom" />}
                              {t.aciertos}/{t.total}
                            </span>
                            <span className="sr-only">{t.aprobado ? 'aprobado' : 'sin aprobar'}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </ZonaTooltip>
              ) : (
                <p className="mt-5 text-sm text-ink-2">Aún no rindes tests.</p>
              )}
            </section>

            {/* Actividad */}
            <section aria-labelledby="actividad-titulo" className="rounded-[18px] border border-line bg-white p-5">
              <h2 id="actividad-titulo" className="text-lg font-semibold">
                Actividad de los últimos {DIAS} días
              </h2>
              <p className="mt-0.5 text-sm text-ink-2">
                Videos terminados, ejercicios revisados y tests rendidos por día. Estudiaste {diasActivos} de {DIAS} días.
              </p>
              <ZonaTooltip className="mt-5">
                <div className="flex h-40 items-end gap-[3px] border-b border-line" role="img" aria-label={`Actividad diaria: ${actividad.map((d) => d.n).join(', ')} acciones, del más antiguo al más reciente`}>
                  {actividad.map((d, i) => (
                    <div
                      key={i}
                      data-tip={`${new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'short' }).format(d.fecha)}: ${d.n} ${d.n === 1 ? 'acción' : 'acciones'}`}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      {d.n > 0 && (
                        <span className="mb-1 text-center font-mono text-[10px] text-ink-2">{d.n}</span>
                      )}
                      <div className="mx-auto w-full max-w-6 rounded-t-[4px] bg-accent" style={{ height: d.n ? `${(d.n / maxActividad) * 75}%` : 0 }} />
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[11px] text-ink-2">
                  <span>hace {DIAS - 1} días</span>
                  <span>hoy</span>
                </div>
              </ZonaTooltip>
            </section>
          </div>

          {/* Avance por módulo */}
          <section aria-labelledby="modulos-titulo" className="mt-6 rounded-[18px] border border-line bg-white p-5">
            <h2 id="modulos-titulo" className="text-lg font-semibold">
              Avance por módulo
            </h2>
            <ul className="mt-4 grid gap-x-8 gap-y-1 md:grid-cols-2">
              {modulos.map((m) => {
                const a = avanceModulo(progreso, m)
                const ejercicios = m.lecciones.reduce((s, l) => s + estadoLeccion(progreso, l).ejercicios, 0)
                return (
                  <li key={m.id}>
                    <Link href={`/modulos/${m.id}`} className="grid min-h-12 grid-cols-[2rem_minmax(0,1fr)_3rem] items-center gap-3 rounded-[10px] px-1 hover:bg-panel">
                      <span className="font-mono text-xs text-ink-2">{String(m.numero).padStart(2, '0')}</span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{m.titulo}</span>
                          {a.completo && <Icono nombre="check" className="size-4 text-dom" />}
                        </span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-panel">
                          <span className="block h-full rounded-full bg-accent" style={{ width: `${a.fraccion * 100}%` }} />
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-2">
                          {a.completadas} de {a.disponibles} lecciones · {ejercicios} ejercicios revisados
                        </span>
                      </span>
                      <span className="text-right font-mono text-xs">{Math.round(a.fraccion * 100)}%</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}

      {/* Dominio por concepto */}
      {perfil && (
        <section aria-labelledby="dominio-titulo" className="mt-6 rounded-[18px] border border-line bg-white p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="dominio-titulo" className="text-lg font-semibold">
                Dominio por concepto
              </h2>
              <p className="mt-0.5 text-sm text-ink-2">
                Tu perfil del diagnóstico{perfilEjemplo ? ' (de ejemplo)' : ''}, actualizado con tus tests. El punto es la estimación y la franja, el rango.
              </p>
            </div>
            <Link href="/diagnostico/perfil" className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
              Ver perfil completo
            </Link>
          </div>
          <ul className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
            {conceptosEvaluables.map((c) => {
              const e = perfil.conceptos[c.id]
              const conTest = e.evidencias.some((ev) => ev.fuente === 'test')
              const m = moduloDeConcepto(c.id)
              return (
                <li key={c.id} className="grid gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2 text-sm">
                      <span className="truncate">{concepto(c.id).nombre}</span>
                      {conTest && <span className="shrink-0 rounded-full bg-accent-soft px-1.5 font-mono text-[10px] text-accent">+ tests</span>}
                    </span>
                    <StatusChip estado={e.estado} tamano="sm" />
                  </div>
                  <IntervaloMini media={e.media} lo={e.lo} hi={e.hi} etiqueta={concepto(c.id).nombre} />
                  {m && <span className="sr-only">Módulo {m.numero}</span>}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function Kpi({ titulo, valor, sufijo, nota }: { titulo: string; valor: string; sufijo?: string; nota: string }) {
  return (
    <div className="rounded-[14px] border border-line bg-panel p-4">
      <dt className="text-sm text-ink-2">{titulo}</dt>
      <dd className="mt-1 font-mono text-3xl font-medium tracking-tight">
        {valor}
        {sufijo && <span className="ml-1.5 font-sans text-base font-normal text-ink-2">{sufijo}</span>}
      </dd>
      <dd className="mt-1 text-xs text-ink-2">{nota}</dd>
    </div>
  )
}
