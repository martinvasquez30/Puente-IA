'use client'

import { useEffect, useMemo, useState } from 'react'
import { evidenciasDeTests } from './avance'
import { respuestasEjemplo } from './data'
import { calcularPerfil } from './profile'
import { useProgreso } from './progreso'
import { leerResultado } from './storage'
import type { Respuestas } from './types'

/**
 * Perfil del diagnóstico guardado en este navegador (o el de ejemplo, si no hay),
 * actualizado con los tests de las lecciones.
 */
export function usePerfil() {
  const [respuestas, setRespuestas] = useState<Respuestas | null>(null)
  const [ejemplo, setEjemplo] = useState(false)
  const progreso = useProgreso()

  useEffect(() => {
    const r = leerResultado()
    if (r && Object.keys(r).length) {
      setRespuestas(r)
    } else {
      setRespuestas(respuestasEjemplo)
      setEjemplo(true)
    }
  }, [])

  const tests = useMemo(() => evidenciasDeTests(progreso), [progreso])
  const perfil = useMemo(() => (respuestas ? calcularPerfil(respuestas, tests) : null), [respuestas, tests])
  return { perfil, ejemplo, listo: respuestas !== null, conTests: tests.length > 0 }
}
