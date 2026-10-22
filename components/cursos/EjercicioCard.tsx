'use client'

import { useId, useState } from 'react'
import { Rico } from './Rico'
import { Icono } from '@/components/app/Icono'
import { Formula } from '@/components/ui/Formula'
import type { Ejercicio } from '@/lib/cursos'
import type { EstadoEjercicio } from '@/lib/progreso'

interface Props {
  ejercicio: Ejercicio
  numero: number
  estado?: EstadoEjercicio
  solucionVista: boolean
  onVerSolucion: () => void
  onMarcar: (estado: EstadoEjercicio) => void
}

export function EjercicioCard({ ejercicio, numero, estado, solucionVista, onVerSolucion, onMarcar }: Props) {
  const [abierta, setAbierta] = useState(false)
  const id = useId()

  return (
    <article aria-labelledby={`${id}-titulo`} className="rounded-[16px] border border-line bg-white">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 id={`${id}-titulo`} className="font-mono text-xs font-medium uppercase tracking-wider text-ink-2">
            Ejercicio {numero}
          </h3>
          {estado === 'bien' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-dom/30 bg-dom-bg px-2 py-0.5 text-xs font-medium text-dom">
              <Icono nombre="check" className="size-3.5" /> Me salió
            </span>
          )}
          {estado === 'revisar' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-par/30 bg-par-bg px-2 py-0.5 text-xs font-medium text-par">
              <Icono nombre="reiniciar" className="size-3.5" /> A revisar
            </span>
          )}
        </div>
        <div className="mt-2 text-[17px]">
          <Rico texto={ejercicio.enunciado} />
        </div>
        {ejercicio.tex && (
          <div className="mt-3 rounded-[12px] bg-panel px-4 py-4 text-center text-lg">
            <Formula tex={ejercicio.tex} bloque />
          </div>
        )}

        <button
          type="button"
          aria-expanded={abierta}
          aria-controls={`${id}-solucion`}
          onClick={() => {
            setAbierta((a) => !a)
            if (!abierta) onVerSolucion()
          }}
          className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-[10px] px-4 text-sm font-medium transition-colors duration-150 ${
            abierta ? 'border border-line bg-white text-ink hover:border-ink-2/50' : 'bg-ink text-white hover:bg-ink/90'
          }`}
        >
          <Icono nombre={abierta ? 'cerrar' : 'lapiz'} className="size-4" />
          {abierta ? 'Ocultar solución' : solucionVista ? 'Ver la solución de nuevo' : 'Ver solución'}
        </button>
        {!abierta && !solucionVista && <p className="mt-2 text-xs text-ink-2">Intenta resolverlo en papel antes de abrir la solución.</p>}
      </div>

      {abierta && (
        <div id={`${id}-solucion`} className="border-t border-line bg-panel/60 p-4 animate-entrar sm:p-5">
          <p className="text-sm font-medium">Solución paso a paso</p>
          <ol className="mt-3 grid gap-3">
            {ejercicio.pasos.map((p, i) => (
              <li key={i} className="flex gap-3">
                <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-line bg-white font-mono text-[11px] text-ink-2">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1 text-[15px]">
                  <Rico texto={p} />
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[12px] border border-accent/30 bg-white px-4 py-3">
            <span className="font-mono text-xs uppercase tracking-wider text-accent">Resultado</span>
            <span className="text-lg">
              <Formula tex={`\\displaystyle ${ejercicio.resultado}`} />
            </span>
          </div>

          <fieldset className="mt-5">
            <legend className="text-sm font-medium">¿Cómo te fue?</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={estado === 'bien'}
                onClick={() => onMarcar('bien')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors duration-150 ${
                  estado === 'bien' ? 'border-dom bg-dom-bg text-dom' : 'border-line bg-white hover:border-ink-2/50'
                }`}
              >
                <Icono nombre="check" className="size-4" /> Me salió
              </button>
              <button
                type="button"
                aria-pressed={estado === 'revisar'}
                onClick={() => onMarcar('revisar')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors duration-150 ${
                  estado === 'revisar' ? 'border-par bg-par-bg text-par' : 'border-line bg-white hover:border-ink-2/50'
                }`}
              >
                <Icono nombre="reiniciar" className="size-4" /> Me equivoqué
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-2">No es nota: solo te ayuda a ver qué repasar.</p>
          </fieldset>
        </div>
      )}
    </article>
  )
}
