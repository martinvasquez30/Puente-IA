'use client'

import Link from 'next/link'
import { Icono } from '@/components/app/Icono'
import { Portada } from '@/components/app/Portada'
import { ModuloCard } from '@/components/cursos/ModuloCard'
import { StatusChip } from '@/components/ui/StatusChip'
import { buscarLeccion, moduloDeConcepto, modulos } from '@/data/modulos'
import { avanceModulo, estadoLeccion, formatoDuracion, leccionSiguiente, resumenGeneral } from '@/lib/avance'
import { concepto } from '@/lib/data'
import { formatoFecha, proximoMiniDiagnostico } from '@/lib/fecha'
import { useProgreso } from '@/lib/progreso'
import { ESTADOS_PASO } from '@/components/ui/RouteStep'
import { useMontado } from '@/lib/useMontado'
import { useRecomendaciones } from '@/lib/useRecomendaciones'

export function Inicio() {
  const progreso = useProgreso()
  const { perfil, ruta, ejemplo, listo, recomendados, pasoPorModulo } = useRecomendaciones()
  const resumen = resumenGeneral(progreso)
  const montado = useMontado()
  if (!montado || !listo) return <div className="min-h-[60vh]" aria-busy="true" />

  // Continuar: la última lección abierta; si no hay, la primera lección del módulo donde empieza la ruta.
  const ultima = progreso.ultima ? buscarLeccion(progreso.ultima) : null
  const moduloInicio = recomendados[0] ?? modulos[0]
  const continuar = ultima ?? { modulo: moduloInicio, leccion: leccionSiguiente(progreso, moduloInicio), indice: 0 }
  const indiceContinuar = continuar.modulo.lecciones.findIndex((l) => l.id === continuar.leccion.id)
  const ec = estadoLeccion(progreso, continuar.leccion)

  const enCurso = modulos.filter((m) => {
    const a = avanceModulo(progreso, m)
    return a.iniciado && !a.completo
  })

  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">Puente a Cálculo I</p>
      <h1 className="mt-2 text-[28px] leading-tight font-semibold sm:text-[34px]">Hola, [NOMBRE]</h1>
      <p className="mt-1.5 text-ink-2">
        {resumen.completadas
          ? `Llevas ${resumen.completadas} de ${resumen.lecciones} lecciones completadas.`
          : 'Aquí está lo que te conviene ver primero, según tu diagnóstico.'}
      </p>

      {listo && ejemplo && (
        <div className="mt-6 flex flex-col gap-3 rounded-[16px] borde-punteado bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Todavía no haces el diagnóstico</p>
            <p className="text-sm text-ink-2">Mientras tanto, las recomendaciones salen de un perfil de ejemplo. Toma unos 40 minutos y no tiene cronómetro.</p>
          </div>
          <Link href="/diagnostico/prueba" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-[10px] bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90">
            Hacer el diagnóstico
          </Link>
        </div>
      )}

      {/* Continuar */}
      <section aria-labelledby="continuar-titulo" className="mt-6">
        <h2 id="continuar-titulo" className="sr-only">
          {ultima ? 'Continuar donde quedaste' : 'Para empezar'}
        </h2>
        <div className="grid overflow-hidden rounded-[18px] border border-line bg-white md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Link href={`/modulos/${continuar.modulo.id}/${continuar.leccion.id}`} tabIndex={-1} aria-hidden="true" className="relative block p-2 md:p-3">
            <Portada tex={continuar.leccion.portada} etiqueta={`Módulo ${String(continuar.modulo.numero).padStart(2, '0')} · Lección ${indiceContinuar + 1}`} />
            <span className="absolute right-[6%] bottom-[11%] grid size-12 place-items-center rounded-full bg-white text-accent md:right-[5%] md:bottom-[10%]">
              <Icono nombre="play" relleno className="size-5" />
            </span>
            {ec.video > 0 && !ec.visto && (
              <span className="absolute inset-x-2 bottom-2 h-1 overflow-hidden rounded-b-[12px] bg-white/20 md:inset-x-3 md:bottom-3">
                <span className="block h-full bg-[#7F97F0]" style={{ width: `${ec.video * 100}%` }} />
              </span>
            )}
          </Link>
          <div className="flex flex-col p-5 md:py-6 md:pr-6 md:pl-3">
            <p className="font-mono text-xs uppercase tracking-wider text-accent">{ultima ? 'Continuar donde quedaste' : 'Empieza por aquí'}</p>
            <p className="mt-2 text-sm text-ink-2">{continuar.modulo.titulo}</p>
            <p className="mt-0.5 font-display text-2xl leading-tight font-semibold">{continuar.leccion.titulo}</p>
            <ul className="mt-4 grid gap-1.5 text-sm">
              <li className="flex items-center gap-2">
                <Icono nombre={ec.visto ? 'check' : 'video'} className={`size-4 ${ec.visto ? 'text-dom' : 'text-ink-2'}`} />
                Video · {ec.visto ? 'visto' : ec.video > 0 ? `${Math.round(ec.video * 100)}%` : formatoDuracion(continuar.leccion.duracion)}
              </li>
              <li className="flex items-center gap-2">
                <Icono nombre="lapiz" className="size-4 text-ink-2" />
                Ejercicios · {ec.ejercicios} de 5
              </li>
              <li className="flex items-center gap-2">
                <Icono nombre={ec.test?.aprobado ? 'check' : 'test'} className={`size-4 ${ec.test?.aprobado ? 'text-dom' : 'text-ink-2'}`} />
                Test · {ec.test ? `${ec.test.aciertos}/${ec.test.total}${ec.test.aprobado ? ' aprobado' : ', sin aprobar'}` : 'pendiente'}
              </li>
            </ul>
            <Link
              href={`/modulos/${continuar.modulo.id}/${continuar.leccion.id}`}
              className="mt-5 inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
            >
              {ultima ? 'Continuar' : 'Empezar'}
              <Icono nombre="adelante" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-10 grid gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {/* Recomendados */}
          <section aria-labelledby="recomendados-titulo">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 id="recomendados-titulo" className="text-xl font-semibold">
                  Recomendados para ti
                </h2>
                <p className="mt-0.5 text-sm text-ink-2">Módulos de tu ruta que ya puedes tomar: sus prerrequisitos están firmes.</p>
              </div>
              <Link href="/modulos" className="hidden min-h-11 shrink-0 items-center text-sm font-medium text-accent underline-offset-4 hover:underline sm:inline-flex">
                Ver todos los módulos
              </Link>
            </div>
            {recomendados.length ? (
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {recomendados.slice(0, 2).map((m) => (
                  <li key={m.id}>
                    <ModuloCard modulo={m} avance={avanceModulo(progreso, m)} paso={pasoPorModulo.get(m.id)} estadoConcepto={perfil?.conceptos[m.concepto]?.estado} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-[14px] border border-dashed border-line p-5 text-sm text-ink-2">
                No hay módulos pendientes en tu ruta con esta evidencia. Revisa los módulos sin evidencia en el próximo mini-diagnóstico.
              </p>
            )}
            <Link href="/modulos" className="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline sm:hidden">
              Ver todos los módulos
            </Link>
          </section>

          {enCurso.length > 0 && (
            <section aria-labelledby="encurso-titulo" className="mt-10">
              <h2 id="encurso-titulo" className="text-xl font-semibold">
                Módulos en curso
              </h2>
              <ul className="mt-4 grid gap-2">
                {enCurso.map((m) => {
                  const a = avanceModulo(progreso, m)
                  return (
                    <li key={m.id}>
                      <Link href={`/modulos/${m.id}`} className="flex min-h-14 items-center gap-4 rounded-[14px] border border-line bg-white px-4 py-3 hover:border-ink-2/40">
                        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-ink font-mono text-xs text-white">
                          {String(m.numero).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{m.titulo}</span>
                          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-panel">
                            <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(a.fraccion * 100, 4)}%` }} />
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-ink-2">
                          {a.completadas}/{a.disponibles}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </div>

        <aside className="grid content-start gap-4">
          <section aria-labelledby="ruta-titulo" className="rounded-[16px] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="ruta-titulo" className="flex items-center gap-2 font-semibold">
                <Icono nombre="ruta" className="size-5 text-ink-2" />
                Tu ruta
              </h2>
              <Link href="/diagnostico/ruta" className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
                Ver completa
              </Link>
            </div>
            <ol className="mt-2 grid gap-1">
              {(ruta?.pasos ?? []).slice(0, 5).map((p, i) => {
                const m = moduloDeConcepto(p.id)
                const meta = ESTADOS_PASO[p.estadoPaso]
                const contenido = (
                  <>
                    <span className="font-mono text-xs text-ink-2">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm">{concepto(p.id).corto}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.clase}`}>{meta.etiqueta}</span>
                  </>
                )
                return (
                  <li key={p.id}>
                    {m ? (
                      <Link href={`/modulos/${m.id}`} className="flex min-h-11 items-center gap-3 rounded-[10px] px-2 hover:bg-panel">
                        {contenido}
                      </Link>
                    ) : (
                      <span className="flex min-h-11 items-center gap-3 px-2">{contenido}</span>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>

          <section aria-labelledby="mini-titulo" className="rounded-[16px] border border-line bg-panel p-5">
            <h2 id="mini-titulo" className="flex items-center gap-2 font-semibold">
              <Icono nombre="calendario" className="size-5 text-ink-2" />
              Próximo mini-diagnóstico
            </h2>
            <p className="mt-2 font-display text-lg font-semibold first-letter:uppercase">{formatoFecha(proximoMiniDiagnostico())}</p>
            <p className="mt-1 text-sm text-ink-2">~8 preguntas sobre lo que estás practicando y lo que aún no sabemos.</p>
            {perfil && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {Object.values(perfil.conceptos)
                  .filter((c) => c.estado === 'sin-evidencia')
                  .map((c) => (
                    <li key={c.id} className="flex items-center gap-1.5 text-sm">
                      <StatusChip estado="sin-evidencia" tamano="sm" />
                      {concepto(c.id).corto}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="resumen-titulo" className="rounded-[16px] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="resumen-titulo" className="flex items-center gap-2 font-semibold">
                <Icono nombre="estadisticas" className="size-5 text-ink-2" />
                Tu avance
              </h2>
              <Link href="/estadisticas" className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline-offset-4 hover:underline">
                Estadísticas
              </Link>
            </div>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-center">
              {[
                ['Lecciones', `${resumen.completadas}/${resumen.lecciones}`],
                ['Ejercicios', String(resumen.ejerciciosHechos)],
                ['Tests', String(resumen.testsAprobados)],
              ].map(([t, v]) => (
                <div key={t} className="rounded-[10px] bg-panel px-2 py-3">
                  <dt className="text-xs text-ink-2">{t}</dt>
                  <dd className="mt-0.5 font-mono text-lg">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
