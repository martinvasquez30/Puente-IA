'use client'

import { useEffect, useRef, useState } from 'react'
import { Opcion, Rico } from './Rico'
import { Icono } from '@/components/app/Icono'
import { Formula } from '@/components/ui/Formula'
import { APROBACION, type Leccion } from '@/lib/cursos'
import type { ResultadoTest } from '@/lib/progreso'

const LETRAS = ['A', 'B', 'C', 'D', 'E']

interface Props {
  leccion: Leccion
  resultado?: ResultadoTest
  videoVisto: boolean
  onEnviar: (respuestas: Record<string, number>, aciertos: number, total: number) => void
}

export function TestLeccion({ leccion, resultado, videoVisto, onEnviar }: Props) {
  const preguntas = leccion.test
  const minimo = Math.ceil(preguntas.length * APROBACION)
  const [modo, setModo] = useState<'intro' | 'respondiendo' | 'revision'>(resultado ? 'revision' : 'intro')
  const [respuestas, setRespuestas] = useState<Record<string, number>>({})
  const tituloResultado = useRef<HTMLHeadingElement>(null)
  const recienEnviado = useRef(false)

  useEffect(() => {
    if (modo === 'revision' && recienEnviado.current) {
      recienEnviado.current = false
      tituloResultado.current?.focus()
    }
  }, [modo])

  const respondidas = Object.keys(respuestas).length

  function enviar() {
    const aciertos = preguntas.filter((q) => respuestas[q.id] === q.correcta).length
    onEnviar(respuestas, aciertos, preguntas.length)
    recienEnviado.current = true
    setModo('revision')
  }

  if (modo === 'intro') {
    return (
      <div className="rounded-[16px] border border-line bg-white p-5 sm:p-6">
        <ul className="grid gap-2 text-[15px] sm:grid-cols-2">
          {[
            `${preguntas.length} preguntas de alternativas`,
            `Apruebas con ${minimo} correctas`,
            'Sin tiempo límite',
            'Puedes repetirlo las veces que quieras',
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Icono nombre="check" className="size-4 text-ink-2" />
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-ink-2">Tu resultado se suma como evidencia a tu perfil del diagnóstico.</p>
        {!videoVisto && (
          <p className="mt-3 rounded-[10px] bg-panel px-3 py-2 text-sm">Te conviene ver el video y revisar los ejercicios antes, pero puedes rendirlo cuando quieras.</p>
        )}
        <button
          type="button"
          onClick={() => setModo('respondiendo')}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
        >
          <Icono nombre="test" className="size-5" />
          Empezar el test
        </button>
      </div>
    )
  }

  if (modo === 'respondiendo') {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (respondidas === preguntas.length) enviar()
        }}
        className="grid gap-4"
      >
        {preguntas.map((q, i) => (
          <fieldset key={q.id} className="min-w-0 rounded-[16px] border border-line bg-white p-4 sm:p-5">
            <legend className="sr-only">Pregunta {i + 1} de {preguntas.length}</legend>
            <p aria-hidden="true" className="font-mono text-xs uppercase tracking-wider text-ink-2">
              Pregunta {i + 1} de {preguntas.length}
            </p>
            <div className="mt-1.5 text-[17px]">
              <Rico texto={q.enunciado} />
            </div>
            {q.tex && (
              <div className="mt-3 rounded-[12px] bg-panel px-4 py-3 text-center text-lg">
                <Formula tex={q.tex} bloque />
              </div>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {q.opciones.map((o, j) => (
                <label
                  key={j}
                  className="group relative flex min-h-13 cursor-pointer items-center gap-3 rounded-[12px] border border-line bg-white px-3 py-2.5 transition-colors duration-150 hover:border-ink-2/50 has-checked:border-accent has-checked:bg-accent-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent"
                >
                  <input
                    type="radio"
                    name={`test-${leccion.id}-${q.id}`}
                    checked={respuestas[q.id] === j}
                    onChange={() => setRespuestas((r) => ({ ...r, [q.id]: j }))}
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border border-line font-mono text-xs text-ink-2 group-has-checked:border-accent group-has-checked:bg-accent group-has-checked:text-white"
                  >
                    {LETRAS[j]}
                  </span>
                  <span className="min-w-0 flex-1 text-[16px]">
                    <Opcion texto={o} />
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-line bg-white px-4 py-3 sm:static sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:p-0">
          <p className="text-sm text-ink-2" aria-live="polite">
            {respondidas} de {preguntas.length} respondidas
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setRespuestas({})
                setModo(resultado ? 'revision' : 'intro')
              }}
              className="min-h-12 rounded-[12px] border border-line px-4 font-medium hover:border-ink-2/50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={respondidas < preguntas.length}
              className="min-h-12 flex-1 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6] disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-2 sm:flex-none"
            >
              Enviar respuestas
            </button>
          </div>
        </div>
      </form>
    )
  }

  // Revisión del último intento
  const r = resultado
  if (!r) return null
  return (
    <div className="grid gap-4">
      <div className={`rounded-[16px] border p-5 sm:p-6 ${r.aprobado ? 'border-dom/40 bg-dom-bg/50' : 'border-par/40 bg-par-bg/50'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 ref={tituloResultado} tabIndex={-1} className="flex items-center gap-2 text-xl font-semibold outline-none">
              <Icono nombre={r.aprobado ? 'check' : 'reiniciar'} className={`size-6 ${r.aprobado ? 'text-dom' : 'text-par'}`} />
              {r.aprobado ? 'Test aprobado' : 'Todavía no apruebas'}
            </h3>
            <p className="mt-1 text-[15px] text-ink-2">
              {r.aprobado
                ? videoVisto
                  ? 'Lección completada. Este resultado ya cuenta en tu perfil.'
                  : 'Para completar la lección, termina de ver el video.'
                : `Necesitas ${minimo} de ${r.total}. Revisa las explicaciones y los ejercicios, y vuelve a intentarlo.`}
            </p>
          </div>
          <p className="font-mono text-4xl font-medium">
            {r.aciertos}
            <span className="text-xl text-ink-2">/{r.total}</span>
          </p>
        </div>
        <p className="mt-3 font-mono text-xs text-ink-2">
          Intento {r.intentos} · {new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(r.fecha))}
        </p>
      </div>

      <ol className="grid gap-3">
        {preguntas.map((q, i) => {
          const elegida = r.respuestas[q.id]
          const bien = elegida === q.correcta
          return (
            <li key={q.id} className="rounded-[16px] border border-line bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-xs uppercase tracking-wider text-ink-2">Pregunta {i + 1}</p>
                <span
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    bien ? 'border border-dom/30 bg-dom-bg text-dom' : 'border border-bre/30 bg-bre-bg text-bre'
                  }`}
                >
                  <Icono nombre={bien ? 'check' : 'cerrar'} className="size-3.5" />
                  {bien ? 'Correcta' : 'Incorrecta'}
                </span>
              </div>
              <div className="mt-1.5">
                <Rico texto={q.enunciado} /> {q.tex && <Formula tex={q.tex} />}
              </div>
              <dl className="mt-3 grid gap-1.5 text-[15px]">
                <div className="flex flex-wrap gap-x-2">
                  <dt className="text-ink-2">Tu respuesta:</dt>
                  <dd>{elegida !== undefined ? <Opcion texto={q.opciones[elegida]} /> : 'Sin responder'}</dd>
                </div>
                {!bien && (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-ink-2">Respuesta correcta:</dt>
                    <dd>
                      <Opcion texto={q.opciones[q.correcta]} />
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-3 rounded-[10px] bg-panel px-3 py-2 text-sm">
                <Rico texto={q.explicacion} />
              </div>
            </li>
          )
        })}
      </ol>

      <div>
        <button
          type="button"
          onClick={() => {
            setRespuestas({})
            setModo('respondiendo')
          }}
          className={`inline-flex min-h-12 items-center gap-2 rounded-[12px] px-5 font-medium transition-colors duration-150 ${
            r.aprobado ? 'border border-line bg-white hover:border-ink-2/50' : 'bg-accent text-white hover:bg-[#1d3aa6]'
          }`}
        >
          <Icono nombre="reiniciar" className="size-5" />
          Repetir el test
        </button>
      </div>
    </div>
  )
}
