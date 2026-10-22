import type { Estado, Letra } from '@/lib/types'

export const ESTADOS: Record<Estado, { etiqueta: string; letra: Letra; chip: string; celda: string }> = {
  dominado: {
    etiqueta: 'Dominado',
    letra: 'D',
    chip: 'bg-dom-bg text-dom border border-dom/20',
    celda: 'bg-dom-bg text-dom',
  },
  parcial: {
    etiqueta: 'Parcial',
    letra: 'P',
    chip: 'bg-par-bg text-par border border-par/20',
    celda: 'bg-par-bg text-par',
  },
  brecha: {
    etiqueta: 'Brecha crítica',
    letra: 'B',
    chip: 'bg-bre-bg text-bre border border-bre/20',
    celda: 'bg-bre-bg text-bre',
  },
  'sin-evidencia': {
    etiqueta: 'Sin evidencia',
    letra: '?',
    chip: 'bg-white text-ink-2 borde-punteado',
    celda: 'bg-white text-ink-2 borde-punteado',
  },
}

export const ORDEN_ESTADOS: Estado[] = ['brecha', 'parcial', 'dominado', 'sin-evidencia']

interface Props {
  estado: Estado
  tamano?: 'sm' | 'md'
  className?: string
}

export function StatusChip({ estado, tamano = 'md', className = '' }: Props) {
  const m = ESTADOS[estado]
  const t = tamano === 'sm' ? 'text-xs py-0.5 pl-0.5 pr-2 gap-1' : 'text-[13px] py-1 pl-1 pr-2.5 gap-1.5'
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full font-medium leading-none ${t} ${m.chip} ${className}`}>
      <span
        aria-hidden="true"
        className={`grid place-items-center rounded-full bg-white/80 font-mono font-medium ${tamano === 'sm' ? 'size-4 text-[10px]' : 'size-5 text-[11px]'}`}
      >
        {m.letra}
      </span>
      {m.etiqueta}
    </span>
  )
}

export function LeyendaEstados({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} aria-label="Leyenda de estados">
      {ORDEN_ESTADOS.map((e) => (
        <li key={e}>
          <StatusChip estado={e} tamano="sm" />
        </li>
      ))}
    </ul>
  )
}
