'use client'

import { Formula } from './Formula'
import type { Item } from '@/lib/types'
import { NO_SE } from '@/lib/types'

interface Props {
  item: Item
  numero: number
  valor: string | null
  onCambio: (valor: string) => void
  /** Para vistas previas estáticas (landing). */
  soloLectura?: boolean
}

const LETRAS = ['A', 'B', 'C', 'D', 'E']

const opcionBase =
  'group relative flex min-h-14 cursor-pointer items-center gap-3 rounded-[12px] border bg-white px-3.5 py-3 transition-colors duration-150 ' +
  'border-line hover:border-ink-2/50 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent'

export function QuestionCard({ item, numero, valor, onCambio, soloLectura = false }: Props) {
  const nombre = `pregunta-${item.id}`
  return (
    <fieldset className="min-w-0">
      <legend className="w-full">
        <span className={soloLectura ? 'font-mono text-xs uppercase tracking-wider text-ink-2' : 'sr-only'}>Pregunta {numero}. </span>
        <span className="block text-lg font-medium text-ink">{item.enunciado}</span>
      </legend>

      <div className="mt-3 rounded-[14px] border border-line bg-panel px-4 py-5 text-center text-xl">
        <Formula tex={item.tex} hablado={item.hablado} bloque />
      </div>

      <div className="mt-4 grid gap-2.5" role="radiogroup" aria-label={`Alternativas de la pregunta ${numero}`}>
        {item.alternativas.map((alt, i) => (
          <label key={alt.id} className={opcionBase}>
            <input
              type="radio"
              name={nombre}
              value={alt.id}
              checked={valor === alt.id}
              onChange={() => onCambio(alt.id)}
              disabled={soloLectura}
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className="grid size-7 shrink-0 place-items-center rounded-full border border-line bg-white font-mono text-xs text-ink-2 transition-colors duration-150 group-has-checked:border-accent group-has-checked:bg-accent group-has-checked:text-white"
            >
              {LETRAS[i]}
            </span>
            <span className="min-w-0 flex-1 text-[17px]">
              {alt.tex ? <Formula tex={`\\displaystyle ${alt.tex}`} hablado={alt.hablado} /> : alt.texto}
            </span>
          </label>
        ))}

        <div className="my-1 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-line" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-2">o</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <label className={`${opcionBase} border-dashed`}>
          <input
            type="radio"
            name={nombre}
            value={NO_SE}
            checked={valor === NO_SE}
            onChange={() => onCambio(NO_SE)}
            disabled={soloLectura}
            className="peer sr-only"
          />
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center rounded-full border border-dashed border-ink-2/60 bg-white font-mono text-xs text-ink-2 group-has-checked:border-accent group-has-checked:bg-accent group-has-checked:text-white"
          >
            ?
          </span>
          <span className="flex-1">
            <span className="block font-medium">Todavía no sé resolver esto</span>
            <span className="block text-sm text-ink-2">Elegirla nos ayuda más que adivinar.</span>
          </span>
        </label>
      </div>
    </fieldset>
  )
}
