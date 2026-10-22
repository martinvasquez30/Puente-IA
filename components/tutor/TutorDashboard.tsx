'use client'

import { useMemo, useRef, useState } from 'react'
import { EjemploTag, Etiqueta } from '@/components/ui/Badges'
import { HeatmapCell } from '@/components/ui/HeatmapCell'
import { LeyendaEstados, StatusChip } from '@/components/ui/StatusChip'
import { concepto, conceptosEvaluables, estudiantes } from '@/lib/data'
import { pct } from '@/lib/fecha'
import { brechasFrecuentes, coberturaEstudiante, conteoPorConcepto, kpis, letraAEstado, necesitanAtencion } from '@/lib/tutor'
import type { Letra } from '@/lib/types'

const ORDEN_LETRA: Record<Letra, number> = { B: 0, P: 1, '?': 2, D: 3 }
const COLOR_BRECHA = '#9A2E0B'
const COLOR_PARCIAL = '#D9962B'
const VISIBLES = 6

interface Tip {
  x: number
  y: number
  texto: string
}

export function TutorDashboard() {
  const [filtro, setFiltro] = useState<string | null>(null)
  const [soloFiltrados, setSoloFiltrados] = useState(false)
  const [focoEstudiante, setFocoEstudiante] = useState<string | null>(null)
  const [tip, setTip] = useState<Tip | null>(null)
  const [verTodos, setVerTodos] = useState(false)
  const filas = useRef<Record<string, HTMLTableRowElement | null>>({})

  const k = useMemo(() => kpis(), [])
  const brechas = useMemo(() => brechasFrecuentes(), [])
  const atencion = useMemo(() => necesitanAtencion(filtro), [filtro])

  const lista = useMemo(() => {
    let l = [...estudiantes]
    if (filtro) {
      if (soloFiltrados) l = l.filter((e) => e.estados[filtro] === 'B' || e.estados[filtro] === 'P')
      l.sort((a, b) => ORDEN_LETRA[a.estados[filtro]] - ORDEN_LETRA[b.estados[filtro]] || a.nombre.localeCompare(b.nombre, 'es'))
    } else {
      l.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    }
    return l
  }, [filtro, soloFiltrados])

  function elegirConcepto(id: string | null) {
    setFiltro(id)
    if (!id) setSoloFiltrados(false)
  }

  function irAEstudiante(id: string) {
    setFocoEstudiante(id)
    if (filtro && soloFiltrados) {
      const e = estudiantes.find((x) => x.id === id)
      if (e && e.estados[filtro] !== 'B' && e.estados[filtro] !== 'P') setSoloFiltrados(false)
    }
    requestAnimationFrame(() => filas.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
  }

  function moverTip(e: React.MouseEvent) {
    const el = (e.target as HTMLElement).closest<HTMLElement>('[data-tip]')
    if (!el) return setTip(null)
    setTip({ x: e.clientX, y: e.clientY, texto: el.dataset.tip! })
  }

  const conteo = filtro ? conteoPorConcepto(filtro) : null
  const maxBarra = estudiantes.length

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      {/* Encabezado y filtro */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Etiqueta>Panel del tutor</Etiqueta>
          <h1 className="mt-2 text-[28px] leading-tight font-semibold sm:text-[34px]">Nivelación Cálculo I</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-ink-2">
            <span>Sección [SECCIÓN]</span>
            <span aria-hidden="true">·</span>
            <span>Tutor/a: [NOMBRE]</span>
            <span aria-hidden="true">·</span>
            <span>Actualizado: [FECHA Y HORA]</span>
            <EjemploTag texto="Estudiantes ficticios" />
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="filtro-concepto" className="text-sm font-medium">
            Filtrar por concepto
          </label>
          <select
            id="filtro-concepto"
            value={filtro ?? ''}
            onChange={(e) => elegirConcepto(e.target.value || null)}
            className="min-h-11 w-full rounded-[10px] border border-line bg-white px-3 pr-8 text-[15px] lg:w-72"
          >
            <option value="">Todos los conceptos</option>
            {conceptosEvaluables.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPIs */}
      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="Estudiantes en la sección" valor={String(k.total)} nota={`${k.atencion} con algún motivo para conversar`} />
        <Kpi titulo="Diagnóstico completo" valor={k.completos} sufijo={`de ${k.total}`} nota={`${k.total - k.completos} lo dejaron a medias`} />
        <Kpi
          titulo="Cobertura mediana"
          valor={pct(k.coberturaMediana)}
          nota={`La mitad central está entre ${pct(k.coberturaQ1)} y ${pct(k.coberturaQ3)}`}
        />
        <Kpi
          titulo="Brecha más frecuente"
          valor={concepto(k.brechaTop.id).corto}
          nota={`${k.brechaTop.n} estudiantes con brecha crítica`}
          texto
        />
      </dl>

      {filtro && conteo && (
        <div className="mt-4 flex flex-col gap-3 rounded-[14px] border border-accent bg-accent-soft/60 p-4 lg:flex-row lg:items-center lg:justify-between" role="status">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="font-medium">
              Filtrando por <span className="text-accent">{concepto(filtro).nombre}</span>
            </p>
            <ul className="flex flex-wrap gap-2">
              {(['B', 'P', '?', 'D'] as Letra[]).map((l) => (
                <li key={l} className="flex items-center gap-1.5">
                  <StatusChip estado={letraAEstado[l]} tamano="sm" />
                  <span className="font-mono text-sm">{conteo[l]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={soloFiltrados}
                onChange={(e) => setSoloFiltrados(e.target.checked)}
                className="size-4 accent-[#2448C8]"
              />
              Solo quienes tienen brecha o parcial
            </label>
            <button
              type="button"
              onClick={() => elegirConcepto(null)}
              className="min-h-11 rounded-[10px] border border-line bg-white px-3 text-sm font-medium hover:border-ink-2/50"
            >
              Quitar filtro
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1fr)_340px] 2xl:items-start">
        {/* Columna principal */}
        <div className="grid min-w-0 grid-cols-1 gap-6">
          <section aria-labelledby="calor-titulo" className="min-w-0 rounded-[18px] border border-line bg-white">
            <div className="flex flex-col gap-3 border-b border-line p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 id="calor-titulo" className="text-xl font-semibold">
                  Estudiante × concepto
                </h2>
                <p className="mt-0.5 text-sm text-ink-2">
                  {filtro ? 'Ordenado por estado en el concepto filtrado.' : 'Orden alfabético.'} Toca el nombre de un concepto para filtrar.
                </p>
              </div>
              <LeyendaEstados />
            </div>
            <div className="relative overflow-x-auto" onMouseMove={moverTip} onMouseLeave={() => setTip(null)}>
              <table className="w-full border-separate border-spacing-0 text-sm">
                <caption className="sr-only">
                  Estado de cada estudiante en cada concepto. D dominado, P parcial, B brecha crítica, signo de interrogación sin evidencia.
                </caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 min-w-32 bg-white px-3 py-2 text-left align-bottom font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
                      Estudiante
                    </th>
                    {conceptosEvaluables.map((c) => (
                      <th key={c.id} scope="col" className={`px-0.5 pt-2 pb-1 align-bottom ${filtro === c.id ? 'rounded-t-[8px] bg-accent-soft' : ''}`}>
                        <button
                          type="button"
                          aria-pressed={filtro === c.id}
                          aria-label={`Filtrar por ${c.nombre}`}
                          data-tip={c.nombre}
                          onClick={() => elegirConcepto(filtro === c.id ? null : c.id)}
                          className={`flex min-h-11 w-full min-w-12 items-end justify-center rounded-[6px] px-1 text-center text-xs leading-tight font-medium hover:bg-panel ${
                            filtro === c.id ? 'text-accent' : 'text-ink'
                          }`}
                        >
                          {c.abrev}
                        </button>
                      </th>
                    ))}
                    <th scope="col" className="px-3 pt-2 pb-1 text-right align-bottom font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
                      Cobertura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((e) => {
                    const cob = coberturaEstudiante(e)
                    const enFoco = focoEstudiante === e.id
                    return (
                      <tr
                        key={e.id}
                        ref={(el) => {
                          filas.current[e.id] = el
                        }}
                        className={enFoco ? 'bg-accent-soft' : 'hover:bg-panel'}
                      >
                        <th
                          scope="row"
                          className={`sticky left-0 z-10 border-t border-line px-3 py-1 text-left font-medium whitespace-nowrap ${enFoco ? 'bg-accent-soft' : 'bg-white'}`}
                        >
                          {e.nombre}
                          {e.preguntas < 35 && <span className="ml-1.5 font-mono text-[11px] font-normal text-ink-2">{e.preguntas}/40</span>}
                        </th>
                        {conceptosEvaluables.map((c) => (
                          <HeatmapCell
                            key={c.id}
                            letra={e.estados[c.id]}
                            estudiante={e.nombre}
                            concepto={c.nombre}
                            resaltada={filtro === c.id}
                          />
                        ))}
                        <td className="border-t border-line px-3 py-1 text-right font-mono text-xs whitespace-nowrap">
                          <span className="text-ink">{pct(cob.est)}</span>{' '}
                          <span className="text-ink-2">
                            ({Math.round(cob.lo * 100)}–{Math.round(cob.hi * 100)})
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line px-5 py-3 text-xs text-ink-2">
              Los números junto al nombre indican un diagnóstico a medias. La cobertura muestra la estimación y su rango.
            </p>
          </section>

          <section aria-labelledby="barras-titulo" className="rounded-[18px] border border-line bg-white p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 id="barras-titulo" className="text-xl font-semibold">
                  Brechas más frecuentes
                </h2>
                <p className="mt-0.5 text-sm text-ink-2">Estudiantes por concepto, de un total de {maxBarra}. Toca un concepto para filtrar.</p>
              </div>
              <ul className="flex gap-4 text-sm" aria-label="Leyenda">
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-3 rounded-[3px]" style={{ background: COLOR_BRECHA }} />
                  Brecha crítica (B)
                </li>
                <li className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-3 rounded-[3px]" style={{ background: COLOR_PARCIAL }} />
                  Parcial (P)
                </li>
              </ul>
            </div>
            <ul className="mt-5 grid gap-1" onMouseMove={moverTip} onMouseLeave={() => setTip(null)}>
              {brechas.map((b) => {
                const c = concepto(b.id)
                const activo = filtro === b.id
                const detalle = `${c.nombre}: ${b.B} brecha crítica · ${b.P} parcial · ${b.D} dominado · ${b['?']} sin evidencia`
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      aria-pressed={activo}
                      aria-label={detalle}
                      data-tip={detalle}
                      onClick={() => elegirConcepto(activo ? null : b.id)}
                      className={`grid min-h-11 w-full grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-x-3 gap-y-1 rounded-[10px] px-2 py-1.5 text-left text-sm sm:grid-cols-[15rem_minmax(0,1fr)_5rem] sm:py-0 ${
                        activo ? 'bg-accent-soft' : 'hover:bg-panel'
                      }`}
                    >
                      <span className={`col-span-2 truncate sm:col-span-1 ${activo ? 'font-medium text-accent' : ''}`}>{c.nombre}</span>
                      <span aria-hidden="true" className="relative flex h-5 items-center">
                        <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
                        <span
                          className="relative h-5"
                          style={{
                            width: `${(b.B / maxBarra) * 100}%`,
                            background: COLOR_BRECHA,
                            borderRadius: b.P ? 0 : '0 4px 4px 0',
                          }}
                        />
                        {b.P > 0 && (
                          <span
                            className="relative h-5"
                            style={{
                              width: `${(b.P / maxBarra) * 100}%`,
                              background: COLOR_PARCIAL,
                              borderRadius: '0 4px 4px 0',
                              marginLeft: b.B ? 2 : 0,
                            }}
                          />
                        )}
                      </span>
                      <span aria-hidden="true" className="text-right font-mono text-xs whitespace-nowrap">
                        <span className="text-ink">{b.B} B</span> <span className="text-ink-2">· {b.P} P</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        {/* Necesitan atención */}
        <section
          aria-labelledby="atencion-titulo"
          className="order-first rounded-[18px] border border-line bg-white lg:order-last 2xl:sticky 2xl:top-6 2xl:order-none 2xl:max-h-[calc(100dvh-3rem)] 2xl:overflow-y-auto"
        >
          <div className="sticky top-0 z-10 border-b border-line bg-white p-5">
            <h2 id="atencion-titulo" className="text-xl font-semibold">
              Necesitan atención <span className="font-mono text-base font-normal text-ink-2">{atencion.length}</span>
            </h2>
            <p className="mt-0.5 text-sm text-ink-2">
              Señales concretas para conversar, no evaluaciones de la persona.
              {filtro && ` Solo quienes tienen brecha o parcial en ${concepto(filtro).corto.toLowerCase()}.`}
            </p>
          </div>
          <ul className="divide-y divide-line lg:columns-2 lg:gap-0 2xl:columns-1">
            {(verTodos ? atencion : atencion.slice(0, VISIBLES)).map(({ e, motivos }) => (
              <li key={e.id} className={`break-inside-avoid p-5 ${focoEstudiante === e.id ? 'bg-accent-soft' : ''}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{e.nombre}</p>
                  {filtro && <StatusChip estado={letraAEstado[e.estados[filtro]]} tamano="sm" />}
                </div>
                <ul className="mt-2 grid gap-1.5 text-sm text-ink-2">
                  {motivos.map((m) => (
                    <li key={m.tipo} className="flex gap-2">
                      <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-2" />
                      {m.texto}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => irAEstudiante(e.id)}
                  className="mt-3 inline-flex min-h-11 items-center rounded-[10px] border border-line px-3 text-sm font-medium hover:border-ink-2/50"
                >
                  Ver en el mapa de calor
                </button>
              </li>
            ))}
            {atencion.length === 0 && <li className="p-5 text-sm text-ink-2">Nadie con motivos de atención para este filtro.</li>}
          </ul>
          {atencion.length > VISIBLES && (
            <div className="border-t border-line p-4">
              <button
                type="button"
                aria-expanded={verTodos}
                onClick={() => setVerTodos((v) => !v)}
                className="min-h-11 w-full rounded-[10px] bg-panel px-3 text-sm font-medium hover:bg-line/60"
              >
                {verTodos ? 'Mostrar menos' : `Mostrar las ${atencion.length} personas`}
              </button>
            </div>
          )}
        </section>
      </div>

      {tip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 max-w-72 rounded-[8px] bg-ink px-2.5 py-1.5 text-xs text-white"
          style={{ left: tip.x + 14, top: tip.y + 14 }}
        >
          {tip.texto}
        </div>
      )}
    </div>
  )
}

function Kpi({ titulo, valor, sufijo, nota, texto = false }: { titulo: string; valor: string | number; sufijo?: string; nota: string; texto?: boolean }) {
  return (
    <div className="rounded-[14px] border border-line bg-panel p-4">
      <dt className="text-sm text-ink-2">{titulo}</dt>
      <dd className={`mt-1 font-medium tracking-tight ${texto ? 'font-display text-2xl' : 'font-mono text-3xl'}`}>
        {valor}
        {sufijo && <span className="ml-1.5 font-sans text-lg font-normal text-ink-2">{sufijo}</span>}
      </dd>
      <dd className="mt-1 text-xs text-ink-2">{nota}</dd>
    </div>
  )
}

