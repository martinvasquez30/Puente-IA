import { aristas, conceptos } from './data'

const padresDe = new Map<string, string[]>()
const hijosDe = new Map<string, string[]>()
for (const c of conceptos) {
  padresDe.set(c.id, [])
  hijosDe.set(c.id, [])
}
for (const a of aristas) {
  padresDe.get(a.hacia)!.push(a.desde)
  hijosDe.get(a.desde)!.push(a.hacia)
}

export const padres = (id: string) => padresDe.get(id) ?? []
export const hijos = (id: string) => hijosDe.get(id) ?? []

export function arista(desde: string, hacia: string) {
  return aristas.find((a) => a.desde === desde && a.hacia === hacia)
}

/** Prerrequisitos (directos e indirectos) con su distancia al nodo. */
export function ancestros(id: string): Map<string, number> {
  const dist = new Map<string, number>()
  const cola: [string, number][] = [[id, 0]]
  while (cola.length) {
    const [actual, d] = cola.shift()!
    for (const p of padres(actual)) {
      if (!dist.has(p)) {
        dist.set(p, d + 1)
        cola.push([p, d + 1])
      }
    }
  }
  return dist
}

/** Conceptos que dependen (directa o indirectamente) de este. */
export function descendientes(id: string): Set<string> {
  const vistos = new Set<string>()
  const pila = [id]
  while (pila.length) {
    const actual = pila.pop()!
    for (const h of hijos(actual)) {
      if (!vistos.has(h)) {
        vistos.add(h)
        pila.push(h)
      }
    }
  }
  return vistos
}
