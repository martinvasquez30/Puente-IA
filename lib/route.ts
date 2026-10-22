import { concepto, conceptosEvaluables, objetivo } from './data'
import { arista, hijos, padres } from './graph'
import type { Estado, Paso, Perfil } from './types'

const prioridad: Record<Estado, number> = { brecha: 0, parcial: 1, 'sin-evidencia': 2, dominado: 3 }

export interface Ruta {
  dominados: string[]
  pasos: Paso[]
  /** Cadena principal desde el paso en curso hasta el objetivo. */
  cadena: string[]
}

/**
 * Ordena los conceptos no dominados respetando prerrequisitos (orden topológico).
 * Entre los listos para ubicar, se prefiere continuar la cadena del paso anterior,
 * luego las brechas, luego la capa más baja.
 */
export function construirRuta(perfil: Perfil): Ruta {
  const estado = (id: string) => perfil.conceptos[id]?.estado ?? null
  const dominados = conceptosEvaluables.filter((c) => estado(c.id) === 'dominado').map((c) => c.id)
  const pendientes = conceptosEvaluables.filter((c) => estado(c.id) !== 'dominado').map((c) => c.id)

  const orden: string[] = []
  const ubicado = new Set<string>()
  const listo = (id: string) =>
    padres(id).every((p) => estado(p) === 'dominado' || ubicado.has(p))

  if (perfil.empezar) {
    orden.push(perfil.empezar.id)
    ubicado.add(perfil.empezar.id)
  }
  while (orden.length < pendientes.length) {
    const ultimo = orden[orden.length - 1]
    const candidatos = pendientes.filter((id) => !ubicado.has(id) && listo(id))
    if (!candidatos.length) break
    candidatos.sort((x, y) => {
      const cx = ultimo && padres(x).includes(ultimo) ? 0 : 1
      const cy = ultimo && padres(y).includes(ultimo) ? 0 : 1
      if (cx !== cy) return cx - cy
      const px = prioridad[estado(x)!]
      const py = prioridad[estado(y)!]
      if (px !== py) return px - py
      return concepto(x).fila - concepto(y).fila || concepto(x).x - concepto(y).x
    })
    orden.push(candidatos[0])
    ubicado.add(candidatos[0])
  }

  let hayEnCurso = false
  const pasos: Paso[] = orden.map((id) => {
    const est = estado(id)!
    const requiere = padres(id).filter((p) => estado(p) !== 'dominado')
    const siguiente = hijos(id).find((h) => ubicado.has(h) || h === objetivo.id)
    const paraQue = siguiente ? ` Lo vas a necesitar en ${concepto(siguiente).nombre.toLowerCase()}. ${arista(id, siguiente)!.razon}` : ''

    if (est === 'sin-evidencia') {
      return {
        id,
        estadoPaso: 'diagnosticar',
        estadoConcepto: est,
        requiere,
        porQue:
          'Aún no sabemos cómo llegas a este concepto: el diagnóstico no tuvo preguntas suficientes. El próximo mini-diagnóstico decide si hay que practicarlo o si ya lo dominas.',
      }
    }
    if (requiere.length) {
      return {
        id,
        estadoPaso: 'bloqueado',
        estadoConcepto: est,
        requiere,
        porQue: requiere.map((r) => arista(r, id)!.razon).join(' '),
      }
    }
    if (!hayEnCurso) {
      hayEnCurso = true
      return {
        id,
        estadoPaso: 'en-curso',
        estadoConcepto: est,
        requiere,
        porQue: `Es la primera brecha cuyos prerrequisitos ya dominas.${paraQue}`,
      }
    }
    return {
      id,
      estadoPaso: 'disponible',
      estadoConcepto: est,
      requiere,
      porQue: `Sus prerrequisitos ya están dominados y no depende del paso en curso, así que puedes trabajarlo en paralelo.${paraQue}`,
    }
  })

  pasos.push({
    id: objetivo.id,
    estadoPaso: 'objetivo',
    estadoConcepto: null,
    requiere: padres(objetivo.id).filter((p) => estado(p) !== 'dominado'),
    porQue: 'Todo lo anterior apunta aquí. Llegar con estos prerrequisitos firmes hace que las primeras semanas de Cálculo I se dediquen a Cálculo, no a repasar.',
  })

  // Cadena principal: desde el paso en curso, seguir hijos pendientes hasta el objetivo.
  const cadena: string[] = []
  const inicio = pasos.find((p) => p.estadoPaso === 'en-curso')?.id
  if (inicio) {
    let actual: string | undefined = inicio
    while (actual) {
      cadena.push(actual)
      if (actual === objetivo.id) break
      const sig: string[] = hijos(actual).filter((h) => ubicado.has(h) || h === objetivo.id)
      sig.sort((x, y) => (x === objetivo.id ? 1 : 0) - (y === objetivo.id ? 1 : 0))
      actual = sig[0]
    }
  }

  return { dominados, pasos, cadena }
}
