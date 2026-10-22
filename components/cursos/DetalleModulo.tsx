'use client'

import Link from 'next/link'
import { Icono } from '@/components/app/Icono'
import { Portada } from '@/components/app/Portada'
import { Etiqueta } from '@/components/ui/Badges'
import { IntervaloMini } from '@/components/ui/CoverageBar'
import { StatusChip } from '@/components/ui/StatusChip'
import { modulo as buscarModulo, moduloDeConcepto } from '@/data/modulos'
import { avanceModulo, estadoLeccion, formatoDuracion, leccionSiguiente } from '@/lib/avance'
import { APROBACION } from '@/lib/cursos'
import { concepto } from '@/lib/data'
import { hijos, padres } from '@/lib/graph'
import { useProgreso } from '@/lib/progreso'
import { useRecomendaciones } from '@/lib/useRecomendaciones'

export function DetalleModulo({ id }: { id: string }) {
  const m = buscarModulo(id)!
  const progreso = useProgreso()
  const { perfil, pasoPorModulo, ejemplo } = useRecomendaciones()
  const avance = avanceModulo(progreso, m)
  const siguiente = leccionSiguiente(progreso, m)
  const est = perfil?.conceptos[m.concepto]
  const paso = pasoPorModulo.get(m.id)
  const conContenido = m.lecciones.filter((l) => !l.enProduccion)

  const cta = avance.completo ? 'Repasar el módulo' : avance.iniciado ? `Continuar: ${siguiente.titulo}` : 'Empezar el módulo'

  return (
    <div>
      <nav aria-label="Migas de pan" className="text-sm text-ink-2">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/modulos" className="underline-offset-4 hover:text-ink hover:underline">
              Módulos
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">
            {m.titulo}
          </li>
        </ol>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">
          <Etiqueta>Módulo {String(m.numero).padStart(2, '0')}</Etiqueta>
          <h1 className="mt-2 text-[30px] leading-tight font-semibold sm:text-4xl">{m.titulo}</h1>
          <p className="mt-3 max-w-2xl text-[17px] text-ink-2">{m.descripcion}</p>
          <p className="mt-3 flex items-center gap-2 text-sm">
            <Icono nombre="docente" className="size-4 text-ink-2" />
            {m.docente}
          </p>

          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[13px] text-ink-2">
            <li>{m.lecciones.length} lecciones</li>
            <li>{formatoDuracion(avance.duracion)} de video</li>
            <li>{conContenido.length * 5} ejercicios con solución</li>
            <li>{conContenido.length} tests</li>
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={`/modulos/${m.id}/${siguiente.id}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
            >
              <Icono nombre="play" relleno className="size-4" />
              {cta}
            </Link>
            {avance.iniciado && (
              <div className="flex-1 sm:max-w-60">
                <div className="flex justify-between text-xs text-ink-2">
                  <span>
                    {avance.completadas} de {avance.disponibles} lecciones completadas
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(avance.fraccion * 100, 4)}%` }} />
                </div>
              </div>
            )}
          </div>

          <section aria-labelledby="contenido-modulo" className="mt-10">
            <h2 id="contenido-modulo" className="text-xl font-semibold">
              Contenido del módulo
            </h2>
            <ol className="mt-4 grid gap-3">
              {m.lecciones.map((l, i) => {
                const e = estadoLeccion(progreso, l)
                return (
                  <li key={l.id} className={`rounded-[16px] border bg-white p-4 sm:p-5 ${l.enProduccion ? 'border-dashed border-line' : 'border-line'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Lección {i + 1}</p>
                        <h3 className="mt-1 text-lg font-semibold">{l.titulo}</h3>
                      </div>
                      <EstadoLeccionChip enProduccion={l.enProduccion} completada={e.completada} iniciada={e.iniciada} />
                    </div>

                    {l.enProduccion ? (
                      <p className="mt-2 text-sm text-ink-2">Video, ejercicios y test en producción. Objetivos: {l.objetivos.join('; ').toLowerCase()}.</p>
                    ) : (
                      <ul className="mt-3 grid gap-1.5 text-sm">
                        <ItemLeccion
                          icono="video"
                          texto={`Video · ${formatoDuracion(l.duracion)}`}
                          estado={e.visto ? 'Visto' : e.video > 0 ? `${Math.round(e.video * 100)}% visto` : null}
                          hecho={e.visto}
                        />
                        <ItemLeccion
                          icono="lapiz"
                          texto={`${l.ejercicios.length} ejercicios con solución`}
                          estado={e.ejercicios ? `${e.ejercicios} de ${l.ejercicios.length} revisados` : null}
                          hecho={e.ejercicios === l.ejercicios.length}
                        />
                        <ItemLeccion
                          icono="test"
                          texto={`Test · ${l.test.length} preguntas · aprueba con ${Math.ceil(l.test.length * APROBACION)}`}
                          estado={e.test ? `${e.test.aciertos}/${e.test.total} · ${e.test.aprobado ? 'aprobado' : 'no aprobado'}` : null}
                          hecho={Boolean(e.test?.aprobado)}
                        />
                      </ul>
                    )}

                    {!l.enProduccion && (
                      <Link
                        href={`/modulos/${m.id}/${l.id}`}
                        className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-[10px] border border-line px-4 text-sm font-medium hover:border-ink-2/50"
                      >
                        {e.completada ? 'Repasar' : e.iniciada ? 'Continuar' : 'Ir a la lección'}
                        <span className="sr-only"> {l.titulo}</span>
                        <Icono nombre="adelante" className="size-4" />
                      </Link>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <aside className="grid gap-4 lg:sticky lg:top-6">
          <Portada tex={m.lecciones[0].portada} etiqueta={`Módulo ${String(m.numero).padStart(2, '0')}`} />

          <section aria-labelledby="segun-diagnostico" className="rounded-[16px] border border-line bg-white p-5">
            <h2 id="segun-diagnostico" className="font-mono text-xs uppercase tracking-wider text-ink-2">
              Según tu diagnóstico
            </h2>
            {est ? (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-medium">{concepto(m.concepto).nombre}</span>
                  <StatusChip estado={est.estado} tamano="sm" />
                </div>
                <div className="mt-3">
                  <IntervaloMini media={est.media} lo={est.lo} hi={est.hi} etiqueta={concepto(m.concepto).nombre} />
                </div>
                <p className="mt-3 text-sm text-ink-2">
                  {paso === 'en-curso'
                    ? 'Es el primer paso de tu ruta: la brecha más baja del mapa con los prerrequisitos firmes.'
                    : paso === 'disponible'
                      ? 'Está en tu ruta y ya tienes sus prerrequisitos: puedes tomarlo en paralelo.'
                      : paso === 'bloqueado'
                        ? 'Está en tu ruta, después de reforzar sus prerrequisitos.'
                        : paso === 'diagnosticar'
                          ? 'Aún no sabemos cómo llegas a este concepto. El próximo mini-diagnóstico lo mide.'
                          : 'Tu evidencia indica que ya lo dominas. Puedes tomarlo igual como repaso.'}
                </p>
                {ejemplo && <p className="mt-2 text-xs text-ink-2">Basado en un perfil de ejemplo hasta que hagas el diagnóstico.</p>}
              </>
            ) : null}
            <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-sm">
              <EnlacesConceptos titulo="Necesitas antes" ids={padres(m.concepto)} vacio="Nada: es una base del mapa." />
              <EnlacesConceptos titulo="Te prepara para" ids={hijos(m.concepto)} vacio="" />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}

function EstadoLeccionChip({ enProduccion, completada, iniciada }: { enProduccion?: boolean; completada: boolean; iniciada: boolean }) {
  if (enProduccion) return <span className="rounded-full border border-dashed border-ink-2/50 px-2.5 py-1 text-xs font-medium text-ink-2">En producción</span>
  if (completada)
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-dom/30 bg-dom-bg px-2.5 py-1 text-xs font-medium text-dom">
        <Icono nombre="check" className="size-3.5" /> Completada
      </span>
    )
  if (iniciada) return <span className="rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">En curso</span>
  return <span className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-2">Sin empezar</span>
}

function ItemLeccion({ icono, texto, estado, hecho }: { icono: 'video' | 'lapiz' | 'test'; texto: string; estado: string | null; hecho: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2">
        <Icono nombre={icono} className="size-4 text-ink-2" />
        {texto}
      </span>
      {estado && (
        <span className={`flex shrink-0 items-center gap-1 font-mono text-xs ${hecho ? 'text-dom' : 'text-ink-2'}`}>
          {hecho && <Icono nombre="check" className="size-3.5" />}
          {estado}
        </span>
      )}
    </li>
  )
}

function EnlacesConceptos({ titulo, ids, vacio }: { titulo: string; ids: string[]; vacio: string }) {
  const lista = ids.map((id) => ({ c: concepto(id), m: moduloDeConcepto(id) }))
  if (!lista.length && !vacio) return null
  return (
    <div>
      <dt className="font-mono text-xs uppercase tracking-wider text-ink-2">{titulo}</dt>
      <dd className="mt-1">
        {lista.length ? (
          <ul className="flex flex-wrap gap-1.5">
            {lista.map(({ c, m }) =>
              m ? (
                <li key={c.id}>
                  <Link href={`/modulos/${m.id}`} className="inline-flex min-h-11 items-center rounded-[10px] bg-panel px-3 hover:bg-accent-soft hover:text-accent">
                    {c.corto}
                  </Link>
                </li>
              ) : (
                <li key={c.id} className="inline-flex min-h-11 items-center rounded-[10px] bg-ink px-3 text-white">
                  {c.corto}
                </li>
              ),
            )}
          </ul>
        ) : (
          <span className="text-ink-2">{vacio}</span>
        )}
      </dd>
    </div>
  )
}
