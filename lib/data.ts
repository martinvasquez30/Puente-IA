import conceptosJson from '@/data/concepts.json'
import aristasJson from '@/data/edges.json'
import itemsJson from '@/data/items.json'
import estudiantesJson from '@/data/students.json'
import ejemploJson from '@/data/ejemplo.json'
import fuentesJson from '@/data/sources.json'
import type { Arista, Concepto, Estudiante, Item, Respuestas } from './types'

export const conceptos = conceptosJson as Concepto[]
export const aristas = aristasJson as Arista[]
export const items = itemsJson as Item[]
export const estudiantes = estudiantesJson as Estudiante[]
export const respuestasEjemplo = ejemploJson.respuestas as Respuestas
export const fuentes = fuentesJson as {
  id: string
  cifra: string
  texto: string
  fuente: string
  enlace: string | null
}[]

/** Conceptos evaluables (sin el nodo objetivo), en orden de capas. */
export const conceptosEvaluables = conceptos
  .filter((c) => !c.objetivo)
  .sort((a, b) => a.fila - b.fila || a.x - b.x)

export const objetivo = conceptos.find((c) => c.objetivo)!

const porId = new Map(conceptos.map((c) => [c.id, c]))
export function concepto(id: string): Concepto {
  const c = porId.get(id)
  if (!c) throw new Error(`Concepto desconocido: ${id}`)
  return c
}
