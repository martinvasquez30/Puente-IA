import Link from 'next/link'
import { Portada } from '@/components/app/Portada'
import { Icono } from '@/components/app/Icono'
import { StatusChip } from '@/components/ui/StatusChip'
import type { Modulo } from '@/lib/cursos'
import type { Estado, EstadoPaso } from '@/lib/types'
import { formatoDuracion } from '@/lib/avance'

interface Props {
  modulo: Modulo
  estadoConcepto?: Estado
  paso?: EstadoPaso
  avance: { completadas: number; disponibles: number; fraccion: number; iniciado: boolean; completo: boolean; duracion: number }
}

export function ModuloCard({ modulo, estadoConcepto, paso, avance }: Props) {
  const recomendado = paso === 'en-curso' || paso === 'disponible'
  return (
    <Link
      href={`/modulos/${modulo.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[16px] border border-line bg-white transition-colors duration-150 hover:border-ink-2/40"
    >
      <div className="p-2 pb-0">
        <Portada tex={modulo.lecciones[0].portada} etiqueta={`Módulo ${String(modulo.numero).padStart(2, '0')}`} duracion={formatoDuracion(avance.duracion)} />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {recomendado && (
            <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
              {paso === 'en-curso' ? 'Empieza por aquí' : 'Recomendado'}
            </span>
          )}
          {avance.completo && (
            <span className="inline-flex items-center gap-1 rounded-full border border-dom/30 bg-dom-bg px-2 py-0.5 text-xs font-medium text-dom">
              <Icono nombre="check" className="size-3.5" /> Completado
            </span>
          )}
          {estadoConcepto && <StatusChip estado={estadoConcepto} tamano="sm" />}
        </div>
        <h3 className="mt-2 text-[17px] leading-snug font-semibold group-hover:text-accent">{modulo.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{modulo.descripcion}</p>
        <p className="mt-3 font-mono text-xs text-ink-2">
          {modulo.lecciones.length} lecciones · {modulo.docente.split(' · ')[0]}
        </p>
        <div className="mt-auto pt-4">
          {avance.iniciado ? (
            <div>
              <div className="flex items-center justify-between text-xs text-ink-2">
                <span>
                  {avance.completadas} de {avance.disponibles} {avance.disponibles === 1 ? 'lección' : 'lecciones'}
                </span>
                <span className="font-mono">{Math.round(avance.fraccion * 100)}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-panel">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.max(avance.fraccion * 100, 4)}%` }} />
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-2">Sin empezar</p>
          )}
        </div>
      </div>
    </Link>
  )
}
