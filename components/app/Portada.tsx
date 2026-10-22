import { Formula } from '@/components/ui/Formula'

interface Props {
  tex: string
  etiqueta?: string
  duracion?: string
  className?: string
}

/** Portada de módulo o video: pizarra en tinta con la fórmula central de la lección. */
export function Portada({ tex, etiqueta, duracion, className = '' }: Props) {
  return (
    <div aria-hidden="true" className={`@container relative aspect-video overflow-hidden rounded-[12px] bg-ink text-white ${className}`}>
      <div className="absolute inset-0 grid place-items-center px-[6%] text-[clamp(12px,5cqw,30px)]">
        <Formula tex={`\\displaystyle ${tex}`} className="max-w-full" />
      </div>
      {etiqueta && (
        <span className="absolute top-[7%] left-[5%] font-mono text-[clamp(9px,3cqw,13px)] uppercase tracking-[0.14em] text-white/75">{etiqueta}</span>
      )}
      <span className="absolute bottom-[8%] left-[5%] h-0.5 w-[10%] rounded-full bg-[#7F97F0]" />
      {duracion && (
        <span className="absolute right-[4%] bottom-[7%] rounded-[6px] bg-white/12 px-1.5 py-0.5 font-mono text-[clamp(9px,2.8cqw,12px)] text-white">
          {duracion}
        </span>
      )}
    </div>
  )
}
