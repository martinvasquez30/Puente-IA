'use client'

import Link from 'next/link'
import { Icono, type NombreIcono } from '@/components/app/Icono'
import { estadoLeccion, formatoDuracion } from '@/lib/avance'
import type { Modulo } from '@/lib/cursos'
import type { Progreso } from '@/lib/progreso'

interface Props {
  modulo: Modulo
  actual: string
  progreso: Progreso
  onNavegar?: () => void
}

/** Índice del módulo al costado de la lección, al estilo de las plataformas de cursos. */
export function Temario({ modulo, actual, progreso, onNavegar }: Props) {
  return (
    <nav aria-label={`Contenido de ${modulo.titulo}`}>
      <ol className="grid gap-1">
        {modulo.lecciones.map((l, i) => {
          const e = estadoLeccion(progreso, l)
          const esActual = l.id === actual
          return (
            <li key={l.id}>
              <Link
                href={`/modulos/${modulo.id}/${l.id}`}
                onClick={onNavegar}
                aria-current={esActual ? 'page' : undefined}
                className={`flex min-h-11 items-start gap-3 rounded-[10px] px-3 py-2.5 text-sm transition-colors duration-150 ${
                  esActual ? 'bg-accent-soft' : 'hover:bg-panel'
                }`}
              >
                <EstadoMarca completada={e.completada} enProduccion={l.enProduccion} numero={i + 1} actual={esActual} />
                <span className="min-w-0">
                  <span className={`block font-medium ${esActual ? 'text-accent' : 'text-ink'}`}>{l.titulo}</span>
                  <span className="block font-mono text-xs text-ink-2">{l.enProduccion ? 'En producción' : formatoDuracion(l.duracion)}</span>
                </span>
              </Link>
              {esActual && !l.enProduccion && (
                <ul className="mt-1 mb-2 ml-[2.6rem] grid gap-0.5 border-l border-line pl-3">
                  <SubItem href="#video" icono="video" texto="Video" hecho={e.visto} onNavegar={onNavegar} />
                  <SubItem
                    href="#ejercicios"
                    icono="lapiz"
                    texto={`Ejercicios · ${e.ejercicios}/${l.ejercicios.length}`}
                    hecho={e.ejercicios === l.ejercicios.length}
                    onNavegar={onNavegar}
                  />
                  <SubItem
                    href="#test"
                    icono="test"
                    texto={e.test ? `Test · ${e.test.aciertos}/${e.test.total}` : 'Test'}
                    hecho={Boolean(e.test?.aprobado)}
                    onNavegar={onNavegar}
                  />
                </ul>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

function EstadoMarca({ completada, enProduccion, numero, actual }: { completada: boolean; enProduccion?: boolean; numero: number; actual: boolean }) {
  if (completada)
    return (
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-dom text-white">
        <Icono nombre="check" className="size-3.5" />
        <span className="sr-only">Completada:</span>
      </span>
    )
  return (
    <span
      className={`grid size-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] ${
        enProduccion ? 'border-dashed border-ink-2/50 text-ink-2' : actual ? 'border-accent text-accent' : 'border-line text-ink-2'
      }`}
    >
      {numero}
    </span>
  )
}

function SubItem({ href, icono, texto, hecho, onNavegar }: { href: string; icono: NombreIcono; texto: string; hecho: boolean; onNavegar?: () => void }) {
  return (
    <li>
      <a href={href} onClick={onNavegar} className="flex min-h-11 items-center justify-between gap-2 rounded-[8px] px-2 text-sm text-ink-2 hover:bg-panel hover:text-ink">
        <span className="flex items-center gap-2">
          <Icono nombre={icono} className="size-4" />
          {texto}
        </span>
        {hecho && (
          <span className="text-dom">
            <Icono nombre="check" className="size-4" />
            <span className="sr-only">hecho</span>
          </span>
        )}
      </a>
    </li>
  )
}
