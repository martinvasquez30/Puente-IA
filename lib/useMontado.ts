'use client'

import { useSyncExternalStore } from 'react'

const sinSuscripcion = () => () => {}

/** true solo en el cliente, después de hidratar. Útil para contenido que depende de la fecha o de localStorage. */
export function useMontado() {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false,
  )
}
