'use client'

import { useEffect, useRef, useState } from 'react'
import { Icono } from '@/components/app/Icono'
import { Formula } from '@/components/ui/Formula'
import { formatoReloj } from '@/lib/avance'
import type { Leccion } from '@/lib/cursos'

/** El reproductor es una simulación: avanza 20 veces más rápido para poder probar el flujo. */
const ACELERACION = 20
const VELOCIDADES = [1, 1.25, 1.5, 2]

interface Props {
  leccion: Leccion
  etiqueta: string
  docente: string
  /** Fracción ya vista (0–1), para retomar donde quedó. */
  inicio: number
  onAvance: (fraccion: number) => void
  onTerminar?: () => void
}

export function VideoPlayer({ leccion, etiqueta, docente, inicio, onAvance, onTerminar }: Props) {
  const dur = leccion.duracion
  const [t, setT] = useState(() => (inicio >= 0.98 ? 0 : inicio * dur))
  const [reproduciendo, setReproduciendo] = useState(false)
  const [velocidad, setVelocidad] = useState(1)
  const [subtitulos, setSubtitulos] = useState(true)
  const ultimoReporte = useRef(0)
  const onAvanceRef = useRef(onAvance)
  useEffect(() => {
    onAvanceRef.current = onAvance
  })

  useEffect(() => {
    if (!reproduciendo) return
    const id = window.setInterval(() => {
      setT((x) => Math.min(dur, x + 0.25 * velocidad * ACELERACION))
    }, 250)
    return () => window.clearInterval(id)
  }, [reproduciendo, velocidad, dur])

  useEffect(() => {
    const f = t / dur
    if (f - ultimoReporte.current >= 0.05 || f >= 1) {
      ultimoReporte.current = f
      onAvanceRef.current(f)
    }
    if (t >= dur && reproduciendo) {
      setReproduciendo(false)
      onTerminar?.()
    }
  }, [t, dur, reproduciendo, onTerminar])

  const terminado = t >= dur
  const frase = leccion.resumen[Math.min(leccion.resumen.length - 1, Math.floor((t / dur) * leccion.resumen.length))]

  function alternar() {
    if (terminado) {
      setT(0)
      ultimoReporte.current = 0
    }
    setReproduciendo((r) => !r)
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-ink bg-ink text-white">
      <div className="@container relative aspect-video">
        {/* Pizarra: no hay grabación todavía, se muestra la fórmula central de la lección */}
        <div aria-hidden="true" className="absolute inset-0 grid place-items-center px-[8%] text-[clamp(16px,5.5cqw,40px)]">
          <Formula tex={`\\displaystyle ${leccion.portada}`} />
        </div>
        <span aria-hidden="true" className="absolute top-[5%] left-[4%] font-mono text-[clamp(10px,2.4cqw,13px)] uppercase tracking-[0.14em] text-white/75">
          {etiqueta}
        </span>
        <span className="absolute top-[5%] right-[4%] rounded-[6px] bg-white/12 px-2 py-0.5 font-mono text-[clamp(9px,2cqw,12px)] text-white/85">
          Video simulado ×{ACELERACION}
        </span>
        <span aria-hidden="true" className="absolute bottom-[6%] left-[4%] font-mono text-[clamp(10px,2.2cqw,12px)] text-white/75">
          {docente}
        </span>

        {subtitulos && t > 0 && !terminado && (
          <p aria-live="off" className="absolute inset-x-[8%] bottom-[14%] text-center">
            <span className="rounded-[6px] bg-black/70 px-2 py-1 text-[clamp(12px,2.6cqw,17px)] leading-relaxed [box-decoration-break:clone]">{frase}</span>
          </p>
        )}

        {!reproduciendo && (
          <button
            type="button"
            onClick={alternar}
            className="absolute inset-0 grid place-items-center bg-ink/35 transition-colors duration-150 hover:bg-ink/20"
            aria-label={terminado ? 'Ver de nuevo' : t > 0 ? 'Seguir viendo' : 'Reproducir video'}
          >
            <span className="grid size-16 place-items-center rounded-full bg-white text-accent sm:size-20">
              <Icono nombre={terminado ? 'reiniciar' : 'play'} relleno={!terminado} className="size-7 sm:size-8" />
            </span>
          </button>
        )}
      </div>

      {/* Controles */}
      <div className="flex items-center gap-2 border-t border-white/10 px-2 py-1.5 sm:gap-3 sm:px-3">
        <button
          type="button"
          onClick={alternar}
          aria-label={reproduciendo ? 'Pausar' : 'Reproducir'}
          className="grid size-11 shrink-0 place-items-center rounded-[10px] hover:bg-white/10"
        >
          <Icono nombre={reproduciendo ? 'pausa' : 'play'} relleno className="size-5" />
        </button>
        <span className="shrink-0 font-mono text-xs text-white/85 tabular-nums">
          {formatoReloj(t)} / {formatoReloj(dur)}
        </span>
        <input
          type="range"
          min={0}
          max={dur}
          step={1}
          value={Math.round(t)}
          onChange={(e) => setT(Number(e.target.value))}
          aria-label="Posición del video"
          aria-valuetext={`${formatoReloj(t)} de ${formatoReloj(dur)}`}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-[#7F97F0]"
        />
        <button
          type="button"
          onClick={() => setVelocidad((v) => VELOCIDADES[(VELOCIDADES.indexOf(v) + 1) % VELOCIDADES.length])}
          aria-label={`Velocidad ${velocidad}×. Cambiar velocidad`}
          className="h-11 shrink-0 rounded-[10px] px-2 font-mono text-xs hover:bg-white/10"
        >
          {velocidad}×
        </button>
        <button
          type="button"
          onClick={() => setSubtitulos((s) => !s)}
          aria-pressed={subtitulos}
          aria-label="Subtítulos"
          className={`grid size-11 shrink-0 place-items-center rounded-[10px] hover:bg-white/10 ${subtitulos ? 'text-white' : 'text-white/55'}`}
        >
          <Icono nombre="subtitulos" className="size-5" />
        </button>
      </div>
    </div>
  )
}
