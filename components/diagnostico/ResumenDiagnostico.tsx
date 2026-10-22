'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Icono } from '@/components/app/Icono'
import { CoverageBar } from '@/components/ui/CoverageBar'
import { RichText } from '@/components/ui/Formula'
import { StatusChip } from '@/components/ui/StatusChip'
import { moduloDeConcepto } from '@/data/modulos'
import { concepto, items } from '@/lib/data'
import { formatoFecha, proximoMiniDiagnostico } from '@/lib/fecha'
import { leerFechaResultado, leerProgreso } from '@/lib/storage'
import { usePerfil } from '@/lib/usePerfil'

const PRINCIPIOS: [string, string][] = [
  ['Sin cronómetro', 'El tiempo que tardes no cambia tu resultado.'],
  ['«Todavía no sé» vale', 'Marcarlo ayuda más que adivinar.'],
  ['Rangos, no notas', 'Cada concepto queda con un rango de confianza; si no sabemos, lo decimos.'],
  ['Se actualiza solo', 'Tus tests de los módulos y los mini-diagnósticos ajustan el perfil.'],
]

export function ResumenDiagnostico() {
  const { perfil, ejemplo, listo, conTests } = usePerfil()
  const [fecha, setFecha] = useState<string | null>(null)
  const [enCurso, setEnCurso] = useState<number | null>(null)

  useEffect(() => {
    setFecha(leerFechaResultado())
    const p = leerProgreso()
    setEnCurso(p && Object.keys(p.respuestas).length ? Object.keys(p.respuestas).length : null)
  }, [])

  if (!listo || !perfil) return <div className="min-h-[40vh]" aria-busy="true" />
  const empezar = perfil.empezar
  const modEmpezar = empezar ? moduloDeConcepto(empezar.id) : undefined

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
      <div className="grid gap-6">
        {/* Estado del diagnóstico */}
        <section aria-labelledby="estado-titulo" className="rounded-[18px] border border-line bg-white p-5 sm:p-6">
          {ejemplo ? (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-ink-2">{enCurso ? 'Diagnóstico a medias' : 'Aún no lo haces'}</p>
              <h2 id="estado-titulo" className="mt-1.5 text-2xl font-semibold">
                {enCurso ? `Llevas ${enCurso} de ${items.length} preguntas` : 'Diagnóstico de prerrequisitos'}
              </h2>
              <p className="mt-2 text-ink-2">
                El diagnóstico completo tiene entre 35 y 45 preguntas (~40 min) y se adapta a lo que respondes. En este prototipo son {items.length}.
              </p>
              <Link
                href="/diagnostico/prueba"
                className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
              >
                <Icono nombre="diagnostico" className="size-5" />
                {enCurso ? 'Retomar el diagnóstico' : 'Empezar el diagnóstico'}
              </Link>
              <p className="mt-3 text-sm text-ink-2">Mientras tanto, la app usa un perfil de ejemplo para recomendarte módulos.</p>
            </>
          ) : (
            <>
              <p className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-dom">
                <Icono nombre="check" className="size-4" /> Diagnóstico completado
              </p>
              <h2 id="estado-titulo" className="mt-1.5 text-2xl font-semibold">
                Tu perfil de entrada
              </h2>
              <p className="mt-1 text-sm text-ink-2">
                {fecha ? `Respondido el ${formatoFecha(new Date(fecha))}` : 'Respondido en este dispositivo'}
                {conTests ? ' · actualizado con tus tests' : ''}
              </p>
              <CoverageBar rango={perfil.cobertura} className="mt-5" />
              <div className="mt-2 flex flex-wrap gap-3">
                <Link href="/diagnostico/perfil" className="inline-flex min-h-11 items-center rounded-[10px] bg-ink px-4 text-sm font-medium text-white hover:bg-ink/90">
                  Ver mi perfil
                </Link>
                <Link href="/diagnostico/prueba" className="inline-flex min-h-11 items-center rounded-[10px] border border-line px-4 text-sm font-medium hover:border-ink-2/50">
                  Rehacer el diagnóstico
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Empieza por aquí */}
        {empezar && (
          <section aria-labelledby="empieza-resumen" className="rounded-[18px] border border-accent bg-white p-5 ring-4 ring-accent-soft sm:p-6">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-accent">Empieza por aquí{ejemplo ? ' · ejemplo' : ''}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h2 id="empieza-resumen" className="text-xl font-semibold">
                {concepto(empezar.id).nombre}
              </h2>
              <StatusChip estado={perfil.conceptos[empezar.id].estado} tamano="sm" />
            </div>
            <p className="mt-2 text-[15px] text-ink-2">
              <RichText texto={empezar.razones[0]} />
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {modEmpezar && (
                <Link
                  href={`/modulos/${modEmpezar.id}`}
                  className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-accent px-4 text-sm font-medium text-white hover:bg-[#1d3aa6]"
                >
                  Ir al módulo {String(modEmpezar.numero).padStart(2, '0')}
                </Link>
              )}
              <Link href="/diagnostico/ruta" className="inline-flex min-h-11 items-center rounded-[10px] border border-line px-4 text-sm font-medium hover:border-ink-2/50">
                Ver mi ruta
              </Link>
            </div>
          </section>
        )}
      </div>

      <aside className="grid gap-6">
        <section aria-labelledby="mini-resumen" className="rounded-[18px] border border-line bg-panel p-5">
          <h2 id="mini-resumen" className="flex items-center gap-2 font-semibold">
            <Icono nombre="calendario" className="size-5 text-ink-2" />
            Próximo mini-diagnóstico
          </h2>
          <p className="mt-2 font-display text-xl font-semibold first-letter:uppercase">{formatoFecha(proximoMiniDiagnostico())}</p>
          <p className="mt-1 text-sm text-ink-2">~8 preguntas. Revisa los conceptos sin evidencia y lo que estás practicando; si muestras dominio, ese paso de la ruta se salta.</p>
          <ul className="mt-3 grid gap-1.5">
            {Object.values(perfil.conceptos)
              .filter((c) => c.estado === 'sin-evidencia' || c.id === empezar?.id)
              .map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-sm">
                  {concepto(c.id).nombre}
                  <StatusChip estado={c.estado} tamano="sm" />
                </li>
              ))}
          </ul>
        </section>

        <section aria-labelledby="como-titulo" className="rounded-[18px] border border-line bg-white p-5">
          <h2 id="como-titulo" className="font-semibold">
            Cómo funciona
          </h2>
          <ul className="mt-3 grid gap-3">
            {PRINCIPIOS.map(([t, d]) => (
              <li key={t}>
                <p className="text-sm font-medium">{t}</p>
                <p className="text-sm text-ink-2">{d}</p>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  )
}
