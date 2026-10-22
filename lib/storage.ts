import type { Respuestas } from './types'

const CLAVE_PROGRESO = 'puente:diagnostico:progreso'
const CLAVE_RESULTADO = 'puente:diagnostico:respuestas'
const CLAVE_FECHA = 'puente:diagnostico:fecha'

export interface Progreso {
  respuestas: Respuestas
  indice: number
}

function leer<T>(clave: string): T | null {
  try {
    const crudo = window.localStorage.getItem(clave)
    return crudo ? (JSON.parse(crudo) as T) : null
  } catch {
    return null
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    // Sin almacenamiento (modo privado, etc.): el flujo sigue funcionando en memoria.
  }
}

function borrar(clave: string) {
  try {
    window.localStorage.removeItem(clave)
  } catch {}
}

export const leerProgreso = () => leer<Progreso>(CLAVE_PROGRESO)
export const guardarProgreso = (p: Progreso) => escribir(CLAVE_PROGRESO, p)
export const borrarProgreso = () => borrar(CLAVE_PROGRESO)

export const leerResultado = () => leer<Respuestas>(CLAVE_RESULTADO)
export const guardarResultado = (r: Respuestas) => {
  escribir(CLAVE_RESULTADO, r)
  escribir(CLAVE_FECHA, new Date().toISOString())
}
export const borrarResultado = () => {
  borrar(CLAVE_RESULTADO)
  borrar(CLAVE_FECHA)
}
export const leerFechaResultado = () => leer<string>(CLAVE_FECHA)
