export function EjemploTag({ texto = 'Datos de ejemplo', className = '' }: { texto?: string; className?: string }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white px-2.5 py-1 font-mono text-[11px] uppercase leading-none tracking-wider text-ink-2 ${className}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full border border-ink-2" />
      {texto}
    </span>
  )
}

export function Etiqueta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent ${className}`}>{children}</p>
  )
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-panel px-1 font-mono text-[0.9em] text-ink-2">{children}</span>
}
