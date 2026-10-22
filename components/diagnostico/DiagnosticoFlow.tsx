'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { QuestionCard } from '@/components/ui/QuestionCard'
import { Etiqueta } from '@/components/ui/Badges'
import { Icono } from '@/components/app/Icono'

function BarraSalir() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center border-b border-line bg-white/95 px-2 backdrop-blur-sm sm:px-4">
      <Link href="/diagnostico" className="inline-flex min-h-11 items-center gap-2 rounded-[10px] px-2 text-sm font-medium hover:bg-panel">
        <Icono nombre="atras" className="size-5" />
        Volver a Diagnóstico
      </Link>
    </header>
  )
}
import { items } from '@/lib/data'
import { borrarProgreso, guardarProgreso, guardarResultado, leerProgreso } from '@/lib/storage'
import type { Respuestas } from '@/lib/types'

type Fase = 'cargando' | 'intro' | 'preguntas' | 'calculando'

export function DiagnosticoFlow() {
  const router = useRouter()
  const [fase, setFase] = useState<Fase>('cargando')
  const [indice, setIndice] = useState(0)
  const [respuestas, setRespuestas] = useState<Respuestas>({})
  const [guardado, setGuardado] = useState<{ indice: number; n: number } | null>(null)
  const dialogo = useRef<HTMLDialogElement>(null)
  const zonaPregunta = useRef<HTMLDivElement>(null)
  const primeraVez = useRef(true)

  useEffect(() => {
    const p = leerProgreso()
    if (p && Object.keys(p.respuestas).length) {
      setGuardado({ indice: p.indice, n: Object.keys(p.respuestas).length })
      setRespuestas(p.respuestas)
      setIndice(p.indice)
    }
    setFase('intro')
  }, [])

  // Al cambiar de pregunta, el foco va al enunciado para que el lector de pantalla lo anuncie.
  useEffect(() => {
    if (fase !== 'preguntas') return
    if (primeraVez.current) {
      primeraVez.current = false
      return
    }
    zonaPregunta.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [indice, fase])

  const item = items[indice]
  const total = items.length
  const valor = item ? (respuestas[item.id] ?? null) : null
  const ultima = indice === total - 1

  function responder(v: string) {
    const nuevas = { ...respuestas, [item.id]: v }
    setRespuestas(nuevas)
    guardarProgreso({ respuestas: nuevas, indice })
  }

  function avanzar() {
    if (!valor) return
    if (ultima) {
      guardarResultado(respuestas)
      borrarProgreso()
      setFase('calculando')
      setTimeout(() => router.push('/diagnostico/perfil'), 450)
      return
    }
    const siguiente = indice + 1
    setIndice(siguiente)
    guardarProgreso({ respuestas, indice: siguiente })
  }

  function retroceder() {
    if (indice === 0) return
    setIndice(indice - 1)
    guardarProgreso({ respuestas, indice: indice - 1 })
  }

  function empezarDeNuevo() {
    borrarProgreso()
    setRespuestas({})
    setIndice(0)
    setGuardado(null)
    primeraVez.current = true
    setFase('preguntas')
  }

  if (fase === 'cargando') {
    return (
      <>
        <BarraSalir />
        <div className="mx-auto min-h-[60vh] max-w-xl px-4" aria-busy="true" />
      </>
    )
  }

  if (fase === 'intro') {
    return (
      <>
      <BarraSalir />
      <div className="mx-auto max-w-xl px-4 py-10 sm:py-14 animate-entrar">
        <Etiqueta>Diagnóstico · versión de prueba</Etiqueta>
        <h1 className="mt-3 text-[32px] leading-tight font-semibold sm:text-4xl">Antes de empezar</h1>
        <p className="mt-3 text-[17px] text-ink-2">
          Esta versión tiene {total} preguntas para mostrar cómo funciona. El diagnóstico completo tiene entre 35 y 45 y se adapta a lo que
          respondes.
        </p>
        <ul className="mt-6 grid gap-3">
          {[
            ['Sin cronómetro', 'El tiempo que tardes no cambia tu resultado. Tómate el que necesites.'],
            ['«Todavía no sé» vale', 'Si no sabes cómo resolver una pregunta, márcalo. Nos ayuda más que una respuesta al azar.'],
            ['Puedes pausar', 'Tu avance queda guardado en este dispositivo.'],
            ['Sin nota por pregunta', 'No te mostramos si acertaste cada una: al final ves tu perfil completo, concepto por concepto.'],
          ].map(([t, d]) => (
            <li key={t} className="rounded-[14px] border border-line bg-panel p-4">
              <p className="font-medium">{t}</p>
              <p className="mt-0.5 text-[15px] text-ink-2">{d}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 grid gap-3">
          {guardado ? (
            <>
              <button
                type="button"
                onClick={() => setFase('preguntas')}
                className="min-h-12 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
              >
                Retomar en la pregunta {guardado.indice + 1} de {total}
              </button>
              <button
                type="button"
                onClick={empezarDeNuevo}
                className="min-h-12 rounded-[12px] border border-line bg-white px-5 font-medium text-ink hover:border-ink-2/50"
              >
                Empezar de nuevo
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setFase('preguntas')}
              className="min-h-12 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6]"
            >
              Empezar
            </button>
          )}
        </div>
      </div>
      </>
    )
  }

  if (fase === 'calculando') {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center" role="status">
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-panel">
          <div className="h-full w-full origin-left animate-[entrar_400ms_ease-out_both] bg-accent" />
        </div>
        <p className="mt-4 font-display text-xl font-semibold">Armando tu perfil…</p>
        <p className="mt-1 text-ink-2">Cruzamos tus respuestas con el mapa de prerrequisitos.</p>
      </div>
    )
  }

  const avance = (indice + (valor ? 1 : 0)) / total

  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col">
      {/* Barra superior: progreso y pausa */}
      <div className="sticky top-0 z-20 border-b border-line bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-sm text-ink-2" aria-live="polite">
            Pregunta <span className="text-ink">{indice + 1}</span> de {total}
          </p>
          <button
            type="button"
            onClick={() => dialogo.current?.showModal()}
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-line px-3 text-sm font-medium hover:border-ink-2/50"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5" fill="currentColor">
              <rect x="3.5" y="3" width="3" height="10" rx="1" />
              <rect x="9.5" y="3" width="3" height="10" rx="1" />
            </svg>
            Pausa
          </button>
        </div>
        <div
          role="progressbar"
          aria-label="Avance del diagnóstico"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={Object.keys(respuestas).length}
          aria-valuetext={`${Object.keys(respuestas).length} de ${total} preguntas respondidas`}
          className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-panel"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-250 ease-out" style={{ width: `${avance * 100}%` }} />
        </div>
      </div>

      <div ref={zonaPregunta} tabIndex={-1} className="flex-1 px-4 pt-6 pb-8 outline-none" aria-label={`Pregunta ${indice + 1} de ${total}`}>
        <div key={item.id} className="animate-entrar">
          <QuestionCard item={item} numero={indice + 1} valor={valor} onCambio={responder} />
        </div>
      </div>

      {/* Acciones al alcance del pulgar */}
      <div className="sticky bottom-0 border-t border-line bg-white px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex gap-3">
          {indice > 0 && (
            <button
              type="button"
              onClick={retroceder}
              className="min-h-12 rounded-[12px] border border-line bg-white px-4 font-medium text-ink hover:border-ink-2/50"
            >
              Anterior
            </button>
          )}
          <button
            type="button"
            onClick={avanzar}
            disabled={!valor}
            className="min-h-12 flex-1 rounded-[12px] bg-accent px-5 font-medium text-white transition-colors duration-150 hover:bg-[#1d3aa6] disabled:cursor-not-allowed disabled:bg-[#DCE3EC] disabled:text-ink-2"
          >
            {ultima ? 'Terminar y ver mi perfil' : 'Siguiente'}
          </button>
        </div>
        {!valor && <p className="mt-2 text-center text-xs text-ink-2">Elige una alternativa o «Todavía no sé resolver esto».</p>}
      </div>

      <dialog
        ref={dialogo}
        aria-labelledby="pausa-titulo"
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-[18px] border border-line bg-white p-0 text-ink backdrop:bg-ink/40"
      >
        <div className="p-6">
          <h2 id="pausa-titulo" className="text-2xl font-semibold">
            Diagnóstico en pausa
          </h2>
          <p className="mt-2 text-ink-2">
            Llevas {Object.keys(respuestas).length} de {total} preguntas. Tu avance quedó guardado en este dispositivo; puedes volver cuando
            quieras, no hay tiempo límite.
          </p>
          <div className="mt-6 grid gap-3">
            <button
              type="button"
              autoFocus
              onClick={() => dialogo.current?.close()}
              className="min-h-12 rounded-[12px] bg-accent px-5 font-medium text-white hover:bg-[#1d3aa6]"
            >
              Seguir respondiendo
            </button>
            <Link
              href="/diagnostico"
              className="inline-flex min-h-12 items-center justify-center rounded-[12px] border border-line px-5 font-medium text-ink hover:border-ink-2/50"
            >
              Salir y seguir después
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  )
}
