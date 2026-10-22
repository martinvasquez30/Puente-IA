'use client'

import { useMemo, useState } from 'react'
import { ModuloCard } from './ModuloCard'
import { EncabezadoSeccion } from '@/components/app/AppShell'
import { Icono } from '@/components/app/Icono'
import { modulos } from '@/data/modulos'
import { avanceModulo } from '@/lib/avance'
import { useProgreso } from '@/lib/progreso'
import { useRecomendaciones } from '@/lib/useRecomendaciones'

type Filtro = 'todos' | 'recomendados' | 'en-curso' | 'completados'

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'todos', texto: 'Todos' },
  { id: 'recomendados', texto: 'Recomendados' },
  { id: 'en-curso', texto: 'En curso' },
  { id: 'completados', texto: 'Completados' },
]

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export function Catalogo() {
  const progreso = useProgreso()
  const { perfil, pasoPorModulo, ejemplo } = useRecomendaciones()
  const [filtro, setFiltro] = useState<Filtro>('todos')
  const [busqueda, setBusqueda] = useState('')

  const lista = useMemo(() => {
    const q = normalizar(busqueda.trim())
    return modulos
      .map((m) => ({ m, avance: avanceModulo(progreso, m), paso: pasoPorModulo.get(m.id) }))
      .filter(({ m }) => !q || normalizar(`${m.titulo} ${m.descripcion}`).includes(q))
      .filter(({ avance, paso }) => {
        if (filtro === 'recomendados') return paso === 'en-curso' || paso === 'disponible'
        if (filtro === 'en-curso') return avance.iniciado && !avance.completo
        if (filtro === 'completados') return avance.completo
        return true
      })
  }, [progreso, pasoPorModulo, filtro, busqueda])

  return (
    <>
      <EncabezadoSeccion
        titulo="Módulos"
        bajada={
          <p>
            {modulos.length} módulos de Puente a Cálculo I, ordenados según el mapa de prerrequisitos. Cada lección es un video, 5 ejercicios con
            solución y un test.
          </p>
        }
      />

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrar módulos" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filtro === f.id}
              onClick={() => setFiltro(f.id)}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors duration-150 ${
                filtro === f.id ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink hover:border-ink-2/50'
              }`}
            >
              {f.texto}
            </button>
          ))}
        </div>
        <label className="relative block md:w-72">
          <span className="sr-only">Buscar módulo</span>
          <Icono nombre="buscar" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-2" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar módulo"
            className="min-h-11 w-full rounded-[12px] border border-line bg-white pr-3 pl-9 text-[15px] placeholder:text-ink-2"
          />
        </label>
      </div>

      {filtro === 'recomendados' && ejemplo && (
        <p className="mt-4 text-sm text-ink-2">Las recomendaciones salen de un perfil de ejemplo hasta que hagas el diagnóstico.</p>
      )}

      <p className="sr-only" aria-live="polite">
        {lista.length} módulos
      </p>
      {lista.length ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map(({ m, avance, paso }) => (
            <li key={m.id}>
              <ModuloCard modulo={m} avance={avance} paso={paso} estadoConcepto={perfil?.conceptos[m.concepto]?.estado} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-[16px] border border-dashed border-line p-8 text-center text-ink-2">No hay módulos con este filtro.</div>
      )}
    </>
  )
}
