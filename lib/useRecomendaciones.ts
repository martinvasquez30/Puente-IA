'use client'

import { useMemo } from 'react'
import { moduloDeConcepto } from '@/data/modulos'
import { construirRuta } from './route'
import type { EstadoPaso } from './types'
import { usePerfil } from './usePerfil'

/** Perfil, ruta y qué módulos se recomiendan según el diagnóstico (y los tests). */
export function useRecomendaciones() {
  const { perfil, ejemplo, listo, conTests } = usePerfil()
  const ruta = useMemo(() => (perfil ? construirRuta(perfil) : null), [perfil])

  const pasoPorModulo = useMemo(() => {
    const mapa = new Map<string, EstadoPaso>()
    ruta?.pasos.forEach((p) => {
      const m = moduloDeConcepto(p.id)
      if (m) mapa.set(m.id, p.estadoPaso)
    })
    return mapa
  }, [ruta])

  const recomendados = useMemo(
    () =>
      (ruta?.pasos ?? [])
        .filter((p) => p.estadoPaso === 'en-curso' || p.estadoPaso === 'disponible')
        .map((p) => moduloDeConcepto(p.id))
        .filter((m): m is NonNullable<typeof m> => Boolean(m)),
    [ruta],
  )

  return { perfil, ruta, ejemplo, listo, conTests, pasoPorModulo, recomendados }
}
