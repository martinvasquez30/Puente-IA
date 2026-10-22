import { ESTADOS } from './StatusChip'
import type { Letra } from '@/lib/types'
import { letraAEstado } from '@/lib/tutor'

interface Props {
  letra: Letra
  estudiante: string
  concepto: string
  resaltada?: boolean
  atenuada?: boolean
}

export function HeatmapCell({ letra, estudiante, concepto, resaltada = false, atenuada = false }: Props) {
  const estado = letraAEstado[letra]
  const m = ESTADOS[estado]
  return (
    <td className={`border-t border-line p-0.5 ${resaltada ? 'bg-accent-soft' : ''}`}>
      <div
        data-tip={`${estudiante} · ${concepto}: ${m.etiqueta}`}
        className={`grid h-8 min-w-8 place-items-center rounded-[6px] font-mono text-xs font-medium transition-opacity duration-150 ${m.celda} ${
          atenuada ? 'opacity-40' : ''
        }`}
      >
        <span aria-hidden="true">{m.letra}</span>
        <span className="sr-only">{m.etiqueta}</span>
      </div>
    </td>
  )
}
