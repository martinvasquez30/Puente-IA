import { Etiqueta } from '@/components/ui/Badges'

interface Props {
  id: string
  etiqueta: string
  titulo: string
  intro?: React.ReactNode
  children: React.ReactNode
  fondo?: 'blanco' | 'panel'
}

export function Seccion({ id, etiqueta, titulo, intro, children, fondo = 'blanco' }: Props) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={`scroll-mt-16 border-t border-line ${fondo === 'panel' ? 'bg-panel' : 'bg-white'}`}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
        <Etiqueta>{etiqueta}</Etiqueta>
        <h2 id={`${id}-titulo`} className="mt-3 max-w-3xl text-[28px] leading-tight font-semibold sm:text-4xl">
          {titulo}
        </h2>
        {intro && <div className="mt-4 max-w-2xl text-[17px] text-ink-2">{intro}</div>}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  )
}
